import * as React from 'react'
import { Document, Page, Text, View, StyleSheet, Svg, Circle, Line, Rect, Font } from '@react-pdf/renderer'

// Register Turkish-compatible fonts with full Unicode support
// Using TTF fonts which are better supported by react-pdf
Font.register({
  family: 'Turkish',
  fonts: [
    {
      src: 'https://fonts.gstatic.com/s/roboto/v30/KFOmCnqEu92Fr1Me5Q.ttf',
      fontWeight: 'normal',
    },
    {
      src: 'https://fonts.gstatic.com/s/roboto/v30/KFOlCnqEu92Fr1MmWUlvAw.ttf',
      fontWeight: 'bold',
    }
  ]
});

// Text encoding and sanitization utilities
const sanitizeText = (text: string | null | undefined): string => {
  if (!text) return ''

  // Fix common Turkish character encoding issues
  return text
    .replace(/Mü_teri/g, 'Müşteri')
    .replace(/Ko_ullar/g, 'Koşullar')
    .replace(/Gü_ne_/g, 'Güneş')
    .replace(/Tü_rki_e/g, 'Türkiye')
    .replace(/Si_temi/g, 'Sistemi')
    .replace(/_/g, '')  // Remove any remaining underscores
    .replace(/º/g, '₺')  // Fix currency symbol
    .normalize('NFC')    // Normalize Unicode
}

const formatTurkishCurrency = (amount: number): string => {
  return `₺${amount.toLocaleString('tr-TR', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  })}`
}

// EnerjiOS Logo Component - Enhanced for better PDF rendering
const EnerjiOSLogo: React.FC<{ width?: number; height?: number }> = ({ width = 120, height = 40 }) => (
  <View style={{ width, height, backgroundColor: 'transparent' }}>
    <Svg viewBox="0 0 300 100" style={{ width, height }}>
      {/* Main solar/energy symbol */}
      <Circle cx="45" cy="50" r="30" fill="#FF6B35" opacity={1}/>
      <Circle cx="45" cy="50" r="25" fill="#F7931E" opacity={0.8}/>
      <Circle cx="45" cy="50" r="20" fill="#FFD23F" opacity={0.6}/>

      {/* Energy rays - simplified for better PDF rendering */}
      <Line x1="45" y1="20" x2="45" y2="30" stroke="white" strokeWidth="3"/>
      <Line x1="65" y1="30" x2="60" y2="35" stroke="white" strokeWidth="3"/>
      <Line x1="70" y1="50" x2="60" y2="50" stroke="white" strokeWidth="3"/>
      <Line x1="65" y1="70" x2="60" y2="65" stroke="white" strokeWidth="3"/>
      <Line x1="45" y1="80" x2="45" y2="70" stroke="white" strokeWidth="3"/>
      <Line x1="25" y1="70" x2="30" y2="65" stroke="white" strokeWidth="3"/>
      <Line x1="20" y1="50" x2="30" y2="50" stroke="white" strokeWidth="3"/>
      <Line x1="25" y1="30" x2="30" y2="35" stroke="white" strokeWidth="3"/>

      {/* Central power symbol - simplified */}
      <Circle cx="45" cy="50" r="6" fill="white" opacity={0.9}/>
    </Svg>
  </View>
)

// Define QuoteData interface for PDF
interface QuoteData {
  id: string
  quoteNumber: string
  customerName: string
  customerEmail: string
  customerPhone?: string
  projectTitle?: string
  systemSize?: number
  panelCount?: number
  capacity?: number
  subtotal: number
  tax: number
  discount: number
  total: number
  laborCost?: number
  status: 'DRAFT' | 'SENT' | 'VIEWED' | 'APPROVED' | 'REJECTED' | 'EXPIRED'
  createdAt: string | Date
  validUntil: string | Date
  version?: number
  items?: QuoteItem[]
  financialAnalysis?: {
    annualProduction: number
    annualSavings: number
    npv25: number
    paybackPeriod: number
    irr: number
  }
  designData?: {
    location: string
    roofArea: number
    tiltAngle: number
    azimuth: number
    irradiance: number
  }
}

interface QuoteItem {
  id: string
  name: string
  type: string
  brand?: string
  quantity: number
  unitPrice: number
  totalPrice: number
  specifications?: {
    power?: number
    efficiency?: number
  }
}

const styles = StyleSheet.create({
  page: {
    fontFamily: 'Turkish',
    fontSize: 10,
    padding: 20,
    lineHeight: 1.3,
  },
  // Header Section - Fixed layout
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 15,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#2563eb',
    minHeight: 45,
  },
  logoSection: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    width: '100%',
  },
  companyInfo: {
    marginLeft: 15,
    flex: 1,
    minWidth: 0,
  },
  companyName: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 3,
  },
  companyNameEnerji: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2C3E50',
    letterSpacing: 0.2,
  },
  companyNameOS: {
    fontSize: 18,
    fontWeight: 300,
    color: '#2E86AB',
    marginLeft: 1,
  },
  companyTagline: {
    fontSize: 9,
    color: '#7F8C8D',
    marginBottom: 2,
    fontWeight: 'normal',
    opacity: 0.8,
  },
  companyContact: {
    fontSize: 7,
    color: '#9ca3af',
    lineHeight: 1.3,
    flexWrap: 'wrap',
  },
  
  // Two column layout - Compact
  twoColumnContainer: {
    flexDirection: 'row',
    marginBottom: 12,
    gap: 15,
  },
  column: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#374151',
    marginBottom: 6,
    paddingBottom: 3,
    borderBottomWidth: 1,
    borderBottomColor: '#d1d5db',
    letterSpacing: 0.2,
  },
  infoRow: {
    flexDirection: 'row',
    marginBottom: 3,
    alignItems: 'flex-start',
  },
  infoLabel: {
    fontSize: 8,
    fontWeight: 'bold',
    color: '#6b7280',
    width: 60,
    lineHeight: 1.2,
  },
  infoValue: {
    fontSize: 8,
    color: '#374151',
    flex: 1,
    lineHeight: 1.2,
  },
  
  // Project title - Compact
  projectTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#1f2937',
    marginBottom: 10,
    letterSpacing: 0.3,
    lineHeight: 1.1,
  },
  
  // System overview cards - Compact
  systemOverview: {
    backgroundColor: '#eff6ff',
    padding: 8,
    marginBottom: 10,
    borderRadius: 4,
  },
  overviewTitle: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#2563eb',
    marginBottom: 6,
  },
  statsContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#ffffff',
    padding: 6,
    borderRadius: 3,
    textAlign: 'center',
  },
  statValue: {
    fontSize: 11,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  statValuePrimary: {
    color: '#2563eb',
  },
  statValueBlue: {
    color: '#3b82f6',
  },
  statValueGreen: {
    color: '#059669',
  },
  statValueOrange: {
    color: '#ea580c',
  },
  statLabel: {
    fontSize: 7,
    color: '#6b7280',
  },
  
  // Technical details - Compact
  technicalDetails: {
    marginBottom: 8,
  },
  detailsGrid: {
    flexDirection: 'row',
    gap: 10,
  },
  detailsColumn: {
    flex: 1,
  },
  
  // Items table - Very compact
  table: {
    marginBottom: 10,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#f8fafc',
    padding: 4,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
  },
  tableRow: {
    flexDirection: 'row',
    padding: 4,
    borderBottomWidth: 0.5,
    borderBottomColor: '#f1f5f9',
    minHeight: 20,
    alignItems: 'center',
  },
  tableCell: {
    fontSize: 8,
    lineHeight: 1.1,
  },
  tableCellProduct: {
    flex: 3,
  },
  tableCellBrand: {
    flex: 1.5,
    textAlign: 'center',
  },
  tableCellQuantity: {
    flex: 1,
    textAlign: 'center',
  },
  tableCellPrice: {
    flex: 1.5,
    textAlign: 'right',
  },
  tableCellTotal: {
    flex: 1.5,
    textAlign: 'right',
    fontWeight: 'bold',
  },
  productName: {
    fontSize: 8,
    fontWeight: 'bold',
    marginBottom: 1,
    color: '#374151',
    lineHeight: 1.1,
  },
  productSpecs: {
    fontSize: 7,
    color: '#6b7280',
    lineHeight: 1.0,
    fontWeight: 'normal',
  },
  
  // Pricing summary - Compact
  pricingSummary: {
    backgroundColor: '#f8fafc',
    padding: 8,
    marginBottom: 10,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 3,
    alignItems: 'center',
  },
  summaryLabel: {
    fontSize: 8,
    color: '#374151',
    fontWeight: 500,
  },
  summaryValue: {
    fontSize: 8,
    color: '#374151',
    fontWeight: 500,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 6,
    paddingTop: 6,
    borderTopWidth: 1,
    borderTopColor: '#2563eb',
    alignItems: 'center',
  },
  totalLabel: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#2563eb',
    letterSpacing: 0.3,
  },
  totalValue: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#2563eb',
    letterSpacing: 0.2,
  },
  
  // Financial analysis - Compact
  financialAnalysis: {
    marginBottom: 8,
  },
  analysisGrid: {
    flexDirection: 'row',
    gap: 6,
  },
  analysisCard: {
    flex: 1,
    padding: 6,
    borderRadius: 3,
    textAlign: 'center',
  },
  analysisCardGreen: {
    backgroundColor: '#f0fdf4',
  },
  analysisCardBlue: {
    backgroundColor: '#eff6ff',
  },
  analysisCardOrange: {
    backgroundColor: '#fff7ed',
  },
  analysisCardPurple: {
    backgroundColor: '#faf5ff',
  },
  analysisValue: {
    fontSize: 9,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  analysisValueGreen: {
    color: '#059669',
  },
  analysisValueBlue: {
    color: '#2563eb',
  },
  analysisValueOrange: {
    color: '#ea580c',
  },
  analysisValuePurple: {
    color: '#9333ea',
  },
  analysisLabel: {
    fontSize: 6,
  },
  analysisLabelGreen: {
    color: '#166534',
  },
  analysisLabelBlue: {
    color: '#1e40af',
  },
  analysisLabelOrange: {
    color: '#9a3412',
  },
  analysisLabelPurple: {
    color: '#7c2d12',
  },
  
  // Notes section - Compact
  notesSection: {
    backgroundColor: '#f9fafb',
    padding: 6,
    marginBottom: 6,
    borderRadius: 3,
  },
  notesTitle: {
    fontSize: 8,
    fontWeight: 'bold',
    marginBottom: 3,
  },
  notesList: {
    fontSize: 7,
    color: '#374151',
  },
  noteItem: {
    marginBottom: 1,
  },
  
  // Terms section - Compact
  termsSection: {
    marginBottom: 8,
  },
  termItem: {
    fontSize: 7,
    color: '#374151',
    marginBottom: 1,
  },
  
  // Footer - Compact
  footer: {
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    paddingTop: 8,
    textAlign: 'center',
  },
  footerMessage: {
    fontSize: 7,
    color: '#6b7280',
    marginBottom: 8,
  },
  signatureContainer: {
    flexDirection: 'row',
    gap: 20,
    marginBottom: 6,
  },
  signatureBox: {
    flex: 1,
    textAlign: 'center',
  },
  signatureTitle: {
    fontSize: 8,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  signatureLine: {
    borderTopWidth: 1,
    borderTopColor: '#9ca3af',
    paddingTop: 3,
    fontSize: 6,
    color: '#6b7280',
  },
  footerCopyright: {
    fontSize: 6,
    color: '#9ca3af',
  },
})

interface QuotePDFProps {
  quote: QuoteData
}

export const QuotePDF: React.FC<QuotePDFProps> = ({ quote }) => {
  const formatDate = (date: string | Date) => {
    const dateObj = typeof date === 'string' ? new Date(date) : date
    return new Intl.DateTimeFormat('tr-TR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    }).format(dateObj)
  }

  const formatCurrency = (amount: number) => {
    return formatTurkishCurrency(amount)
  }

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Company Header with New Logo */}
        <View style={styles.header}>
          <View style={styles.logoSection}>
            <View style={{ width: 85, height: 30, marginRight: 15 }}>
              <EnerjiOSLogo width={80} height={26} />
            </View>
            <View style={styles.companyInfo}>
              <View style={styles.companyName}>
                <Text style={styles.companyNameEnerji}>Enerji</Text>
                <Text style={styles.companyNameOS}>OS</Text>
              </View>
              <Text style={styles.companyTagline}>{sanitizeText('Güneş Enerjisi Yönetim Platformu')}</Text>
              <View style={{ marginTop: 2 }}>
                <Text style={styles.companyContact}>
                  8 Kasım Mah Tekcan Cad 52/A 39750 Lüleburgaz / Kırklareli
                </Text>
                <Text style={styles.companyContact}>
                  +90 541 593 26 55 • +90 288 415 20 05
                </Text>
                <Text style={styles.companyContact}>
                  info@enerjios.com • www.enerjios.com
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Quote and Customer Info */}
        <View style={styles.twoColumnContainer}>
          <View style={styles.column}>
            <Text style={styles.sectionTitle}>{sanitizeText('Teklif Bilgileri')}</Text>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Teklif No:</Text>
              <Text style={styles.infoValue}>{quote.quoteNumber}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Tarih:</Text>
              <Text style={styles.infoValue}>{formatDate(quote.createdAt)}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Geçerlilik:</Text>
              <Text style={styles.infoValue}>{formatDate(quote.validUntil)}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Versiyon:</Text>
              <Text style={styles.infoValue}>v{quote.version}</Text>
            </View>
          </View>
          
          <View style={styles.column}>
            <Text style={styles.sectionTitle}>{sanitizeText('Müşteri Bilgileri')}</Text>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Ad Soyad:</Text>
              <Text style={styles.infoValue}>{sanitizeText(quote.customerName)}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Email:</Text>
              <Text style={styles.infoValue}>{quote.customerEmail}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Telefon:</Text>
              <Text style={styles.infoValue}>{quote.customerPhone || '-'}</Text>
            </View>
            {quote.designData && (
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Konum:</Text>
                <Text style={styles.infoValue}>{quote.designData.location}</Text>
              </View>
            )}
          </View>
        </View>

        {/* Project Title */}
        <Text style={styles.projectTitle}>{quote.projectTitle || ''}</Text>

        {/* System Overview */}
        <View style={styles.systemOverview}>
          <Text style={styles.overviewTitle}>Sistem Özellikleri</Text>
          <View style={styles.statsContainer}>
            <View style={styles.statCard}>
              <Text style={[styles.statValue, styles.statValuePrimary]}>
                {quote.systemSize} kW
              </Text>
              <Text style={styles.statLabel}>Sistem Gücü</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={[styles.statValue, styles.statValueBlue]}>
                {quote.panelCount}
              </Text>
              <Text style={styles.statLabel}>Panel Sayısı</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={[styles.statValue, styles.statValueGreen]}>
                {quote.financialAnalysis?.annualProduction?.toLocaleString() || '0'} kWh
              </Text>
              <Text style={styles.statLabel}>Yıllık Üretim</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={[styles.statValue, styles.statValueOrange]}>
                {quote.financialAnalysis?.paybackPeriod || '0'} Yıl              </Text>
              <Text style={styles.statLabel}>Geri Ödeme Süresi</Text>
            </View>
          </View>
        </View>

        {/* Technical Details */}
        {quote.designData && (
          <View style={styles.technicalDetails}>
            <Text style={styles.sectionTitle}>Teknik Detaylar</Text>
            <View style={styles.detailsGrid}>
              <View style={styles.detailsColumn}>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Konum:</Text>
                  <Text style={styles.infoValue}>{quote.designData.location}</Text>
                </View>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Çatı Alanı:</Text>
                  <Text style={styles.infoValue}>{quote.designData.roofArea} m²</Text>
                </View>
              </View>
              <View style={styles.detailsColumn}>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Güneşlenme:</Text>
                  <Text style={styles.infoValue}>{quote.designData.irradiance} kWh/m²/'yıl</Text>
                </View>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Çatı Eğimi:</Text>
                  <Text style={styles.infoValue}>
                    {quote.designData.tiltAngle}° / Azimuth: {quote.designData.azimuth}°
                  </Text>
                </View>
              </View>
            </View>
          </View>
        )}

        {/* Items Table */}
        <View style={styles.table}>
          <Text style={styles.sectionTitle}>Teklif Detayları</Text>

          {/* Table Header */}
          <View style={styles.tableHeader}>
            <Text style={[styles.tableCell, styles.tableCellProduct]}>Ürün/Hizmet</Text>
            <Text style={[styles.tableCell, styles.tableCellBrand]}>Marka</Text>
            <Text style={[styles.tableCell, styles.tableCellQuantity]}>Adet</Text>
            <Text style={[styles.tableCell, styles.tableCellPrice]}>Birim Fiyat</Text>
            <Text style={[styles.tableCell, styles.tableCellTotal]}>Toplam</Text>
          </View>
          
          {/* Table Rows */}
          {quote.items?.map((item: QuoteItem) => (
            <View key={item.id} style={styles.tableRow}>
              <View style={styles.tableCellProduct}>
                <Text style={styles.productName}>{sanitizeText(item.name)}</Text>
                {item.specifications && (
                  <Text style={styles.productSpecs}>
                    {item.type === 'PANEL' &&
                      `${item.specifications?.power || 0}W - %${item.specifications?.efficiency || 0} verimlilik`}
                    {item.type === 'INVERTER' &&
                      `${(item.specifications?.power || 0)/1000}kW - %${item.specifications?.efficiency || 0} verimlilik`}
                  </Text>
                )}
              </View>
              <Text style={[styles.tableCell, styles.tableCellBrand]}>
                {item.brand || '-'}              </Text>
              <Text style={[styles.tableCell, styles.tableCellQuantity]}>
                {item.quantity}
              </Text>
              <Text style={[styles.tableCell, styles.tableCellPrice]}>
                {formatCurrency(item.unitPrice)}
              </Text>
              <Text style={[styles.tableCell, styles.tableCellTotal]}>
                {formatCurrency(item.totalPrice)}
              </Text>
            </View>
          ))}
          
          {/* Labor Row */}
          <View style={styles.tableRow}>
            <View style={styles.tableCellProduct}>
              <Text style={styles.productName}>{sanitizeText('Kurulum ve İşçilik')}</Text>
              <Text style={styles.productSpecs}>Profesyonel kurulum hizmeti</Text>
            </View>
            <Text style={[styles.tableCell, styles.tableCellBrand]}>-</Text>
            <Text style={[styles.tableCell, styles.tableCellQuantity]}>1</Text>
            <Text style={[styles.tableCell, styles.tableCellPrice]}>
              {formatCurrency(quote.laborCost || 0)}
            </Text>
            <Text style={[styles.tableCell, styles.tableCellTotal]}>
              {formatCurrency(quote.laborCost || 0)}
            </Text>
          </View>
        </View>

        {/* Pricing Summary */}
        <View style={styles.pricingSummary}>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Alt Toplam:</Text>
            <Text style={styles.summaryValue}>{formatCurrency(quote.subtotal)}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>İşçilik:</Text>
            <Text style={styles.summaryValue}>{formatCurrency(quote.laborCost || 0)}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>KDV (%18):</Text>
            <Text style={styles.summaryValue}>{formatCurrency(quote.tax)}</Text>
          </View>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>TOPLAM TUTAR:</Text>
            <Text style={styles.totalValue}>{formatCurrency(quote.total)}</Text>
          </View>
        </View>

        {/* Financial Analysis */}
        {quote.financialAnalysis && (
          <View style={styles.financialAnalysis}>
            <Text style={styles.sectionTitle}>Finansal Analiz & Getiri Hesaplaması</Text>

            <View style={styles.analysisGrid}>
              <View style={[styles.analysisCard, styles.analysisCardGreen]}>
                <Text style={[styles.analysisValue, styles.analysisValueGreen]}>
                  {formatCurrency(quote.financialAnalysis.annualSavings)}
                </Text>
                <Text style={[styles.analysisLabel, styles.analysisLabelGreen]}>
                  'Yıllık Elektrik Tasarrufu                </Text>
              </View>

              <View style={[styles.analysisCard, styles.analysisCardBlue]}>
                <Text style={[styles.analysisValue, styles.analysisValueBlue]}>
                  {formatCurrency(quote.financialAnalysis.npv25)}
                </Text>
                <Text style={[styles.analysisLabel, styles.analysisLabelBlue]}>
                  '25 Yıllık Net Bugünkü Değer                </Text>
              </View>

              <View style={[styles.analysisCard, styles.analysisCardOrange]}>
                <Text style={[styles.analysisValue, styles.analysisValueOrange]}>
                  {quote.financialAnalysis.paybackPeriod} 'Yıl                </Text>
                <Text style={[styles.analysisLabel, styles.analysisLabelOrange]}>
                  'Yatırım Geri Ödeme Süresi                </Text>
              </View>

              <View style={[styles.analysisCard, styles.analysisCardPurple]}>
                <Text style={[styles.analysisValue, styles.analysisValuePurple]}>
                  %{quote.financialAnalysis.irr}
                </Text>
                <Text style={[styles.analysisLabel, styles.analysisLabelPurple]}>
                  'İç Karlılık Oranı (IRR)                </Text>
              </View>
            </View>

            <View style={styles.notesSection}>
              <Text style={styles.notesTitle}>Hesaplama Notları:</Text>
              <View style={styles.notesList}>
                <Text style={styles.noteItem}>• Elektrik fiyatı 2.20 TL/kWh baz alınmıştır</Text>
                <Text style={styles.noteItem}>• Yıllık %5 elektrik fiyat artışı hesaplanmıştır</Text>
                <Text style={styles.noteItem}>• Sistem verimliliği %90 olarak kabul edilmiştir</Text>
                <Text style={styles.noteItem}>• Panel performansı 25 yılda %80\'e düşer varsayımı kullanılmıştır</Text>
              </View>
            </View>
          </View>
        )}

        {/* Terms & Conditions */}
        <View style={styles.termsSection}>
          <Text style={styles.sectionTitle}>Şartlar ve Koşullar</Text>
          <Text style={styles.termItem}>{`• Bu teklif ${formatDate(quote.validUntil)} tarihine kadar geçerlidir.`}</Text>
          <Text style={styles.termItem}>• Fiyatlar KDV dahil olarak gösterilmiştir.</Text>
          <Text style={styles.termItem}>• Kurulum süresi hava koşullarına bağlı olarak 3-5 iş günü arasındadır.</Text>
          <Text style={styles.termItem}>• Paneller için 25 yıl performans garantisi mevcuttur.</Text>
          <Text style={styles.termItem}>• İnverterler için 10 yıl üretici garantisi mevcuttur.</Text>
          <Text style={styles.termItem}>• YEKDEM mevzuatı değişikliklerinden sorumlu değiliz.</Text>
          <Text style={styles.termItem}>• Ödeme koşulları: %50 avans, %50 kurulum tamamlandıktan sonra.</Text>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerMessage}>
            'Bu teklifi kabul ediyorsanız, lütfen imzalayarak bize geri gönderiniz.          </Text>

          <View style={styles.signatureContainer}>
            <View style={styles.signatureBox}>
              <Text style={styles.signatureTitle}>EnerjiOS</Text>
              <Text style={styles.signatureLine}>Yetkili İmza</Text>
            </View>
            <View style={styles.signatureBox}>
              <Text style={styles.signatureTitle}>Müşteri Onayı</Text>
              <Text style={styles.signatureLine}>İmza & Tarih</Text>
            </View>
          </View>

          <Text style={styles.footerCopyright}>
            'Bu teklif EnerjiOS tarafından hazırlanmış olup, tüm hakları saklıdır.          </Text>
        </View>
      </Page>
    </Document>
  )
}

// Project data interface for project reports
interface ProjectData {
  id: string
  name: string
  type?: string
  status?: string
  capacity?: number
  estimatedCost?: number
  actualCost?: number
  description?: string
  createdAt?: string | Date
  customer?: {
    firstName?: string
    lastName?: string
    companyName?: string
    email?: string
    phone?: string
  }
  location?: {
    address?: string
    city?: string
    district?: string
  }
  company?: {
    name?: string
  }
}

interface ProjectPDFProps {
  project: ProjectData
}

export const ProjectPDF: React.FC<ProjectPDFProps> = ({ project }) => {
  const formatDate = (date?: string | Date) => {
    if (!date) return 'N/A'
    const dateObj = typeof date === 'string' ? new Date(date) : date
    return new Intl.DateTimeFormat('tr-TR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    }).format(dateObj)
  }

  const formatCurrency = (amount: number) => {
    return formatTurkishCurrency(amount)
  }

  const getCustomerName = () => {
    if (project.customer?.companyName) {
      return project.customer.companyName
    }
    const firstName = project.customer?.firstName || ''
    const lastName = project.customer?.lastName || ''
    return `${firstName} ${lastName}`.trim() || 'N/A'
  }

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Company Header with New Logo */}
        <View style={styles.header}>
          <View style={styles.logoSection}>
            <View style={{ width: 85, height: 30, marginRight: 15 }}>
              <EnerjiOSLogo width={80} height={26} />
            </View>
            <View style={styles.companyInfo}>
              <View style={styles.companyName}>
                <Text style={styles.companyNameEnerji}>Enerji</Text>
                <Text style={styles.companyNameOS}>OS</Text>
              </View>
              <Text style={styles.companyTagline}>{sanitizeText('Güneş Enerjisi Yönetim Platformu')}</Text>
              <View style={{ marginTop: 2 }}>
                <Text style={styles.companyContact}>
                  8 Kasım Mah Tekcan Cad 52/A 39750 Lüleburgaz / Kırklareli
                </Text>
                <Text style={styles.companyContact}>
                  +90 541 593 26 55 • +90 288 415 20 05
                </Text>
                <Text style={styles.companyContact}>
                  info@enerjios.com • www.enerjios.com
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Document Title */}
        <View style={{ marginTop: 20, marginBottom: 30 }}>
          <Text style={[styles.projectTitle, { fontSize: 24, color: '#2563eb' }]}>PROJE RAPORU</Text>
        </View>

        {/* Project and Customer Info */}
        <View style={styles.twoColumnContainer}>
          <View style={styles.column}>
            <Text style={styles.sectionTitle}>Proje Bilgileri</Text>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Proje ID:</Text>
              <Text style={styles.infoValue}>{project.id}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Proje Adı:</Text>
              <Text style={styles.infoValue}>{project.name}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Tarih:</Text>
              <Text style={styles.infoValue}>{formatDate(new Date())}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Durum:</Text>
              <Text style={styles.infoValue}>{project.status || 'N/A'}</Text>
            </View>
          </View>

          <View style={styles.column}>
            <Text style={styles.sectionTitle}>{sanitizeText('Müşteri Bilgileri')}</Text>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Müşteri:</Text>
              <Text style={styles.infoValue}>{getCustomerName()}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Email:</Text>
              <Text style={styles.infoValue}>{project.customer?.email || 'N/A'}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Telefon:</Text>
              <Text style={styles.infoValue}>{project.customer?.phone || 'N/A'}</Text>
            </View>
          </View>
        </View>

        {/* Project Details */}
        <View style={styles.systemOverview}>
          <Text style={styles.overviewTitle}>Proje Detayları</Text>
          <View style={styles.statsContainer}>
            <View style={styles.statCard}>
              <Text style={[styles.statValue, styles.statValuePrimary]}>
                {project.type || 'N/A'}              </Text>
              <Text style={styles.statLabel}>Proje Tipi</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={[styles.statValue, styles.statValueBlue]}>
                {project.capacity || 0} kW
              </Text>
              <Text style={styles.statLabel}>Sistem Gücü</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={[styles.statValue, styles.statValueGreen]}>
                {formatCurrency(project.estimatedCost || 0)}
              </Text>
              <Text style={styles.statLabel}>Tahmini Maliyet</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={[styles.statValue, styles.statValueOrange]}>
                {formatCurrency(project.actualCost || 0)}
              </Text>
              <Text style={styles.statLabel}>Gerçek Maliyet</Text>
            </View>
          </View>
        </View>

        {/* Location Information */}
        {project.location && (
          <View style={styles.technicalDetails}>
            <Text style={styles.sectionTitle}>Konum Bilgileri</Text>
            <View style={styles.detailsGrid}>
              <View style={styles.detailsColumn}>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Adres:</Text>
                  <Text style={styles.infoValue}>{project.location.address || 'N/A'}</Text>
                </View>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Şehir:</Text>
                  <Text style={styles.infoValue}>{project.location.city || 'N/A'}</Text>
                </View>
              </View>
              <View style={styles.detailsColumn}>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>İlçe:</Text>
                  <Text style={styles.infoValue}>{project.location.district || 'N/A'}</Text>
                </View>
              </View>
            </View>
          </View>
        )}

        {/* Financial Summary */}
        <View style={styles.pricingSummary}>
          <Text style={styles.sectionTitle}>Finansal Özet</Text>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Tahmini Maliyet:</Text>
            <Text style={styles.summaryValue}>{formatCurrency(project.estimatedCost || 0)}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Gerçek Maliyet:</Text>
            <Text style={styles.summaryValue}>{formatCurrency(project.actualCost || 0)}</Text>
          </View>
          {project.estimatedCost && project.actualCost && (
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>FARK:</Text>
              <Text style={[styles.totalValue, { 
                color: project.actualCost > project.estimatedCost ? '#ef4444' : '#22c55e' 
              }]}>
                {formatCurrency(Math.abs(project.actualCost - project.estimatedCost))}
                {project.actualCost > project.estimatedCost ? ' (Fazla)' : ' (Tasarruf)'}              </Text>
            </View>
          )}
        </View>

        {/* Project Description */}
        {project.description && (
          <View style={styles.termsSection}>
            <Text style={styles.sectionTitle}>Proje Açıklaması</Text>
            <Text style={[styles.termItem, { lineHeight: 1.5 }]}>{project.description}</Text>
          </View>
        )}

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerMessage}>
            Bu rapor {formatDate(new Date())} tarihinde oluşturulmuştur.
          </Text>
          
          <View style={styles.signatureContainer}>
            <View style={styles.signatureBox}>
              <Text style={styles.signatureTitle}>EnerjiOS</Text>
              <Text style={styles.signatureLine}>Proje Sorumlusu</Text>
            </View>
            <View style={styles.signatureBox}>
              <Text style={styles.signatureTitle}>Müşteri Onayı</Text>
              <Text style={styles.signatureLine}>İmza & Tarih</Text>
            </View>
          </View>

          <Text style={styles.footerCopyright}>
            Bu rapor EnerjiOS tarafından hazırlanmış olup, tüm hakları saklıdır.
          </Text>
        </View>
      </Page>
    </Document>
  )
}

// Export as default for easier importing
export default { QuotePDF, ProjectPDF }