// Pipe data loader and lookup functions

let pipeMaterials = null;
let pipeDimensions = null;

/**
 * Load pipe data. Call once at startup.
 */
export async function loadPipeData() {
  if (pipeMaterials && pipeDimensions) {
    return { materials: pipeMaterials, dimensions: pipeDimensions };
  }

  const [matResp, dimResp] = await Promise.all([
    fetch(new URL('./pipe-materials.json', import.meta.url)),
    fetch(new URL('./pipe-dimensions.json', import.meta.url)),
  ]);

  pipeMaterials = await matResp.json();
  pipeDimensions = await dimResp.json();

  return { materials: pipeMaterials, dimensions: pipeDimensions };
}

/**
 * Load pipe data synchronously from pre-loaded objects (for testing).
 */
export function loadPipeDataSync(materials, dimensions) {
  pipeMaterials = materials;
  pipeDimensions = dimensions;
}

/**
 * Get the pipe data object (for passing to solver).
 */
export function getPipeData() {
  return { materials: pipeMaterials, dimensions: pipeDimensions };
}

/**
 * Get all material names for dropdown.
 * @returns {string[]}
 */
export function getMaterialNames() {
  if (!pipeMaterials) return [];
  return pipeMaterials.map(m => m.name);
}

/**
 * Get material by name.
 */
export function getMaterial(name) {
  if (!pipeMaterials) return null;
  return pipeMaterials.find(m => m.name === name) || null;
}

/**
 * Get unique pipe standards.
 * @returns {string[]}
 */
export function getPipeStandards() {
  if (!pipeDimensions) return [];
  return [...new Set(pipeDimensions.map(p => p.standard))];
}

/**
 * Get nominal diameters for a given pipe standard.
 * @param {string} standard
 * @returns {string[]}
 */
export function getNominalDiameters(standard) {
  if (!pipeDimensions) return [];
  return pipeDimensions
    .filter(p => p.standard === standard)
    .map(p => p.nominalDiameter);
}

/**
 * Get available schedules for a given standard + nominal diameter.
 * Returns only schedules that have wall thickness data.
 * @param {string} standard
 * @param {string} nominalDiameter
 * @returns {string[]}
 */
export function getSchedules(standard, nominalDiameter) {
  if (!pipeDimensions) return [];
  const entry = pipeDimensions.find(
    p => p.standard === standard && p.nominalDiameter === nominalDiameter
  );
  if (!entry) return [];

  return Object.entries(entry.wallThickness)
    .filter(([, thickness]) => thickness !== '')
    .sort(([, a], [, b]) => +a - +b)
    .map(([name]) => name);
}

/**
 * Get outer diameter for a given standard + nominal diameter.
 * @returns {number|null} OD in the pipe's native units (inches for NPS)
 */
export function getOuterDiameter(standard, nominalDiameter) {
  if (!pipeDimensions) return null;
  const entry = pipeDimensions.find(
    p => p.standard === standard && p.nominalDiameter === nominalDiameter
  );
  return entry ? +entry.outerDiameter : null;
}

/**
 * Get wall thickness for a given standard + nominal diameter + schedule.
 * @returns {number|null} Wall thickness in the pipe's native units
 */
export function getWallThickness(standard, nominalDiameter, schedule) {
  if (!pipeDimensions) return null;
  const entry = pipeDimensions.find(
    p => p.standard === standard && p.nominalDiameter === nominalDiameter
  );
  if (!entry) return null;
  const wt = entry.wallThickness[schedule];
  return wt ? +wt : null;
}
