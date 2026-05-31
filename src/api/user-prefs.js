// Per-user UI prefs. World-read on your own row, JWT-locked writes.
// One row per JWT email, keyed on `viewer`.
import { supabase } from 'boot/supabase';

function viewerEmail() {
  // We don't import the auth store here to avoid a circular dep with
  // the user-prefs store. The caller passes the email at call time.
  return null;
}

export async function fetchMine(email) {
  if (!email) return null;
  const { data, error } = await supabase
    .from('user_prefs')
    .select('viewer, prefs, updated_at')
    .eq('viewer', email)
    .maybeSingle();
  if (error) throw error;
  return data;
}

export async function upsertMine(email, prefs) {
  if (!email) return;
  const { error } = await supabase
    .from('user_prefs')
    .upsert({
      viewer: email,
      prefs,
      updated_at: new Date().toISOString()
    }, { onConflict: 'viewer' });
  if (error) throw error;
}
