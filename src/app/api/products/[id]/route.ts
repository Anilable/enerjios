import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from '@/lib/server-session'
import { ProductType } from '@prisma/client'

// GET single product
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    
    const session = await getServerSession()
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        company: {
          select: {
            id: true,
            name: true
          }
        }
      }
    })

    if (!product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      )
    }

    // Transform response
    const transformedProduct = {
      id: product.id,
      name: product.name,
      category: getCategoryFromType(product.type),
      type: product.type,
      brand: product.brand,
      model: product.model,
      power: product.power ? `${product.power}W` : '-',
      price: product.price,
      stock: product.stock,
      status: getStockStatus(product.stock),
      warranty: product.warranty ? `${product.warranty} yıl` : '-',
      description: product.description,
      specifications: product.specifications,
      images: product.images,
      datasheet: product.datasheet,
      isAvailable: product.isAvailable,
      companyId: product.companyId,
      companyName: product.company?.name,
      createdAt: product.createdAt,
      updatedAt: product.updatedAt
    }

    return NextResponse.json(transformedProduct)
  } catch (error) {
    console.error('Error fetching product:', error)
    return NextResponse.json(
      { error: 'Failed to fetch product' },
      { status: 500 }
    )
  }
}

// PUT - Update product
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    
    const session = await getServerSession()
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()

    // Build update data
    const updateData: any = {}
    
    if (body.name !== undefined) updateData.name = body.name
    if (body.brand !== undefined) updateData.brand = body.brand
    if (body.model !== undefined) updateData.model = body.model
    if (body.description !== undefined) updateData.description = body.description
    if (body.price !== undefined) updateData.price = parseFloat(body.price.toString())
    if (body.stock !== undefined) {
      updateData.stock = parseInt(body.stock.toString())
      updateData.isAvailable = updateData.stock > 0
    }
    
    // Handle category/type conversion
    if (body.category || body.type) {
      const productType = getTypeFromCategory(body.category || body.type)
      if (productType) {
        updateData.type = productType
      }
    }
    
    // Handle power - extract numeric value if string like "540W"
    if (body.power !== undefined) {
      const powerStr = body.power.toString()
      const powerNum = parseFloat(powerStr.replace(/[^0-9.]/g, ''))
      updateData.power = isNaN(powerNum) ? null : powerNum
    }
    
    // Handle warranty - extract numeric value if string like "25 yıl"
    if (body.warranty !== undefined) {
      const warrantyStr = body.warranty.toString()
      const warrantyNum = parseInt(warrantyStr.replace(/[^0-9]/g, ''))
      updateData.warranty = isNaN(warrantyNum) ? null : warrantyNum
    }
    
    if (body.specifications !== undefined) updateData.specifications = body.specifications
    if (body.images !== undefined) updateData.images = body.images
    if (body.datasheet !== undefined) updateData.datasheet = body.datasheet
    if (body.unitType !== undefined) updateData.unitType = body.unitType
    if (body.companyId !== undefined) updateData.companyId = body.companyId

    // Update product
    const product = await prisma.product.update({
      where: { id },
      data: updateData,
      include: {
        company: {
          select: {
            id: true,
            name: true
          }
        }
      }
    })

    // Transform response
    const transformedProduct = {
      id: product.id,
      name: product.name,
      category: getCategoryFromType(product.type),
      type: product.type,
      brand: product.brand,
      model: product.model,
      power: product.power ? `${product.power}W` : '-',
      price: product.price,
      stock: product.stock,
      status: getStockStatus(product.stock),
      warranty: product.warranty ? `${product.warranty} yıl` : '-',
      description: product.description,
      specifications: product.specifications,
      images: product.images,
      datasheet: product.datasheet,
      isAvailable: product.isAvailable,
      companyId: product.companyId,
      companyName: product.company?.name,
      createdAt: product.createdAt,
      updatedAt: product.updatedAt
    }

    return NextResponse.json(transformedProduct)
  } catch (error) {
    console.error('Error updating product:', error)
    return NextResponse.json(
      { error: 'Failed to update product' },
      { status: 500 }
    )
  }
}

// DELETE product
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  let id: string | undefined
  try {
    const resolvedParams = await params
    id = resolvedParams.id
    console.log('DELETE product ID:', id)

    const session = await getServerSession()
    console.log('DELETE session:', session ? 'authenticated' : 'unauthenticated')
    if (!session?.user?.id) {
      console.log('DELETE unauthorized')
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Check if product exists
    const existing = await prisma.product.findUnique({
      where: { id }
    })
    console.log('DELETE existing product:', existing ? 'found' : 'not found')

    if (!existing) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      )
    }

    // Check for foreign key constraints before deletion
    console.log('DELETE checking constraints for product:', id)

    // Check QuoteItem references
    const quoteItemsCount = await prisma.quoteItem.count({
      where: { productId: id }
    })
    console.log('DELETE QuoteItems using this product:', quoteItemsCount)

    // Check PanelPlacement references
    const panelPlacementsCount = await prisma.panelPlacement.count({
      where: { panelId: id }
    })
    console.log('DELETE PanelPlacements using this product:', panelPlacementsCount)

    if (quoteItemsCount > 0 || panelPlacementsCount > 0) {
      console.log('DELETE blocked by foreign key constraints')
      return NextResponse.json(
        {
          error: 'Cannot delete product',
          details: `Product is used in ${quoteItemsCount} quote(s) and ${panelPlacementsCount} panel placement(s). Please remove these references first.`
        },
        { status: 400 }
      )
    }

    // Delete product if no constraints
    console.log('DELETE proceeding with deletion, no constraints found')
    await prisma.product.delete({
      where: { id }
    })
    console.log('DELETE successfully deleted product:', id)

    return NextResponse.json({ message: 'Product deleted successfully' })
  } catch (error) {
    console.error('Error deleting product:', error)
    console.error('Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : 'No stack trace',
      productId: id || 'undefined'
    })

    // Handle specific database errors
    if (error instanceof Error) {
      if (error.message.includes('Foreign key constraint')) {
        return NextResponse.json(
          {
            error: 'Cannot delete product',
            details: 'Product is referenced by other records. Please remove those references first.'
          },
          { status: 400 }
        )
      }
    }

    return NextResponse.json(
      {
        error: 'Failed to delete product',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

// Helper functions
function getCategoryFromType(type: ProductType): string {
  const categoryMap: Record<ProductType, string> = {
    SOLAR_PANEL: 'Solar Paneller',
    INVERTER: 'İnverterler',
    BATTERY: 'Bataryalar',
    MOUNTING_SYSTEM: 'Montaj Malzemeleri',
    CABLE: 'Kablolar',
    MONITORING: 'İzleme Sistemleri',
    ACCESSORY: 'Aksesuarlar'
  }
  return categoryMap[type] || 'Diğer'
}

function getTypeFromCategory(category: string): ProductType | null {
  const typeMap: Record<string, ProductType> = {
    'Solar Paneller': ProductType.SOLAR_PANEL,
    'İnverterler': ProductType.INVERTER,
    'Bataryalar': ProductType.BATTERY,
    'Montaj Malzemeleri': ProductType.MOUNTING_SYSTEM,
    'Kablolar': ProductType.CABLE,
    'İzleme Sistemleri': ProductType.MONITORING,
    'Aksesuarlar': ProductType.ACCESSORY,
    // Also handle enum values directly
    'SOLAR_PANEL': ProductType.SOLAR_PANEL,
    'INVERTER': ProductType.INVERTER,
    'BATTERY': ProductType.BATTERY,
    'MOUNTING_SYSTEM': ProductType.MOUNTING_SYSTEM,
    'CABLE': ProductType.CABLE,
    'MONITORING': ProductType.MONITORING,
    'ACCESSORY': ProductType.ACCESSORY
  }
  return typeMap[category] || null
}

function getStockStatus(stock: number): string {
  if (stock === 0) return 'Tükendi'
  if (stock < 20) return 'Azalıyor'
  return 'Stokta'
}