// ===========================
// EBEROTH COMPENDIUM — BOOT
// ===========================
// Every behaviour lives in app/*.js modules registered on window.EB.
// loader.js loads those modules before this file. All this file does
// is hand control to EB.init(), which decides between the landing
// page and the app proper.

if (window.EB && typeof EB.init === 'function') EB.init();
else console.error('[Eberoth] EB.init not defined — app modules failed to load.');
