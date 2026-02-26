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
