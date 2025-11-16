/*
  # Add Base64 Avatar Storage
  
  1. Changes to profiles
    - Add `avatar_base64` (text) - Store avatar images as base64 strings
    - This prevents images from being lost on reload
    
  2. Changes to professor_cards
    - Add `avatar_base64` (text) - Sync avatar with profile
    - Update trigger to sync both avatar and avatar_base64
*/

-- Add avatar_base64 field to profiles
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'avatar_base64'
  ) THEN
    ALTER TABLE profiles ADD COLUMN avatar_base64 text;
  END IF;
END $$;

-- Add avatar_base64 field to professor_cards
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'professor_cards' AND column_name = 'avatar_base64'
  ) THEN
    ALTER TABLE professor_cards ADD COLUMN avatar_base64 text;
  END IF;
END $$;

-- Update image_url in professor_cards to match profiles.avatar
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'professor_cards' AND column_name = 'user_id'
  ) THEN
    ALTER TABLE professor_cards ADD COLUMN user_id text REFERENCES profiles(id);
  END IF;
END $$;

-- Update existing professor_cards to link to profiles
UPDATE professor_cards pc
SET user_id = pc.teacher_id
WHERE user_id IS NULL;

-- Create function to sync profile avatar to professor card
CREATE OR REPLACE FUNCTION sync_professor_card_avatar()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE professor_cards
  SET 
    image_url = NEW.avatar,
    avatar_base64 = NEW.avatar_base64
  WHERE user_id = NEW.id OR teacher_id = NEW.id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to update professor card when profile avatar changes
DROP TRIGGER IF EXISTS on_profile_avatar_update ON profiles;

CREATE TRIGGER on_profile_avatar_update
  AFTER UPDATE OF avatar, avatar_base64 ON profiles
  FOR EACH ROW
  WHEN (OLD.avatar IS DISTINCT FROM NEW.avatar OR OLD.avatar_base64 IS DISTINCT FROM NEW.avatar_base64)
  EXECUTE FUNCTION sync_professor_card_avatar();