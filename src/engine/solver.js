// Solver: takes state in, returns results out
// Runs once per user action. Topological sort, evaluate each property once.

import { topologicalSort, getDependencies } from './graph.js';
import { toSI, fromSI } from './units.js';
import { createPropertyResult, createErrorResult } from './properties.js';
import { ErrorType, PropertyError } from './errors.js';
import { getPerryRange } from './registry.js';

/**
 * Phase-dependent method selection map.
 * For each property, maps phase value to the best method key.
 */
const PHASE_METHOD_MAP = {
  density:             { liquid: 'perryLiquidCorrelation', gas: 'idealGas', vapor: 'idealGas' },
  viscosity:           { liquid: 'perryLiquidCorrelation', gas: 'perryVaporCorrelation', vapor: 'perryVaporCorrelation' },
  cp:                  { liquid: 'perryLiquidCorrelation', gas: 'perryVaporCorrelation', vapor: 'perryVaporCorrelation' },
  thermalConductivity: { liquid: 'perryLiquidCorrelation', gas: 'perryVaporCorrelation', vapor: 'perryVaporCorrelation' },
};

/**
 * Mach-dependent method auto-selection.
 * Switches to compressible flow methods when Ma exceeds threshold.
 */
const MACH_METHOD_MAP = {
  pressureDropPipe: { threshold: 0.3, method: 'fanno', fallback: 'darcy' },
};

/**
 * Maps (propertyId, methodKey) to the Perry correlation lookup parameters
 * needed for range checking.
 */
export const PERRY_RANGE_MAP = {
  'vaporPressure:perryCorrelation':           { phase: 'gaseous', perryProp: 'vaporPressure' },
  'density:perryLiquidCorrelation':           { phase: 'liquid',  perryProp: 'density' },
  'viscosity:perryLiquidCorrelation':         { phase: 'liquid',  perryProp: 'viscosity' },
  'viscosity:perryVaporCorrelation':          { phase: 'gaseous', perryProp: 'viscosity' },
  'cp:perryLiquidCorrelation':               { phase: 'liquid',  perryProp: 'cp' },
  'cp:perryVaporCorrelation':                { phase: 'gaseous', perryProp: 'cp' },
  'thermalConductivity:perryLiquidCorrelation': { phase: 'liquid',  perryProp: 'thermalConductivity' },
  'thermalConductivity:perryVaporCorrelation':  { phase: 'gaseous', perryProp: 'thermalConductivity' },
  'heatOfVaporization:perryCorrelation':      { phase: 'liquid',  perryProp: 'heatVaporization' },
};

/**
 * Auto-select methods based on computed phase and flow regime.
 * Only overrides methods that the user hasn't explicitly chosen.
 * Mutates activeMethodMap in place for affected properties.
 *
 * @param {Object} results - Already-computed results (must include phase)
 * @param {Object} registry - Property definitions
 * @param {Object} activeMethodMap - Current method selections (mutated)
 * @param {Set} userMethodOverrides - Properties where the user explicitly chose a method
 * @returns {string[]} List of property IDs whose method was changed
 */
function autoSelectMethods(results, registry, activeMethodMap, userMethodOverrides) {
  const changed = [];

  // Phase-dependent properties
  const phaseResult = results.phase;
  const phase = (phaseResult?.isValid && phaseResult.value)
    ? String(phaseResult.value).toLowerCase() : null;

  if (phase) {
    for (const [propId, phaseMap] of Object.entries(PHASE_METHOD_MAP)) {
      if (userMethodOverrides.has(propId)) continue;
      const desired = phaseMap[phase];
      if (!desired) continue;
      // Verify the method exists on this property
      if (!registry[propId]?.methods?.[desired]) continue;
      if (activeMethodMap[propId] !== desired) {
        activeMethodMap[propId] = desired;
        changed.push(propId);
      }
    }
  }

  // Mach-dependent auto-selection (gas/vapor only)
  const machResult = results.machNumber;
  if (phase && (phase === 'gas' || phase === 'vapor') &&
      machResult?.isValid && machResult.value > 0) {
    for (const [propId, cfg] of Object.entries(MACH_METHOD_MAP)) {
      if (userMethodOverrides.has(propId)) continue;
      const desired = machResult.value > cfg.threshold ? cfg.method : cfg.fallback;
      if (!registry[propId]?.methods?.[desired]) continue;
      if (activeMethodMap[propId] !== desired) {
        activeMethodMap[propId] = desired;
        changed.push(propId);
      }
    }
  }

  return changed;
}

/**
 * @typedef {Object} SolveInput
 * @property {Object} registry - All property definitions
 * @property {Object} activeMethodMap - propertyId -> method key (or null)
 * @property {Object} userValues - propertyId -> { value, unit } for user-entered values
 * @property {Object} chemData - Chemical data object for selected chemical
 * @property {Object} pipeData - Pipe data context { dimensions, materials, selectedMaterial, selectedStandard, ... }
 * @property {Set} [userMethodOverrides] - Properties where the user explicitly chose a method
 */

/**
 * Solve all properties in dependency order.
 * After the first pass, auto-selects methods based on phase/regime,
 * then re-evaluates any properties whose method changed.
 * @param {SolveInput} input
 * @returns {Object} Map of propertyId -> PropertyResult
 */
export function solve({ registry, activeMethodMap, userValues, chemData, pipeData, userMethodOverrides }) {
  const overrides = userMethodOverrides || new Set();
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

  // First pass: evaluate in topological order
  for (const id of sorted) {
    results[id] = evaluateProperty(id, registry, activeMethodMap, userValues, results, chemData, pipeData);
  }

  // Auto-select methods based on computed phase and Mach number.
  // May need multiple passes: phase changes methods → re-evaluation reveals Mach → Mach changes methods.
  let changed = autoSelectMethods(results, registry, activeMethodMap, overrides);

  for (let pass = 0; pass < 2 && changed.length > 0; pass++) {
    // Re-sort with updated methods (dependencies may have changed)
    const { sorted: reSorted } = topologicalSort(registry, activeMethodMap);
    // Find the earliest changed property in the topological order
    const changedSet = new Set(changed);
    let startIdx = reSorted.findIndex(id => changedSet.has(id));
    if (startIdx >= 0) {
      // Re-evaluate from that point forward
      for (let i = startIdx; i < reSorted.length; i++) {
        const id = reSorted[i];
        results[id] = evaluateProperty(id, registry, activeMethodMap, userValues, results, chemData, pipeData);
      }
    }
    // Check if re-evaluation changed any values that trigger further method switches
    changed = autoSelectMethods(results, registry, activeMethodMap, overrides);
  }

  // Post-solve: Mach number warnings
  const machResult = results.machNumber;
  if (machResult?.isValid) {
    const mach = machResult.value;
    const dpMethod = activeMethodMap.pressureDropPipe;
    if (mach > 1) {
      machResult.warnings.push(
        'Velocity exceeds sonic velocity \u2014 results unreliable'
      );
    } else if (mach > 0.3 && (dpMethod === 'fanno' || dpMethod === 'isothermal')) {
      machResult.warnings.push(
        'Mach > 0.3 \u2014 compressible flow method active'
      );
    } else if (mach > 0.3) {
      machResult.warnings.push(
        'Mach > 0.3 \u2014 compressibility effects may be significant; consider Fanno method'
      );
    }
  }

  // Post-solve: Choking warnings
  const fannoMaxResult = results.fannoMaxLength;
  const pipeLengthResult = results.pipeLength;
  if (fannoMaxResult?.isValid && pipeLengthResult?.isValid && fannoMaxResult.value > 0) {
    const ratio = pipeLengthResult.value / fannoMaxResult.value;
    if (ratio >= 1.0) {
      fannoMaxResult.warnings.push('Flow is choked \u2014 pipe exceeds Fanno max length');
      const dpResult = results.pressureDropPipe;
      if (dpResult?.isValid) {
        dpResult.warnings.push('Flow is choked \u2014 pipe exceeds Fanno max length');
      }
    } else if (ratio > 0.8) {
      fannoMaxResult.warnings.push('Approaching choked flow');
    }
  }

  // Post-solve: Negative Reynolds number
  const reResult = results.reynoldsNumber;
  if (reResult?.isValid && reResult.value < 0) {
    reResult.warnings.push(
      'Negative Reynolds number \u2014 check flow direction'
    );
  }

  // Post-solve: Vacuum pressure warning (cavitation)
  const pressResult = results.pressure;
  const vpResult = results.vaporPressure;
  if (pressResult?.isValid && vpResult?.isValid && pressResult.value < vpResult.value) {
    pressResult.warnings.push(
      'Operating pressure below vapor pressure \u2014 cavitation likely'
    );
  }

  // Post-solve: Near-critical temperature and negative density warnings
  const densResult = results.density;
  if (densResult?.isValid) {
    if (densResult.value <= 0) {
      densResult.warnings.push(
        'Non-physical density \u2014 check inputs'
      );
    }
    const tempResult = results.temperature;
    const tcResult = results.criticalTemperature;
    const phaseResult = results.phase;
    if (tempResult?.isValid && tcResult?.isValid && tcResult.value > 0 && phaseResult?.isValid) {
      const phase = String(phaseResult.value).toLowerCase();
      if (phase === 'gas' || phase === 'vapor') {
        const ratio = tempResult.value / tcResult.value;
        if (ratio >= 0.95 && ratio <= 1.05) {
          densResult.warnings.push(
            'Temperature near critical point \u2014 ideal gas assumption unreliable'
          );
        }
      }
    }
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
      const displayUnit = (userValues[id]?.unit) || def.defaultUnit;
      if (def.quantity) {
        displayValue = fromSI(def.quantity, displayUnit, value);
      } else {
        displayValue = value;
      }
      return createPropertyResult(id, value, displayValue, displayUnit, methodKey, []);
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
        `Requires ${registry[depId]?.name || depId}`,
        id,
        depId
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

    const result = createPropertyResult(id, siValue, displayValue, displayUnit, methodKey, depIds);

    // Range-check Perry correlations
    const rangeKey = `${id}:${methodKey}`;
    const rangeEntry = PERRY_RANGE_MAP[rangeKey];
    if (rangeEntry && chemData) {
      const T = results.temperature?.value;
      if (T != null) {
        const range = getPerryRange(chemData, rangeEntry.phase, rangeEntry.perryProp);
        if (range) {
          if (T < range.Tmin || T > range.Tmax) {
            result.warnings.push(
              `T = ${Math.round(T)} K is outside valid range ${Math.round(range.Tmin)}–${Math.round(range.Tmax)} K`
            );
          }
        }
      }
    }

    return result;
  } catch (e) {
    return createErrorResult(id, new PropertyError(ErrorType.CALCULATION_ERROR, e.message, id));
  }
}
