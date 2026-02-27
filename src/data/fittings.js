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
