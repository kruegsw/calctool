import { describe, it, expect } from 'vitest';
import { serializeState, deserializeState } from '../../src/ui/urlState.js';
import { AppState } from '../../src/ui/state.js';

describe('URL state serialization', () => {
  it('empty state produces empty params', () => {
    const state = new AppState();
    // Clear all default values so nothing serializes
    state.userValues = {};
    state.unitSystem = null;
    const params = serializeState(state);
    expect(params.toString()).toBe('');
  });

  it('serializes chemical selection', () => {
    const state = new AppState();
    state.userValues.chemicalSearch = { value: '7732-18-15' };
    const params = serializeState(state);
    expect(params.get('chem')).toBe('7732-18-15');
  });

  it('serializes temperature with unit', () => {
    const state = new AppState();
    state.userValues.temperature = { value: 100, unit: 'F', sigFigs: 3 };
    const params = serializeState(state);
    expect(params.get('T')).toBe('100');
    expect(params.get('Tu')).toBe('F');
  });

  it('serializes unit system', () => {
    const state = new AppState();
    state.unitSystem = 'Imperial';
    const params = serializeState(state);
    expect(params.get('units')).toBe('Imperial');
  });

  it('serializes override properties', () => {
    const state = new AppState();
    state.userValues.density = { value: 998.2, unit: 'kg/m3' };
    const params = serializeState(state);
    expect(params.get('rho')).toBe('998.2');
    expect(params.get('rhou')).toBe('kg/m3');
  });

  it('serializes method overrides', () => {
    const state = new AppState();
    state.userMethodOverrides.add('frictionFactor');
    state.activeMethodMap.frictionFactor = 'niazkar';
    const params = serializeState(state);
    expect(params.get('mo')).toBe('frictionFactor:niazkar');
  });
});

describe('URL state deserialization', () => {
  it('returns false for empty search', () => {
    const state = new AppState();
    const found = deserializeState('', state);
    expect(found).toBe(false);
  });

  it('parses chemical from URL', () => {
    const state = new AppState();
    const found = deserializeState('?chem=7732-18-15', state);
    expect(found).toBe(true);
    expect(state.userValues.chemicalSearch.value).toBe('7732-18-15');
  });

  it('parses temperature with unit from URL', () => {
    const state = new AppState();
    const found = deserializeState('?T=100&Tu=F', state);
    expect(found).toBe(true);
    expect(state.userValues.temperature.value).toBe(100);
    expect(state.userValues.temperature.unit).toBe('F');
  });

  it('parses unit system from URL', () => {
    const state = new AppState();
    deserializeState('?units=Imperial', state);
    expect(state.unitSystem).toBe('Imperial');
  });

  it('parses override properties from URL', () => {
    const state = new AppState();
    deserializeState('?rho=998.2&rhou=kg/m3', state);
    expect(state.userValues.density.value).toBe(998.2);
    expect(state.userValues.density.unit).toBe('kg/m3');
  });

  it('parses method overrides from URL', () => {
    const state = new AppState();
    deserializeState('?mo=frictionFactor:niazkar', state);
    expect(state.userMethodOverrides.has('frictionFactor')).toBe(true);
    expect(state.activeMethodMap.frictionFactor).toBe('niazkar');
  });

  it('parses pipe selections from URL', () => {
    const state = new AppState();
    deserializeState('?std=NPS&nom=4&sch=40', state);
    expect(state.userValues.pipeStandard.value).toBe('NPS');
    expect(state.userValues.pipeNominalDiameter.value).toBe('4');
    expect(state.userValues.pipeSchedule.value).toBe('40');
  });
});

describe('URL state round-trip', () => {
  it('serialize → deserialize preserves chemical, temperature, pressure, units', () => {
    const original = new AppState();
    original.userValues.chemicalSearch = { value: '7732-18-15' };
    original.userValues.temperature = { value: 25, unit: 'C', sigFigs: 2 };
    original.userValues.pressure = { value: 101325, unit: 'Pa', sigFigs: 6 };
    original.unitSystem = 'SI';
    original.dirtyFields.add('chemicalSearch');
    original.dirtyFields.add('temperature');
    original.dirtyFields.add('pressure');

    const params = serializeState(original);
    const restored = new AppState();
    deserializeState('?' + params.toString(), restored);

    expect(restored.userValues.chemicalSearch.value).toBe('7732-18-15');
    expect(restored.userValues.temperature.value).toBe(25);
    expect(restored.userValues.temperature.unit).toBe('C');
    expect(restored.userValues.pressure.value).toBe(101325);
    expect(restored.userValues.pressure.unit).toBe('Pa');
    expect(restored.unitSystem).toBe('SI');
  });

  it('serialize → deserialize preserves method overrides', () => {
    const original = new AppState();
    original.userMethodOverrides.add('density');
    original.activeMethodMap.density = 'idealGas';
    original.userMethodOverrides.add('frictionFactor');
    original.activeMethodMap.frictionFactor = 'niazkar';

    const params = serializeState(original);
    const restored = new AppState();
    deserializeState('?' + params.toString(), restored);

    expect(restored.userMethodOverrides.has('density')).toBe(true);
    expect(restored.activeMethodMap.density).toBe('idealGas');
    expect(restored.userMethodOverrides.has('frictionFactor')).toBe(true);
    expect(restored.activeMethodMap.frictionFactor).toBe('niazkar');
  });

  it('partial URL state applies correctly without clobbering defaults', () => {
    const state = new AppState();
    const defaultTemp = state.userValues.temperature;

    deserializeState('?chem=7732-18-15', state);

    expect(state.userValues.chemicalSearch.value).toBe('7732-18-15');
    // Temperature default should still be intact (not overwritten)
    expect(state.userValues.temperature).toBe(defaultTemp);
  });
});
