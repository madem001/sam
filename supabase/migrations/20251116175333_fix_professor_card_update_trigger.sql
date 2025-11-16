/*
  # Fix Professor Card Update Trigger

  1. Changes
    - Update trigger to detect changes in both `avatar` and `avatar_base64` fields
    - Use avatar_base64 if available, otherwise use avatar
    - This ensures cards are updated when professor changes their profile picture
*/

-- Drop the old function
DROP FUNCTION IF EXISTS update_professor_card_image() CASCADE;

-- Create updated function that handles both avatar fields
CREATE OR REPLACE FUNCTION update_professor_card_image()
RETURNS TRIGGER AS $$
DECLARE
  new_image_url text;
BEGIN
  -- Only process if it's a teacher
  IF NEW.role = 'TEACHER' THEN
    -- Check if avatar_base64 or avatar changed
    IF (OLD.avatar_base64 IS DISTINCT FROM NEW.avatar_base64) OR (OLD.avatar IS DISTINCT FROM NEW.avatar) THEN
      -- Prefer avatar_base64 over avatar
      new_image_url := COALESCE(NEW.avatar_base64, NEW.avatar);
      
      -- Update the professor card
      UPDATE professor_cards
      SET 
        image_url = new_image_url,
        avatar_base64 = NEW.avatar_base64,
        name = NEW.name,
        updated_at = now()
      WHERE teacher_id = NEW.id;
      
      RAISE NOTICE 'Carta de profesor actualizada para: % con imagen: %', NEW.name, LEFT(new_image_url, 50);
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recreate the trigger
DROP TRIGGER IF EXISTS on_profile_update_sync_card ON profiles;
CREATE TRIGGER on_profile_update_sync_card
  AFTER UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_professor_card_image();