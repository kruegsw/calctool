import { describe, it, expect } from 'vitest';
import { REGISTRY, getDefaultMethodMap } from '../../src/engine/registry.js';
import { solve } from '../../src/engine/solver.js';

// Water chemical data (CAS 7732-18-5) - minimal subset for testing
const waterData = {
  cas: '7732-18-5',
  name: 'water',
  family: { value: 'inorganics' },
  molecularWeight: { value: '18.0153' },
  criticalTemperature: { value: '647.096' },
  criticalPressure: { value: '22.064' },
  criticalMolarVolume: { value: '0.05595' },
  criticalCompressibilityFactorZc: { value: '0.2294' },
  acentricFactor: { value: '0.3449' },
  normalBoilingTemperature: { value: '373.15' },
  empirical: {
    gaseous: {
      vaporPressure: {
        perryCorrelation: {
          equation: '101',
          C1: 73.649,
          C2: -7258.2,
          C3: -7.3037,
          C4: 4.1653e-6,
          C5: 2,
          Tmin: 273.16,
          Tmax: 647.096,
        },
      },
      viscosity: {
        perryCorrelation: {
          equation: '102',
          C1: 1.7096e-8,
          C2: 1.1146,
          C3: 0,
          C4: 0,
          Tmin: 373.15,
          Tmax: 1073.15,
        },
      },
      thermalConductivity: {
        perryCorrelation: {
          equation: '102',
          C1: 6.2041e-6,
          C2: 1.3973,
          C3: 0,
          C4: 0,
          Tmin: 273.16,
          Tmax: 1073.15,
        },
      },
    },
    liquid: {
      density: {
        perryCorrelation: {
          equation: '105',
          C1: 5.459,
          C2: 0.30542,
          C3: 647.13,
          C4: 0.081,
          C5: 0,
          Tmin: 273.16,
          Tmax: 647.096,
        },
      },
      viscosity: {
        perryCorrelation: {
          equation: '101',
          C1: -52.843,
          C2: 3703.6,
          C3: 5.866,
          C4: -5.879e-29,
          C5: 10,
          Tmin: 273.16,
          Tmax: 646.15,
        },
      },
      cp: {
        perryCorrelation: {
          equation: '100',
          C1: 276370,
          C2: -2090.1,
          C3: 8.125,
          C4: -0.014116,
          C5: 9.3701e-6,
          Tmin: 273.16,
          Tmax: 533.15,
        },
      },
      heatVaporization: {
        perryCorrelation: {
          equation: '106',
          C1: 52053000,
          C2: 0.3199,
          C3: -0.212,
          C4: 0.25795,
          C5: 0,
          Tmin: 273.16,
          Tmax: 647.096,
        },
      },
      thermalConductivity: {
        perryCorrelation: {
          equation: '100',
          C1: -0.432,
          C2: 5.7255e-3,
          C3: -8.078e-6,
          C4: 1.861e-9,
          C5: 0,
          Tmin: 273.16,
          Tmax: 633.15,
        },
      },
    },
  },
};

// Air chemical data (approx)
const airData = {
  cas: '132259-10-0',
  name: 'air',
  family: { value: 'inorganics' },
  molecularWeight: { value: '28.97' },
  criticalTemperature: { value: '132.45' },
  criticalPressure: { value: '3.774' },
  normalBoilingTemperature: { value: '78.8' },
  criticalCompressibilityFactorZc: { value: '0.313' },
  acentricFactor: { value: '0.035' },
  empirical: {
    gaseous: {
      vaporPressure: {
        perryCorrelation: {
          equation: '101',
          C1: 21.662,
          C2: -692.39,
          C3: -0.39208,
          C4: 0,
          C5: 0,
          Tmin: 59.15,
          Tmax: 132.45,
        },
      },
      viscosity: {
        perryCorrelation: {
          equation: '102',
          C1: 1.425e-6,
          C2: 0.5039,
          C3: 108.3,
          C4: 0,
          Tmin: 80,
          Tmax: 2000,
        },
      },
      thermalConductivity: {
        perryCorrelation: {
          equation: '102',
          C1: 3.14e-4,
          C2: 0.7786,
          C3: -7.72e-12,
          C4: 0,
          Tmin: 70,
          Tmax: 2000,
        },
      },
    },
    liquid: {},
  },
};

// Pipe data for testing
const testPipeData = {
  materials: [
    { name: 'Commercial Steel or Wrought Iron', roughness: 0.00015 },
  ],
  dimensions: [
    {
      standard: 'NPS',
      nominalDiameter: '2',
      outerDiameter: '2.375',
      units: 'in',
      wallThickness: {
        'Sch. 40': '0.154',
        'Sch. 80': '0.218',
      },
    },
  ],
};

describe('registry property calculations', () => {

  describe('chemical property lookups', () => {
    it('looks up molecular weight for water', () => {
      const results = solve({
        registry: REGISTRY,
        activeMethodMap: { ...getDefaultMethodMap(REGISTRY) },
        userValues: { chemicalSearch: { value: 'water' } },
        chemData: waterData,
        pipeData: testPipeData,
      });
      expect(results.molecularWeight.value).toBeCloseTo(18.0153);
    });

    it('looks up critical temperature for water', () => {
      const results = solve({
        registry: REGISTRY,
        activeMethodMap: { ...getDefaultMethodMap(REGISTRY) },
        userValues: { chemicalSearch: { value: 'water' } },
        chemData: waterData,
        pipeData: testPipeData,
      });
      expect(results.criticalTemperature.value).toBeCloseTo(647.096); // K
    });
  });

  describe('vapor pressure', () => {
    it('calculates water vapor pressure at 100C ≈ 101325 Pa', () => {
      const methodMap = getDefaultMethodMap(REGISTRY);
      const results = solve({
        registry: REGISTRY,
        activeMethodMap: methodMap,
        userValues: {
          chemicalSearch: { value: 'water' },
          temperature: { value: 373.15, unit: 'K' },
          pressure: { value: 101325, unit: 'Pa' },
        },
        chemData: waterData,
        pipeData: testPipeData,
      });
      // Water boils at 100C/373.15K at 101325 Pa
      expect(results.vaporPressure.isValid).toBe(true);
      expect(results.vaporPressure.value).toBeCloseTo(101325, -3); // within ~1000 Pa
    });
  });

  describe('phase determination', () => {
    it('water at 25C, 1 atm is liquid', () => {
      const methodMap = getDefaultMethodMap(REGISTRY);
      const results = solve({
        registry: REGISTRY,
        activeMethodMap: methodMap,
        userValues: {
          chemicalSearch: { value: 'water' },
          temperature: { value: 298.15, unit: 'K' },
          pressure: { value: 101325, unit: 'Pa' },
        },
        chemData: waterData,
        pipeData: testPipeData,
      });
      expect(results.phase.isValid).toBe(true);
      expect(results.phase.value).toBe('liquid');
    });
  });

  describe('liquid density (water)', () => {
    it('water at 25C ≈ 997 kg/m3', () => {
      const methodMap = getDefaultMethodMap(REGISTRY);
      methodMap.density = 'perryLiquidCorrelation';
      const results = solve({
        registry: REGISTRY,
        activeMethodMap: methodMap,
        userValues: {
          chemicalSearch: { value: 'water' },
          temperature: { value: 298.15, unit: 'K' },
          pressure: { value: 101325, unit: 'Pa' },
        },
        chemData: waterData,
        pipeData: testPipeData,
      });
      expect(results.density.isValid).toBe(true);
      expect(results.density.value).toBeCloseTo(997, -1); // within 10
    });
  });

  describe('ideal gas density (air)', () => {
    it('air at 25C, 1 atm ≈ 1.184 kg/m3', () => {
      const methodMap = getDefaultMethodMap(REGISTRY);
      methodMap.density = 'idealGas';
      const results = solve({
        registry: REGISTRY,
        activeMethodMap: methodMap,
        userValues: {
          chemicalSearch: { value: 'air' },
          temperature: { value: 298.15, unit: 'K' },
          pressure: { value: 101325, unit: 'Pa' },
        },
        chemData: airData,
        pipeData: testPipeData,
      });
      expect(results.density.isValid).toBe(true);
      expect(results.density.value).toBeCloseTo(1.184, 2);
    });
  });

  describe('liquid viscosity (water)', () => {
    it('water at 25C ≈ 0.89 cP = 8.9e-4 Pa*s', () => {
      const methodMap = getDefaultMethodMap(REGISTRY);
      methodMap.viscosity = 'perryLiquidCorrelation';
      const results = solve({
        registry: REGISTRY,
        activeMethodMap: methodMap,
        userValues: {
          chemicalSearch: { value: 'water' },
          temperature: { value: 298.15, unit: 'K' },
          pressure: { value: 101325, unit: 'Pa' },
        },
        chemData: waterData,
        pipeData: testPipeData,
      });
      expect(results.viscosity.isValid).toBe(true);
      // Water viscosity at 25C: ~8.9e-4 Pa*s
      expect(results.viscosity.value).toBeCloseTo(8.9e-4, 4);
    });
  });

  describe('pipe inner diameter', () => {
    it('2" NPS Sch. 40 ID ≈ 2.067 inches = 0.05250 m', () => {
      const methodMap = getDefaultMethodMap(REGISTRY);
      const results = solve({
        registry: REGISTRY,
        activeMethodMap: methodMap,
        userValues: {
          chemicalSearch: { value: 'water' },
          temperature: { value: 298.15, unit: 'K' },
          pressure: { value: 101325, unit: 'Pa' },
          pipeStandard: { value: 'NPS' },
          pipeNominalDiameter: { value: '2' },
          pipeSchedule: { value: 'Sch. 40' },
          pipeMaterial: { value: 'Commercial Steel or Wrought Iron' },
          massFlowRate: { value: 100 / 2.205, unit: 'kg/hr' },
          pipeLength: { value: 100 / 3.281, unit: 'm' },
        },
        chemData: waterData,
        pipeData: testPipeData,
      });
      expect(results.pipeInnerDiameter.isValid).toBe(true);
      // 2.375 - 2*0.154 = 2.067 in = 0.0525018 m
      expect(results.pipeInnerDiameter.value).toBeCloseTo(0.0525, 3);
    });
  });

  describe('Reynolds number', () => {
    it('computes Reynolds number for water in a pipe', () => {
      const methodMap = getDefaultMethodMap(REGISTRY);
      methodMap.density = 'perryLiquidCorrelation';
      methodMap.viscosity = 'perryLiquidCorrelation';
      const results = solve({
        registry: REGISTRY,
        activeMethodMap: methodMap,
        userValues: {
          chemicalSearch: { value: 'water' },
          temperature: { value: 298.15, unit: 'K' },
          pressure: { value: 101325, unit: 'Pa' },
          pipeStandard: { value: 'NPS' },
          pipeNominalDiameter: { value: '2' },
          pipeSchedule: { value: 'Sch. 40' },
          pipeMaterial: { value: 'Commercial Steel or Wrought Iron' },
          massFlowRate: { value: 100 / 2.205, unit: 'kg/hr' }, // ~100 lb/hr = 45.4 kg/hr
          pipeLength: { value: 100 / 3.281, unit: 'm' },
        },
        chemData: waterData,
        pipeData: testPipeData,
      });
      expect(results.reynoldsNumber.isValid).toBe(true);
      // Rough check: Re should be reasonable (few hundred to few thousand for this flow)
      expect(results.reynoldsNumber.value).toBeGreaterThan(100);
      expect(results.reynoldsNumber.value).toBeLessThan(100000);
    });
  });

  describe('friction factor', () => {
    it('Churchill 1977 gives reasonable result for turbulent flow', () => {
      // Direct test of friction factor calculation
      const ff = REGISTRY.frictionFactor.methods.churchill1977.calculate({
        reynoldsNumber: 100000,
        pipeAbsoluteRoughness: 0.00015, // steel
        pipeInnerDiameter: 0.0525,       // 2" Sch 40
      });
      // For Re=100000, relative roughness ~0.003, f should be ~0.026-0.030
      expect(ff).toBeGreaterThan(0.02);
      expect(ff).toBeLessThan(0.04);
    });

    it('laminar gives 64/Re', () => {
      const ff = REGISTRY.frictionFactor.methods.laminar.calculate({
        reynoldsNumber: 2000,
      });
      expect(ff).toBeCloseTo(0.032);
    });

    it('different methods agree for turbulent flow', () => {
      const input = {
        reynoldsNumber: 50000,
        pipeAbsoluteRoughness: 0.00015,
        pipeInnerDiameter: 0.05,
      };
      const churchill77 = REGISTRY.frictionFactor.methods.churchill1977.calculate(input);
      const churchill73 = REGISTRY.frictionFactor.methods.churchill1973.calculate(input);
      const colebrook = REGISTRY.frictionFactor.methods.colebrook.calculate(input);
      const niazkar = REGISTRY.frictionFactor.methods.niazkar.calculate(input);
      const swameeJain = REGISTRY.frictionFactor.methods.swameeJain.calculate(input);
      const haaland = REGISTRY.frictionFactor.methods.haaland.calculate(input);

      // All should be within 5% of each other for turbulent flow
      expect(churchill73).toBeCloseTo(colebrook, 3);
      expect(niazkar).toBeCloseTo(colebrook, 3);
      expect(swameeJain).toBeCloseTo(colebrook, 3);
      expect(haaland).toBeCloseTo(colebrook, 3);
      // Churchill 1977 covers all regimes, may differ slightly in transitional
      expect(churchill77).toBeCloseTo(colebrook, 2);
    });
  });

  describe('pressure drop (Darcy-Weisbach)', () => {
    it('computes pressure drop in Pa', () => {
      const dP = REGISTRY.pressureDropPipe.methods.darcy.calculate({
        frictionFactor: 0.03,
        density: 997,           // water kg/m3
        pipeLength: 30.48,      // 100 ft in m
        pipeInnerDiameter: 0.0525, // 2" Sch 40
        velocity: 0.3,          // m/s
      });
      // dP = f * L/D * rho * v^2 / 2
      // = 0.03 * (30.48/0.0525) * 997 * 0.09 / 2 ≈ 783 Pa ≈ 0.114 psi
      expect(dP).toBeGreaterThan(500);
      expect(dP).toBeLessThan(1500);
    });
  });

  describe('end-to-end: water through 2" Sch 40', () => {
    it('produces valid pressure drop result', () => {
      const methodMap = getDefaultMethodMap(REGISTRY);
      methodMap.density = 'perryLiquidCorrelation';
      methodMap.viscosity = 'perryLiquidCorrelation';
      methodMap.frictionFactor = 'churchill1977';

      const results = solve({
        registry: REGISTRY,
        activeMethodMap: methodMap,
        userValues: {
          chemicalSearch: { value: 'water' },
          temperature: { value: 298.15, unit: 'K' },
          pressure: { value: 101325, unit: 'Pa' },
          pipeStandard: { value: 'NPS' },
          pipeNominalDiameter: { value: '2' },
          pipeSchedule: { value: 'Sch. 40' },
          pipeMaterial: { value: 'Commercial Steel or Wrought Iron' },
          massFlowRate: { value: 100 / 2.205, unit: 'kg/hr' },
          pipeLength: { value: 100 / 3.281, unit: 'm' },
        },
        chemData: waterData,
        pipeData: testPipeData,
      });

      // Check the full chain resolved
      expect(results.density.isValid).toBe(true);
      expect(results.viscosity.isValid).toBe(true);
      expect(results.volumeFlowRate.isValid).toBe(true);
      expect(results.velocity.isValid).toBe(true);
      expect(results.pipeCrossSectionalArea.isValid).toBe(true);
      expect(results.reynoldsNumber.isValid).toBe(true);
      expect(results.frictionFactor.isValid).toBe(true);
      expect(results.pressureDropPipe.isValid).toBe(true);
      expect(results.pressureDropTotal.isValid).toBe(true);

      // Pressure drop should be positive and reasonable
      expect(results.pressureDropPipe.value).toBeGreaterThan(0);
    });
  });

  describe('getDefaultMethodMap', () => {
    it('assigns first method to calculated properties', () => {
      const map = getDefaultMethodMap(REGISTRY);
      expect(map.density).toBe('idealGas'); // first method
      expect(map.temperature).toBeNull();   // user input
      expect(map.molecularWeight).toBe('lookup');
    });
  });
});
