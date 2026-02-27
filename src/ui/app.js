// Entry point: async init

import { loadChemicals } from '../data/chemicals.js';
import { loadPipeData } from '../data/pipe.js';
import { loadFittingsData } from '../data/fittings.js';
import { loadSources } from '../data/sources.js';
import { AppState } from './state.js';
import { buildApp } from './renderer.js';
import { deserializeState, syncURL } from './urlState.js';

function showLoadingSkeleton(root) {
  root.textContent = '';

  // Accent strip
  const strip = document.createElement('div');
  strip.className = 'accent-strip';
  root.appendChild(strip);

  const skeleton = document.createElement('div');
  skeleton.className = 'loading-skeleton';

  const header = document.createElement('div');
  header.className = 'shimmer-header';
  skeleton.appendChild(header);

  const subtitle = document.createElement('div');
  subtitle.className = 'shimmer-subtitle';
  skeleton.appendChild(subtitle);

  for (let i = 0; i < 5; i++) {
    const card = document.createElement('div');
    card.className = 'shimmer-card';
    skeleton.appendChild(card);
  }

  root.appendChild(skeleton);
}

async function init() {
  const root = document.getElementById('app');
  showLoadingSkeleton(root);

  try {
    // Load small data files eagerly (pipe + fittings + sources = ~80KB)
    await Promise.all([
      loadPipeData(),
      loadFittingsData(),
      loadSources(),
    ]);

    // Create state and restore from URL if present
    const state = new AppState();
    deserializeState(window.location.search, state);

    // Build UI immediately — chemical search gracefully returns empty until loaded
    buildApp(root, state);
    state.subscribe(() => syncURL(state));

    // Lazy-load chemicals.json (3.8MB) in background, then refresh
    loadChemicals().then(() => {
      state.recalculate();
    });
  } catch (err) {
    root.textContent = `Error loading application: ${err.message}`;
    console.error(err);
  }
}

init();
