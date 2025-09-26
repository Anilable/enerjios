import { Quote, Customer, User } from '@prisma/client';

interface EmailTemplateData {
  quote: Quote & {
    customer: Customer | null;
    createdBy: User & { company?: { name: string } | null };
  };
  customerName: string;
  companyName: string;
  viewUrl: string;
}

export interface EmailTemplate {
  subject: string;
  html: string;
  text: string;
}

export class EmailTemplateService {
  private static formatDate(date: Date): string {
    return new Intl.DateTimeFormat('tr-TR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  }

  private static formatCurrency(amount: number): string {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY',
      minimumFractionDigits: 2
    }).format(amount);
  }

  static getQuoteDeliveryTemplate(data: EmailTemplateData): EmailTemplate {
    const { quote, customerName, companyName, viewUrl } = data;

    // Company-specific information
    const isCompanyQuote = quote.createdBy.company?.name === 'DMR Solar';
    const companyInfo = isCompanyQuote ? {
      name: 'DMR Solar',
      address: 'Yakuplu Mahallesi 194 Sokak 3. Matbaacılar Sitesi No: 1/200 Beylikdüzü - İstanbul',
      phones: ['0212 441 10 14', '0532 434 49 99', '0535 715 12 17'],
      email: 'info@dmrsolar.com.tr',
      website: 'www.dmrsolar.com.tr',
      primaryColor: '#FF6B35',
      secondaryColor: '#FFD700'
    } : {
      name: 'EnerjiOS',
      address: 'Levazım, Vadi Cd Zorlu Center , 34340 Beşiktaş/İstanbul',
      phones: ['+90 541 593 26 55', '+90 288 415 20 05'],
      email: 'info@enerjios.com',
      website: 'www.enerjios.com',
      primaryColor: '#2563eb',
      secondaryColor: '#f39c12'
    };

    const subject = `${companyInfo.name} - Solar Enerji Sistemi Teklifi #${quote.quoteNumber}`;

    const html = `
<!DOCTYPE html>
<html lang="tr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Solar Enerji Sistemi Teklifi</title>
  <style>
    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
    }
    .header {
      background: linear-gradient(135deg, ${companyInfo.primaryColor}, ${companyInfo.secondaryColor});
      color: white;
      padding: 20px;
      text-align: center;
      border-radius: 8px 8px 0 0;
    }
    .content {
      background: #fff;
      border: 1px solid #e0e0e0;
      border-radius: 0 0 8px 8px;
      padding: 30px;
    }
    .quote-summary {
      background: #f8f9fa;
      padding: 20px;
      border-radius: 8px;
      margin: 20px 0;
      border-left: 4px solid ${companyInfo.primaryColor};
    }
    .cta-button {
      background: #27ae60;
      color: white;
      padding: 15px 30px;
      text-decoration: none;
      border-radius: 5px;
      font-weight: bold;
      display: inline-block;
      margin: 20px 0;
    }
    .footer {
      margin-top: 30px;
      padding-top: 20px;
      border-top: 2px solid #f0f0f0;
      font-size: 12px;
      color: #666;
      text-align: center;
    }
    .validity-notice {
      background: #fff3cd;
      border: 1px solid #ffc107;
      color: #856404;
      padding: 10px;
      border-radius: 5px;
      margin: 15px 0;
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>🌞 Solar Enerji Sistemi Teklifi</h1>
    <p>Güneş Enerjisiyle Geleceğe Yatırım</p>
  </div>
  
  <div class="content">
    <h2>Sayın ${customerName},</h2>
    
    <p>
      <strong>${companyInfo.name}</strong> olarak, güneş enerji sistemi kurulum talebiniz için hazırladığımız
      detaylı teklifimizi sunuyoruz. Ekibimiz, sizin için en uygun çözümü geliştirmek adına
      kapsamlı bir analiz gerçekleştirmiştir.
    </p>

    <div class="quote-summary">
      <h3>📋 Teklif Özeti</h3>
      <table style="width: 100%; border-collapse: collapse;">
        <tr>
          <td style="padding: 8px 0; border-bottom: 1px solid #ddd;"><strong>Teklif No:</strong></td>
          <td style="padding: 8px 0; border-bottom: 1px solid #ddd;">${quote.quoteNumber}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; border-bottom: 1px solid #ddd;"><strong>Toplam Tutar:</strong></td>
          <td style="padding: 8px 0; border-bottom: 1px solid #ddd; color: #27ae60; font-weight: bold;">
            ${this.formatCurrency(quote.total)}
          </td>
        </tr>
        <tr>
          <td style="padding: 8px 0; border-bottom: 1px solid #ddd;"><strong>Teklif Tarihi:</strong></td>
          <td style="padding: 8px 0; border-bottom: 1px solid #ddd;">${this.formatDate(quote.createdAt)}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0;"><strong>Geçerlilik Tarihi:</strong></td>
          <td style="padding: 8px 0;">${this.formatDate(quote.validUntil)}</td>
        </tr>
      </table>
    </div>

    <div class="validity-notice">
      <strong>⚠️ Önemli:</strong> Bu teklif ${this.formatDate(quote.validUntil)} tarihine kadar geçerlidir.
      Belirlenen süre içerisinde değerlendirmenizi rica ederiz.
    </div>

    <h3>🎯 Neden Bizimle Çalışmalısınız?</h3>
    <ul>
      <li>✅ <strong>Uzman Ekip:</strong> Alanında deneyimli mühendis kadrosu</li>
      <li>✅ <strong>Kaliteli Ürünler:</strong> Uluslararası standartlarda ekipmanlar</li>
      <li>✅ <strong>Garanti:</strong> Kapsamlı ürün ve işçilik garantisi</li>
      <li>✅ <strong>Hızlı Kurulum:</strong> Profesyonel kurulum ekibi</li>
      <li>✅ <strong>Teknik Destek:</strong> 7/24 müşteri desteği</li>
    </ul>

    <div style="text-align: center;">
      <a href="${viewUrl}" class="cta-button">
        📄 Detaylı Teklifi Görüntüle ve Onayla
      </a>
    </div>

    <h3>📞 İletişim</h3>
    <p>
      Teklif hakkında sorularınız varsa veya detaylı bilgi almak istiyorsanız,
      bizimle iletişime geçmekten çekinmeyin:
    </p>
    <ul>
      <li>📧 Email: ${companyInfo.email}</li>
      <li>📱 Telefon: ${companyInfo.phones.join(' - ')}</li>
      <li>🌐 Website: ${companyInfo.website}</li>
      <li>📍 Adres: ${companyInfo.address}</li>
    </ul>

    <p>
      Güneş enerjisi yatırımınızda size rehberlik etmekten mutluluk duyarız. 
      Sürdürülebilir bir gelecek için birlikte çalışalım!
    </p>

    <p style="margin-top: 30px;">
      Saygılarımızla,<br>
      <strong>${companyInfo.name}</strong><br>
      <em>Güneş Enerji Çözümleri</em>
    </p>
  </div>

  <div class="footer">
    <p>
      Bu e-posta otomatik olarak gönderilmiştir. Lütfen bu e-postaya yanıt vermeyiniz.<br>
      Sorularınız için yukarıdaki iletişim bilgilerini kullanınız.
    </p>
  </div>
</body>
</html>`;

    const text = `
${companyName} - Solar Enerji Sistemi Teklifi #${quote.quoteNumber}

Sayın ${customerName},

${companyName} olarak, güneş enerji sistemi kurulum talebiniz için hazırladığımız detaylı teklifimizi sunuyoruz.

Teklif Özeti:
- Teklif No: ${quote.quoteNumber}
- Toplam Tutar: ${this.formatCurrency(quote.total)}
- Teklif Tarihi: ${this.formatDate(quote.createdAt)}
- Geçerlilik Tarihi: ${this.formatDate(quote.validUntil)}

ÖNEMLI: Bu teklif ${this.formatDate(quote.validUntil)} tarihine kadar geçerlidir.

Detaylı teklifi görüntülemek ve onaylamak için: ${viewUrl}

İletişim:
- Email: ${quote.createdBy.email}
${quote.createdBy.phone ? `- Telefon: ${quote.createdBy.phone}` : ''}

Saygılarımızla,
${companyName}
Güneş Enerji Çözümleri
`;

    return { subject, html, text };
  }

  static getQuoteViewedNotificationTemplate(data: EmailTemplateData): EmailTemplate {
    const { quote, customerName } = data;
    
    const subject = `Teklif Görüntülendi - ${customerName} (#${quote.quoteNumber})`;
    
    const html = `
<!DOCTYPE html>
<html lang="tr">
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .notification { background: #e8f5e8; padding: 20px; border-radius: 8px; border-left: 4px solid #27ae60; }
  </style>
</head>
<body>
  <div class="notification">
    <h2>👁️ Teklif Görüntülendi</h2>
    <p><strong>${customerName}</strong> adlı müşteri <strong>#${quote.quoteNumber}</strong> numaralı teklifi görüntüledi.</p>
    <p><strong>Görüntülenme Zamanı:</strong> ${this.formatDate(quote.viewedAt!)}</p>
    <p>Müşterinin kararını bekleyebilir veya takip için iletişime geçebilirsiniz.</p>
  </div>
</body>
</html>`;

    const text = `Teklif Görüntülendi - ${customerName} (#${quote.quoteNumber})

${customerName} adlı müşteri #${quote.quoteNumber} numaralı teklifi görüntüledi.
Görüntülenme Zamanı: ${this.formatDate(quote.viewedAt!)}`;

    return { subject, html, text };
  }

  static getQuoteApprovedNotificationTemplate(data: EmailTemplateData): EmailTemplate {
    const { quote, customerName } = data;
    
    const subject = `🎉 Teklif Onaylandı - ${customerName} (#${quote.quoteNumber})`;
    
    const html = `
<!DOCTYPE html>
<html lang="tr">
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .success { background: #d4edda; padding: 20px; border-radius: 8px; border-left: 4px solid #28a745; }
  </style>
</head>
<body>
  <div class="success">
    <h2>🎉 Teklif Onaylandı!</h2>
    <p><strong>${customerName}</strong> adlı müşteri <strong>#${quote.quoteNumber}</strong> numaralı teklifi onayladı.</p>
    <p><strong>Onay Zamanı:</strong> ${this.formatDate(quote.approvedAt!)}</p>
    <p><strong>Toplam Tutar:</strong> ${this.formatCurrency(quote.total)}</p>
    <p>Projeyi başlatmak için gerekli adımları atabilirsiniz.</p>
  </div>
</body>
</html>`;

    const text = `Teklif Onaylandı! - ${customerName} (#${quote.quoteNumber})

${customerName} adlı müşteri #${quote.quoteNumber} numaralı teklifi onayladı.
Onay Zamanı: ${this.formatDate(quote.approvedAt!)}
Toplam Tutar: ${this.formatCurrency(quote.total)}`;

    return { subject, html, text };
  }

  static getQuoteRejectedNotificationTemplate(data: EmailTemplateData): EmailTemplate {
    const { quote, customerName } = data;
    
    const subject = `❌ Teklif Reddedildi - ${customerName} (#${quote.quoteNumber})`;
    
    const html = `
<!DOCTYPE html>
<html lang="tr">
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .danger { background: #f8d7da; padding: 20px; border-radius: 8px; border-left: 4px solid #dc3545; }
  </style>
</head>
<body>
  <div class="danger">
    <h2>❌ Teklif Reddedildi</h2>
    <p><strong>${customerName}</strong> adlı müşteri <strong>#${quote.quoteNumber}</strong> numaralı teklifi reddetti.</p>
    <p><strong>Red Zamanı:</strong> ${this.formatDate(quote.rejectedAt!)}</p>
    ${quote.customerComments ? `<p><strong>Müşteri Yorumu:</strong> ${quote.customerComments}</p>` : ''}
    <p>Müşteri ile iletişime geçerek geri bildirim alabilirsiniz.</p>
  </div>
</body>
</html>`;

    const text = `Teklif Reddedildi - ${customerName} (#${quote.quoteNumber})

${customerName} adlı müşteri #${quote.quoteNumber} numaralı teklifi reddetti.
Red Zamanı: ${this.formatDate(quote.rejectedAt!)}
${quote.customerComments ? `Müşteri Yorumu: ${quote.customerComments}` : ''}`;

    return { subject, html, text };
  }

  static getQuoteExpiryWarningTemplate(data: EmailTemplateData): EmailTemplate {
    const { quote, customerName } = data;
    
    const subject = `⏰ Teklif Süresi Bitiyor - ${customerName} (#${quote.quoteNumber})`;
    
    const html = `
<!DOCTYPE html>
<html lang="tr">
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .warning { background: #fff3cd; padding: 20px; border-radius: 8px; border-left: 4px solid #ffc107; }
  </style>
</head>
<body>
  <div class="warning">
    <h2>⏰ Teklif Süresi Bitiyor</h2>
    <p><strong>#${quote.quoteNumber}</strong> numaralı teklif yakında sona erecek.</p>
    <p><strong>Müşteri:</strong> ${customerName}</p>
    <p><strong>Bitiş Tarihi:</strong> ${this.formatDate(quote.validUntil)}</p>
    <p>Müşteri ile iletişime geçerek teklif süresini hatırlatabilirsiniz.</p>
  </div>
</body>
</html>`;

    const text = `Teklif Süresi Bitiyor - ${customerName} (#${quote.quoteNumber})

#${quote.quoteNumber} numaralı teklif yakında sona erecek.
Müşteri: ${customerName}
Bitiş Tarihi: ${this.formatDate(quote.validUntil)}`;

    return { subject, html, text };
  }
}