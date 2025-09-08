import { Metadata } from 'next'

// Base SEO configuration
const baseUrl = process.env.NEXT_PUBLIC_DOMAIN || 'https://enerjios.com'
const siteName = 'EnerjiOS'
const siteDescription = 'Türkiye\'nin en gelişmiş güneş enerjisi platformu. 3D tasarım, finansman çözümleri ve agrovoltaik sistemler ile sürdürülebilir enerji geleceğinizi planlayın.'

export const defaultSEO: Metadata = {
  title: {
    template: `%s | ${siteName}`,
    default: `${siteName} - Güneş Enerjisi Sistemi Tasarım ve Finansman Platformu`,
  },
  description: siteDescription,
  applicationName: siteName,
  authors: [{ name: 'EnerjiOS Team' }],
  generator: 'Next.js',
  keywords: [
    'güneş enerjisi',
    'solar panel',
    'GES',
    'agrovoltaik',
    'finansman',
    '3D tasarım',
    'Türkiye',
    'yenilenebilir enerji',
    'çiftçi',
    'tarım',
    'enerji tasarrufu',
    'çevre dostu',
    'solar hesaplayıcı'
  ],
  referrer: 'origin-when-cross-origin',
  creator: 'EnerjiOS',
  publisher: 'EnerjiOS',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL(baseUrl),
  alternates: {
    canonical: baseUrl,
    languages: {
      'tr-TR': baseUrl,
    },
  },
  openGraph: {
    type: 'website',
    siteName,
    title: `${siteName} - Güneş Enerjisi Platformu`,
    description: siteDescription,
    url: baseUrl,
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'EnerjiOS Platform',
      },
    ],
    locale: 'tr_TR',
  },
  twitter: {
    card: 'summary_large_image',
    site: '@trakyasolar',
    creator: '@trakyasolar',
    title: `${siteName} - Güneş Enerjisi Platformu`,
    description: siteDescription,
    images: ['/twitter-image.jpg'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: process.env.GOOGLE_SITE_VERIFICATION,
    yandex: process.env.YANDEX_VERIFICATION,
  },
}

// Page-specific SEO generators
export function generateHomeSEO(): Metadata {
  return {
    title: 'Güneş Enerjisi Sistemi Tasarım ve Finansman Platformu',
    description: 'Türkiye\'nin en gelişmiş güneş enerjisi platformu ile 3D tasarım yapın, finansman bulun ve agrovoltaik sistemlerle çiftçiliği modernleştirin. Ücretsiz hesaplama ve teklif.',
    keywords: [
      'güneş enerjisi hesaplayıcı',
      'solar panel fiyat',
      'GES kurulum',
      'agrovoltaik sistem',
      'çiftçi güneş enerjisi',
      'solar kredi',
      'ücretsiz solar teklif'
    ],
    openGraph: {
      title: 'EnerjiOS - Güneş Enerjisinin Geleceği',
      description: 'Ücretsiz 3D tasarım, finansman çözümleri ve agrovoltaik sistemler. Güneş enerjisi yolculuğunuzu bugün başlatın.',
      images: ['/og-home.jpg'],
    },
  }
}

export function generateCalculatorSEO(): Metadata {
  return {
    title: 'Ücretsiz Güneş Enerjisi Hesaplayıcı',
    description: 'Güneş enerjisi sistemi maliyetini ve getirisini hesaplayın. 3D tasarım aracı, finansman seçenekleri ve detaylı analiz. Hemen ücretsiz teklif alın.',
    keywords: [
      'güneş enerjisi hesaplayıcı',
      'solar hesaplama',
      'GES maliyet',
      'solar panel hesaplama',
      'enerji tasarruf hesabı',
      '3D solar tasarım'
    ],
    openGraph: {
      title: 'Güneş Enerjisi Hesaplayıcı - Ücretsiz Analiz',
      description: 'Güneş enerjisi sisteminizin maliyetini ve getirisini dakikalar içinde hesaplayın.',
      images: ['/og-calculator.jpg'],
    },
  }
}

export function generateAgriSolarSEO(): Metadata {
  return {
    title: 'Agrovoltaik Sistem - Tarım + Enerji İkili Gelir',
    description: 'Türkiye\'nin ilk agrovoltaik platformu ile tarım yaparak enerji üretin. Çiftçilere özel finansman ve ürün uyumluluk analizi. Gelirini iki katına çıkar.',
    keywords: [
      'agrovoltaik sistem',
      'çiftçi güneş enerjisi',
      'tarım enerji',
      'sera üzeri solar',
      'ahır çatısı GES',
      'çiftçi kredi',
      'tarımsal güneş enerjisi',
      'ikili gelir'
    ],
    openGraph: {
      title: 'Agrovoltaik - Çiftçinin Geleceği',
      description: 'Tarım yaparken enerji üretin, gelirini iki katına çıkarın. Türkiye\'nin ilk agrovoltaik platformu.',
      images: ['/og-agri.jpg'],
    },
  }
}

export function generateFinancingSEO(): Metadata {
  return {
    title: 'Güneş Enerjisi Kredisi ve Finansman Çözümleri',
    description: 'Türk bankalarından güneş enerjisi kredisi al. İş Bankası, Garanti, Ziraat Bankası ile kredi karşılaştır. Devlet teşvikleri ve YEKDEM hesapları.',
    keywords: [
      'güneş enerjisi kredisi',
      'GES finansman',
      'solar kredi',
      'banka karşılaştırma',
      'YEKDEM hesaplama',
      'devlet teşvikleri',
      'KOSGEB desteği',
      'tarımsal kredi'
    ],
    openGraph: {
      title: 'Güneş Enerjisi Finansman - En Uygun Kredi',
      description: 'Türk bankalarından güneş enerjisi kredisi karşılaştır, devlet teşviklerinden yararlan.',
      images: ['/og-financing.jpg'],
    },
  }
}

// Structured data generators
export function generateOrganizationJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: siteName,
    url: baseUrl,
    logo: `${baseUrl}/logo.png`,
    description: siteDescription,
    contactPoint: {
      '@type': 'ContactPoint',
      telephone: '+90-850-XXX-XXXX',
      contactType: 'customer service',
      availableLanguage: 'Turkish',
    },
    sameAs: [
      'https://facebook.com/trakyasolar',
      'https://instagram.com/trakyasolar',
      'https://linkedin.com/company/trakyasolar',
    ],
    address: {
      '@type': 'PostalAddress',
      addressCountry: 'TR',
      addressRegion: 'Trakya',
      addressLocality: 'Edirne',
    },
  }
}

export function generateWebsiteJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: siteName,
    url: baseUrl,
    description: siteDescription,
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${baseUrl}/search?q={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  }
}

export function generateProductJsonLd(product: {
  name: string
  description: string
  price: number
  currency: string
  availability: string
  image: string
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.description,
    image: product.image,
    offers: {
      '@type': 'Offer',
      price: product.price,
      priceCurrency: product.currency,
      availability: `https://schema.org/${product.availability}`,
      seller: {
        '@type': 'Organization',
        name: siteName,
      },
    },
  }
}

export function generateServiceJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: 'Güneş Enerjisi Sistemi Tasarım ve Kurulum',
    description: 'Profesyonel güneş enerjisi sistemi tasarım, finansman ve kurulum hizmetleri',
    provider: {
      '@type': 'Organization',
      name: siteName,
    },
    serviceType: 'Güneş Enerjisi Hizmetleri',
    areaServed: 'Turkey',
    hasOfferCatalog: {
      '@type': 'OfferCatalog',
      name: 'Güneş Enerjisi Hizmetleri',
      itemListElement: [
        {
          '@type': 'Offer',
          itemOffered: {
            '@type': 'Service',
            name: '3D Sistem Tasarımı',
          },
        },
        {
          '@type': 'Offer',
          itemOffered: {
            '@type': 'Service',
            name: 'Finansman Danışmanlığı',
          },
        },
        {
          '@type': 'Offer',
          itemOffered: {
            '@type': 'Service',
            name: 'Agrovoltaik Sistemler',
          },
        },
      ],
    },
  }
}

// Sitemap generation data
export const sitePages = [
  { url: '/', priority: 1.0, changefreq: 'daily' },
  { url: '/dashboard', priority: 0.9, changefreq: 'weekly' },
  { url: '/dashboard/agri-solar', priority: 0.9, changefreq: 'weekly' },
  { url: '/dashboard/financing', priority: 0.8, changefreq: 'weekly' },
  { url: '/dashboard/quotes', priority: 0.7, changefreq: 'weekly' },
  { url: '/auth/signin', priority: 0.6, changefreq: 'monthly' },
  { url: '/auth/signup', priority: 0.6, changefreq: 'monthly' },
]