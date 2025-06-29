/*
  # Add theme preference to user profiles

  1. Changes
    - Add `theme` column to `profiles` table with default value 'dark'
    - Column allows 'light' or 'dark' values

  2. Security
    - No changes to existing RLS policies needed
    - New column inherits existing security rules
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'theme'
  ) THEN
    ALTER TABLE profiles ADD COLUMN theme text DEFAULT 'dark';
  END IF;
END $$;

-- Add check constraint to ensure only valid theme values
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE table_name = 'profiles' AND constraint_name = 'profiles_theme_check'
  ) THEN
    ALTER TABLE profiles ADD CONSTRAINT profiles_theme_check CHECK (theme IN ('light', 'dark'));
  END IF;
END $$;