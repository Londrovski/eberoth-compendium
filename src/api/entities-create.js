// Create a new entity row from the DM quick-add dialog.
// Default visibility = {dm} so it's invisible to players until DM
// explicitly opens it up. For factions, also appends the id to
// app_settings.faction_order so the new faction appears in the grid.

import { supabase } from 'boot/supabase';
import * as appSettingsApi from 'src/api/app-settings';

function kebab(s) {
  return String(s || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);
}

export function suggestId(name) {
  return kebab(name);
}

export async function createEntity({ id, kind, name, sub, image }) {
  if (!id || !kind || !name) throw new Error('createEntity: id, kind, name required');

  // Append to the end of its kind for sort_order.
  const { count } = await supabase
    .from('entities')
    .select('*', { count: 'exact', head: true })
    .eq('kind', kind);
  const sort_order = count || 0;

  const row = {
    id, kind, name,
    sub: sub || null,
    sort_order
  };
  // Factions use sigil; everything else uses image.
  if (kind === 'faction') row.sigil = image || null;
  else row.image = image || null;

  const { error: entErr } = await supabase.from('entities').insert(row);
  if (entErr) throw entErr;

  // Default visibility: DM only.
  const { error: visErr } = await supabase
    .from('entity_visibility')
    .insert({ entity_id: id, viewer: 'dm' });
  if (visErr) throw visErr;

  // For factions, also append to faction_order.
  if (kind === 'faction') {
    const rows = await appSettingsApi.fetchAll();
    const current = rows.find(r => r.key === 'faction_order')?.value?.order || [];
    if (!current.includes(id)) {
      await appSettingsApi.setKey('faction_order', { order: [...current, id] });
    }
  }

  return id;
}
