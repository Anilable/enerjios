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
  projectRequestId?: string
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
  notes?: string
  terms?: string
  customer?: {
    id: string
    firstName?: string
    lastName?: string
    email?: string
    phone?: string
    address?: string
    city?: string
    district?: string
    companyName?: string
    type?: string
  }
  project?: {
    id: string
    type: string
    capacity?: number
  }
  items?: Array<{
    id: string
    name: string
    description: string
    quantity: number
    unitPrice: number
    total: number
    product?: {
      id: string
      name: string
      brand: string
      model: string
      power?: number
    }
  }>
}


export default function QuoteDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const [quote, setQuote] = useState<Quote | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchQuote = async () => {
      try {
        setLoading(true)
        const response = await fetch(`/api/quotes/${params.id}`)

        if (!response.ok) {
          if (response.status === 404) {
            setQuote(null)
            setLoading(false)
            return
          }
          throw new Error('Failed to fetch quote')
        }

        const quoteData = await response.json()

        // Parse customer data if it's a string
        if (typeof quoteData.customer === 'string') {
          try {
            quoteData.customer = JSON.parse(quoteData.customer)
          } catch (e) {
            console.error('Error parsing customer data:', e)
            quoteData.customer = null
          }
        }

        // Parse project data if it's a string
        if (typeof quoteData.project === 'string') {
          try {
            quoteData.project = JSON.parse(quoteData.project)
          } catch (e) {
            console.error('Error parsing project data:', e)
            quoteData.project = null
          }
        }

        // Parse items data if needed
        if (quoteData.items && Array.isArray(quoteData.items)) {
          quoteData.items = quoteData.items.map((item: any) => {
            // Parse name if it's an object or string
            if (typeof item.name === 'object' && item.name !== null) {
              item.name = item.name.name || 'Ürün Adı Belirtilmemiş'
            } else if (typeof item.name === 'string') {
              try {
                const parsed = JSON.parse(item.name)
                if (parsed && typeof parsed === 'object' && parsed.name) {
                  item.name = parsed.name
                }
              } catch (e) {
                // If it fails to parse, keep the original string
              }
            }

            // Parse description if it's an object or string
            if (typeof item.description === 'object' && item.description !== null) {
              item.description = item.description.description || 'Açıklama Belirtilmemiş'
            } else if (typeof item.description === 'string') {
              try {
                const parsed = JSON.parse(item.description)
                if (parsed && typeof parsed === 'object' && parsed.description) {
                  item.description = parsed.description
                }
              } catch (e) {
                // If it fails to parse, keep the original string
              }
            }

            return item
          })
        }

        setQuote(quoteData)
      } catch (error) {
        console.error('Error fetching quote:', error)
        toast({
          title: "Hata",
          description: "Teklif yüklenirken bir hata oluştu.",
          variant: "destructive"
        })
        setQuote(null)
      } finally {
        setLoading(false)
      }
    }

    if (params.id) {
      fetchQuote()
    }
  }, [params.id, toast])

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

  const handleDownloadPDF = async () => {
    if (!quote) return
    
    try {
      toast({
        title: "PDF İndiriliyor",
        description: "Teklif PDF'i hazırlanıyor...",
      })

      const response = await fetch(`/api/quotes/${quote.id}/pdf`)
      
      if (!response.ok) {
        throw new Error('PDF oluşturulamadı')
      }
      
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      
      const a = document.createElement('a')
      a.style.display = 'none'
      a.href = url
      a.download = `teklif-${quote.quoteNumber}.pdf`
      
      document.body.appendChild(a)
      a.click()
      
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
      
      toast({
        title: "PDF İndirildi",
        description: "Teklif PDF'i başarıyla indirildi.",
      })
    } catch (error) {
      console.error('PDF download error:', error)
      toast({
        title: "Hata",
        description: "PDF indirme işlemi başarısız oldu.",
        variant: "destructive"
      })
    }
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
                {quote.customer ?
                  `${quote.customer.firstName || ''} ${quote.customer.lastName || ''}`.trim() ||
                  quote.customer.companyName || 'Müşteri Bilgisi Yok'
                  : 'Müşteri Bilgisi Yok'} • {formatDate(quote.createdAt)}
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
                      <p className="text-sm text-muted-foreground">
                        {quote.customer?.type === 'COMPANY' ? 'Şirket Adı' : 'Ad Soyad'}
                      </p>
                      <p className="font-medium">
                        {quote.customer?.type === 'COMPANY'
                          ? quote.customer.companyName || 'Belirtilmemiş'
                          : `${quote.customer?.firstName || ''} ${quote.customer?.lastName || ''}`.trim() || 'Belirtilmemiş'
                        }
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Mail className="w-4 h-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Email</p>
                      <p className="font-medium">{quote.customer?.email || 'Belirtilmemiş'}</p>
                    </div>
                  </div>
                  {quote.customer?.phone && (
                    <div className="flex items-center gap-3">
                      <Phone className="w-4 h-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm text-muted-foreground">Telefon</p>
                        <p className="font-medium">{quote.customer.phone}</p>
                      </div>
                    </div>
                  )}
                  {(quote.customer?.address || quote.customer?.city) && (
                    <div className="flex items-center gap-3">
                      <MapPin className="w-4 h-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm text-muted-foreground">Adres</p>
                        <p className="font-medium">
                          {[quote.customer?.address, quote.customer?.city, quote.customer?.district]
                            .filter(Boolean).join(', ') || 'Belirtilmemiş'}
                        </p>
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
                        {quote.project?.type === 'RESIDENTIAL' ? 'Konut' :
                         quote.project?.type === 'COMMERCIAL' ? 'Ticari' :
                         quote.project?.type === 'INDUSTRIAL' ? 'Endüstriyel' :
                         'Belirtilmemiş'}
                      </p>
                    </div>
                  </div>
                  {quote.project?.capacity && (
                    <div className="flex items-center gap-3">
                      <Zap className="w-4 h-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm text-muted-foreground">Sistem Gücü</p>
                        <p className="font-medium">{quote.project.capacity} kW</p>
                      </div>
                    </div>
                  )}
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
                          {item.product && (
                            <p className="text-xs text-blue-600 mt-1">
                              {item.product.brand} {item.product.model}
                              {item.product.power && ` • ${item.product.power}W`}
                            </p>
                          )}
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
                  <span className="text-muted-foreground">KDV (20%)</span>
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