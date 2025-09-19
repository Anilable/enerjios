import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const leadCaptureSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  phone: z.string().min(1, 'Phone is required'),
  city: z.string().optional(),
  preferredTime: z.string().optional(),
  source: z.string().default('Website'),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validate the request body
    const validatedData = leadCaptureSchema.parse(body)

    // Create the lead in the database
    const lead = await prisma.lead.create({
      data: {
        name: validatedData.name,
        email: '', // Required field, using empty string for phone-only leads
        phone: validatedData.phone,
        source: validatedData.source,
        notes: validatedData.city ? `Şehir: ${validatedData.city}` : undefined,
        // Add preferred time to notes if provided
        ...(validatedData.preferredTime && {
          notes: [
            validatedData.city ? `Şehir: ${validatedData.city}` : '',
            `Tercih edilen arama saati: ${validatedData.preferredTime}`
          ].filter(Boolean).join('\n')
        }),
      },
    })

    // TODO: Send notification to sales team
    // TODO: Send confirmation SMS/email to customer

    return NextResponse.json(
      {
        message: 'Lead captured successfully',
        leadId: lead.id,
      },
      { status: 201 }
    )

  } catch (error) {
    console.error('Lead capture error:', error)

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
      { error: 'Failed to capture lead' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    // This endpoint could be used by admin to view leads
    // For now, return basic stats
    const stats = await prisma.lead.groupBy({
      by: ['status'],
      _count: {
        id: true,
      },
    })

    const totalLeads = await prisma.lead.count()
    const recentLeads = await prisma.lead.findMany({
      take: 10,
      orderBy: {
        createdAt: 'desc',
      },
      select: {
        id: true,
        name: true,
        phone: true,
        source: true,
        status: true,
        createdAt: true,
      },
    })

    return NextResponse.json({
      stats,
      totalLeads,
      recentLeads,
    })

  } catch (error) {
    console.error('Get leads error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch leads' },
      { status: 500 }
    )
  }
}