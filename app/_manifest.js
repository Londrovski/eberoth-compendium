// Manifest for app/
// Order = load order. Each module attaches functions/state to window.EB.
// Boot module is last; it orchestrates the rest.
//
// Dependency chain (informal):
//   namespace -> util / auth / storage -> portraits / landing
//                  -> layout (reads data globals + auth)
//                  -> mentions / detail (cross-reference at call time)
//                  -> map-render / map-drag / map-tints / map-pan-zoom
//                  -> drawer / threads / notes
//                  -> boot (calls everyone's init)

window.MANIFEST = [
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
