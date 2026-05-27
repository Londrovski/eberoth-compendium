// Map layout. Positions sourced from Supabase — global_positions
// (DM-authored baseline) + node_positions (per-user overrides) +
// cluster_offsets (DM-authored cluster shifts) + home_view (DM-set
// initial viewport).
//
// Cluster offsets shift entire clusters as a unit:
//   players (party + personal), houses (crown ring + 4 houses +
//   house grids), lore, and title (the Eberoth title — independent).
// Cluster offsets are applied to every anchor *before* per-entity
// customs override on top.
//
// layout_version is stamped onto every write but NOT filtered on
// reads — per-card moves persist across LAYOUT constant tweaks.
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
  EB.LAYOUT_VERSION = 13;  // bumped to mark schema change (positions now version-agnostic)
  EB.SNAP_DISTANCE = 60;

  EB.customPositions = {};
  EB.globalPositions = {};
  EB.clusterOffsets = { players: {dx:0,dy:0}, houses: {dx:0,dy:0}, lore: {dx:0,dy:0}, title: {dx:0,dy:0} };
  EB.homeView = null;  // null = fit-to-content; {cx, cy, scale} = DM-set view

  EB.CLUSTERS = ['players', 'houses', 'lore', 'title'];
  EB.TITLE_ID = 'eberoth-title';

  // Per-player statuses — always route to 'players' cluster regardless of faction_id.
  var PLAYER_ONLY_STATUSES = ['baker_only', 'butcher_only', 'charlie_only'];

  // Resolve which cluster an entity belongs to.
  EB.clusterOf = function (entityId) {
    if (!entityId) return null;
    if (entityId === EB.TITLE_ID) return 'title';
    var byId = EB.byId || {};
    var PLAYERS = window.PLAYERS || [];
    if (PLAYERS.some(function (p) { return p.id === entityId; })) return 'players';
    var ent = byId[entityId];
    // Per-player personal cards always belong to players cluster.
    if (ent && PLAYER_ONLY_STATUSES.indexOf(ent.status) >= 0) return 'players';
    if (ent && ent.ownerId && PLAYERS.some(function (p) { return p.id === ent.ownerId; })) return 'players';
    if ((window.LORE || []).some(function (l) { return l.id === entityId; })) return 'lore';
    var HOUSE_IDS = ['corvath', 'voss', 'gorrund', 'halvorn', 'crown'];
    if (HOUSE_IDS.indexOf(entityId) >= 0) return 'houses';
    if (ent && ent.factionId && HOUSE_IDS.indexOf(ent.factionId) >= 0) return 'houses';
    return null;
  };

  EB.entitiesInCluster = function (cluster) {
    var ids = [];
    var byId = EB.byId || {};
    Object.keys(byId).forEach(function (id) {
      if (EB.clusterOf(id) === cluster) ids.push(id);
    });
    return ids;
  };

  // Personal refs: per-player shared NPC cards that appear in their personal area.
  // Baker = Kalvorn, Butcher = Dirk, Charlie = Azrael.
  EB.PERSONAL_REFS = {
    baker:   ['aldus-corvath', 'byren-holt', 'maltheus'],
    butcher: ['aldus-corvath-dirk', 'the-teacher'],
    charlie: ['cadriel', 'sylvia', 'descending-horizon'],
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
    return function (err) { console.error('[Eberoth] ' + label + ' failed', err); }
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

  EB.shiftedLayout = function () {
    var L = EB.LAYOUT;
    var co = EB.clusterOffsets || {};
    var pl = co.players || {dx:0,dy:0};
    var hs = co.houses  || {dx:0,dy:0};
    var lr = co.lore    || {dx:0,dy:0};
    var tt = co.title   || {dx:0,dy:0};
    return {
      // Title sits at (crown.x, titleY) by default, with its own offset
      // so DM can place it precisely without dragging Crown.
      titleY: L.titleY,
      titleX: L.crown.x + tt.dx,
      titleDy: tt.dy,

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
    EB.clusterOffsets = { players: {dx:0,dy:0}, houses: {dx:0,dy:0}, lore: {dx:0,dy:0}, title: {dx:0,dy:0} };
    EB.homeView = null;
    var jobs = [
      EB.sb.from('global_positions')
        .select('entity_id, x, y, layout_version')
        .then(function (res) {
          if (res && res.error) { console.error('[Eberoth] load global_positions error', res.error); return; }
          if (!Array.isArray(res.data)) return;
          res.data.forEach(function (row) {
            EB.globalPositions[row.entity_id] = { x: row.x, y: row.y };
          });
        }, logRej('load global_positions')),
      EB.sb.from('cluster_offsets')
        .select('cluster_id, dx, dy')
        .then(function (res) {
          if (res && res.error) { console.error('[Eberoth] load cluster_offsets error', res.error); return; }
          if (!Array.isArray(res.data)) return;
          res.data.forEach(function (row) {
            EB.clusterOffsets[row.cluster_id] = { dx: row.dx, dy: row.dy };
          });
        }, logRej('load cluster_offsets')),
      EB.sb.from('home_view')
        .select('center_x, center_y, scale')
        .eq('id', 'default')
        .limit(1)
        .then(function (res) {
          if (res && res.error) { console.error('[Eberoth] load home_view error', res.error); return; }
          if (Array.isArray(res.data) && res.data.length) {
            var row = res.data[0];
            EB.homeView = { cx: row.center_x, cy: row.center_y, scale: row.scale };
          }
        }, logRej('load home_view'))
    ];
    var uid = EB.currentUserId();
    var actual = EB.actualBucket();
    var viewing = EB._viewAsBucket;
    if (uid && actual && actual !== 'guest' && !viewing) {
      jobs.push(
        EB.sb.from('node_positions')
          .select('entity_id, x, y, layout_version')
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

  EB.deleteAllPositionsForUser = function () {
    var uid = EB.currentUserId();
    if (!uid) return Promise.resolve();
    return EB.sb.from('node_positions')
      .delete()
      .eq('user_id', uid)
      .then(logErr('deleteAllPositionsForUser'), logRej('deleteAllPositionsForUser'));
  };

  // DM-only: shift an entire cluster by (dx,dy). Saves the offset and
  // wipes every user's per-node customs + globals for entities in that
  // cluster (so the cluster offset is the sole truth).
  EB.saveClusterOffset = function (cluster, dx, dy) {
    if (EB.actualBucket() !== 'dm') return Promise.reject(new Error('Only DM can move clusters'));
    if (!cluster) return Promise.reject(new Error('No cluster id'));
    EB.clusterOffsets[cluster] = { dx: dx, dy: dy };
    var entityIds = EB.entitiesInCluster(cluster);
    var jobs = [
      EB.sb.from('cluster_offsets').upsert(
        { cluster_id: cluster, dx: dx, dy: dy, layout_version: EB.LAYOUT_VERSION, updated_at: new Date().toISOString() },
        { onConflict: 'cluster_id' }
      ).then(logErr('saveClusterOffset upsert ' + cluster), logRej('saveClusterOffset upsert ' + cluster))
    ];
    // Title is a UI-only element with no entity rows; skip the wipes.
    if (cluster !== 'title' && entityIds.length > 0) {
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
      entityIds.forEach(function (id) {
        delete EB.customPositions[id];
        delete EB.globalPositions[id];
      });
    }
    return Promise.all(jobs);
  };

  // DM-only: save the current viewport as the Home view for everyone.
  EB.saveHomeView = function (cx, cy, scale) {
    if (EB.actualBucket() !== 'dm') return Promise.reject(new Error('Only DM can set Home'));
    EB.homeView = { cx: cx, cy: cy, scale: scale };
    return EB.sb.from('home_view').upsert(
      {
        id: 'default',
        center_x: cx, center_y: cy, scale: scale,
        layout_version: EB.LAYOUT_VERSION,
        updated_at: new Date().toISOString()
      },
      { onConflict: 'id' }
    ).then(logErr('saveHomeView'), logRej('saveHomeView'));
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

  // Return the default position for a personal (*_only) card.
  // Player's personal cards stack below their own player token.
  EB.getPersonalCardDefaultPos = function (entityId) {
    var L = EB.shiftedLayout();
    var PLAYERS = window.PLAYERS || [];
    var ent = (EB.byId || {})[entityId];
    if (!ent) return null;

    // Determine which player owns this card.
    var ownerBucket = null;
    if (ent.status === 'baker_only')   ownerBucket = 'baker';
    if (ent.status === 'butcher_only') ownerBucket = 'butcher';
    if (ent.status === 'charlie_only') ownerBucket = 'charlie';
    if (!ownerBucket) return null;

    // Map bucket to character id.
    var bucketToChar = EB.BUCKET_TO_CHARACTER || {};
    var charId = bucketToChar[ownerBucket];
    var ownerIdx = PLAYERS.findIndex(function (p) { return p.id === charId; });
    if (ownerIdx < 0) return null;

    // Stack index among all personal cards belonging to this player.
    var myRefs = EB.PERSONAL_REFS[ownerBucket] || [];
    var stackIdx = myRefs.indexOf(entityId);
    if (stackIdx < 0) stackIdx = 0;

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
    // Personal (*_only) cards — stacked below the owning player's token.
    var byId = EB.byId || {};
    Object.keys(byId).forEach(function (id) {
      var ent = byId[id];
      if (ent && PLAYER_ONLY_STATUSES.indexOf(ent.status) >= 0) {
        var defPos = EB.getPersonalCardDefaultPos(id);
        if (defPos) pos[id] = defPos;
      }
    });
    // Backstory cards (old system — kept for DM view).
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
