import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { z } from 'zod'

const BulkProductSchema = z.object({
  products: z.array(z.object({
    name: z.string().min(1, 'Ürün adı gerekli'),
    code: z.string().min(1, 'Ürün kodu gerekli'),
    category: z.string().min(1, 'Kategori gerekli'),
    brand: z.string().min(1, 'Marka gerekli'),
    model: z.string().min(1, 'Model gerekli'),
    price: z.number().positive('Fiyat pozitif olmalı'),
    usdPrice: z.number().positive().optional().nullable(),
    stock: z.number().min(0).optional().nullable(),
    power: z.number().positive().optional().nullable(),
    warranty: z.number().min(0).optional().nullable(),
    description: z.string().optional().nullable(),
    categoryId: z.string().optional().nullable()
  }))
})

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { products } = BulkProductSchema.parse(body)

    let successCount = 0
    let failedCount = 0
    const errors: string[] = []

    // Process products in transaction
    await prisma.$transaction(async (tx) => {
      for (const product of products) {
        try {
          // Check if product code already exists
          const existingProduct = await tx.product.findFirst({
            where: { code: product.code }
          })

          if (existingProduct) {
            errors.push(`Ürün kodu "${product.code}" zaten mevcut`)
            failedCount++
            continue
          }

          // Kategori tipini belirle
          const productType = determineProductType(product.category)

          // Create technical specs JSON
          const technicalSpecs = JSON.stringify({
            power: product.power,
            warranty: product.warranty,
            category: product.category,
            usdPrice: product.usdPrice
          })

          await tx.product.create({
            data: {
              name: product.name,
              code: product.code,
              brand: product.brand,
              model: product.model,
              type: productType,
              specifications: JSON.parse(technicalSpecs),
              price: product.price,
              currency: 'TRY',
              unitType: 'PIECE',
              power: product.power,
              warranty: product.warranty ? Math.floor(product.warranty) : null,
              stock: product.stock || 0,
              description: product.description || null,
              images: '[]',
              createdById: session.user.id,
              categoryId: product.categoryId
            }
          })

          successCount++
        } catch (error) {
          console.error('Error creating product:', error)
          errors.push(`${product.name}: ${error instanceof Error ? error.message : 'Bilinmeyen hata'}`)
          failedCount++
        }
      }
    })

    return NextResponse.json({
      success: successCount,
      failed: failedCount,
      errors: errors.slice(0, 10), // Return only first 10 errors
      total: products.length
    })

  } catch (error) {
    console.error('Bulk import error:', error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Geçersiz veri formatı', details: error.issues },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Sunucu hatası' },
      { status: 500 }
    )
  }
}

function determineProductType(category: string): 'SOLAR_PANEL' | 'INVERTER' | 'BATTERY' | 'MOUNTING_SYSTEM' | 'CABLE' | 'MONITORING' | 'ACCESSORY' {
  const categoryUpper = category.toUpperCase()

  if (categoryUpper.includes('PANEL') || categoryUpper.includes('SOLAR')) {
    return 'SOLAR_PANEL'
  }
  if (categoryUpper.includes('İNVERTER') || categoryUpper.includes('INVERTER') || categoryUpper.includes('EVİRİCİ')) {
    return 'INVERTER'
  }
  if (categoryUpper.includes('BATARYA') || categoryUpper.includes('BATTERY') || categoryUpper.includes('AKÜ')) {
    return 'BATTERY'
  }
  if (categoryUpper.includes('MONTAJ') || categoryUpper.includes('MOUNTING')) {
    return 'MOUNTING_SYSTEM'
  }
  if (categoryUpper.includes('KABLO') || categoryUpper.includes('CABLE')) {
    return 'CABLE'
  }
  if (categoryUpper.includes('İZLEME') || categoryUpper.includes('MONITORING')) {
    return 'MONITORING'
  }

  return 'ACCESSORY'
}

