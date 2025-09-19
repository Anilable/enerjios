import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'
import { ProjectType, PartnerType } from '@prisma/client'

const quoteRequestSchema = z.object({
  customerName: z.string().min(1, 'Customer name is required'),
  customerEmail: z.string().email('Valid email is required'),
  customerPhone: z.string().min(10).optional(),
  projectType: z.nativeEnum(ProjectType),
  location: z.string().min(1, 'Location is required'),
  address: z.string().optional(),
  estimatedCapacity: z.number().positive().optional(),
  budget: z.number().positive().optional(),
  description: z.string().max(2000).optional(),
  urgency: z.enum(['URGENT', 'NORMAL', 'FLEXIBLE']).default('NORMAL'),
  preferredPartnerType: z.nativeEnum(PartnerType).optional(),
  maxPartnersToContact: z.number().int().min(1).max(10).default(5),
  expectedStartDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
})

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    const body = await request.json()

    // Validate the request body
    const validatedData = quoteRequestSchema.parse(body)

    // Set expiration date (30 days from now)
    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + 30)

    // Convert expected start date to Date if provided
    const expectedStartDate = validatedData.expectedStartDate
      ? new Date(validatedData.expectedStartDate)
      : undefined

    // Create the quote request
    const quoteRequest = await prisma.quoteRequest.create({
      data: {
        customerId: session?.user?.id || undefined,
        customerName: validatedData.customerName,
        customerEmail: validatedData.customerEmail,
        customerPhone: validatedData.customerPhone,
        projectType: validatedData.projectType,
        location: validatedData.location,
        address: validatedData.address,
        estimatedCapacity: validatedData.estimatedCapacity,
        budget: validatedData.budget,
        description: validatedData.description,
        urgency: validatedData.urgency,
        preferredPartnerType: validatedData.preferredPartnerType,
        maxPartnersToContact: validatedData.maxPartnersToContact,
        expectedStartDate,
        expiresAt,
      },
    })

    // Find matching partners
    const partnerFilters: any = {
      status: 'VERIFIED',
    }

    // Filter by partner type if specified
    if (validatedData.preferredPartnerType) {
      partnerFilters.type = validatedData.preferredPartnerType
    }

    // Filter by service area (location)
    partnerFilters.serviceAreas = {
      array_contains: validatedData.location,
    }

    // Filter by project size if specified
    if (validatedData.estimatedCapacity) {
      partnerFilters.AND = [
        {
          OR: [
            { minimumProjectSize: null },
            { minimumProjectSize: { lte: validatedData.estimatedCapacity } }
          ]
        },
        {
          OR: [
            { maximumProjectSize: null },
            { maximumProjectSize: { gte: validatedData.estimatedCapacity } }
          ]
        }
      ]
    }

    // Get matching partners sorted by rating and response time
    const matchingPartners = await prisma.partner.findMany({
      where: partnerFilters,
      orderBy: [
        { customerRating: 'desc' },
        { averageResponseTime: 'asc' },
      ],
      take: validatedData.maxPartnersToContact,
      include: {
        company: {
          select: {
            name: true,
            phone: true,
          },
        },
      },
    })

    // Create partner quote requests for each matching partner
    const partnerQuoteRequests = await Promise.all(
      matchingPartners.map(partner =>
        prisma.partnerQuoteRequest.create({
          data: {
            partnerId: partner.id,
            quoteRequestId: quoteRequest.id,
          },
          include: {
            partner: {
              select: {
                id: true,
                preferredContact: true,
                company: {
                  select: {
                    name: true,
                  },
                },
              },
            },
          },
        })
      )
    )

    // Update quote request status if partners were found
    if (partnerQuoteRequests.length > 0) {
      await prisma.quoteRequest.update({
        where: { id: quoteRequest.id },
        data: { status: 'PARTNER_RESPONSES_RECEIVED' },
      })
    }

    // TODO: Send notifications to partners via email/SMS
    // TODO: Send confirmation email to customer

    return NextResponse.json(
      {
        message: 'Quote request submitted successfully',
        quoteRequest: {
          id: quoteRequest.id,
          status: quoteRequest.status,
          partnersContacted: partnerQuoteRequests.length,
          expiresAt: quoteRequest.expiresAt,
        },
        matchedPartners: partnerQuoteRequests.map(pqr => ({
          partnerId: pqr.partner.id,
          partnerName: pqr.partner.company.name,
        })),
      },
      { status: 201 }
    )

  } catch (error) {
    console.error('Quote request error:', error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: 'Invalid request data',
          details: error.issues,
        },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to process quote request' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    const { searchParams } = new URL(request.url)

    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const status = searchParams.get('status')
    const projectType = searchParams.get('projectType')

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    // Build where clause
    const where: any = {
      customerId: session.user.id,
    }

    if (status) {
      where.status = status
    }

    if (projectType) {
      where.projectType = projectType
    }

    // Calculate pagination
    const skip = (page - 1) * limit

    // Get quote requests with partner responses
    const [quoteRequests, totalCount] = await Promise.all([
      prisma.quoteRequest.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        include: {
          partnerRequests: {
            include: {
              partner: {
                select: {
                  id: true,
                  company: {
                    select: {
                      name: true,
                      logo: true,
                    },
                  },
                },
              },
            },
          },
          _count: {
            select: {
              partnerRequests: true,
            },
          },
        },
      }),
      prisma.quoteRequest.count({ where }),
    ])

    return NextResponse.json({
      quoteRequests: quoteRequests.map(qr => ({
        id: qr.id,
        customerName: qr.customerName,
        customerEmail: qr.customerEmail,
        projectType: qr.projectType,
        location: qr.location,
        estimatedCapacity: qr.estimatedCapacity,
        budget: qr.budget,
        urgency: qr.urgency,
        status: qr.status,
        createdAt: qr.createdAt,
        expiresAt: qr.expiresAt,
        partnersContacted: qr._count.partnerRequests,
        responses: qr.partnerRequests.filter(pr => pr.status === 'RESPONDED').length,
        partnerRequests: qr.partnerRequests,
      })),
      pagination: {
        page,
        limit,
        total: totalCount,
        pages: Math.ceil(totalCount / limit),
      },
    })

  } catch (error) {
    console.error('Get quote requests error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch quote requests' },
      { status: 500 }
    )
  }
}