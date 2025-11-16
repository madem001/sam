/*
  # Add Independent Group Progress
  
  1. Changes to battle_groups
    - Add `current_question_index` (integer) - Each group tracks its own progress
    
  2. Logic Changes
    - Groups no longer wait for each other
    - Each group advances at their own pace
    - Groups see only their own current question
*/

-- Add independent progress tracking to battle_groups
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'battle_groups' AND column_name = 'current_question_index'
  ) THEN
    ALTER TABLE battle_groups ADD COLUMN current_question_index integer DEFAULT 0;
  END IF;
END $$;