import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'
import { z } from 'zod'

// Initialize Resend with fallback for development
const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null

// Email templates
const emailTemplates = {
  projectStatusUpdate: (data: any) => ({
    subject: `Proje Güncelleme: ${data.projectName}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
          <h2 style="color: #2563eb; margin: 0;">🔄 Proje Durumu Güncellendi</h2>
        </div>
        
        <div style="padding: 20px; background: white; border-radius: 8px; border: 1px solid #e5e7eb;">
          <h3 style="margin-top: 0;">${data.projectName}</h3>
          <p><strong>Yeni Durum:</strong> ${data.status}</p>
          <p><strong>İlerleme:</strong> %${data.progress}</p>
          ${data.message ? `<p><strong>Mesaj:</strong> ${data.message}</p>` : ''}
          
          <div style="margin: 20px 0; padding: 15px; background: #f3f4f6; border-radius: 6px;">
            <p style="margin: 0;"><strong>Proje Detayları:</strong></p>
            <p style="margin: 5px 0;">Sistem Kapasitesi: ${data.systemSize} kW</p>
            <p style="margin: 5px 0;">Lokasyon: ${data.location}</p>
            ${data.nextStep ? `<p style="margin: 5px 0;">Sonraki Adım: ${data.nextStep}</p>` : ''}
          </div>
          
          <div style="text-align: center; margin: 20px 0;">
            <a href="${data.projectUrl}" style="background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
              Projeyi Görüntüle
            </a>
          </div>
        </div>
        
        <div style="text-align: center; margin: 20px 0; color: #6b7280; font-size: 14px;">
          <p>Bu email EnerjiOS sistemi tarafından otomatik olarak gönderilmiştir.</p>
          <p>© 2024 EnerjiOS. Tüm hakları saklıdır.</p>
        </div>
      </div>
    `
  }),

  customerWelcome: (data: any) => ({
    subject: `EnerjiOS'a Hoş Geldiniz, ${data.customerName}!`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%); padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 28px;">🌞 EnerjiOS</h1>
          <p style="color: #e0e7ff; margin: 10px 0 0 0;">Güneş enerjisi ile geleceği inşa ediyoruz</p>
        </div>
        
        <div style="padding: 30px; background: white; border-radius: 0 0 8px 8px; border: 1px solid #e5e7eb;">
          <h2 style="color: #1f2937; margin: 0 0 20px 0;">Merhaba ${data.customerName},</h2>
          
          <p>EnerjiOS ailesine hoş geldiniz! Güneş enerjisi yolculuğunuzda size rehberlik etmekten mutluluk duyacağız.</p>
          
          <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin: 0 0 15px 0; color: #2563eb;">✨ Size Özel Hizmetlerimiz</h3>
            <ul style="margin: 0; padding-left: 20px;">
              <li style="margin: 8px 0;">Ücretsiz saha incelemesi ve sistem tasarımı</li>
              <li style="margin: 8px 0;">7/24 sistem izleme ve performans raporları</li>
              <li style="margin: 8px 0;">25 yıl garanti ve teknik destek</li>
              <li style="margin: 8px 0;">Mobil uygulama ile anlık takip</li>
            </ul>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${data.dashboardUrl}" style="background: #2563eb; color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: bold;">
              Panelinize Giriş Yapın
            </a>
          </div>
          
          <div style="border-top: 1px solid #e5e7eb; padding-top: 20px; margin-top: 30px;">
            <p><strong>İletişim Bilgileriniz:</strong></p>
            <p>📧 Email: ${data.email}</p>
            <p>📱 Telefon: ${data.phone}</p>
            ${data.projectAssignee ? `<p>👤 Proje Sorumlusu: ${data.projectAssignee}</p>` : ''}
          </div>
        </div>
        
        <div style="text-align: center; margin: 20px 0; color: #6b7280; font-size: 14px;">
          <p>Sorularınız için: info@enerjios.com | +90 XXX XXX XXXX</p>
          <p>© 2024 EnerjiOS. Tüm hakları saklıdır.</p>
        </div>
      </div>
    `
  }),

  invoiceGenerated: (data: any) => ({
    subject: `Faturanız Hazır - ${data.invoiceNumber}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #059669; padding: 20px; border-radius: 8px 8px 0 0; text-align: center;">
          <h2 style="color: white; margin: 0;">📄 Fatura Bildirimi</h2>
        </div>
        
        <div style="padding: 30px; background: white; border-radius: 0 0 8px 8px; border: 1px solid #e5e7eb;">
          <h3>Sayın ${data.customerName},</h3>
          <p>Faturanız hazırlanmış ve sistemde yer almıştır.</p>
          
          <div style="background: #f0fdf4; border-left: 4px solid #059669; padding: 20px; margin: 20px 0;">
            <h4 style="margin: 0 0 10px 0;">Fatura Detayları</h4>
            <p style="margin: 5px 0;"><strong>Fatura No:</strong> ${data.invoiceNumber}</p>
            <p style="margin: 5px 0;"><strong>Tutar:</strong> ₺${data.amount.toLocaleString()}</p>
            <p style="margin: 5px 0;"><strong>Vade Tarihi:</strong> ${data.dueDate}</p>
            <p style="margin: 5px 0;"><strong>Proje:</strong> ${data.projectName}</p>
          </div>
          
          <div style="text-align: center; margin: 25px 0;">
            <a href="${data.invoiceUrl}" style="background: #059669; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; margin-right: 10px;">
              Faturayı Görüntüle
            </a>
            <a href="${data.paymentUrl}" style="background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
              Ödeme Yap
            </a>
          </div>
          
          <div style="background: #fef3c7; padding: 15px; border-radius: 6px; margin: 20px 0;">
            <p style="margin: 0; font-size: 14px;"><strong>💡 Ödeme Seçenekleri:</strong></p>
            <ul style="margin: 10px 0 0 0; font-size: 14px;">
              <li>Banka havalesi ile ödeme</li>
              <li>Kredi kartı ile online ödeme</li>
              <li>Taksitli ödeme seçenekleri</li>
            </ul>
          </div>
        </div>
        
        <div style="text-align: center; margin: 20px 0; color: #6b7280; font-size: 14px;">
          <p>Bu fatura ile ilgili sorularınız için muhasebe@enerjios.com</p>
        </div>
      </div>
    `
  }),

  maintenanceReminder: (data: any) => ({
    subject: `Bakım Hatırlatması - ${data.projectName}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #f59e0b; padding: 20px; border-radius: 8px 8px 0 0; text-align: center;">
          <h2 style="color: white; margin: 0;">🔧 Bakım Hatırlatması</h2>
        </div>
        
        <div style="padding: 30px; background: white; border-radius: 0 0 8px 8px; border: 1px solid #e5e7eb;">
          <h3>Sayın ${data.customerName},</h3>
          <p>Solar sisteminiz için bakım zamanı geldi.</p>
          
          <div style="background: #fffbeb; border-left: 4px solid #f59e0b; padding: 20px; margin: 20px 0;">
            <h4 style="margin: 0 0 10px 0;">Bakım Detayları</h4>
            <p style="margin: 5px 0;"><strong>Sistem:</strong> ${data.projectName}</p>
            <p style="margin: 5px 0;"><strong>Son Bakım:</strong> ${data.lastMaintenance}</p>
            <p style="margin: 5px 0;"><strong>Önerilen Tarih:</strong> ${data.suggestedDate}</p>
            <p style="margin: 5px 0;"><strong>Bakım Türü:</strong> ${data.maintenanceType}</p>
          </div>
          
          ${data.performanceIssues ? `
          <div style="background: #fee2e2; border-left: 4px solid #ef4444; padding: 15px; margin: 20px 0;">
            <p style="margin: 0; color: #dc2626;"><strong>⚠️ Dikkat:</strong></p>
            <p style="margin: 5px 0 0 0; color: #dc2626;">${data.performanceIssues}</p>
          </div>
          ` : ''}
          
          <div style="text-align: center; margin: 25px 0;">
            <a href="${data.scheduleUrl}" style="background: #f59e0b; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
              Bakım Randevusu Al
            </a>
          </div>
        </div>
      </div>
    `
  })
}

const sendEmailSchema = z.object({
  to: z.union([z.string().email(), z.array(z.string().email())]),
  template: z.enum(['projectStatusUpdate', 'customerWelcome', 'invoiceGenerated', 'maintenanceReminder']),
  data: z.record(z.any()),
  from: z.string().email().optional(),
  replyTo: z.string().email().optional()
})

export async function POST(request: NextRequest) {
  try {
    if (!process.env.RESEND_API_KEY) {
      return NextResponse.json(
        { error: 'Resend API key not configured' },
        { status: 500 }
      )
    }

    const body = await request.json()
    const { to, template, data, from, replyTo } = sendEmailSchema.parse(body)

    // Get template
    const templateFunction = emailTemplates[template]
    if (!templateFunction) {
      return NextResponse.json(
        { error: 'Email template not found' },
        { status: 404 }
      )
    }

    const { subject, html } = templateFunction(data)

    // Prepare email data
    const emailData = {
      from: from || 'EnerjiOS <noreply@enerjios.com>',
      to: Array.isArray(to) ? to : [to],
      subject,
      html,
      replyTo
    }

    // Send email (or simulate in development)
    let result
    if (resend) {
      result = await resend.emails.send(emailData)
    } else {
      // Mock response for development
      console.log('Email would be sent:', emailData)
      result = {
        data: { id: `mock_${Date.now()}` },
        error: null
      }
    }

    if (result.error) {
      console.error('Resend API Error:', result.error)
      return NextResponse.json(
        { 
          error: 'Failed to send email',
          details: result.error
        },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      messageId: result.data?.id,
      recipients: emailData.to,
      template,
      sentAt: new Date().toISOString()
    })

  } catch (error) {
    console.error('Email API Error:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          error: 'Invalid request data',
          details: error.errors
        },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { 
        error: 'Failed to send email',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

// GET endpoint for email templates preview
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const template = searchParams.get('template')
    const preview = searchParams.get('preview') === 'true'

    if (!template) {
      // Return available templates
      return NextResponse.json({
        templates: Object.keys(emailTemplates),
        usage: 'Use ?template=templateName&preview=true to preview a template'
      })
    }

    const templateFunction = emailTemplates[template as keyof typeof emailTemplates]
    if (!templateFunction) {
      return NextResponse.json(
        { error: 'Template not found' },
        { status: 404 }
      )
    }

    if (preview) {
      // Return preview with sample data
      const sampleData = {
        projectStatusUpdate: {
          projectName: 'GES Projesi - Örnek Müşteri',
          status: 'Kurulum Tamamlandı',
          progress: 100,
          message: 'Sisteminiz başarıyla kuruldu ve devreye alındı.',
          systemSize: 10.5,
          location: 'İstanbul, Türkiye',
          nextStep: 'İlk aylık performans raporu 30 gün içinde gönderilecektir.',
          projectUrl: 'https://enerjios.com/projects/demo'
        },
        customerWelcome: {
          customerName: 'Mehmet Yılmaz',
          email: 'mehmet@example.com',
          phone: '+90 532 123 4567',
          dashboardUrl: 'https://enerjios.com/dashboard',
          projectAssignee: 'Ahmet Kaya'
        },
        invoiceGenerated: {
          customerName: 'Fatma Demir',
          invoiceNumber: 'INV-2024-001',
          amount: 85000,
          dueDate: '15 Ocak 2025',
          projectName: 'Konut GES Sistemi',
          invoiceUrl: 'https://enerjios.com/invoices/demo',
          paymentUrl: 'https://enerjios.com/payments/demo'
        },
        maintenanceReminder: {
          customerName: 'Ali Özkan',
          projectName: 'Ticari GES Sistemi',
          lastMaintenance: '15 Haziran 2024',
          suggestedDate: '15 Aralık 2024',
          maintenanceType: 'Panel temizliği ve genel kontrol',
          scheduleUrl: 'https://enerjios.com/maintenance/schedule',
          performanceIssues: 'Son haftalarda %5 verim kaybı tespit edildi.'
        }
      }

      const { subject, html } = templateFunction(sampleData[template as keyof typeof sampleData])
      
      return new NextResponse(html, {
        headers: {
          'Content-Type': 'text/html'
        }
      })
    }

    return NextResponse.json({
      template,
      description: 'Email template ready for use'
    })

  } catch (error) {
    console.error('Email Template Preview Error:', error)
    
    return NextResponse.json(
      { 
        error: 'Failed to generate template preview',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}