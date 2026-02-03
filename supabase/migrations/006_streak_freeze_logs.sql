-- Migration: Streak Freeze Logs Table
-- Description: Track when users use their streak freezes
-- Date: 2026-02-03

-- Streak freeze usage logs
CREATE TABLE IF NOT EXISTS streak_freeze_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    used_date DATE NOT NULL DEFAULT CURRENT_DATE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, used_date)
);

CREATE INDEX IF NOT EXISTS idx_streak_freeze_user_date ON streak_freeze_logs(user_id, used_date);

ALTER TABLE streak_freeze_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their freeze logs" 
    ON streak_freeze_logs FOR SELECT 
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their freeze logs" 
    ON streak_freeze_logs FOR INSERT 
    WITH CHECK (auth.uid() = user_id);

-- Function to automatically restore freezes monthly (for premium users)
CREATE OR REPLACE FUNCTION restore_monthly_freezes()
RETURNS void AS $$
BEGIN
    UPDATE subscriptions 
    SET streak_freezes_remaining = 2
    WHERE plan_type IN ('monthly', 'yearly') 
    AND status = 'active';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check and break streak if needed (run daily via cron)
CREATE OR REPLACE FUNCTION check_and_break_streaks()
RETURNS void AS $$
DECLARE
    yesterday DATE := CURRENT_DATE - INTERVAL '1 day';
    two_days_ago DATE := CURRENT_DATE - INTERVAL '2 days';
BEGIN
    -- Break streaks for users who:
    -- 1. Haven't practiced in 2+ days
    -- 2. Haven't used a freeze yesterday
    UPDATE user_stats us
    SET current_streak = 0
    WHERE us.last_practice_date < two_days_ago
    AND NOT EXISTS (
        SELECT 1 FROM streak_freeze_logs sfl 
        WHERE sfl.user_id = us.user_id 
        AND sfl.used_date = yesterday
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

SELECT 'Streak freeze logs table created!' as status;
