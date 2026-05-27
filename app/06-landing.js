// Landing page + topbar wiring. DOM refs grabbed at initLanding()
// time, which boot calls once on startup.
(function () {
  // Move mode is ephemeral — every reload starts safe.
  EB.moveMode = false;

  EB.initLanding = function () {
    var landing       = document.getElementById('landing');
    var landingInput  = document.getElementById('landingInput');
    var landingSubmit = document.getElementById('landingSubmit');
    var landingGuest  = document.getElementById('landingGuest');
    var landingError  = document.getElementById('landingError');
    var appEl         = document.getElementById('app');
    var roleBadge     = document.getElementById('roleBadge');
    var logoutBtn     = document.getElementById('logout');
    var navHome       = document.getElementById('navHome');
    var navSessions   = document.getElementById('navSessions');
    var navParty      = document.getElementById('navParty');
    var navMoveMode   = document.getElementById('navMoveMode');
    var navPushToAll  = document.getElementById('navPushToAll');

    function updatePushButtonVisibility() {
      if (!navPushToAll) return;
      var isDM = EB.currentBucket() === 'dm';
      navPushToAll.style.display = (EB.moveMode && isDM) ? '' : 'none';
    }

    EB.showLanding = function () {
      landing.style.display = 'flex';
      appEl.style.display = 'none';
      setTimeout(function () { landingInput.focus(); }, 50);
    };
    EB.showApp = function () {
      landing.style.display = 'none';
      appEl.style.display = 'flex';
      var b = EB.currentBucket();
      var label;
      if (b === 'dm') label = 'DM';
      else if (b === 'guest' || !b) label = 'GUEST';
      else {
        var charId = EB.BUCKET_TO_CHARACTER[b];
        var char = (window.PLAYERS || []).find(function (p) { return p.id === charId; });
        label = char ? char.name : b.toUpperCase();
      }
      roleBadge.textContent = label;
      updatePushButtonVisibility();
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

    // Move toggle. When DM has it on, also reveal the Push button.
    if (navMoveMode) {
      navMoveMode.addEventListener('click', function () {
        EB.moveMode = !EB.moveMode;
        navMoveMode.classList.toggle('on', EB.moveMode);
        if (EB.moveMode) { if (EB.showAnchors) EB.showAnchors(); }
        else             { if (EB.hideAnchors) EB.hideAnchors(); }
        updatePushButtonVisibility();
      });
    }

    // Push to Players — DM only. Confirm, then publish + wipe player
    // overrides via EB.pushToAll().
    if (navPushToAll) {
      navPushToAll.addEventListener('click', function () {
        if (EB.currentBucket() !== 'dm') return;
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
  };
})();
