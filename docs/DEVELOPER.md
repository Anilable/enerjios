# 🛠️ Developer Guide - Trakya Solar Platform

Comprehensive developer guide for contributing to and extending the Trakya Solar platform.

## Table of Contents

- [Development Setup](#development-setup)
- [Architecture Overview](#architecture-overview)
- [Code Standards](#code-standards)
- [Database Schema](#database-schema)
- [API Development](#api-development)
- [Frontend Development](#frontend-development)
- [Testing Strategy](#testing-strategy)
- [Deployment](#deployment)
- [Contributing](#contributing)

## Development Setup

### Prerequisites

Ensure you have the following installed:
- **Node.js**: Version 20+ LTS
- **npm**: Version 9+
- **PostgreSQL**: Version 15+
- **Redis**: Version 7+ (optional, for caching)
- **Git**: Latest version

### Local Environment Setup

1. **Clone the Repository**
   ```bash
   git clone <repository-url>
   cd trakya-solar
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Environment Configuration**
   ```bash
   cp .env.example .env.local
   ```

   Configure the following variables in `.env.local`:
   ```env
   # Database
   DATABASE_URL="postgresql://user:password@localhost:5432/trakyasolar_dev"
   
   # Authentication
   NEXTAUTH_URL="http://localhost:3000"
   NEXTAUTH_SECRET="development-secret-key"
   
   # External APIs
   MAPBOX_ACCESS_TOKEN="pk.your-development-token"
   
   # Development flags
   NODE_ENV="development"
   ```

4. **Database Setup**
   ```bash
   # Run migrations
   npx prisma migrate dev
   
   # Seed database with test data
   npx prisma db seed
   ```

5. **Start Development Server**
   ```bash
   npm run dev
   ```

   The application will be available at `http://localhost:3000`.

### Development Tools

#### Essential VS Code Extensions
- **ES7+ React/Redux/React-Native snippets**
- **Prettier - Code formatter**
- **ESLint**
- **TypeScript Importer**
- **Prisma**
- **Tailwind CSS IntelliSense**
- **Auto Rename Tag**
- **GitLens**

#### Recommended Browser Extensions
- **React Developer Tools**
- **Redux DevTools** (if using Redux)
- **Lighthouse** (for performance auditing)

## Architecture Overview

### Technology Stack

#### Frontend
- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: Shadcn/ui
- **Animations**: Framer Motion
- **3D Graphics**: Three.js, React Three Fiber
- **Maps**: Mapbox GL JS
- **State Management**: React Context + Zustand (for complex state)

#### Backend
- **Runtime**: Node.js
- **Framework**: Next.js API Routes
- **Database ORM**: Prisma
- **Authentication**: NextAuth.js
- **Validation**: Zod
- **File Upload**: Custom middleware
- **Caching**: Redis (optional)

#### Database
- **Primary**: PostgreSQL
- **Cache**: Redis
- **Search**: PostgreSQL Full-Text Search

#### Infrastructure
- **Hosting**: Vercel (recommended)
- **Database**: PostgreSQL (Vercel Postgres or self-hosted)
- **File Storage**: Vercel Blob or AWS S3
- **Monitoring**: Sentry, Vercel Analytics

### Project Structure

```
trakya-solar/
├── prisma/                    # Database schema and migrations
│   ├── migrations/
│   ├── schema.prisma
│   └── seed.ts
├── public/                    # Static assets
│   ├── icons/
│   ├── images/
│   └── data/
├── src/
│   ├── app/                   # Next.js App Router
│   │   ├── (auth)/           # Auth-protected routes
│   │   ├── (dashboard)/      # Dashboard routes
│   │   ├── api/              # API endpoints
│   │   ├── globals.css       # Global styles
│   │   ├── layout.tsx        # Root layout
│   │   └── page.tsx          # Home page
│   ├── components/           # Reusable UI components
│   │   ├── ui/               # Base UI components
│   │   ├── forms/            # Form components
│   │   ├── charts/           # Chart components
│   │   └── dashboard/        # Dashboard-specific components
│   ├── lib/                  # Utility functions
│   │   ├── db.ts            # Database connection
│   │   ├── auth.ts          # Authentication config
│   │   ├── utils.ts         # General utilities
│   │   └── validations.ts   # Zod schemas
│   ├── hooks/               # Custom React hooks
│   ├── types/               # TypeScript definitions
│   ├── data/                # Static data and constants
│   └── middleware.ts        # Next.js middleware
├── tests/                   # Test files
│   ├── unit/
│   ├── integration/
│   └── e2e/
├── docs/                    # Documentation
├── scripts/                 # Build and deployment scripts
└── config files             # Various configuration files
```

## Code Standards

### TypeScript Configuration

The project uses strict TypeScript configuration:
```json
{
  "compilerOptions": {
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true
  }
}
```

### Code Style Guidelines

#### General Principles
- **Consistency**: Follow established patterns
- **Readability**: Code should be self-documenting
- **Performance**: Optimize for performance where necessary
- **Security**: Always validate input and sanitize output
- **Accessibility**: Follow WCAG 2.1 guidelines

#### Naming Conventions
```typescript
// Variables and functions: camelCase
const userName = 'john_doe'
const calculateROI = (investment: number, returns: number) => {}

// Constants: SCREAMING_SNAKE_CASE
const MAX_FILE_SIZE = 5 * 1024 * 1024

// Components: PascalCase
const ProjectDashboard = () => {}

// Types and interfaces: PascalCase
interface UserProfile {
  id: string
  name: string
}

// Enums: PascalCase
enum ProjectStatus {
  PLANNING = 'planning',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed'
}
```

#### File Organization
```typescript
// Import order
import React from 'react'                    // React imports
import { NextApiRequest } from 'next'        // Next.js imports
import { prisma } from '@/lib/db'            // Internal imports
import { Button } from '@/components/ui'     // Component imports
import type { User } from '@/types'          // Type imports
```

#### Component Structure
```typescript
interface ComponentProps {
  title: string
  onSubmit?: (data: FormData) => void
  className?: string
}

export function Component({ 
  title, 
  onSubmit, 
  className 
}: ComponentProps) {
  // Hooks first
  const [state, setState] = useState()
  
  // Event handlers
  const handleSubmit = useCallback(() => {
    // Implementation
  }, [])
  
  // Effects
  useEffect(() => {
    // Side effects
  }, [])
  
  // Early returns
  if (!title) return null
  
  // Main render
  return (
    <div className={cn('base-classes', className)}>
      {/* JSX content */}
    </div>
  )
}
```

### ESLint Configuration

The project uses comprehensive ESLint rules:
```json
{
  "extends": [
    "next/core-web-vitals",
    "@typescript-eslint/recommended",
    "prettier"
  ],
  "rules": {
    "@typescript-eslint/no-unused-vars": "error",
    "@typescript-eslint/no-explicit-any": "warn",
    "prefer-const": "error",
    "no-var": "error"
  }
}
```

## Database Schema

### Core Models

#### User Model
```prisma
model User {
  id            String    @id @default(cuid())
  email         String    @unique
  name          String?
  role          UserRole  @default(CUSTOMER)
  status        UserStatus @default(PENDING)
  phone         String?
  password      String?
  image         String?
  companyId     String?
  company       Company?  @relation(fields: [companyId], references: [id])
  projects      Project[]
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
  
  @@map("users")
}
```

**Recent Changes:**
- **Removed `settings` field**: User settings are now managed client-side using localStorage for better performance
- **Added `status` field**: Track user account status (PENDING, ACTIVE, SUSPENDED)
- **Added `phone` field**: Direct phone number storage without JSON parsing

#### Company Model
```prisma
model Company {
  id            String    @id @default(cuid())
  name          String
  email         String    @unique
  phone         String?
  address       String?
  users         User[]
  projects      Project[]
  customers     Customer[]
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
  
  @@map("companies")
}
```

#### Project Model
```prisma
model Project {
  id              String        @id @default(cuid())
  name            String
  status          ProjectStatus @default(PLANNING)
  systemSize      Float
  estimatedOutput Int
  estimatedCost   Float
  actualCost      Float?
  location        Json
  companyId       String
  customerId      String
  company         Company       @relation(fields: [companyId], references: [id])
  customer        Customer      @relation(fields: [customerId], references: [id])
  systemData      SystemData[]
  createdAt       DateTime      @default(now())
  updatedAt       DateTime      @updatedAt
  
  @@map("projects")
}
```

### Settings Architecture

#### Client-Side Settings Management

The platform has migrated from database-stored user settings to a hybrid approach:

**Client-Side Storage (localStorage):**
- Theme preferences (dark/light mode)
- Language selection
- Dashboard layout preferences
- UI state and customizations

**Server-Side Storage (Database):**
- Security settings
- Notification preferences
- Company-level settings
- Compliance-related preferences

#### Implementation Details

```typescript
// Client-side settings management
interface ClientSettings {
  theme: 'light' | 'dark' | 'system'
  language: 'tr' | 'en'
  timezone: string
  dashboardLayout: DashboardLayout
}

// Server-side settings (stored in separate tables)
interface ServerSettings {
  notifications: NotificationPreferences
  security: SecuritySettings
  privacy: PrivacySettings
}
```

#### Migration Impact

The removal of the `settings` JSON field from the User model affects:
- `/api/user/settings` - Now returns structured data instead of parsing JSON
- `/api/user/preferences` - Needs to be updated to use new storage method
- `/api/user/notifications` - Needs to be updated to use new storage method
- Settings components - Should use localStorage for client-side preferences

### Database Migrations

#### Creating Migrations
```bash
# Create a new migration
npx prisma migrate dev --name migration_name

# Apply migrations to production
npx prisma migrate deploy
```

#### Recent Migration: Remove User Settings Field
```sql
-- Migration: remove_user_settings_field
ALTER TABLE "User" DROP COLUMN "settings";
```

#### Migration Best Practices
- Always review migration SQL before applying
- Test migrations on development data first
- Create rollback strategies for complex changes
- Document breaking changes
- Update API endpoints that depend on removed fields

### Seeding Data

The seed script provides test data for development:
```typescript
// prisma/seed.ts
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // Create test company
  const company = await prisma.company.create({
    data: {
      name: 'Solar Tech Demo',
      email: 'demo@solartech.com'
    }
  })
  
  // Create test users
  const admin = await prisma.user.create({
    data: {
      email: 'admin@solartech.com',
      name: 'Admin User',
      role: 'ADMIN',
      companyId: company.id
    }
  })
  
  // Create test projects
  // ... more seed data
}

main()
```

## API Development

### API Route Structure

#### Reports API Implementation

The Reports API provides comprehensive business intelligence with multiple report types and advanced data aggregation:

```typescript
// src/app/api/reports/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth-utils'
import { checkApiPermissions } from '@/lib/permissions'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth()
    
    // Check permissions
    const hasAccess = checkApiPermissions(
      user.role as any,
      user.id,
      ['reports:read'],
      undefined
    )

    if (!hasAccess) {
      return NextResponse.json(
        { error: 'Bu işlem için yetkiniz bulunmamaktadır' },
        { status: 403 }
      )
    }

    const searchParams = request.nextUrl.searchParams
    const type = searchParams.get('type') || 'sales-summary'
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')
    const groupBy = searchParams.get('groupBy') || 'month'

    const dateFilter = startDate && endDate ? {
      gte: new Date(startDate),
      lte: new Date(endDate)
    } : undefined

    // Route to different report handlers
    switch (type) {
      case 'sales-summary':
        return await getSalesSummary(dateFilter, groupBy)
      case 'project-performance':
        return await getProjectPerformance(dateFilter)
      case 'customer-analytics':
        return await getCustomerAnalytics(dateFilter)
      case 'financial-overview':
        return await getFinancialOverview(dateFilter)
      case 'company-performance':
        if (user.role !== 'ADMIN') {
          return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 403 })
        }
        return await getCompanyPerformance(dateFilter)
      default:
        return NextResponse.json({ error: 'Geçersiz rapor tipi' }, { status: 400 })
    }
  } catch (error) {
    console.error('Reports API error:', error)
    return NextResponse.json(
      { error: 'Rapor verileri alınırken hata oluştu' },
      { status: 500 }
    )
  }
}

// Example report handler with data aggregation
async function getSalesSummary(dateFilter: any, groupBy: string) {
  const quotes = await prisma.quote.findMany({
    where: {
      status: 'APPROVED',
      ...(dateFilter && { approvedAt: dateFilter })
    },
    select: {
      total: true,
      approvedAt: true,
      createdAt: true
    },
    orderBy: {
      approvedAt: 'asc'
    }
  })

  // Group data by period using utility function
  const groupedData = groupDataByPeriod(quotes, groupBy, 'approvedAt')
  
  return NextResponse.json({
    data: groupedData,
    summary: {
      totalSales: quotes.reduce((sum, quote) => sum + quote.total, 0),
      totalCount: quotes.length,
      averageValue: quotes.length > 0 ? quotes.reduce((sum, quote) => sum + quote.total, 0) / quotes.length : 0
    }
  })
}
```

#### Basic API Route Example
```typescript
// src/app/api/projects/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { z } from 'zod'
import { prisma } from '@/lib/db'
import { authOptions } from '@/lib/auth'

const createProjectSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  customerId: z.string().cuid(),
  systemSize: z.number().positive(),
  estimatedOutput: z.number().positive()
})

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' }, 
        { status: 401 }
      )
    }
    
    const projects = await prisma.project.findMany({
      where: {
        companyId: session.user.companyId
      },
      include: {
        customer: {
          select: { name: true, email: true }
        }
      }
    })
    
    return NextResponse.json({ projects })
  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' }, 
        { status: 401 }
      )
    }
    
    const body = await request.json()
    const validatedData = createProjectSchema.parse(body)
    
    const project = await prisma.project.create({
      data: {
        ...validatedData,
        companyId: session.user.companyId
      }
    })
    
    return NextResponse.json({ project }, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      )
    }
    
    console.error('API Error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
```

#### Data Aggregation Utilities

The Reports API includes utility functions for data grouping and formatting:

```typescript
// Utility function for grouping data by time periods
function groupDataByPeriod(data: any[], groupBy: string, dateField: string) {
  const grouped: { [key: string]: any } = {}
  
  data.forEach(item => {
    const date = new Date(item[dateField])
    let key: string
    
    switch (groupBy) {
      case 'day':
        key = date.toISOString().split('T')[0]
        break
      case 'week':
        const weekStart = new Date(date)
        weekStart.setDate(date.getDate() - date.getDay())
        key = weekStart.toISOString().split('T')[0]
        break
      case 'month':
        key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
        break
      default:
        key = date.toISOString().split('T')[0]
    }
    
    if (!grouped[key]) {
      grouped[key] = {
        period: formatPeriodLabel(key, groupBy),
        totalAmount: 0,
        count: 0
      }
    }
    
    grouped[key].totalAmount += item.total || 0
    grouped[key].count += 1
  })
  
  return Object.values(grouped).sort((a: any, b: any) => a.period.localeCompare(b.period))
}

// Turkish locale formatting for periods
function formatPeriodLabel(key: string, groupBy: string): string {
  const date = new Date(key)
  
  switch (groupBy) {
    case 'day':
      return date.toLocaleDateString('tr-TR')
    case 'week':
      const weekEnd = new Date(date)
      weekEnd.setDate(date.getDate() + 6)
      return `${date.toLocaleDateString('tr-TR')} - ${weekEnd.toLocaleDateString('tr-TR')}`
    case 'month':
      return date.toLocaleDateString('tr-TR', { year: 'numeric', month: 'long' })
    default:
      return key
  }
}
```

#### Advanced API Route with Multiple Endpoints
```typescript
// src/app/api/finance/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth-utils'
import { checkApiPermissions } from '@/lib/permissions'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth()
    
    // Check permissions
    const hasAccess = checkApiPermissions(
      user.role as any,
      user.id,
      ['finance:read'],
      undefined
    )

    if (!hasAccess) {
      return NextResponse.json(
        { error: 'Bu işlem için yetkiniz bulunmamaktadır' },
        { status: 403 }
      )
    }

    const searchParams = request.nextUrl.searchParams
    const type = searchParams.get('type') || 'overview'

    // Route to different handlers based on query parameter
    switch (type) {
      case 'overview':
        return await getFinancialOverview()
      case 'invoices':
        return await getInvoices()
      case 'expenses':
        return await getExpenses()
      case 'revenue':
        return await getRevenueData()
      default:
        return NextResponse.json({ error: 'Geçersiz tip' }, { status: 400 })
    }
  } catch (error) {
    console.error('Finance API error:', error)
    return NextResponse.json(
      { error: 'Finansal veriler alınırken hata oluştu' },
      { status: 500 }
    )
  }
}

// Separate handler functions for different data types
async function getFinancialOverview() {
  const currentDate = new Date()
  const currentMonth = currentDate.getMonth()
  const currentYear = currentDate.getFullYear()
  
  // Complex aggregation queries
  const quotes = await prisma.quote.findMany({
    where: {
      status: 'APPROVED',
      approvedAt: {
        gte: new Date(currentYear, currentMonth, 1),
        lt: new Date(currentYear, currentMonth + 1, 1)
      }
    },
    select: {
      total: true,
      approvedAt: true
    }
  })

  const monthlyRevenue = quotes.reduce((sum, quote) => sum + quote.total, 0)
  
  // Return structured financial data
  return NextResponse.json({
    monthlyRevenue,
    monthlyExpenses: 0, // Calculate from projects
    netProfit: monthlyRevenue,
    pendingAmount: 0,
    pendingCount: 0
  })
}
```

### Authentication Middleware

```typescript
// src/lib/auth.ts
import { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { prisma } from './db'
import bcrypt from 'bcryptjs'

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Missing credentials')
        }
        
        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
          include: { company: true }
        })
        
        if (!user || !await bcrypt.compare(credentials.password, user.password)) {
          throw new Error('Invalid credentials')
        }
        
        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          companyId: user.companyId
        }
      }
    })
  ],
  session: { strategy: 'jwt' },
  callbacks: {
    jwt: async ({ token, user }) => {
      if (user) {
        token.role = user.role
        token.companyId = user.companyId
      }
      return token
    },
    session: async ({ session, token }) => {
      if (token) {
        session.user.id = token.sub!
        session.user.role = token.role
        session.user.companyId = token.companyId
      }
      return session
    }
  }
}
```

### Error Handling

```typescript
// src/lib/errors.ts
export class APIError extends Error {
  constructor(
    message: string,
    public statusCode: number = 500,
    public code?: string
  ) {
    super(message)
    this.name = 'APIError'
  }
}

export class ValidationError extends APIError {
  constructor(message: string, public details?: any) {
    super(message, 400, 'VALIDATION_ERROR')
  }
}

export class AuthenticationError extends APIError {
  constructor(message: string = 'Authentication required') {
    super(message, 401, 'AUTHENTICATION_ERROR')
  }
}

// Error handler middleware
export function handleAPIError(error: unknown) {
  if (error instanceof APIError) {
    return NextResponse.json(
      { 
        error: error.message, 
        code: error.code,
        ...(error instanceof ValidationError && { details: error.details })
      },
      { status: error.statusCode }
    )
  }
  
  console.error('Unexpected API Error:', error)
  return NextResponse.json(
    { error: 'Internal server error' },
    { status: 500 }
  )
}
```

## Frontend Development

### Component Development

#### Base Component Structure
```typescript
// src/components/ui/button.tsx
import { cn } from '@/lib/utils'
import { ButtonHTMLAttributes, forwardRef } from 'react'
import { cva, type VariantProps } from 'class-variance-authority'

const buttonVariants = cva(
  'inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        default: 'bg-primary text-primary-foreground hover:bg-primary/90',
        destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/90',
        outline: 'border border-input hover:bg-accent hover:text-accent-foreground',
        secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
        ghost: 'hover:bg-accent hover:text-accent-foreground',
        link: 'underline-offset-4 hover:underline text-primary'
      },
      size: {
        default: 'h-9 px-4 py-2',
        sm: 'h-8 rounded-md px-3 text-xs',
        lg: 'h-10 rounded-md px-8',
        icon: 'h-9 w-9'
      }
    },
    defaultVariants: {
      variant: 'default',
      size: 'default'
    }
  }
)

export interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)

Button.displayName = 'Button'

export { Button, buttonVariants }
```

#### Custom Hooks
```typescript
// src/hooks/use-projects.ts
import { useState, useEffect } from 'react'
import { Project } from '@/types'

interface UseProjectsOptions {
  companyId?: string
  status?: string
  limit?: number
}

export function useProjects(options: UseProjectsOptions = {}) {
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  useEffect(() => {
    async function fetchProjects() {
      try {
        setLoading(true)
        setError(null)
        
        const params = new URLSearchParams()
        if (options.status) params.set('status', options.status)
        if (options.limit) params.set('limit', options.limit.toString())
        
        const response = await fetch(`/api/projects?${params}`)
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`)
        }
        
        const data = await response.json()
        setProjects(data.projects)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch projects')
      } finally {
        setLoading(false)
      }
    }
    
    fetchProjects()
  }, [options.status, options.limit])
  
  const refetch = useCallback(() => {
    fetchProjects()
  }, [options.status, options.limit])
  
  return { projects, loading, error, refetch }
}
```

### State Management

#### Context-based State
```typescript
// src/contexts/app-context.tsx
import { createContext, useContext, useReducer, ReactNode } from 'react'

interface AppState {
  user: User | null
  currentProject: Project | null
  notifications: Notification[]
}

type AppAction =
  | { type: 'SET_USER'; payload: User | null }
  | { type: 'SET_CURRENT_PROJECT'; payload: Project | null }
  | { type: 'ADD_NOTIFICATION'; payload: Notification }
  | { type: 'REMOVE_NOTIFICATION'; payload: string }

function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'SET_USER':
      return { ...state, user: action.payload }
    case 'SET_CURRENT_PROJECT':
      return { ...state, currentProject: action.payload }
    case 'ADD_NOTIFICATION':
      return { 
        ...state, 
        notifications: [...state.notifications, action.payload] 
      }
    case 'REMOVE_NOTIFICATION':
      return {
        ...state,
        notifications: state.notifications.filter(n => n.id !== action.payload)
      }
    default:
      return state
  }
}

const AppContext = createContext<{
  state: AppState
  dispatch: React.Dispatch<AppAction>
} | null>(null)

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, {
    user: null,
    currentProject: null,
    notifications: []
  })
  
  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  )
}

export function useApp() {
  const context = useContext(AppContext)
  if (!context) {
    throw new Error('useApp must be used within an AppProvider')
  }
  return context
}
```

#### Zustand Store (for complex state)
```typescript
// src/stores/dashboard-store.ts
import { create } from 'zustand'
import { subscribeWithSelector } from 'zustand/middleware'

interface DashboardState {
  selectedDateRange: DateRange
  activeFilters: FilterOptions
  dashboardData: DashboardData | null
  loading: boolean
  error: string | null
}

interface DashboardActions {
  setDateRange: (range: DateRange) => void
  setFilters: (filters: FilterOptions) => void
  fetchDashboardData: () => Promise<void>
  reset: () => void
}

export const useDashboardStore = create<DashboardState & DashboardActions>()(
  subscribeWithSelector((set, get) => ({
    // State
    selectedDateRange: { start: new Date(), end: new Date() },
    activeFilters: {},
    dashboardData: null,
    loading: false,
    error: null,
    
    // Actions
    setDateRange: (range) => set({ selectedDateRange: range }),
    setFilters: (filters) => set({ activeFilters: filters }),
    
    fetchDashboardData: async () => {
      const { selectedDateRange, activeFilters } = get()
      
      try {
        set({ loading: true, error: null })
        
        const response = await fetch('/api/dashboard', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ dateRange: selectedDateRange, filters: activeFilters })
        })
        
        if (!response.ok) {
          throw new Error('Failed to fetch dashboard data')
        }
        
        const data = await response.json()
        set({ dashboardData: data, loading: false })
      } catch (error) {
        set({ 
          error: error instanceof Error ? error.message : 'Unknown error',
          loading: false 
        })
      }
    },
    
    reset: () => set({
      selectedDateRange: { start: new Date(), end: new Date() },
      activeFilters: {},
      dashboardData: null,
      loading: false,
      error: null
    })
  }))
)
```

## Testing Strategy

### Test Structure

```
tests/
├── unit/                    # Unit tests
│   ├── components/
│   ├── hooks/
│   ├── lib/
│   └── utils/
├── integration/             # Integration tests
│   ├── api/
│   └── database/
├── e2e/                     # End-to-end tests
│   ├── auth.spec.ts
│   ├── dashboard.spec.ts
│   └── projects.spec.ts
└── __mocks__/              # Mock implementations
    ├── next-auth.ts
    └── mapbox-gl.ts
```

### Unit Testing

```typescript
// src/components/ui/__tests__/Button.test.tsx
import { render, screen, fireEvent } from '@testing-library/react'
import { Button } from '../Button'

describe('Button', () => {
  test('renders with correct text', () => {
    render(<Button>Click me</Button>)
    expect(screen.getByRole('button')).toHaveTextContent('Click me')
  })
  
  test('applies variant classes correctly', () => {
    render(<Button variant="destructive">Delete</Button>)
    const button = screen.getByRole('button')
    expect(button).toHaveClass('bg-destructive')
  })
  
  test('handles click events', () => {
    const handleClick = jest.fn()
    render(<Button onClick={handleClick}>Click me</Button>)
    
    fireEvent.click(screen.getByRole('button'))
    expect(handleClick).toHaveBeenCalledTimes(1)
  })
  
  test('forwards ref correctly', () => {
    const ref = React.createRef<HTMLButtonElement>()
    render(<Button ref={ref}>Button</Button>)
    
    expect(ref.current).toBeInstanceOf(HTMLButtonElement)
  })
})
```

### Integration Testing

```typescript
// src/app/api/__tests__/projects.test.ts
import { POST } from '../projects/route'
import { NextRequest } from 'next/server'
import { getServerSession } from 'next-auth'

jest.mock('next-auth')
jest.mock('@/lib/db')

const mockSession = {
  user: {
    id: 'user-1',
    companyId: 'company-1',
    role: 'USER'
  }
}

describe('/api/projects', () => {
  beforeEach(() => {
    ;(getServerSession as jest.Mock).mockResolvedValue(mockSession)
  })
  
  test('creates project successfully', async () => {
    const requestData = {
      name: 'Test Project',
      customerId: 'customer-1',
      systemSize: 10.5,
      estimatedOutput: 12000
    }
    
    const request = new NextRequest('http://localhost/api/projects', {
      method: 'POST',
      body: JSON.stringify(requestData),
      headers: { 'Content-Type': 'application/json' }
    })
    
    const response = await POST(request)
    const data = await response.json()
    
    expect(response.status).toBe(201)
    expect(data.project).toMatchObject({
      name: 'Test Project',
      companyId: 'company-1'
    })
  })
  
  test('returns 401 for unauthenticated requests', async () => {
    ;(getServerSession as jest.Mock).mockResolvedValue(null)
    
    const request = new NextRequest('http://localhost/api/projects', {
      method: 'POST',
      body: JSON.stringify({})
    })
    
    const response = await POST(request)
    expect(response.status).toBe(401)
  })
})
```

### E2E Testing

```typescript
// tests/e2e/dashboard.spec.ts
import { test, expect } from '@playwright/test'

test.describe('Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    // Login before each test
    await page.goto('/login')
    await page.fill('[data-testid="email"]', 'admin@test.com')
    await page.fill('[data-testid="password"]', 'password')
    await page.click('[data-testid="login-button"]')
    await page.waitForURL('/dashboard')
  })
  
  test('displays key metrics', async ({ page }) => {
    // Check that key metrics are displayed
    await expect(page.locator('[data-testid="total-projects"]')).toBeVisible()
    await expect(page.locator('[data-testid="active-projects"]')).toBeVisible()
    await expect(page.locator('[data-testid="total-capacity"]')).toBeVisible()
    await expect(page.locator('[data-testid="total-output"]')).toBeVisible()
  })
  
  test('navigates to projects page', async ({ page }) => {
    await page.click('[data-testid="projects-nav"]')
    await page.waitForURL('/projects')
    
    await expect(page.locator('h1')).toContainText('Projects')
  })
  
  test('responsive design works on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 })
    
    // Mobile menu should be visible
    await expect(page.locator('[data-testid="mobile-menu"]')).toBeVisible()
    
    // Desktop navigation should be hidden
    await expect(page.locator('[data-testid="desktop-nav"]')).toBeHidden()
  })
})
```

### Test Configuration

```javascript
// jest.config.js
const nextJest = require('next/jest')

const createJestConfig = nextJest({
  dir: './',
})

const customJestConfig = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  moduleNameMapping: {
    '^@/components/(.*)$': '<rootDir>/src/components/$1',
    '^@/lib/(.*)$': '<rootDir>/src/lib/$1',
    '^@/hooks/(.*)$': '<rootDir>/src/hooks/$1',
  },
  testEnvironment: 'jest-environment-jsdom',
  collectCoverageFrom: [
    'src/**/*.{js,jsx,ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/*.stories.{js,jsx,ts,tsx}',
  ],
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70,
    },
  },
}

module.exports = createJestConfig(customJestConfig)
```

## Deployment

### Build Process

```json
{
  "scripts": {
    "build": "next build",
    "start": "next start",
    "build:analyze": "ANALYZE=true next build",
    "build:production": "NODE_ENV=production next build"
  }
}
```

### Environment Variables

Ensure all required environment variables are configured for production:
- Database connection strings
- Authentication secrets
- External API keys
- Monitoring service tokens

### Performance Optimization

#### Bundle Analysis
```bash
# Analyze bundle size
npm run build:analyze

# Check bundle composition
npx @next/bundle-analyzer
```

#### Code Splitting
```typescript
// Dynamic imports for heavy components
const HeavyChart = dynamic(() => import('@/components/HeavyChart'), {
  ssr: false,
  loading: () => <div>Loading chart...</div>
})

// Route-based code splitting (automatic with Next.js App Router)
```

## Contributing

### Development Workflow

1. **Fork the Repository**
   ```bash
   git clone <your-fork-url>
   cd trakya-solar
   git remote add upstream <original-repo-url>
   ```

2. **Create Feature Branch**
   ```bash
   git checkout -b feature/new-feature-name
   ```

3. **Make Changes**
   - Write code following the style guide
   - Add tests for new functionality
   - Update documentation if needed

4. **Test Changes**
   ```bash
   npm run test
   npm run test:e2e
   npm run build
   ```

5. **Commit Changes**
   ```bash
   git add .
   git commit -m "feat: add new feature"
   ```

6. **Submit Pull Request**
   - Push to your fork
   - Create pull request
   - Describe changes thoroughly
   - Link related issues

### Code Review Process

#### Pull Request Guidelines
- Clear, descriptive title
- Detailed description of changes
- Screenshots for UI changes
- Tests for new functionality
- Documentation updates

#### Review Criteria
- Code quality and consistency
- Test coverage
- Performance impact
- Security considerations
- Documentation completeness

### Issue Reporting

#### Bug Reports
- Clear description of the issue
- Steps to reproduce
- Expected vs actual behavior
- Environment details
- Screenshots if applicable

#### Feature Requests
- Problem statement
- Proposed solution
- Use cases
- Implementation considerations

---

## Additional Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Prisma Documentation](https://prisma.io/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [TypeScript Handbook](https://www.typescriptlang.org/docs)
- [React Testing Library](https://testing-library.com/docs/react-testing-library/intro)
- [Playwright Documentation](https://playwright.dev)

For questions or support, contact the development team or create an issue in the repository.