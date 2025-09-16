import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

// User update schema
const updateUserSchema = z.object({
  name: z.string().min(2, 'İsim en az 2 karakter olmalıdır').optional(),
  email: z.string().email('Geçerli bir email adresi giriniz').optional(),
  role: z.enum(['ADMIN', 'COMPANY', 'CUSTOMER', 'FARMER', 'BANK']).optional(),
  phone: z.string().optional(),
  status: z.enum(['ACTIVE', 'INACTIVE', 'SUSPENDED', 'PENDING']).optional()
})

// GET - Get specific user details (Admin only)
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 401 }
      )
    }

    const user = await prisma.user.findUnique({
      where: { id: params.id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        phone: true,
        status: true,
        createdAt: true,
        updatedAt: true,
        image: true
      }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'Kullanıcı bulunamadı' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: user
    })

  } catch (error) {
    console.error('User GET Error:', error)

    return NextResponse.json(
      {
        error: 'Failed to fetch user',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

// PUT - Update user (Admin only)
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const validatedData = updateUserSchema.parse(body)

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { id: params.id }
    })

    if (!existingUser) {
      return NextResponse.json(
        { error: 'Kullanıcı bulunamadı' },
        { status: 404 }
      )
    }

    // Prevent admin from deactivating themselves
    if (existingUser.id === session.user.id && validatedData.status && validatedData.status !== 'ACTIVE') {
      return NextResponse.json(
        { error: 'Kendi hesabınızı devre dışı bırakamazsınız' },
        { status: 400 }
      )
    }

    // Check if email already exists (if changing email)
    if (validatedData.email && validatedData.email !== existingUser.email) {
      const emailExists = await prisma.user.findUnique({
        where: { email: validatedData.email }
      })

      if (emailExists) {
        return NextResponse.json(
          { error: 'Bu email adresi ile kayıtlı başka bir kullanıcı mevcut' },
          { status: 409 }
        )
      }
    }

    // Update user
    const updatedUser = await prisma.user.update({
      where: { id: params.id },
      data: {
        ...validatedData,
        updatedAt: new Date()
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        phone: true,
        status: true,
        updatedAt: true
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Kullanıcı başarıyla güncellendi',
      data: updatedUser
    })

  } catch (error) {
    console.error('User UPDATE Error:', error)

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
        error: 'Failed to update user',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

// DELETE - Delete user (Admin only)
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 401 }
      )
    }

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { id: params.id }
    })

    if (!existingUser) {
      return NextResponse.json(
        { error: 'Kullanıcı bulunamadı' },
        { status: 404 }
      )
    }

    // Prevent admin from deleting themselves
    if (existingUser.id === session.user.id) {
      return NextResponse.json(
        { error: 'Kendi hesabınızı silemezsiniz' },
        { status: 400 }
      )
    }

    // Check if user has related data that should be preserved
    const userProjects = await prisma.project.count({
      where: { ownerId: params.id }
    })

    if (userProjects > 0) {
      // Instead of hard delete, mark as inactive
      const deactivatedUser = await prisma.user.update({
        where: { id: params.id },
        data: {
          status: 'INACTIVE',
          updatedAt: new Date()
        }
      })

      return NextResponse.json({
        success: true,
        message: `Kullanıcı ${userProjects} proje ile ilişkili olduğu için devre dışı bırakıldı`,
        data: { deactivated: true }
      })
    }

    // Safe to delete - no related data
    await prisma.user.delete({
      where: { id: params.id }
    })

    return NextResponse.json({
      success: true,
      message: 'Kullanıcı başarıyla silindi',
      data: { deleted: true }
    })

  } catch (error) {
    console.error('User DELETE Error:', error)

    return NextResponse.json(
      {
        error: 'Failed to delete user',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}