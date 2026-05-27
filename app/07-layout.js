// Map layout: positions, anchors, saved-state. Positions sourced from
// Supabase — global_positions (DM-authored, world-readable) and
// node_positions (per-user override, RLS-scoped).
//
// IMPORTANT: in Supabase JS v2, builder chains like .from(t).upsert(x)
// are lazy — the HTTP request only fires when .then()/await is called.
// All save/delete helpers below call .then() internally so callers can
// fire-and-forget safely.
(function () {
  EB.LAYOUT = {
    party: { x: 290, y: 490, gap: 110 },
    special: { x: 1610, y: 240 },
    crown: { x: 1000, y: 400 },
    crownRingRadius: 220,
    crownRingPoints: 6,
    housesY: 800,
    housesXs: { corvath: 640, voss: 880, gorrund: 1120, halvorn: 1360 },
    houseGridY: 1080,
    houseGridGapX: 130,
    houseGridGapY: 150,
    personalY: 690,
    personalCardGapX: 110,
    personalCardGapY: 145,
    loreGridY: 440,
    loreGridGapX: 110,
    loreGridGapY: 145,
    headerOffset: 84
  };
  EB.LAYOUT_VERSION = 10;
  EB.SNAP_DISTANCE = 60;

  EB.customPositions = {};
  EB.globalPositions = {};

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
    var bucket = EB.currentBucket();
    if (uid && bucket && bucket !== 'guest') {
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

  // Bulk-upsert DM's current customs into global_positions, then wipe
  // ALL node_positions rows so every player's personal overrides go
  // away (RLS policy node_positions_delete_dm permits this for DM).
  // The delete uses .gte('layout_version', 0) as a "match all" filter
  // because Supabase requires a filter on delete.
  EB.pushToAll = function () {
    if (EB.currentBucket() !== 'dm') return Promise.reject(new Error('Only DM can push'));
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
      // DM's own customs were promoted to globals AND wiped from
      // node_positions — reset local state and reload from DB so the
      // map renders from the new authoritative baseline.
      EB.customPositions = {};
      return EB.loadPositionsFromSupabase();
    });
  };

  EB.defaultLayout = function () {
    var L = EB.LAYOUT, pos = {};
    (window.PLAYERS || []).forEach(function (p, i) {
      pos[p.id] = { x: L.party.x + i * L.party.gap, y: L.party.y };
    });
    (window.LORE || []).forEach(function (l, i) {
      pos[l.id] = { x: L.special.x + (i % 2) * L.loreGridGapX, y: L.loreGridY + Math.floor(i / 2) * L.loreGridGapY };
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
    EB.BACKSTORY.forEach(function (b, i) {
      pos[b.id] = { x: L.party.x + (i % 2) * L.personalCardGapX, y: L.personalY + Math.floor(i / 2) * L.personalCardGapY };
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
    for (var r = 0; r < 4; r++) for (var c = 0; c < 2; c++) {
      anchors.push({ x: L.party.x + c * L.personalCardGapX, y: L.personalY + r * L.personalCardGapY });
      anchors.push({ x: L.special.x + c * L.loreGridGapX, y: L.loreGridY + r * L.loreGridGapY });
    }
    var dedup = [];
    anchors.forEach(function (a) {
      if (!dedup.some(function (b) { return Math.hypot(a.x - b.x, a.y - b.y) < 10; })) dedup.push(a);
    });
    return dedup;
  };
})();
