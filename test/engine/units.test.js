import { describe, it, expect } from 'vitest';
import { UNITS, toSI, fromSI, convertUnits, unitKeysFor, unitOptionsFor } from '../../src/engine/units.js';

// Helper: check round-trip within tolerance
function roundTrip(quantity, unit, value, tol = 1e-9) {
  const si = toSI(quantity, unit, value);
  const back = fromSI(quantity, unit, si);
  expect(back).toBeCloseTo(value, -Math.log10(tol));
}

describe('units.js', () => {

  describe('temperature conversions', () => {
    it('K is identity', () => {
      expect(toSI('temperature', 'K', 300)).toBe(300);
      expect(fromSI('temperature', 'K', 300)).toBe(300);
    });
    it('C to K', () => {
      expect(toSI('temperature', 'C', 0)).toBeCloseTo(273.15);
      expect(toSI('temperature', 'C', 100)).toBeCloseTo(373.15);
    });
    it('F to K', () => {
      expect(toSI('temperature', 'F', 32)).toBeCloseTo(273.15);
      expect(toSI('temperature', 'F', 212)).toBeCloseTo(373.15);
    });
    it('R to K', () => {
      expect(toSI('temperature', 'R', 491.67)).toBeCloseTo(273.15);
    });
    it('round-trips', () => {
      roundTrip('temperature', 'C', 25);
      roundTrip('temperature', 'F', 77);
      roundTrip('temperature', 'R', 536.67);
    });
  });

  describe('pressure conversions', () => {
    it('Pa is identity', () => {
      expect(toSI('pressure', 'Pa', 101325)).toBe(101325);
    });
    it('psia to Pa', () => {
      expect(toSI('pressure', 'psia', 14.696)).toBeCloseTo(101325, -1);
    });
    it('psig to Pa (0 psig = 1 atm)', () => {
      expect(toSI('pressure', 'psig', 0)).toBeCloseTo(101325);
    });
    it('atm to Pa', () => {
      expect(toSI('pressure', 'atm', 1)).toBe(101325);
    });
    it('bar to Pa', () => {
      expect(toSI('pressure', 'bar', 1)).toBe(100000);
    });
    it('round-trips', () => {
      roundTrip('pressure', 'psia', 14.696);
      roundTrip('pressure', 'psig', 50);
      roundTrip('pressure', 'bar', 2.5);
      roundTrip('pressure', 'atm', 3);
      roundTrip('pressure', 'MPa', 0.5);
    });
  });

  describe('length conversions', () => {
    it('m is identity', () => {
      expect(toSI('length', 'm', 1)).toBe(1);
    });
    it('ft to m', () => {
      expect(toSI('length', 'ft', 1)).toBeCloseTo(0.3048, 4);
    });
    it('in to m', () => {
      expect(toSI('length', 'in', 1)).toBeCloseTo(0.0254, 4);
    });
    it('mil is 1/1000 inch', () => {
      const mil_m = toSI('length', 'mil', 1000);
      const in_m = toSI('length', 'in', 1);
      expect(mil_m).toBeCloseTo(in_m, 6);
    });
    it('round-trips', () => {
      roundTrip('length', 'ft', 100);
      roundTrip('length', 'in', 12);
      roundTrip('length', 'mm', 25.4);
      roundTrip('length', 'km', 1.5);
      roundTrip('length', 'mi', 1);
      roundTrip('length', 'yd', 100);
    });
  });

  describe('mass conversions', () => {
    it('kg is identity', () => {
      expect(toSI('mass', 'kg', 1)).toBe(1);
    });
    it('lb to kg', () => {
      expect(toSI('mass', 'lb', 1)).toBeCloseTo(0.453592, 4);
    });
    it('round-trips', () => {
      roundTrip('mass', 'lb', 100);
      roundTrip('mass', 'g', 500);
      roundTrip('mass', 'metric ton', 2);
    });
  });

  describe('velocity conversions', () => {
    it('m/s is identity', () => {
      expect(toSI('velocity', 'm/s', 10)).toBe(10);
    });
    it('ft/s to m/s', () => {
      expect(toSI('velocity', 'ft/s', 1)).toBeCloseTo(0.3048, 4);
    });
    it('round-trips', () => {
      roundTrip('velocity', 'ft/s', 100);
      roundTrip('velocity', 'mph', 60);
    });
  });

  describe('viscosity conversions', () => {
    it('Pa*s is identity', () => {
      expect(toSI('viscosityDynamic', 'Pa*s', 1)).toBe(1);
    });
    it('cP to Pa*s', () => {
      expect(toSI('viscosityDynamic', 'centipoise', 1)).toBeCloseTo(0.001);
    });
    it('round-trips', () => {
      roundTrip('viscosityDynamic', 'centipoise', 1.0);
      roundTrip('viscosityDynamic', 'poise', 0.01);
    });
  });

  describe('density conversions', () => {
    it('kg/m3 is identity', () => {
      expect(toSI('concentrationMass', 'kg/m3', 1000)).toBe(1000);
    });
    it('lb/ft3 to kg/m3 (water)', () => {
      // Water: ~62.4 lb/ft3 = ~999.5 kg/m3
      const result = toSI('concentrationMass', 'lb/ft3', 62.4);
      expect(result).toBeCloseTo(999.5, 0);
    });
    it('round-trips', () => {
      roundTrip('concentrationMass', 'lb/ft3', 62.4);
      roundTrip('concentrationMass', 'g/m3', 1000);
    });
  });

  describe('area conversions', () => {
    it('round-trips', () => {
      roundTrip('area', 'ft2', 10);
      roundTrip('area', 'in2', 100);
    });
  });

  describe('volume conversions', () => {
    it('round-trips', () => {
      roundTrip('volume', 'ft3', 1);
      roundTrip('volume', 'gal', 1);
      roundTrip('volume', 'l', 1);
    });
  });

  describe('massRate conversions', () => {
    it('kg/hr is identity', () => {
      expect(toSI('massRate', 'kg/hr', 100)).toBe(100);
    });
    it('lb/hr to kg/hr', () => {
      expect(toSI('massRate', 'lb/hr', 100)).toBeCloseTo(45.36, 1);
    });
    it('round-trips', () => {
      roundTrip('massRate', 'lb/hr', 100);
    });
  });

  describe('specificHeatCapacity conversions', () => {
    it('round-trips', () => {
      roundTrip('specificHeatCapacity', 'BTU/lb/F', 1.0);
    });
    it('water Cp: 1 BTU/lb/F ≈ 4186 J/kg/K', () => {
      const si = toSI('specificHeatCapacity', 'BTU/lb/F', 1.0);
      expect(si).toBeCloseTo(4186, -1);
    });
  });

  describe('time conversions (fix: old duplicate min bug)', () => {
    it('min to s', () => {
      expect(toSI('time', 'min', 1)).toBe(60);
    });
    it('hr to s', () => {
      expect(toSI('time', 'hr', 1)).toBe(3600);
    });
  });

  describe('convertUnits', () => {
    it('C to F', () => {
      expect(convertUnits('temperature', 100, 'C', 'F')).toBeCloseTo(212);
    });
    it('same unit returns same value', () => {
      expect(convertUnits('pressure', 100, 'Pa', 'Pa')).toBe(100);
    });
  });

  describe('unitKeysFor', () => {
    it('returns unit keys for temperature', () => {
      const keys = unitKeysFor('temperature');
      expect(keys).toContain('K');
      expect(keys).toContain('C');
      expect(keys).toContain('F');
      expect(keys).toContain('R');
    });
    it('returns empty for unknown quantity', () => {
      expect(unitKeysFor('bogus')).toEqual([]);
    });
  });

  describe('unitOptionsFor', () => {
    it('returns options with key, name, symbol', () => {
      const opts = unitOptionsFor('pressure');
      expect(opts.length).toBeGreaterThan(0);
      expect(opts[0]).toHaveProperty('key');
      expect(opts[0]).toHaveProperty('name');
      expect(opts[0]).toHaveProperty('symbol');
    });
  });

  describe('error handling', () => {
    it('throws on unknown quantity', () => {
      expect(() => toSI('bogus', 'x', 1)).toThrow();
    });
    it('throws on unknown unit', () => {
      expect(() => toSI('temperature', 'bogus', 1)).toThrow();
    });
  });

  describe('round-trip every unit in every quantity', () => {
    for (const [quantity, units] of Object.entries(UNITS)) {
      for (const unit of Object.keys(units)) {
        it(`${quantity}/${unit} round-trips`, () => {
          // Use a non-trivial test value
          const testValue = 42.5;
          roundTrip(quantity, unit, testValue);
        });
      }
    }
  });
});
