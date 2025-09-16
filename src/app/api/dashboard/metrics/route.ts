import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { ProjectStatus } from '@prisma/client'

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
    const projectWhereClause = userRole === 'ADMIN'
      ? {}
      : userRole === 'COMPANY'
        ? companyId ? { companyId } : { ownerId: userId }
        : userRole === 'CUSTOMER'
          ? customerId ? { customerId } : { ownerId: userId }
          : { ownerId: userId }

    const customerWhereClause = userRole === 'ADMIN'
      ? {}
      : userRole === 'COMPANY' && companyId
        ? {
            projects: {
              some: {
                companyId
              }
            }
          }
        : { userId }

    // Get current date for time-based comparisons
    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)
    const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()))

    // Fetch total projects count
    const totalProjects = await prisma.project.count({
      where: projectWhereClause
    })

    // Fetch projects added this month
    const projectsThisMonth = await prisma.project.count({
      where: {
        ...projectWhereClause,
        createdAt: {
          gte: startOfMonth
        }
      }
    })

    // Fetch active customers (customers with at least one active project)
    const activeCustomers = await prisma.customer.count({
      where: {
        ...customerWhereClause,
        projects: {
          some: {
            status: {
              in: [ProjectStatus.IN_PROGRESS, ProjectStatus.PLANNED]
            }
          }
        }
      }
    })

    // Fetch new customers this week
    const customersThisWeek = await prisma.customer.count({
      where: {
        ...customerWhereClause,
        createdAt: {
          gte: startOfWeek
        }
      }
    })

    // Calculate total capacity (sum of all project capacities)
    const totalCapacityResult = await prisma.project.aggregate({
      where: projectWhereClause,
      _sum: {
        capacity: true
      }
    })
    const totalCapacity = totalCapacityResult._sum.capacity || 0

    // Calculate capacity added this month
    const capacityThisMonthResult = await prisma.project.aggregate({
      where: {
        ...projectWhereClause,
        createdAt: {
          gte: startOfMonth
        }
      },
      _sum: {
        capacity: true
      }
    })
    const capacityThisMonth = capacityThisMonthResult._sum.capacity || 0

    // Calculate monthly revenue (sum of actual costs for completed projects this month)
    const monthlyRevenueResult = await prisma.project.aggregate({
      where: {
        ...projectWhereClause,
        completionDate: {
          gte: startOfMonth
        },
        status: ProjectStatus.COMPLETED
      },
      _sum: {
        actualCost: true
      }
    })
    const monthlyRevenue = monthlyRevenueResult._sum.actualCost || 0

    // Calculate last month's revenue for comparison
    const lastMonthRevenueResult = await prisma.project.aggregate({
      where: {
        ...projectWhereClause,
        completionDate: {
          gte: startOfLastMonth,
          lt: startOfMonth
        },
        status: ProjectStatus.COMPLETED
      },
      _sum: {
        actualCost: true
      }
    })
    const lastMonthRevenue = lastMonthRevenueResult._sum.actualCost || 0

    // Calculate percentage change in revenue
    const revenueChangePercent = lastMonthRevenue > 0
      ? Math.round(((monthlyRevenue - lastMonthRevenue) / lastMonthRevenue) * 100)
      : monthlyRevenue > 0 ? 100 : 0

    // Format numbers for display
    const formatCapacity = (kw: number) => {
      if (kw >= 1000) {
        return `${(kw / 1000).toFixed(1)} MW`
      }
      return `${Math.round(kw)} kW`
    }

    const formatRevenue = (amount: number) => {
      if (amount >= 1000000) {
        return `₺${(amount / 1000000).toFixed(1)}M`
      }
      if (amount >= 1000) {
        return `₺${(amount / 1000).toFixed(0)}K`
      }
      return `₺${Math.round(amount)}`
    }

    // Prepare response
    const metrics = {
      projects: {
        total: totalProjects,
        change: projectsThisMonth,
        changeText: projectsThisMonth > 0 ? `+${projectsThisMonth} bu ay` : 'Değişim yok'
      },
      customers: {
        total: activeCustomers,
        change: customersThisWeek,
        changeText: customersThisWeek > 0 ? `+${customersThisWeek} bu hafta` : 'Değişim yok'
      },
      capacity: {
        total: formatCapacity(totalCapacity),
        totalRaw: totalCapacity,
        change: capacityThisMonth,
        changeText: capacityThisMonth > 0 ? `+${formatCapacity(capacityThisMonth)} bu ay` : 'Değişim yok'
      },
      revenue: {
        total: formatRevenue(monthlyRevenue),
        totalRaw: monthlyRevenue,
        changePercent: revenueChangePercent,
        changeText: revenueChangePercent !== 0
          ? `${revenueChangePercent > 0 ? '+' : ''}${revenueChangePercent}% geçen aya göre`
          : 'Değişim yok'
      }
    }

    return NextResponse.json(metrics)
  } catch (error) {
    console.error('Dashboard metrics error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch dashboard metrics' },
      { status: 500 }
    )
  }
}