// Pan / zoom + the four map control buttons. EB.scale is read by
// the drag handler to convert screen-space deltas to canvas-space.
(function () {
  EB.scale = 0.6;
  var tx = 0, ty = 0;
  var canvas, viewport;

  function applyTransform() {
    canvas.style.transform = 'translate(' + tx + 'px, ' + ty + 'px) scale(' + EB.scale + ')';
  }
  EB.centerInitial = function () {
    var vw = viewport.clientWidth;
    tx = vw / 2 - EB.LAYOUT.crown.x * EB.scale;
    ty = 30;
    applyTransform();
  };

  EB.initPanZoom = function () {
    canvas = document.getElementById('canvas');
    viewport = document.getElementById('viewport');

    var isPanning = false, lastX = 0, lastY = 0;
    viewport.addEventListener('mousedown', function (e) {
      if (e.target.closest('.node') || e.target.closest('.map-controls')) return;
      isPanning = true; lastX = e.clientX; lastY = e.clientY;
    });
    window.addEventListener('mousemove', function (e) {
      if (!isPanning) return;
      tx += e.clientX - lastX;
      ty += e.clientY - lastY;
      lastX = e.clientX; lastY = e.clientY;
      applyTransform();
    });
    window.addEventListener('mouseup', function () { isPanning = false; });

    viewport.addEventListener('wheel', function (e) {
      e.preventDefault();
      var rect = viewport.getBoundingClientRect();
      var mx = e.clientX - rect.left;
      var my = e.clientY - rect.top;
      var delta = e.deltaY < 0 ? 1.04 : 0.96;
      var newScale = Math.max(0.3, Math.min(2, EB.scale * delta));
      tx = mx - (mx - tx) * (newScale / EB.scale);
      ty = my - (my - ty) * (newScale / EB.scale);
      EB.scale = newScale;
      applyTransform();
    }, { passive: false });

    document.getElementById('zoomIn').onclick = function () {
      EB.scale = Math.min(2, EB.scale * 1.1); applyTransform();
    };
    document.getElementById('zoomOut').onclick = function () {
      EB.scale = Math.max(0.3, EB.scale / 1.1); applyTransform();
    };
    document.getElementById('zoomReset').onclick = function () {
      EB.scale = 0.6; EB.centerInitial();
    };
    document.getElementById('layoutReset').onclick = function () {
      if (Object.keys(EB.customPositions).length === 0) return;
      if (confirm('Reset all node positions to default?')) {
        EB.customPositions = {};
        EB.savePositions();
        EB.renderMap();
      }
    };
  };
})();
