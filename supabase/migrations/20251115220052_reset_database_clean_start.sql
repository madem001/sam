/*
  # RESET COMPLETO - Base de datos limpia desde cero
  
  1. Eliminar todo
    - Todas las tablas existentes
    
  2. Crear estructura correcta
    - profiles: usuarios (estudiantes y profesores)
    - question_sets: conjuntos de preguntas
    - question_bank: banco de preguntas
    - battles: batallas
    - battle_groups: grupos en batallas
    - battle_questions: preguntas en batallas
    - group_members: estudiantes en grupos
    - battle_answers: respuestas
    - student_professor_points: puntos de profesores
    
  3. Todo con UUID correctamente
*/

-- ELIMINAR TODO
DROP TABLE IF EXISTS battle_answers CASCADE;
DROP TABLE IF EXISTS group_members CASCADE;
DROP TABLE IF EXISTS battle_questions CASCADE;
DROP TABLE IF EXISTS battle_groups CASCADE;
DROP TABLE IF EXISTS battles CASCADE;
DROP TABLE IF EXISTS question_bank CASCADE;
DROP TABLE IF EXISTS question_sets CASCADE;
DROP TABLE IF EXISTS student_professor_points CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;

-- CREAR PROFILES (usuarios)
CREATE TABLE profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text UNIQUE NOT NULL,
  name text NOT NULL,
  role text NOT NULL CHECK (role IN ('STUDENT', 'TEACHER')),
  avatar text,
  points integer DEFAULT 0,
  level integer DEFAULT 1,
  streak integer DEFAULT 0,
  unlock_points integer DEFAULT 100,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- CREAR QUESTION_SETS (conjuntos de preguntas del profesor)
CREATE TABLE question_sets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  teacher_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  set_name text NOT NULL,
  description text,
  created_at timestamptz DEFAULT now()
);

-- CREAR QUESTION_BANK (preguntas del profesor)
CREATE TABLE question_bank (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  teacher_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  set_id uuid REFERENCES question_sets(id) ON DELETE CASCADE,
  question_text text NOT NULL,
  answers text[] NOT NULL CHECK (array_length(answers, 1) = 4),
  correct_answer_index integer NOT NULL CHECK (correct_answer_index >= 0 AND correct_answer_index <= 3),
  category text,
  difficulty text CHECK (difficulty IN ('facil', 'medio', 'dificil')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- CREAR BATTLES (batallas)
CREATE TABLE battles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  teacher_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  question_count integer NOT NULL CHECK (question_count >= 5 AND question_count <= 20),
  battle_code text UNIQUE,
  status text NOT NULL DEFAULT 'waiting' CHECK (status IN ('waiting', 'active', 'finished')),
  current_question_index integer DEFAULT 0,
  current_round_index integer DEFAULT 0,
  round_count integer DEFAULT 10 CHECK (round_count >= 5 AND round_count <= 20),
  students_per_group integer DEFAULT 4 CHECK (students_per_group >= 2 AND students_per_group <= 10),
  created_at timestamptz DEFAULT now(),
  started_at timestamptz,
  finished_at timestamptz
);

-- CREAR BATTLE_GROUPS (grupos en batalla)
CREATE TABLE battle_groups (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  battle_id uuid NOT NULL REFERENCES battles(id) ON DELETE CASCADE,
  group_code text UNIQUE NOT NULL,
  group_name text NOT NULL,
  score integer DEFAULT 0,
  correct_answers integer DEFAULT 0,
  is_full boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- CREAR BATTLE_QUESTIONS (preguntas en batalla)
CREATE TABLE battle_questions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  battle_id uuid NOT NULL REFERENCES battles(id) ON DELETE CASCADE,
  question_text text NOT NULL,
  answers jsonb NOT NULL,
  correct_answer_index integer NOT NULL,
  question_order integer NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- CREAR GROUP_MEMBERS (estudiantes en grupos)
CREATE TABLE group_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id uuid NOT NULL REFERENCES battle_groups(id) ON DELETE CASCADE,
  student_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  student_name text NOT NULL,
  joined_at timestamptz DEFAULT now()
);

-- CREAR BATTLE_ANSWERS (respuestas)
CREATE TABLE battle_answers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  battle_id uuid NOT NULL REFERENCES battles(id) ON DELETE CASCADE,
  group_id uuid NOT NULL REFERENCES battle_groups(id) ON DELETE CASCADE,
  question_id uuid NOT NULL REFERENCES battle_questions(id) ON DELETE CASCADE,
  answer_index integer NOT NULL,
  is_correct boolean NOT NULL,
  response_time_ms integer,
  answered_at timestamptz DEFAULT now()
);

-- CREAR STUDENT_PROFESSOR_POINTS (sistema de puntos de profesores)
CREATE TABLE student_professor_points (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  professor_id uuid NOT NULL,
  points integer DEFAULT 0,
  unlocked boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(student_id, professor_id)
);

-- DESHABILITAR RLS (para simplicidad)
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE question_sets DISABLE ROW LEVEL SECURITY;
ALTER TABLE question_bank DISABLE ROW LEVEL SECURITY;
ALTER TABLE battles DISABLE ROW LEVEL SECURITY;
ALTER TABLE battle_groups DISABLE ROW LEVEL SECURITY;
ALTER TABLE battle_questions DISABLE ROW LEVEL SECURITY;
ALTER TABLE group_members DISABLE ROW LEVEL SECURITY;
ALTER TABLE battle_answers DISABLE ROW LEVEL SECURITY;
ALTER TABLE student_professor_points DISABLE ROW LEVEL SECURITY;

-- CREAR ÍNDICES
CREATE INDEX idx_question_bank_teacher ON question_bank(teacher_id);
CREATE INDEX idx_question_bank_set ON question_bank(set_id);
CREATE INDEX idx_battles_teacher ON battles(teacher_id);
CREATE INDEX idx_battle_groups_battle ON battle_groups(battle_id);
CREATE INDEX idx_battle_questions_battle ON battle_questions(battle_id);
CREATE INDEX idx_group_members_group ON group_members(group_id);
CREATE INDEX idx_battle_answers_battle ON battle_answers(battle_id);
