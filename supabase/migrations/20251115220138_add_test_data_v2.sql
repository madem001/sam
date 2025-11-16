/*
  # Agregar datos de prueba con usuarios reales
*/

-- Crear perfil para el profesor existente
INSERT INTO profiles (id, email, name, role) 
VALUES ('11111111-1111-1111-1111-111111111111', 'teacher@test.com', 'Profesor Demo', 'TEACHER')
ON CONFLICT (id) DO UPDATE SET role = 'TEACHER', name = 'Profesor Demo';

-- Crear conjuntos de preguntas
INSERT INTO question_sets (id, teacher_id, set_name, description)
VALUES 
  ('33333333-3333-3333-3333-333333333333', '11111111-1111-1111-1111-111111111111', 'Matemáticas Básicas', 'Preguntas de aritmética'),
  ('44444444-4444-4444-4444-444444444444', '11111111-1111-1111-1111-111111111111', 'Historia Mundial', 'Eventos históricos importantes'),
  ('55555555-5555-5555-5555-555555555555', '11111111-1111-1111-1111-111111111111', 'Ciencias Naturales', 'Biología y química básica')
ON CONFLICT (id) DO NOTHING;

-- Crear preguntas para Matemáticas
INSERT INTO question_bank (teacher_id, set_id, question_text, answers, correct_answer_index)
VALUES
  ('11111111-1111-1111-1111-111111111111', '33333333-3333-3333-3333-333333333333', '¿Cuánto es 5 + 7?', ARRAY['10', '11', '12', '13'], 2),
  ('11111111-1111-1111-1111-111111111111', '33333333-3333-3333-3333-333333333333', '¿Cuánto es 8 × 6?', ARRAY['42', '48', '54', '56'], 1),
  ('11111111-1111-1111-1111-111111111111', '33333333-3333-3333-3333-333333333333', '¿Cuánto es 15 - 9?', ARRAY['4', '5', '6', '7'], 2),
  ('11111111-1111-1111-1111-111111111111', '33333333-3333-3333-3333-333333333333', '¿Cuánto es 20 ÷ 4?', ARRAY['4', '5', '6', '7'], 1),
  ('11111111-1111-1111-1111-111111111111', '33333333-3333-3333-3333-333333333333', '¿Cuánto es 3²?', ARRAY['6', '9', '12', '15'], 1);

-- Crear preguntas para Historia
INSERT INTO question_bank (teacher_id, set_id, question_text, answers, correct_answer_index)
VALUES
  ('11111111-1111-1111-1111-111111111111', '44444444-4444-4444-4444-444444444444', '¿En qué año se descubrió América?', ARRAY['1492', '1500', '1520', '1600'], 0),
  ('11111111-1111-1111-1111-111111111111', '44444444-4444-4444-4444-444444444444', '¿Quién pintó la Mona Lisa?', ARRAY['Picasso', 'Da Vinci', 'Van Gogh', 'Dalí'], 1),
  ('11111111-1111-1111-1111-111111111111', '44444444-4444-4444-4444-444444444444', '¿Capital de Francia?', ARRAY['Londres', 'Madrid', 'París', 'Roma'], 2),
  ('11111111-1111-1111-1111-111111111111', '44444444-4444-4444-4444-444444444444', '¿Continente más grande?', ARRAY['África', 'América', 'Asia', 'Europa'], 2),
  ('11111111-1111-1111-1111-111111111111', '44444444-4444-4444-4444-444444444444', '¿Idioma más hablado?', ARRAY['Inglés', 'Español', 'Mandarín', 'Hindi'], 2);

-- Crear preguntas para Ciencias
INSERT INTO question_bank (teacher_id, set_id, question_text, answers, correct_answer_index)
VALUES
  ('11111111-1111-1111-1111-111111111111', '55555555-5555-5555-5555-555555555555', '¿Cuántos planetas hay?', ARRAY['7', '8', '9', '10'], 1),
  ('11111111-1111-1111-1111-111111111111', '55555555-5555-5555-5555-555555555555', '¿Qué gas respiramos?', ARRAY['CO2', 'O2', 'N2', 'H2'], 1),
  ('11111111-1111-1111-1111-111111111111', '55555555-5555-5555-5555-555555555555', '¿Fórmula del agua?', ARRAY['H2O', 'CO2', 'O2', 'NaCl'], 0),
  ('11111111-1111-1111-1111-111111111111', '55555555-5555-5555-5555-555555555555', '¿Animal más grande?', ARRAY['Elefante', 'Ballena azul', 'Jirafa', 'Tiburón'], 1),
  ('11111111-1111-1111-1111-111111111111', '55555555-5555-5555-5555-555555555555', '¿Órgano que bombea sangre?', ARRAY['Pulmón', 'Hígado', 'Corazón', 'Riñón'], 2);
