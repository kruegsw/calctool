// Property registry: all property definitions with pure calculate() functions
// All calculate() functions receive SI inputs, return SI outputs.
//
// SI base units:
//   temperature: K
//   pressure: Pa (absolute)
//   length: m
//   mass: kg
//   time: s
//   density: kg/m3
//   viscosity: Pa*s
//   massRate: kg/hr
//   volumeRate: m3/s
//   velocity: m/s
//   area: m2
//   specificHeatCapacity: J/(kg*K)
//   thermalConductivity: W/(m*K)
//   specificEnergy: J/kg
//   molarVolume: m3/mol

import { R_GAS } from './constants.js';

// ---------------------------------------------------------------------------
// Perry correlation evaluation helpers
// ---------------------------------------------------------------------------

/**
 * Evaluate a Perry empirical correlation given equation type and coefficients.
 * @param {number} equation - Equation type code (100, 101, 102, 105, 106, etc.)
 * @param {Object} coeffs - { C1, C2, C3, C4, C5, C6, C7 }
 * @param {number} T - Temperature in K
 * @returns {number} Result in the correlation's native units
 */
function evalPerry(equation, coeffs, T) {
  const { C1, C2, C3, C4, C5, C6, C7 } = coeffs;
  switch (equation) {
    case 100:
      // polynomial: C1 + C2*T + C3*T^2 + C4*T^3 + C5*T^4
      return C1 + C2*T + C3*T*T + C4*T*T*T + C5*T*T*T*T;
    case 101:
      // exp(C1 + C2/T + C3*ln(T) + C4*T^C5)
      return Math.exp(C1 + C2/T + C3*Math.log(T) + C4*Math.pow(T, C5));
    case 102:
      // C1*T^C2 / (1 + C3/T + C4/T^2)
      return C1 * Math.pow(T, C2) / (1 + C3/T + C4/(T*T));
    case 105:
      // C1 / C2^(1 + (1-T/C3)^C4) -- Rackett-type liquid density
      return C1 / Math.pow(C2, 1 + Math.pow(1 - T/C3, C4));
    case 106:
      // C1 * (1-Tr)^(C2 + C3*Tr + C4*Tr^2) where Tr = T/Tc (Tc is encoded in C5 or passed separately)
      // For heat of vaporization: C1 * tau^(C2 + C3*Tr + C4*Tr^2), Tc in coefficients context
      // We handle this specially in the property that uses it
      return null;
    case 107: {
      // Aly-Lee (DIPPR): C1 + C2*(C3/T/sinh(C3/T))^2 + C4*(C5/T/cosh(C5/T))^2
      const x = C3 / T;
      const y = C5 / T;
      return C1 + C2 * Math.pow(x / Math.sinh(x), 2) + C4 * Math.pow(y / Math.cosh(y), 2);
    }
    default:
      return null;
  }
}

/**
 * Get Perry correlation validity range for a given property.
 * @param {Object} chemData - Chemical data object
 * @param {string} phase - 'gaseous' or 'liquid'
 * @param {string} property - e.g., 'density', 'viscosity', 'vaporPressure'
 * @returns {{ Tmin: number, Tmax: number }|null}
 */
export function getPerryRange(chemData, phase, property) {
  const corr = getPerryCorrelation(chemData, phase, property);
  if (!corr) return null;
  if (corr.Tmin == null && corr.Tmax == null) return null;
  return { Tmin: corr.Tmin, Tmax: corr.Tmax };
}

/**
 * Extract a numeric value from a data field.
 * Data fields may be plain numbers, strings, or {value, source} objects.
 */
function val(field) {
  if (field == null) return 0;
  if (typeof field === 'object' && 'value' in field) {
    const v = field.value;
    return (v === '' || v == null) ? 0 : +v;
  }
  return (field === '' || field == null) ? 0 : +field;
}

/**
 * Get Perry correlation coefficients from chemical data.
 * Normalizes the {value, source} structure to flat numbers.
 * @param {Object} chemData - Chemical data object
 * @param {string} phase - 'gaseous' or 'liquid'
 * @param {string} property - e.g., 'density', 'viscosity', 'vaporPressure'
 * @returns {Object|null} Normalized object with equation, C1-C7, Tmin, Tmax as numbers
 */
function getPerryCorrelation(chemData, phase, property) {
  try {
    const raw = chemData.empirical[phase][property].perryCorrelation;
    if (!raw) return null;
    return {
      equation: val(raw.equation),
      C1: val(raw.C1),
      C2: val(raw.C2),
      C3: val(raw.C3),
      C4: val(raw.C4),
      C5: val(raw.C5),
      C6: val(raw.C6),
      C7: val(raw.C7),
      Tmin: val(raw.Tmin),
      Tmax: val(raw.Tmax),
    };
  } catch {
    return null;
  }
}

/**
 * Get Sutherland coefficients from chemical data.
 * Returns null if data is empty/missing.
 */
function getSutherlandCoeffs(chemData) {
  try {
    const raw = chemData.empirical.gaseous.viscosity.sutherland;
    if (!raw) return null;
    const T_o = val(raw.T_o);
    const mu_o = val(raw.mu_o);
    const S = val(raw.S_mu);
    if (!T_o || !mu_o) return null;
    return { referenceTemperature: T_o, referenceViscosity: mu_o, sutherlandConstant: S };
  } catch {
    return null;
  }
}


// ---------------------------------------------------------------------------
// Registry
// ---------------------------------------------------------------------------

export const REGISTRY = {

  // =========================================================================
  // CHEMICAL PROPERTIES (looked up from database)
  // =========================================================================

  chemicalSearch: {
    id: 'chemicalSearch',
    name: 'Chemical',
    quantity: null,
    category: 'chemical-property',
    defaultUnit: null,
    defaultValue: '132259-10-0',
    isUserInput: true,
    isSelection: true,
    methods: {},
  },

  cas: {
    id: 'cas',
    name: 'CAS Number',
    quantity: null,
    category: 'chemical-property',
    defaultUnit: null,
    isLookup: true,
    methods: {
      lookup: {
        name: 'Database lookup',
        inputs: [],
        source: 'perry',
        calculate: (inputs, chemData) => chemData?.cas || null,
      },
    },
  },

  chemicalName: {
    id: 'chemicalName',
    name: 'Chemical Name',
    quantity: null,
    category: 'chemical-property',
    defaultUnit: null,
    isLookup: true,
    methods: {
      lookup: {
        name: 'Database lookup',
        inputs: [],
        source: 'perry',
        calculate: (inputs, chemData) => chemData?.name || null,
      },
    },
  },

  chemicalFamily: {
    id: 'chemicalFamily',
    name: 'Family',
    quantity: null,
    category: 'chemical-property',
    defaultUnit: null,
    isLookup: true,
    methods: {
      lookup: {
        name: 'Database lookup',
        inputs: [],
        source: 'perry',
        calculate: (inputs, chemData) => chemData?.family?.value || null,
      },
    },
  },

  molecularWeight: {
    id: 'molecularWeight',
    name: 'Molecular Weight',
    quantity: null, // dimensionless (g/mol)
    category: 'chemical-property',
    defaultUnit: null,
    isLookup: true,
    methods: {
      lookup: {
        name: 'Database lookup',
        inputs: [],
        source: 'perry',
        calculate: (inputs, chemData) => {
          const v = chemData?.molecularWeight?.value;
          return v ? +v : null;
        },
      },
    },
  },

  criticalTemperature: {
    id: 'criticalTemperature',
    name: 'Critical Temperature',
    quantity: 'temperature',
    category: 'chemical-property',
    defaultUnit: 'K',
    isLookup: true,
    methods: {
      lookup: {
        name: 'Database lookup',
        inputs: [],
        source: 'perry',
        calculate: (inputs, chemData) => {
          const v = chemData?.criticalTemperature?.value;
          return v ? +v : null; // stored in K
        },
      },
    },
  },

  criticalPressure: {
    id: 'criticalPressure',
    name: 'Critical Pressure',
    quantity: 'pressure',
    category: 'chemical-property',
    defaultUnit: 'Pa',
    isLookup: true,
    methods: {
      lookup: {
        name: 'Database lookup',
        inputs: [],
        source: 'perry',
        calculate: (inputs, chemData) => {
          const v = chemData?.criticalPressure?.value;
          return v ? +v * 1e6 : null; // stored in MPa -> Pa
        },
      },
    },
  },

  criticalMolarVolume: {
    id: 'criticalMolarVolume',
    name: 'Critical Molar Volume',
    quantity: 'molarVolume',
    category: 'chemical-property',
    defaultUnit: 'm3/kmol',
    isLookup: true,
    methods: {
      lookup: {
        name: 'Database lookup',
        inputs: [],
        source: 'perry',
        calculate: (inputs, chemData) => {
          const v = chemData?.criticalMolarVolume?.value;
          return v ? +v / 1000 : null; // stored in m3/kmol -> m3/mol
        },
      },
    },
  },

  criticalCompressibilityFactor: {
    id: 'criticalCompressibilityFactor',
    name: 'Critical Compressibility Factor (Zc)',
    quantity: null,
    category: 'chemical-property',
    defaultUnit: null,
    isLookup: true,
    methods: {
      lookup: {
        name: 'Database lookup',
        inputs: [],
        source: 'perry',
        calculate: (inputs, chemData) => {
          const v = chemData?.criticalCompressibilityFactorZc?.value;
          return v ? +v : null;
        },
      },
    },
  },

  acentricFactor: {
    id: 'acentricFactor',
    name: 'Acentric Factor',
    quantity: null,
    category: 'chemical-property',
    defaultUnit: null,
    isLookup: true,
    methods: {
      lookup: {
        name: 'Database lookup',
        inputs: [],
        source: 'perry',
        calculate: (inputs, chemData) => {
          const v = chemData?.acentricFactor?.value;
          return v ? +v : null;
        },
      },
    },
  },

  normalBoilingTemperature: {
    id: 'normalBoilingTemperature',
    name: 'Normal Boiling Point',
    quantity: 'temperature',
    category: 'chemical-property',
    defaultUnit: 'C',
    isLookup: true,
    methods: {
      lookup: {
        name: 'Database lookup',
        inputs: [],
        source: 'perry',
        calculate: (inputs, chemData) => {
          const v = chemData?.normalBoilingTemperature?.value;
          return v ? +v : null; // stored in K
        },
      },
    },
  },

  // =========================================================================
  // CHEMICAL CONDITIONS (temperature-dependent, calculated)
  // =========================================================================

  temperature: {
    id: 'temperature',
    name: 'Temperature',
    quantity: 'temperature',
    category: 'chemical-condition',
    defaultUnit: 'C',
    defaultValue: 25,
    isUserInput: true,
    methods: {},
  },

  pressure: {
    id: 'pressure',
    name: 'Pressure',
    quantity: 'pressure',
    category: 'chemical-condition',
    defaultUnit: 'psig',
    defaultValue: 0,
    isUserInput: true,
    methods: {},
  },

  vaporPressure: {
    id: 'vaporPressure',
    name: 'Vapor Pressure',
    quantity: 'pressure',
    category: 'chemical-condition',
    defaultUnit: 'Pa',
    allowUserOverride: true,
    methods: {
      perryCorrelation: {
        name: 'Perry correlation',
        inputs: ['temperature'],
        source: 'perry',
        description: 'Empirical correlation for saturation pressure vs. temperature',
        assumption: 'Pure component; valid within correlation temperature range',
        calculate: (inputs, chemData) => {
          const T = inputs.temperature; // K
          const corr = getPerryCorrelation(chemData, 'gaseous', 'vaporPressure');
          if (!corr) return null;
          // Perry vapor pressure: always equation 101 form
          // exp(C1 + C2/T + C3*ln(T) + C4*T^C5) => Pa
          return evalPerry(corr.equation || 101, corr, T);
        },
      },
    },
  },

  phase: {
    id: 'phase',
    name: 'Phase',
    quantity: null,
    category: 'chemical-condition',
    defaultUnit: null,
    methods: {
      basedOnVaporPressure: {
        name: 'Based on vapor pressure',
        inputs: ['vaporPressure', 'pressure', 'criticalPressure'],
        calculate: (inputs) => {
          const Pvap = inputs.vaporPressure;    // Pa
          const P = inputs.pressure;            // Pa
          const Pc = inputs.criticalPressure;   // Pa
          if (Pvap == null || P == null) return null;
          if (Pc != null && Pvap > Pc) return 'gas';
          if (Pvap > P) return 'vapor';
          return 'liquid';
        },
      },
    },
  },

  density: {
    id: 'density',
    name: 'Density',
    quantity: 'concentrationMass',
    category: 'chemical-condition',
    defaultUnit: 'kg/m3',
    allowUserOverride: true,
    methods: {
      idealGas: {
        name: 'Ideal Gas Law',
        inputs: ['temperature', 'pressure', 'molecularWeight'],
        source: 'crane',
        description: 'Gas density from PV = nRT (P\u00b7MW / R\u00b7T)',
        assumption: 'Ideal gas (Z = 1); accuracy decreases near critical point or at high pressure',
        calculate: (inputs) => {
          const T = inputs.temperature;       // K
          const P = inputs.pressure;          // Pa
          const MW = inputs.molecularWeight;  // g/mol
          // rho = P * MW / (R * T * 1000)
          // MW is g/mol, R is J/(mol*K), P is Pa -> rho in kg/m3
          return P * MW / (R_GAS * T * 1000);
        },
      },
      perryLiquidCorrelation: {
        name: 'Perry liquid correlation',
        inputs: ['temperature', 'molecularWeight', 'criticalTemperature'],
        source: 'perry',
        description: 'Empirical correlation for saturated liquid density',
        assumption: 'Incompressible liquid at saturation; pressure effects neglected',
        calculate: (inputs, chemData) => {
          const T = inputs.temperature;  // K
          const MW = inputs.molecularWeight;
          const Tc = inputs.criticalTemperature; // K
          const corr = getPerryCorrelation(chemData, 'liquid', 'density');
          if (!corr) return null;

          const eq = corr.equation;

          if (eq === 105) {
            // Rackett: C1 / C2^(1 + (1-T/C3)^C4)
            // Result is in kmol/m3 -> multiply by MW to get g/dm3 = kg/m3
            const density = corr.C1 / Math.pow(corr.C2, 1 + Math.pow(1 - T/corr.C3, corr.C4));
            return density * MW; // kg/m3
          } else {
            // Perry equation 2-119: tau-power series
            // density [mol/dm3] = C1 + C2*tau^(1/3) + C3*tau^(2/3) + C4*tau^(5/3)
            //                   + C5*tau^(16/3) + C6*tau^(46/3) + C7*tau^(110/3)
            // where tau = 1 - T/Tc
            const tau = 1 - T / Tc;
            const density = corr.C1 + corr.C2 * Math.pow(tau, 1/3) +
                            corr.C3 * Math.pow(tau, 2/3) + corr.C4 * Math.pow(tau, 5/3) +
                            corr.C5 * Math.pow(tau, 16/3) + corr.C6 * Math.pow(tau, 46/3) +
                            corr.C7 * Math.pow(tau, 110/3);
            // Result in mol/dm3 = mol/L, multiply by MW (g/mol) => g/L = g/dm3 = kg/m3
            return density * MW;
          }
        },
      },
    },
  },

  viscosity: {
    id: 'viscosity',
    name: 'Dynamic Viscosity',
    quantity: 'viscosityDynamic',
    category: 'chemical-condition',
    defaultUnit: 'centipoise',
    allowUserOverride: true,
    methods: {
      sutherland: {
        name: "Sutherland's Law",
        inputs: ['temperature'],
        source: 'crane',
        description: 'Three-parameter kinetic-theory model for gas viscosity',
        assumption: 'Dilute gas; not valid for liquids or high-pressure gases',
        calculate: (inputs, chemData) => {
          const T = inputs.temperature; // K
          const suth = getSutherlandCoeffs(chemData);
          if (!suth) return null;
          // Sutherland: mu = mu_o * ((T_o + S) / (T + S)) * (T/T_o)^(3/2)
          // Stored: T_o in K, mu_o in Pa*s, S in K
          const T_o = +suth.referenceTemperature;   // K
          const mu_o = +suth.referenceViscosity;     // Pa*s
          const S = +suth.sutherlandConstant;        // K
          return mu_o * ((T_o + S) / (T + S)) * Math.pow(T / T_o, 1.5);
        },
      },
      perryVaporCorrelation: {
        name: 'Perry vapor correlation',
        inputs: ['temperature'],
        source: 'perry',
        description: 'Empirical correlation for low-pressure gas viscosity',
        assumption: 'Dilute gas at low to moderate pressure',
        calculate: (inputs, chemData) => {
          const T = inputs.temperature; // K
          const corr = getPerryCorrelation(chemData, 'gaseous', 'viscosity');
          if (!corr) return null;
          // Always equation 102 form: C1*T^C2 / (1 + C3/T + C4/T^2) => Pa*s
          return evalPerry(corr.equation || 102, corr, T);
        },
      },
      perryLiquidCorrelation: {
        name: 'Perry liquid correlation',
        inputs: ['temperature'],
        source: 'perry',
        description: 'Empirical correlation for liquid viscosity',
        assumption: 'Saturated liquid; pressure effects neglected',
        calculate: (inputs, chemData) => {
          const T = inputs.temperature; // K
          const corr = getPerryCorrelation(chemData, 'liquid', 'viscosity');
          if (!corr) return null;
          // equation 101: exp(C1 + C2/T + C3*ln(T) + C4*T^C5) => Pa*s
          // equation 100: C1 + C2*T + C3*T^2 + C4*T^3 + C5*T^4 => Pa*s
          return evalPerry(corr.equation || 101, corr, T);
        },
      },
    },
  },

  cp: {
    id: 'cp',
    name: 'Heat Capacity (Cp)',
    quantity: 'specificHeatCapacity',
    category: 'chemical-condition',
    defaultUnit: 'J/kg/K',
    allowUserOverride: true,
    methods: {
      perryLiquidCorrelation: {
        name: 'Perry liquid Cp correlation',
        inputs: ['temperature', 'molecularWeight', 'criticalTemperature'],
        source: 'perry',
        description: 'Empirical correlation for liquid heat capacity',
        assumption: 'Saturated liquid; no pressure correction',
        calculate: (inputs, chemData) => {
          const T = inputs.temperature; // K
          const MW = inputs.molecularWeight;
          const Tc = inputs.criticalTemperature;
          const corr = getPerryCorrelation(chemData, 'liquid', 'cp');
          if (!corr) return null;

          const eq = corr.equation;
          let cpMolar; // J/(kmol*K)

          if (eq === 114) {
            // Perry Eq. 2-114
            const tau = 1 - T / Tc;
            const { C1, C2, C3, C4 } = corr;
            cpMolar = C1*C1/tau + C2 - 2*C1*C3*tau - C1*C4*tau*tau -
                      C3*C3*tau*tau*tau/3 - C3*C4*tau*tau*tau*tau/2 -
                      C4*C4*Math.pow(tau,5)/5;
          } else {
            // equation 100: C1 + C2*T + C3*T^2 + C4*T^3 + C5*T^4
            cpMolar = evalPerry(100, corr, T);
          }

          // Convert J/(kmol*K) to J/(kg*K)
          return cpMolar / MW;
        },
      },
      perryVaporCorrelation: {
        name: 'Perry vapor Cp correlation',
        inputs: ['temperature', 'molecularWeight'],
        source: 'perry',
        description: 'DIPPR Eq. 107 (Aly-Lee) for ideal-gas heat capacity',
        assumption: 'Ideal gas (Cp independent of pressure)',
        calculate: (inputs, chemData) => {
          const T = inputs.temperature; // K
          const MW = inputs.molecularWeight;
          const corr = getPerryCorrelation(chemData, 'gaseous', 'cp');
          if (!corr) return null;
          // equation 100: C1 + C2*T + C3*T^2 + C4*T^3 + C5*T^4 => J/(kmol*K)
          const cpMolar = evalPerry(corr.equation || 100, corr, T);
          return cpMolar / MW;
        },
      },
    },
  },

  cv: {
    id: 'cv',
    name: 'Heat Capacity (Cv)',
    quantity: 'specificHeatCapacity',
    category: 'chemical-condition',
    defaultUnit: 'J/kg/K',
    allowUserOverride: true,
    methods: {
      idealGas: {
        name: 'Ideal gas (Cv = Cp - R/MW)',
        inputs: ['cp', 'molecularWeight'],
        calculate: (inputs) => {
          const cpSpec = inputs.cp;           // J/(kg*K)
          const MW = inputs.molecularWeight;  // g/mol
          // Cv = Cp - R/MW  where R is in J/(mol*K), MW in g/mol
          // R/MW in J/(g*K) = R*1000/MW in J/(kg*K)
          return cpSpec - R_GAS * 1000 / MW;
        },
      },
    },
  },

  cpCvRatio: {
    id: 'cpCvRatio',
    name: 'Cp/Cv Ratio (k)',
    quantity: null,
    category: 'chemical-condition',
    defaultUnit: null,
    allowUserOverride: true,
    methods: {
      ratio: {
        name: 'Cp / Cv',
        inputs: ['cp', 'cv'],
        calculate: (inputs) => inputs.cp / inputs.cv,
      },
    },
  },

  heatOfVaporization: {
    id: 'heatOfVaporization',
    name: 'Heat of Vaporization',
    quantity: 'specificEnergy',
    category: 'chemical-condition',
    defaultUnit: 'J/kg',
    allowUserOverride: true,
    methods: {
      perryCorrelation: {
        name: 'Perry correlation',
        inputs: ['temperature', 'molecularWeight', 'criticalTemperature'],
        source: 'perry',
        description: 'Watson-type correlation for latent heat vs. reduced temperature',
        assumption: 'Pure component; approaches zero at critical point',
        calculate: (inputs, chemData) => {
          const T = inputs.temperature; // K
          const MW = inputs.molecularWeight;
          const Tc = inputs.criticalTemperature; // K
          const corr = getPerryCorrelation(chemData, 'liquid', 'heatVaporization');
          if (!corr) return null;

          const Tr = T / Tc;
          const tau = 1 - Tr;
          const C1 = +corr.C1, C2 = +corr.C2, C3 = +corr.C3, C4 = +corr.C4;

          // J/kmol
          const hvapMolar = C1 * Math.pow(tau, C2 + C3*Tr + C4*Tr*Tr);
          // Convert to J/kg
          return hvapMolar / MW;
        },
      },
    },
  },

  thermalConductivity: {
    id: 'thermalConductivity',
    name: 'Thermal Conductivity',
    quantity: 'thermalConductivity',
    category: 'chemical-condition',
    defaultUnit: 'W/m/K',
    allowUserOverride: true,
    methods: {
      perryVaporCorrelation: {
        name: 'Perry vapor correlation',
        inputs: ['temperature'],
        source: 'perry',
        description: 'Empirical correlation for low-pressure gas thermal conductivity',
        assumption: 'Dilute gas; no pressure correction',
        calculate: (inputs, chemData) => {
          const T = inputs.temperature;
          const corr = getPerryCorrelation(chemData, 'gaseous', 'thermalConductivity');
          if (!corr) return null;
          // equation 102 or 100
          return evalPerry(corr.equation || 102, corr, T);
        },
      },
      perryLiquidCorrelation: {
        name: 'Perry liquid correlation',
        inputs: ['temperature'],
        source: 'perry',
        description: 'Empirical correlation for liquid thermal conductivity',
        assumption: 'Saturated liquid; pressure effects neglected',
        calculate: (inputs, chemData) => {
          const T = inputs.temperature;
          const corr = getPerryCorrelation(chemData, 'liquid', 'thermalConductivity');
          if (!corr) return null;
          return evalPerry(corr.equation || 100, corr, T);
        },
      },
    },
  },

  sonicVelocity: {
    id: 'sonicVelocity',
    name: 'Sonic Velocity',
    quantity: 'velocity',
    category: 'chemical-condition',
    defaultUnit: 'm/s',
    allowUserOverride: true,
    methods: {
      compressibleGas: {
        name: 'Compressible gas',
        inputs: ['cpCvRatio', 'molecularWeight', 'temperature'],
        source: 'crane',
        description: 'Speed of sound from sqrt(k\u00b7R\u00b7T / MW)',
        assumption: 'Ideal gas with constant Cp/Cv ratio',
        calculate: (inputs) => {
          const k = inputs.cpCvRatio;
          const MW = inputs.molecularWeight; // g/mol
          const T = inputs.temperature;       // K
          // c = sqrt(k * R * T / MW_kg)
          // R = 8.314 J/(mol*K), MW_kg = MW/1000 kg/mol
          // c = sqrt(k * R * 1000 * T / MW) in m/s
          return Math.sqrt(k * R_GAS * 1000 * T / MW);
        },
      },
    },
  },

  prandtlNumber: {
    id: 'prandtlNumber',
    name: 'Prandtl Number',
    quantity: null,
    category: 'chemical-condition',
    defaultUnit: null,
    methods: {
      standard: {
        name: 'Pr = Cp*mu/k',
        inputs: ['cp', 'viscosity', 'thermalConductivity'],
        calculate: (inputs) => {
          const Cp = inputs.cp;                    // J/(kg*K)
          const mu = inputs.viscosity;             // Pa*s
          const k = inputs.thermalConductivity;    // W/(m*K)
          return Cp * mu / k;
        },
      },
    },
  },

  // =========================================================================
  // SYSTEM PROPERTIES (pipe)
  // =========================================================================

  pipeMaterial: {
    id: 'pipeMaterial',
    name: 'Pipe Material',
    quantity: null,
    category: 'system-property',
    defaultUnit: null,
    defaultValue: 'Commercial Steel or Wrought Iron',
    isUserInput: true,
    isSelection: true,
    methods: {},
  },

  pipeStandard: {
    id: 'pipeStandard',
    name: 'Pipe Standard',
    quantity: null,
    category: 'system-property',
    defaultUnit: null,
    defaultValue: 'NPS',
    isUserInput: true,
    isSelection: true,
    methods: {},
  },

  pipeNominalDiameter: {
    id: 'pipeNominalDiameter',
    name: 'Nominal Diameter',
    quantity: null,
    category: 'system-property',
    defaultUnit: null,
    defaultValue: '2',
    isUserInput: true,
    isSelection: true,
    methods: {},
  },

  pipeSchedule: {
    id: 'pipeSchedule',
    name: 'Pipe Schedule',
    quantity: null,
    category: 'system-property',
    defaultUnit: null,
    defaultValue: 'Sch. 40',
    isUserInput: true,
    isSelection: true,
    methods: {},
  },

  pipeInnerDiameter: {
    id: 'pipeInnerDiameter',
    name: 'Inner Diameter',
    quantity: 'length',
    category: 'system-property',
    defaultUnit: 'in',
    allowUserOverride: true,
    methods: {
      fromPipeInfo: {
        name: 'From pipe tables',
        inputs: ['pipeStandard', 'pipeNominalDiameter', 'pipeSchedule'],
        source: 'pipingHandbook',
        calculate: (inputs, chemData, pipeData) => {
          const standard = inputs.pipeStandard;
          const nomDia = inputs.pipeNominalDiameter;
          const schedule = inputs.pipeSchedule;
          if (!pipeData) return null;

          const pipeEntry = pipeData.dimensions?.find(
            p => p.standard === standard && p.nominalDiameter === nomDia
          );
          if (!pipeEntry) return null;

          const od = +pipeEntry.outerDiameter;
          const wt = +pipeEntry.wallThickness[schedule];
          if (!od || !wt) return null;

          const id_inches = od - 2 * wt;
          // Convert inches to meters
          return id_inches * 0.0254;
        },
      },
      // TODO: fromArea method for non-circular ducts (future feature)
    },
  },

  pipeCrossSectionalArea: {
    id: 'pipeCrossSectionalArea',
    name: 'Cross-Sectional Area',
    quantity: 'area',
    category: 'system-property',
    defaultUnit: 'in2',
    allowUserOverride: true,
    methods: {
      fromDiameter: {
        name: 'From inner diameter',
        inputs: ['pipeInnerDiameter'],
        calculate: (inputs) => {
          const D = inputs.pipeInnerDiameter; // m
          return Math.PI * D * D / 4;
        },
      },
    },
  },

  pipeHydraulicRadius: {
    id: 'pipeHydraulicRadius',
    name: 'Hydraulic Radius',
    quantity: 'length',
    category: 'system-property',
    defaultUnit: 'in',
    allowUserOverride: true,
    methods: {
      fromDiameter: {
        name: 'D/4 (circular pipe)',
        inputs: ['pipeInnerDiameter'],
        calculate: (inputs) => inputs.pipeInnerDiameter / 4,
      },
    },
  },

  pipeAbsoluteRoughness: {
    id: 'pipeAbsoluteRoughness',
    name: 'Absolute Roughness',
    quantity: 'length',
    category: 'system-property',
    defaultUnit: 'm',
    allowUserOverride: true,
    methods: {
      fromMaterial: {
        name: 'From pipe material',
        inputs: ['pipeMaterial'],
        source: 'moody',
        calculate: (inputs, chemData, pipeData) => {
          const materialName = inputs.pipeMaterial;
          if (!pipeData) return null;
          const mat = pipeData.materials?.find(m => m.name === materialName);
          return mat ? mat.roughness : null; // already in meters
        },
      },
    },
  },

  pipeLength: {
    id: 'pipeLength',
    name: 'Pipe Length',
    quantity: 'length',
    category: 'system-property',
    defaultUnit: 'ft',
    defaultValue: 100,
    isUserInput: true,
    methods: {},
  },

  totalKFactor: {
    id: 'totalKFactor',
    name: 'Total K-Factor (Fittings)',
    quantity: null,
    category: 'system-property',
    defaultUnit: null,
    defaultValue: 0,
    isUserInput: true,
    methods: {},
  },

  // =========================================================================
  // SYSTEM CONDITIONS (flow calculations)
  // =========================================================================

  massFlowRate: {
    id: 'massFlowRate',
    name: 'Mass Flow Rate',
    quantity: 'massRate',
    category: 'system-condition',
    defaultUnit: 'lb/hr',
    defaultValue: 100,
    isUserInput: true,
    methods: {},
  },

  volumeFlowRate: {
    id: 'volumeFlowRate',
    name: 'Volume Flow Rate',
    quantity: 'volumeRate',
    category: 'system-condition',
    defaultUnit: 'm3/h',
    allowUserOverride: true,
    methods: {
      fromMassRateAndDensity: {
        name: 'Mass flow / density',
        inputs: ['massFlowRate', 'density'],
        calculate: (inputs) => {
          const W = inputs.massFlowRate; // kg/hr
          const rho = inputs.density;    // kg/m3
          // volumeRate in m3/s = (kg/hr) / (kg/m3) / 3600
          return W / rho / 3600;
        },
      },
    },
  },

  velocity: {
    id: 'velocity',
    name: 'Velocity',
    quantity: 'velocity',
    category: 'system-condition',
    defaultUnit: 'm/s',
    allowUserOverride: true,
    methods: {
      fromVolumeRateAndArea: {
        name: 'Volume flow / area',
        inputs: ['volumeFlowRate', 'pipeCrossSectionalArea'],
        calculate: (inputs) => {
          const Q = inputs.volumeFlowRate;          // m3/s
          const A = inputs.pipeCrossSectionalArea;   // m2
          return Q / A;
        },
      },
    },
  },

  machNumber: {
    id: 'machNumber',
    name: 'Mach Number',
    quantity: null,
    category: 'system-condition',
    defaultUnit: null,
    methods: {
      standard: {
        name: 'Ma = v / c',
        inputs: ['velocity', 'sonicVelocity'],
        calculate: (inputs) => {
          const v = inputs.velocity;       // m/s
          const c = inputs.sonicVelocity;  // m/s
          return v / c;
        },
      },
    },
  },

  reynoldsNumber: {
    id: 'reynoldsNumber',
    name: 'Reynolds Number',
    quantity: null,
    category: 'system-condition',
    defaultUnit: null,
    allowUserOverride: true,
    methods: {
      standard: {
        name: 'Re = rho*v*D/mu',
        inputs: ['density', 'velocity', 'pipeInnerDiameter', 'viscosity'],
        calculate: (inputs) => {
          const rho = inputs.density;            // kg/m3
          const v = inputs.velocity;             // m/s
          const D = inputs.pipeInnerDiameter;    // m
          const mu = inputs.viscosity;           // Pa*s
          return rho * v * D / mu;
        },
      },
    },
  },

  frictionFactor: {
    id: 'frictionFactor',
    name: 'Darcy Friction Factor',
    quantity: null,
    category: 'system-condition',
    defaultUnit: null,
    allowUserOverride: true,
    methods: {
      laminar: {
        name: 'Laminar (64/Re)',
        inputs: ['reynoldsNumber'],
        calculate: (inputs) => 64 / inputs.reynoldsNumber,
      },
      churchill1977: {
        name: 'Churchill (1977) - all regimes',
        inputs: ['reynoldsNumber', 'pipeAbsoluteRoughness', 'pipeInnerDiameter'],
        source: 'churchill1977',
        description: 'Single explicit equation spanning laminar, transitional, and turbulent flow',
        assumption: 'Steady-state, fully developed flow in circular pipe',
        calculate: (inputs) => {
          const Re = inputs.reynoldsNumber;
          const e = inputs.pipeAbsoluteRoughness; // m
          const D = inputs.pipeInnerDiameter;      // m
          const eD = e / D; // relative roughness

          const A = Math.pow(-2.457 * Math.log((7/Re)**0.9 + 0.27*eD), 16);
          const B = Math.pow(37530/Re, 16);
          return 8 * Math.pow(Math.pow(8/Re, 12) + 1/Math.pow(A + B, 1.5), 1/12);
        },
      },
      churchill1973: {
        name: 'Churchill (1973)',
        inputs: ['reynoldsNumber', 'pipeAbsoluteRoughness', 'pipeInnerDiameter'],
        source: 'churchill1973',
        description: 'Explicit approximation to the Colebrook equation',
        assumption: 'Turbulent flow only; not accurate in laminar/transitional regime',
        calculate: (inputs) => {
          const Re = inputs.reynoldsNumber;
          const e = inputs.pipeAbsoluteRoughness;
          const D = inputs.pipeInnerDiameter;
          const eD = e / D;

          const x = -2 * Math.log10(eD/3.71 + Math.pow(7/Re, 0.9));
          return 1 / (x * x);
        },
      },
      colebrook: {
        name: 'Colebrook (iterative)',
        inputs: ['reynoldsNumber', 'pipeAbsoluteRoughness', 'pipeInnerDiameter'],
        source: 'colebrook',
        description: 'Implicit Colebrook-White equation solved iteratively',
        assumption: 'Turbulent flow in hydraulically rough or smooth pipes',
        calculate: (inputs) => {
          const Re = inputs.reynoldsNumber;
          const e = inputs.pipeAbsoluteRoughness;
          const D = inputs.pipeInnerDiameter;
          const eD = e / D;

          // Initial guess using Churchill 1973
          let f = 1 / Math.pow(-2 * Math.log10(eD/3.71 + Math.pow(7/Re, 0.9)), 2);

          // Iterate 10 times
          for (let i = 0; i < 10; i++) {
            const x = -2 * Math.log10(eD/3.7 + 2.51/(Re*Math.sqrt(f)));
            f = 1 / (x * x);
          }
          return f;
        },
      },
      niazkar: {
        name: 'Niazkar (Colebrook approx.)',
        inputs: ['reynoldsNumber', 'pipeAbsoluteRoughness', 'pipeInnerDiameter'],
        source: 'niazkar',
        description: 'High-accuracy explicit approximation to the Colebrook equation',
        assumption: 'Turbulent flow; explicit substitute for implicit Colebrook',
        calculate: (inputs) => {
          const Re = inputs.reynoldsNumber;
          const e = inputs.pipeAbsoluteRoughness;
          const D = inputs.pipeInnerDiameter;
          const eD = e / D;

          const A = -2 * Math.log10(eD/3.7 + 4.5547/Math.pow(Re, 0.8784));
          const B = -2 * Math.log10(eD/3.7 + 2.51*A/Re);
          const C = -2 * Math.log10(eD/3.7 + 2.51*B/Re);
          return 1 / Math.pow(A - (B-A)**2 / (C - 2*B + A), 2);
        },
      },
      swameeJain: {
        name: 'Swamee-Jain (1976)',
        inputs: ['reynoldsNumber', 'pipeAbsoluteRoughness', 'pipeInnerDiameter'],
        source: 'swameeJain',
        description: 'Explicit approximation to the Colebrook equation (~1% accuracy)',
        assumption: 'Turbulent flow only; Re 5000–10⁸, ε/D 10⁻⁶–5×10⁻²',
        calculate: (inputs) => {
          const Re = inputs.reynoldsNumber;
          const e = inputs.pipeAbsoluteRoughness;
          const D = inputs.pipeInnerDiameter;
          const eD = e / D;

          const x = Math.log10(eD / 3.7 + 5.74 / Math.pow(Re, 0.9));
          return 0.25 / (x * x);
        },
      },
      haaland: {
        name: 'Haaland (1983)',
        inputs: ['reynoldsNumber', 'pipeAbsoluteRoughness', 'pipeInnerDiameter'],
        source: 'haaland',
        description: 'Explicit approximation to the Colebrook equation (~1.5% accuracy)',
        assumption: 'Turbulent flow only',
        calculate: (inputs) => {
          const Re = inputs.reynoldsNumber;
          const e = inputs.pipeAbsoluteRoughness;
          const D = inputs.pipeInnerDiameter;
          const eD = e / D;

          const x = -1.8 * Math.log10(Math.pow(eD / 3.7, 1.11) + 6.9 / Re);
          return 1 / (x * x);
        },
      },
      moody: {
        name: 'Moody (1947)',
        inputs: ['reynoldsNumber', 'pipeAbsoluteRoughness', 'pipeInnerDiameter'],
        source: 'moody',
        description: 'Early empirical approximation for turbulent friction factor',
        assumption: 'Turbulent flow only; lower accuracy than modern Colebrook approximations',
        legacy: true,
        calculate: (inputs) => {
          const Re = inputs.reynoldsNumber;
          const e = inputs.pipeAbsoluteRoughness;
          const D = inputs.pipeInnerDiameter;
          const eD = e / D;

          return 0.0055 * (1 + Math.pow(20000 * eD + 1e6 / Re, 1 / 3));
        },
      },
      cheng: {
        name: 'Cheng (all regimes)',
        inputs: ['reynoldsNumber', 'pipeAbsoluteRoughness', 'pipeInnerDiameter'],
        source: 'cheng',
        description: 'Explicit equation valid from laminar through turbulent flow',
        assumption: 'Steady-state, fully developed flow in circular pipe',
        calculate: (inputs) => {
          const Re = inputs.reynoldsNumber;
          const e = inputs.pipeAbsoluteRoughness;
          const D = inputs.pipeInnerDiameter;
          const eD = e / D;

          const a = 1 / (1 + Math.pow(Re/2720, 9));
          const b = 1 / (1 + Math.pow(Re / (160/eD), 2));
          return 1 / (
            Math.pow(Re/64, a) *
            Math.pow(1.8 * Math.log10(Re/6.8), 2*(1-a)*b) *
            Math.pow(2 * Math.log10(3.7/eD), 2*(1-a)*(1-b))
          );
        },
      },
    },
  },

  pressureDropPipe: {
    id: 'pressureDropPipe',
    name: 'Pressure Drop (Pipe)',
    quantity: 'pressureDifference',
    category: 'system-condition',
    defaultUnit: 'psi',
    allowUserOverride: true,
    methods: {
      darcy: {
        name: 'Darcy-Weisbach',
        inputs: ['frictionFactor', 'density', 'pipeLength', 'pipeInnerDiameter', 'velocity'],
        source: 'crane',
        description: 'Fundamental pressure-drop equation: dP = f\u00b7(L/D)\u00b7\u03c1\u00b7v\u00b2/2',
        assumption: 'Steady-state, incompressible, fully developed flow',
        calculate: (inputs) => {
          const f = inputs.frictionFactor;       // dimensionless (Darcy)
          const rho = inputs.density;            // kg/m3
          const L = inputs.pipeLength;           // m
          const D = inputs.pipeInnerDiameter;    // m
          const v = inputs.velocity;             // m/s
          // dP = f * L/D * rho * v^2 / 2  (Pa)
          return f * (L / D) * rho * v * v / 2;
        },
      },
    },
  },

  pressureDropFittings: {
    id: 'pressureDropFittings',
    name: 'Pressure Drop (Fittings)',
    quantity: 'pressureDifference',
    category: 'system-condition',
    defaultUnit: 'psi',
    methods: {
      kFactor: {
        name: 'K-factor method',
        inputs: ['totalKFactor', 'density', 'velocity'],
        source: 'crane',
        description: 'Fitting losses from resistance coefficients: dP = K \u00d7 \u03c1 \u00d7 v\u00b2 / 2',
        assumption: 'Incompressible flow; K values independent of Reynolds number',
        calculate: (inputs) => {
          const K = inputs.totalKFactor;
          const rho = inputs.density;    // kg/m3
          const v = inputs.velocity;     // m/s
          return K * rho * v * v / 2;    // Pa
        },
      },
    },
  },

  pressureDropTotal: {
    id: 'pressureDropTotal',
    name: 'Pressure Drop (Total)',
    quantity: 'pressureDifference',
    category: 'system-condition',
    defaultUnit: 'psi',
    allowUserOverride: true,
    methods: {
      pipeAndFittings: {
        name: 'Pipe + fittings',
        inputs: ['pressureDropPipe', 'pressureDropFittings'],
        calculate: (inputs) => inputs.pressureDropPipe + inputs.pressureDropFittings,
      },
      pipeOnly: {
        name: 'Pipe only (no fittings)',
        inputs: ['pressureDropPipe'],
        calculate: (inputs) => inputs.pressureDropPipe,
      },
    },
  },
};

/**
 * Get default active method for each property.
 * Returns the first available method key, or null for user-input properties.
 */
export function getDefaultMethodMap(registry) {
  const map = {};
  for (const [id, def] of Object.entries(registry)) {
    if (def.isUserInput || def.isSelection) {
      map[id] = null;
    } else if (def.isLookup) {
      map[id] = 'lookup';
    } else if (id === 'frictionFactor') {
      // Churchill 1977 handles all flow regimes (laminar, transition, turbulent)
      map[id] = 'churchill1977';
    } else if (id === 'pressureDropTotal') {
      map[id] = 'pipeAndFittings';
    } else {
      const keys = Object.keys(def.methods);
      map[id] = keys.length > 0 ? keys[0] : null;
    }
  }
  return map;
}
