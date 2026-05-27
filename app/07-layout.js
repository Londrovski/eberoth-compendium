// Map layout. Positions sourced from Supabase — global_positions
// (DM-authored baseline) + node_positions (per-user overrides).
//
// Cluster offsets (cluster_offsets table, DM-only writes) shift entire
// clusters as a unit: players (party + personal), houses (crown ring +
// 4 houses + house grids), lore. Cluster offsets are applied to every
// anchor *before* per-entity customs override on top.
//
// Spatial defaults are arranged so the centroid of Crown + Voss +
// Gorrund nodes lands at canvas centre (1425, 950) on a 2850×1900
// canvas. Image fills the canvas exactly.
(function () {
  EB.LAYOUT = {
    titleY: 50,            // Eberoth title fixed near top of canvas
    party: { x: 667, y: 773, gap: 110 },
    special: { x: 2035, y: 523 },
    crown: { x: 1425, y: 683 },
    crownRingRadius: 220,
    crownRingPoints: 6,
    housesY: 1083,
    housesXs: { corvath: 1065, voss: 1305, gorrund: 1545, halvorn: 1785 },
    houseGridY: 1363,
    houseGridGapX: 130,
    houseGridGapY: 150,
    personalY: 973,
    personalCardGapY: 145,
    loreGridY: 723,
    loreGridGapY: 145,
    headerOffset: 84
  };
  EB.LAYOUT_VERSION = 12;  // bumped: full shift to centre on canvas
  EB.SNAP_DISTANCE = 60;

  EB.customPositions = {};
  EB.globalPositions = {};
  EB.clusterOffsets = { players: {dx:0,dy:0}, houses: {dx:0,dy:0}, lore: {dx:0,dy:0} };

  EB.CLUSTERS = ['players', 'houses', 'lore'];

  // Resolve which cluster an entity belongs to. Used by render to apply
  // offsets and by drag to know what to move together.
  EB.clusterOf = function (entityId) {
    if (!entityId) return null;
    var byId = EB.byId || {};
    // Players + their backstory cards + personal refs → players cluster.
    var PLAYERS = window.PLAYERS || [];
    if (PLAYERS.some(function (p) { return p.id === entityId; })) return 'players';
    var ent = byId[entityId];
    if (ent && ent.ownerId && PLAYERS.some(function (p) { return p.id === ent.ownerId; })) return 'players';
    // Lore cards → lore cluster.
    if ((window.LORE || []).some(function (l) { return l.id === entityId; })) return 'lore';
    // Houses (factions) + their NPCs + Crown faction + crown NPCs → houses cluster.
    var HOUSE_IDS = ['corvath', 'voss', 'gorrund', 'halvorn', 'crown'];
    if (HOUSE_IDS.indexOf(entityId) >= 0) return 'houses';
    if (ent && ent.factionId && HOUSE_IDS.indexOf(ent.factionId) >= 0) return 'houses';
    return null;
  };

  // List of entity ids that belong to a cluster (for bulk move + bulk wipe).
  EB.entitiesInCluster = function (cluster) {
    var ids = [];
    var byId = EB.byId || {};
    Object.keys(byId).forEach(function (id) {
      if (EB.clusterOf(id) === cluster) ids.push(id);
    });
    return ids;
  };

  EB.PERSONAL_REFS = {
    baker:   ['aldus-corvath', 'byren-holt'],
    butcher: [],
    charlie: ['aldus-corvath']
  };
  EB.getMyRefs = function () {
    var b = EB.currentBucket();
    if (!b || b === 'dm' || b === 'guest') return [];
    return EB.PERSONAL_REFS[b] || [];
  };

  function logErr(label) {
    return function (res) {
      if (res && res.error) console.error('[Eberoth] ' + label + ' error', res.error);
      return res;
    };
  }
  function logRej(label) {
    return function (err) { console.error('[Eberoth] ' + label + ' failed', err); };
  }

  EB.initLayout = function () {
    var b = EB.currentBucket();
    var myChar = EB.BUCKET_TO_CHARACTER[b];
    var isDM = b === 'dm';
    EB.BACKSTORY = isDM
      ? (window.BACKSTORY || []).slice()
      : (window.BACKSTORY || []).filter(function (x) { return x.ownerId === myChar; });

    EB.byId = {};
    [window.PLAYERS || [], window.FACTIONS || [], window.NPCS || [],
     window.LORE || [], window.SESSIONS || [], EB.BACKSTORY]
      .forEach(function (pool) { pool.forEach(function (x) { EB.byId[x.id] = x; }); });
  };

  // Cluster-aware accessor for LAYOUT anchors. Returns a shallow clone
  // of LAYOUT with party/personal/crown/houses/lore points pre-shifted
  // by their cluster offsets so callers don't have to track which
  // anchor belongs to which cluster.
  EB.shiftedLayout = function () {
    var L = EB.LAYOUT;
    var co = EB.clusterOffsets || {};
    var pl = co.players || {dx:0,dy:0};
    var hs = co.houses  || {dx:0,dy:0};
    var lr = co.lore    || {dx:0,dy:0};
    return {
      titleY: L.titleY,
      party: { x: L.party.x + pl.dx, y: L.party.y + pl.dy, gap: L.party.gap },
      personalY: L.personalY + pl.dy,
      personalCardGapY: L.personalCardGapY,

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

      special: { x: L.special.x + lr.dx, y: L.special.y + lr.dy },
      loreGridY: L.loreGridY + lr.dy,
      loreGridGapY: L.loreGridGapY,
      headerOffset: L.headerOffset
    };
  };

  EB.loadPositionsFromSupabase = function () {
    EB.customPositions = {};
    EB.globalPositions = {};
    EB.clusterOffsets = { players: {dx:0,dy:0}, houses: {dx:0,dy:0}, lore: {dx:0,dy:0} };
    var jobs = [
      EB.sb.from('global_positions')
        .select('entity_id, x, y, layout_version')
        .eq('layout_version', EB.LAYOUT_VERSION)
        .then(function (res) {
          if (res && res.error) { console.error('[Eberoth] load global_positions error', res.error); return; }
          if (!Array.isArray(res.data)) return;
          res.data.forEach(function (row) {
            EB.globalPositions[row.entity_id] = { x: row.x, y: row.y };
          });
        }, logRej('load global_positions')),
      EB.sb.from('cluster_offsets')
        .select('cluster_id, dx, dy, layout_version')
        .eq('layout_version', EB.LAYOUT_VERSION)
        .then(function (res) {
          if (res && res.error) { console.error('[Eberoth] load cluster_offsets error', res.error); return; }
          if (!Array.isArray(res.data)) return;
          res.data.forEach(function (row) {
            EB.clusterOffsets[row.cluster_id] = { dx: row.dx, dy: row.dy };
          });
        }, logRej('load cluster_offsets'))
    ];
    var uid = EB.currentUserId();
    var actual = EB.actualBucket();
    var viewing = EB._viewAsBucket;
    // Skip personal customs while view-as is on — they're DM's customs
    // and don't represent the previewed player.
    if (uid && actual && actual !== 'guest' && !viewing) {
      jobs.push(
        EB.sb.from('node_positions')
          .select('entity_id, x, y, layout_version')
          .eq('layout_version', EB.LAYOUT_VERSION)
          .then(function (res) {
            if (res && res.error) { console.error('[Eberoth] load node_positions error', res.error); return; }
            if (!Array.isArray(res.data)) return;
            res.data.forEach(function (row) {
              EB.customPositions[row.entity_id] = { x: row.x, y: row.y };
            });
          }, logRej('load node_positions'))
      );
    }
    return Promise.all(jobs);
  };

  EB.savePositionForUser = function (entityId, pos) {
    var uid = EB.currentUserId();
    if (!uid) return Promise.resolve();
    return EB.sb.from('node_positions').upsert(
      { user_id: uid, entity_id: entityId, x: pos.x, y: pos.y, layout_version: EB.LAYOUT_VERSION },
      { onConflict: 'user_id,entity_id' }
    ).then(logErr('savePositionForUser ' + entityId), logRej('savePositionForUser ' + entityId));
  };

  // Reset to baseline — wipe this user's personal overrides everywhere.
  EB.deleteAllPositionsForUser = function () {
    var uid = EB.currentUserId();
    if (!uid) return Promise.resolve();
    return EB.sb.from('node_positions')
      .delete()
      .eq('user_id', uid)
      .then(logErr('deleteAllPositionsForUser'), logRej('deleteAllPositionsForUser'));
  };

  // DM-only: shift an entire cluster by (dx,dy). Saves to cluster_offsets
  // and wipes every user's per-node customs for entities in that cluster
  // so the shift is the new baseline for everyone.
  EB.saveClusterOffset = function (cluster, dx, dy) {
    if (EB.actualBucket() !== 'dm') return Promise.reject(new Error('Only DM can move clusters'));
    if (!cluster) return Promise.reject(new Error('No cluster id'));
    EB.clusterOffsets[cluster] = { dx: dx, dy: dy };
    var entityIds = EB.entitiesInCluster(cluster);
    var jobs = [
      EB.sb.from('cluster_offsets').upsert(
        { cluster_id: cluster, dx: dx, dy: dy, layout_version: EB.LAYOUT_VERSION, updated_at: new Date().toISOString() },
        { onConflict: 'cluster_id,layout_version' }
      ).then(logErr('saveClusterOffset upsert ' + cluster), logRej('saveClusterOffset upsert ' + cluster))
    ];
    // Wipe per-user customs + DM's globals for entities in this cluster
    // so the cluster offset is the sole truth for layout of these nodes.
    if (entityIds.length > 0) {
      jobs.push(
        EB.sb.from('node_positions').delete()
          .in('entity_id', entityIds)
          .then(logErr('saveClusterOffset wipe node_positions'), logRej('saveClusterOffset wipe node_positions'))
      );
      jobs.push(
        EB.sb.from('global_positions').delete()
          .in('entity_id', entityIds)
          .then(logErr('saveClusterOffset wipe global_positions'), logRej('saveClusterOffset wipe global_positions'))
      );
      // Strip from in-memory state too so re-render sees the shifted defaults.
      entityIds.forEach(function (id) {
        delete EB.customPositions[id];
        delete EB.globalPositions[id];
      });
    }
    return Promise.all(jobs);
  };

  EB.pushToAll = function () {
    if (EB.actualBucket() !== 'dm') return Promise.reject(new Error('Only DM can push'));
    var customs = EB.customPositions || {};
    var rows = Object.keys(customs).map(function (id) {
      return {
        entity_id: id,
        x: customs[id].x,
        y: customs[id].y,
        layout_version: EB.LAYOUT_VERSION
      };
    });
    var jobs = [];
    if (rows.length > 0) {
      jobs.push(
        EB.sb.from('global_positions')
          .upsert(rows, { onConflict: 'entity_id' })
          .then(logErr('pushToAll: upsert global_positions'), logRej('pushToAll: upsert global_positions'))
      );
    }
    jobs.push(
      EB.sb.from('node_positions')
        .delete()
        .gte('layout_version', 0)
        .then(logErr('pushToAll: delete node_positions'), logRej('pushToAll: delete node_positions'))
    );
    return Promise.all(jobs).then(function () {
      EB.customPositions = {};
      return EB.loadPositionsFromSupabase();
    });
  };

  EB.getBackstoryDefaultPos = function (b) {
    var L = EB.shiftedLayout();
    var PLAYERS = window.PLAYERS || [];
    var ownerIdx = PLAYERS.findIndex(function (p) { return p.id === b.ownerId; });
    if (ownerIdx < 0) return null;
    var siblings = EB.BACKSTORY.filter(function (x) { return x.ownerId === b.ownerId; });
    var stackIdx = siblings.findIndex(function (x) { return x.id === b.id; });
    var isDM = EB.currentBucket() === 'dm';
    var columnX = isDM
      ? L.party.x + ownerIdx * L.party.gap
      : L.party.x + L.party.gap;
    return {
      x: columnX,
      y: L.personalY + stackIdx * L.personalCardGapY
    };
  };

  EB.defaultLayout = function () {
    var L = EB.shiftedLayout(), pos = {};
    var PLAYERS = window.PLAYERS || [];
    PLAYERS.forEach(function (p, i) {
      pos[p.id] = { x: L.party.x + i * L.party.gap, y: L.party.y };
    });
    (window.LORE || []).forEach(function (l, i) {
      pos[l.id] = { x: L.special.x, y: L.loreGridY + i * L.loreGridGapY };
    });
    pos['crown'] = { x: L.crown.x, y: L.crown.y };
    var crownNpcs = (window.NPCS || []).filter(function (n) { return n.factionId === 'crown'; });
    var hexSlots = [];
    for (var i = 0; i < L.crownRingPoints; i++) {
      var a = -Math.PI / 2 + (Math.PI * 2 * i) / L.crownRingPoints;
      hexSlots.push({ x: L.crown.x + Math.cos(a) * L.crownRingRadius, y: L.crown.y + Math.sin(a) * L.crownRingRadius });
    }
    var pref = [5, 1, 4, 2, 3, 0];
    crownNpcs.forEach(function (n, i) { pos[n.id] = hexSlots[pref[i % pref.length]]; });
    Object.keys(L.housesXs).forEach(function (hid) { pos[hid] = { x: L.housesXs[hid], y: L.housesY }; });
    ['corvath', 'voss', 'gorrund', 'halvorn'].forEach(function (hid) {
      var npcs = (window.NPCS || []).filter(function (n) { return n.factionId === hid; });
      var base = pos[hid];
      npcs.forEach(function (n, i) {
        var col = i % 2, row = Math.floor(i / 2);
        pos[n.id] = {
          x: base.x + (col === 0 ? -L.houseGridGapX / 2 : L.houseGridGapX / 2),
          y: L.houseGridY + row * L.houseGridGapY
        };
      });
    });
    EB.BACKSTORY.forEach(function (b) {
      var defPos = EB.getBackstoryDefaultPos(b);
      if (defPos) pos[b.id] = defPos;
    });
    Object.keys(EB.globalPositions || {}).forEach(function (id) {
      if (pos[id]) pos[id] = EB.globalPositions[id];
    });
    return pos;
  };

  EB.currentPositions = function () {
    var pos = EB.defaultLayout();
    Object.keys(EB.customPositions || {}).forEach(function (id) {
      if (pos[id]) pos[id] = EB.customPositions[id];
    });
    return pos;
  };

  EB.getAnchors = function () {
    var L = EB.shiftedLayout(), def = EB.defaultLayout(), anchors = [];
    Object.keys(def).forEach(function (k) { anchors.push({ x: def[k].x, y: def[k].y }); });
    ['corvath', 'voss', 'gorrund', 'halvorn'].forEach(function (hid) {
      var base = def[hid];
      if (!base) return;
      for (var r = 0; r < 4; r++) for (var c = 0; c < 2; c++)
        anchors.push({ x: base.x + (c === 0 ? -L.houseGridGapX / 2 : L.houseGridGapX / 2), y: L.houseGridY + r * L.houseGridGapY });
    });
    var cp = def['crown'];
    if (cp) for (var i = 0; i < L.crownRingPoints; i++) {
      var a = (Math.PI * 2 * i) / L.crownRingPoints - Math.PI / 2;
      anchors.push({ x: cp.x + Math.cos(a) * L.crownRingRadius, y: cp.y + Math.sin(a) * L.crownRingRadius });
    }
    (window.PLAYERS || []).forEach(function (p, ownerIdx) {
      for (var s = 0; s < 6; s++) {
        anchors.push({
          x: L.party.x + ownerIdx * L.party.gap,
          y: L.personalY + s * L.personalCardGapY
        });
      }
    });
    for (var r = 0; r < 8; r++) {
      anchors.push({ x: L.special.x, y: L.loreGridY + r * L.loreGridGapY });
    }
    var dedup = [];
    anchors.forEach(function (a) {
      if (!dedup.some(function (b) { return Math.hypot(a.x - b.x, a.y - b.y) < 10; })) dedup.push(a);
    });
    return dedup;
  };
})();
