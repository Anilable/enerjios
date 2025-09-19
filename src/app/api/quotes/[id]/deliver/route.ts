import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { EmailService } from '@/lib/email'
import { nanoid } from 'nanoid'
import crypto from 'crypto'
import { prisma } from '@/lib/prisma'

interface QuoteDeliveryRequest {
  deliveryChannel: 'EMAIL' | 'WHATSAPP' | 'SMS'
  deliveryEmail?: string
  deliveryPhone?: string
  message?: string
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || (session.user.role !== 'ADMIN' && session.user.role !== 'COMPANY')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { deliveryChannel, deliveryEmail, deliveryPhone, message }: QuoteDeliveryRequest = await req.json()
    const { id: quoteId } = await params

    // Validate input
    if (!deliveryChannel) {
      return NextResponse.json({ error: 'Delivery channel is required' }, { status: 400 })
    }

    if (deliveryChannel === 'EMAIL' && !deliveryEmail) {
      return NextResponse.json({ error: 'Email address is required for email delivery' }, { status: 400 })
    }

    if (deliveryChannel === 'WHATSAPP' && !deliveryPhone) {
      return NextResponse.json({ error: 'Phone number is required for WhatsApp delivery' }, { status: 400 })
    }

    // Fetch quote with products and their files from database
    const quoteWithProducts = await prisma.quote.findUnique({
      where: { id: quoteId },
      include: {
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                brand: true,
                images: true,
                datasheet: true,
                manual: true
              }
            }
          }
        },
        customer: true,
        createdBy: true
      }
    })

    if (!quoteWithProducts) {
      return NextResponse.json({ error: 'Quote not found' }, { status: 404 })
    }

    // Transform quote data for email
    const mockQuote = {
      id: quoteId,
      quoteNumber: quoteWithProducts.quoteNumber || `Q-${Date.now().toString().slice(-8)}`,
      projectTitle: quoteWithProducts.projectTitle || '10 kW Ev GES Sistemi',
      customerName: quoteWithProducts.customer?.name || quoteWithProducts.customerName || deliveryEmail?.split('@')[0] || 'Test Müşteri',
      customerEmail: deliveryEmail || quoteWithProducts.customer?.email || quoteWithProducts.customerEmail || 'test@example.com',
      totalAmount: quoteWithProducts.total || 85000,
      validUntil: quoteWithProducts.validUntil || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      systemDetails: {
        capacity: quoteWithProducts.capacity || 10,
        panelCount: quoteWithProducts.panelCount || 18,
        estimatedProduction: quoteWithProducts.estimatedProduction || 14500,
        paybackPeriod: quoteWithProducts.paybackPeriod || 8
      },
      companyName: process.env.COMPANY_NAME || 'EnerjiOS',
      engineerName: quoteWithProducts.createdBy?.name || session.user.name || 'Proje Uzmanı',
      engineerTitle: 'Güneş Enerji Uzmanı',
      products: quoteWithProducts.items?.map(item => {
        console.log('Processing item:', item.id, 'Product:', item.product?.name)
        const product = item.product
        if (!product) return null

        const files: Array<{url: string, type: 'image' | 'datasheet' | 'manual', filename: string}> = []

        // Add images
        console.log('Product images:', product.images)
        if (product.images) {
          try {
            const imageUrls = JSON.parse(product.images)
            console.log('Parsed image URLs:', imageUrls)
            if (Array.isArray(imageUrls)) {
              imageUrls.forEach(url => {
                console.log('Adding image:', url)
                files.push({
                  url,
                  type: 'image',
                  filename: url.split('/').pop() || 'image'
                })
              })
            }
          } catch (e) {
            console.error('Error parsing product images:', e)
          }
        }

        // Add datasheet
        console.log('Product datasheet:', product.datasheet)
        if (product.datasheet) {
          console.log('Adding datasheet:', product.datasheet)
          files.push({
            url: product.datasheet,
            type: 'datasheet',
            filename: product.datasheet.split('/').pop() || 'datasheet.pdf'
          })
        }

        // Add manual
        console.log('Product manual:', product.manual)
        if (product.manual) {
          console.log('Adding manual:', product.manual)
          files.push({
            url: product.manual,
            type: 'manual',
            filename: product.manual.split('/').pop() || 'manual.pdf'
          })
        }

        console.log('Total files for product:', files.length, files)

        return {
          id: product.id,
          name: product.name,
          brand: product.brand,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          files
        }
      }).filter(Boolean) || []

    console.log('Final products with files:', mockQuote.products?.length || 0)
    console.log('Products details:', JSON.stringify(mockQuote.products, null, 2))
    }

    // Generate delivery token
    const deliveryToken = nanoid(32)
    
    // Create public quote viewing URL
    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3002'
    const quoteViewUrl = `${baseUrl}/quote/${deliveryToken}`

    if (deliveryChannel === 'EMAIL') {
      // Send email
      const emailResult = await EmailService.sendQuoteDelivery({
        customerName: mockQuote.customerName,
        customerEmail: mockQuote.customerEmail,
        quoteNumber: mockQuote.quoteNumber,
        projectTitle: mockQuote.projectTitle,
        totalAmount: mockQuote.totalAmount,
        validUntil: mockQuote.validUntil,
        quoteViewUrl,
        companyName: mockQuote.companyName,
        engineerName: mockQuote.engineerName,
        engineerTitle: mockQuote.engineerTitle,
        deliveryToken,
        systemDetails: mockQuote.systemDetails,
        products: mockQuote.products
      })

      if (!emailResult.success) {
        return NextResponse.json({ 
          error: 'Failed to send email', 
          details: emailResult.error 
        }, { status: 500 })
      }

      // Here you would update the quote in the database with delivery information
      /*
      await prisma.quote.update({
        where: { id: quoteId },
        data: {
          status: 'SENT',
          deliveryChannel: 'EMAIL',
          deliveryEmail,
          deliveryToken,
          sentAt: new Date(),
          deliveryTracking: {
            messageId: emailResult.messageId,
            sentAt: new Date().toISOString(),
            channel: 'EMAIL'
          }
        }
      })
      */

      return NextResponse.json({
        success: true,
        message: 'Quote delivered successfully via email',
        deliveryToken,
        messageId: emailResult.messageId,
        quoteViewUrl
      })

    } else if (deliveryChannel === 'WHATSAPP') {
      // WhatsApp integration would go here
      // For now, return mock success
      return NextResponse.json({
        success: true,
        message: 'WhatsApp delivery not yet implemented',
        deliveryToken,
        quoteViewUrl
      })

    } else if (deliveryChannel === 'SMS') {
      // SMS integration would go here
      // For now, return mock success
      return NextResponse.json({
        success: true,
        message: 'SMS delivery not yet implemented',
        deliveryToken,
        quoteViewUrl
      })
    }

    return NextResponse.json({ error: 'Invalid delivery channel' }, { status: 400 })

  } catch (error) {
    console.error('Quote delivery error:', error)
    return NextResponse.json({ 
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}