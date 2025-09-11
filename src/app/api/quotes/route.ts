import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    
    const {
      projectRequestId,
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
      status,
      quoteNumber
    } = body

    // Create quote in database
    const quote = await prisma.quote.create({
      data: {
        quoteNumber: quoteNumber || `Q-${Date.now().toString().slice(-8)}`,
        projectRequestId,
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
        createdBy: session.user.id,
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
    console.error('Error creating quote:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const projectRequestId = searchParams.get('projectRequestId')

    const where: any = {}
    
    if (status) {
      where.status = status
    }
    
    if (projectRequestId) {
      where.projectRequestId = projectRequestId
    }

    const quotes = await prisma.quote.findMany({
      where,
      include: {
        items: {
          include: {
            product: true
          }
        },
        customer: true,
        project: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json(quotes)
  } catch (error) {
    console.error('Error fetching quotes:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}