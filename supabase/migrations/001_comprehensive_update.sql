-- =====================================================
-- KONUŞKOÇ - KAPSAMLI VERİTABANI GÜNCELLEMESİ
-- Versiyon: 1.0.0
-- =====================================================

-- =====================================================
-- BÖLÜM 1: MEVCUT TABLOLARI GÜNCELLE
-- =====================================================

-- users tablosu güncellemesi
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS total_xp INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS level INTEGER DEFAULT 1,
ADD COLUMN IF NOT EXISTS subscription_type VARCHAR(30) DEFAULT 'free',
ADD COLUMN IF NOT EXISTS subscription_expires_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS subscription_status VARCHAR(20) DEFAULT 'inactive',
ADD COLUMN IF NOT EXISTS stripe_customer_id VARCHAR(255),
ADD COLUMN IF NOT EXISTS preferred_language VARCHAR(10) DEFAULT 'tr',
ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS last_active_at TIMESTAMP WITH TIME ZONE;

-- user_preferences tablosu güncellemesi
ALTER TABLE user_preferences 
ADD COLUMN IF NOT EXISTS user_type VARCHAR(20) DEFAULT 'adult',
ADD COLUMN IF NOT EXISTS segments TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS segment_details JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS native_language VARCHAR(10) DEFAULT 'tr',
ADD COLUMN IF NOT EXISTS interface_language VARCHAR(10) DEFAULT 'tr',
ADD COLUMN IF NOT EXISTS turkish_level VARCHAR(5),
ADD COLUMN IF NOT EXISTS recording_consent BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS recording_retention_days INTEGER DEFAULT 30,
ADD COLUMN IF NOT EXISTS data_processing_consent BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS marketing_consent BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS consent_version VARCHAR(20),
ADD COLUMN IF NOT EXISTS consent_date TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS reminder_time TIME DEFAULT '09:00',
ADD COLUMN IF NOT EXISTS reminder_enabled BOOLEAN DEFAULT TRUE,
ADD COLUMN IF NOT EXISTS show_in_leaderboard BOOLEAN DEFAULT TRUE,
ADD COLUMN IF NOT EXISTS leaderboard_display_name VARCHAR(100),
ADD COLUMN IF NOT EXISTS theme VARCHAR(20) DEFAULT 'system',
ADD COLUMN IF NOT EXISTS haptic_feedback BOOLEAN DEFAULT TRUE,
ADD COLUMN IF NOT EXISTS auto_play_audio BOOLEAN DEFAULT TRUE;

-- exercises tablosu güncellemesi
ALTER TABLE exercises
ADD COLUMN IF NOT EXISTS segments TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS age_groups TEXT[] DEFAULT '{"adult"}',
ADD COLUMN IF NOT EXISTS language_levels TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS supported_languages TEXT[] DEFAULT '{"tr"}',
ADD COLUMN IF NOT EXISTS is_child_friendly BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS requires_microphone BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS requires_camera BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS video_url TEXT,
ADD COLUMN IF NOT EXISTS animation_data JSONB,
ADD COLUMN IF NOT EXISTS xp_reward INTEGER DEFAULT 10,
ADD COLUMN IF NOT EXISTS estimated_duration_seconds INTEGER,
ADD COLUMN IF NOT EXISTS sort_order INTEGER DEFAULT 0;

-- recordings tablosu güncellemesi
ALTER TABLE recordings
ADD COLUMN IF NOT EXISTS analysis_status VARCHAR(20) DEFAULT 'pending',
ADD COLUMN IF NOT EXISTS retention_until TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP WITH TIME ZONE;

-- achievements tablosu güncellemesi (mevcut tabloda title var, name yok)
ALTER TABLE achievements
ADD COLUMN IF NOT EXISTS xp_reward INTEGER DEFAULT 50,
ADD COLUMN IF NOT EXISTS is_secret BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS category VARCHAR(50);

-- =====================================================
-- BÖLÜM 2: YENİ TABLOLAR
-- =====================================================

-- Streak Sistemi
CREATE TABLE IF NOT EXISTS user_streaks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  current_streak INTEGER DEFAULT 0,
  longest_streak INTEGER DEFAULT 0,
  last_activity_date DATE,
  streak_freeze_available INTEGER DEFAULT 0,
  streak_freeze_used_at DATE,
  total_activity_days INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Günlük Aktivite
CREATE TABLE IF NOT EXISTS daily_activity (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  activity_date DATE NOT NULL,
  practice_minutes INTEGER DEFAULT 0,
  exercises_completed INTEGER DEFAULT 0,
  recordings_made INTEGER DEFAULT 0,
  xp_earned INTEGER DEFAULT 0,
  segments_practiced TEXT[] DEFAULT '{}',
  first_activity_at TIMESTAMP WITH TIME ZONE,
  last_activity_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, activity_date)
);

-- Çocuk Profilleri
CREATE TABLE IF NOT EXISTS child_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  birth_date DATE,
  avatar_id VARCHAR(50),
  age_group VARCHAR(20),
  speech_development_level VARCHAR(50),
  special_needs TEXT[],
  daily_limit_minutes INTEGER DEFAULT 30,
  allowed_hours_start TIME DEFAULT '08:00',
  allowed_hours_end TIME DEFAULT '20:00',
  is_active BOOLEAN DEFAULT TRUE,
  total_xp INTEGER DEFAULT 0,
  level INTEGER DEFAULT 1,
  current_streak INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Çocuk İlerleme
CREATE TABLE IF NOT EXISTS child_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  child_id UUID REFERENCES child_profiles(id) ON DELETE CASCADE,
  exercise_id UUID REFERENCES exercises(id) ON DELETE SET NULL,
  completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  duration_seconds INTEGER,
  score INTEGER,
  xp_earned INTEGER DEFAULT 0,
  parent_rating INTEGER,
  parent_note TEXT,
  recording_id UUID REFERENCES recordings(id) ON DELETE SET NULL
);

-- Çocuk Günlük Aktivite
CREATE TABLE IF NOT EXISTS child_daily_activity (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  child_id UUID REFERENCES child_profiles(id) ON DELETE CASCADE,
  activity_date DATE NOT NULL,
  practice_minutes INTEGER DEFAULT 0,
  exercises_completed INTEGER DEFAULT 0,
  xp_earned INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(child_id, activity_date)
);

-- Kullanıcı Onayları (KVKK/GDPR)
CREATE TABLE IF NOT EXISTS user_consents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  consent_type VARCHAR(50) NOT NULL,
  version VARCHAR(20) NOT NULL,
  consented BOOLEAN NOT NULL,
  ip_address INET,
  user_agent TEXT,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Liderlik Tablosu
CREATE TABLE IF NOT EXISTS leaderboard (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  display_name VARCHAR(100),
  avatar_url TEXT,
  country_code VARCHAR(5),
  weekly_xp INTEGER DEFAULT 0,
  monthly_xp INTEGER DEFAULT 0,
  total_xp INTEGER DEFAULT 0,
  weekly_rank INTEGER,
  monthly_rank INTEGER,
  total_rank INTEGER,
  primary_segment VARCHAR(50),
  current_streak INTEGER DEFAULT 0,
  is_visible BOOLEAN DEFAULT TRUE,
  last_activity_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Ses Analiz Sonuçları
CREATE TABLE IF NOT EXISTS recording_analysis (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recording_id UUID REFERENCES recordings(id) ON DELETE CASCADE UNIQUE,
  words_per_minute INTEGER,
  speaking_duration_seconds INTEGER,
  total_duration_seconds INTEGER,
  pause_count INTEGER,
  average_pause_duration_ms INTEGER,
  filler_word_count INTEGER,
  filler_words JSONB,
  clarity_score DECIMAL(5,2),
  fluency_score DECIMAL(5,2),
  pronunciation_score DECIMAL(5,2),
  overall_score DECIMAL(5,2),
  pitch_analysis JSONB,
  volume_analysis JSONB,
  detailed_feedback JSONB,
  ai_suggestions TEXT[],
  analyzed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Okuma Oturumları
CREATE TABLE IF NOT EXISTS reading_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  child_id UUID REFERENCES child_profiles(id) ON DELETE CASCADE,
  text_content TEXT,
  text_id UUID,
  text_word_count INTEGER,
  reading_wpm INTEGER,
  target_wpm INTEGER,
  comprehension_score DECIMAL(5,2),
  comprehension_answers JSONB,
  technique VARCHAR(50),
  duration_seconds INTEGER,
  completed BOOLEAN DEFAULT TRUE,
  xp_earned INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Çeviriler
CREATE TABLE IF NOT EXISTS translations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key VARCHAR(500) NOT NULL,
  language_code VARCHAR(10) NOT NULL,
  value TEXT NOT NULL,
  context VARCHAR(100),
  is_rtl BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(key, language_code)
);

-- Desteklenen Diller
CREATE TABLE IF NOT EXISTS supported_languages (
  code VARCHAR(10) PRIMARY KEY,
  name_native VARCHAR(100) NOT NULL,
  name_english VARCHAR(100) NOT NULL,
  name_turkish VARCHAR(100) NOT NULL,
  is_rtl BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  flag_emoji VARCHAR(10),
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Bildirimler
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  type VARCHAR(50) NOT NULL,
  title VARCHAR(255) NOT NULL,
  title_key VARCHAR(255),
  message TEXT,
  message_key VARCHAR(255),
  message_params JSONB,
  is_read BOOLEAN DEFAULT FALSE,
  read_at TIMESTAMP WITH TIME ZONE,
  action_type VARCHAR(50),
  action_data JSONB,
  priority VARCHAR(20) DEFAULT 'normal',
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Bildirim Tercihleri
CREATE TABLE IF NOT EXISTS notification_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  push_enabled BOOLEAN DEFAULT TRUE,
  email_enabled BOOLEAN DEFAULT FALSE,
  streak_reminders BOOLEAN DEFAULT TRUE,
  achievement_alerts BOOLEAN DEFAULT TRUE,
  weekly_summary BOOLEAN DEFAULT TRUE,
  marketing_notifications BOOLEAN DEFAULT FALSE,
  quiet_hours_start TIME,
  quiet_hours_end TIME,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Abonelik Geçmişi
CREATE TABLE IF NOT EXISTS subscription_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  plan_type VARCHAR(50) NOT NULL,
  status VARCHAR(20) NOT NULL,
  amount_paid DECIMAL(10,2),
  currency VARCHAR(10),
  payment_provider VARCHAR(50),
  provider_subscription_id VARCHAR(255),
  provider_invoice_id VARCHAR(255),
  started_at TIMESTAMP WITH TIME ZONE,
  expires_at TIMESTAMP WITH TIME ZONE,
  cancelled_at TIMESTAMP WITH TIME ZONE,
  cancellation_reason TEXT,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Fiyatlandırma Planları
CREATE TABLE IF NOT EXISTS pricing_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code VARCHAR(50) UNIQUE NOT NULL,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  plan_type VARCHAR(30) NOT NULL,
  billing_period VARCHAR(20) NOT NULL,
  prices JSONB NOT NULL,
  features JSONB,
  limits JSONB,
  stripe_price_ids JSONB,
  is_active BOOLEAN DEFAULT TRUE,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Segmentler
CREATE TABLE IF NOT EXISTS segments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code VARCHAR(50) UNIQUE NOT NULL,
  name_key VARCHAR(100) NOT NULL,
  description_key VARCHAR(100),
  icon VARCHAR(50),
  color VARCHAR(20),
  parent_segment VARCHAR(50),
  is_active BOOLEAN DEFAULT TRUE,
  sort_order INTEGER DEFAULT 0,
  onboarding_questions JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- BÖLÜM 3: VERİ EKLEMELERİ
-- =====================================================

-- Dilleri ekle
INSERT INTO supported_languages (code, name_native, name_english, name_turkish, is_rtl, is_active, flag_emoji, sort_order) VALUES
('tr', 'Türkçe', 'Turkish', 'Türkçe', false, true, '🇹🇷', 1),
('en', 'English', 'English', 'İngilizce', false, true, '🇬🇧', 2),
('ar', 'العربية', 'Arabic', 'Arapça', true, true, '🇸🇦', 3),
('de', 'Deutsch', 'German', 'Almanca', false, true, '🇩🇪', 4),
('fa', 'فارسی', 'Persian', 'Farsça', true, true, '🇮🇷', 5),
('ru', 'Русский', 'Russian', 'Rusça', false, true, '🇷🇺', 6),
('fr', 'Français', 'French', 'Fransızca', false, false, '🇫🇷', 7),
('nl', 'Nederlands', 'Dutch', 'Hollandaca', false, false, '🇳🇱', 8)
ON CONFLICT (code) DO UPDATE SET
  name_native = EXCLUDED.name_native,
  is_active = EXCLUDED.is_active,
  sort_order = EXCLUDED.sort_order;

-- Fiyatlandırma planlarını ekle
INSERT INTO pricing_plans (code, name, plan_type, billing_period, prices, features, limits) VALUES
('individual_monthly', 'Aylık Premium', 'individual', 'monthly', 
  '{"TR": {"amount": 16999, "currency": "TRY"}, "US": {"amount": 1299, "currency": "USD"}, "EU": {"amount": 1199, "currency": "EUR"}, "GB": {"amount": 1099, "currency": "GBP"}, "SA": {"amount": 999, "currency": "USD"}, "RU": {"amount": 89900, "currency": "RUB"}}',
  '["unlimited_exercises", "unlimited_recordings", "ai_analysis", "all_modules", "priority_support"]',
  '{"storage_gb": 5, "recording_days": 90}'
),
('individual_yearly', 'Yıllık Premium', 'individual', 'yearly',
  '{"TR": {"amount": 119999, "currency": "TRY"}, "US": {"amount": 8999, "currency": "USD"}, "EU": {"amount": 8499, "currency": "EUR"}, "GB": {"amount": 7499, "currency": "GBP"}, "SA": {"amount": 6999, "currency": "USD"}, "RU": {"amount": 599900, "currency": "RUB"}}',
  '["unlimited_exercises", "unlimited_recordings", "ai_analysis", "all_modules", "priority_support", "offline_mode"]',
  '{"storage_gb": 10, "recording_days": 365}'
),
('family_yearly', 'Aile Yıllık', 'family', 'yearly',
  '{"TR": {"amount": 179999, "currency": "TRY"}, "US": {"amount": 12999, "currency": "USD"}, "EU": {"amount": 11999, "currency": "EUR"}, "GB": {"amount": 10999, "currency": "GBP"}}',
  '["5_users", "child_mode", "family_dashboard", "all_premium_features"]',
  '{"max_users": 5, "max_children": 4, "storage_gb": 25}'
),
('therapist_monthly', 'Terapist Aylık', 'therapist', 'monthly',
  '{"TR": {"amount": 74999, "currency": "TRY"}, "US": {"amount": 7999, "currency": "USD"}, "EU": {"amount": 7499, "currency": "EUR"}}',
  '["personal_premium", "client_management", "progress_reports", "homework_assignment", "pdf_export"]',
  '{"max_clients": 20, "storage_gb": 50}'
),
('therapist_yearly', 'Terapist Yıllık', 'therapist', 'yearly',
  '{"TR": {"amount": 599999, "currency": "TRY"}, "US": {"amount": 63999, "currency": "USD"}, "EU": {"amount": 59999, "currency": "EUR"}}',
  '["personal_premium", "client_management", "progress_reports", "homework_assignment", "pdf_export", "api_access"]',
  '{"max_clients": 20, "storage_gb": 100}'
),
('school_yearly', 'Okul Yıllık', 'school', 'per_user',
  '{"TR": {"amount": 29999, "currency": "TRY"}, "US": {"amount": 3999, "currency": "USD"}, "EU": {"amount": 3499, "currency": "EUR"}}',
  '["teacher_panel", "class_management", "bulk_reports", "parent_notifications", "school_branding"]',
  '{"min_users": 50, "teachers_included": 5}'
),
('clinic_monthly', 'Klinik Aylık', 'clinic', 'monthly',
  '{"TR": {"amount": 249999, "currency": "TRY"}, "US": {"amount": 29999, "currency": "USD"}, "EU": {"amount": 27999, "currency": "EUR"}}',
  '["multi_therapist", "unlimited_clients", "center_management", "multi_location", "api_access", "white_label_option"]',
  '{"max_therapists": 10, "storage_gb": 500}'
)
ON CONFLICT (code) DO UPDATE SET
  prices = EXCLUDED.prices,
  features = EXCLUDED.features,
  limits = EXCLUDED.limits,
  updated_at = NOW();

-- Segmentleri ekle
INSERT INTO segments (code, name_key, description_key, icon, color, sort_order, onboarding_questions) VALUES
('fluency', 'segment.fluency.name', 'segment.fluency.description', 'waves', 'teal', 1, 
  '[{"key": "fluency_challenges", "type": "multiselect", "options": ["tempo", "rhythm", "breathing", "specific_sounds", "social_situations"]}, {"key": "professional_support", "type": "select", "options": ["yes_regular", "yes_occasional", "past", "no"]}]'
),
('diction', 'segment.diction.name', 'segment.diction.description', 'mic', 'purple', 2,
  '[{"key": "diction_goals", "type": "multiselect", "options": ["articulation", "intonation", "presentation", "broadcasting", "public_speaking"]}]'
),
('speed_reading', 'segment.speed_reading.name', 'segment.speed_reading.description', 'book-open', 'blue', 3,
  '[{"key": "current_wpm", "type": "select", "options": ["unknown", "slow", "medium", "fast"]}, {"key": "reading_goal", "type": "select", "options": ["academic", "professional", "personal", "exam"]}]'
),
('comprehension', 'segment.comprehension.name', 'segment.comprehension.description', 'brain', 'pink', 4,
  '[{"key": "comprehension_areas", "type": "multiselect", "options": ["retention", "analysis", "note_taking", "summarizing"]}]'
),
('turkish_learning', 'segment.turkish_learning.name', 'segment.turkish_learning.description', 'globe', 'orange', 5,
  '[{"key": "turkish_level", "type": "select", "options": ["A0", "A1", "A2", "B1", "B2", "C1", "C2"]}, {"key": "learning_focus", "type": "multiselect", "options": ["pronunciation", "vocabulary", "conversation", "accent"]}]'
),
('child_development', 'segment.child_development.name', 'segment.child_development.description', 'baby', 'green', 6,
  '[{"key": "child_age_group", "type": "select", "options": ["0-2", "2-4", "4-6", "6-9", "9-12"]}, {"key": "development_focus", "type": "multiselect", "options": ["first_words", "vocabulary", "clarity", "fluency", "reading"]}]'
)
ON CONFLICT (code) DO UPDATE SET
  onboarding_questions = EXCLUDED.onboarding_questions,
  sort_order = EXCLUDED.sort_order;

-- Rozetleri ekle (title kullanarak - mevcut tablo yapısına uygun)
INSERT INTO achievements (title, description, icon, requirement_type, requirement_value, xp_reward, category, is_secret) VALUES
('İlk Adım', 'İlk gününü tamamla', '🌱', 'streak_days', 1, 10, 'streak', false),
('Bir Hafta', '7 gün üst üste pratik yap', '🔥', 'streak_days', 7, 50, 'streak', false),
('Bir Ay', '30 gün üst üste pratik yap', '💪', 'streak_days', 30, 200, 'streak', false),
('Üç Ay', '90 gün üst üste pratik yap', '🏆', 'streak_days', 90, 500, 'streak', false),
('Bir Yıl', '365 gün üst üste pratik yap', '👑', 'streak_days', 365, 2000, 'streak', true),
('Başlangıç', 'İlk egzersizini tamamla', '⭐', 'total_exercises', 1, 10, 'exercise', false),
('On Egzersiz', '10 egzersiz tamamla', '🎯', 'total_exercises', 10, 30, 'exercise', false),
('Elli Egzersiz', '50 egzersiz tamamla', '🎖️', 'total_exercises', 50, 100, 'exercise', false),
('Yüz Egzersiz', '100 egzersiz tamamla', '🏅', 'total_exercises', 100, 250, 'exercise', false),
('Beş Yüz Egzersiz', '500 egzersiz tamamla', '🥇', 'total_exercises', 500, 1000, 'exercise', true),
('On Dakika', 'Toplam 10 dakika pratik yap', '⏰', 'total_minutes', 10, 15, 'time', false),
('Bir Saat', 'Toplam 1 saat pratik yap', '⏱️', 'total_minutes', 60, 50, 'time', false),
('Beş Saat', 'Toplam 5 saat pratik yap', '🕐', 'total_minutes', 300, 150, 'time', false),
('On Saat', 'Toplam 10 saat pratik yap', '🕰️', 'total_minutes', 600, 300, 'time', false),
('Ses Kaydı', 'İlk ses kaydını yap', '🎙️', 'total_recordings', 1, 20, 'recording', false),
('On Kayıt', '10 ses kaydı yap', '🎤', 'total_recordings', 10, 50, 'recording', false),
('Seviye 5', 'Seviye 5''e ulaş', '📈', 'level', 5, 100, 'level', false),
('Seviye 10', 'Seviye 10''a ulaş', '📊', 'level', 10, 250, 'level', false),
('Seviye 25', 'Seviye 25''e ulaş', '🚀', 'level', 25, 500, 'level', false)
ON CONFLICT DO NOTHING;

-- =====================================================
-- BÖLÜM 4: İNDEXLER
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_users_subscription ON users(subscription_type, subscription_status);
CREATE INDEX IF NOT EXISTS idx_users_language ON users(preferred_language);
CREATE INDEX IF NOT EXISTS idx_user_prefs_language ON user_preferences(interface_language);
CREATE INDEX IF NOT EXISTS idx_user_prefs_segments ON user_preferences USING GIN(segments);
CREATE INDEX IF NOT EXISTS idx_exercises_segments ON exercises USING GIN(segments);
CREATE INDEX IF NOT EXISTS idx_exercises_age_groups ON exercises USING GIN(age_groups);
CREATE INDEX IF NOT EXISTS idx_exercises_languages ON exercises USING GIN(supported_languages);
CREATE INDEX IF NOT EXISTS idx_child_profiles_parent ON child_profiles(parent_user_id);
CREATE INDEX IF NOT EXISTS idx_child_progress_child ON child_progress(child_id);
CREATE INDEX IF NOT EXISTS idx_child_progress_date ON child_progress(completed_at);
CREATE INDEX IF NOT EXISTS idx_daily_activity_user_date ON daily_activity(user_id, activity_date);
CREATE INDEX IF NOT EXISTS idx_translations_key_lang ON translations(key, language_code);
CREATE INDEX IF NOT EXISTS idx_leaderboard_weekly ON leaderboard(weekly_xp DESC) WHERE is_visible = true;
CREATE INDEX IF NOT EXISTS idx_leaderboard_monthly ON leaderboard(monthly_xp DESC) WHERE is_visible = true;
CREATE INDEX IF NOT EXISTS idx_leaderboard_segment ON leaderboard(primary_segment, weekly_xp DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_user_unread ON notifications(user_id, is_read) WHERE is_read = false;
CREATE INDEX IF NOT EXISTS idx_notifications_user_date ON notifications(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_user_consents_user_type ON user_consents(user_id, consent_type);
CREATE INDEX IF NOT EXISTS idx_recordings_analysis ON recordings(analysis_status) WHERE analysis_status = 'pending';
CREATE INDEX IF NOT EXISTS idx_recordings_retention ON recordings(retention_until) WHERE is_deleted = false;
CREATE INDEX IF NOT EXISTS idx_subscription_history_user ON subscription_history(user_id, created_at DESC);

-- =====================================================
-- BÖLÜM 5: FONKSİYONLAR
-- =====================================================

-- Streak Güncelleme Fonksiyonu
CREATE OR REPLACE FUNCTION update_user_streak(p_user_id UUID)
RETURNS JSONB AS $$
DECLARE
  v_last_date DATE;
  v_current INTEGER;
  v_longest INTEGER;
  v_total INTEGER;
  v_today DATE := CURRENT_DATE;
  v_freeze_available INTEGER;
  v_freeze_used DATE;
BEGIN
  SELECT last_activity_date, current_streak, longest_streak, total_activity_days, 
         streak_freeze_available, streak_freeze_used_at
  INTO v_last_date, v_current, v_longest, v_total, v_freeze_available, v_freeze_used
  FROM user_streaks WHERE user_id = p_user_id;
  
  IF NOT FOUND THEN
    INSERT INTO user_streaks (user_id, current_streak, longest_streak, last_activity_date, total_activity_days)
    VALUES (p_user_id, 1, 1, v_today, 1);
    RETURN jsonb_build_object('streak', 1, 'longest', 1, 'is_new_record', true, 'status', 'new');
  END IF;
  
  IF v_last_date = v_today THEN
    RETURN jsonb_build_object('streak', v_current, 'longest', v_longest, 'is_new_record', false, 'status', 'already_today');
  END IF;
  
  IF v_last_date = v_today - 1 THEN
    v_current := v_current + 1;
  ELSIF v_last_date = v_today - 2 AND v_freeze_available > 0 AND (v_freeze_used IS NULL OR v_freeze_used < v_today - 7) THEN
    v_current := v_current + 1;
    v_freeze_available := v_freeze_available - 1;
    v_freeze_used := v_today;
  ELSE
    v_current := 1;
  END IF;
  
  v_total := COALESCE(v_total, 0) + 1;
  
  IF v_current > COALESCE(v_longest, 0) THEN
    v_longest := v_current;
  END IF;
  
  UPDATE user_streaks
  SET current_streak = v_current, 
      longest_streak = v_longest, 
      last_activity_date = v_today,
      total_activity_days = v_total,
      streak_freeze_available = v_freeze_available,
      streak_freeze_used_at = v_freeze_used,
      updated_at = NOW()
  WHERE user_id = p_user_id;
  
  UPDATE leaderboard SET current_streak = v_current, last_activity_at = NOW() WHERE user_id = p_user_id;
  
  RETURN jsonb_build_object(
    'streak', v_current, 
    'longest', v_longest, 
    'total_days', v_total,
    'is_new_record', v_current = v_longest AND v_current > 1,
    'freeze_used', v_freeze_used = v_today,
    'freeze_remaining', v_freeze_available
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- XP Ekleme Fonksiyonu
CREATE OR REPLACE FUNCTION add_user_xp(p_user_id UUID, p_xp INTEGER, p_source VARCHAR DEFAULT 'exercise')
RETURNS JSONB AS $$
DECLARE
  v_old_xp INTEGER;
  v_new_xp INTEGER;
  v_old_level INTEGER;
  v_new_level INTEGER;
  v_today DATE := CURRENT_DATE;
BEGIN
  SELECT total_xp, level INTO v_old_xp, v_old_level
  FROM users WHERE id = p_user_id;
  
  v_old_xp := COALESCE(v_old_xp, 0);
  v_old_level := COALESCE(v_old_level, 1);
  
  v_new_xp := v_old_xp + p_xp;
  v_new_level := GREATEST(1, FLOOR(1 + SQRT(v_new_xp / 100.0))::INTEGER);
  
  UPDATE users SET total_xp = v_new_xp, level = v_new_level WHERE id = p_user_id;
  
  INSERT INTO daily_activity (user_id, activity_date, xp_earned, last_activity_at)
  VALUES (p_user_id, v_today, p_xp, NOW())
  ON CONFLICT (user_id, activity_date) DO UPDATE SET
    xp_earned = daily_activity.xp_earned + p_xp,
    last_activity_at = NOW();
  
  INSERT INTO leaderboard (user_id, weekly_xp, monthly_xp, total_xp, last_activity_at)
  VALUES (p_user_id, p_xp, p_xp, p_xp, NOW())
  ON CONFLICT (user_id) DO UPDATE SET
    weekly_xp = leaderboard.weekly_xp + p_xp,
    monthly_xp = leaderboard.monthly_xp + p_xp,
    total_xp = leaderboard.total_xp + p_xp,
    last_activity_at = NOW(),
    updated_at = NOW();
  
  IF v_new_level > v_old_level THEN
    INSERT INTO notifications (user_id, type, title_key, message_key, message_params, priority)
    VALUES (p_user_id, 'level_up', 'notification.level_up.title', 'notification.level_up.message', 
            jsonb_build_object('level', v_new_level), 'high');
  END IF;
  
  RETURN jsonb_build_object(
    'old_xp', v_old_xp, 
    'new_xp', v_new_xp,
    'xp_gained', p_xp,
    'old_level', v_old_level, 
    'new_level', v_new_level,
    'level_up', v_new_level > v_old_level,
    'source', p_source
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Egzersiz Tamamlama Fonksiyonu
CREATE OR REPLACE FUNCTION complete_exercise(
  p_user_id UUID, 
  p_exercise_id UUID, 
  p_duration_seconds INTEGER,
  p_score INTEGER DEFAULT NULL,
  p_recording_id UUID DEFAULT NULL
)
RETURNS JSONB AS $$
DECLARE
  v_exercise RECORD;
  v_xp_result JSONB;
  v_streak_result JSONB;
  v_today DATE := CURRENT_DATE;
BEGIN
  SELECT xp_reward, segments INTO v_exercise
  FROM exercises WHERE id = p_exercise_id;
  
  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'exercise_not_found');
  END IF;
  
  INSERT INTO user_progress (user_id, exercise_id, duration_seconds, score, completed_at)
  VALUES (p_user_id, p_exercise_id, p_duration_seconds, p_score, NOW());
  
  v_xp_result := add_user_xp(p_user_id, COALESCE(v_exercise.xp_reward, 10), 'exercise');
  v_streak_result := update_user_streak(p_user_id);
  
  UPDATE daily_activity 
  SET exercises_completed = exercises_completed + 1,
      practice_minutes = practice_minutes + CEIL(p_duration_seconds / 60.0)::INTEGER,
      segments_practiced = array_cat(segments_practiced, v_exercise.segments)
  WHERE user_id = p_user_id AND activity_date = v_today;
  
  UPDATE users 
  SET total_practice_minutes = COALESCE(total_practice_minutes, 0) + CEIL(p_duration_seconds / 60.0)::INTEGER,
      last_active_at = NOW()
  WHERE id = p_user_id;
  
  RETURN jsonb_build_object(
    'success', true,
    'xp', v_xp_result,
    'streak', v_streak_result,
    'duration_minutes', CEIL(p_duration_seconds / 60.0)::INTEGER
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Rozet Kontrol Fonksiyonu
CREATE OR REPLACE FUNCTION check_and_award_achievements(p_user_id UUID)
RETURNS JSONB AS $$
DECLARE
  v_achievement RECORD;
  v_user_stats RECORD;
  v_new_achievements JSONB[] := '{}';
  v_met BOOLEAN;
BEGIN
  SELECT 
    u.total_practice_minutes,
    u.total_xp,
    u.level,
    (SELECT current_streak FROM user_streaks WHERE user_id = p_user_id) as current_streak,
    (SELECT longest_streak FROM user_streaks WHERE user_id = p_user_id) as longest_streak,
    (SELECT COUNT(*) FROM user_progress WHERE user_id = p_user_id) as total_exercises,
    (SELECT COUNT(*) FROM recordings WHERE user_id = p_user_id AND is_deleted = false) as total_recordings
  INTO v_user_stats
  FROM users u WHERE u.id = p_user_id;
  
  FOR v_achievement IN 
    SELECT a.* FROM achievements a
    WHERE NOT EXISTS (
      SELECT 1 FROM user_achievements ua 
      WHERE ua.achievement_id = a.id AND ua.user_id = p_user_id
    )
    AND (a.is_secret = false OR a.is_secret IS NULL)
  LOOP
    v_met := FALSE;
    
    CASE v_achievement.requirement_type
      WHEN 'streak_days' THEN v_met := COALESCE(v_user_stats.current_streak, 0) >= v_achievement.requirement_value;
      WHEN 'longest_streak' THEN v_met := COALESCE(v_user_stats.longest_streak, 0) >= v_achievement.requirement_value;
      WHEN 'total_exercises' THEN v_met := COALESCE(v_user_stats.total_exercises, 0) >= v_achievement.requirement_value;
      WHEN 'total_minutes' THEN v_met := COALESCE(v_user_stats.total_practice_minutes, 0) >= v_achievement.requirement_value;
      WHEN 'total_recordings' THEN v_met := COALESCE(v_user_stats.total_recordings, 0) >= v_achievement.requirement_value;
      WHEN 'total_xp' THEN v_met := COALESCE(v_user_stats.total_xp, 0) >= v_achievement.requirement_value;
      WHEN 'level' THEN v_met := COALESCE(v_user_stats.level, 1) >= v_achievement.requirement_value;
      ELSE v_met := FALSE;
    END CASE;
    
    IF v_met THEN
      INSERT INTO user_achievements (user_id, achievement_id)
      VALUES (p_user_id, v_achievement.id)
      ON CONFLICT DO NOTHING;
      
      IF v_achievement.xp_reward > 0 THEN
        PERFORM add_user_xp(p_user_id, v_achievement.xp_reward, 'achievement');
      END IF;
      
      INSERT INTO notifications (user_id, type, title_key, message_key, message_params, priority)
      VALUES (p_user_id, 'achievement', 'notification.achievement.title', 'notification.achievement.message',
              jsonb_build_object('name', v_achievement.title, 'icon', v_achievement.icon), 'high');
      
      v_new_achievements := array_append(v_new_achievements, to_jsonb(v_achievement));
    END IF;
  END LOOP;
  
  RETURN jsonb_build_object('new_achievements', v_new_achievements, 'count', array_length(v_new_achievements, 1));
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Haftalık Leaderboard Sıfırlama
CREATE OR REPLACE FUNCTION reset_weekly_leaderboard()
RETURNS void AS $$
BEGIN
  UPDATE leaderboard SET weekly_xp = 0, weekly_rank = NULL, updated_at = NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Aylık Leaderboard Sıfırlama
CREATE OR REPLACE FUNCTION reset_monthly_leaderboard()
RETURNS void AS $$
BEGIN
  UPDATE leaderboard SET monthly_xp = 0, monthly_rank = NULL, updated_at = NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Leaderboard Sıralama Güncelleme
CREATE OR REPLACE FUNCTION update_leaderboard_ranks()
RETURNS void AS $$
BEGIN
  WITH ranked AS (
    SELECT user_id, ROW_NUMBER() OVER (ORDER BY weekly_xp DESC) as rank
    FROM leaderboard WHERE is_visible = true AND weekly_xp > 0
  )
  UPDATE leaderboard l SET weekly_rank = r.rank
  FROM ranked r WHERE l.user_id = r.user_id;
  
  WITH ranked AS (
    SELECT user_id, ROW_NUMBER() OVER (ORDER BY monthly_xp DESC) as rank
    FROM leaderboard WHERE is_visible = true AND monthly_xp > 0
  )
  UPDATE leaderboard l SET monthly_rank = r.rank
  FROM ranked r WHERE l.user_id = r.user_id;
  
  WITH ranked AS (
    SELECT user_id, ROW_NUMBER() OVER (ORDER BY total_xp DESC) as rank
    FROM leaderboard WHERE is_visible = true
  )
  UPDATE leaderboard l SET total_rank = r.rank
  FROM ranked r WHERE l.user_id = r.user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Eski Kayıtları Temizle
CREATE OR REPLACE FUNCTION cleanup_expired_recordings()
RETURNS INTEGER AS $$
DECLARE
  v_count INTEGER;
BEGIN
  UPDATE recordings 
  SET is_deleted = true, deleted_at = NOW()
  WHERE retention_until < NOW() AND is_deleted = false;
  
  GET DIAGNOSTICS v_count = ROW_COUNT;
  RETURN v_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- BÖLÜM 6: ROW LEVEL SECURITY
-- =====================================================

-- User Streaks
ALTER TABLE user_streaks ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users own streaks" ON user_streaks;
CREATE POLICY "Users own streaks" ON user_streaks FOR ALL USING (auth.uid() = user_id);

-- Daily Activity
ALTER TABLE daily_activity ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users own activity" ON daily_activity;
CREATE POLICY "Users own activity" ON daily_activity FOR ALL USING (auth.uid() = user_id);

-- Child Profiles
ALTER TABLE child_profiles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Parents own children" ON child_profiles;
CREATE POLICY "Parents own children" ON child_profiles FOR ALL USING (auth.uid() = parent_user_id);

-- Child Progress
ALTER TABLE child_progress ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Parents see child progress" ON child_progress;
CREATE POLICY "Parents see child progress" ON child_progress FOR ALL 
  USING (EXISTS (SELECT 1 FROM child_profiles WHERE id = child_id AND parent_user_id = auth.uid()));

-- Child Daily Activity
ALTER TABLE child_daily_activity ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Parents see child activity" ON child_daily_activity;
CREATE POLICY "Parents see child activity" ON child_daily_activity FOR ALL 
  USING (EXISTS (SELECT 1 FROM child_profiles WHERE id = child_id AND parent_user_id = auth.uid()));

-- User Consents
ALTER TABLE user_consents ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users own consents" ON user_consents;
CREATE POLICY "Users own consents" ON user_consents FOR ALL USING (auth.uid() = user_id);

-- Notifications
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users own notifications" ON notifications;
CREATE POLICY "Users own notifications" ON notifications FOR ALL USING (auth.uid() = user_id);

-- Notification Preferences
ALTER TABLE notification_preferences ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users own notification prefs" ON notification_preferences;
CREATE POLICY "Users own notification prefs" ON notification_preferences FOR ALL USING (auth.uid() = user_id);

-- Leaderboard
ALTER TABLE leaderboard ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Leaderboard public read" ON leaderboard;
DROP POLICY IF EXISTS "Users update own leaderboard" ON leaderboard;
DROP POLICY IF EXISTS "Users insert own leaderboard" ON leaderboard;
CREATE POLICY "Leaderboard public read" ON leaderboard FOR SELECT USING (is_visible = true);
CREATE POLICY "Users update own leaderboard" ON leaderboard FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users insert own leaderboard" ON leaderboard FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Recording Analysis
ALTER TABLE recording_analysis ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users see own analysis" ON recording_analysis;
CREATE POLICY "Users see own analysis" ON recording_analysis FOR ALL 
  USING (EXISTS (SELECT 1 FROM recordings WHERE id = recording_id AND user_id = auth.uid()));

-- Reading Sessions
ALTER TABLE reading_sessions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users own reading sessions" ON reading_sessions;
CREATE POLICY "Users own reading sessions" ON reading_sessions FOR ALL USING (auth.uid() = user_id);

-- Subscription History
ALTER TABLE subscription_history ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users see own subscriptions" ON subscription_history;
CREATE POLICY "Users see own subscriptions" ON subscription_history FOR SELECT USING (auth.uid() = user_id);

-- Translations (public read)
ALTER TABLE translations ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Translations public read" ON translations;
CREATE POLICY "Translations public read" ON translations FOR SELECT USING (true);

-- Supported Languages (public read)
ALTER TABLE supported_languages ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Languages public read" ON supported_languages;
CREATE POLICY "Languages public read" ON supported_languages FOR SELECT USING (true);

-- Pricing Plans (public read)
ALTER TABLE pricing_plans ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Pricing public read" ON pricing_plans;
CREATE POLICY "Pricing public read" ON pricing_plans FOR SELECT USING (is_active = true);

-- Segments (public read)
ALTER TABLE segments ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Segments public read" ON segments;
CREATE POLICY "Segments public read" ON segments FOR SELECT USING (is_active = true);
