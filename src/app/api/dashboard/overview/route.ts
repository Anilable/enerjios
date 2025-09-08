import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { db as prisma } from '@/lib/db'
import { rateLimit } from '@/lib/rate-limit'

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

    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
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

    // Build where clause based on user role
    let projectWhere: any = {
      createdAt: {
        gte: startDate,
        lte: endDate
      }
    }

    // If user is not admin, filter by company
    if (session.user.role !== 'ADMIN') {
      projectWhere.companyId = session.user.companyId
    }

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
        _sum: { totalAmount: true, systemSize: true }
      }),

      // Customer statistics
      prisma.customer.aggregate({
        where: {
          createdAt: {
            gte: startDate,
            lte: endDate
          },
          ...(session.user.role !== 'ADMIN' && { companyId: session.user.companyId })
        },
        _count: { id: true }
      }),

      // Quote statistics
      prisma.quote.aggregate({
        where: {
          createdAt: {
            gte: startDate,
            lte: endDate
          },
          ...(session.user.role !== 'ADMIN' && { companyId: session.user.companyId })
        },
        _count: { id: true },
        _sum: { totalAmount: true }
      }),

      // Revenue from completed projects
      prisma.project.aggregate({
        where: {
          ...projectWhere,
          status: 'COMPLETED'
        },
        _sum: { totalAmount: true }
      }),

      // Recent projects
      prisma.project.findMany({
        where: {
          ...(session.user.role !== 'ADMIN' && { companyId: session.user.companyId })
        },
        select: {
          id: true,
          name: true,
          status: true,
          totalAmount: true,
          systemSize: true,
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

      // Recent customers
      prisma.customer.findMany({
        where: {
          ...(session.user.role !== 'ADMIN' && { companyId: session.user.companyId })
        },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          customerType: true,
          createdAt: true,
          projects: {
            select: { id: true, totalAmount: true },
            take: 1,
            orderBy: { createdAt: 'desc' }
          }
        },
        orderBy: { createdAt: 'desc' },
        take: 10
      }),

      // Recent quotes
      prisma.quote.findMany({
        where: {
          ...(session.user.role !== 'ADMIN' && { companyId: session.user.companyId })
        },
        select: {
          id: true,
          title: true,
          status: true,
          totalAmount: true,
          validUntil: true,
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

      // Monthly revenue trend
      prisma.$queryRaw`
        SELECT 
          TO_CHAR(created_at, 'YYYY-MM') as month,
          SUM(total_amount) as revenue,
          COUNT(*) as project_count
        FROM "Project"
        WHERE created_at >= ${startDate}
          AND created_at <= ${endDate}
          AND status = 'COMPLETED'
          ${session.user.role !== 'ADMIN' ? prisma.$queryRaw`AND company_id = ${session.user.companyId}` : prisma.$queryRaw``}
        GROUP BY TO_CHAR(created_at, 'YYYY-MM')
        ORDER BY month
      `,

      // Projects by status
      prisma.project.groupBy({
        by: ['status'],
        where: {
          ...(session.user.role !== 'ADMIN' && { companyId: session.user.companyId })
        },
        _count: { id: true }
      }),

      // Top customers by value
      prisma.$queryRaw`
        SELECT 
          c.id,
          c.first_name,
          c.last_name,
          c.customer_type,
          SUM(p.total_amount) as total_value,
          COUNT(p.id) as project_count
        FROM "Customer" c
        LEFT JOIN "Project" p ON c.id = p.customer_id AND p.status = 'COMPLETED'
        WHERE c.created_at >= ${startDate}
          AND c.created_at <= ${endDate}
          ${session.user.role !== 'ADMIN' ? prisma.$queryRaw`AND c.company_id = ${session.user.companyId}` : prisma.$queryRaw``}
        GROUP BY c.id, c.first_name, c.last_name, c.customer_type
        HAVING SUM(p.total_amount) > 0
        ORDER BY total_value DESC
        LIMIT 10
      `,

      // System capacity statistics
      prisma.project.aggregate({
        where: {
          ...projectWhere,
          status: 'COMPLETED'
        },
        _sum: { systemSize: true },
        _avg: { systemSize: true }
      }),

      // Conversion metrics
      Promise.all([
        prisma.quote.count({
          where: {
            createdAt: { gte: startDate, lte: endDate },
            ...(session.user.role !== 'ADMIN' && { companyId: session.user.companyId })
          }
        }),
        prisma.project.count({
          where: {
            createdAt: { gte: startDate, lte: endDate },
            status: { not: 'DRAFT' },
            ...(session.user.role !== 'ADMIN' && { companyId: session.user.companyId })
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

    const [prevProjectStats, prevRevenueStats] = await Promise.all([
      prisma.project.aggregate({
        where: {
          createdAt: { gte: prevPeriodStart, lte: startDate },
          ...(session.user.role !== 'ADMIN' && { companyId: session.user.companyId })
        },
        _count: { id: true }
      }),
      prisma.project.aggregate({
        where: {
          createdAt: { gte: prevPeriodStart, lte: startDate },
          status: 'COMPLETED',
          ...(session.user.role !== 'ADMIN' && { companyId: session.user.companyId })
        },
        _sum: { totalAmount: true }
      })
    ])

    // Calculate growth percentages
    const projectGrowth = prevProjectStats._count.id > 0 
      ? ((projectStats._count.id - prevProjectStats._count.id) / prevProjectStats._count.id) * 100 
      : 0

    const revenueGrowth = (prevRevenueStats._sum.totalAmount || 0) > 0 
      ? (((revenueStats._sum.totalAmount || 0) - (prevRevenueStats._sum.totalAmount || 0)) / (prevRevenueStats._sum.totalAmount || 0)) * 100 
      : 0

    // Format response
    const response = {
      metrics: {
        totalProjects: projectStats._count.id,
        totalRevenue: revenueStats._sum.totalAmount || 0,
        totalCustomers: customerStats._count.id,
        totalQuotes: quoteStats._count.id,
        totalQuoteValue: quoteStats._sum.totalAmount || 0,
        totalSystemCapacity: systemCapacityStats._sum.systemSize || 0,
        averageSystemSize: systemCapacityStats._avg.systemSize || 0,
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
        topCustomers: (topCustomers || []).map((customer: any) => ({
          id: customer.id,
          name: `${customer.first_name} ${customer.last_name}`,
          type: customer.customer_type,
          totalValue: parseFloat(customer.total_value) || 0,
          projectCount: parseInt(customer.project_count) || 0
        }))
      },

      activities: {
        recentProjects: recentProjects.map(project => ({
          id: project.id,
          name: project.name,
          status: project.status,
          statusLabel: getStatusLabel(project.status),
          totalAmount: project.totalAmount,
          systemSize: project.systemSize,
          customerName: `${project.customer.firstName} ${project.customer.lastName}`,
          createdAt: project.createdAt
        })),
        
        recentCustomers: recentCustomers.map(customer => ({
          id: customer.id,
          name: `${customer.firstName} ${customer.lastName}`,
          email: customer.email,
          type: customer.customerType,
          lastProjectValue: customer.projects[0]?.totalAmount || 0,
          createdAt: customer.createdAt
        })),
        
        recentQuotes: recentQuotes.map(quote => ({
          id: quote.id,
          title: quote.title,
          status: quote.status,
          statusLabel: getQuoteStatusLabel(quote.status),
          totalAmount: quote.totalAmount,
          validUntil: quote.validUntil,
          customerName: `${quote.customer.firstName} ${quote.customer.lastName}`,
          createdAt: quote.createdAt
        }))
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