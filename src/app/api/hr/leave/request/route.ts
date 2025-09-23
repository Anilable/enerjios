import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const leaveRequestSchema = z.object({
  employeeId: z.string().min(1, 'Employee ID is required'),
  type: z.enum(['SICK', 'VACATION', 'PERSONAL']),
  startDate: z.string().transform((str) => new Date(str)),
  endDate: z.string().transform((str) => new Date(str)),
  reason: z.string().min(1, 'Reason is required'),
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

function calculateLeaveDays(startDate: Date, endDate: Date): number {
  const start = new Date(startDate)
  const end = new Date(endDate)

  // Calculate business days (exclude weekends)
  let count = 0
  const current = new Date(start)

  while (current <= end) {
    const dayOfWeek = current.getDay()
    if (dayOfWeek !== 0 && dayOfWeek !== 6) { // Not Sunday (0) or Saturday (6)
      count++
    }
    current.setDate(current.getDate() + 1)
  }

  return count
}

export async function POST(request: NextRequest) {
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

    const validatedData = leaveRequestSchema.parse(body)

    // Verify employee exists and belongs to company
    const employee = await prisma.employee.findFirst({
      where: {
        id: validatedData.employeeId,
        companyId,
        isActive: true
      },
      include: {
        employeeDepartment: {
          select: {
            name: true,
            managerId: true
          }
        }
      }
    })

    if (!employee) {
      return NextResponse.json(
        { error: 'Employee not found or inactive' },
        { status: 404 }
      )
    }

    // Validate date range
    if (validatedData.startDate >= validatedData.endDate) {
      return NextResponse.json(
        { error: 'End date must be after start date' },
        { status: 400 }
      )
    }

    // Check for overlapping leave requests
    const conflictingLeave = await prisma.leaveRequest.findFirst({
      where: {
        employeeId: validatedData.employeeId,
        status: { not: 'REJECTED' },
        OR: [
          {
            startDate: { lte: validatedData.endDate },
            endDate: { gte: validatedData.startDate }
          }
        ]
      }
    })

    if (conflictingLeave) {
      return NextResponse.json(
        {
          error: 'Leave request conflicts with existing leave',
          conflictingRequest: {
            id: conflictingLeave.id,
            startDate: conflictingLeave.startDate,
            endDate: conflictingLeave.endDate,
            status: conflictingLeave.status
          }
        },
        { status: 400 }
      )
    }

    // Calculate total days
    const totalDays = calculateLeaveDays(validatedData.startDate, validatedData.endDate)

    // Check leave balance for vacation requests
    if (validatedData.type === 'VACATION') {
      const currentYear = new Date().getFullYear()
      const approvedLeaves = await prisma.leaveRequest.findMany({
        where: {
          employeeId: validatedData.employeeId,
          status: 'APPROVED',
          type: 'VACATION',
          startDate: {
            gte: new Date(currentYear, 0, 1),
            lt: new Date(currentYear + 1, 0, 1)
          }
        }
      })

      const usedVacationDays = approvedLeaves.reduce((sum, leave) => sum + leave.totalDays, 0)
      const totalVacationEntitlement = 30 // Can be made configurable
      const availableVacationDays = totalVacationEntitlement - usedVacationDays

      if (totalDays > availableVacationDays) {
        return NextResponse.json(
          {
            error: 'Insufficient vacation balance',
            details: {
              requested: totalDays,
              available: availableVacationDays,
              used: usedVacationDays,
              total: totalVacationEntitlement
            }
          },
          { status: 400 }
        )
      }
    }

    const leaveRequest = await prisma.leaveRequest.create({
      data: {
        employeeId: validatedData.employeeId,
        type: validatedData.type,
        startDate: validatedData.startDate,
        endDate: validatedData.endDate,
        totalDays,
        reason: validatedData.reason,
        status: 'PENDING'
      },
      include: {
        employee: {
          select: {
            firstName: true,
            lastName: true,
            employeeCode: true,
            employeeDepartment: {
              select: {
                name: true,
                managerId: true
              }
            }
          }
        }
      }
    })

    // TODO: Send notification to manager
    console.log(`New leave request from ${employee.firstName} ${employee.lastName} for ${totalDays} days`)

    return NextResponse.json(leaveRequest, { status: 201 })

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.issues },
        { status: 400 }
      )
    }

    console.error('Error creating leave request:', error)
    return NextResponse.json(
      { error: 'Failed to create leave request' },
      { status: 500 }
    )
  }
}