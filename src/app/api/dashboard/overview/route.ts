import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { db as prisma } from '@/lib/db'
import { rateLimit } from '@/lib/rate-limit'
import { 
  requireAuth, 
  getProjectsFilter, 
  getCustomersFilter, 
  getQuotesFilter,
  applyTenantFilter,
  debugTenantFilter,
  getUserSqlFilter
} from '@/lib/multi-tenant'

export async function GET(request: NextRequest) {
  try {
    // Rate limiting
    const result = await rateLimit(request, 'api')
    
    if (result && !result.success) {
      return NextResponse.json(
        { error: 'Too many requests' },
        { status: 429 }
      )
    }

    const session = requireAuth(await getServerSession(authOptions))
    const isAdmin = session.user.role === 'ADMIN'
    
    // Multi-tenant filtering options
    const tenantOptions = {
      session,
      allowGlobalAccess: isAdmin // Only admins can see all data
    }

    // Get query parameters
    const { searchParams } = new URL(request.url)
    const timeframe = searchParams.get('timeframe') || '30d'

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

    // Build secure where clauses with multi-tenant filtering
    const baseTimeFilter = {
      createdAt: {
        gte: startDate,
        lte: endDate
      }
    }

    // Apply tenant filtering to all queries
    const projectWhere = applyTenantFilter(baseTimeFilter, tenantOptions)
    const customerWhere = applyTenantFilter(baseTimeFilter, tenantOptions)
    const quoteWhere = applyTenantFilter(baseTimeFilter, tenantOptions)

    // SQL filter for raw queries
    const userSqlFilter = getUserSqlFilter(tenantOptions)
    
    // Debug logging in development
    debugTenantFilter(projectWhere, 'Projects Filter')
    debugTenantFilter(customerWhere, 'Customers Filter')
    debugTenantFilter(quoteWhere, 'Quotes Filter')
    debugTenantFilter({ sqlFilter: userSqlFilter }, 'SQL Filter')

    // Get all dashboard data in parallel
    const [
      // Key metrics
      projectStats,
      customerStats,
      quoteStats,
      revenueStats,
      
      // Recent activities
      recentProjects,
      recentCustomers,
      recentQuotes,
      
      // Charts data
      monthlyRevenue,
      projectsByStatus,
      topCustomers,
      
      // Performance metrics
      systemCapacityStats,
      conversionMetrics
    ] = await Promise.all([
      // Project statistics
      prisma.project.aggregate({
        where: projectWhere,
        _count: { id: true },
        _sum: { actualCost: true, capacity: true }
      }),

      // Customer statistics - secure
      prisma.customer.aggregate({
        where: customerWhere,
        _count: { id: true }
      }),

      // Quote statistics - secure
      prisma.quote.aggregate({
        where: quoteWhere,
        _count: { id: true },
        _sum: { total: true }
      }),

      // Revenue from completed projects
      prisma.project.aggregate({
        where: {
          ...projectWhere,
          status: 'COMPLETED'
        },
        _sum: { actualCost: true }
      }),

      // Recent projects - secure
      prisma.project.findMany({
        where: getProjectsFilter(tenantOptions),
        select: {
          id: true,
          name: true,
          status: true,
          actualCost: true,
          capacity: true,
          createdAt: true,
          customer: {
            select: {
              firstName: true,
              lastName: true
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        take: 10
      }),

      // Recent customers - secure
      prisma.customer.findMany({
        where: getCustomersFilter(tenantOptions),
        select: {
          id: true,
          firstName: true,
          lastName: true,
          type: true,
          createdAt: true,
          projects: {
            select: { id: true, actualCost: true },
            take: 1,
            orderBy: { createdAt: 'desc' }
          }
        },
        orderBy: { createdAt: 'desc' },
        take: 10
      }),

      // Recent quotes - secure
      prisma.quote.findMany({
        where: getQuotesFilter(tenantOptions),
        select: {
          id: true,
          quoteNumber: true,
          status: true,
          total: true,
          validUntil: true,
          createdAt: true
        },
        orderBy: { createdAt: 'desc' },
        take: 10
      }),

      // Monthly revenue trend - secure
      prisma.$queryRaw`
        SELECT 
          TO_CHAR(created_at, 'YYYY-MM') as month,
          SUM(actual_cost) as revenue,
          COUNT(*) as project_count
        FROM "Project"
        WHERE created_at >= ${startDate}
          AND created_at <= ${endDate}
          AND status = 'COMPLETED'
          AND (${userSqlFilter})
        GROUP BY TO_CHAR(created_at, 'YYYY-MM')
        ORDER BY month
      `,

      // Projects by status - secure
      prisma.project.groupBy({
        by: ['status'],
        where: getProjectsFilter(tenantOptions),
        _count: { id: true }
      }),

      // Top customers by value - secure
      prisma.$queryRaw`
        SELECT 
          c.id,
          c.first_name,
          c.last_name,
          c.type as customer_type,
          SUM(p.actual_cost) as total_value,
          COUNT(p.id) as project_count
        FROM "Customer" c
        LEFT JOIN "Project" p ON c.id = p.customer_id AND p.status = 'COMPLETED'
        WHERE c.created_at >= ${startDate}
          AND c.created_at <= ${endDate}
          AND (c.user_id = ${session.user.id} OR ${userSqlFilter.replace('owner_id', 'p.owner_id')})
        GROUP BY c.id, c.first_name, c.last_name, c.type
        HAVING SUM(p.actual_cost) > 0
        ORDER BY total_value DESC
        LIMIT 10
      `,

      // System capacity statistics
      prisma.project.aggregate({
        where: {
          ...projectWhere,
          status: 'COMPLETED'
        },
        _sum: { capacity: true },
        _avg: { capacity: true }
      }),

      // Conversion metrics - secure
      Promise.all([
        prisma.quote.count({
          where: quoteWhere
        }),
        prisma.project.count({
          where: {
            ...projectWhere,
            status: { not: 'DRAFT' }
          }
        })
      ])
    ])

    // Calculate derived metrics
    const conversionRate = conversionMetrics[0] > 0 
      ? (conversionMetrics[1] / conversionMetrics[0]) * 100 
      : 0

    // Calculate growth rates (compare with previous period)
    const prevPeriodStart = new Date(startDate)
    prevPeriodStart.setTime(startDate.getTime() - (endDate.getTime() - startDate.getTime()))

    const prevTimeFilter = applyTenantFilter({
      createdAt: { gte: prevPeriodStart, lte: startDate }
    }, tenantOptions)

    const [prevProjectStats, prevRevenueStats] = await Promise.all([
      prisma.project.aggregate({
        where: prevTimeFilter,
        _count: { id: true }
      }),
      prisma.project.aggregate({
        where: {
          ...prevTimeFilter,
          status: 'COMPLETED'
        },
        _sum: { actualCost: true }
      })
    ])

    // Calculate growth percentages
    const projectGrowth = prevProjectStats._count.id > 0 
      ? ((projectStats._count.id - prevProjectStats._count.id) / prevProjectStats._count.id) * 100 
      : 0

    const revenueGrowth = (prevRevenueStats._sum.actualCost || 0) > 0 
      ? (((revenueStats._sum.actualCost || 0) - (prevRevenueStats._sum.actualCost || 0)) / (prevRevenueStats._sum.actualCost || 0)) * 100 
      : 0

    // Format response
    const response = {
      metrics: {
        totalProjects: projectStats._count.id,
        totalRevenue: revenueStats._sum.actualCost || 0,
        totalCustomers: customerStats._count.id,
        totalQuotes: quoteStats._count.id,
        totalQuoteValue: quoteStats._sum.total || 0,
        totalSystemCapacity: systemCapacityStats._sum.capacity || 0,
        averageSystemSize: systemCapacityStats._avg.capacity || 0,
        conversionRate,
        projectGrowth,
        revenueGrowth
      },
      
      charts: {
        monthlyRevenue: monthlyRevenue || [],
        projectsByStatus: projectsByStatus.map(item => ({
          status: item.status,
          count: item._count.id,
          label: getStatusLabel(item.status)
        })),
        topCustomers: Array.isArray(topCustomers) ? topCustomers.map((customer: any) => ({
          id: customer.id,
          name: `${customer.first_name} ${customer.last_name}`,
          type: customer.customer_type,
          totalValue: parseFloat(customer.total_value) || 0,
          projectCount: parseInt(customer.project_count) || 0
        })) : []
      },

      activities: {
        recentProjects: recentProjects.map(project => ({
          id: project.id,
          name: project.name,
          status: project.status,
          statusLabel: getStatusLabel(project.status),
          actualCost: project.actualCost,
          capacity: project.capacity,
          customerName: project.customer ? `${project.customer.firstName} ${project.customer.lastName}` : 'Unknown',
          createdAt: project.createdAt
        })),
        
        recentCustomers: recentCustomers.map(customer => ({
          id: customer.id,
          name: `${customer.firstName} ${customer.lastName}`,
          type: customer.type,
          lastProjectValue: customer.projects[0]?.actualCost || 0,
          createdAt: customer.createdAt
        })),
        
        recentQuotes: Array.isArray(recentQuotes) ? recentQuotes.map(quote => ({
          id: quote.id,
          title: quote.quoteNumber,
          status: quote.status,
          statusLabel: getQuoteStatusLabel(quote.status),
          actualCost: quote.total,
          validUntil: quote.validUntil,
          customerName: 'Customer',
          createdAt: quote.createdAt
        })) : []
      },

      timeframe,
      generatedAt: new Date().toISOString()
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('Dashboard overview API error:', error)
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    )
  }
}

function getStatusLabel(status: string): string {
  const labels: { [key: string]: string } = {
    'DRAFT': 'Taslak',
    'SUBMITTED': 'Gönderildi',
    'APPROVED': 'Onaylandı',
    'IN_PROGRESS': 'Devam Ediyor',
    'COMPLETED': 'Tamamlandı',
    'REJECTED': 'Reddedildi',
    'CANCELLED': 'İptal Edildi'
  }
  return labels[status] || status
}

function getQuoteStatusLabel(status: string): string {
  const labels: { [key: string]: string } = {
    'DRAFT': 'Taslak',
    'SENT': 'Gönderildi',
    'ACCEPTED': 'Kabul Edildi',
    'REJECTED': 'Reddedildi',
    'EXPIRED': 'Süresi Doldu'
  }
  return labels[status] || status
}