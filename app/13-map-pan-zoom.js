// Pan / zoom for the map.
//
// Viewport is a real scrollable container (overflow:auto). Pan = the
// viewport's own scrollLeft/Top. Trackpad/wheel pans natively; drag on
// empty area pans via scrollLeft/Top updates. Zoom is buttons only.
//
// Reset button (↺) wipes the current user's personal overrides (both
// local + Supabase) so they revert to the DM baseline.
(function () {
  EB.scale = 0.6;
  var canvas, canvasWrap, viewport;
  var CANVAS_W = 2850, CANVAS_H = 1900;

  function setScale(s) {
    EB.scale = s;
    canvas.style.transform = 'scale(' + s + ')';
    canvasWrap.style.width  = (CANVAS_W * s) + 'px';
    canvasWrap.style.height = (CANVAS_H * s) + 'px';
  }

  function scrollToCanvasPoint(cx, cy) {
    var s = EB.scale;
    viewport.scrollLeft = cx * s - viewport.clientWidth  / 2;
    viewport.scrollTop  = cy * s - viewport.clientHeight / 2;
  }

  EB.centerInitial = function () {
    setScale(0.6);
    scrollToCanvasPoint(EB.LAYOUT.crown.x, EB.LAYOUT.crown.y);
  };

  EB.zoomToPoint = function (cx, cy, scale) {
    setScale(scale);
    scrollToCanvasPoint(cx, cy);
  };

  EB.zoomToParty = function () {
    var L = EB.LAYOUT;
    EB.zoomToPoint(L.party.x + L.party.gap, L.party.y, 1.2);
  };

  EB.initPanZoom = function () {
    canvas = document.getElementById('canvas');
    canvasWrap = document.getElementById('canvasWrap');
    viewport = document.getElementById('viewport');

    setScale(EB.scale);

    var isPanning = false;
    var startScrollX = 0, startScrollY = 0, startMouseX = 0, startMouseY = 0;
    viewport.addEventListener('mousedown', function (e) {
      if (e.target.closest('.node') || e.target.closest('.map-controls')) return;
      isPanning = true;
      startScrollX = viewport.scrollLeft;
      startScrollY = viewport.scrollTop;
      startMouseX = e.clientX;
      startMouseY = e.clientY;
    });
    window.addEventListener('mousemove', function (e) {
      if (!isPanning) return;
      viewport.scrollLeft = startScrollX - (e.clientX - startMouseX);
      viewport.scrollTop  = startScrollY - (e.clientY - startMouseY);
    });
    window.addEventListener('mouseup', function () { isPanning = false; });

    document.getElementById('zoomIn').onclick = function () {
      setScale(Math.min(2, EB.scale * 1.1));
    };
    document.getElementById('zoomOut').onclick = function () {
      setScale(Math.max(0.3, EB.scale / 1.1));
    };
    document.getElementById('zoomReset').onclick = function () {
      EB.centerInitial();
    };

    // Reset ↺: revert to baseline (delete this user's customs).
    document.getElementById('layoutReset').onclick = function () {
      if (!confirm('Reset your layout to the DM\'s baseline? This clears any rearrangements you\'ve made.')) return;
      EB.customPositions = {};
      var p = EB.deleteAllPositionsForUser ? EB.deleteAllPositionsForUser() : Promise.resolve();
      p.then(function () {
        if (EB.renderMap) EB.renderMap();
      }, function (err) {
        console.error('[Eberoth] layout reset failed', err);
        if (EB.renderMap) EB.renderMap();
      });
    };
  };
})();
