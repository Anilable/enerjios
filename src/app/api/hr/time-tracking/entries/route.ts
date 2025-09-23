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
    const employeeId = searchParams.get('employeeId')
    const departmentId = searchParams.get('departmentId')
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')
    const format = searchParams.get('format') // 'json' or 'csv'

    const skip = (page - 1) * limit

    // Build date filter
    const dateFilter: any = {}
    if (startDate) {
      dateFilter.gte = new Date(startDate)
    }
    if (endDate) {
      dateFilter.lte = new Date(endDate)
    }

    // Build employee filter
    const employeeFilter: any = {
      companyId
    }
    if (employeeId) {
      employeeFilter.id = employeeId
    }
    if (departmentId) {
      employeeFilter.departmentId = departmentId
    }

    const whereClause: any = {
      employee: employeeFilter,
      ...(Object.keys(dateFilter).length > 0 && { date: dateFilter })
    }

    const [timeEntries, total] = await Promise.all([
      prisma.timeEntry.findMany({
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
        skip: format === 'csv' ? undefined : skip,
        take: format === 'csv' ? undefined : limit,
        orderBy: { date: 'desc' }
      }),
      prisma.timeEntry.count({ where: whereClause })
    ])

    // Calculate summary statistics
    const summary = {
      totalEntries: total,
      totalHours: timeEntries.reduce((sum, entry) => sum + (entry.totalHours || 0), 0),
      averageHours: timeEntries.length > 0
        ? timeEntries.reduce((sum, entry) => sum + (entry.totalHours || 0), 0) / timeEntries.length
        : 0,
      overtimeEntries: timeEntries.filter(entry => (entry.totalHours || 0) > 8).length,
      presentDays: timeEntries.filter(entry => entry.clockIn).length,
      absentDays: timeEntries.filter(entry => !entry.clockIn).length
    }

    if (format === 'csv') {
      // Generate CSV export
      const csvHeader = 'Date,Employee Code,Employee Name,Department,Clock In,Clock Out,Break Duration,Total Hours,Status,Location,Notes\n'
      const csvRows = timeEntries.map(entry => [
        entry.date.toISOString().split('T')[0],
        entry.employee.employeeCode,
        `${entry.employee.firstName} ${entry.employee.lastName}`,
        entry.employee.employeeDepartment?.name || '',
        entry.clockIn?.toLocaleTimeString() || '',
        entry.clockOut?.toLocaleTimeString() || '',
        entry.breakDuration || 0,
        entry.totalHours || 0,
        entry.status,
        entry.location || '',
        entry.notes || ''
      ].map(field => `"${field}"`).join(','))

      const csvContent = csvHeader + csvRows.join('\n')

      return new NextResponse(csvContent, {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="time-entries-${new Date().toISOString().split('T')[0]}.csv"`
        }
      })
    }

    return NextResponse.json({
      timeEntries,
      summary,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    })

  } catch (error) {
    console.error('Error fetching time entries:', error)
    return NextResponse.json(
      { error: 'Failed to fetch time entries' },
      { status: 500 }
    )
  }
}