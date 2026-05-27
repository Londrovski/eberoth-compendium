// Manifest for app/
// Order = load order. Each module attaches functions/state to window.EB.
// 00-supabase initialises the client and must load first so other
// modules can rely on EB.sb at boot time.
// 01-content registers EB.loadContent() — called by data.js to fetch
// all entities and sessions from Supabase before the app boots.

window.MANIFEST = [
  '00-supabase',
  '01-content',
  '01-namespace',
  '02-util',
  '03-auth',
  '04-storage',
  '05-portraits',
  '06-landing',
  '07-layout',
  '08-mentions',
  '09-detail',
  '10-map-render',
  '11-map-drag',
  '12-map-tints',
  '13-map-pan-zoom',
  '14-drawer',
  '15-threads',
  '16-notes',
  '17-boot'
];
