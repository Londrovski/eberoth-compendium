// Node drag + snap, using Pointer Events with setPointerCapture.
//
// Drag is opt-in via EB.moveMode (toggled by the "Move" button in the
// topbar). When move mode is OFF:
//   - press + release without moving → opens that node's detail panel
//   - press + move past the threshold → nothing (drag won't start, and
//     the release is NOT treated as a click — prevents accidental
//     detail-panel opens while a player is trying to scroll past)
// When move mode is ON: same as above but past-threshold movement
// activates a drag and the release snaps to the nearest anchor.
// Anchor dots are visible the whole time move mode is on (shown when
// the toggle is enabled; hidden when it is disabled).
//
// Move mode is ephemeral — every reload starts in the safe (off)
// state so players can't accidentally rearrange the world.
(function () {
  var DRAG_THRESHOLD = 5;     // px in screen space before drag activates
  var anchorEls = [];

  // Exposed: called by both the drag start AND the topbar Move toggle.
  // Idempotent — if anchors are already shown, this is a no-op.
  EB.showAnchors = function () {
    if (anchorEls.length > 0) return;
    EB.getAnchors().forEach(function (a, i) {
      var el = document.createElement('div');
      el.className = 'anchor';
      el.style.left = a.x + 'px';
      el.style.top = a.y + 'px';
      el.dataset.idx = i;
      EB.canvas.appendChild(el);
      anchorEls.push(el);
    });
  };
  EB.hideAnchors = function () {
    anchorEls.forEach(function (el) { el.remove(); });
    anchorEls = [];
  };

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
  function clearHighlights() {
    anchorEls.forEach(function (el) { el.classList.remove('anchor-near'); });
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
      try { el.setPointerCapture(e.pointerId); } catch (err) {}
    });

    el.addEventListener('pointermove', function (e) {
      if (!armed || e.pointerId !== activePointer) return;
      var dx = e.clientX - startX;
      var dy = e.clientY - startY;
      if (!dragging && Math.hypot(dx, dy) < DRAG_THRESHOLD) return;
      // Past threshold — only enter drag state when move mode is on.
      if (!dragging && !EB.moveMode) return;
      if (!dragging) {
        dragging = true;
        el.classList.add('node-dragging');
        EB.showAnchors();   // idempotent
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
      if (!dragging) {
        // No drag activated. Open detail only if the press was clean.
        var movedX = (e && e.clientX != null) ? Math.abs(e.clientX - startX) : 0;
        var movedY = (e && e.clientY != null) ? Math.abs(e.clientY - startY) : 0;
        if (Math.hypot(movedX, movedY) < DRAG_THRESHOLD) onOpen();
        return;
      }
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
      // Keep anchors up if move mode is still on; clear the highlight
      // so the just-snapped target doesn't stay glowing.
      if (EB.moveMode) clearHighlights();
      else EB.hideAnchors();
      if (EB.applyHouseTints) EB.applyHouseTints();
    }

    el.addEventListener('pointerup', finish);
    el.addEventListener('pointercancel', finish);
  };
})();
