import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const clockOutSchema = z.object({
  employeeId: z.string().min(1, 'Employee ID is required'),
  breakDuration: z.number().min(0, 'Break duration cannot be negative').optional().default(0),
  notes: z.string().optional(),
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

function calculateHours(clockIn: Date, clockOut: Date, breakDuration: number): number {
  const totalMinutes = Math.floor((clockOut.getTime() - clockIn.getTime()) / (1000 * 60))
  const workMinutes = totalMinutes - breakDuration
  return Math.max(0, workMinutes / 60) // Convert to hours, ensure non-negative
}

function detectOvertime(totalHours: number): boolean {
  const standardWorkDay = 8 // hours
  return totalHours > standardWorkDay
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

    const validatedData = clockOutSchema.parse(body)

    // Verify employee exists and belongs to company
    const employee = await prisma.employee.findFirst({
      where: {
        id: validatedData.employeeId,
        companyId,
        isActive: true
      }
    })

    if (!employee) {
      return NextResponse.json(
        { error: 'Employee not found or inactive' },
        { status: 404 }
      )
    }

    const today = new Date()
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate())

    // Find today's time entry
    const timeEntry = await prisma.timeEntry.findFirst({
      where: {
        employeeId: validatedData.employeeId,
        date: startOfDay
      }
    })

    if (!timeEntry) {
      return NextResponse.json(
        { error: 'No clock-in record found for today' },
        { status: 400 }
      )
    }

    if (!timeEntry.clockIn) {
      return NextResponse.json(
        { error: 'Employee has not clocked in today' },
        { status: 400 }
      )
    }

    if (timeEntry.clockOut) {
      return NextResponse.json(
        {
          error: 'Employee already clocked out today',
          existingEntry: {
            clockIn: timeEntry.clockIn,
            clockOut: timeEntry.clockOut,
            totalHours: timeEntry.totalHours
          }
        },
        { status: 400 }
      )
    }

    // Calculate total hours
    const totalHours = calculateHours(timeEntry.clockIn, today, validatedData.breakDuration)
    const isOvertime = detectOvertime(totalHours)

    const updatedTimeEntry = await prisma.timeEntry.update({
      where: { id: timeEntry.id },
      data: {
        clockOut: today,
        breakDuration: validatedData.breakDuration,
        totalHours,
        status: 'OUT',
        notes: validatedData.notes
          ? timeEntry.notes
            ? `${timeEntry.notes} | ${validatedData.notes}`
            : validatedData.notes
          : timeEntry.notes
      },
      include: {
        employee: {
          select: {
            firstName: true,
            lastName: true,
            employeeCode: true
          }
        }
      }
    })

    return NextResponse.json({
      message: 'Clock-out successful',
      timeEntry: updatedTimeEntry,
      overtime: isOvertime,
      summary: {
        clockIn: timeEntry.clockIn,
        clockOut: today,
        totalHours,
        breakDuration: validatedData.breakDuration,
        isOvertime
      }
    })

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.issues },
        { status: 400 }
      )
    }

    console.error('Error clocking out:', error)
    return NextResponse.json(
      { error: 'Failed to clock out' },
      { status: 500 }
    )
  }
}