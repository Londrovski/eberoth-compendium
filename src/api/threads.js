// Personal threads — chasing items.
// Single jsonb-array row per user_email in user_threads.
// Shape: [{id, text, done, position}]
// RLS: read/write own; DM can read.
import { supabase } from 'boot/supabase';

export async function fetchThreads() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];
  const { data, error } = await supabase
    .from('user_threads')
    .select('threads')
    .eq('user_email', user.email)
    .maybeSingle();
  if (error) {
    // eslint-disable-next-line no-console
    console.warn('[threads] fetch failed', error);
    return [];
  }
  const raw = (data && Array.isArray(data.threads)) ? data.threads : [];
  return raw
    .map((t, i) => ({
      id:       t.id || randomId(),
      text:     String(t.text || ''),
      done:     !!t.done,
      position: typeof t.position === 'number' ? t.position : i
    }))
    .sort((a, b) => a.position - b.position);
}

export async function saveThreads(threads) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;
  const { error } = await supabase
    .from('user_threads')
    .upsert({
      user_email: user.email,
      threads,
      updated_at: new Date().toISOString()
    }, { onConflict: 'user_email' });
  if (error) {
    // eslint-disable-next-line no-console
    console.warn('[threads] save failed', error);
  }
}

function randomId() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID();
  return 'th_' + Math.random().toString(36).slice(2, 10);
}
