import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const packageData = await (prisma as any).package.findUnique({
      where: { id: params.id },
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
                images: true,
                specifications: true
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

    if (!packageData) {
      return NextResponse.json({ error: 'Package not found' }, { status: 404 })
    }

    return NextResponse.json(packageData)
  } catch (error) {
    console.error('Error fetching package:', error)
    return NextResponse.json({ error: 'Failed to fetch package' }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const data = await request.json()
    const { parentId, name, type, description, images, isActive, isFeatured, items } = data

    // Check if package exists and user has permission
    const existingPackage = await (prisma as any).package.findUnique({
      where: { id: params.id },
      include: { company: true }
    })

    if (!existingPackage) {
      return NextResponse.json({ error: 'Package not found' }, { status: 404 })
    }

    // Check permissions
    if (session.user.role === 'COMPANY' && existingPackage.companyId !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    let totalPrice = existingPackage.totalPrice
    let totalPower = existingPackage.totalPower

    // If items are being updated, recalculate totals
    if (items) {
      totalPrice = 0
      totalPower = 0

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

      // Update package with new items
      await (prisma as any).packageItem.deleteMany({
        where: { packageId: params.id }
      })
    }

    const updatedPackage = await (prisma as any).package.update({
      where: { id: params.id },
      data: {
        ...(parentId !== undefined && { parentId }),
        ...(name && { name }),
        ...(type && { type }),
        ...(description !== undefined && { description }),
        ...(images && { images: JSON.stringify(images) }),
        ...(isActive !== undefined && { isActive }),
        ...(isFeatured !== undefined && { isFeatured }),
        ...(items && { totalPrice, totalPower: totalPower > 0 ? totalPower : null }),
        updatedById: session.user.id,
        ...(items && {
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
        })
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

    return NextResponse.json(updatedPackage)
  } catch (error) {
    console.error('Error updating package:', error)
    return NextResponse.json({ error: 'Failed to update package' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if package exists and user has permission
    const existingPackage = await (prisma as any).package.findUnique({
      where: { id: params.id },
      include: { company: true }
    })

    if (!existingPackage) {
      return NextResponse.json({ error: 'Package not found' }, { status: 404 })
    }

    // Check permissions
    if (session.user.role === 'COMPANY' && existingPackage.companyId !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Check if package is used in any quotes
    const quoteItems = await prisma.quoteItem.findFirst({
      where: { packageId: params.id } as any
    })

    if (quoteItems) {
      return NextResponse.json({
        error: 'Cannot delete package that is used in quotes'
      }, { status: 400 })
    }

    await (prisma as any).package.delete({
      where: { id: params.id }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting package:', error)
    return NextResponse.json({ error: 'Failed to delete package' }, { status: 500 })
  }
}