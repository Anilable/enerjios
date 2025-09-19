import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'
import { PartnerType } from '@prisma/client'

const partnerRegistrationSchema = z.object({
  companyId: z.string().cuid(),
  type: z.nativeEnum(PartnerType),
  serviceAreas: z.array(z.string()).min(1, 'At least one service area is required'),
  specialties: z.array(z.string()).min(1, 'At least one specialty is required'),
  minimumProjectSize: z.number().positive().optional(),
  maximumProjectSize: z.number().positive().optional(),
  responseTimeHours: z.number().int().min(1).max(168), // 1 hour to 1 week
  portfolioImages: z.array(z.string().url()).max(20, 'Maximum 20 portfolio images'),
  certifications: z.array(z.object({
    name: z.string().min(1),
    type: z.string().min(1),
    issuedBy: z.string().min(1),
    issuedDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    expiryDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
    documentUrl: z.string().url(),
  })),
  description: z.string().max(2000).optional(),
  preferredContact: z.enum(['EMAIL', 'PHONE', 'WHATSAPP']),
})

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const body = await request.json()

    // Validate the request body
    const validatedData = partnerRegistrationSchema.parse(body)

    // Verify the company belongs to the current user
    const company = await prisma.company.findFirst({
      where: {
        id: validatedData.companyId,
        userId: session.user.id,
      },
    })

    if (!company) {
      return NextResponse.json(
        { error: 'Company not found or access denied' },
        { status: 403 }
      )
    }

    // Check if partner already exists for this company
    const existingPartner = await prisma.partner.findUnique({
      where: {
        companyId: validatedData.companyId,
      },
    })

    if (existingPartner) {
      return NextResponse.json(
        { error: 'Partner registration already exists for this company' },
        { status: 409 }
      )
    }

    // Validate project size constraints
    if (
      validatedData.minimumProjectSize &&
      validatedData.maximumProjectSize &&
      validatedData.minimumProjectSize >= validatedData.maximumProjectSize
    ) {
      return NextResponse.json(
        { error: 'Minimum project size must be less than maximum project size' },
        { status: 400 }
      )
    }

    // Create the partner registration
    const partner = await prisma.partner.create({
      data: {
        companyId: validatedData.companyId,
        type: validatedData.type,
        serviceAreas: validatedData.serviceAreas,
        specialties: validatedData.specialties,
        minimumProjectSize: validatedData.minimumProjectSize,
        maximumProjectSize: validatedData.maximumProjectSize,
        responseTimeHours: validatedData.responseTimeHours,
        portfolioImages: validatedData.portfolioImages,
        certifications: validatedData.certifications,
        description: validatedData.description,
        preferredContact: validatedData.preferredContact,
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
          },
        },
      },
    })

    // TODO: Send notification to admin for partner verification
    // TODO: Send confirmation email to partner

    return NextResponse.json(
      {
        message: 'Partner registration submitted successfully',
        partner: {
          id: partner.id,
          status: partner.status,
          type: partner.type,
          companyName: partner.company.name,
        },
      },
      { status: 201 }
    )

  } catch (error) {
    console.error('Partner registration error:', error)

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
      { error: 'Failed to process partner registration' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    // Get partner registration status for current user's companies
    const companies = await prisma.company.findMany({
      where: {
        userId: session.user.id,
      },
      include: {
        partner: true,
      },
    })

    const partnerRegistrations = companies
      .filter(company => company.partner)
      .map(company => ({
        companyId: company.id,
        companyName: company.name,
        partner: {
          id: company.partner!.id,
          type: company.partner!.type,
          status: company.partner!.status,
          createdAt: company.partner!.createdAt,
          verifiedAt: company.partner!.verifiedAt,
        },
      }))

    return NextResponse.json({
      registrations: partnerRegistrations,
    })

  } catch (error) {
    console.error('Get partner registrations error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch partner registrations' },
      { status: 500 }
    )
  }
}