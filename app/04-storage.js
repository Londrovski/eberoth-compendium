// Per-bucket localStorage. Guests get no persistence (every reload is
// a fresh canvas) — mirrors what Supabase RLS will give us in Phase 3.
(function () {
  EB.ns = function (key) {
    var b = EB.currentBucket();
    if (!b || b === 'guest') return null;
    return 'compendium:' + b + ':' + key;
  };
  EB.lsLoad = function (key, fallback) {
    var k = EB.ns(key);
    if (!k) return fallback;
    try {
      var raw = localStorage.getItem(k);
      return raw == null ? fallback : JSON.parse(raw);
    } catch (e) { return fallback; }
  };
  EB.lsSave = function (key, value) {
    var k = EB.ns(key);
    if (!k) return;
    localStorage.setItem(k, JSON.stringify(value));
  };
})();
