// ===========================
// EBEROTH COMPENDIUM — APP
// ===========================
// Loaded by loader.js after all data/ files have populated:
//   window.PLAYERS, FACTIONS, NPCS, LORE, SESSIONS, BACKSTORY
// data.js has already normalised `kind` and derived session
// id/sub/body for mentions.
//
// This is the Phase 1 port of compendium-prototype.html.
// State (positions, threads, notes) lives in localStorage,
// namespaced per bucket. Phase 3 replaces that with Supabase.
//
// See `Compendium Update/compendium-redesign-handoff.md` for the
// design spec and `infrastructure-audit.md` for the architecture
// the auth and state model targets.

function initEberoth() {

  // ===== DATA =====
  const PLAYERS       = window.PLAYERS       || [];
  const FACTIONS      = window.FACTIONS      || [];
  const NPCS          = window.NPCS          || [];
  const LORE          = window.LORE          || [];
  const SESSIONS      = window.SESSIONS      || [];
  const BACKSTORY_ALL = window.BACKSTORY     || [];

  // ===== AUTH (Phase 1: cosmetic, client-side) =====
  // Phase 3 will replace this with Supabase signInWithPassword,
  // but the BUCKET → CHARACTER mapping and per-bucket namespacing
  // stay the same.
  const PASSCODES = {
    'MAREN':   'baker',
    'SAMAEL':  'butcher',
    'TEACHER': 'charlie',
    'THOREBE': 'dm',
  };
  const BUCKET_TO_CHARACTER = {
    'baker':   'kalvorn',
    'butcher': 'azrael',
    'charlie': 'dirk',
    // 'dm' has no character; 'guest' has no character
  };

  function normalisePasscode(s) {
    return String(s).replace(/[^a-zA-Z]/g, '').toUpperCase();
  }

  function currentBucket() {
    return localStorage.getItem('compendium-bucket') || null;
  }
  function setBucket(b) {
    if (b) localStorage.setItem('compendium-bucket', b);
    else localStorage.removeItem('compendium-bucket');
  }

  // Per-bucket localStorage key. Guests get no persistence (every
  // reload is a fresh canvas) — this is intentional, matches the
  // guest behaviour we'll get from Supabase RLS in Phase 3.
  function ns(key) {
    const b = currentBucket();
    if (!b || b === 'guest') return null;
    return 'compendium:' + b + ':' + key;
  }
  function lsLoad(key, fallback) {
    const k = ns(key);
    if (!k) return fallback;
    try {
      const raw = localStorage.getItem(k);
      return raw == null ? fallback : JSON.parse(raw);
    } catch (e) { return fallback; }
  }
  function lsSave(key, value) {
    const k = ns(key);
    if (!k) return;
    localStorage.setItem(k, JSON.stringify(value));
  }

  // ===== LANDING WIRING =====
  const landing       = document.getElementById('landing');
  const landingInput  = document.getElementById('landingInput');
  const landingSubmit = document.getElementById('landingSubmit');
  const landingGuest  = document.getElementById('landingGuest');
  const landingError  = document.getElementById('landingError');
  const appEl         = document.getElementById('app');
  const roleBadge     = document.getElementById('roleBadge');
  const logoutBtn     = document.getElementById('logout');

  function showLanding() {
    landing.style.display = 'flex';
    appEl.style.display   = 'none';
    setTimeout(() => landingInput.focus(), 50);
  }
  function showApp() {
    landing.style.display = 'none';
    appEl.style.display   = 'flex';
    const b = currentBucket();
    roleBadge.textContent = b ? b.toUpperCase() : 'GUEST';
  }

  function tryLogin() {
    const code = normalisePasscode(landingInput.value);
    const bucket = PASSCODES[code];
    if (!bucket) {
      landingError.textContent = 'Not recognised.';
      landingInput.value = '';
      landingInput.classList.add('shake');
      setTimeout(() => landingInput.classList.remove('shake'), 500);
      return;
    }
    landingError.textContent = '';
    setBucket(bucket);
    boot();
  }

  landingSubmit.addEventListener('click', tryLogin);
  landingInput.addEventListener('keydown', e => { if (e.key === 'Enter') tryLogin(); });
  landingGuest.addEventListener('click', () => { setBucket('guest'); boot(); });
  logoutBtn.addEventListener('click', () => { setBucket(null); location.reload(); });

  // ===== BOOT =====
  // Decides: landing vs app. If a bucket is already set in
  // localStorage, jump straight into the app.
  function boot() {
    if (!currentBucket()) { showLanding(); return; }
    showApp();
    initMapAndDrawer();
  }

  // Everything below lives in initMapAndDrawer so it doesn't run
  // until we're authenticated. State is bucket-scoped.
  function initMapAndDrawer() {

    // Backstory filter — DM sees all, players see their own only,
    // guest sees none. This is the visibility rule from the audit.
    const myChar = BUCKET_TO_CHARACTER[currentBucket()];
    const isDM   = currentBucket() === 'dm';
    const BACKSTORY = isDM
      ? BACKSTORY_ALL
      : BACKSTORY_ALL.filter(b => b.ownerId === myChar);

    // Resolve any entity by id across all the arrays we care about.
    // BACKSTORY is the filtered list, so mentions of someone else's
    // backstory entity won't resolve for a non-DM player (correct).
    const byId = {};
    [...PLAYERS, ...FACTIONS, ...NPCS, ...LORE, ...SESSIONS, ...BACKSTORY]
      .forEach(x => byId[x.id] = x);

    // ===== MAP LAYOUT =====
    const canvas   = document.getElementById('canvas');
    const linesSvg = document.getElementById('lines');
    const viewport = document.getElementById('viewport');

    const LAYOUT = {
      party: { x: 180, y: 240, gap: 110 },
      special: { x: 1610, y: 240 },
      crown: { x: 1000, y: 400 },
      crownRingRadius: 220,
      crownRingPoints: 6,
      housesY: 800,
      housesXs: { halvorn: 640, gorrund: 880, corvath: 1120, voss: 1360 },
      houseGridY: 1080,
      houseGridGapX: 130,
      houseGridGapY: 150,
      personalY: 440,
      personalCardGapX: 110,
      personalCardGapY: 145,
      loreGridY: 440,
      loreGridGapX: 110,
      loreGridGapY: 145,
      headerOffset: 84,
    };

    // Bump LAYOUT_VERSION when the LAYOUT structure changes
    // meaningfully — invalidates saved positions to avoid
    // stranded nodes from prior layouts.
    const LAYOUT_VERSION = 8;
    let customPositions = {};
    try {
      const raw = lsLoad('positions', null);
      if (raw && raw.__v === LAYOUT_VERSION) {
        customPositions = raw.positions || {};
      }
    } catch (e) { customPositions = {}; }

    function savePositions() {
      lsSave('positions', { __v: LAYOUT_VERSION, positions: customPositions });
    }

    function defaultLayout() {
      const pos = {};
      PLAYERS.forEach((p, i) => {
        pos[p.id] = { x: LAYOUT.party.x + i * LAYOUT.party.gap, y: LAYOUT.party.y };
      });

      // Lore grid starts at the special anchor; entries fill 2-wide.
      LORE.forEach((l, i) => {
        const col = i % 2;
        const row = Math.floor(i / 2);
        pos[l.id] = {
          x: LAYOUT.special.x + col * LAYOUT.loreGridGapX,
          y: LAYOUT.loreGridY + row * LAYOUT.loreGridGapY,
        };
      });

      pos['crown'] = { x: LAYOUT.crown.x, y: LAYOUT.crown.y };

      const crownNpcs = NPCS.filter(n => n.factionId === 'crown');
      const hexSlots = [];
      for (let i = 0; i < LAYOUT.crownRingPoints; i++) {
        const angle = -Math.PI / 2 + (Math.PI * 2 * i) / LAYOUT.crownRingPoints;
        hexSlots.push({
          x: LAYOUT.crown.x + Math.cos(angle) * LAYOUT.crownRingRadius,
          y: LAYOUT.crown.y + Math.sin(angle) * LAYOUT.crownRingRadius,
        });
      }
      // Prefer upper slots (5 = upper-left, 1 = upper-right)
      const crownSlotPref = [5, 1, 4, 2, 3, 0];
      crownNpcs.forEach((n, i) => {
        pos[n.id] = hexSlots[crownSlotPref[i % crownSlotPref.length]];
      });

      Object.entries(LAYOUT.housesXs).forEach(([hid, x]) => {
        pos[hid] = { x, y: LAYOUT.housesY };
      });

      ['halvorn', 'gorrund', 'corvath', 'voss'].forEach(hid => {
        const npcs = NPCS.filter(n => n.factionId === hid);
        const base = pos[hid];
        npcs.forEach((n, i) => {
          const col = i % 2;
          const row = Math.floor(i / 2);
          pos[n.id] = {
            x: base.x + (col === 0 ? -LAYOUT.houseGridGapX / 2 : LAYOUT.houseGridGapX / 2),
            y: LAYOUT.houseGridY + row * LAYOUT.houseGridGapY,
          };
        });
      });

      BACKSTORY.forEach((b, i) => {
        const col = i % 2;
        const row = Math.floor(i / 2);
        pos[b.id] = {
          x: LAYOUT.party.x + col * LAYOUT.personalCardGapX,
          y: LAYOUT.personalY + row * LAYOUT.personalCardGapY,
        };
      });

      return pos;
    }

    function currentPositions() {
      const pos = defaultLayout();
      Object.entries(customPositions).forEach(([id, p]) => {
        if (pos[id]) pos[id] = p;
      });
      return pos;
    }

    function getAnchors() {
      const def = defaultLayout();
      const anchors = [];
      Object.values(def).forEach(p => anchors.push({ x: p.x, y: p.y }));
      ['halvorn', 'gorrund', 'corvath', 'voss'].forEach(hid => {
        const base = def[hid];
        if (!base) return;
        for (let row = 0; row < 4; row++) {
          for (let col = 0; col < 2; col++) {
            anchors.push({
              x: base.x + (col === 0 ? -LAYOUT.houseGridGapX / 2 : LAYOUT.houseGridGapX / 2),
              y: LAYOUT.houseGridY + row * LAYOUT.houseGridGapY,
            });
          }
        }
      });
      const crownPos = def['crown'];
      if (crownPos) {
        for (let i = 0; i < LAYOUT.crownRingPoints; i++) {
          const angle = (Math.PI * 2 * i) / LAYOUT.crownRingPoints - Math.PI / 2;
          anchors.push({
            x: crownPos.x + Math.cos(angle) * LAYOUT.crownRingRadius,
            y: crownPos.y + Math.sin(angle) * LAYOUT.crownRingRadius,
          });
        }
      }
      // Personal grid anchors (2 x 4)
      for (let row = 0; row < 4; row++) {
        for (let col = 0; col < 2; col++) {
          anchors.push({
            x: LAYOUT.party.x + col * LAYOUT.personalCardGapX,
            y: LAYOUT.personalY + row * LAYOUT.personalCardGapY,
          });
        }
      }
      // Lore grid anchors (2 x 4)
      for (let row = 0; row < 4; row++) {
        for (let col = 0; col < 2; col++) {
          anchors.push({
            x: LAYOUT.special.x + col * LAYOUT.loreGridGapX,
            y: LAYOUT.loreGridY + row * LAYOUT.loreGridGapY,
          });
        }
      }
      // Dedupe close-together anchors
      const dedup = [];
      anchors.forEach(a => {
        if (!dedup.some(b => Math.hypot(a.x - b.x, a.y - b.y) < 10)) {
          dedup.push(a);
        }
      });
      return dedup;
    }
    const SNAP_DISTANCE = 60;

    // ===== RENDER =====
    function escapeAttr(s) {
      return String(s == null ? '' : s).replace(/"/g, '&quot;').replace(/</g, '&lt;');
    }
    function initials(name) {
      return String(name || '').split(' ').filter(Boolean).map(s => s[0]).slice(0, 2).join('');
    }
    // Renders <img> if image is provided, with inline onerror fallback
    // that swaps in initials. Keeps the renderer simple — no async dance.
    function portraitHTML(entity, fallbackGlyph) {
      const fallback = fallbackGlyph != null ? fallbackGlyph : initials(entity.name);
      if (entity.image) {
        const src = escapeAttr(entity.image);
        const alt = escapeAttr(entity.name);
        // Note: onerror swap to text; safe-ish given alt/src are entity-controlled.
        return `<img src="${src}" alt="${alt}" onerror="this.parentElement.innerHTML='${escapeAttr(fallback)}'">`;
      }
      return fallback;
    }
    function factionSigilHTML(faction) {
      if (faction.sigil) {
        const src = escapeAttr(faction.sigil);
        const alt = escapeAttr(faction.name);
        return `<img src="${src}" alt="${alt}" onerror="this.parentElement.innerHTML='${escapeAttr(faction.name)}'">`;
      }
      return faction.name;
    }

    function renderMap() {
      [...canvas.querySelectorAll('.node, .cluster-label')].forEach(n => n.remove());
      linesSvg.innerHTML = '';
      const pos = currentPositions();

      addClusterLabel('The Party', LAYOUT.party.x + LAYOUT.party.gap, LAYOUT.party.y - LAYOUT.headerOffset);
      if (BACKSTORY.length > 0) {
        addClusterLabel('Personal', LAYOUT.party.x + LAYOUT.personalCardGapX / 2, LAYOUT.personalY - LAYOUT.headerOffset);
      }
      if (LORE.length > 0) {
        addClusterLabel('Lore', LAYOUT.special.x + LAYOUT.loreGridGapX / 2, LAYOUT.loreGridY - LAYOUT.headerOffset);
      }

      PLAYERS  .forEach(p => addPlayerNode (p, pos[p.id]));
      LORE     .forEach(l => addLoreNode   (l, pos[l.id]));
      FACTIONS .forEach(f => addFactionNode(f, pos[f.id]));
      NPCS     .forEach(n => addNpcNode    (n, pos[n.id]));
      BACKSTORY.forEach(b => addBackstoryNode(b, pos[b.id]));

      applyHouseTints();
    }

    function addClusterLabel(text, x, y) {
      const el = document.createElement('div');
      el.className = 'cluster-label';
      el.style.left = x + 'px';
      el.style.top  = y + 'px';
      el.textContent = text;
      canvas.appendChild(el);
    }
    function makeNode(cls, p, id, html, onOpen) {
      if (!p) return;
      const el = document.createElement('div');
      el.className = 'node ' + cls;
      el.dataset.id = id;
      el.style.left = p.x + 'px';
      el.style.top  = p.y + 'px';
      el.innerHTML  = html;
      attachNodeInteraction(el, id, onOpen);
      canvas.appendChild(el);
    }
    function addPlayerNode(p, pos) {
      makeNode('node-player', pos, p.id,
        `<div class="shape"><div class="portrait">${portraitHTML(p)}</div><div class="name">${p.name}</div></div>`,
        () => openDetail(p));
    }
    function addNpcNode(n, pos) {
      makeNode('node-npc', pos, n.id,
        `<div class="shape"><div class="portrait">${portraitHTML(n)}</div><div class="name">${n.name}</div></div>`,
        () => openDetail(n));
    }
    function addFactionNode(f, pos) {
      makeNode(`node-faction ${f.id}`, pos, f.id,
        `<div class="shape">${factionSigilHTML(f)}</div>`,
        () => openDetail(f));
    }
    function addLoreNode(l, pos) {
      makeNode('node-special', pos, l.id,
        `<div class="shape"><div class="portrait">${portraitHTML(l, '◈')}</div><div class="name">${l.name}</div></div>`,
        () => openDetail(l));
    }
    function addBackstoryNode(b, pos) {
      // Backstory cards visually use the NPC card frame.
      makeNode('node-npc', pos, b.id,
        `<div class="shape"><div class="portrait">${portraitHTML(b)}</div><div class="name">${b.name}</div></div>`,
        () => openDetail(b));
    }

    // ===== NODE DRAG + SNAP =====
    const DRAG_THRESHOLD = 5;
    function attachNodeInteraction(el, id, onOpen) {
      let startX = 0, startY = 0, nodeStartX = 0, nodeStartY = 0;
      let dragging = false, armed = false;

      el.addEventListener('mousedown', (e) => {
        e.stopPropagation();
        if (e.button !== 0) return;
        armed = true; dragging = false;
        startX = e.clientX; startY = e.clientY;
        nodeStartX = parseFloat(el.style.left);
        nodeStartY = parseFloat(el.style.top);
        document.addEventListener('mousemove', onMove);
        document.addEventListener('mouseup', onUp, { once: true });
      });

      function onMove(e) {
        if (!armed) return;
        const dx = e.clientX - startX;
        const dy = e.clientY - startY;
        if (!dragging && Math.hypot(dx, dy) < DRAG_THRESHOLD) return;
        if (!dragging) {
          dragging = true;
          el.classList.add('node-dragging');
          showAnchors();
        }
        const newX = nodeStartX + dx / scale;
        const newY = nodeStartY + dy / scale;
        el.style.left = newX + 'px';
        el.style.top  = newY + 'px';
        highlightNearestAnchor(newX, newY);
      }

      function onUp() {
        document.removeEventListener('mousemove', onMove);
        armed = false;
        if (!dragging) { onOpen(); return; }
        dragging = false;
        el.classList.remove('node-dragging');
        const x = parseFloat(el.style.left);
        const y = parseFloat(el.style.top);
        const snap = nearestAnchor(x, y);
        let final = { x, y };
        if (snap && snap.dist < SNAP_DISTANCE) {
          final = { x: snap.anchor.x, y: snap.anchor.y };
          el.style.left = final.x + 'px';
          el.style.top  = final.y + 'px';
        }
        customPositions[id] = final;
        savePositions();
        hideAnchors();
        applyHouseTints();
      }
    }
    function nearestAnchor(x, y) {
      const anchors = getAnchors();
      let best = null;
      anchors.forEach(a => {
        const d = Math.hypot(a.x - x, a.y - y);
        if (!best || d < best.dist) best = { anchor: a, dist: d };
      });
      return best;
    }
    let anchorEls = [];
    function showAnchors() {
      hideAnchors();
      const anchors = getAnchors();
      anchors.forEach((a, i) => {
        const el = document.createElement('div');
        el.className = 'anchor';
        el.style.left = a.x + 'px';
        el.style.top  = a.y + 'px';
        el.dataset.idx = i;
        canvas.appendChild(el);
        anchorEls.push(el);
      });
    }
    function hideAnchors() {
      anchorEls.forEach(el => el.remove());
      anchorEls = [];
    }
    function highlightNearestAnchor(x, y) {
      const anchors = getAnchors();
      let bestIdx = -1, bestDist = Infinity;
      anchors.forEach((a, i) => {
        const d = Math.hypot(a.x - x, a.y - y);
        if (d < bestDist) { bestDist = d; bestIdx = i; }
      });
      anchorEls.forEach((el, i) => {
        el.classList.toggle('anchor-near', i === bestIdx && bestDist < SNAP_DISTANCE);
      });
    }

    // House-tint based on current position (positional, not factionId).
    function applyHouseTints() {
      const houses = ['halvorn', 'gorrund', 'corvath', 'voss'];
      const def = defaultLayout();
      const zones = houses.map(hid => {
        const base = def[hid];
        if (!base) return null;
        const x0 = base.x - LAYOUT.houseGridGapX / 2 - 60;
        const x1 = base.x + LAYOUT.houseGridGapX / 2 + 60;
        const y0 = LAYOUT.houseGridY - 80;
        const y1 = LAYOUT.houseGridY + 3 * LAYOUT.houseGridGapY + 80;
        return { hid, x0, x1, y0, y1 };
      }).filter(Boolean);

      [...canvas.querySelectorAll('.node-npc')].forEach(el => {
        houses.forEach(h => el.classList.remove('in-' + h));
        const x = parseFloat(el.style.left);
        const y = parseFloat(el.style.top);
        const zone = zones.find(z => x >= z.x0 && x <= z.x1 && y >= z.y0 && y <= z.y1);
        if (zone) el.classList.add('in-' + zone.hid);
      });
    }

    // ===== DETAIL PANEL =====
    const detail      = document.getElementById('detail');
    const detailInner = document.getElementById('detailInner');
    let detailHistory = [];
    let currentDetailId = null;

    // Event delegation — survives innerHTML rewrites.
    detailInner.addEventListener('click', (e) => {
      if (e.target.closest('.detail-close')) {
        detail.classList.remove('open');
        currentDetailId = null;
        detailHistory = [];
        return;
      }
      if (e.target.closest('.detail-back')) {
        const prevId = detailHistory.pop();
        const prev = byId[prevId];
        if (prev) openDetail(prev, true);
        return;
      }
    });

    function getEntityNotes(id) {
      const all = lsLoad('entity-notes', {});
      return all[id] || '';
    }
    function setEntityNotes(id, html) {
      const all = lsLoad('entity-notes', {});
      all[id] = html;
      lsSave('entity-notes', all);
    }

    function openDetail(item, fromNav) {
      if (!fromNav) {
        if (currentDetailId && currentDetailId !== item.id) {
          detailHistory.push(currentDetailId);
        }
      }
      currentDetailId = item.id;
      const kind = item.kind;
      const fallbackIcon = kind === 'faction'   ? '⚔'
                         : kind === 'lore'      ? '◈'
                         : kind === 'player'    ? '★'
                         : kind === 'session'   ? '✦'
                         : kind === 'backstory' ? '✥'
                         : '👤';
      const faction = item.factionId ? FACTIONS.find(f => f.id === item.factionId) : null;
      const isSession = kind === 'session';

      // For sessions, lore, NPCs etc., the public body field is shown
      // when it exists. Players don't get a DM-side description override.
      const bodyHTML = item.body
        ? `<div class="field"><div class="field-label">${isSession ? 'Summary' : 'About'}</div><div class="field-body">${item.body}</div></div>`
        : '';

      detailInner.innerHTML = `
        <button class="detail-back" title="Back">←</button>
        <button class="detail-close" title="Close">✕</button>
        <div class="portrait">${portraitHTML(item, fallbackIcon)}</div>
        <h2>${item.name}</h2>
        <div class="subtitle">${item.sub || ''}</div>
        ${item.role ? `<div class="field"><div class="field-label">Role</div>${item.role}</div>` : ''}
        ${faction ? `<div class="field"><div class="field-label">Affiliation</div>${faction.name}</div>` : ''}
        ${bodyHTML}
        <div class="field entity-notes-wrap">
          <div class="field-label">Your Notes</div>
          <div class="entity-notes" id="entityNotes" contenteditable="true"></div>
          <div class="mention-dropdown" id="detailMentionDropdown"></div>
        </div>
      `;
      const notesEl = detailInner.querySelector('#entityNotes');
      notesEl.innerHTML = getEntityNotes(item.id);
      wireEntityNoteTagClicks(notesEl);
      attachEntityMentions(notesEl, detailInner.querySelector('#detailMentionDropdown'), item.id);
      notesEl.addEventListener('input', () => {
        setEntityNotes(item.id, notesEl.innerHTML);
      });
      detail.classList.add('open');
    }

    function wireEntityNoteTagClicks(container) {
      [...container.querySelectorAll('.tag')].forEach(t => {
        t.onmousedown = (e) => {
          e.preventDefault();
          e.stopPropagation();
          const id = t.dataset.id;
          const entity = byId[id];
          if (entity) openDetail(entity);
        };
        t.onclick = (e) => { e.preventDefault(); e.stopPropagation(); };
      });
    }

    // ===== PAN / ZOOM =====
    let scale = 0.6, tx = 0, ty = 0;
    function applyTransform() {
      canvas.style.transform = `translate(${tx}px, ${ty}px) scale(${scale})`;
    }
    function centerInitial() {
      const vw = viewport.clientWidth;
      tx = vw / 2 - LAYOUT.crown.x * scale;
      ty = 30;
      applyTransform();
    }
    let isPanning = false, lastX = 0, lastY = 0;
    viewport.addEventListener('mousedown', (e) => {
      if (e.target.closest('.node') || e.target.closest('.map-controls')) return;
      isPanning = true; lastX = e.clientX; lastY = e.clientY;
    });
    window.addEventListener('mousemove', (e) => {
      if (!isPanning) return;
      tx += e.clientX - lastX;
      ty += e.clientY - lastY;
      lastX = e.clientX; lastY = e.clientY;
      applyTransform();
    });
    window.addEventListener('mouseup', () => isPanning = false);
    viewport.addEventListener('wheel', (e) => {
      e.preventDefault();
      const rect = viewport.getBoundingClientRect();
      const mx = e.clientX - rect.left;
      const my = e.clientY - rect.top;
      const delta = e.deltaY < 0 ? 1.04 : 0.96;
      const newScale = Math.max(0.3, Math.min(2, scale * delta));
      tx = mx - (mx - tx) * (newScale / scale);
      ty = my - (my - ty) * (newScale / scale);
      scale = newScale;
      applyTransform();
    }, { passive: false });

    document.getElementById('zoomIn').onclick = () => { scale = Math.min(2, scale * 1.1); applyTransform(); };
    document.getElementById('zoomOut').onclick = () => { scale = Math.max(0.3, scale / 1.1); applyTransform(); };
    document.getElementById('zoomReset').onclick = () => { scale = 0.6; centerInitial(); };
    document.getElementById('layoutReset').onclick = () => {
      if (Object.keys(customPositions).length === 0) return;
      if (confirm('Reset all node positions to default?')) {
        customPositions = {};
        savePositions();
        renderMap();
      }
    };

    // ===== DRAWER TOGGLE =====
    const drawer = document.getElementById('drawer');
    const drawerToggle = document.getElementById('drawerToggle');
    drawerToggle.onclick = () => {
      drawer.classList.toggle('collapsed');
      drawerToggle.textContent = drawer.classList.contains('collapsed') ? '▶' : '◀';
      drawerToggle.style.left = drawer.classList.contains('collapsed') ? '0px' : '340px';
    };

    // ===== THREADS =====
    const threadsList = document.getElementById('threadsList');
    const addThreadBtn = document.getElementById('addThread');

    let threads = lsLoad('threads', null);
    if (!threads) threads = [];
    function saveThreads() { lsSave('threads', threads); }

    let dragSrcIndex = null;
    function renderThreads() {
      threadsList.innerHTML = '';
      if (threads.length === 0) {
        threadsList.innerHTML = '<div class="threads-empty">No active threads. Tap + to add one.</div>';
        return;
      }
      threads.forEach((t, i) => {
        const el = document.createElement('div');
        el.className = 'thread';
        el.dataset.index = i;
        el.innerHTML = `
          <span class="drag" draggable="true" title="Drag to reorder">⠿</span>
          <span class="text" contenteditable="true">${escapeHtml(t.text)}</span>
          <button class="del" title="Remove">✕</button>
        `;
        const textEl = el.querySelector('.text');
        textEl.addEventListener('blur', () => {
          threads[i].text = textEl.innerText.trim() || '(untitled)';
          saveThreads();
        });
        el.querySelector('.del').onclick = () => {
          threads.splice(i, 1);
          saveThreads(); renderThreads();
        };
        const handle = el.querySelector('.drag');
        handle.addEventListener('dragstart', (e) => {
          dragSrcIndex = i;
          el.classList.add('dragging');
          e.dataTransfer.effectAllowed = 'move';
          try { e.dataTransfer.setData('text/plain', String(i)); } catch (err) {}
        });
        handle.addEventListener('dragend', () => {
          el.classList.remove('dragging');
          [...threadsList.children].forEach(c => c.classList.remove('drop-above', 'drop-below'));
          dragSrcIndex = null;
        });
        el.addEventListener('dragover', (e) => {
          e.preventDefault();
          e.dataTransfer.dropEffect = 'move';
          const rect = el.getBoundingClientRect();
          const above = (e.clientY - rect.top) < rect.height / 2;
          [...threadsList.children].forEach(c => c.classList.remove('drop-above', 'drop-below'));
          el.classList.add(above ? 'drop-above' : 'drop-below');
        });
        el.addEventListener('dragleave', () => {
          el.classList.remove('drop-above', 'drop-below');
        });
        el.addEventListener('drop', (e) => {
          e.preventDefault();
          if (dragSrcIndex == null) return;
          const rect = el.getBoundingClientRect();
          const above = (e.clientY - rect.top) < rect.height / 2;
          let to = i + (above ? 0 : 1);
          const from = dragSrcIndex;
          if (from < to) to -= 1;
          if (from === to) return;
          const [moved] = threads.splice(from, 1);
          threads.splice(to, 0, moved);
          saveThreads(); renderThreads();
        });
        threadsList.appendChild(el);
      });
    }
    addThreadBtn.onclick = () => {
      threads.push({ id: Date.now(), text: 'New thread' });
      saveThreads(); renderThreads();
    };
    renderThreads();

    // ===== NOTES + @ TAGS =====
    const notesTabs       = document.getElementById('notesTabs');
    const noteBody        = document.getElementById('noteBody');
    const mentionDropdown = document.getElementById('mentionDropdown');

    let notesState = lsLoad('notes', null);
    if (!notesState) {
      notesState = {
        activeId: 1,
        tabs: [{ id: 1, label: 'Session', html: '' }],
      };
    }
    function saveNotes() { lsSave('notes', notesState); }

    function renderTabs() {
      notesTabs.innerHTML = '';
      notesState.tabs.forEach(tab => {
        const el = document.createElement('button');
        el.className = 'note-tab' + (tab.id === notesState.activeId ? ' active' : '');
        el.innerHTML = `
          <span class="label">${escapeHtml(tab.label)}</span>
          <span class="close" title="Close tab">✕</span>
        `;
        const labelEl = el.querySelector('.label');

        // Defer single-click so a double-click on the label pre-empts it.
        let clickTimer = null;
        el.addEventListener('click', (e) => {
          if (e.target.classList.contains('close')) return;
          if (labelEl.isContentEditable) return;
          if (clickTimer) return;
          clickTimer = setTimeout(() => {
            clickTimer = null;
            if (labelEl.isContentEditable) return;
            notesState.activeId = tab.id;
            saveNotes(); renderTabs(); loadActiveBody();
          }, 220);
        });

        labelEl.addEventListener('dblclick', (e) => {
          e.preventDefault();
          e.stopPropagation();
          if (clickTimer) { clearTimeout(clickTimer); clickTimer = null; }
          labelEl.contentEditable = 'true';
          labelEl.classList.add('editing');
          labelEl.focus();
          const range = document.createRange();
          range.selectNodeContents(labelEl);
          const sel = window.getSelection();
          sel.removeAllRanges(); sel.addRange(range);
        });
        labelEl.addEventListener('blur', () => {
          labelEl.contentEditable = 'false';
          labelEl.classList.remove('editing');
          tab.label = labelEl.innerText.trim() || 'Untitled';
          saveNotes(); renderTabs();
        });
        labelEl.addEventListener('keydown', (e) => {
          if (e.key === 'Enter')  { e.preventDefault(); labelEl.blur(); }
          if (e.key === 'Escape') { labelEl.innerText = tab.label; labelEl.blur(); }
        });
        el.querySelector('.close').onclick = (e) => {
          e.stopPropagation();
          if (notesState.tabs.length === 1) return;
          const idx = notesState.tabs.findIndex(t => t.id === tab.id);
          notesState.tabs.splice(idx, 1);
          if (notesState.activeId === tab.id) {
            notesState.activeId = notesState.tabs[Math.max(0, idx - 1)].id;
          }
          saveNotes(); renderTabs(); loadActiveBody();
        };
        notesTabs.appendChild(el);
      });
      const addBtn = document.createElement('button');
      addBtn.className = 'add-tab'; addBtn.textContent = '+'; addBtn.title = 'New tab';
      addBtn.onclick = () => {
        const newId = Date.now();
        notesState.tabs.push({ id: newId, label: 'New', html: '' });
        notesState.activeId = newId;
        saveNotes(); renderTabs(); loadActiveBody();
      };
      notesTabs.appendChild(addBtn);
    }

    function loadActiveBody() {
      const active = notesState.tabs.find(t => t.id === notesState.activeId);
      noteBody.innerHTML = active ? (active.html || '') : '';
      wireTagClicks();
    }
    function persistBody() {
      const active = notesState.tabs.find(t => t.id === notesState.activeId);
      if (active) { active.html = noteBody.innerHTML; saveNotes(); }
    }
    function wireTagClicks() {
      [...noteBody.querySelectorAll('.tag')].forEach(t => {
        t.onmousedown = (e) => {
          e.preventDefault();
          e.stopPropagation();
          const id = t.dataset.id;
          const entity = byId[id];
          if (entity) openDetail(entity);
        };
        t.onclick = (e) => { e.preventDefault(); e.stopPropagation(); };
      });
    }
    function allMentionables() {
      return [
        ...PLAYERS  .map(p => ({ ...p, group: 'Party'    })),
        ...FACTIONS .map(f => ({ ...f, group: 'Factions' })),
        ...NPCS     .map(n => ({ ...n, group: 'NPCs'     })),
        ...LORE     .map(l => ({ ...l, group: 'Lore'     })),
        ...SESSIONS .map(s => ({ ...s, group: 'Sessions' })),
        ...BACKSTORY.map(b => ({ ...b, group: 'Personal' })),
      ];
    }

    // Reusable mention controller — attach to any contenteditable element.
    function attachMentions(bodyEl, dropdownEl, onPersist) {
      let visible = false, matches = [], selected = 0;
      let startNode = null, startOffset = 0;

      function hide() {
        dropdownEl.style.display = 'none';
        visible = false; matches = [];
      }
      function trigger() {
        const sel = window.getSelection();
        if (!sel.rangeCount) return hide();
        const range = sel.getRangeAt(0);
        if (range.startContainer.nodeType !== Node.TEXT_NODE) return hide();
        if (!bodyEl.contains(range.startContainer)) return hide();
        const text = range.startContainer.textContent;
        const offset = range.startOffset;
        const before = text.slice(0, offset);
        const m = before.match(/(?:^|\s)@([\w\s-]{0,30})$/);
        if (!m) return hide();
        const query = m[1].toLowerCase().trim();
        startNode = range.startContainer;
        startOffset = offset - m[1].length - 1;
        show(query);
      }
      function show(query) {
        const all = allMentionables();
        const filtered = query ? all.filter(e => e.name.toLowerCase().includes(query)) : all;
        matches = filtered.slice(0, 8);
        if (matches.length === 0) return hide();
        selected = 0;
        renderList();
        position();
        dropdownEl.style.display = 'block';
        visible = true;
      }
      function renderList() {
        dropdownEl.innerHTML = matches.map((e, i) => `
          <div class="mention-item ${i === selected ? 'selected' : ''}" data-i="${i}">
            <span class="m-name">${e.name}</span>
            <span class="m-sub">${e.group}${e.role ? ' — ' + e.role : ''}</span>
          </div>
        `).join('');
        [...dropdownEl.querySelectorAll('.mention-item')].forEach(item => {
          item.onmousedown = (ev) => {
            ev.preventDefault();
            selected = parseInt(item.dataset.i);
            choose();
          };
        });
      }
      function move(d) {
        selected = (selected + d + matches.length) % matches.length;
        renderList();
      }
      function choose() {
        const entity = matches[selected];
        if (!entity) return hide();
        insertTag(entity);
        hide();
      }
      function insertTag(entity) {
        if (!startNode) return;
        const sel = window.getSelection();
        if (!sel.rangeCount) return;
        const range = sel.getRangeAt(0);
        const r = document.createRange();
        r.setStart(startNode, startOffset);
        r.setEnd(range.startContainer, range.startOffset);
        r.deleteContents();

        const tag = document.createElement('span');
        tag.className = 'tag';
        tag.contentEditable = 'false';
        tag.dataset.id = entity.id;
        tag.textContent = entity.name;
        tag.onmousedown = (ev) => {
          ev.preventDefault();
          ev.stopPropagation();
          openDetail(entity);
        };
        tag.onclick = (ev) => { ev.preventDefault(); ev.stopPropagation(); };
        r.insertNode(tag);

        const space = document.createTextNode(' ');
        tag.parentNode.insertBefore(space, tag.nextSibling);
        const after = document.createRange();
        after.setStart(space, 1);
        after.collapse(true);
        sel.removeAllRanges();
        sel.addRange(after);
        if (onPersist) onPersist();
      }
      function position() {
        const sel = window.getSelection();
        if (!sel.rangeCount) return;
        const range = sel.getRangeAt(0).cloneRange();
        range.collapse(true);
        const rect = range.getClientRects()[0] || range.getBoundingClientRect();
        const parentRect = dropdownEl.parentElement.getBoundingClientRect();
        dropdownEl.style.left = (rect.left - parentRect.left) + 'px';
        dropdownEl.style.top  = (rect.bottom - parentRect.top + 4) + 'px';
      }

      bodyEl.addEventListener('input', () => {
        if (onPersist) onPersist();
        trigger();
      });
      bodyEl.addEventListener('click', (e) => {
        if (!e.target.classList.contains('tag')) hide();
      });
      bodyEl.addEventListener('keydown', (e) => {
        if (!visible) return;
        if (e.key === 'ArrowDown')                       { e.preventDefault(); move(1); }
        else if (e.key === 'ArrowUp')                    { e.preventDefault(); move(-1); }
        else if (e.key === 'Enter' || e.key === 'Tab')   { e.preventDefault(); choose(); }
        else if (e.key === 'Escape')                     { hide(); }
      });
      bodyEl.addEventListener('blur', () => setTimeout(hide, 150));

      return { hide };
    }

    // Main notepad — wire mentions
    attachMentions(noteBody, mentionDropdown, persistBody);

    // Per-entity notes — same controller, different body and persist hook
    function attachEntityMentions(notesEl, dropdownEl, entityId) {
      attachMentions(notesEl, dropdownEl, () => {
        setEntityNotes(entityId, notesEl.innerHTML);
      });
    }

    renderTabs();
    loadActiveBody();

    // ===== UTIL =====
    function escapeHtml(s) {
      return String(s).replace(/[&<>"']/g, c => ({
        '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
      }[c]));
    }

    // ===== INIT =====
    renderMap();
    centerInitial();
  }

  // Boot path: jump straight into the app if already authenticated,
  // otherwise show landing.
  boot();
}

// Run init whether DOM is already ready (loader case) or not.
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initEberoth);
} else {
  initEberoth();
}
