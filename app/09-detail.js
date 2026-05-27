// Slide-in detail panel. Two flavours of content:
//   - regular entity (NPC, faction, player, lore, backstory): portrait
//     + h2 + sub + role + affiliation + body + per-entity notes
//   - session: no portrait, rich content (summary box + parts/blocks)
//
// Factions use their sigil as the portrait image and render
// description + facts + members in place of the NPC body field.
// Lore entries render their subtitle field.
//
// Missing-image fallback is always <span class="portrait-missing">?</span>
// so the gold bold ? style applies consistently.
(function () {
  var MISSING = '<span class="portrait-missing">?</span>';

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

    // ---- Block / part rendering for session content ----
    function renderBlocks(blocks) {
      if (!Array.isArray(blocks)) return '';
      return blocks.map(function (b) {
        if (b.type === 'para')
          return '<p class="session-block-para">' + (b.text || '') + '</p>';
        if (b.type === 'highlight')
          return '<p class="session-block-highlight">' + (b.text || '') + '</p>';
        if (b.type === 'takeaway')
          return '<p class="session-block-takeaway">' + (b.text || '') + '</p>';
        if (b.type === 'testimonies')
          return '<ul class="session-block-testimonies">' +
            (b.items || []).map(function (it) {
              return '<li><span class="testimony-name">' + EB.escapeHtml(it.name || '') + ':</span> ' + (it.text || '') + '</li>';
            }).join('') +
          '</ul>';
        return '';
      }).join('');
    }
    function renderSessionParts(s) {
      if (!Array.isArray(s.parts)) return '';
      return s.parts.map(function (part) {
        var content = part.blocks
          ? renderBlocks(part.blocks)
          : '<ul class="session-block-testimonies">' +
              (part.events || []).map(function (e) {
                return '<li><strong>' + (e.bold || '') + '</strong>' + (e.text || '') + '</li>';
              }).join('') +
            '</ul>';
        return '<div class="session-detail-part-label">' + EB.escapeHtml(part.label || '') + '</div>' + content;
      }).join('');
    }

    // ---- Faction detail body ----
    function renderFactionBody(item) {
      var html = '';
      if (item.description) {
        html += '<div class="field"><div class="field-body">' + EB.escapeHtml(item.description) + '</div></div>';
      }
      if (Array.isArray(item.facts) && item.facts.length) {
        html += '<div class="field"><div class="field-label">Known</div><ul class="detail-facts">' +
          item.facts.map(function (f) {
            return '<li>' + EB.escapeHtml(f) + '</li>';
          }).join('') +
        '</ul></div>';
      }
      if (Array.isArray(item.members) && item.members.length) {
        html += '<div class="field"><div class="field-label">Members</div><ul class="detail-members">' +
          item.members.map(function (m) {
            return '<li><span class="detail-member-name">' + EB.escapeHtml(m.name) + '</span>' +
              (m.role ? ' <span class="detail-member-role">' + EB.escapeHtml(m.role) + '</span>' : '') +
              '</li>';
          }).join('') +
        '</ul></div>';
      }
      return html;
    }

    function openEntityDetail(item, fromNav) {
      if (!fromNav) {
        if (currentDetailId && currentDetailId !== item.id) detailHistory.push(currentDetailId);
      }
      currentDetailId = item.id;
      var kind = item.kind;

      // Build portrait HTML: factions use sigil, others use image.
      // Fallback is always the gold ? span.
      var portraitHTML;
      if (kind === 'faction') {
        portraitHTML = item.sigil
          ? '<img src="' + EB.escapeAttr(item.sigil) + '" alt="' + EB.escapeAttr(item.name) + '" onerror="this.parentElement.innerHTML=\'' + EB.escapeAttr(MISSING) + '\'" style="object-fit:contain;padding:16px;">'
          : MISSING;
      } else {
        portraitHTML = EB.portraitHTML(item, MISSING);
      }

      var faction = item.factionId ? (window.FACTIONS || []).find(function (f) { return f.id === item.factionId; }) : null;

      // Subtitle: explicit sub field, or lore subtitle field.
      var subtitle = item.sub || item.subtitle || '';

      // Body content varies by kind.
      var bodyHTML = '';
      if (kind === 'faction') {
        bodyHTML = renderFactionBody(item);
      } else if (item.body) {
        bodyHTML = '<div class="field"><div class="field-label">About</div><div class="field-body">' + item.body + '</div></div>';
      }

      detailInner.innerHTML =
        '<button class="detail-back" title="Back">←</button>' +
        '<button class="detail-close" title="Close">✕</button>' +
        '<div class="portrait">' + portraitHTML + '</div>' +
        '<h2>' + EB.escapeHtml(item.name) + '</h2>' +
        (subtitle ? '<div class="subtitle">' + EB.escapeHtml(subtitle) + '</div>' : '') +
        (item.role ? '<div class="field"><div class="field-label">Role</div>' + EB.escapeHtml(item.role) + '</div>' : '') +
        (faction ? '<div class="field"><div class="field-label">Affiliation</div>' + EB.escapeHtml(faction.name) + '</div>' : '') +
        bodyHTML +
        wireNotesBlock();
      mountNotes(item.id);
      detail.classList.add('open');
    }

    function openSessionDetail(s, fromNav) {
      if (!fromNav) {
        if (currentDetailId && currentDetailId !== s.id) detailHistory.push(currentDetailId);
      }
      currentDetailId = s.id;
      var summaryHTML = (Array.isArray(s.summary) && s.summary.length)
        ? '<div class="session-summary-box">' +
            '<div class="session-summary-label">Summary</div>' +
            '<ul class="session-summary-list">' +
              s.summary.map(function (line) { return '<li>' + line + '</li>'; }).join('') +
            '</ul>' +
          '</div>'
        : '';

      detailInner.innerHTML =
        '<button class="detail-back" title="Back">←</button>' +
        '<button class="detail-close" title="Close">✕</button>' +
        '<div class="session-detail-number">Session ' + (s.number != null ? s.number : '') + '</div>' +
        '<h2 class="session-detail-title">' + EB.escapeHtml(s.title || s.name || '') + '</h2>' +
        summaryHTML +
        renderSessionParts(s) +
        wireNotesBlock();
      mountNotes(s.id);
      detail.classList.add('open');
    }

    function wireNotesBlock() {
      return '<div class="field entity-notes-wrap notes-after">' +
               '<div class="field-label">Your Notes</div>' +
               '<div class="entity-notes" id="entityNotes" contenteditable="true"></div>' +
               '<div class="mention-dropdown" id="detailMentionDropdown"></div>' +
             '</div>';
    }
    function mountNotes(entityId) {
      var notesEl = detailInner.querySelector('#entityNotes');
      if (!notesEl) return;
      notesEl.innerHTML = EB.getEntityNotes(entityId);
      EB.wireTagClicks(notesEl);
      EB.attachMentions(notesEl, detailInner.querySelector('#detailMentionDropdown'), function () {
        EB.setEntityNotes(entityId, notesEl.innerHTML);
      });
      notesEl.addEventListener('input', function () {
        EB.setEntityNotes(entityId, notesEl.innerHTML);
      });
    }

    EB.openDetail = function (item, fromNav) {
      if (item.kind === 'session') return openSessionDetail(item, fromNav);
      return openEntityDetail(item, fromNav);
    };

    EB.openSessionsList = function (fromNav) {
      if (!fromNav) detailHistory = [];
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
          detailHistory.push('__sessions_list__');
          EB.openDetail(s, true);
        };
      });
      detail.classList.add('open');
    };
  };
})();
