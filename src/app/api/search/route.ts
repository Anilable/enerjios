import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { db as prisma } from '@/lib/db'
import { rateLimit } from '@/lib/rate-limit'

export async function GET(request: NextRequest) {
  try {
    // Rate limiting
    const result = await rateLimit(request, 'api')
    
    if (result && !result.success) {
      return NextResponse.json(
        { error: 'Too many requests' },
        { status: 429 }
      )
    }

    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q')
    const type = searchParams.get('type')
    const limit = parseInt(searchParams.get('limit') || '10')

    if (!query || query.length < 2) {
      return NextResponse.json(
        { error: 'Query must be at least 2 characters' },
        { status: 400 }
      )
    }

    const results = {
      projects: [],
      customers: [],
      companies: [],
      products: [],
      quotes: []
    }

    // Search based on type or search all if no type specified
    if (!type || type === 'projects') {
      results.projects = await prisma.project.findMany({
        where: {
          OR: [
            { name: { contains: query, mode: 'insensitive' } },
            { description: { contains: query, mode: 'insensitive' } },
            { address: { contains: query, mode: 'insensitive' } }
          ]
        },
        select: {
          id: true,
          name: true,
          description: true,
          status: true,
          totalAmount: true,
          systemSize: true,
          createdAt: true,
          customer: {
            select: {
              firstName: true,
              lastName: true
            }
          },
          company: {
            select: {
              name: true
            }
          }
        },
        take: limit,
        orderBy: { createdAt: 'desc' }
      })
    }

    if (!type || type === 'customers') {
      results.customers = await prisma.customer.findMany({
        where: {
          OR: [
            { firstName: { contains: query, mode: 'insensitive' } },
            { lastName: { contains: query, mode: 'insensitive' } },
            { email: { contains: query, mode: 'insensitive' } },
            { phone: { contains: query, mode: 'insensitive' } },
            { company: { contains: query, mode: 'insensitive' } }
          ]
        },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          phone: true,
          company: true,
          customerType: true,
          createdAt: true,
          projects: {
            select: { id: true, status: true },
            take: 5
          }
        },
        take: limit,
        orderBy: { createdAt: 'desc' }
      })
    }

    if (!type || type === 'companies') {
      // Only admins can search companies
      if (session.user.role === 'ADMIN') {
        results.companies = await prisma.company.findMany({
          where: {
            OR: [
              { name: { contains: query, mode: 'insensitive' } },
              { email: { contains: query, mode: 'insensitive' } },
              { phone: { contains: query, mode: 'insensitive' } },
              { website: { contains: query, mode: 'insensitive' } }
            ]
          },
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            website: true,
            isActive: true,
            createdAt: true,
            projects: {
              select: { id: true, status: true },
              take: 5
            }
          },
          take: limit,
          orderBy: { createdAt: 'desc' }
        })
      }
    }

    if (!type || type === 'products') {
      results.products = await prisma.product.findMany({
        where: {
          OR: [
            { name: { contains: query, mode: 'insensitive' } },
            { description: { contains: query, mode: 'insensitive' } },
            { manufacturer: { contains: query, mode: 'insensitive' } },
            { model: { contains: query, mode: 'insensitive' } }
          ]
        },
        select: {
          id: true,
          name: true,
          description: true,
          manufacturer: true,
          model: true,
          category: true,
          price: true,
          isActive: true,
          specifications: true
        },
        take: limit,
        orderBy: { name: 'asc' }
      })
    }

    if (!type || type === 'quotes') {
      results.quotes = await prisma.quote.findMany({
        where: {
          OR: [
            { title: { contains: query, mode: 'insensitive' } },
            { description: { contains: query, mode: 'insensitive' } }
          ]
        },
        select: {
          id: true,
          title: true,
          description: true,
          status: true,
          totalAmount: true,
          validUntil: true,
          createdAt: true,
          customer: {
            select: {
              firstName: true,
              lastName: true
            }
          },
          project: {
            select: {
              name: true,
              systemSize: true
            }
          }
        },
        take: limit,
        orderBy: { createdAt: 'desc' }
      })
    }

    // Calculate total results count
    const totalResults = Object.values(results).reduce((sum, arr) => sum + arr.length, 0)

    return NextResponse.json({
      query,
      totalResults,
      results
    })
  } catch (error) {
    console.error('Search API error:', error)
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const result = await rateLimit(request, 'api')
    
    if (result && !result.success) {
      return NextResponse.json(
        { error: 'Too many requests' },
        { status: 429 }
      )
    }

    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { query, filters, sorting, pagination } = body

    if (!query || query.length < 2) {
      return NextResponse.json(
        { error: 'Query must be at least 2 characters' },
        { status: 400 }
      )
    }

    // Advanced search with filters
    const whereConditions: any = {
      OR: []
    }

    // Apply filters based on entity type
    if (filters?.entityType === 'projects') {
      whereConditions.OR = [
        { name: { contains: query, mode: 'insensitive' } },
        { description: { contains: query, mode: 'insensitive' } },
        { address: { contains: query, mode: 'insensitive' } }
      ]

      if (filters.status) {
        whereConditions.status = filters.status
      }
      if (filters.projectType) {
        whereConditions.projectType = filters.projectType
      }
      if (filters.minAmount) {
        whereConditions.totalAmount = { gte: filters.minAmount }
      }
      if (filters.maxAmount) {
        whereConditions.totalAmount = { 
          ...whereConditions.totalAmount,
          lte: filters.maxAmount 
        }
      }
      if (filters.dateRange) {
        whereConditions.createdAt = {
          gte: new Date(filters.dateRange.start),
          lte: new Date(filters.dateRange.end)
        }
      }
    }

    // Execute search with advanced filters
    const page = pagination?.page || 1
    const limit = Math.min(pagination?.limit || 20, 50) // Max 50 results
    const skip = (page - 1) * limit

    let orderBy: any = { createdAt: 'desc' }
    if (sorting) {
      orderBy = { [sorting.field]: sorting.direction || 'desc' }
    }

    const [items, total] = await Promise.all([
      prisma.project.findMany({
        where: whereConditions,
        select: {
          id: true,
          name: true,
          description: true,
          status: true,
          projectType: true,
          totalAmount: true,
          systemSize: true,
          address: true,
          createdAt: true,
          customer: {
            select: {
              firstName: true,
              lastName: true,
              email: true
            }
          },
          company: {
            select: {
              name: true
            }
          }
        },
        skip,
        take: limit,
        orderBy
      }),
      prisma.project.count({ where: whereConditions })
    ])

    return NextResponse.json({
      query,
      filters,
      results: items,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error('Advanced search API error:', error)
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    )
  }
}