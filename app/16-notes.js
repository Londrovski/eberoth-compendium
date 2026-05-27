// Drawer notepad — tabs (click to switch, dblclick to rename, + to add)
// plus a contenteditable body with @-mention support.
// Persisted to Supabase user_notepad (one row per user).
//
// View-As: reads from EB.effectiveEmail() so DM sees the viewed
// player's notepad. Writes are disabled — body is non-editable,
// rename/add/close are no-ops, save() short-circuits.
(function () {
  EB.initNotes = function () {
    var notesTabs = document.getElementById('notesTabs');
    var noteBody = document.getElementById('noteBody');
    var dropdown = document.getElementById('mentionDropdown');

    var DEFAULT_STATE = { activeId: 1, tabs: [{ id: 1, label: 'Session', html: '' }] };
    var notesState = JSON.parse(JSON.stringify(DEFAULT_STATE));
    var saveTimer = null;

    function readEmail()  { return EB.effectiveEmail ? EB.effectiveEmail() : (EB._userEmail || null); }
    function writeEmail() { return EB._userEmail || null; }
    function readOnly()   { return EB.viewingAs ? EB.viewingAs() : false; }

    function save() {
      if (readOnly()) return;            // never write while impersonating
      var email = writeEmail();
      if (!email) return;
      clearTimeout(saveTimer);
      saveTimer = setTimeout(function () {
        EB.sb
          .from('user_notepad')
          .upsert({ user_email: email, notepad: notesState }, { onConflict: 'user_email' })
          .then(function (res) {
            if (res.error) console.error('[Eberoth] notepad save failed:', res.error);
          });
      }, 500);
    }

    function renderTabs() {
      notesTabs.innerHTML = '';
      var ro = readOnly();
      notesState.tabs.forEach(function (tab) {
        var el = document.createElement('button');
        el.className = 'note-tab' + (tab.id === notesState.activeId ? ' active' : '');
        el.innerHTML =
          '<span class="label">' + EB.escapeHtml(tab.label) + '</span>' +
          (ro ? '' : '<span class="close" title="Close tab">✕</span>');
        var labelEl = el.querySelector('.label');

        var clickTimer = null;
        el.addEventListener('click', function (e) {
          if (e.target.classList.contains('close')) return;
          if (labelEl.isContentEditable) return;
          if (clickTimer) return;
          clickTimer = setTimeout(function () {
            clickTimer = null;
            if (labelEl.isContentEditable) return;
            notesState.activeId = tab.id;
            save(); renderTabs(); loadActiveBody();
          }, 220);
        });

        if (!ro) {
          labelEl.addEventListener('dblclick', function (e) {
            e.preventDefault(); e.stopPropagation();
            if (clickTimer) { clearTimeout(clickTimer); clickTimer = null; }
            labelEl.contentEditable = 'true';
            labelEl.classList.add('editing');
            labelEl.focus();
            var range = document.createRange();
            range.selectNodeContents(labelEl);
            var sel = window.getSelection();
            sel.removeAllRanges(); sel.addRange(range);
          });
          labelEl.addEventListener('blur', function () {
            labelEl.contentEditable = 'false';
            labelEl.classList.remove('editing');
            tab.label = labelEl.innerText.trim() || 'Untitled';
            save(); renderTabs();
          });
          labelEl.addEventListener('keydown', function (e) {
            if (e.key === 'Enter')  { e.preventDefault(); labelEl.blur(); }
            if (e.key === 'Escape') { labelEl.innerText = tab.label; labelEl.blur(); }
          });
          var closeEl = el.querySelector('.close');
          if (closeEl) closeEl.onclick = function (e) {
            e.stopPropagation();
            if (notesState.tabs.length === 1) return;
            var idx = notesState.tabs.findIndex(function (t) { return t.id === tab.id; });
            notesState.tabs.splice(idx, 1);
            if (notesState.activeId === tab.id) {
              notesState.activeId = notesState.tabs[Math.max(0, idx - 1)].id;
            }
            save(); renderTabs(); loadActiveBody();
          };
        }
        notesTabs.appendChild(el);
      });
      if (!ro) {
        var addBtn = document.createElement('button');
        addBtn.className = 'add-tab';
        addBtn.textContent = '+';
        addBtn.title = 'New tab';
        addBtn.onclick = function () {
          var newId = Date.now();
          notesState.tabs.push({ id: newId, label: 'New', html: '' });
          notesState.activeId = newId;
          save(); renderTabs(); loadActiveBody();
        };
        notesTabs.appendChild(addBtn);
      }
    }

    function loadActiveBody() {
      var active = notesState.tabs.find(function (t) { return t.id === notesState.activeId; });
      noteBody.innerHTML = active ? (active.html || '') : '';
      // In View-As, the notepad body becomes read-only.
      noteBody.contentEditable = readOnly() ? 'false' : 'true';
      EB.wireTagClicks(noteBody);
    }
    function persistBody() {
      if (readOnly()) return;
      var active = notesState.tabs.find(function (t) { return t.id === notesState.activeId; });
      if (active) { active.html = noteBody.innerHTML; save(); }
    }

    // Expose a reload hook so the View-As dropdown can re-pull a new
    // user's notepad without rebooting the whole module.
    EB.reloadNotes = function () {
      notesState = JSON.parse(JSON.stringify(DEFAULT_STATE));
      var email = readEmail();
      if (!email) {
        renderTabs();
        loadActiveBody();
        return Promise.resolve();
      }
      return EB.sb
        .from('user_notepad')
        .select('notepad')
        .eq('user_email', email)
        .maybeSingle()
        .then(function (res) {
          if (res.error) console.error('[Eberoth] notepad load failed:', res.error);
          if (res.data && res.data.notepad && Array.isArray(res.data.notepad.tabs)) {
            notesState = res.data.notepad;
          }
          renderTabs();
          loadActiveBody();
        })
        .catch(function (e) {
          console.error('[Eberoth] notepad load exception:', e);
          renderTabs();
          loadActiveBody();
        });
    };

    EB.reloadNotes();
    EB.attachMentions(noteBody, dropdown, persistBody);
  };
})();
