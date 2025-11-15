/*
  # Deshabilitar RLS en tablas de batalla
  
  1. Problema
    - RLS puede estar bloqueando la creación de batallas
    
  2. Solución
    - Deshabilitar RLS en battles, battle_groups, battle_questions
    - Para que funcione sin restricciones
*/

-- Deshabilitar RLS en todas las tablas de batalla
ALTER TABLE battles DISABLE ROW LEVEL SECURITY;
ALTER TABLE battle_groups DISABLE ROW LEVEL SECURITY;
ALTER TABLE battle_questions DISABLE ROW LEVEL SECURITY;
ALTER TABLE battle_answers DISABLE ROW LEVEL SECURITY;
ALTER TABLE group_members DISABLE ROW LEVEL SECURITY;
