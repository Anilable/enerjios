import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const employeeUpdateSchema = z.object({
  firstName: z.string().min(1, 'First name is required').optional(),
  lastName: z.string().min(1, 'Last name is required').optional(),
  email: z.string().email('Valid email is required').optional(),
  employeeCode: z.string().min(1, 'Employee code is required').optional(),
  departmentId: z.string().optional(),
  position: z.string().min(1, 'Position is required').optional(),
  salary: z.number().min(0, 'Salary must be positive').optional(),
  phoneNumber: z.string().optional(),
  address: z.string().optional(),
  emergencyContact: z.string().optional(),
  endDate: z.string().transform((str) => new Date(str)).optional(),
  profileImage: z.string().optional(),
  isActive: z.boolean().optional(),
})

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

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const employee = await prisma.employee.findFirst({
      where: {
        id: params.id,
        companyId
      },
      include: {
        employeeDepartment: true,
        timeEntries: {
          orderBy: { date: 'desc' },
          take: 30
        },
        leaveRequests: {
          orderBy: { createdAt: 'desc' }
        },
        documents: {
          orderBy: { uploadDate: 'desc' }
        }
      }
    })

    if (!employee) {
      return NextResponse.json(
        { error: 'Employee not found' },
        { status: 404 }
      )
    }

    // Calculate leave balance
    const currentYear = new Date().getFullYear()
    const approvedLeaves = await prisma.leaveRequest.findMany({
      where: {
        employeeId: params.id,
        status: 'APPROVED',
        startDate: {
          gte: new Date(currentYear, 0, 1),
          lt: new Date(currentYear + 1, 0, 1)
        }
      }
    })

    const usedLeaveDays = approvedLeaves.reduce((sum, leave) => sum + leave.totalDays, 0)
    const totalLeaveEntitlement = 30 // Can be made configurable
    const remainingLeave = totalLeaveEntitlement - usedLeaveDays

    // Calculate recent attendance stats
    const last30Days = new Date(new Date().setDate(new Date().getDate() - 30))
    const recentTimeEntries = await prisma.timeEntry.findMany({
      where: {
        employeeId: params.id,
        date: { gte: last30Days }
      }
    })

    const attendanceStats = {
      totalDays: recentTimeEntries.length,
      averageHours: recentTimeEntries.length > 0
        ? recentTimeEntries.reduce((sum, entry) => sum + (entry.totalHours || 0), 0) / recentTimeEntries.length
        : 0
    }

    return NextResponse.json({
      ...employee,
      leaveBalance: {
        total: totalLeaveEntitlement,
        used: usedLeaveDays,
        remaining: remainingLeave
      },
      attendanceStats
    })

  } catch (error) {
    console.error('Error fetching employee details:', error)
    return NextResponse.json(
      { error: 'Failed to fetch employee details' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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
    const body = await request.json()

    const validatedData = employeeUpdateSchema.parse(body)

    // Check if employee exists and belongs to company
    const existingEmployee = await prisma.employee.findFirst({
      where: {
        id: params.id,
        companyId
      }
    })

    if (!existingEmployee) {
      return NextResponse.json(
        { error: 'Employee not found' },
        { status: 404 }
      )
    }

    // Check for unique email and employee code if being updated
    if (validatedData.email || validatedData.employeeCode) {
      const duplicateEmployee = await prisma.employee.findFirst({
        where: {
          companyId,
          id: { not: params.id },
          OR: [
            ...(validatedData.email ? [{ email: validatedData.email }] : []),
            ...(validatedData.employeeCode ? [{ employeeCode: validatedData.employeeCode }] : [])
          ]
        }
      })

      if (duplicateEmployee) {
        const field = duplicateEmployee.email === validatedData.email ? 'email' : 'employee code'
        return NextResponse.json(
          { error: `Another employee with this ${field} already exists` },
          { status: 400 }
        )
      }
    }

    // Verify department exists if being updated
    if (validatedData.departmentId) {
      const department = await prisma.department.findFirst({
        where: {
          id: validatedData.departmentId,
          companyId
        }
      })

      if (!department) {
        return NextResponse.json(
          { error: 'Department not found' },
          { status: 400 }
        )
      }
    }

    // Log department change if applicable
    if (validatedData.departmentId && validatedData.departmentId !== existingEmployee.departmentId) {
      console.log(`Employee ${existingEmployee.firstName} ${existingEmployee.lastName} moved from department ${existingEmployee.departmentId} to ${validatedData.departmentId}`)
    }

    // Log salary change if applicable
    if (validatedData.salary && validatedData.salary !== existingEmployee.salary) {
      console.log(`Employee ${existingEmployee.firstName} ${existingEmployee.lastName} salary changed from ${existingEmployee.salary} to ${validatedData.salary}`)
    }

    const updatedEmployee = await prisma.employee.update({
      where: { id: params.id },
      data: validatedData,
      include: {
        employeeDepartment: true
      }
    })

    return NextResponse.json(updatedEmployee)

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.issues },
        { status: 400 }
      )
    }

    console.error('Error updating employee:', error)
    return NextResponse.json(
      { error: 'Failed to update employee' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    // Check if employee exists and belongs to company
    const existingEmployee = await prisma.employee.findFirst({
      where: {
        id: params.id,
        companyId
      }
    })

    if (!existingEmployee) {
      return NextResponse.json(
        { error: 'Employee not found' },
        { status: 404 }
      )
    }

    // Soft delete - set isActive to false and endDate to today
    const deletedEmployee = await prisma.employee.update({
      where: { id: params.id },
      data: {
        isActive: false,
        endDate: new Date()
      },
      include: {
        employeeDepartment: true
      }
    })

    return NextResponse.json({
      message: 'Employee deactivated successfully',
      employee: deletedEmployee
    })

  } catch (error) {
    console.error('Error deleting employee:', error)
    return NextResponse.json(
      { error: 'Failed to delete employee' },
      { status: 500 }
    )
  }
}