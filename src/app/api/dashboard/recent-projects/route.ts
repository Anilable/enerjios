import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = session.user.id
    const userRole = session.user.role

    // Get user's company or customer ID if applicable
    let companyId: string | undefined
    let customerId: string | undefined

    if (userRole === 'COMPANY') {
      const company = await prisma.company.findUnique({
        where: { userId },
        select: { id: true }
      })
      companyId = company?.id
    } else if (userRole === 'CUSTOMER') {
      const customer = await prisma.customer.findUnique({
        where: { userId },
        select: { id: true }
      })
      customerId = customer?.id
    }

    // Base query filters based on user role
    const whereClause = userRole === 'ADMIN'
      ? {}
      : userRole === 'COMPANY'
        ? companyId ? { companyId } : { ownerId: userId }
        : userRole === 'CUSTOMER'
          ? customerId ? { customerId } : { ownerId: userId }
          : { ownerId: userId }

    // Fetch recent project requests (not projects)
    const recentProjectRequests = await prisma.projectRequest.findMany({
      where: userRole === 'ADMIN'
        ? {}
        : userRole === 'CUSTOMER' && customerId
          ? { customerId }
          : {}, // For other roles, show all project requests
      take: 5,
      orderBy: {
        createdAt: 'desc'
      },
      select: {
        id: true,
        title: true,
        estimatedCapacity: true,
        status: true,
        projectType: true,
        location: true,
        address: true,
        createdAt: true,
        customer: {
          select: {
            firstName: true,
            lastName: true
          }
        }
      }
    })

    // Format the project requests for display
    const formattedProjects = recentProjectRequests.map(request => ({
      id: request.id,
      name: request.title || 'İsimsiz Proje Talebi',
      capacity: request.estimatedCapacity || 0,
      status: request.status || 'OPEN',
      type: request.projectType || 'ROOFTOP',
      location: request.location || request.address || 'Konum belirtilmemiş',
      customerName: request.customer
        ? `${request.customer.firstName || ''} ${request.customer.lastName || ''}`.trim()
        : 'Müşteri bilgisi yok',
      createdAt: request.createdAt
    }))

    return NextResponse.json(formattedProjects)
  } catch (error) {
    console.error('Recent projects error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch recent projects' },
      { status: 500 }
    )
  }
}