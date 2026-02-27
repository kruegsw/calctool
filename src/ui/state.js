// AppState: bridges user actions to solver

import { REGISTRY, getDefaultMethodMap } from '../engine/registry.js';
import { solve } from '../engine/solver.js';
import { convertUnits } from '../engine/units.js';
import { getChemicalByCAS, searchChemicals } from '../data/chemicals.js';
import { getPipeData, getSchedules, getNominalDiameters } from '../data/pipe.js';

export class AppState {
  constructor() {
    this.registry = REGISTRY;
    this.activeMethodMap = getDefaultMethodMap(REGISTRY);
    this.userValues = {};
    this.results = {};
    this.listeners = [];
    this.expandedSections = new Set();
    this.dirtyFields = new Set();

    // Set defaults from registry
    for (const [id, def] of Object.entries(REGISTRY)) {
      if (def.defaultValue != null) {
        this.userValues[id] = {
          value: def.defaultValue,
          unit: def.defaultUnit,
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
   */
  setValue(propertyId, value, unit) {
    this.dirtyFields.add(propertyId);
    this.userValues[propertyId] = { value, unit: unit || this.userValues[propertyId]?.unit || null };
    this.recalculate();
  }

  /**
   * Set the display unit, converting the stored value so the physical quantity stays constant.
   */
  setUnit(propertyId, unit) {
    const entry = this.userValues[propertyId];
    const oldUnit = entry?.unit;
    const def = this.registry[propertyId];
    const quantity = def?.quantity;

    if (entry) {
      // Convert value when we have a numeric value, a known old unit, and a quantity
      if (entry.value != null && oldUnit && oldUnit !== unit && quantity) {
        entry.value = convertUnits(quantity, entry.value, oldUnit, unit);
      }
      entry.unit = unit;
    } else {
      this.userValues[propertyId] = { value: null, unit };
    }
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
