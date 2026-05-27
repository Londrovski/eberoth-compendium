// Orchestrator. Two phases:
//   init  — sync wiring of landing + topbar + an async session check.
//   boot  — once a bucket is known, show app, init modules, fetch
//           positions from Supabase, then render.
//
// boot() may run more than once (e.g. after sign-in) so module init
// is guarded by a flag.
(function () {
  var modulesInited = false;

  EB.init = function () {
    EB.initLanding();
    EB.checkSession().then(function () { EB.boot(); });
  };

  EB.boot = function () {
    var b = EB.currentBucket();
    if (!b) { EB.showLanding(); return; }
    EB.showApp();
    EB.initLayout();  // safe to call repeatedly; reads current bucket
    if (!modulesInited) {
      modulesInited = true;
      EB.initDetail();
      EB.initMapRender();
      EB.initPanZoom();
      EB.initDrawer();
      EB.initThreads();
      EB.initNotes();
    }
    // Async — fetch globals + per-user positions, then render.
    EB.loadPositionsFromSupabase().then(function () {
      EB.renderMap();
      EB.centerInitial();
    }, function (err) {
      console.error('[Eberoth] Failed to load positions', err);
      EB.renderMap();
      EB.centerInitial();
    });
  };
})();
