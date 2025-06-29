/*
  # Update Nanatech database schema

  1. Database Updates
    - Ensure all tables have correct structure matching existing schema
    - Fix column references to match existing database
    - Update RLS policies with correct auth.uid() function

  2. Security
    - Enable RLS on all tables
    - Add comprehensive policies for user data isolation
*/

-- Ensure emergency_contacts table matches existing schema
DO $$
BEGIN
  -- Check if phone_number column exists, if not rename phone to phone_number
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'emergency_contacts' AND column_name = 'phone_number'
  ) THEN
    IF EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_name = 'emergency_contacts' AND column_name = 'phone'
    ) THEN
      ALTER TABLE emergency_contacts RENAME COLUMN phone TO phone_number;
    END IF;
  END IF;
END $$;

-- Ensure all tables have RLS enabled
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE reminders ENABLE ROW LEVEL SECURITY; 
ALTER TABLE emergency_contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE health_checks ENABLE ROW LEVEL SECURITY;
ALTER TABLE tutorials ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Users can read own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;

DROP POLICY IF EXISTS "Users can read own reminders" ON reminders;
DROP POLICY IF EXISTS "Users can insert own reminders" ON reminders;
DROP POLICY IF EXISTS "Users can update own reminders" ON reminders;
DROP POLICY IF EXISTS "Users can delete own reminders" ON reminders;

DROP POLICY IF EXISTS "Users can read own emergency contacts" ON emergency_contacts;
DROP POLICY IF EXISTS "Users can insert own emergency contacts" ON emergency_contacts;
DROP POLICY IF EXISTS "Users can update own emergency contacts" ON emergency_contacts;
DROP POLICY IF EXISTS "Users can delete own emergency contacts" ON emergency_contacts;

-- Create policies for profiles table
CREATE POLICY "Users can read own profile"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Create policies for reminders table
CREATE POLICY "Users can read own reminders"
  ON reminders
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own reminders"
  ON reminders
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own reminders"
  ON reminders
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own reminders"
  ON reminders
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create policies for emergency_contacts table
CREATE POLICY "Users can read own emergency contacts"
  ON emergency_contacts
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own emergency contacts"
  ON emergency_contacts
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own emergency contacts"
  ON emergency_contacts
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own emergency contacts"
  ON emergency_contacts
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create indexes for better performance (safe to run multiple times)
CREATE INDEX IF NOT EXISTS idx_reminders_user_id ON reminders(user_id);
CREATE INDEX IF NOT EXISTS idx_reminders_created_at ON reminders(created_at);
CREATE INDEX IF NOT EXISTS idx_emergency_contacts_user_id ON emergency_contacts(user_id);
CREATE INDEX IF NOT EXISTS idx_profiles_id ON profiles(id);