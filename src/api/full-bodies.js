// Fetch ALL per-player bodies for a single entity, regardless of which
// bucket the current viewer is. Used by:
//   - the DM edit form (to populate the 4 player textareas)
//   - the DM 'other player views' expansion in DetailBody
//
// RLS: entity_player_body is readable by own-row OR DM. So DM gets
// every row; non-DM gets only their own. We rely on RLS to filter.

import { supabase } from 'boot/supabase';

export async function fetchAllBodiesFor(entityId) {
  const { data, error } = await supabase
    .from('entity_player_body')
    .select('viewer, body')
    .eq('entity_id', entityId);
  if (error) {
    // eslint-disable-next-line no-console
    console.warn('[full-bodies] fetch failed', error);
    return {};
  }
  const out = {};
  (data || []).forEach(row => { out[row.viewer] = row.body; });
  return out;
}

export async function fetchVisibilityFor(entityId) {
  const { data, error } = await supabase
    .from('entity_visibility')
    .select('viewer')
    .eq('entity_id', entityId);
  if (error) {
    // eslint-disable-next-line no-console
    console.warn('[full-bodies] visibility fetch failed', error);
    return new Set();
  }
  return new Set((data || []).map(r => r.viewer));
}

export async function fetchTagsFor(entityId) {
  const { data, error } = await supabase
    .from('entity_player_tag')
    .select('viewer')
    .eq('entity_id', entityId);
  if (error) {
    // eslint-disable-next-line no-console
    console.warn('[full-bodies] tags fetch failed', error);
    return new Set();
  }
  return new Set((data || []).map(r => r.viewer));
}
