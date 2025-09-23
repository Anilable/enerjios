import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth-utils'
import { checkApiPermissions } from '@/lib/permissions'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth()
    
    // Check permissions
    const hasAccess = checkApiPermissions(
      user.role as any,
      user.id,
      ['finance:read'],
      undefined
    )

    if (!hasAccess) {
      return NextResponse.json(
        { error: 'Bu işlem için yetkiniz bulunmamaktadır' },
        { status: 403 }
      )
    }

    const searchParams = request.nextUrl.searchParams
    const type = searchParams.get('type') || 'overview'

    switch (type) {
      case 'overview':
        return await getFinancialOverview()
      case 'invoices':
        return await getInvoices()
      case 'expenses':
        return await getExpenses()
      case 'revenue':
        return await getRevenueData()
      default:
        return NextResponse.json({ error: 'Geçersiz tip' }, { status: 400 })
    }
  } catch (error) {
    console.error('Finance API error:', error)
    return NextResponse.json(
      { error: 'Finansal veriler alınırken hata oluştu' },
      { status: 500 }
    )
  }
}

async function getFinancialOverview() {
  // Get current month data
  const currentDate = new Date()
  const currentMonth = currentDate.getMonth()
  const currentYear = currentDate.getFullYear()
  
  // Get quotes data for revenue calculation
  const quotes = await prisma.quote.findMany({
    where: {
      status: 'APPROVED',
      approvedAt: {
        gte: new Date(currentYear, currentMonth, 1),
        lt: new Date(currentYear, currentMonth + 1, 1)
      }
    },
    select: {
      total: true,
      approvedAt: true
    }
  })

  const monthlyRevenue = quotes.reduce((sum, quote) => sum + quote.total, 0)

  // Get project costs for expenses
  const projects = await prisma.project.findMany({
    where: {
      createdAt: {
        gte: new Date(currentYear, currentMonth, 1),
        lt: new Date(currentYear, currentMonth + 1, 1)
      }
    },
    select: {
      actualCost: true,
      estimatedCost: true
    }
  })

  const monthlyExpenses = projects.reduce((sum, project) => 
    sum + (project.actualCost || project.estimatedCost || 0), 0
  )

  // Get pending invoices
  const pendingQuotes = await prisma.quote.findMany({
    where: {
      status: 'SENT'
    },
    select: {
      total: true
    }
  })

  const pendingAmount = pendingQuotes.reduce((sum, quote) => sum + quote.total, 0)

  return NextResponse.json({
    monthlyRevenue,
    monthlyExpenses,
    netProfit: monthlyRevenue - monthlyExpenses,
    pendingAmount,
    pendingCount: pendingQuotes.length
  })
}

async function getInvoices() {
  const quotes = await prisma.quote.findMany({
    where: {
      status: {
        in: ['SENT', 'APPROVED', 'EXPIRED']
      }
    },
    include: {
      customer: {
        select: {
          firstName: true,
          lastName: true,
          companyName: true
        }
      },
      project: {
        select: {
          name: true
        }
      }
    },
    orderBy: {
      createdAt: 'desc'
    },
    take: 20
  })

  const invoices = quotes.map(quote => ({
    id: quote.quoteNumber,
    customer: quote.customer?.companyName || 
              `${quote.customer?.firstName || ''} ${quote.customer?.lastName || ''}`.trim() || 
              'Bilinmeyen Müşteri',
    project: quote.project?.name || 'Proje Adı Belirtilmemiş',
    amount: quote.total,
    date: quote.createdAt.toISOString().split('T')[0],
    dueDate: quote.validUntil.toISOString().split('T')[0],
    status: quote.status === 'APPROVED' ? 'paid' : 
            quote.status === 'SENT' ? 'pending' : 'overdue'
  }))

  return NextResponse.json({ invoices })
}

async function getExpenses() {
  // Get project costs as expenses
  const projects = await prisma.project.findMany({
    where: {
      actualCost: {
        gt: 0
      }
    },
    select: {
      id: true,
      name: true,
      actualCost: true,
      createdAt: true,
      company: {
        select: {
          name: true
        }
      }
    },
    orderBy: {
      createdAt: 'desc'
    },
    take: 10
  })

  const expenses = projects.map((project, index) => ({
    id: project.id,
    category: 'Proje Maliyeti',
    description: project.name,
    amount: project.actualCost || 0,
    date: project.createdAt.toISOString().split('T')[0],
    vendor: project.company?.name || 'İç Kaynak'
  }))

  return NextResponse.json({ expenses })
}

async function getRevenueData() {
  const currentDate = new Date()
  const sixMonthsAgo = new Date(currentDate.getFullYear(), currentDate.getMonth() - 5, 1)
  
  const monthlyData = []
  
  for (let i = 5; i >= 0; i--) {
    const monthStart = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1)
    const monthEnd = new Date(currentDate.getFullYear(), currentDate.getMonth() - i + 1, 1)
    
    // Get revenue from approved quotes
    const quotes = await prisma.quote.findMany({
      where: {
        status: 'APPROVED',
        approvedAt: {
          gte: monthStart,
          lt: monthEnd
        }
      },
      select: {
        total: true
      }
    })
    
    const revenue = quotes.reduce((sum, quote) => sum + quote.total, 0)
    
    // Get expenses from project costs
    const projects = await prisma.project.findMany({
      where: {
        createdAt: {
          gte: monthStart,
          lt: monthEnd
        }
      },
      select: {
        actualCost: true,
        estimatedCost: true
      }
    })
    
    const expenses = projects.reduce((sum, project) => 
      sum + (project.actualCost || project.estimatedCost || 0), 0
    )
    
    monthlyData.push({
      month: monthStart.toLocaleDateString('tr-TR', { month: 'long' }),
      revenue,
      expenses,
      profit: revenue - expenses
    })
  }
  
  return NextResponse.json({ revenueData: monthlyData })
}