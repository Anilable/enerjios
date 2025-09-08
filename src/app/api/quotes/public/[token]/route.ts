import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { QuoteStatus } from '@prisma/client';
import { emailService } from '@/lib/email-service';

export async function GET(
  request: NextRequest,
  { params }: { params: { token: string } }
) {
  try {
    const { token } = params;

    if (!token) {
      return NextResponse.json(
        { error: 'Token gerekli' },
        { status: 400 }
      );
    }

    // Find quote by delivery token
    const quote = await prisma.quote.findUnique({
      where: { deliveryToken: token },
      include: {
        project: true,
        customer: {
          include: {
            user: true
          }
        },
        company: true,
        createdBy: true,
        items: {
          include: {
            product: true
          }
        }
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
      if (quote.status !== QuoteStatus.EXPIRED) {
        await prisma.quote.update({
          where: { id: quote.id },
          data: { 
            status: QuoteStatus.EXPIRED,
            expiredAt: now
          }
        });
      }
      
      return NextResponse.json(
        { error: 'Teklif süresi dolmuş', expired: true },
        { status: 410 }
      );
    }

    // Track quote view (only update if not viewed before or if it's the first view)
    if (quote.status === QuoteStatus.SENT) {
      const userAgent = request.headers.get('user-agent') || '';
      const forwarded = request.headers.get('x-forwarded-for');
      const clientIP = forwarded?.split(',')[0] || 
                      request.headers.get('x-real-ip') || 
                      'unknown';

      await prisma.quote.update({
        where: { id: quote.id },
        data: {
          status: QuoteStatus.VIEWED,
          viewedAt: now,
          customerIP: clientIP,
          customerAgent: userAgent
        }
      });

      // Send notification to quote creator
      const customerName = quote.customer?.companyName || 
        `${quote.customer?.firstName || ''} ${quote.customer?.lastName || ''}`.trim() || 
        'Müşteri';
      
      const companyName = quote.company?.name || process.env.COMPANY_NAME || 'Trakya Solar';

      try {
        await emailService.sendQuoteStatusNotification(
          quote,
          customerName,
          companyName,
          'viewed'
        );
      } catch (error) {
        console.error('Failed to send view notification:', error);
      }
    }

    // Return quote data (excluding sensitive information)
    return NextResponse.json({
      id: quote.id,
      quoteNumber: quote.quoteNumber,
      status: quote.status,
      subtotal: quote.subtotal,
      tax: quote.tax,
      discount: quote.discount,
      total: quote.total,
      validUntil: quote.validUntil,
      terms: quote.terms,
      notes: quote.notes,
      pdfUrl: quote.pdfUrl,
      sentAt: quote.sentAt,
      viewedAt: quote.viewedAt,
      project: {
        name: quote.project.name,
        type: quote.project.type,
        capacity: quote.project.capacity,
        estimatedCost: quote.project.estimatedCost
      },
      company: quote.company ? {
        name: quote.company.name,
        phone: quote.company.phone,
        address: quote.company.address,
        city: quote.company.city,
        logo: quote.company.logo,
        website: quote.company.website
      } : null,
      createdBy: {
        name: quote.createdBy.name,
        email: quote.createdBy.email,
        phone: quote.createdBy.phone
      },
      customer: quote.customer ? {
        type: quote.customer.type,
        firstName: quote.customer.firstName,
        lastName: quote.customer.lastName,
        companyName: quote.customer.companyName,
        phone: quote.customer.phone
      } : null,
      items: quote.items.map(item => ({
        id: item.id,
        description: item.description,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        total: item.total,
        product: {
          name: item.product.name,
          brand: item.product.brand,
          model: item.product.model,
          type: item.product.type,
          power: item.product.power,
          warranty: item.product.warranty
        }
      }))
    });

  } catch (error) {
    console.error('Public quote fetch error:', error);
    return NextResponse.json(
      { error: 'Sunucu hatası' },
      { status: 500 }
    );
  }
}