import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search')
    const status = searchParams.get('status')
    const type = searchParams.get('type')

    const whereClause: any = {}

    if (search) {
      whereClause.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { customer: { firstName: { contains: search, mode: 'insensitive' } } },
        { customer: { lastName: { contains: search, mode: 'insensitive' } } }
      ]
    }

    if (status && status !== 'all') {
      whereClause.status = status
    }

    if (type && type !== 'all') {
      whereClause.type = type
    }

    const projects = await prisma.project.findMany({
      where: whereClause,
      include: {
        customer: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            phone: true,
            companyName: true,
            user: {
              select: {
                email: true
              }
            }
          }
        },
        owner: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        location: {
          select: {
            address: true,
            city: true,
            district: true
          }
        },
        quotes: {
          select: {
            id: true,
            total: true,
            status: true
          },
          orderBy: { createdAt: 'desc' },
          take: 1
        }
      },
      orderBy: [
        { createdAt: 'desc' }
      ]
    })

    const transformedProjects = projects.map(project => {
      const latestQuote = project.quotes[0]
      const customerName = project.customer
        ? `${project.customer.firstName} ${project.customer.lastName}`.trim()
        : 'N/A'

      return {
        id: project.id,
        title: project.name,
        customer: {
          name: customerName,
          email: project.customer?.user?.email || '',
          phone: project.customer?.phone || '',
          company: project.customer?.companyName || ''
        },
        status: project.status,
        priority: 'MEDIUM', // Default priority since it's not in the Project model
        type: project.type?.toLowerCase() || 'residential',
        location: {
          address: project.location?.address || '',
          city: project.location?.city || '',
          district: project.location?.district || ''
        },
        technical: {
          systemSize: project.capacity,
          panelCount: Math.round(project.capacity * 2.5), // Estimate: ~400W panels
          annualProduction: Math.round(project.capacity * 1700), // Estimate: 1700 kWh/kW/year for Turkey
          roofArea: Math.round(project.capacity * 7) // Estimate: 7 m²/kW
        },
        financial: {
          estimatedCost: project.estimatedCost || 0,
          quotedPrice: latestQuote?.total || null,
          approvedBudget: latestQuote?.status === 'APPROVED' ? latestQuote.total : null
        },
        timeline: {
          createdAt: project.createdAt.toISOString().split('T')[0],
          designCompleted: project.startDate ? project.startDate.toISOString().split('T')[0] : undefined,
          quoteApproved: latestQuote?.status === 'APPROVED' ? project.createdAt.toISOString().split('T')[0] : undefined,
          installationStarted: project.startDate ? project.startDate.toISOString().split('T')[0] : undefined,
          completedAt: project.completionDate ? project.completionDate.toISOString().split('T')[0] : undefined
        },
        progress: project.status === 'COMPLETED' ? 100 :
                 project.status === 'IN_PROGRESS' ? 75 :
                 project.status === 'PLANNED' ? 50 : 25,
        assignedTo: project.owner?.name || '',
        lastActivity: '1 gün önce', // Would need activity tracking
        activityCount: 5 // Would need activity tracking
      }
    })

    return NextResponse.json({
      success: true,
      data: transformedProjects
    })

  } catch (error) {
    console.error('Projects GET Error:', error)

    return NextResponse.json(
      {
        error: 'Failed to fetch projects',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}