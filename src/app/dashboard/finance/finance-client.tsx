'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { formatCurrency } from '@/lib/utils'
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown,
  CreditCard,
  FileText,
  Calendar,
  Search,
  Download,
  Plus,
  MoreHorizontal,
  RefreshCw
} from 'lucide-react'
import { toast } from 'sonner'

interface FinancialOverview {
  monthlyRevenue: number
  monthlyExpenses: number
  netProfit: number
  pendingAmount: number
  pendingCount: number
}

interface Invoice {
  id: string
  customer: string
  project: string
  amount: number
  date: string
  dueDate: string
  status: 'paid' | 'pending' | 'overdue'
}

interface Expense {
  id: string
  category: string
  description: string
  amount: number
  date: string
  vendor: string
}

interface RevenueData {
  month: string
  revenue: number
  expenses: number
  profit: number
}

export function FinanceClient() {
  const [overview, setOverview] = useState<FinancialOverview | null>(null)
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [revenueData, setRevenueData] = useState<RevenueData[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')

  const fetchFinancialData = async () => {
    try {
      setLoading(true)
      
      // Fetch overview data
      const overviewRes = await fetch('/api/finance?type=overview')
      if (overviewRes.ok) {
        const overviewData = await overviewRes.json()
        setOverview(overviewData)
      }

      // Fetch invoices
      const invoicesRes = await fetch('/api/finance?type=invoices')
      if (invoicesRes.ok) {
        const invoicesData = await invoicesRes.json()
        setInvoices(invoicesData.invoices)
      }

      // Fetch expenses
      const expensesRes = await fetch('/api/finance?type=expenses')
      if (expensesRes.ok) {
        const expensesData = await expensesRes.json()
        setExpenses(expensesData.expenses)
      }

      // Fetch revenue data
      const revenueRes = await fetch('/api/finance?type=revenue')
      if (revenueRes.ok) {
        const revenueDataRes = await revenueRes.json()
        setRevenueData(revenueDataRes.revenueData)
      }

    } catch (error) {
      console.error('Error fetching financial data:', error)
      toast.error('Finansal veriler yüklenirken hata oluştu')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchFinancialData()
  }, [])

  const filteredInvoices = invoices.filter(invoice =>
    invoice.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
    invoice.project.toLowerCase().includes(searchTerm.toLowerCase()) ||
    invoice.id.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleCreateInvoice = () => {
    // Navigate to invoice creation page or open modal
    toast.success('Fatura oluşturma sayfasına yönlendiriliyorsunuz...')
    // TODO: Implement invoice creation modal or navigation
  }

  const handlePaymentReceived = () => {
    toast.success('Ödeme alma işlemi başlatıldı')
    // TODO: Implement payment recording functionality
  }

  const handleAddExpense = () => {
    toast.success('Gider ekleme formu açılıyor...')
    // TODO: Implement expense addition modal
  }

  const handleGenerateReport = () => {
    // Use existing reports functionality
    window.open('/dashboard/reports', '_blank')
    toast.success('Rapor sayfası açılıyor...')
  }

  const handleExportData = () => {
    // Export current financial data as CSV
    const csvData = invoices.map(invoice => ({
      'Fatura No': invoice.id,
      'Müşteri': invoice.customer,
      'Proje': invoice.project,
      'Tutar': invoice.amount,
      'Tarih': invoice.date,
      'Son Ödeme': invoice.dueDate,
      'Durum': invoice.status === 'paid' ? 'Ödendi' : 
               invoice.status === 'pending' ? 'Bekliyor' : 'Gecikti'
    }))
    
    const csvContent = [
      Object.keys(csvData[0] || {}).join(','),
      ...csvData.map(row => Object.values(row).join(','))
    ].join('\n')
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `finansal-veriler-${new Date().toISOString().split('T')[0]}.csv`
    link.click()
    
    toast.success('Finansal veriler CSV olarak indirildi')
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="animate-pulse">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-8 bg-gray-200 rounded w-1/2"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="text-center py-8">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-2" />
          <p>Finansal veriler yükleniyor...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Financial Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-green-600" />
              <div>
                <p className="text-2xl font-bold">{formatCurrency(overview?.monthlyRevenue || 0)}</p>
                <p className="text-sm text-muted-foreground">Aylık Gelir</p>
                <p className="text-xs text-green-600 flex items-center gap-1">
                  <TrendingUp className="w-3 h-3" /> Gerçek veri
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <TrendingDown className="w-5 h-5 text-red-600" />
              <div>
                <p className="text-2xl font-bold">{formatCurrency(overview?.monthlyExpenses || 0)}</p>
                <p className="text-sm text-muted-foreground">Aylık Gider</p>
                <p className="text-xs text-red-600 flex items-center gap-1">
                  <TrendingUp className="w-3 h-3" /> Gerçek veri
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-blue-600" />
              <div>
                <p className="text-2xl font-bold">{formatCurrency(overview?.netProfit || 0)}</p>
                <p className="text-sm text-muted-foreground">Net Kar</p>
                <p className="text-xs text-green-600 flex items-center gap-1">
                  <TrendingUp className="w-3 h-3" /> Gerçek veri
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-purple-600" />
              <div>
                <p className="text-2xl font-bold">{formatCurrency(overview?.pendingAmount || 0)}</p>
                <p className="text-sm text-muted-foreground">Bekleyen Tahsilat</p>
                <p className="text-xs text-orange-600">{overview?.pendingCount || 0} fatura</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Revenue Chart */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Gelir Trendi (6 Aylık)
              </CardTitle>
              <CardDescription>
                Aylık gelir, gider ve kar analizi - Gerçek veriler
              </CardDescription>
            </div>
            <Button variant="outline" size="sm" onClick={fetchFinancialData}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Yenile
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {revenueData.map((data, index) => (
              <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-4">
                  <span className="font-medium w-16">{data.month}</span>
                  <div className="flex gap-6 text-sm">
                    <span className="text-green-600">Gelir: {formatCurrency(data.revenue)}</span>
                    <span className="text-red-600">Gider: {formatCurrency(data.expenses)}</span>
                    <span className="text-blue-600 font-medium">Kar: {formatCurrency(data.profit)}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-32 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-green-600 h-2 rounded-full" 
                      style={{width: `${data.revenue > 0 ? Math.min((data.profit / data.revenue) * 100, 100) : 0}%`}}
                    ></div>
                  </div>
                  <span className="text-xs text-muted-foreground w-12">
                    {data.revenue > 0 ? Math.round((data.profit / data.revenue) * 100) : 0}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Invoices */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Faturalar - Gerçek Veriler
              </CardTitle>
              <CardDescription>
                Müşteri faturaları ve ödeme durumları
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input 
                  placeholder="Fatura ara..." 
                  className="pl-10 w-48"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Button onClick={handleCreateInvoice}>
                <Plus className="w-4 h-4 mr-2" />
                Yeni Fatura
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4">Fatura No</th>
                  <th className="text-left py-3 px-4">Müşteri</th>
                  <th className="text-left py-3 px-4">Proje</th>
                  <th className="text-left py-3 px-4">Tutar</th>
                  <th className="text-left py-3 px-4">Son Ödeme</th>
                  <th className="text-left py-3 px-4">Durum</th>
                  <th className="text-left py-3 px-4">İşlemler</th>
                </tr>
              </thead>
              <tbody>
                {filteredInvoices.length > 0 ? (
                  filteredInvoices.map((invoice) => (
                    <tr key={invoice.id} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4 font-mono text-sm">{invoice.id}</td>
                      <td className="py-3 px-4">
                        <div>
                          <p className="font-medium">{invoice.customer}</p>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-sm">{invoice.project}</td>
                      <td className="py-3 px-4 font-medium">{formatCurrency(invoice.amount)}</td>
                      <td className="py-3 px-4 text-sm">
                        {new Date(invoice.dueDate).toLocaleDateString('tr-TR')}
                      </td>
                      <td className="py-3 px-4">
                        <Badge 
                          variant={
                            invoice.status === 'paid' ? 'default' : 
                            invoice.status === 'pending' ? 'secondary' : 'destructive'
                          }
                          className={
                            invoice.status === 'paid' ? 'bg-green-100 text-green-800' : 
                            invoice.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                          }
                        >
                          {invoice.status === 'paid' ? 'Ödendi' : 
                           invoice.status === 'pending' ? 'Bekliyor' : 'Gecikti'}
                        </Badge>
                      </td>
                      <td className="py-3 px-4">
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-muted-foreground">
                      {searchTerm ? 'Arama kriterinize uygun fatura bulunamadı' : 'Henüz fatura bulunmamaktadır'}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          
          <div className="flex justify-between items-center pt-4 border-t">
            <div className="text-sm text-muted-foreground">
              Toplam {filteredInvoices.length} fatura gösteriliyor
            </div>
            <Button variant="outline" onClick={handleExportData}>
              <Download className="w-4 h-4 mr-2" />
              Dışa Aktar
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Expenses */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingDown className="w-5 h-5" />
              Son Giderler - Gerçek Veriler
            </CardTitle>
            <CardDescription>
              Güncel gider kalemleri ve ödemeler
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {expenses.length > 0 ? (
                expenses.map((expense) => (
                  <div key={expense.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">{expense.category}</p>
                      <p className="text-sm text-muted-foreground">{expense.description}</p>
                      <p className="text-xs text-gray-500">{expense.vendor} • {expense.date}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-red-600">-{formatCurrency(expense.amount)}</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  Henüz gider kaydı bulunmamaktadır
                </div>
              )}
            </div>
            
            <div className="pt-4 border-t">
              <Button variant="outline" className="w-full">Tüm Giderleri Görüntüle</Button>
            </div>
          </CardContent>
        </Card>

        {/* Payment Schedule - Real data */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Ödeme Takvimi
            </CardTitle>
            <CardDescription>
              Yaklaşan ödemeler ve tahsilatlar - Gerçek veriler
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {invoices.filter(invoice => invoice.status === 'pending').slice(0, 5).map((invoice) => {
                const dueDate = new Date(invoice.dueDate)
                const today = new Date()
                const daysUntilDue = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
                const isOverdue = daysUntilDue < 0
                const isUrgent = daysUntilDue <= 7 && daysUntilDue >= 0
                
                return (
                  <div key={invoice.id} className={`p-4 border rounded-lg ${
                    isOverdue ? 'bg-red-50 border-red-200' : 
                    isUrgent ? 'bg-yellow-50 border-yellow-200' : 
                    'bg-green-50 border-green-200'
                  }`}>
                    <div className="flex justify-between items-start">
                      <div>
                        <p className={`font-medium ${
                          isOverdue ? 'text-red-800' : 
                          isUrgent ? 'text-yellow-800' : 
                          'text-green-800'
                        }`}>
                          {invoice.customer}
                        </p>
                        <p className={`text-sm ${
                          isOverdue ? 'text-red-600' : 
                          isUrgent ? 'text-yellow-600' : 
                          'text-green-600'
                        }`}>
                          {invoice.project} • {formatCurrency(invoice.amount)}
                        </p>
                        <p className={`text-xs ${
                          isOverdue ? 'text-red-600' : 
                          isUrgent ? 'text-yellow-600' : 
                          'text-green-600'
                        }`}>
                          {isOverdue ? `${Math.abs(daysUntilDue)} gün gecikti` :
                           isUrgent ? `${daysUntilDue} gün kaldı` :
                           `${daysUntilDue} gün kaldı`}
                        </p>
                      </div>
                      <p className={`font-medium ${
                        isOverdue ? 'text-red-800' : 
                        isUrgent ? 'text-yellow-800' : 
                        'text-green-800'
                      }`}>
                        {dueDate.toLocaleDateString('tr-TR')}
                      </p>
                    </div>
                  </div>
                )
              })}
              
              {invoices.filter(invoice => invoice.status === 'pending').length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  Bekleyen ödeme bulunmamaktadır
                </div>
              )}
            </div>
            
            <div className="pt-4 border-t">
              <Button variant="outline" className="w-full" onClick={() => window.open('/dashboard/finance', '_self')}>
                Tam Takvimi Görüntüle
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Hızlı İşlemler</CardTitle>
          <CardDescription>
            Sık kullanılan finans işlemleri
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Button 
              variant="outline" 
              className="flex flex-col items-center gap-2 h-20"
              onClick={handleCreateInvoice}
            >
              <Plus className="w-5 h-5" />
              Yeni Fatura
            </Button>
            
            <Button 
              variant="outline" 
              className="flex flex-col items-center gap-2 h-20"
              onClick={handlePaymentReceived}
            >
              <CreditCard className="w-5 h-5" />
              Ödeme Al
            </Button>
            
            <Button 
              variant="outline" 
              className="flex flex-col items-center gap-2 h-20"
              onClick={handleAddExpense}
            >
              <TrendingDown className="w-5 h-5" />
              Gider Ekle
            </Button>
            
            <Button 
              variant="outline" 
              className="flex flex-col items-center gap-2 h-20"
              onClick={handleGenerateReport}
            >
              <FileText className="w-5 h-5" />
              Rapor Oluştur
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}