// Orchestrator. boot() may run more than once — e.g. after sign-in, or
// after DM toggles view-as. initLayout + loadPositions + render are
// run every time; one-off module wiring is guarded.
(function () {
  var modulesInited = false;

  function showLoader() {
    if (document.getElementById('loadingOverlay')) return;
    var el = document.createElement('div');
    el.id = 'loadingOverlay';
    el.innerHTML =
      '<div class="loading-circle">' +
        '<img class="loading-glyph" src="eberoth logo.png" alt="Eberoth">' +
      '</div>' +
      '<div class="loading-dots"><span></span><span></span><span></span></div>' +
      '<div class="loading-text">Loading</div>';
    document.body.appendChild(el);
  }

  function dismissLoader() {
    var overlay = document.getElementById('loadingOverlay');
    if (!overlay) return;
    overlay.classList.add('fade-out');
    setTimeout(function () {
      if (overlay.parentNode) overlay.parentNode.removeChild(overlay);
    }, 550);
  }

  // Wait for all img elements in the map canvas to finish loading,
  // then call the callback. Gives up after 5s so we never hang forever.
  function waitForImages(callback) {
    var canvas = document.getElementById('canvas');
    var imgs = canvas ? Array.prototype.slice.call(canvas.querySelectorAll('img')) : [];
    var pending = imgs.filter(function (img) { return !img.complete; });
    if (!pending.length) { callback(); return; }

    var settled = 0;
    var timeout = setTimeout(callback, 5000); // safety bail-out

    pending.forEach(function (img) {
      function done() {
        settled++;
        if (settled >= pending.length) {
          clearTimeout(timeout);
          callback();
        }
      }
      img.addEventListener('load', done, { once: true });
      img.addEventListener('error', done, { once: true });
    });
  }

  EB.init = function () {
    EB.initLanding();
    EB.checkSession().then(function () { EB.boot(); });
  };

  EB.boot = function () {
    var realBucket = EB.actualBucket();
    if (!realBucket) { EB.showLanding(); return; }

    // Show the loading overlay now — user has authed, map is incoming.
    showLoader();

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
    // Load content (needs auth JWT), then positions, then render.
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
        EB.renderMap();
        EB.centerInitial();
        // Wait for card images to actually paint before dismissing.
        waitForImages(dismissLoader);
      })
      .catch(function (err) {
        console.error('[Eberoth] Boot failed', err);
        dismissLoader();
        EB.renderMap();
        EB.centerInitial();
      });
  };
})();
