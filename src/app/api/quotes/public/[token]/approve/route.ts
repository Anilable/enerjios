import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { QuoteStatus } from '@prisma/client';
import { emailService } from '@/lib/email-service';
import { WhatsAppService } from '@/lib/whatsapp-service';
import { z } from 'zod';

const approveQuoteSchema = z.object({
  customerName: z.string().min(1, 'Müşteri adı gerekli'),
  customerPhone: z.string().optional(),
  comments: z.string().optional(),
  signatureData: z.string().optional(),
  acceptedTerms: z.boolean().refine(val => val === true, {
    message: 'Şartları kabul etmeniz gerekli'
  })
});

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const body = await request.json();
    const { customerName, customerPhone, comments, signatureData, acceptedTerms } = 
      approveQuoteSchema.parse(body);

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

    // Check if quote can be approved
    if (!['SENT', 'VIEWED'].includes(quote.status)) {
      return NextResponse.json(
        { error: 'Bu teklif onaylanamaz' },
        { status: 400 }
      );
    }

    // Get client info
    const userAgent = request.headers.get('user-agent') || '';
    const forwarded = request.headers.get('x-forwarded-for');
    const clientIP = forwarded?.split(',')[0] || 
                    request.headers.get('x-real-ip') || 
                    'unknown';

    // Update quote status to approved
    await prisma.quote.update({
      where: { id: quote.id },
      data: {
        status: 'APPROVED' as any,
        approvedAt: now,
        respondedAt: now,
        customerIP: clientIP,
        customerAgent: userAgent,
        signatureData,
        customerComments: comments || null
      } as any
    });

    // Update project status if applicable
    if ((quote as any).project) {
      await prisma.project.update({
        where: { id: (quote as any).project.id },
        data: {
          status: 'IN_PROGRESS'
        }
      });
    }

    // Send notification email to quote creator
    const companyName = (quote as any).company?.name || process.env.COMPANY_NAME || 'Trakya Solar';

    try {
      await emailService.sendQuoteStatusNotification(
        quote as any,
        customerName,
        companyName,
        'approved'
      );
    } catch (error) {
      console.error('Failed to send approval notification email:', error);
    }

    // Send WhatsApp notification if phone available
    if ((quote as any).createdBy.phone) {
      try {
        const whatsappService = new WhatsAppService();
        await whatsappService.sendQuoteStatusUpdate(
          (quote as any).createdBy.phone,
          customerName,
          quote.quoteNumber,
          'approved'
        );
      } catch (error) {
        console.error('Failed to send WhatsApp notification:', error);
      }
    }

    // Create notification record
    await prisma.notification.create({
      data: {
        userId: quote.createdById,
        type: 'QUOTE_ACCEPTED',
        title: 'Teklif Onaylandı',
        message: `${customerName} adlı müşteri ${quote.quoteNumber} numaralı teklifi onayladı.`,
        actionUrl: `/dashboard/quotes/${quote.id}`
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Teklif başarıyla onaylandı',
      status: 'approved'
    });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Geçersiz veri', details: error.issues },
        { status: 400 }
      );
    }

    console.error('Quote approval error:', error);
    return NextResponse.json(
      { error: 'Sunucu hatası' },
      { status: 500 }
    );
  }
}