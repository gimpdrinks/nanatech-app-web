export interface Reminder {
  id: string;
  user_id: string;
  type: string | null;
  title: string | null;
  description: string | null;
  photo_url: string | null;
  reminder_time: string | null;
  is_completed: boolean | null;
  is_recurring: boolean | null;
  recurrence_pattern: string | null;
  recurrence_data: any | null;
  end_recurrence_date: string | null;
  created_at: string | null;
}

export interface RecurrenceData {
  interval?: number;
  days_of_week?: number[]; // 0-6, Sunday is 0
  day_of_month?: number;
  month_of_year?: number;
}

export type RecurrencePattern = 'none' | 'daily' | 'weekly' | 'monthly' | 'yearly';

export interface NotificationSettings {
  enabled: boolean;
  soundEnabled: boolean;
  advanceNotice: number; // minutes before reminder time
}