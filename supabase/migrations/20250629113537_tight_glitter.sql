/*
  # Fix date fields and formatting

  1. Database Updates
    - Add default value for created_at in reminders table
    - Ensure proper timestamp handling

  2. Security
    - Maintain existing RLS policies
*/

-- Add default value for created_at in reminders table if it doesn't exist
DO $$
BEGIN
  -- Check if created_at has a default value, if not add it
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'reminders' 
    AND column_name = 'created_at' 
    AND column_default IS NOT NULL
  ) THEN
    ALTER TABLE reminders ALTER COLUMN created_at SET DEFAULT now();
  END IF;
END $$;