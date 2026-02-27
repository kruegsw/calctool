// Dependency hover highlighting
// When hovering over a property field, highlight its dependencies and dependents.
// Uses CSS transitions for smooth fade in/out.
// Shows "input" / "output" labels on highlighted rows to explain the relationship.

import { getTransitiveDependencies, getTransitiveDependents } from '../engine/graph.js';

/**
 * Set up hover highlighting on property field rows.
 * @param {HTMLElement} root
 * @param {import('./state.js').AppState} state
 */
export function setupHoverHighlighting(root, state) {
  let activeEl = null;
  let hoverTimer = null;
  const HOVER_DELAY = 300; // ms before highlights appear

  root.addEventListener('mouseenter', (e) => {
    const el = e.target.closest('.field-row') || e.target.closest('.hero-item')
             || e.target.closest('.fittings-list-item[data-darby]');
    if (!el || el === activeEl) return;

    // Clear previous highlights and pending timer
    clearHighlights(root);
    clearTimeout(hoverTimer);
    activeEl = el;

    // Darby fitting items highlight Re + Dnom as inputs
    if (el.classList.contains('fittings-list-item')) {
      hoverTimer = setTimeout(() => {
        if (activeEl !== el) return;
        for (const depId of ['reynoldsNumber', 'pipeNominalDiameter']) {
          const depEl = findPropElement(root, depId);
          if (depEl) {
            depEl.classList.add('highlight-dependency');
            addHoverLabel(depEl, 'input', 'highlight-label-input');
          }
        }
        el.classList.add('highlight-self');
      }, HOVER_DELAY);
      return;
    }

    const propId = el.dataset.propId || el.dataset.heroId;
    if (!propId) return;

    hoverTimer = setTimeout(() => {
      // Verify mouse is still on this element
      if (activeEl !== el) return;

      // Get dependencies and dependents
      const deps = getTransitiveDependencies(state.registry, propId, state.activeMethodMap);
      const dependents = getTransitiveDependents(state.registry, propId, state.activeMethodMap);

      // Highlight dependency elements (inputs)
      for (const depId of deps) {
        const depEl = findPropElement(root, depId);
        if (depEl) {
          depEl.classList.add('highlight-dependency');
          addHoverLabel(depEl, 'input', 'highlight-label-input');
        }
      }

      // Highlight dependent elements (outputs)
      for (const depId of dependents) {
        const depEl = findPropElement(root, depId);
        if (depEl) {
          depEl.classList.add('highlight-dependent');
          addHoverLabel(depEl, 'output', 'highlight-label-output');
        }
      }

      // Mark the hovered element itself
      el.classList.add('highlight-self');
    }, HOVER_DELAY);
  }, true);

  root.addEventListener('mouseleave', (e) => {
    const el = e.target.closest('.field-row') || e.target.closest('.hero-item')
             || e.target.closest('.fittings-list-item[data-darby]');
    if (!el) return;

    // Only clear if we're leaving the active element
    if (el === activeEl) {
      clearTimeout(hoverTimer);
      clearHighlights(root);
      activeEl = null;
    }
  }, true);
}

/** Find the DOM element for a property — field-row or hero-item. */
function findPropElement(root, propId) {
  return root.querySelector(`.field-row[data-prop-id="${propId}"]`)
      || root.querySelector(`.hero-item[data-hero-id="${propId}"]`);
}

function addHoverLabel(el, text, className) {
  // Works for both .field-row (.field-label) and .hero-item (.hero-label)
  const labelEl = el.querySelector('.field-label') || el.querySelector('.hero-label');
  if (!labelEl) return;
  const label = document.createElement('span');
  label.className = `highlight-label ${className}`;
  label.textContent = text;
  labelEl.appendChild(label);
}

function clearHighlights(root) {
  const highlighted = root.querySelectorAll('.highlight-dependency, .highlight-dependent, .highlight-self');
  for (const el of highlighted) {
    el.classList.remove('highlight-dependency', 'highlight-dependent', 'highlight-self');
  }
  // Remove all hover labels
  const labels = root.querySelectorAll('.highlight-label');
  for (const el of labels) el.remove();
}
