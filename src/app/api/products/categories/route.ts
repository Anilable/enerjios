import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from '@/lib/server-session'
import { ProductType } from '@prisma/client'

// GET all categories with product counts
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession()
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // First, ensure default categories exist
    await ensureDefaultCategories()

    // Get all categories from database
    const categories = await prisma.category.findMany({
      where: { isActive: true },
      include: {
        _count: {
          select: { products: true }
        }
      },
      orderBy: [
        { order: 'asc' },
        { name: 'asc' }
      ]
    })

    // Transform categories for frontend
    const transformedCategories = categories.map(cat => ({
      id: cat.id,
      name: cat.name,
      slug: cat.slug,
      count: cat._count.products,
      icon: cat.icon,
      color: cat.color,
      order: cat.order
    }))

    return NextResponse.json(transformedCategories)
  } catch (error) {
    console.error('❌ Error fetching categories:', error)
    return NextResponse.json(
      {
        error: 'Failed to fetch categories',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

// POST - Add new category
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession()
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    console.log('📦 Category POST request body:', body)

    // Check if this is a new category creation request
    if (body.name && !body.oldCategory) {
      // This is a new category creation request
      const { name, icon = 'Package', color = 'blue' } = body

      // Generate slug from name
      const slug = name
        .toLowerCase()
        .replace(/ğ/g, 'g')
        .replace(/ü/g, 'u')
        .replace(/ş/g, 's')
        .replace(/ı/g, 'i')
        .replace(/ö/g, 'o')
        .replace(/ç/g, 'c')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '')

      // Check if category with same name or slug exists
      const existing = await prisma.category.findFirst({
        where: {
          OR: [
            { name },
            { slug }
          ]
        }
      })

      if (existing) {
        return NextResponse.json(
          { error: 'Bu isimde bir kategori zaten mevcut' },
          { status: 400 }
        )
      }

      // Get the highest order value
      const maxOrder = await prisma.category.aggregate({
        _max: {
          order: true
        }
      })

      // Create new category
      const newCategory = await prisma.category.create({
        data: {
          name,
          slug,
          icon,
          color,
          order: (maxOrder._max.order || 0) + 1
        }
      })

      console.log('✅ New category created:', newCategory)

      return NextResponse.json({
        message: `"${name}" kategorisi başarıyla eklendi`,
        category: newCategory
      })
    }

    // Otherwise, handle bulk update
    const { oldCategory, newCategory } = body

    if (!oldCategory || !newCategory) {
      return NextResponse.json(
        { error: 'Both oldCategory and newCategory are required for bulk update' },
        { status: 400 }
      )
    }

    // Find the new category
    const targetCategory = await prisma.category.findFirst({
      where: { name: newCategory }
    })

    if (!targetCategory) {
      return NextResponse.json(
        { error: 'Target category not found' },
        { status: 404 }
      )
    }

    // Find the old category
    const sourceCategory = await prisma.category.findFirst({
      where: { name: oldCategory }
    })

    if (!sourceCategory) {
      // If old category doesn't exist, try to update by ProductType enum
      const oldType = getTypeFromCategory(oldCategory)
      if (oldType) {
        // Update all products with the old type to new category
        const result = await prisma.product.updateMany({
          where: {
            type: oldType
          },
          data: {
            categoryId: targetCategory.id
          }
        })

        return NextResponse.json({
          message: 'Products updated successfully',
          count: result.count
        })
      }

      return NextResponse.json(
        { error: 'Source category not found' },
        { status: 404 }
      )
    }

    // Update all products with the old category
    const result = await prisma.product.updateMany({
      where: {
        categoryId: sourceCategory.id
      },
      data: {
        categoryId: targetCategory.id
      }
    })

    return NextResponse.json({
      message: 'Products updated successfully',
      count: result.count
    })
  } catch (error) {
    console.error('❌ Error in categories POST:', error)
    return NextResponse.json(
      {
        error: 'Failed to create category',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

// Helper function to ensure default categories exist
async function ensureDefaultCategories() {
  const defaultCategories = [
    { name: 'Solar Paneller', slug: 'solar-paneller', icon: 'Sun', color: 'yellow', order: 1, type: ProductType.SOLAR_PANEL },
    { name: 'İnverterler', slug: 'inverterler', icon: 'Zap', color: 'blue', order: 2, type: ProductType.INVERTER },
    { name: 'Bataryalar', slug: 'bataryalar', icon: 'Battery', color: 'green', order: 3, type: ProductType.BATTERY },
    { name: 'Montaj Malzemeleri', slug: 'montaj-malzemeleri', icon: 'Settings', color: 'gray', order: 4, type: ProductType.MOUNTING_SYSTEM },
    { name: 'Kablolar', slug: 'kablolar', icon: 'Cable', color: 'orange', order: 5, type: ProductType.CABLE },
    { name: 'İzleme Sistemleri', slug: 'izleme-sistemleri', icon: 'Monitor', color: 'purple', order: 6, type: ProductType.MONITORING },
    { name: 'Aksesuarlar', slug: 'aksesuarlar', icon: 'Package', color: 'pink', order: 7, type: ProductType.ACCESSORY }
  ]

  for (const cat of defaultCategories) {
    const existing = await prisma.category.findUnique({
      where: { slug: cat.slug }
    })

    if (!existing) {
      const created = await prisma.category.create({
        data: {
          name: cat.name,
          slug: cat.slug,
          icon: cat.icon,
          color: cat.color,
          order: cat.order
        }
      })

      // Update existing products with this type to use the new category
      await prisma.product.updateMany({
        where: {
          type: cat.type,
          categoryId: null
        },
        data: {
          categoryId: created.id
        }
      })

      console.log(`✅ Created default category: ${cat.name}`)
    }
  }
}

// Helper function
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

// DELETE - Delete a category
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession()
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const categoryId = searchParams.get('id')
    const forceDelete = searchParams.get('force') === 'true'

    if (!categoryId) {
      return NextResponse.json(
        { error: 'Category ID is required' },
        { status: 400 }
      )
    }

    // Get user info with role
    const user = await prisma.user.findUnique({
      where: { id: session.user.id }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Check if category has products
    const productCount = await prisma.product.count({
      where: { categoryId }
    })

    // Admin users can delete any category, even with products
    const isAdmin = user.role === 'ADMIN'

    if (productCount > 0 && !isAdmin && !forceDelete) {
      return NextResponse.json(
        { error: `Bu kategoride ${productCount} ürün bulunmaktadır. Önce ürünleri başka kategoriye taşıyın.` },
        { status: 400 }
      )
    }

    // If admin is deleting a category with products, move products to default category
    if (productCount > 0 && isAdmin) {
      console.log(`🔧 Admin deleting category with ${productCount} products. Moving products to default category...`)

      // Get or create a default "Diğer" category
      let defaultCategory = await prisma.category.findFirst({
        where: { slug: 'diger' }
      })

      if (!defaultCategory) {
        defaultCategory = await prisma.category.create({
          data: {
            name: 'Diğer',
            slug: 'diger',
            icon: 'Package',
            color: 'gray',
            order: 999
          }
        })
        console.log('📦 Created default "Diğer" category for orphaned products')
      }

      // Move all products to the default category
      const moveResult = await prisma.product.updateMany({
        where: { categoryId },
        data: { categoryId: defaultCategory.id }
      })

      console.log(`📦 Moved ${moveResult.count} products to "Diğer" category`)
    }

    // Delete category
    await prisma.category.delete({
      where: { id: categoryId }
    })

    const message = productCount > 0 && isAdmin
      ? `Kategori silindi ve ${productCount} ürün "Diğer" kategorisine taşındı.`
      : 'Kategori başarıyla silindi'

    return NextResponse.json({
      message,
      movedProducts: productCount > 0 && isAdmin ? productCount : 0
    })
  } catch (error) {
    console.error('Error deleting category:', error)
    return NextResponse.json(
      { error: 'Failed to delete category' },
      { status: 500 }
    )
  }
}