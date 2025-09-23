import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export interface ReportHandler {
  handle(dateFilter: any, options?: any): Promise<NextResponse>
}

export class SalesSummaryHandler implements ReportHandler {
  async handle(dateFilter: any, groupBy: string = 'month'): Promise<NextResponse> {
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

    const groupedData = this.groupDataByPeriod(quotes, groupBy, 'approvedAt')

    return NextResponse.json({
      data: groupedData,
      summary: {
        totalSales: quotes.reduce((sum, quote) => sum + quote.total, 0),
        totalCount: quotes.length,
        averageValue: quotes.length > 0 ? quotes.reduce((sum, quote) => sum + quote.total, 0) / quotes.length : 0
      }
    })
  }

  private groupDataByPeriod(data: any[], groupBy: string, dateField: string) {
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
          period: this.formatPeriodLabel(key, groupBy),
          totalAmount: 0,
          count: 0
        }
      }

      grouped[key].totalAmount += item.total || 0
      grouped[key].count += 1
    })

    return Object.values(grouped).sort((a: any, b: any) => a.period.localeCompare(b.period))
  }

  private formatPeriodLabel(key: string, groupBy: string): string {
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
}

export class ProjectPerformanceHandler implements ReportHandler {
  async handle(dateFilter: any): Promise<NextResponse> {
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
}

export class ReportHandlerFactory {
  private static handlers: Map<string, ReportHandler> = new Map([
    ['sales-summary', new SalesSummaryHandler()],
    ['project-performance', new ProjectPerformanceHandler()],
    // Add more handlers as needed
  ])

  static getHandler(reportType: string): ReportHandler | null {
    return this.handlers.get(reportType) || null
  }

  static getSupportedTypes(): string[] {
    return Array.from(this.handlers.keys())
  }
}