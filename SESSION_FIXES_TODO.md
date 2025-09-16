# Platform Issues - Active TODO List

## Critical Issues Needing Fixes

### 1. Customer Cities Dropdown - Missing Provinces ❌
**Problem**: Şehir dropdown'ında sadece birkaç il var, 81 il tam listesi yok
**Impact**: Customers can't select their actual city when creating accounts
**Action Required**: Complete 81 Turkish provinces list implement
**Claude Code Prompt**: 
```
Müşteri ekleme formunda şehir dropdown'ı 81 il eksik:

PROBLEM: Customer form'da sadece bazı iller var, 81 il tam değil

FIX:
1. Customer creation form'unu bul 
2. Şehir dropdown'ını Türkiye'nin 81 ili ile doldur
3. Alfabetik sıralama ekle
4. Search functionality ekle

Complete Turkish cities list implement et.
```

### 2. Customer Action Buttons Not Working ❌
**Problem**: Customer list sayfasında sağdaki butonlar (ara, mail) aktif değil
**Impact**: Cannot search customers or send emails from customer management
**Action Required**: Make search and email buttons functional
**Claude Code Prompt**:
```
Customer list page action buttons çalışmıyor:

PROBLEM: /dashboard/customers sayfasında sağdaki butonlar inactive
- Search button çalışmıyor
- Email button çalışmıyor  
- Export/action buttons passive

FIX:
1. Customer list component'i bul
2. Search functionality implement et
3. Email action button functionality ekle
4. Button click handlers ekle
5. Loading states ekle button'lara

Customer list action buttons fully functional yap.
```

### 3. Project Request Creation Feedback Issues ❌
**Problem**: Proje talebi oluştur butonu dönüyor, feedback yok, modal kapanmıyor
**Impact**: Users click multiple times creating duplicate requests
**Action Required**: Fix UX feedback and prevent duplicates
**Claude Code Prompt**:
```
Project request creation feedback problemi:

PROBLEM: Proje talebi oluştur butonu
- Loading state'de kalıyor
- Success/error feedback yok
- Modal kapanmıyor
- Kullanıcı tekrar tekrar basıyor
- Duplicate project requests oluşuyor

FIX:
1. Project request creation form component'i bul
2. Success notification ekle
3. Error handling ekle
4. Modal auto-close ekle success'te
5. Button loading state düzelt
6. Duplicate submission prevent et

UX feedback ve duplicate prevention implement et.
```

### 4. Quote Builder Auto-Fill Price Issues ❌
**Problem**: Ürün seçince birim fiyatı otomatik gelmiyor, sonraki değişikliklerde fiyat 0 kalıyor
**Impact**: Manual price entry required, calculation errors
**Action Required**: Fix product selection auto-fill system
**Claude Code Prompt**:
```
Quote builder auto-fill çalışmıyor - Debug ve düzelt:

OBSERVED PROBLEMS:
1. İlk product selection fiyat geliyor, sonraki changes gelmiyor  
2. Product değiştirince unit price 0 kalıyor
3. KDV default %18, %20 olmalı
4. Real-time price update çalışmıyor

SPECIFIC DEBUG:
1. product onChange handler'ını kontrol et
2. useEffect dependencies eksik olabilir
3. updateItem function'ı price'ı set etmiyor olabilir
4. VAT defaultValue state initialization hatası

FIX REQUIRED:
- Her product change'de unit price update
- VAT default 20% (not 18%)  
- Console.log ekle product selection'da
- updateItem function debug et

Product selection auto-fill completely functional yap.
```

### 5. Quote Calculation System Problems ❌
**Problem**: KDV değişince toplam güncellenmiyor, hesaplama sistemi çalışmıyor
**Impact**: Incorrect quote totals, pricing errors
**Action Required**: Fix real-time calculation engine
**Claude Code Prompt**:
```
Quote builder hesaplama sistemini düzelt:

MULTIPLE PROBLEMS:
1. Ürün seçince birim fiyatı otomatik gelmiyor
2. KDV %20 default olmuyor  
3. KDV değişince toplam güncellenmiyor
4. Hesaplama sistemi düzgün çalışmıyor

FIX NEEDED:
1. Product selection → auto-fill unit price from database
2. VAT default to 20% automatically
3. VAT change → recalculate totals immediately
4. All calculations working correctly (quantity × unit price + VAT)
5. Real-time calculation updates

Quote builder calculation system tam functional yap.
```

### 6. Quote Preview Wrong Products ❌
**Problem**: Ön izlemede seçtiğim ürünler değil, hep aynı ürünler görünüyor
**Impact**: Customers see wrong products in quote previews
**Action Required**: Fix preview data flow from quote builder
**Claude Code Prompt**:
```
Quote preview wrong products display:

CRITICAL PROBLEM: Preview shows wrong products
- User selects specific products in quote builder
- Preview always shows same default products  
- Selected products not reflected in preview
- Product data not passed correctly to preview component

INVESTIGATION NEEDED:
1. Quote builder → preview data flow
2. Preview component product data source
3. Items array not passed correctly
4. Default/sample data overriding real data

FIX REQUIRED:
1. Debug quote builder items state
2. Check preview component props/data
3. Ensure selected products passed to preview
4. Remove any hardcoded/sample product data in preview
5. Preview should reflect exact quote builder selections

Preview component show actual selected products.
```

### 7. PDF Download Not Working in Production ❌
**Problem**: PDF indir local'de çalışıyor, production'da çalışmıyor
**Impact**: Cannot generate PDFs for customers in live environment
**Action Required**: Fix production PDF generation
**Claude Code Prompt**:
```
Quote preview ve PDF download sorunları:

PROBLEMS:
1. Ön izlemede seçilen ürünler değil, hep aynı ürünler görünüyor
2. PDF indir local'de çalışıyor, production'da çalışmıyor
3. PDF indir, taslak kaydet, teklif gönder butonları loading'de kalıyor
4. Teklif gönder'de hangi yöntemle (email/sms/whatsapp) göndereceği seçeneği yok

FIX NEEDED:
1. Preview'da seçilen ürünleri doğru göster
2. PDF generation production'da çalıştır
3. Button loading states düzelt
4. Teklif gönderme modal'ı ekle (email/sms/whatsapp seçimi)
5. Mock değil gerçek gönderim implement et

Quote preview ve delivery system tam functional yap.
```

### 8. Quote Sending No Feedback or Method Selection ❌
**Problem**: Teklif gönder butonu dönüyor, hangi yöntemle gönderileceği belli değil
**Impact**: No delivery confirmation, no method choice (email/SMS/WhatsApp)
**Action Required**: Add delivery method selection modal
**Claude Code Prompt**:
```
Quote sending delivery method selection:

CURRENT PROBLEM: 
- 'Teklif Gönder' button loading'de kalıyor
- No delivery method selection (email/SMS/WhatsApp)  
- No feedback to user
- Mock delivery, not real sending

REQUIRED IMPLEMENTATION:
1. Click 'Teklif Gönder' → Modal opens with delivery options
2. Delivery methods: Email, SMS, WhatsApp (checkboxes - multiple selection)
3. Each method shows recipient info (email address, phone number)
4. Send button in modal triggers real delivery
5. Success/error notifications for each delivery method
6. Loading states for each delivery method separately

MODAL DESIGN:
- Title: 'Teklif Gönderme Yöntemi Seçin'
- Email checkbox + customer email display
- SMS checkbox + customer phone display  
- WhatsApp checkbox + customer phone display
- Send button: 'Seçilen Yöntemlerle Gönder'
- Cancel button

Quote delivery selection modal + real sending implement.
```

### 9. Calendar Tracking View Missing ❌
**Problem**: Project requests sayfasında takvim görünümü yok, günlük teklif takibi yapılamıyor
**Impact**: Cannot track daily quote delivery statistics
**Action Required**: Add calendar tracking feature
**Claude Code Prompt**:
```
Project requests calendar tracking view:

NEW FEATURE: Calendar view for quote tracking

REQUIREMENT:
- Project requests page has List/Card/Kanban views
- Add 'Talep İzleme' button next to view options
- Opens monthly calendar view
- Shows daily quote delivery counts
- Real data, not mock

CALENDAR IMPLEMENTATION:
1. Add 'Talep İzleme' button to view selector
2. Calendar modal/component with monthly view
3. Each day shows: number of quotes sent
4. Click day → show list of quotes sent that day
5. Navigation: previous/next month
6. Real quote delivery data from database

VISUAL DESIGN:
- Calendar grid layout
- Day cells show quote count badges
- Different colors for: draft/sent/approved quotes
- Hover shows quote details preview
- Month navigation arrows

Calendar quote tracking component implement et.
```

### 10. Calculator 404 Issue ❌
**Problem**: Dashboard calculator 'GES hesaplayıcı maliyet analizi' button → 404 not found
**Impact**: Calculator feature not accessible from dashboard
**Action Required**: Fix calculator route and page
**Claude Code Prompt**:
```
Dashboard calculator 404 fix:

PROBLEM: Dashboard/calculator 'GES hesaplayıcı maliyet analizi' button → 404 not found

INVESTIGATION:
- Check if /dashboard/calculator route exists
- Verify calculator page component exists
- Check navigation link URL in dashboard

FIX REQUIRED:
1. Create missing calculator page if not exists
2. Or fix broken route/link
3. Calculator should have: solar cost analysis, savings calculator, ROI calculator
4. Ensure proper navigation from dashboard

Calculator route ve page düzelt.
```

## Development Notes

### Git Safety
- Always commit changes before major operations
- Use incremental commits for each fix
- Test each fix individually before moving to next

### Testing Protocol
- Test in development environment first
- Verify on production after deployment
- Check user experience flow completely

### Priority Order
Start with the most critical user-facing issues:
1. Customer management (cities, buttons)
2. Quote system (auto-fill, calculations, preview)
3. Project request feedback
4. PDF generation
5. Delivery system
6. Calendar tracking
7. Calculator fixes

## Usage Instructions for Claude Code

1. Work on ONE item at a time
2. Use the exact prompt provided for each issue
3. Test the fix thoroughly before marking as complete
4. Move to next item only after current fix is verified working
5. Update this TODO list as items are completed