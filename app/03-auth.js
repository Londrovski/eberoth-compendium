// Auth — Supabase session backed. Adds view-as support: DM can
// preview the map as another bucket without changing the auth session.
//   EB.actualBucket()  → the bucket of the signed-in user (DM only
//                        ever has a non-DM view-as set).
//   EB.currentBucket() → view-as bucket if set, else actual.
//   EB._userEmail      → full email (e.g. dm@compendium.local) used
//                        as the key in user_notes, user_threads, user_notepad.
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

  EB._bucket    = null;
  EB._userId    = null;
  EB._userEmail = null;
  EB._viewAsBucket = null;

  EB.actualBucket  = function () { return EB._bucket; };
  EB.currentBucket = function () { return EB._viewAsBucket || EB._bucket; };
  EB.currentUserId = function () { return EB._userId; };

  EB._setBucket = function (b, uid, email) {
    EB._bucket    = b     || null;
    EB._userId    = uid   || null;
    EB._userEmail = email || null;
  };

  EB.setViewAs = function (bucket) {
    if (EB._bucket !== 'dm') return;     // only DM can switch view
    EB._viewAsBucket = bucket || null;
  };

  EB.signIn = function (bucket, passcode) {
    if (bucket === 'guest') {
      EB._setBucket('guest', null, null);
      return Promise.resolve({ data: null, error: null });
    }
    var email = bucket + '@compendium.local';
    return EB.sb.auth.signInWithPassword({ email: email, password: passcode })
      .then(function (res) {
        if (!res.error && res.data && res.data.user) {
          EB._setBucket(bucket, res.data.user.id, res.data.user.email || email);
        }
        return res;
      });
  };

  EB.signOut = function () {
    var wasGuest = EB._bucket === 'guest';
    EB._setBucket(null, null, null);
    EB._viewAsBucket = null;
    if (wasGuest) return Promise.resolve();
    return EB.sb.auth.signOut();
  };

  EB.checkSession = function () {
    return EB.sb.auth.getSession().then(function (res) {
      var session = res && res.data && res.data.session;
      if (!session || !session.user) { EB._setBucket(null, null, null); return null; }
      var email  = session.user.email || '';
      var bucket = email.split('@')[0];
      EB._setBucket(bucket, session.user.id, email);
      return bucket;
    });
  };
})();
