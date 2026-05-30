import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export const isSandbox = () => {
  return !supabaseUrl || supabaseUrl.includes('mock') || !supabaseAnonKey || supabaseAnonKey.includes('mock');
};

// Create the Supabase client
// When in sandbox mode, we initialize a dummy client (or catch exceptions gracefully)
export const supabase = !isSandbox()
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null as any; // Cast so we don't throw type errors, we handle null check in helpers
