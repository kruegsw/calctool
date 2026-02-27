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
  let activeRow = null;
  let hoverTimer = null;
  const HOVER_DELAY = 300; // ms before highlights appear

  root.addEventListener('mouseenter', (e) => {
    const row = e.target.closest('.field-row');
    if (!row || row === activeRow) return;

    // Clear previous highlights and pending timer
    clearHighlights(root);
    clearTimeout(hoverTimer);
    activeRow = row;

    const propId = row.dataset.propId;
    if (!propId) return;

    hoverTimer = setTimeout(() => {
      // Verify mouse is still on this row
      if (activeRow !== row) return;

      // Get dependencies and dependents
      const deps = getTransitiveDependencies(state.registry, propId, state.activeMethodMap);
      const dependents = getTransitiveDependents(state.registry, propId, state.activeMethodMap);

      // Highlight dependency rows (inputs)
      for (const depId of deps) {
        const depRow = root.querySelector(`.field-row[data-prop-id="${depId}"]`);
        if (depRow) {
          depRow.classList.add('highlight-dependency');
          addHoverLabel(depRow, 'input', 'highlight-label-input');
        }
      }

      // Highlight dependent rows (outputs)
      for (const depId of dependents) {
        const depRow = root.querySelector(`.field-row[data-prop-id="${depId}"]`);
        if (depRow) {
          depRow.classList.add('highlight-dependent');
          addHoverLabel(depRow, 'output', 'highlight-label-output');
        }
      }

      // Mark the hovered row itself
      row.classList.add('highlight-self');
    }, HOVER_DELAY);
  }, true);

  root.addEventListener('mouseleave', (e) => {
    const row = e.target.closest('.field-row');
    if (!row) return;

    // Only clear if we're leaving the active row
    if (row === activeRow) {
      clearTimeout(hoverTimer);
      clearHighlights(root);
      activeRow = null;
    }
  }, true);
}

function addHoverLabel(row, text, className) {
  const fieldLabel = row.querySelector('.field-label');
  if (!fieldLabel) return;
  const label = document.createElement('span');
  label.className = `highlight-label ${className}`;
  label.textContent = text;
  fieldLabel.appendChild(label);
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
