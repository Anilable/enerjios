import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const departmentCreateSchema = z.object({
  name: z.string().min(1, 'Department name is required'),
  description: z.string().optional(),
  managerId: z.string().optional(),
})

const departmentUpdateSchema = departmentCreateSchema.partial()

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

    const departments = await prisma.department.findMany({
      where: { companyId },
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
      },
      orderBy: { name: 'asc' }
    })

    // Add employee count and active employee count
    const departmentsWithStats = departments.map(dept => ({
      ...dept,
      employeeCount: dept.employees.length,
      activeEmployeeCount: dept.employees.filter(emp => emp.isActive).length
    }))

    return NextResponse.json({
      departments: departmentsWithStats
    })

  } catch (error) {
    console.error('Error fetching departments:', error)
    return NextResponse.json(
      { error: 'Failed to fetch departments' },
      { status: 500 }
    )
  }
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

    const validatedData = departmentCreateSchema.parse(body)

    // Check for duplicate department name within company
    const existingDepartment = await prisma.department.findFirst({
      where: {
        companyId,
        name: validatedData.name
      }
    })

    if (existingDepartment) {
      return NextResponse.json(
        { error: 'Department with this name already exists' },
        { status: 400 }
      )
    }

    // Verify manager exists if provided
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

    const department = await prisma.department.create({
      data: {
        ...validatedData,
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

    return NextResponse.json(department, { status: 201 })

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.issues },
        { status: 400 }
      )
    }

    console.error('Error creating department:', error)
    return NextResponse.json(
      { error: 'Failed to create department' },
      { status: 500 }
    )
  }
}