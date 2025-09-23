import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const clockInSchema = z.object({
  employeeId: z.string().min(1, 'Employee ID is required'),
  location: z.string().optional(),
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

    const validatedData = clockInSchema.parse(body)

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

    // Check if employee already clocked in today
    const existingEntry = await prisma.timeEntry.findFirst({
      where: {
        employeeId: validatedData.employeeId,
        date: startOfDay
      }
    })

    if (existingEntry && existingEntry.clockIn) {
      return NextResponse.json(
        {
          error: 'Employee already clocked in today',
          existingEntry: {
            clockIn: existingEntry.clockIn,
            status: existingEntry.status
          }
        },
        { status: 400 }
      )
    }

    const timeEntry = existingEntry
      ? await prisma.timeEntry.update({
          where: { id: existingEntry.id },
          data: {
            clockIn: today,
            status: 'IN',
            location: validatedData.location,
            notes: validatedData.notes
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
      : await prisma.timeEntry.create({
          data: {
            employeeId: validatedData.employeeId,
            date: startOfDay,
            clockIn: today,
            status: 'IN',
            location: validatedData.location,
            notes: validatedData.notes
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
      message: 'Clock-in successful',
      timeEntry
    }, { status: 201 })

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.issues },
        { status: 400 }
      )
    }

    console.error('Error clocking in:', error)
    return NextResponse.json(
      { error: 'Failed to clock in' },
      { status: 500 }
    )
  }
}