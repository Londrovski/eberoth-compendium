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
        // Special sentinel: the sessions list isn't a regular entity.
        if (prevId === '__sessions_list__') { EB.openSessionsList(true); return; }
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

    // Session log: list view rendered into the detail panel. Each row
    // opens that session's normal detail (with back → list support).
    EB.openSessionsList = function (fromNav) {
      if (!fromNav) {
        // Coming in via the topbar button — fresh entry, clear history.
        detailHistory = [];
      }
      currentDetailId = '__sessions_list__';
      var sessions = ((window.SESSIONS || []).slice()).sort(function (a, b) { return a.number - b.number; });
      var rows = sessions.map(function (s) {
        var sub = s.rowSummary || s.date || s.sub || '';
        return '<button class="session-row" data-id="' + EB.escapeAttr(s.id) + '">' +
          '<span class="session-row-number">' + (s.number != null ? s.number : '') + '</span>' +
          '<div class="session-row-body">' +
            '<div class="session-row-title">' + EB.escapeHtml(s.title || s.name || '') + '</div>' +
            (sub ? '<div class="session-row-sub">' + EB.escapeHtml(sub) + '</div>' : '') +
          '</div>' +
          '<span class="session-row-arrow">›</span>' +
        '</button>';
      }).join('');

      detailInner.innerHTML =
        '<button class="detail-close" title="Close">✕</button>' +
        '<h2>Session Log</h2>' +
        '<div class="subtitle">A record of what has passed.</div>' +
        (rows ? '<div class="session-list">' + rows + '</div>'
              : '<div class="sessions-empty">No sessions yet.</div>');

      Array.prototype.forEach.call(detailInner.querySelectorAll('.session-row'), function (row) {
        row.onclick = function () {
          var s = EB.byId[row.dataset.id];
          if (!s) return;
          // Push the list sentinel so the session's back button returns here.
          detailHistory.push('__sessions_list__');
          EB.openDetail(s, true);
          // Reset currentDetailId after openDetail set it; we want the
          // session as current, but we already pushed the sentinel above.
        };
      });
      detail.classList.add('open');
    };
  };
})();
