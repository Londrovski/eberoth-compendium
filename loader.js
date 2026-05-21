// ===========================
// EBEROTH COMPENDIUM — LOADER
// ===========================
// Reads per-folder _manifest.js files, injects a <script> tag for each
// entry, and finally loads data.js + app.js once everything has loaded.
//
// Adding new content = add ONE filename to the relevant _manifest.js.
// No edit to index.html needed.
//
// Load order rules enforced here:
//   1. All leaf files in a manifest load (in declared order) before
//      the next manifest
//   2. All leaves finish before data.js (the finaliser)
//   3. data.js finishes before app.js
//
// See README.md for architecture.

(function() {
  'use strict';

  // Folders to load, in order. Manifest paths are relative to repo root.
  // Each manifest declares: window.MANIFEST = ['file-a', 'file-b', ...]
  // The loader then injects <script src="{folder}/{file}.js"> for each.
  const FOLDERS = [
    'data/factions',
    'data/players',
    'data/lore',
    'data/sessions',
    'data/personal/kalvorn',
    'data/personal/azrael',
    'data/personal/dirk'
  ];

  function loadScript(src) {
    return new Promise((resolve, reject) => {
      const s = document.createElement('script');
      s.src = src;
      s.onload = () => resolve(src);
      s.onerror = () => reject(new Error('Failed to load: ' + src));
      document.head.appendChild(s);
    });
  }

  async function loadFolder(folder) {
    // Load the manifest, which sets window.MANIFEST to an array of filenames
    await loadScript(folder + '/_manifest.js');
    const files = window.MANIFEST;
    if (!Array.isArray(files)) {
      throw new Error('Manifest at ' + folder + '/_manifest.js did not set window.MANIFEST to an array');
    }
    // Clear it before iterating so the next folder's manifest starts clean
    window.MANIFEST = null;

    for (const file of files) {
      await loadScript(folder + '/' + file + '.js');
    }
  }

  async function bootstrap() {
    try {
      for (const folder of FOLDERS) {
        await loadFolder(folder);
      }
      // All content loaded — now the finaliser, then the renderer
      await loadScript('data.js');
      await loadScript('app.js');
    } catch (err) {
      console.error('[Eberoth loader]', err);
    }
  }

  bootstrap();
})();
