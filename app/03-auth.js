// Phase 1 cosmetic auth. Phase 3 swaps the validation for Supabase
// signInWithPassword but keeps the BUCKET → CHARACTER map and per-bucket
// localStorage namespacing identical.
(function () {
  EB.PASSCODES = {
    'MAREN':   'baker',
    'SAMAEL':  'butcher',
    'TEACHER': 'charlie',
    'THOREBE': 'dm'
  };
  EB.BUCKET_TO_CHARACTER = {
    'baker':   'kalvorn',
    'butcher': 'azrael',
    'charlie': 'dirk'
    // 'dm' and 'guest' have no character
  };

  EB.normalisePasscode = function (s) {
    return String(s).replace(/[^a-zA-Z]/g, '').toUpperCase();
  };
  EB.currentBucket = function () {
    return localStorage.getItem('compendium-bucket') || null;
  };
  EB.setBucket = function (b) {
    if (b) localStorage.setItem('compendium-bucket', b);
    else localStorage.removeItem('compendium-bucket');
  };
})();
