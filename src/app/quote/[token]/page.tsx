'use client'

import { useState, useEffect, useRef } from 'react'
import { useParams } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Textarea } from '@/components/ui/textarea'
import { SignaturePad, SignaturePadRef } from '@/components/ui/signature-pad'
import { 
  Sun,
  Shield,
  Clock,
  DollarSign,
  Zap,
  TrendingUp,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Download,
  MessageSquare,
  Phone,
  Mail,
  MapPin,
  Calendar,
  User,
  FileText,
  Loader2
} from 'lucide-react'

interface QuoteData {
  id: string
  quoteNumber: string
  customerName: string
  customerEmail: string
  customerPhone: string
  projectTitle: string
  companyName: string
  engineerName: string
  engineerTitle: string
  totalAmount: number
  validUntil: Date
  createdAt: Date
  status: 'DRAFT' | 'SENT' | 'VIEWED' | 'APPROVED' | 'REJECTED' | 'EXPIRED'
  systemDetails: {
    capacity: number
    panelCount: number
    estimatedProduction: number
    paybackPeriod: number
  }
  items: Array<{
    id: string
    name: string
    description?: string
    quantity: number
    unitPrice: number
    total: number
  }>
  notes?: string
  terms?: string
  pdfUrl?: string
}

export default function PublicQuotePage() {
  const params = useParams()
  const token = params.token as string
  
  const [quote, setQuote] = useState<QuoteData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [responding, setResponding] = useState(false)
  const [customerComments, setCustomerComments] = useState('')
  const [showApprovalForm, setShowApprovalForm] = useState(false)
  const [showSignaturePad, setShowSignaturePad] = useState(false)
  const [signatureData, setSignatureData] = useState<string | null>(null)
  const [approvalAction, setApprovalAction] = useState<'APPROVE' | 'REJECT' | null>(null)
  const signaturePadRef = useRef<SignaturePadRef>(null)

  useEffect(() => {
    const loadQuote = async () => {
      try {
        // Mock data for now - in real app, fetch from API
        // const response = await fetch(`/api/public/quotes/${token}`)
        // const data = await response.json()
        
        // Mock quote data
        const mockQuote: QuoteData = {
          id: 'quote-1',
          quoteNumber: `Q-${Date.now().toString().slice(-8)}`,
          customerName: 'Ahmet Yılmaz',
          customerEmail: 'ahmet@example.com',
          customerPhone: '+90 555 123 4567',
          projectTitle: '10 kW Ev GES Sistemi - Çatı Kurulumu',
          companyName: process.env.NEXT_PUBLIC_COMPANY_NAME || 'EnerjiOS',
          engineerName: 'Mehmet Güneş',
          engineerTitle: 'Güneş Enerji Uzmanı',
          totalAmount: 85000,
          validUntil: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
          createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
          status: 'SENT',
          systemDetails: {
            capacity: 10,
            panelCount: 18,
            estimatedProduction: 14500,
            paybackPeriod: 8
          },
          items: [
            { id: '1', name: 'Longi Solar 550W Mono Panel', description: 'Yüksek verimli monokristal', quantity: 18, unitPrice: 1500, total: 27000 },
            { id: '2', name: 'Huawei 10kW Hibrit İnverter', description: '3 fazlı hibrit sistem', quantity: 1, unitPrice: 12000, total: 12000 },
            { id: '3', name: 'Montaj Malzemeleri', description: 'Çatı bağlantı sistemi', quantity: 1, unitPrice: 8000, total: 8000 },
            { id: '4', name: 'Kurulum ve İşçilik', description: 'Profesyonel kurulum hizmeti', quantity: 1, unitPrice: 15000, total: 15000 }
          ],
          notes: 'Sistem 25 yıl garanti kapsamındadır. İlk yıl bakım ücretsizdir.',
          terms: 'Ödeme: %50 avans, %50 kurulum sonrası. Kurulum süresi: 3-5 iş günü.',
          pdfUrl: '/api/quotes/quote-1/pdf'
        }

        // Mark as viewed
        await fetch(`/api/public/quotes/${token}/view`, { 
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            userAgent: navigator.userAgent,
            timestamp: new Date().toISOString()
          })
        }).catch(console.error)

        setQuote(mockQuote)
      } catch (err) {
        setError('Teklif yüklenirken hata oluştu')
        console.error('Error loading quote:', err)
      } finally {
        setLoading(false)
      }
    }

    if (token) {
      loadQuote()
    }
  }, [token])

  const handleApprovalClick = (action: 'APPROVE' | 'REJECT') => {
    setApprovalAction(action)
    
    if (action === 'APPROVE') {
      // For approval, require signature
      setShowSignaturePad(true)
    } else {
      // For rejection, proceed directly
      handleResponse(action, null)
    }
  }

  const handleSignatureSave = (signature: string) => {
    setSignatureData(signature)
    setShowSignaturePad(false)
    
    if (approvalAction) {
      handleResponse(approvalAction, signature)
    }
  }

  const handleSignatureCancel = () => {
    setShowSignaturePad(false)
    setApprovalAction(null)
    setSignatureData(null)
  }

  const handleResponse = async (action: 'APPROVE' | 'REJECT', signature: string | null) => {
    if (!quote) return

    try {
      setResponding(true)
      
      // Mock API call - in real app, send to API
      /*
      const response = await fetch(`/api/public/quotes/${token}/respond`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action,
          comments: customerComments,
          signature: signature,
          customerInfo: {
            userAgent: navigator.userAgent,
            timestamp: new Date().toISOString()
          }
        })
      })
      
      if (!response.ok) throw new Error('Failed to submit response')
      */
      
      // Update local state
      setQuote(prev => prev ? {
        ...prev,
        status: action === 'APPROVE' ? 'APPROVED' : 'REJECTED'
      } : null)
      
      setShowApprovalForm(false)
      setSignatureData(signature)
      
    } catch (err) {
      console.error('Error submitting response:', err)
      alert('Yanıt gönderilirken hata oluştu. Lütfen tekrar deneyin.')
    } finally {
      setResponding(false)
      setApprovalAction(null)
    }
  }

  const downloadPDF = () => {
    if (quote?.pdfUrl) {
      window.open(quote.pdfUrl, '_blank')
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('tr-TR').format(amount) + ' ₺'
  }

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('tr-TR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    })
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'SENT': return 'bg-blue-100 text-blue-800'
      case 'VIEWED': return 'bg-yellow-100 text-yellow-800'
      case 'APPROVED': return 'bg-green-100 text-green-800'
      case 'REJECTED': return 'bg-red-100 text-red-800'
      case 'EXPIRED': return 'bg-gray-100 text-gray-600'
      default: return 'bg-gray-100 text-gray-600'
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'SENT': return 'Gönderildi'
      case 'VIEWED': return 'Görüntülendi'
      case 'APPROVED': return 'Onaylandı'
      case 'REJECTED': return 'Reddedildi'
      case 'EXPIRED': return 'Süresi Doldu'
      default: return 'Bilinmiyor'
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-4" />
          <p className="text-gray-600">Teklif yükleniyor...</p>
        </div>
      </div>
    )
  }

  if (error || !quote) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 text-center">
            <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Teklif Bulunamadı</h3>
            <p className="text-gray-600 mb-4">
              {error || 'Bu teklif bulunamadı veya erişim linki geçersiz.'}
            </p>
            <p className="text-sm text-gray-500">
              Lütfen e-posta mesajınızdaki linki kontrol edin veya gönderen firma ile iletişime geçin.
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  const isExpired = new Date() > quote.validUntil
  const canRespond = !isExpired && quote.status === 'SENT' || quote.status === 'VIEWED'

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <Sun className="w-10 h-10 text-primary" />
            <h1 className="text-3xl font-bold text-gray-900">{quote.companyName}</h1>
          </div>
          <p className="text-gray-600">Güneş Enerji Sistemi Teklifi</p>
          
          <div className="flex items-center justify-center space-x-4 mt-4">
            <Badge className={getStatusColor(quote.status)}>
              {getStatusLabel(quote.status)}
            </Badge>
            <span className="text-sm text-gray-500">
              Teklif No: {quote.quoteNumber}
            </span>
          </div>
        </div>

        {/* Expiration Warning */}
        {isExpired && (
          <Alert className="mb-6 border-red-200 bg-red-50">
            <AlertTriangle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-700">
              <strong>Bu teklifin geçerlilik süresi dolmuştur.</strong> 
              Yeni bir teklif için lütfen {quote.companyName} ile iletişime geçin.
            </AlertDescription>
          </Alert>
        )}

        {/* Success/Response Messages */}
        {quote.status === 'APPROVED' && (
          <Alert className="mb-6 border-green-200 bg-green-50">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-700">
              <strong>Teşekkürler!</strong> Teklifinizi onayladığınız için teşekkür ederiz. 
              En kısa sürede sizinle iletişime geçeceğiz.
            </AlertDescription>
          </Alert>
        )}

        {quote.status === 'REJECTED' && (
          <Alert className="mb-6 border-red-200 bg-red-50">
            <XCircle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-700">
              Teklifinizle ilgili kararınızı aldığınız için teşekkür ederiz. 
              Geri bildirimleriniz bizim için değerlidir.
            </AlertDescription>
          </Alert>
        )}

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Project Overview */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <FileText className="w-5 h-5 text-primary" />
                  <span>Proje Detayları</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <h3 className="text-xl font-bold text-gray-900 mb-4">{quote.projectTitle}</h3>
                
                {/* System Overview */}
                <div className="bg-primary/5 rounded-lg p-6 mb-6">
                  <h4 className="font-semibold mb-4 flex items-center">
                    <Zap className="w-4 h-4 mr-2 text-primary" />
                    Sistem Özellikleri
                  </h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center bg-white rounded-lg p-3">
                      <div className="text-xl font-bold text-primary">{quote.systemDetails.capacity} kW</div>
                      <div className="text-xs text-gray-600">Sistem Gücü</div>
                    </div>
                    <div className="text-center bg-white rounded-lg p-3">
                      <div className="text-xl font-bold text-blue-600">{quote.systemDetails.panelCount}</div>
                      <div className="text-xs text-gray-600">Panel Sayısı</div>
                    </div>
                    <div className="text-center bg-white rounded-lg p-3">
                      <div className="text-lg font-bold text-green-600">
                        {quote.systemDetails.estimatedProduction.toLocaleString()}
                      </div>
                      <div className="text-xs text-gray-600">Yıllık Üretim (kWh)</div>
                    </div>
                    <div className="text-center bg-white rounded-lg p-3">
                      <div className="text-lg font-bold text-orange-600">{quote.systemDetails.paybackPeriod} Yıl</div>
                      <div className="text-xs text-gray-600">Geri Ödeme Süresi</div>
                    </div>
                  </div>
                </div>

                {/* Items */}
                <div className="mb-6">
                  <h4 className="font-semibold mb-3">Teklif Kalemleri</h4>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-3 py-2 text-left">Ürün/Hizmet</th>
                          <th className="px-3 py-2 text-center">Adet</th>
                          <th className="px-3 py-2 text-right">Birim Fiyat</th>
                          <th className="px-3 py-2 text-right">Toplam</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y">
                        {quote.items.map((item) => (
                          <tr key={item.id}>
                            <td className="px-3 py-2">
                              <div className="font-medium">{item.name}</div>
                              {item.description && (
                                <div className="text-xs text-gray-500">{item.description}</div>
                              )}
                            </td>
                            <td className="px-3 py-2 text-center">{item.quantity}</td>
                            <td className="px-3 py-2 text-right">{formatCurrency(item.unitPrice)}</td>
                            <td className="px-3 py-2 text-right font-medium">{formatCurrency(item.total)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Total */}
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold">Toplam Yatırım</span>
                    <span className="text-2xl font-bold text-green-600">
                      {formatCurrency(quote.totalAmount)}
                    </span>
                  </div>
                  <p className="text-sm text-green-700 mt-1">KDV Dahil • 25 Yıl Garanti</p>
                </div>

                {/* Notes */}
                {quote.notes && (
                  <div className="mt-6">
                    <h4 className="font-semibold mb-2">Notlar</h4>
                    <p className="text-gray-700 text-sm">{quote.notes}</p>
                  </div>
                )}

                {/* Terms */}
                {quote.terms && (
                  <div className="mt-4">
                    <h4 className="font-semibold mb-2">Şartlar ve Koşullar</h4>
                    <p className="text-gray-700 text-sm">{quote.terms}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">İşlemler</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {quote.pdfUrl && (
                  <Button onClick={downloadPDF} className="w-full" variant="outline">
                    <Download className="w-4 h-4 mr-2" />
                    PDF İndir
                  </Button>
                )}

                {canRespond && !showApprovalForm && (
                  <Button 
                    onClick={() => setShowApprovalForm(true)}
                    className="w-full"
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Teklifi Değerlendir
                  </Button>
                )}

                {showApprovalForm && (
                  <div className="space-y-4 border-t pt-4">
                    <div>
                      <label className="text-sm font-medium">Yorumlarınız (İsteğe bağlı)</label>
                      <Textarea
                        value={customerComments}
                        onChange={(e) => setCustomerComments(e.target.value)}
                        placeholder="Teklif hakkındaki düşüncelerinizi paylaşabilirsiniz..."
                        className="mt-1"
                        rows={3}
                      />
                    </div>
                    
                    {approvalAction === 'APPROVE' && (
                      <div>
                        <label className="text-sm font-medium mb-2 block">Dijital İmza</label>
                        <div className="text-xs text-gray-600 mb-3">
                          Teklifi onaylamak için aşağıya dijital imzanızı atın
                        </div>
                        <SignaturePad
                          ref={signaturePadRef}
                          onSave={(signature) => {
                            console.log('Signature saved:', signature)
                          }}
                          title="Teklif Onay İmzası"
                          description="Bu teklifi onayladığınızı belirtmek için imzanızı atın"
                          width={400}
                          height={150}
                          backgroundColor="#fafafa"
                          penColor="#333333"
                        />
                      </div>
                    )}
                    
                    {approvalAction ? (
                      <div className="flex space-x-2">
                        <Button
                          onClick={() => {
                            if (approvalAction === 'APPROVE') {
                              if (signaturePadRef.current?.isEmpty()) {
                                alert('Lütfen teklifi onaylamak için dijital imzanızı atın.')
                                return
                              }
                              const signature = signaturePadRef.current?.getSignatureData() ?? null
                              handleResponse('APPROVE', signature)
                            } else {
                              handleResponse('REJECT', null)
                            }
                          }}
                          disabled={responding}
                          className={`flex-1 ${approvalAction === 'APPROVE' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'}`}
                        >
                          {responding ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <CheckCircle className="w-4 h-4 mr-2" />}
                          {approvalAction === 'APPROVE' ? 'İmzayla ve Onayla' : 'Reddet'}
                        </Button>
                        <Button
                          onClick={() => setApprovalAction(null)}
                          variant="outline"
                          disabled={responding}
                        >
                          Geri
                        </Button>
                      </div>
                    ) : (
                      <div className="flex space-x-2">
                        <Button
                          onClick={() => setApprovalAction('APPROVE')}
                          disabled={responding}
                          className="flex-1 bg-green-600 hover:bg-green-700"
                        >
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Onayla
                        </Button>
                        <Button
                          onClick={() => setApprovalAction('REJECT')}
                          disabled={responding}
                          variant="destructive"
                          className="flex-1"
                        >
                          <XCircle className="w-4 h-4 mr-2" />
                          Reddet
                        </Button>
                      </div>
                    )}
                    
                    <Button
                      onClick={() => {
                        setShowApprovalForm(false)
                        setApprovalAction(null)
                        setCustomerComments('')
                        signaturePadRef.current?.clear()
                      }}
                      variant="ghost"
                      className="w-full"
                    >
                      İptal
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Quote Info */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center">
                  <Clock className="w-4 h-4 mr-2" />
                  Teklif Bilgileri
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div>
                  <span className="font-medium">Teklif No:</span>
                  <span className="ml-2">{quote.quoteNumber}</span>
                </div>
                <div>
                  <span className="font-medium">Oluşturulma:</span>
                  <span className="ml-2">{formatDate(quote.createdAt)}</span>
                </div>
                <div>
                  <span className="font-medium">Geçerlilik:</span>
                  <span className={`ml-2 ${isExpired ? 'text-red-600 font-semibold' : ''}`}>
                    {formatDate(quote.validUntil)}
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Contact Info */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center">
                  <User className="w-4 h-4 mr-2" />
                  İletişim
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="space-y-2">
                  <div className="font-medium text-primary">{quote.companyName}</div>
                  <div>
                    <div className="font-medium">{quote.engineerName}</div>
                    <div className="text-gray-600">{quote.engineerTitle}</div>
                  </div>
                </div>
                
                <Separator />
                
                <div className="space-y-2">
                  <div className="flex items-center text-gray-600">
                    <User className="w-3 h-3 mr-2" />
                    <span className="text-xs">Müşteri</span>
                  </div>
                  <div>
                    <div className="font-medium">{quote.customerName}</div>
                    <div className="text-gray-600">{quote.customerEmail}</div>
                    {quote.customerPhone && (
                      <div className="text-gray-600">{quote.customerPhone}</div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Guarantees */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center">
                  <Shield className="w-4 h-4 mr-2" />
                  Garantiler
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Panel Performansı:</span>
                  <span className="font-medium">25 Yıl</span>
                </div>
                <div className="flex justify-between">
                  <span>İnverter:</span>
                  <span className="font-medium">10 Yıl</span>
                </div>
                <div className="flex justify-between">
                  <span>İşçilik:</span>
                  <span className="font-medium">2 Yıl</span>
                </div>
                <div className="flex justify-between">
                  <span>Sistem:</span>
                  <span className="font-medium">5 Yıl</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-12 text-center text-sm text-gray-500">
          <p>Bu teklif {quote.companyName} tarafından hazırlanmıştır.</p>
          <p className="mt-1">Güneş Enerjisi ile Geleceğe • {new Date().getFullYear()}</p>
        </div>
      </div>
    </div>
  )
}