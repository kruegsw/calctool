import { describe, it, expect, beforeAll } from 'vitest';
import { readFileSync } from 'fs';
import { resolve } from 'path';
import { parseNominalDiameter, loadFittingsDataSync, getFittingById } from '../../src/data/fittings.js';
import { AppState } from '../../src/ui/state.js';
import { serializeState, deserializeState } from '../../src/ui/urlState.js';

const fittingsPath = resolve('src/data/fittings.json');

// Load fittings data for tests
beforeAll(() => {
  const data = JSON.parse(readFileSync(fittingsPath, 'utf8'));
  loadFittingsDataSync(data);
});

describe('parseNominalDiameter', () => {
  it('parses simple fractions', () => {
    expect(parseNominalDiameter('1/2')).toBeCloseTo(0.5);
    expect(parseNominalDiameter('3/4')).toBeCloseTo(0.75);
    expect(parseNominalDiameter('3/8')).toBeCloseTo(0.375);
  });

  it('parses mixed numbers', () => {
    expect(parseNominalDiameter('1 1/4')).toBeCloseTo(1.25);
    expect(parseNominalDiameter('1 1/2')).toBeCloseTo(1.5);
    expect(parseNominalDiameter('2 1/2')).toBeCloseTo(2.5);
  });

  it('parses plain integers', () => {
    expect(parseNominalDiameter('2')).toBe(2);
    expect(parseNominalDiameter('10')).toBe(10);
    expect(parseNominalDiameter('24')).toBe(24);
  });

  it('parses decimal strings', () => {
    expect(parseNominalDiameter('0.5')).toBeCloseTo(0.5);
    expect(parseNominalDiameter('2.5')).toBeCloseTo(2.5);
  });

  it('returns NaN for invalid input', () => {
    expect(parseNominalDiameter('')).toBeNaN();
    expect(parseNominalDiameter(null)).toBeNaN();
    expect(parseNominalDiameter(undefined)).toBeNaN();
    expect(parseNominalDiameter('abc')).toBeNaN();
  });

  it('handles whitespace', () => {
    expect(parseNominalDiameter('  2  ')).toBe(2);
    expect(parseNominalDiameter(' 1 1/2 ')).toBeCloseTo(1.5);
  });
});

describe('3-K (Darby) K-factor computation', () => {
  it('computes K for 90° LR elbow at Re=50000 D=2"', () => {
    // K = 800/50000 + 0.071*(1 + 4.2/2^0.3)
    const fitting = getFittingById('elbow_90_lr');
    expect(fitting.k1).toBe(800);
    expect(fitting.ki).toBe(0.071);
    expect(fitting.kd).toBe(4.2);

    const Re = 50000;
    const D = 2;
    const k3 = fitting.k1 / Re + fitting.ki * (1 + fitting.kd / Math.pow(D, 0.3));
    // 800/50000 = 0.016, 2^0.3 ≈ 1.2311, 4.2/1.2311 ≈ 3.4116
    // 0.071*(1+3.4116) = 0.071*4.4116 ≈ 0.3132
    // total ≈ 0.3292
    expect(k3).toBeCloseTo(0.329, 2);
  });

  it('computes K for globe valve at Re=10000 D=1"', () => {
    const fitting = getFittingById('valve_globe_full');
    const Re = 10000;
    const D = 1;
    const k3 = fitting.k1 / Re + fitting.ki * (1 + fitting.kd / Math.pow(D, 0.3));
    // 1500/10000 = 0.15, 1^0.3 = 1, 3.6/1 = 3.6
    // 1.7*(1+3.6) = 1.7*4.6 = 7.82
    // total = 7.97
    expect(k3).toBeCloseTo(7.97, 1);
  });

  it('fittings without 3-K data have no k1 field', () => {
    const fitting = getFittingById('entrance_sharp');
    expect(fitting.k1).toBeUndefined();
    expect(fitting.k).toBe(0.5);
  });
});

describe('AppState _syncTotalKFactor with 3-K method', () => {
  it('uses fixed K when method is fixedK', () => {
    const state = new AppState();
    state.fittingsMethod = 'fixedK';
    state.addFitting('elbow_90_lr', 2); // 2 × 0.45 = 0.90
    expect(state.userValues.totalKFactor.value).toBeCloseTo(0.90);
  });

  it('uses 3-K formula when method is threeK and Re/D available', () => {
    const state = new AppState();
    state.fittingsMethod = 'threeK';
    // Set up pipe nominal diameter
    state.userValues.pipeNominalDiameter = { value: '2' };
    // Set up a mock Re result
    state.results = { reynoldsNumber: { value: 50000 } };
    state.addFitting('elbow_90_lr', 1);

    // Should use 3-K: K = 800/50000 + 0.071*(1+4.2/2^0.3)
    const expected = 800 / 50000 + 0.071 * (1 + 4.2 / Math.pow(2, 0.3));
    expect(state.userValues.totalKFactor.value).toBeCloseTo(expected, 4);
  });

  it('falls back to fixed K for custom fittings in 3-K mode', () => {
    const state = new AppState();
    state.fittingsMethod = 'threeK';
    state.userValues.pipeNominalDiameter = { value: '2' };
    state.results = { reynoldsNumber: { value: 50000 } };
    state.addFitting('__custom__', 1, 'My Fitting', 1.5);
    expect(state.userValues.totalKFactor.value).toBeCloseTo(1.5);
  });

  it('falls back to fixed K for fittings without 3-K data', () => {
    const state = new AppState();
    state.fittingsMethod = 'threeK';
    state.userValues.pipeNominalDiameter = { value: '2' };
    state.results = { reynoldsNumber: { value: 50000 } };
    state.addFitting('entrance_sharp', 1);
    expect(state.userValues.totalKFactor.value).toBeCloseTo(0.5);
  });

  it('falls back to fixed K when Re not available', () => {
    const state = new AppState();
    state.fittingsMethod = 'threeK';
    state.userValues.pipeNominalDiameter = { value: '2' };
    state.results = {};
    state.addFitting('elbow_90_lr', 1);
    // No Re → falls back to fixed K = 0.45
    expect(state.userValues.totalKFactor.value).toBeCloseTo(0.45);
  });
});

describe('URL state round-trip with fittings method', () => {
  it('omits fm param when fixedK (default)', () => {
    const state = new AppState();
    state.fittingsMethod = 'fixedK';
    const params = serializeState(state);
    expect(params.get('fm')).toBeNull();
  });

  it('serializes fm=threeK when 3-K selected', () => {
    const state = new AppState();
    state.fittingsMethod = 'threeK';
    const params = serializeState(state);
    expect(params.get('fm')).toBe('threeK');
  });

  it('deserializes fm=threeK from URL', () => {
    const state = new AppState();
    deserializeState('?fm=threeK', state);
    expect(state.fittingsMethod).toBe('threeK');
  });

  it('round-trips fittings method through URL', () => {
    const original = new AppState();
    original.fittingsMethod = 'threeK';
    original.addFitting('elbow_90_lr', 2);

    const params = serializeState(original);
    const restored = new AppState();
    deserializeState('?' + params.toString(), restored);

    expect(restored.fittingsMethod).toBe('threeK');
    expect(restored.fittings.length).toBe(1);
    expect(restored.fittings[0].id).toBe('elbow_90_lr');
    expect(restored.fittings[0].qty).toBe(2);
  });
});
