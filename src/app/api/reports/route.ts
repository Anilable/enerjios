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

    const { searchParams } = new URL(request.url)
    const reportType = searchParams.get('type')
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')
    const groupBy = searchParams.get('groupBy') || 'month'

    let dateFilter = {}
    if (startDate && endDate) {
      dateFilter = {
        createdAt: {
          gte: new Date(startDate),
          lte: new Date(endDate)
        }
      }
    }

    switch (reportType) {
      case 'sales-summary': {
        const salesData = await prisma.project.findMany({
          where: {
            status: 'COMPLETED',
            ...dateFilter
          },
          select: {
            id: true,
            totalAmount: true,
            createdAt: true,
            company: {
              select: { name: true }
            },
            customer: {
              select: { firstName: true, lastName: true }
            }
          }
        })

        // Group by period
        const groupedData = groupSalesByPeriod(salesData, groupBy)
        
        return NextResponse.json({
          type: 'sales-summary',
          data: groupedData,
          total: salesData.reduce((sum, project) => sum + (project.totalAmount || 0), 0),
          count: salesData.length
        })
      }

      case 'project-performance': {
        const projects = await prisma.project.findMany({
          where: dateFilter,
          select: {
            id: true,
            name: true,
            status: true,
            systemSize: true,
            totalAmount: true,
            estimatedAnnualProduction: true,
            createdAt: true,
            updatedAt: true,
            company: {
              select: { name: true }
            }
          }
        })

        const performanceData = projects.map(project => ({
          ...project,
          completionTime: project.status === 'COMPLETED' 
            ? Math.ceil((project.updatedAt.getTime() - project.createdAt.getTime()) / (1000 * 60 * 60 * 24))
            : null,
          profitability: project.totalAmount && project.systemSize 
            ? project.totalAmount / project.systemSize
            : 0
        }))

        return NextResponse.json({
          type: 'project-performance',
          data: performanceData
        })
      }

      case 'customer-analytics': {
        const customers = await prisma.customer.findMany({
          where: dateFilter,
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
            customerType: true,
            createdAt: true,
            projects: {
              select: {
                id: true,
                status: true,
                totalAmount: true
              }
            }
          }
        })

        const analyticsData = customers.map(customer => ({
          id: customer.id,
          name: `${customer.firstName} ${customer.lastName}`,
          email: customer.email,
          phone: customer.phone,
          type: customer.customerType,
          joinDate: customer.createdAt,
          projectCount: customer.projects.length,
          totalValue: customer.projects.reduce((sum, p) => sum + (p.totalAmount || 0), 0),
          completedProjects: customer.projects.filter(p => p.status === 'COMPLETED').length
        }))

        return NextResponse.json({
          type: 'customer-analytics',
          data: analyticsData
        })
      }

      case 'financial-overview': {
        const [quotes, projects, payments] = await Promise.all([
          prisma.quote.findMany({
            where: dateFilter,
            select: {
              totalAmount: true,
              status: true,
              createdAt: true
            }
          }),
          prisma.project.findMany({
            where: dateFilter,
            select: {
              totalAmount: true,
              status: true,
              systemSize: true,
              createdAt: true
            }
          }),
          // Note: Assuming payments table exists
          prisma.project.findMany({
            where: {
              ...dateFilter,
              status: 'COMPLETED'
            },
            select: {
              totalAmount: true,
              createdAt: true
            }
          })
        ])

        const totalQuoteValue = quotes.reduce((sum, q) => sum + (q.totalAmount || 0), 0)
        const totalProjectValue = projects.reduce((sum, p) => sum + (p.totalAmount || 0), 0)
        const totalRevenue = payments.reduce((sum, p) => sum + (p.totalAmount || 0), 0)

        const conversionRate = quotes.length > 0 
          ? (projects.filter(p => p.status !== 'DRAFT').length / quotes.length) * 100 
          : 0

        return NextResponse.json({
          type: 'financial-overview',
          data: {
            totalQuoteValue,
            totalProjectValue,
            totalRevenue,
            conversionRate,
            activeProjects: projects.filter(p => ['APPROVED', 'IN_PROGRESS'].includes(p.status)).length,
            completedProjects: projects.filter(p => p.status === 'COMPLETED').length,
            avgProjectSize: projects.length > 0 
              ? projects.reduce((sum, p) => sum + (p.systemSize || 0), 0) / projects.length 
              : 0
          }
        })
      }

      case 'company-performance': {
        if (session.user.role !== 'ADMIN') {
          return NextResponse.json({ error: 'Access denied' }, { status: 403 })
        }

        const companies = await prisma.company.findMany({
          select: {
            id: true,
            name: true,
            createdAt: true,
            projects: {
              where: dateFilter,
              select: {
                id: true,
                status: true,
                totalAmount: true,
                systemSize: true
              }
            },
            quotes: {
              where: dateFilter,
              select: {
                id: true,
                status: true,
                totalAmount: true
              }
            }
          }
        })

        const companyData = companies.map(company => ({
          id: company.id,
          name: company.name,
          joinDate: company.createdAt,
          projectCount: company.projects.length,
          quoteCount: company.quotes.length,
          totalRevenue: company.projects
            .filter(p => p.status === 'COMPLETED')
            .reduce((sum, p) => sum + (p.totalAmount || 0), 0),
          totalCapacity: company.projects
            .reduce((sum, p) => sum + (p.systemSize || 0), 0),
          conversionRate: company.quotes.length > 0 
            ? (company.projects.filter(p => p.status !== 'DRAFT').length / company.quotes.length) * 100 
            : 0
        }))

        return NextResponse.json({
          type: 'company-performance',
          data: companyData
        })
      }

      default: {
        return NextResponse.json(
          { error: 'Invalid report type' },
          { status: 400 }
        )
      }
    }
  } catch (error) {
    console.error('Reports API error:', error)
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    )
  }
}

function groupSalesByPeriod(salesData: any[], groupBy: string) {
  const grouped = salesData.reduce((acc, sale) => {
    const date = new Date(sale.createdAt)
    let key = ''

    switch (groupBy) {
      case 'day':
        key = date.toISOString().split('T')[0]
        break
      case 'week':
        const startOfWeek = new Date(date)
        startOfWeek.setDate(date.getDate() - date.getDay())
        key = startOfWeek.toISOString().split('T')[0]
        break
      case 'month':
        key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
        break
      case 'year':
        key = date.getFullYear().toString()
        break
      default:
        key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
    }

    if (!acc[key]) {
      acc[key] = {
        period: key,
        totalAmount: 0,
        projectCount: 0,
        projects: []
      }
    }

    acc[key].totalAmount += sale.totalAmount || 0
    acc[key].projectCount += 1
    acc[key].projects.push(sale)

    return acc
  }, {} as any)

  return Object.values(grouped).sort((a: any, b: any) => a.period.localeCompare(b.period))
}