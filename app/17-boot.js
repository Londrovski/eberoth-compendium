// Orchestrator. boot() may run more than once — e.g. after sign-in, or
// after DM toggles view-as. initLayout + loadPositions + render are
// run every time; one-off module wiring is guarded.
(function () {
  var modulesInited = false;

  function dismissLoader() {
    var overlay = document.getElementById('loadingOverlay');
    if (!overlay) return;
    overlay.classList.add('fade-out');
    setTimeout(function () {
      if (overlay.parentNode) overlay.parentNode.removeChild(overlay);
    }, 550);
  }

  EB.init = function () {
    EB.initLanding();
    EB.checkSession().then(function () { EB.boot(); });
  };

  EB.boot = function () {
    var realBucket = EB.actualBucket();
    if (!realBucket) { dismissLoader(); EB.showLanding(); return; }
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
    // Load content first (needs auth JWT), then positions, then render.
    EB.loadContent()
      .then(function () {
        // Normalise kind fields and sort sessions after fresh fetch.
        FACTIONS .forEach(function (e) { e.kind = e.kind || 'faction';   });
        PLAYERS  .forEach(function (e) { e.kind = e.kind || 'player';    });
        NPCS     .forEach(function (e) { e.kind = e.kind || 'npc';       });
        LORE     .forEach(function (e) { e.kind = e.kind || 'lore';      });
        SESSIONS.sort(function (a, b) { return a.number - b.number; });
        SESSIONS.forEach(function (s) {
          s.kind  = 'session';
          s.id    = s.id    || ('s' + s.number);
          s.name  = s.name  || ('Session ' + s.number);
          s.sub   = s.sub   || s.rowSummary || s.date || '';
          if (!s.body && Array.isArray(s.summary)) {
            s.body = s.summary
              .map(function (line) { return line.replace(/<\/?strong>/g, ''); })
              .join('\n\n');
          }
        });
        return EB.loadPositionsFromSupabase();
      })
      .then(function () {
        dismissLoader();
        EB.renderMap();
        EB.centerInitial();
      })
      .catch(function (err) {
        console.error('[Eberoth] Boot failed', err);
        dismissLoader();
        EB.renderMap();
        EB.centerInitial();
      });
  };
})();
