import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { db as prisma } from '@/lib/db'
import { generalRateLimit } from '@/lib/rate-limit'

export async function GET(request: NextRequest) {
  try {
    // Rate limiting
    const ip = request.headers.get('x-forwarded-for') || 'unknown'
    try {
      await generalRateLimit.check(10, ip)
    } catch (error) {
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
      results.projects = await (prisma.project.findMany({
        where: {
          OR: [
            { name: { contains: query } as any },
            { description: { contains: query } as any }
          ]
        },
        select: {
          id: true,
          name: true,
          description: true,
          status: true,
          actualCost: true,
          capacity: true,
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
      }) as any)
    }

    if (!type || type === 'customers') {
      results.customers = await (prisma.customer.findMany({
        where: {
          OR: [
            { firstName: { contains: query } as any },
            { lastName: { contains: query } as any },
            { phone: { contains: query } as any }
          ]
        },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          phone: true,
          type: true,
          createdAt: true,
          projects: {
            select: { id: true, status: true },
            take: 5
          }
        },
        take: limit,
        orderBy: { createdAt: 'desc' }
      }) as any)
    }

    if (!type || type === 'companies') {
      // Only admins can search companies
      if (session.user.role === 'ADMIN') {
        results.companies = await (prisma.company.findMany({
          where: {
            OR: [
              { name: { contains: query } as any },
              { phone: { contains: query } as any },
              { website: { contains: query } as any }
            ]
          },
          select: {
            id: true,
            name: true,
            phone: true,
            website: true,
            verified: true,
            createdAt: true,
            projects: {
              select: { id: true, status: true },
              take: 5
            }
          },
          take: limit,
          orderBy: { createdAt: 'desc' }
        }) as any)
      }
    }

    if (!type || type === 'products') {
      results.products = await (prisma.product.findMany({
        where: {
          OR: [
            { name: { contains: query } as any },
            { description: { contains: query } as any },
            { brand: { contains: query } as any },
            { model: { contains: query } as any }
          ]
        },
        select: {
          id: true,
          name: true,
          description: true,
          brand: true,
          model: true,
          type: true,
          price: true,
          specifications: true
        },
        take: limit,
        orderBy: { name: 'asc' }
      }) as any)
    }

    if (!type || type === 'quotes') {
      results.quotes = await (prisma.quote.findMany({
        where: {
          OR: [
            { notes: { contains: query } as any }
          ]
        },
        select: {
          id: true,
          quoteNumber: true,
          notes: true,
          status: true,
          total: true,
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
              capacity: true
            }
          }
        },
        take: limit,
        orderBy: { createdAt: 'desc' }
      }) as any)
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
    const ip = request.headers.get('x-forwarded-for') || 'unknown'
    try {
      await generalRateLimit.check(10, ip)
    } catch (error) {
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
        { name: { contains: query } as any },
        { description: { contains: query } as any }
      ]

      if (filters.status) {
        whereConditions.status = filters.status
      }
      if (filters.projectType) {
        whereConditions.type = filters.projectType
      }
      if (filters.minAmount) {
        whereConditions.actualCost = { gte: filters.minAmount }
      }
      if (filters.maxAmount) {
        whereConditions.actualCost = { 
          ...whereConditions.actualCost,
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
      (prisma.project.findMany({
        where: whereConditions,
        select: {
          id: true,
          name: true,
          description: true,
          status: true,
          type: true,
          actualCost: true,
          capacity: true,
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
        skip,
        take: limit,
        orderBy
      }) as any),
      (prisma.project.count({ where: whereConditions }) as any)
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