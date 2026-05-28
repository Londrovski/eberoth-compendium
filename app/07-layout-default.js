// ===========================
// LAYOUT DEFAULT + CLUSTER ROUTING
// ===========================
// The orchestrator: turns "what's loaded" into "where everything goes".
//
//   EB.clusterOf(id)           — which cluster does an entity belong to?
//   EB.entitiesInCluster(id)   — which entities belong to a cluster?
//   EB.shiftedLayout()         — EB.LAYOUT with cluster_offsets applied
//   EB.defaultLayout()         — full position map for every visible entity
//   EB.currentPositions()      — defaultLayout + user customs
//   EB.getAnchors()            — snap targets for drag
//
// Pipeline inside defaultLayout():
//   1. For each cluster in EB.clusterLayout, gather visible entities
//      sorted by sort_order, allocate slot positions via EB.slotsFor().
//   2. Position the 5 faction sigils (crown + 4 houses) directly from
//      EB.LAYOUT — they're not auto-flowed.
//   3. Run EB.resolveCollisions() to push lower-priority clusters
//      down so nothing overlaps.
//   4. Apply EB.globalPositions overrides (DM-pushed baseline).
//   5. (currentPositions step 5) Apply EB.customPositions (per-user
//      drags).
//
// clusterOf() reads entity.cluster_id ONLY. The old fallbacks
// (status, ownerId, factionId, PERSONAL_REFS) are gone — Phase A
// migrated every entity onto a definitive cluster_id.
(function () {

  // ----------------------------------------------------------------
  // CLUSTER ROUTING
  // ----------------------------------------------------------------

  EB.clusterOf = function (entityId) {
    if (!entityId) return null;
    if (entityId === EB.TITLE_ID) return 'title';
    var byId = EB.byId || {};
    var ent = byId[entityId];
    if (!ent) return null;
    return ent.cluster_id || null;
  };

  EB.entitiesInCluster = function (cluster) {
    var ids = [];
    var byId = EB.byId || {};
    Object.keys(byId).forEach(function (id) {
      if (EB.clusterOf(id) === cluster) ids.push(id);
    });
    return ids;
  };

  // ----------------------------------------------------------------
  // SHIFTED LAYOUT
  // ----------------------------------------------------------------
  // Applies cluster_offsets to the LAYOUT primitives. Slot allocators
  // (07-layout-slots.js) read this to honour DM block-moves.
  //
  // Cluster offsets in use:
  //   players — shifts party row + (legacy) personal column
  //   houses  — shifts crown + house sigil row + house grids
  //   lore    — shifts the new lore grid
  //   title   — shifts the title entity

  EB.shiftedLayout = function () {
    var L = EB.LAYOUT;
    var co = EB.clusterOffsets || {};
    var pl = co.players || { dx: 0, dy: 0 };
    var hs = co.houses  || { dx: 0, dy: 0 };
    var lr = co.lore    || { dx: 0, dy: 0 };
    var tt = co.title   || { dx: 0, dy: 0 };
    return {
      // Title.
      titleY:  L.titleY,
      titleX:  L.crown.x + tt.dx,
      titleDy: tt.dy,

      // Party row.
      party: { x: L.party.x + pl.dx, y: L.party.y + pl.dy, gap: L.party.gap },

      // Crown + houses.
      crown: { x: L.crown.x + hs.dx, y: L.crown.y + hs.dy },
      crownRingRadius: L.crownRingRadius,
      crownRingPoints: L.crownRingPoints,
      housesY: L.housesY + hs.dy,
      housesXs: Object.keys(L.housesXs).reduce(function (acc, k) {
        acc[k] = L.housesXs[k] + hs.dx; return acc;
      }, {}),
      houseGridY: L.houseGridY + hs.dy,
      houseGridGapX: L.houseGridGapX,
      houseGridGapY: L.houseGridGapY,

      // Lore grid.
      loreGrid: {
        anchor: {
          x: L.loreGrid.anchor.x + lr.dx,
          y: L.loreGrid.anchor.y + lr.dy
        },
        cols:  L.loreGrid.cols,
        gapX:  L.loreGrid.gapX,
        gapY:  L.loreGrid.gapY
      },

      headerOffset: L.headerOffset
    };
  };

  // ----------------------------------------------------------------
  // DEFAULT LAYOUT
  // ----------------------------------------------------------------
  // Builds the base position map for every visible entity, runs
  // collision resolution, then overlays globalPositions.
  //
  // Returns: { entityId → {x, y} }

  EB.defaultLayout = function () {
    var L = EB.shiftedLayout();
    var byId = EB.byId || {};
    var pos = {};

    // Step 1: gather visible entities per cluster, sort by sort_order,
    // allocate slot positions.
    Object.keys(EB.clusterLayout).forEach(function (clusterId) {
      var members = [];
      Object.keys(byId).forEach(function (id) {
        if (EB.clusterOf(id) === clusterId) members.push(byId[id]);
      });
      members.sort(function (a, b) {
        return (a.sort_order || 0) - (b.sort_order || 0);
      });
      var slots = EB.slotsFor(clusterId, members.length);
      members.forEach(function (ent, i) {
        if (slots[i]) pos[ent.id] = slots[i];
      });
    });

    // Step 2: the 5 faction sigils (crown + 4 houses) are positioned
    // directly from LAYOUT.housesXs / LAYOUT.crown. They live on
    // cluster_id='houses' and are NOT in clusterLayout.
    pos['crown'] = { x: L.crown.x, y: L.crown.y };
    Object.keys(L.housesXs).forEach(function (hid) {
      pos[hid] = { x: L.housesXs[hid], y: L.housesY };
    });

    // Step 3: auto-collision — push lower-priority clusters down to
    // clear overlaps with higher-priority ones.
    EB.resolveCollisions(pos);

    // Step 4: DM-pushed global overrides win over the engine.
    Object.keys(EB.globalPositions || {}).forEach(function (id) {
      if (pos[id]) pos[id] = EB.globalPositions[id];
    });

    return pos;
  };

  // currentPositions = defaultLayout + per-user customs.
  EB.currentPositions = function () {
    var pos = EB.defaultLayout();
    Object.keys(EB.customPositions || {}).forEach(function (id) {
      if (pos[id]) pos[id] = EB.customPositions[id];
    });
    return pos;
  };

  // ----------------------------------------------------------------
  // SNAP ANCHORS
  // ----------------------------------------------------------------
  // Anchor points for drag snapping. We expose every default slot
  // position PLUS a few empty-slot anchors per cluster so users can
  // drag a card INTO an empty grid position cleanly.

  EB.getAnchors = function () {
    var def = EB.defaultLayout();
    var anchors = [];

    // Every currently-occupied slot is an anchor.
    Object.keys(def).forEach(function (k) {
      anchors.push({ x: def[k].x, y: def[k].y });
    });

    // Empty grid slots: pre-compute extra slots per cluster so a card
    // can be dropped into an empty cell. We allocate up to 12 slots
    // for grid/house clusters and 8 for ring overflow, regardless of
    // current occupancy.
    Object.keys(EB.clusterLayout).forEach(function (clusterId) {
      var cap = (EB.clusterLayout[clusterId].kind === 'ring') ? 14 : 12;
      var slots = EB.slotsFor(clusterId, cap);
      slots.forEach(function (s) { anchors.push(s); });
    });

    // Dedup within 10px.
    var dedup = [];
    anchors.forEach(function (a) {
      if (!dedup.some(function (b) {
        return Math.hypot(a.x - b.x, a.y - b.y) < 10;
      })) dedup.push(a);
    });
    return dedup;
  };

})();
