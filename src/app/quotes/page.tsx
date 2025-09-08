'use client'

import { useState } from 'react'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  FileText, 
  Calendar, 
  Building, 
  Zap, 
  Eye, 
  Download,
  Plus,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Send,
  DollarSign,
  User,
  Phone,
  Mail
} from 'lucide-react'

interface Quote {
  id: string
  title: string
  company: string
  contactPerson: string
  email: string
  phone: string
  systemCapacity: number
  totalPrice: number
  pricePerKw: number
  status: 'draft' | 'sent' | 'viewed' | 'accepted' | 'rejected' | 'expired'
  createdDate: string
  validUntil: string
  responseDate?: string
  location: string
  description: string
  components: {
    panels: string
    inverter: string
    mounting: string
    installation: boolean
    warranty: string
  }
  timeline: string
  paymentTerms: string
}

const mockQuotes: Quote[] = [
  {
    id: '1',
    title: 'Ev Çatısı GES Sistemi',
    company: 'SolarTech Enerji',
    contactPerson: 'Mehmet Yılmaz',
    email: 'mehmet@solartech.com.tr',
    phone: '+90 555 123 4567',
    systemCapacity: 10.5,
    totalPrice: 157500,
    pricePerKw: 15000,
    status: 'sent',
    createdDate: '2024-02-20',
    validUntil: '2024-03-20',
    location: 'İstanbul, Beylikdüzü',
    description: 'Çatı üzerine kurulacak 10.5 kW güneş enerjisi sistemi',
    components: {
      panels: 'JinkoSolar Tiger Neo 420W (25 adet)',
      inverter: 'Huawei SUN2000-10KTL-M1',
      mounting: 'Alüminyum ray sistem',
      installation: true,
      warranty: '25 yıl panel, 10 yıl inverter'
    },
    timeline: '15-20 iş günü',
    paymentTerms: '%30 peşin, %70 kurulum sonrası'
  },
  {
    id: '2',
    title: 'Fabrika Çatısı Hibrit Sistem',
    company: 'Green Power Solutions',
    contactPerson: 'Ayşe Demir',
    email: 'ayse@greenpower.com.tr',
    phone: '+90 533 987 6543',
    systemCapacity: 250,
    totalPrice: 3500000,
    pricePerKw: 14000,
    status: 'viewed',
    createdDate: '2024-02-15',
    validUntil: '2024-03-15',
    responseDate: '2024-02-25',
    location: 'Tekirdağ, Çorlu',
    description: 'Fabrika çatısı ve bahçe alanına kurulu hibrit güneş enerjisi sistemi',
    components: {
      panels: 'LONGi Hi-MO 6 550W (455 adet)',
      inverter: 'SMA Sunny Central 250',
      mounting: 'Sabit çatı montaj sistemi',
      installation: true,
      warranty: '25 yıl panel, 15 yıl inverter'
    },
    timeline: '45-60 iş günü',
    paymentTerms: '%20 peşin, %40 malzeme kabulü, %40 kurulum sonrası'
  },
  {
    id: '3',
    title: 'Agrovoltaik Sistem',
    company: 'Agri Solar Turkey',
    contactPerson: 'Ali Kaya',
    email: 'ali@agrisolar.com.tr',
    phone: '+90 544 111 2233',
    systemCapacity: 100,
    totalPrice: 1400000,
    pricePerKw: 14000,
    status: 'accepted',
    createdDate: '2024-01-10',
    validUntil: '2024-02-10',
    responseDate: '2024-01-25',
    location: 'Edirne, Merkez',
    description: 'Tarım arazisi üzerine agrovoltaik sistem kurulumu',
    components: {
      panels: 'Trina Solar Vertex S+ 445W (225 adet)',
      inverter: 'Fronius Symo 100kW',
      mounting: 'Yüksek agrovoltaik montaj sistemi',
      installation: true,
      warranty: '25 yıl panel, 12 yıl inverter'
    },
    timeline: '30-40 iş günü',
    paymentTerms: '%25 peşin, %50 malzeme kabulü, %25 kurulum sonrası'
  }
]

export default function QuotesPage() {
  const [selectedTab, setSelectedTab] = useState('all')
  const [quotes] = useState<Quote[]>(mockQuotes)

  const getStatusColor = (status: Quote['status']) => {
    switch (status) {
      case 'draft': return 'bg-gray-100 text-gray-800'
      case 'sent': return 'bg-blue-100 text-blue-800'
      case 'viewed': return 'bg-yellow-100 text-yellow-800'
      case 'accepted': return 'bg-green-100 text-green-800'
      case 'rejected': return 'bg-red-100 text-red-800'
      case 'expired': return 'bg-orange-100 text-orange-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (status: Quote['status']) => {
    switch (status) {
      case 'draft': return <FileText className="w-4 h-4" />
      case 'sent': return <Send className="w-4 h-4" />
      case 'viewed': return <Eye className="w-4 h-4" />
      case 'accepted': return <CheckCircle className="w-4 h-4" />
      case 'rejected': return <XCircle className="w-4 h-4" />
      case 'expired': return <AlertCircle className="w-4 h-4" />
      default: return <FileText className="w-4 h-4" />
    }
  }

  const getStatusText = (status: Quote['status']) => {
    switch (status) {
      case 'draft': return 'Taslak'
      case 'sent': return 'Gönderildi'
      case 'viewed': return 'Görüntülendi'
      case 'accepted': return 'Kabul Edildi'
      case 'rejected': return 'Reddedildi'
      case 'expired': return 'Süresi Doldu'
      default: return status
    }
  }

  const filteredQuotes = quotes.filter(quote => {
    if (selectedTab === 'all') return true
    if (selectedTab === 'active') return ['draft', 'sent', 'viewed'].includes(quote.status)
    if (selectedTab === 'completed') return ['accepted', 'rejected'].includes(quote.status)
    return quote.status === selectedTab
  })

  const totalQuotes = quotes.length
  const activeQuotes = quotes.filter(q => ['draft', 'sent', 'viewed'].includes(q.status)).length
  const acceptedQuotes = quotes.filter(q => q.status === 'accepted').length
  const totalValue = quotes.reduce((sum, quote) => sum + quote.totalPrice, 0)

  return (
    <DashboardLayout title="Tekliflerim">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <FileText className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{totalQuotes}</p>
                <p className="text-sm text-gray-600">Toplam Teklif</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Clock className="w-6 h-6 text-yellow-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{activeQuotes}</p>
                <p className="text-sm text-gray-600">Aktif</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{acceptedQuotes}</p>
                <p className="text-sm text-gray-600">Kabul Edilen</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <DollarSign className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">₺{(totalValue/1000000).toFixed(1)}M</p>
                <p className="text-sm text-gray-600">Toplam Değer</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Tekliflerim</CardTitle>
                <CardDescription>
                  Güneş enerjisi sistemi tekliflerinizi takip edin ve yönetin
                </CardDescription>
              </div>
              <Button className="bg-primary hover:bg-primary/90" asChild>
                <a href="/calculator">
                  <Plus className="w-4 h-4 mr-2" />
                  Yeni Teklif Al
                </a>
              </Button>
            </CardHeader>
            <CardContent>
              <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-6">
                <TabsList className="grid grid-cols-4 w-full">
                  <TabsTrigger value="all">Tümü</TabsTrigger>
                  <TabsTrigger value="active">Aktif</TabsTrigger>
                  <TabsTrigger value="completed">Tamamlanan</TabsTrigger>
                  <TabsTrigger value="expired">Süresi Doldu</TabsTrigger>
                </TabsList>

                <TabsContent value={selectedTab} className="space-y-4">
                  {filteredQuotes.map((quote) => (
                    <Card key={quote.id} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-2">
                              <h3 className="text-lg font-semibold text-gray-900">
                                {quote.title}
                              </h3>
                              <Badge className={`${getStatusColor(quote.status)} ml-4 flex items-center space-x-1`}>
                                {getStatusIcon(quote.status)}
                                <span>{getStatusText(quote.status)}</span>
                              </Badge>
                            </div>
                            
                            <p className="text-gray-600 text-sm mb-4">
                              {quote.description}
                            </p>
                            
                            {/* Company Info */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4 p-3 bg-gray-50 rounded-lg">
                              <div className="flex items-center space-x-2">
                                <Building className="w-4 h-4 text-gray-500" />
                                <div>
                                  <p className="text-sm font-medium">{quote.company}</p>
                                  <p className="text-xs text-gray-600">{quote.contactPerson}</p>
                                </div>
                              </div>
                              <div className="flex items-center space-x-2">
                                <Mail className="w-4 h-4 text-gray-500" />
                                <p className="text-sm text-gray-600">{quote.email}</p>
                              </div>
                              <div className="flex items-center space-x-2">
                                <Phone className="w-4 h-4 text-gray-500" />
                                <p className="text-sm text-gray-600">{quote.phone}</p>
                              </div>
                            </div>

                            {/* System Details */}
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-4">
                              <div>
                                <p className="text-gray-500">Sistem Gücü</p>
                                <p className="font-medium flex items-center">
                                  <Zap className="w-4 h-4 text-blue-500 mr-1" />
                                  {quote.systemCapacity} kW
                                </p>
                              </div>
                              <div>
                                <p className="text-gray-500">Birim Fiyat</p>
                                <p className="font-medium">₺{quote.pricePerKw.toLocaleString('tr-TR')}/kW</p>
                              </div>
                              <div>
                                <p className="text-gray-500">Toplam Fiyat</p>
                                <p className="font-medium text-green-600">₺{quote.totalPrice.toLocaleString('tr-TR')}</p>
                              </div>
                              <div>
                                <p className="text-gray-500">Geçerlilik</p>
                                <p className="font-medium text-orange-600">{quote.validUntil}</p>
                              </div>
                            </div>

                            {/* Components Summary */}
                            <div className="mb-4 p-3 bg-blue-50 rounded-lg">
                              <h4 className="text-sm font-medium mb-2 text-blue-900">Sistem Bileşenleri</h4>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                                <div>
                                  <span className="text-blue-700">Panel:</span> {quote.components.panels}
                                </div>
                                <div>
                                  <span className="text-blue-700">İnverter:</span> {quote.components.inverter}
                                </div>
                                <div>
                                  <span className="text-blue-700">Montaj:</span> {quote.components.mounting}
                                </div>
                                <div>
                                  <span className="text-blue-700">Garanti:</span> {quote.components.warranty}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center justify-between pt-4 border-t">
                          <div className="flex items-center space-x-4 text-sm text-gray-600">
                            <div className="flex items-center space-x-1">
                              <Calendar className="w-4 h-4" />
                              <span>Oluşturulma: {quote.createdDate}</span>
                            </div>
                            {quote.responseDate && (
                              <>
                                <span className="text-gray-400">•</span>
                                <span>Yanıtlanma: {quote.responseDate}</span>
                              </>
                            )}
                            <span className="text-gray-400">•</span>
                            <span>Teslimat: {quote.timeline}</span>
                          </div>

                          <div className="flex space-x-2">
                            <Button variant="outline" size="sm">
                              <Eye className="w-4 h-4 mr-1" />
                              Detay
                            </Button>
                            <Button variant="outline" size="sm">
                              <Download className="w-4 h-4 mr-1" />
                              PDF
                            </Button>
                            {quote.status === 'viewed' && (
                              <>
                                <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white">
                                  <CheckCircle className="w-4 h-4 mr-1" />
                                  Kabul Et
                                </Button>
                                <Button variant="outline" size="sm" className="border-red-200 text-red-600 hover:bg-red-50">
                                  <XCircle className="w-4 h-4 mr-1" />
                                  Reddet
                                </Button>
                              </>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}

                  {filteredQuotes.length === 0 && (
                    <Card>
                      <CardContent className="text-center py-12">
                        <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                        <p className="text-gray-500 mb-4">
                          {selectedTab === 'all' ? 'Henüz teklifiniz bulunmuyor' : 'Bu kategoride teklif bulunmuyor'}
                        </p>
                        <Button className="bg-primary hover:bg-primary/90" asChild>
                          <a href="/calculator">
                            <Plus className="w-4 h-4 mr-2" />
                            İlk Teklifinizi Alın
                          </a>
                        </Button>
                      </CardContent>
                    </Card>
                  )}
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Teklif Özeti</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  ₺{(totalValue/1000000).toFixed(2)}M
                </div>
                <p className="text-sm text-gray-600">Toplam Teklif Değeri</p>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Ortalama Birim Fiyat</span>
                  <span className="font-medium">₺{(quotes.reduce((sum, q) => sum + q.pricePerKw, 0) / quotes.length).toFixed(0)}/kW</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">En Düşük Teklif</span>
                  <span className="font-medium text-green-600">₺{Math.min(...quotes.map(q => q.pricePerKw)).toLocaleString('tr-TR')}/kW</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Kabul Oranı</span>
                  <span className="font-medium text-blue-600">{((acceptedQuotes / totalQuotes) * 100).toFixed(0)}%</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Hızlı İşlemler</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button className="w-full" asChild>
                <a href="/calculator">
                  <Plus className="w-4 h-4 mr-2" />
                  Yeni Sistem Hesapla
                </a>
              </Button>
              <Button className="w-full" variant="outline" asChild>
                <a href="/projects">
                  <Building className="w-4 h-4 mr-2" />
                  Projelerim
                </a>
              </Button>
              <Button className="w-full" variant="outline">
                <Download className="w-4 h-4 mr-2" />
                Tüm Teklifleri İndir
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Teklif İpuçları</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="text-sm space-y-2">
                <p className="font-medium text-gray-900">💡 Karşılaştırma Yaparken</p>
                <ul className="text-gray-600 space-y-1 text-xs">
                  <li>• Sadece fiyata değil, kaliteye bakın</li>
                  <li>• Garanti sürelerini karşılaştırın</li>
                  <li>• Kurulum deneyimini araştırın</li>
                  <li>• Ödeme koşullarını değerlendirin</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  )
}