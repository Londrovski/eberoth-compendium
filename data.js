// ===========================
// EBEROTH COMPENDIUM — DATA FINALISER
// ===========================
// Previously this file populated globals from static JS files.
// Now it triggers EB.loadContent() — an async fetch from Supabase —
// and sets window._dataReady to a Promise that app.js awaits before
// calling EB.init().
//
// The static data files in /data/ are no longer loaded by the loader
// (their manifest entries still exist but this file supersedes them).
// They can be deleted once this path is confirmed stable.

// Initialise globals so any module that checks them before the fetch
// resolves doesn't crash.
window.FACTIONS       = window.FACTIONS       || [];
window.PLAYERS        = window.PLAYERS        || [];
window.NPCS           = window.NPCS           || [];
window.LORE           = window.LORE           || [];
window.SESSIONS       = window.SESSIONS       || [];
window.BACKSTORY      = window.BACKSTORY      || [];
window.PARTY_NOTES    = window.PARTY_NOTES    || [];
window.PERSONAL_NOTES = window.PERSONAL_NOTES || [];

// Kick off the Supabase fetch. app.js awaits this promise.
window._dataReady = (async function () {

  if (!window.EB || typeof EB.loadContent !== 'function') {
    console.error('[Eberoth] EB.loadContent not available — app modules may not have loaded.');
    return;
  }

  await EB.loadContent();

  // --- Post-fetch normalisations (mirrors the old static finaliser) ---

  FACTIONS .forEach(function (e) { e.kind = e.kind || 'faction';   });
  PLAYERS  .forEach(function (e) { e.kind = e.kind || 'player';    });
  NPCS     .forEach(function (e) { e.kind = e.kind || 'npc';       });
  LORE     .forEach(function (e) { e.kind = e.kind || 'lore';      });
  BACKSTORY.forEach(function (e) { e.kind = e.kind || 'backstory'; });

  SESSIONS.sort(function (a, b) { return a.number - b.number; });
  SESSIONS.forEach(function (s) {
    s.kind  = 'session';
    s.id    = s.id    || ('s' + s.number);
    s.name  = s.name  || ('Session ' + s.number);
    s.sub   = s.sub   || s.rowSummary || s.date || '';
    if (!s.body && Array.isArray(s.summary)) {
      s.body = s.summary
        .map(function (line) { return line.replace(/<\/?strong>/g, ''); })
        .join('\n\n');
    }
  });

})();
