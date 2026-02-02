-- Migration: Create leaderboard and stats tables
-- Description: Leaderboard system for gamification
-- Date: 2026-02-03

-- User stats table (aggregated data for leaderboard)
CREATE TABLE IF NOT EXISTS user_stats (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
    total_xp INTEGER DEFAULT 0,
    total_practice_minutes INTEGER DEFAULT 0,
    total_exercises_completed INTEGER DEFAULT 0,
    current_streak INTEGER DEFAULT 0,
    longest_streak INTEGER DEFAULT 0,
    weekly_xp INTEGER DEFAULT 0,
    weekly_practice_minutes INTEGER DEFAULT 0,
    monthly_xp INTEGER DEFAULT 0,
    last_practice_date DATE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for leaderboard queries
CREATE INDEX IF NOT EXISTS idx_user_stats_weekly_xp ON user_stats(weekly_xp DESC);
CREATE INDEX IF NOT EXISTS idx_user_stats_monthly_xp ON user_stats(monthly_xp DESC);
CREATE INDEX IF NOT EXISTS idx_user_stats_total_xp ON user_stats(total_xp DESC);
CREATE INDEX IF NOT EXISTS idx_user_stats_current_streak ON user_stats(current_streak DESC);

-- Enable RLS
ALTER TABLE user_stats ENABLE ROW LEVEL SECURITY;

-- RLS Policies - Users can read all stats (for leaderboard) but only update their own
CREATE POLICY "Anyone can view user stats"
    ON user_stats FOR SELECT
    USING (true);

CREATE POLICY "Users can insert their own stats"
    ON user_stats FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own stats"
    ON user_stats FOR UPDATE
    USING (auth.uid() = user_id);

-- Updated_at trigger
CREATE TRIGGER update_user_stats_updated_at
    BEFORE UPDATE ON user_stats
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Function to reset weekly stats (run via cron job or scheduled function)
CREATE OR REPLACE FUNCTION reset_weekly_stats()
RETURNS void AS $$
BEGIN
    UPDATE user_stats SET weekly_xp = 0, weekly_practice_minutes = 0;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to reset monthly stats
CREATE OR REPLACE FUNCTION reset_monthly_stats()
RETURNS void AS $$
BEGIN
    UPDATE user_stats SET monthly_xp = 0;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- View for leaderboard with user info
CREATE OR REPLACE VIEW leaderboard_view AS
SELECT 
    us.user_id,
    u.raw_user_meta_data->>'full_name' as full_name,
    u.raw_user_meta_data->>'avatar_url' as avatar_url,
    us.total_xp,
    us.weekly_xp,
    us.monthly_xp,
    us.current_streak,
    us.total_practice_minutes,
    us.total_exercises_completed,
    RANK() OVER (ORDER BY us.weekly_xp DESC) as weekly_rank,
    RANK() OVER (ORDER BY us.monthly_xp DESC) as monthly_rank,
    RANK() OVER (ORDER BY us.total_xp DESC) as all_time_rank
FROM user_stats us
JOIN auth.users u ON us.user_id = u.id;
