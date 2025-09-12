# Trakya Solar - Development Roadmap

## 🌞 Proje Genel Bakış
**Trakya Solar** - Türkiye'nin en kapsamlı GES satış ve yönetim platformu

### 🎯 Hedef Müşteri Segmentleri
- ✅ Çiftçiler (Tarımsal GES)
- ✅ Ev sahipleri (Çatı GES) 
- ✅ KOBİ'ler
- ✅ Büyük sanayi tesisleri
- ✅ GES kurulum firmaları
- ✅ Bankalar & Finans kuruluşları

---

## 🛠 Teknoloji Stack

### Frontend
- **Framework**: Next.js 14 + TypeScript
- **Styling**: Tailwind CSS + Shadcn/ui
- **3D Engine**: Three.js + React Three Fiber
- **Maps**: Mapbox GL JS
- **Charts**: Recharts
- **Icons**: Lucide React

### Backend
- **Runtime**: Node.js + Express
- **Database**: PostgreSQL + Prisma ORM
- **Cache**: Redis
- **Auth**: NextAuth.js
- **File Storage**: AWS S3 / Vercel Blob

### External APIs
- **Uydu Görüntü**: Google Maps API / Mapbox
- **Hava Durumu**: OpenWeatherMap API
- **Ödeme**: İyzico
- **SMS**: Netgsm
- **Mail**: Resend

---

## 📋 PHASE 1: PROJECT SETUP (1-2 gün)

### ✅ Adım 1: Proje Kurulumu
```bash
npx create-next-app@latest trakya-solar --typescript --tailwind --eslint --app
cd trakya-solar
```

### ✅ Adım 2: Gerekli Paketlerin Yüklenmesi
```bash
# UI & Styling
npm install @radix-ui/react-dialog @radix-ui/react-dropdown-menu @radix-ui/react-select
npm install class-variance-authority clsx tailwind-merge
npm install lucide-react

# 3D & Maps  
npm install three @types/three @react-three/fiber @react-three/drei
npm install mapbox-gl @types/mapbox-gl

# Database & Auth
npm install prisma @prisma/client
npm install next-auth @auth/prisma-adapter
npm install bcryptjs @types/bcryptjs

# Forms & Validation
npm install react-hook-form @hookform/resolvers zod

# Charts & Data
npm install recharts date-fns

# Utils
npm install axios swr
```

### ✅ Adım 3: Klasör Yapısının Oluşturulması
```
src/
├── app/                    # Next.js 14 App Router
│   ├── (auth)/            # Auth route group
│   ├── (dashboard)/       # Dashboard route group  
│   ├── api/               # API routes
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Homepage
├── components/            # React Components
│   ├── ui/                # Shadcn/ui components
│   ├── layout/            # Layout components
│   ├── forms/             # Form components
│   ├── charts/            # Chart components
│   ├── maps/              # Map components
│   └── 3d/                # 3D components
├── lib/                   # Utility functions
│   ├── auth.ts            # Auth config
│   ├── db.ts              # Database connection
│   ├── utils.ts           # Helper functions
│   └── validations.ts     # Zod schemas
├── hooks/                 # Custom React hooks
├── types/                 # TypeScript definitions
├── data/                  # Static data & constants
└── styles/                # Additional CSS files

prisma/
├── schema.prisma          # Database schema
└── seed.ts                # Database seeding

public/
├── images/                # Static images
├── icons/                 # Icons & logos
└── data/                  # JSON data files
```

### ✅ Adım 4: Tailwind & Shadcn/ui Konfigürasyonu
```bash
# Shadcn/ui setup
npx shadcn-ui@latest init
npx shadcn-ui@latest add button card input label select
npx shadcn-ui@latest add dialog dropdown-menu navigation-menu
npx shadcn-ui@latest add table badge avatar
```

---

## 📋 PHASE 2: DATABASE DESIGN (1 gün)

### ✅ Adım 5: Prisma Schema Tasarımı

**Ana Tablolar:**
- `User` - Kullanıcı bilgileri
- `Company` - Şirket bilgileri  
- `Project` - GES projeleri
- `Quote` - Teklifler
- `Customer` - Müşteriler
- `Product` - Ürün kataloğu (paneller, inverterler vs)
- `Installation` - Kurulum bilgileri
- `Financial` - Finansal analizler
- `Document` - Belgeler

### ✅ Adım 6: Database Migration & Seeding
```bash
npx prisma db push
npx prisma db seed
```

---

## 📋 PHASE 3: AUTHENTICATION (1 gün)

### ✅ Adım 7: NextAuth.js Kurulumu
- Google & Email authentication
- Role-based access (Admin, Company, Customer)
- Session management

### ✅ Adım 8: Auth Pages
- `/auth/signin` - Giriş sayfası
- `/auth/signup` - Kayıt sayfası  
- `/auth/forgot-password` - Şifre sıfırlama

---

## 📋 PHASE 4: CORE LAYOUT (1 gün)

### ✅ Adım 9: Ana Layout Bileşenleri
- `Header` - Navigation & User menu
- `Sidebar` - Dashboard navigation
- `Footer` - Site footer
- `LoadingSpinner` - Loading states

### ✅ Adım 10: Dashboard Layout
- Responsive design
- Mobile-first approach
- Dark/Light theme support

---

## 📋 PHASE 5: HOMEPAGE & LANDING (2 gün)

### ✅ Adım 11: Homepage Tasarımı
- Hero section
- Feature showcase
- Customer testimonials
- Interactive solar calculator (basit versiyon)

### ✅ Adım 12: Navigation & Menu
- Main navigation
- Mobile menu
- User authentication states

---

## 📋 PHASE 6: 3D DESIGNER MODULE (3-4 gün)

### ✅ Adım 13: 3D Çatı Tasarımcısı
- Three.js scene setup
- 3D çatı modeli
- Panel placement system
- Gölge analizi (basit)

### ✅ Adım 14: Harita Entegrasyonu
- Mapbox GL JS integration
- Türkiye haritası
- Uydu görüntüleri
- Koordinat seçimi

---

## 📋 PHASE 7: QUOTE ENGINE & CRM (2-3 gün)

### ✅ Adım 15: Teklif Motoru
- Ürün fiyat veritabanı
- Otomatik fiyat hesaplama
- PDF teklif oluşturma
- Email gönderimi
- Project pipeline management (Kanban board)
- Activity timeline tracking
- Project status workflow

### ✅ Adım 16: Fizibilite Analizi
- ROI hesaplaması
- Geri ödeme süresi
- Karbon tasarrufu
- Enerji üretim tahmini

---

## 📋 PHASE 8: CRM SYSTEM (2-3 gün)

### ✅ Adım 17: Müşteri Yönetimi
- Customer dashboard
- Contact management
- Lead tracking
- Communication history

### ✅ Adım 18: Proje Yönetimi
- Project timeline
- Task management
- Document management
- Status tracking

---

## 📋 PHASE 9: FINANCIAL MODULE (2 gün)

### ✅ Adım 19: Kredi & Finansman
- Banka entegrasyonları (API mockları)
- Kredi hesaplayıcısı
- Leasing seçenekleri
- Ödeme planları
- Detailed cost breakdown
- Material pricing integration

### ✅ Adım 20: Teşvik Hesaplayıcısı
- YEKDEM tarifeleri
- Devlet teşvikleri
- Vergi avantajları
- Bölgesel destekler

---

## 📋 PHASE 10: FARMER MODULE (2 gün)

### ✅ Adım 21: Çiftçi Özel Modülü
- Tarımsal GES hesaplayıcısı
- Arazi analizi
- Crop compatibility check
- Agrovoltaik sistemler

---

## 📋 PHASE 11: PRODUCT DATABASE MANAGEMENT (2 gün)

### ✅ Adım 22: Ürün Veritabanı Sistemi
- Panel/inverter/accessories categories
- Manual product entry system
- Price management tools
- Technical specifications database

### ✅ Adım 23: Ürün Yönetim Arayüzü
- Admin panel for product management
- Bulk import/export features
- Price update workflows
- Stock tracking system

---

## 📋 PHASE 12: PROJECT WORKFLOW OPTIMIZATION (2 gün) ✅

### ✅ Adım 24: Entegre İş Akışları
- ✅ Designer → Project → Quote integration
- ✅ Customer notification system  
- ✅ Project overview dashboard
- ✅ Automated status updates

### ✅ Adım 25: İletişim & Takip
- ✅ Email notification templates
- ✅ SMS integration
- ✅ Activity logging
- ✅ Performance metrics

---

## 📋 PHASE 13: ADVANCED FEATURES (3-4 gün)

### ✅ Adım 26: Gelişmiş Özellikler
- Real-time chat support
- Notification system
- Advanced reporting
- Data analytics
- API endpoints

### ✅ Adım 27: Mobile Optimization
- PWA conversion
- Mobile-specific features
- Touch interactions
- Offline capabilities

---

## 📋 PHASE 14: TESTING & DEPLOYMENT (2 gün)

### ✅ Adım 28: Testing
- Unit tests
- Integration tests
- E2E tests with Playwright

### ✅ Adım 29: Deployment
- Vercel deployment
- Environment configuration
- Domain setup
- SSL certificates

---

## 🎯 Toplam Süre: ~25-30 gün

## 📝 Notlar
- Her phase sonunda test edilmeli
- Git commits düzenli yapılmalı
- Code review'lar atlanmamalı
- Documentation yazılmalı

## 🚀 Başlamaya Hazır!

Bu dosyayı `ROADMAP.md` olarak kaydet ve her adımı tamamladıkça ✅ işaretle!