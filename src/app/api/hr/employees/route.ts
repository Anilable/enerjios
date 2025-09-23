import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const employeeCreateSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Valid email is required'),
  employeeCode: z.string().min(1, 'Employee code is required'),
  departmentId: z.string().optional(),
  position: z.string().min(1, 'Position is required'),
  salary: z.number().min(0, 'Salary must be positive'),
  phoneNumber: z.string().optional(),
  address: z.string().optional(),
  emergencyContact: z.string().optional(),
  startDate: z.string().transform((str) => new Date(str)),
  profileImage: z.string().optional(),
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
    const limit = parseInt(searchParams.get('limit') || '10')
    const search = searchParams.get('search') || ''
    const departmentId = searchParams.get('departmentId')
    const status = searchParams.get('status')

    const skip = (page - 1) * limit

    const whereClause: any = {
      companyId,
      ...(search && {
        OR: [
          { firstName: { contains: search, mode: 'insensitive' } },
          { lastName: { contains: search, mode: 'insensitive' } },
          { email: { contains: search, mode: 'insensitive' } },
          { employeeCode: { contains: search, mode: 'insensitive' } },
        ],
      }),
      ...(departmentId && { departmentId }),
      ...(status && {
        isActive: status === 'active' ? true : status === 'inactive' ? false : undefined
      }),
    }

    const [employees, total] = await Promise.all([
      prisma.employee.findMany({
        where: whereClause,
        include: {
          employeeDepartment: true,
          timeEntries: {
            where: {
              date: {
                gte: new Date(new Date().setDate(new Date().getDate() - 30))
              }
            },
            take: 5,
            orderBy: { date: 'desc' }
          },
          leaveRequests: {
            where: {
              status: 'PENDING'
            },
            take: 3
          }
        },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' }
      }),
      prisma.employee.count({ where: whereClause })
    ])

    return NextResponse.json({
      employees,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    })

  } catch (error) {
    console.error('Error fetching employees:', error)
    return NextResponse.json(
      { error: 'Failed to fetch employees' },
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

    const validatedData = employeeCreateSchema.parse(body)

    // Check for unique email and employee code within company
    const existingEmployee = await prisma.employee.findFirst({
      where: {
        companyId,
        OR: [
          { email: validatedData.email },
          { employeeCode: validatedData.employeeCode }
        ]
      }
    })

    if (existingEmployee) {
      const field = existingEmployee.email === validatedData.email ? 'email' : 'employee code'
      return NextResponse.json(
        { error: `Employee with this ${field} already exists` },
        { status: 400 }
      )
    }

    // Verify department exists if provided
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

    const employee = await prisma.employee.create({
      data: {
        ...validatedData,
        companyId,
        isActive: true
      },
      include: {
        employeeDepartment: true
      }
    })

    return NextResponse.json(employee, { status: 201 })

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.issues },
        { status: 400 }
      )
    }

    console.error('Error creating employee:', error)
    return NextResponse.json(
      { error: 'Failed to create employee' },
      { status: 500 }
    )
  }
}