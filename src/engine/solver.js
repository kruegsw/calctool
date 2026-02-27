// Solver: takes state in, returns results out
// Runs once per user action. Topological sort, evaluate each property once.

import { topologicalSort, getDependencies } from './graph.js';
import { toSI, fromSI } from './units.js';
import { createPropertyResult, createErrorResult } from './properties.js';
import { ErrorType, PropertyError } from './errors.js';

/**
 * @typedef {Object} SolveInput
 * @property {Object} registry - All property definitions
 * @property {Object} activeMethodMap - propertyId -> method key (or null)
 * @property {Object} userValues - propertyId -> { value, unit } for user-entered values
 * @property {Object} chemData - Chemical data object for selected chemical
 * @property {Object} pipeData - Pipe data context { dimensions, materials, selectedMaterial, selectedStandard, ... }
 */

/**
 * Solve all properties in dependency order.
 * @param {SolveInput} input
 * @returns {Object} Map of propertyId -> PropertyResult
 */
export function solve({ registry, activeMethodMap, userValues, chemData, pipeData }) {
  const { sorted, hasCycle, cycleNodes } = topologicalSort(registry, activeMethodMap);
  const results = {};

  // Mark cycle nodes as errors
  if (hasCycle) {
    for (const id of cycleNodes) {
      results[id] = createErrorResult(id, new PropertyError(
        ErrorType.CYCLE_DETECTED,
        `Property "${id}" is part of a dependency cycle`,
        id
      ));
    }
  }

  // Evaluate in topological order
  for (const id of sorted) {
    results[id] = evaluateProperty(id, registry, activeMethodMap, userValues, results, chemData, pipeData);
  }

  return results;
}

/**
 * Evaluate a single property.
 */
function evaluateProperty(id, registry, activeMethodMap, userValues, results, chemData, pipeData) {
  const def = registry[id];
  if (!def) {
    return createErrorResult(id, new PropertyError(ErrorType.CALCULATION_ERROR, `Unknown property: ${id}`, id));
  }

  const methodKey = activeMethodMap[id];
  const userVal = userValues[id];

  // Case 1: User-input property (no method selected, or isUserInput)
  if (!methodKey || def.isUserInput || def.isSelection) {
    if (userVal == null || userVal.value === '' || userVal.value == null) {
      // No value entered yet - not necessarily an error, just empty
      return createPropertyResult(id, null, null, userVal?.unit || def.defaultUnit, null, []);
    }

    let siValue;
    if (def.quantity && userVal.unit) {
      siValue = toSI(def.quantity, userVal.unit, userVal.value);
    } else {
      siValue = userVal.value; // dimensionless or selection
    }

    const displayValue = userVal.value;
    return createPropertyResult(id, siValue, displayValue, userVal.unit || def.defaultUnit, null, []);
  }

  // Case 1.5: User override of a calculated property
  if (def.allowUserOverride && userVal != null && userVal.value !== '' && userVal.value != null) {
    let siValue;
    if (def.quantity && userVal.unit) {
      siValue = toSI(def.quantity, userVal.unit, userVal.value);
    } else {
      siValue = userVal.value;
    }
    return createPropertyResult(id, siValue, userVal.value, userVal.unit || def.defaultUnit, null, []);
  }

  // Case 2: Lookup from chemical data
  if (def.isLookup && methodKey === 'lookup') {
    const method = def.methods.lookup;
    if (!method) {
      return createErrorResult(id, new PropertyError(ErrorType.INVALID_METHOD, `No lookup method for ${id}`, id));
    }
    try {
      const value = method.calculate({}, chemData, pipeData);
      if (value == null || (typeof value === 'number' && isNaN(value)) || value === '') {
        return createPropertyResult(id, null, null, def.defaultUnit, methodKey, []);
      }
      let displayValue;
      if (def.quantity) {
        displayValue = fromSI(def.quantity, def.defaultUnit, value);
      } else {
        displayValue = value;
      }
      return createPropertyResult(id, value, displayValue, def.defaultUnit, methodKey, []);
    } catch (e) {
      return createErrorResult(id, new PropertyError(ErrorType.CALCULATION_ERROR, e.message, id));
    }
  }

  // Case 3: Calculated property
  const method = def.methods[methodKey];
  if (!method) {
    return createErrorResult(id, new PropertyError(ErrorType.INVALID_METHOD, `Unknown method "${methodKey}" for ${id}`, id));
  }

  const deps = method.inputs || [];
  const inputValues = {};
  const depIds = [];

  for (const depId of deps) {
    const depResult = results[depId];
    if (!depResult || !depResult.isValid) {
      return createErrorResult(id, new PropertyError(
        ErrorType.DEPENDENCY_ERROR,
        `Dependency "${depId}" is not available`,
        id
      ));
    }
    inputValues[depId] = depResult.value;
    depIds.push(depId);
  }

  try {
    const siValue = method.calculate(inputValues, chemData, pipeData);

    if (siValue == null || (typeof siValue === 'number' && isNaN(siValue))) {
      return createErrorResult(id, new PropertyError(
        ErrorType.CALCULATION_ERROR,
        `Calculation returned invalid value for ${id}`,
        id
      ));
    }

    let displayValue;
    const displayUnit = (userValues[id]?.unit) || def.defaultUnit;
    if (def.quantity && displayUnit) {
      displayValue = fromSI(def.quantity, displayUnit, siValue);
    } else {
      displayValue = siValue;
    }

    return createPropertyResult(id, siValue, displayValue, displayUnit, methodKey, depIds);
  } catch (e) {
    return createErrorResult(id, new PropertyError(ErrorType.CALCULATION_ERROR, e.message, id));
  }
}
