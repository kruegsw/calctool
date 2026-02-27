// Source popover: rich hover popover for source citation badges
// Shows method name, description, assumption, valid range (Perry), and reference.

import { REGISTRY, getPerryRange } from '../engine/registry.js';
import { PERRY_RANGE_MAP } from '../engine/solver.js';
import { getSources } from '../data/sources.js';

let popoverEl = null;
let showTimer = null;
let hideTimer = null;

/** Create an element helper (matches renderer.js pattern). */
function el(tag, cls, text) {
  const e = document.createElement(tag);
  if (cls) e.className = cls;
  if (text) e.textContent = text;
  return e;
}

/**
 * Create the singleton popover element. Called once from buildApp().
 */
export function initSourcePopover() {
  popoverEl = el('div', 'source-popover');
  popoverEl.appendChild(el('div', 'source-popover-method'));
  popoverEl.appendChild(el('div', 'source-popover-description'));
  popoverEl.appendChild(el('div', 'source-popover-assumption'));
  popoverEl.appendChild(el('div', 'source-popover-range'));
  popoverEl.appendChild(el('div', 'source-popover-reference'));
  document.body.appendChild(popoverEl);

  // Keep popover open when mousing into it
  popoverEl.addEventListener('mouseenter', () => {
    clearTimeout(hideTimer);
  });
  popoverEl.addEventListener('mouseleave', () => {
    scheduleHide();
  });

  // Hide on scroll
  window.addEventListener('scroll', () => hideSourcePopover(), true);
}

/**
 * Bind hover events on a source badge to show the popover.
 * @param {HTMLElement} badge - The .source-badge element
 * @param {string} propId - Property ID (e.g. 'density')
 * @param {string} methodKey - Method key (e.g. 'perryLiquidCorrelation')
 * @param {Object} state - App state (for chemData access)
 */
export function bindSourceBadge(badge, propId, methodKey, state) {
  badge.addEventListener('mouseenter', () => {
    clearTimeout(hideTimer);
    clearTimeout(showTimer);
    showTimer = setTimeout(() => showPopover(badge, propId, methodKey, state), 200);
  });

  badge.addEventListener('mouseleave', () => {
    clearTimeout(showTimer);
    scheduleHide();
  });
}

/**
 * Hide the popover immediately. Exported so renderer can dismiss during cleanup.
 */
export function hideSourcePopover() {
  clearTimeout(showTimer);
  clearTimeout(hideTimer);
  if (popoverEl) popoverEl.classList.remove('visible');
}

function scheduleHide() {
  clearTimeout(hideTimer);
  hideTimer = setTimeout(() => hideSourcePopover(), 300);
}

function showPopover(badge, propId, methodKey, state) {
  if (!popoverEl) return;

  const def = REGISTRY[propId];
  const method = def?.methods?.[methodKey];
  if (!method) return;

  const sources = getSources();
  const sourceEntry = sources?.[method.source];

  // Populate sections
  const methodEl = popoverEl.querySelector('.source-popover-method');
  const descEl = popoverEl.querySelector('.source-popover-description');
  const assumEl = popoverEl.querySelector('.source-popover-assumption');
  const rangeEl = popoverEl.querySelector('.source-popover-range');
  const refEl = popoverEl.querySelector('.source-popover-reference');

  methodEl.textContent = method.name || methodKey;
  descEl.textContent = method.description || '';
  descEl.style.display = method.description ? '' : 'none';
  assumEl.textContent = method.assumption ? `Assumes: ${method.assumption}` : '';
  assumEl.style.display = method.assumption ? '' : 'none';

  // Perry range
  const rangeKey = `${propId}:${methodKey}`;
  const rangeEntry = PERRY_RANGE_MAP[rangeKey];
  if (rangeEntry && state.chemData) {
    const range = getPerryRange(state.chemData, rangeEntry.phase, rangeEntry.perryProp);
    if (range) {
      rangeEl.textContent = `Valid: ${Math.round(range.Tmin)}\u2013${Math.round(range.Tmax)} K`;
      rangeEl.style.display = '';
    } else {
      rangeEl.style.display = 'none';
    }
  } else {
    rangeEl.style.display = 'none';
  }

  refEl.textContent = sourceEntry?.reference || '';
  refEl.style.display = sourceEntry?.reference ? '' : 'none';

  // Position above badge, fall back to below
  const rect = badge.getBoundingClientRect();
  popoverEl.style.left = '0';
  popoverEl.style.top = '0';
  popoverEl.classList.add('visible');

  const popRect = popoverEl.getBoundingClientRect();
  let top = rect.top - popRect.height - 6;
  let left = rect.left + rect.width / 2 - popRect.width / 2;

  // Fall back to below if not enough space above
  if (top < 4) {
    top = rect.bottom + 6;
  }

  // Clamp horizontal
  left = Math.max(4, Math.min(left, window.innerWidth - popRect.width - 4));

  popoverEl.classList.remove('visible');
  popoverEl.style.top = `${top}px`;
  popoverEl.style.left = `${left}px`;

  // Trigger transition
  requestAnimationFrame(() => {
    popoverEl.classList.add('visible');
  });
}
