// ===========================
// EBEROTH COMPENDIUM — CONTENT LOADER
// ===========================
// Fetches all entities and sessions from Supabase and assembles the
// same globals the rest of the app expects:
//
//   window.FACTIONS  — kind = 'faction'
//   window.PLAYERS   — kind = 'player'
//   window.NPCS      — kind = 'npc'
//   window.LORE      — kind = 'lore'
//   window.SESSIONS  — assembled from sessions + child tables
//
// RLS handles visibility automatically: DM sees everything (all
// statuses), authenticated players and guests see only status='visible'.
//
// Call: await EB.loadContent()
// Returns nothing; populates globals as a side effect.
// Safe to call multiple times (re-fetches each time).

(function () {

  // ------------------------------------------------------------------
  // ENTITIES
  // Fetches all entities + their child facts and members in parallel,
  // then distributes into the four typed globals.
  // ------------------------------------------------------------------

  async function fetchEntities() {
    var sb = EB.sb;

    var [entRes, factsRes, membersRes] = await Promise.all([
      sb.from('entities')
        .select('*')
        .order('sort_order'),
      sb.from('entity_facts')
        .select('*')
        .order('sort_order'),
      sb.from('entity_members')
        .select('*')
        .order('sort_order'),
    ]);

    if (entRes.error)     throw new Error('[Eberoth] entities fetch failed: '      + entRes.error.message);
    if (factsRes.error)   throw new Error('[Eberoth] entity_facts fetch failed: '  + factsRes.error.message);
    if (membersRes.error) throw new Error('[Eberoth] entity_members fetch failed: ' + membersRes.error.message);

    // Index facts and members by entity_id for O(1) lookup
    var factsMap   = {};
    var membersMap = {};

    factsRes.data.forEach(function (f) {
      (factsMap[f.entity_id] = factsMap[f.entity_id] || []).push(f.fact);
    });
    membersRes.data.forEach(function (m) {
      (membersMap[m.entity_id] = membersMap[m.entity_id] || []).push({
        name: m.name,
        role: m.role,
      });
    });

    // Assemble entity objects that match the shape the app expects
    var factions = [], players = [], npcs = [], lore = [];

    entRes.data.forEach(function (e) {
      var obj = {
        id:          e.id,
        kind:        e.kind,
        name:        e.name,
        shortName:   e.short_name  || undefined,
        sub:         e.sub         || undefined,
        image:       e.image       || undefined,
        sigil:       e.sigil       || undefined,
        factionId:   e.faction_id  || undefined,
        cluster_id:  e.cluster_id  || undefined,
        body:        e.body        || undefined,
        sort_order:  e.sort_order,
        status:      e.status,
        // faction extras
        description: e.body        || undefined,   // factions use description in detail
        facts:       factsMap[e.id]   || undefined,
        members:     membersMap[e.id] || undefined,
      };

      if      (e.kind === 'faction') factions.push(obj);
      else if (e.kind === 'player')  players.push(obj);
      else if (e.kind === 'npc')     npcs.push(obj);
      else if (e.kind === 'lore')    lore.push(obj);
    });

    window.FACTIONS = factions;
    window.PLAYERS  = players;
    window.NPCS     = npcs;
    window.LORE     = lore;
  }


  // ------------------------------------------------------------------
  // SESSIONS
  // Fetches sessions + summary lines + parts + blocks + testimonies,
  // then assembles the nested structure the app expects:
  //
  //   session.summary  — string[]
  //   session.parts    — [{ label, blocks: [{ type, text?, items? }] }]
  // ------------------------------------------------------------------

  async function fetchSessions() {
    var sb = EB.sb;

    var [sessRes, summaryRes, partsRes, blocksRes, testimRes] = await Promise.all([
      sb.from('sessions')
        .select('*')
        .order('number'),
      sb.from('session_summary_lines')
        .select('*')
        .order('sort_order'),
      sb.from('session_parts')
        .select('*')
        .order('sort_order'),
      sb.from('session_blocks')
        .select('*')
        .order('sort_order'),
      sb.from('session_testimonies')
        .select('*')
        .order('sort_order'),
    ]);

    if (sessRes.error)    throw new Error('[Eberoth] sessions fetch failed: '            + sessRes.error.message);
    if (summaryRes.error) throw new Error('[Eberoth] session_summary_lines failed: '     + summaryRes.error.message);
    if (partsRes.error)   throw new Error('[Eberoth] session_parts fetch failed: '       + partsRes.error.message);
    if (blocksRes.error)  throw new Error('[Eberoth] session_blocks fetch failed: '      + blocksRes.error.message);
    if (testimRes.error)  throw new Error('[Eberoth] session_testimonies fetch failed: ' + testimRes.error.message);

    // Index by parent id
    var summaryMap   = {};   // session_id  → string[]
    var partsMap     = {};   // session_id  → part[]
    var blocksMap    = {};   // part_id     → block[]
    var testimonyMap = {};   // block_id    → testimony[]

    summaryRes.data.forEach(function (l) {
      (summaryMap[l.session_id] = summaryMap[l.session_id] || []).push(l.line);
    });

    partsRes.data.forEach(function (p) {
      (partsMap[p.session_id] = partsMap[p.session_id] || []).push(p);
    });

    blocksRes.data.forEach(function (b) {
      (blocksMap[b.part_id] = blocksMap[b.part_id] || []).push(b);
    });

    testimRes.data.forEach(function (t) {
      (testimonyMap[t.block_id] = testimonyMap[t.block_id] || []).push({
        name: t.name,
        text: t.text,
      });
    });

    var sessions = sessRes.data.map(function (s) {
      var parts = (partsMap[s.id] || []).map(function (p) {
        var blocks = (blocksMap[p.id] || []).map(function (b) {
          var block = { type: b.type };
          if (b.type === 'testimonies') {
            block.items = testimonyMap[b.id] || [];
          } else {
            block.text = b.text || '';
          }
          return block;
        });
        return { label: p.label, blocks: blocks };
      });

      return {
        id:         s.id,
        number:     s.number,
        title:      s.title,
        rowSummary: s.row_summary || '',
        status:     s.status,
        summary:    summaryMap[s.id] || [],
        parts:      parts,
        // data.js derivations (kind, name, sub, body) are applied after
      };
    });

    window.SESSIONS = sessions;
  }


  // ------------------------------------------------------------------
  // PUBLIC: EB.loadContent()
  // Fetches everything in parallel, populates all globals.
  // ------------------------------------------------------------------

  EB.loadContent = async function () {
    await Promise.all([
      fetchEntities(),
      fetchSessions(),
    ]);
  };

})();
