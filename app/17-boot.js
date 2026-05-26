// Orchestrator. Decides between landing and app, runs the right init
// chain in dependency order. Called once by app.js (after the loader
// finishes registering data + modules).
(function () {
  EB.init = function () {
    EB.initLanding();
    // boot() is what each post-landing entry calls.
    EB.boot();
  };

  EB.boot = function () {
    if (!EB.currentBucket()) { EB.showLanding(); return; }
    EB.showApp();
    // App init chain. Order matters: layout before render before drag.
    EB.initLayout();
    EB.initDetail();
    EB.initMapRender();
    EB.initPanZoom();
    EB.initDrawer();
    EB.initThreads();
    EB.initNotes();
    EB.renderMap();
    EB.centerInitial();
  };
})();
