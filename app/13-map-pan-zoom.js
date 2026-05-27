// Pan / zoom for the map.
//
// Viewport is a real scrollable container (overflow:auto). Pan = the
// viewport's own scrollLeft/Top. Trackpad/wheel pans natively; drag on
// empty area pans via scrollLeft/Top updates. Zoom is buttons only.
//
// Home (⌂ / topbar): if the DM has set a Home view (saved in the
// home_view table), use that. Otherwise fit all rendered cards into
// the viewport centred on the content bounding box.
//
// Reset (↺): wipes the current user's personal overrides (both
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

  function contentBBox() {
    if (!canvas) return null;
    var nodes = canvas.querySelectorAll('.node');
    if (!nodes.length) return null;
    var minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    for (var i = 0; i < nodes.length; i++) {
      var n = nodes[i];
      var x = n.offsetLeft, y = n.offsetTop;
      var w = n.offsetWidth, h = n.offsetHeight;
      if (!w || !h) continue;
      if (x < minX) minX = x;
      if (y < minY) minY = y;
      if (x + w > maxX) maxX = x + w;
      if (y + h > maxY) maxY = y + h;
    }
    if (!isFinite(minX)) return null;
    return { x: minX, y: minY, w: maxX - minX, h: maxY - minY };
  }

  // Capture the current viewport: centre in canvas coords + scale.
  // Used by Set Home to persist the DM's preferred starting view.
  EB.captureHomeView = function () {
    if (!viewport) return null;
    var s = EB.scale || 1;
    var cx = (viewport.scrollLeft + viewport.clientWidth  / 2) / s;
    var cy = (viewport.scrollTop  + viewport.clientHeight / 2) / s;
    return { cx: cx, cy: cy, scale: s };
  };

  EB.centerInitial = function () {
    // DM-set Home view wins if present.
    if (EB.homeView && typeof EB.homeView.cx === 'number') {
      var s = Math.max(0.2, Math.min(2, EB.homeView.scale || 0.6));
      setScale(s);
      scrollToCanvasPoint(EB.homeView.cx, EB.homeView.cy);
      return;
    }
    // Fallback: fit all rendered cards into the viewport.
    var vw = viewport.clientWidth, vh = viewport.clientHeight;
    var bbox = contentBBox();
    var pad = 60;
    var cx, cy, contentW, contentH;
    if (bbox) {
      contentW = bbox.w + pad * 2;
      contentH = bbox.h + pad * 2;
      cx = bbox.x + bbox.w / 2;
      cy = bbox.y + bbox.h / 2;
    } else {
      contentW = CANVAS_W;
      contentH = CANVAS_H;
      cx = CANVAS_W / 2;
      cy = CANVAS_H / 2;
    }
    if (vw > 0 && vh > 0 && contentW > 0 && contentH > 0) {
      var fit = Math.min(vw / contentW, vh / contentH);
      setScale(Math.max(0.2, Math.min(2, fit)));
    } else {
      setScale(0.6);
    }
    scrollToCanvasPoint(cx, cy);
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
      if (e.target.closest('.node') || e.target.closest('.eberoth-title') || e.target.closest('.map-controls')) return;
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
      setScale(Math.max(0.2, EB.scale / 1.1));
    };
    document.getElementById('zoomReset').onclick = function () {
      EB.centerInitial();
    };

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
