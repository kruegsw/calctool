// Entry point: async init

import { loadChemicals } from '../data/chemicals.js';
import { loadPipeData } from '../data/pipe.js';
import { AppState } from './state.js';
import { buildApp } from './renderer.js';

async function init() {
  // Show loading state
  const root = document.getElementById('app');
  root.textContent = 'Loading data...';

  try {
    // Load data in parallel
    await Promise.all([
      loadChemicals(),
      loadPipeData(),
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
