import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

async function checkAdminPermissions() {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: { company: true }
  })

  if (!user || user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
  }

  return { user, companyId: user.company?.id }
}

export async function GET(request: NextRequest) {
  try {
    const adminCheck = await checkAdminPermissions()
    if (adminCheck instanceof NextResponse) return adminCheck

    const { companyId } = adminCheck

    if (!companyId) {
      return NextResponse.json(
        { error: 'Company not found' },
        { status: 400 }
      )
    }
    const { searchParams } = new URL(request.url)

    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const status = searchParams.get('status')
    const type = searchParams.get('type')
    const employeeId = searchParams.get('employeeId')
    const departmentId = searchParams.get('departmentId')
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')
    const view = searchParams.get('view') // 'list' or 'calendar'

    const skip = (page - 1) * limit

    // Build filters
    const whereClause: any = {
      employee: {
        companyId
      }
    }

    if (status) {
      whereClause.status = status
    }

    if (type) {
      whereClause.type = type
    }

    if (employeeId) {
      whereClause.employeeId = employeeId
    }

    if (departmentId) {
      whereClause.employee.departmentId = departmentId
    }

    if (startDate || endDate) {
      whereClause.OR = [
        {
          startDate: {
            ...(startDate && { gte: new Date(startDate) }),
            ...(endDate && { lte: new Date(endDate) })
          }
        },
        {
          endDate: {
            ...(startDate && { gte: new Date(startDate) }),
            ...(endDate && { lte: new Date(endDate) })
          }
        }
      ]
    }

    if (view === 'calendar') {
      // Calendar view - return all requests in the date range without pagination
      const calendarRequests = await prisma.leaveRequest.findMany({
        where: whereClause,
        include: {
          employee: {
            select: {
              firstName: true,
              lastName: true,
              employeeCode: true,
              employeeDepartment: {
                select: {
                  name: true
                }
              }
            }
          }
        },
        orderBy: { startDate: 'asc' }
      })

      // Format for calendar display
      const calendarEvents = calendarRequests.map(request => ({
        id: request.id,
        title: `${request.employee.firstName} ${request.employee.lastName} - ${request.type}`,
        start: request.startDate,
        end: request.endDate,
        backgroundColor: getStatusColor(request.status),
        borderColor: getTypeColor(request.type),
        extendedProps: {
          employeeName: `${request.employee.firstName} ${request.employee.lastName}`,
          employeeCode: request.employee.employeeCode,
          department: request.employee.employeeDepartment?.name,
          type: request.type,
          status: request.status,
          totalDays: request.totalDays,
          reason: request.reason
        }
      }))

      return NextResponse.json({
        events: calendarEvents,
        total: calendarRequests.length
      })
    }

    // List view with pagination
    const [leaveRequests, total] = await Promise.all([
      prisma.leaveRequest.findMany({
        where: whereClause,
        include: {
          employee: {
            select: {
              firstName: true,
              lastName: true,
              employeeCode: true,
              employeeDepartment: {
                select: {
                  name: true
                }
              }
            }
          }
        },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' }
      }),
      prisma.leaveRequest.count({ where: whereClause })
    ])

    // Calculate summary statistics
    const summary = await prisma.leaveRequest.groupBy({
      by: ['status'],
      where: {
        employee: {
          companyId
        }
      },
      _count: true,
      _sum: {
        totalDays: true
      }
    })

    const summaryStats = {
      pending: summary.find(s => s.status === 'PENDING')?._count || 0,
      approved: summary.find(s => s.status === 'APPROVED')?._count || 0,
      rejected: summary.find(s => s.status === 'REJECTED')?._count || 0,
      totalDaysRequested: summary.reduce((sum, s) => sum + (s._sum.totalDays || 0), 0)
    }

    return NextResponse.json({
      leaveRequests,
      summary: summaryStats,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    })

  } catch (error) {
    console.error('Error fetching leave requests:', error)
    return NextResponse.json(
      { error: 'Failed to fetch leave requests' },
      { status: 500 }
    )
  }
}

function getStatusColor(status: string): string {
  switch (status) {
    case 'PENDING':
      return '#fbbf24' // yellow
    case 'APPROVED':
      return '#10b981' // green
    case 'REJECTED':
      return '#ef4444' // red
    default:
      return '#6b7280' // gray
  }
}

function getTypeColor(type: string): string {
  switch (type) {
    case 'VACATION':
      return '#3b82f6' // blue
    case 'SICK':
      return '#f59e0b' // amber
    case 'PERSONAL':
      return '#8b5cf6' // purple
    default:
      return '#6b7280' // gray
  }
}