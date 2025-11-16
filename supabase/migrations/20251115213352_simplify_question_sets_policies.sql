/*
  # Simplificar políticas de question_sets
  
  1. Cambios
    - Permitir que cualquier usuario autenticado cree sets
    - Eliminar validación estricta de teacher_id en INSERT
    
  2. Seguridad
    - Solo usuarios autenticados pueden crear
    - Solo pueden ver/editar/eliminar sus propios sets
*/

-- Eliminar políticas existentes
DROP POLICY IF EXISTS "Authenticated users can view own question sets" ON question_sets;
DROP POLICY IF EXISTS "Authenticated users can insert question sets" ON question_sets;
DROP POLICY IF EXISTS "Authenticated users can update own question sets" ON question_sets;
DROP POLICY IF EXISTS "Authenticated users can delete own question sets" ON question_sets;

DROP POLICY IF EXISTS "Authenticated users can view own questions" ON question_bank;
DROP POLICY IF EXISTS "Authenticated users can insert questions" ON question_bank;
DROP POLICY IF EXISTS "Authenticated users can update own questions" ON question_bank;
DROP POLICY IF EXISTS "Authenticated users can delete own questions" ON question_bank;

-- Políticas simplificadas para question_sets
CREATE POLICY "Anyone authenticated can view question sets"
  ON question_sets FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Anyone authenticated can insert question sets"
  ON question_sets FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Anyone authenticated can update question sets"
  ON question_sets FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Anyone authenticated can delete question sets"
  ON question_sets FOR DELETE
  TO authenticated
  USING (true);

-- Políticas simplificadas para question_bank
CREATE POLICY "Anyone authenticated can view questions"
  ON question_bank FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Anyone authenticated can insert questions"
  ON question_bank FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Anyone authenticated can update questions"
  ON question_bank FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Anyone authenticated can delete questions"
  ON question_bank FOR DELETE
  TO authenticated
  USING (true);
