// Number formatting utilities

/**
 * Format a number to N significant figures.
 * @param {*} value
 * @param {number} [sigFigs=4]
 * @returns {string}
 */
export function formatNumber(value, sigFigs = 4) {
  if (value == null || value === '') return '';
  if (typeof value === 'string' && isNaN(+value)) return value;

  const num = +value;
  if (!isFinite(num)) return String(value);
  if (num === 0) return '0';

  // Use toPrecision for significant figures
  const formatted = num.toPrecision(sigFigs);

  // Remove trailing zeros after decimal point, but keep at least one digit
  if (formatted.includes('.')) {
    return formatted.replace(/\.?0+$/, '') || '0';
  }
  return formatted;
}

/**
 * Count significant figures in a numeric string.
 * Rules: leading zeros are not significant, trailing zeros are significant
 * (engineering convention), zeros between non-zero digits are significant.
 * @param {string} str - A numeric string (may include sign, decimal point)
 * @returns {number} Number of significant figures
 */
export function countSigFigs(str) {
  const s = String(str).replace(/^-/, '');   // strip sign
  if (s === '0' || s === '0.0') return 1;

  // Find first significant digit (1-9)
  const match = s.match(/[1-9]/);
  if (!match) return 1;                      // e.g. "0.0" already handled

  // Count all digit chars from first significant digit to end
  const fromFirst = s.slice(match.index);
  return (fromFirst.match(/\d/g) || []).length;
}

/**
 * Round a number to N significant figures.
 * @param {number} value
 * @param {number} sigFigs
 * @returns {number}
 */
export function roundToSigFigs(value, sigFigs) {
  if (value === 0 || !isFinite(value) || sigFigs < 1) return value;
  const d = Math.ceil(Math.log10(Math.abs(value)));
  const power = sigFigs - d;
  const magnitude = 10 ** power;
  return Math.round(value * magnitude) / magnitude;
}

/**
 * Format a display value with its unit symbol.
 * @param {*} value
 * @param {string} [symbol]
 * @returns {string}
 */
export function formatWithUnit(value, symbol) {
  const formatted = formatNumber(value);
  if (!formatted || !symbol) return formatted;
  return `${formatted} ${symbol}`;
}

/**
 * Return a flow regime label based on Reynolds number.
 * @param {number} re - Reynolds number
 * @returns {{ label: string, type: string }} label text and type for CSS class
 */
export function flowRegimeLabel(re) {
  if (re == null || !isFinite(re)) return null;
  if (re < 2100) return { label: 'Laminar', type: 'laminar' };
  if (re < 4000) return { label: 'Transitional', type: 'transitional' };
  return { label: 'Turbulent', type: 'turbulent' };
}
