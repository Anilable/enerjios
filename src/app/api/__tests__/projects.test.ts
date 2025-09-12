/**
 * @jest-environment node
 */

import { NextRequest } from 'next/server'
import { GET, POST } from '../projects/route'
import { getServerSession } from 'next-auth/next'

// Mock dependencies
jest.mock('next-auth/next')
jest.mock('@/lib/db', () => ({
  prisma: {
    project: {
      findMany: jest.fn(),
      count: jest.fn(),
      create: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn()
    }
  }
}))

jest.mock('@/lib/rate-limit', () => ({
  ratelimit: {
    limit: jest.fn().mockResolvedValue({ success: true })
  }
}))

const mockGetServerSession = getServerSession as jest.MockedFunction<typeof getServerSession>

describe('/api/projects API Endpoints', () => {
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

  describe('GET /api/projects', () => {
    it('returns projects for authenticated user', async () => {
      const mockProjects = [
        {
          id: '1',
          name: 'Test Project',
          status: 'IN_PROGRESS',
          totalAmount: 100000,
          systemSize: 10,
          customer: {
            firstName: 'John',
            lastName: 'Doe'
          }
        }
      ]

      const { prisma } = require('@/lib/db')
      prisma.project.findMany.mockResolvedValue(mockProjects)
      prisma.project.count.mockResolvedValue(1)

      const request = new NextRequest('http://localhost:3000/api/projects')
      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.projects).toEqual(mockProjects)
      expect(data.pagination.total).toBe(1)
    })

    it('filters projects by status', async () => {
      const request = new NextRequest('http://localhost:3000/api/projects?status=COMPLETED')
      
      const { prisma } = require('@/lib/db')
      prisma.project.findMany.mockResolvedValue([])
      prisma.project.count.mockResolvedValue(0)

      await GET(request)

      expect(prisma.project.findMany).toHaveBeenCalledWith({
        where: expect.objectContaining({
          status: 'COMPLETED'
        }),
        select: expect.any(Object),
        skip: 0,
        take: 20,
        orderBy: { createdAt: 'desc' }
      })
    })

    it('returns 401 for unauthenticated requests', async () => {
      mockGetServerSession.mockResolvedValue(null)

      const request = new NextRequest('http://localhost:3000/api/projects')
      const response = await GET(request)

      expect(response.status).toBe(401)
    })

    it('handles pagination correctly', async () => {
      const request = new NextRequest('http://localhost:3000/api/projects?page=2&limit=10')
      
      const { prisma } = require('@/lib/db')
      prisma.project.findMany.mockResolvedValue([])
      prisma.project.count.mockResolvedValue(25)

      const response = await GET(request)
      const data = await response.json()

      expect(prisma.project.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          skip: 10, // (page 2 - 1) * limit 10
          take: 10
        })
      )
      expect(data.pagination.pages).toBe(3) // ceil(25 / 10)
    })
  })

  describe('POST /api/projects', () => {
    const validProjectData = {
      name: 'New Solar Project',
      customerId: 'customer-123',
      systemSize: 15.5,
      address: 'Test Address',
      projectType: 'RESIDENTIAL'
    }

    it('creates new project successfully', async () => {
      const mockCreatedProject = {
        id: 'new-project-id',
        ...validProjectData,
        status: 'DRAFT',
        companyId: 'test-company-id'
      }

      const { prisma } = require('@/lib/db')
      prisma.project.create.mockResolvedValue(mockCreatedProject)

      const request = new NextRequest('http://localhost:3000/api/projects', {
        method: 'POST',
        body: JSON.stringify(validProjectData)
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(201)
      expect(data.id).toBe('new-project-id')
      expect(prisma.project.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          ...validProjectData,
          companyId: 'test-company-id',
          status: 'DRAFT'
        }),
        include: expect.any(Object)
      })
    })

    it('validates required fields', async () => {
      const invalidData = {
        name: '', // Empty name
        customerId: 'customer-123'
        // Missing other required fields
      }

      const request = new NextRequest('http://localhost:3000/api/projects', {
        method: 'POST',
        body: JSON.stringify(invalidData)
      })

      const response = await POST(request)

      expect(response.status).toBe(400)
    })

    it('handles database errors', async () => {
      const { prisma } = require('@/lib/db')
      prisma.project.create.mockRejectedValue(new Error('Database error'))

      const request = new NextRequest('http://localhost:3000/api/projects', {
        method: 'POST',
        body: JSON.stringify(validProjectData)
      })

      const response = await POST(request)

      expect(response.status).toBe(500)
    })

    it('enforces company isolation', async () => {
      const { prisma } = require('@/lib/db')
      prisma.project.create.mockResolvedValue({ id: 'test' })

      const request = new NextRequest('http://localhost:3000/api/projects', {
        method: 'POST',
        body: JSON.stringify(validProjectData)
      })

      await POST(request)

      expect(prisma.project.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          companyId: 'test-company-id'
        }),
        include: expect.any(Object)
      })
    })
  })

  describe('Rate Limiting', () => {
    it('returns 429 when rate limit exceeded', async () => {
      const { ratelimit } = require('@/lib/rate-limit')
      ratelimit.limit.mockResolvedValue({ success: false })

      const request = new NextRequest('http://localhost:3000/api/projects')
      const response = await GET(request)

      expect(response.status).toBe(429)
    })
  })
})