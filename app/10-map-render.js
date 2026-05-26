// Renders the map nodes + cluster labels + Eberoth title.
(function () {
  EB.initMapRender = function () {
    var canvas = document.getElementById('canvas');
    var linesSvg = document.getElementById('lines');
    EB.canvas = canvas;

    function addClusterLabel(text, x, y) {
      var el = document.createElement('div');
      el.className = 'cluster-label';
      el.style.left = x + 'px';
      el.style.top = y + 'px';
      el.textContent = text;
      canvas.appendChild(el);
    }
    function addEberothTitle() {
      var el = document.createElement('div');
      el.className = 'eberoth-title';
      el.textContent = 'Eberoth';
      // Centred horizontally above the Crown. Shifted up ~half the
      // word's visual height to sit higher on the canvas.
      el.style.left = EB.LAYOUT.crown.x + 'px';
      el.style.top = '52px';
      canvas.appendChild(el);
    }
    function makeNode(cls, p, id, html, onOpen) {
      if (!p) return;
      var el = document.createElement('div');
      el.className = 'node ' + cls;
      el.dataset.id = id;
      el.style.left = p.x + 'px';
      el.style.top = p.y + 'px';
      el.innerHTML = html;
      EB.attachNodeInteraction(el, id, onOpen);
      canvas.appendChild(el);
    }

    EB.renderMap = function () {
      Array.prototype.forEach.call(canvas.querySelectorAll('.node, .cluster-label, .eberoth-title'), function (n) { n.remove(); });
      linesSvg.innerHTML = '';
      var L = EB.LAYOUT;
      var pos = EB.currentPositions();

      addEberothTitle();
      addClusterLabel('The Party', L.party.x + L.party.gap, L.party.y - L.headerOffset);
      if (EB.BACKSTORY.length > 0) {
        addClusterLabel('Personal', L.party.x + L.personalCardGapX / 2, L.personalY - L.headerOffset);
      }
      if ((window.LORE || []).length > 0) {
        addClusterLabel('Lore', L.special.x + L.loreGridGapX / 2, L.loreGridY - L.headerOffset);
      }

      (window.PLAYERS || []).forEach(function (p) {
        makeNode('node-player', pos[p.id], p.id,
          '<div class="shape"><div class="portrait">' + EB.portraitHTML(p) + '</div><div class="name">' + EB.escapeHtml(p.name) + '</div></div>',
          function () { EB.openDetail(p); });
      });
      (window.LORE || []).forEach(function (l) {
        makeNode('node-special', pos[l.id], l.id,
          '<div class="shape"><div class="portrait">' + EB.portraitHTML(l, '◈') + '</div><div class="name">' + EB.escapeHtml(l.name) + '</div></div>',
          function () { EB.openDetail(l); });
      });
      (window.FACTIONS || []).forEach(function (f) {
        // Faction node has the circle + a label rendered beneath it.
        makeNode('node-faction ' + f.id, pos[f.id], f.id,
          '<div class="shape">' + EB.factionSigilHTML(f) + '</div>' +
          '<div class="faction-label">' + EB.escapeHtml(f.name) + '</div>',
          function () { EB.openDetail(f); });
      });
      (window.NPCS || []).forEach(function (n) {
        makeNode('node-npc', pos[n.id], n.id,
          '<div class="shape"><div class="portrait">' + EB.portraitHTML(n) + '</div><div class="name">' + EB.escapeHtml(n.name) + '</div></div>',
          function () { EB.openDetail(n); });
      });
      EB.BACKSTORY.forEach(function (b) {
        // Backstory cards reuse the NPC frame visually.
        makeNode('node-npc', pos[b.id], b.id,
          '<div class="shape"><div class="portrait">' + EB.portraitHTML(b) + '</div><div class="name">' + EB.escapeHtml(b.name) + '</div></div>',
          function () { EB.openDetail(b); });
      });

      if (EB.applyHouseTints) EB.applyHouseTints();
    };
  };
})();
