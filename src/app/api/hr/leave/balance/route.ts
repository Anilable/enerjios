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

interface LeaveBalance {
  employeeId: string
  employeeName: string
  employeeCode: string
  department: string
  vacation: {
    total: number
    used: number
    pending: number
    remaining: number
  }
  sick: {
    used: number
    pending: number
  }
  personal: {
    used: number
    pending: number
  }
  startDate: Date
  yearsOfService: number
}

function calculateYearsOfService(startDate: Date): number {
  const today = new Date()
  const diffTime = Math.abs(today.getTime() - startDate.getTime())
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  return Math.floor(diffDays / 365)
}

function getVacationEntitlement(yearsOfService: number): number {
  // Configurable entitlement rules
  if (yearsOfService >= 5) return 35
  if (yearsOfService >= 3) return 30
  if (yearsOfService >= 1) return 25
  return 20
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

    const employeeId = searchParams.get('employeeId')
    const departmentId = searchParams.get('departmentId')
    const year = parseInt(searchParams.get('year') || new Date().getFullYear().toString())

    const startOfYear = new Date(year, 0, 1)
    const endOfYear = new Date(year + 1, 0, 1)

    // Build employee filter
    const employeeFilter: any = {
      companyId,
      isActive: true
    }

    if (employeeId) {
      employeeFilter.id = employeeId
    }

    if (departmentId) {
      employeeFilter.departmentId = departmentId
    }

    // Get all active employees
    const employees = await prisma.employee.findMany({
      where: employeeFilter,
      include: {
        employeeDepartment: {
          select: {
            name: true
          }
        },
        leaveRequests: {
          where: {
            startDate: {
              gte: startOfYear,
              lt: endOfYear
            }
          }
        }
      },
      orderBy: [
        { employeeDepartment: { name: 'asc' } },
        { firstName: 'asc' }
      ]
    })

    const leaveBalances: LeaveBalance[] = employees.map(employee => {
      const yearsOfService = calculateYearsOfService(employee.startDate)
      const vacationEntitlement = getVacationEntitlement(yearsOfService)

      // Calculate leave usage by type and status
      const vacationApproved = employee.leaveRequests
        .filter(req => req.type === 'VACATION' && req.status === 'APPROVED')
        .reduce((sum, req) => sum + req.totalDays, 0)

      const vacationPending = employee.leaveRequests
        .filter(req => req.type === 'VACATION' && req.status === 'PENDING')
        .reduce((sum, req) => sum + req.totalDays, 0)

      const sickUsed = employee.leaveRequests
        .filter(req => req.type === 'SICK' && req.status === 'APPROVED')
        .reduce((sum, req) => sum + req.totalDays, 0)

      const sickPending = employee.leaveRequests
        .filter(req => req.type === 'SICK' && req.status === 'PENDING')
        .reduce((sum, req) => sum + req.totalDays, 0)

      const personalUsed = employee.leaveRequests
        .filter(req => req.type === 'PERSONAL' && req.status === 'APPROVED')
        .reduce((sum, req) => sum + req.totalDays, 0)

      const personalPending = employee.leaveRequests
        .filter(req => req.type === 'PERSONAL' && req.status === 'PENDING')
        .reduce((sum, req) => sum + req.totalDays, 0)

      return {
        employeeId: employee.id,
        employeeName: `${employee.firstName} ${employee.lastName}`,
        employeeCode: employee.employeeCode,
        department: employee.employeeDepartment?.name || 'No Department',
        vacation: {
          total: vacationEntitlement,
          used: vacationApproved,
          pending: vacationPending,
          remaining: Math.max(0, vacationEntitlement - vacationApproved - vacationPending)
        },
        sick: {
          used: sickUsed,
          pending: sickPending
        },
        personal: {
          used: personalUsed,
          pending: personalPending
        },
        startDate: employee.startDate,
        yearsOfService
      }
    })

    // Calculate company-wide statistics
    const companyStats = {
      totalEmployees: leaveBalances.length,
      totalVacationDays: leaveBalances.reduce((sum, emp) => sum + emp.vacation.total, 0),
      usedVacationDays: leaveBalances.reduce((sum, emp) => sum + emp.vacation.used, 0),
      pendingVacationDays: leaveBalances.reduce((sum, emp) => sum + emp.vacation.pending, 0),
      remainingVacationDays: leaveBalances.reduce((sum, emp) => sum + emp.vacation.remaining, 0),
      totalSickDays: leaveBalances.reduce((sum, emp) => sum + emp.sick.used, 0),
      totalPersonalDays: leaveBalances.reduce((sum, emp) => sum + emp.personal.used, 0),
      averageVacationUsage: leaveBalances.length > 0
        ? leaveBalances.reduce((sum, emp) => sum + emp.vacation.used, 0) / leaveBalances.length
        : 0
    }

    // Group by department for department-wise analysis
    const departmentStats = leaveBalances.reduce((acc, emp) => {
      if (!acc[emp.department]) {
        acc[emp.department] = {
          employeeCount: 0,
          totalVacationDays: 0,
          usedVacationDays: 0,
          pendingVacationDays: 0,
          remainingVacationDays: 0
        }
      }

      acc[emp.department].employeeCount++
      acc[emp.department].totalVacationDays += emp.vacation.total
      acc[emp.department].usedVacationDays += emp.vacation.used
      acc[emp.department].pendingVacationDays += emp.vacation.pending
      acc[emp.department].remainingVacationDays += emp.vacation.remaining

      return acc
    }, {} as Record<string, any>)

    return NextResponse.json({
      leaveBalances,
      companyStats,
      departmentStats,
      year,
      carryoverRules: {
        vacationCarryover: 5, // Max days that can be carried over
        carryoverDeadline: `${year + 1}-03-31`, // Deadline to use carried over days
        maxCarryover: true
      }
    })

  } catch (error) {
    console.error('Error fetching leave balances:', error)
    return NextResponse.json(
      { error: 'Failed to fetch leave balances' },
      { status: 500 }
    )
  }
}