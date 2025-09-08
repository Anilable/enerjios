import { sendWelcomeEmail, sendQuoteNotification, sendPaymentConfirmation, sendInstallationNotification } from './email'

export type NotificationType = 
  | 'project_created'
  | 'quote_ready'
  | 'quote_approved'
  | 'installation_scheduled'
  | 'installation_completed'
  | 'payment_reminder'
  | 'system_status_update'
  | 'maintenance_reminder'

export interface NotificationRecipient {
  name: string
  email: string
  phone?: string
  language?: 'tr' | 'en'
  preferences?: {
    email: boolean
    sms: boolean
    whatsapp: boolean
    push: boolean
  }
}

export interface NotificationData {
  projectId?: string
  quoteId?: string
  customerId?: string
  customerName?: string
  projectTitle?: string
  systemSize?: number
  estimatedPrice?: number
  installationDate?: string
  completionDate?: string
  paymentAmount?: number
  paymentDueDate?: string
  systemStatus?: string
  energyProduction?: number
  maintenanceDate?: string
  [key: string]: any
}

export interface NotificationTemplate {
  id: string
  type: NotificationType
  channel: 'email' | 'sms' | 'whatsapp' | 'push'
  subject?: string
  title: string
  content: string
  variables: string[]
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface NotificationLog {
  id: string
  type: NotificationType
  channel: 'email' | 'sms' | 'whatsapp' | 'push'
  recipient: NotificationRecipient
  data: NotificationData
  status: 'pending' | 'sent' | 'delivered' | 'failed' | 'bounced'
  sentAt?: string
  deliveredAt?: string
  errorMessage?: string
  createdAt: string
}

class NotificationSystem {
  private templates: Map<string, NotificationTemplate> = new Map()
  private logs: NotificationLog[] = []

  constructor() {
    this.initializeDefaultTemplates()
  }

  private initializeDefaultTemplates() {
    const defaultTemplates: NotificationTemplate[] = [
      {
        id: 'project_created_email',
        type: 'project_created',
        channel: 'email',
        subject: 'Güneş Enerjisi Projeniz Oluşturuldu - {{projectTitle}}',
        title: 'Projeniz Oluşturuldu!',
        content: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #f59e0b;">🌞 Güneş Enerjisi Projeniz Hazır!</h2>
            
            <p>Merhaba <strong>{{customerName}}</strong>,</p>
            
            <p>3D tasarımcıdan oluşturduğunuz güneş enerjisi sistemi projeniz başarıyla oluşturuldu ve teknik ekibimiz tarafından değerlendiriliyor.</p>
            
            <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="margin-top: 0;">📋 Proje Detayları</h3>
              <ul style="list-style: none; padding: 0;">
                <li><strong>Proje ID:</strong> {{projectId}}</li>
                <li><strong>Sistem Gücü:</strong> {{systemSize}} kW</li>
                <li><strong>Tahmini Maliyet:</strong> ₺{{estimatedPrice:format}}</li>
                <li><strong>Oluşturma Tarihi:</strong> {{createdDate}}</li>
              </ul>
            </div>
            
            <p><strong>Sonraki Adımlar:</strong></p>
            <ol>
              <li>Teknik ekibimiz tasarımınızı detaylı olarak inceleyecek</li>
              <li>24-48 saat içinde size detaylı teklif sunulacak</li>
              <li>Teklifin onaylanması sonrası kurulum planlaması yapılacak</li>
            </ol>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="{{dashboardUrl}}" style="background: #f59e0b; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">
                Projenizi Takip Edin
              </a>
            </div>
            
            <p style="font-size: 14px; color: #666;">
              Herhangi bir sorunuz varsa bizimle iletişime geçmekten çekinmeyin.<br>
              Telefon: +90 284 XXX XX XX<br>
              Email: info@enerjios.com
            </p>
            
            <hr style="border: 1px solid #e5e7eb; margin: 30px 0;">
            <p style="font-size: 12px; color: #9ca3af; text-align: center;">
              Bu email otomatik olarak oluşturulmuştur. Lütfen yanıtlamayınız.<br>
              EnerjiOS - Güneş Enerjisi Yönetim Platformu
            </p>
          </div>
        `,
        variables: ['customerName', 'projectId', 'projectTitle', 'systemSize', 'estimatedPrice', 'createdDate', 'dashboardUrl'],
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: 'project_created_sms',
        type: 'project_created',
        channel: 'sms',
        title: 'Proje Oluşturuldu',
        content: 'Merhaba {{customerName}}! {{systemSize}}kW GES projeniz oluşturuldu. Proje ID: {{projectId}}. 24-48 saat içinde detaylı teklifimizi alacaksınız. Takip: enerjios.com/proje/{{projectId}}',
        variables: ['customerName', 'systemSize', 'projectId'],
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: 'quote_ready_email',
        type: 'quote_ready',
        channel: 'email',
        subject: 'Güneş Enerjisi Teklifiniz Hazır - {{projectTitle}}',
        title: 'Teklifiniz Hazır!',
        content: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #10b981;">✅ Teklifiniz Hazır!</h2>
            
            <p>Merhaba <strong>{{customerName}}</strong>,</p>
            
            <p>{{projectTitle}} için hazırladığımız detaylı teklif hazır. Ekibimiz tasarımınızı inceledi ve size özel bir çözüm sunuyor.</p>
            
            <div style="background: #ecfdf5; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #10b981;">
              <h3 style="margin-top: 0; color: #065f46;">💰 Teklif Özeti</h3>
              <ul style="list-style: none; padding: 0;">
                <li><strong>Sistem Gücü:</strong> {{systemSize}} kW</li>
                <li><strong>Toplam Tutar:</strong> <span style="color: #10b981; font-size: 18px;">₺{{quotedPrice:format}}</span></li>
                <li><strong>Tahmini Geri Ödeme:</strong> {{paybackPeriod}} yıl</li>
                <li><strong>25 Yıllık Tasarruf:</strong> ₺{{total25YearSavings:format}}</li>
              </ul>
            </div>
            
            <div style="background: #fef3c7; padding: 15px; border-radius: 6px; margin: 20px 0;">
              <p style="margin: 0;"><strong>🎯 Bu Teklif {{validUntil}} tarihine kadar geçerlidir.</strong></p>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="{{quoteUrl}}" style="background: #10b981; color: white; padding: 15px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; margin-right: 10px;">
                Teklifi Görüntüle
              </a>
              <a href="{{dashboardUrl}}" style="background: #6b7280; color: white; padding: 15px 30px; text-decoration: none; border-radius: 6px; font-weight: bold;">
                Dashboard'a Git
              </a>
            </div>
            
            <p style="font-size: 14px; color: #666;">
              Teklif hakkında detaylı bilgi almak için bizimle iletişime geçin.<br>
              Telefon: +90 284 XXX XX XX | WhatsApp: +90 5XX XXX XX XX
            </p>
          </div>
        `,
        variables: ['customerName', 'projectTitle', 'systemSize', 'quotedPrice', 'paybackPeriod', 'total25YearSavings', 'validUntil', 'quoteUrl', 'dashboardUrl'],
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: 'quote_approved_email',
        type: 'quote_approved',
        channel: 'email',
        subject: 'Tebrikler! Projeniz Onaylandı - {{projectTitle}}',
        title: 'Projeniz Onaylandı!',
        content: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #f59e0b;">🎉 Tebrikler! Projeniz Onaylandı!</h2>
            
            <p>Merhaba <strong>{{customerName}}</strong>,</p>
            
            <p>{{projectTitle}} için verdiğimiz teklifi onaylıyorsunuz. Güneş enerjisine geçiş yolculuğunuzda artık aktif adımlarla ilerliyoruz!</p>
            
            <div style="background: #fef3c7; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="margin-top: 0;">📅 Sonraki Süreç</h3>
              <ol style="margin: 0;">
                <li><strong>Saha Analizi:</strong> 3-5 iş günü içinde</li>
                <li><strong>Kurulum Planlaması:</strong> Analiz sonrası 2-3 gün</li>
                <li><strong>Sistem Kurulumu:</strong> 1-3 gün (sistem büyüklüğüne göre)</li>
                <li><strong>Devreye Alma:</strong> Kurulum sonrası aynı gün</li>
              </ol>
            </div>
            
            <div style="background: #e0f2fe; padding: 15px; border-radius: 6px; margin: 20px 0;">
              <p style="margin: 0;"><strong>📞 Proje sorumlusu {{projectManager}} sizinle yakında iletişim kuracak.</strong></p>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="{{projectTrackingUrl}}" style="background: #f59e0b; color: white; padding: 15px 30px; text-decoration: none; border-radius: 6px; font-weight: bold;">
                Projeyi Takip Et
              </a>
            </div>
            
            <p style="font-size: 14px; color: #666;">
              Bu süreçte sizlere anlık bilgi vereceğiz. Herhangi bir sorunuz olduğunda bizimle iletişime geçebilirsiniz.
            </p>
          </div>
        `,
        variables: ['customerName', 'projectTitle', 'projectManager', 'projectTrackingUrl'],
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: 'installation_completed_email',
        type: 'installation_completed',
        channel: 'email',
        subject: 'Kurulumunuz Tamamlandı! Güneş Enerjisi Sisteminiz Aktif',
        title: 'Sistem Kurulumu Tamamlandı!',
        content: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #10b981;">🎊 Tebrikler! Güneş Enerjisi Sisteminiz Aktif!</h2>
            
            <p>Merhaba <strong>{{customerName}}</strong>,</p>
            
            <p>{{completionDate}} tarihinde {{systemSize}} kW güç kapasiteli güneş enerjisi sisteminizin kurulumu başarıyla tamamlandı!</p>
            
            <div style="background: #ecfdf5; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #10b981;">
              <h3 style="margin-top: 0; color: #065f46;">⚡ Sistem Bilgileri</h3>
              <ul style="list-style: none; padding: 0;">
                <li><strong>Kurulu Güç:</strong> {{systemSize}} kW</li>
                <li><strong>Panel Sayısı:</strong> {{panelCount}} adet</li>
                <li><strong>Günlük Üretim (Ort.):</strong> {{dailyProduction}} kWh</li>
                <li><strong>Aylık Üretim (Ort.):</strong> {{monthlyProduction}} kWh</li>
                <li><strong>Yıllık Üretim (Ort.):</strong> {{annualProduction}} kWh</li>
              </ul>
            </div>
            
            <div style="background: #f0f9ff; padding: 15px; border-radius: 6px; margin: 20px 0;">
              <p style="margin: 0;"><strong>🎯 Tahmini Aylık Elektrik Tasarrufunuz: ₺{{monthlySavings:format}}</strong></p>
            </div>
            
            <h3>📱 Sistem Takibi</h3>
            <p>Sisteminizin performansını gerçek zamanlı olarak takip edebilir, üretim verilerini görüntüleyebilirsiniz:</p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="{{monitoringUrl}}" style="background: #10b981; color: white; padding: 15px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; margin-right: 10px;">
                Sistem Takibi
              </a>
              <a href="{{userGuideUrl}}" style="background: #3b82f6; color: white; padding: 15px 30px; text-decoration: none; border-radius: 6px; font-weight: bold;">
                Kullanım Kılavuzu
              </a>
            </div>
            
            <h3>🛠️ Garanti ve Destek</h3>
            <ul>
              <li><strong>Panel Garantisi:</strong> 25 yıl performans garantisi</li>
              <li><strong>İnverter Garantisi:</strong> 10 yıl ürün garantisi</li>
              <li><strong>Sistem Garantisi:</strong> 2 yıl kurulum garantisi</li>
              <li><strong>7/24 Teknik Destek:</strong> +90 284 XXX XX XX</li>
            </ul>
            
            <p style="color: #10b981; font-weight: bold;">Güneş enerjisi ailesine hoş geldiniz! 🌞</p>
          </div>
        `,
        variables: ['customerName', 'completionDate', 'systemSize', 'panelCount', 'dailyProduction', 'monthlyProduction', 'annualProduction', 'monthlySavings', 'monitoringUrl', 'userGuideUrl'],
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ]

    defaultTemplates.forEach(template => {
      this.templates.set(template.id, template)
    })
  }

  public async sendNotification(
    type: NotificationType,
    recipient: NotificationRecipient,
    data: NotificationData,
    channels: ('email' | 'sms' | 'whatsapp' | 'push')[] = ['email']
  ): Promise<NotificationLog[]> {
    const logs: NotificationLog[] = []

    for (const channel of channels) {
      // Check recipient preferences
      if (recipient.preferences && !recipient.preferences[channel]) {
        continue
      }

      const templateId = `${type}_${channel}`
      const template = this.templates.get(templateId)

      if (!template || !template.isActive) {
        console.warn(`Template not found or inactive: ${templateId}`)
        continue
      }

      const log: NotificationLog = {
        id: `notification-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        type,
        channel,
        recipient,
        data,
        status: 'pending',
        createdAt: new Date().toISOString()
      }

      try {
        const processedContent = this.processTemplate(template, data, recipient.language || 'tr')
        
        switch (channel) {
          case 'email':
            await this.sendEmail(recipient, processedContent, template)
            break
          case 'sms':
            await this.sendSMS(recipient, processedContent)
            break
          case 'whatsapp':
            await this.sendWhatsApp(recipient, processedContent)
            break
          case 'push':
            await this.sendPush(recipient, processedContent)
            break
        }

        log.status = 'sent'
        log.sentAt = new Date().toISOString()
      } catch (error) {
        log.status = 'failed'
        log.errorMessage = error instanceof Error ? error.message : 'Unknown error'
        console.error(`Failed to send ${channel} notification:`, error)
      }

      logs.push(log)
      this.logs.push(log)
    }

    return logs
  }

  private processTemplate(
    template: NotificationTemplate, 
    data: NotificationData, 
    language: 'tr' | 'en' = 'tr'
  ): { subject?: string; title: string; content: string } {
    let subject = template.subject || ''
    let title = template.title
    let content = template.content

    // Process variables
    Object.entries(data).forEach(([key, value]) => {
      const placeholder = `{{${key}}}`
      const formattedPlaceholder = `{{${key}:format}}`
      
      let processedValue = String(value || '')
      
      // Format numbers as Turkish currency
      if (key.toLowerCase().includes('price') || key.toLowerCase().includes('cost') || key.toLowerCase().includes('savings')) {
        if (typeof value === 'number') {
          processedValue = new Intl.NumberFormat('tr-TR').format(value)
        }
      }

      subject = subject.replace(new RegExp(placeholder, 'g'), processedValue)
      subject = subject.replace(new RegExp(formattedPlaceholder, 'g'), processedValue)
      
      title = title.replace(new RegExp(placeholder, 'g'), processedValue)
      title = title.replace(new RegExp(formattedPlaceholder, 'g'), processedValue)
      
      content = content.replace(new RegExp(placeholder, 'g'), processedValue)
      content = content.replace(new RegExp(formattedPlaceholder, 'g'), processedValue)
    })

    // Add common system variables
    const systemVars = {
      currentDate: new Date().toLocaleDateString('tr-TR'),
      currentYear: new Date().getFullYear().toString(),
      companyName: 'EnerjiOS',
      supportPhone: '+90 284 XXX XX XX',
      supportEmail: 'destek@enerjios.com',
      websiteUrl: 'https://enerjios.com',
      dashboardUrl: 'https://enerjios.com/dashboard',
      createdDate: new Date().toLocaleDateString('tr-TR')
    }

    Object.entries(systemVars).forEach(([key, value]) => {
      const placeholder = `{{${key}}}`
      subject = subject.replace(new RegExp(placeholder, 'g'), value)
      title = title.replace(new RegExp(placeholder, 'g'), value)
      content = content.replace(new RegExp(placeholder, 'g'), value)
    })

    return { subject, title, content }
  }

  private async sendEmail(
    recipient: NotificationRecipient,
    processed: { subject?: string; title: string; content: string },
    template: NotificationTemplate
  ): Promise<void> {
    const emailService = new EmailService()
    
    await emailService.sendTemplatedEmail({
      to: recipient.email,
      subject: processed.subject || processed.title,
      html: processed.content,
      templateName: template.id
    })
  }

  private async sendSMS(
    recipient: NotificationRecipient,
    processed: { title: string; content: string }
  ): Promise<void> {
    if (!recipient.phone) {
      throw new Error('Phone number required for SMS')
    }

    // SMS API integration (mock implementation)
    console.log('SMS would be sent:', {
      to: recipient.phone,
      message: processed.content
    })

    // In real implementation:
    // await smsService.send(recipient.phone, processed.content)
  }

  private async sendWhatsApp(
    recipient: NotificationRecipient,
    processed: { title: string; content: string }
  ): Promise<void> {
    if (!recipient.phone) {
      throw new Error('Phone number required for WhatsApp')
    }

    // WhatsApp Business API integration (mock implementation)
    console.log('WhatsApp would be sent:', {
      to: recipient.phone,
      message: processed.content
    })

    // In real implementation:
    // await whatsappService.send(recipient.phone, processed.content)
  }

  private async sendPush(
    recipient: NotificationRecipient,
    processed: { title: string; content: string }
  ): Promise<void> {
    // Push notification service integration (mock implementation)
    console.log('Push notification would be sent:', {
      to: recipient.email, // or device token
      title: processed.title,
      body: processed.content
    })

    // In real implementation:
    // await pushService.send(deviceToken, processed.title, processed.content)
  }

  public getNotificationLogs(filters?: {
    type?: NotificationType
    channel?: string
    status?: string
    recipient?: string
    dateFrom?: string
    dateTo?: string
  }): NotificationLog[] {
    let filteredLogs = [...this.logs]

    if (filters) {
      if (filters.type) {
        filteredLogs = filteredLogs.filter(log => log.type === filters.type)
      }
      if (filters.channel) {
        filteredLogs = filteredLogs.filter(log => log.channel === filters.channel)
      }
      if (filters.status) {
        filteredLogs = filteredLogs.filter(log => log.status === filters.status)
      }
      if (filters.recipient) {
        filteredLogs = filteredLogs.filter(log => 
          log.recipient.email.includes(filters.recipient!) ||
          log.recipient.name.includes(filters.recipient!)
        )
      }
      if (filters.dateFrom) {
        filteredLogs = filteredLogs.filter(log => log.createdAt >= filters.dateFrom!)
      }
      if (filters.dateTo) {
        filteredLogs = filteredLogs.filter(log => log.createdAt <= filters.dateTo!)
      }
    }

    return filteredLogs.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  }

  public getTemplate(templateId: string): NotificationTemplate | undefined {
    return this.templates.get(templateId)
  }

  public getAllTemplates(): NotificationTemplate[] {
    return Array.from(this.templates.values())
  }

  public updateTemplate(templateId: string, updates: Partial<NotificationTemplate>): boolean {
    const template = this.templates.get(templateId)
    if (!template) return false

    const updatedTemplate = { ...template, ...updates, updatedAt: new Date().toISOString() }
    this.templates.set(templateId, updatedTemplate)
    return true
  }

  public createTemplate(template: Omit<NotificationTemplate, 'createdAt' | 'updatedAt'>): NotificationTemplate {
    const newTemplate: NotificationTemplate = {
      ...template,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    
    this.templates.set(template.id, newTemplate)
    return newTemplate
  }

  public getStatistics(dateFrom?: string, dateTo?: string) {
    let logs = this.logs

    if (dateFrom || dateTo) {
      logs = logs.filter(log => {
        const logDate = log.createdAt
        if (dateFrom && logDate < dateFrom) return false
        if (dateTo && logDate > dateTo) return false
        return true
      })
    }

    const totalSent = logs.length
    const successful = logs.filter(log => log.status === 'sent').length
    const failed = logs.filter(log => log.status === 'failed').length
    const pending = logs.filter(log => log.status === 'pending').length

    const byChannel = logs.reduce((acc, log) => {
      acc[log.channel] = (acc[log.channel] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    const byType = logs.reduce((acc, log) => {
      acc[log.type] = (acc[log.type] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    return {
      totalSent,
      successful,
      failed,
      pending,
      successRate: totalSent > 0 ? (successful / totalSent) * 100 : 0,
      byChannel,
      byType
    }
  }
}

export const notificationSystem = new NotificationSystem()
export default notificationSystem