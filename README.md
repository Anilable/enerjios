# 🌞 EnerjiOS - Güneş Enerjisi Yönetim Platformu

Türkiye'nin en kapsamlı güneş enerjisi sistemi (GES) satış ve yönetim platformu. Next.js ile geliştirilmiş, proje tasarım araçları, müşteri yönetimi, finansal analiz ve çok rollü dashboard arayüzlerine sahip güneş enerjisi yönetim platformu.

## 🚀 Features Overview

### 🎨 **Proje Tasarımcısı (Project Designer)**
- **3D Roof Analysis**: Advanced 3D modeling and roof analysis tools
- **Interactive Design**: Real-time panel placement and optimization
- **Google Maps Integration**: Satellite view and location-based design
- **Performance Calculations**: Automatic energy production and ROI calculations
- **Quote Generation**: Instant project quotes with detailed breakdowns

### 👥 **Multi-Role Dashboard**
- **Admin Panel**: Complete system management and user control
- **Company Portal**: Project management, customer relations, and financial tracking
- **Customer Interface**: Project tracking, energy monitoring, and document management
- **Farmer Dashboard**: Agricultural solar integration and crop compatibility analysis

### 💰 **Financial Management**
- **Real-time Currency Exchange**: Live TCMB exchange rate integration
- **ROI Calculator**: Comprehensive return on investment analysis
- **Bank Comparison**: Financing options and loan calculator
- **Government Incentives**: Turkish solar incentive calculator

### 🌾 **Agrovoltaic Systems**
- **Crop Compatibility**: Analysis of solar-agriculture integration
- **Specialized Systems**: Custom solutions for farming operations
- **Yield Analysis**: Impact assessment on agricultural productivity

### 🛠 **Additional Features**
- **Weather Integration**: Real-time weather data via OpenWeatherMap API
- **Email Automation**: Automated notifications and reporting
- **Database Management**: Comprehensive admin interface for data management
- **Product Catalog**: Solar panel, inverter, and component management

## 🏗️ Technology Stack

### **Frontend**
- **Next.js 15.5.2** with App Router and Turbopack
- **React 19.1.0** with TypeScript
- **Tailwind CSS 4** for styling
- **Shadcn/ui** component library
- **React Hook Form** with Zod validation
- **Recharts** for data visualization

### **3D & Maps**
- **Three.js** with React Three Fiber
- **Google Maps API** integration
- **Mapbox GL** for advanced mapping features

### **Backend & Database**
- **Prisma ORM** with SQLite database
- **NextAuth.js** for authentication
- **bcryptjs** for password hashing
- **Server Actions** for API endpoints

### **External Integrations**
- **OpenWeatherMap API** - Weather data
- **TCMB API** - Turkish Central Bank exchange rates
- **Resend** - Email service
- **Google OAuth** - Authentication provider
- **Iyzico** - Payment processing

### **Development & Testing**
- **TypeScript** for type safety
- **ESLint** for code quality
- **Jest** for unit testing
- **Playwright** for E2E testing
- **Prisma Studio** for database management

## 📦 Installation & Setup

### 1. **Clone the Repository**
```bash
git clone <repository-url>
cd enerjios
```

### 2. **Install Dependencies**
```bash
npm install
```

### 3. **Environment Configuration**
Create a `.env.local` file in the root directory:

```env
# Database
DATABASE_URL="file:./dev.db"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key-here"

# Google OAuth (Optional)
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"

# Email Service (Resend)
RESEND_API_KEY="your-resend-api-key"

# SMS Service (Optional)
NETGSM_API_KEY="your-netgsm-api-key"
NETGSM_HEADER="your-netgsm-header"

# Payment Processing (Iyzico)
IYZICO_API_KEY="your-iyzico-api-key"
IYZICO_SECRET_KEY="your-iyzico-secret"
IYZICO_BASE_URL="https://sandbox-api.iyzipay.com"

# Maps Integration
MAPBOX_ACCESS_TOKEN="your-mapbox-token"

# Weather API
OPENWEATHER_API_KEY="your-openweather-api-key"

# File Storage (Choose one)
# AWS S3
AWS_ACCESS_KEY_ID="your-aws-access-key"
AWS_SECRET_ACCESS_KEY="your-aws-secret"
AWS_REGION="your-aws-region"
AWS_S3_BUCKET="your-bucket-name"

# OR Vercel Blob Storage
BLOB_READ_WRITE_TOKEN="your-vercel-blob-token"
```

### 4. **Database Setup**
```bash
# Generate Prisma client
npm run db:generate

# Run database migrations
npm run db:migrate:dev

# Seed the database with sample data
npm run db:seed
```

### 5. **Start Development Server**
```bash
npm run dev
```

The application will be available at:
- **Primary**: http://localhost:3000
- **Alternative**: http://localhost:3003 (if 3000 is in use)

## 🔐 User Roles

The platform supports multiple user roles with different access levels:

### **Available User Types**
- **Admin**: Full system administration, user management, database control
- **Company**: Project management, customer relations, installation tracking
- **Customer**: Project viewing, energy monitoring, document management
- **Farmer**: Agricultural solar systems, crop compatibility analysis

*Note: Test accounts are available in development environment only. Contact system administrator for access credentials.*

## 🎯 Feature Walkthrough

### 1. **Getting Started**
1. Navigate to the login page and contact administrator for test credentials
2. Explore the role-specific dashboard with quick action buttons
3. Try the **Proje Tasarımcısı** (Project Designer) tool for 3D roof analysis

### 2. **Project Design Workflow**
1. **Location Selection**: Use Google Maps to select project location
2. **Roof Analysis**: Draw roof boundaries and identify usable areas
3. **Panel Placement**: Automatically or manually place solar panels
4. **Performance Calculation**: Review energy production and financial projections
5. **Quote Generation**: Create professional project quotes

### 3. **Admin Features**
- **Database Management**: Comprehensive database admin interface at `/dashboard/database`
- **User Management**: Control user accounts and permissions
- **Product Catalog**: Manage solar panels, inverters, and components
- **System Monitoring**: Real-time API status and performance metrics

### 4. **Company Features**
- **Project Portfolio**: Track all active and completed projects
- **Customer Management**: Maintain customer relationships and communications
- **Installation Tracking**: Schedule and monitor installation progress
- **Financial Dashboard**: Revenue tracking and payment management

## 🗄️ Database Schema

The application uses a comprehensive database schema including:

- **Users & Authentication**: Multi-role user management (ADMIN, COMPANY, CUSTOMER, FARMER)
- **Projects & Quotes**: Solar project tracking and quotation system
- **Products & Inventory**: Solar component catalog and stock management
- **Financial**: Pricing, payments, and financial tracking
- **Regional Data**: Turkish city data with solar irradiance information (81 provinces)
- **Agricultural**: Crop compatibility and agrovoltaic system data

## 🚀 Development Commands

```bash
# Development server
npm run dev

# Build for production
npm run build

# Start production server
npm run start

# Database operations
npm run db:migrate:dev      # Run migrations
npm run db:seed            # Seed database
npm run db:studio          # Open Prisma Studio
npm run db:generate        # Generate Prisma client
npm run db:push            # Push schema changes

# Testing
npm run test              # Unit tests
npm run test:watch        # Watch mode
npm run test:coverage     # Coverage report
npm run test:e2e          # End-to-end tests
npm run test:e2e:ui       # E2E with UI
npm run test:all          # All tests

# Code quality
npm run lint              # ESLint
npm run type-check        # TypeScript check
npm run precommit         # Full quality check
```

## 📱 Responsive Design

The application is fully responsive and optimized for:
- **Desktop**: Full-featured dashboard experience with 3D design tools
- **Tablet**: Touch-optimized interface for field work and presentations
- **Mobile**: Essential features accessible on-the-go

## 🌍 Localization

- **Primary Language**: Turkish (Turkish solar market focus)
- **Currency**: Turkish Lira (₺)
- **Regional Data**: Complete Turkish city database with solar irradiance data
- **Weather**: Localized weather data for Turkey via OpenWeatherMap
- **Date/Time**: Turkish locale formatting

## 🔧 Configuration

### **Next.js Configuration**
- **Turbopack**: Enabled for faster development builds
- **Server External Packages**: Sharp, bcryptjs for optimization
- **Optimized Package Imports**: Lucide React, date-fns for better performance
- **Bundle Analyzer**: Available for production analysis

### **Database Configuration**
- **SQLite**: Default for development (easily switchable to PostgreSQL for production)
- **Automatic Migrations**: Prisma handles schema changes
- **Seeding**: Comprehensive test data including Turkish regional data
- **Studio Access**: Visual database management via Prisma Studio

### **Security Configuration**
- **NextAuth.js**: Session-based authentication with multiple providers
- **CSRF Protection**: Built-in Next.js protection
- **Rate Limiting**: Upstash Redis integration for API protection
- **Input Validation**: Zod schemas throughout the application

## 📈 Performance Features

- **Server-Side Rendering**: Optimized initial page loads
- **Image Optimization**: Next.js automatic optimization
- **Code Splitting**: Lazy loading of 3D components and heavy features
- **API Caching**: Strategic caching for external API calls (weather, exchange rates)
- **Bundle Optimization**: Tree shaking and dead code elimination
- **Turbopack**: Fast refresh and HMR for development

## 🔍 API Integrations Status

The platform includes real-time integration with external services:

- **✅ OpenWeatherMap API**: Live weather data
- **✅ TCMB Exchange Rates**: Real-time Turkish Lira exchange rates
- **✅ Resend Email Service**: Automated email notifications
- **✅ NextAuth.js**: Google OAuth and credential authentication
- **⚠️ Google Maps API**: Requires API key configuration
- **⚠️ Iyzico Payment**: Sandbox mode (requires production keys for live payments)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes with proper TypeScript types
4. Add tests for new functionality
5. Run the full test suite (`npm run test:all`)
6. Commit your changes (`git commit -m 'Add some amazing feature'`)
7. Push to the branch (`git push origin feature/amazing-feature`)
8. Open a Pull Request

### **Development Guidelines**
- Follow the existing code structure and patterns
- Use TypeScript for all new code
- Add proper error handling and loading states
- Include tests for new features
- Update documentation as needed

## 📄 License

This project is proprietary software developed for Trakya Solar energy solutions.

## 📞 Support

For technical support or questions:
- **Email**: admin@trakyasolar.com
- **System Status**: Check `/dashboard/database` page for real-time system health
- **Database Management**: Access via `npm run db:studio`
- **Development Issues**: Create an issue in the repository

## 🎯 Quick Start Checklist

- [ ] Clone repository and install dependencies
- [ ] Configure `.env.local` with required environment variables
- [ ] Run database setup (`npm run db:generate && npm run db:migrate:dev && npm run db:seed`)
- [ ] Start development server (`npm run dev`)
- [ ] Contact administrator for access credentials
- [ ] Explore the Proje Tasarımcısı (Project Designer) feature
- [ ] Check admin dashboard at `/dashboard/database`

---

**🌞 Built with passion for sustainable energy solutions in Turkey 🇹🇷**

*Empowering solar energy businesses with modern, efficient, and comprehensive project management tools.*