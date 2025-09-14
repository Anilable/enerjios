import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from '@/lib/get-session'
import { prisma } from '@/lib/prisma'

// Function to validate that all quote items have valid product IDs
function validateQuoteItems(items: any[]) {
  for (const item of items) {
    if (!item.productId) {
      throw new Error(`Quote item "${item.name || item.description}" requires a valid productId. Please select a product from the catalog.`)
    }
  }
}

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
    console.log('Draft API - Received body:', JSON.stringify(body, null, 2))
    
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
      quoteNumber,
      id
    } = body

    // Validate that all items have product IDs
    if (items && items.length > 0) {
      validateQuoteItems(items)
    }

    let quote

    if (id) {
      // Update existing draft
      await prisma.quoteItem.deleteMany({
        where: { quoteId: id }
      })

      quote = await prisma.quote.update({
        where: { id },
        data: {
          status: 'DRAFT',
          subtotal: parseFloat(subtotal) || 0,
          discount: parseFloat(discount) || 0,
          tax: parseFloat(tax) || 0,
          total: parseFloat(total) || 0,
          validUntil: new Date(Date.now() + (validity || 30) * 24 * 60 * 60 * 1000),
          notes: notes || '',
          terms: terms || '',
          items: {
            create: items?.map((item: any) => ({
              productId: item.productId,
              description: JSON.stringify({
                name: item.name || '',
                category: item.category || 'OTHER',
                description: item.description || '',
                pricingType: item.pricingType || 'UNIT',
                discount: parseFloat(item.discount) || 0,
                tax: parseFloat(item.tax) || 0
              }),
              quantity: parseFloat(item.quantity) || 0,
              unitPrice: parseFloat(item.unitPrice) || 0,
              total: parseFloat(item.total) || 0
            })) || []
          }
        },
        include: {
          items: {
            include: {
              product: true
            }
          }
        }
      })
    } else {
      // Create new draft
      quote = await prisma.quote.create({
        data: {
          quoteNumber: quoteNumber || `Q-${Date.now().toString().slice(-8)}`,
          projectId: projectRequestId, // Use projectId instead of projectRequestId
          status: 'DRAFT',
          subtotal: parseFloat(subtotal) || 0,
          discount: parseFloat(discount) || 0,
          tax: parseFloat(tax) || 0,
          total: parseFloat(total) || 0,
          validUntil: new Date(Date.now() + (validity || 30) * 24 * 60 * 60 * 1000),
          notes: notes || '',
          terms: terms || '',
          createdById: session.user.id,
          items: {
            create: items?.map((item: any) => ({
              productId: item.productId,
              description: JSON.stringify({
                name: item.name || '',
                category: item.category || 'OTHER',
                description: item.description || '',
                pricingType: item.pricingType || 'UNIT',
                discount: parseFloat(item.discount) || 0,
                tax: parseFloat(item.tax) || 0
              }),
              quantity: parseFloat(item.quantity) || 0,
              unitPrice: parseFloat(item.unitPrice) || 0,
              total: parseFloat(item.total) || 0
            })) || []
          }
        },
        include: {
          items: {
            include: {
              product: true
            }
          }
        }
      })
    }

    return NextResponse.json(quote)
  } catch (error) {
    console.error('Error saving draft:', error)
    console.error('Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : 'No stack trace'
    })
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession()
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const projectRequestId = searchParams.get('projectRequestId')

    const where: any = {
      status: 'DRAFT'
    }
    
    if (projectRequestId) {
      where.projectId = projectRequestId
    }

    const drafts = await prisma.quote.findMany({
      where,
      include: {
        items: {
          include: {
            product: true
          }
        }
      },
      orderBy: {
        updatedAt: 'desc'
      }
    })

    return NextResponse.json(drafts)
  } catch (error) {
    console.error('Error fetching drafts:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}