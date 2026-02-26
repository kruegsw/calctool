// Progressive disclosure section definitions
// Each section groups related properties for the UI.

export const SECTIONS = [
  {
    id: 'fluid',
    title: 'What fluid?',
    primary: ['chemicalSearch'],
    detail: ['cas', 'chemicalName', 'chemicalFamily', 'molecularWeight',
             'criticalTemperature', 'criticalPressure', 'normalBoilingTemperature',
             'criticalMolarVolume', 'criticalCompressibilityFactor', 'acentricFactor'],
  },
  {
    id: 'conditions',
    title: 'At what conditions?',
    primary: ['temperature', 'pressure'],
    detail: ['phase', 'vaporPressure', 'density', 'viscosity',
             'cp', 'cv', 'cpCvRatio',
             'heatOfVaporization', 'thermalConductivity', 'sonicVelocity'],
  },
  {
    id: 'pipe',
    title: 'Through what pipe?',
    primary: ['pipeStandard', 'pipeNominalDiameter', 'pipeSchedule', 'pipeLength'],
    detail: ['pipeMaterial', 'pipeInnerDiameter', 'pipeCrossSectionalArea',
             'pipeHydraulicRadius', 'pipeAbsoluteRoughness'],
  },
  {
    id: 'flow',
    title: 'How much flow?',
    primary: ['massFlowRate'],
    detail: ['volumeFlowRate', 'velocity'],
  },
  {
    id: 'results',
    title: 'Results',
    primary: ['reynoldsNumber', 'frictionFactor', 'pressureDropPipe', 'pressureDropTotal'],
    detail: [],
  },
];
