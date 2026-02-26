// DOM construction with createElement (no innerHTML). Update loop.

import { REGISTRY } from '../engine/registry.js';
import { UNITS, unitOptionsFor } from '../engine/units.js';
import { SECTIONS } from './sections.js';
import { formatNumber } from './formatting.js';
import { getAllChemicals, searchChemicals } from '../data/chemicals.js';
import { getMaterialNames, getPipeStandards, getNominalDiameters, getSchedules } from '../data/pipe.js';
import { setupHoverHighlighting } from './hover.js';

/** Create an element with attributes and children. */
function el(tag, attrs = {}, ...children) {
  const elem = document.createElement(tag);
  for (const [key, val] of Object.entries(attrs)) {
    if (key === 'className') elem.className = val;
    else if (key === 'textContent') elem.textContent = val;
    else if (key.startsWith('on')) elem.addEventListener(key.slice(2).toLowerCase(), val);
    else if (key === 'dataset') Object.assign(elem.dataset, val);
    else elem.setAttribute(key, val);
  }
  for (const child of children) {
    if (typeof child === 'string') elem.appendChild(document.createTextNode(child));
    else if (child) elem.appendChild(child);
  }
  return elem;
}

/**
 * Build the full application DOM.
 * @param {HTMLElement} root
 * @param {import('./state.js').AppState} state
 */
export function buildApp(root, state) {
  root.textContent = '';

  const header = el('header', { className: 'app-header' },
    el('h1', {}, 'Pressure Drop Calculator'),
    el('p', { className: 'subtitle' }, 'Single-phase pipe flow — Darcy-Weisbach method'),
  );
  root.appendChild(header);

  const main = el('main', { className: 'sections' });

  for (const section of SECTIONS) {
    main.appendChild(buildSection(section, state));
  }

  root.appendChild(main);

  // Initial calculation
  state.recalculate();

  // Subscribe to updates
  state.subscribe(() => updateAll(state));

  // Set up hover highlighting
  setupHoverHighlighting(root, state);
}

/**
 * Build a collapsible section.
 */
function buildSection(section, state) {
  const sectionEl = el('section', {
    className: 'section',
    dataset: { sectionId: section.id },
  });

  const headerEl = el('div', {
    className: 'section-header',
    onClick: () => {
      state.toggleSection(section.id);
      sectionEl.classList.toggle('expanded', state.expandedSections.has(section.id));
    },
  },
    el('h2', {}, section.title),
    el('span', { className: 'toggle-icon' }, '\u25B6'),
  );
  sectionEl.appendChild(headerEl);

  const bodyEl = el('div', { className: 'section-body' });

  // Primary fields (always visible)
  const primaryEl = el('div', { className: 'fields primary-fields' });
  for (const propId of section.primary) {
    primaryEl.appendChild(buildPropertyField(propId, state));
  }
  bodyEl.appendChild(primaryEl);

  // Detail fields (shown when expanded)
  if (section.detail.length > 0) {
    const detailEl = el('div', { className: 'fields detail-fields' });
    for (const propId of section.detail) {
      detailEl.appendChild(buildPropertyField(propId, state));
    }
    bodyEl.appendChild(detailEl);
  }

  sectionEl.appendChild(bodyEl);
  return sectionEl;
}

/**
 * Build a single property field row.
 */
function buildPropertyField(propId, state) {
  const def = REGISTRY[propId];
  if (!def) return el('div', {}, `Unknown property: ${propId}`);

  const row = el('div', {
    className: 'field-row',
    dataset: { propId: propId },
  });

  // Label
  const label = el('label', { className: 'field-label', for: `input-${propId}` }, def.name);
  row.appendChild(label);

  // Input area
  const inputArea = el('div', { className: 'field-input' });

  if (propId === 'chemicalSearch') {
    inputArea.appendChild(buildChemicalSearch(state));
  } else if (def.isSelection && !def.quantity) {
    inputArea.appendChild(buildSelectionDropdown(propId, state));
  } else if (def.isUserInput) {
    inputArea.appendChild(buildNumberInput(propId, state));
  } else {
    inputArea.appendChild(buildOutputDisplay(propId, state));
  }

  row.appendChild(inputArea);

  // Unit selector (if has quantity)
  if (def.quantity) {
    row.appendChild(buildUnitSelector(propId, state));
  }

  // Method selector (if has multiple methods)
  const methodKeys = Object.keys(def.methods || {});
  if (methodKeys.length > 1) {
    row.appendChild(buildMethodSelector(propId, state));
  }

  return row;
}

/**
 * Build chemical search input with datalist.
 */
function buildChemicalSearch(state) {
  const wrapper = el('div', { className: 'chemical-search-wrapper' });

  const input = el('input', {
    type: 'text',
    id: 'input-chemicalSearch',
    className: 'field-input-control chemical-search',
    placeholder: 'Search chemical name or CAS...',
    list: 'chemical-list',
    autocomplete: 'off',
  });

  const datalist = el('datalist', { id: 'chemical-list' });
  const allChems = getAllChemicals();
  for (const chem of allChems) {
    datalist.appendChild(el('option', { value: chem.cas, label: chem.searchTerm }));
  }

  input.addEventListener('input', () => {
    const val = input.value.trim();
    // Check if it's a valid CAS number selection
    const allChems = getAllChemicals();
    const match = allChems.find(c => c.cas === val || c.searchTerm === val);
    if (match) {
      state.selectChemical(match.cas);
    }
  });

  input.addEventListener('change', () => {
    const val = input.value.trim();
    const allChems = getAllChemicals();
    const match = allChems.find(c => c.cas === val || c.searchTerm === val || c.name === val);
    if (match) {
      input.value = match.cas;
      state.selectChemical(match.cas);
    }
  });

  wrapper.appendChild(input);
  wrapper.appendChild(datalist);
  return wrapper;
}

/**
 * Build a dropdown for selection properties (pipe standard, material, schedule, etc.).
 */
function buildSelectionDropdown(propId, state) {
  const select = el('select', {
    id: `input-${propId}`,
    className: 'field-input-control selection-dropdown',
    dataset: { propId },
  });

  populateDropdown(select, propId, state);

  select.addEventListener('change', () => {
    state.setValue(propId, select.value);
  });

  // Set initial value
  const current = state.userValues[propId]?.value;
  if (current) select.value = current;

  return select;
}

/**
 * Populate dropdown options based on property type and current state.
 */
function populateDropdown(select, propId, state) {
  select.textContent = '';
  let options = [];

  if (propId === 'pipeMaterial') {
    options = getMaterialNames();
  } else if (propId === 'pipeStandard') {
    options = getPipeStandards();
  } else if (propId === 'pipeNominalDiameter') {
    const standard = state.userValues.pipeStandard?.value || 'NPS';
    options = getNominalDiameters(standard);
  } else if (propId === 'pipeSchedule') {
    const standard = state.userValues.pipeStandard?.value || 'NPS';
    const nomDia = state.userValues.pipeNominalDiameter?.value || '2';
    options = getSchedules(standard, nomDia);
  }

  for (const opt of options) {
    if (opt) select.appendChild(el('option', { value: opt }, opt));
  }
}

/**
 * Build a number input for user-input properties.
 */
function buildNumberInput(propId, state) {
  const input = el('input', {
    type: 'number',
    id: `input-${propId}`,
    className: 'field-input-control number-input',
    step: 'any',
    dataset: { propId },
  });

  // Set initial value
  const current = state.userValues[propId];
  if (current?.value != null) input.value = current.value;

  input.addEventListener('input', () => {
    const val = input.value === '' ? null : +input.value;
    state.setValue(propId, val, state.userValues[propId]?.unit);
  });

  return input;
}

/**
 * Build a read-only output display for calculated properties.
 */
function buildOutputDisplay(propId, state) {
  const span = el('span', {
    id: `output-${propId}`,
    className: 'field-output',
    dataset: { propId },
  });
  return span;
}

/**
 * Build unit selector dropdown.
 */
function buildUnitSelector(propId, state) {
  const def = REGISTRY[propId];
  if (!def.quantity) return el('span');

  const select = el('select', {
    className: 'unit-selector',
    dataset: { propId },
  });

  const options = unitOptionsFor(def.quantity);
  for (const opt of options) {
    select.appendChild(el('option', { value: opt.key }, opt.symbol));
  }

  // Set current unit
  const currentUnit = state.userValues[propId]?.unit || def.defaultUnit;
  if (currentUnit) select.value = currentUnit;

  select.addEventListener('change', () => {
    state.setUnit(propId, select.value);
  });

  return select;
}

/**
 * Build method selector dropdown.
 */
function buildMethodSelector(propId, state) {
  const def = REGISTRY[propId];
  const methods = def.methods || {};
  const keys = Object.keys(methods);
  if (keys.length <= 1) return el('span');

  const select = el('select', {
    className: 'method-selector',
    dataset: { propId },
  });

  for (const key of keys) {
    select.appendChild(el('option', { value: key }, methods[key].name));
  }

  const current = state.activeMethodMap[propId];
  if (current) select.value = current;

  select.addEventListener('change', () => {
    state.setMethod(propId, select.value);
  });

  return select;
}

/**
 * Update all output displays with current results.
 */
function updateAll(state) {
  for (const [propId, result] of Object.entries(state.results)) {
    // Update output displays
    const outputEl = document.getElementById(`output-${propId}`);
    if (outputEl) {
      if (result.isValid) {
        outputEl.textContent = formatNumber(result.displayValue);
        outputEl.classList.remove('error');
        outputEl.title = '';
      } else {
        outputEl.textContent = result.error?.message || '—';
        outputEl.classList.add('error');
        outputEl.title = result.error?.message || '';
      }
    }

    // Update field row styling
    const row = document.querySelector(`.field-row[data-prop-id="${propId}"]`);
    if (row) {
      row.classList.toggle('valid', result.isValid);
      row.classList.toggle('invalid', !result.isValid && result.error != null);
    }
  }

  // Update dependent dropdowns (schedules change when standard/diameter change)
  updateDependentDropdowns(state);
}

/**
 * Re-populate dropdowns that depend on other selections.
 */
function updateDependentDropdowns(state) {
  const nomDiaSelect = document.querySelector(`select[data-prop-id="pipeNominalDiameter"]`);
  if (nomDiaSelect) {
    const oldVal = nomDiaSelect.value;
    populateDropdown(nomDiaSelect, 'pipeNominalDiameter', state);
    if ([...nomDiaSelect.options].some(o => o.value === oldVal)) {
      nomDiaSelect.value = oldVal;
    }
  }

  const schedSelect = document.querySelector(`select[data-prop-id="pipeSchedule"]`);
  if (schedSelect) {
    const oldVal = schedSelect.value;
    populateDropdown(schedSelect, 'pipeSchedule', state);
    if ([...schedSelect.options].some(o => o.value === oldVal)) {
      schedSelect.value = oldVal;
    }
  }
}
