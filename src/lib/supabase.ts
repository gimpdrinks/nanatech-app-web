import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Validate environment variables exist
if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables. Please ensure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are set in your .env file.');
  // Create a dummy client to prevent app crashes
  export const supabase = createClient('https://dummy.supabase.co', 'dummy-key');
  export type Database = {};
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
    export const supabase = createClient('https://dummy.supabase.co', 'dummy-key');
    export type Database = {};
  } else {
    // Create the real Supabase client
    export const supabase = createClient(supabaseUrl, supabaseAnonKey);
    
    export type Database = {
      public: {
        Tables: {
          profiles: {
            Row: {
              id: string;
              full_name: string;
              language: string;
              created_at: string;
            };
            Insert: {
              id: string;
              full_name: string;
              language?: string;
            };
            Update: {
              full_name?: string;
              language?: string;
            };
          };
          reminders: {
            Row: {
              id: string;
              user_id: string;
              type: string | null;
              title: string | null;
              reminder_time: string | null;
              is_recurring: boolean | null;
              recurrence_pattern: string | null;
              recurrence_data: any | null;
              end_recurrence_date: string | null;
              created_at: string;
            };
            Insert: {
              user_id: string;
              type: string | null;
              title: string | null;
              reminder_time: string | null;
              is_recurring?: boolean | null;
              recurrence_pattern?: string | null;
              recurrence_data?: any | null;
              end_recurrence_date?: string | null;
            };
            Update: {
              type?: string | null;
              title?: string;
              reminder_time?: string | null;
              is_recurring?: boolean | null;
              recurrence_pattern?: string | null;
              recurrence_data?: any | null;
              end_recurrence_date?: string | null;
            };
          };
          emergency_contacts: {
            Row: {
              id: string;
              user_id: string;
              name: string;
              relationship: string;
              phone_number: string;
              created_at: string;
            };
            Insert: {
              user_id: string;
              name: string;
              relationship: string;
              phone_number: string;
            };
            Update: {
              name?: string;
              relationship?: string;
              phone_number?: string;
            };
          };
        };
      };
    };
  }
}
