/*
  # Sistema de puntos por profesor

  1. Cambios
    - Agregar tabla `student_professor_points` para puntos ganados con cada profesor
    - Agregar campo `unlock_points` a profiles para configurar desbloqueo
    - Cada estudiante acumula puntos separados por cada profesor
    - Las tarjetas se desbloquean al alcanzar los puntos requeridos

  2. Nueva Tabla
    - `student_professor_points`: id, student_id, professor_id, points, unlocked
    
  3. Seguridad
    - RLS en la nueva tabla
    - Students pueden ver sus propios puntos
    - Professors pueden ver puntos de sus estudiantes
*/

-- Agregar campo unlock_points a profiles
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'unlock_points'
  ) THEN
    ALTER TABLE profiles ADD COLUMN unlock_points integer DEFAULT 100;
  END IF;
END $$;

-- Crear tabla de puntos por estudiante-profesor
CREATE TABLE IF NOT EXISTS student_professor_points (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid NOT NULL,
  professor_id uuid NOT NULL,
  points integer DEFAULT 0,
  unlocked boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(student_id, professor_id)
);

ALTER TABLE student_professor_points ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Students can view own professor points"
  ON student_professor_points FOR SELECT
  TO authenticated
  USING (student_id = auth.uid());

CREATE POLICY "Students can insert own professor points"
  ON student_professor_points FOR INSERT
  TO authenticated
  WITH CHECK (student_id = auth.uid());

CREATE POLICY "Students can update own professor points"
  ON student_professor_points FOR UPDATE
  TO authenticated
  USING (student_id = auth.uid())
  WITH CHECK (student_id = auth.uid());

CREATE POLICY "Professors can view their students points"
  ON student_professor_points FOR SELECT
  TO authenticated
  USING (professor_id = auth.uid());

CREATE POLICY "Professors can update their students points"
  ON student_professor_points FOR UPDATE
  TO authenticated
  USING (professor_id = auth.uid())
  WITH CHECK (professor_id = auth.uid());

-- Crear índices para búsquedas rápidas
CREATE INDEX IF NOT EXISTS idx_student_professor_points_student ON student_professor_points(student_id);
CREATE INDEX IF NOT EXISTS idx_student_professor_points_professor ON student_professor_points(professor_id);

-- Función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_student_professor_points_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  IF NEW.points >= (SELECT unlock_points FROM profiles WHERE id = NEW.professor_id) THEN
    NEW.unlocked = true;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_student_professor_points_updated_at
  BEFORE UPDATE ON student_professor_points
  FOR EACH ROW
  EXECUTE FUNCTION update_student_professor_points_updated_at();
