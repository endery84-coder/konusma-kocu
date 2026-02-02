---
trigger: api_integration OR fetch_request
---
# API Entegrasyon Kuralı

1. **Mock Data:** Eğer gerçek API hazır değilse, önce TypeScript interface'ini veya JSON şemasını tanımla.
2. **Error Handling:** Her API isteği mutlaka `try-catch` içinde olmalı ve kullanıcıya "dostane" bir hata mesajı dönmeli (bkz: error-mesaji.md).
3. **Loading States:** İstek atılırken UI'da mutlaka bir `isLoading` durumu yönetilmeli.