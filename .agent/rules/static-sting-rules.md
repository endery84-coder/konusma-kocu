---
trigger: always_on
description: Magic Number ve Magic String Yönetimi
---

# Sabit Değer (Constant) Kuralları

1. **Magic Number/String Yasağı:**
   - Kodun içinde anlamsız sayılar (örn: `86400`) veya tekrar eden stringler (örn: `"admin"`) ham halde bulunmamalıdır.

2. **Çözüm Yöntemi:**
   - Bu değerleri açıklayıcı isme sahip `const` değişkenlere veya `enum` yapılarına taşı.
   - Örnek: 
     - ❌ `if (status === 2)` 
     - ✅ `if (status === OrderStatus.COMPLETED)`

3. **İstisna:**
   - Döngü sayaçları (i=0) veya matematiksel formüllerdeki (pi, 0, 1) temel sabitler hariçtir.