// Swap sort_order between two rows. Used for faction member reorder,
// personal-to reorder, and entity-level reorder (lore cards).
import { supabase } from 'boot/supabase';

export async function swapMembershipOrder(factionId, entityIdA, entityIdB) {
  const { data, error } = await supabase
    .from('entity_memberships')
    .select('entity_id, sort_order')
    .eq('faction_id', factionId)
    .in('entity_id', [entityIdA, entityIdB]);
  if (error) throw error;
  if (!data || data.length !== 2) return;
  const a = data.find(r => r.entity_id === entityIdA);
  const b = data.find(r => r.entity_id === entityIdB);

  const updates = [
    supabase.from('entity_memberships')
      .update({ sort_order: b.sort_order })
      .eq('faction_id', factionId).eq('entity_id', entityIdA),
    supabase.from('entity_memberships')
      .update({ sort_order: a.sort_order })
      .eq('faction_id', factionId).eq('entity_id', entityIdB)
  ];
  const results = await Promise.all(updates);
  results.forEach(r => { if (r.error) throw r.error; });
}

export async function swapPersonalOrder(playerId, entityIdA, entityIdB) {
  const { data, error } = await supabase
    .from('entity_personal_to')
    .select('entity_id, sort_order')
    .eq('player_id', playerId)
    .in('entity_id', [entityIdA, entityIdB]);
  if (error) throw error;
  if (!data || data.length !== 2) return;
  const a = data.find(r => r.entity_id === entityIdA);
  const b = data.find(r => r.entity_id === entityIdB);

  const updates = [
    supabase.from('entity_personal_to')
      .update({ sort_order: b.sort_order })
      .eq('player_id', playerId).eq('entity_id', entityIdA),
    supabase.from('entity_personal_to')
      .update({ sort_order: a.sort_order })
      .eq('player_id', playerId).eq('entity_id', entityIdB)
  ];
  const results = await Promise.all(updates);
  results.forEach(r => { if (r.error) throw r.error; });
}

// Swap sort_order on the entities table itself. Used for entity-level
// ordering (lore cards, the party row, anywhere an entity's intrinsic
// position matters).
export async function swapEntitySortOrder(entityIdA, entityIdB) {
  const { data, error } = await supabase
    .from('entities')
    .select('id, sort_order')
    .in('id', [entityIdA, entityIdB]);
  if (error) throw error;
  if (!data || data.length !== 2) return;
  const a = data.find(r => r.id === entityIdA);
  const b = data.find(r => r.id === entityIdB);

  const updates = [
    supabase.from('entities')
      .update({ sort_order: b.sort_order })
      .eq('id', entityIdA),
    supabase.from('entities')
      .update({ sort_order: a.sort_order })
      .eq('id', entityIdB)
  ];
  const results = await Promise.all(updates);
  results.forEach(r => { if (r.error) throw r.error; });
}
