// Landing page + topbar wiring. DOM refs grabbed at initLanding()
// time, which boot calls once on startup.
(function () {
  EB.moveMode = false;
  EB.blockMoveMode = false;

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
    var viewAsSelect  = document.getElementById('viewAsSelect');

    function updateModeButtonVisibility() {
      var realBucket = EB.actualBucket();
      var inViewAs = !!EB._viewAsBucket;
      // Move + Block + Push hidden while previewing as another bucket
      if (navMoveMode)  navMoveMode.style.display  = inViewAs ? 'none' : '';
      // Block Move is DM-only.
      if (navBlockMode) navBlockMode.style.display = (!inViewAs && realBucket === 'dm') ? '' : 'none';
      // Push button shows when DM is in EITHER move mode.
      if (navPushToAll) {
        navPushToAll.style.display = (!inViewAs && realBucket === 'dm' && (EB.moveMode || EB.blockMoveMode)) ? '' : 'none';
      }
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
        if (EB.moveMode) EB.blockMoveMode = false; // mutually exclusive
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
        if (EB.blockMoveMode) EB.moveMode = false; // mutually exclusive
        navBlockMode.classList.toggle('on', EB.blockMoveMode);
        if (navMoveMode) navMoveMode.classList.toggle('on', EB.moveMode);
        // Block mode doesn't use snap anchors — clusters move freely.
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

    if (viewAsSelect) {
      viewAsSelect.addEventListener('change', function () {
        EB.setViewAs(viewAsSelect.value || null);
        // Re-boot to apply: re-init layout, reload positions for the new
        // (or restored) effective bucket, re-render.
        EB.boot();
      });
    }
  };
})();
