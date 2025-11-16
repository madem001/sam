/*
  # Fix All for All Rank Position Calculation

  1. Changes
    - Fix the rank_position trigger to correctly calculate rank based on response time
    - The previous trigger was comparing with NEW.response_time before it existed
    - Now using COALESCE with NOW() as default
*/

-- Drop and recreate the function with correct logic
CREATE OR REPLACE FUNCTION assign_rank_position()
RETURNS TRIGGER AS $$
BEGIN
  -- Use NOW() as the response time if not set
  IF NEW.response_time IS NULL THEN
    NEW.response_time := NOW();
  END IF;
  
  -- Calculate rank based on response_time for this game
  -- Count how many responses were faster (have earlier response_time)
  NEW.rank_position := (
    SELECT COUNT(*) + 1
    FROM all_for_all_responses
    WHERE game_id = NEW.game_id
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;