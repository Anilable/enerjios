# Project Structure & Organization

## Root Directory Structure

```
├── src/                    # Main source code
│   ├── app/               # Next.js App Router pages and API routes
│   ├── components/        # Reusable React components
│   ├── lib/              # Utility functions and configurations
│   ├── hooks/            # Custom React hooks
│   ├── types/            # TypeScript type definitions
│   ├── styles/           # Global styles and Tailwind configurations
│   ├── data/             # Static data and constants
│   └── middleware.ts     # Next.js middleware
├── prisma/               # Database schema and migrations
├── public/               # Static assets
├── tests/                # Test files (unit and e2e)
├── docs/                 # Project documentation
└── scripts/              # Build and utility scripts
```

## Source Code Organization (`src/`)

### App Directory (`src/app/`)
- **Route-based structure** following Next.js App Router conventions
- **API routes** in `api/` subdirectories
- **Layout components** for shared UI structure
- **Page components** for route-specific content
- **Loading and error boundaries** for better UX

### Components (`src/components/`)
- **Feature-based organization** (e.g., `dashboard/`, `projects/`, `quotes/`)
- **Shared UI components** in `ui/` subdirectory (Shadcn/ui components)
- **Form components** with React Hook Form integration
- **3D components** for solar panel visualization
- **Chart components** for data visualization

### Library (`src/lib/`)
- **Database utilities** (Prisma client configuration)
- **Authentication** (NextAuth configuration)
- **API clients** for external services (weather, exchange rates)
- **Validation schemas** (Zod schemas)
- **Utility functions** (formatters, calculators, helpers)

### Types (`src/types/`)
- **Database types** (Prisma-generated and custom)
- **API response types**
- **Component prop types**
- **Form validation types**

## Key Directories

### Database (`prisma/`)
- `schema.prisma` - Complete database schema with Turkish market specifics
- `seed.ts` - Development seed data including Turkish regional data
- `migrations/` - Database migration files

### Public Assets (`public/`)
- `images/` - Static images and logos
- `icons/` - Application icons and favicons
- `uploads/` - User-uploaded files (development only)
- `data/` - Static JSON data files

### Documentation (`docs/`)
- `API.md` - API documentation
- `DEPLOYMENT.md` - Deployment instructions
- `DEVELOPER.md` - Developer setup guide
- `USER_GUIDE.md` - User documentation

### Testing (`tests/`)
- `e2e/` - Playwright end-to-end tests
- Unit tests co-located with components using `.test.ts` suffix

## Naming Conventions

### Files and Directories
- **kebab-case** for directories and non-component files
- **PascalCase** for React components
- **camelCase** for utility functions and variables
- **UPPER_CASE** for constants and environment variables

### Components
- **Descriptive names** reflecting functionality (e.g., `ProjectDesigner`, `QuoteGenerator`)
- **Feature prefixes** for domain-specific components (e.g., `SolarPanelPlacement`, `FinancialAnalysis`)
- **UI suffix** for generic UI components (e.g., `ButtonUI`, `ModalUI`)

### Database
- **PascalCase** for model names (e.g., `Project`, `Quote`, `User`)
- **camelCase** for field names (e.g., `createdAt`, `projectType`)
- **Descriptive enum values** (e.g., `ProjectStatus.IN_PROGRESS`)

## Configuration Files

### Root Level
- `package.json` - Dependencies and scripts
- `next.config.ts` - Next.js configuration with security headers
- `tsconfig.json` - TypeScript configuration
- `eslint.config.mjs` - ESLint rules
- `postcss.config.mjs` - PostCSS and Tailwind configuration
- `jest.config.js` - Jest testing configuration
- `playwright.config.ts` - Playwright E2E testing configuration

### Environment
- `.env.example` - Template for environment variables
- `.env.local` - Local development environment variables
- `.env.production` - Production environment variables

## Import Conventions

### Path Aliases
- `@/` - Maps to `src/` directory for clean imports
- Prefer absolute imports over relative imports for better maintainability

### Import Order
1. External libraries (React, Next.js, etc.)
2. Internal utilities and configurations (`@/lib/`)
3. Components (`@/components/`)
4. Types (`@/types/`)
5. Relative imports (same directory)

## Feature Organization

### Multi-Role Dashboard Structure
- **Admin** - System management, user control, database admin
- **Company** - Project management, customer relations, installation tracking
- **Customer** - Project viewing, energy monitoring, document access
- **Farmer** - Agricultural solar systems, crop compatibility

### Domain-Specific Modules
- **Projects** - 3D design, panel placement, performance calculations
- **Quotes** - Generation, delivery, tracking, digital signatures
- **Financial** - ROI analysis, bank comparisons, incentive calculations
- **Installation** - Scheduling, progress tracking, photo documentation
- **Monitoring** - Energy production, system performance, alerts

## Development Workflow

### Branch Structure
- `main` - Production-ready code
- `develop` - Integration branch for features
- `feature/*` - Individual feature development
- `hotfix/*` - Critical production fixes

### Code Organization Principles
- **Single Responsibility** - Each component/function has one clear purpose
- **Feature Cohesion** - Related functionality grouped together
- **Separation of Concerns** - UI, business logic, and data access separated
- **Reusability** - Common patterns extracted into shared components/utilities