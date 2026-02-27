// AppState: bridges user actions to solver

import { REGISTRY, getDefaultMethodMap } from '../engine/registry.js';
import { solve } from '../engine/solver.js';
import { convertUnits, UNIT_PRESETS } from '../engine/units.js';
import { getChemicalByCAS, searchChemicals } from '../data/chemicals.js';
import { getPipeData, getSchedules, getNominalDiameters } from '../data/pipe.js';
import { countSigFigs, roundToSigFigs } from './formatting.js';

export class AppState {
  constructor() {
    this.registry = REGISTRY;
    this.activeMethodMap = getDefaultMethodMap(REGISTRY);
    this.userValues = {};
    this.results = {};
    this.listeners = [];
    this.unitSystem = null;
    this.expandedSections = new Set();
    this.dirtyFields = new Set();

    // Set defaults from registry
    for (const [id, def] of Object.entries(REGISTRY)) {
      if (def.defaultValue != null) {
        this.userValues[id] = {
          value: def.defaultValue,
          unit: def.defaultUnit,
          sigFigs: countSigFigs(String(def.defaultValue)),
        };
      }
    }
  }

  /**
   * Subscribe to state changes.
   * @param {Function} listener - Called with (results, state) on every change
   * @returns {Function} Unsubscribe function
   */
  subscribe(listener) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  notify() {
    for (const listener of this.listeners) {
      listener(this.results, this);
    }
  }

  /**
   * Set a user value and re-solve.
   * @param {string} propertyId
   * @param {*} value
   * @param {string} [unit]
   * @param {number} [sigFigs] - Significant figures from user input string
   */
  setValue(propertyId, value, unit, sigFigs) {
    this.dirtyFields.add(propertyId);
    const existing = this.userValues[propertyId];
    this.userValues[propertyId] = {
      value,
      unit: unit || existing?.unit || null,
      sigFigs: sigFigs !== undefined ? sigFigs : existing?.sigFigs,
    };
    this.recalculate();
  }

  /**
   * Set the display unit, converting the stored value so the physical quantity stays constant.
   */
  setUnit(propertyId, unit) {
    this.unitSystem = null;
    const entry = this.userValues[propertyId];
    const oldUnit = entry?.unit;
    const def = this.registry[propertyId];
    const quantity = def?.quantity;

    if (entry) {
      // Convert value when we have a numeric value, a known old unit, and a quantity
      if (entry.value != null && oldUnit && oldUnit !== unit && quantity) {
        let converted = convertUnits(quantity, entry.value, oldUnit, unit);
        if (entry.sigFigs && isFinite(converted)) {
          converted = roundToSigFigs(converted, entry.sigFigs);
        }
        entry.value = converted;
      }
      entry.unit = unit;
    } else {
      this.userValues[propertyId] = { value: null, unit };
    }
    this.recalculate();
  }

  /**
   * Switch all property units to a preset system (SI or Imperial).
   * Converts existing values to preserve physical quantities.
   */
  setUnitSystem(system) {
    const preset = UNIT_PRESETS[system];
    if (!preset) return;

    for (const [propId, def] of Object.entries(this.registry)) {
      const quantity = def.quantity;
      if (!quantity) continue;
      const targetUnit = preset[quantity];
      if (!targetUnit) continue;

      const entry = this.userValues[propId];
      const oldUnit = entry?.unit || def.defaultUnit;
      if (oldUnit === targetUnit) {
        // Still update the unit in case entry exists with a different stored unit
        if (entry) entry.unit = targetUnit;
        continue;
      }

      if (entry && entry.value != null) {
        let converted = convertUnits(quantity, entry.value, oldUnit, targetUnit);
        if (entry.sigFigs && isFinite(converted)) {
          converted = roundToSigFigs(converted, entry.sigFigs);
        }
        entry.value = converted;
        entry.unit = targetUnit;
      } else if (entry) {
        entry.unit = targetUnit;
      } else {
        this.userValues[propId] = { value: null, unit: targetUnit };
      }
    }

    this.unitSystem = system;
    this.recalculate();
  }

  /**
   * Set the active method for a property and re-solve.
   */
  setMethod(propertyId, methodKey) {
    this.activeMethodMap[propertyId] = methodKey;
    this.recalculate();
  }

  /**
   * Select a chemical by CAS number.
   */
  selectChemical(cas) {
    this.dirtyFields.add('chemicalSearch');
    this.userValues.chemicalSearch = { value: cas };
    this.recalculate();
  }

  /**
   * Toggle section expansion.
   */
  toggleSection(sectionId) {
    if (this.expandedSections.has(sectionId)) {
      this.expandedSections.delete(sectionId);
    } else {
      this.expandedSections.add(sectionId);
    }
    this.notify();
  }

  /**
   * Get the chemical data for the currently selected chemical.
   */
  getChemData() {
    const cas = this.userValues.chemicalSearch?.value;
    if (!cas) return null;
    return getChemicalByCAS(cas);
  }

  /**
   * Get pipe selection options based on current selections.
   */
  getPipeOptions() {
    const standard = this.userValues.pipeStandard?.value || 'NPS';
    const nomDia = this.userValues.pipeNominalDiameter?.value || '2';
    return {
      nominalDiameters: getNominalDiameters(standard),
      schedules: getSchedules(standard, nomDia),
    };
  }

  /**
   * Check if a calculated property is currently user-overridden.
   */
  isOverridden(propertyId) {
    const def = this.registry[propertyId];
    if (!def?.allowUserOverride) return false;
    const uv = this.userValues[propertyId];
    return uv != null && uv.value !== '' && uv.value != null;
  }

  /**
   * Run the solver with current state.
   */
  recalculate() {
    const chemData = this.getChemData();
    const pipeData = getPipeData();

    this.results = solve({
      registry: this.registry,
      activeMethodMap: this.activeMethodMap,
      userValues: this.userValues,
      chemData,
      pipeData,
    });

    this.notify();
  }
}
