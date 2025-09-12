import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { EmailService } from '@/lib/email'
import { nanoid } from 'nanoid'
import crypto from 'crypto'

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

    // Mock quote data (in real app, fetch from database)
    // Here you would fetch the actual quote from your database
    const mockQuote = {
      id: quoteId,
      quoteNumber: `Q-${Date.now().toString().slice(-8)}`,
      projectTitle: '10 kW Ev GES Sistemi',
      customerName: 'Test Müşteri',
      customerEmail: deliveryEmail || 'test@example.com',
      totalAmount: 85000,
      validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
      systemDetails: {
        capacity: 10,
        panelCount: 18,
        estimatedProduction: 14500,
        paybackPeriod: 8
      },
      companyName: process.env.COMPANY_NAME || 'EnerjiOS',
      engineerName: session.user.name || 'Proje Uzmanı',
      engineerTitle: 'Güneş Enerji Uzmanı'
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
        systemDetails: mockQuote.systemDetails
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