import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { EmailService } from '@/lib/email';
import { WhatsAppService } from '@/lib/whatsapp-service';
import { z } from 'zod';
import crypto from 'crypto';
import { QuoteStatus } from '@prisma/client';

const sendQuoteSchema = z.object({
  channels: z.array(z.enum(['EMAIL', 'WHATSAPP', 'SMS'])).min(1),
  customerEmail: z.string().email().optional(),
  customerPhone: z.string().optional(),
  customerName: z.string().optional(),
  message: z.string().optional()
});

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
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

    const { id } = await params;

    // Get quote with related data
    const quote = await prisma.quote.findUnique({
      where: { id },
      include: {
        customer: {
          include: {
            user: true
          }
        },
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
    let deliveryToken = (quote as any).deliveryToken;
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
        console.log('Processing item for email delivery...')

        // Transform quote data for new email service
        const emailData = {
          customerName: finalCustomerName,
          customerEmail: finalCustomerEmail,
          quoteNumber: quote.quoteNumber,
          projectTitle: quote.project?.name || `${companyName} Güneş Enerji Sistemi`,
          totalAmount: quote.total,
          validUntil: quote.validUntil,
          quoteViewUrl: `${process.env.NEXT_PUBLIC_APP_URL}/quotes/public/${deliveryToken}`,
          companyName,
          engineerName: quote.createdBy?.name || 'Proje Uzmanı',
          engineerTitle: 'Güneş Enerji Uzmanı',
          deliveryToken,
          systemDetails: {
            capacity: 10,
            panelCount: 18,
            estimatedProduction: 14500,
            paybackPeriod: 8
          },
          products: quote.items?.map(item => {
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

            // Manual field doesn't exist in Product model
            // Skip manual files for now

            console.log('Total files for product:', files.length, files)

            return {
              id: product.id,
              name: product.name,
              brand: product.brand,
              quantity: item.quantity,
              unitPrice: item.unitPrice,
              files
            }
          }).filter(Boolean) as Array<{id: string, name: string, brand: string, quantity: number, unitPrice: number, files: Array<{url: string, type: 'image' | 'datasheet' | 'manual', filename: string}>}> || []
        }

        console.log('Final products with files:', emailData.products?.length || 0)

        const emailResult = await EmailService.sendQuoteDelivery(emailData);

        results.push({
          channel: 'EMAIL',
          success: emailResult.success,
          error: emailResult.success ? undefined : emailResult.error || 'Email gönderimi başarısız'
        });

        if (emailResult.success) {
          await prisma.quote.update({
            where: { id: quote.id },
            data: {
              deliveryChannel: 'EMAIL',
              deliveryEmail: finalCustomerEmail
            } as any
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
              deliveryChannel: 'WHATSAPP',
              deliveryPhone: finalCustomerPhone
            } as any
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
        } as any
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
        { error: 'Geçersiz veri', details: error.issues },
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