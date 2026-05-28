// entity_personal_to — 'this NPC is personal to player X with relationship Y'.
import { supabase } from 'boot/supabase';

export async function fetchAll() {
  const { data, error } = await supabase
    .from('entity_personal_to')
    .select('entity_id, player_id, relationship, sort_order')
    .order('player_id')
    .order('sort_order');
  if (error) throw error;
  return data || [];
}

export async function upsert(row) {
  const { error } = await supabase
    .from('entity_personal_to')
    .upsert(row, { onConflict: 'entity_id,player_id' });
  if (error) throw error;
}

export async function remove(entityId, playerId) {
  const { error } = await supabase
    .from('entity_personal_to')
    .delete()
    .eq('entity_id', entityId)
    .eq('player_id', playerId);
  if (error) throw error;
}
