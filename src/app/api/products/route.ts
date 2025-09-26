import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from '@/lib/server-session'
import { ProductType } from '@prisma/client'

// GET all products
export async function GET(request: NextRequest) {
  try {
    // Get session to check user role
    const session = await getServerSession()

    // Get query params for filtering
    const searchParams = request.nextUrl.searchParams
    const type = searchParams.get('type')
    const search = searchParams.get('search')
    const available = searchParams.get('available')

    // Build where clause with company filtering
    const where: any = {}

    // Role-based product filtering
    if (session?.user?.role === 'COMPANY') {
      // Company users only see their own company's products
      const userCompany = await prisma.user.findUnique({
        where: { id: session.user.id },
        include: { company: true }
      })

      if (userCompany?.company?.id) {
        where.companyId = userCompany.company.id
      } else {
        // If company user has no company, return empty array
        return NextResponse.json([])
      }
    } else if (session?.user?.role === 'ADMIN' || session?.user?.role === 'GENERAL_MANAGER' || session?.user?.role === 'INSTALLATION_TEAM') {
      // Admin, General Manager and Installation Team users only see admin products (companyId is null)
      where.companyId = null
    } else {
      // Other roles (CUSTOMER, etc.) should not see any products
      return NextResponse.json([])
    }
    
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

    // Transform products to match frontend expectations
    const transformedProducts = products.map(product => ({
      id: product.id,
      name: product.name,
      code: product.code,
      category: getCategoryFromType(product.type),
      type: product.type,
      brand: product.brand,
      model: product.model,
      power: product.power ? `${product.power}W` : '-',
      price: product.price,
      purchasePrice: product.purchasePrice,
      purchasePriceUsd: product.purchasePriceUsd,
      purchaseDate: product.purchaseDate,
      stock: product.stock,
      status: getStockStatus(product.stock),
      warranty: product.warranty ? `${product.warranty} yıl` : '-',
      description: product.description,
      specifications: product.specifications,
      images: product.images,
      datasheet: product.datasheet,
      manual: product.manual,
      isAvailable: product.isAvailable,
      companyId: product.companyId,
      companyName: product.company?.name,
      createdBy: product.createdBy,
      updatedBy: product.updatedBy,
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
    const trimmedCode = body.code?.trim()
    console.log('CREATE body:', body)

    // Validate required fields - now supporting both old and new category systems
    if (!body.name || (!body.type && !body.category && !body.categoryId) || !body.brand || body.price === undefined) {
      console.log('CREATE validation failed:', {
        hasName: !!body.name,
        hasType: !!body.type,
        hasCategory: !!body.category,
        hasCategoryId: !!body.categoryId,
        hasBrand: !!body.brand,
        hasPrice: body.price !== undefined,
        hasCode: !!trimmedCode
      })
      return NextResponse.json(
        { error: 'Missing required fields: name, categoryId/category/type, brand, and price are required' },
        { status: 400 }
      )
    }

    // Handle both new categoryId system and legacy category name system
    let productType = null
    let categoryId = null

    if (body.categoryId) {
      // New system: use categoryId directly
      categoryId = body.categoryId
      console.log('Using new category system with ID:', categoryId)

      // We still need to set a ProductType for the enum field
      // For now, let's use a default or try to map from category name if available
      const category = await prisma.category.findUnique({
        where: { id: categoryId }
      })

      if (!category) {
        return NextResponse.json(
          { error: 'Category not found' },
          { status: 400 }
        )
      }

      // Try to map category name to ProductType, fallback to ACCESSORY
      productType = getTypeFromCategory(category.name) || ProductType.ACCESSORY
      console.log('Mapped category to ProductType:', category.name, '->', productType)
    } else {
      // Legacy system: convert category name to ProductType
      productType = getTypeFromCategory(body.category || body.type)
      if (!productType) {
        return NextResponse.json(
          { error: 'Invalid product type' },
          { status: 400 }
        )
      }
      console.log('Using legacy category system:', body.category, '->', productType)
    }

    // Parse and validate stock
    const stock = parseInt(body.stock?.toString() || '0')

    // Create product
    const product = await prisma.product.create({
      data: {
        name: body.name,
        code: trimmedCode ?? null,
        type: productType,
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
        stock: stock,
        power: body.power ? parseFloat(body.power.toString()) : null,
        warranty: body.warranty ? parseInt(body.warranty.toString()) : null,
        isAvailable: stock > 0,
        specifications: body.specifications || {},
        images: body.images || '[]',
        datasheet: body.datasheet,
        manual: body.manual,
        unitType: body.unitType || 'adet',
        companyId: session.user.role === 'COMPANY' ? await getUserCompanyId(session.user.id) : body.companyId,
        categoryId: categoryId, // Set the categoryId if using new system
        createdById: session.user.id,
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

    // Transform response
    const transformedProduct = {
      id: product.id,
      name: product.name,
      code: product.code,
      category: getCategoryFromType(product.type),
      type: product.type,
      brand: product.brand,
      model: product.model,
      power: product.power ? `${product.power}W` : '-',
      price: product.price,
      purchasePrice: product.purchasePrice,
      purchasePriceUsd: product.purchasePriceUsd,
      purchaseDate: product.purchaseDate,
      stock: product.stock,
      status: getStockStatus(product.stock),
      warranty: product.warranty ? `${product.warranty} yıl` : '-',
      description: product.description,
      specifications: product.specifications,
      images: product.images,
      datasheet: product.datasheet,
      manual: product.manual,
      isAvailable: product.isAvailable,
      companyId: product.companyId,
      companyName: product.company?.name,
      createdBy: product.createdBy,
      updatedBy: product.updatedBy,
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
    SOLAR_PANEL: 'Panel',              // ✅ Match QUOTE_CATEGORIES.PANEL
    INVERTER: 'İnverter',             // ✅ Match QUOTE_CATEGORIES.INVERTER
    BATTERY: 'Batarya',               // ✅ Match QUOTE_CATEGORIES.BATTERY
    MOUNTING_SYSTEM: 'Konstrüksiyon', // ✅ Match QUOTE_CATEGORIES.MOUNTING
    CABLE: 'Kablolar',
    MONITORING: 'İzleme Sistemleri',
    ACCESSORY: 'Aksesuarlar'
  }
  return categoryMap[type] || 'Diğer'
}

function getTypeFromCategory(category: string): ProductType | null {
  const typeMap: Record<string, ProductType> = {
    // Updated to match new category names
    'Panel': ProductType.SOLAR_PANEL,              // ✅ Match QUOTE_CATEGORIES.PANEL
    'İnverter': ProductType.INVERTER,             // ✅ Match QUOTE_CATEGORIES.INVERTER
    'Batarya': ProductType.BATTERY,               // ✅ Match QUOTE_CATEGORIES.BATTERY
    'Konstrüksiyon': ProductType.MOUNTING_SYSTEM, // ✅ Match QUOTE_CATEGORIES.MOUNTING
    'Kablolar': ProductType.CABLE,
    'İzleme Sistemleri': ProductType.MONITORING,
    'Aksesuarlar': ProductType.ACCESSORY,
    // Keep old category names for backward compatibility
    'Solar Paneller': ProductType.SOLAR_PANEL,
    'İnverterler': ProductType.INVERTER,
    'Bataryalar': ProductType.BATTERY,
    'Montaj Malzemeleri': ProductType.MOUNTING_SYSTEM,
    // Excel'deki kategori isimleri için eşleştirme
    'AKÜ': ProductType.BATTERY,
    'Şarj Kontrol': ProductType.ACCESSORY,
    'DC Pompa': ProductType.ACCESSORY,
    // Alternatif isimler
    'Aksesuar': ProductType.ACCESSORY,
    'Kablo': ProductType.CABLE,
    'Monitoring': ProductType.MONITORING,
    'Montaj': ProductType.MOUNTING_SYSTEM,
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

// Helper function to get user's company ID
async function getUserCompanyId(userId: string): Promise<string | null> {
  const userWithCompany = await prisma.user.findUnique({
    where: { id: userId },
    include: { company: true }
  })
  return userWithCompany?.company?.id || null
}
