import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { QuoteStatus } from '@prisma/client';
import { emailService } from '@/lib/email-service';
import { WhatsAppService } from '@/lib/whatsapp-service';
import { z } from 'zod';

const rejectQuoteSchema = z.object({
  customerName: z.string().min(1, 'Müşteri adı gerekli'),
  customerPhone: z.string().optional(),
  comments: z.string().optional()
});

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const body = await request.json();
    const { customerName, customerPhone, comments } = rejectQuoteSchema.parse(body);

    const { token } = await params;

    // Find quote by delivery token
    const quote = await prisma.quote.findUnique({
      where: { deliveryToken: token } as any,
      include: {
        customer: {
          include: {
            user: true
          }
        },
        company: true,
        createdBy: true,
        project: true
      }
    });

    if (!quote) {
      return NextResponse.json(
        { error: 'Teklif bulunamadı veya geçersiz token' },
        { status: 404 }
      );
    }

    // Check if quote is expired
    const now = new Date();
    if (quote.validUntil < now) {
      return NextResponse.json(
        { error: 'Teklif süresi dolmuş' },
        { status: 410 }
      );
    }

    // Check if quote can be rejected
    if (!['SENT', 'VIEWED'].includes(quote.status)) {
      return NextResponse.json(
        { error: 'Bu teklif reddedilemez' },
        { status: 400 }
      );
    }

    // Get client info
    const userAgent = request.headers.get('user-agent') || '';
    const forwarded = request.headers.get('x-forwarded-for');
    const clientIP = forwarded?.split(',')[0] || 
                    request.headers.get('x-real-ip') || 
                    'unknown';

    // Update quote status to rejected
    await prisma.quote.update({
      where: { id: quote.id },
      data: {
        status: 'REJECTED' as any,
        rejectedAt: now,
        respondedAt: now,
        customerIP: clientIP,
        customerAgent: userAgent,
        customerComments: comments || null
      } as any
    });

    // Send notification email to quote creator
    const companyName = (quote as any).company?.name || process.env.COMPANY_NAME || 'Trakya Solar';

    try {
      await emailService.sendQuoteStatusNotification(
        quote as any,
        customerName,
        companyName,
        'rejected'
      );
    } catch (error) {
      console.error('Failed to send rejection notification email:', error);
    }

    // Send WhatsApp notification if phone available
    if ((quote as any).createdBy.phone) {
      try {
        const whatsappService = new WhatsAppService();
        await whatsappService.sendQuoteStatusUpdate(
          (quote as any).createdBy.phone,
          customerName,
          quote.quoteNumber,
          'rejected'
        );
      } catch (error) {
        console.error('Failed to send WhatsApp notification:', error);
      }
    }

    // Create notification record
    await prisma.notification.create({
      data: {
        userId: quote.createdById,
        type: 'QUOTE_RECEIVED', // Using existing enum
        title: 'Teklif Reddedildi',
        message: `${customerName} adlı müşteri ${quote.quoteNumber} numaralı teklifi reddetti.${comments ? ` Sebep: ${comments}` : ''}`,
        actionUrl: `/dashboard/quotes/${quote.id}`
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Geri bildiriminiz başarıyla kaydedildi',
      status: 'rejected'
    });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Geçersiz veri', details: error.issues },
        { status: 400 }
      );
    }

    console.error('Quote rejection error:', error);
    return NextResponse.json(
      { error: 'Sunucu hatası' },
      { status: 500 }
    );
  }
}