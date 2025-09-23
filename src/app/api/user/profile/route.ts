import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth-utils'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const profileSchema = z.object({
  firstName: z.string().min(1, 'Ad gereklidir'),
  lastName: z.string().min(1, 'Soyad gereklidir'),
  email: z.string().email('Geçerli bir e-posta adresi giriniz'),
  phone: z.string().optional(),
  company: z.string().optional()
})

export async function PUT(request: NextRequest) {
  try {
    const user = await requireAuth()
    const body = await request.json()
    
    const validatedData = profileSchema.parse(body)
    
    // Update user profile
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        name: `${validatedData.firstName} ${validatedData.lastName}`.trim(),
        email: validatedData.email,
        phone: validatedData.phone || null
      }
    })

    // Update or create company if provided
    if (validatedData.company) {
      await prisma.company.upsert({
        where: { userId: user.id },
        update: {
          name: validatedData.company
        },
        create: {
          userId: user.id,
          name: validatedData.company,
          taxNumber: `TAX-${user.id}-${Date.now()}`, // Generate a unique tax number
          type: 'INSTALLER' // Default type
        }
      })
    }

    return NextResponse.json({
      message: 'Profil başarıyla güncellendi',
      user: {
        id: updatedUser.id,
        name: updatedUser.name,
        email: updatedUser.email,
        phone: updatedUser.phone
      }
    })
  } catch (error) {
    console.error('Profile update error:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Geçersiz veri', details: error.issues },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Profil güncellenirken hata oluştu' },
      { status: 500 }
    )
  }
}