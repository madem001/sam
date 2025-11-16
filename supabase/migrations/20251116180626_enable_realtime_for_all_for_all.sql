/*
  # Enable Realtime for All for All tables

  1. Changes
    - Enable Realtime replication for all_for_all_games table
    - Enable Realtime replication for all_for_all_responses table
    - This allows students to receive real-time updates when games start/end
    - This allows teachers to see responses in real-time
*/

-- Enable realtime for all_for_all_games
ALTER PUBLICATION supabase_realtime ADD TABLE all_for_all_games;

-- Enable realtime for all_for_all_responses
ALTER PUBLICATION supabase_realtime ADD TABLE all_for_all_responses;