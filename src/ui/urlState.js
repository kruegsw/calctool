// URL state serialization/deserialization for shareable links

// Short param keys for user-input properties
const INPUT_KEYS = {
  chemicalSearch: 'chem',
  temperature: 'T',
  pressure: 'P',
  massFlowRate: 'W',
  pipeLength: 'L',
  pipeStandard: 'std',
  pipeNominalDiameter: 'nom',
  pipeSchedule: 'sch',
  pipeMaterial: 'mat',
};

// Unit suffix for numeric inputs
const UNIT_SUFFIX = {
  temperature: 'Tu',
  pressure: 'Pu',
  massFlowRate: 'Wu',
  pipeLength: 'Lu',
};

// Override-able calculated properties
const OVERRIDE_KEYS = {
  density: 'rho',
  viscosity: 'mu',
  cp: 'Cp',
  vaporPressure: 'Pvap',
  pipeInnerDiameter: 'Di',
  pipeAbsoluteRoughness: 'eps',
  velocity: 'v',
  volumeFlowRate: 'Qv',
  reynoldsNumber: 'Re',
  frictionFactor: 'f',
};

// Unit suffix for overrides
const OVERRIDE_UNIT_SUFFIX = {
  density: 'rhou',
  viscosity: 'muu',
  cp: 'Cpu',
  vaporPressure: 'Pvapu',
  pipeInnerDiameter: 'Diu',
  pipeAbsoluteRoughness: 'epsu',
  velocity: 'vu',
  volumeFlowRate: 'Qvu',
};

// Build reverse lookup maps
const PARAM_TO_INPUT = {};
for (const [prop, key] of Object.entries(INPUT_KEYS)) {
  PARAM_TO_INPUT[key] = prop;
}

const PARAM_TO_OVERRIDE = {};
for (const [prop, key] of Object.entries(OVERRIDE_KEYS)) {
  PARAM_TO_OVERRIDE[key] = prop;
}

/**
 * Serialize current state into URLSearchParams.
 * Omits default/empty values to keep URL clean.
 */
export function serializeState(state) {
  const params = new URLSearchParams();

  // Unit system
  if (state.unitSystem) {
    params.set('units', state.unitSystem);
  }

  // User inputs
  for (const [propId, paramKey] of Object.entries(INPUT_KEYS)) {
    const entry = state.userValues[propId];
    if (!entry || entry.value == null || entry.value === '') continue;
    params.set(paramKey, String(entry.value));

    // Unit for numeric inputs
    const unitKey = UNIT_SUFFIX[propId];
    if (unitKey && entry.unit) {
      params.set(unitKey, entry.unit);
    }
  }

  // Overrides (only if user has set a value)
  for (const [propId, paramKey] of Object.entries(OVERRIDE_KEYS)) {
    const entry = state.userValues[propId];
    if (!entry || entry.value == null || entry.value === '') continue;
    params.set(paramKey, String(entry.value));

    const unitKey = OVERRIDE_UNIT_SUFFIX[propId];
    if (unitKey && entry.unit) {
      params.set(unitKey, entry.unit);
    }
  }

  // Method overrides
  if (state.userMethodOverrides.size > 0) {
    const parts = [];
    for (const propId of state.userMethodOverrides) {
      const methodKey = state.activeMethodMap[propId];
      if (methodKey) {
        parts.push(`${propId}:${methodKey}`);
      }
    }
    if (parts.length > 0) {
      params.set('mo', parts.join('|'));
    }
  }

  return params;
}

/**
 * Deserialize URLSearchParams back into state.
 * Returns true if any values were found in the URL.
 */
export function deserializeState(search, state) {
  const params = new URLSearchParams(search);
  let found = false;

  // Unit system
  const units = params.get('units');
  if (units) {
    state.unitSystem = units;
    found = true;
  }

  // User inputs
  for (const [paramKey, propId] of Object.entries(PARAM_TO_INPUT)) {
    const val = params.get(paramKey);
    if (val == null) continue;
    found = true;

    if (propId === 'chemicalSearch') {
      state.userValues.chemicalSearch = { value: val };
      state.dirtyFields.add('chemicalSearch');
    } else {
      const def = state.registry[propId];
      const unitKey = UNIT_SUFFIX[propId];
      const unit = (unitKey && params.get(unitKey)) || state.userValues[propId]?.unit || def?.defaultUnit;
      // Keep selection values as strings, convert numeric inputs to numbers
      const parsedVal = (def?.isSelection || isNaN(+val)) ? val : +val;
      state.userValues[propId] = {
        value: parsedVal,
        unit: unit || null,
      };
      state.dirtyFields.add(propId);
    }
  }

  // Overrides
  for (const [paramKey, propId] of Object.entries(PARAM_TO_OVERRIDE)) {
    const val = params.get(paramKey);
    if (val == null) continue;
    found = true;

    const def = state.registry[propId];
    const unitKey = OVERRIDE_UNIT_SUFFIX[propId];
    const unit = (unitKey && params.get(unitKey)) || state.userValues[propId]?.unit || def?.defaultUnit;
    state.userValues[propId] = {
      value: +val,
      unit: unit || null,
    };
    state.dirtyFields.add(propId);
  }

  // Method overrides
  const mo = params.get('mo');
  if (mo) {
    found = true;
    for (const part of mo.split('|')) {
      const [propId, methodKey] = part.split(':');
      if (propId && methodKey) {
        state.activeMethodMap[propId] = methodKey;
        state.userMethodOverrides.add(propId);
      }
    }
  }

  return found;
}

/**
 * Sync the browser URL with current state via replaceState (no history pollution).
 */
export function syncURL(state) {
  const params = serializeState(state);
  const search = params.toString();
  const url = search ? `${window.location.pathname}?${search}` : window.location.pathname;
  try {
    history.replaceState(null, '', url);
  } catch {
    // ignore (e.g. sandboxed iframe)
  }
}
