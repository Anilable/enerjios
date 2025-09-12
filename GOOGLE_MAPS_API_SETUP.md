# Google Maps API Kurulum Rehberi

## Mevcut Durum
Designer sayfasında Google Maps API RefererNotAllowedMapError hatası alınmaktadır.

**Hata:** "Bu sayfa Google Haritalar'ı doğru şekilde yükleyemedi"
**URL:** http://localhost:3004/dashboard/designer (Port numarası dinamik olarak değişebilir)

## Çözüm Adımları

### 1. Google Cloud Console'da API Konfigürasyonu

1. [Google Cloud Console](https://console.cloud.google.com/) giriş yapın
2. Projenizi seçin veya yeni bir proje oluşturun
3. **APIs & Services** > **Credentials** bölümüne gidin
4. Mevcut API anahtarınızı bulun veya **+ CREATE CREDENTIALS** > **API key** ile yeni bir tane oluşturun

### 2. API Kısıtlamalarını Güncelleme

#### Application Restrictions:
1. API anahtarını seçin ve düzenleyin
2. **Application restrictions** bölümünde **HTTP referrers (web sites)** seçin
3. **Website restrictions** kısmına şunları ekleyin:
   ```
   localhost:*/*
   http://localhost:*/*
   https://localhost:*/*
   127.0.0.1:*/*
   http://127.0.0.1:*/*
   https://127.0.0.1:*/*
   localhost:3000/*
   localhost:3002/*
   localhost:3004/*
   http://localhost:3000/*
   http://localhost:3002/*
   http://localhost:3004/*
   ```

#### API Restrictions:
1. **API restrictions** bölümünde **Restrict key** seçin
2. Şu API'lerin etkin olduğundan emin olun:
   - Maps JavaScript API
   - Places API
   - Geocoding API (opsiyonel, adres arama için)

### 3. Gerekli API'leri Etkinleştirme

1. **APIs & Services** > **Library** bölümüne gidin
2. Aşağıdaki API'leri arayın ve etkinleştirin:
   - **Maps JavaScript API** - Temel harita görüntüleme
   - **Places API** - Adres arama özelliği
   - **Geocoding API** - Koordinat ↔ adres dönüşümü

### 4. Fatura Bilgileri

Google Maps API ücretli bir servistir. Kullanım için:
1. **Billing** bölümünden kredi kartı bilgilerinizi ekleyin
2. Günlük kullanım limitlerini ayarlayın
3. Geliştirme için aylık $200 ücretsiz kredi mevcuttur

### 5. Ortam Değişkeni Güncelleme

`.env.local` dosyasında API anahtarının doğru olduğundan emin olun:
```bash
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=AIzaSy...
```

## Alternatif Çözüm: Manual Input

API kurulumu yapılamıyorsa, kod artık aşağıdaki fallback özelliklerini destekler:

1. **API Hata Yönetimi**: API yüklenemediğinde kullanıcı dostu hata mesajı
2. **Manuel Koordinat Girişi**: Enlem/boylam manuel olarak girilebilir
3. **Çatı Alanı Hesabı**: Harita olmadan da çatı alanı girilebilir
4. **Tasarım Devam Etme**: Harita olmadan da tasarım süreci devam edebilir

## Test Etme

1. Tarayıcının geliştirici araçlarını açın (F12)
2. Console sekmesinde hata mesajlarını kontrol edin
3. Network sekmesinde Maps API çağrılarını izleyin
4. `/dashboard/designer` sayfasını yeniden yükleyin

## Yaygın Sorunlar ve Çözümler

### "RefererNotAllowedMapError"
- **Sebep**: URL kısıtlamaları yanlış yapılandırılmış
- **Çözüm**: Application restrictions'a doğru URL'leri ekleyin

### "ApiNotActivatedMapError" 
- **Sebep**: Gerekli API'ler etkin değil
- **Çözüm**: Maps JavaScript API'yi etkinleştirin

### "RequestDeniedMapError"
- **Sebep**: Fatura bilgileri eksik veya limit aşıldı
- **Çözüm**: Billing hesabı ekleyin ve limit kontrolü yapın

### "InvalidKeyMapError"
- **Sebep**: API anahtarı geçersiz
- **Çözüm**: Yeni API anahtarı oluşturun ve .env.local'i güncelleyin

## Güvenlik Notları

1. API anahtarını asla public repository'lere commit etmeyin
2. Production'da domain-specific kısıtlamalar kullanın
3. Günlük kullanım limitlerini ayarlayın
4. API kullanımını düzenli olarak izleyin

## Üretim Ortamı

Production deployment için:
1. Domain'e özel kısıtlamalar ekleyin: `yourdomain.com/*`
2. HTTPS kullanımını zorunlu tutun
3. API kullanım istatistiklerini izleyin
4. Backup planını hazır tutun (manual input fallback)