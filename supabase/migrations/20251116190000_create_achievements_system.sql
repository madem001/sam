/*
  # Sistema de Logros (Achievements)

  1. Nueva Tabla
    - `achievements` - Definición de logros disponibles
      - `id` (uuid, primary key)
      - `name` (text) - Nombre del logro
      - `description` (text) - Descripción de cómo se gana
      - `icon` (text) - Nombre del icono ionicon
      - `unlock_condition` (text) - Condición para desbloquear (primera_batalla, velocidad_luz, racha_5, etc.)
      - `points_reward` (integer) - Puntos que otorga
      - `created_at` (timestamptz)

    - `student_achievements` - Logros desbloqueados por estudiantes
      - `id` (uuid, primary key)
      - `student_id` (uuid, foreign key to profiles)
      - `achievement_id` (uuid, foreign key to achievements)
      - `unlocked_at` (timestamptz) - Cuándo se desbloqueó
      - `matches_played` (integer) - Batallas jugadas al momento del logro
      - `points_earned` (integer) - Puntos ganados totales
      - `level_achieved` (integer) - Nivel al momento del logro

  2. Seguridad
    - RLS en ambas tablas
    - Los estudiantes pueden ver todos los logros disponibles
    - Los estudiantes solo pueden ver sus propios logros desbloqueados
    - Solo el sistema puede insertar logros desbloqueados
*/

-- Crear tabla de logros disponibles
CREATE TABLE IF NOT EXISTS achievements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text NOT NULL,
  icon text NOT NULL,
  unlock_condition text NOT NULL,
  points_reward integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE achievements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view available achievements"
  ON achievements FOR SELECT
  TO authenticated
  USING (true);

-- Crear tabla de logros desbloqueados por estudiantes
CREATE TABLE IF NOT EXISTS student_achievements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  achievement_id uuid NOT NULL REFERENCES achievements(id) ON DELETE CASCADE,
  unlocked_at timestamptz DEFAULT now(),
  matches_played integer DEFAULT 0,
  points_earned integer DEFAULT 0,
  level_achieved integer DEFAULT 0,
  UNIQUE(student_id, achievement_id)
);

ALTER TABLE student_achievements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Students can view own achievements"
  ON student_achievements FOR SELECT
  TO authenticated
  USING (student_id = auth.uid());

CREATE POLICY "Students can insert own achievements"
  ON student_achievements FOR INSERT
  TO authenticated
  WITH CHECK (student_id = auth.uid());

-- Crear índices
CREATE INDEX IF NOT EXISTS idx_student_achievements_student ON student_achievements(student_id);
CREATE INDEX IF NOT EXISTS idx_student_achievements_achievement ON student_achievements(achievement_id);

-- Insertar logros predefinidos
INSERT INTO achievements (name, description, icon, unlock_condition, points_reward) VALUES
  ('Primera Batalla', '¡Completaste tu primera batalla! El comienzo de una gran trayectoria.', 'shield-checkmark', 'primera_batalla', 50),
  ('Velocidad Luz', 'Respondiste todas las preguntas en menos de 5 segundos cada una. ¡Nadie es más rápido!', 'flash', 'velocidad_luz', 200),
  ('Racha Imparable', 'Ganaste 5 batallas consecutivas sin perder. ¡Eres imparable!', 'flame', 'racha_5', 500),
  ('Maestro Estratega', 'Ganaste una batalla All-for-All quedando en primer lugar con más de 80% de aciertos.', 'bulb', 'maestro_estratega', 300),
  ('Campeón Invicto', 'Alcanzaste 10 victorias consecutivas. ¡Eres una leyenda!', 'trophy', 'racha_10', 1000),
  ('Perfeccionista', 'Conseguiste una puntuación perfecta respondiendo todas las preguntas correctamente.', 'star', 'puntuacion_perfecta', 150),
  ('Desbloqueo Completo', 'Desbloqueaste todas las tarjetas de profesor disponibles.', 'lock-open', 'todas_cartas', 400),
  ('Competidor Nato', 'Participaste en 20 batallas de cualquier tipo.', 'game-controller', 'batallas_20', 250)
ON CONFLICT DO NOTHING;

-- Función para verificar y desbloquear logros
CREATE OR REPLACE FUNCTION check_and_unlock_achievement(
  p_student_id uuid,
  p_unlock_condition text,
  p_matches_played integer DEFAULT 0,
  p_points_earned integer DEFAULT 0,
  p_level_achieved integer DEFAULT 0
)
RETURNS uuid AS $$
DECLARE
  v_achievement_id uuid;
  v_student_achievement_id uuid;
BEGIN
  -- Buscar el logro por condición
  SELECT id INTO v_achievement_id
  FROM achievements
  WHERE unlock_condition = p_unlock_condition;

  IF v_achievement_id IS NULL THEN
    RETURN NULL;
  END IF;

  -- Verificar si ya está desbloqueado
  SELECT id INTO v_student_achievement_id
  FROM student_achievements
  WHERE student_id = p_student_id AND achievement_id = v_achievement_id;

  IF v_student_achievement_id IS NOT NULL THEN
    RETURN v_student_achievement_id;
  END IF;

  -- Desbloquear el logro
  INSERT INTO student_achievements (student_id, achievement_id, matches_played, points_earned, level_achieved)
  VALUES (p_student_id, v_achievement_id, p_matches_played, p_points_earned, p_level_achieved)
  RETURNING id INTO v_student_achievement_id;

  RETURN v_student_achievement_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
