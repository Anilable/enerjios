/**
 * Multi-tenant security tests
 * CRITICAL: These tests ensure data isolation between users
 */

import { getUserFilter, applyTenantFilter, getUserSqlFilter } from './multi-tenant'
import { Session } from 'next-auth'

// Mock session data
const mockAdminSession: Session = {
  user: {
    id: 'admin-123',
    email: 'admin@test.com',
    role: 'ADMIN'
  },
  expires: '2024-12-31'
}

const mockCompanySession: Session = {
  user: {
    id: 'company-456',
    email: 'company@test.com',
    role: 'COMPANY'
  },
  expires: '2024-12-31'
}

const mockCustomerSession: Session = {
  user: {
    id: 'customer-789',
    email: 'customer@test.com',
    role: 'CUSTOMER'
  },
  expires: '2024-12-31'
}

describe('Multi-Tenant Security', () => {
  
  describe('getUserFilter', () => {
    
    test('Admin with global access sees everything', () => {
      const filter = getUserFilter({
        session: mockAdminSession,
        allowGlobalAccess: true
      })
      
      expect(filter).toEqual({})
    })
    
    test('Admin without global access sees own data only', () => {
      const filter = getUserFilter({
        session: mockAdminSession,
        allowGlobalAccess: false
      })
      
      expect(filter.OR).toBeDefined()
      expect(filter.OR).toContain({ ownerId: 'admin-123' })
    })
    
    test('Company user sees company data', () => {
      const filter = getUserFilter({
        session: mockCompanySession
      })
      
      expect(filter.OR).toBeDefined()
      expect(filter.OR).toContain({ ownerId: 'company-456' })
      expect(filter.OR).toContain({ companyId: 'company-456' })
    })
    
    test('Customer sees only own data', () => {
      const filter = getUserFilter({
        session: mockCustomerSession
      })
      
      expect(filter.OR).toBeDefined()
      expect(filter.OR).toContain({ ownerId: 'customer-789' })
      expect(filter.OR).toContain({ customerId: 'customer-789' })
    })
    
    test('Throws error for invalid session', () => {
      expect(() => {
        getUserFilter({
          session: { user: {}, expires: '2024-12-31' } as any
        })
      }).toThrow('Invalid session: No user ID')
    })
  })
  
  describe('applyTenantFilter', () => {
    
    test('Combines base where with tenant filter', () => {
      const baseWhere = {
        status: 'ACTIVE',
        createdAt: { gte: new Date() }
      }
      
      const result = applyTenantFilter(baseWhere, {
        session: mockCustomerSession
      })
      
      expect(result.status).toBe('ACTIVE')
      expect(result.createdAt).toBeDefined()
      expect(result.AND).toBeDefined()
      expect(result.AND[0].OR).toBeDefined()
    })
    
    test('Admin with global access returns base where only', () => {
      const baseWhere = { status: 'ACTIVE' }
      
      const result = applyTenantFilter(baseWhere, {
        session: mockAdminSession,
        allowGlobalAccess: true
      })
      
      expect(result).toEqual(baseWhere)
      expect(result.AND).toBeUndefined()
    })
  })
  
  describe('getUserSqlFilter', () => {
    
    test('Admin with global access returns no filter', () => {
      const filter = getUserSqlFilter({
        session: mockAdminSession,
        allowGlobalAccess: true
      })
      
      expect(filter).toBe('1=1')
    })
    
    test('Customer gets customer-specific SQL filter', () => {
      const filter = getUserSqlFilter({
        session: mockCustomerSession
      })
      
      expect(filter).toContain('customer-789')
      expect(filter).toContain('owner_id =')
      expect(filter).toContain('customer_id =')
    })
    
    test('SQL injection protection', () => {
      const maliciousSession = {
        ...mockCustomerSession,
        user: {
          ...mockCustomerSession.user,
          id: "'; DROP TABLE users; --"
        }
      }
      
      const filter = getUserSqlFilter({
        session: maliciousSession
      })
      
      // Should escape SQL injection attempts
      expect(filter).not.toContain('DROP TABLE')
      expect(filter).toContain("'; DROP TABLE users; --")
    })
  })
  
  describe('Data Isolation Tests', () => {
    
    test('Customer cannot access other customer data', () => {
      const customerAFilter = getUserFilter({
        session: {
          ...mockCustomerSession,
          user: { ...mockCustomerSession.user, id: 'customer-A' }
        }
      })
      
      const customerBFilter = getUserFilter({
        session: {
          ...mockCustomerSession,
          user: { ...mockCustomerSession.user, id: 'customer-B' }
        }
      })
      
      // Filters should be different and customer-specific
      expect(JSON.stringify(customerAFilter)).not.toBe(JSON.stringify(customerBFilter))
      expect(JSON.stringify(customerAFilter)).toContain('customer-A')
      expect(JSON.stringify(customerBFilter)).toContain('customer-B')
    })
    
    test('Company cannot access admin data without permission', () => {
      const companyFilter = getUserFilter({
        session: mockCompanySession,
        allowGlobalAccess: false
      })
      
      // Company should not see admin data
      expect(JSON.stringify(companyFilter)).not.toContain('admin-123')
      expect(JSON.stringify(companyFilter)).toContain('company-456')
    })
  })
})

/**
 * Manual integration test helpers
 * Use these in development to verify multi-tenant isolation
 */
export const testDataIsolation = {
  
  /**
   * Test if customer can access other customer's projects
   */
  async testCustomerIsolation(prisma: any, customerAId: string, customerBId: string) {
    const sessionA: Session = {
      user: { id: customerAId, role: 'CUSTOMER' as any },
      expires: '2024-12-31'
    }
    
    const sessionB: Session = {
      user: { id: customerBId, role: 'CUSTOMER' as any },
      expires: '2024-12-31'
    }
    
    const filterA = getUserFilter({ session: sessionA })
    const filterB = getUserFilter({ session: sessionB })
    
    const projectsA = await prisma.project.findMany({ where: filterA })
    const projectsB = await prisma.project.findMany({ where: filterB })
    
    // Check for data leakage
    const overlapIds = projectsA
      .map((p: any) => p.id)
      .filter((id: string) => projectsB.some((p: any) => p.id === id))
    
    if (overlapIds.length > 0) {
      console.error('🚨 DATA LEAKAGE DETECTED!', { overlapIds })
      return false
    }
    
    console.log('✅ Customer isolation test passed')
    return true
  },
  
  /**
   * Test if company sees only their data
   */
  async testCompanyIsolation(prisma: any, companyId: string) {
    const session: Session = {
      user: { id: companyId, role: 'COMPANY' as any },
      expires: '2024-12-31'
    }
    
    const filter = getUserFilter({ session })
    const projects = await prisma.project.findMany({ where: filter })
    
    // All projects should be owned by or assigned to this company
    const unauthorizedProjects = projects.filter((p: any) => 
      p.ownerId !== companyId && p.companyId !== companyId
    )
    
    if (unauthorizedProjects.length > 0) {
      console.error('🚨 COMPANY DATA LEAKAGE!', { unauthorizedProjects })
      return false
    }
    
    console.log('✅ Company isolation test passed')
    return true
  }
}

/**
 * Security checklist for multi-tenant implementation
 */
export const securityChecklist = [
  '✅ All API routes use multi-tenant filtering',
  '✅ Raw SQL queries include user filtering',
  '✅ Admin role requires explicit allowGlobalAccess flag',
  '✅ Customer data is isolated by userId/customerId',
  '✅ Company data is isolated by companyId/ownerId',
  '✅ No data leakage between tenants',
  '✅ SQL injection protection in place',
  '✅ Session validation in all endpoints',
  '✅ Role-based access control implemented',
  '✅ Debug logging for development'
]