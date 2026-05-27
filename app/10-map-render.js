// Renders the map nodes + cluster labels + Eberoth title.
//
// Reads EB.shiftedLayout() (not EB.LAYOUT directly) so cluster offsets
// applied by the DM ripple through to labels, ref shadows, etc.
//
// Every node + shadow + cluster label is tagged with data-cluster so
// the DM block-move drag can collect "everything in this cluster" via
// a single DOM query. Ref shadows always belong to the players
// cluster (they live in the Personal column) regardless of where the
// underlying entity normally lives. The Eberoth title is its own
// cluster ('title') so DM can position it independently of houses.
//
// Shadows:
//   - For PLAYERS: their backstory cards that have been placed
//     elsewhere render an extra shadow in the Personal column, AND
//     their personal refs (entities they're tied to that live
//     elsewhere) render as shadows below the backstory.
//   - For DM: per-owner backstory columns get personal-ref shadows
//     beneath each player's backstory, so DM can see what each
//     player's Personal section will end up looking like.
(function () {
  EB.initMapRender = function () {
    var canvas = document.getElementById('canvas');
    var linesSvg = document.getElementById('lines');
    EB.canvas = canvas;

    function addClusterLabel(text, x, y, cluster) {
      var el = document.createElement('div');
      el.className = 'cluster-label';
      el.style.left = x + 'px';
      el.style.top = y + 'px';
      el.textContent = text;
      if (cluster) el.dataset.cluster = cluster;
      canvas.appendChild(el);
    }
    function addEberothTitle() {
      var el = document.createElement('div');
      el.className = 'eberoth-title';
      el.textContent = 'Eberoth';
      var L = EB.shiftedLayout();
      el.style.left = L.titleX + 'px';
      el.style.top = ((L.titleY || 50) + (L.titleDy || 0)) + 'px';
      el.dataset.cluster = 'title';
      el.dataset.id = EB.TITLE_ID || 'eberoth-title';
      // Attach drag interaction so block mode can grab the title.
      // onOpen is a no-op — clicking the title does nothing.
      EB.attachNodeInteraction(el, el.dataset.id, function () {});
      canvas.appendChild(el);
    }
    function makeNode(cls, p, id, html, onOpen, cluster) {
      if (!p) return;
      var el = document.createElement('div');
      el.className = 'node ' + cls;
      el.dataset.id = id;
      if (cluster) el.dataset.cluster = cluster;
      el.style.left = p.x + 'px';
      el.style.top = p.y + 'px';
      el.innerHTML = html;
      EB.attachNodeInteraction(el, id, onOpen);
      canvas.appendChild(el);
    }
    function makeShadow(entity, p, suffix, cluster) {
      if (!p) return;
      var el = document.createElement('div');
      el.className = 'node node-npc shadow';
      el.dataset.id = entity.id + (suffix || '-shadow');
      if (cluster) el.dataset.cluster = cluster;
      el.style.left = p.x + 'px';
      el.style.top = p.y + 'px';
      el.innerHTML =
        '<div class="shape"><div class="portrait">' + EB.portraitHTML(entity) + '</div>' +
        '<div class="name">' + EB.escapeHtml(entity.name) + '</div></div>';
      el.addEventListener('click', function () { EB.openDetail(entity); });
      canvas.appendChild(el);
    }

    function clusterForEntity(id) {
      return EB.clusterOf ? EB.clusterOf(id) : null;
    }

    EB.renderMap = function () {
      Array.prototype.forEach.call(canvas.querySelectorAll('.node, .cluster-label, .eberoth-title'), function (n) { n.remove(); });
      linesSvg.innerHTML = '';
      var L = EB.shiftedLayout();
      var pos = EB.currentPositions();
      var bucket = EB.currentBucket();
      var isDM = bucket === 'dm';

      addEberothTitle();
      addClusterLabel('The Party', L.party.x + L.party.gap, L.party.y - L.headerOffset, 'players');
      var refs = EB.getMyRefs();
      var hasPersonal = EB.BACKSTORY.length > 0 || (!isDM && refs.length > 0)
        || (isDM && Object.keys(EB.PERSONAL_REFS).some(function (k) { return (EB.PERSONAL_REFS[k] || []).length > 0; }));
      if (hasPersonal) {
        addClusterLabel('Personal', L.party.x + L.party.gap, L.personalY - L.headerOffset, 'players');
      }
      if ((window.LORE || []).length > 0) {
        addClusterLabel('Lore', L.special.x, L.loreGridY - L.headerOffset, 'lore');
      }

      (window.PLAYERS || []).forEach(function (p) {
        makeNode('node-player', pos[p.id], p.id,
          '<div class="shape"><div class="portrait">' + EB.portraitHTML(p) + '</div><div class="name">' + EB.escapeHtml(p.name) + '</div></div>',
          function () { EB.openDetail(p); }, 'players');
      });
      (window.LORE || []).forEach(function (l) {
        makeNode('node-special', pos[l.id], l.id,
          '<div class="shape"><div class="portrait">' + EB.portraitHTML(l, '◈') + '</div><div class="name">' + EB.escapeHtml(l.name) + '</div></div>',
          function () { EB.openDetail(l); }, 'lore');
      });
      (window.FACTIONS || []).forEach(function (f) {
        makeNode('node-faction ' + f.id, pos[f.id], f.id,
          '<div class="shape">' + EB.factionSigilHTML(f) + '</div>' +
          '<div class="faction-label">' + EB.escapeHtml(f.name) + '</div>',
          function () { EB.openDetail(f); }, clusterForEntity(f.id));
      });
      (window.NPCS || []).forEach(function (n) {
        makeNode('node-npc', pos[n.id], n.id,
          '<div class="shape"><div class="portrait">' + EB.portraitHTML(n) + '</div><div class="name">' + EB.escapeHtml(n.name) + '</div></div>',
          function () { EB.openDetail(n); }, clusterForEntity(n.id));
      });
      EB.BACKSTORY.forEach(function (b) {
        makeNode('node-npc', pos[b.id], b.id,
          '<div class="shape"><div class="portrait">' + EB.portraitHTML(b) + '</div><div class="name">' + EB.escapeHtml(b.name) + '</div></div>',
          function () { EB.openDetail(b); }, 'players');
      });

      // ---- Shadow duplicates ----
      if (!isDM) {
        EB.BACKSTORY.forEach(function (b) {
          var actual = pos[b.id];
          var defPos = EB.getBackstoryDefaultPos(b);
          if (!actual || !defPos) return;
          if (Math.hypot(actual.x - defPos.x, actual.y - defPos.y) > 50) {
            makeShadow(b, defPos, '-shadow', 'players');
          }
        });
        var stackIdx = EB.BACKSTORY.length;
        refs.forEach(function (refId) {
          var entity = EB.byId[refId];
          if (!entity) return;
          var p = {
            x: L.party.x + L.party.gap,
            y: L.personalY + stackIdx * L.personalCardGapY
          };
          makeShadow(entity, p, '-ref', 'players');
          stackIdx++;
        });
      } else {
        ['baker', 'butcher', 'charlie'].forEach(function (bkt) {
          var bktRefs = EB.PERSONAL_REFS[bkt] || [];
          if (bktRefs.length === 0) return;
          var charId = EB.BUCKET_TO_CHARACTER[bkt];
          var ownerIdx = (window.PLAYERS || []).findIndex(function (p) { return p.id === charId; });
          if (ownerIdx < 0) return;
          var ownerBackstoryCount = (window.BACKSTORY || [])
            .filter(function (b) { return b.ownerId === charId; }).length;
          var s = ownerBackstoryCount;
          bktRefs.forEach(function (refId) {
            var entity = EB.byId[refId];
            if (!entity) return;
            var p = {
              x: L.party.x + ownerIdx * L.party.gap,
              y: L.personalY + s * L.personalCardGapY
            };
            makeShadow(entity, p, '-ref-' + bkt, 'players');
            s++;
          });
        });
      }

      if (EB.applyHouseTints) EB.applyHouseTints();
    };
  };
})();
