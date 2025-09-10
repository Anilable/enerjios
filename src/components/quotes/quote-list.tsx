'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { 
  Search,
  Filter,
  Eye,
  Edit,
  Send,
  Download,
  Copy,
  MoreHorizontal,
  Calendar,
  User,
  Zap,
  TrendingUp,
  Mail,
  MessageCircle,
  CheckCircle,
  XCircle,
  Clock,
  ExternalLink,
  Phone
} from 'lucide-react'
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
  createdAt: string
  validUntil: string
  version?: number
  items?: any[]
  profitAmount?: number
  financialAnalysis?: any
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
  designData?: any
}

interface QuoteListProps {
  quotes: QuoteData[]
  onViewQuote: (quote: QuoteData) => void
  onEditQuote: (quote: QuoteData) => void
  onSendQuote: (quote: QuoteData) => void
  getStatusColor: (status: QuoteData['status']) => string
  getStatusLabel: (status: QuoteData['status']) => string
}

export function QuoteList({ 
  quotes, 
  onViewQuote, 
  onEditQuote,
  onSendQuote, 
  getStatusColor, 
  getStatusLabel 
}: QuoteListProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [sortBy, setSortBy] = useState<string>('createdAt')

  const filteredQuotes = quotes.filter(quote => {
    const matchesSearch = searchQuery === '' || 
      quote.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      quote.quoteNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      quote.projectTitle?.toLowerCase().includes(searchQuery.toLowerCase())
    
    const matchesStatus = statusFilter === 'all' || quote.status === statusFilter
    
    return matchesSearch && matchesStatus
  }).sort((a, b) => {
    switch (sortBy) {
      case 'createdAt':
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      case 'total':
        return b.total - a.total
      case 'customerName':
        return a.customerName.localeCompare(b.customerName)
      default:
        return 0
    }
  })

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('tr-TR', {
      day: '2-digit',
      month: '2-digit', 
      year: 'numeric'
    }).format(date)
  }

  const isExpiringSoon = (validUntil: Date) => {
    const daysUntilExpiry = Math.ceil((validUntil.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
    return daysUntilExpiry <= 7 && daysUntilExpiry > 0
  }

  const isExpired = (validUntil: Date) => {
    return validUntil.getTime() < new Date().getTime()
  }

  const getDeliveryInfo = (quote: QuoteData) => {
    if (quote.sentAt && quote.deliveryChannel) {
      return {
        sentAt: quote.sentAt,
        channel: quote.deliveryChannel,
        email: quote.deliveryEmail,
        phone: quote.deliveryPhone,
        viewedAt: quote.viewedAt,
        respondedAt: quote.respondedAt || quote.approvedAt || quote.rejectedAt
      }
    }
    return null
  }

  const getViewUrl = (quote: QuoteData) => {
    if (quote.deliveryToken) {
      return `${window.location.origin}/quotes/public/${quote.deliveryToken}`
    }
    return null
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Müşteri, teklif numarası veya proje ara..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <div className="flex gap-2">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tümü</SelectItem>
                  <SelectItem value="DRAFT">Taslak</SelectItem>
                  <SelectItem value="SENT">Gönderildi</SelectItem>
                  <SelectItem value="VIEWED">Görüntülendi</SelectItem>
                  <SelectItem value="APPROVED">Onaylandı</SelectItem>
                  <SelectItem value="REJECTED">Reddedildi</SelectItem>
                  <SelectItem value="EXPIRED">Süresi Doldu</SelectItem>
                </SelectContent>
              </Select>

              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-36">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="createdAt">Tarih</SelectItem>
                  <SelectItem value="total">Tutar</SelectItem>
                  <SelectItem value="customerName">Müşteri</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Results Summary */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-600">
          {filteredQuotes.length} teklif gösteriliyor
        </p>
        <div className="flex items-center space-x-2 text-sm text-gray-600">
          <span>Toplam Değer:</span>
          <span className="font-medium text-gray-900">
            ₺{filteredQuotes.reduce((sum, quote) => sum + quote.total, 0).toLocaleString()}
          </span>
        </div>
      </div>

      {/* Quote Cards */}
      <div className="grid gap-4">
        {filteredQuotes.map((quote) => (
          <Card key={quote.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1 space-y-3">
                  {/* Header */}
                  <div className="flex items-center space-x-4">
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        {quote.quoteNumber}
                      </h3>
                      <p className="text-sm text-gray-600">{quote.projectTitle || 'Proje başlığı yok'}</p>
                    </div>
                    
                    <Badge className={`${getStatusColor(quote.status)} border-0`}>
                      {getStatusLabel(quote.status)}
                    </Badge>
                    
                    {isExpiringSoon(new Date(quote.validUntil)) && (
                      <Badge variant="destructive" className="text-xs">
                        Yakında Sona Eriyor
                      </Badge>
                    )}
                    
                    {isExpired(new Date(quote.validUntil)) && (
                      <Badge variant="secondary" className="text-xs bg-gray-500 text-white">
                        Süresi Doldu
                      </Badge>
                    )}
                  </div>

                  {/* Customer & System Info */}
                  <div className="grid md:grid-cols-4 gap-4 text-sm">
                    <div className="flex items-center space-x-2">
                      <User className="w-4 h-4 text-gray-400" />
                      <div>
                        <div className="font-medium">{quote.customerName}</div>
                        <div className="text-gray-600">{quote.customerPhone}</div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Zap className="w-4 h-4 text-yellow-500" />
                      <div>
                        <div className="font-medium">{quote.systemSize} kW</div>
                        <div className="text-gray-600">{quote.panelCount} panel</div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <TrendingUp className="w-4 h-4 text-green-500" />
                      <div>
                        <div className="font-medium">₺{quote.total.toLocaleString()}</div>
                        <div className="text-gray-600">%{quote.margin} marj</div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      <div>
                        <div className="font-medium">{formatDate(new Date(quote.createdAt))}</div>
                        <div className="text-gray-600">
                          Geçerli: {formatDate(new Date(quote.validUntil))}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Design Info */}
                  {quote.designData && (
                    <div className="bg-gray-50 rounded-lg p-3">
                      <div className="grid md:grid-cols-4 gap-2 text-xs text-gray-600">
                        <div>Konum: <span className="font-medium">{quote.designData.location}</span></div>
                        <div>Çatı: <span className="font-medium">{quote.designData.roofArea} m²</span></div>
                        <div>Eğim: <span className="font-medium">{quote.designData.tiltAngle}°</span></div>
                        <div>İrradiance: <span className="font-medium">{quote.designData.irradiance} kWh/m²</span></div>
                      </div>
                    </div>
                  )}

                  {/* Financial Summary */}
                  <div className="grid md:grid-cols-3 gap-4 pt-2 border-t border-gray-100">
                    <div className="text-sm">
                      <span className="text-gray-600">Yıllık Üretim:</span>
                      <span className="ml-2 font-medium">
                        {quote.financialAnalysis.annualProduction.toLocaleString()} kWh
                      </span>
                    </div>
                    <div className="text-sm">
                      <span className="text-gray-600">Yıllık Tasarruf:</span>
                      <span className="ml-2 font-medium text-green-600">
                        ₺{quote.financialAnalysis.annualSavings.toLocaleString()}
                      </span>
                    </div>
                    <div className="text-sm">
                      <span className="text-gray-600">Geri Ödeme:</span>
                      <span className="ml-2 font-medium text-primary">
                        {quote.financialAnalysis.paybackPeriod} yıl
                      </span>
                    </div>
                  </div>

                  {/* Delivery Tracking */}
                  {getDeliveryInfo(quote) && (
                    <div className="grid md:grid-cols-4 gap-4 pt-3 border-t border-gray-100">
                      <div className="text-xs">
                        <div className="flex items-center space-x-1 text-gray-600 mb-1">
                          {getDeliveryInfo(quote)!.channel === 'EMAIL' ? (
                            <Mail className="w-3 h-3" />
                          ) : getDeliveryInfo(quote)!.channel === 'WHATSAPP' ? (
                            <MessageCircle className="w-3 h-3" />
                          ) : (
                            <Phone className="w-3 h-3" />
                          )}
                          <span>Gönderildi</span>
                        </div>
                        <div className="font-medium">
                          {formatDate(new Date(getDeliveryInfo(quote)!.sentAt))}
                        </div>
                        <div className="text-gray-500">
                          {getDeliveryInfo(quote)!.email || getDeliveryInfo(quote)!.phone}
                        </div>
                      </div>

                      {getDeliveryInfo(quote)!.viewedAt && (
                        <div className="text-xs">
                          <div className="flex items-center space-x-1 text-blue-600 mb-1">
                            <Eye className="w-3 h-3" />
                            <span>Görüntülendi</span>
                          </div>
                          <div className="font-medium">
                            {getDeliveryInfo(quote)!.viewedAt && formatDate(new Date(getDeliveryInfo(quote)!.viewedAt!))}
                          </div>
                        </div>
                      )}

                      {getDeliveryInfo(quote)!.respondedAt && (
                        <div className="text-xs">
                          <div className="flex items-center space-x-1 mb-1">
                            {quote.status === 'APPROVED' ? (
                              <>
                                <CheckCircle className="w-3 h-3 text-green-600" />
                                <span className="text-green-600">Onaylandı</span>
                              </>
                            ) : quote.status === 'REJECTED' ? (
                              <>
                                <XCircle className="w-3 h-3 text-red-600" />
                                <span className="text-red-600">Reddedildi</span>
                              </>
                            ) : (
                              <>
                                <Clock className="w-3 h-3 text-gray-600" />
                                <span className="text-gray-600">Yanıtlandı</span>
                              </>
                            )}
                          </div>
                          <div className="font-medium">
                            {getDeliveryInfo(quote)!.respondedAt && formatDate(new Date(getDeliveryInfo(quote)!.respondedAt!))}
                          </div>
                        </div>
                      )}

                      {getViewUrl(quote) && (
                        <div className="text-xs">
                          <div className="flex items-center space-x-1 text-gray-600 mb-1">
                            <ExternalLink className="w-3 h-3" />
                            <span>Müşteri Linki</span>
                          </div>
                          <button
                            onClick={() => navigator.clipboard.writeText(getViewUrl(quote)!)}
                            className="text-blue-600 hover:text-blue-700 underline text-xs"
                          >
                            Kopyala
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex flex-col space-y-2 ml-6">
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => onViewQuote(quote)}
                  >
                    <Eye className="w-3 h-3 mr-1" />
                    Görüntüle
                  </Button>
                  
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => onEditQuote(quote)}
                  >
                    <Edit className="w-3 h-3 mr-1" />
                    Düzenle
                  </Button>
                  
                  {quote.status === 'DRAFT' && (
                    <Button 
                      size="sm" 
                      variant="default"
                      onClick={() => onSendQuote(quote)}
                    >
                      <Send className="w-3 h-3 mr-1" />
                      Gönder
                    </Button>
                  )}
                  
                  {getViewUrl(quote) && (
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => window.open(getViewUrl(quote)!, '_blank')}
                    >
                      <ExternalLink className="w-3 h-3 mr-1" />
                      Görüntüle
                    </Button>
                  )}
                  
                  <Button size="sm" variant="outline">
                    <Download className="w-3 h-3 mr-1" />
                    PDF
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Empty State */}
      {filteredQuotes.length === 0 && (
        <div className="text-center py-12">
          <Search className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Teklif bulunamadı</h3>
          <p className="text-gray-600 mb-4">
            {searchQuery || statusFilter !== 'all' 
              ? 'Arama kriterlerinizi değiştirmeyi deneyin' 
              : 'Henüz hiç teklif oluşturulmamış'
            }
          </p>
          {!searchQuery && statusFilter === 'all' && (
            <Button onClick={() => {}}>
              Yeni Teklif Oluştur
            </Button>
          )}
        </div>
      )}
    </div>
  )
}