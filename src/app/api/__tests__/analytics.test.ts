/**
 * @jest-environment node
 */

import { NextRequest } from 'next/server'
import { GET } from '../analytics/route'
import { getServerSession } from 'next-auth/next'

// Mock dependencies
jest.mock('next-auth/next')
jest.mock('@/lib/db', () => ({
  prisma: {
    project: {
      aggregate: jest.fn(),
      findMany: jest.fn(),
      groupBy: jest.fn()
    },
    customer: {
      aggregate: jest.fn(),
      findMany: jest.fn(),
      groupBy: jest.fn()
    },
    quote: {
      count: jest.fn()
    },
    $queryRaw: jest.fn()
  }
}))

jest.mock('@/lib/rate-limit', () => ({
  ratelimit: {
    limit: jest.fn().mockResolvedValue({ success: true })
  }
}))

const mockGetServerSession = getServerSession as jest.MockedFunction<typeof getServerSession>

describe('/api/analytics API Endpoints', () => {
  const mockSession = {
    user: {
      id: 'test-user-id',
      role: 'COMPANY',
      companyId: 'test-company-id'
    }
  }

  beforeEach(() => {
    mockGetServerSession.mockResolvedValue(mockSession)
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('GET /api/analytics?metric=overview', () => {
    it('returns overview analytics data', async () => {
      const { prisma } = require('@/lib/db')
      
      // Mock aggregate responses
      prisma.project.aggregate.mockResolvedValue({
        _count: { id: 50 },
        _sum: { totalAmount: 1500000, systemSize: 500 }
      })
      
      prisma.customer.aggregate.mockResolvedValue({
        _count: { id: 25 }
      })

      // Mock revenue trend data
      prisma.$queryRaw.mockResolvedValue([
        { period: '2024-01', revenue: 120000, project_count: 5 },
        { period: '2024-02', revenue: 150000, project_count: 6 }
      ])

      // Mock project status data
      prisma.project.groupBy.mockResolvedValue([
        { status: 'COMPLETED', _count: { id: 20 } },
        { status: 'IN_PROGRESS', _count: { id: 15 } },
        { status: 'PENDING', _count: { id: 10 } }
      ])

      const request = new NextRequest('http://localhost:3000/api/analytics?metric=overview&timeframe=30d')
      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.overview).toMatchObject({
        totalProjects: 50,
        totalRevenue: expect.any(Number),
        totalCustomers: 25,
        totalCapacity: 500,
        revenueTrend: expect.any(Array),
        projectStatusDistribution: expect.any(Array)
      })
    })

    it('handles different timeframe parameters', async () => {
      const { prisma } = require('@/lib/db')
      prisma.project.aggregate.mockResolvedValue({
        _count: { id: 10 },
        _sum: { totalAmount: 300000, systemSize: 100 }
      })
      
      prisma.customer.aggregate.mockResolvedValue({
        _count: { id: 8 }
      })

      prisma.$queryRaw.mockResolvedValue([])
      prisma.project.groupBy.mockResolvedValue([])

      const request = new NextRequest('http://localhost:3000/api/analytics?metric=overview&timeframe=7d')
      const response = await GET(request)

      expect(response.status).toBe(200)
      
      // Verify that date filtering was applied correctly
      const aggregateCall = prisma.project.aggregate.mock.calls[0][0]
      expect(aggregateCall.where.createdAt).toHaveProperty('gte')
      expect(aggregateCall.where.createdAt).toHaveProperty('lte')
    })
  })

  describe('GET /api/analytics?metric=revenue', () => {
    it('returns revenue analytics data', async () => {
      const { prisma } = require('@/lib/db')
      
      // Mock revenue trend
      prisma.$queryRaw.mockResolvedValue([
        { period: '2024-01', revenue: 120000, project_count: 5 },
        { period: '2024-02', revenue: 150000, project_count: 6 }
      ])

      // Mock revenue by type
      prisma.project.groupBy.mockResolvedValue([
        { projectType: 'RESIDENTIAL', _sum: { totalAmount: 500000 }, _count: { id: 25 } },
        { projectType: 'COMMERCIAL', _sum: { totalAmount: 800000 }, _count: { id: 15 } }
      ])

      const request = new NextRequest('http://localhost:3000/api/analytics?metric=revenue')
      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.revenueTrend).toHaveLength(2)
      expect(data.revenueByType).toEqual([
        { type: 'RESIDENTIAL', total: 500000, count: 25 },
        { type: 'COMMERCIAL', total: 800000, count: 15 }
      ])
    })
  })

  describe('GET /api/analytics?metric=performance', () => {
    it('calculates performance metrics correctly', async () => {
      const { prisma } = require('@/lib/db')
      
      // Mock quote and project counts for conversion rate
      prisma.quote.count.mockResolvedValue(100)
      prisma.project.count.mockResolvedValue(75)
      
      // Mock average deal size
      prisma.project.aggregate.mockResolvedValue({
        _avg: { totalAmount: 85000 }
      })

      const request = new NextRequest('http://localhost:3000/api/analytics?metric=performance')
      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.conversionRate).toBe(75) // 75/100 * 100
      expect(data.averageDealSize).toBe(85000)
      expect(data.customerSatisfaction).toBeDefined()
      expect(data.performanceMetrics).toHaveProperty('salesPerformance')
    })
  })

  describe('Error Handling', () => {
    it('returns 401 for unauthenticated requests', async () => {
      mockGetServerSession.mockResolvedValue(null)

      const request = new NextRequest('http://localhost:3000/api/analytics?metric=overview')
      const response = await GET(request)

      expect(response.status).toBe(401)
    })

    it('returns 400 for invalid metric parameter', async () => {
      const request = new NextRequest('http://localhost:3000/api/analytics?metric=invalid')
      const response = await GET(request)

      expect(response.status).toBe(400)
    })

    it('handles database errors gracefully', async () => {
      const { prisma } = require('@/lib/db')
      prisma.project.aggregate.mockRejectedValue(new Error('Database error'))

      const request = new NextRequest('http://localhost:3000/api/analytics?metric=overview')
      const response = await GET(request)

      expect(response.status).toBe(500)
    })

    it('enforces rate limiting', async () => {
      const { ratelimit } = require('@/lib/rate-limit')
      ratelimit.limit.mockResolvedValue({ success: false })

      const request = new NextRequest('http://localhost:3000/api/analytics?metric=overview')
      const response = await GET(request)

      expect(response.status).toBe(429)
    })
  })

  describe('Company Isolation', () => {
    it('filters data by company for non-admin users', async () => {
      const { prisma } = require('@/lib/db')
      prisma.project.aggregate.mockResolvedValue({
        _count: { id: 10 },
        _sum: { totalAmount: 200000, systemSize: 50 }
      })
      
      prisma.customer.aggregate.mockResolvedValue({
        _count: { id: 5 }
      })

      prisma.$queryRaw.mockResolvedValue([])
      prisma.project.groupBy.mockResolvedValue([])

      const request = new NextRequest('http://localhost:3000/api/analytics?metric=overview')
      await GET(request)

      // Verify company filtering was applied
      const aggregateCall = prisma.project.aggregate.mock.calls[0][0]
      expect(aggregateCall.where).toHaveProperty('companyId', 'test-company-id')
    })

    it('allows admin users to see all data', async () => {
      mockGetServerSession.mockResolvedValue({
        user: {
          id: 'admin-user-id',
          role: 'ADMIN'
        }
      })

      const { prisma } = require('@/lib/db')
      prisma.project.aggregate.mockResolvedValue({
        _count: { id: 100 },
        _sum: { totalAmount: 5000000, systemSize: 1000 }
      })
      
      prisma.customer.aggregate.mockResolvedValue({
        _count: { id: 50 }
      })

      prisma.$queryRaw.mockResolvedValue([])
      prisma.project.groupBy.mockResolvedValue([])

      const request = new NextRequest('http://localhost:3000/api/analytics?metric=overview')
      await GET(request)

      // Verify no company filtering for admin
      const aggregateCall = prisma.project.aggregate.mock.calls[0][0]
      expect(aggregateCall.where).not.toHaveProperty('companyId')
    })
  })
})