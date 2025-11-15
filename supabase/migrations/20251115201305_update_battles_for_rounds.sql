/*
  # Actualizar schema para rondas y estudiantes por grupo

  1. Cambios en battles
    - Agregar round_count
    - Agregar students_per_group
    - Renombrar current_question_index a current_round_index
    
  2. Cambios en battle_groups
    - Agregar is_full
*/

-- Agregar columnas nuevas a battles
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'battles' AND column_name = 'round_count'
  ) THEN
    ALTER TABLE battles ADD COLUMN round_count int DEFAULT 10 CHECK (round_count >= 5 AND round_count <= 20);
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'battles' AND column_name = 'students_per_group'
  ) THEN
    ALTER TABLE battles ADD COLUMN students_per_group int DEFAULT 4 CHECK (students_per_group >= 2 AND students_per_group <= 10);
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'battles' AND column_name = 'current_round_index'
  ) THEN
    ALTER TABLE battles ADD COLUMN current_round_index int DEFAULT 0;
  END IF;
END $$;

-- Agregar is_full a battle_groups
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'battle_groups' AND column_name = 'is_full'
  ) THEN
    ALTER TABLE battle_groups ADD COLUMN is_full boolean DEFAULT false;
  END IF;
END $$;

-- Actualizar round_count basado en question_count existente
UPDATE battles 
SET round_count = question_count 
WHERE round_count IS NULL;
