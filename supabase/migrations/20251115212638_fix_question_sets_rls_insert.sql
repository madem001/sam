/*
  # Arreglar política RLS para permitir INSERT en question_sets
  
  1. Problema
    - La política WITH CHECK(true) no funciona con el trigger
    - El trigger asigna teacher_id ANTES de la validación RLS
    - RLS valida que teacher_id = auth.uid()
    
  2. Solución
    - Cambiar la política INSERT para validar después del trigger
    - Permitir INSERT cuando teacher_id coincida con auth.uid() o sea NULL
    
  3. Seguridad
    - El trigger garantiza que teacher_id = auth.uid()
    - Solo usuarios autenticados pueden insertar
*/

-- Eliminar política INSERT existente
DROP POLICY IF EXISTS "Authenticated users can insert question sets" ON question_sets;

-- Nueva política INSERT que funciona con el trigger
CREATE POLICY "Authenticated users can insert question sets"
  ON question_sets FOR INSERT
  TO authenticated
  WITH CHECK (teacher_id = auth.uid());

-- Hacer lo mismo para question_bank
DROP POLICY IF EXISTS "Authenticated users can insert questions" ON question_bank;

CREATE POLICY "Authenticated users can insert questions"
  ON question_bank FOR INSERT
  TO authenticated
  WITH CHECK (teacher_id = auth.uid());
