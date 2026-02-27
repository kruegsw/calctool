import { describe, it, expect } from 'vitest';
import { AppState } from '../../src/ui/state.js';
import { toSI } from '../../src/engine/units.js';

describe('AppState.setUnit() value conversion', () => {
  /** Helper: create state with a user value already set. */
  function stateWith(propId, value, unit) {
    const state = new AppState();
    state.userValues[propId] = { value, unit };
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
    expect(state.userValues.temperature).toEqual({ value: null, unit: 'C' });
  });
});
