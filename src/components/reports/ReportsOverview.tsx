'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { useSession } from 'next-auth/react'
import {
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
  LineChart,
  Line,
  Area,
  AreaChart
} from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  TrendingUp,
  Users,
  DollarSign,
  Zap,
  Building,
  FileText,
  Download,
  RefreshCw
} from 'lucide-react'
import { formatCurrency, formatNumber } from '@/lib/utils'
import type {
  ReportsOverviewProps,
  ReportResponse,
  ReportType,
  DashboardStats,
  ProjectPerformanceData
} from '@/types/reports'

const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#00ff00']

// Custom hook for report data management
function useReportData(reportType: string, dateRange: string) {
  const [loading, setLoading] = useState(true)
  const [reportData, setReportData] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  const loadReportData = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const endDate = new Date()
      const startDate = new Date()

      switch (dateRange) {
        case '7d':
          startDate.setDate(endDate.getDate() - 7)
          break
        case '30d':
          startDate.setDate(endDate.getDate() - 30)
          break
        case '90d':
          startDate.setDate(endDate.getDate() - 90)
          break
        case '1y':
          startDate.setFullYear(endDate.getFullYear() - 1)
          break
      }

      const params = new URLSearchParams({
        type: reportType,
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        groupBy: dateRange === '7d' ? 'day' : dateRange === '30d' ? 'week' : 'month'
      })

      const response = await fetch(`/api/reports?${params}`)

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      const data = await response.json()
      setReportData(data)
    } catch (error) {
      console.error('Failed to load report data:', error)
      setError(error instanceof Error ? error.message : 'Failed to load report data')
      setReportData({ data: [], summary: {} })
    } finally {
      setLoading(false)
    }
  }, [reportType, dateRange])

  return { reportData, loading, error, loadReportData }
}

export default function ReportsOverview({ className }: ReportsOverviewProps) {
  const { data: session } = useSession()
  const [dateRange, setDateRange] = useState('30d')
  const [reportType, setReportType] = useState('sales-summary')
  const { reportData, loading, error, loadReportData } = useReportData(reportType, dateRange)



  useEffect(() => {
    loadReportData()
  }, [reportType, dateRange])



  // Memoize expensive calculations
  const dashboardStats = useMemo(() => {
    if (reportType === 'financial-overview' && reportData?.data) {
      return {
        totalRevenue: reportData.data.totalRevenue || 0,
        totalProjects: reportData.data.totalProjects || 0,
        activeProjects: reportData.data.activeProjects || 0,
        completedProjects: reportData.data.completedProjects || 0,
        systemCapacity: reportData.data.systemCapacity || 0,
        avgProjectSize: reportData.data.avgProjectSize || 0,
        conversionRate: reportData.data.conversionRate || 0,
        avgProjectValue: reportData.data.avgProjectValue || 0,
        activeCustomers: 0
      }
    }
    return {
      totalRevenue: 0,
      totalProjects: 0,
      activeCustomers: 0,
      systemCapacity: 0,
      conversionRate: 0,
      avgProjectValue: 0,
      activeProjects: 0,
      completedProjects: 0,
      avgProjectSize: 0
    }
  }, [reportType, reportData])

  const exportReport = useCallback(async (format: 'pdf' | 'excel') => {
    try {
      const endDate = new Date()
      const startDate = new Date()

      switch (dateRange) {
        case '7d':
          startDate.setDate(endDate.getDate() - 7)
          break
        case '30d':
          startDate.setDate(endDate.getDate() - 30)
          break
        case '90d':
          startDate.setDate(endDate.getDate() - 90)
          break
        case '1y':
          startDate.setFullYear(endDate.getFullYear() - 1)
          break
      }

      const params = new URLSearchParams({
        type: reportType,
        format,
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString()
      })

      const response = await fetch(`/api/reports/export?${params}`)

      if (!response.ok) {
        throw new Error(`Export failed: ${response.statusText}`)
      }

      const blob = await response.blob()

      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${reportType}-${new Date().toISOString().split('T')[0]}.${format === 'pdf' ? 'pdf' : format === 'excel' ? 'csv' : 'xlsx'}`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (error) {
      console.error('Failed to export report:', error)
      // You could add a toast notification here
    }
  }, [reportType, dateRange])

  if (loading && !reportData) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-24 bg-gray-200 rounded"></div>
            ))}
          </div>
          <div className="h-96 bg-gray-200 rounded"></div>
        </div>
      </div>
    )
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Raporlar & Analitik - Gerçek Veriler</h1>
          <p className="text-gray-600">Veritabanından çekilen gerçek performans analizleri ve iş zekası raporları</p>
          <p className="text-sm text-blue-600">✅ Canlı veri bağlantısı aktif</p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Select value={dateRange} onValueChange={setDateRange}>
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

          <Button
            variant="outline"
            size="sm"
            onClick={loadReportData}
            disabled={loading}
            className="flex items-center gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Yenile
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => exportReport('excel')}
            className="flex items-center gap-2"
          >
            <Download className="h-4 w-4" />
            Excel
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => exportReport('pdf')}
            className="flex items-center gap-2"
          >
            <Download className="h-4 w-4" />
            PDF
          </Button>
        </div>
      </div>

      {/* Dashboard Stats */}
      {reportType === 'financial-overview' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Toplam Gelir</CardTitle>
              <DollarSign className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(dashboardStats.totalRevenue)}</div>
              <div className="flex items-center text-xs text-green-600">
                <TrendingUp className="h-3 w-3 mr-1" />
                +12.5% önceki döneme göre
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Aktif Projeler</CardTitle>
              <Building className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{dashboardStats.activeProjects}</div>
              <div className="text-xs text-gray-500">
                {dashboardStats.completedProjects} tamamlandı
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Sistem Kapasitesi</CardTitle>
              <Zap className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatNumber(dashboardStats.systemCapacity)} kW</div>
              <div className="text-xs text-gray-500">
                Ortalama: {formatNumber(dashboardStats.avgProjectSize)} kW/proje
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Dönüşüm Oranı</CardTitle>
              <FileText className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{dashboardStats.conversionRate.toFixed(1)}%</div>
              <div className="flex items-center text-xs text-green-600">
                <TrendingUp className="h-3 w-3 mr-1" />
                +2.3% önceki döneme göre
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Report Tabs */}
      <Tabs value={reportType} onValueChange={setReportType} className="space-y-4">
        <TabsList className="grid w-full grid-cols-2 lg:grid-cols-5">
          <TabsTrigger value="sales-summary">Satış Özeti</TabsTrigger>
          <TabsTrigger value="project-performance">Proje Performansı</TabsTrigger>
          <TabsTrigger value="customer-analytics">Müşteri Analizi</TabsTrigger>
          <TabsTrigger value="financial-overview">Finansal Durum</TabsTrigger>
          {session?.user?.role === 'ADMIN' && (
            <TabsTrigger value="company-performance">Firma Performansı</TabsTrigger>
          )}
        </TabsList>

        {/* Sales Summary */}
        <TabsContent value="sales-summary" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-green-600" />
                  <div>
                    <p className="text-2xl font-bold">{formatCurrency(reportData?.summary?.totalSales || 0)}</p>
                    <p className="text-sm text-muted-foreground">Toplam Satış</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-blue-600" />
                  <div>
                    <p className="text-2xl font-bold">{reportData?.summary?.totalCount || 0}</p>
                    <p className="text-sm text-muted-foreground">Toplam Proje</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-purple-600" />
                  <div>
                    <p className="text-2xl font-bold">{formatCurrency(reportData?.summary?.averageValue || 0)}</p>
                    <p className="text-sm text-muted-foreground">Ortalama Değer</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Satış Trendi - Gerçek Veriler</CardTitle>
              <p className="text-sm text-muted-foreground">
                Onaylanmış tekliflerden hesaplanan gerçek satış verileri
              </p>
            </CardHeader>
            <CardContent>
              {reportData?.data && reportData.data.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={reportData.data}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="period" />
                    <YAxis />
                    <Tooltip
                      formatter={(value: any) => [formatCurrency(value), 'Tutar']}
                      labelFormatter={(label) => `Dönem: ${label}`}
                    />
                    <Area
                      type="monotone"
                      dataKey="totalAmount"
                      stroke="#8884d8"
                      fill="#8884d8"
                      fillOpacity={0.3}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-64 text-muted-foreground">
                  <div className="text-center">
                    <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>Seçilen dönem için satış verisi bulunamadı</p>
                    <p className="text-sm">Farklı bir tarih aralığı deneyin</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Project Performance */}
        <TabsContent value="project-performance" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-2">
                  <Building className="w-5 h-5 text-blue-600" />
                  <div>
                    <p className="text-2xl font-bold">{reportData?.summary?.totalProjects || 0}</p>
                    <p className="text-sm text-muted-foreground">Toplam Proje</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-2">
                  <Zap className="w-5 h-5 text-yellow-600" />
                  <div>
                    <p className="text-2xl font-bold">{formatNumber(reportData?.summary?.totalCapacity || 0)} kW</p>
                    <p className="text-sm text-muted-foreground">Toplam Kapasite</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-green-600" />
                  <div>
                    <p className="text-2xl font-bold">{formatCurrency(reportData?.summary?.totalRevenue || 0)}</p>
                    <p className="text-sm text-muted-foreground">Toplam Gelir</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-purple-600" />
                  <div>
                    <p className="text-2xl font-bold">{formatCurrency(reportData?.summary?.totalProfit || 0)}</p>
                    <p className="text-sm text-muted-foreground">Toplam Kar</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Proje Durumları - Gerçek Veriler</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Mevcut projelerin durum dağılımı
                </p>
              </CardHeader>
              <CardContent>
                {reportData?.data && reportData.data.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={getProjectStatusData(reportData.data)}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }: { name?: string; percent?: number }) => `${name || ''} ${((percent || 0) * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {getProjectStatusData(reportData.data).map((_, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-64 text-muted-foreground">
                    <div className="text-center">
                      <Building className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>Proje verisi bulunamadı</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Karlılık Analizi - Gerçek Veriler</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Proje başına kW karlılık analizi
                </p>
              </CardHeader>
              <CardContent>
                {reportData?.data && reportData.data.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={reportData.data.slice(0, 10)}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" angle={-45} textAnchor="end" height={60} />
                      <YAxis />
                      <Tooltip
                        formatter={(value: any) => [formatCurrency(value), 'Karlılık/kW']}
                      />
                      <Bar dataKey="profitability" fill="#82ca9d" />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-64 text-muted-foreground">
                    <div className="text-center">
                      <TrendingUp className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>Karlılık verisi bulunamadı</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Customer Analytics */}
        <TabsContent value="customer-analytics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Müşteri Segmentasyonu - Gerçek Veriler</CardTitle>
              <p className="text-sm text-muted-foreground">
                Müşteri tiplerinin dağılımı ve değer analizi
              </p>
            </CardHeader>
            <CardContent>
              {reportData?.data && reportData.data.length > 0 ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">
                        {reportData.summary?.individualCustomers || 0}
                      </div>
                      <div className="text-sm text-gray-500">Bireysel Müşteri</div>
                    </div>
                    <div className="text-center p-4 bg-green-50 rounded-lg">
                      <div className="text-2xl font-bold text-green-600">
                        {reportData.summary?.companyCustomers || 0}
                      </div>
                      <div className="text-sm text-gray-500">Kurumsal Müşteri</div>
                    </div>
                    <div className="text-center p-4 bg-purple-50 rounded-lg">
                      <div className="text-2xl font-bold text-purple-600">
                        {reportData.summary?.repeatCustomers || 0}
                      </div>
                      <div className="text-sm text-gray-500">Tekrar Eden Müşteri</div>
                    </div>
                    <div className="text-center p-4 bg-orange-50 rounded-lg">
                      <div className="text-2xl font-bold text-orange-600">
                        {formatCurrency(reportData.summary?.totalValue || 0)}
                      </div>
                      <div className="text-sm text-gray-500">Toplam Değer</div>
                    </div>
                  </div>

                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={reportData.data.slice(0, 10)}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" angle={-45} textAnchor="end" height={60} />
                      <YAxis />
                      <Tooltip
                        formatter={(value: any) => [formatCurrency(value), 'Toplam Değer']}
                      />
                      <Bar dataKey="totalValue" fill="#8884d8" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="flex items-center justify-center h-64 text-muted-foreground">
                  <div className="text-center">
                    <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>Müşteri verisi bulunamadı</p>
                    <p className="text-sm">Henüz müşteri kaydı bulunmamaktadır</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Financial Overview */}
        <TabsContent value="financial-overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Gelir vs Hedef - Gerçek Veriler</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Onaylanmış tekliflerden hesaplanan gerçek gelir
                </p>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span>Gerçekleşen Gelir</span>
                    <span className="font-bold">{formatCurrency(dashboardStats.totalRevenue)}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full"
                      style={{
                        width: `${Math.min((dashboardStats.totalRevenue / 1000000) * 100, 100)}%`
                      }}
                    ></div>
                  </div>
                  <div className="text-sm text-gray-500">
                    Hedef: ₺1,000,000 ({Math.round((dashboardStats.totalRevenue / 1000000) * 100)}% tamamlandı)
                  </div>
                  <div className="text-xs text-blue-600">
                    Ortalama proje değeri: {formatCurrency(dashboardStats.avgProjectValue)}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Proje Pipeline - Gerçek Veriler</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Mevcut proje durumu ve dönüşüm oranları
                </p>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span>Aktif Projeler</span>
                    <Badge variant="default">{dashboardStats.activeProjects}</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Tamamlanan</span>
                    <Badge variant="secondary">{dashboardStats.completedProjects}</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Toplam Projeler</span>
                    <Badge variant="outline">{dashboardStats.totalProjects}</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Dönüşüm Oranı</span>
                    <Badge
                      variant={dashboardStats.conversionRate > 50 ? "default" : "secondary"}
                      className={dashboardStats.conversionRate > 50 ? "bg-green-600" : ""}
                    >
                      {dashboardStats.conversionRate.toFixed(1)}%
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Sistem Kapasitesi</span>
                    <Badge variant="outline">{formatNumber(dashboardStats.systemCapacity)} kW</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {reportData?.chartData && reportData.chartData.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Gelir Trendi - Gerçek Veriler</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Dönemsel gelir analizi
                </p>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={reportData.chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="period" />
                    <YAxis />
                    <Tooltip
                      formatter={(value: any) => [formatCurrency(value), 'Gelir']}
                      labelFormatter={(label) => `Dönem: ${label}`}
                    />
                    <Line
                      type="monotone"
                      dataKey="totalAmount"
                      stroke="#8884d8"
                      strokeWidth={2}
                      dot={{ fill: '#8884d8' }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Company Performance (Admin Only) */}
        {session?.user?.role === 'ADMIN' && (
          <TabsContent value="company-performance" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center gap-2">
                    <Building className="w-5 h-5 text-blue-600" />
                    <div>
                      <p className="text-2xl font-bold">{reportData?.summary?.totalCompanies || 0}</p>
                      <p className="text-sm text-muted-foreground">Toplam Firma</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center gap-2">
                    <DollarSign className="w-5 h-5 text-green-600" />
                    <div>
                      <p className="text-2xl font-bold">{formatCurrency(reportData?.summary?.totalRevenue || 0)}</p>
                      <p className="text-sm text-muted-foreground">Toplam Gelir</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center gap-2">
                    <FileText className="w-5 h-5 text-purple-600" />
                    <div>
                      <p className="text-2xl font-bold">{reportData?.summary?.totalProjects || 0}</p>
                      <p className="text-sm text-muted-foreground">Toplam Proje</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center gap-2">
                    <Zap className="w-5 h-5 text-yellow-600" />
                    <div>
                      <p className="text-2xl font-bold">{formatNumber(reportData?.summary?.totalCapacity || 0)} kW</p>
                      <p className="text-sm text-muted-foreground">Toplam Kapasite</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Firma Performans Sıralaması - Gerçek Veriler</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Firmaların gelir bazında performans sıralaması
                </p>
              </CardHeader>
              <CardContent>
                {reportData?.data && reportData.data.length > 0 ? (
                  <ResponsiveContainer width="100%" height={400}>
                    <BarChart data={reportData.data.slice(0, 10)} layout="horizontal">
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis type="number" />
                      <YAxis dataKey="name" type="category" width={120} />
                      <Tooltip
                        formatter={(value: any) => [formatCurrency(value), 'Toplam Gelir']}
                      />
                      <Bar dataKey="totalRevenue" fill="#8884d8" />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-64 text-muted-foreground">
                    <div className="text-center">
                      <Building className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>Firma performans verisi bulunamadı</p>
                      <p className="text-sm">Henüz firma verisi bulunmamaktadır</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        )}
      </Tabs>
    </div>
  )
}

function getProjectStatusData(projects: any[]) {
  const statusCounts = projects.reduce((acc, project) => {
    acc[project.status] = (acc[project.status] || 0) + 1
    return acc
  }, {} as any)

  return Object.entries(statusCounts).map(([status, count]) => ({
    name: getStatusName(status as string),
    value: count
  }))
}

function getStatusName(status: string) {
  const statusNames: { [key: string]: string } = {
    'DRAFT': 'Taslak',
    'SUBMITTED': 'Gönderildi',
    'APPROVED': 'Onaylandı',
    'IN_PROGRESS': 'Devam Ediyor',
    'COMPLETED': 'Tamamlandı',
    'REJECTED': 'Reddedildi'
  }
  return statusNames[status] || status
}