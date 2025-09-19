import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from '@/lib/get-session'
import { prisma } from '@/lib/prisma'

/**
 * Approves a quote and reduces stock for items
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    console.log('🟢 Quote approval API called!')
    const session = await getServerSession()

    if (!session?.user?.id) {
      console.log('❌ Unauthorized access')
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const quoteId = params.id
    console.log('📋 Approving quote ID:', quoteId)

    // Get the quote with items
    const quote = await prisma.quote.findUnique({
      where: { id: quoteId },
      include: {
        items: true
      }
    })

    if (!quote) {
      return NextResponse.json(
        { error: 'Quote not found' },
        { status: 404 }
      )
    }

    if (quote.status === 'APPROVED') {
      return NextResponse.json(
        { error: 'Quote is already approved' },
        { status: 400 }
      )
    }

    // Start transaction to update quote status and reduce stock
    const result = await prisma.$transaction(async (tx) => {
      // Update quote status to APPROVED
      const updatedQuote = await tx.quote.update({
        where: { id: quoteId },
        data: {
          status: 'APPROVED',
          approvedAt: new Date(),
          approvedById: session.user.id
        },
        include: {
          items: true,
          customer: true,
          project: true
        }
      })

      // Reduce stock for each item that has a real productId (not temp_ placeholder)
      console.log('🔍 Processing items for stock reduction:')
      console.log('Items count:', quote.items.length)

      for (const item of quote.items) {
        console.log(`Item: ${item.productId}, quantity: ${item.quantity}`)

        if (item.productId && !item.productId.startsWith('temp_')) {
          console.log(`✅ Processing real product: ${item.productId}`)
          // Check if product exists and has enough stock
          const product = await tx.product.findUnique({
            where: { id: item.productId }
          })

          if (product) {
            if (product.stock < item.quantity) {
              throw new Error(
                `Insufficient stock for product ${product.name}. Available: ${product.stock}, Required: ${item.quantity}`
              )
            }

            // Reduce stock
            await tx.product.update({
              where: { id: item.productId },
              data: {
                stock: {
                  decrement: item.quantity
                }
              }
            })

            console.log(`Stock reduced for product ${product.name}: ${item.quantity} units`)
          }
        } else {
          console.log(`⏭️  Skipping item: ${item.productId} (temp or no productId)`)
        }
      }

      return updatedQuote
    })

    return NextResponse.json({
      message: 'Quote approved successfully and stock updated',
      quote: result
    })

  } catch (error) {
    console.error('Error approving quote:', error)

    // Handle specific stock shortage error
    if (error instanceof Error && error.message.includes('Insufficient stock')) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      )
    }

    return NextResponse.json(
      {
        error: 'Failed to approve quote',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}