import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from '@/lib/server-session'
import { prisma } from '@/lib/prisma'
import { ProductType } from '@prisma/client'

// PUT - Update product
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: productId } = await params

  try {
    // Authentication required for updating products
    const session = await getServerSession()
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const trimmedCode = body.code?.trim()
    console.log('UPDATE body:', body)

    // Check if this is a file deletion request (only has file fields)
    const isFileOperation = Object.keys(body).every(key =>
      ['images', 'datasheet', 'manual'].includes(key)
    )

    // Validate required fields only for full product updates (not file operations)
    if (!isFileOperation && (!body.name || (!body.type && !body.category && !body.categoryId) || !body.brand || body.price === undefined)) {
      return NextResponse.json(
        { error: 'Missing required fields: name, categoryId/category/type, brand, and price are required' },
        { status: 400 }
      )
    }

    // Find existing product
    const existingProduct = await prisma.product.findUnique({
      where: { id: productId }
    })

    if (!existingProduct) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      )
    }

    let updateData: any = {
      updatedById: session.user.id
    }

    if (isFileOperation) {
      // Handle file operations only
      if (body.hasOwnProperty('images')) {
        updateData.images = body.images
      }
      if (body.hasOwnProperty('datasheet')) {
        updateData.datasheet = body.datasheet
      }
      if (body.hasOwnProperty('manual')) {
        updateData.manual = body.manual
      }
    } else {
      // Handle full product update
      // Handle both new categoryId system and legacy category name system
      let productType: ProductType
      let categoryId = null

      if (body.categoryId) {
        // New system: use categoryId directly
        categoryId = body.categoryId
        console.log('UPDATE: Using new category system with ID:', categoryId)

        // Still need to set ProductType for enum field
        const category = await prisma.category.findUnique({
          where: { id: categoryId }
        })

        if (!category) {
          return NextResponse.json(
            { error: 'Category not found' },
            { status: 400 }
          )
        }

        // Import getTypeFromCategory function or define mapping locally
        const getTypeFromCategoryLocal = (categoryName: string): ProductType => {
          const typeMap: Record<string, ProductType> = {
            'Panel': ProductType.SOLAR_PANEL,
            'İnverter': ProductType.INVERTER,
            'Batarya': ProductType.BATTERY,
            'Konstrüksiyon': ProductType.MOUNTING_SYSTEM,
            'Kablolar': ProductType.CABLE,
            'İzleme Sistemleri': ProductType.MONITORING,
            'Aksesuarlar': ProductType.ACCESSORY,
            'Solar Paneller': ProductType.SOLAR_PANEL,
            'İnverterler': ProductType.INVERTER,
            'Bataryalar': ProductType.BATTERY,
            'Montaj Malzemeleri': ProductType.MOUNTING_SYSTEM
          }
          return typeMap[categoryName] || ProductType.ACCESSORY
        }

        productType = getTypeFromCategoryLocal(category.name)
        console.log('UPDATE: Mapped category to ProductType:', category.name, '->', productType)
      } else if (body.category) {
        // Legacy system: convert category name to ProductType
        const categoryTypeMap: Record<string, ProductType> = {
          'Solar Paneller': ProductType.SOLAR_PANEL,
          'İnverterler': ProductType.INVERTER,
          'Bataryalar': ProductType.BATTERY,
          'Montaj Malzemeleri': ProductType.MOUNTING_SYSTEM,
          'Kablolar': ProductType.CABLE,
          'İzleme Sistemleri': ProductType.MONITORING,
          'Aksesuarlar': ProductType.ACCESSORY
        }
        productType = categoryTypeMap[body.category] || ProductType.ACCESSORY
        console.log('UPDATE: Using legacy category system:', body.category, '->', productType)

        // Try to find category by name
        const category = await prisma.category.findFirst({
          where: { name: body.category }
        })
        categoryId = category?.id || null
      } else {
        productType = body.type || existingProduct.type
        categoryId = existingProduct.categoryId // Keep existing categoryId
      }

      // Parse and validate stock
      const stock = parseInt(body.stock?.toString() || '0')

      updateData = {
        ...updateData,
        name: body.name,
        code: trimmedCode ?? existingProduct.code,
        type: productType,
        categoryId: categoryId,
        brand: body.brand,
        model: body.model || '',
        description: body.description,
        price: parseFloat(body.price.toString()),
        purchasePrice: body.purchasePrice !== undefined && body.purchasePrice !== null
          ? parseFloat(body.purchasePrice.toString())
          : null,
        purchasePriceUsd: body.purchasePriceUsd !== undefined && body.purchasePriceUsd !== null
          ? parseFloat(body.purchasePriceUsd.toString())
          : null,
        purchaseDate: body.purchaseDate ? new Date(body.purchaseDate) : null,
        editDate: body.editDate ? new Date(body.editDate) : new Date(),
        stock: stock,
        power: body.power ? parseFloat(body.power.toString()) : null,
        warranty: body.warranty ? parseInt(body.warranty.toString()) : null,
        isAvailable: stock > 0,
        specifications: body.specifications || {},
        images: body.images || '[]',
        datasheet: body.datasheet,
        manual: body.manual,
        unitType: body.unitType || 'adet'
      }
    }

    // Update product
    const product = await prisma.product.update({
      where: { id: productId },
      data: updateData,
      include: {
        company: {
          select: {
            id: true,
            name: true
          }
        },
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        updatedBy: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    })

    console.log('✅ Product updated successfully:', product.id)

    return NextResponse.json({
      message: 'Product updated successfully',
      product: product
    })
  } catch (error) {
    console.error('❌ Error updating product:', error)
    return NextResponse.json(
      {
        error: 'Failed to update product',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

// DELETE - Delete product
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: productId } = await params

  try {
    // Authentication required for deleting products
    const session = await getServerSession()
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Find existing product
    const existingProduct = await prisma.product.findUnique({
      where: { id: productId }
    })

    if (!existingProduct) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      )
    }

    // Delete product
    await prisma.product.delete({
      where: { id: productId }
    })

    console.log('✅ Product deleted successfully:', productId)

    return NextResponse.json({
      message: 'Product deleted successfully'
    })
  } catch (error) {
    console.error('❌ Error deleting product:', error)
    return NextResponse.json(
      {
        error: 'Failed to delete product',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
