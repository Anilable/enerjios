import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from '@/lib/server-session'
import { ProductType } from '@prisma/client'
import { 
  Sun,
  Zap,
  Battery,
  Settings,
  Cable,
  Monitor,
  Package
} from 'lucide-react'

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

    // Get product counts by type
    const productCounts = await prisma.product.groupBy({
      by: ['type'],
      _count: {
        _all: true
      }
    })

    // Create count map
    const countMap: Record<string, number> = {}
    productCounts.forEach(item => {
      countMap[item.type] = item._count._all
    })

    // Define categories with icons
    const categories = [
      {
        id: ProductType.SOLAR_PANEL,
        name: 'Solar Paneller',
        type: ProductType.SOLAR_PANEL,
        count: countMap[ProductType.SOLAR_PANEL] || 0,
        icon: 'Sun',
        color: 'yellow'
      },
      {
        id: ProductType.INVERTER,
        name: 'İnverterler',
        type: ProductType.INVERTER,
        count: countMap[ProductType.INVERTER] || 0,
        icon: 'Zap',
        color: 'blue'
      },
      {
        id: ProductType.BATTERY,
        name: 'Bataryalar',
        type: ProductType.BATTERY,
        count: countMap[ProductType.BATTERY] || 0,
        icon: 'Battery',
        color: 'green'
      },
      {
        id: ProductType.MOUNTING_SYSTEM,
        name: 'Montaj Malzemeleri',
        type: ProductType.MOUNTING_SYSTEM,
        count: countMap[ProductType.MOUNTING_SYSTEM] || 0,
        icon: 'Settings',
        color: 'gray'
      },
      {
        id: ProductType.CABLE,
        name: 'Kablolar',
        type: ProductType.CABLE,
        count: countMap[ProductType.CABLE] || 0,
        icon: 'Cable',
        color: 'orange'
      },
      {
        id: ProductType.MONITORING,
        name: 'İzleme Sistemleri',
        type: ProductType.MONITORING,
        count: countMap[ProductType.MONITORING] || 0,
        icon: 'Monitor',
        color: 'purple'
      },
      {
        id: ProductType.ACCESSORY,
        name: 'Aksesuarlar',
        type: ProductType.ACCESSORY,
        count: countMap[ProductType.ACCESSORY] || 0,
        icon: 'Package',
        color: 'pink'
      }
    ]

    return NextResponse.json(categories)
  } catch (error) {
    console.error('Error fetching categories:', error)
    return NextResponse.json(
      { error: 'Failed to fetch categories' },
      { status: 500 }
    )
  }
}

// POST - Bulk update products category (for migration)
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
    const { oldCategory, newCategory } = body

    if (!oldCategory || !newCategory) {
      return NextResponse.json(
        { error: 'Both oldCategory and newCategory are required' },
        { status: 400 }
      )
    }

    // Get ProductType enum from category name
    const newType = getTypeFromCategory(newCategory)
    if (!newType) {
      return NextResponse.json(
        { error: 'Invalid category' },
        { status: 400 }
      )
    }

    // Update all products with the old category
    const result = await prisma.product.updateMany({
      where: {
        type: getTypeFromCategory(oldCategory) || ProductType.ACCESSORY
      },
      data: {
        type: newType
      }
    })

    return NextResponse.json({
      message: 'Products updated successfully',
      count: result.count
    })
  } catch (error) {
    console.error('Error updating product categories:', error)
    return NextResponse.json(
      { error: 'Failed to update categories' },
      { status: 500 }
    )
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