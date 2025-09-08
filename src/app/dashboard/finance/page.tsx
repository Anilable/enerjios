import { requireAuth } from '@/lib/auth-utils'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
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
  MoreHorizontal
} from 'lucide-react'

const revenueData = [
  { month: 'Ocak', revenue: 450000, expenses: 180000, profit: 270000 },
  { month: 'Şubat', revenue: 520000, expenses: 195000, profit: 325000 },
  { month: 'Mart', revenue: 580000, expenses: 220000, profit: 360000 },
  { month: 'Nisan', revenue: 610000, expenses: 240000, profit: 370000 },
  { month: 'Mayıs', revenue: 690000, expenses: 260000, profit: 430000 },
  { month: 'Haziran', revenue: 750000, expenses: 285000, profit: 465000 }
]

const invoices = [
  {
    id: 'INV-2024-001',
    customer: 'Konya Tarım Kooperatifi',
    project: 'Tarımsal GES Projesi',
    amount: 150000,
    date: '2024-01-15',
    dueDate: '2024-02-15',
    status: 'paid'
  },
  {
    id: 'INV-2024-002',
    customer: 'ABC İnşaat Ltd. Şti.',
    project: 'Çatı GES Sistemi',
    amount: 85000,
    date: '2024-01-12',
    dueDate: '2024-02-12',
    status: 'pending'
  },
  {
    id: 'INV-2024-003',
    customer: 'Marmara Tekstil A.Ş.',
    project: 'Fabrika GES Kurulumu',
    amount: 220000,
    date: '2024-01-10',
    dueDate: '2024-02-10',
    status: 'overdue'
  },
  {
    id: 'INV-2024-004',
    customer: 'Ege Otomotiv Sanayi',
    project: 'Endüstriyel GES',
    amount: 180000,
    date: '2024-01-08',
    dueDate: '2024-02-08',
    status: 'paid'
  }
]

const expenses = [
  {
    id: '1',
    category: 'Malzeme Alımı',
    description: 'Solar panel ve inverter',
    amount: 125000,
    date: '2024-01-15',
    vendor: 'GES Tedarik A.Ş.'
  },
  {
    id: '2',
    category: 'Personel Giderleri',
    description: 'Aylık maaş ödemeleri',
    amount: 45000,
    date: '2024-01-01',
    vendor: 'İç Kaynak'
  },
  {
    id: '3',
    category: 'Nakliye',
    description: 'Malzeme taşıma masrafı',
    amount: 8500,
    date: '2024-01-14',
    vendor: 'Lojistik Partner'
  },
  {
    id: '4',
    category: 'Ofis Giderleri',
    description: 'Kira, elektrik, internet',
    amount: 12000,
    date: '2024-01-05',
    vendor: 'Çeşitli'
  }
]

export default async function FinancePage() {
  const user = await requireAuth()

  return (
    <DashboardLayout title="Finans Yönetimi">
      <div className="space-y-6">
        {/* Financial Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-green-600" />
                <div>
                  <p className="text-2xl font-bold">{formatCurrency(750000)}</p>
                  <p className="text-sm text-muted-foreground">Aylık Gelir</p>
                  <p className="text-xs text-green-600 flex items-center gap-1">
                    <TrendingUp className="w-3 h-3" /> %8.7 artış
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
                  <p className="text-2xl font-bold">{formatCurrency(285000)}</p>
                  <p className="text-sm text-muted-foreground">Aylık Gider</p>
                  <p className="text-xs text-red-600 flex items-center gap-1">
                    <TrendingUp className="w-3 h-3" /> %3.2 artış
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
                  <p className="text-2xl font-bold">{formatCurrency(465000)}</p>
                  <p className="text-sm text-muted-foreground">Net Kar</p>
                  <p className="text-xs text-green-600 flex items-center gap-1">
                    <TrendingUp className="w-3 h-3" /> %12.4 artış
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
                  <p className="text-2xl font-bold">{formatCurrency(95000)}</p>
                  <p className="text-sm text-muted-foreground">Bekleyen Tahsilat</p>
                  <p className="text-xs text-orange-600">3 fatura</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Revenue Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Gelir Trendi (6 Aylık)
            </CardTitle>
            <CardDescription>
              Aylık gelir, gider ve kar analizi
            </CardDescription>
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
                        style={{width: `${(data.profit / data.revenue) * 100}%`}}
                      ></div>
                    </div>
                    <span className="text-xs text-muted-foreground w-12">
                      {Math.round((data.profit / data.revenue) * 100)}%
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
                  Faturalar
                </CardTitle>
                <CardDescription>
                  Müşteri faturaları ve ödeme durumları
                </CardDescription>
              </div>
              <div className="flex gap-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input placeholder="Fatura ara..." className="pl-10 w-48" />
                </div>
                <Button>
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
                  {invoices.map((invoice) => (
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
                  ))}
                </tbody>
              </table>
            </div>
            
            <div className="flex justify-between items-center pt-4 border-t">
              <div className="text-sm text-muted-foreground">
                Toplam 4 fatura gösteriliyor
              </div>
              <Button variant="outline">
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
                Son Giderler
              </CardTitle>
              <CardDescription>
                Güncel gider kalemleri ve ödemeler
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {expenses.map((expense) => (
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
                ))}
              </div>
              
              <div className="pt-4 border-t">
                <Button variant="outline" className="w-full">Tüm Giderleri Görüntüle</Button>
              </div>
            </CardContent>
          </Card>

          {/* Payment Schedule */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Ödeme Takvimi
              </CardTitle>
              <CardDescription>
                Yaklaşan ödemeler ve tahsilatlar
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 border rounded-lg bg-green-50 border-green-200">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium text-green-800">Tahsilat Bekleniyor</p>
                      <p className="text-sm text-green-600">ABC İnşaat - INV-2024-002</p>
                      <p className="text-xs text-green-600">12 Şubat 2024</p>
                    </div>
                    <p className="font-medium text-green-800">+{formatCurrency(85000)}</p>
                  </div>
                </div>
                
                <div className="p-4 border rounded-lg bg-red-50 border-red-200">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium text-red-800">Ödeme Gecikti</p>
                      <p className="text-sm text-red-600">Marmara Tekstil - INV-2024-003</p>
                      <p className="text-xs text-red-600">10 Şubat 2024</p>
                    </div>
                    <p className="font-medium text-red-800">+{formatCurrency(220000)}</p>
                  </div>
                </div>
                
                <div className="p-4 border rounded-lg bg-blue-50 border-blue-200">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium text-blue-800">Tedarikçi Ödemesi</p>
                      <p className="text-sm text-blue-600">GES Tedarik A.Ş.</p>
                      <p className="text-xs text-blue-600">20 Şubat 2024</p>
                    </div>
                    <p className="font-medium text-blue-800">-{formatCurrency(65000)}</p>
                  </div>
                </div>
                
                <div className="p-4 border rounded-lg bg-yellow-50 border-yellow-200">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium text-yellow-800">Maaş Ödemesi</p>
                      <p className="text-sm text-yellow-600">Aylık personel maaşları</p>
                      <p className="text-xs text-yellow-600">28 Şubat 2024</p>
                    </div>
                    <p className="font-medium text-yellow-800">-{formatCurrency(45000)}</p>
                  </div>
                </div>
              </div>
              
              <div className="pt-4 border-t">
                <Button variant="outline" className="w-full">Tam Takvimi Görüntüle</Button>
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
              <Button variant="outline" className="flex flex-col items-center gap-2 h-20">
                <Plus className="w-5 h-5" />
                Yeni Fatura
              </Button>
              
              <Button variant="outline" className="flex flex-col items-center gap-2 h-20">
                <CreditCard className="w-5 h-5" />
                Ödeme Al
              </Button>
              
              <Button variant="outline" className="flex flex-col items-center gap-2 h-20">
                <TrendingDown className="w-5 h-5" />
                Gider Ekle
              </Button>
              
              <Button variant="outline" className="flex flex-col items-center gap-2 h-20">
                <FileText className="w-5 h-5" />
                Rapor Oluştur
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}