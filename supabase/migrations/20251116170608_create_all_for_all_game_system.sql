/*
  # All for All Game System

  1. New Tables
    - `all_for_all_games`
      - `id` (uuid, primary key)
      - `teacher_id` (text, references profiles)
      - `is_active` (boolean) - whether game is currently active
      - `word_text` (text) - the word to display (e.g., "ROJO")
      - `word_color` (text) - the color of the text (e.g., "blue")
      - `correct_answer` (text) - what is the correct answer (either "text" or "color")
      - `created_at` (timestamptz)
      - `ended_at` (timestamptz, nullable)
    
    - `all_for_all_responses`
      - `id` (uuid, primary key)
      - `game_id` (uuid, references all_for_all_games)
      - `student_id` (text, references profiles)
      - `button_pressed` (text) - which button was pressed
      - `is_correct` (boolean) - whether the answer was correct
      - `response_time` (timestamptz) - when the button was pressed
      - `rank_position` (integer) - position in ranking (1st, 2nd, etc)
      - `points_awarded` (integer, default 0) - points manually awarded by teacher
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS on both tables
    - Teachers can create and manage their games
    - Students can view active games and submit responses
    - Teachers can view all responses for their games
*/

-- Create all_for_all_games table
CREATE TABLE IF NOT EXISTS all_for_all_games (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  teacher_id text REFERENCES profiles(id) NOT NULL,
  is_active boolean DEFAULT true,
  word_text text NOT NULL,
  word_color text NOT NULL,
  correct_answer text NOT NULL CHECK (correct_answer IN ('text', 'color')),
  created_at timestamptz DEFAULT now(),
  ended_at timestamptz
);

-- Create all_for_all_responses table
CREATE TABLE IF NOT EXISTS all_for_all_responses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  game_id uuid REFERENCES all_for_all_games(id) ON DELETE CASCADE NOT NULL,
  student_id text REFERENCES profiles(id) NOT NULL,
  button_pressed text NOT NULL,
  is_correct boolean DEFAULT false,
  response_time timestamptz DEFAULT now(),
  rank_position integer,
  points_awarded integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  UNIQUE(game_id, student_id)
);

-- Enable RLS
ALTER TABLE all_for_all_games ENABLE ROW LEVEL SECURITY;
ALTER TABLE all_for_all_responses ENABLE ROW LEVEL SECURITY;

-- Policies for all_for_all_games
CREATE POLICY "Teachers can create their own games"
  ON all_for_all_games FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid()::text = teacher_id);

CREATE POLICY "Teachers can view their own games"
  ON all_for_all_games FOR SELECT
  TO authenticated
  USING (auth.uid()::text = teacher_id);

CREATE POLICY "Teachers can update their own games"
  ON all_for_all_games FOR UPDATE
  TO authenticated
  USING (auth.uid()::text = teacher_id)
  WITH CHECK (auth.uid()::text = teacher_id);

CREATE POLICY "Students can view active games"
  ON all_for_all_games FOR SELECT
  TO authenticated
  USING (is_active = true);

-- Policies for all_for_all_responses
CREATE POLICY "Students can create their own responses"
  ON all_for_all_responses FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid()::text = student_id);

CREATE POLICY "Students can view their own responses"
  ON all_for_all_responses FOR SELECT
  TO authenticated
  USING (auth.uid()::text = student_id);

CREATE POLICY "Teachers can view responses for their games"
  ON all_for_all_responses FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM all_for_all_games
      WHERE all_for_all_games.id = all_for_all_responses.game_id
      AND all_for_all_games.teacher_id = auth.uid()::text
    )
  );

CREATE POLICY "Teachers can update responses for their games"
  ON all_for_all_responses FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM all_for_all_games
      WHERE all_for_all_games.id = all_for_all_responses.game_id
      AND all_for_all_games.teacher_id = auth.uid()::text
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM all_for_all_games
      WHERE all_for_all_games.id = all_for_all_responses.game_id
      AND all_for_all_games.teacher_id = auth.uid()::text
    )
  );

-- Create function to auto-assign rank position
CREATE OR REPLACE FUNCTION assign_rank_position()
RETURNS TRIGGER AS $$
BEGIN
  -- Calculate rank based on response_time for this game
  NEW.rank_position := (
    SELECT COUNT(*) + 1
    FROM all_for_all_responses
    WHERE game_id = NEW.game_id
    AND response_time < NEW.response_time
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to auto-assign rank
DROP TRIGGER IF EXISTS set_rank_position ON all_for_all_responses;
CREATE TRIGGER set_rank_position
  BEFORE INSERT ON all_for_all_responses
  FOR EACH ROW
  EXECUTE FUNCTION assign_rank_position();

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_all_for_all_games_active ON all_for_all_games(is_active, teacher_id);
CREATE INDEX IF NOT EXISTS idx_all_for_all_responses_game ON all_for_all_responses(game_id, response_time);
