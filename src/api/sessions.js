// Sessions API. Placeholder for Q4 build-out.
import { supabase } from 'boot/supabase';

export async function fetchAll() {
  const { data, error } = await supabase
    .from('sessions')
    .select('*')
    .order('number');
  if (error) throw error;
  return data || [];
}
