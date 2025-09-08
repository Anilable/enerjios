'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { useToast } from '@/hooks/use-toast'
import { 
  ArrowLeft,
  Download,
  Send,
  Copy,
  Edit,
  Clock,
  CheckCircle,
  XCircle,
  FileText,
  Eye,
  User,
  Mail,
  MapPin,
  Phone,
  Building,
  Zap,
  Calendar,
  DollarSign
} from 'lucide-react'
import { formatCurrency } from '@/lib/utils'

interface Quote {
  id: string
  quoteNumber: string
  projectRequestId: string
  customerName: string
  customerEmail: string
  customerPhone?: string
  customerAddress?: string
  projectType: string
  capacity: number
  subtotal: number
  tax: number
  discount: number
  total: number
  status: 'DRAFT' | 'SENT' | 'VIEWED' | 'APPROVED' | 'REJECTED' | 'EXPIRED'
  createdAt: string
  validUntil: string
  sentAt?: string
  viewedAt?: string
  respondedAt?: string
  items?: Array<{
    id: string
    name: string
    description: string
    quantity: number
    unitPrice: number
    total: number
  }>
}

// Mock data - gerçek uygulamada API'den gelecek
const mockQuote: Quote = {
  id: '1',
  quoteNumber: 'Q-20240115',
  projectRequestId: '1',
  customerName: 'Ahmet Yılmaz',
  customerEmail: 'ahmet@example.com',
  customerPhone: '+90 532 123 45 67',
  customerAddress: 'Merkez Mahallesi, İstanbul Caddesi No: 123, Edirne',
  projectType: 'RESIDENTIAL',
  capacity: 10,
  subtotal: 120000,
  tax: 21600,
  discount: 5000,
  total: 136600,
  status: 'SENT',
  createdAt: '2024-01-15T10:30:00Z',
  validUntil: '2024-02-15T10:30:00Z',
  sentAt: '2024-01-15T11:00:00Z',
  items: [
    {
      id: '1',
      name: 'Jinko Solar 550W Monokristal Panel',
      description: 'Yüksek verimli monokristal güneş paneli',
      quantity: 18,
      unitPrice: 2800,
      total: 50400
    },
    {
      id: '2',
      name: 'Huawei SUN2000-10KTL-M1 İnverter',
      description: '10kW string inverter',
      quantity: 1,
      unitPrice: 12500,
      total: 12500
    },
    {
      id: '3',
      name: 'Montaj Malzemeleri ve İşçilik',
      description: 'Çatı montajı, kablolama ve işçilik',
      quantity: 1,
      unitPrice: 35000,
      total: 35000
    },
    {
      id: '4',
      name: 'Elektrik Panosu Güçlendirme',
      description: 'Mevcut elektrik panosunu güçlendirme',
      quantity: 1,
      unitPrice: 8000,
      total: 8000
    },
    {
      id: '5',
      name: 'Proje ve Ruhsat İşlemleri',
      description: 'Belediye ruhsatı ve EPDK başvuru işlemleri',
      quantity: 1,
      unitPrice: 6000,
      total: 6000
    },
    {
      id: '6',
      name: 'Sistem Kurulum ve Devreye Alma',
      description: 'Sistemin kurulumu ve test işlemleri',
      quantity: 1,
      unitPrice: 8100,
      total: 8100
    }
  ]
}

export default function QuoteDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const [quote, setQuote] = useState<Quote | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Mock API call - gerçek uygulamada API'den veri çekilecek
    setTimeout(() => {
      setQuote(mockQuote)
      setLoading(false)
    }, 500)
  }, [params.id])

  const getStatusColor = (status: Quote['status']) => {
    switch (status) {
      case 'DRAFT': return 'bg-gray-100 text-gray-800'
      case 'SENT': return 'bg-blue-100 text-blue-800'
      case 'VIEWED': return 'bg-purple-100 text-purple-800'
      case 'APPROVED': return 'bg-green-100 text-green-800'
      case 'REJECTED': return 'bg-red-100 text-red-800'
      case 'EXPIRED': return 'bg-orange-100 text-orange-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (status: Quote['status']) => {
    switch (status) {
      case 'DRAFT': return <FileText className="w-4 h-4" />
      case 'SENT': return <Send className="w-4 h-4" />
      case 'VIEWED': return <Eye className="w-4 h-4" />
      case 'APPROVED': return <CheckCircle className="w-4 h-4" />
      case 'REJECTED': return <XCircle className="w-4 h-4" />
      case 'EXPIRED': return <Clock className="w-4 h-4" />
      default: return <FileText className="w-4 h-4" />
    }
  }

  const getStatusLabel = (status: Quote['status']) => {
    switch (status) {
      case 'DRAFT': return 'Taslak'
      case 'SENT': return 'Gönderildi'
      case 'VIEWED': return 'Görüntülendi'
      case 'APPROVED': return 'Onaylandı'
      case 'REJECTED': return 'Reddedildi'
      case 'EXPIRED': return 'Süresi Doldu'
      default: return status
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('tr-TR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const handleDownloadPDF = () => {
    // PDF download işlemi
    toast({
      title: "PDF İndiriliyor",
      description: "Teklif PDF'i hazırlanıyor...",
    })
    // Gerçek uygulamada PDF generate edip download edilecek
  }

  const handleCopyLink = () => {
    const link = `${window.location.origin}/quote/${quote?.id}`
    navigator.clipboard.writeText(link)
    toast({
      title: "Link Kopyalandı",
      description: "Teklif linki panoya kopyalandı",
    })
  }

  const handleSendReminder = () => {
    toast({
      title: "Hatırlatma Gönderildi",
      description: "Müşteriye email hatırlatması gönderildi",
    })
    // Gerçek uygulamada API call yapılacak
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </DashboardLayout>
    )
  }

  if (!quote) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold text-gray-900">Teklif bulunamadı</h2>
          <p className="text-gray-600 mt-2">Bu teklif mevcut değil veya silinmiş olabilir.</p>
          <Button onClick={() => router.push('/dashboard/quotes')} className="mt-4">
            Tekliflere Geri Dön
          </Button>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push('/dashboard/quotes')}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Geri
            </Button>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">{quote.quoteNumber}</h1>
              <p className="text-muted-foreground">
                {quote.customerName} • {formatDate(quote.createdAt)}
              </p>
            </div>
            <Badge className={`${getStatusColor(quote.status)} flex items-center gap-1`}>
              {getStatusIcon(quote.status)}
              {getStatusLabel(quote.status)}
            </Badge>
          </div>

          <div className="flex items-center space-x-2">
            <Button variant="outline" onClick={handleDownloadPDF}>
              <Download className="w-4 h-4 mr-2" />
              PDF İndir
            </Button>
            <Button variant="outline" onClick={handleCopyLink}>
              <Copy className="w-4 h-4 mr-2" />
              Link Kopyala
            </Button>
            {(quote.status === 'SENT' || quote.status === 'VIEWED') && (
              <Button variant="outline" onClick={handleSendReminder}>
                <Clock className="w-4 h-4 mr-2" />
                Hatırlat
              </Button>
            )}
            {quote.status === 'DRAFT' && (
              <Button onClick={() => router.push(`/dashboard/quotes/edit/${quote.id}`)}>
                <Edit className="w-4 h-4 mr-2" />
                Düzenle
              </Button>
            )}
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Customer Info */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="w-5 h-5" />
                  Müşteri Bilgileri
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="flex items-center gap-3">
                    <User className="w-4 h-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Ad Soyad</p>
                      <p className="font-medium">{quote.customerName}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Mail className="w-4 h-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Email</p>
                      <p className="font-medium">{quote.customerEmail}</p>
                    </div>
                  </div>
                  {quote.customerPhone && (
                    <div className="flex items-center gap-3">
                      <Phone className="w-4 h-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm text-muted-foreground">Telefon</p>
                        <p className="font-medium">{quote.customerPhone}</p>
                      </div>
                    </div>
                  )}
                  {quote.customerAddress && (
                    <div className="flex items-center gap-3">
                      <MapPin className="w-4 h-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm text-muted-foreground">Adres</p>
                        <p className="font-medium">{quote.customerAddress}</p>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Project Details */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building className="w-5 h-5" />
                  Proje Detayları
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="flex items-center gap-3">
                    <Building className="w-4 h-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Proje Tipi</p>
                      <p className="font-medium">
                        {quote.projectType === 'RESIDENTIAL' ? 'Konut' : 
                         quote.projectType === 'COMMERCIAL' ? 'Ticari' : 
                         'Endüstriyel'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Zap className="w-4 h-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Sistem Gücü</p>
                      <p className="font-medium">{quote.capacity} kW</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Calendar className="w-4 h-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Geçerlilik</p>
                      <p className="font-medium">{formatDate(quote.validUntil)}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quote Items */}
            <Card>
              <CardHeader>
                <CardTitle>Teklif Kalemleri</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {quote.items?.map((item, index) => (
                    <div key={item.id}>
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h4 className="font-medium">{item.name}</h4>
                          <p className="text-sm text-muted-foreground">{item.description}</p>
                          <div className="flex items-center gap-4 mt-2 text-sm">
                            <span>Miktar: {item.quantity}</span>
                            <span>Birim Fiyat: {formatCurrency(item.unitPrice)}</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-lg">{formatCurrency(item.total)}</p>
                        </div>
                      </div>
                      {index < quote.items!.length - 1 && <Separator className="mt-4" />}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="w-5 h-5" />
                  Fiyat Özeti
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Ara Toplam</span>
                  <span className="font-medium">{formatCurrency(quote.subtotal)}</span>
                </div>
                <div className="flex justify-between text-green-600">
                  <span>İndirim</span>
                  <span>-{formatCurrency(quote.discount)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">KDV (18%)</span>
                  <span className="font-medium">{formatCurrency(quote.tax)}</span>
                </div>
                <Separator />
                <div className="flex justify-between text-lg font-bold">
                  <span>Toplam</span>
                  <span className="text-primary">{formatCurrency(quote.total)}</span>
                </div>
              </CardContent>
            </Card>

            {/* Timeline */}
            <Card>
              <CardHeader>
                <CardTitle>Teklif Geçmişi</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <FileText className="w-4 h-4 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium">Teklif Oluşturuldu</p>
                    <p className="text-sm text-muted-foreground">{formatDate(quote.createdAt)}</p>
                  </div>
                </div>
                
                {quote.sentAt && (
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                      <Send className="w-4 h-4 text-green-600" />
                    </div>
                    <div>
                      <p className="font-medium">Müşteriye Gönderildi</p>
                      <p className="text-sm text-muted-foreground">{formatDate(quote.sentAt)}</p>
                    </div>
                  </div>
                )}

                {quote.viewedAt && (
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                      <Eye className="w-4 h-4 text-purple-600" />
                    </div>
                    <div>
                      <p className="font-medium">Müşteri Tarafından Görüntülendi</p>
                      <p className="text-sm text-muted-foreground">{formatDate(quote.viewedAt)}</p>
                    </div>
                  </div>
                )}

                {quote.respondedAt && (
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      quote.status === 'APPROVED' ? 'bg-green-100' : 'bg-red-100'
                    }`}>
                      {quote.status === 'APPROVED' ? 
                        <CheckCircle className="w-4 h-4 text-green-600" /> :
                        <XCircle className="w-4 h-4 text-red-600" />
                      }
                    </div>
                    <div>
                      <p className="font-medium">
                        {quote.status === 'APPROVED' ? 'Onaylandı' : 'Reddedildi'}
                      </p>
                      <p className="text-sm text-muted-foreground">{formatDate(quote.respondedAt)}</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}