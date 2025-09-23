'use client'

import { useState, useEffect } from 'react'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Shield,
  AlertTriangle,
  TrendingUp,
  Download,
  RefreshCw,
  Calendar,
  Clock,
  CheckCircle,
  FileText,
  AlertCircle,
  BarChart3,
  Activity
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts'

interface ComplianceMetrics {
  totalApplications: number
  completedOnTime: number
  completedLate: number
  stillPending: number
  overdueCount: number
  avgResponseDays: number
  complianceScore: number
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
  recommendations: string[]
}

interface ComplianceTrend {
  date: string
  score: number
  totalApplications: number
  overdueCount: number
}

interface CriticalIssue {
  id: string
  applicationNo: string
  applicantName: string
  requestType: string
  responseDeadline: string
  submittedAt: string
}

interface ActionItem {
  priority: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW'
  title: string
  description: string
  action: string
}

export default function KVKKReportsPage() {
  const [metrics, setMetrics] = useState<ComplianceMetrics | null>(null)
  const [trend, setTrend] = useState<ComplianceTrend[]>([])
  const [criticalIssues, setCriticalIssues] = useState<CriticalIssue[]>([])
  const [actionItems, setActionItems] = useState<ActionItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('overview')
  const [selectedPeriod, setSelectedPeriod] = useState(30)

  useEffect(() => {
    fetchReportData()
  }, [selectedPeriod])

  const fetchReportData = async () => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/admin/kvkk-compliance?type=full_report&days=${selectedPeriod}`)
      if (response.ok) {
        const data = await response.json()
        setMetrics(data.report.summary)
        setTrend(data.report.trend)
        setCriticalIssues(data.report.criticalIssues)
        setActionItems(data.report.actionItems)
      }
    } catch (error) {
      console.error('Error fetching report data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleRecalculateMetrics = async () => {
    try {
      const response = await fetch('/api/admin/kvkk-compliance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'recalculate_metrics', periodDays: selectedPeriod })
      })
      if (response.ok) {
        await fetchReportData()
      }
    } catch (error) {
      console.error('Error recalculating metrics:', error)
    }
  }

  const getRiskColor = (riskLevel: string) => {
    switch (riskLevel) {
      case 'CRITICAL': return 'bg-red-100 text-red-800 border-red-200'
      case 'HIGH': return 'bg-orange-100 text-orange-800 border-orange-200'
      case 'MEDIUM': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'LOW': return 'bg-green-100 text-green-800 border-green-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'CRITICAL': return 'destructive'
      case 'HIGH': return 'secondary'
      case 'MEDIUM': return 'outline'
      default: return 'outline'
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('tr-TR')
  }

  if (isLoading) {
    return (
      <DashboardLayout 
        title="KVKK Uyumluluk Raporları"
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'KVKK', href: '/dashboard/kvkk' },
          { label: 'Uyumluluk Raporları' }
        ]}
      >
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <Card key={i}>
                <CardContent className="p-6">
                  <div className="space-y-3">
                    <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                    <div className="h-8 bg-gray-200 rounded animate-pulse w-3/4"></div>
                    <div className="h-4 bg-gray-200 rounded animate-pulse w-1/2"></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout 
      title="KVKK Uyumluluk Raporları"
      breadcrumbs={[
        { label: 'Dashboard', href: '/dashboard' },
        { label: 'KVKK', href: '/dashboard/kvkk' },
        { label: 'Uyumluluk Raporları' }
      ]}
    >
      <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Shield className="h-8 w-8 text-blue-600" />
            KVKK Uyumluluk Raporları
          </h1>
          <p className="text-gray-600">Kapsamlı uyumluluk analizi ve raporlama</p>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(parseInt(e.target.value))}
            className="px-3 py-2 border border-gray-300 rounded-md"
          >
            <option value={7}>Son 7 Gün</option>
            <option value={30}>Son 30 Gün</option>
            <option value={90}>Son 90 Gün</option>
          </select>
          <Button onClick={handleRecalculateMetrics} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Yenile
          </Button>
          <Button>
            <Download className="h-4 w-4 mr-2" />
            Rapor İndir
          </Button>
        </div>
      </div>

      {/* Risk Level Alert */}
      {metrics && metrics.riskLevel !== 'LOW' && (
        <Card className={cn("border-l-4",
          metrics.riskLevel === 'CRITICAL' ? "border-l-red-500 bg-red-50" :
          metrics.riskLevel === 'HIGH' ? "border-l-orange-500 bg-orange-50" :
          "border-l-yellow-500 bg-yellow-50"
        )}>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <AlertTriangle className={cn("h-6 w-6",
                metrics.riskLevel === 'CRITICAL' ? "text-red-600" :
                metrics.riskLevel === 'HIGH' ? "text-orange-600" :
                "text-yellow-600"
              )} />
              <div>
                <h3 className="font-semibold">
                  Risk Seviyesi: {metrics.riskLevel === 'CRITICAL' ? 'KRİTİK' :
                                 metrics.riskLevel === 'HIGH' ? 'YÜKSEK' : 'ORTA'}
                </h3>
                <p className="text-sm text-gray-600">
                  {metrics.overdueCount > 0 && `${metrics.overdueCount} süresi geçen başvuru. `}
                  Uyumluluk skoru: %{metrics.complianceScore}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Uyumluluk Skoru</p>
                <p className={cn("text-3xl font-bold",
                  (metrics?.complianceScore ?? 0) >= 90 ? "text-green-600" :
                  (metrics?.complianceScore ?? 0) >= 70 ? "text-yellow-600" : "text-red-600"
                )}>
                  %{metrics?.complianceScore || 0}
                </p>
              </div>
              <BarChart3 className="h-8 w-8 text-blue-600" />
            </div>
            <Progress
              value={metrics?.complianceScore || 0}
              className="mt-3"
            />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Süresi Geçen</p>
                <p className="text-3xl font-bold text-red-600">
                  {metrics?.overdueCount || 0}
                </p>
              </div>
              <AlertCircle className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Bekleyen</p>
                <p className="text-3xl font-bold text-yellow-600">
                  {metrics?.stillPending || 0}
                </p>
              </div>
              <Clock className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Ortalama Yanıt</p>
                <p className="text-3xl font-bold text-blue-600">
                  {metrics?.avgResponseDays || 0}
                </p>
                <p className="text-xs text-gray-500">gün</p>
              </div>
              <Activity className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Reports */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Genel Bakış</TabsTrigger>
          <TabsTrigger value="trends">Trendler</TabsTrigger>
          <TabsTrigger value="critical">Kritik Durumlar</TabsTrigger>
          <TabsTrigger value="actions">Eylem Planları</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Risk Değerlendirmesi</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span>Risk Seviyesi</span>
                    <Badge className={getRiskColor(metrics?.riskLevel || 'LOW')}>
                      {metrics?.riskLevel === 'CRITICAL' ? 'KRİTİK' :
                       metrics?.riskLevel === 'HIGH' ? 'YÜKSEK' :
                       metrics?.riskLevel === 'MEDIUM' ? 'ORTA' : 'DÜŞÜK'}
                    </Badge>
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-medium">Öneriler:</h4>
                    <ul className="space-y-1">
                      {metrics?.recommendations.map((rec, index) => (
                        <li key={index} className="text-sm text-gray-600 flex items-start gap-2">
                          <span className="h-1.5 w-1.5 bg-blue-600 rounded-full mt-2 flex-shrink-0" />
                          {rec}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Başvuru Dağılımı</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Zamanında Tamamlanan</span>
                    <span className="font-medium text-green-600">{metrics?.completedOnTime || 0}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Geç Tamamlanan</span>
                    <span className="font-medium text-orange-600">{metrics?.completedLate || 0}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Bekleyende</span>
                    <span className="font-medium text-yellow-600">{metrics?.stillPending || 0}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Süresi Geçen</span>
                    <span className="font-medium text-red-600">{metrics?.overdueCount || 0}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="trends" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Uyumluluk Skoru Trendi</CardTitle>
              <CardDescription>Son {selectedPeriod} günlük uyumluluk performansı</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={trend}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis domain={[0, 100]} />
                    <Tooltip />
                    <Line type="monotone" dataKey="score" stroke="#2563eb" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Günlük Başvuru Sayıları</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={trend}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="totalApplications" fill="#3b82f6" />
                    <Bar dataKey="overdueCount" fill="#ef4444" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="critical" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Kritik Durumlar</CardTitle>
              <CardDescription>Acil müdahale gerektiren başvurular</CardDescription>
            </CardHeader>
            <CardContent>
              {criticalIssues.length > 0 ? (
                <div className="space-y-4">
                  {criticalIssues.map((issue) => (
                    <div key={issue.id} className="border border-red-200 rounded-lg p-4 bg-red-50">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium">{issue.applicationNo}</h4>
                          <p className="text-sm text-gray-600">{issue.applicantName}</p>
                          <p className="text-xs text-gray-500">{issue.requestType}</p>
                        </div>
                        <div className="text-right">
                          <Badge variant="destructive">Süresi Geçti</Badge>
                          <p className="text-xs text-gray-500 mt-1">
                            Son tarih: {formatDate(issue.responseDeadline)}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <CheckCircle className="h-12 w-12 mx-auto mb-4 text-green-500" />
                  <p>Kritik durum bulunmuyor</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="actions" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Önerilen Eylemler</CardTitle>
              <CardDescription>Uyumluluk iyileştirme önerileri</CardDescription>
            </CardHeader>
            <CardContent>
              {actionItems.length > 0 ? (
                <div className="space-y-4">
                  {actionItems.map((item, index) => (
                    <div key={index} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge variant={getPriorityColor(item.priority)}>
                              {item.priority === 'CRITICAL' ? 'KRİTİK' :
                               item.priority === 'HIGH' ? 'YÜKSEK' :
                               item.priority === 'MEDIUM' ? 'ORTA' : 'DÜŞÜK'}
                            </Badge>
                          </div>
                          <h4 className="font-medium">{item.title}</h4>
                          <p className="text-sm text-gray-600 mt-1">{item.description}</p>
                        </div>
                        <Button size="sm" variant="outline">
                          Eylemi Gerçekleştir
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <CheckCircle className="h-12 w-12 mx-auto mb-4 text-green-500" />
                  <p>Tüm önerilen eylemler tamamlandı</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      </div>
    </DashboardLayout>
  )
}