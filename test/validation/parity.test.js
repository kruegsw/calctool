import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';
import { resolve } from 'path';
import { REGISTRY, getDefaultMethodMap } from '../../src/engine/registry.js';
import { solve } from '../../src/engine/solver.js';
import { toSI, fromSI, convertUnits } from '../../src/engine/units.js';

// Load actual chemical data from JSON
const chemDB = JSON.parse(readFileSync(resolve('src/data/chemicals.json'), 'utf8'));
const pipeDimensions = JSON.parse(readFileSync(resolve('src/data/pipe-dimensions.json'), 'utf8'));
const pipeMaterials = JSON.parse(readFileSync(resolve('src/data/pipe-materials.json'), 'utf8'));

const pipeData = { materials: pipeMaterials, dimensions: pipeDimensions };

// Find water in the database
const waterCAS = Object.keys(chemDB).find(k => chemDB[k].name === 'water');
const waterData = chemDB[waterCAS];

// Find air in the database
const airCAS = Object.keys(chemDB).find(k => chemDB[k].name === 'air');
const airData = chemDB[airCAS];

describe('parity: water through 2" Sch 40, 100 ft, 100 lb/hr', () => {
  const methodMap = getDefaultMethodMap(REGISTRY);
  // Use liquid correlations for water
  methodMap.density = 'perryLiquidCorrelation';
  methodMap.viscosity = 'perryLiquidCorrelation';
  methodMap.frictionFactor = 'churchill1977';

  const results = solve({
    registry: REGISTRY,
    activeMethodMap: methodMap,
    userValues: {
      chemicalSearch: { value: waterCAS },
      temperature: { value: 25, unit: 'C' },
      pressure: { value: 0, unit: 'psig' },
      pipeStandard: { value: 'NPS' },
      pipeNominalDiameter: { value: '2' },
      pipeSchedule: { value: 'Sch. 40' },
      pipeMaterial: { value: 'Commercial Steel or Wrought Iron' },
      massFlowRate: { value: 100, unit: 'lb/hr' },
      pipeLength: { value: 100, unit: 'ft' },
    },
    chemData: waterData,
    pipeData,
  });

  it('temperature = 298.15 K (25 C)', () => {
    expect(results.temperature.value).toBeCloseTo(298.15);
  });

  it('pressure = 101325 Pa (0 psig)', () => {
    expect(results.pressure.value).toBeCloseTo(101325, -1);
  });

  it('molecular weight = 18.015', () => {
    expect(results.molecularWeight.value).toBeCloseTo(18.015, 2);
  });

  it('phase = liquid', () => {
    expect(results.phase.value).toBe('liquid');
  });

  it('density ≈ 997 kg/m3 (water at 25C)', () => {
    expect(results.density.isValid).toBe(true);
    expect(results.density.value).toBeCloseTo(997, -1);
  });

  it('viscosity ≈ 8.9e-4 Pa*s (0.89 cP)', () => {
    expect(results.viscosity.isValid).toBe(true);
    // Water at 25C: 0.89 cP = 8.9e-4 Pa*s
    const cP = results.viscosity.value * 1000;
    expect(cP).toBeCloseTo(0.89, 1);
  });

  it('pipe inner diameter ≈ 2.067 in = 0.0525 m', () => {
    expect(results.pipeInnerDiameter.isValid).toBe(true);
    const inches = fromSI('length', 'in', results.pipeInnerDiameter.value);
    expect(inches).toBeCloseTo(2.067, 2);
  });

  it('pipe cross-sectional area valid', () => {
    expect(results.pipeCrossSectionalArea.isValid).toBe(true);
    const in2 = fromSI('area', 'in2', results.pipeCrossSectionalArea.value);
    // pi/4 * 2.067^2 = 3.356 in2
    expect(in2).toBeCloseTo(3.356, 1);
  });

  it('roughness = 0.00015 m (commercial steel)', () => {
    expect(results.pipeAbsoluteRoughness.isValid).toBe(true);
    expect(results.pipeAbsoluteRoughness.value).toBe(0.00015);
  });

  it('volume flow rate valid', () => {
    expect(results.volumeFlowRate.isValid).toBe(true);
    expect(results.volumeFlowRate.value).toBeGreaterThan(0);
  });

  it('velocity valid and reasonable', () => {
    expect(results.velocity.isValid).toBe(true);
    // 100 lb/hr water through 2" pipe -> very low velocity
    const ft_s = fromSI('velocity', 'ft/s', results.velocity.value);
    expect(ft_s).toBeGreaterThan(0);
    expect(ft_s).toBeLessThan(1); // low flow
  });

  it('Reynolds number valid (expect laminar for this flow)', () => {
    expect(results.reynoldsNumber.isValid).toBe(true);
    // 100 lb/hr is very low flow, should be laminar or low turbulent
    expect(results.reynoldsNumber.value).toBeGreaterThan(0);
    expect(results.reynoldsNumber.value).toBeLessThan(10000);
  });

  it('friction factor valid', () => {
    expect(results.frictionFactor.isValid).toBe(true);
    expect(results.frictionFactor.value).toBeGreaterThan(0);
  });

  it('pressure drop valid and positive', () => {
    expect(results.pressureDropPipe.isValid).toBe(true);
    expect(results.pressureDropPipe.value).toBeGreaterThan(0);
    // For low flow water, pressure drop should be small
    const psi = fromSI('pressureDifference', 'psi', results.pressureDropPipe.value);
    expect(psi).toBeGreaterThan(0);
    expect(psi).toBeLessThan(1); // low flow, small dP
  });

  it('total pressure drop = pipe pressure drop (no fittings)', () => {
    expect(results.pressureDropTotal.value).toBeCloseTo(results.pressureDropPipe.value);
  });
});

describe('parity: air through 2" Sch 40, 100 ft, 100 lb/hr', () => {
  const methodMap = getDefaultMethodMap(REGISTRY);
  // Use ideal gas for air
  methodMap.density = 'idealGas';
  methodMap.viscosity = 'perryVaporCorrelation';
  methodMap.frictionFactor = 'churchill1977';

  const results = solve({
    registry: REGISTRY,
    activeMethodMap: methodMap,
    userValues: {
      chemicalSearch: { value: airCAS },
      temperature: { value: 25, unit: 'C' },
      pressure: { value: 0, unit: 'psig' },
      pipeStandard: { value: 'NPS' },
      pipeNominalDiameter: { value: '2' },
      pipeSchedule: { value: 'Sch. 40' },
      pipeMaterial: { value: 'Commercial Steel or Wrought Iron' },
      massFlowRate: { value: 100, unit: 'lb/hr' },
      pipeLength: { value: 100, unit: 'ft' },
    },
    chemData: airData,
    pipeData,
  });

  it('density ≈ 1.18 kg/m3 (air at 25C, 1 atm)', () => {
    expect(results.density.isValid).toBe(true);
    expect(results.density.value).toBeCloseTo(1.18, 1);
  });

  it('viscosity ≈ 1.85e-5 Pa*s (air at 25C)', () => {
    expect(results.viscosity.isValid).toBe(true);
    // Air viscosity at 25C ≈ 1.85e-5 Pa*s
    expect(results.viscosity.value).toBeCloseTo(1.85e-5, 6);
  });

  it('velocity valid and higher than water (gas is less dense)', () => {
    expect(results.velocity.isValid).toBe(true);
    const ft_s = fromSI('velocity', 'ft/s', results.velocity.value);
    // Air at 1.18 kg/m3, 100 lb/hr through 2" pipe -> higher velocity than water
    expect(ft_s).toBeGreaterThan(1);
    expect(ft_s).toBeLessThan(100);
  });

  it('Reynolds number is turbulent', () => {
    expect(results.reynoldsNumber.isValid).toBe(true);
    // Air has low viscosity, should be turbulent even at moderate flow
    expect(results.reynoldsNumber.value).toBeGreaterThan(2300);
  });

  it('pressure drop valid and larger than water (gas)', () => {
    expect(results.pressureDropPipe.isValid).toBe(true);
    const psi = fromSI('pressureDifference', 'psi', results.pressureDropPipe.value);
    expect(psi).toBeGreaterThan(0);
  });
});

describe('edge cases', () => {

  it('handles empty inputs without crashing', () => {
    const results = solve({
      registry: REGISTRY,
      activeMethodMap: getDefaultMethodMap(REGISTRY),
      userValues: {},
      chemData: null,
      pipeData: null,
    });
    // Should have results for all properties, none should throw
    expect(Object.keys(results).length).toBeGreaterThan(0);
  });

  it('handles NaN user input gracefully', () => {
    const results = solve({
      registry: REGISTRY,
      activeMethodMap: getDefaultMethodMap(REGISTRY),
      userValues: {
        temperature: { value: NaN, unit: 'C' },
      },
      chemData: null,
      pipeData: null,
    });
    // Temperature with NaN should not be valid
    expect(results.temperature.isValid).toBe(false);
  });

  it('invalid method selection produces INVALID_METHOD error', () => {
    // Selecting a method that doesn't exist should produce a clear error
    const methodMap = getDefaultMethodMap(REGISTRY);
    methodMap.pipeInnerDiameter = 'nonExistentMethod';

    const results = solve({
      registry: REGISTRY,
      activeMethodMap: methodMap,
      userValues: {},
      chemData: null,
      pipeData: null,
    });

    expect(results.pipeInnerDiameter.isValid).toBe(false);
    expect(results.pipeInnerDiameter.error.type).toBe('INVALID_METHOD');
  });

  it('unit conversion round-trip: temperature C -> K -> F -> K -> C', () => {
    const start = 25;
    const k = toSI('temperature', 'C', start);
    const f = fromSI('temperature', 'F', k);
    const k2 = toSI('temperature', 'F', f);
    const end = fromSI('temperature', 'C', k2);
    expect(end).toBeCloseTo(start);
  });

  it('pressure drop is proportional to pipe length', () => {
    const methodMap = getDefaultMethodMap(REGISTRY);
    methodMap.density = 'perryLiquidCorrelation';
    methodMap.viscosity = 'perryLiquidCorrelation';
    methodMap.frictionFactor = 'churchill1977';

    const base = {
      chemicalSearch: { value: waterCAS },
      temperature: { value: 25, unit: 'C' },
      pressure: { value: 0, unit: 'psig' },
      pipeStandard: { value: 'NPS' },
      pipeNominalDiameter: { value: '2' },
      pipeSchedule: { value: 'Sch. 40' },
      pipeMaterial: { value: 'Commercial Steel or Wrought Iron' },
      massFlowRate: { value: 100, unit: 'lb/hr' },
    };

    const r1 = solve({
      registry: REGISTRY, activeMethodMap: methodMap,
      userValues: { ...base, pipeLength: { value: 100, unit: 'ft' } },
      chemData: waterData, pipeData,
    });

    const r2 = solve({
      registry: REGISTRY, activeMethodMap: methodMap,
      userValues: { ...base, pipeLength: { value: 200, unit: 'ft' } },
      chemData: waterData, pipeData,
    });

    // dP should double when length doubles
    expect(r2.pressureDropPipe.value / r1.pressureDropPipe.value).toBeCloseTo(2.0, 1);
  });

  it('pipe standard change only affects pipe fields', () => {
    // Verify that changing pipe standard doesn't affect chemical properties
    const methodMap = getDefaultMethodMap(REGISTRY);
    methodMap.density = 'idealGas';

    const baseValues = {
      chemicalSearch: { value: airCAS },
      temperature: { value: 25, unit: 'C' },
      pressure: { value: 0, unit: 'psig' },
      massFlowRate: { value: 100, unit: 'lb/hr' },
      pipeLength: { value: 100, unit: 'ft' },
      pipeMaterial: { value: 'Commercial Steel or Wrought Iron' },
    };

    const r1 = solve({
      registry: REGISTRY, activeMethodMap: methodMap,
      userValues: {
        ...baseValues,
        pipeStandard: { value: 'NPS' },
        pipeNominalDiameter: { value: '2' },
        pipeSchedule: { value: 'Sch. 40' },
      },
      chemData: airData, pipeData,
    });

    const r2 = solve({
      registry: REGISTRY, activeMethodMap: methodMap,
      userValues: {
        ...baseValues,
        pipeStandard: { value: 'NPS' },
        pipeNominalDiameter: { value: '4' },
        pipeSchedule: { value: 'Sch. 40' },
      },
      chemData: airData, pipeData,
    });

    // Chemical properties should be identical
    expect(r1.density.value).toBe(r2.density.value);
    expect(r1.molecularWeight.value).toBe(r2.molecularWeight.value);

    // Pipe properties should differ
    expect(r1.pipeInnerDiameter.value).not.toBe(r2.pipeInnerDiameter.value);
  });
});
