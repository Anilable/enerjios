import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { id } = await params

    const quote = await prisma.quote.findUnique({
      where: { id },
      include: {
        items: {
          include: {
            product: true
          }
        },
        customer: true,
        project: true
      }
    })

    if (!quote) {
      return NextResponse.json(
        { error: 'Quote not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(quote)
  } catch (error) {
    console.error('Error fetching quote:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { id } = await params
    const body = await request.json()
    
    const {
      customerName,
      customerEmail,
      customerPhone,
      projectType,
      capacity,
      items,
      subtotal,
      discount,
      tax,
      total,
      validity,
      notes,
      terms,
      status
    } = body

    // Delete existing items and create new ones
    await prisma.quoteItem.deleteMany({
      where: { quoteId: id }
    })

    const quote = await prisma.quote.update({
      where: { id },
      data: {
        status,
        customerName,
        customerEmail,
        customerPhone,
        projectType,
        capacity: parseFloat(capacity) || 0,
        subtotal: parseFloat(subtotal) || 0,
        discount: parseFloat(discount) || 0,
        tax: parseFloat(tax) || 0,
        total: parseFloat(total) || 0,
        validUntil: new Date(Date.now() + (validity || 30) * 24 * 60 * 60 * 1000),
        notes: notes || '',
        terms: terms || '',
        items: {
          create: items?.map((item: any) => ({
            productId: item.productId || null,
            name: item.name,
            description: item.description || '',
            category: item.category,
            quantity: parseFloat(item.quantity) || 0,
            unitPrice: parseFloat(item.unitPrice) || 0,
            discount: parseFloat(item.discount) || 0,
            tax: parseFloat(item.tax) || 0,
            total: parseFloat(item.total) || 0
          })) || []
        }
      },
      include: {
        items: {
          include: {
            product: true
          }
        },
        customer: true,
        project: true
      }
    })

    return NextResponse.json(quote)
  } catch (error) {
    console.error('Error updating quote:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { id } = await params

    await prisma.quote.delete({
      where: { id }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting quote:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}