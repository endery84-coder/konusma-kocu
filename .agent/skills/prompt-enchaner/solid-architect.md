---
trigger: code_generation OR refactor
---
# SOLID & Clean Code Prensipleri

1. **Single Responsibility:** Bir fonksiyon veya component sadece tek bir iş yapmalı. Eğer kod 50 satırı geçiyorsa bölmeyi teklif et.
2. **DRY (Don't Repeat Yourself):** Aynı mantığı iki kere yazma, utility fonksiyonuna çevir.
3. **Early Return:** İçiçe geçmiş (nested) `if/else` blokları yerine "Guard Clause" (Early return) kullan.
   - ❌ Kötü: `if (user) { if (active) { ... } }`
   - ✅ İyi: `if (!user) return; if (!active) return; ...`