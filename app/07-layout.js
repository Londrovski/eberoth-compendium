// ===========================
// RETIRED — Phase C Commit 2 (2026-05-28)
// ===========================
// This file has been replaced by:
//
//   app/07-layout-config.js     — LAYOUT constants, clusterLayout, CLUSTER_PRIORITY
//   app/07-layout-slots.js      — slot allocator (row/grid/ring/house) + collision resolver
//   app/07-layout-default.js    — clusterOf, shiftedLayout, defaultLayout, currentPositions, getAnchors
//   app/07-layout-positions.js  — Supabase I/O (load/save/cluster offsets/home/push)
//
// '07-layout' has been removed from app/_manifest.js so this file is
// no longer loaded at runtime. The stub here is a no-op safety net in
// case anyone re-adds the old name to the manifest or sources the
// file directly. Proper git rm deferred to Phase E cleanup.
(function () {
  console.warn('[Eberoth] app/07-layout.js is retired. See 07-layout-{config,slots,default,positions}.js');
})();
