// ===========================
// LAYOUT CONFIG
// ===========================
// Pure data. No functions. Edit coordinates and config here without
// scrolling through algorithm code.
//
// Three things live here:
//   1. EB.LAYOUT — primitive coordinate constants (party row, crown,
//      houses, title). The "magic numbers" of the map.
//   2. EB.clusterLayout — the per-cluster slot model that the
//      allocator (07-layout-slots.js) reads to flow visible entities
//      into positions automatically.
//   3. EB.CLUSTER_PRIORITY — order used by the collision resolver
//      (07-layout-slots.js → resolveCollisions). Earlier = higher
//      priority = stays put. Later clusters get pushed downward to
//      clear overlaps.
//
// Spatial defaults are arranged so the centroid of Crown + Voss +
// Gorrund nodes lands at canvas centre (1425, 950) on a 2850×1900
// canvas. Image fills the canvas exactly.
(function () {

  EB.LAYOUT = {
    // Eberoth title fixed near top of canvas.
    titleY: 50,

    // Party row anchors (PCs).
    party: { x: 667, y: 773, gap: 110 },

    // Crown faction sigil centre + ring NPC orbit.
    crown: { x: 1425, y: 683 },
    crownRingRadius: 220,
    crownRingPoints: 6,

    // House faction sigil row (positioned individually, not auto-flowed).
    housesY: 1083,
    housesXs: { corvath: 1065, voss: 1305, gorrund: 1545, halvorn: 1785 },

    // House NPC grids — 2 columns under each house sigil.
    houseGridY: 1363,
    houseGridGapX: 130,
    houseGridGapY: 150,

    // New Lore cluster grid (replaces the old Personal column + the
    // old right-side 'special' lore stack). Placeholder anchor — DM
    // can block-move into final position; cluster_offsets.lore wins.
    // Auto-collision in 07-layout-slots.js may also push this down to
    // clear the party row.
    loreGrid: {
      anchor: { x: 667, y: 973 },   // directly under party row
      cols: 3,
      gapX: 110,
      gapY: 145
    },

    // Cluster label offset (height above the cluster's top slot).
    headerOffset: 84
  };

  // Bumped to mark the schema change (auto-flow + collision; no longer
  // hand-positioned Personal column). Informational — positions are
  // not filtered by layout_version on read.
  EB.LAYOUT_VERSION = 14;

  EB.SNAP_DISTANCE = 60;

  // Title is a UI-only entity (no row in entities table). Its cluster
  // is 'title'. Constant used by the renderer + clusterOf().
  EB.TITLE_ID = 'eberoth-title';

  // Per-cluster slot config. Read by EB.slotsFor() in
  // 07-layout-slots.js. Anchor coordinates here are the BASE; cluster
  // offsets (EB.clusterOffsets) shift the whole cluster as a unit
  // before slot allocation, and auto-collision may add a further dy.
  //
  // kind:
  //   'row'    — horizontal row at anchor, gap apart
  //   'grid'   — cols-wide grid filling downward (overflow = more rows)
  //   'ring'   — circular ring around centre with N points, using
  //              pref[] order when fewer than N entities; overflow
  //              spills into a 2-col grid below the ring centre
  //   'house'  — sigil at anchor + 2-col grid of NPCs below at gridY
  EB.clusterLayout = {
    players: {
      kind: 'row',
      anchor: { x: 667, y: 773 },
      gap: 110
    },
    lore: {
      kind: 'grid',
      anchor: { x: 667, y: 973 },
      cols: 3,
      gapX: 110,
      gapY: 145
    },
    crown: {
      kind: 'ring',
      center: { x: 1425, y: 683 },
      radius: 220,
      points: 6,
      pref: [5, 1, 4, 2, 3, 0],
      overflowCols: 2,
      overflowGapX: 130,
      overflowGapY: 150
    },
    corvath: {
      kind: 'house',
      sigil:  { x: 1065, y: 1083 },
      gridY:  1363,
      cols:   2,
      gapX:   130,
      gapY:   150
    },
    voss: {
      kind: 'house',
      sigil:  { x: 1305, y: 1083 },
      gridY:  1363,
      cols:   2,
      gapX:   130,
      gapY:   150
    },
    gorrund: {
      kind: 'house',
      sigil:  { x: 1545, y: 1083 },
      gridY:  1363,
      cols:   2,
      gapX:   130,
      gapY:   150
    },
    halvorn: {
      kind: 'house',
      sigil:  { x: 1785, y: 1083 },
      gridY:  1363,
      cols:   2,
      gapX:   130,
      gapY:   150
    }
  };

  // Cluster IDs known to the system. 'houses' is the faction-sigil row
  // and is NOT in clusterLayout — those tokens are positioned directly
  // from EB.LAYOUT.housesXs / EB.LAYOUT.crown by the renderer/default.
  // 'title' is rendered by addEberothTitle() in 10-map-render.js.
  EB.CLUSTERS = ['players', 'houses', 'lore', 'title',
                 'crown', 'corvath', 'voss', 'gorrund', 'halvorn'];

  // Collision resolution order. Higher priority = stays put; lower
  // priority gets pushed down to clear overlaps.
  //
  // Rationale:
  //   - title at top, never moved
  //   - players row is the visual anchor; everything orbits around it
  //   - houses row (sigils) is foundational geometry; tied to bg image
  //   - crown ring + per-house grids next — load-bearing factions
  //   - lore last — absorbs overflow downward into empty canvas
  EB.CLUSTER_PRIORITY = [
    'title',
    'players',
    'houses',
    'crown',
    'corvath',
    'voss',
    'gorrund',
    'halvorn',
    'lore'
  ];

})();
