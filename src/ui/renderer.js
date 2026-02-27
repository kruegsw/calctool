// DOM construction with createElement (no innerHTML). Update loop.

import { REGISTRY } from '../engine/registry.js';
import { UNITS, unitOptionsFor, filteredUnitOptionsFor, CONDITIONAL_UNITS, UNIT_PRESETS, fromSI, toSI } from '../engine/units.js';
import { SECTIONS } from './sections.js';
import { formatNumber, flowRegimeLabel, countSigFigs, roundToSigFigs } from './formatting.js';
import { getAllChemicals, searchChemicals, getChemicalByCAS } from '../data/chemicals.js';
import { getMaterialNames, getPipeStandards, getNominalDiameters, getSchedules, getPipeUnits } from '../data/pipe.js';
import { getAllFittings, getFittingsByType, getFittingById, parseNominalDiameter } from '../data/fittings.js';
import { setupHoverHighlighting } from './hover.js';
import { getSources } from '../data/sources.js';
import { initSourcePopover, bindSourceBadge, hideSourcePopover } from './sourcePopover.js';

/**
 * Size a ghost select to fit its currently selected option text + caret padding.
 * Uses a scratch canvas to measure text width.
 */
const _measureCtx = typeof document !== 'undefined'
  ? document.createElement('canvas').getContext('2d')
  : null;

function autoSizeSelect(select) {
  if (!_measureCtx) return;
  const style = getComputedStyle(select);
  _measureCtx.font = `${style.fontWeight || 'normal'} ${style.fontSize} ${style.fontFamily}`;
  const text = select.options[select.selectedIndex]?.text || '';
  const textWidth = _measureCtx.measureText(text).width;
  // 14px right padding for caret + 4px left padding + 2px buffer
  select.style.width = `${Math.ceil(textWidth) + 20}px`;
}

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

/** Theme icon characters for each mode. */
const THEME_SVGS = {
  light: `<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>`,
  dark: `<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>`,
};
const THEME_LABELS = { system: 'System theme', light: 'Light theme', dark: 'Dark theme' };

/**
 * Apply the resolved theme to the document.
 * @param {'system'|'light'|'dark'} theme
 */
function applyTheme(theme) {
  let resolved = theme;
  if (theme === 'system') {
    resolved = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
  if (resolved === 'dark') {
    document.documentElement.setAttribute('data-theme', 'dark');
  } else {
    document.documentElement.removeAttribute('data-theme');
  }
}

/**
 * Build the full application DOM.
 * @param {HTMLElement} root
 * @param {import('./state.js').AppState} state
 */
export function buildApp(root, state) {
  root.textContent = '';

  // Accent strip
  root.appendChild(el('div', { className: 'accent-strip' }));

  // Theme toggle button
  const themeBtn = el('button', {
    className: 'theme-toggle-btn',
    type: 'button',
    title: 'Toggle theme',
    dataset: { themeBtn: 'true' },
  });
  themeBtn.addEventListener('click', () => {
    let next;
    if (state.theme === 'system') {
      // Skip to the opposite of what system resolves to (avoids no-op click)
      next = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'light' : 'dark';
    } else {
      // From explicit light/dark, go back to system
      next = 'system';
    }
    state.setTheme(next);
  });

  // Share button
  const shareBtn = el('button', {
    className: 'share-btn',
    type: 'button',
  }, 'Share');
  shareBtn.addEventListener('click', () => {
    navigator.clipboard.writeText(window.location.href).then(() => {
      shareBtn.textContent = 'Copied!';
      shareBtn.classList.add('copied');
      setTimeout(() => {
        shareBtn.textContent = 'Share';
        shareBtn.classList.remove('copied');
      }, 1500);
    });
  });

  const unitToggle = el('div', { className: 'unit-system-toggle' },
    el('button', {
      className: 'unit-system-btn',
      dataset: { unitSystem: 'SI' },
      textContent: 'SI',
      onClick: () => state.setUnitSystem('SI'),
    }),
    el('button', {
      className: 'unit-system-btn',
      dataset: { unitSystem: 'Imperial' },
      textContent: 'Imperial',
      onClick: () => state.setUnitSystem('Imperial'),
    }),
  );

  const headerControls = el('div', { className: 'header-controls' },
    themeBtn,
    shareBtn,
    unitToggle,
  );

  const header = el('header', { className: 'app-header' },
    el('h1', {}, 'Pressure Drop Calculator'),
    el('span', { className: 'version-badge' }, 'v2'),
    el('p', { className: 'subtitle' }, 'Single-phase pipe flow \u2014 Darcy-Weisbach method'),
    headerControls,
  );
  root.appendChild(header);

  // Apply initial theme
  applyTheme(state.theme);

  // Listen for OS theme changes when user is on 'system'
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
    if (state.theme === 'system') applyTheme('system');
  });

  const main = el('main', { className: 'sections' });

  for (const section of SECTIONS) {
    main.appendChild(buildSection(section, state));
  }

  root.appendChild(main);

  // Results section starts expanded
  state.expandedSections.add('results');
  const resultsEl = main.querySelector('[data-section-id="results"]');
  if (resultsEl) resultsEl.classList.add('expanded');

  // Initialize source popover singleton
  initSourcePopover();

  // Subscribe to updates, then run initial calculation
  state.subscribe(() => updateAll(state));
  state.recalculate();

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

  // Accent top bar
  const accentBar = el('div', { className: 'section-accent-top' });
  accentBar.style.background = section.accentColor;
  sectionEl.appendChild(accentBar);

  // Step number circle
  const stepCircle = el('span', { className: 'step-number', textContent: String(section.stepNumber) });
  stepCircle.style.background = section.accentColor;

  // Toggle label + icon
  const toggleLabel = el('span', { className: 'toggle-label' }, 'Show details');
  const toggleIcon = el('span', { className: 'toggle-icon' }, '\u25B6');

  const headerEl = el('div', {
    className: 'section-header',
    onClick: () => {
      state.toggleSection(section.id);
      const isExpanded = state.expandedSections.has(section.id);
      sectionEl.classList.toggle('expanded', isExpanded);
      toggleLabel.textContent = isExpanded ? 'Hide details' : 'Show details';
    },
  },
    stepCircle,
    el('h2', {}, section.title),
    toggleLabel,
    toggleIcon,
  );

  // Hide toggle controls on results section (no detail fields)
  if (section.detail.length === 0) {
    toggleLabel.style.display = 'none';
    toggleIcon.style.display = 'none';
  }

  sectionEl.appendChild(headerEl);

  const bodyEl = el('div', { className: 'section-body' });

  // Results section: hero layout
  if (section.id === 'results') {
    bodyEl.appendChild(buildResultsHero(state));
  }

  // Primary fields (always visible)
  const primaryEl = el('div', { className: 'fields primary-fields' });
  for (const propId of section.primary) {
    // Skip results hero properties from the flat list
    if (section.id === 'results') continue;
    primaryEl.appendChild(buildPropertyField(propId, state));
  }

  // Fluid section: inline chemical card on same row as search
  if (section.id === 'fluid') {
    const fluidRow = el('div', { className: 'fluid-primary-row' });
    // Move the chemicalSearch field-row into the flex row
    while (primaryEl.firstChild) {
      fluidRow.appendChild(primaryEl.firstChild);
    }
    fluidRow.appendChild(buildChemicalCard(state));
    bodyEl.appendChild(fluidRow);
  } else if (section.inline && primaryEl.children.length > 0) {
    const inlineRow = el('div', { className: 'inline-primary' });
    while (primaryEl.firstChild) {
      inlineRow.appendChild(primaryEl.firstChild);
    }
    bodyEl.appendChild(inlineRow);
  } else if (primaryEl.children.length > 0) {
    bodyEl.appendChild(primaryEl);
  }

  // Detail fields (shown when expanded)
  if (section.detail.length > 0) {
    const detailEl = el('div', { className: 'fields detail-fields' });
    for (const propId of section.detail) {
      detailEl.appendChild(buildPropertyField(propId, state));
      // Inject fittings editor after the totalKFactor row
      if (propId === 'totalKFactor') {
        detailEl.appendChild(buildFittingsEditor(state));
      }
    }
    bodyEl.appendChild(detailEl);
  }

  sectionEl.appendChild(bodyEl);
  return sectionEl;
}

/**
 * Build results hero section with large numbers and badges.
 */
function buildResultsHero(state) {
  const hero = el('div', { className: 'results-hero' });

  // Pressure Drop (Total) — main hero
  const dpItem = el('div', { className: 'hero-item', dataset: { heroId: 'pressureDropTotal' } });
  dpItem.appendChild(el('div', { className: 'hero-label' }, 'Pressure Drop'));
  const dpValue = el('div', { className: 'hero-value empty', dataset: { propId: 'pressureDropTotal' } }, '\u2014');
  const dpCopyBtn = el('button', {
    className: 'hero-copy-btn',
    type: 'button',
    title: 'Copy value',
  }, 'copy');
  dpCopyBtn.addEventListener('click', () => {
    const valueEl = dpItem.querySelector('.hero-value');
    const unitSelect = dpItem.querySelector('.hero-unit-select');
    if (!valueEl || valueEl.classList.contains('empty')) return;
    const text = valueEl.textContent + (unitSelect ? ' ' + unitSelect.options[unitSelect.selectedIndex].text : '');
    navigator.clipboard.writeText(text).then(() => {
      dpCopyBtn.textContent = 'copied!';
      dpCopyBtn.classList.add('copied');
      setTimeout(() => {
        dpCopyBtn.textContent = 'copy';
        dpCopyBtn.classList.remove('copied');
      }, 1500);
    });
  });
  const dpValueRow = el('div', { className: 'hero-value-row' });
  dpValueRow.appendChild(dpValue);
  dpValueRow.appendChild(dpCopyBtn);
  dpItem.appendChild(dpValueRow);
  dpItem.appendChild(buildHeroUnitSelect('pressureDropTotal', state));
  // Breakdown sub-text for pipe + fittings
  const dpBreakdown = el('div', { className: 'hero-dp-breakdown', dataset: { dpBreakdown: 'true' } });
  dpBreakdown.style.display = 'none';
  dpItem.appendChild(dpBreakdown);
  hero.appendChild(dpItem);

  // Reynolds Number with regime badge
  const reItem = el('div', { className: 'hero-item', dataset: { heroId: 'reynoldsNumber' } });
  reItem.appendChild(el('div', { className: 'hero-label' }, 'Reynolds Number'));
  const reValue = el('div', { className: 'hero-value empty', dataset: { propId: 'reynoldsNumber' } }, '\u2014');
  reItem.appendChild(reValue);
  const reBadge = el('div', { className: 'regime-badge', dataset: { regimeBadge: 'true' } });
  reBadge.style.display = 'none';
  reItem.appendChild(reBadge);
  hero.appendChild(reItem);

  // Friction Factor with method chip
  const ffItem = el('div', { className: 'hero-item', dataset: { heroId: 'frictionFactor' } });
  ffItem.appendChild(el('div', { className: 'hero-label' }, 'Friction Factor'));
  const ffValue = el('div', { className: 'hero-value empty', dataset: { propId: 'frictionFactor' } }, '\u2014');
  ffItem.appendChild(ffValue);
  const ffChip = el('div', { className: 'method-chip', dataset: { methodChip: 'true' } });
  ffChip.style.display = 'none';
  ffItem.appendChild(ffChip);
  // Method selector below the hero value
  const ffMethods = REGISTRY.frictionFactor?.methods || {};
  if (Object.keys(ffMethods).length > 1) {
    ffItem.appendChild(buildMethodSelector('frictionFactor', state));
  }
  hero.appendChild(ffItem);

  return hero;
}

/**
 * Build a ghost unit select for hero cards.
 */
function buildHeroUnitSelect(propId, state) {
  const def = REGISTRY[propId];
  if (!def?.quantity) return el('div', { className: 'hero-unit' });

  const wrapper = el('div', { className: 'hero-unit' });
  const select = el('select', {
    className: 'hero-unit-select',
    dataset: { heroUnit: propId },
  });

  const options = unitOptionsFor(def.quantity);
  for (const opt of options) {
    select.appendChild(el('option', { value: opt.key }, opt.symbol));
  }

  const currentUnit = state.userValues[propId]?.unit || def.defaultUnit;
  if (currentUnit) select.value = currentUnit;

  requestAnimationFrame(() => autoSizeSelect(select));
  select.addEventListener('change', () => {
    state.setUnit(propId, select.value);
    autoSizeSelect(select);
    // Sync the matching field-row unit selector if present
    const fieldSelect = document.querySelector(`.unit-selector[data-prop-id="${propId}"]`);
    if (fieldSelect) {
      fieldSelect.value = select.value;
      autoSizeSelect(fieldSelect);
    }
  });

  wrapper.appendChild(select);
  return wrapper;
}

/**
 * Build a chemical summary card (name, family, MW).
 */
function buildChemicalCard(state) {
  const card = el('div', { className: 'chemical-card', dataset: { chemCard: 'true' } });
  card.style.display = 'none';

  card.appendChild(
    el('div', { className: 'chemical-card-item' },
      el('span', { className: 'chemical-card-label' }, 'Name'),
      el('span', { className: 'chemical-card-value', dataset: { chemCardName: 'true' } }, ''),
    )
  );
  card.appendChild(
    el('div', { className: 'chemical-card-item' },
      el('span', { className: 'chemical-card-label' }, 'Family'),
      el('span', { className: 'chemical-card-value', dataset: { chemCardFamily: 'true' } }, ''),
    )
  );
  card.appendChild(
    el('div', { className: 'chemical-card-item' },
      el('span', { className: 'chemical-card-label' }, 'MW'),
      el('span', { className: 'chemical-card-value', dataset: { chemCardMw: 'true' } }, ''),
    )
  );

  return card;
}

/**
 * Build the inline fittings editor: dropdown + qty + add button + list of added fittings.
 */
function buildFittingsEditor(state) {
  const wrapper = el('div', { className: 'fittings-editor', dataset: { fittingsEditor: 'true' } });

  // Method selector row
  const methodRow = el('div', { className: 'fittings-method-row' });
  const methodLabel = el('span', { className: 'fittings-method-label' }, 'K-factor method:');
  const methodSelect = el('select', { className: 'fittings-method-select', dataset: { fittingsMethod: 'true' } });
  methodSelect.appendChild(el('option', { value: 'fixedK' }, 'Fixed K \u2014 Crane'));
  methodSelect.appendChild(el('option', { value: 'threeK' }, '3-K \u2014 Darby'));
  methodSelect.value = state.fittingsMethod;
  methodSelect.addEventListener('change', () => {
    state.setFittingsMethod(methodSelect.value);
  });
  methodRow.appendChild(methodLabel);
  methodRow.appendChild(methodSelect);
  wrapper.appendChild(methodRow);

  // Add-fitting controls row
  const addRow = el('div', { className: 'fittings-add-row' });

  // Fitting dropdown grouped by type
  const fittingSelect = el('select', { className: 'fittings-select' });
  const groups = getFittingsByType();
  for (const [type, fittings] of Object.entries(groups)) {
    const optgroup = el('optgroup', { label: type });
    for (const f of fittings) {
      optgroup.appendChild(el('option', { value: f.id }, `${f.name} (K=${f.k})`));
    }
    fittingSelect.appendChild(optgroup);
  }
  // Custom option at the end
  fittingSelect.appendChild(el('option', { value: '__custom__' }, 'Custom\u2026'));
  addRow.appendChild(fittingSelect);

  // Quantity spinner
  const qtyInput = el('input', {
    type: 'number',
    className: 'fittings-qty',
    value: '1',
    min: '1',
    step: '1',
  });
  addRow.appendChild(qtyInput);

  // Add button
  const addBtn = el('button', {
    type: 'button',
    className: 'fittings-add-btn',
    textContent: 'Add',
  });
  addRow.appendChild(addBtn);

  wrapper.appendChild(addRow);

  // Custom fitting row (hidden by default)
  const customRow = el('div', { className: 'fittings-custom-row' });
  const customName = el('input', {
    type: 'text',
    className: 'fittings-custom-name',
    placeholder: 'Name',
  });
  const customK = el('input', {
    type: 'number',
    className: 'fittings-custom-k',
    placeholder: 'K',
    step: 'any',
    min: '0',
  });
  customRow.appendChild(customName);
  customRow.appendChild(el('span', { className: 'fittings-item-k' }, 'K ='));
  customRow.appendChild(customK);
  wrapper.appendChild(customRow);

  // Toggle custom row visibility
  fittingSelect.addEventListener('change', () => {
    customRow.classList.toggle('visible', fittingSelect.value === '__custom__');
  });

  // Add handler
  addBtn.addEventListener('click', () => {
    const qty = Math.max(1, parseInt(qtyInput.value, 10) || 1);
    if (fittingSelect.value === '__custom__') {
      const name = customName.value.trim() || 'Custom';
      const k = parseFloat(customK.value);
      if (!isFinite(k) || k < 0) return;
      state.addFitting('__custom__', qty, name, k);
      customName.value = '';
      customK.value = '';
    } else {
      const fittingId = fittingSelect.value;
      if (!fittingId) return;
      state.addFitting(fittingId, qty);
    }
    qtyInput.value = '1';
  });

  // List of added fittings
  const list = el('div', { className: 'fittings-list', dataset: { fittingsList: 'true' } });
  wrapper.appendChild(list);

  return wrapper;
}

/**
 * Compute the effective K-factor for a single fitting given the active method.
 * Returns { k, source, tooltip } where source is 'crane', 'darby', or 'user'.
 */
function computeFittingK(entry, fitting, state) {
  if (entry.id === '__custom__') {
    const k = entry.k || 0;
    return { k, source: 'user', tooltip: `K = ${formatNumber(k)} (user-specified)` };
  }
  if (!fitting) return { k: 0, source: 'crane', tooltip: '' };

  const useThreeK = state.fittingsMethod === 'threeK';
  const Re = state.results?.reynoldsNumber?.value;
  const Dnom = parseNominalDiameter(state.userValues.pipeNominalDiameter?.value);

  if (useThreeK && fitting.k1 != null && Re > 0 && Dnom > 0) {
    const k3 = fitting.k1 / Re + fitting.ki * (1 + fitting.kd / Math.pow(Dnom, 0.3));
    const ReStr = formatNumber(Re);
    const DnomStr = formatNumber(Dnom);
    const tooltip = `K = K\u2081/Re + K\u1d62(1+K_d/D\u207f\u2070\u00b7\u00b3) = ${fitting.k1}/${ReStr} + ${fitting.ki}\u00d7(1+${fitting.kd}/${DnomStr}\u2070\u00b7\u00b3) = ${formatNumber(k3)}`;
    return { k: k3, source: 'darby', tooltip };
  }

  // Fixed K (or 3-K fallback for fittings without coefficients)
  const sources = getSources();
  const ref = sources?.[fitting.source]?.reference || '';
  const sourceLabel = useThreeK && fitting.k1 == null ? fitting.source : fitting.source;
  return { k: fitting.k, source: sourceLabel, tooltip: `K = ${formatNumber(fitting.k)} (${ref || 'Crane TP-410'})` };
}

/**
 * Rebuild the fittings list display from current state.
 */
function updateFittingsList(state) {
  const list = document.querySelector('[data-fittings-list]');
  if (!list) return;

  list.textContent = '';

  // Sync method dropdown value
  const methodSelect = document.querySelector('[data-fittings-method]');
  if (methodSelect && methodSelect.value !== state.fittingsMethod) {
    methodSelect.value = state.fittingsMethod;
  }

  if (state.fittings.length === 0) return;

  for (let i = 0; i < state.fittings.length; i++) {
    const entry = state.fittings[i];
    const fitting = entry.id !== '__custom__' ? getFittingById(entry.id) : null;
    if (entry.id !== '__custom__' && !fitting) continue;

    const name = entry.id === '__custom__' ? (entry.name || 'Custom') : fitting.name;
    const { k, source, tooltip } = computeFittingK(entry, fitting, state);

    const row = el('div', { className: 'fittings-list-item' });

    const nameSpan = el('span', { className: 'fittings-item-name' }, name);

    // Source citation badge
    const sources = getSources();
    const sourceEntry = sources?.[source];
    const badge = el('span', { className: 'source-badge' }, source);
    badge.title = tooltip;
    if (sourceEntry?.reference) {
      bindSourceBadge(badge, source);
    }
    nameSpan.appendChild(badge);

    const qtyInput = el('input', {
      type: 'number',
      className: 'fittings-item-qty',
      value: String(entry.qty),
      min: '1',
      step: '1',
    });
    const idx = i;
    qtyInput.addEventListener('change', () => {
      const newQty = Math.max(1, parseInt(qtyInput.value, 10) || 1);
      state.updateFittingQuantity(idx, newQty);
    });

    const kSpan = el('span', { className: 'fittings-item-k' },
      `K = ${formatNumber(k * entry.qty)}`);

    const removeBtn = el('button', {
      type: 'button',
      className: 'fittings-remove-btn',
      title: 'Remove fitting',
      textContent: '\u00d7',
    });
    removeBtn.addEventListener('click', () => {
      state.removeFitting(idx);
    });

    row.appendChild(nameSpan);
    row.appendChild(qtyInput);
    row.appendChild(kSpan);
    row.appendChild(removeBtn);
    list.appendChild(row);
  }
}

/**
 * Build a single property field row.
 */
function buildPropertyField(propId, state) {
  const def = REGISTRY[propId];
  if (!def) return el('div', {}, `Unknown property: ${propId}`);

  // Determine row type class
  let rowType = 'row-output';
  if (def.allowUserOverride) rowType = 'row-override';
  else if (def.isUserInput && !def.isSelection) rowType = 'row-input';
  else if (def.isSelection) rowType = 'row-input';
  else if (def.isLookup) rowType = 'row-lookup';

  const row = el('div', {
    className: `field-row ${rowType}`,
    dataset: { propId: propId },
  });

  // Label
  const label = el('label', { className: 'field-label', for: `input-${propId}` }, def.name);

  // "Pinned ×" badge (hidden by default) for override fields — click to un-pin
  if (def.allowUserOverride) {
    const badge = el('span', { className: 'pinned-badge', dataset: { pinnedBadge: propId } }, 'pinned \u00d7');
    badge.style.display = 'none';
    badge.addEventListener('click', (e) => {
      e.preventDefault();
      const input = document.querySelector(`.override-input[data-prop-id="${propId}"]`);
      if (input) input.value = '';
      state.setValue(propId, null, state.userValues[propId]?.unit);
    });
    label.appendChild(badge);
  }

  row.appendChild(label);

  // Input area
  const inputArea = el('div', { className: 'field-input' });

  if (propId === 'chemicalSearch') {
    inputArea.appendChild(buildChemicalSearch(state));
  } else if (propId === 'phase') {
    inputArea.appendChild(buildPhaseDisplay(propId, state));
  } else if (def.isSelection && !def.quantity) {
    inputArea.appendChild(buildSelectionDropdown(propId, state));
  } else if (def.allowUserOverride) {
    // Override field: input + unit selector (like user-input), with placeholder for calculated value
    const group = el('div', { className: 'input-group' });
    group.appendChild(buildOverrideInput(propId, state));
    group.appendChild(buildUnitSelector(propId, state));
    inputArea.appendChild(group);
  } else if (def.isUserInput) {
    // Number input: fuse input + unit in a single bordered group
    if (def.quantity) {
      const group = el('div', { className: 'input-group' });
      group.appendChild(buildNumberInput(propId, state));
      group.appendChild(buildUnitSelector(propId, state));
      inputArea.appendChild(group);
    } else {
      inputArea.appendChild(buildNumberInput(propId, state));
    }
  } else {
    // Output: inline value + ghost unit
    if (def.quantity) {
      const group = el('div', { className: 'output-group' });
      group.appendChild(buildOutputDisplay(propId, state));
      group.appendChild(buildUnitSelector(propId, state));
      inputArea.appendChild(group);
    } else {
      inputArea.appendChild(buildOutputDisplay(propId, state));
    }
  }

  // SCF annotation for massFlowRate
  if (propId === 'massFlowRate') {
    const annotation = el('div', { className: 'scf-annotation', dataset: { scfAnnotation: 'true' } });
    annotation.style.display = 'none';
    inputArea.appendChild(annotation);
  }

  row.appendChild(inputArea);

  // Method selector (if has multiple methods) — skip for frictionFactor (it's in the hero)
  if (propId !== 'frictionFactor') {
    const methodKeys = Object.keys(def.methods || {});
    if (methodKeys.length > 1) {
      row.appendChild(buildMethodSelector(propId, state));
    }
  }

  return row;
}

/**
 * Build chemical search input with custom autocomplete dropdown.
 */
function buildChemicalSearch(state) {
  const wrapper = el('div', { className: 'chemical-search-wrapper' });

  const input = el('input', {
    type: 'text',
    id: 'input-chemicalSearch',
    className: 'field-input-control chemical-search',
    placeholder: 'Search chemical name or CAS...',
    autocomplete: 'off',
  });

  let dropdown = null;
  let activeIndex = -1;

  function clearDropdown() {
    if (dropdown) {
      dropdown.remove();
      dropdown = null;
    }
    activeIndex = -1;
  }

  function selectItem(chem) {
    input.value = chem.name;
    state.selectChemical(chem.cas);
    clearDropdown();
  }

  function setActive(index) {
    if (!dropdown) return;
    const items = dropdown.querySelectorAll('.chem-dropdown-item');
    for (const item of items) item.classList.remove('active');
    if (index >= 0 && index < items.length) {
      activeIndex = index;
      items[index].classList.add('active');
      items[index].scrollIntoView({ block: 'nearest' });
    } else {
      activeIndex = -1;
    }
  }

  function showResults(query) {
    clearDropdown();
    const q = query.trim();
    if (!q) return;

    const results = searchChemicals(q, 20);
    dropdown = el('div', { className: 'chem-dropdown' });

    if (results.length === 0) {
      dropdown.appendChild(el('div', { className: 'chem-dropdown-empty' }, 'No results'));
    } else {
      for (const chem of results) {
        const item = el('div', { className: 'chem-dropdown-item' },
          el('span', { className: 'chem-name' }, chem.name),
          el('span', { className: 'chem-cas' }, chem.cas),
        );
        item.addEventListener('mousedown', (e) => {
          e.preventDefault(); // prevent blur before click registers
          selectItem(chem);
        });
        dropdown.appendChild(item);
      }
    }

    // Append to body so it escapes overflow:hidden ancestors
    document.body.appendChild(dropdown);

    // Position below the input using fixed coordinates
    const rect = input.getBoundingClientRect();
    dropdown.style.top = `${rect.bottom}px`;
    dropdown.style.left = `${rect.left}px`;
    dropdown.style.width = `${rect.width}px`;

    // Auto-highlight the first result so Enter selects it immediately
    if (results.length > 0) {
      setActive(0);
    }
  }

  input.addEventListener('input', () => {
    // Deselect the current chemical when the user edits the search text
    const selectedCas = state.userValues.chemicalSearch?.value;
    if (selectedCas) {
      const chem = getChemicalByCAS(selectedCas);
      if (!chem || input.value.trim() !== chem.name) {
        state.selectChemical(null);
      }
    }
    showResults(input.value);
  });

  input.addEventListener('keydown', (e) => {
    if (!dropdown) return;
    const items = dropdown.querySelectorAll('.chem-dropdown-item');
    const count = items.length;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActive(activeIndex < count - 1 ? activeIndex + 1 : 0);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActive(activeIndex > 0 ? activeIndex - 1 : count - 1);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (activeIndex >= 0 && activeIndex < count) {
        const results = searchChemicals(input.value.trim(), 20);
        if (results[activeIndex]) selectItem(results[activeIndex]);
      }
    } else if (e.key === 'Escape') {
      clearDropdown();
    }
  });

  input.addEventListener('focus', () => {
    input.select();
  });

  input.addEventListener('blur', () => {
    // Small delay so mousedown on item fires before removal
    setTimeout(clearDropdown, 150);
  });

  // Close on outside click
  document.addEventListener('click', (e) => {
    if (!wrapper.contains(e.target) && !(dropdown && dropdown.contains(e.target))) clearDropdown();
  });

  // Pre-populate with currently selected chemical name
  const selectedCas = state.userValues.chemicalSearch?.value;
  if (selectedCas) {
    const chem = getChemicalByCAS(selectedCas);
    if (chem) input.value = chem.name;
  }

  wrapper.appendChild(input);
  return wrapper;
}

/**
 * Build phase display as a colored badge.
 */
function buildPhaseDisplay(propId, state) {
  const badge = el('span', {
    id: `output-${propId}`,
    className: 'phase-badge',
    dataset: { propId },
  });
  return badge;
}

/**
 * Build a dropdown for selection properties.
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
    const units = getPipeUnits(standard);
    for (const opt of options) {
      if (opt) select.appendChild(el('option', { value: opt }, units ? `${opt} ${units}` : opt));
    }
    return;
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

  const current = state.userValues[propId];
  if (current?.value != null) input.value = current.value;

  input.addEventListener('input', () => {
    const raw = input.value;
    const val = raw === '' ? null : +raw;
    const sf = raw === '' ? undefined : countSigFigs(raw);
    state.setValue(propId, val, state.userValues[propId]?.unit, sf);
  });

  return input;
}

/**
 * Build a number input for overridable calculated properties.
 * Empty input falls through to normal calculation; a value pins/overrides.
 */
function buildOverrideInput(propId, state) {
  const input = el('input', {
    type: 'number',
    id: `input-${propId}`,
    className: 'field-input-control number-input override-input',
    step: 'any',
    dataset: { propId },
  });

  const current = state.userValues[propId];
  if (current?.value != null && current.value !== '') input.value = current.value;

  input.addEventListener('input', () => {
    const raw = input.value;
    const val = raw === '' ? null : +raw;
    const sf = raw === '' ? undefined : countSigFigs(raw);
    state.setValue(propId, val, state.userValues[propId]?.unit, sf);
  });

  return input;
}

/**
 * Build a read-only output display for calculated properties.
 */
function buildOutputDisplay(propId, state) {
  const span = el('span', {
    id: `output-${propId}`,
    className: 'field-output empty',
    dataset: { propId },
  }, '\u2014');
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

  const currentUnit = state.userValues[propId]?.unit || def.defaultUnit;
  if (currentUnit) select.value = currentUnit;

  // Auto-size after first paint and on change
  requestAnimationFrame(() => autoSizeSelect(select));
  select.addEventListener('change', () => {
    state.setUnit(propId, select.value);
    autoSizeSelect(select);
    // Sync hero unit select if one exists for this property
    const heroSelect = document.querySelector(`[data-hero-unit="${propId}"]`);
    if (heroSelect) {
      heroSelect.value = select.value;
      autoSizeSelect(heroSelect);
    }
  });

  return select;
}

/**
 * Build method selector dropdown (compact style with gear prefix).
 */
function buildMethodSelector(propId, state) {
  const def = REGISTRY[propId];
  const methods = def.methods || {};
  const keys = Object.keys(methods);
  if (keys.length <= 1) return el('span');

  const wrapper = el('div', { className: 'method-selector-group', dataset: { methodGroup: propId } });

  const select = el('select', {
    className: 'method-selector',
    dataset: { propId },
  });

  for (const key of keys) {
    const label = methods[key].legacy
      ? '\u2699 ' + methods[key].name + ' (legacy)'
      : '\u2699 ' + methods[key].name;
    select.appendChild(el('option', { value: key }, label));
  }

  const current = state.activeMethodMap[propId];
  if (current) select.value = current;

  requestAnimationFrame(() => autoSizeSelect(select));
  select.addEventListener('change', () => {
    state.setMethod(propId, select.value);
    autoSizeSelect(select);
  });

  wrapper.appendChild(select);
  return wrapper;
}

/**
 * Update all output displays with current results.
 */
function updateAll(state) {
  // Clean up previous error hint elements
  for (const hint of document.querySelectorAll('.field-error-hint')) hint.remove();

  for (const [propId, result] of Object.entries(state.results)) {
    // Update standard output displays
    const outputEl = document.getElementById(`output-${propId}`);
    if (outputEl) {
      if (propId === 'phase') {
        updatePhaseDisplay(outputEl, result);
      } else if (result.isValid) {
        outputEl.textContent = formatNumber(result.displayValue);
        outputEl.classList.remove('error', 'empty');
        outputEl.title = '';
      } else if (result.error) {
        // Dependency errors: show dash with tooltip + visible hint
        outputEl.textContent = '\u2014';
        outputEl.classList.remove('error');
        outputEl.classList.add('empty');
        outputEl.title = result.error.message || '';
        if (result.error.type === 'DEPENDENCY_ERROR' && result.error.message) {
          const hint = el('div', { className: 'field-error-hint' }, result.error.message);
          outputEl.parentNode.insertBefore(hint, outputEl.nextSibling);
        }
      } else {
        outputEl.textContent = '\u2014';
        outputEl.classList.remove('error');
        outputEl.classList.add('empty');
        outputEl.title = '';
      }
    }

    // Update field row styling
    const row = document.querySelector(`.field-row[data-prop-id="${propId}"]`);
    if (row) {
      row.classList.toggle('valid', result.isValid);
      row.classList.toggle('invalid', !result.isValid && result.error != null);
    }
  }

  // Sync method selectors with auto-selected methods and auto-badges
  updateMethodSelectors(state);

  // Update range warning badges
  updateWarnings(state);

  // Update source tooltips on field rows
  updateSourceTooltips(state);

  // Update override (pinned) field states
  updateOverrideFields(state);

  // Update results hero
  updateResultsHero(state);

  // Update chemical card
  updateChemicalCard(state);

  // Validate user inputs (red border on invalid)
  updateInputValidation(state);

  // Update fittings list
  updateFittingsList(state);

  // Update dependent dropdowns
  updateDependentDropdowns(state);

  // Update conditional unit dropdowns (SCFH/SCFM for air)
  updateConditionalUnits(state);

  // Sync unit system toggle and all unit selectors
  updateUnitSystemToggle(state);

  // Sync input values with state (e.g. after unit conversion)
  updateInputValues(state);

  // Sync theme toggle button
  updateThemeToggle(state);
}

/**
 * Sync method selector dropdowns with activeMethodMap (which may have been
 * updated by auto-selection in the solver).
 */
function updateMethodSelectors(state) {
  // Remove previous method-status badges
  const prevBadges = document.querySelectorAll('.method-status-badge');
  for (const b of prevBadges) b.remove();

  const groups = document.querySelectorAll('.method-selector-group');
  for (const group of groups) {
    const select = group.querySelector('.method-selector');
    if (!select) continue;

    const propId = select.dataset.propId;
    const current = state.activeMethodMap[propId];
    if (current && select.value !== current) {
      select.value = current;
      autoSizeSelect(select);
    }

    const autoSelected = !state.userMethodOverrides.has(propId);

    if (autoSelected) {
      group.appendChild(el('span', {
        className: 'method-status-badge status-auto',
        title: 'Automatically selected based on phase',
      }, 'auto'));
    } else {
      const badge = el('span', {
        className: 'method-status-badge status-pinned',
        title: 'Click to return to auto-selection',
      }, 'pinned \u00d7');
      badge.addEventListener('mousedown', (e) => {
        e.preventDefault();
        e.stopPropagation();
        state.clearMethodOverride(propId);
      });
      group.appendChild(badge);
    }
  }
}

/**
 * Display warning badges on fields whose results carry warnings (e.g. extrapolation).
 */
function updateWarnings(state) {
  // Remove previous warning badges and has-warning class
  const prevBadges = document.querySelectorAll('.warning-badge');
  for (const b of prevBadges) b.remove();
  const prevWarned = document.querySelectorAll('.field-row.has-warning');
  for (const r of prevWarned) r.classList.remove('has-warning');

  for (const [propId, result] of Object.entries(state.results)) {
    if (!result.warnings || result.warnings.length === 0) continue;

    const row = document.querySelector(`.field-row[data-prop-id="${propId}"]`);
    if (!row) continue;

    row.classList.add('has-warning');

    const label = row.querySelector('.field-label');
    if (!label) continue;

    const badge = el('span', {
      className: 'warning-badge',
      title: result.warnings.join('; '),
    }, 'extrapolated');
    label.appendChild(badge);
  }
}

/**
 * Update source citation tooltips on calculated property rows.
 * Shows method name + full reference on hover.
 */
function updateSourceTooltips(state) {
  const sources = getSources();

  // Dismiss popover before removing old badges
  hideSourcePopover();

  // Remove previous source badges
  const prevSourceBadges = document.querySelectorAll('.source-badge');
  for (const b of prevSourceBadges) b.remove();

  for (const [propId, result] of Object.entries(state.results)) {
    if (!result.isValid || !result.method) continue;

    const def = REGISTRY[propId];
    if (!def) continue;

    const method = def.methods?.[result.method];
    if (!method?.source) continue;

    const sourceEntry = sources?.[method.source];
    if (!sourceEntry) continue;

    const row = document.querySelector(`.field-row[data-prop-id="${propId}"]`);
    if (!row) continue;

    const label = row.querySelector('.field-label');
    if (!label) continue;

    const badge = el('span', {
      className: 'source-badge',
    }, method.source);
    label.appendChild(badge);

    // Bind rich popover hover instead of native title tooltip
    bindSourceBadge(badge, propId, result.method, state);
  }
}

/**
 * Update override (pinned) field states: badge visibility, row class,
 * placeholder with calculated value, and upstream bypassed indicators.
 */
function updateOverrideFields(state) {
  // Remove all previous bypassed badges
  const prevBadges = document.querySelectorAll('.bypassed-badge');
  for (const b of prevBadges) b.remove();

  // Collect which upstream fields are bypassed and by which pinned properties
  const bypassedBy = {}; // depId -> [pinned property names]

  for (const [propId, def] of Object.entries(REGISTRY)) {
    if (!def.allowUserOverride) continue;

    const overridden = state.isOverridden(propId);
    const row = document.querySelector(`.field-row[data-prop-id="${propId}"]`);
    if (!row) continue;

    // Toggle pinned state on row
    row.classList.toggle('is-pinned', overridden);

    // Show/hide pinned badge
    const badge = document.querySelector(`[data-pinned-badge="${propId}"]`);
    if (badge) badge.style.display = overridden ? '' : 'none';

    // Set placeholder to calculated value when NOT overridden
    const input = row.querySelector('.override-input');
    if (input) {
      const result = state.results[propId];
      if (!overridden && result?.isValid) {
        const displayUnit = state.userValues[propId]?.unit || def.defaultUnit;
        const displayVal = def.quantity && displayUnit
          ? fromSI(def.quantity, displayUnit, result.value)
          : result.value;
        input.placeholder = typeof displayVal === 'number'
          ? formatNumber(displayVal)
          : String(displayVal);
      } else if (!overridden) {
        input.placeholder = '';
      }
    }

    // Track upstream fields bypassed by this override
    if (overridden) {
      const methodKey = state.activeMethodMap[propId];
      const method = def.methods?.[methodKey];
      if (method?.inputs) {
        for (const depId of method.inputs) {
          if (!bypassedBy[depId]) bypassedBy[depId] = [];
          bypassedBy[depId].push(def.name);
        }
      }
    }
  }

  // Add bypassed badges with tooltip to upstream field labels
  for (const [depId, pinnedNames] of Object.entries(bypassedBy)) {
    const depRow = document.querySelector(`.field-row[data-prop-id="${depId}"]`);
    if (!depRow) continue;
    const label = depRow.querySelector('.field-label');
    if (!label) continue;
    const bypassBadge = el('span', {
      className: 'bypassed-badge',
      title: `${pinnedNames.join(', ')} pinned — this field is bypassed`,
    }, 'bypassed');
    label.appendChild(bypassBadge);
  }
}

/**
 * Update the phase display as a colored badge.
 */
function updatePhaseDisplay(el, result) {
  el.className = 'phase-badge';
  if (result.isValid && result.displayValue) {
    const phase = String(result.displayValue).toLowerCase();
    el.textContent = result.displayValue;
    el.classList.add(`phase-${phase}`);
  } else {
    el.textContent = '\u2014';
  }
}

/**
 * Update results hero values.
 */
function updateResultsHero(state) {
  const heroProps = ['pressureDropTotal', 'reynoldsNumber', 'frictionFactor'];

  for (const propId of heroProps) {
    const heroValue = document.querySelector(`.hero-value[data-prop-id="${propId}"]`);
    if (!heroValue) continue;

    const result = state.results[propId];
    if (result?.isValid) {
      heroValue.textContent = formatNumber(result.displayValue);
      heroValue.classList.remove('empty');
    } else {
      heroValue.textContent = '\u2014';
      heroValue.classList.add('empty');
    }
  }

  // Sync hero unit selects with current state
  for (const propId of ['pressureDropTotal']) {
    const heroSelect = document.querySelector(`[data-hero-unit="${propId}"]`);
    if (heroSelect) {
      const def = REGISTRY[propId];
      const currentUnit = state.userValues[propId]?.unit || def?.defaultUnit;
      if (currentUnit) heroSelect.value = currentUnit;
    }
  }

  // Pressure drop breakdown (pipe + fittings)
  const dpBreakdown = document.querySelector('[data-dp-breakdown]');
  if (dpBreakdown) {
    const pipeResult = state.results.pressureDropPipe;
    const fitResult = state.results.pressureDropFittings;
    const totalResult = state.results.pressureDropTotal;
    if (totalResult?.isValid && pipeResult?.isValid && fitResult?.isValid && fitResult.value > 0) {
      const def = REGISTRY.pressureDropTotal;
      const displayUnit = state.userValues.pressureDropTotal?.unit || def?.defaultUnit;
      const pipeDisplay = fromSI('pressureDifference', displayUnit, pipeResult.value);
      const fitDisplay = fromSI('pressureDifference', displayUnit, fitResult.value);
      dpBreakdown.textContent = `Pipe: ${formatNumber(pipeDisplay)} + Fittings: ${formatNumber(fitDisplay)}`;
      dpBreakdown.style.display = '';
    } else {
      dpBreakdown.style.display = 'none';
    }
  }

  // Reynolds number regime badge
  const reBadge = document.querySelector('[data-regime-badge]');
  if (reBadge) {
    const reResult = state.results.reynoldsNumber;
    if (reResult?.isValid) {
      const regime = flowRegimeLabel(reResult.displayValue);
      if (regime) {
        reBadge.textContent = regime.label;
        reBadge.className = `regime-badge regime-${regime.type}`;
        reBadge.style.display = '';
      } else {
        reBadge.style.display = 'none';
      }
    } else {
      reBadge.style.display = 'none';
    }
  }

  // Friction factor method chip
  const ffChip = document.querySelector('[data-method-chip]');
  if (ffChip) {
    const ffResult = state.results.frictionFactor;
    if (ffResult?.isValid) {
      const methodKey = state.activeMethodMap.frictionFactor;
      const methodDef = REGISTRY.frictionFactor?.methods?.[methodKey];
      if (methodDef) {
        ffChip.textContent = methodDef.name;
        ffChip.style.display = '';
      } else {
        ffChip.style.display = 'none';
      }
    } else {
      ffChip.style.display = 'none';
    }
  }
}

/**
 * Update chemical summary card.
 */
function updateChemicalCard(state) {
  const card = document.querySelector('[data-chem-card]');
  if (!card) return;

  const cas = state.userValues.chemicalSearch?.value;
  if (!cas) {
    card.style.display = 'none';
    return;
  }

  const chem = getChemicalByCAS(cas);
  if (!chem) {
    card.style.display = 'none';
    return;
  }

  card.style.display = '';

  // Sync search input text if it's empty (e.g. after lazy-load of chemicals data)
  const searchInput = document.getElementById('input-chemicalSearch');
  if (searchInput && !searchInput.value && chem.name) {
    searchInput.value = chem.name;
  }

  const nameEl = card.querySelector('[data-chem-card-name]');
  if (nameEl) nameEl.textContent = chem.name || '\u2014';

  const familyEl = card.querySelector('[data-chem-card-family]');
  if (familyEl) familyEl.textContent = chem.family?.value || '\u2014';

  const mwEl = card.querySelector('[data-chem-card-mw]');
  if (mwEl) {
    const mw = chem.molecularWeight?.value;
    mwEl.textContent = mw ? formatNumber(+mw) + ' g/mol' : '\u2014';
  }
}

/**
 * Mark user input fields with red border when they have invalid/missing values
 * that cause downstream errors.
 */
function updateInputValidation(state) {
  // Clear all previous invalid markers
  const prevInvalid = document.querySelectorAll('.input-invalid');
  for (const el of prevInvalid) {
    el.classList.remove('input-invalid');
  }

  // Check user-input fields: mark as invalid if value is null/empty
  for (const [propId, def] of Object.entries(REGISTRY)) {
    if (!def.isUserInput) continue;
    const val = state.userValues[propId]?.value;
    if (val != null && val !== '') continue;

    const row = document.querySelector(`.field-row[data-prop-id="${propId}"]`);
    if (row) {
      row.classList.add('input-invalid');
    }
  }
}

/**
 * Rebuild unit dropdowns for properties that have conditional units (e.g. SCFH/SCFM for air).
 * Also manages the SCF annotation line.
 */
function updateConditionalUnits(state) {
  const cas = state.userValues.chemicalSearch?.value || null;

  // Properties whose unit quantity has conditional entries
  for (const [quantity, condMap] of Object.entries(CONDITIONAL_UNITS)) {
    // Find all property fields whose quantity matches
    const selectors = document.querySelectorAll('.unit-selector');
    for (const select of selectors) {
      const propId = select.dataset.propId;
      const def = REGISTRY[propId];
      if (!def || def.quantity !== quantity) continue;

      const filtered = filteredUnitOptionsFor(quantity, cas);
      const currentUnit = select.value;

      // If current unit is conditional and no longer valid, fallback
      const condUnitKeys = Object.keys(condMap);
      if (condUnitKeys.includes(currentUnit) && !filtered.some(o => o.key === currentUnit)) {
        state.setUnit(propId, def.defaultUnit);
      }

      // Rebuild options
      const newUnit = state.userValues[propId]?.unit || def.defaultUnit;
      select.textContent = '';
      for (const opt of filtered) {
        select.appendChild(el('option', { value: opt.key }, opt.symbol));
      }
      select.value = newUnit;
      autoSizeSelect(select);
    }
  }

  // SCF annotation
  const annotation = document.querySelector('[data-scf-annotation]');
  if (annotation) {
    const massFlowUnit = state.userValues.massFlowRate?.unit;
    const isSCF = massFlowUnit === 'SCFH' || massFlowUnit === 'SCFM';
    if (isSCF) {
      const displayVal = state.userValues.massFlowRate?.value;
      if (displayVal != null && displayVal !== '') {
        const kghr = toSI('massRate', massFlowUnit, displayVal);
        annotation.textContent = `\u2248 ${formatNumber(kghr)} kg/hr`;
        annotation.style.display = '';
      } else {
        annotation.style.display = 'none';
      }
    } else {
      annotation.style.display = 'none';
    }
  }
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

/**
 * Sync unit system toggle active state and all unit selector dropdowns
 * with current state (needed after setUnitSystem bulk-changes units).
 */
function updateUnitSystemToggle(state) {
  // Sync toggle button active class
  const btns = document.querySelectorAll('.unit-system-btn');
  for (const btn of btns) {
    btn.classList.toggle('active', btn.dataset.unitSystem === state.unitSystem);
  }

  // Sync all .unit-selector dropdowns to match state
  const selectors = document.querySelectorAll('.unit-selector');
  for (const select of selectors) {
    const propId = select.dataset.propId;
    const def = REGISTRY[propId];
    if (!def) continue;
    const currentUnit = state.userValues[propId]?.unit || def.defaultUnit;
    if (currentUnit && select.value !== currentUnit) {
      select.value = currentUnit;
      autoSizeSelect(select);
    }
  }

  // Sync hero unit selects
  const heroSelects = document.querySelectorAll('[data-hero-unit]');
  for (const select of heroSelects) {
    const propId = select.dataset.heroUnit;
    const def = REGISTRY[propId];
    if (!def) continue;
    const currentUnit = state.userValues[propId]?.unit || def.defaultUnit;
    if (currentUnit && select.value !== currentUnit) {
      select.value = currentUnit;
      autoSizeSelect(select);
    }
  }
}

/**
 * Sync theme toggle button icon and apply theme to document.
 */
function updateThemeToggle(state) {
  applyTheme(state.theme);
  const btn = document.querySelector('[data-theme-btn]');
  if (btn) {
    // Show sun/moon based on resolved theme (not the setting)
    const resolved = state.theme === 'system'
      ? (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
      : state.theme;
    btn.innerHTML = THEME_SVGS[resolved];
    btn.classList.toggle('theme-sun', resolved === 'light');
    btn.classList.toggle('theme-moon', resolved === 'dark');
    btn.title = THEME_LABELS[state.theme];
  }
}

/**
 * Sync number input elements with state values (e.g. after unit conversion in setUnit).
 * Skips focused inputs to avoid disrupting user typing.
 */
function updateInputValues(state) {
  for (const [propId, entry] of Object.entries(state.userValues)) {
    if (entry.value == null) continue;
    const input = document.getElementById(`input-${propId}`);
    if (!input || input.type !== 'number') continue;
    // Don't overwrite while the user is typing
    if (document.activeElement === input) continue;
    // Display with user's sig figs if set, otherwise default formatting
    const displayVal = entry.sigFigs && isFinite(entry.value)
      ? roundToSigFigs(entry.value, entry.sigFigs)
      : isFinite(entry.value) ? formatNumber(entry.value) : entry.value;
    const stateStr = String(displayVal);
    if (input.value === stateStr) continue;
    input.value = stateStr;
  }
}
