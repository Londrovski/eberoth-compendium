// ===========================
// EBEROTH COMPENDIUM — BOOT
// ===========================
// Every behaviour lives in app/*.js modules registered on window.EB.
// loader.js loads those modules before this file.
//
// data.js (loaded just before this) kicks off an async Supabase fetch
// and stores the promise at window._dataReady. We await it here so
// that all globals (FACTIONS, NPCS, etc.) are populated before
// EB.init() runs and the app tries to render the map.
//
// The loading overlay (#loadingOverlay) is dismissed here once the
// fetch settles — success or failure both clear it so the user is
// never left staring at the spinner.

(async function () {
  function dismissLoader() {
    var overlay = document.getElementById('loadingOverlay');
    if (!overlay) return;
    overlay.classList.add('fade-out');
    // Remove from DOM after the CSS transition finishes (0.5s)
    setTimeout(function () {
      if (overlay.parentNode) overlay.parentNode.removeChild(overlay);
    }, 550);
  }

  try {
    if (window._dataReady) await window._dataReady;
  } catch (err) {
    console.error('[Eberoth] Content fetch failed:', err);
    // Boot anyway — map will be empty but the app won't crash.
  }

  dismissLoader();

  if (window.EB && typeof EB.init === 'function') EB.init();
  else console.error('[Eberoth] EB.init not defined — app modules failed to load.');
})();
