# Technology Stack & Development Guidelines

## Core Framework
- **Next.js 15.5.2** with App Router and Turbopack for fast development
- **React 19.1.0** with TypeScript for type safety
- **Node.js** runtime environment

## Frontend Technologies
- **Tailwind CSS 4** for styling with PostCSS
- **Shadcn/ui** component library built on Radix UI primitives
- **React Hook Form** with Zod validation for forms
- **Recharts** for data visualization and charts
- **Lucide React** for icons

## 3D & Mapping
- **Three.js** with React Three Fiber for 3D solar panel visualization
- **Google Maps API** for satellite imagery and location services
- **Mapbox GL** for advanced mapping features

## Backend & Database
- **Prisma ORM** with PostgreSQL database (SQLite for development)
- **NextAuth.js** for authentication with Google OAuth support
- **bcryptjs** for password hashing
- **Server Actions** for API endpoints

## External Integrations
- **OpenWeatherMap API** - Weather data for solar calculations
- **TCMB API** - Turkish Central Bank exchange rates
- **Resend** - Email service for notifications
- **Iyzico** - Payment processing for Turkish market
- **Upstash Redis** - Rate limiting and caching

## Development Tools
- **TypeScript** for type safety across the entire codebase
- **ESLint** with Next.js configuration for code quality
- **Jest** for unit testing with React Testing Library
- **Playwright** for end-to-end testing
- **Prisma Studio** for database management

## Common Commands

### Development
```bash
npm run dev              # Start development server
npm run build           # Build for production
npm run start           # Start production server
npm run type-check      # TypeScript type checking
```

### Database Operations
```bash
npm run db:generate     # Generate Prisma client
npm run db:migrate:dev  # Run database migrations
npm run db:seed         # Seed database with sample data
npm run db:studio       # Open Prisma Studio
npm run db:push         # Push schema changes
```

### Testing
```bash
npm run test            # Run unit tests
npm run test:watch      # Run tests in watch mode
npm run test:coverage   # Generate coverage report
npm run test:e2e        # Run end-to-end tests
npm run test:all        # Run all tests
```

### Code Quality
```bash
npm run lint            # Run ESLint
npm run lint:fix        # Fix ESLint issues
npm run precommit       # Full quality check (lint + type-check + test)
```

## Architecture Patterns

### File Structure
- Use Next.js App Router with `src/app` directory structure
- Components in `src/components` with feature-based organization
- Utilities and helpers in `src/lib`
- Type definitions in `src/types`

### Code Conventions
- TypeScript for all new code with strict type checking
- Server Components by default, Client Components when needed
- Zod schemas for data validation
- Prisma for all database operations
- Error boundaries for robust error handling

### Performance
- Image optimization with Next.js Image component
- Code splitting with dynamic imports for heavy components (3D, maps)
- Server-side rendering for SEO and performance
- Caching strategies for external API calls

### Security
- NextAuth.js for authentication
- Input validation with Zod schemas
- Rate limiting with Upstash Redis
- Secure headers configuration in next.config.ts