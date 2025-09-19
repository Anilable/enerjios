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
    console.log('UPDATE body:', body)

    // Validate required fields
    if (!body.name || (!body.type && !body.category) || !body.brand || body.price === undefined) {
      return NextResponse.json(
        { error: 'Missing required fields: name, category/type, brand, and price are required' },
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

    // Convert category to ProductType if needed
    let productType: ProductType
    if (body.category) {
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
    } else {
      productType = body.type
    }

    // Find category if available
    let categoryId = null
    if (body.category) {
      const category = await prisma.category.findFirst({
        where: { name: body.category }
      })
      categoryId = category?.id || null
    }

    // Parse and validate stock
    const stock = parseInt(body.stock?.toString() || '0')

    // Update product
    const product = await prisma.product.update({
      where: { id: productId },
      data: {
        name: body.name,
        type: productType,
        categoryId: categoryId,
        brand: body.brand,
        model: body.model || '',
        description: body.description,
        price: parseFloat(body.price.toString()),
        purchasePrice: body.purchasePrice ? parseFloat(body.purchasePrice.toString()) : null,
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
        unitType: body.unitType || 'adet',
        updatedById: session.user.id
      },
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
