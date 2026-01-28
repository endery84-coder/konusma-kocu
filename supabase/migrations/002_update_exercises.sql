-- =====================================================
-- MEVCUT EGZERSİZLERİ GÜNCELLE
-- Yeni kolonlara değer ata
-- =====================================================

-- Önce mevcut egzersizlerin kategorilerine göre segment ve özellikleri güncelle

-- Nefes egzersizleri
UPDATE exercises 
SET 
  segments = ARRAY['fluency', 'diction'],
  age_groups = ARRAY['adult', '6-9', '9-12'],
  is_child_friendly = true,
  requires_microphone = false,
  xp_reward = 15,
  supported_languages = ARRAY['tr', 'en', 'ar', 'de', 'fa', 'ru']
WHERE LOWER(category) LIKE '%nefes%' OR LOWER(category) = 'breathing';

-- Akıcılık/Fluency egzersizleri  
UPDATE exercises 
SET 
  segments = ARRAY['fluency'],
  age_groups = ARRAY['adult', '9-12'],
  is_child_friendly = false,
  requires_microphone = true,
  xp_reward = 20,
  supported_languages = ARRAY['tr', 'en', 'ar', 'de', 'fa', 'ru']
WHERE LOWER(category) LIKE '%akıcı%' OR LOWER(category) = 'fluency';

-- Okuma egzersizleri
UPDATE exercises 
SET 
  segments = ARRAY['fluency', 'diction', 'speed_reading'],
  age_groups = ARRAY['adult', '6-9', '9-12'],
  is_child_friendly = true,
  requires_microphone = true,
  xp_reward = 25,
  supported_languages = ARRAY['tr']
WHERE LOWER(category) LIKE '%okuma%' OR LOWER(category) = 'reading';

-- Diksiyon egzersizleri
UPDATE exercises 
SET 
  segments = ARRAY['diction'],
  age_groups = ARRAY['adult'],
  is_child_friendly = false,
  requires_microphone = true,
  xp_reward = 20,
  supported_languages = ARRAY['tr', 'en']
WHERE LOWER(category) LIKE '%diksiyon%' OR LOWER(category) = 'diction';

-- Artikülasyon egzersizleri
UPDATE exercises 
SET 
  segments = ARRAY['diction', 'fluency'],
  age_groups = ARRAY['adult', '4-6', '6-9', '9-12'],
  is_child_friendly = true,
  requires_microphone = true,
  xp_reward = 15,
  supported_languages = ARRAY['tr']
WHERE LOWER(category) LIKE '%artikülasyon%' OR LOWER(category) = 'articulation';

-- Tempo/Ritim egzersizleri
UPDATE exercises 
SET 
  segments = ARRAY['fluency'],
  age_groups = ARRAY['adult', '6-9', '9-12'],
  is_child_friendly = true,
  requires_microphone = false,
  xp_reward = 15,
  supported_languages = ARRAY['tr', 'en', 'ar', 'de', 'fa', 'ru']
WHERE LOWER(category) LIKE '%tempo%' OR LOWER(category) LIKE '%ritim%' OR LOWER(category) = 'rhythm';

-- Genel/Diğer kategoriler için varsayılan
UPDATE exercises 
SET 
  segments = CASE WHEN segments = '{}' THEN ARRAY['fluency'] ELSE segments END,
  age_groups = CASE WHEN age_groups = '{"adult"}' THEN ARRAY['adult'] ELSE age_groups END,
  xp_reward = CASE WHEN xp_reward = 10 THEN 15 ELSE xp_reward END,
  supported_languages = CASE WHEN supported_languages = '{"tr"}' THEN ARRAY['tr'] ELSE supported_languages END
WHERE segments = '{}' OR segments IS NULL;

-- Duration hesaplama (mevcut duration_minutes'tan)
UPDATE exercises 
SET estimated_duration_seconds = duration_minutes * 60
WHERE estimated_duration_seconds IS NULL AND duration_minutes IS NOT NULL;

-- Sort order ayarla (ID sırasına göre)
WITH numbered AS (
  SELECT id, ROW_NUMBER() OVER (ORDER BY created_at, id) as rn
  FROM exercises
)
UPDATE exercises e
SET sort_order = n.rn
FROM numbered n
WHERE e.id = n.id;
