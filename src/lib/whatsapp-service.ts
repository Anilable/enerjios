interface WhatsAppQuoteMessage {
  customerName: string;
  quoteNumber: string;
  total: number;
  validUntil: Date;
  viewUrl: string;
  companyName: string;
  message?: string;
}

export class WhatsAppService {
  private apiUrl: string;
  private apiKey: string;

  constructor() {
    this.apiUrl = process.env.WHATSAPP_API_URL || '';
    this.apiKey = process.env.WHATSAPP_API_KEY || '';
  }

  private formatCurrency(amount: number): string {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY',
      minimumFractionDigits: 2
    }).format(amount);
  }

  private formatDate(date: Date): string {
    return new Intl.DateTimeFormat('tr-TR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    }).format(date);
  }

  private formatPhoneNumber(phone: string): string {
    // Remove all non-digit characters
    let cleaned = phone.replace(/\D/g, '');
    
    // Add country code if not present
    if (cleaned.startsWith('0')) {
      cleaned = '90' + cleaned.substring(1);
    } else if (!cleaned.startsWith('90')) {
      cleaned = '90' + cleaned;
    }
    
    return cleaned;
  }

  async sendQuoteMessage(phone: string, data: WhatsAppQuoteMessage): Promise<boolean> {
    if (!this.apiUrl || !this.apiKey) {
      console.warn('WhatsApp API not configured');
      return false;
    }

    const formattedPhone = this.formatPhoneNumber(phone);
    
    const message = `
🌞 *${data.companyName}*
*Güneş Enerji Sistemi Teklifi*

Merhaba ${data.customerName},

Güneş enerji sistemi kurulum talebiniz için hazırladığımız teklif hazır! 

📋 *Teklif Detayları:*
• Teklif No: ${data.quoteNumber}
• Toplam Tutar: ${this.formatCurrency(data.total)}
• Geçerlilik: ${this.formatDate(data.validUntil)} tarihine kadar

${data.message ? `\n💬 *Özel Mesaj:*\n${data.message}\n` : ''}

📄 *Detaylı teklifi görüntülemek ve onaylamak için:*
${data.viewUrl}

⚡ Güneş enerjisiyle tasarruf etmenin tam zamanı!

---
Bu mesaj otomatik olarak gönderilmiştir.
${data.companyName} - Güneş Enerji Çözümleri
`.trim();

    try {
      const response = await fetch(this.apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          phone: formattedPhone,
          message: message,
          type: 'text'
        })
      });

      if (response.ok) {
        console.log(`WhatsApp message sent successfully to ${formattedPhone}`);
        return true;
      } else {
        console.error('WhatsApp API error:', await response.text());
        return false;
      }
    } catch (error) {
      console.error('WhatsApp sending error:', error);
      return false;
    }
  }

  async sendQuoteStatusUpdate(phone: string, customerName: string, quoteNumber: string, status: string): Promise<boolean> {
    if (!this.apiUrl || !this.apiKey) {
      return false;
    }

    const formattedPhone = this.formatPhoneNumber(phone);
    
    let message = '';
    
    switch (status) {
      case 'approved':
        message = `
🎉 *Teklif Onayı Alındı!*

Merhaba ${customerName},

${quoteNumber} numaralı teklifiniz onaylanmıştır. Teşekkür ederiz!

Proje başlatma sürecini hızla başlatacağız. Ekibimiz size en kısa sürede detayları iletecektir.

Güneş enerjisiyle tasarruflu günlere hoş geldiniz! ☀️
        `.trim();
        break;
      
      case 'rejected':
        message = `
📋 *Teklif Geri Bildirimi*

Merhaba ${customerName},

${quoteNumber} numaralı teklifle ilgili geri bildiriminizi aldık.

Sizin için daha uygun çözümler geliştirebiliriz. Lütfen bizimle iletişime geçin.

Teşekkür ederiz.
        `.trim();
        break;
    }

    if (!message) return false;

    try {
      const response = await fetch(this.apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          phone: formattedPhone,
          message: message,
          type: 'text'
        })
      });

      return response.ok;
    } catch (error) {
      console.error('WhatsApp status update error:', error);
      return false;
    }
  }

  async testConnection(): Promise<boolean> {
    if (!this.apiUrl || !this.apiKey) {
      return false;
    }

    try {
      const response = await fetch(`${this.apiUrl}/health`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`
        }
      });

      return response.ok;
    } catch (error) {
      console.error('WhatsApp connection test failed:', error);
      return false;
    }
  }
}