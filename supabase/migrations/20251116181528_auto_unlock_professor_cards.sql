/*
  # Auto-desbloqueo de Cartas de Profesor

  1. Cambios
    - Crear función que verifica y desbloquea cartas automáticamente
    - Crear trigger que se ejecuta cuando se actualizan puntos
    - Las cartas se desbloquean automáticamente al alcanzar unlock_points
    - Los puntos NO se drenan al desbloquear (solo al canjear recompensas)

  2. Funcionamiento
    - Cuando student_professor_points se actualiza
    - Verifica si los puntos >= unlock_points de la carta
    - Si la carta NO está desbloqueada y tiene suficientes puntos, la desbloquea
    - Los puntos se mantienen intactos para canjear recompensas
*/

-- Función para desbloquear cartas automáticamente
CREATE OR REPLACE FUNCTION auto_unlock_professor_cards()
RETURNS TRIGGER AS $$
DECLARE
  card_record RECORD;
BEGIN
  -- Buscar la carta del profesor
  SELECT 
    pc.id as card_id,
    pc.unlock_points,
    spc.unlocked
  INTO card_record
  FROM professor_cards pc
  LEFT JOIN student_professor_cards spc
    ON spc.card_id = pc.id AND spc.student_id = NEW.student_id
  WHERE pc.teacher_id = NEW.professor_id;

  -- Si encontramos la carta y tiene suficientes puntos y no está desbloqueada
  IF card_record.card_id IS NOT NULL 
     AND NEW.points >= card_record.unlock_points 
     AND (card_record.unlocked = false OR card_record.unlocked IS NULL) THEN
    
    -- Desbloquear la carta
    UPDATE student_professor_cards
    SET unlocked = true, unlocked_at = now()
    WHERE student_id = NEW.student_id
      AND card_id = card_record.card_id;
    
    -- Log para debugging
    RAISE NOTICE 'Carta desbloqueada automáticamente para estudiante % (puntos: %)', NEW.student_id, NEW.points;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger que se ejecuta después de INSERT o UPDATE en student_professor_points
DROP TRIGGER IF EXISTS trigger_auto_unlock_cards ON student_professor_points;
CREATE TRIGGER trigger_auto_unlock_cards
  AFTER INSERT OR UPDATE OF points
  ON student_professor_points
  FOR EACH ROW
  EXECUTE FUNCTION auto_unlock_professor_cards();