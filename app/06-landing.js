// Landing page + topbar wiring. DOM refs grabbed at initLanding()
// time, which boot calls once on startup.
//
// DM font size adjuster: A− / A+ buttons (DM-only) set a CSS custom
// property --card-name-size on <body>, which the card .name rule uses.
// Persisted to localStorage under 'eb-card-font-scale'.
// Steps: 9, 10, 11 (default), 12, 13, 14 px.
//
// View-As dropdown: DM can preview the site as another bucket. The
// change handler triggers EB.boot() (re-pulls entities / sessions /
// positions for the viewed bucket) AND calls the reload hooks on the
// drawer modules so threads + notes also swap to that user's content.
// Body gets a `viewing-as` class which CSS uses to grey out the drawer
// and signal the read-only state.
(function () {
  EB.moveMode = false;
  EB.blockMoveMode = false;

  var FONT_STEPS = [9, 10, 11, 12, 13, 14];
  var FONT_DEFAULT = 11;
  var FONT_LS_KEY = 'eb-card-font-size';

  function loadCardFontSize() {
    var stored = localStorage.getItem(FONT_LS_KEY);
    return stored ? parseInt(stored, 10) : FONT_DEFAULT;
  }
  function applyCardFontSize(px) {
    document.body.style.setProperty('--card-name-size', px + 'px');
    localStorage.setItem(FONT_LS_KEY, px);
  }

  EB.initLanding = function () {
    var landing       = document.getElementById('landing');
    var landingInput  = document.getElementById('landingInput');
    var landingSubmit = document.getElementById('landingSubmit');
    var landingGuest  = document.getElementById('landingGuest');
    var landingError  = document.getElementById('landingError');
    var appEl         = document.getElementById('app');
    var roleBadge     = document.getElementById('roleBadge');
    var roleTag       = document.querySelector('.role-tag');
    var logoutBtn     = document.getElementById('logout');
    var navHome       = document.getElementById('navHome');
    var navSessions   = document.getElementById('navSessions');
    var navParty      = document.getElementById('navParty');
    var navMoveMode   = document.getElementById('navMoveMode');
    var navBlockMode  = document.getElementById('navBlockMode');
    var navPushToAll  = document.getElementById('navPushToAll');
    var navSetHome    = document.getElementById('navSetHome');
    var navFontDown   = document.getElementById('navFontDown');
    var navFontUp     = document.getElementById('navFontUp');
    var viewAsSelect  = document.getElementById('viewAsSelect');

    // Apply persisted font size immediately on load.
    applyCardFontSize(loadCardFontSize());

    function updateModeButtonVisibility() {
      var realBucket = EB.actualBucket();
      var inViewAs = !!EB._viewAsBucket;
      if (navMoveMode)  navMoveMode.style.display  = inViewAs ? 'none' : '';
      if (navBlockMode) navBlockMode.style.display = (!inViewAs && realBucket === 'dm') ? '' : 'none';
      if (navPushToAll) {
        navPushToAll.style.display = (!inViewAs && realBucket === 'dm' && (EB.moveMode || EB.blockMoveMode)) ? '' : 'none';
      }
      if (navSetHome) {
        navSetHome.style.display = (!inViewAs && realBucket === 'dm') ? '' : 'none';
      }
      if (navFontDown) navFontDown.style.display = (!inViewAs && realBucket === 'dm') ? '' : 'none';
      if (navFontUp)   navFontUp.style.display   = (!inViewAs && realBucket === 'dm') ? '' : 'none';
      if (viewAsSelect) {
        viewAsSelect.style.display = (realBucket === 'dm') ? '' : 'none';
      }
    }

    EB.showLanding = function () {
      landing.style.display = 'flex';
      appEl.style.display = 'none';
      setTimeout(function () { landingInput.focus(); }, 50);
    };
    EB.showApp = function () {
      landing.style.display = 'none';
      appEl.style.display = 'flex';
      var bucket = EB.currentBucket();
      var inViewAs = !!EB._viewAsBucket;
      var label;
      if (inViewAs) {
        if (bucket === 'guest') label = 'AS GUEST';
        else {
          var charId = EB.BUCKET_TO_CHARACTER[bucket];
          var char = (window.PLAYERS || []).find(function (p) { return p.id === charId; });
          label = 'AS ' + (char ? char.name : (bucket || '').toUpperCase());
        }
      } else {
        if (bucket === 'dm') label = 'DM';
        else if (bucket === 'guest' || !bucket) label = 'GUEST';
        else {
          var charId2 = EB.BUCKET_TO_CHARACTER[bucket];
          var char2 = (window.PLAYERS || []).find(function (p) { return p.id === charId2; });
          label = char2 ? char2.name : bucket.toUpperCase();
        }
      }
      roleBadge.textContent = label;
      if (roleTag) roleTag.classList.toggle('viewing', inViewAs);
      // Body-level flag for the drawer's read-only styling.
      document.body.classList.toggle('viewing-as', EB.viewingAs ? EB.viewingAs() : false);
      updateModeButtonVisibility();
    };

    function tryLogin() {
      var code = EB.normalisePasscode(landingInput.value);
      var bucket = EB.PASSCODES[code];
      if (!bucket) {
        landingError.textContent = 'Not recognised.';
        landingInput.value = '';
        landingInput.classList.add('shake');
        setTimeout(function () { landingInput.classList.remove('shake'); }, 500);
        return;
      }
      landingError.textContent = '';
      landingSubmit.disabled = true;
      EB.signIn(bucket, code).then(function (res) {
        landingSubmit.disabled = false;
        if (res && res.error) {
          landingError.textContent = res.error.message || 'Sign-in failed.';
          landingInput.classList.add('shake');
          setTimeout(function () { landingInput.classList.remove('shake'); }, 500);
          return;
        }
        EB.boot();
      }).catch(function (err) {
        landingSubmit.disabled = false;
        landingError.textContent = (err && err.message) || 'Sign-in failed.';
      });
    }

    landingSubmit.addEventListener('click', tryLogin);
    landingInput.addEventListener('keydown', function (e) { if (e.key === 'Enter') tryLogin(); });
    landingGuest.addEventListener('click', function () {
      EB.signIn('guest').then(function () { EB.boot(); });
    });
    logoutBtn.addEventListener('click', function () {
      EB.signOut().then(function () { location.reload(); }, function () { location.reload(); });
    });

    if (navHome)     navHome.addEventListener('click', function () { if (EB.centerInitial) EB.centerInitial(); });
    if (navSessions) navSessions.addEventListener('click', function () { if (EB.openSessionsList) EB.openSessionsList(); });
    if (navParty)    navParty.addEventListener('click', function () { if (EB.zoomToParty) EB.zoomToParty(); });

    if (navMoveMode) {
      navMoveMode.addEventListener('click', function () {
        EB.moveMode = !EB.moveMode;
        if (EB.moveMode) EB.blockMoveMode = false;
        navMoveMode.classList.toggle('on', EB.moveMode);
        if (navBlockMode) navBlockMode.classList.toggle('on', EB.blockMoveMode);
        if (EB.moveMode || EB.blockMoveMode) { if (EB.showAnchors) EB.showAnchors(); }
        else                                  { if (EB.hideAnchors) EB.hideAnchors(); }
        updateModeButtonVisibility();
      });
    }

    if (navBlockMode) {
      navBlockMode.addEventListener('click', function () {
        if (EB.actualBucket() !== 'dm') return;
        EB.blockMoveMode = !EB.blockMoveMode;
        if (EB.blockMoveMode) EB.moveMode = false;
        navBlockMode.classList.toggle('on', EB.blockMoveMode);
        if (navMoveMode) navMoveMode.classList.toggle('on', EB.moveMode);
        if (EB.hideAnchors) EB.hideAnchors();
        updateModeButtonVisibility();
      });
    }

    if (navPushToAll) {
      navPushToAll.addEventListener('click', function () {
        if (EB.actualBucket() !== 'dm') return;
        var ok = confirm('This will overwrite ALL players\' personal positions with your current layout.\n\nContinue?');
        if (!ok) return;
        navPushToAll.disabled = true;
        var prevText = navPushToAll.textContent;
        navPushToAll.textContent = 'Pushing…';
        EB.pushToAll().then(function () {
          if (EB.renderMap) EB.renderMap();
          navPushToAll.disabled = false;
          navPushToAll.textContent = prevText;
        }, function (err) {
          console.error('[Eberoth] Push to Players failed', err);
          navPushToAll.disabled = false;
          navPushToAll.textContent = prevText;
          alert('Push failed. Check the browser console for details.');
        });
      });
    }

    if (navSetHome) {
      navSetHome.addEventListener('click', function () {
        if (EB.actualBucket() !== 'dm') return;
        var view = EB.captureHomeView ? EB.captureHomeView() : null;
        if (!view) { alert('Could not capture current view.'); return; }
        navSetHome.disabled = true;
        var prevText = navSetHome.textContent;
        navSetHome.textContent = 'Saving…';
        EB.saveHomeView(view.cx, view.cy, view.scale).then(function () {
          navSetHome.disabled = false;
          navSetHome.textContent = 'Set Home ✓';
          setTimeout(function () { navSetHome.textContent = prevText; }, 1500);
        }, function (err) {
          console.error('[Eberoth] Set Home failed', err);
          navSetHome.disabled = false;
          navSetHome.textContent = prevText;
          alert('Set Home failed. Check the browser console for details.');
        });
      });
    }

    if (navFontDown) {
      navFontDown.addEventListener('click', function () {
        if (EB.actualBucket() !== 'dm') return;
        var current = loadCardFontSize();
        var idx = FONT_STEPS.indexOf(current);
        if (idx < 0) idx = FONT_STEPS.indexOf(FONT_DEFAULT);
        var next = FONT_STEPS[Math.max(0, idx - 1)];
        applyCardFontSize(next);
      });
    }
    if (navFontUp) {
      navFontUp.addEventListener('click', function () {
        if (EB.actualBucket() !== 'dm') return;
        var current = loadCardFontSize();
        var idx = FONT_STEPS.indexOf(current);
        if (idx < 0) idx = FONT_STEPS.indexOf(FONT_DEFAULT);
        var next = FONT_STEPS[Math.min(FONT_STEPS.length - 1, idx + 1)];
        applyCardFontSize(next);
      });
    }

    if (viewAsSelect) {
      viewAsSelect.addEventListener('change', function () {
        EB.setViewAs(viewAsSelect.value || null);
        // Re-pull the viewed player's drawer content. boot() reloads
        // entities/sessions/positions for the viewed bucket; the
        // threads/notes modules don't auto-rerun on boot (initThreads is
        // guarded by modulesInited), so we trigger their reload hooks.
        if (EB.reloadThreads) EB.reloadThreads();
        if (EB.reloadNotes)   EB.reloadNotes();
        EB.boot();
      });
    }
  };
})();
