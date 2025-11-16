/*
  # Sistema de Presencia de Profesores en All for All

  1. Nueva Tabla
    - `teacher_presence`
      - `teacher_id` (text, primary key) - ID del profesor
      - `game_id` (uuid) - ID del juego All for All activo
      - `is_online` (boolean) - Si el profesor está en línea
      - `last_heartbeat` (timestamptz) - Última vez que el profesor envió señal de vida
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Seguridad
    - Enable RLS
    - Los estudiantes pueden leer la presencia de sus profesores
    - Los profesores pueden actualizar su propia presencia

  3. Función automática
    - Marcar como offline si no hay heartbeat en 30 segundos
*/

-- Crear tabla de presencia
CREATE TABLE IF NOT EXISTS teacher_presence (
  teacher_id text PRIMARY KEY,
  game_id uuid REFERENCES all_for_all_games(id) ON DELETE SET NULL,
  is_online boolean DEFAULT false,
  last_heartbeat timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE teacher_presence ENABLE ROW LEVEL SECURITY;

-- Política para que todos puedan leer la presencia
CREATE POLICY "Anyone can read teacher presence"
  ON teacher_presence FOR SELECT
  TO authenticated
  USING (true);

-- Política para que profesores puedan insertar/actualizar su propia presencia
CREATE POLICY "Teachers can upsert own presence"
  ON teacher_presence FOR INSERT
  TO authenticated
  WITH CHECK (teacher_id = auth.uid()::text);

CREATE POLICY "Teachers can update own presence"
  ON teacher_presence FOR UPDATE
  TO authenticated
  USING (teacher_id = auth.uid()::text)
  WITH CHECK (teacher_id = auth.uid()::text);

-- Función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_teacher_presence_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para actualizar timestamp
DROP TRIGGER IF EXISTS update_teacher_presence_timestamp_trigger ON teacher_presence;
CREATE TRIGGER update_teacher_presence_timestamp_trigger
  BEFORE UPDATE ON teacher_presence
  FOR EACH ROW
  EXECUTE FUNCTION update_teacher_presence_timestamp();

-- Habilitar realtime para la tabla
ALTER PUBLICATION supabase_realtime ADD TABLE teacher_presence;
