// Slide-in detail panel + per-entity notes. Back/close use event
// delegation so they survive the inner-HTML rewrites that each open
// triggers.
(function () {
  EB.initDetail = function () {
    var detail = document.getElementById('detail');
    var detailInner = document.getElementById('detailInner');
    var detailHistory = [];
    var currentDetailId = null;

    detailInner.addEventListener('click', function (e) {
      if (e.target.closest('.detail-close')) {
        detail.classList.remove('open');
        currentDetailId = null;
        detailHistory = [];
        return;
      }
      if (e.target.closest('.detail-back')) {
        var prevId = detailHistory.pop();
        var prev = EB.byId[prevId];
        if (prev) EB.openDetail(prev, true);
      }
    });

    EB.getEntityNotes = function (id) {
      var all = EB.lsLoad('entity-notes', {});
      return all[id] || '';
    };
    EB.setEntityNotes = function (id, html) {
      var all = EB.lsLoad('entity-notes', {});
      all[id] = html;
      EB.lsSave('entity-notes', all);
    };

    EB.openDetail = function (item, fromNav) {
      if (!fromNav) {
        if (currentDetailId && currentDetailId !== item.id) detailHistory.push(currentDetailId);
      }
      currentDetailId = item.id;
      var kind = item.kind;
      var fallbackIcon = kind === 'faction'   ? '⚔'
                       : kind === 'lore'      ? '◈'
                       : kind === 'player'    ? '★'
                       : kind === 'session'   ? '✦'
                       : kind === 'backstory' ? '✥'
                       : '👤';
      var faction = item.factionId ? (window.FACTIONS || []).find(function (f) { return f.id === item.factionId; }) : null;
      var isSession = kind === 'session';
      var bodyHTML = item.body
        ? '<div class="field"><div class="field-label">' + (isSession ? 'Summary' : 'About') + '</div><div class="field-body">' + item.body + '</div></div>'
        : '';

      detailInner.innerHTML =
        '<button class="detail-back" title="Back">←</button>' +
        '<button class="detail-close" title="Close">✕</button>' +
        '<div class="portrait">' + EB.portraitHTML(item, fallbackIcon) + '</div>' +
        '<h2>' + EB.escapeHtml(item.name) + '</h2>' +
        '<div class="subtitle">' + EB.escapeHtml(item.sub || '') + '</div>' +
        (item.role ? '<div class="field"><div class="field-label">Role</div>' + EB.escapeHtml(item.role) + '</div>' : '') +
        (faction ? '<div class="field"><div class="field-label">Affiliation</div>' + EB.escapeHtml(faction.name) + '</div>' : '') +
        bodyHTML +
        '<div class="field entity-notes-wrap">' +
          '<div class="field-label">Your Notes</div>' +
          '<div class="entity-notes" id="entityNotes" contenteditable="true"></div>' +
          '<div class="mention-dropdown" id="detailMentionDropdown"></div>' +
        '</div>';

      var notesEl = detailInner.querySelector('#entityNotes');
      notesEl.innerHTML = EB.getEntityNotes(item.id);
      EB.wireTagClicks(notesEl);
      EB.attachMentions(notesEl, detailInner.querySelector('#detailMentionDropdown'), function () {
        EB.setEntityNotes(item.id, notesEl.innerHTML);
      });
      notesEl.addEventListener('input', function () {
        EB.setEntityNotes(item.id, notesEl.innerHTML);
      });
      detail.classList.add('open');
    };
  };
})();
