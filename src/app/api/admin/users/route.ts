import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

// User creation schema
const createUserSchema = z.object({
  name: z.string().min(2, 'İsim en az 2 karakter olmalıdır'),
  email: z.string().email('Geçerli bir email adresi giriniz'),
  role: z.enum(['ADMIN', 'COMPANY', 'CUSTOMER', 'FARMER', 'BANK']),
  phone: z.string().optional(),
  status: z.enum(['ACTIVE', 'INACTIVE', 'SUSPENDED', 'PENDING']).optional().default('ACTIVE')
})

// GET - List all users (Admin only)
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search')
    const role = searchParams.get('role')
    const status = searchParams.get('status')

    const whereClause: any = {}

    if (search) {
      whereClause.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } }
      ]
    }

    if (role) {
      whereClause.role = role
    }

    if (status) {
      whereClause.status = status === 'active' ? 'ACTIVE' : { not: 'ACTIVE' }
    }

    const users = await prisma.user.findMany({
      where: whereClause,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        phone: true,
        status: true,
        createdAt: true,
        updatedAt: true,
        image: true,
        // Don't include password hash
      },
      orderBy: [
        { createdAt: 'desc' }
      ]
    })

    // Get user statistics
    const stats = await prisma.user.aggregate({
      _count: {
        id: true
      },
      where: {
        status: 'ACTIVE'
      }
    })

    const roleStats = await prisma.user.groupBy({
      by: ['role'],
      _count: {
        id: true
      }
    })

    // Monthly new users
    const monthStart = new Date()
    monthStart.setDate(1)
    monthStart.setHours(0, 0, 0, 0)

    const monthlyNewUsers = await prisma.user.count({
      where: {
        createdAt: {
          gte: monthStart
        }
      }
    })

    return NextResponse.json({
      success: true,
      data: {
        users,
        stats: {
          total: users.length,
          active: stats._count.id,
          roles: roleStats.reduce((acc: any, stat) => {
            acc[stat.role] = stat._count.id
            return acc
          }, {}),
          monthlyNew: monthlyNewUsers
        }
      }
    })

  } catch (error) {
    console.error('Users GET Error:', error)

    return NextResponse.json(
      {
        error: 'Failed to fetch users',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

// POST - Create new user (Admin only)
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const validatedData = createUserSchema.parse(body)

    // Check if user with this email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: validatedData.email }
    })

    if (existingUser) {
      return NextResponse.json(
        { error: 'Bu email adresi ile kayıtlı kullanıcı zaten mevcut' },
        { status: 409 }
      )
    }

    // Create new user
    const newUser = await prisma.user.create({
      data: {
        name: validatedData.name,
        email: validatedData.email,
        role: validatedData.role,
        phone: validatedData.phone,
        status: validatedData.status ?? 'ACTIVE',
        // Note: password will be set separately via email invitation
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        phone: true,
        status: true,
        createdAt: true
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Kullanıcı başarıyla oluşturuldu',
      data: newUser
    }, { status: 201 })

  } catch (error) {
    console.error('User CREATE Error:', error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: 'Validation error',
          details: error.issues.map((e: any) => `${e.path.join('.')}: ${e.message}`)
        },
        { status: 400 }
      )
    }

    return NextResponse.json(
      {
        error: 'Failed to create user',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}