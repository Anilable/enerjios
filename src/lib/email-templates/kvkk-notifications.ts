export interface KVKKNotificationData {
  applicationNo: string
  applicantName: string
  applicantEmail: string
  requestType: string
  submittedAt: string
  responseDeadline: string
  daysOverdue?: number
  daysRemaining?: number
}

export const kvkkOverdueNotification = (data: KVKKNotificationData) => ({
  subject: `Acil: KVKK Başvuru Süresi Geçti - ${data.applicationNo}`,
  html: `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: linear-gradient(135deg, #dc2626, #ef4444); color: white; padding: 20px; border-radius: 8px 8px 0 0;">
        <h1 style="margin: 0; font-size: 24px;">🚨 Acil Müdahale Gerekli</h1>
        <p style="margin: 10px 0 0 0; opacity: 0.9;">KVKK Başvuru Süresi Geçti</p>
      </div>

      <div style="background: #f8f9fa; padding: 20px; border: 1px solid #e9ecef;">
        <div style="background: white; padding: 15px; border-radius: 6px; border-left: 4px solid #dc2626;">
          <h3 style="color: #dc2626; margin-top: 0;">Başvuru Detayları</h3>
          <p><strong>Başvuru No:</strong> ${data.applicationNo}</p>
          <p><strong>Başvuran:</strong> ${data.applicantName} (${data.applicantEmail})</p>
          <p><strong>Talep Türü:</strong> ${getRequestTypeLabel(data.requestType)}</p>
          <p><strong>Başvuru Tarihi:</strong> ${formatDate(data.submittedAt)}</p>
          <p><strong>Son Yanıt Tarihi:</strong> ${formatDate(data.responseDeadline)}</p>
          <p style="color: #dc2626;"><strong>Gecikme:</strong> ${data.daysOverdue} gün</p>
        </div>

        <div style="background: #fef2f2; padding: 15px; border-radius: 6px; margin-top: 15px;">
          <h4 style="color: #dc2626; margin-top: 0;">⚠️ Yasal Uyarı</h4>
          <p style="margin-bottom: 0; color: #7f1d1d;">
            KVKK'nın 13. maddesi gereği bu başvuru için belirlenen yasal süre geçmiştir.
            Derhal işlem yapılması ve başvuranın bilgilendirilmesi gerekmektedir.
          </p>
        </div>
      </div>

      <div style="background: #fff; padding: 20px; border: 1px solid #e9ecef; border-top: none; border-radius: 0 0 8px 8px;">
        <p style="margin-bottom: 15px; color: #374151;">Bu başvuruyu hemen değerlendirmek için:</p>
        <a href="${process.env.NEXTAUTH_URL}/dashboard/kvkk"
           style="display: inline-block; background: #dc2626; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">
          Başvuruyu İncele
        </a>

        <hr style="margin: 20px 0; border: none; border-top: 1px solid #e5e7eb;">
        <p style="font-size: 12px; color: #6b7280; margin: 0;">
          Bu e-posta Trakya Solar KVKK uyumluluk sistemi tarafından otomatik olarak gönderilmiştir.
        </p>
      </div>
    </div>
  `,
  text: `
ACIL: KVKK Başvuru Süresi Geçti

Başvuru No: ${data.applicationNo}
Başvuran: ${data.applicantName} (${data.applicantEmail})
Talep Türü: ${getRequestTypeLabel(data.requestType)}
Başvuru Tarihi: ${formatDate(data.submittedAt)}
Son Yanıt Tarihi: ${formatDate(data.responseDeadline)}
Gecikme: ${data.daysOverdue} gün

YASAL UYARI: KVKK'nın 13. maddesi gereği bu başvuru için belirlenen yasal süre geçmiştir.

Başvuruyu incelemek için: ${process.env.NEXTAUTH_URL}/dashboard/kvkk
  `
})

export const kvkkReminderNotification = (data: KVKKNotificationData) => ({
  subject: `Hatırlatma: KVKK Başvuru Süresi Yaklaşıyor - ${data.applicationNo}`,
  html: `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: linear-gradient(135deg, #f59e0b, #fbbf24); color: white; padding: 20px; border-radius: 8px 8px 0 0;">
        <h1 style="margin: 0; font-size: 24px;">⏰ Süre Yaklaşıyor</h1>
        <p style="margin: 10px 0 0 0; opacity: 0.9;">KVKK Başvuru Yanıt Süresi</p>
      </div>

      <div style="background: #f8f9fa; padding: 20px; border: 1px solid #e9ecef;">
        <div style="background: white; padding: 15px; border-radius: 6px; border-left: 4px solid #f59e0b;">
          <h3 style="color: #f59e0b; margin-top: 0;">Başvuru Detayları</h3>
          <p><strong>Başvuru No:</strong> ${data.applicationNo}</p>
          <p><strong>Başvuran:</strong> ${data.applicantName} (${data.applicantEmail})</p>
          <p><strong>Talep Türü:</strong> ${getRequestTypeLabel(data.requestType)}</p>
          <p><strong>Başvuru Tarihi:</strong> ${formatDate(data.submittedAt)}</p>
          <p><strong>Son Yanıt Tarihi:</strong> ${formatDate(data.responseDeadline)}</p>
          <p style="color: #f59e0b;"><strong>Kalan Süre:</strong> ${data.daysRemaining} gün</p>
        </div>

        <div style="background: #fffbeb; padding: 15px; border-radius: 6px; margin-top: 15px;">
          <h4 style="color: #f59e0b; margin-top: 0;">📋 Öncelik Önerisi</h4>
          <p style="margin-bottom: 0; color: #78350f;">
            Bu başvurunun yanıt süresi ${data.daysRemaining} gün içinde dolacaktır.
            Yasal süreyi aşmamak için öncelikli olarak değerlendirilmesi önerilir.
          </p>
        </div>
      </div>

      <div style="background: #fff; padding: 20px; border: 1px solid #e9ecef; border-top: none; border-radius: 0 0 8px 8px;">
        <p style="margin-bottom: 15px; color: #374151;">Bu başvuruyu değerlendirmek için:</p>
        <a href="${process.env.NEXTAUTH_URL}/dashboard/kvkk"
           style="display: inline-block; background: #f59e0b; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">
          Başvuruyu İncele
        </a>

        <hr style="margin: 20px 0; border: none; border-top: 1px solid #e5e7eb;">
        <p style="font-size: 12px; color: #6b7280; margin: 0;">
          Bu e-posta Trakya Solar KVKK uyumluluk sistemi tarafından otomatik olarak gönderilmiştir.
        </p>
      </div>
    </div>
  `,
  text: `
HATIRLATMA: KVKK Başvuru Süresi Yaklaşıyor

Başvuru No: ${data.applicationNo}
Başvuran: ${data.applicantName} (${data.applicantEmail})
Talep Türü: ${getRequestTypeLabel(data.requestType)}
Başvuru Tarihi: ${formatDate(data.submittedAt)}
Son Yanıt Tarihi: ${formatDate(data.responseDeadline)}
Kalan Süre: ${data.daysRemaining} gün

Bu başvurunun yanıt süresi ${data.daysRemaining} gün içinde dolacaktır.

Başvuruyu incelemek için: ${process.env.NEXTAUTH_URL}/dashboard/kvkk
  `
})

export const kvkkComplianceReport = (data: {
  overdueCount: number
  dueSoonCount: number
  complianceRate: number
  totalPending: number
  avgResponseDays: number
}) => ({
  subject: `KVKK Uyumluluk Raporu - ${formatDate(new Date().toISOString())}`,
  html: `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: linear-gradient(135deg, #2563eb, #3b82f6); color: white; padding: 20px; border-radius: 8px 8px 0 0;">
        <h1 style="margin: 0; font-size: 24px;">📊 KVKK Uyumluluk Raporu</h1>
        <p style="margin: 10px 0 0 0; opacity: 0.9;">${formatDate(new Date().toISOString())}</p>
      </div>

      <div style="background: #f8f9fa; padding: 20px; border: 1px solid #e9ecef;">
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 20px;">
          <div style="background: white; padding: 15px; border-radius: 6px; text-align: center;">
            <div style="font-size: 24px; font-weight: bold; color: #dc2626;">${data.overdueCount}</div>
            <div style="color: #6b7280; font-size: 14px;">Süresi Geçen</div>
          </div>
          <div style="background: white; padding: 15px; border-radius: 6px; text-align: center;">
            <div style="font-size: 24px; font-weight: bold; color: #f59e0b;">${data.dueSoonCount}</div>
            <div style="color: #6b7280; font-size: 14px;">Yaklaşan Süreler</div>
          </div>
        </div>

        <div style="background: white; padding: 15px; border-radius: 6px; margin-bottom: 15px;">
          <h3 style="margin-top: 0; color: #374151;">Uyumluluk Metrikleri</h3>
          <div style="margin-bottom: 10px;">
            <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
              <span>Uyumluluk Oranı</span>
              <span style="font-weight: bold; color: ${data.complianceRate >= 90 ? '#059669' : data.complianceRate >= 70 ? '#f59e0b' : '#dc2626'};">%${data.complianceRate}</span>
            </div>
            <div style="background: #e5e7eb; height: 8px; border-radius: 4px;">
              <div style="background: ${data.complianceRate >= 90 ? '#10b981' : data.complianceRate >= 70 ? '#f59e0b' : '#dc2626'}; width: ${data.complianceRate}%; height: 100%; border-radius: 4px;"></div>
            </div>
          </div>
          <p><strong>Bekleyen Başvurular:</strong> ${data.totalPending}</p>
          <p><strong>Ortalama Yanıt Süresi:</strong> ${data.avgResponseDays} gün</p>
        </div>

        ${data.overdueCount > 0 || data.complianceRate < 90 ? `
        <div style="background: #fef2f2; padding: 15px; border-radius: 6px; border-left: 4px solid #dc2626;">
          <h4 style="color: #dc2626; margin-top: 0;">🚨 Dikkat Gerekli</h4>
          <ul style="margin-bottom: 0; color: #7f1d1d;">
            ${data.overdueCount > 0 ? `<li>${data.overdueCount} başvurunun yasal süresi geçmiş</li>` : ''}
            ${data.complianceRate < 90 ? `<li>Uyumluluk oranı %${data.complianceRate} - hedef minimum %90</li>` : ''}
          </ul>
        </div>
        ` : ''}
      </div>

      <div style="background: #fff; padding: 20px; border: 1px solid #e9ecef; border-top: none; border-radius: 0 0 8px 8px;">
        <a href="${process.env.NEXTAUTH_URL}/dashboard/kvkk"
           style="display: inline-block; background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">
          Detaylı Raporları Görüntüle
        </a>

        <hr style="margin: 20px 0; border: none; border-top: 1px solid #e5e7eb;">
        <p style="font-size: 12px; color: #6b7280; margin: 0;">
          Bu rapor Trakya Solar KVKK uyumluluk sistemi tarafından otomatik olarak oluşturulmuştur.
        </p>
      </div>
    </div>
  `
})

function getRequestTypeLabel(type: string): string {
  const labels = {
    'INFO': 'Bilgi Edinme',
    'ACCESS': 'Erişim',
    'CORRECTION': 'Düzeltme',
    'DELETION': 'Silme',
    'PORTABILITY': 'Taşınabilirlik',
    'OBJECTION': 'İtiraz',
    'OTHER': 'Diğer'
  }
  return labels[type as keyof typeof labels] || type
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('tr-TR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}