/*
  # Actualizar banco de preguntas a sets

  1. Cambios
    - Agregar tabla `question_sets` para grupos de preguntas
    - Modificar `question_bank` para referenciar a sets
    - Un set contiene 5-20 preguntas relacionadas
    - En batallas se selecciona un set completo

  2. Nueva Estructura
    - `question_sets`: id, teacher_id, set_name, description, created_at
    - `question_bank`: agregar campo `set_id` (foreign key)
    
  3. Seguridad
    - RLS en ambas tablas
    - Teachers solo ven sus propios sets
*/

-- Crear tabla de sets de preguntas
CREATE TABLE IF NOT EXISTS question_sets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  teacher_id uuid NOT NULL,
  set_name text NOT NULL,
  description text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE question_sets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Teachers can view own question sets"
  ON question_sets FOR SELECT
  TO authenticated
  USING (teacher_id = auth.uid());

CREATE POLICY "Teachers can insert own question sets"
  ON question_sets FOR INSERT
  TO authenticated
  WITH CHECK (teacher_id = auth.uid());

CREATE POLICY "Teachers can update own question sets"
  ON question_sets FOR UPDATE
  TO authenticated
  USING (teacher_id = auth.uid())
  WITH CHECK (teacher_id = auth.uid());

CREATE POLICY "Teachers can delete own question sets"
  ON question_sets FOR DELETE
  TO authenticated
  USING (teacher_id = auth.uid());

-- Agregar campo set_id a question_bank
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'question_bank' AND column_name = 'set_id'
  ) THEN
    ALTER TABLE question_bank ADD COLUMN set_id uuid REFERENCES question_sets(id) ON DELETE CASCADE;
  END IF;
END $$;

-- Crear índice para búsquedas rápidas
CREATE INDEX IF NOT EXISTS idx_question_bank_set_id ON question_bank(set_id);
CREATE INDEX IF NOT EXISTS idx_question_sets_teacher ON question_sets(teacher_id);
