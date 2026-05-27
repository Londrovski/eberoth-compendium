// Orchestrator. boot() may run more than once — e.g. after sign-in, or
// after DM toggles view-as. initLayout + loadPositions + render are
// run every time; one-off module wiring is guarded.
(function () {
  var modulesInited = false;

  EB.init = function () {
    EB.initLanding();
    EB.checkSession().then(function () { EB.boot(); });
  };

  EB.boot = function () {
    var realBucket = EB.actualBucket();
    if (!realBucket) { EB.showLanding(); return; }
    EB.showApp();
    EB.initLayout();
    if (!modulesInited) {
      modulesInited = true;
      EB.initDetail();
      EB.initMapRender();
      EB.initPanZoom();
      EB.initDrawer();
      EB.initThreads();
      EB.initNotes();
    }
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
