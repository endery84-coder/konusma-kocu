# KonuşKoç - Proje Durumu ve Özellikler

Bu belge, KonuşKoç projesinin mevcut durumunu, teknoloji yığınını ve uygulanan özellikleri özetlemektedir.

## 1. Teknoloji Yığını

*   **Core Framework**: Next.js 16 (App Router)
*   **Dil**: TypeScript
*   **Styling**: Tailwind CSS
*   **Animasyonlar**: Framer Motion, Lottie (CSS alternative), Canvas Confetti
*   **Backend / Database**: Supabase (Auth & PostgreSQL)
*   **Deployment**: Vercel (Planlanan)
*   **PWA**: Manifest ve ikon desteği mevcut

## 2. Sayfa Yapısı ve Akış

### 1. Karşılama ve Auth (Giriş)
*   **/welcome**:
    *   İlk kez giren kullanıcılar için 4 adımlı premium onboarding carousel.
    *   "Floating Particles" ve gradient animasyonları.
    *   "Ücretsiz Başla" butonu ile konfeti efekti ve Auth sayfasına yönlendirme.
*   **/auth**:
    *   E-posta/Şifre ile Giriş ve Kayıt Ol modları.
    *   Supabase Auth entegrasyonu.
    *   "İlk kez mi geldiniz?" linki ile Welcome turuna dönüş.
*   **/onboarding**:
    *   Kayıt sonrası 5 adımlı detaylı anket.
    *   Hedef belirleme (Akıcılık, Sunum vb.).
    *   Zorluk seçimi.
    *   Kullanıcı tercihleri `user_preferences` tablosuna kaydedilir.

### 2. Ana Uygulama
*   **/ (Home)**:
    *   Kullanıcı paneli (Dashboard).
    *   Günlük alıntı kartı.
    *   "Günlük Hedef" ilerleme çubuğu.
    *   Son/Popüler egzersizlere hızlı erişim.
*   **/exercises**:
    *   Tüm egzersizlerin listesi.
    *   **Filtreleme**: Kategoriye göre (Nefes, Akıcılık, Okuma vb.) tablar.
    *   **Arama**: Başlık ve açıklamada arama.
    *   **Premium Kilit**: Premium olmayan kullanıcılar için kilitli içerik gösterimi.
*   **/exercises/[id]**:
    *   Egzersiz detay sayfası.
    *   Egzersiz süresi, zorluk seviyesi ve puan bilgisi.
    *   Adım adım "Nasıl Yapılır?" talimatları.
    *   "Egzersize Başla" butonu (Premium kontrolü içerir).
    *   Tamamlama sonrası puan ve süre `user_progress` tablosuna işlenir.
*   **/record (Ses Kayıt ve Araçlar)**:
    *   **Ses Kaydedici**: Tarayıcı üzerinden mikrofon erişimi ve kayıt.
    *   **Canlı Dalga Formu (Waveform)**: Kayıt sırasında sesin görselleştirilmesi (`AudioWaveform` bileşeni).
    *   **Okuma Metinleri**: Rastgele pratik metinleri kartı.
    *   **Araçlar (Tools)**:
        *   **DAF (Delayed Auditory Feedback)**: Gecikmeli işitsel geri bildirim (50-300ms ayarlı). Kekemelik terapisi için.
        *   **Metronom**: Ritmik konuşma için ayarlanabilir BPM (40-120). Görsel beat indikatörü.
*   **/progress**:
    *   (Geliştirme aşamasında) Grafiksel ilerleme takibi.
*   **/profile**:
    *   Kullanıcı istatistikleri (Toplam süre, Tamamlanan egzersizler).
    *   Ayarlar (Karanlık Mod, Bildirimler - UI hazır).
    *   Çıkış Yap fonksiyonu.

### 3. Premium
*   **/premium**:
    *   Fiyatlandırma planları ve özellik karşılaştırması.

## 3. Veritabanı Yapısı (Supabase)

*   **users**:
    *   `id` (UUID), `email`, `full_name`, `avatar_url`, `is_premium`, `total_practice_minutes`
*   **exercises**:
    *   `id`, `title`, `description`, `category`, `difficulty`, `duration_minutes`, `instructions`, `icon`, `is_premium`
*   **user_preferences**:
    *   `user_id`, `goals` (array), `challenges` (array), `daily_goal_minutes`, `experience_level`
*   **user_progress**:
    *   `id`, `user_id`, `exercise_id`, `completed_at`, `duration_seconds`, `score`

## 4. Tasarım Sistemi

*   **Tema**: "Ocean" (Okyanus) teması. Teal (`teal-500`) ve Cyan (`cyan-500`) ana renkler.
*   **Karanlık Mod**: `class` stratejisi ile destekleniyor (Slate-900 zemin).
*   **Bileşenler**:
    *   **Glassmorphism**: Kartlarda yarı saydam arka planlar ve blur efektleri.
    *   **Navigasyon**: Mobil uyumlu "Bottom Navigation" barı.
    *   **İkonlar**: `lucide-react` kütüphanesi.

## 5. Sıradaki Geliştirmeler

*   İlerleme sayfasında detaylı grafikler (Recharts entegrasyonu).
*   Ses kayıtlarının buluta (Supabase Storage) kaydedilmesi ve geçmiş kayıtların listelenmesi.
*   Daha fazla oyunlaştırma (Rozetler, Liderlik tablosu).
