// ===========================
// EBEROTH COMPENDIUM — CONTENT LOADER
// ===========================
// Fetches all entities and sessions from Supabase and assembles the
// globals the rest of the app expects:
//
//   window.FACTIONS  — kind = 'faction'
//   window.PLAYERS   — kind = 'player'
//   window.NPCS      — kind = 'npc'
//   window.LORE      — kind = 'lore'
//   window.SESSIONS  — assembled from sessions + child tables
//
// Visibility model (Phase A → Phase B): RLS reads entity_visibility for
// the current viewer and only returns rows visible to them. The client
// no longer filters by entities.status — that column is legacy and will
// be dropped in Phase E.
//
// Each entity is decorated with two new fields drawn from the per-player
// tables:
//
//   entity.viewerBody  — string. The viewer's "Just for you" body
//                        section, or null if none authored. DM sees
//                        their own DM-section here; per-player bodies
//                        for DM are loaded separately for the detail
//                        panel's collapsed dropdowns (Phase D).
//   entity.tagged      — boolean. True if the current viewer is tagged
//                        on this entity (drives the glow in Phase D).
//   entity.allBodies   — DM only. Object of { viewer: body } across all
//                        viewers, for the detail panel's collapsed
//                        dropdowns. Empty {} for non-DM.
//
// Sessions are decorated with the same fields.
//
// Call: await EB.loadContent()

(function () {

  // ------------------------------------------------------------------
  // VIEWER RESOLUTION
  // ------------------------------------------------------------------
  // Buckets: 'dm' | 'baker' | 'butcher' | 'charlie' | 'guest' | null
  //
  // RLS keys off the JWT email, so DM under View-As still reads as DM —
  // i.e. RLS returns every entity. We mirror the View-As bucket
  // client-side so DM sees what the player would see.
  //
  // effectiveViewer()  — bucket used for body/tag attaches.
  // actualViewer()     — bucket the JWT actually represents (drives the
  //                      decision to apply client-side visibility filter).

  function effectiveViewer() {
    return EB.currentBucket ? EB.currentBucket() : null;
  }
  function actualViewer() {
    return EB.actualBucket ? EB.actualBucket() : null;
  }

  // Client-side mirror of entity_visibility: returns true if the
  // (effective) viewer can see an entity given its visibility rows.
  // Only used when DM is in View-As mode — RLS handles real players.
  function isVisibleTo(visMap, entityId, viewer) {
    var rows = visMap[entityId];
    if (!rows) return false;
    if (rows['*']) return true;
    return !!rows[viewer];
  }

  // ------------------------------------------------------------------
  // ENTITIES
  // ------------------------------------------------------------------

  async function fetchEntities() {
    var sb = EB.sb;
    var viewer     = effectiveViewer();
    var actual     = actualViewer();
    var isDM       = viewer === 'dm';
    // DM under View-As: RLS returns every entity (JWT is DM's), but we
    // want to render only what the View-As bucket would see.
    var clientFilter = (actual === 'dm') && viewer && viewer !== 'dm';

    // Fan out: RLS filters entities/sessions by visibility for real
    // players; the *_body / *_tag / *_visibility tables are world-read
    // or own-only so we just fetch them.
    var jobs = [
      sb.from('entities').select('*').order('sort_order'),
      sb.from('entity_facts').select('*').order('sort_order'),
      sb.from('entity_members').select('*').order('sort_order'),
      sb.from('entity_player_tag').select('entity_id, viewer'),
      sb.from('entity_player_body').select('entity_id, viewer, body'),
      sb.from('entity_visibility').select('entity_id, viewer'),
    ];

    var [entRes, factsRes, membersRes, tagsRes, bodiesRes, visRes] = await Promise.all(jobs);

    if (entRes.error)     throw new Error('[Eberoth] entities fetch failed: '      + entRes.error.message);
    if (factsRes.error)   throw new Error('[Eberoth] entity_facts fetch failed: '  + factsRes.error.message);
    if (membersRes.error) throw new Error('[Eberoth] entity_members fetch failed: '+ membersRes.error.message);
    if (tagsRes.error)    throw new Error('[Eberoth] entity_player_tag fetch failed: ' + tagsRes.error.message);
    if (bodiesRes.error)  throw new Error('[Eberoth] entity_player_body fetch failed: ' + bodiesRes.error.message);
    if (visRes.error)     throw new Error('[Eberoth] entity_visibility fetch failed: ' + visRes.error.message);

    var factsMap   = {};
    var membersMap = {};
    var tagMap     = {};   // entity_id → { viewer: true }
    var bodyMap    = {};   // entity_id → { viewer: body }
    var visMap     = {};   // entity_id → { viewer: true }

    factsRes.data.forEach(function (f) {
      (factsMap[f.entity_id] = factsMap[f.entity_id] || []).push(f.fact);
    });
    membersRes.data.forEach(function (m) {
      (membersMap[m.entity_id] = membersMap[m.entity_id] || []).push({
        name: m.name, role: m.role,
      });
    });
    tagsRes.data.forEach(function (t) {
      (tagMap[t.entity_id] = tagMap[t.entity_id] || {})[t.viewer] = true;
    });
    bodiesRes.data.forEach(function (b) {
      (bodyMap[b.entity_id] = bodyMap[b.entity_id] || {})[b.viewer] = b.body;
    });
    visRes.data.forEach(function (v) {
      (visMap[v.entity_id] = visMap[v.entity_id] || {})[v.viewer] = true;
    });

    var factions = [], players = [], npcs = [], lore = [];

    entRes.data.forEach(function (e) {
      // DM under View-As: mirror the player's visibility client-side.
      if (clientFilter && !isVisibleTo(visMap, e.id, viewer)) return;
      var entTags    = tagMap[e.id] || {};
      var entBodies  = bodyMap[e.id] || {};
      var viewerKey  = (viewer === 'dm' || viewer === 'baker' ||
                        viewer === 'butcher' || viewer === 'charlie') ? viewer : null;

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
        body:        (e.shared_body != null ? e.shared_body : e.body) || undefined,
        sort_order:  e.sort_order,
        status:      e.status,
        description: (e.shared_body != null ? e.shared_body : e.body) || undefined,
        facts:       factsMap[e.id]   || undefined,
        members:     membersMap[e.id] || undefined,

        // New visibility-model fields:
        tagged:      viewerKey ? !!entTags[viewerKey] : false,
        viewerBody:  viewerKey ? (entBodies[viewerKey] || null) : null,
        // DM sees every per-player body via the detail panel dropdowns.
        // Non-DM viewers get an empty object — RLS on entity_player_body
        // would have returned only their own row anyway.
        allBodies:   isDM ? entBodies : {},
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
    var viewer = effectiveViewer();
    var actual = actualViewer();
    var isDM   = viewer === 'dm';
    var clientFilter = (actual === 'dm') && viewer && viewer !== 'dm';

    var [sessRes, summaryRes, partsRes, blocksRes, testimRes, sTagsRes, sBodiesRes, sVisRes] = await Promise.all([
      sb.from('sessions').select('*').order('number'),
      sb.from('session_summary_lines').select('*').order('sort_order'),
      sb.from('session_parts').select('*').order('sort_order'),
      sb.from('session_blocks').select('*').order('sort_order'),
      sb.from('session_testimonies').select('*').order('sort_order'),
      sb.from('session_player_tag').select('session_id, viewer'),
      sb.from('session_player_body').select('session_id, viewer, body'),
      sb.from('session_visibility').select('session_id, viewer'),
    ]);

    if (sessRes.error)    throw new Error('[Eberoth] sessions fetch failed: '            + sessRes.error.message);
    if (summaryRes.error) throw new Error('[Eberoth] session_summary_lines failed: '     + summaryRes.error.message);
    if (partsRes.error)   throw new Error('[Eberoth] session_parts fetch failed: '       + partsRes.error.message);
    if (blocksRes.error)  throw new Error('[Eberoth] session_blocks fetch failed: '      + blocksRes.error.message);
    if (testimRes.error)  throw new Error('[Eberoth] session_testimonies fetch failed: ' + testimRes.error.message);
    if (sTagsRes.error)   throw new Error('[Eberoth] session_player_tag fetch failed: '  + sTagsRes.error.message);
    if (sBodiesRes.error) throw new Error('[Eberoth] session_player_body fetch failed: ' + sBodiesRes.error.message);
    if (sVisRes.error)    throw new Error('[Eberoth] session_visibility fetch failed: '  + sVisRes.error.message);

    var summaryMap   = {};
    var partsMap     = {};
    var blocksMap    = {};
    var testimonyMap = {};
    var sTagMap      = {};
    var sBodyMap     = {};
    var sVisMap      = {};

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
        name: t.name, text: t.text,
      });
    });
    sTagsRes.data.forEach(function (t) {
      (sTagMap[t.session_id] = sTagMap[t.session_id] || {})[t.viewer] = true;
    });
    sBodiesRes.data.forEach(function (b) {
      (sBodyMap[b.session_id] = sBodyMap[b.session_id] || {})[b.viewer] = b.body;
    });
    sVisRes.data.forEach(function (v) {
      (sVisMap[v.session_id] = sVisMap[v.session_id] || {})[v.viewer] = true;
    });

    var sessions = [];
    sessRes.data.forEach(function (s) {
      // DM under View-As: mirror the player's visibility client-side.
      if (clientFilter && !isVisibleTo(sVisMap, s.id, viewer)) return;
      var sTags    = sTagMap[s.id] || {};
      var sBodies  = sBodyMap[s.id] || {};
      var viewerKey = (viewer === 'dm' || viewer === 'baker' ||
                       viewer === 'butcher' || viewer === 'charlie') ? viewer : null;

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

        // New visibility-model fields:
        tagged:     viewerKey ? !!sTags[viewerKey] : false,
        viewerBody: viewerKey ? (sBodies[viewerKey] || null) : null,
        allBodies:  isDM ? sBodies : {},
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
    // BACKSTORY is no longer populated from the DB — those rows are now
    // normal entities decorated with visibility/tag/body. The old
    // window.BACKSTORY array stays initialised to [] in data.js so any
    // legacy renderer code that iterates it becomes a no-op.
  };

})();
