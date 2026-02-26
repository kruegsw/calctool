import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';
import { resolve } from 'path';

const chemPath = resolve('src/data/chemicals.json');
const pipeDimPath = resolve('src/data/pipe-dimensions.json');
const pipeMatPath = resolve('src/data/pipe-materials.json');
const sourcesPath = resolve('src/data/sources.json');

describe('chemicals.json integrity', () => {
  const data = JSON.parse(readFileSync(chemPath, 'utf8'));
  const keys = Object.keys(data);

  it('has 365 chemicals', () => {
    expect(keys.length).toBe(365);
  });

  it('every entry has a cas and name', () => {
    for (const [cas, chem] of Object.entries(data)) {
      expect(cas).toBeTruthy();
      expect(chem.name).toBeTruthy();
    }
  });

  it('water (7732-18-15) has expected properties', () => {
    // Note: original data.js uses CAS 7732-18-15 for water
    const water = data['7732-18-15'];
    expect(water).toBeDefined();
    expect(water.name).toBe('water');
    expect(+water.molecularWeight.value).toBeCloseTo(18.015, 2);
    expect(+water.criticalTemperature.value).toBeCloseTo(647.096, 1);
  });

  it('every chemical with molecularWeight has a numeric value', () => {
    for (const chem of Object.values(data)) {
      if (chem.molecularWeight?.value) {
        expect(+chem.molecularWeight.value).toBeGreaterThan(0);
      }
    }
  });

  it('Perry correlations have required fields', () => {
    let checked = 0;
    for (const chem of Object.values(data)) {
      const phases = ['gaseous', 'liquid'];
      for (const phase of phases) {
        const emp = chem.empirical?.[phase];
        if (!emp) continue;
        for (const [prop, data] of Object.entries(emp)) {
          const corr = data?.perryCorrelation;
          if (!corr) continue;
          // Must have C1 at minimum
          expect(corr).toHaveProperty('C1');
          checked++;
        }
      }
    }
    // Should have checked a substantial number
    expect(checked).toBeGreaterThan(500);
  });
});

describe('pipe-dimensions.json integrity', () => {
  const data = JSON.parse(readFileSync(pipeDimPath, 'utf8'));

  it('has 139 pipe entries', () => {
    expect(data.length).toBe(139);
  });

  it('each entry has standard, outerDiameter, wallThickness', () => {
    for (const pipe of data) {
      expect(pipe.standard).toBeTruthy();
      expect(pipe.outerDiameter).toBeTruthy();
      expect(pipe.wallThickness).toBeDefined();
    }
  });

  it('most entries have nominalDiameter (2 DN entries may be empty)', () => {
    const empty = data.filter(p => !p.nominalDiameter);
    expect(empty.length).toBeLessThanOrEqual(2);
  });

  it('2" NPS Sch. 40 has OD=2.375, WT=0.154', () => {
    const pipe = data.find(p => p.standard === 'NPS' && p.nominalDiameter === '2');
    expect(pipe).toBeDefined();
    expect(pipe.outerDiameter).toBe('2.375');
    expect(pipe.wallThickness['Sch. 40']).toBe('0.154');
  });
});

describe('pipe-materials.json integrity', () => {
  const data = JSON.parse(readFileSync(pipeMatPath, 'utf8'));

  it('has 12 materials', () => {
    expect(data.length).toBe(12);
  });

  it('each material has name and roughness', () => {
    for (const mat of data) {
      expect(mat.name).toBeTruthy();
      expect(typeof mat.roughness).toBe('number');
      expect(mat.roughness).toBeGreaterThan(0);
    }
  });

  it('commercial steel roughness is 0.00015 m', () => {
    const steel = data.find(m => m.name.includes('Commercial Steel'));
    expect(steel.roughness).toBe(0.00015);
  });
});

describe('sources.json integrity', () => {
  const data = JSON.parse(readFileSync(sourcesPath, 'utf8'));

  it('has expected source keys', () => {
    expect(data).toHaveProperty('perry');
    expect(data).toHaveProperty('crane');
    expect(data).toHaveProperty('moody');
    expect(data).toHaveProperty('churchill1977');
  });

  it('each source has a reference string', () => {
    for (const src of Object.values(data)) {
      expect(typeof src.reference).toBe('string');
      expect(src.reference.length).toBeGreaterThan(10);
    }
  });
});
