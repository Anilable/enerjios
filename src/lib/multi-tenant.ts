import { Session } from 'next-auth'
import { UserRole } from '@prisma/client'

/**
 * Multi-tenant filtering utility for securing data access
 * Ensures users only see their own data based on role
 */

export interface TenantFilter {
  // User-specific filters
  ownerId?: string
  customerId?: string
  companyId?: string
  userId?: string
  assignedEngineerId?: string
  
  // Additional filters for complex queries
  OR?: TenantFilter[]
  AND?: TenantFilter[]
}

export interface MultiTenantOptions {
  session: Session
  allowGlobalAccess?: boolean // For admin override
  includePublic?: boolean     // Include public/shared data
}

/**
 * Get user-specific where clause based on role and session
 */
export function getUserFilter(options: MultiTenantOptions): TenantFilter {
  const { session, allowGlobalAccess = false } = options
  const userId = session.user?.id
  const userRole = session.user?.role as UserRole
  
  if (!userId) {
    throw new Error('Invalid session: No user ID')
  }

  // Admin users can see everything if explicitly allowed
  if (userRole === 'ADMIN' && allowGlobalAccess) {
    return {} // No filtering for admin with global access
  }

  // Base filter: user owns the record
  const baseFilter: TenantFilter = {
    ownerId: userId
  }

  switch (userRole) {
    case 'ADMIN':
      // Admin sees their own data + company data they manage
      return {
        OR: [
          { ownerId: userId },
          // Add company filtering if user has company association
          // { companyId: session.user.companyId }
        ]
      }

    case 'COMPANY':
      // Company users see their company's data + their own data
      return {
        OR: [
          { ownerId: userId },
          { companyId: userId }, // Company user ID as company ID
          // Projects assigned to this company would need proper relation mapping
        ]
      }

    case 'CUSTOMER':
      // Customers see only their own data
      return {
        OR: [
          { ownerId: userId },
          { customerId: userId }
        ]
      }

    case 'FARMER':
      // Farmers see only their own agricultural solar projects
      return {
        OR: [
          { ownerId: userId },
          { customerId: userId }
        ]
      }

    default:
      // Default: only own data
      return baseFilter
  }
}

/**
 * Apply tenant filtering to Prisma where clause
 */
export function applyTenantFilter<T extends Record<string, any>>(
  baseWhere: T,
  options: MultiTenantOptions
): T & { AND?: any[] } {
  const tenantFilter = getUserFilter(options)
  
  // If no tenant filtering needed (admin with global access)
  if (Object.keys(tenantFilter).length === 0) {
    return baseWhere
  }

  // Combine base where with tenant filter
  return {
    ...baseWhere,
    AND: [
      tenantFilter,
      ...(baseWhere.AND || [])
    ]
  }
}

/**
 * Validate user can access specific resource
 */
export async function validateResourceAccess(
  resourceOwnerId: string,
  options: MultiTenantOptions
): Promise<boolean> {
  const { session, allowGlobalAccess = false } = options
  const userId = session.user?.id
  const userRole = session.user?.role as UserRole

  if (!userId) return false

  // Admin with global access can access anything
  if (userRole === 'ADMIN' && allowGlobalAccess) {
    return true
  }

  // User owns the resource
  if (resourceOwnerId === userId) {
    return true
  }

  // Role-specific access rules
  switch (userRole) {
    case 'ADMIN':
      // Admin can access resources in their managed companies
      // TODO: Implement company hierarchy checking
      return true

    case 'COMPANY':
      // Company can access resources of their customers
      // TODO: Implement customer-company relationship checking
      return false

    case 'CUSTOMER':
    case 'FARMER':
      // Customers and farmers can only access their own resources
      return resourceOwnerId === userId

    default:
      return false
  }
}

/**
 * Get projects filter for user
 */
export function getProjectsFilter(options: MultiTenantOptions) {
  return applyTenantFilter({}, options)
}

/**
 * Get customers filter for user
 */
export function getCustomersFilter(options: MultiTenantOptions) {
  const { session } = options
  const userId = session.user?.id
  const userRole = session.user?.role as UserRole

  if (!userId) {
    throw new Error('Invalid session: No user ID')
  }

  switch (userRole) {
    case 'ADMIN':
      return options.allowGlobalAccess ? {} : { userId }

    case 'COMPANY':
      // Company sees customers they serve
      return {
        OR: [
          { userId },
          { projects: { some: { companyId: userId } } }
        ]
      }

    case 'CUSTOMER':
    case 'FARMER':
      // Customers see only themselves
      return { userId }

    default:
      return { userId }
  }
}

/**
 * Get quotes filter for user
 */
export function getQuotesFilter(options: MultiTenantOptions) {
  const { session } = options
  const userId = session.user?.id
  const userRole = session.user?.role as UserRole

  if (!userId) {
    throw new Error('Invalid session: No user ID')
  }

  switch (userRole) {
    case 'ADMIN':
      return options.allowGlobalAccess ? {} : { createdById: userId }

    case 'COMPANY':
      // Company sees quotes they created
      return { createdById: userId }

    case 'CUSTOMER':
    case 'FARMER':
      // Customers see quotes for their projects
      return {
        OR: [
          { createdById: userId },
          { project: { customerId: userId } },
          { project: { customer: { userId } } }
        ]
      }

    default:
      return { createdById: userId }
  }
}

/**
 * Middleware to ensure user session and apply tenant filtering
 */
export function requireAuth(session: Session | null): Session {
  if (!session?.user?.id) {
    throw new Error('Unauthorized: No valid session')
  }
  return session
}

/**
 * Get SQL WHERE clause for user filtering in raw queries
 */
export function getUserSqlFilter(options: MultiTenantOptions): string {
  const { session, allowGlobalAccess = false } = options
  const userId = session.user?.id
  const userRole = session.user?.role as UserRole
  
  if (!userId) {
    throw new Error('Invalid session: No user ID')
  }

  // Admin users can see everything if explicitly allowed
  if (userRole === 'ADMIN' && allowGlobalAccess) {
    return '1=1' // No filtering
  }

  switch (userRole) {
    case 'ADMIN':
      return `(owner_id = '${userId}' OR company_id = '${userId}')`

    case 'COMPANY':
      return `(owner_id = '${userId}' OR company_id = '${userId}')`

    case 'CUSTOMER':
      return `(owner_id = '${userId}' OR customer_id = '${userId}')`

    case 'FARMER':
      return `(owner_id = '${userId}' OR customer_id = '${userId}' OR type = 'AGRICULTURAL')`

    default:
      return `owner_id = '${userId}'`
  }
}

/**
 * Debug function to log filtering applied
 */
export function debugTenantFilter(filter: any, context: string) {
  if (process.env.NODE_ENV === 'development') {
    console.log(`[Multi-Tenant] ${context}:`, JSON.stringify(filter, null, 2))
  }
}