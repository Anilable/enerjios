'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { 
  Download,
  Send,
  Edit,
  Printer,
  Share,
  CheckCircle,
  Calendar,
  User,
  MapPin,
  Zap,
  Calculator,
  TrendingUp,
  FileText,
  Sun
} from 'lucide-react'
// Define QuoteData interface locally since it's used in multiple components
interface QuoteData {
  id: string
  quoteNumber: string
  projectRequestId?: string
  customerName: string
  customerEmail: string
  customerPhone?: string
  customerId?: string
  projectType?: string
  projectTitle?: string
  systemSize?: number
  panelCount?: number
  capacity?: number
  subtotal: number
  tax: number
  discount: number
  total: number
  laborCost?: number
  margin?: number
  status: 'DRAFT' | 'SENT' | 'VIEWED' | 'APPROVED' | 'REJECTED' | 'EXPIRED'
  createdAt: string | Date
  validUntil: string | Date
  version?: number
  items?: QuoteItem[]
  profitAmount?: number
  financialAnalysis?: {
    annualProduction: number
    annualSavings: number
    npv25: number
    paybackPeriod: number
    irr: number
  }
  updatedAt?: any
  sentAt?: string
  deliveryChannel?: string
  deliveryEmail?: string
  deliveryPhone?: string
  viewedAt?: string
  respondedAt?: string
  approvedAt?: string
  rejectedAt?: string
  deliveryToken?: string
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

interface QuotePreviewProps {
  quote: QuoteData
  onEdit: () => void
  onSend: () => void
  onDownload: () => void
}

export function QuotePreview({ quote, onEdit, onSend, onDownload }: QuotePreviewProps) {
  const [isPrinting, setIsPrinting] = useState(false)

  const formatDate = (date: string | Date) => {
    const dateObj = typeof date === 'string' ? new Date(date) : date
    return new Intl.DateTimeFormat('tr-TR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    }).format(dateObj)
  }

  const getStatusColor = (status: QuoteData['status']) => {
    switch (status) {
      case 'DRAFT': return 'bg-gray-100 text-gray-800'
      case 'SENT': return 'bg-blue-100 text-blue-800'
      case 'VIEWED': return 'bg-yellow-100 text-yellow-800'
      case 'APPROVED': return 'bg-green-100 text-green-800'
      case 'REJECTED': return 'bg-red-100 text-red-800'
      case 'EXPIRED': return 'bg-gray-100 text-gray-500'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusLabel = (status: QuoteData['status']) => {
    switch (status) {
      case 'DRAFT': return 'Taslak'
      case 'SENT': return 'Gönderildi'
      case 'VIEWED': return 'Görüntülendi'
      case 'APPROVED': return 'Kabul Edildi'
      case 'REJECTED': return 'Reddedildi'
      case 'EXPIRED': return 'Süresi Doldu'
      default: return 'Bilinmiyor'
    }
  }

  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Teklif Önizlemesi</h2>
            <p className="text-gray-600">{quote.quoteNumber}</p>
          </div>
          
          <Badge className={`${getStatusColor(quote.status)} border-0`}>
            {getStatusLabel(quote.status)}
          </Badge>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm" onClick={() => setIsPrinting(true)}>
            <Printer className="w-4 h-4 mr-2" />
            Yazdır
          </Button>
          <Button variant="outline" size="sm" onClick={onDownload}>
            <Download className="w-4 h-4 mr-2" />
            PDF İndir
          </Button>
          <Button variant="outline" size="sm" onClick={onEdit}>
            <Edit className="w-4 h-4 mr-2" />
            Düzenle
          </Button>
          {quote.status !== 'SENT' && (
            <Button onClick={onSend}>
              <Send className="w-4 h-4 mr-2" />
              Gönder
            </Button>
          )}
        </div>
      </div>

      {/* Quote Preview Card */}
      <Card className="shadow-lg">
        <CardContent className="p-8">
          {/* Company Header */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center space-x-2 mb-4">
              <Sun className="w-8 h-8 text-primary" />
              <h1 className="text-3xl font-bold text-primary">EnerjiOS</h1>
            </div>
            <p className="text-gray-600">Güneş Enerjisi Sistemleri ve Çözümleri</p>
            <p className="text-sm text-gray-500">www.enerjios.com • info@enerjios.com • +90 212 123 4567</p>
          </div>

          <Separator className="my-6" />

          {/* Quote Header */}
          <div className="grid md:grid-cols-2 gap-8 mb-8">
            <div>
              <h3 className="text-lg font-semibold mb-4 flex items-center">
                <FileText className="w-5 h-5 mr-2 text-primary" />
                Teklif Bilgileri
              </h3>
              <div className="space-y-2 text-sm">
                <div><span className="font-medium">Teklif No:</span> {quote.quoteNumber}</div>
                <div><span className="font-medium">Tarih:</span> {formatDate(quote.createdAt)}</div>
                <div><span className="font-medium">Geçerlilik:</span> {formatDate(quote.validUntil)}</div>
                <div><span className="font-medium">Versiyon:</span> v{quote.version}</div>
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-4 flex items-center">
                <User className="w-5 h-5 mr-2 text-primary" />
                Müşteri Bilgileri
              </h3>
              <div className="space-y-2 text-sm">
                <div><span className="font-medium">Ad Soyad:</span> {quote.customerName}</div>
                <div><span className="font-medium">Email:</span> {quote.customerEmail}</div>
                <div><span className="font-medium">Telefon:</span> {quote.customerPhone}</div>
                {quote.designData && (
                  <div className="flex items-center">
                    <MapPin className="w-3 h-3 mr-1 text-gray-400" />
                    <span className="text-gray-600">{quote.designData.location}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Project Title */}
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900">{quote.projectTitle}</h2>
          </div>

          {/* System Overview */}
          <div className="bg-primary/5 rounded-lg p-6 mb-8">
            <h3 className="text-lg font-semibold mb-4 flex items-center">
              <Zap className="w-5 h-5 mr-2 text-primary" />
              Sistem Özellikleri
            </h3>
            <div className="grid md:grid-cols-4 gap-4 text-center">
              <div className="bg-white rounded-lg p-4">
                <div className="text-2xl font-bold text-primary">{quote.systemSize} kW</div>
                <div className="text-sm text-gray-600">Sistem Gücü</div>
              </div>
              <div className="bg-white rounded-lg p-4">
                <div className="text-2xl font-bold text-blue-600">{quote.panelCount}</div>
                <div className="text-sm text-gray-600">Panel Sayısı</div>
              </div>
              <div className="bg-white rounded-lg p-4">
                <div className="text-2xl font-bold text-green-600">
                  {quote.financialAnalysis?.annualProduction?.toLocaleString() || '0'} kWh
                </div>
                <div className="text-sm text-gray-600">Yıllık Üretim</div>
              </div>
              <div className="bg-white rounded-lg p-4">
                <div className="text-2xl font-bold text-orange-600">
                  {quote.financialAnalysis?.paybackPeriod || '0'} Yıl
                </div>
                <div className="text-sm text-gray-600">Geri Ödeme Süresi</div>
              </div>
            </div>
          </div>

          {/* Design Details */}
          {quote.designData && (
            <div className="mb-8">
              <h3 className="text-lg font-semibold mb-4">Teknik Detaylar</h3>
              <div className="grid md:grid-cols-2 gap-4 text-sm">
                <div className="space-y-2">
                  <div><span className="font-medium">Konum:</span> {quote.designData.location}</div>
                  <div><span className="font-medium">Çatı Alanı:</span> {quote.designData.roofArea} m²</div>
                </div>
                <div className="space-y-2">
                  <div><span className="font-medium">Güneşlenme:</span> {quote.designData.irradiance} kWh/m²/yıl</div>
                  <div><span className="font-medium">Çatı Eğimi:</span> {quote.designData.tiltAngle}° / Azimuth: {quote.designData.azimuth}°</div>
                </div>
              </div>
            </div>
          )}

          {/* Items Table */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold mb-4">Teklif Detayları</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left">Ürün/Hizmet</th>
                    <th className="px-4 py-3 text-center">Marka</th>
                    <th className="px-4 py-3 text-center">Adet</th>
                    <th className="px-4 py-3 text-right">Birim Fiyat</th>
                    <th className="px-4 py-3 text-right">Toplam</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {quote.items?.map((item: QuoteItem) => (
                    <tr key={item.id}>
                      <td className="px-4 py-3">
                        <div className="font-medium">{item.name}</div>
                        {item.specifications && (
                          <div className="text-xs text-gray-500">
                            {item.type === 'PANEL' && `${item.specifications?.power || 0}W - %${item.specifications?.efficiency || 0} verimlilik`}
                            {item.type === 'INVERTER' && `${(item.specifications?.power || 0)/1000}kW - %${item.specifications?.efficiency || 0} verimlilik`}
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3 text-center">
                        {item.brand || '-'}
                      </td>
                      <td className="px-4 py-3 text-center">{item.quantity}</td>
                      <td className="px-4 py-3 text-right">₺{item.unitPrice.toLocaleString()}</td>
                      <td className="px-4 py-3 text-right font-medium">₺{item.totalPrice.toLocaleString()}</td>
                    </tr>
                  ))}
                  
                  {/* Labor Row */}
                  <tr>
                    <td className="px-4 py-3">
                      <div className="font-medium">Kurulum ve İşçilik</div>
                      <div className="text-xs text-gray-500">Profesyonel kurulum hizmeti</div>
                    </td>
                    <td className="px-4 py-3 text-center">-</td>
                    <td className="px-4 py-3 text-center">1</td>
                    <td className="px-4 py-3 text-right">₺{quote.laborCost?.toLocaleString() || '0'}</td>
                    <td className="px-4 py-3 text-right font-medium">₺{quote.laborCost?.toLocaleString() || '0'}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Pricing Summary */}
          <div className="bg-gray-50 rounded-lg p-6 mb-8">
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Alt Toplam:</span>
                <span>₺{quote.subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span>İşçilik:</span>
                <span>₺{quote.laborCost?.toLocaleString() || '0'}</span>
              </div>
              <div className="flex justify-between">
                <span>KDV (%18):</span>
                <span>₺{quote.tax.toLocaleString()}</span>
              </div>
              <Separator />
              <div className="flex justify-between text-lg font-bold text-primary">
                <span>TOPLAM TUTAR:</span>
                <span>₺{quote.total.toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Financial Analysis */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold mb-4 flex items-center">
              <TrendingUp className="w-5 h-5 mr-2 text-primary" />
              Finansal Analiz & Getiri Hesaplaması
            </h3>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="bg-green-50 rounded-lg p-4">
                  <div className="text-2xl font-bold text-green-600">
                    ₺{quote.financialAnalysis?.annualSavings?.toLocaleString() || '0'}
                  </div>
                  <div className="text-sm text-green-800">Yıllık Elektrik Tasarrufu</div>
                </div>
                
                <div className="bg-blue-50 rounded-lg p-4">
                  <div className="text-2xl font-bold text-blue-600">
                    ₺{quote.financialAnalysis?.npv25?.toLocaleString() || '0'}
                  </div>
                  <div className="text-sm text-blue-800">25 Yıllık Net Bugünkü Değer</div>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="bg-orange-50 rounded-lg p-4">
                  <div className="text-2xl font-bold text-orange-600">
                    {quote.financialAnalysis?.paybackPeriod || '0'} Yıl
                  </div>
                  <div className="text-sm text-orange-800">Yatırım Geri Ödeme Süresi</div>
                </div>
                
                <div className="bg-purple-50 rounded-lg p-4">
                  <div className="text-2xl font-bold text-purple-600">
                    %{quote.financialAnalysis?.irr || '0'}
                  </div>
                  <div className="text-sm text-purple-800">İç Karlılık Oranı (IRR)</div>
                </div>
              </div>
            </div>

            <div className="mt-4 text-xs text-gray-600 bg-gray-50 p-3 rounded">
              <p><strong>Hesaplama Notları:</strong></p>
              <ul className="mt-1 space-y-1 list-disc list-inside">
                <li>Elektrik fiyatı 2.20 TL/kWh baz alınmıştır</li>
                <li>Yıllık %5 elektrik fiyat artışı hesaplanmıştır</li>
                <li>Sistem verimliliği %90 olarak kabul edilmiştir</li>
                <li>Panel performansı 25 yılda %80'e düşer varsayımı kullanılmıştır</li>
              </ul>
            </div>
          </div>

          {/* Terms & Conditions */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold mb-4">Şartlar ve Koşullar</h3>
            <div className="text-sm text-gray-700 space-y-2">
              <div>• Bu teklif {formatDate(quote.validUntil)} tarihine kadar geçerlidir.</div>
              <div>• Fiyatlar KDV dahil olarak gösterilmiştir.</div>
              <div>• Kurulum süresi hava koşullarına bağlı olarak 3-5 iş günü arasındadır.</div>
              <div>• Paneller için 25 yıl performans garantisi mevcuttur.</div>
              <div>• İnverterler için 10 yıl üretici garantisi mevcuttur.</div>
              <div>• YEKDEM mevzuatı değişikliklerinden sorumlu değiliz.</div>
              <div>• Ödeme koşulları: %50 avans, %50 kurulum tamamlandıktan sonra.</div>
            </div>
          </div>

          {/* Footer */}
          <div className="text-center border-t pt-6">
            <div className="text-sm text-gray-600 mb-4">
              Bu teklifi kabul ediyorsanız, lütfen imzalayarak bize geri gönderiniz.
            </div>
            
            <div className="grid md:grid-cols-2 gap-8 text-sm">
              <div>
                <div className="font-semibold">EnerjiOS</div>
                <div className="mt-8 border-t pt-2">Yetkili İmza</div>
              </div>
              <div>
                <div className="font-semibold">Müşteri Onayı</div>
                <div className="mt-8 border-t pt-2">İmza & Tarih</div>
              </div>
            </div>

            <div className="mt-6 text-xs text-gray-500">
              Bu teklif EnerjiOS tarafından hazırlanmış olup, tüm hakları saklıdır.
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}