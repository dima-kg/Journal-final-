import { createClient } from '@supabase/supabase-js';
import { Database } from '../types/database';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

// Ensure URL has proper format and validate it
let formattedUrl: string;
try {
  // If URL doesn't start with http/https, add https
  if (!supabaseUrl.startsWith('http')) {
    formattedUrl = `https://${supabaseUrl}`;
  } else {
    formattedUrl = supabaseUrl;
  }
  
  // Validate URL format
  new URL(formattedUrl);
} catch (error) {
  throw new Error(`Invalid Supabase URL format: ${supabaseUrl}`);
}

export const supabase = createClient<Database>(formattedUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  },
  global: {
    headers: {
      'Content-Type': 'application/json',
    },
  },
  // Add retry logic for network issues
  db: {
    schema: 'public',
  },
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
});

// Test connection function
export const testConnection = async () => {
  try {
    const { data, error } = await supabase.from('equipment').select('count').limit(1);
    if (error) {
      console.error('Supabase connection test failed:', error);
      return false;
    }
    return true;
  } catch (error) {
    console.error('Network error during connection test:', error);
    return false;
  }
};
