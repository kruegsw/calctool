// Property class and type definitions

/**
 * @typedef {Object} PropertyDef
 * @property {string} id - Unique identifier
 * @property {string} name - Display name
 * @property {string} quantity - Unit quantity type (e.g., 'temperature', 'pressure')
 * @property {string} category - 'chemical-property' | 'chemical-condition' | 'system-property' | 'system-condition'
 * @property {string} defaultUnit - Default display unit key
 * @property {Object.<string, MethodDef>} methods - Available calculation methods
 * @property {*} [defaultValue] - Default user-input value (in defaultUnit)
 * @property {boolean} [isLookup] - True if value comes from chemical database
 * @property {boolean} [isUserInput] - True if value is directly entered by user
 * @property {boolean} [isSelection] - True if value is selected from a list (pipe standard, material, etc.)
 */

/**
 * @typedef {Object} MethodDef
 * @property {string} name - Display name
 * @property {string[]} inputs - Array of property IDs this method depends on
 * @property {Function} calculate - (inputValues, chemData, pipeData) => number|string
 *   inputValues: Object mapping property IDs to their SI values
 *   chemData: chemical data object for selected chemical
 *   pipeData: pipe data context
 *   Returns value in SI units
 * @property {string} [source] - Reference citation key
 */

/**
 * @typedef {Object} PropertyResult
 * @property {string} id - Property ID
 * @property {*} value - Calculated value in SI units
 * @property {*} displayValue - Value in user-selected display units
 * @property {string} unit - Display unit key
 * @property {string} method - Active method key
 * @property {boolean} isValid
 * @property {import('./errors.js').PropertyError|null} error
 * @property {string[]} dependencies - IDs of properties this depends on
 * @property {string[]} warnings - Advisory messages (e.g. extrapolation outside valid range)
 */

export function createPropertyResult(id, value, displayValue, unit, method, dependencies) {
  return {
    id,
    value,
    displayValue,
    unit,
    method,
    isValid: value !== null && value !== undefined && !Number.isNaN(value),
    error: null,
    dependencies,
    warnings: [],
  };
}

export function createErrorResult(id, error) {
  return {
    id,
    value: null,
    displayValue: null,
    unit: null,
    method: null,
    isValid: false,
    error,
    dependencies: [],
    warnings: [],
  };
}
