// ===========================
// EBEROTH COMPENDIUM — DATA FINALISER
// ===========================
// Previously this file populated globals from static JS files.
// Now it just initialises empty globals and resolves _dataReady immediately.
// EB.loadContent() is called later by EB.boot() — after auth is established —
// so that Supabase RLS has a valid JWT before any queries run.
//
// The static data files in /data/ are no longer loaded by the loader.
// They can be deleted once the Supabase path is confirmed stable.

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

// Resolve immediately — EB.boot() will call EB.loadContent() after auth.
window._dataReady = Promise.resolve();
