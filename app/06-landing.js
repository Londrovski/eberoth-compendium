// Landing page + topbar wiring. DOM refs grabbed at initLanding()
// time, which boot calls once on startup.
(function () {
  // Move mode is OFF by default. Ephemeral: every reload starts safe.
  // Phase 3 could choose to persist this per-bucket if useful.
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
      EB.setBucket(bucket);
      EB.boot();
    }

    landingSubmit.addEventListener('click', tryLogin);
    landingInput.addEventListener('keydown', function (e) { if (e.key === 'Enter') tryLogin(); });
    landingGuest.addEventListener('click', function () { EB.setBucket('guest'); EB.boot(); });
    logoutBtn.addEventListener('click', function () { EB.setBucket(null); location.reload(); });

    // Topbar nav. Each is a one-shot action; no persistent active state.
    if (navHome)     navHome.addEventListener('click', function () { if (EB.centerInitial) EB.centerInitial(); });
    if (navSessions) navSessions.addEventListener('click', function () { if (EB.openSessionsList) EB.openSessionsList(); });
    if (navParty)    navParty.addEventListener('click', function () { if (EB.zoomToParty) EB.zoomToParty(); });

    // Move-mode toggle — ephemeral, resets on reload. Anchors shown the
    // whole time move mode is on, hidden again when turned off.
    if (navMoveMode) {
      navMoveMode.addEventListener('click', function () {
        EB.moveMode = !EB.moveMode;
        navMoveMode.classList.toggle('on', EB.moveMode);
        if (EB.moveMode) { if (EB.showAnchors) EB.showAnchors(); }
        else             { if (EB.hideAnchors) EB.hideAnchors(); }
      });
    }
  };
})();
