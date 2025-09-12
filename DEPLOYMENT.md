# 🚀 Trakya Solar Production Deployment Guide

## Overview
Bu doküman Trakya Solar platformunun production ortamına deploy edilmesi için gereken tüm adımları içermektedir.

## 📋 Pre-deployment Checklist

### ✅ 1. Production Environment Setup
- [x] Next.js production configuration (`next.config.ts`)
- [x] Vercel deployment configuration (`vercel.json`)
- [x] Environment variables template (`.env.production.example`)
- [x] PostgreSQL production database setup
- [x] Production seed data (`prisma/seed.production.ts`)

### ✅ 2. Performance Optimization
- [x] Bundle size optimization with analyzer
- [x] Image optimization and lazy loading
- [x] Dynamic imports for heavy components
- [x] Loading states and skeleton components
- [x] Code splitting implementation

### ✅ 3. Security Hardening
- [x] API rate limiting with Upstash Redis
- [x] Input validation and sanitization
- [x] Security headers configuration
- [x] CORS and CSP policies
- [x] Authentication security improvements

### ✅ 4. Monitoring & Analytics
- [x] Sentry error monitoring (client/server/edge)
- [x] Google Analytics integration
- [x] SEO optimization with structured data
- [x] Performance monitoring setup

### ✅ 5. Business Integrations
- [x] İyzico payment system integration
- [x] Email service with Resend
- [x] Turkish market specific features
- [x] KVKK compliance implementation

---

## 🔧 Deployment Steps

### Step 1: Environment Setup

1. **Clone the repository:**
   ```bash
   git clone <your-repo-url>
   cd trakya-solar
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Setup environment variables:**
   ```bash
   cp .env.production.example .env.production
   # Fill in all required environment variables
   ```

### Step 2: Database Setup

1. **Setup PostgreSQL production database:**
   ```bash
   # Create production database
   createdb trakya_solar_production
   
   # Run migrations
   npm run db:migrate
   
   # Seed production data
   npm run db:seed:prod
   ```

2. **Verify database connection:**
   ```bash
   npm run db:studio
   ```

### Step 3: Build and Test

1. **Run type checking:**
   ```bash
   npm run type-check
   ```

2. **Run linting:**
   ```bash
   npm run lint
   ```

3. **Build production version:**
   ```bash
   npm run build
   ```

4. **Test production build locally:**
   ```bash
   npm run start
   ```

### Step 4: Vercel Deployment

1. **Install Vercel CLI:**
   ```bash
   npm i -g vercel
   ```

2. **Login to Vercel:**
   ```bash
   vercel login
   ```

3. **Deploy to production:**
   ```bash
   vercel --prod
   ```

4. **Configure custom domain:**
   ```bash
   vercel domains add trakyasolar.com
   ```

---

## 🌍 Environment Variables

### Required Production Variables

```bash
# Database
DATABASE_URL="postgresql://user:password@host:5432/trakya_solar_production"

# Authentication
NEXTAUTH_SECRET="your-production-secret"
NEXTAUTH_URL="https://trakyasolar.com"

# İyzico Payment (Production)
IYZICO_API_KEY="your-production-api-key"
IYZICO_SECRET_KEY="your-production-secret-key"
IYZICO_BASE_URL="https://api.iyzipay.com"

# Email Service
RESEND_API_KEY="your-resend-api-key"

# External APIs
GOOGLE_MAPS_API_KEY="your-google-maps-api-key"
OPENWEATHER_API_KEY="your-openweather-api-key"

# Monitoring
SENTRY_DSN="your-sentry-dsn"
NEXT_PUBLIC_GA_TRACKING_ID="GA-XXXXXXXXX"

# Redis (Rate Limiting)
UPSTASH_REDIS_REST_URL="your-upstash-redis-url"
UPSTASH_REDIS_REST_TOKEN="your-upstash-redis-token"

# Domain
NEXT_PUBLIC_DOMAIN="https://trakyasolar.com"
```

---

## 🔐 Security Configuration

### SSL/TLS Certificate
- Vercel automatically provides SSL certificates
- Custom domain SSL is handled by Vercel

### Security Headers
Configured in `next.config.ts`:
- Content Security Policy (CSP)
- X-Frame-Options
- X-Content-Type-Options
- Referrer-Policy

### API Rate Limiting
- Implemented with Upstash Redis
- Different limits for different endpoints
- IP-based rate limiting

---

## 📊 Monitoring & Analytics

### Error Monitoring (Sentry)
- Client-side error tracking
- Server-side error logging
- Edge function monitoring
- Performance monitoring

### Analytics (Google Analytics)
- Page views tracking
- User behavior analysis
- Conversion tracking
- Turkish market specific events

### Performance Monitoring
- Core Web Vitals tracking
- Bundle size monitoring
- Database query optimization
- API response time monitoring

---

## 💳 Payment Integration

### İyzico Production Setup
1. Get production API credentials from İyzico
2. Update environment variables
3. Test payment flow in production
4. Setup webhook endpoints
5. Configure 3D Secure

### Supported Payment Methods
- Credit/Debit Cards (Visa, MasterCard, Troy)
- Installment options
- Bank transfers
- Mobile payments

---

## 📧 Email Service

### Resend Configuration
1. Create Resend account and get API key
2. Verify domain for sending emails
3. Setup DMARC/SPF records
4. Test email delivery

### Email Templates
- Welcome emails (Turkish)
- Quote notifications
- Payment confirmations
- Installation scheduling
- System notifications

---

## 🇹🇷 Turkish Market Compliance

### KVKK (Data Protection)
- ✅ Data processing consent forms
- ✅ User rights implementation
- ✅ Data retention policies
- ✅ Privacy policy pages

### Business Requirements
- Turkish language support
- TRY currency support
- Turkish address formatting
- TC Kimlik validation
- Turkish phone number formatting

---

## 🧪 Testing Checklist

### Pre-deployment Testing
- [ ] User registration/login flow
- [ ] Solar calculator functionality
- [ ] Payment processing (test mode)
- [ ] Email notifications
- [ ] Form validations
- [ ] Mobile responsiveness
- [ ] Performance metrics
- [ ] SEO optimization
- [ ] Error handling

### Post-deployment Testing
- [ ] Domain and SSL certificate
- [ ] Payment flow (production)
- [ ] Email delivery
- [ ] Database connectivity
- [ ] API rate limiting
- [ ] Error monitoring
- [ ] Analytics tracking
- [ ] KVKK compliance forms

---

## 🚨 Troubleshooting

### Common Issues

1. **Build Failures:**
   ```bash
   # Check TypeScript errors
   npm run type-check
   
   # Check linting issues
   npm run lint
   
   # Clear cache and rebuild
   rm -rf .next
   npm run build
   ```

2. **Database Connection Issues:**
   ```bash
   # Test database connection
   npm run db:studio
   
   # Reset database
   npm run db:migrate:reset
   npm run db:seed:prod
   ```

3. **Environment Variables:**
   - Ensure all required variables are set
   - Check for typos in variable names
   - Verify API keys are valid

4. **Payment Issues:**
   - Verify İyzico production credentials
   - Check webhook endpoints
   - Test with real credit cards

---

## 📈 Performance Optimization

### Bundle Size Optimization
- Dynamic imports for heavy components
- Tree shaking unused code
- Image optimization with Next.js Image
- Code splitting by routes

### Database Optimization
- Proper indexing
- Query optimization
- Connection pooling
- Database caching

### Caching Strategy
- Static asset caching (1 year)
- API response caching (configurable)
- Database query caching
- CDN integration

---

## 🛠️ Maintenance

### Regular Tasks
- [ ] Update dependencies monthly
- [ ] Monitor error rates
- [ ] Review performance metrics
- [ ] Update SSL certificates (automatic)
- [ ] Backup database daily
- [ ] Monitor API usage limits

### Updates and Releases
1. Test in staging environment
2. Run full test suite
3. Update changelog
4. Deploy during low traffic hours
5. Monitor for errors post-deployment

---

## 📞 Support and Contacts

### Technical Support
- **Email:** support@trakyasolar.com
- **Phone:** +90 284 XXX XX XX
- **Hours:** Monday-Friday 08:00-18:00 (Turkey Time)

### Emergency Contacts
- **Critical Issues:** emergency@trakyasolar.com
- **Payment Issues:** payments@trakyasolar.com
- **KVKK Requests:** kvkk@trakyasolar.com

---

## 🎯 Success Metrics

### Key Performance Indicators
- Page load time < 2 seconds
- Error rate < 0.1%
- Uptime > 99.9%
- Payment success rate > 95%
- Email delivery rate > 99%

### Business Metrics
- User registrations
- Quote requests
- Payment conversions
- Customer satisfaction
- System performance

---

## 🔄 Backup and Recovery

### Automated Backups
- Database backups every 6 hours
- Code repository backups
- Environment configuration backups
- SSL certificate backups

### Recovery Procedures
1. Database restoration from backup
2. Code deployment rollback
3. DNS configuration restoration
4. SSL certificate recovery

---

**Deployment Date:** ${new Date().toLocaleDateString('tr-TR')}
**Version:** 1.0.0
**Environment:** Production
**Domain:** https://trakyasolar.com

🎉 **Trakya Solar Production ortamı hazır!**