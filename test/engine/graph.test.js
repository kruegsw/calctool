import { describe, it, expect } from 'vitest';
import { topologicalSort, wouldMethodCauseCycle, getDependencies, getTransitiveDependencies, getTransitiveDependents } from '../../src/engine/graph.js';

// Minimal registry for testing
function makeRegistry() {
  return {
    A: { methods: { calc: { inputs: [] } } },
    B: { methods: { calc: { inputs: ['A'] } } },
    C: { methods: { calc: { inputs: ['A'] } } },
    D: { methods: { calc: { inputs: ['B', 'C'] } } }, // diamond
    E: { methods: { calc: { inputs: ['D'] } } },
  };
}

function makeMethodMap() {
  return { A: null, B: 'calc', C: 'calc', D: 'calc', E: 'calc' };
}

describe('graph.js', () => {

  describe('topologicalSort', () => {
    it('sorts a simple chain', () => {
      const registry = {
        X: { methods: {} },
        Y: { methods: { calc: { inputs: ['X'] } } },
        Z: { methods: { calc: { inputs: ['Y'] } } },
      };
      const methods = { X: null, Y: 'calc', Z: 'calc' };
      const { sorted, hasCycle } = topologicalSort(registry, methods);

      expect(hasCycle).toBe(false);
      expect(sorted.indexOf('X')).toBeLessThan(sorted.indexOf('Y'));
      expect(sorted.indexOf('Y')).toBeLessThan(sorted.indexOf('Z'));
    });

    it('handles diamond dependencies', () => {
      const registry = makeRegistry();
      const methods = makeMethodMap();
      const { sorted, hasCycle } = topologicalSort(registry, methods);

      expect(hasCycle).toBe(false);
      expect(sorted.indexOf('A')).toBeLessThan(sorted.indexOf('B'));
      expect(sorted.indexOf('A')).toBeLessThan(sorted.indexOf('C'));
      expect(sorted.indexOf('B')).toBeLessThan(sorted.indexOf('D'));
      expect(sorted.indexOf('C')).toBeLessThan(sorted.indexOf('D'));
      expect(sorted.indexOf('D')).toBeLessThan(sorted.indexOf('E'));
    });

    it('detects a direct cycle', () => {
      const registry = {
        A: { methods: { calc: { inputs: ['B'] } } },
        B: { methods: { calc: { inputs: ['A'] } } },
      };
      const methods = { A: 'calc', B: 'calc' };
      const { hasCycle, cycleNodes } = topologicalSort(registry, methods);

      expect(hasCycle).toBe(true);
      expect(cycleNodes).toContain('A');
      expect(cycleNodes).toContain('B');
    });

    it('detects an indirect cycle', () => {
      const registry = {
        A: { methods: { calc: { inputs: ['C'] } } },
        B: { methods: { calc: { inputs: ['A'] } } },
        C: { methods: { calc: { inputs: ['B'] } } },
      };
      const methods = { A: 'calc', B: 'calc', C: 'calc' };
      const { hasCycle, cycleNodes } = topologicalSort(registry, methods);

      expect(hasCycle).toBe(true);
      expect(cycleNodes.length).toBe(3);
    });

    it('handles all user-input nodes (no methods)', () => {
      const registry = {
        A: { methods: {} },
        B: { methods: {} },
      };
      const methods = { A: null, B: null };
      const { sorted, hasCycle } = topologicalSort(registry, methods);

      expect(hasCycle).toBe(false);
      expect(sorted.length).toBe(2);
    });

    it('handles empty registry', () => {
      const { sorted, hasCycle } = topologicalSort({}, {});
      expect(hasCycle).toBe(false);
      expect(sorted.length).toBe(0);
    });
  });

  describe('wouldMethodCauseCycle', () => {
    it('returns false for a valid method selection', () => {
      const registry = makeRegistry();
      const methods = makeMethodMap();
      expect(wouldMethodCauseCycle(registry, methods, 'B', 'calc')).toBe(false);
    });

    it('returns true when method would create a cycle', () => {
      const registry = {
        A: { methods: { calc: { inputs: ['B'] }, userInput: { inputs: [] } } },
        B: { methods: { calc: { inputs: ['A'] } } },
      };
      // Currently A is user-input (no cycle)
      const methods = { A: null, B: 'calc' };
      expect(wouldMethodCauseCycle(registry, methods, 'A', 'calc')).toBe(true);
    });

    it('returns false when switching to user input breaks a cycle potential', () => {
      const registry = {
        A: { methods: { calc: { inputs: ['B'] } } },
        B: { methods: { calc: { inputs: ['A'] } } },
      };
      const methods = { A: 'calc', B: 'calc' };
      // Switching A to null (user input) should break the cycle
      expect(wouldMethodCauseCycle(registry, methods, 'A', null)).toBe(false);
    });
  });

  describe('getDependencies', () => {
    it('returns inputs for active method', () => {
      const registry = makeRegistry();
      const methods = makeMethodMap();
      expect(getDependencies(registry, 'D', methods)).toEqual(['B', 'C']);
    });

    it('returns empty for user-input properties', () => {
      const registry = makeRegistry();
      const methods = makeMethodMap();
      expect(getDependencies(registry, 'A', methods)).toEqual([]);
    });
  });

  describe('getTransitiveDependencies', () => {
    it('returns all upstream dependencies', () => {
      const registry = makeRegistry();
      const methods = makeMethodMap();
      const deps = getTransitiveDependencies(registry, 'E', methods);
      expect(deps).toContain('A');
      expect(deps).toContain('B');
      expect(deps).toContain('C');
      expect(deps).toContain('D');
      expect(deps).not.toContain('E');
    });

    it('returns empty for a root node', () => {
      const registry = makeRegistry();
      const methods = makeMethodMap();
      expect(getTransitiveDependencies(registry, 'A', methods)).toEqual([]);
    });
  });

  describe('getTransitiveDependents', () => {
    it('returns all downstream dependents', () => {
      const registry = makeRegistry();
      const methods = makeMethodMap();
      const deps = getTransitiveDependents(registry, 'A', methods);
      expect(deps).toContain('B');
      expect(deps).toContain('C');
      expect(deps).toContain('D');
      expect(deps).toContain('E');
      expect(deps).not.toContain('A');
    });
  });
});
