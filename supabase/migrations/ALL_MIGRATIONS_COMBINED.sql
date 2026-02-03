-- ============================================================
-- KONUŞKOÇ - TÜM MİGRATION'LAR (003, 004, 005)
-- Bu dosyayı Supabase Dashboard > SQL Editor'da çalıştırın
-- Date: 2026-02-03
-- ============================================================

-- ============================================================
-- 003: RECORDINGS TABLE
-- ============================================================

CREATE TABLE IF NOT EXISTS recordings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    duration INTEGER NOT NULL DEFAULT 0,
    file_path TEXT NOT NULL,
    exercise_type TEXT,
    score INTEGER,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_recordings_user_id ON recordings(user_id);
CREATE INDEX IF NOT EXISTS idx_recordings_created_at ON recordings(created_at DESC);

ALTER TABLE recordings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own recordings"
    ON recordings FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own recordings"
    ON recordings FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own recordings"
    ON recordings FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own recordings"
    ON recordings FOR DELETE
    USING (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_recordings_updated_at
    BEFORE UPDATE ON recordings
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
-- 004: LEADERBOARD / USER STATS
-- ============================================================

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

CREATE INDEX IF NOT EXISTS idx_user_stats_weekly_xp ON user_stats(weekly_xp DESC);
CREATE INDEX IF NOT EXISTS idx_user_stats_monthly_xp ON user_stats(monthly_xp DESC);
CREATE INDEX IF NOT EXISTS idx_user_stats_total_xp ON user_stats(total_xp DESC);
CREATE INDEX IF NOT EXISTS idx_user_stats_current_streak ON user_stats(current_streak DESC);

ALTER TABLE user_stats ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view user stats"
    ON user_stats FOR SELECT
    USING (true);

CREATE POLICY "Users can insert their own stats"
    ON user_stats FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own stats"
    ON user_stats FOR UPDATE
    USING (auth.uid() = user_id);

CREATE TRIGGER update_user_stats_updated_at
    BEFORE UPDATE ON user_stats
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE OR REPLACE FUNCTION reset_weekly_stats()
RETURNS void AS $$
BEGIN
    UPDATE user_stats SET weekly_xp = 0, weekly_practice_minutes = 0;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION reset_monthly_stats()
RETURNS void AS $$
BEGIN
    UPDATE user_stats SET monthly_xp = 0;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================
-- 005: ACHIEVEMENTS (ROZETLER)
-- ============================================================

CREATE TABLE IF NOT EXISTS achievements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slug TEXT UNIQUE NOT NULL,
    name_tr TEXT NOT NULL,
    name_en TEXT NOT NULL,
    name_de TEXT,
    description_tr TEXT NOT NULL,
    description_en TEXT NOT NULL,
    description_de TEXT,
    icon TEXT NOT NULL,
    category TEXT NOT NULL,
    xp_reward INTEGER DEFAULT 0,
    requirement_type TEXT NOT NULL,
    requirement_value INTEGER DEFAULT 1,
    is_secret BOOLEAN DEFAULT false,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS user_achievements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    achievement_id UUID NOT NULL REFERENCES achievements(id) ON DELETE CASCADE,
    earned_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, achievement_id)
);

CREATE INDEX IF NOT EXISTS idx_user_achievements_user ON user_achievements(user_id);

ALTER TABLE achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_achievements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view achievements" ON achievements FOR SELECT USING (true);
CREATE POLICY "Users can view their achievements" ON user_achievements FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "System can insert achievements" ON user_achievements FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Seed Achievements
INSERT INTO achievements (slug, name_tr, name_en, description_tr, description_en, icon, category, xp_reward, requirement_type, requirement_value, sort_order) VALUES
('streak_3', '3 Gün Serisi', '3 Day Streak', '3 gün üst üste pratik yap', 'Practice 3 days in a row', '🔥', 'streak', 50, 'streak', 3, 1),
('streak_7', 'Haftalık Şampiyon', 'Weekly Champion', '7 gün üst üste pratik yap', 'Practice 7 days in a row', '🏆', 'streak', 100, 'streak', 7, 2),
('streak_30', 'Ay Yıldızı', 'Month Star', '30 gün üst üste pratik yap', 'Practice 30 days in a row', '⭐', 'streak', 500, 'streak', 30, 3),
('streak_100', 'Efsane', 'Legend', '100 gün üst üste pratik yap', 'Practice 100 days in a row', '👑', 'streak', 2000, 'streak', 100, 4),
('first_exercise', 'İlk Adım', 'First Step', 'İlk egzersizini tamamla', 'Complete your first exercise', '🎯', 'exercise', 25, 'count', 1, 10),
('exercises_10', 'Kararlı', 'Determined', '10 egzersiz tamamla', 'Complete 10 exercises', '💪', 'exercise', 100, 'count', 10, 11),
('exercises_50', 'Azimli', 'Persistent', '50 egzersiz tamamla', 'Complete 50 exercises', '🌟', 'exercise', 300, 'count', 50, 12),
('exercises_100', 'Ustalaşıyor', 'Mastering', '100 egzersiz tamamla', 'Complete 100 exercises', '🎖️', 'exercise', 500, 'count', 100, 13),
('exercises_500', 'Usta', 'Master', '500 egzersiz tamamla', 'Complete 500 exercises', '🏅', 'exercise', 2000, 'count', 500, 14),
('time_60', 'İlk Saat', 'First Hour', '60 dakika pratik yap', 'Practice for 60 minutes', '⏱️', 'time', 150, 'time', 60, 20),
('time_300', '5 Saat Pratik', '5 Hours Practice', '300 dakika pratik yap', 'Practice for 300 minutes', '⌛', 'time', 500, 'time', 300, 21),
('time_1000', 'Zamana Bağlı', 'Time Committed', '1000 dakika pratik yap', 'Practice for 1000 minutes', '🕐', 'time', 1500, 'time', 1000, 22),
('early_bird', 'Erken Kuş', 'Early Bird', 'Sabah 7den önce pratik yap', 'Practice before 7 AM', '🐦', 'special', 75, 'special', 1, 30),
('night_owl', 'Gece Kuşu', 'Night Owl', 'Gece 10dan sonra pratik yap', 'Practice after 10 PM', '🦉', 'special', 75, 'special', 1, 31),
('first_share', 'Paylaşımcı', 'Sharer', 'İlerleme kartını paylaş', 'Share your progress card', '📤', 'social', 50, 'count', 1, 40)
ON CONFLICT (slug) DO NOTHING;

-- ============================================================
-- 005: DAILY TASKS (GÜNLÜK GÖREVLER)
-- ============================================================

CREATE TABLE IF NOT EXISTS daily_task_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slug TEXT UNIQUE NOT NULL,
    name_tr TEXT NOT NULL,
    name_en TEXT NOT NULL,
    name_de TEXT,
    description_tr TEXT,
    description_en TEXT,
    description_de TEXT,
    icon TEXT NOT NULL,
    task_type TEXT NOT NULL,
    exercise_type TEXT,
    required_count INTEGER DEFAULT 1,
    xp_reward INTEGER DEFAULT 10,
    is_active BOOLEAN DEFAULT true,
    difficulty TEXT DEFAULT 'easy',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS user_daily_tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    task_template_id UUID NOT NULL REFERENCES daily_task_templates(id),
    assigned_date DATE NOT NULL DEFAULT CURRENT_DATE,
    current_progress INTEGER DEFAULT 0,
    is_completed BOOLEAN DEFAULT false,
    completed_at TIMESTAMPTZ,
    xp_claimed BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, task_template_id, assigned_date)
);

CREATE INDEX IF NOT EXISTS idx_user_daily_tasks_user_date ON user_daily_tasks(user_id, assigned_date);

ALTER TABLE daily_task_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_daily_tasks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view task templates" ON daily_task_templates FOR SELECT USING (true);
CREATE POLICY "Users can view their daily tasks" ON user_daily_tasks FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update their daily tasks" ON user_daily_tasks FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "System can insert daily tasks" ON user_daily_tasks FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Seed Daily Task Templates
INSERT INTO daily_task_templates (slug, name_tr, name_en, icon, task_type, exercise_type, required_count, xp_reward, difficulty) VALUES
('breathing_1', 'Nefes Egzersizi Yap', 'Do Breathing Exercise', '🌬️', 'exercise', 'breathing', 1, 15, 'easy'),
('any_exercise_1', 'Herhangi Bir Egzersiz', 'Any Exercise', '🎯', 'exercise', NULL, 1, 10, 'easy'),
('practice_5min', '5 Dakika Pratik', '5 Minutes Practice', '⏱️', 'time', NULL, 5, 20, 'easy'),
('daf_practice', 'DAF ile Pratik', 'Practice with DAF', '🎧', 'exercise', 'daf', 1, 25, 'medium'),
('rsvp_session', 'Hızlı Okuma Seansı', 'Speed Reading Session', '📖', 'exercise', 'rsvp', 1, 25, 'medium'),
('exercises_3', '3 Farklı Egzersiz', '3 Different Exercises', '🎲', 'exercise', NULL, 3, 40, 'medium'),
('practice_15min', '15 Dakika Pratik', '15 Minutes Practice', '⌛', 'time', NULL, 15, 35, 'medium'),
('perfect_analysis', 'Mükemmel Analiz Skoru', 'Perfect Analysis Score', '🌟', 'special', 'analysis', 1, 50, 'hard'),
('exercises_5', '5 Egzersiz Tamamla', 'Complete 5 Exercises', '🏋️', 'exercise', NULL, 5, 60, 'hard'),
('practice_30min', '30 Dakika Pratik', '30 Minutes Practice', '🔥', 'time', NULL, 30, 75, 'hard')
ON CONFLICT (slug) DO NOTHING;

-- Function: Assign Daily Tasks
CREATE OR REPLACE FUNCTION assign_daily_tasks(p_user_id UUID)
RETURNS void AS $$
DECLARE
    v_easy_task UUID;
    v_medium_task UUID;
    v_hard_task UUID;
BEGIN
    IF EXISTS (
        SELECT 1 FROM user_daily_tasks 
        WHERE user_id = p_user_id AND assigned_date = CURRENT_DATE
    ) THEN
        RETURN;
    END IF;

    SELECT id INTO v_easy_task FROM daily_task_templates 
    WHERE difficulty = 'easy' AND is_active = true 
    ORDER BY RANDOM() LIMIT 1;
    
    SELECT id INTO v_medium_task FROM daily_task_templates 
    WHERE difficulty = 'medium' AND is_active = true 
    ORDER BY RANDOM() LIMIT 1;
    
    SELECT id INTO v_hard_task FROM daily_task_templates 
    WHERE difficulty = 'hard' AND is_active = true 
    ORDER BY RANDOM() LIMIT 1;

    INSERT INTO user_daily_tasks (user_id, task_template_id, assigned_date)
    VALUES 
        (p_user_id, v_easy_task, CURRENT_DATE),
        (p_user_id, v_medium_task, CURRENT_DATE),
        (p_user_id, v_hard_task, CURRENT_DATE)
    ON CONFLICT DO NOTHING;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================
-- 005: SUBSCRIPTIONS (PREMIUM)
-- ============================================================

CREATE TABLE IF NOT EXISTS subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
    plan_type TEXT NOT NULL DEFAULT 'free',
    status TEXT NOT NULL DEFAULT 'active',
    trial_ends_at TIMESTAMPTZ,
    current_period_start TIMESTAMPTZ,
    current_period_end TIMESTAMPTZ,
    cancel_at_period_end BOOLEAN DEFAULT false,
    stripe_customer_id TEXT,
    stripe_subscription_id TEXT,
    streak_freezes_remaining INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_subscriptions_user ON subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON subscriptions(status);

ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their subscription" ON subscriptions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their subscription" ON subscriptions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their subscription" ON subscriptions FOR UPDATE USING (auth.uid() = user_id);

CREATE TRIGGER update_subscriptions_updated_at
    BEFORE UPDATE ON subscriptions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
-- 005: DAILY USAGE (PAYWALL)
-- ============================================================

CREATE TABLE IF NOT EXISTS daily_usage (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    usage_date DATE NOT NULL DEFAULT CURRENT_DATE,
    exercises_completed INTEGER DEFAULT 0,
    daf_minutes_used INTEGER DEFAULT 0,
    recordings_count INTEGER DEFAULT 0,
    recording_seconds_used INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, usage_date)
);

CREATE INDEX IF NOT EXISTS idx_daily_usage_user_date ON daily_usage(user_id, usage_date);

ALTER TABLE daily_usage ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their usage" ON daily_usage FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update their usage" ON daily_usage FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their usage" ON daily_usage FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Function: Check Premium Status
CREATE OR REPLACE FUNCTION is_premium(p_user_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
    v_subscription RECORD;
BEGIN
    SELECT * INTO v_subscription FROM subscriptions
    WHERE user_id = p_user_id AND status IN ('active', 'trial')
    LIMIT 1;
    
    IF v_subscription IS NULL THEN
        RETURN false;
    END IF;
    
    IF v_subscription.status = 'trial' AND v_subscription.trial_ends_at < NOW() THEN
        RETURN false;
    END IF;
    
    IF v_subscription.current_period_end IS NOT NULL AND v_subscription.current_period_end < NOW() THEN
        RETURN false;
    END IF;
    
    RETURN true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================
-- TAMAMLANDI! ✅
-- ============================================================
