// Drawer notepad — tabs (click to switch, dblclick to rename, + to add)
// plus a contenteditable body with @-mention support.
// Persisted to Supabase user_notepad table (one row per user).
(function () {
  EB.initNotes = function () {
    var notesTabs = document.getElementById('notesTabs');
    var noteBody = document.getElementById('noteBody');
    var dropdown = document.getElementById('mentionDropdown');

    var DEFAULT_STATE = { activeId: 1, tabs: [{ id: 1, label: 'Session', html: '' }] };
    var notesState = JSON.parse(JSON.stringify(DEFAULT_STATE));
    var saveTimer = null;

    function getEmail() { return EB._userEmail || null; }

    function save() {
      var email = getEmail();
      if (!email) return;
      clearTimeout(saveTimer);
      saveTimer = setTimeout(function () {
        EB.sb.from('user_notepad').upsert({
          user_email: email,
          notepad:    notesState,
          updated_at: new Date().toISOString()
        }, { onConflict: 'user_email' }).then(function () {});
      }, 500);
    }

    function renderTabs() {
      notesTabs.innerHTML = '';
      notesState.tabs.forEach(function (tab) {
        var el = document.createElement('button');
        el.className = 'note-tab' + (tab.id === notesState.activeId ? ' active' : '');
        el.innerHTML =
          '<span class="label">' + EB.escapeHtml(tab.label) + '</span>' +
          '<span class="close" title="Close tab">✕</span>';
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
        el.querySelector('.close').onclick = function (e) {
          e.stopPropagation();
          if (notesState.tabs.length === 1) return;
          var idx = notesState.tabs.findIndex(function (t) { return t.id === tab.id; });
          notesState.tabs.splice(idx, 1);
          if (notesState.activeId === tab.id) {
            notesState.activeId = notesState.tabs[Math.max(0, idx - 1)].id;
          }
          save(); renderTabs(); loadActiveBody();
        };
        notesTabs.appendChild(el);
      });
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

    function loadActiveBody() {
      var active = notesState.tabs.find(function (t) { return t.id === notesState.activeId; });
      noteBody.innerHTML = active ? (active.html || '') : '';
      EB.wireTagClicks(noteBody);
    }
    function persistBody() {
      var active = notesState.tabs.find(function (t) { return t.id === notesState.activeId; });
      if (active) { active.html = noteBody.innerHTML; save(); }
    }

    // Load from Supabase on init, then render
    (function load() {
      var email = getEmail();
      if (!email) { renderTabs(); loadActiveBody(); return; }
      EB.sb.from('user_notepad')
        .select('notepad')
        .eq('user_email', email)
        .maybeSingle()
        .then(function (res) {
          if (res.data && res.data.notepad && Array.isArray(res.data.notepad.tabs)) {
            notesState = res.data.notepad;
          }
          renderTabs();
          loadActiveBody();
        })
        .catch(function () { renderTabs(); loadActiveBody(); });
    })();

    EB.attachMentions(noteBody, dropdown, persistBody);
  };
})();
