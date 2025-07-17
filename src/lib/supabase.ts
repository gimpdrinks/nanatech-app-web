import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Declare exports at top level
let supabase: ReturnType<typeof createClient>;
type Database = {};

// Validate environment variables exist
if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables. Please ensure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are set in your .env file.');
  // Create a dummy client to prevent app crashes
  supabase = createClient('https://dummy.supabase.co', 'dummy-key');
} else {
  // Validate environment variables are not placeholder values
  const isValidUrl = supabaseUrl.startsWith('https://') && supabaseUrl.includes('.supabase.co');
  const hasPlaceholderValues = supabaseUrl.includes('your-project') || 
                               supabaseUrl.includes('your_supabase') ||
                               supabaseAnonKey.includes('your-anon') ||
                               supabaseAnonKey.includes('your_supabase');
  
  if (!isValidUrl || hasPlaceholderValues) {
    console.error('Invalid Supabase configuration. Please replace placeholder values with actual Supabase credentials.');
    // Create a dummy client to prevent app crashes
    supabase = createClient('https://dummy.supabase.co', 'dummy-key');
  } else {
    // Create the real Supabase client
    supabase = createClient(supabaseUrl, supabaseAnonKey);
  }
}

export { supabase };
export type { Database };