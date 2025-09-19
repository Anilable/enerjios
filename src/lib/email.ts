  import { Resend } from 'resend'
import { generateFileToken } from '@/app/api/files/[token]/route'

  // Initialize Resend with proper error handling
  const resend = new Resend(process.env.RESEND_API_KEY)

  export interface PhotoRequestEmailData {
    customerName: string
    customerEmail: string
    engineerName: string
    engineerTitle: string
    message: string
    guidelines: string
    uploadUrl: string
    expiryDays: number
    token: string
  }

  interface ProductFile {
    url: string
    type: 'image' | 'datasheet' | 'manual'
    filename: string
    token?: string
  }

  interface QuoteProduct {
    id: string
    name: string
    brand: string
    quantity: number
    unitPrice: number
    files: ProductFile[]
  }

  export interface QuoteEmailData {
    customerName: string
    customerEmail: string
    quoteNumber: string
    projectTitle: string
    totalAmount: number
    validUntil: Date
    quoteViewUrl: string
    pdfUrl?: string
    companyName: string
    engineerName: string
    engineerTitle?: string
    deliveryToken: string
    systemDetails: {
      capacity: number
      panelCount: number
      estimatedProduction: number
      paybackPeriod: number
    }
    products?: QuoteProduct[]
  }

  export class EmailService {
    private static validateConfig() {
      if (!process.env.RESEND_API_KEY) {
        throw new Error('RESEND_API_KEY environment variable is required')
      }
      
      if (!process.env.FROM_EMAIL) {
        throw new Error('FROM_EMAIL environment variable is required')
      }
      
      if (!process.env.COMPANY_NAME) {
        console.warn('COMPANY_NAME environment variable not set, using default')
      }
    }

    private static getFromEmail(): string {
      const companyName = process.env.COMPANY_NAME || 'EnerjiOS'
      const fromEmail = process.env.FROM_EMAIL!
      return `${companyName} <${fromEmail}>`
    }

    static async sendQuoteDelivery(data: QuoteEmailData): Promise<{ success: boolean; error?: string; messageId?: string }> {
      try {
        this.validateConfig()
        
        console.log('📧 Attempting to send quote delivery email...')
        console.log('To:', data.customerEmail)
        console.log('Quote:', data.quoteNumber)
        console.log('Token:', data.deliveryToken)
        
        const result = await resend.emails.send({
          from: this.getFromEmail(),
          to: data.customerEmail,
          subject: `${data.companyName} - Güneş Enerji Sistemi Teklifiz: ${data.quoteNumber}`,
          html: this.generateQuoteDeliveryHTML(data),
          text: this.generateQuoteDeliveryText(data)
        })

        console.log('✅ Quote email sent successfully:', result)
        return { 
          success: true, 
          messageId: result.data?.id 
        }

      } catch (error) {
        console.error('❌ Quote email sending failed:', error)
        
        let errorMessage = 'Unknown email error'
        if (error instanceof Error) {
          errorMessage = error.message
        }
        
        return { 
          success: false, 
          error: errorMessage 
        }
      }
    }

    static async sendQuoteStatusUpdate(
      data: QuoteEmailData, 
      status: 'APPROVED' | 'REJECTED' | 'EXPIRED',
      customerComments?: string
    ): Promise<{ success: boolean; error?: string; messageId?: string }> {
      try {
        this.validateConfig()
        
        const statusMessages = {
          APPROVED: 'Teklifiniz Onaylandı! 🎉',
          REJECTED: 'Teklif Durum Güncellemesi',
          EXPIRED: 'Teklif Süresi Doldu ⏰'
        }
        
        const result = await resend.emails.send({
          from: this.getFromEmail(),
          to: data.customerEmail,
          subject: `${data.companyName} - ${statusMessages[status]}`,
          html: this.generateQuoteStatusHTML(data, status, customerComments),
          text: this.generateQuoteStatusText(data, status, customerComments)
        })

        return { 
          success: true, 
          messageId: result.data?.id 
        }

      } catch (error) {
        console.error('❌ Quote status email sending failed:', error)
        return { 
          success: false, 
          error: error instanceof Error ? error.message : 'Unknown error' 
        }
      }
    }

    static async sendPhotoRequest(data: PhotoRequestEmailData): Promise<{ success: boolean; error?: string; messageId?: string }> {
      try {
        this.validateConfig()
        
        console.log('📧 Attempting to send photo request email...')
        console.log('To:', data.customerEmail)
        console.log('From:', this.getFromEmail())
        console.log('Token:', data.token)
        console.log('Upload URL:', data.uploadUrl)
        
        const result = await resend.emails.send({
          from: this.getFromEmail(),
          to: data.customerEmail,
          subject: 'EnerjiOS - Fotoğraf Talebi',
          html: this.generatePhotoRequestHTML(data),
          text: this.generatePhotoRequestText(data)
        })

        console.log('✅ Email sent successfully:', result)
        return { 
          success: true, 
          messageId: result.data?.id 
        }

      } catch (error) {
        console.error('❌ Email sending failed:', error)
        
        let errorMessage = 'Unknown email error'
        if (error instanceof Error) {
          errorMessage = error.message
        }
        
        // Log specific Resend API errors
        if (error && typeof error === 'object' && 'message' in error) {
          console.error('Resend API Error Details:', error)
        }
        
        return { 
          success: false, 
          error: errorMessage 
        }
      }
    }

    private static generatePhotoRequestHTML(data: PhotoRequestEmailData): string {
      return `
        <!DOCTYPE html>
        <html lang="tr">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>EnerjiOS - Fotoğraf Talebi</title>
        </head>
        <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f8fafc;">
          <div style="max-width: 600px; margin: 0 auto; background-color: white; box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);">
            <!-- Header -->
            <div style="background: linear-gradient(135deg, #1e40af, #3b82f6); color: white; padding: 30px 20px; text-align: center;">
              <h1 style="margin: 0; font-size: 28px; font-weight: bold;">🌞 ${process.env.COMPANY_NAME || 'EnerjiOS'}</h1>
              <p style="margin: 10px 0 0 0; opacity: 0.9; font-size: 16px;">Güneş Enerjisi Projeniz İçin Fotoğraf Talebi</p>
            </div>
            
            <!-- Main Content -->
            <div style="padding: 40px 30px;">
              <!-- Greeting -->
              <div style="margin-bottom: 30px;">
                <h2 style="margin: 0 0 15px 0; color: #1f2937; font-size: 20px;">Merhaba ${data.customerName},</h2>
                <div style="line-height: 1.8; color: #374151; font-size: 16px; white-space: pre-line;">
  ${data.message}
                </div>
              </div>
              
              <!-- Call to Action -->
              <div style="text-align: center; margin: 40px 0;">
                <div style="background: #f0fdf4; border: 2px dashed #16a34a; border-radius: 12px; padding: 20px; margin-bottom: 20px;">
                  <p style="margin: 0 0 15px 0; color: #166534; font-weight: bold; font-size: 18px;">📷 Fotoğraflarınızı Yükleyin</p>
                  <a href="${data.uploadUrl}" 
                    style="background: linear-gradient(135deg, #16a34a, #22c55e); 
                            color: white; 
                            padding: 16px 32px; 
                            text-decoration: none; 
                            border-radius: 8px; 
                            font-weight: bold; 
                            font-size: 16px;
                            display: inline-block;
                            box-shadow: 0 4px 12px rgba(34, 197, 94, 0.3);
                            transition: transform 0.2s;">
                    🚀 Fotoğraf Yükleme Sayfasına Git
                  </a>
                </div>
                <p style="color: #6b7280; font-size: 14px; margin: 10px 0;">
                  Bu link <strong>${data.expiryDays} gün</strong> boyunca geçerlidir. Lütfen en kısa sürede fotoğraflarınızı yükleyin.
                </p>
              </div>
              
              <!-- Guidelines -->
              <div style="background: #f8fafc; border-left: 4px solid #3b82f6; padding: 25px; border-radius: 0 8px 8px 0; margin: 30px 0;">
                <h3 style="margin: 0 0 15px 0; color: #1f2937; font-size: 18px; display: flex; align-items: center;">
                  📋 Fotoğraf Çekim Rehberi
                </h3>
                <div style="line-height: 1.8; color: #374151; font-size: 15px; white-space: pre-line;">
  ${data.guidelines}
                </div>
              </div>
              
              <!-- Engineer Info -->
              <div style="background: linear-gradient(135deg, #f0f9ff, #e0f2fe); border-radius: 12px; padding: 25px; margin: 30px 0;">
                <h3 style="margin: 0 0 15px 0; color: #0f172a; font-size: 18px;">👨‍💼 İletişim</h3>
                <p style="margin: 5px 0; color: #374151; font-size: 16px;">
                  <strong>${data.engineerName}</strong><br>
                  <span style="color: #6b7280;">${data.engineerTitle}</span><br>
                  <span style="color: #3b82f6; font-weight: 500;">${process.env.COMPANY_NAME || 'EnerjiOS'}</span>
                </p>
              </div>
              
              <!-- Security Note -->
              <div style="background: #fffbeb; border: 1px solid #fbbf24; border-radius: 8px; padding: 20px; margin: 25px 0;">
                <p style="margin: 0; color: #92400e; font-size: 14px;">
                  🔒 <strong>Güvenlik:</strong> Bu e-posta sadece size gönderilmiştir. Link'i başkalarıyla paylaşmayın.
                </p>
              </div>
            </div>
            
            <!-- Footer -->
            <div style="background: #f8fafc; border-top: 1px solid #e5e7eb; padding: 25px; text-align: center;">
              <p style="margin: 0 0 10px 0; color: #6b7280; font-size: 14px;">
                Bu e-posta ${process.env.COMPANY_NAME || 'EnerjiOS'} tarafından gönderilmiştir.
              </p>
              <p style="margin: 0; color: #9ca3af; font-size: 12px;">
                Güneş Enerjisi Çözümleri | Token: ${data.token.substring(0, 8)}...
              </p>
            </div>
          </div>
        </body>
        </html>
      `
    }

    private static generatePhotoRequestText(data: PhotoRequestEmailData): string {
      return `
  EnerjiOS - Fotoğraf Talebi

  Merhaba ${data.customerName},

  ${data.message}

  FOTOĞRAF YÜKLEME LİNKİ:
  ${data.uploadUrl}

  FOTOĞRAF REHBERİ:
  ${data.guidelines}

  İLETİŞİM:
  ${data.engineerName} - ${data.engineerTitle}
  ${process.env.COMPANY_NAME || 'EnerjiOS'}

  Bu link ${data.expiryDays} gün boyunca geçerlidir.

  Token: ${data.token}
      `.trim()
    }

    static async testEmailService(): Promise<{ success: boolean; error?: string }> {
      try {
        this.validateConfig()
        
        console.log('🧪 Testing email service configuration...')
        console.log('RESEND_API_KEY:', process.env.RESEND_API_KEY ? '✅ Set' : '❌ Not set')
        console.log('FROM_EMAIL:', process.env.FROM_EMAIL || '❌ Not set')
        console.log('COMPANY_NAME:', process.env.COMPANY_NAME || '⚠️ Using default')
        
        // Test with a simple email send (commented out to avoid sending test emails)
        /*
        const result = await resend.emails.send({
          from: this.getFromEmail(),
          to: 'test@example.com',
          subject: 'EnerjiOS - Email Service Test',
          text: 'This is a test email from EnerjiOS email service.'
        })
        */
        
        return { success: true }
      } catch (error) {
        console.error('❌ Email service test failed:', error)
        return { 
          success: false, 
          error: error instanceof Error ? error.message : 'Unknown error' 
        }
      }
    }

    private static generateQuoteDeliveryHTML(data: QuoteEmailData): string {
      const validUntilDate = data.validUntil.toLocaleDateString('tr-TR', {
        day: '2-digit',
        month: 'long',
        year: 'numeric'
      })

      return `
        <!DOCTYPE html>
        <html lang="tr">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>${data.companyName} - Güneş Enerji Sistemi Teklifi</title>
        </head>
        <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f8fafc;">
          <div style="max-width: 600px; margin: 0 auto; background-color: white; box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);">
            <!-- Header -->
            <div style="background: linear-gradient(135deg, #f59e0b, #eab308); color: white; padding: 30px 20px; text-align: center;">
              <h1 style="margin: 0; font-size: 28px; font-weight: bold;">☀️ ${data.companyName}</h1>
              <p style="margin: 10px 0 0 0; opacity: 0.9; font-size: 18px;">Güneş Enerji Sistemi Teklifiniz Hazır!</p>
            </div>
            
            <!-- Main Content -->
            <div style="padding: 40px 30px;">
              <!-- Greeting -->
              <div style="margin-bottom: 30px;">
                <h2 style="margin: 0 0 15px 0; color: #1f2937; font-size: 20px;">Sayın ${data.customerName},</h2>
                <p style="line-height: 1.8; color: #374151; font-size: 16px; margin: 0;">
                  ${data.projectTitle} projeniz için hazırlanan teklifimiz aşağıdaki linkten inceleyebilirsiniz.
                  Teklifimizi detaylı olarak görüntüleyebilir, onaylayabilir veya sorularınızı iletebilirsiniz.
                </p>
              </div>
              
              <!-- System Overview -->
              <div style="background: linear-gradient(135deg, #fef3c7, #fde68a); border-radius: 12px; padding: 25px; margin: 30px 0;">
                <h3 style="margin: 0 0 20px 0; color: #92400e; font-size: 18px; text-align: center;">🏠 Sistem Özellikleri</h3>
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
                  <div style="text-align: center; background: rgba(255,255,255,0.7); padding: 15px; border-radius: 8px;">
                    <div style="font-size: 24px; font-weight: bold; color: #f59e0b;">${data.systemDetails.capacity} kW</div>
                    <div style="font-size: 12px; color: #92400e;">Sistem Gücü</div>
                  </div>
                  <div style="text-align: center; background: rgba(255,255,255,0.7); padding: 15px; border-radius: 8px;">
                    <div style="font-size: 24px; font-weight: bold; color: #3b82f6;">${data.systemDetails.panelCount} Adet</div>
                    <div style="font-size: 12px; color: #92400e;">Güneş Paneli</div>
                  </div>
                  <div style="text-align: center; background: rgba(255,255,255,0.7); padding: 15px; border-radius: 8px;">
                    <div style="font-size: 18px; font-weight: bold; color: #10b981;">${data.systemDetails.estimatedProduction.toLocaleString()} kWh</div>
                    <div style="font-size: 12px; color: #92400e;">Yıllık Üretim</div>
                  </div>
                  <div style="text-align: center; background: rgba(255,255,255,0.7); padding: 15px; border-radius: 8px;">
                    <div style="font-size: 18px; font-weight: bold; color: #8b5cf6;">${data.systemDetails.paybackPeriod} Yıl</div>
                    <div style="font-size: 12px; color: #92400e;">Geri Ödeme</div>
                  </div>
                </div>
              </div>
              
              <!-- Price -->
              <div style="background: #f0fdf4; border: 2px solid #22c55e; border-radius: 12px; padding: 25px; margin: 30px 0; text-align: center;">
                <h3 style="margin: 0 0 10px 0; color: #166534; font-size: 16px;">💰 Toplam Yatırım</h3>
                <div style="font-size: 32px; font-weight: bold; color: #15803d; margin: 10px 0;">
                  ${data.totalAmount.toLocaleString('tr-TR')} ₺
                </div>
                <p style="margin: 10px 0 0 0; color: #166534; font-size: 14px;">KDV Dahil • 25 Yıl Garanti</p>
              </div>
              
              <!-- Call to Action -->
              <div style="text-align: center; margin: 40px 0;">
                <div style="margin-bottom: 20px;">
                  <a href="${data.quoteViewUrl}" 
                    style="background: linear-gradient(135deg, #f59e0b, #eab308); 
                            color: white; 
                            padding: 18px 36px; 
                            text-decoration: none; 
                            border-radius: 10px; 
                            font-weight: bold; 
                            font-size: 18px;
                            display: inline-block;
                            box-shadow: 0 6px 20px rgba(245, 158, 11, 0.3);
                            transition: transform 0.2s;">
                    🔍 Teklifi İncele ve Onayla
                  </a>
                </div>
                <p style="color: #6b7280; font-size: 14px; margin: 15px 0 0 0;">
                  <strong>Teklif No:</strong> ${data.quoteNumber} • 
                  <strong>Geçerlilik:</strong> ${validUntilDate} tarihine kadar
                </p>
              </div>
              
              ${this.generateProductsSection(data)}

              <!-- Features -->
              <div style="background: #f8fafc; border-left: 4px solid #3b82f6; padding: 25px; border-radius: 0 8px 8px 0; margin: 30px 0;">
                <h3 style="margin: 0 0 15px 0; color: #1f2937; font-size: 18px;">✨ Teklifimize Dahil Olanlar</h3>
                <ul style="margin: 0; padding-left: 20px; color: #374151; line-height: 1.8;">
                  <li>Yüksek verimli güneş panelleri</li>
                  <li>Premium kalite inverter sistemi</li>
                  <li>Tüm montaj malzemeleri ve işçilik</li>
                  <li>Elektrik bağlantısı ve devreye alma</li>
                  <li>25 yıl panel performans garantisi</li>
                  <li>10 yıl inverter garantisi</li>
                  <li>Ücretsiz teknik destek</li>
                </ul>
              </div>
              
              <!-- Contact -->
              <div style="background: linear-gradient(135deg, #eff6ff, #dbeafe); border-radius: 12px; padding: 25px; margin: 30px 0;">
                <h3 style="margin: 0 0 15px 0; color: #1e40af; font-size: 18px;">👨‍💼 İletişim</h3>
                <p style="margin: 5px 0; color: #374151; font-size: 16px;">
                  <strong>${data.engineerName}</strong><br>
                  ${data.engineerTitle || 'Proje Uzmanı'}<br>
                  <span style="color: #3b82f6; font-weight: 500;">${data.companyName}</span>
                </p>
                <p style="margin: 15px 0 0 0; color: #6b7280; font-size: 14px;">
                  Herhangi bir sorunuz varsa bize ulaşabilirsiniz.
                </p>
              </div>
            </div>
            
            <!-- Footer -->
            <div style="background: #f8fafc; border-top: 1px solid #e5e7eb; padding: 25px; text-align: center;">
              <p style="margin: 0 0 10px 0; color: #6b7280; font-size: 14px;">
                Bu teklif ${data.companyName} tarafından hazırlanmıştır.
              </p>
              <p style="margin: 0; color: #9ca3af; font-size: 12px;">
                Güneş Enerjisi ile Geleceğe | Token: ${data.deliveryToken.substring(0, 8)}...
              </p>
            </div>
          </div>
        </body>
        </html>
      `
    }

    private static generateQuoteDeliveryText(data: QuoteEmailData): string {
      return `
  ${data.companyName} - Güneş Enerji Sistemi Teklifi

  Sayın ${data.customerName},

  ${data.projectTitle} projeniz için hazırlanan teklifimiz hazır.

  SİSTEM ÖZELLİKLERİ:
  • Sistem Gücü: ${data.systemDetails.capacity} kW
  • Panel Sayısı: ${data.systemDetails.panelCount} adet
  • Yıllık Üretim: ${data.systemDetails.estimatedProduction.toLocaleString()} kWh
  • Geri Ödeme Süresi: ${data.systemDetails.paybackPeriod} yıl

  TOPLAM YATIRIM: ${data.totalAmount.toLocaleString('tr-TR')} ₺ (KDV Dahil)

  ${data.products && data.products.length > 0 ? `
  ÜRÜN DOSYALARI:
  Teklifimizde yer alan ürünlerin görselleri ve teknik dökümanları e-posta içeriğinde yer almaktadır.
  ` : ''}

  TEKLİF İNCELEME LİNKİ:
  ${data.quoteViewUrl}

  Teklif No: ${data.quoteNumber}
  Geçerlilik: ${data.validUntil.toLocaleDateString('tr-TR')} tarihine kadar

  İLETİŞİM:
  ${data.engineerName} - ${data.engineerTitle || 'Proje Uzmanı'}
  ${data.companyName}

  Token: ${data.deliveryToken}
      `.trim()
    }

    private static generateQuoteStatusHTML(
      data: QuoteEmailData, 
      status: 'APPROVED' | 'REJECTED' | 'EXPIRED',
      customerComments?: string
    ): string {
      const statusInfo = {
        APPROVED: {
          title: 'Teklifiniz Onaylandı! 🎉',
          color: '#22c55e',
          bgColor: '#f0fdf4',
          message: 'Güneş enerji sistemi teklifinizi onayladığınız için teşekkür ederiz! En kısa sürede sizinle iletişime geçeceğiz.',
          nextSteps: 'Sırada neler var:\n• Sözleşme hazırlığı\n• Kurulum tarihi planlama\n• Teknik keşif randevusu\n• Proje uygulama süreci'
        },
        REJECTED: {
          title: 'Teklif Durumu Güncellemesi',
          color: '#ef4444',
          bgColor: '#fef2f2',
          message: 'Teklifinizle ilgili kararınızı aldığınız için teşekkür ederiz. Geri bildirimleriniz bizim için değerli.',
          nextSteps: 'Gelecekte yeni teklifler hazırlayabiliriz:\n• Revize teklif talebi\n• Farklı sistem seçenekleri\n• Finansman alternatifleri'
        },
        EXPIRED: {
          title: 'Teklif Süresi Doldu ⏰',
          color: '#f59e0b',
          bgColor: '#fffbeb',
          message: 'Teklifinizin geçerlilik süresi dolmuştur. Yeni bir teklif hazırlamak için bizimle iletişime geçebilirsiniz.',
          nextSteps: 'Yeni teklif için:\n• Güncel fiyatlarla yeni teklif\n• Sistem yapılandırması incelemesi\n• Yeni geçerlilik tarihi'
        }
      }

      const info = statusInfo[status]

      return `
        <!DOCTYPE html>
        <html lang="tr">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>${data.companyName} - ${info.title}</title>
        </head>
        <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f8fafc;">
          <div style="max-width: 600px; margin: 0 auto; background-color: white; box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);">
            <!-- Header -->
            <div style="background: ${info.color}; color: white; padding: 30px 20px; text-align: center;">
              <h1 style="margin: 0; font-size: 24px; font-weight: bold;">${info.title}</h1>
              <p style="margin: 10px 0 0 0; opacity: 0.9; font-size: 16px;">Teklif: ${data.quoteNumber}</p>
            </div>
            
            <!-- Main Content -->
            <div style="padding: 40px 30px;">
              <div style="margin-bottom: 30px;">
                <h2 style="margin: 0 0 15px 0; color: #1f2937; font-size: 18px;">Sayın ${data.customerName},</h2>
                <p style="line-height: 1.8; color: #374151; font-size: 16px; margin: 0 0 20px 0;">
                  ${info.message}
                </p>
              </div>
              
              <!-- Status Details -->
              <div style="background: ${info.bgColor}; border-left: 4px solid ${info.color}; padding: 25px; border-radius: 0 8px 8px 0; margin: 30px 0;">
                <h3 style="margin: 0 0 15px 0; color: #1f2937; font-size: 18px;">📋 ${info.title}</h3>
                <div style="line-height: 1.8; color: #374151; font-size: 15px; white-space: pre-line;">
  ${info.nextSteps}
                </div>
              </div>
              
              ${customerComments ? `
              <!-- Customer Comments -->
              <div style="background: #f8fafc; border: 1px solid #e5e7eb; border-radius: 8px; padding: 20px; margin: 25px 0;">
                <h4 style="margin: 0 0 10px 0; color: #1f2937; font-size: 16px;">💬 Yorumunuz:</h4>
                <p style="margin: 0; color: #374151; font-style: italic; line-height: 1.6;">
                  "${customerComments}"
                </p>
              </div>
              ` : ''}
              
              <!-- Contact -->
              <div style="background: linear-gradient(135deg, #eff6ff, #dbeafe); border-radius: 12px; padding: 25px; margin: 30px 0; text-align: center;">
                <h3 style="margin: 0 0 15px 0; color: #1e40af; font-size: 18px;">📞 İletişim</h3>
                <p style="margin: 0; color: #374151; font-size: 16px;">
                  <strong>${data.engineerName}</strong><br>
                  ${data.engineerTitle || 'Proje Uzmanı'}<br>
                  <span style="color: #3b82f6; font-weight: 500;">${data.companyName}</span>
                </p>
              </div>
            </div>
            
            <!-- Footer -->
            <div style="background: #f8fafc; border-top: 1px solid #e5e7eb; padding: 25px; text-align: center;">
              <p style="margin: 0 0 10px 0; color: #6b7280; font-size: 14px;">
                ${data.companyName} - Güneş Enerjisi Çözümleri
              </p>
              <p style="margin: 0; color: #9ca3af; font-size: 12px;">
                Bu bilgilendirme ${new Date().toLocaleDateString('tr-TR')} tarihinde gönderilmiştir.
              </p>
            </div>
          </div>
        </body>
        </html>
      `
    }

    private static generateQuoteStatusText(
      data: QuoteEmailData,
      status: 'APPROVED' | 'REJECTED' | 'EXPIRED',
      customerComments?: string
    ): string {
      const statusMessages = {
        APPROVED: 'TEKLİF ONAYLANDI!',
        REJECTED: 'TEKLİF DURUM GÜNCELLEMESİ',
        EXPIRED: 'TEKLİF SÜRESİ DOLDU'
      }

      return `
  ${data.companyName} - ${statusMessages[status]}

  Sayın ${data.customerName},

  Teklif: ${data.quoteNumber}
  Durum: ${statusMessages[status]}
  Tarih: ${new Date().toLocaleDateString('tr-TR')}

  ${customerComments ? `YORUMUNUZ:\n"${customerComments}"\n\n` : ''}

  İLETİŞİM:
  ${data.engineerName} - ${data.engineerTitle || 'Proje Uzmanı'}
  ${data.companyName}

  Token: ${data.deliveryToken}
      `.trim()
    }

    private static generateProductsSection(data: QuoteEmailData): string {
      if (!data.products || data.products.length === 0) {
        return ''
      }

      const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3002'

      const productsWithFiles = data.products.filter(product =>
        product.files && product.files.length > 0
      )

      if (productsWithFiles.length === 0) {
        return ''
      }

      return `
              <!-- Product Files Section -->
              <div style="background: linear-gradient(135deg, #fef3e2 0%, #fef7ed 100%); border-left: 5px solid #f59e0b; padding: 30px; border-radius: 12px; margin: 30px 0; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);">
                <div style="text-align: center; margin-bottom: 25px;">
                  <div style="display: inline-block; background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); color: white; padding: 12px 20px; border-radius: 25px; font-weight: bold; font-size: 16px; margin-bottom: 10px; box-shadow: 0 2px 4px rgba(245, 158, 11, 0.3);">
                    🎯 Ürün Detayları ve Dökümanlar
                  </div>
                  <p style="margin: 0; color: #78716c; font-size: 14px; line-height: 1.5;">Teklifimizde yer alan ürünlerin görselleri ve teknik dökümanları</p>
                </div>

                <div style="display: grid; gap: 20px;">
                  ${productsWithFiles.map(product => {
                    const images = product.files.filter(f => f.type === 'image')
                    const datasheets = product.files.filter(f => f.type === 'datasheet')
                    const manuals = product.files.filter(f => f.type === 'manual')

                    return `
                    <div style="background: white; border-radius: 16px; padding: 25px; margin: 10px 0; box-shadow: 0 8px 25px rgba(0, 0, 0, 0.08); border: 1px solid #f3f4f6; transition: all 0.3s ease;">
                      <!-- Product Header -->
                      <div style="border-bottom: 2px solid #f3f4f6; padding-bottom: 20px; margin-bottom: 20px;">
                        <h3 style="margin: 0 0 8px 0; color: #1f2937; font-size: 20px; font-weight: 700; line-height: 1.3;">
                          ${product.brand} ${product.name}
                        </h3>
                        <div style="background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); color: white; padding: 8px 16px; border-radius: 20px; display: inline-block; font-size: 14px; font-weight: 600;">
                          ${product.quantity} adet × ${product.unitPrice.toLocaleString('tr-TR')} ₺ = ${(product.quantity * product.unitPrice).toLocaleString('tr-TR')} ₺
                        </div>
                      </div>

                      ${images.length > 0 ? `
                      <div style="margin-bottom: 20px;">
                        <div style="display: flex; align-items: center; margin-bottom: 15px;">
                          <div style="background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%); color: white; padding: 6px 12px; border-radius: 15px; font-size: 13px; font-weight: 600;">
                            📸 Ürün Görselleri
                          </div>
                        </div>
                        <div style="display: flex; gap: 15px; flex-wrap: wrap; align-items: center;">
                          ${images.slice(0, 3).map(image => {
                            const token = generateFileToken(image.url, 720)
                            return `<div style="position: relative; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15); border: 3px solid #f3f4f6;">
                              <img src="${baseUrl}/api/files/${token}" alt="${product.name}" style="width: 120px; height: 120px; object-fit: cover; display: block;" />
                            </div>`
                          }).join('')}
                          ${images.length > 3 ? `
                          <div style="width: 120px; height: 120px; background: linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%); border: 2px dashed #d1d5db; border-radius: 12px; display: flex; align-items: center; justify-content: center; color: #6b7280; font-size: 14px; font-weight: 600;">
                            +${images.length - 3} daha
                          </div>
                          ` : ''}
                        </div>
                      </div>
                      ` : ''}

                      <div style="display: flex; gap: 12px; flex-wrap: wrap; justify-content: flex-start;">
                        ${datasheets.length > 0 ? `
                        <a href="${baseUrl}/api/files/${generateFileToken(datasheets[0].url, 720)}"
                           style="display: inline-flex; align-items: center; background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%); color: white; padding: 12px 20px; text-decoration: none; border-radius: 25px; font-size: 14px; font-weight: 600; box-shadow: 0 4px 12px rgba(220, 38, 38, 0.3); transition: all 0.3s ease;">
                          <span style="margin-right: 8px; font-size: 16px;">📋</span>
                          Teknik Döküman İndir
                        </a>
                        ` : ''}
                        ${manuals.length > 0 ? `
                        <a href="${baseUrl}/api/files/${generateFileToken(manuals[0].url, 720)}"
                           style="display: inline-flex; align-items: center; background: linear-gradient(135deg, #059669 0%, #047857 100%); color: white; padding: 12px 20px; text-decoration: none; border-radius: 25px; font-size: 14px; font-weight: 600; box-shadow: 0 4px 12px rgba(5, 150, 105, 0.3); transition: all 0.3s ease;">
                          <span style="margin-right: 8px; font-size: 16px;">📖</span>
                          Kullanım Kılavuzu İndir
                        </a>
                        ` : ''}
                      </div>
                    </div>
                    `
                  }).join('')}
                </div>

                <!-- Security Notice -->
                <div style="background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%); border: 2px solid #f59e0b; border-radius: 12px; padding: 20px; margin-top: 25px; text-align: center;">
                  <div style="color: #92400e; font-size: 16px; margin-bottom: 5px;">🔐</div>
                  <p style="margin: 0; color: #92400e; font-size: 14px; font-weight: 600; line-height: 1.5;">
                    <strong>Güvenlik Bildirimi:</strong> Döküman indirme linkleri 30 gün boyunca geçerlidir. Güvenliğiniz için linkleri başkalarıyla paylaşmayın.
                  </p>
                </div>
              </div>
              `
    }
  }