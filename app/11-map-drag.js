// Node drag + snap, using Pointer Events with setPointerCapture.
// This is what fixes the "node sticks to the cursor" bug — capture
// guarantees pointerup fires on the element even if the cursor leaves
// the window. The previous mouse-events impl could miss the up event.
(function () {
  var DRAG_THRESHOLD = 5;     // px in screen space before drag activates
  var anchorEls = [];

  function showAnchors() {
    hideAnchors();
    EB.getAnchors().forEach(function (a, i) {
      var el = document.createElement('div');
      el.className = 'anchor';
      el.style.left = a.x + 'px';
      el.style.top = a.y + 'px';
      el.dataset.idx = i;
      EB.canvas.appendChild(el);
      anchorEls.push(el);
    });
  }
  function hideAnchors() {
    anchorEls.forEach(function (el) { el.remove(); });
    anchorEls = [];
  }
  function highlightNearest(x, y) {
    var anchors = EB.getAnchors();
    var bestIdx = -1, bestDist = Infinity;
    anchors.forEach(function (a, i) {
      var d = Math.hypot(a.x - x, a.y - y);
      if (d < bestDist) { bestDist = d; bestIdx = i; }
    });
    anchorEls.forEach(function (el, i) {
      el.classList.toggle('anchor-near', i === bestIdx && bestDist < EB.SNAP_DISTANCE);
    });
  }
  function nearestAnchor(x, y) {
    var anchors = EB.getAnchors();
    var best = null;
    anchors.forEach(function (a) {
      var d = Math.hypot(a.x - x, a.y - y);
      if (!best || d < best.dist) best = { anchor: a, dist: d };
    });
    return best;
  }

  EB.attachNodeInteraction = function (el, id, onOpen) {
    var startX = 0, startY = 0, nodeStartX = 0, nodeStartY = 0;
    var dragging = false, armed = false, activePointer = null;

    el.addEventListener('pointerdown', function (e) {
      if (e.button !== 0) return;
      e.stopPropagation();
      armed = true; dragging = false;
      activePointer = e.pointerId;
      startX = e.clientX; startY = e.clientY;
      nodeStartX = parseFloat(el.style.left);
      nodeStartY = parseFloat(el.style.top);
      // Capture so pointermove + pointerup always come back to us,
      // even if the cursor leaves the element/window.
      try { el.setPointerCapture(e.pointerId); } catch (err) {}
    });

    el.addEventListener('pointermove', function (e) {
      if (!armed || e.pointerId !== activePointer) return;
      var dx = e.clientX - startX;
      var dy = e.clientY - startY;
      if (!dragging && Math.hypot(dx, dy) < DRAG_THRESHOLD) return;
      if (!dragging) {
        dragging = true;
        el.classList.add('node-dragging');
        showAnchors();
      }
      var newX = nodeStartX + dx / EB.scale;
      var newY = nodeStartY + dy / EB.scale;
      el.style.left = newX + 'px';
      el.style.top  = newY + 'px';
      highlightNearest(newX, newY);
    });

    function finish(e) {
      if (!armed || (e && e.pointerId !== activePointer)) return;
      armed = false;
      try { el.releasePointerCapture(activePointer); } catch (err) {}
      activePointer = null;
      if (!dragging) { onOpen(); return; }
      dragging = false;
      el.classList.remove('node-dragging');
      var x = parseFloat(el.style.left);
      var y = parseFloat(el.style.top);
      var snap = nearestAnchor(x, y);
      var final = { x: x, y: y };
      if (snap && snap.dist < EB.SNAP_DISTANCE) {
        final = { x: snap.anchor.x, y: snap.anchor.y };
        el.style.left = final.x + 'px';
        el.style.top  = final.y + 'px';
      }
      EB.customPositions[id] = final;
      EB.savePositions();
      hideAnchors();
      if (EB.applyHouseTints) EB.applyHouseTints();
    }

    el.addEventListener('pointerup', finish);
    el.addEventListener('pointercancel', finish);
  };
})();
