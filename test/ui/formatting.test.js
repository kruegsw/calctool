import { describe, it, expect } from 'vitest';
import { countSigFigs, roundToSigFigs } from '../../src/ui/formatting.js';

describe('countSigFigs', () => {
  const cases = [
    ['100', 3],
    ['100.0', 4],
    ['100.00', 5],
    ['0.001', 1],
    ['0.0010', 2],
    ['1', 1],
    ['10', 2],
    ['0', 1],
    ['0.0', 1],
    ['-45.6', 3],
    ['1.230', 4],
  ];

  for (const [input, expected] of cases) {
    it(`"${input}" → ${expected}`, () => {
      expect(countSigFigs(input)).toBe(expected);
    });
  }
});

describe('roundToSigFigs', () => {
  const cases = [
    [45.3592, 3, 45.4],
    [45.3592, 4, 45.36],
    [0.034623, 4, 0.03462],
    [2077.39, 3, 2080],
    [0, 3, 0],
  ];

  for (const [value, sf, expected] of cases) {
    it(`(${value}, ${sf}) → ${expected}`, () => {
      expect(roundToSigFigs(value, sf)).toBeCloseTo(expected, 10);
    });
  }
});
