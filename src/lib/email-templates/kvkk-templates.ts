export interface KVKKEmailData {
  applicantName: string
  applicationNo: string
  requestType: string
  submittedAt: string
  responseDeadline: string
  responseDetails?: string
}

export const kvkkApplicationReceived = (data: KVKKEmailData) => ({
  subject: `KVKK Başvurunuz Alındı - ${data.applicationNo}`,
  html: `
    <!DOCTYPE html>
    <html lang="tr">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>KVKK Başvuru Onayı</title>
    </head>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
        <h1 style="margin: 0; font-size: 24px;">EnerjiOS</h1>
        <p style="margin: 10px 0 0 0; opacity: 0.9;">Kişisel Veri Koruma</p>
      </div>

      <div style="background: white; padding: 30px; border: 1px solid #e0e0e0; border-top: none; border-radius: 0 0 10px 10px;">
        <h2 style="color: #667eea; margin-top: 0;">Başvurunuz Başarıyla Alındı</h2>

        <p>Sayın <strong>${data.applicantName}</strong>,</p>

        <p>6698 sayılı Kişisel Verilerin Korunması Kanunu kapsamında yapmış olduğunuz başvuru tarafımıza ulaşmıştır.</p>

        <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin-top: 0; color: #495057;">Başvuru Bilgileri</h3>
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 8px 0; color: #6c757d; width: 40%;">Başvuru Numarası:</td>
              <td style="padding: 8px 0; font-weight: bold; font-family: monospace;">${data.applicationNo}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #6c757d;">Başvuru Türü:</td>
              <td style="padding: 8px 0; font-weight: bold;">${getRequestTypeLabel(data.requestType)}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #6c757d;">Başvuru Tarihi:</td>
              <td style="padding: 8px 0; font-weight: bold;">${formatDate(data.submittedAt)}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #6c757d;">Son Yanıt Tarihi:</td>
              <td style="padding: 8px 0; font-weight: bold;">${formatDate(data.responseDeadline)}</td>
            </tr>
          </table>
        </div>

        <div style="background: #e7f3ff; border-left: 4px solid #0066cc; padding: 15px; margin: 20px 0;">
          <h4 style="margin-top: 0; color: #0066cc;">📋 Önemli Bilgiler</h4>
          <ul style="margin: 0; padding-left: 20px;">
            <li>Başvurunuz en geç <strong>30 gün</strong> içerisinde değerlendirilecektir</li>
            <li>İşlem süreci hakkında bilgi almak için başvuru numaranızı kullanabilirsiniz</li>
            <li>Başvuru durumu değiştiğinde e-posta ile bilgilendirileceksiniz</li>
          </ul>
        </div>

        <div style="background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0;">
          <h4 style="margin-top: 0; color: #856404;">⚠️ Dikkat</h4>
          <p style="margin: 0;">Bu e-posta otomatik olarak gönderilmiştir. Lütfen bu e-postaya yanıt vermeyiniz. Sorularınız için <a href="mailto:info@enerjios.com" style="color: #667eea;">info@enerjios.com</a> adresini kullanabilirsiniz.</p>
        </div>

        <div style="text-align: center; margin: 30px 0;">
          <a href="https://enerjios.com/kvkk" style="background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">KVKK Bilgileri</a>
        </div>

        <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 30px 0;">

        <div style="text-align: center; color: #6c757d; font-size: 14px;">
          <p><strong>EnerjiOS</strong> - Güneş Enerjisi Yönetim Platformu</p>
          <p>Levazım, Vadi Cd Zorlu Center, 34340 Beşiktaş/İstanbul</p>
          <p>Tel: +90 (288) 415 20 05 | E-posta: info@enerjios.com</p>
        </div>
      </div>
    </body>
    </html>
  `
})

export const kvkkApplicationCompleted = (data: KVKKEmailData) => ({
  subject: `KVKK Başvurunuz Yanıtlandı - ${data.applicationNo}`,
  html: `
    <!DOCTYPE html>
    <html lang="tr">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>KVKK Başvuru Yanıtı</title>
    </head>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: linear-gradient(135deg, #28a745 0%, #20c997 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
        <h1 style="margin: 0; font-size: 24px;">EnerjiOS</h1>
        <p style="margin: 10px 0 0 0; opacity: 0.9;">Kişisel Veri Koruma</p>
      </div>

      <div style="background: white; padding: 30px; border: 1px solid #e0e0e0; border-top: none; border-radius: 0 0 10px 10px;">
        <h2 style="color: #28a745; margin-top: 0;">Başvurunuz Yanıtlandı</h2>

        <p>Sayın <strong>${data.applicantName}</strong>,</p>

        <p>6698 sayılı Kişisel Verilerin Korunması Kanunu kapsamında yapmış olduğunuz başvuru değerlendirilmiş ve yanıtlanmıştır.</p>

        <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin-top: 0; color: #495057;">Başvuru Bilgileri</h3>
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 8px 0; color: #6c757d; width: 40%;">Başvuru Numarası:</td>
              <td style="padding: 8px 0; font-weight: bold; font-family: monospace;">${data.applicationNo}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #6c757d;">Başvuru Türü:</td>
              <td style="padding: 8px 0; font-weight: bold;">${getRequestTypeLabel(data.requestType)}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #6c757d;">Yanıt Tarihi:</td>
              <td style="padding: 8px 0; font-weight: bold;">${formatDate(new Date().toISOString())}</td>
            </tr>
          </table>
        </div>

        ${data.responseDetails ? `
        <div style="background: #e8f5e8; border-left: 4px solid #28a745; padding: 20px; margin: 20px 0;">
          <h3 style="margin-top: 0; color: #28a745;">📝 Yanıt Detayları</h3>
          <div style="white-space: pre-wrap; background: white; padding: 15px; border-radius: 5px; border: 1px solid #d1ecf1;">
            ${data.responseDetails}
          </div>
        </div>
        ` : ''}

        <div style="background: #d4edda; border-left: 4px solid #28a745; padding: 15px; margin: 20px 0;">
          <h4 style="margin-top: 0; color: #155724;">✅ Başvuru Tamamlandı</h4>
          <p style="margin: 0;">Başvurunuz başarıyla değerlendirilmiş ve gerekli işlemler tamamlanmıştır. Bu konuda başka bir işlem yapmanıza gerek yoktur.</p>
        </div>

        <div style="background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0;">
          <h4 style="margin-top: 0; color: #856404;">📞 İletişim</h4>
          <p style="margin: 0;">Bu yanıt ile ilgili sorularınız varsa <a href="mailto:info@enerjios.com" style="color: #667eea;">info@enerjios.com</a> adresinden bizimle iletişime geçebilirsiniz.</p>
        </div>

        <div style="text-align: center; margin: 30px 0;">
          <a href="https://enerjios.com/kvkk" style="background: #28a745; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">KVKK Bilgileri</a>
        </div>

        <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 30px 0;">

        <div style="text-align: center; color: #6c757d; font-size: 14px;">
          <p><strong>EnerjiOS</strong> - Güneş Enerjisi Yönetim Platformu</p>
          <p>Levazım, Vadi Cd Zorlu Center, 34340 Beşiktaş/İstanbul</p>
          <p>Tel: +90 (288) 415 20 05 | E-posta: info@enerjios.com</p>
        </div>
      </div>
    </body>
    </html>
  `
})

export const kvkkAdminNotification = (data: KVKKEmailData) => ({
  subject: `Yeni KVKK Başvurusu - ${data.applicationNo}`,
  html: `
    <!DOCTYPE html>
    <html lang="tr">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Yeni KVKK Başvurusu</title>
    </head>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: linear-gradient(135deg, #dc3545 0%, #fd7e14 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
        <h1 style="margin: 0; font-size: 24px;">EnerjiOS Admin</h1>
        <p style="margin: 10px 0 0 0; opacity: 0.9;">KVKK Yönetim Sistemi</p>
      </div>

      <div style="background: white; padding: 30px; border: 1px solid #e0e0e0; border-top: none; border-radius: 0 0 10px 10px;">
        <h2 style="color: #dc3545; margin-top: 0;">🚨 Yeni KVKK Başvurusu</h2>

        <p>Yeni bir KVKK başvurusu sisteme giriş yapmıştır ve değerlendirmenizi beklemektedir.</p>

        <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin-top: 0; color: #495057;">Başvuru Bilgileri</h3>
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 8px 0; color: #6c757d; width: 40%;">Başvuru Numarası:</td>
              <td style="padding: 8px 0; font-weight: bold; font-family: monospace;">${data.applicationNo}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #6c757d;">Başvuran:</td>
              <td style="padding: 8px 0; font-weight: bold;">${data.applicantName}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #6c757d;">Başvuru Türü:</td>
              <td style="padding: 8px 0; font-weight: bold;">${getRequestTypeLabel(data.requestType)}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #6c757d;">Başvuru Tarihi:</td>
              <td style="padding: 8px 0; font-weight: bold;">${formatDate(data.submittedAt)}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #6c757d;">Son Yanıt Tarihi:</td>
              <td style="padding: 8px 0; font-weight: bold; color: #dc3545;">${formatDate(data.responseDeadline)}</td>
            </tr>
          </table>
        </div>

        <div style="background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0;">
          <h4 style="margin-top: 0; color: #856404;">⏰ Acil Eylem Gerekli</h4>
          <p style="margin: 0;">Bu başvuru yasal olarak 30 gün içerisinde yanıtlanması gereken bir başvurudur. Lütfen en kısa sürede değerlendirmeye alın.</p>
        </div>

        <div style="text-align: center; margin: 30px 0;">
          <a href="https://enerjios.com/dashboard/kvkk" style="background: #dc3545; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">Admin Paneli</a>
        </div>

        <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 30px 0;">

        <div style="text-align: center; color: #6c757d; font-size: 14px;">
          <p>Bu e-posta EnerjiOS KVKK yönetim sistemi tarafından otomatik olarak gönderilmiştir.</p>
        </div>
      </div>
    </body>
    </html>
  `
})

function getRequestTypeLabel(type: string): string {
  const labels = {
    'info': 'Bilgi Edinme',
    'access': 'Erişim',
    'correction': 'Düzeltme',
    'deletion': 'Silme/Yok Etme',
    'portability': 'Veri Taşınabilirliği',
    'objection': 'İtiraz',
    'other': 'Diğer',
    'INFO': 'Bilgi Edinme',
    'ACCESS': 'Erişim',
    'CORRECTION': 'Düzeltme',
    'DELETION': 'Silme/Yok Etme',
    'PORTABILITY': 'Veri Taşınabilirliği',
    'OBJECTION': 'İtiraz',
    'OTHER': 'Diğer'
  }
  return labels[type as keyof typeof labels] || type
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('tr-TR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}