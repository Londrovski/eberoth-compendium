// Import-and-go Supabase client. Keeps boot file as the singleton owner.
import { supabase } from 'boot/supabase';
export function useSupabase() { return supabase; }
