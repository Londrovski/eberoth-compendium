// Map layout: positions, anchors, saved-state. Party + Personal shifted
// right + down vs the prototype to free top space for the Eberoth title.
(function () {
  EB.LAYOUT = {
    party: { x: 290, y: 490, gap: 110 },
    special: { x: 1610, y: 240 },
    crown: { x: 1000, y: 400 },
    crownRingRadius: 220,
    crownRingPoints: 6,
    housesY: 800,
    housesXs: { halvorn: 640, gorrund: 880, corvath: 1120, voss: 1360 },
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
  EB.LAYOUT_VERSION = 9;  // bump when LAYOUT changes meaningfully
  EB.SNAP_DISTANCE = 60;

  EB.initLayout = function () {
    // Backstory filter: DM sees all, players see their own only, guest none.
    var b = EB.currentBucket();
    var myChar = EB.BUCKET_TO_CHARACTER[b];
    var isDM = b === 'dm';
    EB.BACKSTORY = isDM
      ? (window.BACKSTORY || []).slice()
      : (window.BACKSTORY || []).filter(function (x) { return x.ownerId === myChar; });

    // byId index across visible entities, for tag-click resolution.
    EB.byId = {};
    [window.PLAYERS || [], window.FACTIONS || [], window.NPCS || [],
     window.LORE || [], window.SESSIONS || [], EB.BACKSTORY]
      .forEach(function (pool) { pool.forEach(function (x) { EB.byId[x.id] = x; }); });

    // Load saved drag positions (versioned to invalidate stale ones).
    try {
      var raw = EB.lsLoad('positions', null);
      EB.customPositions = (raw && raw.__v === EB.LAYOUT_VERSION) ? (raw.positions || {}) : {};
    } catch (e) { EB.customPositions = {}; }
  };

  EB.savePositions = function () {
    EB.lsSave('positions', { __v: EB.LAYOUT_VERSION, positions: EB.customPositions });
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
    ['halvorn', 'gorrund', 'corvath', 'voss'].forEach(function (hid) {
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
    return pos;
  };

  EB.currentPositions = function () {
    var pos = EB.defaultLayout();
    Object.keys(EB.customPositions).forEach(function (id) {
      if (pos[id]) pos[id] = EB.customPositions[id];
    });
    return pos;
  };

  EB.getAnchors = function () {
    var L = EB.LAYOUT, def = EB.defaultLayout(), anchors = [];
    Object.keys(def).forEach(function (k) { anchors.push({ x: def[k].x, y: def[k].y }); });
    ['halvorn', 'gorrund', 'corvath', 'voss'].forEach(function (hid) {
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
