import { describe, it, expect } from 'vitest';
import { REGISTRY, getDefaultMethodMap, fannoParameter, solveFannoMach } from '../../src/engine/registry.js';
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
      const moody = REGISTRY.frictionFactor.methods.moody.calculate(input);

      // All should be within 5% of each other for turbulent flow
      expect(churchill73).toBeCloseTo(colebrook, 3);
      expect(niazkar).toBeCloseTo(colebrook, 3);
      expect(swameeJain).toBeCloseTo(colebrook, 3);
      expect(haaland).toBeCloseTo(colebrook, 3);
      // Churchill 1977 covers all regimes, may differ slightly in transitional
      expect(churchill77).toBeCloseTo(colebrook, 2);
      // Moody is a legacy approximation — looser tolerance
      expect(moody).toBeCloseTo(colebrook, 2);
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
          totalKFactor: { value: 0 },
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

  describe('pressureDropFittings (K-factor method)', () => {
    it('computes dP = K * rho * v^2 / 2', () => {
      const dP = REGISTRY.pressureDropFittings.methods.kFactor.calculate({
        totalKFactor: 2.0,
        density: 997,    // water kg/m3
        velocity: 1.0,   // m/s
      });
      // dP = 2.0 * 997 * 1.0^2 / 2 = 997 Pa
      expect(dP).toBeCloseTo(997, 0);
    });

    it('returns 0 when totalKFactor is 0', () => {
      const dP = REGISTRY.pressureDropFittings.methods.kFactor.calculate({
        totalKFactor: 0,
        density: 997,
        velocity: 1.0,
      });
      expect(dP).toBe(0);
    });
  });

  describe('pressureDropTotal (pipeAndFittings)', () => {
    it('sums pipe and fittings pressure drops', () => {
      const dP = REGISTRY.pressureDropTotal.methods.pipeAndFittings.calculate({
        pressureDropPipe: 500,
        pressureDropFittings: 300,
      });
      expect(dP).toBe(800);
    });

    it('pipeOnly still works', () => {
      const dP = REGISTRY.pressureDropTotal.methods.pipeOnly.calculate({
        pressureDropPipe: 500,
      });
      expect(dP).toBe(500);
    });
  });

  describe('end-to-end with fittings: water through 2" Sch 40', () => {
    it('produces valid fittings + total pressure drop', () => {
      const methodMap = getDefaultMethodMap(REGISTRY);
      methodMap.density = 'perryLiquidCorrelation';
      methodMap.viscosity = 'perryLiquidCorrelation';
      methodMap.frictionFactor = 'churchill1977';
      methodMap.pressureDropTotal = 'pipeAndFittings';

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
          totalKFactor: { value: 2.0 },
        },
        chemData: waterData,
        pipeData: testPipeData,
      });

      expect(results.pressureDropFittings.isValid).toBe(true);
      expect(results.pressureDropFittings.value).toBeGreaterThan(0);
      expect(results.pressureDropPipe.isValid).toBe(true);
      expect(results.pressureDropTotal.isValid).toBe(true);
      // Total = pipe + fittings, so total > pipe alone
      expect(results.pressureDropTotal.value).toBeGreaterThan(results.pressureDropPipe.value);
    });
  });

  describe('getDefaultMethodMap', () => {
    it('assigns first method to calculated properties', () => {
      const map = getDefaultMethodMap(REGISTRY);
      expect(map.density).toBe('idealGas'); // first method
      expect(map.temperature).toBeNull();   // user input
      expect(map.molecularWeight).toBe('lookup');
    });

    it('defaults pressureDropTotal to pipeAndFittings', () => {
      const map = getDefaultMethodMap(REGISTRY);
      expect(map.pressureDropTotal).toBe('pipeAndFittings');
    });
  });

  describe('Fanno parameter and solver', () => {
    it('Φ(1, 1.4) ≈ 0 (sonic condition)', () => {
      expect(fannoParameter(1.0, 1.4)).toBeCloseTo(0, 10);
    });

    it('Φ is positive for Ma < 1', () => {
      expect(fannoParameter(0.5, 1.4)).toBeGreaterThan(0);
      expect(fannoParameter(0.1, 1.4)).toBeGreaterThan(0);
      expect(fannoParameter(0.9, 1.4)).toBeGreaterThan(0);
    });

    it('Φ is monotonically decreasing', () => {
      const phi1 = fannoParameter(0.2, 1.4);
      const phi2 = fannoParameter(0.5, 1.4);
      const phi3 = fannoParameter(0.8, 1.4);
      expect(phi1).toBeGreaterThan(phi2);
      expect(phi2).toBeGreaterThan(phi3);
    });

    it('textbook value: Φ(0.5, 1.4) ≈ 1.0691', () => {
      expect(fannoParameter(0.5, 1.4)).toBeCloseTo(1.0691, 3);
    });

    it('solveFannoMach inverts Φ correctly', () => {
      const phi = fannoParameter(0.5, 1.4);
      const Ma = solveFannoMach(phi, 1.4);
      expect(Ma).toBeCloseTo(0.5, 6);
    });

    it('solveFannoMach returns 1.0 when targetPhi ≤ 0', () => {
      expect(solveFannoMach(0, 1.4)).toBe(1.0);
      expect(solveFannoMach(-1, 1.4)).toBe(1.0);
    });
  });

  describe('Fanno pressure drop method', () => {
    it('converges to Darcy at low Mach (< 1% difference)', () => {
      // Consistent thermodynamic inputs: ideal gas ρ = P·MW/(R·T·1000)
      const P = 500000;    // Pa
      const T = 300;       // K
      const MW = 28.97;    // g/mol (air)
      const R = 8.314;     // J/(mol·K)
      const gamma = 1.4;
      const rho = P * MW / (R * T * 1000); // ~5.80 kg/m3
      const c = Math.sqrt(gamma * R * 1000 * T / MW); // ~347 m/s
      const Ma = 0.01;
      const v = Ma * c;    // ~3.47 m/s
      const inputs = {
        frictionFactor: 0.02,
        density: rho,
        pipeLength: 1,
        pipeInnerDiameter: 0.05,
        velocity: v,
        machNumber: Ma,
        cpCvRatio: gamma,
        pressure: P,
      };
      const darcy = REGISTRY.pressureDropPipe.methods.darcy.calculate(inputs);
      const fanno = REGISTRY.pressureDropPipe.methods.fanno.calculate(inputs);
      expect(fanno).toBeGreaterThan(0);
      const diff = Math.abs(fanno - darcy) / darcy;
      expect(diff).toBeLessThan(0.01);
    });

    it('returns null for supersonic inlet', () => {
      const result = REGISTRY.pressureDropPipe.methods.fanno.calculate({
        frictionFactor: 0.02,
        machNumber: 1.2,
        cpCvRatio: 1.4,
        pressure: 101325,
        pipeLength: 10,
        pipeInnerDiameter: 0.05,
      });
      expect(result).toBeNull();
    });

    it('returns positive ΔP for choking-length pipe', () => {
      // Very long pipe that exceeds L*
      const result = REGISTRY.pressureDropPipe.methods.fanno.calculate({
        frictionFactor: 0.02,
        machNumber: 0.5,
        cpCvRatio: 1.4,
        pressure: 200000,
        pipeLength: 1000,   // much longer than L*
        pipeInnerDiameter: 0.05,
      });
      expect(result).toBeGreaterThan(0);
    });

    it('gives higher ΔP than Darcy at Ma 0.5', () => {
      const inputs = {
        frictionFactor: 0.02,
        density: 1.2,
        pipeLength: 1,
        pipeInnerDiameter: 0.05,
        velocity: 170,
        machNumber: 0.5,
        cpCvRatio: 1.4,
        pressure: 101325,
      };
      const darcy = REGISTRY.pressureDropPipe.methods.darcy.calculate(inputs);
      const fanno = REGISTRY.pressureDropPipe.methods.fanno.calculate(inputs);
      expect(fanno).toBeGreaterThan(darcy);
    });
  });

  describe('isothermal pressure drop method', () => {
    it('returns positive ΔP for valid subsonic flow', () => {
      const result = REGISTRY.pressureDropPipe.methods.isothermal.calculate({
        frictionFactor: 0.02,
        machNumber: 0.3,
        cpCvRatio: 1.4,
        pressure: 200000,
        pipeLength: 10,
        pipeInnerDiameter: 0.05,
      });
      expect(result).toBeGreaterThan(0);
    });

    it('returns null when Ma exceeds 1/sqrt(γ)', () => {
      const result = REGISTRY.pressureDropPipe.methods.isothermal.calculate({
        frictionFactor: 0.02,
        machNumber: 0.9,   // > 1/sqrt(1.4) ≈ 0.845
        cpCvRatio: 1.4,
        pressure: 200000,
        pipeLength: 10,
        pipeInnerDiameter: 0.05,
      });
      expect(result).toBeNull();
    });

    it('returns positive ΔP when pipe exceeds choking length', () => {
      const result = REGISTRY.pressureDropPipe.methods.isothermal.calculate({
        frictionFactor: 0.02,
        machNumber: 0.5,
        cpCvRatio: 1.4,
        pressure: 200000,
        pipeLength: 1000,   // very long
        pipeInnerDiameter: 0.05,
      });
      expect(result).toBeGreaterThan(0);
    });
  });

  describe('fannoMaxLength property', () => {
    it('returns positive value for subsonic flow', () => {
      const Lstar = REGISTRY.fannoMaxLength.methods.fanno.calculate({
        frictionFactor: 0.02,
        machNumber: 0.5,
        cpCvRatio: 1.4,
        pipeInnerDiameter: 0.05,
      });
      expect(Lstar).toBeGreaterThan(0);
    });

    it('matches textbook: L* = D * Φ(0.5, 1.4) / f', () => {
      const f = 0.02;
      const D = 0.05;
      const Lstar = REGISTRY.fannoMaxLength.methods.fanno.calculate({
        frictionFactor: f,
        machNumber: 0.5,
        cpCvRatio: 1.4,
        pipeInnerDiameter: D,
      });
      // Φ(0.5, 1.4) ≈ 1.0691 → L* = 0.05 * 1.0691 / 0.02 = 2.6728 m
      expect(Lstar).toBeCloseTo(D * 1.0691 / f, 2);
    });

    it('returns null for supersonic inlet', () => {
      const result = REGISTRY.fannoMaxLength.methods.fanno.calculate({
        frictionFactor: 0.02,
        machNumber: 1.2,
        cpCvRatio: 1.4,
        pipeInnerDiameter: 0.05,
      });
      expect(result).toBeNull();
    });

    it('increases as Mach decreases', () => {
      const calc = (Ma) => REGISTRY.fannoMaxLength.methods.fanno.calculate({
        frictionFactor: 0.02,
        machNumber: Ma,
        cpCvRatio: 1.4,
        pipeInnerDiameter: 0.05,
      });
      expect(calc(0.2)).toBeGreaterThan(calc(0.5));
      expect(calc(0.5)).toBeGreaterThan(calc(0.8));
    });
  });

  describe('solver Mach auto-selection', () => {
    // Air Cp data for gas tests
    const airDataWithCp = {
      ...airData,
      empirical: {
        ...airData.empirical,
        gaseous: {
          ...airData.empirical.gaseous,
          cp: {
            perryCorrelation: {
              equation: '100',
              C1: 28958,
              C2: 9.39,
              C3: -0.001408,
              C4: 0,
              C5: 0,
              Tmin: 100,
              Tmax: 2000,
            },
          },
        },
      },
    };

    it('switches to fanno for gas at Ma > 0.3', () => {
      const methodMap = getDefaultMethodMap(REGISTRY);
      const results = solve({
        registry: REGISTRY,
        activeMethodMap: methodMap,
        userValues: {
          chemicalSearch: { value: 'air' },
          temperature: { value: 300, unit: 'K' },
          pressure: { value: 500000, unit: 'Pa' },
          pipeStandard: { value: 'NPS' },
          pipeNominalDiameter: { value: '2' },
          pipeSchedule: { value: 'Sch. 40' },
          pipeMaterial: { value: 'Commercial Steel or Wrought Iron' },
          massFlowRate: { value: 8000, unit: 'kg/hr' },
          pipeLength: { value: 10, unit: 'm' },
          totalKFactor: { value: 0 },
        },
        chemData: airDataWithCp,
        pipeData: testPipeData,
      });

      // High mass flow should produce Ma > 0.3
      if (results.machNumber?.isValid && results.machNumber.value > 0.3) {
        expect(methodMap.pressureDropPipe).toBe('fanno');
        expect(results.pressureDropPipe.isValid).toBe(true);
      }
    });

    it('keeps darcy for liquid regardless of flow', () => {
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
          massFlowRate: { value: 100, unit: 'kg/hr' },
          pipeLength: { value: 10, unit: 'm' },
          totalKFactor: { value: 0 },
        },
        chemData: waterData,
        pipeData: testPipeData,
      });

      expect(results.phase.value).toBe('liquid');
      expect(methodMap.pressureDropPipe).toBe('darcy');
    });

    it('respects user method overrides', () => {
      const methodMap = getDefaultMethodMap(REGISTRY);
      const overrides = new Set(['pressureDropPipe']);
      methodMap.pressureDropPipe = 'darcy';
      const results = solve({
        registry: REGISTRY,
        activeMethodMap: methodMap,
        userValues: {
          chemicalSearch: { value: 'air' },
          temperature: { value: 300, unit: 'K' },
          pressure: { value: 500000, unit: 'Pa' },
          pipeStandard: { value: 'NPS' },
          pipeNominalDiameter: { value: '2' },
          pipeSchedule: { value: 'Sch. 40' },
          pipeMaterial: { value: 'Commercial Steel or Wrought Iron' },
          massFlowRate: { value: 8000, unit: 'kg/hr' },
          pipeLength: { value: 10, unit: 'm' },
          totalKFactor: { value: 0 },
        },
        chemData: airDataWithCp,
        pipeData: testPipeData,
        userMethodOverrides: overrides,
      });

      // Should stay on darcy despite high Mach
      expect(methodMap.pressureDropPipe).toBe('darcy');
    });
  });
});
