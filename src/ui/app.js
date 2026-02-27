// Entry point: async init

import { loadChemicals } from '../data/chemicals.js';
import { loadPipeData } from '../data/pipe.js';
import { loadSources } from '../data/sources.js';
import { AppState } from './state.js';
import { buildApp } from './renderer.js';

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
    // Load data in parallel
    await Promise.all([
      loadChemicals(),
      loadPipeData(),
      loadSources(),
    ]);

    // Create state and build UI
    const state = new AppState();
    buildApp(root, state);
  } catch (err) {
    root.textContent = `Error loading application: ${err.message}`;
    console.error(err);
  }
}

init();
