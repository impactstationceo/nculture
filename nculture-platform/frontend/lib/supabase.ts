import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

const isValidSupabaseUrl = (url: string) => {
  if (!url) return false;
  if (url.includes('your_') || url.includes('[') || url.includes(']')) return false;
  try {
    const parsed = new URL(url);
    return parsed.hostname.endsWith('supabase.co');
  } catch {
    return false;
  }
};

const isValidSupabaseKey = (key: string) => {
  if (!key) return false;
  if (key.includes('your_') || key.includes('[') || key.includes(']')) return false;
  return true;
};

export const isSupabaseConfigured = isValidSupabaseUrl(supabaseUrl) && isValidSupabaseKey(supabaseAnonKey);

const safeSupabaseUrl = isSupabaseConfigured ? supabaseUrl : 'http://localhost';
const safeSupabaseAnonKey = isSupabaseConfigured ? supabaseAnonKey : 'public-anon-key';

export const supabase = createClient(safeSupabaseUrl, safeSupabaseAnonKey);
