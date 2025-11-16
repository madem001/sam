/*
  # Agregar código único de batalla

  1. Cambios
    - Agregar campo `battle_code` a la tabla battles
    - Código único de 6 caracteres para toda la batalla
    - Los estudiantes usarán este código para unirse
    - El sistema asignará equipos automáticamente

  2. Notas
    - Los códigos de grupo ya existen pero ahora usaremos un código único de batalla
*/

-- Agregar campo de código de batalla
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'battles' AND column_name = 'battle_code'
  ) THEN
    ALTER TABLE battles ADD COLUMN battle_code text UNIQUE;
  END IF;
END $$;

-- Crear índice para búsquedas rápidas
CREATE INDEX IF NOT EXISTS idx_battles_code ON battles(battle_code);

-- Función para generar código de batalla aleatorio
CREATE OR REPLACE FUNCTION generate_battle_code()
RETURNS text AS $$
DECLARE
  chars text := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  result text := '';
  i integer;
BEGIN
  FOR i IN 1..6 LOOP
    result := result || substr(chars, floor(random() * length(chars) + 1)::integer, 1);
  END LOOP;
  RETURN result;
END;
$$ LANGUAGE plpgsql;
