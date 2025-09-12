import { requireAuth } from '@/lib/auth-utils'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { formatCurrency, formatPercentage } from '@/lib/utils'
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown,
  CreditCard,
  Receipt,
  PieChart,
  Calendar,
  Download,
  AlertCircle,
  CheckCircle
} from 'lucide-react'

const financialMetrics = {
  totalRevenue: 2450000,
  monthlyRevenue: 185000,
  profit: 367500,
  expenses: 145000,
  revenueGrowth: 15.3,
  profitMargin: 18.7
}

const recentTransactions = [
  {
    id: '1',
    type: 'income',
    description: 'Konut GES Sistemi - Mehmet Yılmaz',
    amount: 85000,
    date: '2024-01-15',
    status: 'completed'
  },
  {
    id: '2',
    type: 'expense',
    description: 'Solar Panel Tedarik - JinkoSolar',
    amount: -45000,
    date: '2024-01-14',
    status: 'completed'
  },
  {
    id: '3',
    type: 'income',
    description: 'Ticari GES Sistemi - ABC Şirket',
    amount: 175000,
    date: '2024-01-13',
    status: 'pending'
  },
  {
    id: '4',
    type: 'expense',
    description: 'Montaj Ekibi Maaş Ödemesi',
    amount: -25000,
    date: '2024-01-12',
    status: 'completed'
  }
]

const monthlyData = [
  { month: 'Ocak', revenue: 185000, expenses: 145000, profit: 40000 },
  { month: 'Aralık', revenue: 220000, expenses: 165000, profit: 55000 },
  { month: 'Kasım', revenue: 195000, expenses: 150000, profit: 45000 },
  { month: 'Ekim', revenue: 210000, expenses: 155000, profit: 55000 },
  { month: 'Eylül', revenue: 180000, expenses: 140000, profit: 40000 },
  { month: 'Ağustos', revenue: 235000, expenses: 170000, profit: 65000 }
]

export default async function FinancialPage() {
  const user = await requireAuth()

  return (
    <DashboardLayout title="Mali Durum">
      <div className="space-y-6">
        {/* Financial Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-green-600" />
                <div>
                  <p className="text-sm text-muted-foreground">Toplam Gelir</p>
                  <p className="text-2xl font-bold">{formatCurrency(financialMetrics.totalRevenue)}</p>
                  <p className="text-sm text-green-600 flex items-center gap-1">
                    <TrendingUp className="w-3 h-3" />
                    {formatPercentage(financialMetrics.revenueGrowth)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-blue-600" />
                <div>
                  <p className="text-sm text-muted-foreground">Aylık Gelir</p>
                  <p className="text-2xl font-bold">{formatCurrency(financialMetrics.monthlyRevenue)}</p>
                  <p className="text-sm text-blue-600">Bu ay</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-purple-600" />
                <div>
                  <p className="text-sm text-muted-foreground">Net Kar</p>
                  <p className="text-2xl font-bold">{formatCurrency(financialMetrics.profit)}</p>
                  <p className="text-sm text-purple-600">{formatPercentage(financialMetrics.profitMargin)} marj</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-2">
                <Receipt className="w-5 h-5 text-orange-600" />
                <div>
                  <p className="text-sm text-muted-foreground">Giderler</p>
                  <p className="text-2xl font-bold">{formatCurrency(financialMetrics.expenses)}</p>
                  <p className="text-sm text-orange-600">Bu ay</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Transactions */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <CreditCard className="w-5 h-5" />
                    Son İşlemler
                  </CardTitle>
                  <CardDescription>
                    Son finansal hareketler
                  </CardDescription>
                </div>
                <Button variant="outline" size="sm">
                  Tümünü Görüntüle
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recentTransactions.map((transaction) => (
                  <div key={transaction.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      {transaction.type === 'income' ? (
                        <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                      ) : (
                        <div className="w-2 h-2 bg-red-600 rounded-full"></div>
                      )}
                      <div>
                        <p className="font-medium text-sm">{transaction.description}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(transaction.date).toLocaleDateString('tr-TR')}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`font-bold ${
                        transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {transaction.type === 'income' ? '+' : ''}{formatCurrency(Math.abs(transaction.amount))}
                      </p>
                      {transaction.status === 'completed' ? (
                        <CheckCircle className="w-4 h-4 text-green-600 ml-auto" />
                      ) : (
                        <AlertCircle className="w-4 h-4 text-orange-600 ml-auto" />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Monthly Performance */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PieChart className="w-5 h-5" />
                Aylık Performans
              </CardTitle>
              <CardDescription>
                Son 6 ayın finansal performansı
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {monthlyData.slice(0, 4).map((month, index) => (
                  <div key={index}>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium">{month.month}</span>
                      <span className="text-sm font-bold">{formatCurrency(month.profit)}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-gradient-to-r from-blue-600 to-green-600 h-2 rounded-full" 
                        style={{width: `${(month.profit / 65000) * 100}%`}}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
              <Button variant="outline" className="w-full mt-4">
                Detaylı Rapor Görüntüle
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Financial Reports */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Receipt className="w-5 h-5" />
              Mali Raporlar
            </CardTitle>
            <CardDescription>
              Finansal raporları indirin ve görüntüleyin
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 border rounded-lg">
                <div className="flex items-center gap-3 mb-3">
                  <Calendar className="w-5 h-5 text-blue-600" />
                  <div>
                    <h4 className="font-medium">Aylık Rapor</h4>
                    <p className="text-sm text-muted-foreground">Ocak 2024</p>
                  </div>
                </div>
                <Button variant="outline" size="sm" className="w-full">
                  <Download className="w-4 h-4 mr-2" />
                  PDF İndir
                </Button>
              </div>
              
              <div className="p-4 border rounded-lg">
                <div className="flex items-center gap-3 mb-3">
                  <PieChart className="w-5 h-5 text-green-600" />
                  <div>
                    <h4 className="font-medium">Kar/Zarar Raporu</h4>
                    <p className="text-sm text-muted-foreground">Q4 2024</p>
                  </div>
                </div>
                <Button variant="outline" size="sm" className="w-full">
                  <Download className="w-4 h-4 mr-2" />
                  Excel İndir
                </Button>
              </div>
              
              <div className="p-4 border rounded-lg">
                <div className="flex items-center gap-3 mb-3">
                  <TrendingUp className="w-5 h-5 text-purple-600" />
                  <div>
                    <h4 className="font-medium">Yıllık Özet</h4>
                    <p className="text-sm text-muted-foreground">2024</p>
                  </div>
                </div>
                <Button variant="outline" size="sm" className="w-full">
                  <Download className="w-4 h-4 mr-2" />
                  PDF İndir
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Budget vs Actual */}
        <Card>
          <CardHeader>
            <CardTitle>Bütçe vs Gerçekleşen</CardTitle>
            <CardDescription>
              Planlanan bütçe ile gerçekleşen değerlerin karşılaştırması
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm">Gelir Hedefi</span>
                  <span className="text-sm">{formatCurrency(200000)} / {formatCurrency(185000)}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-green-600 h-2 rounded-full" style={{width: '92.5%'}}></div>
                </div>
                <p className="text-xs text-muted-foreground mt-1">%92.5 gerçekleşti</p>
              </div>
              
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm">Gider Bütçesi</span>
                  <span className="text-sm">{formatCurrency(150000)} / {formatCurrency(145000)}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-orange-600 h-2 rounded-full" style={{width: '96.7%'}}></div>
                </div>
                <p className="text-xs text-muted-foreground mt-1">%96.7 kullanıldı</p>
              </div>
              
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm">Kar Hedefi</span>
                  <span className="text-sm">{formatCurrency(50000)} / {formatCurrency(40000)}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-blue-600 h-2 rounded-full" style={{width: '80%'}}></div>
                </div>
                <p className="text-xs text-muted-foreground mt-1">%80 gerçekleşti</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}