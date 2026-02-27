// Fittings data loader and lookup functions

let fittingsData = null;

/**
 * Load fittings data. Call once at startup.
 */
export async function loadFittingsData() {
  if (fittingsData) return fittingsData;

  const resp = await fetch(new URL('./fittings.json', import.meta.url));
  fittingsData = await resp.json();
  return fittingsData;
}

/**
 * Load fittings data synchronously from pre-loaded array (for testing).
 */
export function loadFittingsDataSync(data) {
  fittingsData = data;
}

/**
 * Get all fittings.
 * @returns {Array}
 */
export function getAllFittings() {
  return fittingsData || [];
}

/**
 * Get fittings grouped by type.
 * @returns {Object} { type: [fitting, ...], ... }
 */
export function getFittingsByType() {
  if (!fittingsData) return {};
  const groups = {};
  for (const f of fittingsData) {
    if (!groups[f.type]) groups[f.type] = [];
    groups[f.type].push(f);
  }
  return groups;
}

/**
 * Get a single fitting by its id.
 * @param {string} id
 * @returns {Object|null}
 */
export function getFittingById(id) {
  if (!fittingsData) return null;
  return fittingsData.find(f => f.id === id) || null;
}

/**
 * Parse a nominal diameter string (e.g. "1/2", "1 1/4", "2", "10") to numeric inches.
 * Handles fractions, mixed numbers, and plain integers/decimals.
 * @param {string} str
 * @returns {number} Diameter in inches, or NaN if unparseable
 */
export function parseNominalDiameter(str) {
  if (str == null) return NaN;
  const s = String(str).trim();
  if (!s) return NaN;

  // Match "whole fraction" like "1 1/4" or just "3/4"
  const mixedMatch = s.match(/^(\d+)\s+(\d+)\/(\d+)$/);
  if (mixedMatch) {
    const whole = parseInt(mixedMatch[1], 10);
    const num = parseInt(mixedMatch[2], 10);
    const den = parseInt(mixedMatch[3], 10);
    return den === 0 ? NaN : whole + num / den;
  }

  const fracMatch = s.match(/^(\d+)\/(\d+)$/);
  if (fracMatch) {
    const num = parseInt(fracMatch[1], 10);
    const den = parseInt(fracMatch[2], 10);
    return den === 0 ? NaN : num / den;
  }

  // Plain number (integer or decimal)
  const val = parseFloat(s);
  return isFinite(val) ? val : NaN;
}
