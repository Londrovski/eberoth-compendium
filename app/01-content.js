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
// RLS handles visibility for real players/guests at the DB level.
// When the DM uses view-as, they're still authenticated as DM so RLS
// gives them everything — client-side filtering below mirrors what a
// player would see.
//
// Call: await EB.loadContent()
// Returns nothing; populates globals as a side effect.
// Safe to call multiple times (re-fetches each time).

(function () {

  // ------------------------------------------------------------------
  // ENTITIES
  // ------------------------------------------------------------------

  async function fetchEntities() {
    var sb = EB.sb;

    var [entRes, factsRes, membersRes] = await Promise.all([
      sb.from('entities').select('*').order('sort_order'),
      sb.from('entity_facts').select('*').order('sort_order'),
      sb.from('entity_members').select('*').order('sort_order'),
    ]);

    if (entRes.error)     throw new Error('[Eberoth] entities fetch failed: '      + entRes.error.message);
    if (factsRes.error)   throw new Error('[Eberoth] entity_facts fetch failed: '  + factsRes.error.message);
    if (membersRes.error) throw new Error('[Eberoth] entity_members fetch failed: ' + membersRes.error.message);

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

    var factions = [], players = [], npcs = [], lore = [];

    // When DM is using view-as, mirror what that bucket's RLS would return.
    var effectiveBucket = EB.currentBucket ? EB.currentBucket() : null;
    var isDM = effectiveBucket === 'dm';

    entRes.data.forEach(function (e) {
      // Client-side status filter for view-as: non-DM buckets only see 'visible'.
      if (!isDM && e.status !== 'visible') return;

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
        description: e.body        || undefined,
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
  // ------------------------------------------------------------------

  async function fetchSessions() {
    var sb = EB.sb;

    var [sessRes, summaryRes, partsRes, blocksRes, testimRes] = await Promise.all([
      sb.from('sessions').select('*').order('number'),
      sb.from('session_summary_lines').select('*').order('sort_order'),
      sb.from('session_parts').select('*').order('sort_order'),
      sb.from('session_blocks').select('*').order('sort_order'),
      sb.from('session_testimonies').select('*').order('sort_order'),
    ]);

    if (sessRes.error)    throw new Error('[Eberoth] sessions fetch failed: '            + sessRes.error.message);
    if (summaryRes.error) throw new Error('[Eberoth] session_summary_lines failed: '     + summaryRes.error.message);
    if (partsRes.error)   throw new Error('[Eberoth] session_parts fetch failed: '       + partsRes.error.message);
    if (blocksRes.error)  throw new Error('[Eberoth] session_blocks fetch failed: '      + blocksRes.error.message);
    if (testimRes.error)  throw new Error('[Eberoth] session_testimonies fetch failed: ' + testimRes.error.message);

    var summaryMap   = {};
    var partsMap     = {};
    var blocksMap    = {};
    var testimonyMap = {};

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

    var effectiveBucket = EB.currentBucket ? EB.currentBucket() : null;
    var isDM = effectiveBucket === 'dm';

    var sessions = [];
    sessRes.data.forEach(function (s) {
      // Same status filter for sessions under view-as.
      if (!isDM && s.status !== 'visible') return;

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

      sessions.push({
        id:         s.id,
        number:     s.number,
        title:      s.title,
        rowSummary: s.row_summary || '',
        status:     s.status,
        summary:    summaryMap[s.id] || [],
        parts:      parts,
      });
    });

    window.SESSIONS = sessions;
  }


  // ------------------------------------------------------------------
  // PUBLIC: EB.loadContent()
  // ------------------------------------------------------------------

  EB.loadContent = async function () {
    await Promise.all([
      fetchEntities(),
      fetchSessions(),
    ]);
  };

})();
