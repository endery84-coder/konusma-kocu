# 🎯 KonuşKoç - Ürün Stratejisi & Yol Haritası

## 📊 Mevcut Durum Analizi

### ✅ Tamamlanan Özellikler
- Çok dilli destek (TR, EN, DE, ES) 
- Nefes egzersizleri (4-7-8 tekniği)
- DAF (Delayed Auditory Feedback)
- RSVP Hızlı Okuma
- Telepromter
- Dil Twisters
- Ses Analizi (WPM, filler words)
- Pitch/Ton Analizi
- Kelime Hazinesi
- Ses Kayıt
- Leaderboard/Sıralama
- PWA & Offline destek
- Konfeti kutlamaları
- Onboarding flow

---

## 🎮 KULLANICI BAĞIMLILIĞI STRATEJİSİ

### 1️⃣ Günlük Döngü (Daily Loop)
```
Sabah Bildirimi → Günlük Hedef → Egzersiz → XP/Streak → Ödül
```

**Kritik Özellikler:**
- [ ] **Günlük Görev Sistemi** - Her gün 3 mini görev
- [ ] **Streak Koruma Öğesi** - "Streak Freeze" (Premium'da 2 hak)
- [ ] **Günün Konuşma Konusu** - AI önerili konuşma pratiği
- [ ] **Progress Ring** - Ana ekranda günlük ilerleme halkası

### 2️⃣ Haftalık Döngü (Weekly Loop)
- [ ] **Haftalık Özet E-postası** - İlerleme raporu
- [ ] **Haftalık Challenge** - Topluluk yarışması  
- [ ] **Yeni İçerik** - Haftalık yeni tongue twisters/metinler

### 3️⃣ Sosyal Öğeler
- [ ] **Başarı Rozetleri** - 15+ rozet
- [ ] **Profil Paylaşımı** - İlerleme kartı oluştur & paylaş
- [ ] **Arkadaş Daveti** - Referral sistemi (+50 XP)

### 4️⃣ Kişiselleştirme
- [ ] **Akıllı Öneriler** - Zayıf alanları tespit, öneri
- [ ] **Seviye Sistemi** - Başlangıç→Uzman (10 seviye)
- [ ] **Kişisel Koç Avatarı** - AI koç karakteri

---

## 💰 MONETIZATION STRATEJİSİ

### Ücretsiz (Free Tier)
| Özellik | Limit |
|---------|-------|
| Günlük egzersiz | 3 adet |
| Nefes egzersizi | ✅ Sınırsız |
| DAF | 5 dk/gün |
| Ses kayıt | 30 sn |
| Leaderboard | Sadece görüntüleme |
| Reklamlar | Banner + Interstitial |

### Premium (Aylık/Yıllık)
| Özellik | Değer |
|---------|-------|
| Sınırsız egzersiz | ✅ |
| Sınırsız DAF | ✅ |
| Sınırsız kayıt + Depolama | ✅ |
| AI Detaylı Analiz | ✅ |
| Streak Freeze | 2 hak/ay |
| Premium Rozetler | ✅ |
| Reklamlar | ❌ Yok |
| Öncelikli destek | ✅ |
| Aile paylaşımı (4 kişi) | ✅ |

### Fiyatlandırma Önerisi

| Pazar | Aylık | Yıllık | Trial |
|-------|-------|--------|-------|
| 🇹🇷 Türkiye | ₺49.99 | ₺349.99 (42% off) | 7 gün |
| 🇺🇸 ABD/Global | $4.99 | $34.99 (42% off) | 7 gün |
| 🇪🇺 Avrupa | €4.49 | €32.99 (39% off) | 7 gün |
| 🇩🇪 Almanya | €4.99 | €34.99 (42% off) | 7 gün |

### Ek Gelir Kanalları
1. **Tek seferlik içerik** - Premium egzersiz paketleri (₺29.99)
2. **Terapi Kurumu Lisansı** - B2B (aylık ₺499+)
3. **White Label** - Hastaneler için özelleştirilmiş versiyon

---

## 🌍 PAZAR & DİL STRATEJİSİ

### Öncelik Sırası

| # | Pazar | Neden | Lansman |
|---|-------|-------|---------|
| 1 | 🇹🇷 Türkiye | Ana pazar, test | Şimdi |
| 2 | 🇩🇪 Almanya | Türk diaspora + Almanca | Ay 2 |
| 3 | 🇺🇸 ABD | En büyük SLP market | Ay 3 |
| 4 | 🇬🇧 İngiltere | İngilizce, NHS ortaklık | Ay 4 |
| 5 | 🇸🇦 Arap dünyası | Düşük rekabet | Ay 5 |

### Dil Öncelikleri
```
✅ Türkçe (tr) - Hazır
✅ İngilizce (en) - Hazır  
✅ Almanca (de) - Hazır
⏳ İspanyolca (es) - Kısmi
🔜 Arapça (ar) - Planlı (RTL gerekli)
🔜 Farsça (fa) - Planlı (RTL gerekli)
```

---

## 📱 BUGÜN GELİŞTİRİLECEKLER (Öncelik Sırası)

### 🔴 Kritik (Bugün)
1. **Günlük Görev Sistemi** - 3 görev + ödül
2. **Premium Paywall** - Limit kontrolü + satın alma ekranı
3. **Başarı Rozetleri** - 10 temel rozet

### 🟡 Önemli (Bugün/Yarın)
4. **Seviye Sistemi** - XP → Seviye dönüşümü
5. **AI Konuşma Koçu** - Basit chat interface
6. **Streak Freeze mekanizması**

### 🟢 Nice-to-have
7. **Haftalık özet e-postası**
8. **Profil paylaşım kartı**
9. **Referral sistemi**

---

## 🛠️ TEKNİK GEREKSİNİMLER

### Yeni Tablolar (Supabase)
- `daily_tasks` - Günlük görevler
- `user_achievements` - Kazanılan rozetler
- `achievements` - Rozet tanımları
- `subscriptions` - Premium abonelikler
- `purchase_history` - Satın alma geçmişi

### Entegrasyonlar
- **RevenueCat** veya **Stripe** - Ödeme
- **OneSignal** - Push notifikasyon
- **Mixpanel/Amplitude** - Analytics
- **Sentry** - Error tracking

---

## 📈 BAŞARI METRİKLERİ (KPIs)

| Metrik | Hedef (Ay 1) | Hedef (Ay 6) |
|--------|--------------|--------------|
| DAU (Günlük Aktif) | 500 | 10,000 |
| D7 Retention | 30% | 45% |
| D30 Retention | 15% | 25% |
| Premium Conversion | 2% | 5% |
| Avg Session | 8 dk | 12 dk |
| NPS Score | 40 | 60 |

---

## 🎬 UYGULAMA PLANI

### Bugün (09:51 - ?)
1. ✅ Strateji planı oluştur
2. 🔄 Günlük görev sistemi
3. 🔄 Başarı/rozet sistemi  
4. 🔄 Premium paywall & limit kontrolü
5. 🔄 Seviye sistemi

### Bu Hafta
- Stripe/RevenueCat entegrasyonu
- Push notification ayarları
- App Store/Play Store hazırlık

### Bu Ay
- Türkiye lansmanı
- Kullanıcı feedback toplama
- A/B test başlatma
