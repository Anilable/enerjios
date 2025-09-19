import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { PackageType } from '@/types/package'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') as PackageType | null
    const companyId = searchParams.get('companyId')
    const isActive = searchParams.get('isActive')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')

    const where: any = {}

    if (type) {
      where.type = type
    }

    if (companyId) {
      where.companyId = companyId
    }

    if (isActive !== null) {
      where.isActive = isActive === 'true'
    }

    const packages = await (prisma as any).package.findMany({
      where,
      include: {
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                brand: true,
                model: true,
                power: true,
                price: true,
                unitType: true,
                images: true
              }
            }
          },
          orderBy: {
            order: 'asc'
          }
        },
        company: {
          select: {
            id: true,
            name: true
          }
        },
        createdBy: {
          select: {
            id: true,
            name: true
          }
        }
      },
      orderBy: [
        { isFeatured: 'desc' },
        { createdAt: 'desc' }
      ],
      skip: (page - 1) * limit,
      take: limit
    })

    const total = await (prisma as any).package.count({ where })

    return NextResponse.json({
      packages,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error('Error fetching packages:', error)
    return NextResponse.json({ error: 'Failed to fetch packages' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const data = await request.json()
    const { name, type, description, images, items } = data

    if (!name || !type || !items || items.length === 0) {
      return NextResponse.json({
        error: 'Name, type, and items are required'
      }, { status: 400 })
    }

    // Calculate total price
    let totalPrice = 0
    let totalPower = 0

    // Validate products exist and calculate totals
    for (const item of items) {
      const product = await prisma.product.findUnique({
        where: { id: item.productId }
      })

      if (!product) {
        return NextResponse.json({
          error: `Product with ID ${item.productId} not found`
        }, { status: 400 })
      }

      const itemTotal = item.quantity * item.unitPrice
      totalPrice += itemTotal

      if (product.power) {
        totalPower += product.power * item.quantity
      }
    }

    // Create package with items
    const packageData = await (prisma as any).package.create({
      data: {
        name,
        type,
        description,
        images: images ? JSON.stringify(images) : null,
        totalPrice,
        totalPower: totalPower > 0 ? totalPower : null,
        createdById: session.user.id,
        companyId: session.user.role === 'COMPANY' ? session.user.id : undefined,
        items: {
          create: items.map((item: any, index: number) => ({
            productId: item.productId,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            total: item.quantity * item.unitPrice,
            description: item.description,
            order: item.order || index
          }))
        }
      },
      include: {
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                brand: true,
                model: true,
                power: true,
                price: true,
                unitType: true,
                images: true
              }
            }
          },
          orderBy: {
            order: 'asc'
          }
        },
        company: {
          select: {
            id: true,
            name: true
          }
        },
        createdBy: {
          select: {
            id: true,
            name: true
          }
        }
      }
    })

    return NextResponse.json(packageData, { status: 201 })
  } catch (error) {
    console.error('Error creating package:', error)
    return NextResponse.json({ error: 'Failed to create package' }, { status: 500 })
  }
}