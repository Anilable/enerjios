import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const timeEntryUpdateSchema = z.object({
  clockIn: z.string().transform((str) => new Date(str)).optional(),
  clockOut: z.string().transform((str) => new Date(str)).optional(),
  breakDuration: z.number().min(0).optional(),
  notes: z.string().optional(),
  location: z.string().optional(),
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

    const timeEntry = await prisma.timeEntry.findFirst({
      where: {
        id: params.id,
        employee: {
          companyId
        }
      },
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
      }
    })

    if (!timeEntry) {
      return NextResponse.json(
        { error: 'Time entry not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(timeEntry)

  } catch (error) {
    console.error('Error fetching time entry:', error)
    return NextResponse.json(
      { error: 'Failed to fetch time entry' },
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

    const validatedData = timeEntryUpdateSchema.parse(body)

    // Check if time entry exists and belongs to company
    const existingTimeEntry = await prisma.timeEntry.findFirst({
      where: {
        id: params.id,
        employee: {
          companyId
        }
      }
    })

    if (!existingTimeEntry) {
      return NextResponse.json(
        { error: 'Time entry not found' },
        { status: 404 }
      )
    }

    // Calculate total hours if both clock in and out are provided
    let totalHours = existingTimeEntry.totalHours
    const clockIn = validatedData.clockIn || existingTimeEntry.clockIn
    const clockOut = validatedData.clockOut || existingTimeEntry.clockOut
    const breakDuration = validatedData.breakDuration ?? existingTimeEntry.breakDuration

    if (clockIn && clockOut) {
      totalHours = calculateHours(clockIn, clockOut, breakDuration || 0)
    }

    // Determine status
    let status = existingTimeEntry.status
    if (validatedData.clockIn && !clockOut) {
      status = 'IN'
    } else if (clockOut) {
      status = 'OUT'
    }

    const updatedTimeEntry = await prisma.timeEntry.update({
      where: { id: params.id },
      data: {
        ...validatedData,
        totalHours,
        status
      },
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
      }
    })

    return NextResponse.json({
      message: 'Time entry updated successfully',
      timeEntry: updatedTimeEntry
    })

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.issues },
        { status: 400 }
      )
    }

    console.error('Error updating time entry:', error)
    return NextResponse.json(
      { error: 'Failed to update time entry' },
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

    // Check if time entry exists and belongs to company
    const existingTimeEntry = await prisma.timeEntry.findFirst({
      where: {
        id: params.id,
        employee: {
          companyId
        }
      }
    })

    if (!existingTimeEntry) {
      return NextResponse.json(
        { error: 'Time entry not found' },
        { status: 404 }
      )
    }

    await prisma.timeEntry.delete({
      where: { id: params.id }
    })

    return NextResponse.json({
      message: 'Time entry deleted successfully'
    })

  } catch (error) {
    console.error('Error deleting time entry:', error)
    return NextResponse.json(
      { error: 'Failed to delete time entry' },
      { status: 500 }
    )
  }
}