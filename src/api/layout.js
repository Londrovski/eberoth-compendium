// layout_settings — DM-controlled UI state.
import { supabase } from 'boot/supabase';

export async function fetchAll() {
  const { data, error } = await supabase.from('layout_settings').select('key, value');
  if (error) throw error;
  return data || [];
}

export async function setKey(key, value) {
  const { error } = await supabase
    .from('layout_settings')
    .upsert({ key, value, updated_at: new Date().toISOString() }, { onConflict: 'key' });
  if (error) throw error;
}
