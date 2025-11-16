/*
  # Sistema de Cartas de Profesores

  1. Nueva Tabla
    - `professor_cards`
      - `id` (uuid, primary key)
      - `teacher_id` (text, referencia a profiles.id)
      - `name` (text) - Nombre del profesor
      - `title` (text) - Título/materia del profesor
      - `description` (text) - Descripción de la carta
      - `image_url` (text) - URL de la imagen del profesor
      - `unlock_points` (integer) - Puntos necesarios para desbloquear
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

    - `student_professor_cards`
      - `id` (uuid, primary key)
      - `student_id` (text, referencia a profiles.id)
      - `card_id` (uuid, referencia a professor_cards)
      - `unlocked` (boolean) - Si está desbloqueada
      - `unlocked_at` (timestamptz) - Cuándo se desbloqueó
      - `created_at` (timestamptz)

  2. Seguridad
    - Enable RLS en ambas tablas
    - Policies para que estudiantes vean todas las cartas
    - Policies para que profesores creen/editen sus propias cartas
    - Policies para que estudiantes vean su progreso de cartas

  3. Triggers
    - Auto-crear carta cuando se registra un profesor
    - Auto-asignar todas las cartas a un nuevo estudiante
    - Auto-asignar nueva carta a todos los estudiantes existentes
*/

-- Tabla de cartas de profesores
CREATE TABLE IF NOT EXISTS professor_cards (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  teacher_id text REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  title text NOT NULL DEFAULT '',
  description text NOT NULL DEFAULT '',
  image_url text,
  unlock_points integer NOT NULL DEFAULT 100,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Tabla de relación estudiante-carta (progreso)
CREATE TABLE IF NOT EXISTS student_professor_cards (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id text REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  card_id uuid REFERENCES professor_cards(id) ON DELETE CASCADE NOT NULL,
  unlocked boolean DEFAULT false,
  unlocked_at timestamptz,
  created_at timestamptz DEFAULT now(),
  UNIQUE(student_id, card_id)
);

-- Índices para mejorar rendimiento
CREATE INDEX IF NOT EXISTS idx_professor_cards_teacher ON professor_cards(teacher_id);
CREATE INDEX IF NOT EXISTS idx_student_cards_student ON student_professor_cards(student_id);
CREATE INDEX IF NOT EXISTS idx_student_cards_card ON student_professor_cards(card_id);

-- RLS
ALTER TABLE professor_cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_professor_cards ENABLE ROW LEVEL SECURITY;

-- Policies para professor_cards
CREATE POLICY "Anyone can view professor cards"
  ON professor_cards FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Teachers can insert their own cards"
  ON professor_cards FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid()::text = teacher_id
    AND EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()::text
      AND profiles.role = 'TEACHER'
    )
  );

CREATE POLICY "Teachers can update their own cards"
  ON professor_cards FOR UPDATE
  TO authenticated
  USING (auth.uid()::text = teacher_id)
  WITH CHECK (auth.uid()::text = teacher_id);

CREATE POLICY "Teachers can delete their own cards"
  ON professor_cards FOR DELETE
  TO authenticated
  USING (auth.uid()::text = teacher_id);

-- Policies para student_professor_cards
CREATE POLICY "Students can view their own card progress"
  ON student_professor_cards FOR SELECT
  TO authenticated
  USING (auth.uid()::text = student_id);

CREATE POLICY "Students can insert their own card progress"
  ON student_professor_cards FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid()::text = student_id);

CREATE POLICY "Students can update their own card progress"
  ON student_professor_cards FOR UPDATE
  TO authenticated
  USING (auth.uid()::text = student_id)
  WITH CHECK (auth.uid()::text = student_id);

-- Función para auto-crear cartas de profesor cuando se registra
CREATE OR REPLACE FUNCTION create_professor_card_on_teacher_register()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.role = 'TEACHER' THEN
    INSERT INTO professor_cards (teacher_id, name, title, description, image_url, unlock_points)
    VALUES (
      NEW.id,
      NEW.name,
      'Profesor',
      'Desbloquea esta carta para acceder a contenido especial',
      NEW.avatar,
      100
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para auto-crear carta cuando se registra un profesor
DROP TRIGGER IF EXISTS on_teacher_register_create_card ON profiles;
CREATE TRIGGER on_teacher_register_create_card
  AFTER INSERT ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION create_professor_card_on_teacher_register();

-- Función para auto-asignar todas las cartas existentes a un nuevo estudiante
CREATE OR REPLACE FUNCTION assign_cards_to_new_student()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.role = 'STUDENT' THEN
    INSERT INTO student_professor_cards (student_id, card_id, unlocked)
    SELECT NEW.id, id, false
    FROM professor_cards;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para auto-asignar cartas a nuevos estudiantes
DROP TRIGGER IF EXISTS on_student_register_assign_cards ON profiles;
CREATE TRIGGER on_student_register_assign_cards
  AFTER INSERT ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION assign_cards_to_new_student();

-- Función para auto-asignar una nueva carta a todos los estudiantes
CREATE OR REPLACE FUNCTION assign_new_card_to_all_students()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO student_professor_cards (student_id, card_id, unlocked)
  SELECT id, NEW.id, false
  FROM profiles
  WHERE role = 'STUDENT';
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para auto-asignar nuevas cartas a todos los estudiantes
DROP TRIGGER IF EXISTS on_new_card_assign_to_students ON professor_cards;
CREATE TRIGGER on_new_card_assign_to_students
  AFTER INSERT ON professor_cards
  FOR EACH ROW
  EXECUTE FUNCTION assign_new_card_to_all_students();
