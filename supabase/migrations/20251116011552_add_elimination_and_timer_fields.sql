/*
  # Add Elimination and Timer System
  
  1. Changes to battle_groups
    - Add `wrong_answers` (integer) - Track incorrect answers
    - Add `is_eliminated` (boolean) - Mark eliminated groups
    
  2. Changes to battles
    - Add `question_time_limit` (integer) - Time limit per question in seconds (default 60)
    - Add `question_started_at` (timestamptz) - When current question started
    
  3. Security
    - No RLS changes needed (tables already have RLS disabled for game flow)
*/

-- Add elimination tracking to battle_groups
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'battle_groups' AND column_name = 'wrong_answers'
  ) THEN
    ALTER TABLE battle_groups ADD COLUMN wrong_answers integer DEFAULT 0;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'battle_groups' AND column_name = 'is_eliminated'
  ) THEN
    ALTER TABLE battle_groups ADD COLUMN is_eliminated boolean DEFAULT false;
  END IF;
END $$;

-- Add timer fields to battles
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'battles' AND column_name = 'question_time_limit'
  ) THEN
    ALTER TABLE battles ADD COLUMN question_time_limit integer DEFAULT 60;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'battles' AND column_name = 'question_started_at'
  ) THEN
    ALTER TABLE battles ADD COLUMN question_started_at timestamptz;
  END IF;
END $$;