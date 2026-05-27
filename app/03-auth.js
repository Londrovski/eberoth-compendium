// Auth — Supabase session backed. Adds view-as support: DM can preview
// the map as another bucket without changing the auth session.
//
//   EB.actualBucket()    → the bucket of the signed-in user.
//   EB.currentBucket()   → view-as bucket if set, else actual.
//   EB.viewingAs()       → true when DM is impersonating another bucket.
//   EB._userEmail        → full email of the signed-in user (JWT email).
//   EB.effectiveEmail()  → email of the *viewed* user. Equal to
//                          _userEmail when not in View-As; otherwise
//                          '<bucket>@compendium.local'. This is the key
//                          drawer / threads / notes modules should use
//                          for SELECT — RLS lets DM read any user_* row,
//                          but writes are still locked to the JWT owner.
//                          The frontend goes read-only in View-As to
//                          avoid attempted writes that would fail RLS.
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

  EB.viewingAs = function () {
    return EB._bucket === 'dm' && !!EB._viewAsBucket && EB._viewAsBucket !== 'dm';
  };

  // Email of the viewed user. Used as the lookup key in drawer / threads /
  // notes. Writes still go through the JWT (so cannot land in another
  // player's bucket) — frontend goes read-only in View-As to prevent the
  // attempt.
  EB.effectiveEmail = function () {
    if (EB.viewingAs()) {
      if (EB._viewAsBucket === 'guest') return null;
      return EB._viewAsBucket + '@compendium.local';
    }
    return EB._userEmail || null;
  };

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
