# 📋 KONTROL LİSTESİ - TÜM ÖZELLİKLER

## 🔴 CRITICAL PRIORITY - Teklif Sistemi & Ürün Yönetimi

### ✅ Teklif Oluşturma & Yönetimi

#### 1. Teklif Sıfırlanma Sorunu
- [ ] `/dashboard/quotes/create/[id]` sayfasına git
- [ ] Bir teklif oluştur ve kaydet
- [ ] Sayfayı yenile
- [ ] Teklifin sıfırlanmadığını kontrol et

#### 2. Proje Kartı Teklif Durumu
- [ ] `/dashboard/project-requests` sayfasına git
- [ ] Teklifi olan bir proje kartına bak
- [ ] "Teklifi Düzenle" butonunun göründüğünü kontrol et
- [ ] Teklifi olmayan projede "Teklif Oluştur" butonunun göründüğünü kontrol et

#### 3. Fotoğraf Talep Sistemi
- [ ] Teklifi olan bir proje kartında "Fotoğraf Talep Et" butonunu kontrol et
- [ ] Butona tıkla ve işlevselliğini test et

#### 4. Onaylanmış Teklif Stok Düşürme
- [ ] Bir teklifi onayla
- [ ] `/dashboard/products` sayfasına git
- [ ] İlgili ürünlerin stoklarının düştüğünü kontrol et

#### 5. Proje Teklifleri Görünüm
- [ ] `/dashboard/quotes` sayfasına git
- [ ] Proje tekliflerinin düzgün kart boyutlarında göründüğünü kontrol et

#### 6. PDF Teklif İyileştirme
- [ ] Herhangi bir teklifi PDF olarak indir
- [ ] PDF'te proje isminin göründüğünü kontrol et (kW gücü değil)
- [ ] Elektrik fiyatının 5.20 TL olduğunu kontrol et

### ✅ Ürün & Kategori Yönetimi

#### 7. Kategori Ekleme
- [ ] `/dashboard/products` sayfasına git
- [ ] "Kategori Ekle" butonuna tıkla
- [ ] Yeni kategori ekle ve kaydetmeyi test et

#### 8. Yeni Ürün Ekleme
- [ ] "Ürün Ekle" butonuna tıkla
- [ ] Alış fiyatı alanını kontrol et
- [ ] Satış fiyatı alanını kontrol et
- [ ] Alış tarihi alanını kontrol et

#### 9. Ürün Dosya Yükleme
- [ ] Ürün ekleme/düzenleme formunda dosya yükleme alanlarını kontrol et:
  - [ ] Görsel yükleme
  - [ ] PDF yükleme
  - [ ] Kullanım kılavuzu yükleme

#### 10. Stok Yönetimi
- [ ] Azami stok belirleme alanını kontrol et
- [ ] Stok güncelleme butonunu test et
- [ ] Alış tarihi ile stok güncellemeyi test et

#### 11. Ürün İstatistikleri
- [ ] Admin olarak giriş yap
- [ ] Ürün detayında alış/satış fiyat takibini kontrol et
- [ ] Satış direktörü rolü ile de görünürlüğü test et

#### 12. Ürün Meta Data
- [ ] Ürünü ekleyen kullanıcı bilgisinin göründüğünü kontrol et
- [ ] Ürünü güncelleyen kullanıcı bilgisinin göründüğünü kontrol et
- [ ] Admin panelinde bu bilgilerin görünürlüğünü test et

## 🟠 HIGH PRIORITY - Dashboard & Navigation

### ✅ Dashboard Layout

#### 13. Dashboard Yeniden Düzenleme
- [ ] `/dashboard` sayfasına git
- [ ] Hava durumu widget'ının kaldırıldığını kontrol et
- [ ] Son projelerin gösterildiğini kontrol et

#### 14. Talep İzleme Butonu
- [ ] Dashboard'da "Talep İzleme" butonunun varlığını kontrol et
- [ ] Proje Tasarımcısı butonlarının yanında olduğunu kontrol et
- [ ] Tıkla ve yönlendirmeyi test et

#### 15. Proje Genel Görünümü
- [ ] `/dashboard/projects` sayfasına git
- [ ] Sayfanın hatasız açıldığını kontrol et
- [ ] Verilerin doğru yüklendiğini test et

#### 16. Çiftçiler Bölümü
- [ ] Çiftçiler bölümüne git
- [ ] Mock data yerine gerçek verilerin göründüğünü kontrol et
- [ ] Sil butonunun çalıştığını test et

### ✅ Navigation & UI

#### 17. Ana Sayfa Firma Listesi
- [ ] Ana sayfaya git (/)
- [ ] Firmaların listelendiğini kontrol et
- [ ] "Daha fazlası için giriş yap" sistemini test et

#### 18. Koyu/Açık Tema
- [ ] Sağ üst köşede tema değiştirme butonunu bul
- [ ] Light mode'a geç ve tüm sayfaları kontrol et
- [ ] Dark mode'a geç ve tüm sayfaları kontrol et
- [ ] Tercihin kaydedildiğini kontrol et (sayfa yenilendiğinde)

#### 19. Arama Butonu
- [ ] `/dashboard/quotes` sayfasına git
- [ ] Arama kutusuna bir şey yaz
- [ ] Arama butonuna tıkla
- [ ] Filtrelemenin çalıştığını kontrol et

#### 20. Mobil Optimizasyon
- [ ] Tarayıcıyı mobil görünüme al (F12 > Responsive)
- [ ] 3 nokta menünün göründüğünü kontrol et
- [ ] Menü açılıp kapanmasını test et
- [ ] Tüm sayfaların mobilde düzgün göründüğünü kontrol et

## 🟢 HIGH PRIORITY - Kullanıcı Yönetimi & Roller

### ✅ Kayıt & Giriş Sistemi

#### 21. Kayıt Formu Güncelleme
- [ ] `/auth/register` sayfasına git
- [ ] Kullanıcı tipi seçeneklerini kontrol et:
  - [ ] Bireysel
  - [ ] Kurumsal
  - [ ] GES Firması
  - [ ] Çiftçi

#### 22. Apple & Google Giriş
- [ ] Giriş sayfasında OAuth butonlarını kontrol et
- [ ] Google ile giriş butonunun varlığını kontrol et
- [ ] Apple ile giriş butonunun varlığını kontrol et

#### 23. Partner Ol Sistemi
- [ ] Ana sayfada "Partner Ol" butonunu kontrol et
- [ ] Partner kayıt formunu test et
- [ ] "Teklif Al" butonunun çalıştığını kontrol et

### ✅ User Rolleri

#### 24. Kurulum Ekibi User
- [ ] INSTALLATION_TEAM rolünde bir kullanıcı oluştur/giriş yap
- [ ] Proje taleplerini görebildiğini kontrol et
- [ ] Fiyatların GİZLİ olarak göründüğünü kontrol et
- [ ] Mali bilgilere erişemediğini doğrula

#### 25. Role-based Görünüm
- [ ] INSTALLATION_TEAM olarak:
  - [ ] Müşteri taleplerini görebildiğini kontrol et
  - [ ] Konum bilgilerini görebildiğini kontrol et
  - [ ] Fotoğrafları görebildiğini kontrol et
  - [ ] Fiyatların gizlendiğini kontrol et
  - [ ] Finansal analizlerin gizlendiğini kontrol et

## 🔵 MEDIUM PRIORITY - Proje Yönetimi

### ✅ Proje Talepleri

#### 26. Takvim Not Sistemi
- [ ] `/dashboard/project-requests` sayfasına git
- [ ] Takvim görünümüne geç
- [ ] Herhangi bir güne tıkla
- [ ] "Notları Yönet" butonunu test et
- [ ] Not ekle, düzenle, sil işlemlerini test et
- [ ] Öncelik seçimini test et (Düşük/Orta/Yüksek)
- [ ] Özel not özelliğini test et

#### 27. Kaynak Renklendirme
- [ ] Proje talepleri sayfasında renk kodlarını kontrol et:
  - [ ] 🌐 Web Sitesi (Mavi)
  - [ ] 📞 Telefon (Yeşil)
  - [ ] 📧 E-posta (Mor)
  - [ ] 👥 Referans (Turuncu)
  - [ ] 📱 Sosyal Medya (Pembe)
  - [ ] 🚶 Ziyaretçi (İndigo)
  - [ ] 🤝 Partner Referansı (Amber)
  - [ ] 💬 WhatsApp (Zümrüt)
  - [ ] 📋 Diğer (Gri)
- [ ] Açıklama legendının çalıştığını kontrol et

#### 28. Kanban vs Liste Atama Görünümü
- [ ] Kanban görünümünde atamaları kontrol et
- [ ] Liste görünümüne geç
- [ ] "Atanan" sütununun göründüğünü kontrol et
- [ ] Kart görünümünde de atama bilgisinin göründüğünü kontrol et

#### 29. Durum Güncelleme
- [ ] Proje taleplerinde durum güncelleme butonlarını test et:
  - [ ] Kanban kartlarında
  - [ ] Liste görünümünde
  - [ ] Kart görünümünde
  - [ ] Takvim popup'larında
- [ ] Durum geçişlerinin mantıklı olduğunu kontrol et

#### 30. Sonraki Adım Otomasyonu
- [ ] Takvim görünümünde renkleri kontrol et:
  - [ ] 🔴 Kırmızı = Gecikmiş adımlar
  - [ ] 🟠 Turuncu = Bugün yapılacaklar
  - [ ] 🔵 Mavi = Bekleyen adımlar
- [ ] Otomatik adım önerilerini kontrol et:
  - [ ] OPEN → Müşteriyle İletişime Geç (1 gün)
  - [ ] CONTACTED → Saha Ziyareti Planla (3 gün)
  - [ ] ASSIGNED → Teknik İnceleme (2 gün)
  - [ ] SITE_VISIT → Teklif Gönder (2 gün)
  - [ ] SITE_VISIT → Teklif Takibi (7 gün)
  - [ ] CONVERTED → Proje Başlatma (1 gün)

## 🟣 3D Tasarımcı

#### 31. 3D Model İyileştirme
- [ ] `/dashboard/designer` sayfasına git
- [ ] 3D modelde ev göründüğünü kontrol et
- [ ] Güneye bakan çatının vurgulandığını kontrol et
- [ ] Panel yerleştirmeyi test et
- [ ] Otomatik yerleştir butonunu test et
- [ ] Gölge analizini test et (saat kontrolü)
- [ ] Güneş simülasyonunu test et

## 🔧 Genel Kontroller

### Performance
- [ ] Sayfalar hızlı yükleniyor mu?
- [ ] API çağrıları optimize mi?
- [ ] Loading state'ler düzgün çalışıyor mu?

### Error Handling
- [ ] Hata durumlarında uygun mesajlar gösteriliyor mu?
- [ ] Toast notification'lar çalışıyor mu?
- [ ] Form validasyonları düzgün mü?

### Responsive Design
- [ ] Desktop (1920x1080)
- [ ] Laptop (1366x768)
- [ ] Tablet (768x1024)
- [ ] Mobile (375x667)

### Browser Compatibility
- [ ] Chrome
- [ ] Firefox
- [ ] Safari
- [ ] Edge

### Security
- [ ] Authentication kontrolleri çalışıyor mu?
- [ ] Role-based erişim kısıtlamaları uygulanıyor mu?
- [ ] Hassas veriler (fiyatlar) doğru gizleniyor mu?

## 📝 Notlar

- Her bir özelliği test ederken farklı kullanıcı rolleri ile de test edin
- Özellikle ADMIN, COMPANY, CUSTOMER ve INSTALLATION_TEAM rolleri ile
- Hata bulursanız detaylı not alın (hangi sayfa, hangi işlem, hata mesajı)
- Performance sorunları varsa hangi sayfada olduğunu belirtin

## 🚀 Test Sırası Önerisi

1. Önce authentication sistemini test edin
2. Farklı rollerle giriş yapın
3. Her rol için özellikleri kontrol edin
4. Mobil cihazlarda da test edin
5. Edge case'leri deneyin (boş form, çok uzun text, vs)

---

**Test Tarihi:** _______________
**Test Eden:** _______________
**Ortam:** [ ] Local [ ] Staging [ ] Production