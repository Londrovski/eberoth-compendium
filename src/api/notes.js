// Per-user notes attached to entities or sessions.
// One row per (user_email, entity_id). HTML body.
//
// Schema: user_notes (user_email text, entity_id text, html text, updated_at)
// RLS: read/write own rows only.

import { supabase } from 'boot/supabase';

export async function fetch(entityId) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return '';
  const { data, error } = await supabase
    .from('user_notes')
    .select('html')
    .eq('user_email', user.email)
    .eq('entity_id', String(entityId))
    .maybeSingle();
  if (error) {
    // eslint-disable-next-line no-console
    console.warn('[notes] fetch failed', error);
    return '';
  }
  return (data && data.html) || '';
}

export async function save(entityId, html) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;
  const { error } = await supabase.from('user_notes').upsert({
    user_email: user.email,
    entity_id:  String(entityId),
    html,
    updated_at: new Date().toISOString()
  }, { onConflict: 'user_email,entity_id' });
  if (error) {
    // eslint-disable-next-line no-console
    console.warn('[notes] save failed', error);
  }
}
