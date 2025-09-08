import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { emailService } from '@/lib/email-service';
import { WhatsAppService } from '@/lib/whatsapp-service';
import { z } from 'zod';
import crypto from 'crypto';
import { QuoteStatus, DeliveryChannel } from '@prisma/client';

const sendQuoteSchema = z.object({
  channels: z.array(z.enum(['EMAIL', 'WHATSAPP', 'SMS'])).min(1),
  customerEmail: z.string().email().optional(),
  customerPhone: z.string().optional(),
  customerName: z.string().optional(),
  message: z.string().optional()
});

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Yetkisiz erişim' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { channels, customerEmail, customerPhone, customerName, message } = sendQuoteSchema.parse(body);

    // Get quote with related data
    const quote = await prisma.quote.findUnique({
      where: { id: params.id },
      include: {
        customer: true,
        createdBy: true,
        project: true,
        items: {
          include: {
            product: true
          }
        }
      }
    });

    if (!quote) {
      return NextResponse.json(
        { error: 'Teklif bulunamadı' },
        { status: 404 }
      );
    }

    // Check if user has permission to send this quote
    if (quote.createdById !== session.user.id) {
      return NextResponse.json(
        { error: 'Bu teklifi gönderme yetkiniz yok' },
        { status: 403 }
      );
    }

    // Check if quote is in sendable status
    if (quote.status !== QuoteStatus.DRAFT) {
      return NextResponse.json(
        { error: 'Bu teklif zaten gönderilmiş' },
        { status: 400 }
      );
    }

    // Generate delivery token if not exists
    let deliveryToken = quote.deliveryToken;
    if (!deliveryToken) {
      deliveryToken = crypto.randomBytes(32).toString('hex');
    }

    // Determine customer information
    const finalCustomerEmail = customerEmail || quote.customer?.user?.email;
    const finalCustomerPhone = customerPhone || quote.customer?.phone;
    const finalCustomerName = customerName || 
      (quote.customer?.companyName || 
       `${quote.customer?.firstName || ''} ${quote.customer?.lastName || ''}`.trim()) || 
      'Değerli Müşterimiz';

    if (!finalCustomerEmail && !finalCustomerPhone) {
      return NextResponse.json(
        { error: 'Müşteri email veya telefon bilgisi gerekli' },
        { status: 400 }
      );
    }

    const companyName = process.env.COMPANY_NAME || 'Trakya Solar';
    const results: { channel: string; success: boolean; error?: string }[] = [];

    // Send via Email
    if (channels.includes('EMAIL') && finalCustomerEmail) {
      try {
        const emailSent = await emailService.sendQuoteDeliveryEmail(
          quote,
          finalCustomerEmail,
          finalCustomerName,
          companyName,
          quote.pdfUrl || undefined
        );

        results.push({
          channel: 'EMAIL',
          success: emailSent,
          error: emailSent ? undefined : 'Email gönderimi başarısız'
        });

        if (emailSent) {
          await prisma.quote.update({
            where: { id: quote.id },
            data: {
              deliveryChannel: DeliveryChannel.EMAIL,
              deliveryEmail: finalCustomerEmail
            }
          });
        }
      } catch (error) {
        console.error('Email sending error:', error);
        results.push({
          channel: 'EMAIL',
          success: false,
          error: 'Email gönderimi hatası'
        });
      }
    }

    // Send via WhatsApp
    if (channels.includes('WHATSAPP') && finalCustomerPhone) {
      try {
        const whatsappService = new WhatsAppService();
        const viewUrl = `${process.env.NEXT_PUBLIC_APP_URL}/quotes/public/${deliveryToken}`;
        
        const whatsappSent = await whatsappService.sendQuoteMessage(
          finalCustomerPhone,
          {
            customerName: finalCustomerName,
            quoteNumber: quote.quoteNumber,
            total: quote.total,
            validUntil: quote.validUntil,
            viewUrl,
            companyName,
            message
          }
        );

        results.push({
          channel: 'WHATSAPP',
          success: whatsappSent,
          error: whatsappSent ? undefined : 'WhatsApp gönderimi başarısız'
        });

        if (whatsappSent) {
          await prisma.quote.update({
            where: { id: quote.id },
            data: {
              deliveryChannel: DeliveryChannel.WHATSAPP,
              deliveryPhone: finalCustomerPhone
            }
          });
        }
      } catch (error) {
        console.error('WhatsApp sending error:', error);
        results.push({
          channel: 'WHATSAPP',
          success: false,
          error: 'WhatsApp gönderimi hatası'
        });
      }
    }

    // Send via SMS
    if (channels.includes('SMS') && finalCustomerPhone) {
      // SMS implementation would go here
      results.push({
        channel: 'SMS',
        success: false,
        error: 'SMS entegrasyonu henüz aktif değil'
      });
    }

    // Check if at least one channel succeeded
    const hasSuccess = results.some(r => r.success);

    if (hasSuccess) {
      // Update quote status and delivery info
      const now = new Date();
      await prisma.quote.update({
        where: { id: quote.id },
        data: {
          status: QuoteStatus.SENT,
          deliveryToken,
          sentAt: now,
          deliveryEmail: finalCustomerEmail,
          deliveryPhone: finalCustomerPhone,
          deliveryTracking: {
            sentAt: now.toISOString(),
            channels: results.filter(r => r.success).map(r => r.channel),
            results
          }
        }
      });

      return NextResponse.json({
        success: true,
        message: 'Teklif başarıyla gönderildi',
        deliveryToken,
        results
      });
    } else {
      return NextResponse.json(
        { 
          error: 'Teklif gönderilemedi',
          results 
        },
        { status: 500 }
      );
    }

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Geçersiz veri', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Quote send error:', error);
    return NextResponse.json(
      { error: 'Sunucu hatası' },
      { status: 500 }
    );
  }
}