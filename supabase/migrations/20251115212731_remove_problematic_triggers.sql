/*
  # Eliminar triggers problemáticos
  
  1. Problema
    - Los triggers están interfiriendo con inserts directos
    - No podemos usar auth.uid() en migraciones
    
  2. Solución
    - Eliminar triggers
    - Las políticas RLS se encargan de la seguridad
    - El frontend siempre pasa teacher_id = user.id
*/

-- Eliminar triggers
DROP TRIGGER IF EXISTS set_question_set_teacher_id ON question_sets;
DROP TRIGGER IF EXISTS set_question_bank_teacher_id ON question_bank;

-- Eliminar función
DROP FUNCTION IF EXISTS set_teacher_id_from_auth();
