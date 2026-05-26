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
//   2. All data leaves finish before data.js (the finaliser)
//   3. app/* loads after data so modules can read PLAYERS/FACTIONS/etc.
//   4. data.js + app.js are loaded at the end
//
// See README.md for architecture.

(function() {
  'use strict';

  // Folders to load, in order. Manifest paths are relative to repo root.
  // Each manifest declares: window.MANIFEST = ['file-a', 'file-b', ...]
  // The loader then injects <script src="{folder}/{file}.js"> for each.
  const FOLDERS = [
    // --- data ---
    'data/factions',
    'data/players',
    'data/npcs',
    'data/lore',
    'data/sessions',
    'data/backstory/kalvorn',
    'data/backstory/azrael',
    'data/backstory/dirk',
    // legacy passphrase-gated personal sections — ignored by the new
    // app but still loaded so the old surface doesn't error if something
    // references it. Safe to remove later.
    'data/personal/kalvorn',
    'data/personal/azrael',
    'data/personal/dirk',
    // --- app modules (must load after data so they can read globals) ---
    'app'
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
      // All content + app modules loaded. Run the finaliser, then boot.
      await loadScript('data.js');
      await loadScript('app.js');
    } catch (err) {
      console.error('[Eberoth loader]', err);
    }
  }

  bootstrap();
})();
