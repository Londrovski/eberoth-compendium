// Reusable mention controller. Attached to any contenteditable element
// (drawer notepad, per-entity notes) with the same code path.
//
// On '@', shows a dropdown of mentionable entities. Pick = insert as
// a contenteditable=false <span class="tag"> with the entity id stored
// in data-id. Click handlers wired via EB.wireTagClicks elsewhere.
(function () {
  EB.allMentionables = function () {
    return [].concat(
      (window.PLAYERS  || []).map(function (p) { return Object.assign({}, p, { group: 'Party' }); }),
      (window.FACTIONS || []).map(function (f) { return Object.assign({}, f, { group: 'Factions' }); }),
      (window.NPCS     || []).map(function (n) { return Object.assign({}, n, { group: 'NPCs' }); }),
      (window.LORE     || []).map(function (l) { return Object.assign({}, l, { group: 'Lore' }); }),
      (window.SESSIONS || []).map(function (s) { return Object.assign({}, s, { group: 'Sessions' }); }),
      (EB.BACKSTORY    || []).map(function (b) { return Object.assign({}, b, { group: 'Personal' }); })
    );
  };

  EB.attachMentions = function (bodyEl, dropdownEl, onPersist) {
    var visible = false, matches = [], selected = 0;
    var startNode = null, startOffset = 0;

    function hide() {
      dropdownEl.style.display = 'none';
      visible = false; matches = [];
    }
    function trigger() {
      var sel = window.getSelection();
      if (!sel.rangeCount) return hide();
      var range = sel.getRangeAt(0);
      if (range.startContainer.nodeType !== Node.TEXT_NODE) return hide();
      if (!bodyEl.contains(range.startContainer)) return hide();
      var text = range.startContainer.textContent;
      var offset = range.startOffset;
      var before = text.slice(0, offset);
      var m = before.match(/(?:^|\s)@([\w\s-]{0,30})$/);
      if (!m) return hide();
      var query = m[1].toLowerCase().trim();
      startNode = range.startContainer;
      startOffset = offset - m[1].length - 1;
      show(query);
    }
    function show(query) {
      var all = EB.allMentionables();
      var filtered = query ? all.filter(function (e) { return e.name.toLowerCase().indexOf(query) !== -1; }) : all;
      matches = filtered.slice(0, 8);
      if (matches.length === 0) return hide();
      selected = 0;
      renderList();
      position();
      dropdownEl.style.display = 'block';
      visible = true;
    }
    function renderList() {
      dropdownEl.innerHTML = matches.map(function (e, i) {
        return '<div class="mention-item ' + (i === selected ? 'selected' : '') + '" data-i="' + i + '">' +
               '<span class="m-name">' + EB.escapeHtml(e.name) + '</span>' +
               '<span class="m-sub">' + EB.escapeHtml(e.group) + (e.role ? ' — ' + EB.escapeHtml(e.role) : '') + '</span>' +
               '</div>';
      }).join('');
      Array.prototype.forEach.call(dropdownEl.querySelectorAll('.mention-item'), function (item) {
        item.onmousedown = function (ev) {
          ev.preventDefault();
          selected = parseInt(item.dataset.i);
          choose();
        };
      });
    }
    function move(d) {
      selected = (selected + d + matches.length) % matches.length;
      renderList();
    }
    function choose() {
      var entity = matches[selected];
      if (!entity) return hide();
      insertTag(entity);
      hide();
    }
    function insertTag(entity) {
      if (!startNode) return;
      var sel = window.getSelection();
      if (!sel.rangeCount) return;
      var range = sel.getRangeAt(0);
      var r = document.createRange();
      r.setStart(startNode, startOffset);
      r.setEnd(range.startContainer, range.startOffset);
      r.deleteContents();

      var tag = document.createElement('span');
      tag.className = 'tag';
      tag.contentEditable = 'false';
      tag.dataset.id = entity.id;
      tag.textContent = entity.name;
      tag.onmousedown = function (ev) {
        ev.preventDefault();
        ev.stopPropagation();
        if (EB.openDetail) EB.openDetail(entity);
      };
      tag.onclick = function (ev) { ev.preventDefault(); ev.stopPropagation(); };
      r.insertNode(tag);

      var space = document.createTextNode(' ');
      tag.parentNode.insertBefore(space, tag.nextSibling);
      var after = document.createRange();
      after.setStart(space, 1);
      after.collapse(true);
      sel.removeAllRanges();
      sel.addRange(after);
      if (onPersist) onPersist();
    }
    function position() {
      var sel = window.getSelection();
      if (!sel.rangeCount) return;
      var range = sel.getRangeAt(0).cloneRange();
      range.collapse(true);
      var rect = range.getClientRects()[0] || range.getBoundingClientRect();
      var parentRect = dropdownEl.parentElement.getBoundingClientRect();
      dropdownEl.style.left = (rect.left - parentRect.left) + 'px';
      dropdownEl.style.top  = (rect.bottom - parentRect.top + 4) + 'px';
    }

    bodyEl.addEventListener('input', function () {
      if (onPersist) onPersist();
      trigger();
    });
    bodyEl.addEventListener('click', function (e) {
      if (!e.target.classList.contains('tag')) hide();
    });
    bodyEl.addEventListener('keydown', function (e) {
      if (!visible) return;
      if (e.key === 'ArrowDown')                     { e.preventDefault(); move(1); }
      else if (e.key === 'ArrowUp')                  { e.preventDefault(); move(-1); }
      else if (e.key === 'Enter' || e.key === 'Tab') { e.preventDefault(); choose(); }
      else if (e.key === 'Escape')                   { hide(); }
    });
    bodyEl.addEventListener('blur', function () { setTimeout(hide, 150); });

    return { hide: hide };
  };

  // Wire tag clicks within an arbitrary container. Used by both notes
  // and entity-notes after their HTML is loaded from storage.
  EB.wireTagClicks = function (container) {
    Array.prototype.forEach.call(container.querySelectorAll('.tag'), function (t) {
      t.onmousedown = function (e) {
        e.preventDefault();
        e.stopPropagation();
        var entity = EB.byId[t.dataset.id];
        if (entity && EB.openDetail) EB.openDetail(entity);
      };
      t.onclick = function (e) { e.preventDefault(); e.stopPropagation(); };
    });
  };
})();
