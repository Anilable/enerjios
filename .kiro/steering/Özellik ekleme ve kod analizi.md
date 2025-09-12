# Özellik Ekleme ve Kod Analizi Kuralları

## Kod Kalitesi ve Analiz

### Otomatik Kod Analizi
- Her dosya kaydedildiğinde kod analizi çalıştırılmalı
- ESLint ve TypeScript hatalarını tespit et ve düzelt
- Kod standartlarına uygunluğu kontrol et
- Performans ve güvenlik açıklarını tespit et

### Import Organizasyonu
- Gereksiz importları otomatik olarak sil
- Importları alfabetik sıraya göre düzenle
- Grup halinde organize et:
  1. External kütüphaneler (React, Next.js, vb.)
  2. Internal modüller (@/ ile başlayanlar)
  3. Relative importlar (./,../ ile başlayanlar)

### Kod Standartları
- TypeScript strict mode kullan
- Consistent naming conventions (camelCase, PascalCase)
- JSDoc yorumları ekle (özellikle public API'ler için)
- Error handling ve type safety kontrolü
- Unused variables ve dead code temizliği

### Özellik Ekleme Süreci
- Yeni özellikler eklerken mevcut kod yapısını bozma
- Component-based architecture'ı koru
- Reusable componentler oluştur
- Performance optimizasyonlarını uygula (React.memo, useMemo, useCallback)

### Kod Okunabilirliği
- Açıklayıcı değişken ve fonksiyon isimleri kullan
- Karmaşık logic'i küçük fonksiyonlara böl
- Consistent indentation ve formatting
- Meaningful comments ve documentation

### Test Coverage
- Yeni özellikler için unit testler ekle
- Critical path'ler için integration testler
- E2E testleri güncelle (gerektiğinde)

### Güvenlik Kontrolleri
- Input validation (Zod schemas)
- SQL injection koruması (Prisma ORM)
- XSS koruması
- Authentication ve authorization kontrolleri