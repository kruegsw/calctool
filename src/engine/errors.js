// Error types for property evaluation

export const ErrorType = Object.freeze({
  MISSING_INPUT: 'MISSING_INPUT',
  MISSING_CHEMICAL_DATA: 'MISSING_CHEMICAL_DATA',
  OUT_OF_RANGE: 'OUT_OF_RANGE',
  CYCLE_DETECTED: 'CYCLE_DETECTED',
  INVALID_METHOD: 'INVALID_METHOD',
  CALCULATION_ERROR: 'CALCULATION_ERROR',
  DEPENDENCY_ERROR: 'DEPENDENCY_ERROR',
  NO_DATA: 'NO_DATA',
});

export class PropertyError {
  constructor(type, message, propertyId) {
    this.type = type;
    this.message = message;
    this.propertyId = propertyId;
  }
}
