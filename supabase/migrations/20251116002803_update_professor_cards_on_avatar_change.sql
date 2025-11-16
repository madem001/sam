/*
  # Actualizar cartas de profesor cuando cambia su avatar

  1. Función
    - Actualiza automáticamente `professor_cards.image_url` cuando cambia `profiles.avatar`
    - Solo para perfiles con role = 'TEACHER'

  2. Trigger
    - Se ejecuta DESPUÉS de UPDATE en profiles
    - Solo cuando el campo avatar cambia
*/

-- Función para actualizar la imagen en las cartas del profesor
CREATE OR REPLACE FUNCTION update_professor_card_image()
RETURNS TRIGGER AS $$
BEGIN
  -- Solo actualizar si es un profesor y el avatar cambió
  IF NEW.role = 'TEACHER' AND (OLD.avatar IS DISTINCT FROM NEW.avatar) THEN
    UPDATE professor_cards
    SET 
      image_url = NEW.avatar,
      name = NEW.name,
      updated_at = now()
    WHERE teacher_id = NEW.id;
    
    RAISE NOTICE 'Carta de profesor actualizada para: %', NEW.name;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para auto-actualizar cartas cuando cambia el perfil
DROP TRIGGER IF EXISTS on_profile_update_sync_card ON profiles;
CREATE TRIGGER on_profile_update_sync_card
  AFTER UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_professor_card_image();
