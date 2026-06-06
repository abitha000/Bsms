import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

let supabaseInstance: ReturnType<typeof createClient> | null = null;

export function getSupabase() {
  if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Supabase environment variables are not configured');
  console.log('URL:', process.env.NEXT_PUBLIC_SUPABASE_URL);
  console.log('KEY EXISTS:', !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
  return null as any;
}

  if (!supabaseInstance) {
    supabaseInstance = createClient(supabaseUrl, supabaseAnonKey);
  }

  return supabaseInstance;
}

// Legacy export for compatibility
export const supabase = {
  get auth() {
    return getSupabase().auth;
  },
  get from() {
    return getSupabase().from;
  },
  get storage() {
    return getSupabase().storage;
  },
};
