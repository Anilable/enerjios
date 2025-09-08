'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { DateRange } from 'react-day-picker'
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, ScatterChart, Scatter, ReferenceLine,
  ComposedChart, Area, AreaChart
} from 'recharts'
import {
  Download, FileSpreadsheet, Mail, Printer, Filter,
  TrendingUp, Calendar, Users, DollarSign, Clock,
  Target, AlertTriangle, CheckCircle, Info, Zap
} from 'lucide-react'
import { format } from 'date-fns'
import { tr } from 'date-fns/locale'

interface ReportData {
  id: string
  name: string
  description: string
  lastGenerated: Date
  status: 'completed' | 'pending' | 'error'
  size: string
  type: 'financial' | 'operational' | 'custom'
}

interface ReportMetrics {
  roi: Array<{ project: string; roi: number; investment: number }>
  efficiency: Array<{ month: string; planned: number; actual: number; efficiency: number }>
  costs: Array<{ category: string; budgeted: number; actual: number; variance: number }>
  timeline: Array<{ phase: string; planned: number; actual: number; delay: number }>
}

export function AdvancedReports() {
  const [selectedReport, setSelectedReport] = useState<string>('')
  const [customFilters, setCustomFilters] = useState<any>({})
  const [reportData, setReportData] = useState<ReportData[]>([])
  const [metrics, setMetrics] = useState<ReportMetrics | null>(null)
  const [loading, setLoading] = useState(false)
  const [dateRange, setDateRange] = useState<DateRange | undefined>()

  useEffect(() => {
    loadReports()
    loadMetrics()
  }, [])

  const loadReports = async () => {
    // Simulate loading reports
    const mockReports: ReportData[] = [
      {
        id: '1',
        name: 'Aylık Finansal Rapor',
        description: 'Kapsamlı gelir-gider analizi ve karlılık raporları',
        lastGenerated: new Date(),
        status: 'completed',
        size: '2.4 MB',
        type: 'financial'
      },
      {
        id: '2',
        name: 'Proje Performans Raporu',
        description: 'Proje tamamlanma süreleri ve verimlilik analizi',
        lastGenerated: new Date(Date.now() - 86400000),
        status: 'completed',
        size: '1.8 MB',
        type: 'operational'
      },
      {
        id: '3',
        name: 'Müşteri Memnuniyet Analizi',
        description: 'Detaylı müşteri geri bildirimleri ve segmentasyon',
        lastGenerated: new Date(Date.now() - 172800000),
        status: 'pending',
        size: '950 KB',
        type: 'custom'
      },
      {
        id: '4',
        name: 'ROI Analizi Raporu',
        description: 'Yatırım getirisi ve maliyet-fayda analizleri',
        lastGenerated: new Date(Date.now() - 259200000),
        status: 'completed',
        size: '1.2 MB',
        type: 'financial'
      }
    ]
    setReportData(mockReports)
  }

  const loadMetrics = async () => {
    const mockMetrics: ReportMetrics = {
      roi: [
        { project: 'Fabrika GES-1', roi: 18.5, investment: 450000 },
        { project: 'Çatı GES-12', roi: 22.3, investment: 125000 },
        { project: 'Tarım GES-5', roi: 15.8, investment: 280000 },
        { project: 'Ticari GES-8', roi: 19.7, investment: 350000 },
        { project: 'Konut GES-24', roi: 25.1, investment: 85000 }
      ],
      efficiency: [
        { month: 'Oca', planned: 85, actual: 78, efficiency: 91.8 },
        { month: 'Şub', planned: 90, actual: 92, efficiency: 102.2 },
        { month: 'Mar', planned: 95, actual: 89, efficiency: 93.7 },
        { month: 'Nis', planned: 88, actual: 91, efficiency: 103.4 },
        { month: 'May', planned: 92, actual: 95, efficiency: 103.3 },
        { month: 'Haz', planned: 98, actual: 94, efficiency: 95.9 }
      ],
      costs: [
        { category: 'Panel', budgeted: 180000, actual: 175000, variance: -2.8 },
        { category: 'İnverter', budgeted: 45000, actual: 48000, variance: 6.7 },
        { category: 'Montaj', budgeted: 25000, actual: 23500, variance: -6.0 },
        { category: 'Kablolama', budgeted: 15000, actual: 16200, variance: 8.0 },
        { category: 'Diğer', budgeted: 8000, actual: 7800, variance: -2.5 }
      ],
      timeline: [
        { phase: 'Tasarım', planned: 5, actual: 4, delay: -1 },
        { phase: 'Tedarik', planned: 14, actual: 16, delay: 2 },
        { phase: 'Montaj', planned: 8, actual: 10, delay: 2 },
        { phase: 'Test', planned: 3, actual: 3, delay: 0 },
        { phase: 'Devreye Alma', planned: 2, actual: 3, delay: 1 }
      ]
    }
    setMetrics(mockMetrics)
  }

  const generateReport = async (reportId: string) => {
    setLoading(true)
    try {
      // Simulate report generation
      await new Promise(resolve => setTimeout(resolve, 3000))
      
      // Update report status
      setReportData(prev => prev.map(report => 
        report.id === reportId 
          ? { ...report, status: 'completed', lastGenerated: new Date() }
          : report
      ))
    } catch (error) {
      console.error('Report generation failed:', error)
    } finally {
      setLoading(false)
    }
  }

  const exportReport = (reportId: string, format: 'pdf' | 'excel' | 'csv') => {
    // Simulate export
    const report = reportData.find(r => r.id === reportId)
    if (report) {
      const fileName = `${report.name.toLowerCase().replace(/\s+/g, '-')}.${format}`
      console.log(`Exporting: ${fileName}`)
      
      // In real implementation, this would trigger actual export
      alert(`${report.name} ${format.toUpperCase()} formatında dışa aktarılıyor...`)
    }
  }

  const scheduleReport = (reportId: string, frequency: 'daily' | 'weekly' | 'monthly') => {
    // Simulate scheduling
    alert(`Rapor ${frequency} olarak zamanlandı`)
  }

  const getStatusBadge = (status: ReportData['status']) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-green-100 text-green-800"><CheckCircle className="w-3 h-3 mr-1" />Tamamlandı</Badge>
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800"><Clock className="w-3 h-3 mr-1" />Bekliyor</Badge>
      case 'error':
        return <Badge className="bg-red-100 text-red-800"><AlertTriangle className="w-3 h-3 mr-1" />Hata</Badge>
    }
  }

  const getTypeIcon = (type: ReportData['type']) => {
    switch (type) {
      case 'financial':
        return <DollarSign className="w-4 h-4" />
      case 'operational':
        return <Zap className="w-4 h-4" />
      case 'custom':
        return <Target className="w-4 h-4" />
    }
  }

  return (
    <div className="space-y-6">
      <Tabs defaultValue="reports" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="reports">Raporlar</TabsTrigger>
          <TabsTrigger value="analytics">Gelişmiş Analitik</TabsTrigger>
          <TabsTrigger value="custom">Özel Rapor</TabsTrigger>
          <TabsTrigger value="schedule">Zamanlama</TabsTrigger>
        </TabsList>

        <TabsContent value="reports" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Mevcut Raporlar</CardTitle>
              <CardDescription>
                Önceden tanımlanmış raporları görüntüleyin ve yönetin
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {reportData.map((report) => (
                  <div key={report.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-start gap-4">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        {getTypeIcon(report.type)}
                      </div>
                      <div className="space-y-1">
                        <h4 className="font-medium">{report.name}</h4>
                        <p className="text-sm text-muted-foreground">{report.description}</p>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <span>Son güncelleme: {format(report.lastGenerated, 'dd MMM yyyy', { locale: tr })}</span>
                          <span>Boyut: {report.size}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {getStatusBadge(report.status)}
                      <div className="flex items-center gap-1">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => generateReport(report.id)}
                          disabled={loading}
                        >
                          Yenile
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => exportReport(report.id, 'pdf')}
                        >
                          <Download className="w-4 h-4 mr-1" />
                          İndir
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          {metrics && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle>ROI Analizi</CardTitle>
                  <CardDescription>Proje bazlı yatırım getiri oranları</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <ScatterChart data={metrics.roi}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis 
                        dataKey="investment" 
                        type="number" 
                        domain={['dataMin', 'dataMax']}
                        tickFormatter={(value) => `₺${(value/1000).toFixed(0)}K`}
                      />
                      <YAxis dataKey="roi" type="number" />
                      <Tooltip 
                        formatter={(value, name) => [
                          name === 'roi' ? `%${value}` : `₺${(value as number).toLocaleString()}`,
                          name === 'roi' ? 'ROI' : 'Yatırım'
                        ]}
                      />
                      <Scatter dataKey="roi" fill="#3b82f6" />
                      <ReferenceLine y={20} stroke="#ef4444" strokeDasharray="5 5" label="Hedef ROI" />
                    </ScatterChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Operasyonel Verimlilik</CardTitle>
                  <CardDescription>Plan vs Gerçekleşen performans</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <ComposedChart data={metrics.efficiency}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="planned" fill="#94a3b8" name="Planlanan" />
                      <Bar dataKey="actual" fill="#3b82f6" name="Gerçekleşen" />
                      <Line 
                        type="monotone" 
                        dataKey="efficiency" 
                        stroke="#f59e0b" 
                        strokeWidth={3}
                        name="Verimlilik %"
                      />
                    </ComposedChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Maliyet Varyans Analizi</CardTitle>
                  <CardDescription>Bütçe vs gerçek maliyetler</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={metrics.costs}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="category" />
                      <YAxis tickFormatter={(value) => `₺${(value/1000).toFixed(0)}K`} />
                      <Tooltip formatter={(value) => `₺${(value as number).toLocaleString()}`} />
                      <Bar dataKey="budgeted" fill="#94a3b8" name="Bütçe" />
                      <Bar dataKey="actual" fill="#3b82f6" name="Gerçek" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Proje Zaman Çizelgesi</CardTitle>
                  <CardDescription>Planlanan vs gerçek süreleri (gün)</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={metrics.timeline}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="phase" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="planned" fill="#94a3b8" name="Planlanan" />
                      <Bar dataKey="actual" fill="#3b82f6" name="Gerçek" />
                      <Bar dataKey="delay" fill="#ef4444" name="Gecikme" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>

        <TabsContent value="custom" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Özel Rapor Oluşturucu</CardTitle>
              <CardDescription>
                Özelleştirilmiş raporlar oluşturun ve kaydedin
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="report-name">Rapor Adı</Label>
                  <Input 
                    id="report-name" 
                    placeholder="Rapor adını girin"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="report-type">Rapor Türü</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Tür seçin" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="financial">Finansal</SelectItem>
                      <SelectItem value="operational">Operasyonel</SelectItem>
                      <SelectItem value="performance">Performans</SelectItem>
                      <SelectItem value="compliance">Uygunluk</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="report-description">Açıklama</Label>
                <Textarea 
                  id="report-description"
                  placeholder="Rapor açıklamasını girin"
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Veri Kaynağı</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Kaynak seçin" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="projects">Projeler</SelectItem>
                      <SelectItem value="customers">Müşteriler</SelectItem>
                      <SelectItem value="financial">Finansal</SelectItem>
                      <SelectItem value="inventory">Envanter</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Zaman Aralığı</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Süre seçin" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="7d">Son 7 Gün</SelectItem>
                      <SelectItem value="30d">Son 30 Gün</SelectItem>
                      <SelectItem value="90d">Son 90 Gün</SelectItem>
                      <SelectItem value="1y">Son 1 Yıl</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Format</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Format seçin" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pdf">PDF</SelectItem>
                      <SelectItem value="excel">Excel</SelectItem>
                      <SelectItem value="csv">CSV</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex gap-2">
                <Button>
                  <Target className="w-4 h-4 mr-2" />
                  Raporu Oluştur
                </Button>
                <Button variant="outline">
                  Şablon Olarak Kaydet
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="schedule" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Otomatik Rapor Zamanlama</CardTitle>
              <CardDescription>
                Raporları otomatik olarak oluşturmak ve göndermek için zamanla
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Rapor Seçin</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Rapor seçin" />
                    </SelectTrigger>
                    <SelectContent>
                      {reportData.map((report) => (
                        <SelectItem key={report.id} value={report.id}>
                          {report.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Sıklık</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Sıklık seçin" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="daily">Günlük</SelectItem>
                      <SelectItem value="weekly">Haftalık</SelectItem>
                      <SelectItem value="monthly">Aylık</SelectItem>
                      <SelectItem value="quarterly">Üç Aylık</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label>E-posta Adresleri</Label>
                <Input 
                  placeholder="rapor@sirket.com, yonetici@sirket.com"
                />
              </div>

              <div className="flex gap-2">
                <Button>
                  <Calendar className="w-4 h-4 mr-2" />
                  Zamanlamayı Kaydet
                </Button>
                <Button variant="outline">
                  <Mail className="w-4 h-4 mr-2" />
                  Test Gönder
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}