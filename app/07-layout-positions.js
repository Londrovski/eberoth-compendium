// ===========================
// LAYOUT POSITIONS — SUPABASE I/O
// ===========================
// All position-related Supabase reads and writes:
//
//   EB.initLayout()                  — assembles EB.byId from window globals
//   EB.loadPositionsFromSupabase()   — loads global/custom/offsets/home
//   EB.savePositionForUser()         — per-user node_positions upsert
//   EB.deleteAllPositionsForUser()   — wipes the user's customs
//   EB.saveClusterOffset()           — DM block-move write
//   EB.saveHomeView()                — DM "Set Home" write
//   EB.pushToAll()                   — DM "Push to Players" promote
//
// Position state owned here:
//   EB.customPositions  — per-user drags (node_positions)
//   EB.globalPositions  — DM-pushed baseline (global_positions)
//   EB.clusterOffsets   — DM block-moves (cluster_offsets)
//   EB.homeView         — DM-set initial viewport (home_view)
//
// layout_version is stamped on every write but NOT filtered on read —
// per-card moves persist across LAYOUT constant tweaks (informational).
(function () {

  // Initial state (also re-initialised at each load).
  EB.customPositions  = {};
  EB.globalPositions  = {};
  EB.clusterOffsets   = { players: {dx:0,dy:0}, houses: {dx:0,dy:0}, lore: {dx:0,dy:0}, title: {dx:0,dy:0} };
  EB.homeView         = null;

  function logErr(label) {
    return function (res) {
      if (res && res.error) console.error('[Eberoth] ' + label + ' error', res.error);
      return res;
    };
  }
  function logRej(label) {
    return function (err) { console.error('[Eberoth] ' + label + ' failed', err); };
  }

  // Builds EB.byId from window globals so clusterOf / defaultLayout /
  // resolveCollisions can resolve any entity by id.
  EB.initLayout = function () {
    EB.byId = {};
    [window.PLAYERS || [], window.FACTIONS || [], window.NPCS || [],
     window.LORE || [], window.SESSIONS || []]
      .forEach(function (pool) {
        pool.forEach(function (x) { EB.byId[x.id] = x; });
      });
  };

  EB.loadPositionsFromSupabase = function () {
    EB.customPositions  = {};
    EB.globalPositions  = {};
    EB.clusterOffsets   = { players: {dx:0,dy:0}, houses: {dx:0,dy:0}, lore: {dx:0,dy:0}, title: {dx:0,dy:0} };
    EB.homeView         = null;

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

    // Per-user customs only loaded for real users (not DM under View-As).
    var uid     = EB.currentUserId();
    var actual  = EB.actualBucket();
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

  // DM-only: promote current customs to globals + wipe everyone's
  // per-user customs.
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

})();
