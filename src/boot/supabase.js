// Supabase client — single instance shared across the app.
// Exposed as $supabase on the Vue app and importable via composables/useSupabase.

import { createClient } from '@supabase/supabase-js';
import { boot } from 'quasar/wrappers';

const url = import.meta.env.VITE_SUPABASE_URL;
const key = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!url || !key) {
  console.warn('[Eberoth] Supabase env vars missing — copy .env.example to .env');
}

export const supabase = createClient(url, key, {
  auth: { persistSession: true, autoRefreshToken: true }
});

export default boot(({ app }) => {
  app.config.globalProperties.$supabase = supabase;
});
