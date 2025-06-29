import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://your-project.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'your-anon-key';

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