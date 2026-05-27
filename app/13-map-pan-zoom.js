// Pan / zoom for the map.
//
// The viewport is a real scrollable container (overflow:auto). Pan is
// the viewport's own scroll position; nothing in JS needs to track tx/ty.
// Trackpad/wheel pans natively; drag on empty area pans via
// scrollLeft/Top updates. Zoom is buttons only (no wheel-zoom).
//
// EB.scale is still exposed for the drag handler so screen-space deltas
// translate to canvas-space cleanly.
(function () {
  EB.scale = 0.6;
  var canvas, canvasWrap, viewport;
  // Natural canvas dimensions (must match .map-canvas-wrap / .map-canvas
  // CSS values). Kept in sync with the image bounds.
  var CANVAS_W = 2700, CANVAS_H = 1800;

  function setScale(s) {
    EB.scale = s;
    canvas.style.transform = 'scale(' + s + ')';
    // Grow/shrink the wrap so the scrollable area matches current zoom.
    canvasWrap.style.width  = (CANVAS_W * s) + 'px';
    canvasWrap.style.height = (CANVAS_H * s) + 'px';
  }

  // Scroll the viewport so canvas-coords (cx, cy) sit at the viewport
  // centre at the current scale. Browser clamps to the scrollable area.
  function scrollToCanvasPoint(cx, cy) {
    var s = EB.scale;
    viewport.scrollLeft = cx * s - viewport.clientWidth  / 2;
    viewport.scrollTop  = cy * s - viewport.clientHeight / 2;
  }

  // Home / reset view: 0.6 scale, centred on the Crown.
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

    // Initial sizing so the wrap reflects the boot scale.
    setScale(EB.scale);

    // Drag-to-pan on empty viewport area. Updates scrollLeft/Top so it
    // co-operates with native scroll instead of fighting it.
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
    document.getElementById('layoutReset').onclick = function () {
      if (Object.keys(EB.customPositions).length === 0) return;
      if (confirm('Reset all node positions to default?')) {
        EB.customPositions = {};
        EB.savePositions && EB.savePositions();
        EB.renderMap();
      }
    };
  };
})();
