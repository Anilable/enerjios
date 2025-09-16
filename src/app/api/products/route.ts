import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from '@/lib/server-session'
import { ProductType } from '@prisma/client'

// GET all products
export async function GET(request: NextRequest) {
  try {
    // Authentication disabled for product listing (public access)
    // Products are public information that can be viewed without login

    // Get query params for filtering
    const searchParams = request.nextUrl.searchParams
    const type = searchParams.get('type')
    const search = searchParams.get('search')
    const available = searchParams.get('available')

    // Build where clause
    const where: any = {}
    
    if (type && type !== 'all') {
      where.type = type as ProductType
    }
    
    if (available !== null) {
      where.isAvailable = available === 'true'
    }
    
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { brand: { contains: search, mode: 'insensitive' } },
        { model: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } }
      ]
    }

    const products = await prisma.product.findMany({
      where,
      orderBy: [
        { isAvailable: 'desc' },
        { stock: 'desc' },
        { name: 'asc' }
      ],
      include: {
        company: {
          select: {
            id: true,
            name: true
          }
        }
      }
    })

    // Transform products to match frontend expectations
    const transformedProducts = products.map(product => ({
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
    }))

    return NextResponse.json(transformedProducts)
  } catch (error) {
    console.error('Error fetching products:', error)
    return NextResponse.json(
      { error: 'Failed to fetch products' },
      { status: 500 }
    )
  }
}

// POST - Create new product
export async function POST(request: NextRequest) {
  try {
    // Authentication required for creating products
    const session = await getServerSession()
    console.log('CREATE session:', session ? 'authenticated' : 'unauthenticated')
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    console.log('CREATE body:', body)

    // Validate required fields
    if (!body.name || (!body.type && !body.category) || !body.brand || body.price === undefined) {
      console.log('CREATE validation failed:', {
        hasName: !!body.name,
        hasType: !!body.type,
        hasCategory: !!body.category,
        hasBrand: !!body.brand,
        hasPrice: body.price !== undefined
      })
      return NextResponse.json(
        { error: 'Missing required fields: name, category/type, brand, and price are required' },
        { status: 400 }
      )
    }

    // Convert category to ProductType
    const productType = getTypeFromCategory(body.category || body.type)
    if (!productType) {
      return NextResponse.json(
        { error: 'Invalid product type' },
        { status: 400 }
      )
    }

    // Parse and validate stock
    const stock = parseInt(body.stock?.toString() || '0')

    // Create product
    const product = await prisma.product.create({
      data: {
        name: body.name,
        type: productType,
        brand: body.brand,
        model: body.model || '',
        description: body.description,
        price: parseFloat(body.price.toString()),
        stock: stock,
        power: body.power ? parseFloat(body.power.toString()) : null,
        warranty: body.warranty ? parseInt(body.warranty.toString()) : null,
        isAvailable: stock > 0,
        specifications: body.specifications || {},
        images: body.images || '[]',
        datasheet: body.datasheet,
        unitType: body.unitType || 'adet',
        companyId: body.companyId
      },
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

    return NextResponse.json(transformedProduct, { status: 201 })
  } catch (error) {
    console.error('Error creating product:', error)
    return NextResponse.json(
      { error: 'Failed to create product' },
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