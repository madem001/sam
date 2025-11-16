/*
  # Arreglar políticas de question_sets y question_bank
  
  1. Problema
    - Las políticas RLS requieren auth.uid() pero el código pasa teacher_id manualmente
    - Esto causa errores al insertar
    
  2. Solución
    - Eliminar políticas restrictivas existentes
    - Crear políticas que NO requieran teacher_id en WITH CHECK
    - Usar triggers para auto-asignar teacher_id basado en auth.uid()
    
  3. Seguridad
    - Usuarios autenticados pueden crear sus propios sets
    - Solo pueden ver/editar/eliminar sus propios sets
*/

-- Eliminar políticas existentes
DROP POLICY IF EXISTS "Teachers can view own question sets" ON question_sets;
DROP POLICY IF EXISTS "Teachers can insert own question sets" ON question_sets;
DROP POLICY IF EXISTS "Teachers can update own question sets" ON question_sets;
DROP POLICY IF EXISTS "Teachers can delete own question sets" ON question_sets;

DROP POLICY IF EXISTS "Teachers can view own questions" ON question_bank;
DROP POLICY IF EXISTS "Teachers can insert own questions" ON question_bank;
DROP POLICY IF EXISTS "Teachers can update own questions" ON question_bank;
DROP POLICY IF EXISTS "Teachers can delete own questions" ON question_bank;

-- Nuevas políticas para question_sets (más permisivas)
CREATE POLICY "Authenticated users can view own question sets"
  ON question_sets FOR SELECT
  TO authenticated
  USING (teacher_id = auth.uid());

CREATE POLICY "Authenticated users can insert question sets"
  ON question_sets FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update own question sets"
  ON question_sets FOR UPDATE
  TO authenticated
  USING (teacher_id = auth.uid())
  WITH CHECK (teacher_id = auth.uid());

CREATE POLICY "Authenticated users can delete own question sets"
  ON question_sets FOR DELETE
  TO authenticated
  USING (teacher_id = auth.uid());

-- Nuevas políticas para question_bank (más permisivas)
CREATE POLICY "Authenticated users can view own questions"
  ON question_bank FOR SELECT
  TO authenticated
  USING (teacher_id = auth.uid());

CREATE POLICY "Authenticated users can insert questions"
  ON question_bank FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update own questions"
  ON question_bank FOR UPDATE
  TO authenticated
  USING (teacher_id = auth.uid())
  WITH CHECK (teacher_id = auth.uid());

CREATE POLICY "Authenticated users can delete own questions"
  ON question_bank FOR DELETE
  TO authenticated
  USING (teacher_id = auth.uid());

-- Crear función trigger para auto-asignar teacher_id en question_sets
CREATE OR REPLACE FUNCTION set_teacher_id_from_auth()
RETURNS TRIGGER AS $$
BEGIN
  NEW.teacher_id := auth.uid();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Aplicar trigger a question_sets
DROP TRIGGER IF EXISTS set_question_set_teacher_id ON question_sets;
CREATE TRIGGER set_question_set_teacher_id
  BEFORE INSERT ON question_sets
  FOR EACH ROW
  EXECUTE FUNCTION set_teacher_id_from_auth();

-- Aplicar trigger a question_bank
DROP TRIGGER IF EXISTS set_question_bank_teacher_id ON question_bank;
CREATE TRIGGER set_question_bank_teacher_id
  BEFORE INSERT ON question_bank
  FOR EACH ROW
  EXECUTE FUNCTION set_teacher_id_from_auth();
