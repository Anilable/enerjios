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

    // Fetch recent projects
    const recentProjects = await prisma.project.findMany({
      where: whereClause,
      take: 3,
      orderBy: {
        createdAt: 'desc'
      },
      select: {
        id: true,
        name: true,
        capacity: true,
        status: true,
        type: true,
        location: {
          select: {
            city: true,
            district: true
          }
        }
      }
    })

    // Format the projects for display
    const formattedProjects = recentProjects.map(project => ({
      id: project.id,
      name: project.name,
      capacity: project.capacity,
      status: project.status,
      type: project.type,
      location: project.location
        ? `${project.location.district || ''} ${project.location.city || ''}`.trim() || 'Konum belirtilmemiş'
        : 'Konum belirtilmemiş'
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