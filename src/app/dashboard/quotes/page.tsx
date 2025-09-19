'use client'

import { useState, useEffect } from 'react'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  Plus,
  Search,
  Filter,
  FileText,
  Send,
  Clock,
  CheckCircle,
  XCircle,
  TrendingUp,
  DollarSign,
  Eye,
  Download,
  Edit,
  Copy,
  MoreHorizontal,
  Trash2
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { formatCurrency } from '@/lib/utils'
import { useToast } from '@/hooks/use-toast'
import { AdminQuoteApprovalDialog } from '@/components/quotes/AdminQuoteApprovalDialog'

interface Quote {
  id: string
  quoteNumber: string
  projectRequestId: string
  customerName: string
  customerEmail: string
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
  approvedAt?: string
  approvedById?: string
  items?: any[]
  customer?: any
  project?: any
}

// Mock data
const mockQuotes: Quote[] = [
  {
    id: '1',
    quoteNumber: 'Q-20240115',
    projectRequestId: '1',
    customerName: 'Ahmet Yılmaz',
    customerEmail: 'ahmet@example.com',
    projectType: 'RESIDENTIAL',
    capacity: 10,
    subtotal: 120000,
    tax: 21600,
    discount: 5000,
    total: 136600,
    status: 'SENT',
    createdAt: '2024-01-15T10:30:00Z',
    validUntil: '2024-02-15T10:30:00Z',
    sentAt: '2024-01-15T11:00:00Z'
  },
  {
    id: '2',
    quoteNumber: 'Q-20240114',
    projectRequestId: '2',
    customerName: 'Fatma Kaya',
    customerEmail: 'fatma@example.com',
    projectType: 'COMMERCIAL',
    capacity: 50,
    subtotal: 450000,
    tax: 81000,
    discount: 20000,
    total: 511000,
    status: 'APPROVED',
    createdAt: '2024-01-14T15:20:00Z',
    validUntil: '2024-02-14T15:20:00Z',
    sentAt: '2024-01-14T16:00:00Z',
    viewedAt: '2024-01-14T17:30:00Z',
    respondedAt: '2024-01-15T09:00:00Z'
  },
  {
    id: '3',
    quoteNumber: 'Q-20240113',
    projectRequestId: '3',
    customerName: 'Mehmet Demir',
    customerEmail: 'mehmet@example.com',
    projectType: 'INDUSTRIAL',
    capacity: 100,
    subtotal: 850000,
    tax: 153000,
    discount: 50000,
    total: 953000,
    status: 'DRAFT',
    createdAt: '2024-01-13T12:00:00Z',
    validUntil: '2024-02-13T12:00:00Z'
  }
]

export default function QuotesPage() {
  const router = useRouter()
  const { data: session } = useSession()
  const { toast } = useToast()
  const [quotes, setQuotes] = useState<Quote[]>([])
  const [loading, setLoading] = useState(true)

  // Redirect INSTALLATION_TEAM users as they don't have access to quotes
  useEffect(() => {
    if (session?.user?.role === 'INSTALLATION_TEAM') {
      router.push('/dashboard')
      return
    }
  }, [session, router])
  const [approvalDialogOpen, setApprovalDialogOpen] = useState(false)
  const [selectedQuoteForApproval, setSelectedQuoteForApproval] = useState<Quote | null>(null)

  // Load quotes from API
  useEffect(() => {
    const loadQuotes = async () => {
      try {
        setLoading(true)
        const response = await fetch('/api/quotes')
        
        if (response.ok) {
          const data = await response.json()
          setQuotes(data)
        } else {
          // Fallback to mock data if API fails
          setQuotes(mockQuotes)
        }
      } catch (error) {
        console.error('Error loading quotes:', error)
        // Fallback to mock data
        setQuotes(mockQuotes)
        toast({
          title: 'Uyarı',
          description: 'Teklifler yüklenirken sorun oluştu, demo veriler gösteriliyor',
          variant: 'destructive'
        })
      } finally {
        setLoading(false)
      }
    }

    loadQuotes()
  }, [])
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [sortBy, setSortBy] = useState('createdAt')

  // Button handlers
  const handleEditDraft = (quote: Quote) => {
    if (quote.status === 'DRAFT') {
      router.push(`/dashboard/quotes/create/${quote.projectRequestId}`)
    } else {
      router.push(`/dashboard/quotes/${quote.id}`)
    }
  }

  const handleDownloadPDF = async (quote: Quote) => {
    try {
      toast({
        title: "PDF İndiriliyor",
        description: `${quote.quoteNumber} PDF'i hazırlanıyor...`,
      })
      
      const response = await fetch(`/api/quotes/${quote.id}/pdf`)
      
      if (!response.ok) {
        throw new Error('PDF download failed')
      }
      
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `teklif-${quote.quoteNumber}.pdf`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
      
      toast({
        title: "PDF İndirildi",
        description: "Teklif PDF'i başarıyla indirildi",
      })
    } catch (error) {
      console.error('PDF download error:', error)
      toast({
        title: "Hata",
        description: "PDF indirirken bir hata oluştu",
        variant: "destructive"
      })
    }
  }

  const handleCopyLink = (quote: Quote) => {
    const link = `${window.location.origin}/quote/${quote.id}`
    navigator.clipboard.writeText(link)
    toast({
      title: "Link Kopyalandı",
      description: "Teklif linki panoya kopyalandı",
    })
  }

  const handleSendReminder = async (quote: Quote) => {
    try {
      const response = await fetch(`/api/quotes/${quote.id}/remind`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      })
      
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Hatırlatma gönderilemedi')
      }
      
      toast({
        title: "Hatırlatma Gönderildi",
        description: "Müşteriye email hatırlatması gönderildi",
      })
    } catch (error) {
      console.error('Reminder error:', error)
      toast({
        title: "Hata",
        description: error instanceof Error ? error.message : "Hatırlatma gönderilirken bir hata oluştu",
        variant: "destructive"
      })
    }
  }

  const handleSendQuote = async (quote: Quote) => {
    try {
      const response = await fetch(`/api/quotes/${quote.id}/send`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      })
      
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Teklif gönderilemedi')
      }
      
      toast({
        title: "Teklif Gönderildi",
        description: "Teklif müşteriye email ile gönderildi",
      })
      
      // Status'u SENT olarak güncelle
      setQuotes(prev => 
        prev.map(q => 
          q.id === quote.id 
            ? { ...q, status: 'SENT' as Quote['status'], sentAt: new Date().toISOString() }
            : q
        )
      )
    } catch (error) {
      console.error('Send quote error:', error)
      toast({
        title: "Hata",
        description: error instanceof Error ? error.message : "Teklif gönderilirken bir hata oluştu",
        variant: "destructive"
      })
    }
  }

  const handleAdminApprove = async (quote: Quote) => {
    console.log('🔵 Dashboard: Opening approval dialog for quote:', quote.id)
    try {
      // Load full quote data with items and relations
      console.log('🔵 Dashboard: Loading quote details...')
      const response = await fetch(`/api/quotes/${quote.id}`)
      if (response.ok) {
        const fullQuote = await response.json()
        console.log('🔵 Dashboard: Quote loaded, opening dialog:', fullQuote)
        setSelectedQuoteForApproval(fullQuote)
        setApprovalDialogOpen(true)
      } else {
        toast({
          title: "Hata",
          description: "Teklif detayları yüklenemedi",
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error('Error loading quote for approval:', error)
      toast({
        title: "Hata",
        description: "Teklif detayları yüklenirken bir hata oluştu",
        variant: "destructive"
      })
    }
  }

  const handleApprovalSuccess = () => {
    // Reload quotes to get updated status
    setQuotes(prev =>
      prev.map(q =>
        q.id === selectedQuoteForApproval?.id
          ? { ...q, status: 'APPROVED' as Quote['status'], approvedAt: new Date().toISOString() }
          : q
      )
    )
  }

  const handleDeleteQuote = async (quote: Quote) => {
    if (!confirm(`"${quote.quoteNumber}" numaralı teklifi silmek istediğinizden emin misiniz?`)) {
      return
    }

    try {
      const response = await fetch(`/api/quotes/${quote.id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        toast({
          title: "Teklif Silindi",
          description: `${quote.quoteNumber} numaralı teklif başarıyla silindi`,
        })
        // Remove from list
        setQuotes(prev => prev.filter(q => q.id !== quote.id))
      } else {
        const error = await response.json()
        throw new Error(error.error || 'Silme işlemi başarısız')
      }
    } catch (error) {
      console.error('Delete quote error:', error)
      toast({
        title: "Hata",
        description: error instanceof Error ? error.message : "Teklif silinirken bir hata oluştu",
        variant: "destructive"
      })
    }
  }

  // Calculate statistics
  const stats = {
    totalQuotes: quotes.length,
    sentQuotes: quotes.filter(q => q.status === 'SENT').length,
    approvedQuotes: quotes.filter(q => q.status === 'APPROVED').length,
    totalValue: quotes.reduce((sum, q) => sum + q.total, 0),
    approvalRate: quotes.length > 0 
      ? (quotes.filter(q => q.status === 'APPROVED').length / quotes.filter(q => q.status !== 'DRAFT').length * 100).toFixed(1)
      : 0,
    avgQuoteValue: quotes.length > 0 ? quotes.reduce((sum, q) => sum + q.total, 0) / quotes.length : 0
  }

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
      year: 'numeric'
    })
  }

  const getDaysUntilExpiry = (validUntil: string) => {
    const today = new Date()
    const expiry = new Date(validUntil)
    const diffTime = expiry.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  const filteredQuotes = quotes.filter(quote => {
    const matchesSearch = searchQuery === '' ||
      quote.quoteNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      quote.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      quote.customerEmail.toLowerCase().includes(searchQuery.toLowerCase())
    
    const matchesStatus = statusFilter === 'all' || quote.status === statusFilter
    
    return matchesSearch && matchesStatus
  }).sort((a, b) => {
    switch (sortBy) {
      case 'createdAt':
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      case 'total':
        return b.total - a.total
      case 'status':
        return a.status.localeCompare(b.status)
      default:
        return 0
    }
  })

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Teklifler</h1>
            <p className="text-muted-foreground">
              Müşteri tekliflerini yönetin ve takip edin
            </p>
          </div>
          <Button onClick={() => router.push('/dashboard/project-requests')}>
            <Plus className="w-4 h-4 mr-2" />
            Yeni Teklif
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Toplam Teklif</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalQuotes}</div>
              <p className="text-xs text-muted-foreground">
                {stats.sentQuotes} gönderildi
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Onaylanan</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.approvedQuotes}</div>
              <p className="text-xs text-muted-foreground">
                %{stats.approvalRate} onay oranı
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Toplam Değer</CardTitle>
              <DollarSign className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatCurrency(stats.totalValue)}
              </div>
              <p className="text-xs text-muted-foreground">
                Ortalama: {formatCurrency(stats.avgQuoteValue)}
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Bekleyen</CardTitle>
              <Clock className="h-4 w-4 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">
                {quotes.filter(q => q.status === 'SENT' || q.status === 'VIEWED').length}
              </div>
              <p className="text-xs text-muted-foreground">
                Müşteri yanıtı bekleniyor
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Teklif no, müşteri adı veya email ara..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 pr-20"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      // Search is already happening live, but this gives feedback
                      toast({
                        title: "Arama Yapılıyor",
                        description: `"${searchQuery}" için ${filteredQuotes.length} sonuç bulundu`,
                      })
                    }
                  }}
                />
                {searchQuery && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 px-2"
                    onClick={() => {
                      setSearchQuery('')
                      toast({
                        title: "Arama Temizlendi",
                        description: "Tüm teklifler gösteriliyor",
                      })
                    }}
                  >
                    <XCircle className="h-4 w-4" />
                  </Button>
                )}
              </div>

              <Button
                variant="outline"
                onClick={() => {
                  if (searchQuery.trim()) {
                    toast({
                      title: "Arama Sonuçları",
                      description: `"${searchQuery}" için ${filteredQuotes.length} teklif bulundu`,
                    })
                  } else {
                    toast({
                      title: "Arama Yapılamadı",
                      description: "Lütfen arama terimi girin",
                      variant: "destructive"
                    })
                  }
                }}
                className="whitespace-nowrap"
              >
                <Search className="w-4 h-4 mr-2" />
                Ara
              </Button>
              
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Durum" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tüm Durumlar</SelectItem>
                  <SelectItem value="DRAFT">Taslak</SelectItem>
                  <SelectItem value="SENT">Gönderildi</SelectItem>
                  <SelectItem value="VIEWED">Görüntülendi</SelectItem>
                  <SelectItem value="APPROVED">Onaylandı</SelectItem>
                  <SelectItem value="REJECTED">Reddedildi</SelectItem>
                  <SelectItem value="EXPIRED">Süresi Doldu</SelectItem>
                </SelectContent>
              </Select>

              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Sırala" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="createdAt">Tarih</SelectItem>
                  <SelectItem value="total">Tutar</SelectItem>
                  <SelectItem value="status">Durum</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Quotes List */}
        <div className="space-y-4">
          {filteredQuotes.map((quote) => {
            const daysUntilExpiry = getDaysUntilExpiry(quote.validUntil)

            return (
              <Card key={quote.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    {/* Sol taraf - Ana bilgiler */}
                    <div className="flex items-center space-x-6 flex-1 cursor-pointer" onClick={() => router.push(`/dashboard/quotes/${quote.id}`)}>
                      {/* Teklif Numarası ve Müşteri */}
                      <div className="min-w-0 flex-1">
                        <h3 className="font-semibold text-base text-gray-900">
                          {quote.quoteNumber}
                        </h3>
                        <p className="text-sm text-muted-foreground truncate">
                          {quote.customerName}
                        </p>
                      </div>

                      {/* Durum */}
                      <div className="flex-shrink-0">
                        <Badge className={`${getStatusColor(quote.status)} flex items-center gap-1 text-xs`}>
                          {getStatusIcon(quote.status)}
                          {getStatusLabel(quote.status)}
                        </Badge>
                      </div>

                      {/* Fiyat */}
                      <div className="flex-shrink-0 text-right">
                        <div className="text-lg font-bold text-primary">
                          {formatCurrency(quote.total)}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {quote.capacity} kW
                        </div>
                      </div>

                      {/* Tarihler */}
                      <div className="flex-shrink-0 text-right">
                        <div className="text-sm text-gray-600">
                          {formatDate(quote.createdAt)}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Geçerlik: {formatDate(quote.validUntil)}
                          {quote.status === 'SENT' && daysUntilExpiry > 0 && (
                            <span className={`ml-1 ${daysUntilExpiry < 7 ? 'text-orange-600' : 'text-green-600'}`}>
                              ({daysUntilExpiry}g)
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Sağ taraf - Action Buttons */}
                    <div className="flex items-center gap-2 ml-4" onClick={(e) => e.stopPropagation()}>

                      {/* DRAFT durumu butonları */}
                      {quote.status === 'DRAFT' && (
                        <>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleEditDraft(quote)
                            }}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleSendQuote(quote)
                            }}
                          >
                            <Send className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            className="bg-green-600 hover:bg-green-700"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleAdminApprove(quote)
                            }}
                          >
                            <CheckCircle className="w-4 h-4" />
                          </Button>
                        </>
                      )}

                      {/* SENT/VIEWED durumu butonları */}
                      {(quote.status === 'SENT' || quote.status === 'VIEWED') && (
                        <>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleSendReminder(quote)
                            }}
                          >
                            <Clock className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            className="bg-green-600 hover:bg-green-700"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleAdminApprove(quote)
                            }}
                          >
                            <CheckCircle className="w-4 h-4" />
                          </Button>
                        </>
                      )}

                      {/* APPROVED durumu göstergesi */}
                      {quote.status === 'APPROVED' && (
                        <div className="text-center">
                          <span className="text-sm text-green-600 font-medium">
                            ✓ Onaylandı
                          </span>
                        </div>
                      )}

                      {/* Ortak butonlar */}
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleDownloadPDF(quote)
                        }}
                      >
                        <Download className="w-4 h-4" />
                      </Button>

                      {/* Silme butonu */}
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleDeleteQuote(quote)
                        }}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Empty State */}
        {filteredQuotes.length === 0 && (
          <Card>
            <CardContent className="text-center py-12">
              <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Teklif bulunamadı</h3>
              <p className="text-gray-600 mb-4">
                {searchQuery || statusFilter !== 'all'
                  ? 'Arama kriterlerinizi değiştirmeyi deneyin'
                  : 'Henüz hiç teklif oluşturulmamış'}
              </p>
              <Button onClick={() => router.push('/dashboard/project-requests')}>
                <Plus className="w-4 h-4 mr-2" />
                İlk Teklifi Oluştur
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Admin Quote Approval Dialog */}
      {selectedQuoteForApproval && (
        <AdminQuoteApprovalDialog
          quote={selectedQuoteForApproval as any}
          isOpen={approvalDialogOpen}
          onClose={() => {
            setApprovalDialogOpen(false)
            setSelectedQuoteForApproval(null)
          }}
          onSuccess={handleApprovalSuccess}
        />
      )}
    </DashboardLayout>
  )
}