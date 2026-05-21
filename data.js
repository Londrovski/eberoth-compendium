// ===========================
// EBEROTH COMPENDIUM — DATA FINALISER
// ===========================
// All content self-registers from /data/ leaf files.
// This file just ensures the globals exist (in case any folder is empty)
// and applies any final normalisation (e.g. session ordering).
// See README.md for architecture.

window.FACTIONS       = window.FACTIONS       || [];
window.PLAYERS        = window.PLAYERS        || [];
window.LORE           = window.LORE           || [];
window.SESSIONS       = window.SESSIONS       || [];
window.PARTY_NOTES    = window.PARTY_NOTES    || [];
window.PERSONAL_NOTES = window.PERSONAL_NOTES || [];

// Sessions can be added in any order — sort by number so they always
// render chronologically.
SESSIONS.sort((a, b) => a.number - b.number);
