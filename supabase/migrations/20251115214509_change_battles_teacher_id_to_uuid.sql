/*
  # Cambiar teacher_id en battles a UUID
  
  1. Problema
    - teacher_id es TEXT pero Supabase auth usa UUID
    - Los usuarios autenticados tienen IDs UUID
    
  2. Solución
    - Cambiar teacher_id a UUID en battles
    - Esto permitirá usar auth.uid() correctamente
*/

-- Cambiar teacher_id a UUID
ALTER TABLE battles 
ALTER COLUMN teacher_id TYPE uuid USING teacher_id::uuid;
