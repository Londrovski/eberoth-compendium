// app_settings — DM-controlled global config.
// Holds card_scale, faction_scale, faction_order, and any future
// app-wide tunables. Renamed from layout_settings in Phase Q5 polish.
// RLS: world-read, DM-write (set in the original Phase Q1 migration
// and preserved through the RENAME).
import { supabase } from 'boot/supabase';

export async function fetchAll() {
  const { data, error } = await supabase.from('app_settings').select('key, value');
  if (error) throw error;
  return data || [];
}

export async function setKey(key, value) {
  const { error } = await supabase
    .from('app_settings')
    .upsert({ key, value, updated_at: new Date().toISOString() }, { onConflict: 'key' });
  if (error) throw error;
}
