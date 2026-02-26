// Async loader and search functions for chemical data

let chemicalsData = null;
let searchIndex = null; // Array of { cas, name, searchTerm }

/**
 * Load chemical database. Call once at startup.
 * @returns {Promise<Object>} The chemicals data keyed by CAS number
 */
export async function loadChemicals() {
  if (chemicalsData) return chemicalsData;

  const resp = await fetch(new URL('./chemicals.json', import.meta.url));
  chemicalsData = await resp.json();

  // Build search index
  searchIndex = Object.entries(chemicalsData).map(([cas, chem]) => ({
    cas,
    name: chem.name || '',
    searchTerm: chem.searchTerm || `${chem.name} [${cas}]`,
  }));

  return chemicalsData;
}

/**
 * Load chemicals synchronously from a pre-loaded object (for Node.js testing).
 */
export function loadChemicalsSync(data) {
  chemicalsData = data;
  searchIndex = Object.entries(data).map(([cas, chem]) => ({
    cas,
    name: chem.name || '',
    searchTerm: chem.searchTerm || `${chem.name} [${cas}]`,
  }));
}

/**
 * Get chemical data by CAS number.
 * @param {string} cas
 * @returns {Object|null}
 */
export function getChemicalByCAS(cas) {
  if (!chemicalsData) return null;
  return chemicalsData[cas] || null;
}

/**
 * Search chemicals by name or CAS fragment.
 * Returns up to `limit` matches sorted by relevance.
 * @param {string} query
 * @param {number} [limit=20]
 * @returns {Array<{cas: string, name: string, searchTerm: string}>}
 */
export function searchChemicals(query, limit = 20) {
  if (!searchIndex || !query) return [];

  const q = query.toLowerCase().trim();
  const results = [];

  for (const entry of searchIndex) {
    const nameMatch = entry.name.toLowerCase().includes(q);
    const casMatch = entry.cas.includes(q);
    const termMatch = entry.searchTerm.toLowerCase().includes(q);

    if (nameMatch || casMatch || termMatch) {
      // Prioritize exact name starts
      const priority = entry.name.toLowerCase().startsWith(q) ? 0
        : nameMatch ? 1
        : casMatch ? 2
        : 3;
      results.push({ ...entry, priority });
    }
  }

  results.sort((a, b) => a.priority - b.priority || a.name.localeCompare(b.name));
  return results.slice(0, limit).map(({ priority, ...rest }) => rest);
}

/**
 * Get all chemicals as a flat list for dropdown population.
 * @returns {Array<{cas: string, name: string, searchTerm: string}>}
 */
export function getAllChemicals() {
  if (!searchIndex) return [];
  return [...searchIndex].sort((a, b) => a.name.localeCompare(b.name));
}
