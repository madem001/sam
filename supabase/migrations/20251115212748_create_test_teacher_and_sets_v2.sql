/*
  # Crear usuario teacher de prueba y sets de preguntas
  
  1. Crear usuario teacher
    - Email: teacher@test.com
    - Password: teacher123
    
  2. Crear sets de preguntas de prueba
    - Matemáticas Básicas (5 preguntas)
    - Historia Mundial (5 preguntas)
*/

DO $$
DECLARE
  teacher_user_id uuid := '11111111-1111-1111-1111-111111111111';
  set1_id uuid := '22222222-2222-2222-2222-222222222222';
  set2_id uuid := '33333333-3333-3333-3333-333333333333';
BEGIN
  -- Insertar en auth.users si no existe
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'teacher@test.com') THEN
    INSERT INTO auth.users (
      id,
      instance_id,
      email,
      encrypted_password,
      email_confirmed_at,
      created_at,
      updated_at,
      raw_app_meta_data,
      raw_user_meta_data,
      aud,
      role
    ) VALUES (
      teacher_user_id,
      '00000000-0000-0000-0000-000000000000',
      'teacher@test.com',
      crypt('teacher123', gen_salt('bf')),
      now(),
      now(),
      now(),
      '{"provider":"email","providers":["email"]}',
      '{"name":"Profesor Demo"}',
      'authenticated',
      'authenticated'
    );
  END IF;
  
  -- Insertar perfil si no existe
  IF NOT EXISTS (SELECT 1 FROM profiles WHERE id = teacher_user_id) THEN
    INSERT INTO profiles (id, email, name, role, points, level)
    VALUES (teacher_user_id, 'teacher@test.com', 'Profesor Demo', 'TEACHER', 0, 1);
  END IF;
  
  -- Crear Set 1: Matemáticas Básicas
  IF NOT EXISTS (SELECT 1 FROM question_sets WHERE id = set1_id) THEN
    INSERT INTO question_sets (id, teacher_id, set_name, description)
    VALUES (
      set1_id,
      teacher_user_id,
      'Matemáticas Básicas',
      'Preguntas básicas de aritmética y álgebra'
    );
    
    -- Insertar preguntas del Set 1
    INSERT INTO question_bank (teacher_id, set_id, question_text, answers, correct_answer_index) VALUES
      (teacher_user_id, set1_id, '¿Cuánto es 5 + 7?', ARRAY['10', '11', '12', '13'], 2),
      (teacher_user_id, set1_id, '¿Cuánto es 8 × 6?', ARRAY['42', '48', '54', '56'], 1),
      (teacher_user_id, set1_id, '¿Cuánto es 15 - 9?', ARRAY['4', '5', '6', '7'], 2),
      (teacher_user_id, set1_id, '¿Cuánto es 36 ÷ 6?', ARRAY['4', '5', '6', '7'], 2),
      (teacher_user_id, set1_id, '¿Cuánto es 2³?', ARRAY['6', '8', '9', '12'], 1);
  END IF;
  
  -- Crear Set 2: Historia Mundial
  IF NOT EXISTS (SELECT 1 FROM question_sets WHERE id = set2_id) THEN
    INSERT INTO question_sets (id, teacher_id, set_name, description)
    VALUES (
      set2_id,
      teacher_user_id,
      'Historia Mundial',
      'Eventos importantes de la historia'
    );
    
    -- Insertar preguntas del Set 2
    INSERT INTO question_bank (teacher_id, set_id, question_text, answers, correct_answer_index) VALUES
      (teacher_user_id, set2_id, '¿En qué año llegó Colón a América?', ARRAY['1492', '1500', '1520', '1550'], 0),
      (teacher_user_id, set2_id, '¿Quién pintó la Mona Lisa?', ARRAY['Picasso', 'Da Vinci', 'Van Gogh', 'Rembrandt'], 1),
      (teacher_user_id, set2_id, '¿En qué país se inventó la imprenta?', ARRAY['Italia', 'Francia', 'Alemania', 'España'], 2),
      (teacher_user_id, set2_id, '¿Cuál fue la primera civilización?', ARRAY['Romana', 'Griega', 'Egipcia', 'Sumeria'], 3),
      (teacher_user_id, set2_id, '¿En qué año cayó el Muro de Berlín?', ARRAY['1987', '1988', '1989', '1990'], 2);
  END IF;
END $$;
