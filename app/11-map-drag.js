// Node drag + snap (Pointer Events + setPointerCapture).
//
// Drag is opt-in via EB.moveMode. While in Move mode, each drop saves
// to node_positions (per-user override). To make the current layout
// the baseline for all players, DM clicks the "Push to Players" button
// (revealed in Move mode for DM only) — see EB.pushToAll.
//
// Snap behaviour: prefers the nearest UNOCCUPIED anchor (cards don't
// pile up). If no free anchor sits within ~2.5x the normal snap range,
// falls back to the absolute nearest so tight-pack stays possible.
(function () {
  var DRAG_THRESHOLD = 5;
  var anchorEls = [];

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

  // Single source of truth for snap target. Returns { anchor, dist, idx }
  // for the anchor that should be snapped to, given a drop point and the
  // entity being moved (which is excluded from the "occupied" check).
  function pickSnap(x, y, excludeId) {
    var anchors = EB.getAnchors();
    var positions = EB.currentPositions();
    var occupied = [];
    Object.keys(positions).forEach(function (id) {
      if (id === excludeId) return;
      occupied.push(positions[id]);
    });
    function isOccupied(ax, ay) {
      // ~30px fuzzy match so near-coincident anchors count as occupied.
      return occupied.some(function (p) { return Math.hypot(p.x - ax, p.y - ay) < 30; });
    }
    var best = null, bestFree = null;
    anchors.forEach(function (a, i) {
      var d = Math.hypot(a.x - x, a.y - y);
      if (!best || d < best.dist) best = { anchor: a, dist: d, idx: i };
      if (!isOccupied(a.x, a.y)) {
        if (!bestFree || d < bestFree.dist) bestFree = { anchor: a, dist: d, idx: i };
      }
    });
    // Free anchor wins if within reasonable range; else fall back to nearest.
    if (bestFree && bestFree.dist < EB.SNAP_DISTANCE * 2.5) return bestFree;
    return best;
  }

  function highlightSnap(x, y, excludeId) {
    var pick = pickSnap(x, y, excludeId);
    var hit = pick ? pick.idx : -1;
    anchorEls.forEach(function (el, i) {
      el.classList.toggle('anchor-near', i === hit && pick.dist < EB.SNAP_DISTANCE);
    });
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
      if (!dragging && !EB.moveMode) return;
      if (!dragging) {
        dragging = true;
        el.classList.add('node-dragging');
        EB.showAnchors();
      }
      var newX = nodeStartX + dx / EB.scale;
      var newY = nodeStartY + dy / EB.scale;
      el.style.left = newX + 'px';
      el.style.top  = newY + 'px';
      highlightSnap(newX, newY, id);
    });

    function finish(e) {
      if (!armed || (e && e.pointerId !== activePointer)) return;
      armed = false;
      try { el.releasePointerCapture(activePointer); } catch (err) {}
      activePointer = null;
      if (!dragging) {
        var movedX = (e && e.clientX != null) ? Math.abs(e.clientX - startX) : 0;
        var movedY = (e && e.clientY != null) ? Math.abs(e.clientY - startY) : 0;
        if (Math.hypot(movedX, movedY) < DRAG_THRESHOLD) onOpen();
        return;
      }
      dragging = false;
      el.classList.remove('node-dragging');
      var x = parseFloat(el.style.left);
      var y = parseFloat(el.style.top);
      var snap = pickSnap(x, y, id);
      var final = { x: x, y: y };
      if (snap && snap.dist < EB.SNAP_DISTANCE) {
        final = { x: snap.anchor.x, y: snap.anchor.y };
        el.style.left = final.x + 'px';
        el.style.top  = final.y + 'px';
      }
      EB.customPositions[id] = final;
      EB.savePositionForUser(id, final);
      if (EB.moveMode) {
        anchorEls.forEach(function (el) { el.classList.remove('anchor-near'); });
      } else {
        EB.hideAnchors();
      }
      if (EB.applyHouseTints) EB.applyHouseTints();
    }

    el.addEventListener('pointerup', finish);
    el.addEventListener('pointercancel', finish);
  };
})();
