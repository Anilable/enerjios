'use client'

import { useState, useEffect } from 'react'
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
  TrendingDown, 
  Users, 
  DollarSign, 
  Zap, 
  Building,
  FileText,
  Calendar,
  Download
} from 'lucide-react'
import { formatCurrency, formatNumber } from '@/lib/utils'

const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#00ff00']

interface ReportsOverviewProps {
  className?: string
}

export default function ReportsOverview({ className }: ReportsOverviewProps) {
  const { data: session } = useSession()
  const [loading, setLoading] = useState(true)
  const [dateRange, setDateRange] = useState('30d')
  const [reportType, setReportType] = useState('sales-summary')
  const [reportData, setReportData] = useState<any>(null)
  
  const [dashboardStats, setDashboardStats] = useState({
    totalRevenue: 0,
    totalProjects: 0,
    activeCustomers: 0,
    systemCapacity: 0,
    conversionRate: 0,
    avgProjectValue: 0
  })

  useEffect(() => {
    loadReportData()
  }, [reportType, dateRange])

  const loadReportData = async () => {
    try {
      setLoading(true)
      
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
      const data = await response.json()

      if (response.ok) {
        setReportData(data)
        
        // Load dashboard stats if this is the financial overview
        if (reportType === 'financial-overview') {
          setDashboardStats(data.data)
        }
      }
    } catch (error) {
      console.error('Failed to load report data:', error)
    } finally {
      setLoading(false)
    }
  }

  const exportReport = async (format: 'pdf' | 'excel') => {
    try {
      const params = new URLSearchParams({
        type: reportType,
        format,
        startDate: new Date(Date.now() - (parseInt(dateRange) * 24 * 60 * 60 * 1000)).toISOString(),
        endDate: new Date().toISOString()
      })

      const response = await fetch(`/api/reports/export?${params}`)
      const blob = await response.blob()
      
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${reportType}-${new Date().toISOString().split('T')[0]}.${format === 'pdf' ? 'pdf' : 'xlsx'}`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (error) {
      console.error('Failed to export report:', error)
    }
  }

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
          <h1 className="text-2xl font-bold text-gray-900">Raporlar & Analitik</h1>
          <p className="text-gray-600">Detaylı performans analizleri ve iş zekası</p>
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
          <Card>
            <CardHeader>
              <CardTitle>Satış Trendi</CardTitle>
            </CardHeader>
            <CardContent>
              {reportData?.data && (
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
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Project Performance */}
        <TabsContent value="project-performance" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Proje Durumları</CardTitle>
              </CardHeader>
              <CardContent>
                {reportData?.data && (
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={getProjectStatusData(reportData.data)}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
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
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Karlılık Analizi</CardTitle>
              </CardHeader>
              <CardContent>
                {reportData?.data && (
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
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Customer Analytics */}
        <TabsContent value="customer-analytics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Müşteri Segmentasyonu</CardTitle>
            </CardHeader>
            <CardContent>
              {reportData?.data && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">
                        {reportData.data.filter((c: any) => c.type === 'INDIVIDUAL').length}
                      </div>
                      <div className="text-sm text-gray-500">Bireysel Müşteri</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">
                        {reportData.data.filter((c: any) => c.type === 'COMPANY').length}
                      </div>
                      <div className="text-sm text-gray-500">Kurumsal Müşteri</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-purple-600">
                        {reportData.data.filter((c: any) => c.projectCount > 1).length}
                      </div>
                      <div className="text-sm text-gray-500">Tekrar Eden Müşteri</div>
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
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Financial Overview */}
        <TabsContent value="financial-overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Gelir vs Hedef</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span>Bu Ay</span>
                    <span className="font-bold">{formatCurrency(dashboardStats.totalRevenue)}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full" 
                      style={{ width: '75%' }}
                    ></div>
                  </div>
                  <div className="text-sm text-gray-500">
                    Hedefin %75'i tamamlandı
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Proje Pipeline</CardTitle>
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
                    <span>Dönüşüm Oranı</span>
                    <Badge variant="outline">{dashboardStats.conversionRate.toFixed(1)}%</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Company Performance (Admin Only) */}
        {session?.user?.role === 'ADMIN' && (
          <TabsContent value="company-performance" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Firma Performans Sıralaması</CardTitle>
              </CardHeader>
              <CardContent>
                {reportData?.data && (
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