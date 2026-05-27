// Node drag + snap (Pointer Events + setPointerCapture).
//
// Two move modes:
//   - EB.moveMode (everyone): per-node drag, snap to anchors, saves
//     to node_positions (per-user override).
//   - EB.blockMoveMode (DM only): grabbing any node moves the whole
//     cluster (Players, Houses, or Lore) together; on drop the
//     cluster offset is saved globally via EB.saveClusterOffset,
//     which also wipes per-user customs + globals for the affected
//     entities so the shift is the new baseline for everyone.
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

  // ---- Block-mode helpers -------------------------------------------------

  // Collect every DOM .node belonging to the given cluster, plus the
  // cluster-label elements tagged with data-cluster=<cluster>. Each
  // entry remembers its starting style.left/top so we can move them
  // in lockstep during the drag.
  function collectClusterElements(cluster) {
    if (!cluster || !EB.canvas) return [];
    var clusterIds = {};
    EB.entitiesInCluster(cluster).forEach(function (id) { clusterIds[id] = true; });

    var out = [];
    // Nodes (including shadows whose dataset.id is "<id>-suffix").
    var nodes = EB.canvas.querySelectorAll('.node');
    Array.prototype.forEach.call(nodes, function (el) {
      var id = el.dataset && el.dataset.id;
      if (!id) return;
      var baseId = id.split('-shadow')[0].split('-ref')[0];
      if (clusterIds[baseId] || clusterIds[id]) {
        out.push({ el: el, x0: parseFloat(el.style.left), y0: parseFloat(el.style.top) });
      }
    });
    // Cluster labels tagged with data-cluster.
    var labels = EB.canvas.querySelectorAll('.cluster-label[data-cluster="' + cluster + '"]');
    Array.prototype.forEach.call(labels, function (el) {
      out.push({ el: el, x0: parseFloat(el.style.left), y0: parseFloat(el.style.top) });
    });
    return out;
  }

  // ---- Drag handler -------------------------------------------------------

  EB.attachNodeInteraction = function (el, id, onOpen) {
    var startX = 0, startY = 0, nodeStartX = 0, nodeStartY = 0;
    var dragging = false, armed = false, activePointer = null;
    var blockCluster = null;   // cluster being dragged, when in block mode
    var blockEls = null;       // [{el, x0, y0}] in block-mode drag

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
      // Neither mode? Don't initiate a drag.
      if (!dragging && !EB.moveMode && !EB.blockMoveMode) return;

      if (!dragging) {
        dragging = true;
        el.classList.add('node-dragging');
        if (EB.blockMoveMode && EB.actualBucket() === 'dm') {
          blockCluster = EB.clusterOf(id);
          if (blockCluster) {
            blockEls = collectClusterElements(blockCluster);
            blockEls.forEach(function (b) { b.el.classList.add('cluster-dragging'); });
          }
        } else {
          // Per-node mode shows anchors for snap feedback.
          EB.showAnchors();
        }
      }

      if (blockCluster && blockEls) {
        // Move every element in the cluster by the same scaled delta.
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
        // ---- Block-mode drop: save new cluster offset ----
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

      // ---- Per-node mode drop: snap + per-user save ----
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
