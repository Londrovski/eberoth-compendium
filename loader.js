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
//   2. data.js resolves _dataReady immediately (no-op since Supabase migration)
//   3. app/* loads after data.js so EB namespace exists
//   4. EB.loadContent() is called inside EB.boot() after auth, not here
//
// Static data files in /data/ are archived and no longer loaded.
// All entity/session content comes from Supabase via EB.loadContent().

(function() {
  'use strict';

  const FOLDERS = [
    // app modules only — data comes from Supabase
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
    await loadScript(folder + '/_manifest.js');
    const files = window.MANIFEST;
    if (!Array.isArray(files)) {
      throw new Error('Manifest at ' + folder + '/_manifest.js did not set window.MANIFEST to an array');
    }
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
      await loadScript('data.js');
      await loadScript('app.js');
    } catch (err) {
      console.error('[Eberoth loader]', err);
    }
  }

  bootstrap();
})();
