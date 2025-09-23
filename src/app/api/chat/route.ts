import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '')

// Contact request detection keywords
const contactRequestKeywords = [
  'randevu', 'görüşme', 'iletişim', 'arayın', 'telefon', 'uzman', 'danışman',
  'keşif', 'ölçüm', 'gelelim', 'görüşelim', 'konuşalım', 'bilgi alabilir miyim',
  'nasıl ulaşabilirim', 'nasıl randevu', 'nasıl iletişime geçebilirim', 'nasıl iletişime geçeceğim',
  'iletişim bilgileriniz', 'sizinle nasıl', 'sizimle nasıl', 'nasıl görüşebilirim',
  'teklif alabilir miyim', 'fiyat öğrenebilir miyim', 'size ulaşabilirim',
  'beni arayabilir misiniz', 'sizi nasıl ararım'
]

// Function to detect contact request intent
function detectContactRequest(message: string): boolean {
  const lowerMessage = message.toLowerCase()
  return contactRequestKeywords.some(keyword => lowerMessage.includes(keyword))
}

// Function to detect if user is providing contact information
function detectUserInfo(message: string): boolean {
  const lowerMessage = message.toLowerCase()

  // Common Turkish cities
  const cities = [
    'istanbul', 'ankara', 'izmir', 'bursa', 'adana', 'gaziantep', 'konya',
    'antalya', 'diyarbakır', 'mersin', 'kayseri', 'eskişehir', 'urfa',
    'samsun', 'denizli', 'trabzon', 'kocaeli', 'malatya', 'erzurum',
    'tekirdağ', 'lüleburgaz', 'çorlu', 'edirne', 'kırklareli'
  ]

  // Check if message contains city names
  const hasCity = cities.some(city => lowerMessage.includes(city))

  // Check if message looks like name format (2-3 words, mostly letters)
  const words = message.trim().split(/\s+/)
  const hasNameFormat = words.length >= 2 && words.length <= 4 &&
    words.every(word => /^[a-zA-ZÇĞİÖŞÜçğıöşü]+$/.test(word))

  // Check if contains phone number pattern
  const hasPhone = /[\d\s\(\)\-\+]{10,}/.test(message)

  // Check if contains email
  const hasEmail = /@/.test(message)

  return hasCity || hasNameFormat || hasPhone || hasEmail
}

// Function to parse user information from message
function parseUserInfo(message: string) {
  const lowerMessage = message.toLowerCase()
  const words = message.trim().split(/\s+/)

  // Common Turkish cities
  const cities = [
    'istanbul', 'ankara', 'izmir', 'bursa', 'adana', 'gaziantep', 'konya',
    'antalya', 'diyarbakır', 'mersin', 'kayseri', 'eskişehir', 'urfa',
    'samsun', 'denizli', 'trabzon', 'kocaeli', 'malatya', 'erzurum',
    'tekirdağ', 'lüleburgaz', 'çorlu', 'edirne', 'kırklareli'
  ]

  const result = {
    name: '',
    phone: '',
    email: '',
    city: '',
    fullMessage: message
  }

  // Extract city
  const foundCity = cities.find(city => lowerMessage.includes(city))
  if (foundCity) {
    result.city = foundCity.charAt(0).toUpperCase() + foundCity.slice(1)
  }

  // Extract phone number
  const phoneMatch = message.match(/[\d\s\(\)\-\+]{10,}/)
  if (phoneMatch) {
    result.phone = phoneMatch[0].replace(/\s/g, '')
  }

  // Extract email
  const emailMatch = message.match(/\S+@\S+\.\S+/)
  if (emailMatch) {
    result.email = emailMatch[0]
  }

  // Extract name (assume first 2-3 words are name if they're letters only)
  if (words.length >= 2) {
    const nameWords = words.filter(word => /^[a-zA-ZÇĞİÖŞÜçğıöşü]+$/.test(word))
    if (nameWords.length >= 2) {
      result.name = nameWords.slice(0, 3).join(' ')
    }
  }

  return result
}

// Knowledge base for rule-based responses
const knowledgeBase = {
  'ges-info': {
    keywords: ['ges', 'güneş enerjisi', 'solar', 'panel', 'sistem nedir', 'nasıl çalışır'],
    response: `🌞 **GES (Güneş Enerji Sistemi) Nedir?**

GES, güneş ışığını elektrik enerjisine dönüştüren sistemlerdir. Temel bileşenleri:

• **Solar Paneller**: Güneş ışığını elektriğe çevirir
• **İnvertör**: DC elektriği AC'ye dönüştürür
• **Montaj Sistemi**: Panelleri sabitler
• **Kablolama**: Sistemi birbirine bağlar
• **İzleme Sistemi**: Üretimi takip eder

**Avantajları:**
✅ Elektrik faturanızı %90'a kadar azaltır
✅ 25+ yıl garanti ile uzun ömürlü
✅ Çevre dostu ve sürdürülebilir
✅ Gayrimenkul değerinizi %15-20 artırır
✅ Bakım maliyeti çok düşük

**Verimlilik:**
📊 Türkiye'de yıllık 1600-1800 kWh/kWp üretim
📊 Geri ödeme süresi: 4-6 yıl

Daha detaylı bilgi için uzmanlarımızla görüşebilirsiniz!`
  },
  'agricultural': {
    keywords: ['tarım', 'sulama', 'tarımsal', 'çiftlik', 'sera'],
    response: `🌾 **Tarımsal GES Sistemleri**

**Tarımsal Sulama GES Avantajları:**
• Elektrik altyapısı olmayan arazilerde sulama imkanı
• Sulama maliyetlerini %95 azaltır
• Devlet teşvikleri ve hibelerden yararlanma
• Pompaj sistemleri için ideal çözüm

**Uygulama Alanları:**
🚜 Damla sulama sistemleri
🚜 Yağmurlama sistemleri
🚜 Sera iklimlendirme
🚜 Soğuk hava depoları
🚜 Hayvan barınakları

**Sistem Özellikleri:**
• 5kW - 500kW arası kapasiteler
• Akıllı sulama otomasyonu
• Uzaktan izleme ve kontrol
• Bataryalı veya bataryasız çözümler

**Devlet Destekleri:**
💰 TKDK hibeleri (%50-70)
💰 Ziraat Bankası düşük faizli krediler
💰 Tarım Bakanlığı destekleri

Ücretsiz arazi keşfi için randevu alın!`
  },
  'price-calc': {
    keywords: ['fiyat', 'maliyet', 'hesaplama', 'kaç para', 'ücret'],
    response: `💰 **GES Sistem Fiyatlandırması**

Fiyat, birçok faktöre bağlıdır:

**Temel Faktörler:**
• Ev büyüklüğü ve elektrik tüketimi
• Çatı tipi ve yönü
• Panel kalitesi ve markası
• Kurulum zorluğu

**Ortalama Fiyatlar (2024):**
• **Ev tipi (3-5kW)**: 45.000₺ - 75.000₺
• **Villa tipi (5-10kW)**: 75.000₺ - 150.000₺
• **İşyeri tipi (10kW+)**: 150.000₺+

**Teşvikler:**
🎯 KDV %1 (normal %20 yerine)
🎯 Belediye teşvikleri mevcut

Kesin fiyat için ücretsiz keşif hizmeti sunuyoruz!`
  },
  'installation': {
    keywords: ['kurulum süreci', 'montaj süreci', 'kurulum', 'montaj', 'süreç', 'adımlar'],
    response: `🔧 **GES Kurulum Süreci**

**1. Ön İnceleme (1 gün)**
• Ücretsiz keşif
• Çatı analizi
• Elektrik altyapısı kontrolü

**2. Proje Tasarımı (2-3 gün)**
• 3D çatı modelleme
• Verimlilik hesaplaması
• Teknik çizimler

**3. İzin İşlemleri (7-15 gün)**
• Belediye izni
• EPDK başvurusu
• Elektrik dağıtım şirketi

**4. Kurulum (1-2 gün)**
• Panel montajı
• İnvertör kurulumu
• Elektrik bağlantıları

**5. Devreye Alma (1-7 gün)**
• Test ve kontrol
• Resmi onaylar
• Sistem aktifleştirme

**Toplam Süre:** 2-4 hafta`
  },
  'contact': {
    keywords: ['iletişim bilgileriniz', 'nasıl iletişime geçebilirim', 'nasıl iletişime geçeceğim', 'sizinle nasıl', 'sizimle nasıl', 'iletişim', 'randevu', 'görüşme', 'uzman', 'danışman'],
    response: `📞 **Size Ulaşalım!**

Size en iyi hizmeti verebilmek ve özel teklifler sunabilmek için iletişim bilgilerinize ihtiyacım var.

**🎯 Lütfen şu bilgileri paylaşır mısınız:**
• Adınız ve soyadınız
• Telefon numaranız
• E-posta adresiniz (isteğe bağlı)
• Hangi şehirdesiniz

**✅ Bizi tercih etmenizin avantajları:**
• Ücretsiz keşif ve ölçüm
• Size özel sistem tasarımı
• 3D proje sunumu
• Detaylı maliyet analizi
• Özel indirim teklifleri

Bilgilerinizi paylaştığınızda uzmanlarımız 24 saat içinde sizinle iletişime geçecek! 🌞`
  },
  'efficiency': {
    keywords: ['verim', 'üretim', 'kazanç', 'tasarruf', 'amortisman'],
    response: `📊 **GES Verimlilik ve Kazanç Analizi**

**Üretim Kapasitesi:**
• 1 kWp sistem yıllık 1600-1800 kWh üretir
• 5 kWp ev tipi sistem: 8000-9000 kWh/yıl
• Günlük ortalama: 4-5 saat tam kapasite

**Tasarruf Hesabı:**
💡 Ortalama ev tüketimi: 300-500 kWh/ay
💰 Aylık fatura: 500-800 TL
✅ GES ile tasarruf: %85-95
📈 Yıllık kazanç: 6000-10000 TL

**Geri Ödeme Süresi:**
• Ev tipi: 4-5 yıl
• İşyeri: 3-4 yıl
• Tarımsal: 2-3 yıl (hibelerle)

**25 Yıllık Kazanç:**
• Toplam üretim: 200.000+ kWh
• Toplam tasarruf: 250.000+ TL
• CO2 azaltımı: 100+ ton

Kendi çatınız için özel hesaplama yapalım!`
  },
  'maintenance': {
    keywords: ['bakım', 'temizlik', 'arıza', 'servis', 'garanti'],
    response: `🔧 **GES Bakım ve Garanti**

**Bakım Gereksinimleri:**
• Yılda 2 kez panel temizliği
• 6 ayda bir görsel kontrol
• Yıllık profesyonel bakım
• Otomatik uzaktan izleme

**Garanti Kapsamı:**
📋 Panel: 25 yıl performans garantisi
📋 İnvertör: 5-10 yıl ürün garantisi
📋 İşçilik: 10 yıl montaj garantisi
📋 Yapısal: 15 yıl paslanmazlık

**Bakım Maliyeti:**
• Yıllık ortalama: 500-1000 TL
• Panel ömrü: 30+ yıl
• İnvertör ömrü: 15-20 yıl

**7/24 Teknik Destek:**
🔴 Arıza durumunda 24 saat içinde müdahale
🟢 Uzaktan izleme ve uyarı sistemi
🔵 Periyodik performans raporları

Bakım paketi için teklif alın!`
  }
}

// Rule-based response checker
function getRuleBasedResponse(message: string): string | null {
  const lowerMessage = message.toLowerCase()
  
  for (const [key, data] of Object.entries(knowledgeBase)) {
    if (data.keywords.some(keyword => lowerMessage.includes(keyword))) {
      return data.response
    }
  }
  
  return null
}

// Gemini AI response
async function getGeminiResponse(message: string, conversationHistory: any[]): Promise<string> {
  // Check if API key is available
  if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === 'your_gemini_api_key_here') {
    return getFallbackResponse(message)
  }

  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' })
    
    // Create context for Gemini
    const context = `Sen EnerjiOS şirketinin güneş enerjisi uzmanısın. Müşterilere GES (Güneş Enerji Sistemleri) hakkında detaylı ve doğru bilgi veriyorsun.

Şirket Bilgileri:
- EnerjiOS: Türkiye'nin lider GES kurulum şirketi
- 10+ yıl deneyim, 2000+ başarılı proje
- Ev, villa, işyeri, fabrika ve tarımsal GES sistemleri
- Ücretsiz keşif, 3D proje tasarımı ve danışmanlık
- 25 yıl panel, 10 yıl işçilik garantisi
- A+ kalite Tier 1 paneller (Jinko, Canadian Solar, Trina)
- Huawei, SMA, Fronius invertörler

Uzmanlık Alanların:
1. GES sistem tasarımı ve verimliliği
2. Tarımsal sulama sistemleri
3. On-grid, off-grid ve hibrit sistemler
4. Bataryalı enerji depolama çözümleri
5. Elektrik faturası analizi ve tasarruf hesaplama
6. Devlet teşvikleri ve finansman seçenekleri
7. İzin süreçleri ve yasal prosedürler

Görevin:
- Türkçe yanıt ver, samimi ama profesyonel ol
- GES hakkında DOĞRU ve GÜNCEL bilgi ver
- Teknik soruları detaylı açıkla
- Rakamsal veriler kullan (verim, tasarruf, süre)
- Her zaman müşteri faydasını ön planda tut
- Fiyat sorularında ortalama fiyat ver, keşif öner
- Müşteriyi bilgilendirdikten sonra iletişime teşvik et
- ASLA yanlış veya yanıltıcı bilgi verme

Önceki konuşma: ${JSON.stringify(conversationHistory.slice(-3))}

Müşteri sorusu: ${message}`

    const result = await model.generateContent(context)
    const response = await result.response
    return response.text()
    
  } catch (error) {
    console.error('Gemini API error:', error)
    return getFallbackResponse(message)
  }
}

// Fallback response when AI is not available
function getFallbackResponse(message: string): string {
  const lowerMessage = message.toLowerCase()

  if (lowerMessage.includes('merhaba') || lowerMessage.includes('selam')) {
    return `Merhaba! 👋 Ben EnerjiOS güneş enerjisi uzmanıyım. Size nasıl yardımcı olabilirim?

Hızlı bilgi almak isterseniz:
• GES sistemleri ve avantajları
• Tarımsal sulama çözümleri
• Maliyet ve tasarruf hesabı
• Kurulum süreci

Herhangi bir sorunuzu yanıtlamaya hazırım!`
  }

  if (lowerMessage.includes('teşekkür') || lowerMessage.includes('sağol')) {
    return 'Rica ederim! 😊 Başka sorularınız olursa çekinmeden sorabilirsiniz. Size en iyi çözümü sunmak için buradayım.'
  }

  if (lowerMessage.includes('güle güle') || lowerMessage.includes('görüşürüz') || lowerMessage.includes('iyi günler')) {
    return 'Görüşmek üzere! 🌞 GES ile tasarruf etmeyi unutmayın. Detaylı bilgi için 0850 XXX XX XX'
  }

  // Tarımsal sulama fallback
  if (lowerMessage.includes('tarım') || lowerMessage.includes('sulama')) {
    return `🌾 **Tarımsal Sulama GES Sistemleri**

Elektrik altyapısı olmayan arazileriniz için ideal çözüm!

• Sulama maliyetlerini %95 azaltır
• TKDK hibelerinden %50-70 destek
• Damla ve yağmurlama sistemleri
• 5kW - 500kW arası kapasiteler
• Uzaktan kontrol ve otomasyon

Ücretsiz arazi keşfi için bilgilerinizi bırakır mısınız?`
  }

  return `"${message}" konusunda size detaylı bilgi verebilmek için iletişim bilgilerinize ihtiyacım var.

**📋 Lütfen paylaşır mısınız:**
• Adınız ve soyadınız
• Telefon numaranız
• E-posta adresiniz (isteğe bağlı)
• Hangi şehirdesiniz

**✅ Size özel olarak sunacağımız hizmetler:**
• ${message} hakkında detaylı danışmanlık
• Ücretsiz keşif ve ölçüm
• Size özel proje tasarımı
• Maliyet analizi ve özel teklifler

Bilgilerinizi aldığımızda uzmanlarımız size 24 saat içinde geri dönüş yapacak! 🌞`
}

export async function POST(request: NextRequest) {
  try {
    const { message, isQuickReply, conversationHistory } = await request.json()

    if (!message || typeof message !== 'string') {
      return NextResponse.json(
        { error: 'Mesaj gerekli' },
        { status: 400 }
      )
    }

    // Check if user is providing contact information
    const isUserInfo = detectUserInfo(message)

    // If user is providing info, handle it specially
    if (isUserInfo) {
      // Send the user info to contact API for processing
      try {
        const userInfoData = parseUserInfo(message)
        await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/chatbot/user-info`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            message,
            parsedInfo: userInfoData,
            timestamp: new Date().toISOString(),
            conversationHistory: conversationHistory || []
          })
        })
      } catch (error) {
        console.error('Failed to process user info:', error)
      }

      // Return thank you message
      return NextResponse.json({
        response: `✅ **Teşekkür ederim!**

Bilgilerinizi aldım! Uzman ekibimiz en kısa sürede sizinle iletişime geçecek.

**📞 İletişim Süreci:**
• 24 saat içinde arama
• Ücretsiz keşif randevusu
• Size özel proje sunumu
• Detaylı maliyet analizi

Bu arada GES sistemleri hakkında merak ettiğiniz başka konular var mı? Size yardımcı olmaya devam edebilirim! 🌞`,
        type: 'text',
        timestamp: new Date().toISOString(),
        userInfoDetected: true
      })
    }

    // Check if this is a contact request
    const isContactRequest = detectContactRequest(message)

    // If contact request detected, send notification email
    if (isContactRequest) {
      try {
        await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/chatbot/contact-request`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            message,
            timestamp: new Date().toISOString(),
            conversationHistory: conversationHistory || []
          })
        })
      } catch (error) {
        console.error('Failed to send contact request notification:', error)
      }
    }

    // First try rule-based response
    let response = getRuleBasedResponse(message)

    // If no rule-based response found, use Gemini AI
    if (!response) {
      response = await getGeminiResponse(message, conversationHistory || [])
    }

    // Add contact suggestion for certain keywords
    if (message.toLowerCase().includes('fiyat') ||
        message.toLowerCase().includes('randevu') ||
        message.toLowerCase().includes('keşif')) {
      response += '\n\n📞 Detaylı bilgi ve ücretsiz keşif için hemen arayın: 0850 XXX XX XX'
    }

    return NextResponse.json({
      response,
      type: 'text',
      timestamp: new Date().toISOString(),
      contactRequestDetected: isContactRequest
    })

  } catch (error) {
    console.error('Chat API error:', error)
    return NextResponse.json(
      { error: 'Sunucu hatası' },
      { status: 500 }
    )
  }
}