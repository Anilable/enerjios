import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'
import { PartnerType } from '@prisma/client'

const partnerSearchSchema = z.object({
  location: z.string().optional(),
  partnerType: z.nativeEnum(PartnerType).optional(),
  minRating: z.coerce.number().min(1).max(5).optional(),
  specialties: z.string().transform(str => str.split(',').filter(Boolean)).optional(),
  minProjectSize: z.coerce.number().positive().optional(),
  maxProjectSize: z.coerce.number().positive().optional(),
  verified: z.coerce.boolean().optional(),
  sortBy: z.enum(['rating', 'responseTime', 'totalProjects', 'name']).default('rating'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(20),
})

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const query = Object.fromEntries(searchParams.entries())

    const validatedQuery = partnerSearchSchema.parse(query)

    // Build where clause
    const where: any = {
      status: 'VERIFIED', // Only show verified partners in public directory
    }

    if (validatedQuery.partnerType) {
      where.type = validatedQuery.partnerType
    }

    if (validatedQuery.minRating) {
      where.customerRating = {
        gte: validatedQuery.minRating,
      }
    }

    if (validatedQuery.location) {
      // Search in service areas
      where.serviceAreas = {
        array_contains: validatedQuery.location,
      }
    }

    if (validatedQuery.specialties && validatedQuery.specialties.length > 0) {
      where.specialties = {
        array_overlap: validatedQuery.specialties,
      }
    }

    if (validatedQuery.minProjectSize || validatedQuery.maxProjectSize) {
      where.OR = []

      if (validatedQuery.minProjectSize) {
        where.OR.push({
          OR: [
            { maximumProjectSize: null },
            { maximumProjectSize: { gte: validatedQuery.minProjectSize } }
          ]
        })
      }

      if (validatedQuery.maxProjectSize) {
        where.OR.push({
          OR: [
            { minimumProjectSize: null },
            { minimumProjectSize: { lte: validatedQuery.maxProjectSize } }
          ]
        })
      }
    }

    // Build order by clause
    let orderBy: any = {}
    switch (validatedQuery.sortBy) {
      case 'rating':
        orderBy = { customerRating: validatedQuery.sortOrder }
        break
      case 'responseTime':
        orderBy = { averageResponseTime: validatedQuery.sortOrder }
        break
      case 'totalProjects':
        orderBy = { totalProjects: validatedQuery.sortOrder }
        break
      case 'name':
        orderBy = { company: { name: validatedQuery.sortOrder } }
        break
    }

    // Calculate pagination
    const skip = (validatedQuery.page - 1) * validatedQuery.limit

    // Execute query
    const [partners, totalCount] = await Promise.all([
      prisma.partner.findMany({
        where,
        orderBy,
        skip,
        take: validatedQuery.limit,
        include: {
          company: {
            select: {
              id: true,
              name: true,
              city: true,
              district: true,
              phone: true,
              website: true,
              logo: true,
              description: true,
            },
          },
          _count: {
            select: {
              partnerReviews: true,
            },
          },
        },
      }),
      prisma.partner.count({ where }),
    ])

    // Transform partners data
    const transformedPartners = partners.map(partner => ({
      id: partner.id,
      type: partner.type,
      serviceAreas: partner.serviceAreas as string[],
      specialties: partner.specialties as string[],
      minimumProjectSize: partner.minimumProjectSize,
      maximumProjectSize: partner.maximumProjectSize,
      responseTimeHours: partner.responseTimeHours,
      portfolioImages: partner.portfolioImages as string[],
      description: partner.description,
      customerRating: partner.customerRating,
      totalProjects: partner.totalProjects,
      totalReviews: partner._count.partnerReviews,
      averageResponseTime: partner.averageResponseTime,
      tier: partner.tier,
      verifiedAt: partner.verifiedAt,
      company: partner.company,
    }))

    return NextResponse.json({
      partners: transformedPartners,
      pagination: {
        page: validatedQuery.page,
        limit: validatedQuery.limit,
        total: totalCount,
        pages: Math.ceil(totalCount / validatedQuery.limit),
      },
    })

  } catch (error) {
    console.error('Partner search error:', error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: 'Invalid search parameters',
          details: error.errors,
        },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to search partners' },
      { status: 500 }
    )
  }
}

// Get partner details by ID (public endpoint)
export async function POST(request: NextRequest) {
  try {
    const { partnerId } = await request.json()

    if (!partnerId) {
      return NextResponse.json(
        { error: 'Partner ID is required' },
        { status: 400 }
      )
    }

    const partner = await prisma.partner.findFirst({
      where: {
        id: partnerId,
        status: 'VERIFIED',
      },
      include: {
        company: {
          select: {
            id: true,
            name: true,
            city: true,
            district: true,
            phone: true,
            website: true,
            logo: true,
            description: true,
          },
        },
        partnerReviews: {
          where: {
            approved: true,
          },
          orderBy: {
            createdAt: 'desc',
          },
          take: 10,
          select: {
            id: true,
            customerName: true,
            rating: true,
            review: true,
            projectType: true,
            verified: true,
            helpful: true,
            qualityRating: true,
            timelinessRating: true,
            communicationRating: true,
            createdAt: true,
          },
        },
      },
    })

    if (!partner) {
      return NextResponse.json(
        { error: 'Partner not found' },
        { status: 404 }
      )
    }

    // Calculate average ratings by category
    const reviews = partner.partnerReviews
    const avgQuality = reviews.length > 0
      ? reviews.reduce((sum, r) => sum + (r.qualityRating || r.rating), 0) / reviews.length
      : 0
    const avgTimeliness = reviews.length > 0
      ? reviews.reduce((sum, r) => sum + (r.timelinessRating || r.rating), 0) / reviews.length
      : 0
    const avgCommunication = reviews.length > 0
      ? reviews.reduce((sum, r) => sum + (r.communicationRating || r.rating), 0) / reviews.length
      : 0

    return NextResponse.json({
      id: partner.id,
      type: partner.type,
      serviceAreas: partner.serviceAreas as string[],
      specialties: partner.specialties as string[],
      minimumProjectSize: partner.minimumProjectSize,
      maximumProjectSize: partner.maximumProjectSize,
      responseTimeHours: partner.responseTimeHours,
      portfolioImages: partner.portfolioImages as string[],
      certifications: partner.certifications,
      description: partner.description,
      preferredContact: partner.preferredContact,
      customerRating: partner.customerRating,
      totalProjects: partner.totalProjects,
      totalLeads: partner.totalLeads,
      convertedLeads: partner.convertedLeads,
      averageResponseTime: partner.averageResponseTime,
      tier: partner.tier,
      verifiedAt: partner.verifiedAt,
      company: partner.company,
      reviews: partner.partnerReviews,
      categoryRatings: {
        quality: avgQuality,
        timeliness: avgTimeliness,
        communication: avgCommunication,
      },
    })

  } catch (error) {
    console.error('Get partner details error:', error)
    return NextResponse.json(
      { error: 'Failed to get partner details' },
      { status: 500 }
    )
  }
}