// ===========================
// LAYOUT SLOTS + COLLISION
// ===========================
// Slot allocation + auto-collision detection.
//
// Two responsibilities, tightly coupled:
//
//   1. EB.slotsFor(clusterId, n) — given a cluster ID and the number
//      of visible entities, return an array of n {x,y} slot positions.
//      Handles row / grid / ring / house kinds with downward overflow.
//
//   2. EB.resolveCollisions(positions) — iterate clusters in
//      EB.CLUSTER_PRIORITY order; for each lower-priority cluster,
//      compute its bounding box, check against all already-placed
//      higher-priority bboxes, and shift the whole cluster downward
//      by enough to clear any overlap. Mutates and returns positions.
//
// The slot model is "what cluster wants", the collision model is
// "what cluster gets". Both honour cluster offsets (applied upstream
// via EB.shiftedLayout()) and DM customs (applied downstream, after
// collision resolution, in 07-layout-default.js).
//
// Card geometry (110×110 + 20px padding) is a constant — matches the
// .node CSS in styles.css. Bump CARD_W/H if the CSS changes.
(function () {

  // Card bounding box dimensions. Matches .node CSS dimensions; if
  // the card size changes in styles.css, update these.
  var CARD_W = 110;
  var CARD_H = 110;
  var CARD_PAD = 20;

  // ----------------------------------------------------------------
  // SLOT ALLOCATORS
  // ----------------------------------------------------------------
  // Each returns an array of n {x,y} positions for the given cluster.
  // Reads the SHIFTED layout (cluster offsets already applied) via
  // EB.shiftedLayout() — except for kinds that take their own anchor
  // from EB.clusterLayout (most of them). The 'players' kind reads
  // EB.shiftedLayout().party because cluster_offsets.players is the
  // canonical truth for the party row.

  function slotsRow(cluster, n) {
    // Honour the shifted party anchor (cluster_offsets.players).
    var L = EB.shiftedLayout();
    var anchor = (cluster === EB.clusterLayout.players)
      ? { x: L.party.x, y: L.party.y }
      : cluster.anchor;
    var out = [];
    for (var i = 0; i < n; i++) {
      out.push({ x: anchor.x + i * cluster.gap, y: anchor.y });
    }
    return out;
  }

  function slotsGrid(cluster, n) {
    // For 'lore' cluster: honour shifted lore offset.
    var L = EB.shiftedLayout();
    var anchor = cluster.anchor;
    if (cluster === EB.clusterLayout.lore) {
      anchor = { x: L.loreGrid.anchor.x, y: L.loreGrid.anchor.y };
    }
    var out = [];
    for (var i = 0; i < n; i++) {
      var col = i % cluster.cols;
      var row = Math.floor(i / cluster.cols);
      out.push({
        x: anchor.x + col * cluster.gapX,
        y: anchor.y + row * cluster.gapY
      });
    }
    return out;
  }

  function slotsRing(cluster, n) {
    // Honour shifted houses offset for crown (crown lives within the
    // houses block visually).
    var L = EB.shiftedLayout();
    var center = (cluster === EB.clusterLayout.crown)
      ? { x: L.crown.x, y: L.crown.y }
      : cluster.center;
    var out = [];
    var ringSlots = [];
    for (var i = 0; i < cluster.points; i++) {
      var a = -Math.PI / 2 + (Math.PI * 2 * i) / cluster.points;
      ringSlots.push({
        x: center.x + Math.cos(a) * cluster.radius,
        y: center.y + Math.sin(a) * cluster.radius
      });
    }
    var pref = cluster.pref || [];
    var ringCap = cluster.points;
    var inRing = Math.min(n, ringCap);
    for (var j = 0; j < inRing; j++) {
      var idx = (j < pref.length) ? pref[j] : j;
      out.push(ringSlots[idx % ringCap]);
    }
    // Overflow: fill a grid BELOW the ring (centered on x).
    var overflow = n - inRing;
    if (overflow > 0) {
      var cols = cluster.overflowCols || 2;
      var gapX = cluster.overflowGapX || 130;
      var gapY = cluster.overflowGapY || 150;
      var startY = center.y + cluster.radius + 80;
      for (var k = 0; k < overflow; k++) {
        var col2 = k % cols;
        var row2 = Math.floor(k / cols);
        out.push({
          x: center.x + (col2 - (cols - 1) / 2) * gapX,
          y: startY + row2 * gapY
        });
      }
    }
    return out;
  }

  function slotsHouse(cluster, n) {
    // House NPCs flow into a 2-col grid below the sigil. The sigil
    // itself is NOT in the slot list — it's positioned separately by
    // the renderer/default from EB.LAYOUT.housesXs.
    var L = EB.shiftedLayout();
    // Honour shifted houses offset.
    var sigilX = cluster.sigil.x;
    // Use shifted housesY (carries cluster_offsets.houses.dy).
    var gridY = cluster.gridY + (L.housesY - EB.LAYOUT.housesY);
    var out = [];
    for (var i = 0; i < n; i++) {
      var col = i % cluster.cols;
      var row = Math.floor(i / cluster.cols);
      out.push({
        x: sigilX + (col === 0 ? -cluster.gapX / 2 : cluster.gapX / 2),
        y: gridY + row * cluster.gapY
      });
    }
    return out;
  }

  // Public allocator. Returns [] for unknown cluster IDs (e.g.
  // 'houses', 'title' — those aren't auto-flowed).
  EB.slotsFor = function (clusterId, n) {
    if (!n || n <= 0) return [];
    var cluster = EB.clusterLayout[clusterId];
    if (!cluster) return [];
    switch (cluster.kind) {
      case 'row':   return slotsRow(cluster, n);
      case 'grid':  return slotsGrid(cluster, n);
      case 'ring':  return slotsRing(cluster, n);
      case 'house': return slotsHouse(cluster, n);
      default:      return [];
    }
  };

  // ----------------------------------------------------------------
  // COLLISION DETECTION
  // ----------------------------------------------------------------
  // Bounding box helpers.

  // Single card's bbox around its centre position.
  EB.cardBBox = function (pos) {
    return {
      minX: pos.x - CARD_W / 2 - CARD_PAD,
      maxX: pos.x + CARD_W / 2 + CARD_PAD,
      minY: pos.y - CARD_H / 2 - CARD_PAD,
      maxY: pos.y + CARD_H / 2 + CARD_PAD
    };
  };

  function unionBBox(a, b) {
    return {
      minX: Math.min(a.minX, b.minX),
      maxX: Math.max(a.maxX, b.maxX),
      minY: Math.min(a.minY, b.minY),
      maxY: Math.max(a.maxY, b.maxY)
    };
  }

  function bboxIntersects(a, b) {
    return !(a.maxX <= b.minX || b.maxX <= a.minX ||
             a.maxY <= b.minY || b.maxY <= a.minY);
  }

  // Compute the union bbox for each cluster from positions. Only
  // clusters that have at least one positioned entity get a bbox.
  // Used by resolveCollisions and exposed for tooling/debug.
  EB.clusterBoundingBoxes = function (positions) {
    var byId = EB.byId || {};
    var bboxes = {};
    Object.keys(positions).forEach(function (entityId) {
      var clusterId = EB.clusterOf ? EB.clusterOf(entityId) : null;
      if (!clusterId) return;
      var card = EB.cardBBox(positions[entityId]);
      bboxes[clusterId] = bboxes[clusterId]
        ? unionBBox(bboxes[clusterId], card)
        : card;
    });
    return bboxes;
  };

  // Iterate clusters in EB.CLUSTER_PRIORITY order. For each cluster
  // after the first, check against all already-placed bboxes; if it
  // overlaps any of them, shift the whole cluster down by enough to
  // clear ALL overlaps. Mutates positions in place.
  //
  // Title cluster is treated as immovable — it never gets shifted
  // even though it sits early in the priority list.
  EB.resolveCollisions = function (positions) {
    var placedBboxes = {};
    EB.CLUSTER_PRIORITY.forEach(function (clusterId) {
      // Build this cluster's bbox from current positions.
      var members = [];
      Object.keys(positions).forEach(function (entityId) {
        var c = EB.clusterOf ? EB.clusterOf(entityId) : null;
        if (c === clusterId) members.push(entityId);
      });
      if (members.length === 0) return;

      var bbox = null;
      members.forEach(function (entityId) {
        var card = EB.cardBBox(positions[entityId]);
        bbox = bbox ? unionBBox(bbox, card) : card;
      });

      // Find the maximum downward push needed against any
      // higher-priority cluster.
      var pushDy = 0;
      Object.keys(placedBboxes).forEach(function (otherId) {
        var other = placedBboxes[otherId];
        if (bboxIntersects(bbox, other)) {
          var needed = (other.maxY + CARD_PAD) - bbox.minY;
          if (needed > pushDy) pushDy = needed;
        }
      });

      // Don't shift the title cluster — it's anchored at top.
      if (pushDy > 0 && clusterId !== 'title') {
        members.forEach(function (entityId) {
          positions[entityId] = {
            x: positions[entityId].x,
            y: positions[entityId].y + pushDy
          };
        });
        bbox.minY += pushDy;
        bbox.maxY += pushDy;
      }
      placedBboxes[clusterId] = bbox;
    });
    return positions;
  };

})();
