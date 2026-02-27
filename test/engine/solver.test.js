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

// Override registry: a calculated property with allowUserOverride
const overrideRegistry = {
  input1: {
    id: 'input1',
    name: 'Input 1',
    quantity: null,
    defaultUnit: null,
    isUserInput: true,
    methods: {},
  },
  calculated: {
    id: 'calculated',
    name: 'Calculated',
    quantity: 'length',
    defaultUnit: 'm',
    allowUserOverride: true,
    methods: {
      fromInput: {
        name: 'From input',
        inputs: ['input1'],
        calculate: (inputs) => inputs.input1 * 2,
      },
    },
  },
  downstream: {
    id: 'downstream',
    name: 'Downstream',
    quantity: 'length',
    defaultUnit: 'm',
    methods: {
      fromCalc: {
        name: 'From calculated',
        inputs: ['calculated'],
        calculate: (inputs) => inputs.calculated + 10,
      },
    },
  },
};

describe('user override', () => {
  it('calculates normally when no override value is provided', () => {
    const results = solve({
      registry: overrideRegistry,
      activeMethodMap: { input1: null, calculated: 'fromInput', downstream: 'fromCalc' },
      userValues: {
        input1: { value: 5, unit: null },
      },
      chemData: null,
      pipeData: null,
    });

    // calculated = input1 * 2 = 10
    expect(results.calculated.isValid).toBe(true);
    expect(results.calculated.value).toBe(10);
    // downstream = calculated + 10 = 20
    expect(results.downstream.isValid).toBe(true);
    expect(results.downstream.value).toBe(20);
  });

  it('uses override value when user provides one, and downstream recalculates', () => {
    const results = solve({
      registry: overrideRegistry,
      activeMethodMap: { input1: null, calculated: 'fromInput', downstream: 'fromCalc' },
      userValues: {
        input1: { value: 5, unit: null },
        calculated: { value: 0.0508, unit: 'm' }, // 2 inches in meters
      },
      chemData: null,
      pipeData: null,
    });

    // Override bypasses calculation: SI value = 0.0508 m
    expect(results.calculated.isValid).toBe(true);
    expect(results.calculated.value).toBeCloseTo(0.0508, 4);
    // downstream = 0.0508 + 10 = 10.0508
    expect(results.downstream.isValid).toBe(true);
    expect(results.downstream.value).toBeCloseTo(10.0508, 4);
  });

  it('falls through to calculation when override value is null', () => {
    const results = solve({
      registry: overrideRegistry,
      activeMethodMap: { input1: null, calculated: 'fromInput', downstream: 'fromCalc' },
      userValues: {
        input1: { value: 5, unit: null },
        calculated: { value: null, unit: 'm' },
      },
      chemData: null,
      pipeData: null,
    });

    // Should fall through to normal calculation
    expect(results.calculated.isValid).toBe(true);
    expect(results.calculated.value).toBe(10);
  });

  it('falls through to calculation when override value is empty string', () => {
    const results = solve({
      registry: overrideRegistry,
      activeMethodMap: { input1: null, calculated: 'fromInput', downstream: 'fromCalc' },
      userValues: {
        input1: { value: 5, unit: null },
        calculated: { value: '', unit: 'm' },
      },
      chemData: null,
      pipeData: null,
    });

    expect(results.calculated.isValid).toBe(true);
    expect(results.calculated.value).toBe(10);
  });

  it('converts override value from display unit to SI', () => {
    const results = solve({
      registry: overrideRegistry,
      activeMethodMap: { input1: null, calculated: 'fromInput', downstream: 'fromCalc' },
      userValues: {
        input1: { value: 5, unit: null },
        calculated: { value: 2, unit: 'in' }, // 2 inches -> 0.0508 m
      },
      chemData: null,
      pipeData: null,
    });

    expect(results.calculated.isValid).toBe(true);
    expect(results.calculated.value).toBeCloseTo(0.0508, 4);
    expect(results.calculated.displayValue).toBe(2);
    expect(results.calculated.unit).toBe('in');
  });
});
