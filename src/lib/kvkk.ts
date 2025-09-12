export interface KVKKConsent {
  id: string
  userId: string
  consentType: 'registration' | 'marketing' | 'analytics' | 'payment' | 'installation'
  isGranted: boolean
  grantedAt: Date
  revokedAt?: Date
  ipAddress: string
  userAgent: string
  version: string // KVKK policy version
}

export interface PersonalDataCategory {
  category: 'identity' | 'contact' | 'financial' | 'location' | 'technical' | 'commercial'
  dataTypes: string[]
  purposes: string[]
  legalBasis: 'consent' | 'contract' | 'legal_obligation' | 'legitimate_interest'
  retentionPeriod: string
  sharingWithThirdParties: boolean
  thirdParties?: string[]
}

// KVKK Personal Data Categories for Solar Business
export const personalDataCategories: PersonalDataCategory[] = [
  {
    category: 'identity',
    dataTypes: ['Ad', 'Soyad', 'TC Kimlik No', 'Doğum Tarihi', 'Fotoğraf'],
    purposes: ['Müşteri kaydı', 'Kimlik doğrulama', 'Hizmet sunumu'],
    legalBasis: 'consent',
    retentionPeriod: '10 yıl (mali mevzuat gereği)',
    sharingWithThirdParties: false
  },
  {
    category: 'contact',
    dataTypes: ['Telefon', 'E-posta', 'Adres', 'İl/İlçe'],
    purposes: ['İletişim', 'Hizmet sunumu', 'Bilgilendirme'],
    legalBasis: 'consent',
    retentionPeriod: '5 yıl',
    sharingWithThirdParties: true,
    thirdParties: ['Kurulum ekibi', 'Kargo firmaları', 'SMS sağlayıcısı']
  },
  {
    category: 'financial',
    dataTypes: ['IBAN', 'Kredi kartı bilgileri', 'Gelir durumu', 'Finansman bilgileri'],
    purposes: ['Ödeme işlemleri', 'Finansman değerlendirmesi'],
    legalBasis: 'contract',
    retentionPeriod: '10 yıl (mali mevzuat gereği)',
    sharingWithThirdParties: true,
    thirdParties: ['İyzico', 'Bankalar', 'Finansman kuruluşları']
  },
  {
    category: 'location',
    dataTypes: ['GPS koordinatları', 'Çatı alanı', 'Bina bilgileri', 'Google Earth görüntüleri'],
    purposes: ['Teknik keşif', 'Sistem tasarımı', 'Kurulum planlaması'],
    legalBasis: 'consent',
    retentionPeriod: '20 yıl (proje arşivi)',
    sharingWithThirdParties: true,
    thirdParties: ['Google Maps API', 'Kurulum ekibi']
  },
  {
    category: 'technical',
    dataTypes: ['IP adresi', 'Browser bilgileri', 'Cihaz bilgileri', 'Çerezler'],
    purposes: ['Platform güvenliği', 'Performans analizi', 'Kullanıcı deneyimi'],
    legalBasis: 'legitimate_interest',
    retentionPeriod: '2 yıl',
    sharingWithThirdParties: true,
    thirdParties: ['Google Analytics', 'Sentry', 'Vercel']
  },
  {
    category: 'commercial',
    dataTypes: ['Satın alma geçmişi', 'Teklif bilgileri', 'Müşteri segmentasyonu'],
    purposes: ['Pazarlama', 'Müşteri analizi', 'Kişiselleştirilmiş hizmet'],
    legalBasis: 'consent',
    retentionPeriod: '3 yıl',
    sharingWithThirdParties: false
  }
]

// KVKK Consent Templates in Turkish
export const consentTexts = {
  registration: {
    title: 'Üyelik ve Kişisel Verilerin İşlenmesi Onayı',
    text: `Trakya Solar'a üye olurken verdiğim kişisel verilerimin aşağıdaki amaçlarla işlenmesine açık rızam ile onay veriyorum:

• Müşteri kaydının oluşturulması ve hesap yönetimi
• Güneş enerjisi sistemi tekliflerinin hazırlanması
• Teknik keşif ve kurulum hizmetlerinin planlanması
• Yasal yükümlülüklerin yerine getirilmesi
• Müşteri hizmetleri ve destek süreçlerinin yürütülmesi

Kişisel verilerimin KVKK kapsamında işlenmesi ile ilgili ayrıntılı bilgiye Kişisel Verilerin Korunması Politikası'ndan ulaşabilir, onayımı istediğim zaman geri çekebilirim.`
  },
  marketing: {
    title: 'Pazarlama ve İletişim Onayı',
    text: `Trakya Solar tarafından aşağıdaki kanallar üzerinden pazarlama iletişimi yapılmasına onay veriyorum:

• E-posta ile ürün/hizmet tanıtımları
• SMS ile özel fırsatlar ve kampanya duyuruları
• Telefon ile müşteri memnuniyeti araştırmaları
• WhatsApp ile hızlı bilgilendirmeler

Bu onayımı istediğim zaman geri çekebilir, pazarlama iletişimlerini durdurabilrim.`
  },
  analytics: {
    title: 'Analitik ve Performans Verileri Onayı',
    text: `Website kullanım deneyimimin iyileştirilmesi amacıyla:

• Çerezler (cookies) ve benzeri teknolojilerin kullanılması
• Google Analytics ile anonim kullanım verilerinin toplanması
• Platform performansının Sentry ile izlenmesi
• Kullanıcı davranış analizlerinin yapılması

Bu verilerin işlenmesine onay veriyorum.`
  },
  payment: {
    title: 'Ödeme ve Finansal İşlemler Onayı',
    text: `Güneş enerjisi sistemi satın alma işlemim kapsamında:

• Ödeme bilgilerimin İyzico üzerinden işlenmesi
• Finansman başvurusu için gerekli mali bilgilerin paylaşılması
• Fatura ve muhasebe işlemlerinin yürütülmesi
• Gümrük ve vergi işlemlerinin tamamlanması

Bu verilerin işlenmesine ve ilgili kuruluşlarla paylaşılmasına onay veriyorum.`
  },
  installation: {
    title: 'Kurulum ve Teknik Hizmetler Onayı',
    text: `Güneş enerjisi sistemi kurulum hizmetleri kapsamında:

• Adres ve konum bilgilerimin kurulum ekibi ile paylaşılması
• Çatı ve bina teknik bilgilerinin işlenmesi
• Kurulum öncesi/sonrası fotoğraf çekimlerinin yapılması
• Teknik keşif raporlarının hazırlanması

Bu verilerin işlenmesine onay veriyorum.`
  }
}

// KVKK Rights (Data Subject Rights)
export const dataSubjectRights = [
  'Kişisel verilerimin işlenip işlenmediğini öğrenme',
  'Kişisel verilerim işlenmişse buna ilişkin bilgi talep etme',
  'Kişisel verilerimin işlenme amacını ve bunların amacına uygun kullanılıp kullanılmadığını öğrenme',
  'Yurt içinde veya yurt dışında kişisel verilerimin aktarıldığı üçüncü kişileri bilme',
  'Kişisel verilerimin eksik veya yanlış işlenmiş olması hâlinde bunların düzeltilmesini isteme',
  'Kişisel verilerimin silinmesini veya yok edilmesini isteme',
  'Düzeltme, silme ve yok etme işlemlerinin paylaşıldığı üçüncü kişilere bildirilmesini isteme',
  'İşlenen verilerin münhasıran otomatik sistemler vasıtasıyla analiz edilmesi suretiyle kişinin kendisi aleyhine bir sonucun ortaya çıkmasına itiraz etme',
  'Kişisel verilerin kanuna aykırı olarak işlenmesi sebebiyle zarara uğraması hâlinde zararın giderilmesini talep etme'
]

export interface DataProcessingLog {
  id: string
  userId: string
  dataType: string
  action: 'create' | 'read' | 'update' | 'delete' | 'share'
  purpose: string
  timestamp: Date
  ipAddress: string
  userAgent: string
  legalBasis: string
}

// Helper functions for KVKK compliance
export function generateConsentId(): string {
  return `consent_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

export function logDataProcessing(log: Omit<DataProcessingLog, 'id' | 'timestamp'>): DataProcessingLog {
  return {
    ...log,
    id: `log_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    timestamp: new Date()
  }
}

export function validateConsentVersion(version: string): boolean {
  // Current KVKK policy version
  const currentVersion = '1.0.0'
  return version === currentVersion
}

export function isConsentRequired(dataType: string): boolean {
  const consentRequiredTypes = ['marketing', 'analytics', 'location', 'commercial']
  return consentRequiredTypes.includes(dataType)
}

export function getRetentionPeriod(category: string): string {
  const retentionPeriods: Record<string, string> = {
    identity: '10 yıl',
    contact: '5 yıl',
    financial: '10 yıl',
    location: '20 yıl',
    technical: '2 yıl',
    commercial: '3 yıl'
  }
  
  return retentionPeriods[category] || '5 yıl'
}

// Data anonymization helper
export function anonymizePersonalData(data: any): any {
  const sensitiveFields = ['tcKimlik', 'telefon', 'email', 'adres', 'iban']
  const anonymized = { ...data }
  
  sensitiveFields.forEach(field => {
    if (anonymized[field]) {
      if (field === 'email') {
        const [username, domain] = anonymized[field].split('@')
        anonymized[field] = `${username.substr(0, 2)}***@${domain}`
      } else if (field === 'telefon') {
        anonymized[field] = `0${anonymized[field].substr(1, 3)}***${anonymized[field].substr(-2)}`
      } else if (field === 'tcKimlik') {
        anonymized[field] = `${anonymized[field].substr(0, 3)}*****${anonymized[field].substr(-2)}`
      } else {
        anonymized[field] = '*** Gizli ***'
      }
    }
  })
  
  return anonymized
}

// KVKK request types
export type KVKKRequestType = 
  | 'access'           // Veri portabilitesi
  | 'rectification'    // Düzeltme
  | 'erasure'         // Silme
  | 'portability'     // Taşınabilirlik
  | 'object'          // İtiraz
  | 'complaint'       // Şikayet

export interface KVKKRequest {
  id: string
  userId: string
  requestType: KVKKRequestType
  description: string
  status: 'pending' | 'processing' | 'completed' | 'rejected'
  createdAt: Date
  respondedAt?: Date
  response?: string
  documents?: string[]
}

export function createKVKKRequest(
  userId: string, 
  requestType: KVKKRequestType, 
  description: string
): KVKKRequest {
  return {
    id: `kvkk_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    userId,
    requestType,
    description,
    status: 'pending',
    createdAt: new Date()
  }
}