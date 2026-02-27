// Units registry with toSI/fromSI conversion functions
// Base SI units for each quantity type.
// Every convertToBaseUnits/convertFromBaseUnits is a pure function: number -> number.

const FT_PER_M = 3.2808398950131235;
const LB_PER_KG = 2.2046226218487758;

export const UNITS = {
  temperature: {
    'K':  { name: 'kelvin',     symbol: 'K',  toSI: v => +v,                          fromSI: v => +v },
    'C':  { name: 'celsius',    symbol: '°C', toSI: v => +v + 273.15,                 fromSI: v => +v - 273.15 },
    'F':  { name: 'fahrenheit', symbol: '°F', toSI: v => (+v - 32) * 5/9 + 273.15,    fromSI: v => (+v - 273.15) * 9/5 + 32 },
    'R':  { name: 'rankine',    symbol: '°R', toSI: v => +v * 5/9,                     fromSI: v => +v * 9/5 },
  },

  pressure: {
    'Pa':     { name: 'pascal',                symbol: 'Pa',    toSI: v => +v,                          fromSI: v => +v },
    'kPa':    { name: 'kilopascal',            symbol: 'kPa',   toSI: v => +v * 1000,                   fromSI: v => +v / 1000 },
    'MPa':    { name: 'megapascal',            symbol: 'MPa',   toSI: v => +v * 1e6,                    fromSI: v => +v * 1e-6 },
    'psia':   { name: 'psi absolute',          symbol: 'psia',  toSI: v => +v * 6894.757293,            fromSI: v => +v / 6894.757293 },
    'psig':   { name: 'psi gauge',             symbol: 'psig',  toSI: v => +v * 6894.757293 + 101325,   fromSI: v => (+v - 101325) / 6894.757293 },
    'bar':    { name: 'bar',                   symbol: 'bar',   toSI: v => +v * 1e5,                    fromSI: v => +v * 1e-5 },
    'atm':    { name: 'atmosphere',            symbol: 'atm',   toSI: v => +v * 101325,                 fromSI: v => +v / 101325 },
    'inH2O':  { name: 'inches of water',       symbol: 'inH₂O', toSI: v => +v * 248.84,                 fromSI: v => +v / 248.84 },
    'inHg':   { name: 'inches of mercury',     symbol: 'inHg',  toSI: v => +v * 3386.38866667,          fromSI: v => +v / 3386.38866667 },
  },

  pressureDifference: {
    'Pa':    { name: 'pascal',              symbol: 'Pa',     toSI: v => +v,                  fromSI: v => +v },
    'kPa':   { name: 'kilopascal',          symbol: 'kPa',    toSI: v => +v * 1000,           fromSI: v => +v / 1000 },
    'psi':   { name: 'psi',                 symbol: 'psi',    toSI: v => +v * 6894.757293,    fromSI: v => +v / 6894.757293 },
    'bar':   { name: 'bar',                 symbol: 'bar',    toSI: v => +v * 1e5,            fromSI: v => +v * 1e-5 },
    'atm':   { name: 'atmosphere',          symbol: 'atm',    toSI: v => +v * 101325,         fromSI: v => +v / 101325 },
    'inH2O': { name: 'inches of water',     symbol: 'inH₂O',  toSI: v => +v * 248.84,         fromSI: v => +v / 248.84 },
    'inHg':  { name: 'inches of mercury',   symbol: 'inHg',   toSI: v => +v * 3386.38866667,  fromSI: v => +v / 3386.38866667 },
  },

  length: {
    'm':      { name: 'meter',         symbol: 'm',     toSI: v => +v,                         fromSI: v => +v },
    'mm':     { name: 'millimeter',    symbol: 'mm',    toSI: v => +v / 1000,                   fromSI: v => +v * 1000 },
    'cm':     { name: 'centimeter',    symbol: 'cm',    toSI: v => +v / 100,                    fromSI: v => +v * 100 },
    'km':     { name: 'kilometer',     symbol: 'km',    toSI: v => +v * 1000,                   fromSI: v => +v / 1000 },
    'ft':     { name: 'foot',          symbol: 'ft',    toSI: v => +v / FT_PER_M,               fromSI: v => +v * FT_PER_M },
    'in':     { name: 'inch',          symbol: 'in',    toSI: v => +v / (FT_PER_M * 12),        fromSI: v => +v * FT_PER_M * 12 },
    'mil':    { name: 'mil (thou)',    symbol: 'mil',   toSI: v => +v / (FT_PER_M * 12000),     fromSI: v => +v * FT_PER_M * 12000 },
    'yd':     { name: 'yard',          symbol: 'yd',    toSI: v => +v * 0.9144,                 fromSI: v => +v / 0.9144 },
    'mi':     { name: 'mile',          symbol: 'mi',    toSI: v => +v * 1609.344,               fromSI: v => +v / 1609.344 },
    'naut mi':{ name: 'nautical mile', symbol: 'nmi',   toSI: v => +v * 1852,                   fromSI: v => +v / 1852 },
    'fathom': { name: 'fathom',        symbol: 'fathom',toSI: v => +v * 1.8288,                 fromSI: v => +v / 1.8288 },
  },

  mass: {
    'kg':         { name: 'kilogram',    symbol: 'kg',   toSI: v => +v,                              fromSI: v => +v },
    'lb':         { name: 'pound',       symbol: 'lb',   toSI: v => +v / LB_PER_KG,                   fromSI: v => +v * LB_PER_KG },
    'g':          { name: 'gram',        symbol: 'g',    toSI: v => +v / 1000,                        fromSI: v => +v * 1000 },
    'metric ton': { name: 'metric ton',  symbol: 'MT',   toSI: v => +v * 1000,                        fromSI: v => +v / 1000 },
    'slug':       { name: 'slug',        symbol: 'slug', toSI: v => +v / LB_PER_KG * 32.174,          fromSI: v => +v * LB_PER_KG / 32.174 },
  },

  area: {
    'm2':  { name: 'square meter',  symbol: 'm²',  toSI: v => +v,                              fromSI: v => +v },
    'ft2': { name: 'square foot',   symbol: 'ft²', toSI: v => +v / (FT_PER_M ** 2),             fromSI: v => +v * (FT_PER_M ** 2) },
    'in2': { name: 'square inch',   symbol: 'in²', toSI: v => +v / ((FT_PER_M * 12) ** 2),      fromSI: v => +v * ((FT_PER_M * 12) ** 2) },
  },

  volume: {
    'm3':  { name: 'cubic meter',     symbol: 'm³',  toSI: v => +v,                              fromSI: v => +v },
    'cm3': { name: 'cubic centimeter', symbol: 'cm³', toSI: v => +v * 1e-6,                       fromSI: v => +v * 1e6 },
    'l':   { name: 'liter',           symbol: 'L',   toSI: v => +v / 1000,                       fromSI: v => +v * 1000 },
    'gal': { name: 'US gallon',       symbol: 'gal', toSI: v => +v / 264.1720523581489,          fromSI: v => +v * 264.1720523581489 },
    'ft3': { name: 'cubic foot',      symbol: 'ft³', toSI: v => +v / (FT_PER_M ** 3),            fromSI: v => +v * (FT_PER_M ** 3) },
    'in3': { name: 'cubic inch',      symbol: 'in³', toSI: v => +v / ((FT_PER_M * 12) ** 3),     fromSI: v => +v * ((FT_PER_M * 12) ** 3) },
  },

  velocity: {
    'm/s':  { name: 'meter per second', symbol: 'm/s',  toSI: v => +v,                                          fromSI: v => +v },
    'ft/s': { name: 'foot per second',  symbol: 'ft/s', toSI: v => +v / FT_PER_M,                                fromSI: v => +v * FT_PER_M },
    'mph':  { name: 'mile per hour',    symbol: 'mph',  toSI: v => +v * 1609.344 / 3600,                         fromSI: v => +v * 3600 / 1609.344 },
  },

  massRate: {
    'kg/hr': { name: 'kilogram per hour', symbol: 'kg/hr', toSI: v => +v,                  fromSI: v => +v },
    'kg/s':  { name: 'kilogram per second',symbol: 'kg/s', toSI: v => +v * 3600,           fromSI: v => +v / 3600 },
    'lb/hr': { name: 'pound per hour',     symbol: 'lb/hr',toSI: v => +v / LB_PER_KG,      fromSI: v => +v * LB_PER_KG },
    'SCFH':  { name: 'std ft³/hr (air, STP)',  symbol: 'SCFH', toSI: v => +v * 0.034623,  fromSI: v => +v / 0.034623 },
    'SCFM':  { name: 'std ft³/min (air, STP)', symbol: 'SCFM', toSI: v => +v * 2.07739,   fromSI: v => +v / 2.07739 },
  },

  volumeRate: {
    'm3/s':  { name: 'cubic meter per second', symbol: 'm³/s',   toSI: v => +v,                                          fromSI: v => +v },
    'm3/min':{ name: 'cubic meter per minute', symbol: 'm³/min', toSI: v => +v / 60,                                      fromSI: v => +v * 60 },
    'm3/h':  { name: 'cubic meter per hour',   symbol: 'm³/hr',  toSI: v => +v / 3600,                                    fromSI: v => +v * 3600 },
    'ft3/s': { name: 'cubic foot per second',  symbol: 'ft³/s',  toSI: v => +v / (FT_PER_M ** 3),                          fromSI: v => +v * (FT_PER_M ** 3) },
    'ft3/min':{ name: 'cubic foot per minute', symbol: 'ft³/min',toSI: v => +v / (FT_PER_M ** 3) / 60,                     fromSI: v => +v * (FT_PER_M ** 3) * 60 },
    'ft3/h': { name: 'cubic foot per hour',    symbol: 'ft³/hr', toSI: v => +v / (FT_PER_M ** 3) / 3600,                   fromSI: v => +v * (FT_PER_M ** 3) * 3600 },
    'gpm':   { name: 'US gallon per minute',   symbol: 'gpm',    toSI: v => +v / (FT_PER_M ** 3) / 60 * 0.133680556,       fromSI: v => +v * (FT_PER_M ** 3) * 60 / 0.133680556 },
  },

  concentrationMass: {
    'kg/m3':  { name: 'kilogram per cubic meter',    symbol: 'kg/m³',  toSI: v => +v,                                                        fromSI: v => +v },
    'g/m3':   { name: 'gram per cubic meter',        symbol: 'g/m³',   toSI: v => +v / 1000,                                                  fromSI: v => +v * 1000 },
    'g/dm3':  { name: 'gram per liter',              symbol: 'g/L',    toSI: v => +v,                                                         fromSI: v => +v },
    'lb/ft3': { name: 'pound per cubic foot',        symbol: 'lb/ft³', toSI: v => +v / LB_PER_KG * (FT_PER_M ** 3),                            fromSI: v => +v * LB_PER_KG / (FT_PER_M ** 3) },
    'lb/gal': { name: 'pound per US gallon',         symbol: 'lb/gal', toSI: v => +v / 0.133680556 / LB_PER_KG * (FT_PER_M ** 3),              fromSI: v => +v * 0.133680556 * LB_PER_KG / (FT_PER_M ** 3) },
  },

  viscosityDynamic: {
    'Pa*s':       { name: 'pascal-second',       symbol: 'Pa·s', toSI: v => +v,          fromSI: v => +v },
    'poise':      { name: 'poise',               symbol: 'P',    toSI: v => +v * 0.1,    fromSI: v => +v * 10 },
    'centipoise': { name: 'centipoise',          symbol: 'cP',   toSI: v => +v * 0.001,  fromSI: v => +v * 1000 },
    'mPa-s':      { name: 'millipascal-second',  symbol: 'mPa·s',toSI: v => +v * 0.001,  fromSI: v => +v * 1000 },
  },

  specificHeatCapacity: {
    'J/kg/K':  { name: 'joule per kilogram-kelvin',  symbol: 'J/(kg·K)',   toSI: v => +v,                                                              fromSI: v => +v },
    'BTU/lb/F':{ name: 'BTU per pound-fahrenheit',    symbol: 'BTU/(lb·°F)',toSI: v => +v * 1055.05585262 * LB_PER_KG * 9/5,                             fromSI: v => +v / 1055.05585262 / LB_PER_KG * 5/9 },
  },

  thermalConductivity: {
    'W/m/K': { name: 'watt per meter-kelvin', symbol: 'W/(m·K)', toSI: v => +v, fromSI: v => +v },
  },

  specificEnergy: {
    'J/kg':   { name: 'joule per kilogram',      symbol: 'J/kg',   toSI: v => +v,                                           fromSI: v => +v },
    'kJ/kg':  { name: 'kilojoule per kilogram',   symbol: 'kJ/kg',  toSI: v => +v * 1000,                                    fromSI: v => +v / 1000 },
    'BTU/lb': { name: 'BTU per pound',            symbol: 'BTU/lb', toSI: v => +v * 1055.05585262 * LB_PER_KG,                fromSI: v => +v / 1055.05585262 / LB_PER_KG },
  },

  molarVolume: {
    'm3/mol':  { name: 'cubic meter per mole',     symbol: 'm³/mol',  toSI: v => +v,         fromSI: v => +v },
    'm3/kmol': { name: 'cubic meter per kmole',    symbol: 'm³/kmol', toSI: v => +v / 1000,  fromSI: v => +v * 1000 },
    'cm3/mol': { name: 'cubic centimeter per mole',symbol: 'cm³/mol', toSI: v => +v * 1e-6,  fromSI: v => +v * 1e6 },
  },

  force: {
    'N':   { name: 'newton',       symbol: 'N',   toSI: v => +v,                fromSI: v => +v },
    'lbf': { name: 'pound force',  symbol: 'lbf', toSI: v => +v * 4.448222,    fromSI: v => +v / 4.448222 },
    'dyne':{ name: 'dyne',         symbol: 'dyn', toSI: v => +v * 1e-5,        fromSI: v => +v * 1e5 },
  },

  time: {
    's':   { name: 'second', symbol: 's',   toSI: v => +v,          fromSI: v => +v },
    'min': { name: 'minute', symbol: 'min', toSI: v => +v * 60,     fromSI: v => +v / 60 },
    'hr':  { name: 'hour',   symbol: 'hr',  toSI: v => +v * 3600,   fromSI: v => +v / 3600 },
  },
};

/**
 * Convert a value from one unit to SI base units for a given quantity.
 * @param {string} quantity - The quantity type (e.g., 'temperature')
 * @param {string} unit - The unit key (e.g., 'C')
 * @param {number} value - The value to convert
 * @returns {number} Value in SI base units
 */
export function toSI(quantity, unit, value) {
  const q = UNITS[quantity];
  if (!q) throw new Error(`Unknown quantity: ${quantity}`);
  const u = q[unit];
  if (!u) throw new Error(`Unknown unit "${unit}" for quantity "${quantity}"`);
  return u.toSI(value);
}

/**
 * Convert a value from SI base units to a display unit.
 */
export function fromSI(quantity, unit, value) {
  const q = UNITS[quantity];
  if (!q) throw new Error(`Unknown quantity: ${quantity}`);
  const u = q[unit];
  if (!u) throw new Error(`Unknown unit "${unit}" for quantity "${quantity}"`);
  return u.fromSI(value);
}

/**
 * Convert a value directly between two units of the same quantity.
 */
export function convertUnits(quantity, value, fromUnit, toUnit) {
  if (fromUnit === toUnit) return +value;
  const si = toSI(quantity, fromUnit, value);
  return fromSI(quantity, toUnit, si);
}

/**
 * Get array of unit keys for a given quantity (for dropdown menus).
 */
export function unitKeysFor(quantity) {
  const q = UNITS[quantity];
  return q ? Object.keys(q) : [];
}

/**
 * Get unit display info for a quantity.
 * @returns {Array<{key: string, name: string, symbol: string}>}
 */
export function unitOptionsFor(quantity) {
  const q = UNITS[quantity];
  if (!q) return [];
  return Object.entries(q).map(([key, u]) => ({ key, name: u.name, symbol: u.symbol }));
}

/**
 * Map of unit keys that should only appear when a specific chemical (CAS) is selected.
 * Structure: { quantityKey: { unitKey: requiredCAS } }
 */
export const CONDITIONAL_UNITS = {
  massRate: { 'SCFH': '132259-10-0', 'SCFM': '132259-10-0' },
};

/**
 * Get filtered unit options for a quantity, excluding conditional units
 * whose required CAS doesn't match the given CAS.
 * @param {string} quantity
 * @param {string} [cas] - Currently selected chemical CAS number
 * @returns {Array<{key: string, name: string, symbol: string}>}
 */
export function filteredUnitOptionsFor(quantity, cas) {
  const all = unitOptionsFor(quantity);
  const conditions = CONDITIONAL_UNITS[quantity];
  if (!conditions) return all;
  return all.filter(opt => {
    const requiredCas = conditions[opt.key];
    if (!requiredCas) return true; // unconditional unit
    return cas === requiredCas;
  });
}
