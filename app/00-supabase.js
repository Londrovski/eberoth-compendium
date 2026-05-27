// Supabase client init. Loads first so every later module can reach
// the client via EB.sb.
//
// Publishable key is safe to ship in the bundle — security comes from
// Row Level Security policies on every table, not key secrecy. The
// service_role key MUST NOT live here.
(function () {
  window.EB = window.EB || {};

  var SUPABASE_URL = 'https://gpnmmtqceyejkbeymlib.supabase.co';
  var SUPABASE_KEY = 'sb_publishable_GT_Eo6DOsFOsDngxIufDzw_DOQizajI';

  if (!window.supabase || typeof window.supabase.createClient !== 'function') {
    console.error('[Eberoth] @supabase/supabase-js failed to load before app modules. The site cannot start.');
    return;
  }
  EB.sb = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
})();
