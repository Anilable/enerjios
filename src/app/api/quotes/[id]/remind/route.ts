import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { sendEmail } from '@/lib/email'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { id: quoteId } = await params

    // Quote'u veritabanından çek
    const quote = await prisma.quote.findUnique({
      where: { id: quoteId },
      include: {
        projectRequest: {
          include: {
            customer: true
          }
        }
      }
    })

    if (!quote) {
      return NextResponse.json(
        { error: 'Quote not found' },
        { status: 404 }
      )
    }

    // Sadece gönderilmiş veya görüntülenmiş teklifler için hatırlatma gönder
    if (quote.status !== 'SENT' && quote.status !== 'VIEWED') {
      return NextResponse.json(
        { error: 'Quote must be sent or viewed to send reminder' },
        { status: 400 }
      )
    }

    // Son hatırlatmadan belli bir süre geçmiş mi kontrol et (örnek: 24 saat)
    const lastReminder = await prisma.quoteReminder.findFirst({
      where: { quoteId },
      orderBy: { createdAt: 'desc' }
    })

    const now = new Date()
    if (lastReminder) {
      const hoursSinceLastReminder = (now.getTime() - lastReminder.createdAt.getTime()) / (1000 * 60 * 60)
      if (hoursSinceLastReminder < 24) {
        return NextResponse.json(
          { error: 'Reminder can only be sent once per 24 hours' },
          { status: 429 }
        )
      }
    }

    // Email hatırlatması gönder
    const customer = quote.projectRequest.customer
    const quoteLink = `${process.env.NEXTAUTH_URL}/quote/${quote.id}`

    const emailContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #2563eb; margin-bottom: 20px;">Güneş Enerjisi Sistemi Teklif Hatırlatması</h2>
        
        <p>Sayın ${customer.name},</p>
        
        <p>Size gönderdiğimiz <strong>${quote.quoteNumber}</strong> numaralı güneş enerjisi sistemi teklifimiz için hatırlatma yapmak istedik.</p>
        
        <div style="background: #f3f4f6; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin-top: 0;">Teklif Detayları:</h3>
          <ul style="margin: 0; padding-left: 20px;">
            <li><strong>Teklif No:</strong> ${quote.quoteNumber}</li>
            <li><strong>Sistem Gücü:</strong> ${quote.capacity} kW</li>
            <li><strong>Toplam Tutar:</strong> ${quote.total.toLocaleString('tr-TR')} TL</li>
            <li><strong>Geçerlilik Tarihi:</strong> ${new Date(quote.validUntil).toLocaleDateString('tr-TR')}</li>
          </ul>
        </div>
        
        <p>Teklifinizi incelemek ve değerlendirmek için aşağıdaki bağlantıyı kullanabilirsiniz:</p>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${quoteLink}" 
             style="background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
            Teklifi Görüntüle
          </a>
        </div>
        
        <p>Herhangi bir sorunuz olursa bizimle iletişime geçmekten çekinmeyin.</p>
        
        <p style="margin-top: 30px;">
          Saygılarımızla,<br>
          <strong>Trakya Solar Ekibi</strong>
        </p>
        
        <div style="border-top: 1px solid #e5e7eb; margin-top: 30px; padding-top: 20px; color: #6b7280; font-size: 14px;">
          <p>Bu email otomatik olarak gönderilmiştir. Lütfen yanıtlamayın.</p>
        </div>
      </div>
    `

    await sendEmail({
      to: customer.email,
      subject: `Teklif Hatırlatması - ${quote.quoteNumber}`,
      html: emailContent
    })

    // Hatırlatma kaydını veritabanına ekle
    await prisma.quoteReminder.create({
      data: {
        quoteId,
        sentAt: now,
        reminderType: 'EMAIL'
      }
    })

    return NextResponse.json({
      message: 'Reminder sent successfully',
      sentAt: now.toISOString()
    })

  } catch (error) {
    console.error('Error sending reminder:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}