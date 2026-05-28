// entity_memberships — multi-faction membership with per-faction roles.
import { supabase } from 'boot/supabase';

export async function fetchAll() {
  const { data, error } = await supabase
    .from('entity_memberships')
    .select('entity_id, faction_id, role, sort_order')
    .order('faction_id')
    .order('sort_order');
  if (error) throw error;
  return data || [];
}

export async function upsert(row) {
  const { error } = await supabase
    .from('entity_memberships')
    .upsert(row, { onConflict: 'entity_id,faction_id' });
  if (error) throw error;
}

export async function remove(entityId, factionId) {
  const { error } = await supabase
    .from('entity_memberships')
    .delete()
    .eq('entity_id', entityId)
    .eq('faction_id', factionId);
  if (error) throw error;
}
