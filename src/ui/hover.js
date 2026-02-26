// Dependency hover highlighting
// When hovering over a property field, highlight its dependencies and dependents.

import { getTransitiveDependencies, getTransitiveDependents } from '../engine/graph.js';

/**
 * Set up hover highlighting on property field rows.
 * @param {HTMLElement} root
 * @param {import('./state.js').AppState} state
 */
export function setupHoverHighlighting(root, state) {
  root.addEventListener('mouseenter', (e) => {
    const row = e.target.closest('.field-row');
    if (!row) return;

    const propId = row.dataset.propId;
    if (!propId) return;

    // Get dependencies and dependents
    const deps = getTransitiveDependencies(state.registry, propId, state.activeMethodMap);
    const dependents = getTransitiveDependents(state.registry, propId, state.activeMethodMap);

    // Highlight dependency rows
    for (const depId of deps) {
      const depRow = root.querySelector(`.field-row[data-prop-id="${depId}"]`);
      if (depRow) depRow.classList.add('highlight-dependency');
    }

    // Highlight dependent rows
    for (const depId of dependents) {
      const depRow = root.querySelector(`.field-row[data-prop-id="${depId}"]`);
      if (depRow) depRow.classList.add('highlight-dependent');
    }

    // Mark the hovered row itself
    row.classList.add('highlight-self');
  }, true);

  root.addEventListener('mouseleave', (e) => {
    const row = e.target.closest('.field-row');
    if (!row) return;

    // Clear all highlights
    const highlighted = root.querySelectorAll('.highlight-dependency, .highlight-dependent, .highlight-self');
    for (const el of highlighted) {
      el.classList.remove('highlight-dependency', 'highlight-dependent', 'highlight-self');
    }
  }, true);
}
