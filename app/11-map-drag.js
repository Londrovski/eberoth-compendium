// Node drag + snap (Pointer Events + setPointerCapture).
//
// Two move modes:
//   - EB.moveMode (everyone): per-node drag, snap to anchors, saves
//     to node_positions (per-user override).
//   - EB.blockMoveMode (DM only): grabbing any node moves the whole
//     cluster (Players, Houses, Lore, or Title) together; on drop the
//     cluster offset is saved globally via EB.saveClusterOffset.
//
// Elements tagged data-cluster="title" are block-mode-only — they
// have no entity row, so per-node mode skips them entirely.
//
// Snap behaviour (per-node mode only): prefers the nearest UNOCCUPIED
// anchor (cards don't pile up). If no free anchor sits within ~2.5x
// the normal snap range, falls back to the absolute nearest so
// tight-pack stays possible.
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

  function pickSnap(x, y, excludeId) {
    var anchors = EB.getAnchors();
    var positions = EB.currentPositions();
    var occupied = [];
    Object.keys(positions).forEach(function (id) {
      if (id === excludeId) return;
      occupied.push(positions[id]);
    });
    function isOccupied(ax, ay) {
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

  function collectClusterElements(cluster) {
    if (!cluster || !EB.canvas) return [];
    var els = EB.canvas.querySelectorAll('[data-cluster="' + cluster + '"]');
    var out = [];
    Array.prototype.forEach.call(els, function (el) {
      var x0 = parseFloat(el.style.left);
      var y0 = parseFloat(el.style.top);
      if (isNaN(x0) || isNaN(y0)) return;
      out.push({ el: el, x0: x0, y0: y0 });
    });
    return out;
  }

  EB.attachNodeInteraction = function (el, id, onOpen) {
    var startX = 0, startY = 0, nodeStartX = 0, nodeStartY = 0;
    var dragging = false, armed = false, activePointer = null;
    var blockCluster = null;
    var blockEls = null;
    var isTitleEl = (el.dataset && el.dataset.cluster === 'title');

    el.addEventListener('pointerdown', function (e) {
      if (e.button !== 0) return;
      e.stopPropagation();
      armed = true; dragging = false;
      activePointer = e.pointerId;
      startX = e.clientX; startY = e.clientY;
      nodeStartX = parseFloat(el.style.left);
      nodeStartY = parseFloat(el.style.top);
      blockCluster = null;
      blockEls = null;
      try { el.setPointerCapture(e.pointerId); } catch (err) {}
    });

    el.addEventListener('pointermove', function (e) {
      if (!armed || e.pointerId !== activePointer) return;
      var dx = e.clientX - startX;
      var dy = e.clientY - startY;
      if (!dragging && Math.hypot(dx, dy) < DRAG_THRESHOLD) return;
      // Title is block-mode-only.
      if (isTitleEl && !EB.blockMoveMode) return;
      if (!dragging && !EB.moveMode && !EB.blockMoveMode) return;

      if (!dragging) {
        dragging = true;
        el.classList.add('node-dragging');
        if (EB.blockMoveMode && EB.actualBucket() === 'dm') {
          blockCluster = (el.dataset && el.dataset.cluster) || (EB.clusterOf ? EB.clusterOf(id) : null);
          if (blockCluster) {
            blockEls = collectClusterElements(blockCluster);
            blockEls.forEach(function (b) { b.el.classList.add('cluster-dragging'); });
          }
        } else {
          EB.showAnchors();
        }
      }

      if (blockCluster && blockEls) {
        var ddx = dx / EB.scale, ddy = dy / EB.scale;
        blockEls.forEach(function (b) {
          b.el.style.left = (b.x0 + ddx) + 'px';
          b.el.style.top  = (b.y0 + ddy) + 'px';
        });
      } else {
        var newX = nodeStartX + dx / EB.scale;
        var newY = nodeStartY + dy / EB.scale;
        el.style.left = newX + 'px';
        el.style.top  = newY + 'px';
        highlightSnap(newX, newY, id);
      }
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
        blockCluster = null; blockEls = null;
        return;
      }
      dragging = false;
      el.classList.remove('node-dragging');

      if (blockCluster && blockEls) {
        var endX = parseFloat(el.style.left);
        var endY = parseFloat(el.style.top);
        var ddx = endX - nodeStartX;
        var ddy = endY - nodeStartY;
        blockEls.forEach(function (b) { b.el.classList.remove('cluster-dragging'); });
        blockEls = null;
        var cluster = blockCluster;
        blockCluster = null;
        var cur = (EB.clusterOffsets && EB.clusterOffsets[cluster]) || {dx:0, dy:0};
        var newDx = cur.dx + ddx;
        var newDy = cur.dy + ddy;
        if (EB.saveClusterOffset) {
          EB.saveClusterOffset(cluster, newDx, newDy).then(function () {
            if (EB.renderMap) EB.renderMap();
          }, function (err) {
            console.error('[Eberoth] saveClusterOffset failed', err);
            if (EB.renderMap) EB.renderMap();
          });
        } else {
          if (EB.renderMap) EB.renderMap();
        }
        return;
      }

      // Per-node mode drop: snap + per-user save. Skip for the title
      // (no entity row, no useful node_positions write).
      if (isTitleEl) {
        if (EB.moveMode) {
          anchorEls.forEach(function (el) { el.classList.remove('anchor-near'); });
        } else {
          EB.hideAnchors();
        }
        return;
      }
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
