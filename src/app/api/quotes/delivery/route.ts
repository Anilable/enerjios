import { NextRequest, NextResponse } from 'next/server'
import { EmailService } from '@/lib/email'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const { quoteData, deliveryMethod } = await request.json()

    if (!quoteData) {
      return NextResponse.json(
        { error: 'Quote data is required' },
        { status: 400 }
      )
    }

    if (deliveryMethod.type === 'email') {
      if (!deliveryMethod.email) {
        return NextResponse.json(
          { error: 'Email address is required' },
          { status: 400 }
        )
      }

      console.log('Processing quote delivery for email...')
      console.log('Quote data:', quoteData.id)

      // If quote has an ID, fetch full product data from database
      let productsWithFiles = []
      if (quoteData.id) {
        try {
          const fullQuote = await prisma.quote.findUnique({
            where: { id: quoteData.id },
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
              }
            }
          })

          if (fullQuote && fullQuote.items) {
            productsWithFiles = fullQuote.items.map(item => {
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
            }).filter(Boolean)
          }
        } catch (error) {
          console.error('Error fetching product files:', error)
        }
      }

      console.log('Final products with files:', productsWithFiles.length)

      // Transform quote data for new email service
      const emailData = {
        customerName: quoteData.customerName || 'Değerli Müşterimiz',
        customerEmail: deliveryMethod.email,
        quoteNumber: quoteData.quoteNumber,
        projectTitle: quoteData.projectType || 'Güneş Enerji Sistemi',
        totalAmount: quoteData.total || 0,
        validUntil: quoteData.validUntil ? new Date(quoteData.validUntil) : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        quoteViewUrl: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3002'}/quotes/public/${quoteData.id || 'draft'}`,
        companyName: process.env.COMPANY_NAME || 'EnerjiOS',
        engineerName: 'Proje Uzmanı',
        engineerTitle: 'Güneş Enerji Uzmanı',
        deliveryToken: quoteData.id || 'draft',
        systemDetails: {
          capacity: quoteData.capacity || (productsWithFiles.reduce((total, product) => {
            const power = parseFloat(product.name?.match(/(\d+(?:\.\d+)?)\s*[kK]?[wW]/)?.[1] || '0') || 0;
            return total + (power * product.quantity / 1000); // Convert W to kW
          }, 0)).toFixed(1),
          panelCount: quoteData.panelCount || productsWithFiles.reduce((total, product) => {
            if (product.name?.toLowerCase().includes('panel') || product.name?.toLowerCase().includes('güneş')) {
              return total + product.quantity;
            }
            return total;
          }, 0),
          estimatedProduction: quoteData.estimatedProduction || Math.round(
            parseFloat(quoteData.capacity || (productsWithFiles.reduce((total, product) => {
              const power = parseFloat(product.name?.match(/(\d+(?:\.\d+)?)\s*[kK]?[wW]/)?.[1] || '0') || 0;
              return total + (power * product.quantity / 1000);
            }, 0)).toFixed(1)) * 1450 // Average solar hours in Turkey per year
          ),
          paybackPeriod: quoteData.paybackPeriod || 8 // Default 8 years
        },
        products: productsWithFiles
      }

      // Use new EmailService with product files support
      const emailResult = await EmailService.sendQuoteDelivery(emailData)

      if (!emailResult.success) {
        console.error('Email sending failed:', emailResult.error)
        return NextResponse.json(
          { error: emailResult.error || 'Failed to send email' },
          { status: 500 }
        )
      }

      return NextResponse.json({
        success: true,
        messageId: emailResult.messageId,
        method: 'email',
        recipient: deliveryMethod.email
      })
    }

    // Add SMS delivery here if needed in the future
    if (deliveryMethod.type === 'sms') {
      return NextResponse.json(
        { error: 'SMS delivery not implemented yet' },
        { status: 501 }
      )
    }

    return NextResponse.json(
      { error: 'Invalid delivery method' },
      { status: 400 }
    )

  } catch (error) {
    console.error('Quote delivery error:', error)
    return NextResponse.json(
      { error: 'Failed to deliver quote' },
      { status: 500 }
    )
  }
}