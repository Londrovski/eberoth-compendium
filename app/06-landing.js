// Landing page + topbar wiring. DOM refs grabbed at initLanding()
// time, which boot calls once on startup.
(function () {
  // Movement modes. Both ephemeral — every reload starts safe.
  EB.moveMode = false;
  EB.moveAllMode = false;

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
    var navMoveAll    = document.getElementById('navMoveAll');

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
      // DM-only visibility for Move All.
      if (navMoveAll) navMoveAll.style.display = (b === 'dm') ? '' : 'none';
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

    // Topbar nav.
    if (navHome)     navHome.addEventListener('click', function () { if (EB.centerInitial) EB.centerInitial(); });
    if (navSessions) navSessions.addEventListener('click', function () { if (EB.openSessionsList) EB.openSessionsList(); });
    if (navParty)    navParty.addEventListener('click', function () { if (EB.zoomToParty) EB.zoomToParty(); });

    // Move mode — mutually exclusive with Move All.
    if (navMoveMode) {
      navMoveMode.addEventListener('click', function () {
        if (EB.moveAllMode) {
          EB.moveAllMode = false;
          EB.viewingGlobals = false;
          if (navMoveAll) navMoveAll.classList.remove('on');
        }
        EB.moveMode = !EB.moveMode;
        navMoveMode.classList.toggle('on', EB.moveMode);
        if (EB.moveMode) { if (EB.showAnchors) EB.showAnchors(); }
        else             { if (EB.hideAnchors) EB.hideAnchors(); }
        if (EB.renderMap) EB.renderMap();
      });
    }

    // Move All — DM only. Drag writes to the global_positions table,
    // visible to all players. While on, the personal-overrides overlay
    // is hidden so DM sees what other players will see.
    if (navMoveAll) {
      navMoveAll.addEventListener('click', function () {
        if (EB.moveMode) {
          EB.moveMode = false;
          navMoveMode.classList.remove('on');
        }
        EB.moveAllMode = !EB.moveAllMode;
        EB.viewingGlobals = EB.moveAllMode;
        navMoveAll.classList.toggle('on', EB.moveAllMode);
        if (EB.moveAllMode) { if (EB.showAnchors) EB.showAnchors(); }
        else                { if (EB.hideAnchors) EB.hideAnchors(); }
        if (EB.renderMap) EB.renderMap();
      });
    }
  };
})();
