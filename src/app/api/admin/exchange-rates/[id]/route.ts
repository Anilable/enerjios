import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const updateRateSchema = z.object({
  rate: z.number().positive().min(0.01).max(1000),
  description: z.string().optional(),
  isActive: z.boolean().optional()
})

// GET - Tekil manuel kur detayı
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

    const manualRate = await prisma.manualExchangeRate.findUnique({
      where: { id: params.id },
      include: {
        creator: {
          select: {
            id: true,
            email: true,
            name: true
          }
        }
      }
    })

    if (!manualRate) {
      return NextResponse.json(
        { error: 'Manual exchange rate not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: manualRate
    })

  } catch (error) {
    console.error('Manual Exchange Rate GET Error:', error)

    return NextResponse.json(
      {
        error: 'Failed to fetch manual exchange rate',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

// PUT - Manuel kur güncelle
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
    const validatedData = updateRateSchema.parse(body)

    // Mevcut kaydı kontrol et
    const existingRate = await prisma.manualExchangeRate.findUnique({
      where: { id: params.id }
    })

    if (!existingRate) {
      return NextResponse.json(
        { error: 'Manual exchange rate not found' },
        { status: 404 }
      )
    }

    // Eğer bu kuru aktif hale getiriyorsak, aynı para birimindeki diğer aktif kurları devre dışı bırak
    if (validatedData.isActive === true) {
      await prisma.manualExchangeRate.updateMany({
        where: {
          currency: existingRate.currency,
          isActive: true,
          id: { not: params.id }
        },
        data: {
          isActive: false
        }
      })
    }

    // Kuru güncelle
    const updatedRate = await prisma.manualExchangeRate.update({
      where: { id: params.id },
      data: {
        ...validatedData,
        updatedAt: new Date()
      },
      include: {
        creator: {
          select: {
            id: true,
            email: true,
            name: true
          }
        }
      }
    })

    return NextResponse.json({
      success: true,
      message: `${existingRate.currency} kuru başarıyla güncellendi`,
      data: updatedRate
    })

  } catch (error) {
    console.error('Manual Exchange Rate PUT Error:', error)

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
        error: 'Failed to update manual exchange rate',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

// DELETE - Manuel kur sil
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

    // Mevcut kaydı kontrol et
    const existingRate = await prisma.manualExchangeRate.findUnique({
      where: { id: params.id }
    })

    if (!existingRate) {
      return NextResponse.json(
        { error: 'Manual exchange rate not found' },
        { status: 404 }
      )
    }

    // Kuru sil
    await prisma.manualExchangeRate.delete({
      where: { id: params.id }
    })

    return NextResponse.json({
      success: true,
      message: `${existingRate.currency} manuel kuru başarıyla silindi`
    })

  } catch (error) {
    console.error('Manual Exchange Rate DELETE Error:', error)

    return NextResponse.json(
      {
        error: 'Failed to delete manual exchange rate',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}