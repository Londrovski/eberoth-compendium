// Auth — backed by real Supabase sessions.
//
// The four buckets (dm / baker / butcher / charlie) map to four
// Supabase auth users (dm@compendium.local etc.) whose passwords are
// the campaign passcodes. Sign-in is straight signInWithPassword.
// Guest is special: no Supabase session, the front-end still runs but
// reads/writes are gated by RLS (so guest never reaches per-user data).
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
  };

  EB.normalisePasscode = function (s) {
    return String(s).replace(/[^a-zA-Z]/g, '').toUpperCase();
  };

  // Bucket is derived from the Supabase session's email (local-part).
  // Cached in EB._bucket so synchronous callers don't have to await.
  EB._bucket = null;
  EB._userId = null;
  EB.currentBucket = function () { return EB._bucket; };
  EB.currentUserId = function () { return EB._userId; };
  EB._setBucket = function (b, uid) { EB._bucket = b || null; EB._userId = uid || null; };

  // Sign in with a bucket name + passcode. Returns the Supabase response
  // promise so the caller can handle errors. Guest is a synchronous
  // bypass (no real session).
  EB.signIn = function (bucket, passcode) {
    if (bucket === 'guest') {
      EB._setBucket('guest', null);
      return Promise.resolve({ data: null, error: null });
    }
    var email = bucket + '@compendium.local';
    return EB.sb.auth.signInWithPassword({ email: email, password: passcode })
      .then(function (res) {
        if (!res.error && res.data && res.data.user) {
          EB._setBucket(bucket, res.data.user.id);
        }
        return res;
      });
  };

  EB.signOut = function () {
    var wasGuest = EB._bucket === 'guest';
    EB._setBucket(null, null);
    if (wasGuest) return Promise.resolve();
    return EB.sb.auth.signOut();
  };

  // Check for an existing persisted session. Sets the bucket cache if
  // found. Called once at boot.
  EB.checkSession = function () {
    return EB.sb.auth.getSession().then(function (res) {
      var session = res && res.data && res.data.session;
      if (!session || !session.user) { EB._setBucket(null, null); return null; }
      var email = session.user.email || '';
      var bucket = email.split('@')[0];
      EB._setBucket(bucket, session.user.id);
      return bucket;
    });
  };
})();
