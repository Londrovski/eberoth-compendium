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
//
// DM inline editor: Edit button (DM-only) swaps panel into a form.
// Editable fields: name, sub, body/description, status, facts[], members[].
// Save writes to Supabase (entities + entity_facts + entity_members) and
// updates the in-memory globals so the map re-renders immediately.
//
// Entity notes: saved per user per entity to Supabase user_notes table.
// Falls back gracefully if the table doesn't exist yet.
(function () {
  var MISSING = '<span class="portrait-missing">?</span>';

  // ---- Supabase note helpers ----
  // These are async; the UI optimistically writes without waiting.
  function getNoteKey(id) {
    // entity_id is stored as text; sessions use their string id too
    return String(id);
  }

  EB.getEntityNotes = async function (id) {
    try {
      var email = EB._userEmail;
      if (!email) return '';
      var res = await EB.sb
        .from('user_notes')
        .select('html')
        .eq('user_email', email)
        .eq('entity_id', getNoteKey(id))
        .maybeSingle();
      return (res.data && res.data.html) || '';
    } catch (e) { return ''; }
  };

  EB.setEntityNotes = function (id, html) {
    var email = EB._userEmail;
    if (!email) return;
    EB.sb.from('user_notes').upsert({
      user_email: email,
      entity_id:  getNoteKey(id),
      html:       html,
      updated_at: new Date().toISOString()
    }, { onConflict: 'user_email,entity_id' }).then(function () {});
  };

  EB.initDetail = function () {
    var detail = document.getElementById('detail');
    var detailInner = document.getElementById('detailInner');
    var detailHistory = [];
    var currentDetailId = null;
    var currentItem = null;   // kept so Edit can reference it

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

    // ---- Edit button (DM only) ----
    function dmEditButton(item) {
      if (!EB.actualBucket || EB.actualBucket() !== 'dm') return '';
      if (item.kind === 'session') return '';
      return '<button class="detail-edit-btn" title="Edit">✎ Edit</button>';
    }

    function openEntityDetail(item, fromNav) {
      if (!fromNav) {
        if (currentDetailId && currentDetailId !== item.id) detailHistory.push(currentDetailId);
      }
      currentDetailId = item.id;
      currentItem = item;
      var kind = item.kind;

      var portraitHTML;
      if (kind === 'faction') {
        portraitHTML = item.sigil
          ? '<img src="' + EB.escapeAttr(item.sigil) + '" alt="' + EB.escapeAttr(item.name) + '" onerror="this.parentElement.innerHTML=\'' + EB.escapeAttr(MISSING) + '\'" style="object-fit:contain;padding:16px;">'
          : MISSING;
      } else {
        portraitHTML = EB.portraitHTML(item, MISSING);
      }

      var faction = item.factionId ? (window.FACTIONS || []).find(function (f) { return f.id === item.factionId; }) : null;
      var subtitle = item.sub || item.subtitle || '';

      var bodyHTML = '';
      if (kind === 'faction') {
        bodyHTML = renderFactionBody(item);
      } else if (item.body) {
        bodyHTML = '<div class="field"><div class="field-label">About</div><div class="field-body">' + item.body + '</div></div>';
      }

      // Status badge (DM only)
      var statusHTML = '';
      if (EB.actualBucket && EB.actualBucket() === 'dm') {
        var statusLabel = { visible: '● Visible', dm_only: '● DM Only', hidden: '● Hidden' }[item.status] || item.status;
        var statusClass = 'detail-status detail-status--' + (item.status || 'dm_only');
        statusHTML = '<div class="' + statusClass + '">' + statusLabel + '</div>';
      }

      detailInner.innerHTML =
        '<button class="detail-back" title="Back">←</button>' +
        '<button class="detail-close" title="Close">✕</button>' +
        dmEditButton(item) +
        '<div class="portrait">' + portraitHTML + '</div>' +
        '<h2>' + EB.escapeHtml(item.name) + '</h2>' +
        statusHTML +
        (subtitle ? '<div class="subtitle">' + EB.escapeHtml(subtitle) + '</div>' : '') +
        (item.role ? '<div class="field"><div class="field-label">Role</div>' + EB.escapeHtml(item.role) + '</div>' : '') +
        (faction ? '<div class="field"><div class="field-label">Affiliation</div>' + EB.escapeHtml(faction.name) + '</div>' : '') +
        bodyHTML +
        wireNotesBlock();
      mountNotes(item.id);

      // Wire edit button
      var editBtn = detailInner.querySelector('.detail-edit-btn');
      if (editBtn) editBtn.addEventListener('click', function () { openEditForm(item); });

      detail.classList.add('open');
    }

    // ================================================================
    // EDIT FORM
    // ================================================================

    function openEditForm(item) {
      var isFaction = item.kind === 'faction';

      var factsHTML = '';
      var factsList = Array.isArray(item.facts) ? item.facts : [];
      factsList.forEach(function (f, i) { factsHTML += editFactRow(f, i); });

      var membersHTML = '';
      var membersList = Array.isArray(item.members) ? item.members : [];
      membersList.forEach(function (m, i) { membersHTML += editMemberRow(m.name, m.role, i); });

      detailInner.innerHTML =
        '<button class="detail-back" title="Back">←</button>' +
        '<button class="detail-close" title="Close">✕</button>' +
        '<div class="edit-form">' +

          '<div class="edit-field">' +
            '<label class="edit-label">Name</label>' +
            '<input class="edit-input" id="ef-name" type="text" value="' + EB.escapeAttr(item.name || '') + '">' +
          '</div>' +

          '<div class="edit-field">' +
            '<label class="edit-label">Subtitle / Role line</label>' +
            '<input class="edit-input" id="ef-sub" type="text" value="' + EB.escapeAttr(item.sub || item.subtitle || '') + '">' +
          '</div>' +

          '<div class="edit-field">' +
            '<label class="edit-label">' + (isFaction ? 'Description' : 'Body') + '</label>' +
            '<textarea class="edit-textarea" id="ef-body" rows="6">' + EB.escapeHtml(item.body || item.description || '') + '</textarea>' +
          '</div>' +

          '<div class="edit-field">' +
            '<label class="edit-label">Visibility</label>' +
            '<select class="edit-select" id="ef-status">' +
              '<option value="dm_only"'  + (item.status === 'dm_only'  ? ' selected' : '') + '>DM Only — hidden from players</option>' +
              '<option value="visible"'  + (item.status === 'visible'  ? ' selected' : '') + '>Visible — players can see this</option>' +
              '<option value="hidden"'   + (item.status === 'hidden'   ? ' selected' : '') + '>Hidden — archived, nobody sees it</option>' +
            '</select>' +
          '</div>' +

          '<div class="edit-field" id="ef-facts-wrap">' +
            '<label class="edit-label">Facts <button class="edit-add-btn" id="ef-facts-add" type="button">+ Add</button></label>' +
            '<div class="edit-list" id="ef-facts-list">' + factsHTML + '</div>' +
          '</div>' +

          '<div class="edit-field" id="ef-members-wrap">' +
            '<label class="edit-label">Members <button class="edit-add-btn" id="ef-members-add" type="button">+ Add</button></label>' +
            '<div class="edit-list" id="ef-members-list">' + membersHTML + '</div>' +
          '</div>' +

          '<div class="edit-actions">' +
            '<button class="edit-save-btn" id="ef-save">Save</button>' +
            '<button class="edit-cancel-btn" id="ef-cancel">Cancel</button>' +
            '<span class="edit-saving" id="ef-saving" style="display:none">Saving…</span>' +
            '<span class="edit-error" id="ef-error"></span>' +
          '</div>' +

        '</div>';

      detailInner.querySelector('#ef-facts-add').addEventListener('click', function () {
        var list = detailInner.querySelector('#ef-facts-list');
        var idx = list.querySelectorAll('.edit-fact-row').length;
        list.insertAdjacentHTML('beforeend', editFactRow('', idx));
        wireRemoveButtons();
      });
      detailInner.querySelector('#ef-members-add').addEventListener('click', function () {
        var list = detailInner.querySelector('#ef-members-list');
        var idx = list.querySelectorAll('.edit-member-row').length;
        list.insertAdjacentHTML('beforeend', editMemberRow('', '', idx));
        wireRemoveButtons();
      });

      wireRemoveButtons();

      detailInner.querySelector('#ef-cancel').addEventListener('click', function () {
        openEntityDetail(item, true);
      });
      detailInner.querySelector('#ef-save').addEventListener('click', function () {
        saveEntity(item);
      });

      detail.classList.add('open');
    }

    function editFactRow(value, idx) {
      return '<div class="edit-fact-row" data-idx="' + idx + '">' +
        '<input class="edit-input edit-fact-input" type="text" value="' + EB.escapeAttr(value) + '" placeholder="Fact…">' +
        '<button class="edit-remove-btn" type="button" title="Remove">✕</button>' +
      '</div>';
    }

    function editMemberRow(name, role, idx) {
      return '<div class="edit-member-row" data-idx="' + idx + '">' +
        '<input class="edit-input edit-member-name" type="text" value="' + EB.escapeAttr(name) + '" placeholder="Name…">' +
        '<input class="edit-input edit-member-role" type="text" value="' + EB.escapeAttr(role || '') + '" placeholder="Role…">' +
        '<button class="edit-remove-btn" type="button" title="Remove">✕</button>' +
      '</div>';
    }

    function wireRemoveButtons() {
      var btns = detailInner.querySelectorAll('.edit-remove-btn');
      Array.prototype.forEach.call(btns, function (btn) {
        btn.onclick = function () { btn.closest('[class*="-row"]').remove(); };
      });
    }

    function readFormValues() {
      var facts = [];
      Array.prototype.forEach.call(
        detailInner.querySelectorAll('.edit-fact-input'),
        function (inp) { var v = inp.value.trim(); if (v) facts.push(v); }
      );
      var members = [];
      Array.prototype.forEach.call(
        detailInner.querySelectorAll('.edit-member-row'),
        function (row) {
          var name = row.querySelector('.edit-member-name').value.trim();
          var role = row.querySelector('.edit-member-role').value.trim();
          if (name) members.push({ name: name, role: role });
        }
      );
      return {
        name:    detailInner.querySelector('#ef-name').value.trim(),
        sub:     detailInner.querySelector('#ef-sub').value.trim(),
        body:    detailInner.querySelector('#ef-body').value.trim(),
        status:  detailInner.querySelector('#ef-status').value,
        facts:   facts,
        members: members,
      };
    }

    async function saveEntity(item) {
      var savingEl = detailInner.querySelector('#ef-saving');
      var errorEl  = detailInner.querySelector('#ef-error');
      var saveBtn  = detailInner.querySelector('#ef-save');
      savingEl.style.display = '';
      saveBtn.disabled = true;
      errorEl.textContent = '';

      var vals = readFormValues();

      try {
        var { error: entErr } = await EB.sb
          .from('entities')
          .update({ name: vals.name, sub: vals.sub || null, body: vals.body || null, status: vals.status })
          .eq('id', item.id);
        if (entErr) throw entErr;

        await EB.sb.from('entity_facts').delete().eq('entity_id', item.id);
        if (vals.facts.length) {
          var { error: factsErr } = await EB.sb.from('entity_facts').insert(
            vals.facts.map(function (f, i) { return { entity_id: item.id, fact: f, sort_order: i }; })
          );
          if (factsErr) throw factsErr;
        }

        await EB.sb.from('entity_members').delete().eq('entity_id', item.id);
        if (vals.members.length) {
          var { error: membersErr } = await EB.sb.from('entity_members').insert(
            vals.members.map(function (m, i) { return { entity_id: item.id, name: m.name, role: m.role || null, sort_order: i }; })
          );
          if (membersErr) throw membersErr;
        }

        var lists = [window.FACTIONS, window.NPCS, window.PLAYERS, window.LORE];
        lists.forEach(function (arr) {
          if (!Array.isArray(arr)) return;
          var idx = arr.findIndex(function (e) { return e.id === item.id; });
          if (idx < 0) return;
          arr[idx].name        = vals.name;
          arr[idx].sub         = vals.sub   || undefined;
          arr[idx].body        = vals.body  || undefined;
          arr[idx].description = vals.body  || undefined;
          arr[idx].status      = vals.status;
          arr[idx].facts       = vals.facts.length   ? vals.facts   : undefined;
          arr[idx].members     = vals.members.length ? vals.members : undefined;
          item = arr[idx];
        });

        if (EB.byId && EB.byId[item.id]) Object.assign(EB.byId[item.id], item);
        if (EB.renderMap) EB.renderMap();
        openEntityDetail(item, true);

      } catch (err) {
        savingEl.style.display = 'none';
        saveBtn.disabled = false;
        errorEl.textContent = 'Save failed: ' + ((err && err.message) || String(err));
      }
    }

    function openSessionDetail(s, fromNav) {
      if (!fromNav) {
        if (currentDetailId && currentDetailId !== s.id) detailHistory.push(currentDetailId);
      }
      currentDetailId = s.id;
      currentItem = s;
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

      // Load from Supabase asynchronously; show blank while fetching
      EB.getEntityNotes(entityId).then(function (html) {
        // Check the panel is still showing this entity
        if (currentDetailId !== entityId) return;
        notesEl.innerHTML = html;
        EB.wireTagClicks(notesEl);
      });

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
