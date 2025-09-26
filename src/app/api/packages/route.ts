import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { PackageType } from '@/types/package'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      console.log('🔒 No session found for packages API')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    console.log('✅ Session found for packages API:', { userId: session.user.id, role: session.user.role })

    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') as PackageType | null
    const companyId = searchParams.get('companyId')
    const isActive = searchParams.get('isActive')
    const includeChildren = searchParams.get('includeChildren') === 'true'
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')

    const where: any = {}

    // Apply company-based filtering based on user role
    if (session?.user?.role === 'COMPANY') {
      // Company users only see their own company's packages
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
      // Admin, General Manager and Installation Team users only see admin packages (companyId is null)
      where.companyId = null
    } else {
      // Other roles (CUSTOMER, etc.) should not see any packages
      return NextResponse.json([])
    }

    if (type) {
      where.type = type
    }

    // Override companyId if explicitly provided (only for ADMIN users)
    if (companyId && session?.user?.role === 'ADMIN') {
      where.companyId = companyId
    }

    if (isActive !== null) {
      where.isActive = isActive === 'true'
    }

    const includeOptions = {
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

    // Add hierarchy support
    if (includeChildren) {
      (includeOptions as any).parent = true
      ;(includeOptions as any).children = {
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
          }
        }
      }
    }

    const packages = await (prisma as any).package.findMany({
      where,
      include: includeOptions,
      orderBy: [
        { parentId: 'asc' }, // Root packages first
        { isFeatured: 'desc' },
        { createdAt: 'desc' }
      ],
      skip: !includeChildren ? (page - 1) * limit : undefined,
      take: !includeChildren ? limit : undefined
    })

    // Transform packages to include productName in items
    const transformedPackages = packages.map((pkg: any) => ({
      ...pkg,
      items: pkg.items.map((item: any) => ({
        productId: item.productId,
        productName: item.product.name,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        totalPrice: item.total
      })),
      children: pkg.children?.map((child: any) => ({
        ...child,
        items: child.items.map((item: any) => ({
          productId: item.productId,
          productName: item.product.name,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          totalPrice: item.total
        }))
      }))
    }))

    if (includeChildren) {
      return NextResponse.json({
        packages: transformedPackages
      })
    }

    const total = await (prisma as any).package.count({ where })

    return NextResponse.json({
      packages: transformedPackages,
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
    const { parentId, name, type, description, images, items, totalPower, isActive = true, isFeatured = false } = data

    if (!name || !type) {
      return NextResponse.json({
        error: 'Name and type are required'
      }, { status: 400 })
    }

    // Calculate total price
    let calculatedTotalPrice = 0
    let calculatedTotalPower = 0

    // Validate products exist and calculate totals if items are provided
    if (items && items.length > 0) {
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
        calculatedTotalPrice += itemTotal

        if (product.power) {
          calculatedTotalPower += product.power * item.quantity
        }
      }
    }

    // Use provided totalPower or calculated value
    const finalTotalPower = totalPower || (calculatedTotalPower > 0 ? calculatedTotalPower : null)

    // Create package with items
    const packageData = await (prisma as any).package.create({
      data: {
        parentId,
        name,
        type,
        description,
        images: images ? JSON.stringify(images) : null,
        totalPrice: calculatedTotalPrice,
        totalPower: finalTotalPower,
        isActive,
        isFeatured,
        createdById: session.user.id,
        companyId: session.user.role === 'COMPANY' ? session.user.id : undefined,
        items: items && items.length > 0 ? {
          create: items.map((item: any, index: number) => ({
            productId: item.productId,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            total: item.quantity * item.unitPrice,
            description: item.description,
            order: item.order || index
          }))
        } : undefined
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
        parent: true,
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

    // Transform response
    const transformedPackage = {
      ...packageData,
      items: packageData.items.map((item: any) => ({
        productId: item.productId,
        productName: item.product.name,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        totalPrice: item.total
      }))
    }

    return NextResponse.json(transformedPackage, { status: 201 })
  } catch (error) {
    console.error('Error creating package:', error)
    return NextResponse.json({ error: 'Failed to create package' }, { status: 500 })
  }
}