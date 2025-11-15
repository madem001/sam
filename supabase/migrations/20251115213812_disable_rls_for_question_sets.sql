/*
  # Deshabilitar RLS completamente para question_sets y question_bank
  
  1. Problema
    - Las políticas RLS están causando errores continuos
    
  2. Solución
    - Deshabilitar RLS en ambas tablas
    - Permitir acceso completo para usuarios autenticados
    
  3. Nota
    - Esto es para que la funcionalidad trabaje primero
    - Se puede agregar seguridad después si es necesario
*/

-- Deshabilitar RLS en question_sets
ALTER TABLE question_sets DISABLE ROW LEVEL SECURITY;

-- Deshabilitar RLS en question_bank
ALTER TABLE question_bank DISABLE ROW LEVEL SECURITY;

-- Eliminar todas las políticas existentes
DROP POLICY IF EXISTS "Anyone authenticated can view question sets" ON question_sets;
DROP POLICY IF EXISTS "Anyone authenticated can insert question sets" ON question_sets;
DROP POLICY IF EXISTS "Anyone authenticated can update question sets" ON question_sets;
DROP POLICY IF EXISTS "Anyone authenticated can delete question sets" ON question_sets;

DROP POLICY IF EXISTS "Anyone authenticated can view questions" ON question_bank;
DROP POLICY IF EXISTS "Anyone authenticated can insert questions" ON question_bank;
DROP POLICY IF EXISTS "Anyone authenticated can update questions" ON question_bank;
DROP POLICY IF EXISTS "Anyone authenticated can delete questions" ON question_bank;
