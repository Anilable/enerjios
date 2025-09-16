'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { 
  LineChart, 
  Line, 
  AreaChart, 
  Area, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar
} from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  TrendingUp, 
  TrendingDown, 
  Users, 
  DollarSign, 
  Zap, 
  Building,
  Target,
  Calendar,
  Activity,
  BarChart3,
  PieChart as PieChartIcon,
  Gauge
} from 'lucide-react'
import { formatCurrency, formatNumber } from '@/lib/utils'

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D']

interface AnalyticsDashboardProps {
  className?: string
}

export default function AnalyticsDashboard({ className }: AnalyticsDashboardProps) {
  const { data: session } = useSession()
  const [loading, setLoading] = useState(true)
  const [timeframe, setTimeframe] = useState('30d')
  const [analyticsData, setAnalyticsData] = useState<any>(null)
  const [kpiData, setKpiData] = useState({
    totalRevenue: 0,
    monthlyGrowth: 0,
    customerSatisfaction: 0,
    systemEfficiency: 0,
    marketShare: 0,
    profitMargin: 0
  })

  const [performanceMetrics, setPerformanceMetrics] = useState([
    { name: 'Satış Performansı', value: 85, target: 90 },
    { name: 'Müşteri Memnuniyeti', value: 92, target: 95 },
    { name: 'Proje Teslim', value: 78, target: 85 },
    { name: 'Kalite Skoru', value: 88, target: 90 },
    { name: 'Maliyet Kontrolü', value: 82, target: 80 },
    { name: 'Teknoloji Kullanımı', value: 75, target: 85 }
  ])

  useEffect(() => {
    loadAnalyticsData()
  }, [timeframe])

  const loadAnalyticsData = async () => {
    try {
      setLoading(true)
      
      // Simulate API call - replace with actual API calls
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Mock data for demonstration
      setAnalyticsData({
        salesTrend: generateMockSalesData(),
        customerSegments: generateMockCustomerSegments(),
        projectPerformance: generateMockProjectData(),
        financialMetrics: generateMockFinancialData(),
        geographicData: generateMockGeographicData()
      })

      setKpiData({
        totalRevenue: 2450000,
        monthlyGrowth: 15.3,
        customerSatisfaction: 4.8,
        systemEfficiency: 94.2,
        marketShare: 12.5,
        profitMargin: 23.8
      })
    } catch (error) {
      console.error('Failed to load analytics data:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="h-80 bg-gray-200 rounded"></div>
            <div className="h-80 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">İş Zekası ve Analitik</h1>
          <p className="text-gray-600">Gerçek zamanlı performans metrikleri ve öngörüler</p>
        </div>

        <div className="flex gap-2">
          <Select value={timeframe} onValueChange={setTimeframe}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Son 7 gün</SelectItem>
              <SelectItem value="30d">Son 30 gün</SelectItem>
              <SelectItem value="90d">Son 90 gün</SelectItem>
              <SelectItem value="1y">Son 1 yıl</SelectItem>
            </SelectContent>
          </Select>

          <Button variant="outline" size="sm">
            <Activity className="h-4 w-4 mr-2" />
            Canlı Güncelle
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-l-4 border-l-blue-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Toplam Gelir</CardTitle>
            <DollarSign className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(kpiData.totalRevenue)}</div>
            <div className="flex items-center text-xs text-green-600 mt-1">
              <TrendingUp className="h-3 w-3 mr-1" />
              +{kpiData.monthlyGrowth}% aylık büyüme
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Müşteri Memnuniyeti</CardTitle>
            <Users className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{kpiData.customerSatisfaction}/5.0</div>
            <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
              <div 
                className="bg-green-500 h-2 rounded-full" 
                style={{ width: `${(kpiData.customerSatisfaction / 5) * 100}%` }}
              ></div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-yellow-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sistem Verimliliği</CardTitle>
            <Zap className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{kpiData.systemEfficiency}%</div>
            <div className="flex items-center text-xs text-green-600 mt-1">
              <Gauge className="h-3 w-3 mr-1" />
              Hedefin üzerinde
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-purple-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Kar Marjı</CardTitle>
            <Target className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{kpiData.profitMargin}%</div>
            <div className="text-xs text-gray-500 mt-1">
              Sektör ortalaması: 18%
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Analytics Tabs */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Genel Bakış
          </TabsTrigger>
          <TabsTrigger value="sales" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Satış Analizi
          </TabsTrigger>
          <TabsTrigger value="performance" className="flex items-center gap-2">
            <Gauge className="h-4 w-4" />
            Performans
          </TabsTrigger>
          <TabsTrigger value="insights" className="flex items-center gap-2">
            <PieChartIcon className="h-4 w-4" />
            İçgörüler
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Gelir Trendi</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={analyticsData?.salesTrend}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip formatter={(value: any) => [formatCurrency(value), 'Gelir']} />
                    <Area 
                      type="monotone" 
                      dataKey="revenue" 
                      stroke="#8884d8" 
                      fill="#8884d8" 
                      fillOpacity={0.3} 
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Müşteri Segmentleri</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={analyticsData?.customerSegments}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }: any) => `${name || ''} ${percent ? (percent * 100).toFixed(0) : 0}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {analyticsData?.customerSegments?.map((entry: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Performans Metrikleri</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {performanceMetrics.map((metric) => (
                  <div key={metric.name} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">{metric.name}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-500">
                          {metric.value}% / {metric.target}%
                        </span>
                        {metric.value >= metric.target ? (
                          <Badge variant="default" className="bg-green-500">
                            Hedef Aşıldı
                          </Badge>
                        ) : (
                          <Badge variant="secondary">
                            {metric.target - metric.value}% kaldı
                          </Badge>
                        )}
                      </div>
                    </div>
                    <Progress 
                      value={(metric.value / metric.target) * 100} 
                      className="h-2"
                    />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Sales Analysis Tab */}
        <TabsContent value="sales" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Aylık Satış Karşılaştırması</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={analyticsData?.salesTrend}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip formatter={(value: any) => [formatCurrency(value), 'Tutar']} />
                    <Bar dataKey="revenue" fill="#8884d8" />
                    <Bar dataKey="target" fill="#82ca9d" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Proje Türlerine Göre Dağılım</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={[
                        { name: 'Çatı GES', value: 45 },
                        { name: 'Tarımsal GES', value: 30 },
                        { name: 'Sanayi GES', value: 20 },
                        { name: 'Diğer', value: 5 }
                      ]}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }: any) => `${name || ''} ${percent ? (percent * 100).toFixed(0) : 0}%`}
                    >
                      {COLORS.map((color, index) => (
                        <Cell key={`cell-${index}`} fill={color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Performance Tab */}
        <TabsContent value="performance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Performans Radar Grafiği</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <RadarChart data={performanceMetrics}>
                  <PolarGrid />
                  <PolarAngleAxis dataKey="name" />
                  <PolarRadiusAxis domain={[0, 100]} />
                  <Radar 
                    name="Mevcut" 
                    dataKey="value" 
                    stroke="#8884d8" 
                    fill="#8884d8" 
                    fillOpacity={0.3} 
                  />
                  <Radar 
                    name="Hedef" 
                    dataKey="target" 
                    stroke="#82ca9d" 
                    fill="#82ca9d" 
                    fillOpacity={0.1} 
                  />
                  <Tooltip />
                </RadarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Insights Tab */}
        <TabsContent value="insights" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Önemli İçgörüler</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
                    <TrendingUp className="h-5 w-5 text-blue-600 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-blue-900">Güçlü Büyüme Trendi</h4>
                      <p className="text-sm text-blue-700">
                        Son 3 ayda %25'lik büyüme kaydedildi. Tarımsal GES segmentinde özellikle güçlü performans.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3 bg-green-50 rounded-lg">
                    <Users className="h-5 w-5 text-green-600 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-green-900">Yüksek Müşteri Memnuniyeti</h4>
                      <p className="text-sm text-green-700">
                        Müşteri memnuniyet skoru 4.8/5.0. Tekrar eden müşteri oranı %40.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3 bg-yellow-50 rounded-lg">
                    <Target className="h-5 w-5 text-yellow-600 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-yellow-900">Optimizasyon Fırsatı</h4>
                      <p className="text-sm text-yellow-700">
                        Proje teslim sürelerinde iyileştirme potansiyeli mevcut. Hedef: %15 azaltma.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Öneri ve Aksiyonlar</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-2 border rounded-lg">
                    <span className="text-sm">Pazarlama bütçesini %20 artır</span>
                    <Badge variant="outline">Yüksek Öncelik</Badge>
                  </div>
                  <div className="flex items-center justify-between p-2 border rounded-lg">
                    <span className="text-sm">Yeni bayi ağı kur</span>
                    <Badge variant="secondary">Orta Öncelik</Badge>
                  </div>
                  <div className="flex items-center justify-between p-2 border rounded-lg">
                    <span className="text-sm">Müşteri sadakat programı başlat</span>
                    <Badge variant="outline">Düşük Öncelik</Badge>
                  </div>
                  <div className="flex items-center justify-between p-2 border rounded-lg">
                    <span className="text-sm">Operasyonel verimliliği artır</span>
                    <Badge variant="outline">Yüksek Öncelik</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

// Mock data generators
function generateMockSalesData() {
  return [
    { month: 'Oca', revenue: 180000, target: 200000 },
    { month: 'Şub', revenue: 220000, target: 200000 },
    { month: 'Mar', revenue: 280000, target: 250000 },
    { month: 'Nis', revenue: 320000, target: 300000 },
    { month: 'May', revenue: 380000, target: 350000 },
    { month: 'Haz', revenue: 420000, target: 400000 }
  ]
}

function generateMockCustomerSegments() {
  return [
    { name: 'Bireysel', value: 45 },
    { name: 'KOBİ', value: 30 },
    { name: 'Çiftçi', value: 20 },
    { name: 'Sanayi', value: 5 }
  ]
}

function generateMockProjectData() {
  return [
    { name: 'Proje A', completion: 85, efficiency: 92 },
    { name: 'Proje B', completion: 70, efficiency: 88 },
    { name: 'Proje C', completion: 95, efficiency: 94 }
  ]
}

function generateMockFinancialData() {
  return {
    totalRevenue: 2450000,
    totalCost: 1680000,
    profit: 770000,
    margin: 31.4
  }
}

function generateMockGeographicData() {
  return [
    { region: 'Marmara', projects: 45, revenue: 850000 },
    { region: 'Ege', projects: 32, revenue: 620000 },
    { region: 'Akdeniz', projects: 28, revenue: 480000 }
  ]
}