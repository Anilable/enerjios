import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const approvalSchema = z.object({
  action: z.enum(['approve', 'reject']),
  comments: z.string().optional(),
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

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const adminCheck = await checkAdminPermissions()
    if (adminCheck instanceof NextResponse) return adminCheck

    const { user, companyId } = adminCheck

    if (!companyId) {
      return NextResponse.json(
        { error: 'Company not found' },
        { status: 400 }
      )
    }
    const body = await request.json()

    const validatedData = approvalSchema.parse(body)

    // Find leave request and verify it belongs to company
    const leaveRequest = await prisma.leaveRequest.findFirst({
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
            email: true,
            employeeDepartment: {
              select: {
                name: true
              }
            }
          }
        }
      }
    })

    if (!leaveRequest) {
      return NextResponse.json(
        { error: 'Leave request not found' },
        { status: 404 }
      )
    }

    if (leaveRequest.status !== 'PENDING') {
      return NextResponse.json(
        {
          error: 'Leave request has already been processed',
          currentStatus: leaveRequest.status
        },
        { status: 400 }
      )
    }

    // Check if leave is in the past
    const today = new Date()
    if (leaveRequest.startDate < today && validatedData.action === 'approve') {
      return NextResponse.json(
        { error: 'Cannot approve leave request for past dates' },
        { status: 400 }
      )
    }

    const newStatus = validatedData.action === 'approve' ? 'APPROVED' : 'REJECTED'

    const updatedLeaveRequest = await prisma.leaveRequest.update({
      where: { id: params.id },
      data: {
        status: newStatus,
        approvedBy: user.id,
        approvedAt: validatedData.action === 'approve' ? new Date() : undefined,
        rejectedAt: validatedData.action === 'reject' ? new Date() : undefined,
        notes: validatedData.comments
      },
      include: {
        employee: {
          select: {
            firstName: true,
            lastName: true,
            employeeCode: true,
            email: true,
            employeeDepartment: {
              select: {
                name: true
              }
            }
          }
        },
      }
    })

    // TODO: Send email notification to employee
    console.log(`Leave request ${validatedData.action}d for ${leaveRequest.employee.firstName} ${leaveRequest.employee.lastName}`)
    console.log(`Email should be sent to: ${leaveRequest.employee.email}`)

    // TODO: Add to calendar if approved
    if (validatedData.action === 'approve') {
      console.log(`Adding leave to calendar: ${leaveRequest.startDate} to ${leaveRequest.endDate}`)
    }

    return NextResponse.json({
      message: `Leave request ${validatedData.action}d successfully`,
      leaveRequest: updatedLeaveRequest
    })

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.issues },
        { status: 400 }
      )
    }

    console.error('Error processing leave request approval:', error)
    return NextResponse.json(
      { error: 'Failed to process leave request' },
      { status: 500 }
    )
  }
}