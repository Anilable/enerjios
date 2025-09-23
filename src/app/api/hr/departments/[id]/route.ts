import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const departmentUpdateSchema = z.object({
  name: z.string().min(1, 'Department name is required').optional(),
  description: z.string().optional(),
  managerId: z.string().optional(),
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

    const department = await prisma.department.findFirst({
      where: {
        id: params.id,
        companyId
      },
      include: {
        manager: {
          select: {
            firstName: true,
            lastName: true,
            employeeCode: true
          }
        },
        employees: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            employeeCode: true,
            isActive: true
          }
        }
      }
    })

    if (!department) {
      return NextResponse.json(
        { error: 'Department not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      ...department,
      employeeCount: department.employees.length,
      activeEmployeeCount: department.employees.filter(emp => emp.isActive).length
    })

  } catch (error) {
    console.error('Error fetching department:', error)
    return NextResponse.json(
      { error: 'Failed to fetch department' },
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

    const validatedData = departmentUpdateSchema.parse(body)

    // Check if department exists and belongs to company
    const existingDepartment = await prisma.department.findFirst({
      where: {
        id: params.id,
        companyId
      }
    })

    if (!existingDepartment) {
      return NextResponse.json(
        { error: 'Department not found' },
        { status: 404 }
      )
    }

    // Check for duplicate department name if being updated
    if (validatedData.name) {
      const duplicateDepartment = await prisma.department.findFirst({
        where: {
          companyId,
          id: { not: params.id },
          name: validatedData.name
        }
      })

      if (duplicateDepartment) {
        return NextResponse.json(
          { error: 'Department with this name already exists' },
          { status: 400 }
        )
      }
    }

    // Verify manager exists if being updated
    if (validatedData.managerId) {
      const manager = await prisma.employee.findFirst({
        where: {
          id: validatedData.managerId,
          companyId,
          isActive: true
        }
      })

      if (!manager) {
        return NextResponse.json(
          { error: 'Manager not found or inactive' },
          { status: 400 }
        )
      }
    }

    const updatedDepartment = await prisma.department.update({
      where: { id: params.id },
      data: validatedData,
      include: {
        manager: {
          select: {
            firstName: true,
            lastName: true,
            employeeCode: true
          }
        },
        employees: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            employeeCode: true,
            isActive: true
          }
        }
      }
    })

    return NextResponse.json({
      ...updatedDepartment,
      employeeCount: updatedDepartment.employees.length,
      activeEmployeeCount: updatedDepartment.employees.filter(emp => emp.isActive).length
    })

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.issues },
        { status: 400 }
      )
    }

    console.error('Error updating department:', error)
    return NextResponse.json(
      { error: 'Failed to update department' },
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

    // Check if department exists and belongs to company
    const existingDepartment = await prisma.department.findFirst({
      where: {
        id: params.id,
        companyId
      },
      include: {
        employees: true
      }
    })

    if (!existingDepartment) {
      return NextResponse.json(
        { error: 'Department not found' },
        { status: 404 }
      )
    }

    // Check if department has employees
    if (existingDepartment.employees.length > 0) {
      return NextResponse.json(
        {
          error: 'Cannot delete department with employees',
          details: `Department has ${existingDepartment.employees.length} employees`
        },
        { status: 400 }
      )
    }

    await prisma.department.delete({
      where: { id: params.id }
    })

    return NextResponse.json({
      message: 'Department deleted successfully'
    })

  } catch (error) {
    console.error('Error deleting department:', error)
    return NextResponse.json(
      { error: 'Failed to delete department' },
      { status: 500 }
    )
  }
}