import { describe, it, expect } from 'vitest';
import { AppState } from '../../src/ui/state.js';
import { toSI } from '../../src/engine/units.js';

describe('AppState.setUnit() value conversion', () => {
  /** Helper: create state with a user value already set. */
  function stateWith(propId, value, unit, sigFigs) {
    const state = new AppState();
    state.userValues[propId] = { value, unit, sigFigs };
    return state;
  }

  it('converts temperature 100 °F → °C ≈ 37.78', () => {
    const state = stateWith('temperature', 100, 'F');
    state.setUnit('temperature', 'C');
    expect(state.userValues.temperature.value).toBeCloseTo(37.7778, 2);
    expect(state.userValues.temperature.unit).toBe('C');
  });

  it('converts pressure 14.696 psia → atm ≈ 1.0', () => {
    const state = stateWith('pressure', 14.696, 'psia');
    state.setUnit('pressure', 'atm');
    expect(state.userValues.pressure.value).toBeCloseTo(1.0, 2);
    expect(state.userValues.pressure.unit).toBe('atm');
  });

  it('skips conversion when value is null', () => {
    const state = stateWith('temperature', null, 'F');
    state.setUnit('temperature', 'C');
    expect(state.userValues.temperature.value).toBeNull();
    expect(state.userValues.temperature.unit).toBe('C');
  });

  it('early returns when same unit', () => {
    const state = stateWith('temperature', 100, 'F');
    state.setUnit('temperature', 'F');
    expect(state.userValues.temperature.value).toBe(100);
  });

  it('preserves the SI value after conversion (downstream unchanged)', () => {
    const state = stateWith('temperature', 212, 'F');
    const siBefore = toSI('temperature', 'F', 212);

    state.setUnit('temperature', 'C');
    const siAfter = toSI('temperature', 'C', state.userValues.temperature.value);

    expect(siAfter).toBeCloseTo(siBefore, 6);
  });

  it('creates entry with null value when property has no prior entry', () => {
    const state = new AppState();
    delete state.userValues.temperature;
    state.setUnit('temperature', 'C');
    expect(state.userValues.temperature.value).toBeNull();
    expect(state.userValues.temperature.unit).toBe('C');
  });
});

describe('AppState sigFigs tracking', () => {
  it('setValue stores sigFigs when provided', () => {
    const state = new AppState();
    state.setValue('massFlowRate', 100, 'lb/hr', 3);
    expect(state.userValues.massFlowRate.sigFigs).toBe(3);
  });

  it('setValue preserves existing sigFigs when not provided', () => {
    const state = new AppState();
    state.setValue('massFlowRate', 100, 'lb/hr', 3);
    state.setValue('massFlowRate', 200, 'lb/hr');
    expect(state.userValues.massFlowRate.sigFigs).toBe(3);
  });

  it('setUnit rounds converted value when sigFigs is set', () => {
    const state = new AppState();
    state.userValues.massFlowRate = { value: 100, unit: 'lb/hr', sigFigs: 3 };
    state.setUnit('massFlowRate', 'kg/hr');
    // 100 lb/hr = 45.359237... kg/hr → rounded to 3 sig figs = 45.4
    expect(state.userValues.massFlowRate.value).toBeCloseTo(45.4, 5);
  });

  it('setUnit preserves full precision when no sigFigs', () => {
    const state = new AppState();
    state.userValues.massFlowRate = { value: 100, unit: 'lb/hr' };
    state.setUnit('massFlowRate', 'kg/hr');
    // Full precision, not rounded
    expect(state.userValues.massFlowRate.value).toBeCloseTo(45.3592, 3);
  });

  it('constructor derives sigFigs from default values', () => {
    const state = new AppState();
    // Check that entries created from defaults have sigFigs set
    for (const [id, entry] of Object.entries(state.userValues)) {
      if (entry.value != null && typeof entry.value === 'number') {
        expect(entry.sigFigs).toBeGreaterThan(0);
      }
    }
  });
});
