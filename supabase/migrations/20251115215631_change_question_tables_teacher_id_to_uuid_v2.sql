/*
  # Cambiar teacher_id a UUID en tablas de preguntas
  
  1. Problema
    - teacher_id es TEXT en question_sets y question_bank
    - Necesita ser UUID para coincidir con auth.users
    
  2. Solución
    - Cambiar ambas columnas a UUID
*/

-- Cambiar teacher_id a UUID en question_sets
ALTER TABLE question_sets 
ALTER COLUMN teacher_id TYPE uuid USING teacher_id::uuid;

-- Cambiar teacher_id a UUID en question_bank
ALTER TABLE question_bank 
ALTER COLUMN teacher_id TYPE uuid USING teacher_id::uuid;
