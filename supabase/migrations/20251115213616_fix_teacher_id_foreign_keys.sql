/*
  # Eliminar foreign keys y cambiar teacher_id a TEXT
  
  1. Eliminar foreign keys problemáticas
  2. Cambiar teacher_id a TEXT
  3. No necesitamos foreign key a profiles porque usamos strings custom
*/

-- Eliminar foreign key constraint en question_bank
ALTER TABLE question_bank 
DROP CONSTRAINT IF EXISTS question_bank_teacher_id_fkey;

-- Eliminar foreign key constraint en question_sets si existe
ALTER TABLE question_sets 
DROP CONSTRAINT IF EXISTS question_sets_teacher_id_fkey;

-- Cambiar tipo en question_sets
ALTER TABLE question_sets 
ALTER COLUMN teacher_id TYPE text;

-- Cambiar tipo en question_bank
ALTER TABLE question_bank 
ALTER COLUMN teacher_id TYPE text;
