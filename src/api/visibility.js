// Writes to entity_visibility / entity_player_body / entity_player_tag.
// Used by the DM edit form (Phase Q5).
import { supabase } from 'boot/supabase';

export async function setVisibility(entityId, viewers) {
  await supabase.from('entity_visibility').delete().eq('entity_id', entityId);
  if (viewers.length) {
    const { error } = await supabase
      .from('entity_visibility')
      .insert(viewers.map(v => ({ entity_id: entityId, viewer: v })));
    if (error) throw error;
  }
}

export async function setTags(entityId, viewers) {
  await supabase.from('entity_player_tag').delete().eq('entity_id', entityId);
  if (viewers.length) {
    const { error } = await supabase
      .from('entity_player_tag')
      .insert(viewers.map(v => ({ entity_id: entityId, viewer: v })));
    if (error) throw error;
  }
}

export async function setPlayerBody(entityId, viewer, body) {
  if (!body || !body.trim()) {
    await supabase
      .from('entity_player_body')
      .delete()
      .eq('entity_id', entityId)
      .eq('viewer', viewer);
    return;
  }
  const { error } = await supabase
    .from('entity_player_body')
    .upsert({ entity_id: entityId, viewer, body, updated_at: new Date().toISOString() },
            { onConflict: 'entity_id,viewer' });
  if (error) throw error;
}
