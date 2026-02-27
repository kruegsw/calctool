// Progressive disclosure section definitions
// Each section groups related properties for the UI.

export const SECTIONS = [
  {
    id: 'fluid',
    title: 'What fluid?',
    stepNumber: 1,
    accentColor: '#2563eb',  // blue
    primary: ['chemicalSearch'],
    detail: ['cas', 'chemicalName', 'chemicalFamily', 'molecularWeight',
             'criticalTemperature', 'criticalPressure', 'normalBoilingTemperature',
             'criticalMolarVolume', 'criticalCompressibilityFactor', 'acentricFactor'],
  },
  {
    id: 'conditions',
    title: 'At what conditions?',
    stepNumber: 2,
    accentColor: '#0d9488',  // teal
    primary: ['temperature', 'pressure'],
    detail: ['phase', 'vaporPressure', 'density', 'viscosity',
             'cp', 'cv', 'cpCvRatio',
             'heatOfVaporization', 'thermalConductivity', 'sonicVelocity',
             'prandtlNumber'],
  },
  {
    id: 'pipe',
    title: 'Through what pipe?',
    stepNumber: 3,
    accentColor: '#475569',  // slate
    primary: ['pipeStandard', 'pipeNominalDiameter', 'pipeSchedule', 'pipeLength', 'massFlowRate'],
    detail: ['pipeMaterial', 'pipeInnerDiameter',
             'pipeAbsoluteRoughness', 'totalKFactor', 'volumeFlowRate', 'velocity', 'machNumber'],
  },
  {
    id: 'results',
    title: 'Results',
    stepNumber: 4,
    accentColor: '#4f46e5',  // indigo
    primary: ['reynoldsNumber', 'frictionFactor', 'pressureDropTotal'],
    detail: ['fannoMaxLength'],
  },
];
