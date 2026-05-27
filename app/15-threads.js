// Drawer threads list — ordered, drag-reorderable, inline-editable.
// Persisted to Supabase user_threads (one row per user).
//
// View-As: reads from EB.effectiveEmail() so the DM sees the viewed
// player's threads. Writes are disabled in View-As (the .viewing-as
// class on the drawer disables inputs via CSS, and save() short-circuits
// as a defence in depth so RLS-rejected writes never get sent).
(function () {
  EB.initThreads = function () {
    var threadsList = document.getElementById('threadsList');
    var addBtn = document.getElementById('addThread');
    var threads = [];
    var dragSrcIndex = null;
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
          .from('user_threads')
          .upsert({ user_email: email, threads: threads }, { onConflict: 'user_email' })
          .then(function (res) {
            if (res.error) console.error('[Eberoth] threads save failed:', res.error);
          });
      }, 500);
    }

    function render() {
      threadsList.innerHTML = '';
      if (threads.length === 0) {
        threadsList.innerHTML = '<div class="threads-empty">'
          + (readOnly() ? 'No active threads for this player.' : 'No active threads. Tap + to add one.')
          + '</div>';
        return;
      }
      threads.forEach(function (t, i) {
        var el = document.createElement('div');
        el.className = 'thread';
        el.dataset.index = i;
        var ro = readOnly();
        el.innerHTML =
          (ro ? '<span class="drag" title="Read-only in View-As">⠿</span>'
              : '<span class="drag" draggable="true" title="Drag to reorder">⠿</span>') +
          '<span class="text"' + (ro ? '' : ' contenteditable="true"') + '>' + EB.escapeHtml(t.text) + '</span>' +
          (ro ? '' : '<button class="del" title="Remove">✕</button>');
        var textEl = el.querySelector('.text');
        if (!ro) {
          textEl.addEventListener('blur', function () {
            threads[i].text = textEl.innerText.trim() || '(untitled)';
            save();
          });
          el.querySelector('.del').onclick = function () {
            threads.splice(i, 1); save(); render();
          };
          var handle = el.querySelector('.drag');
          handle.addEventListener('dragstart', function (e) {
            dragSrcIndex = i;
            el.classList.add('dragging');
            e.dataTransfer.effectAllowed = 'move';
            try { e.dataTransfer.setData('text/plain', String(i)); } catch (err) {}
          });
          handle.addEventListener('dragend', function () {
            el.classList.remove('dragging');
            Array.prototype.forEach.call(threadsList.children, function (c) {
              c.classList.remove('drop-above', 'drop-below');
            });
            dragSrcIndex = null;
          });
          el.addEventListener('dragover', function (e) {
            e.preventDefault();
            e.dataTransfer.dropEffect = 'move';
            var rect = el.getBoundingClientRect();
            var above = (e.clientY - rect.top) < rect.height / 2;
            Array.prototype.forEach.call(threadsList.children, function (c) {
              c.classList.remove('drop-above', 'drop-below');
            });
            el.classList.add(above ? 'drop-above' : 'drop-below');
          });
          el.addEventListener('dragleave', function () {
            el.classList.remove('drop-above', 'drop-below');
          });
          el.addEventListener('drop', function (e) {
            e.preventDefault();
            if (dragSrcIndex == null) return;
            var rect = el.getBoundingClientRect();
            var above = (e.clientY - rect.top) < rect.height / 2;
            var to = i + (above ? 0 : 1);
            var from = dragSrcIndex;
            if (from < to) to -= 1;
            if (from === to) return;
            var moved = threads.splice(from, 1)[0];
            threads.splice(to, 0, moved);
            save(); render();
          });
        }
        threadsList.appendChild(el);
      });
    }

    addBtn.onclick = function () {
      if (readOnly()) return;
      threads.push({ id: Date.now(), text: 'New thread' });
      save(); render();
    };

    // Expose a reload hook so the View-As dropdown can re-pull a new
    // user's threads without rebooting the whole module.
    EB.reloadThreads = function () {
      threads = [];
      var email = readEmail();
      if (!email) { render(); return Promise.resolve(); }
      return EB.sb
        .from('user_threads')
        .select('threads')
        .eq('user_email', email)
        .maybeSingle()
        .then(function (res) {
          if (res.error) console.error('[Eberoth] threads load failed:', res.error);
          if (res.data && Array.isArray(res.data.threads)) {
            threads = res.data.threads;
          }
          render();
        })
        .catch(function (e) {
          console.error('[Eberoth] threads load exception:', e);
          render();
        });
    };

    EB.reloadThreads();
  };
})();
