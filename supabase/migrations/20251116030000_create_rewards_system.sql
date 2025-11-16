/*
  # Create Rewards System for Professor Cards

  1. New Tables
    - `professor_rewards`
      - `id` (uuid, primary key)
      - `teacher_id` (uuid, foreign key to auth.users)
      - `title` (text) - Name of the reward
      - `description` (text) - Description of what the reward is
      - `points_required` (integer) - Points needed to redeem
      - `is_active` (boolean) - Whether reward is available
      - `created_at` (timestamptz)

    - `student_reward_redemptions`
      - `id` (uuid, primary key)
      - `student_id` (uuid, foreign key to auth.users)
      - `reward_id` (uuid, foreign key to professor_rewards)
      - `points_spent` (integer)
      - `redeemed_at` (timestamptz)
      - `status` (text) - 'pending', 'approved', 'completed'

  2. Security
    - Enable RLS on both tables
    - Teachers can manage their own rewards
    - Students can view rewards and redeem them
*/

-- Create professor_rewards table
CREATE TABLE IF NOT EXISTS professor_rewards (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  teacher_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  description text NOT NULL DEFAULT '',
  points_required integer NOT NULL CHECK (points_required > 0),
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- Create student_reward_redemptions table
CREATE TABLE IF NOT EXISTS student_reward_redemptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  reward_id uuid REFERENCES professor_rewards(id) ON DELETE CASCADE NOT NULL,
  teacher_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  points_spent integer NOT NULL,
  redeemed_at timestamptz DEFAULT now(),
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'completed', 'cancelled'))
);

-- Enable RLS
ALTER TABLE professor_rewards ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_reward_redemptions ENABLE ROW LEVEL SECURITY;

-- Policies for professor_rewards
CREATE POLICY "Teachers can view own rewards"
  ON professor_rewards FOR SELECT
  TO authenticated
  USING (auth.uid() = teacher_id);

CREATE POLICY "Teachers can create own rewards"
  ON professor_rewards FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = teacher_id);

CREATE POLICY "Teachers can update own rewards"
  ON professor_rewards FOR UPDATE
  TO authenticated
  USING (auth.uid() = teacher_id)
  WITH CHECK (auth.uid() = teacher_id);

CREATE POLICY "Teachers can delete own rewards"
  ON professor_rewards FOR DELETE
  TO authenticated
  USING (auth.uid() = teacher_id);

CREATE POLICY "Students can view active rewards"
  ON professor_rewards FOR SELECT
  TO authenticated
  USING (is_active = true);

-- Policies for student_reward_redemptions
CREATE POLICY "Students can view own redemptions"
  ON student_reward_redemptions FOR SELECT
  TO authenticated
  USING (auth.uid() = student_id);

CREATE POLICY "Students can create redemptions"
  ON student_reward_redemptions FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = student_id);

CREATE POLICY "Teachers can view redemptions for their rewards"
  ON student_reward_redemptions FOR SELECT
  TO authenticated
  USING (auth.uid() = teacher_id);

CREATE POLICY "Teachers can update redemption status"
  ON student_reward_redemptions FOR UPDATE
  TO authenticated
  USING (auth.uid() = teacher_id)
  WITH CHECK (auth.uid() = teacher_id);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_professor_rewards_teacher ON professor_rewards(teacher_id);
CREATE INDEX IF NOT EXISTS idx_professor_rewards_active ON professor_rewards(is_active);
CREATE INDEX IF NOT EXISTS idx_redemptions_student ON student_reward_redemptions(student_id);
CREATE INDEX IF NOT EXISTS idx_redemptions_teacher ON student_reward_redemptions(teacher_id);
CREATE INDEX IF NOT EXISTS idx_redemptions_reward ON student_reward_redemptions(reward_id);
