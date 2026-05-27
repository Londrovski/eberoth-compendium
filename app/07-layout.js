// Map layout. Positions sourced from Supabase — global_positions
// (DM-authored baseline) + node_positions (per-user overrides).
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

  EB.loadPositionsFromSupabase = function () {
    EB.customPositions = {};
    EB.globalPositions = {};
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
        }, logRej('load global_positions'))
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
    var L = EB.LAYOUT;
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
    var L = EB.LAYOUT, pos = {};
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
    var L = EB.LAYOUT, def = EB.defaultLayout(), anchors = [];
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
