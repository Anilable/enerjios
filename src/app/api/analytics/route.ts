import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { db as prisma } from '@/lib/db'
import { rateLimit } from '@/lib/rate-limit'

export async function GET(request: NextRequest) {
  try {
    // Rate limiting
    const ip = (request as any).ip ?? request.headers.get('x-forwarded-for') ?? '127.0.0.1'
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
    const metric = searchParams.get('metric')
    const timeframe = searchParams.get('timeframe') || '30d'
    const granularity = searchParams.get('granularity') || 'day'

    // Calculate date range
    const endDate = new Date()
    const startDate = new Date()
    
    switch (timeframe) {
      case '7d':
        startDate.setDate(endDate.getDate() - 7)
        break
      case '30d':
        startDate.setDate(endDate.getDate() - 30)
        break
      case '90d':
        startDate.setDate(endDate.getDate() - 90)
        break
      case '1y':
        startDate.setFullYear(endDate.getFullYear() - 1)
        break
    }

    const dateFilter = {
      createdAt: {
        gte: startDate,
        lte: endDate
      }
    }

    switch (metric) {
      case 'overview': {
        // Get overview metrics
        const [projectStats, customerStats, revenueStats] = await Promise.all([
          prisma.project.aggregate({
            where: dateFilter,
            _count: { id: true },
            _sum: { actualCost: true, capacity: true }
          }),
          prisma.customer.aggregate({
            where: dateFilter,
            _count: { id: true }
          }),
          prisma.project.aggregate({
            where: {
              ...dateFilter,
              status: 'COMPLETED'
            },
            _sum: { actualCost: true }
          })
        ])

        // Get monthly revenue trend
        const revenueTrend = await getRevenueTrend(startDate, endDate, granularity)
        
        // Get project status distribution
        const projectStatusData = await prisma.project.groupBy({
          by: ['status'],
          where: dateFilter,
          _count: { id: true }
        })

        return NextResponse.json({
          overview: {
            totalProjects: projectStats._count.id || 0,
            totalRevenue: revenueStats._sum.actualCost || 0,
            totalCustomers: customerStats._count.id || 0,
            totalCapacity: projectStats._sum.capacity || 0,
            revenueTrend,
            projectStatusDistribution: projectStatusData.map(item => ({
              status: item.status,
              count: item._count.id
            }))
          }
        })
      }

      case 'revenue': {
        const revenueTrend = await getRevenueTrend(startDate, endDate, granularity)
        
        const revenueByType = await prisma.project.groupBy({
          by: ['type'],
          where: {
            ...dateFilter,
            status: 'COMPLETED'
          },
          _sum: { actualCost: true },
          _count: { id: true }
        })

        return NextResponse.json({
          revenueTrend,
          revenueByType: revenueByType.map(item => ({
            type: item.type,
            total: item._sum.actualCost || 0,
            count: item._count.id
          }))
        })
      }

      case 'projects': {
        const projectsByStatus = await prisma.project.groupBy({
          by: ['status'],
          where: dateFilter,
          _count: { id: true }
        })

        const projectsByType = await prisma.project.groupBy({
          by: ['type'],
          where: dateFilter,
          _count: { id: true },
          _sum: { capacity: true }
        })

        const avgCompletionTime = await prisma.$queryRaw`
          SELECT AVG(EXTRACT(DAY FROM (updated_at - created_at))) as avg_days
          FROM "Project"
          WHERE status = 'COMPLETED' 
          AND created_at >= ${startDate}
          AND created_at <= ${endDate}
        `

        return NextResponse.json({
          projectsByStatus: projectsByStatus.map(item => ({
            status: item.status,
            count: item._count.id
          })),
          projectsByType: projectsByType.map(item => ({
            type: item.type,
            count: item._count.id,
            totalCapacity: item._sum.capacity || 0
          })),
          averageCompletionTime: avgCompletionTime[0]?.avg_days || 0
        })
      }

      case 'customers': {
        const customersByType = await prisma.customer.groupBy({
          by: ['type'],
          where: dateFilter,
          _count: { id: true }
        })

        const topCustomers = await prisma.customer.findMany({
          where: dateFilter,
          select: {
            id: true,
            firstName: true,
            lastName: true,
            type: true,
            projects: {
              select: {
                actualCost: true,
                status: true
              }
            }
          },
          take: 10
        })

        const customerRetention = await calculateCustomerRetention(startDate, endDate)

        return NextResponse.json({
          customersByType: customersByType.map(item => ({
            type: item.type,
            count: item._count.id
          })),
          topCustomers: topCustomers.map(customer => ({
            id: customer.id,
            name: `${customer.firstName} ${customer.lastName}`,
            type: customer.type,
            totalValue: customer.projects.reduce((sum, p) => sum + (p.actualCost || 0), 0),
            completedProjects: customer.projects.filter(p => p.status === 'COMPLETED').length
          })),
          retentionRate: customerRetention
        })
      }

      case 'performance': {
        // Calculate conversion rates
        const [quotes, projects] = await Promise.all([
          prisma.quote.count({
            where: dateFilter
          }),
          prisma.project.count({
            where: {
              ...dateFilter,
              status: { not: 'DRAFT' }
            }
          })
        ])

        const conversionRate = quotes > 0 ? (projects / quotes) * 100 : 0

        // Average deal size
        const avgDealSize = await prisma.project.aggregate({
          where: {
            ...dateFilter,
            status: 'COMPLETED'
          },
          _avg: { actualCost: true }
        })

        // Customer satisfaction (mock data - replace with actual ratings)
        const customerSatisfaction = 4.7

        return NextResponse.json({
          conversionRate,
          averageDealSize: avgDealSize._avg.actualCost || 0,
          customerSatisfaction,
          performanceMetrics: {
            salesPerformance: 85,
            projectDelivery: 78,
            qualityScore: 88,
            costControl: 82
          }
        })
      }

      case 'regional': {
        // Regional performance data - Project model doesn't have region field
        // Using locationId instead or create a mock regional data
        const projectsWithLocation = await prisma.project.findMany({
          where: dateFilter,
          select: {
            id: true,
            actualCost: true,
            capacity: true,
            location: {
              select: {
                city: true
              }
            }
          }
        })

        // Group by city as proxy for region
        const cityGroups = projectsWithLocation.reduce((acc, project) => {
          const city = project.location?.city || 'Unknown'
          if (!acc[city]) {
            acc[city] = {
              projectCount: 0,
              totalRevenue: 0,
              totalCapacity: 0
            }
          }
          acc[city].projectCount += 1
          acc[city].totalRevenue += project.actualCost || 0
          acc[city].totalCapacity += project.capacity || 0
          return acc
        }, {} as Record<string, { projectCount: number; totalRevenue: number; totalCapacity: number }>)

        return NextResponse.json({
          regionalPerformance: Object.entries(cityGroups).map(([city, data]) => ({
            region: city,
            projectCount: data.projectCount,
            totalRevenue: data.totalRevenue,
            totalCapacity: data.totalCapacity
          }))
        })
      }

      default: {
        return NextResponse.json(
          { error: 'Invalid metric parameter' },
          { status: 400 }
        )
      }
    }
  } catch (error) {
    console.error('Analytics API error:', error)
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    )
  }
}

async function getRevenueTrend(startDate: Date, endDate: Date, granularity: string) {
  try {
    let groupByFormat = ''
    
    switch (granularity) {
      case 'day':
        groupByFormat = 'YYYY-MM-DD'
        break
      case 'week':
        groupByFormat = 'YYYY-"W"WW'
        break
      case 'month':
        groupByFormat = 'YYYY-MM'
        break
      default:
        groupByFormat = 'YYYY-MM-DD'
    }

    const trendData = await prisma.$queryRaw`
      SELECT 
        TO_CHAR(created_at, ${groupByFormat}) as period,
        SUM(actual_cost) as revenue,
        COUNT(*) as project_count
      FROM "Project"
      WHERE created_at >= ${startDate}
        AND created_at <= ${endDate}
        AND status = 'COMPLETED'
      GROUP BY TO_CHAR(created_at, ${groupByFormat})
      ORDER BY period
    `

    return trendData
  } catch (error) {
    console.error('Error fetching revenue trend:', error)
    return []
  }
}

async function calculateCustomerRetention(startDate: Date, endDate: Date) {
  try {
    // Calculate customer retention rate
    const prevPeriodStart = new Date(startDate)
    prevPeriodStart.setDate(startDate.getDate() - (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))

    const [currentPeriodCustomers, prevPeriodCustomers, returningCustomers] = await Promise.all([
      prisma.customer.count({
        where: {
          createdAt: {
            gte: startDate,
            lte: endDate
          }
        }
      }),
      prisma.customer.count({
        where: {
          createdAt: {
            gte: prevPeriodStart,
            lte: startDate
          }
        }
      }),
      prisma.customer.count({
        where: {
          createdAt: {
            gte: prevPeriodStart,
            lte: startDate
          },
          projects: {
            some: {
              createdAt: {
                gte: startDate,
                lte: endDate
              }
            }
          }
        }
      })
    ])

    const retentionRate = prevPeriodCustomers > 0 
      ? (returningCustomers / prevPeriodCustomers) * 100 
      : 0

    return retentionRate
  } catch (error) {
    console.error('Error calculating retention rate:', error)
    return 0
  }
}