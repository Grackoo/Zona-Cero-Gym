import { createClient } from '@supabase/supabase-js';

// These should be configured in your .env file
// For now, they might be empty, so we provide fallback to prevent crashes during initial render
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'placeholder-key';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
