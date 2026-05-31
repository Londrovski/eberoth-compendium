// dm_highlight — single-row table the DM uses to push a card into the
// players' attention. World-read, DM-write (RLS enforced server-side).
import { supabase } from 'boot/supabase';

export async function fetchCurrent() {
  const { data, error } = await supabase
    .from('dm_highlight')
    .select('kind, target_id, target_label, created_at')
    .eq('id', 1)
    .maybeSingle();
  if (error) throw error;
  return data || null;
}

export async function setHighlight({ kind, targetId, targetLabel }) {
  const { error } = await supabase
    .from('dm_highlight')
    .update({
      kind,
      target_id: targetId,
      target_label: targetLabel,
      created_at: new Date().toISOString()
    })
    .eq('id', 1);
  if (error) throw error;
}

export async function clearHighlight() {
  const { error } = await supabase
    .from('dm_highlight')
    .update({
      kind: null,
      target_id: null,
      target_label: null,
      created_at: new Date().toISOString()
    })
    .eq('id', 1);
  if (error) throw error;
}
