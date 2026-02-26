import { describe, it, expect } from 'vitest';
import { solve } from '../../src/engine/solver.js';

// Small test registry for solver tests
const testRegistry = {
  temp: {
    id: 'temp',
    name: 'Temperature',
    quantity: 'temperature',
    defaultUnit: 'K',
    isUserInput: true,
    methods: {},
  },
  pressure: {
    id: 'pressure',
    name: 'Pressure',
    quantity: 'pressure',
    defaultUnit: 'Pa',
    isUserInput: true,
    methods: {},
  },
  mw: {
    id: 'mw',
    name: 'Molecular Weight',
    quantity: null,
    defaultUnit: null,
    isLookup: true,
    methods: {
      lookup: {
        name: 'lookup',
        inputs: [],
        calculate: (inputs, chemData) => chemData?.mw || null,
      },
    },
  },
  density: {
    id: 'density',
    name: 'Density',
    quantity: 'concentrationMass',
    defaultUnit: 'kg/m3',
    methods: {
      idealGas: {
        name: 'Ideal Gas',
        inputs: ['temp', 'pressure', 'mw'],
        calculate: (inputs) => {
          const T = inputs.temp;
          const P = inputs.pressure;
          const MW = inputs.mw;
          return P * MW / (8.314 * T * 1000);
        },
      },
    },
  },
};

describe('solver', () => {
  it('solves a simple chain with ideal gas density', () => {
    const results = solve({
      registry: testRegistry,
      activeMethodMap: { temp: null, pressure: null, mw: 'lookup', density: 'idealGas' },
      userValues: {
        temp: { value: 298.15, unit: 'K' },     // 25C in K
        pressure: { value: 101325, unit: 'Pa' }, // 1 atm
      },
      chemData: { mw: 28.97 }, // air
      pipeData: null,
    });

    expect(results.temp.isValid).toBe(true);
    expect(results.temp.value).toBeCloseTo(298.15);

    expect(results.pressure.isValid).toBe(true);
    expect(results.pressure.value).toBeCloseTo(101325);

    expect(results.mw.isValid).toBe(true);
    expect(results.mw.value).toBeCloseTo(28.97);

    expect(results.density.isValid).toBe(true);
    // Air at 25C, 1 atm ≈ 1.184 kg/m3
    expect(results.density.value).toBeCloseTo(1.184, 2);
  });

  it('propagates missing input as dependency error', () => {
    const results = solve({
      registry: testRegistry,
      activeMethodMap: { temp: null, pressure: null, mw: 'lookup', density: 'idealGas' },
      userValues: {
        temp: { value: 298.15, unit: 'K' },
        // pressure not provided
      },
      chemData: { mw: 28.97 },
      pipeData: null,
    });

    expect(results.pressure.isValid).toBe(false);
    // density depends on pressure which is invalid
    expect(results.density.isValid).toBe(false);
    expect(results.density.error.type).toBe('DEPENDENCY_ERROR');
  });

  it('handles missing chemical data gracefully', () => {
    const results = solve({
      registry: testRegistry,
      activeMethodMap: { temp: null, pressure: null, mw: 'lookup', density: 'idealGas' },
      userValues: {
        temp: { value: 298.15, unit: 'K' },
        pressure: { value: 101325, unit: 'Pa' },
      },
      chemData: null, // no chemical selected
      pipeData: null,
    });

    expect(results.mw.isValid).toBe(false);
    expect(results.density.isValid).toBe(false);
  });

  it('detects cycles and marks them as errors', () => {
    const cycleRegistry = {
      A: {
        id: 'A',
        name: 'A',
        quantity: null,
        defaultUnit: null,
        methods: { calc: { inputs: ['B'], calculate: (i) => i.B + 1 } },
      },
      B: {
        id: 'B',
        name: 'B',
        quantity: null,
        defaultUnit: null,
        methods: { calc: { inputs: ['A'], calculate: (i) => i.A + 1 } },
      },
    };

    const results = solve({
      registry: cycleRegistry,
      activeMethodMap: { A: 'calc', B: 'calc' },
      userValues: {},
      chemData: null,
      pipeData: null,
    });

    expect(results.A.isValid).toBe(false);
    expect(results.A.error.type).toBe('CYCLE_DETECTED');
    expect(results.B.isValid).toBe(false);
  });

  it('converts user input from display units to SI', () => {
    const results = solve({
      registry: testRegistry,
      activeMethodMap: { temp: null, pressure: null, mw: 'lookup', density: 'idealGas' },
      userValues: {
        temp: { value: 25, unit: 'C' },        // 25C -> 298.15K
        pressure: { value: 0, unit: 'psig' },   // 0 psig -> 101325 Pa
      },
      chemData: { mw: 28.97 },
      pipeData: null,
    });

    expect(results.temp.value).toBeCloseTo(298.15);
    expect(results.pressure.value).toBeCloseTo(101325, -1);
    expect(results.density.isValid).toBe(true);
    expect(results.density.value).toBeCloseTo(1.184, 2);
  });

  it('returns displayValue in user-selected units', () => {
    const results = solve({
      registry: testRegistry,
      activeMethodMap: { temp: null, pressure: null, mw: 'lookup', density: 'idealGas' },
      userValues: {
        temp: { value: 25, unit: 'C' },
        pressure: { value: 0, unit: 'psig' },
      },
      chemData: { mw: 28.97 },
      pipeData: null,
    });

    // displayValue for temp should be the user-entered value
    expect(results.temp.displayValue).toBe(25);
    // displayValue for density should be in kg/m3 (default)
    expect(results.density.displayValue).toBeCloseTo(1.184, 2);
  });
});
