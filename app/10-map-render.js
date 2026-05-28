// Renders the map nodes + cluster labels + Eberoth title.
//
// Reads EB.shiftedLayout() (not EB.LAYOUT directly) so cluster offsets
// applied by the DM ripple through to labels.
//
// Every node + cluster label is tagged with data-cluster so the DM
// block-move drag can collect "everything in this cluster" via a
// single DOM query. The Eberoth title is rendered as a real .node
// (.node-title) tagged data-cluster="title" so it inherits the
// standard drag mechanic.
//
// shortName: if an entity has a shortName field it is used on the map
// card label; the full name is still used in the detail panel h2.
//
// Phase C (2026-05-28): retired the BACKSTORY loop and both shadow
// loops (player-view + DM-view) along with the Personal column. The
// new Lore cluster grid takes their place — entities flow into it via
// EB.defaultLayout() based on cluster_id='lore'. The Lore cluster
// label now sits above the new grid, sourced from
// EB.shiftedLayout().loreGrid.anchor (so cluster_offsets.lore ripples).
(function () {
  EB.initMapRender = function () {
    var canvas = document.getElementById('canvas');
    var linesSvg = document.getElementById('lines');
    EB.canvas = canvas;

    function cardLabel(entity) {
      return EB.escapeHtml(entity.shortName || entity.name);
    }

    function addClusterLabel(text, x, y, cluster) {
      var el = document.createElement('div');
      el.className = 'cluster-label';
      el.style.left = x + 'px';
      el.style.top = y + 'px';
      el.textContent = text;
      if (cluster) el.dataset.cluster = cluster;
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
    function addEberothTitle() {
      var L = EB.shiftedLayout();
      var id = EB.TITLE_ID || 'eberoth-title';
      var p = { x: L.titleX, y: (L.titleY || 50) + (L.titleDy || 0) };
      makeNode(
        'node-title',
        p,
        id,
        '<div class="shape"><div class="title-text">Eberoth</div></div>',
        function () {},
        'title'
      );
    }

    function clusterForEntity(id) {
      return EB.clusterOf ? EB.clusterOf(id) : null;
    }

    EB.renderMap = function () {
      Array.prototype.forEach.call(canvas.querySelectorAll('.node, .cluster-label, .eberoth-title'), function (n) { n.remove(); });
      linesSvg.innerHTML = '';
      var L = EB.shiftedLayout();
      var pos = EB.currentPositions();

      addEberothTitle();

      // Party row label — above the party row.
      addClusterLabel('The Party', L.party.x + L.party.gap, L.party.y - L.headerOffset, 'players');

      // Lore grid label — above the new lore cluster grid. The grid's
      // top row sits at loreGrid.anchor.y; the label sits headerOffset
      // pixels above that, centered on the middle column.
      var loreEntities = EB.entitiesInCluster ? EB.entitiesInCluster('lore') : [];
      if (loreEntities.length > 0) {
        var loreLabelX = L.loreGrid.anchor.x + L.loreGrid.gapX; // middle col of 3
        var loreLabelY = L.loreGrid.anchor.y - L.headerOffset;
        addClusterLabel('Lore', loreLabelX, loreLabelY, 'lore');
      }

      (window.PLAYERS || []).forEach(function (p) {
        makeNode('node-player', pos[p.id], p.id,
          '<div class="shape"><div class="portrait">' + EB.portraitHTML(p) + '</div><div class="name">' + cardLabel(p) + '</div></div>',
          function () { EB.openDetail(p); }, 'players');
      });
      (window.LORE || []).forEach(function (l) {
        makeNode('node-special', pos[l.id], l.id,
          '<div class="shape"><div class="portrait">' + EB.portraitHTML(l) + '</div><div class="name">' + cardLabel(l) + '</div></div>',
          function () { EB.openDetail(l); }, clusterForEntity(l.id));
      });
      (window.FACTIONS || []).forEach(function (f) {
        makeNode('node-faction ' + f.id, pos[f.id], f.id,
          '<div class="shape">' + EB.factionSigilHTML(f) + '</div>' +
          '<div class="faction-label">' + EB.escapeHtml(f.name) + '</div>',
          function () { EB.openDetail(f); }, clusterForEntity(f.id));
      });
      (window.NPCS || []).forEach(function (n) {
        makeNode('node-npc', pos[n.id], n.id,
          '<div class="shape"><div class="portrait">' + EB.portraitHTML(n) + '</div><div class="name">' + cardLabel(n) + '</div></div>',
          function () { EB.openDetail(n); }, clusterForEntity(n.id));
      });

      if (EB.applyHouseTints) EB.applyHouseTints();
    };
  };
})();
