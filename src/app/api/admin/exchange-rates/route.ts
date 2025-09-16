import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

// Manuel kur girişi için validation schema
const exchangeRateSchema = z.object({
  currency: z.string().min(3).max(3).toUpperCase(), // USD, EUR, CNY
  rate: z.number().positive().min(0.01).max(1000),
  description: z.string().optional()
})

const updateRateSchema = z.object({
  rate: z.number().positive().min(0.01).max(1000),
  description: z.string().optional()
})

// GET - Manuel kurları listele
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
    const currency = searchParams.get('currency')
    const activeOnly = searchParams.get('active') === 'true'

    const whereClause: any = {}

    if (currency) {
      whereClause.currency = currency.toUpperCase()
    }

    if (activeOnly) {
      whereClause.isActive = true
    }

    const manualRates = await prisma.manualExchangeRate.findMany({
      where: whereClause,
      include: {
        creator: {
          select: {
            id: true,
            email: true,
            name: true
          }
        }
      },
      orderBy: [
        { isActive: 'desc' },
        { currency: 'asc' },
        { updatedAt: 'desc' }
      ]
    })

    return NextResponse.json({
      success: true,
      data: manualRates,
      count: manualRates.length
    })

  } catch (error) {
    console.error('Manual Exchange Rates GET Error:', error)

    return NextResponse.json(
      {
        error: 'Failed to fetch manual exchange rates',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

// POST - Yeni manuel kur ekle
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
    const validatedData = exchangeRateSchema.parse(body)

    // Aynı para birimi için aktif kur var mı kontrol et
    const existingRate = await prisma.manualExchangeRate.findFirst({
      where: {
        currency: validatedData.currency,
        isActive: true
      }
    })

    if (existingRate) {
      return NextResponse.json(
        {
          error: `${validatedData.currency} için zaten aktif bir manuel kur bulunuyor`,
          details: `Mevcut kur: ${existingRate.rate}. Önce mevcut kuru devre dışı bırakın veya güncelleyin.`
        },
        { status: 409 }
      )
    }

    // Yeni manuel kur oluştur
    const newRate = await prisma.manualExchangeRate.create({
      data: {
        currency: validatedData.currency,
        rate: validatedData.rate,
        description: validatedData.description || `${validatedData.currency} manuel kuru`,
        isActive: true,
        createdBy: session.user.id
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
      message: `${validatedData.currency} manuel kuru başarıyla eklendi`,
      data: newRate
    }, { status: 201 })

  } catch (error) {
    console.error('Manual Exchange Rate POST Error:', error)

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
        error: 'Failed to create manual exchange rate',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

// PUT - Toplu aktif kur güncelleme (USD, EUR, CNY hepsini birden)
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 401 }
      )
    }

    const body = await request.json()

    // Toplu güncelleme schema
    const bulkUpdateSchema = z.object({
      rates: z.array(z.object({
        currency: z.string().min(3).max(3),
        rate: z.number().positive().min(0.01).max(1000),
        description: z.string().optional()
      })).min(1).max(10)
    })

    const validatedData = bulkUpdateSchema.parse(body)
    const results: any[] = []

    // Transaction ile toplu güncelleme
    await prisma.$transaction(async (tx) => {
      for (const rateData of validatedData.rates) {
        // Mevcut aktif kuru bul
        const existingRate = await tx.manualExchangeRate.findFirst({
          where: {
            currency: rateData.currency.toUpperCase(),
            isActive: true
          }
        })

        if (existingRate) {
          // Güncelle
          const updated = await tx.manualExchangeRate.update({
            where: { id: existingRate.id },
            data: {
              rate: rateData.rate,
              description: rateData.description || existingRate.description,
              updatedAt: new Date()
            }
          })
          results.push({ action: 'updated', currency: rateData.currency, rate: rateData.rate })
        } else {
          // Yeni oluştur
          const created = await tx.manualExchangeRate.create({
            data: {
              currency: rateData.currency.toUpperCase(),
              rate: rateData.rate,
              description: rateData.description || `${rateData.currency} manuel kuru`,
              isActive: true,
              createdBy: session.user.id
            }
          })
          results.push({ action: 'created', currency: rateData.currency, rate: rateData.rate })
        }
      }
    })

    return NextResponse.json({
      success: true,
      message: `${results.length} döviz kuru başarıyla güncellendi`,
      data: results
    })

  } catch (error) {
    console.error('Bulk Exchange Rate Update Error:', error)

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
        error: 'Failed to update exchange rates',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}