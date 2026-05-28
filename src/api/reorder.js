// Swap sort_order between two rows in a join table. Used for faction
// member reorder and personal-to reorder.
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
