---
trigger: always_on
---
# Güvenlik Kontrolleri

1. **Input Validation:** Kullanıcıdan gelen her veri (form, query params) doğrulanmalı/temizlenmelidir (Sanitization).
2. **SQL Injection:** SQL sorgularında asla string birleştirme yapma, parametreli sorgular (ORM veya prepared statements) kullan.
3. **Secrets:** Kod içerisine asla API Key, Token veya Şifre gömme. Bunları `.env` dosyasından okuyacak şekilde kurgula.