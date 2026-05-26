// ===========================
// EBEROTH COMPENDIUM — DATA FINALISER
// ===========================
// All content self-registers from /data/ leaf files.
// This file ensures the globals exist (in case any folder is empty),
// normalises each entity's `kind` field, and derives mention-able
// fields on sessions so they can be referenced from notes.
//
// See README.md for architecture.

// --- Globals ---------------------------------------------------
window.FACTIONS       = window.FACTIONS       || [];
window.PLAYERS        = window.PLAYERS        || [];
window.NPCS           = window.NPCS           || [];
window.LORE           = window.LORE           || [];
window.SESSIONS       = window.SESSIONS       || [];
window.BACKSTORY      = window.BACKSTORY      || [];
// Legacy — retained so the old app.js keeps working during the port.
window.PARTY_NOTES    = window.PARTY_NOTES    || [];
window.PERSONAL_NOTES = window.PERSONAL_NOTES || [];

// --- Kind normalisation ----------------------------------------
// Every map-renderable entity has a `kind` field. Mention dropdown
// groups by it; renderer dispatches visual treatment on it.
FACTIONS .forEach(e => { e.kind = e.kind || 'faction';   });
PLAYERS  .forEach(e => { e.kind = e.kind || 'player';    });
NPCS     .forEach(e => { e.kind = e.kind || 'npc';       });
LORE     .forEach(e => { e.kind = e.kind || 'lore';      });
BACKSTORY.forEach(e => { e.kind = e.kind || 'backstory'; });

// --- Sessions: sort + derive mention-able fields ---------------
SESSIONS.sort((a, b) => a.number - b.number);
SESSIONS.forEach(s => {
  s.kind  = 'session';
  s.id    = s.id    || ('s' + s.number);
  s.name  = s.name  || ('Session ' + s.number);
  s.sub   = s.sub   || s.rowSummary || s.date || '';
  // body: plain-text version of the summary bullets, used in the
  // mention dropdown preview and the detail panel.
  if (!s.body && Array.isArray(s.summary)) {
    s.body = s.summary
      .map(line => line.replace(/<\/?strong>/g, ''))
      .join('\n\n');
  }
});
