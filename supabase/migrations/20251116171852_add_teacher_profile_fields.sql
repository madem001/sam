/*
  # Add Teacher Profile Fields

  1. Changes
    - Add `subjects` field to profiles (array of text)
    - Add `skills` field to profiles (array of text)
    - Add `cycles` field to profiles (array of text)

  2. Notes
    - These fields are specifically for teacher profiles
    - Students can leave these fields null or empty
*/

-- Add new fields to profiles table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'subjects'
  ) THEN
    ALTER TABLE profiles ADD COLUMN subjects text[];
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'skills'
  ) THEN
    ALTER TABLE profiles ADD COLUMN skills text[];
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'cycles'
  ) THEN
    ALTER TABLE profiles ADD COLUMN cycles text[];
  END IF;
END $$;
