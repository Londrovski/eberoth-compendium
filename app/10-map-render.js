// Renders the map nodes + cluster labels + Eberoth title.
//
// For players (not DM), a card belonging to the viewer that's been
// pushed elsewhere on the grid by DM ALSO gets a semi-transparent
// shadow rendered at its Personal-column default position — so the
// player can always find their backstory cards in the Personal area
// even when the "real" placement is somewhere else.
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
    // Shadow: a non-draggable, click-only duplicate of a backstory card
    // sitting in the Personal column. Used for players whose card has
    // been placed elsewhere.
    function makeShadow(b, p) {
      if (!p) return;
      var el = document.createElement('div');
      el.className = 'node node-npc shadow';
      el.dataset.id = b.id + '-shadow';
      el.style.left = p.x + 'px';
      el.style.top = p.y + 'px';
      el.innerHTML =
        '<div class="shape"><div class="portrait">' + EB.portraitHTML(b) + '</div>' +
        '<div class="name">' + EB.escapeHtml(b.name) + '</div></div>';
      el.addEventListener('click', function () { EB.openDetail(b); });
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
        addClusterLabel('Personal', L.party.x + L.party.gap, L.personalY - L.headerOffset);
      }
      if ((window.LORE || []).length > 0) {
        addClusterLabel('Lore', L.special.x, L.loreGridY - L.headerOffset);
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
        makeNode('node-npc', pos[b.id], b.id,
          '<div class="shape"><div class="portrait">' + EB.portraitHTML(b) + '</div><div class="name">' + EB.escapeHtml(b.name) + '</div></div>',
          function () { EB.openDetail(b); });
      });

      // Player view only: add shadows for backstory cards that have
      // been placed elsewhere (>50px from their Personal default).
      if (EB.currentBucket() !== 'dm') {
        EB.BACKSTORY.forEach(function (b) {
          var actual = pos[b.id];
          var defPos = EB.getBackstoryDefaultPos(b);
          if (!actual || !defPos) return;
          if (Math.hypot(actual.x - defPos.x, actual.y - defPos.y) > 50) {
            makeShadow(b, defPos);
          }
        });
      }

      if (EB.applyHouseTints) EB.applyHouseTints();
    };
  };
})();
