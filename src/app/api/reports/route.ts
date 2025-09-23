import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth-utils'
import { checkApiPermissions } from '@/lib/permissions'
import { prisma } from '@/lib/prisma'

// Add input validation schema
import { z } from 'zod'

const reportsQuerySchema = z.object({
  type: z.enum(['sales-summary', 'project-performance', 'customer-analytics', 'financial-overview', 'company-performance']).default('sales-summary'),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  groupBy: z.enum(['day', 'week', 'month']).default('month')
})

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth()

    // Check permissions
    const hasAccess = checkApiPermissions(
      user.role as any,
      user.id,
      ['reports:read'],
      undefined
    )

    if (!hasAccess) {
      return NextResponse.json(
        { 
          error: 'Bu işlem için yetkiniz bulunmamaktadır',
          code: 'INSUFFICIENT_PERMISSIONS' 
        },
        { status: 403 }
      )
    }

    // Validate query parameters
    const searchParams = request.nextUrl.searchParams
    const queryParams = {
      type: searchParams.get('type') || 'sales-summary',
      startDate: searchParams.get('startDate'),
      endDate: searchParams.get('endDate'),
      groupBy: searchParams.get('groupBy') || 'month'
    }

    const validationResult = reportsQuerySchema.safeParse(queryParams)
    if (!validationResult.success) {
      return NextResponse.json(
        { 
          error: 'Geçersiz parametreler',
          code: 'VALIDATION_ERROR',
          details: validationResult.error.issues
        },
        { status: 400 }
      )
    }

    const { type, startDate, endDate, groupBy } = validationResult.data

    const dateFilter = startDate && endDate ? {
      gte: new Date(startDate),
      lte: new Date(endDate)
    } : undefined

    // Validate date range
    if (dateFilter && dateFilter.gte > dateFilter.lte) {
      return NextResponse.json(
        { 
          error: 'Başlangıç tarihi bitiş tarihinden sonra olamaz',
          code: 'INVALID_DATE_RANGE'
        },
        { status: 400 }
      )
    }

    switch (type) {
      case 'sales-summary':
        return await getSalesSummary(dateFilter, groupBy)
      case 'project-performance':
        return await getProjectPerformance(dateFilter)
      case 'customer-analytics':
        return await getCustomerAnalytics(dateFilter)
      case 'financial-overview':
        return await getFinancialOverview(dateFilter)
      case 'company-performance':
        if (user.role !== 'ADMIN') {
          return NextResponse.json({ 
            error: 'Bu rapor türü için admin yetkisi gereklidir',
            code: 'ADMIN_REQUIRED'
          }, { status: 403 })
        }
        return await getCompanyPerformance(dateFilter)
      default:
        return NextResponse.json({ 
          error: 'Geçersiz rapor tipi',
          code: 'INVALID_REPORT_TYPE'
        }, { status: 400 })
    }
  } catch (error) {
    console.error('Reports API error:', error)
    
    // Handle specific error types
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          error: 'Veri doğrulama hatası',
          code: 'VALIDATION_ERROR',
          details: error.issues
        },
        { status: 400 }
      )
    }

    if (error instanceof Error && error.message.includes('Database')) {
      return NextResponse.json(
        { 
          error: 'Veritabanı bağlantı hatası',
          code: 'DATABASE_ERROR'
        },
        { status: 503 }
      )
    }

    return NextResponse.json(
      { 
        error: 'Rapor verileri alınırken hata oluştu',
        code: 'INTERNAL_ERROR'
      },
      { status: 500 }
    )
  }
}

async function getSalesSummary(dateFilter: any, groupBy: string) {
  // Get quotes data for sales summary
  const quotes = await prisma.quote.findMany({
    where: {
      status: 'APPROVED',
      ...(dateFilter && { approvedAt: dateFilter })
    },
    select: {
      total: true,
      approvedAt: true,
      createdAt: true
    },
    orderBy: {
      approvedAt: 'asc'
    }
  })

  // Group data by period
  const groupedData = groupDataByPeriod(quotes, groupBy, 'approvedAt')

  return NextResponse.json({
    data: groupedData,
    summary: {
      totalSales: quotes.reduce((sum, quote) => sum + quote.total, 0),
      totalCount: quotes.length,
      averageValue: quotes.length > 0 ? quotes.reduce((sum, quote) => sum + quote.total, 0) / quotes.length : 0
    }
  })
}

async function getProjectPerformance(dateFilter: any) {
  // Optimized query with aggregation
  const projects = await prisma.project.findMany({
    where: {
      ...(dateFilter && { createdAt: dateFilter })
    },
    select: {
      id: true,
      name: true,
      status: true,
      capacity: true,
      actualCost: true,
      estimatedCost: true,
      company: {
        select: { name: true }
      },
      _count: {
        select: {
          quotes: {
            where: { status: 'APPROVED' }
          }
        }
      }
    }
  })

  // Get quote totals in a separate optimized query
  const projectIds = projects.map(p => p.id)
  const quoteTotals = await prisma.quote.groupBy({
    by: ['projectId'],
    where: {
      projectId: { in: projectIds },
      status: 'APPROVED'
    },
    _sum: {
      total: true
    }
  })

  // Create lookup map for O(1) access
  const quoteTotalMap = new Map(
    quoteTotals.map(qt => [qt.projectId, qt._sum.total || 0])
  )

  const performanceData = projects.map(project => {
    const revenue = quoteTotalMap.get(project.id) || 0
    const cost = project.actualCost || project.estimatedCost || 0
    const profit = revenue - cost
    const profitability = project.capacity > 0 ? profit / project.capacity : 0

    return {
      id: project.id,
      name: project.name,
      status: project.status,
      systemSize: project.capacity,
      revenue,
      cost,
      profit,
      profitability,
      company: project.company?.name || 'Bilinmeyen'
    }
  })

  // Calculate summary using reduce for better performance
  const summary = performanceData.reduce(
    (acc, project) => ({
      totalProjects: acc.totalProjects + 1,
      totalCapacity: acc.totalCapacity + project.systemSize,
      totalRevenue: acc.totalRevenue + project.revenue,
      totalProfit: acc.totalProfit + project.profit
    }),
    { totalProjects: 0, totalCapacity: 0, totalRevenue: 0, totalProfit: 0 }
  )

  return NextResponse.json({
    data: performanceData,
    summary
  })
}

async function getCustomerAnalytics(dateFilter: any) {
  const customers = await prisma.customer.findMany({
    where: {
      ...(dateFilter && { createdAt: dateFilter })
    },
    include: {
      projects: {
        include: {
          quotes: {
            where: { status: 'APPROVED' },
            select: { total: true }
          }
        }
      }
    }
  })

  const customerData = customers.map(customer => {
    const totalValue = customer.projects.reduce((sum, project) =>
      sum + project.quotes.reduce((qSum, quote) => qSum + quote.total, 0), 0
    )

    return {
      id: customer.id,
      name: customer.companyName || `${customer.firstName} ${customer.lastName}`,
      type: customer.companyName ? 'COMPANY' : 'INDIVIDUAL',
      projectCount: customer.projects.length,
      totalValue,
      averageProjectValue: customer.projects.length > 0 ? totalValue / customer.projects.length : 0,
      createdAt: customer.createdAt
    }
  })

  return NextResponse.json({
    data: customerData,
    summary: {
      totalCustomers: customers.length,
      individualCustomers: customerData.filter(c => c.type === 'INDIVIDUAL').length,
      companyCustomers: customerData.filter(c => c.type === 'COMPANY').length,
      repeatCustomers: customerData.filter(c => c.projectCount > 1).length,
      totalValue: customerData.reduce((sum, c) => sum + c.totalValue, 0)
    }
  })
}

async function getFinancialOverview(dateFilter: any) {
  // Get current month data if no date filter
  const currentDate = new Date()
  const currentMonth = currentDate.getMonth()
  const currentYear = currentDate.getFullYear()

  const defaultDateFilter = {
    gte: new Date(currentYear, currentMonth, 1),
    lt: new Date(currentYear, currentMonth + 1, 1)
  }

  const actualDateFilter = dateFilter || defaultDateFilter

  // Get revenue from approved quotes
  const quotes = await prisma.quote.findMany({
    where: {
      status: 'APPROVED',
      approvedAt: actualDateFilter
    },
    select: {
      total: true,
      approvedAt: true
    }
  })

  const totalRevenue = quotes.reduce((sum, quote) => sum + quote.total, 0)

  // Get project data
  const projects = await prisma.project.findMany({
    where: {
      createdAt: actualDateFilter
    },
    select: {
      capacity: true,
      actualCost: true,
      estimatedCost: true,
      status: true
    }
  })

  const activeProjects = projects.filter(p => p.status === 'IN_PROGRESS').length
  const completedProjects = projects.filter(p => p.status === 'COMPLETED').length
  const totalCapacity = projects.reduce((sum, p) => sum + p.capacity, 0)
  const avgProjectSize = projects.length > 0 ? totalCapacity / projects.length : 0

  // Calculate conversion rate (approved quotes vs total quotes)
  const totalQuotes = await prisma.quote.count({
    where: {
      createdAt: actualDateFilter
    }
  })

  const conversionRate = totalQuotes > 0 ? (quotes.length / totalQuotes) * 100 : 0

  return NextResponse.json({
    data: {
      totalRevenue,
      totalProjects: projects.length,
      activeProjects,
      completedProjects,
      systemCapacity: totalCapacity,
      avgProjectSize,
      conversionRate,
      avgProjectValue: quotes.length > 0 ? totalRevenue / quotes.length : 0
    },
    chartData: groupDataByPeriod(quotes, 'week', 'approvedAt')
  })
}

async function getCompanyPerformance(dateFilter: any) {
  const companies = await prisma.company.findMany({
    include: {
      projects: {
        where: {
          ...(dateFilter && { createdAt: dateFilter })
        },
        include: {
          quotes: {
            where: { status: 'APPROVED' },
            select: { total: true }
          }
        }
      }
    }
  })

  const companyData = companies.map(company => {
    const totalRevenue = company.projects.reduce((sum, project) =>
      sum + project.quotes.reduce((qSum, quote) => qSum + quote.total, 0), 0
    )

    const totalCapacity = company.projects.reduce((sum, p) => sum + p.capacity, 0)

    return {
      id: company.id,
      name: company.name,
      projectCount: company.projects.length,
      totalRevenue,
      totalCapacity,
      averageProjectValue: company.projects.length > 0 ? totalRevenue / company.projects.length : 0,
      averageProjectSize: company.projects.length > 0 ? totalCapacity / company.projects.length : 0
    }
  }).sort((a, b) => b.totalRevenue - a.totalRevenue)

  return NextResponse.json({
    data: companyData,
    summary: {
      totalCompanies: companies.length,
      totalRevenue: companyData.reduce((sum, c) => sum + c.totalRevenue, 0),
      totalProjects: companyData.reduce((sum, c) => sum + c.projectCount, 0),
      totalCapacity: companyData.reduce((sum, c) => sum + c.totalCapacity, 0)
    }
  })
}

function groupDataByPeriod(data: any[], groupBy: string, dateField: string) {
  const grouped: { [key: string]: any } = {}

  data.forEach(item => {
    const date = new Date(item[dateField])
    let key: string

    switch (groupBy) {
      case 'day':
        key = date.toISOString().split('T')[0]
        break
      case 'week':
        const weekStart = new Date(date)
        weekStart.setDate(date.getDate() - date.getDay())
        key = weekStart.toISOString().split('T')[0]
        break
      case 'month':
        key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
        break
      default:
        key = date.toISOString().split('T')[0]
    }

    if (!grouped[key]) {
      grouped[key] = {
        period: formatPeriodLabel(key, groupBy),
        totalAmount: 0,
        count: 0
      }
    }

    grouped[key].totalAmount += item.total || 0
    grouped[key].count += 1
  })

  return Object.values(grouped).sort((a: any, b: any) => a.period.localeCompare(b.period))
}

function formatPeriodLabel(key: string, groupBy: string): string {
  const date = new Date(key)

  switch (groupBy) {
    case 'day':
      return date.toLocaleDateString('tr-TR')
    case 'week':
      const weekEnd = new Date(date)
      weekEnd.setDate(date.getDate() + 6)
      return `${date.toLocaleDateString('tr-TR')} - ${weekEnd.toLocaleDateString('tr-TR')}`
    case 'month':
      return date.toLocaleDateString('tr-TR', { year: 'numeric', month: 'long' })
    default:
      return key
  }
}