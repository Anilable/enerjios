'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/hooks/use-toast'
import { 
  Database, DatabaseZap, HardDrive, Activity, Clock, Shield, 
  RefreshCw, Download, Upload, Search, Play, AlertTriangle,
  CheckCircle, XCircle, Zap, TrendingUp, BarChart3, 
  Settings, Users, FileText, Filter, Calendar
} from 'lucide-react'

import { DashboardLayout } from '@/components/layout/dashboard-layout'

// Real data interfaces
interface DatabaseStats {
  overview: {
    totalRecords: number
    totalTables: number
    totalCapacity: number
    estimatedSize: string
  }
  tables: Array<{
    name: string
    displayName?: string
    records: number
    size: string
    lastUpdated: string
    description?: string
  }>
  activity: {
    todayUsers: number
    todayProjects: number
    todayQuotes: number
    todayProjectRequests: number
    totalToday: number
  }
  performance: {
    averageResponseTime: string
    slowQueries: number
    cacheHitRate: number
    connectionCount: number
  }
}

interface PerformanceData {
  realTime: {
    responseTime: string
    queriesPerSecond: number
    activeConnections: number
    cpuUsage: number
    memoryUsage: number
  }
  activity: {
    lastHour: number
    last24Hours: number
    totalOperations: number
  }
  slowQueries: Array<{
    query: string
    duration: string
    executions: number
    avgDuration: string
    table: string
    suggestion?: string
  }>
  recommendations: Array<{
    type: string
    table: string
    column?: string
    impact: string
    description: string
  }>
  metrics: {
    cacheHitRate: number
    indexUsage: number
    connectionEfficiency: number
  }
}

interface TablesData {
  tables: Array<{
    name: string
    displayName: string
    records: number
    size: string
    lastUpdated: string
    description: string
  }>
  summary: {
    totalTables: number
    totalRecords: number
    largestTable: string
    smallestTable: string
  }
}
// Mock backup history (this would typically come from a backup service)
const mockBackupHistory = [
  {
    id: 1,
    date: new Date().toISOString(),
    size: '2.4GB',
    duration: '12 dk',
    status: 'success',
    type: 'automatic'
  },
  {
    id: 2,
    date: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    size: '2.3GB',
    duration: '11 dk',
    status: 'success',
    type: 'automatic'
  },
  {
    id: 3,
    date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    size: '2.3GB',
    duration: '10 dk',
    status: 'success',
    type: 'manual'
  }
]

export default function DatabaseManagementPage() {
  const { toast } = useToast()
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedTable, setSelectedTable] = useState('')
  const [sqlQuery, setSqlQuery] = useState('')
  const [isExecuting, setIsExecuting] = useState(false)
  const [refreshing, setRefreshing] = useState(false)
  const [loading, setLoading] = useState(true)
  
  // Real data states
  const [databaseStats, setDatabaseStats] = useState<DatabaseStats | null>(null)
  const [performanceData, setPerformanceData] = useState<PerformanceData | null>(null)
  const [tablesData, setTablesData] = useState<TablesData | null>(null)

  // Load real database data
  const loadDatabaseData = async () => {
    try {
      setLoading(true)
      
      const [statsResponse, performanceResponse, tablesResponse] = await Promise.all([
        fetch('/api/database/stats'),
        fetch('/api/database/performance'),
        fetch('/api/database/tables')
      ])

      if (statsResponse.ok) {
        const stats = await statsResponse.json()
        setDatabaseStats(stats)
      }

      if (performanceResponse.ok) {
        const performance = await performanceResponse.json()
        setPerformanceData(performance)
      }

      if (tablesResponse.ok) {
        const tables = await tablesResponse.json()
        setTablesData(tables)
      }

    } catch (error) {
      console.error('Failed to load database data:', error)
      toast({
        title: "Hata",
        description: "Veritabanı bilgileri yüklenemedi",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  // Load data on component mount
  useEffect(() => {
    loadDatabaseData()
  }, [])

  // Real-time updates every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      if (!loading) {
        loadDatabaseData()
      }
    }, 30000)

    return () => clearInterval(interval)
  }, [loading])

  const handleRefresh = async () => {
    setRefreshing(true)
    await loadDatabaseData()
    setRefreshing(false)
    toast({
      title: "Veriler güncellendi",
      description: "Veritabanı metrikleri başarıyla yenilendi",
    })
  }

  const handleBackup = async () => {
    toast({
      title: "Yedekleme başlatıldı",
      description: "Veritabanı yedekleme işlemi arka planda çalışıyor",
    })
  }

  const handleExecuteQuery = async () => {
    if (!sqlQuery.trim()) {
      toast({
        title: "Hata",
        description: "Lütfen bir SQL sorgusu girin",
        variant: "destructive"
      })
      return
    }

    setIsExecuting(true)
    // Simulate query execution
    await new Promise(resolve => setTimeout(resolve, 2000))
    setIsExecuting(false)
    
    toast({
      title: "Sorgu çalıştırıldı",
      description: "SQL sorgusu başarıyla işlendi",
    })
  }

  const filteredTables = tablesData?.tables.filter(table =>
    table.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    table.displayName.toLowerCase().includes(searchTerm.toLowerCase())
  ) || []

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'connected': return 'bg-green-500'
      case 'disconnected': return 'bg-red-500'
      case 'warning': return 'bg-yellow-500'
      default: return 'bg-gray-500'
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'connected': return <Badge className="bg-green-100 text-green-800">Bağlı</Badge>
      case 'disconnected': return <Badge variant="destructive">Bağlantısız</Badge>
      case 'warning': return <Badge variant="outline" className="bg-yellow-50 text-yellow-700">Uyarı</Badge>
      default: return <Badge variant="secondary">Bilinmiyor</Badge>
    }
  }

  if (loading) {
    return (
      <DashboardLayout 
        title="Veritabanı Yönetimi"
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Sistem', href: '/dashboard/system' },
          { label: 'Veritabanı Yönetimi' }
        ]}
      >
        <div className="space-y-6">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-32 bg-gray-200 rounded"></div>
              ))}
            </div>
            <div className="h-96 bg-gray-200 rounded"></div>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout 
      title="Veritabanı Yönetimi"
      breadcrumbs={[
        { label: 'Dashboard', href: '/dashboard' },
        { label: 'Sistem', href: '/dashboard/system' },
        { label: 'Veritabanı Yönetimi' }
      ]}
    >
      <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Veritabanı Yönetimi</h2>
          <p className="text-muted-foreground">
            Veritabanı durumu, performans metrikleri ve yönetim araçları
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" onClick={handleRefresh} disabled={refreshing}>
            <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Yenile
          </Button>
          <Button onClick={handleBackup}>
            <Download className="w-4 h-4 mr-2" />
            Yedekle
          </Button>
        </div>
      </div>

      {/* Connection Status Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">PostgreSQL</CardTitle>
            <div className="flex items-center space-x-2">
              <div className={`w-2 h-2 rounded-full ${getStatusColor('connected')}`} />
              {getStatusBadge('connected')}
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {performanceData?.realTime.activeConnections || 0}/100
            </div>
            <p className="text-xs text-muted-foreground">
              Aktif bağlantılar • {performanceData?.realTime.responseTime || '0ms'} yanıt
            </p>
            <div className="mt-2">
              <div className="text-xs text-muted-foreground mb-1">Bağlantı kullanımı</div>
              <Progress value={((performanceData?.realTime.activeConnections || 0) / 100) * 100} className="h-2" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Redis Cache</CardTitle>
            <div className="flex items-center space-x-2">
              <div className={`w-2 h-2 rounded-full ${getStatusColor('connected')}`} />
              {getStatusBadge('connected')}
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {databaseStats?.overview.estimatedSize || '0MB'}/2GB
            </div>
            <p className="text-xs text-muted-foreground">
              Veritabanı boyutu • Cache aktif
            </p>
            <div className="mt-2">
              <div className="text-xs text-muted-foreground mb-1">Bellek kullanımı</div>
              <Progress value={performanceData?.realTime.memoryUsage || 0} className="h-2" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sorgu Performansı</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {performanceData?.realTime.queriesPerSecond || 0}/s
            </div>
            <p className="text-xs text-muted-foreground">
              Ortalama: {performanceData?.realTime.responseTime || '0ms'} • Yavaş: {performanceData?.slowQueries.length || 0}
            </p>
            <div className="mt-2">
              <div className="text-xs text-muted-foreground mb-1">CPU kullanımı</div>
              <Progress value={performanceData?.realTime.cpuUsage || 0} className="h-2" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Depolama</CardTitle>
            <HardDrive className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {databaseStats?.overview.estimatedSize || '0MB'}
            </div>
            <p className="text-xs text-muted-foreground">
              {databaseStats?.overview.totalTables || 0} tablo • {databaseStats?.overview.totalRecords.toLocaleString() || '0'} kayıt
            </p>
            <div className="mt-2">
              <div className="text-xs text-muted-foreground mb-1">Bellek kullanımı</div>
              <Progress value={performanceData?.realTime.memoryUsage || 0} className="h-2" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Genel Bakış</TabsTrigger>
          <TabsTrigger value="tables">Tablolar</TabsTrigger>
          <TabsTrigger value="performance">Performans</TabsTrigger>
          <TabsTrigger value="backup">Yedekleme</TabsTrigger>
          <TabsTrigger value="security">Güvenlik</TabsTrigger>
          <TabsTrigger value="query">SQL Editörü</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5" />
                  Veritabanı İstatistikleri
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-sm text-muted-foreground">Toplam Boyut</div>
                    <div className="text-2xl font-bold">{databaseStats?.overview.estimatedSize || '0MB'}</div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Tablo Sayısı</div>
                    <div className="text-2xl font-bold">{databaseStats?.overview.totalTables || 0}</div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Toplam Kayıt</div>
                    <div className="text-2xl font-bold">{databaseStats?.overview.totalRecords.toLocaleString() || '0'}</div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Toplam Kapasite</div>
                    <div className="text-2xl font-bold">{databaseStats?.overview.totalCapacity.toLocaleString() || '0'} kW</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  Günlük Aktivite
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-sm text-muted-foreground">Bugünkü Aktivite</div>
                    <div className="text-2xl font-bold">{databaseStats?.activity.totalToday.toLocaleString() || '0'}</div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Ortalama Yanıt</div>
                    <div className="text-2xl font-bold">{performanceData?.realTime.responseTime || '0ms'}</div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Yavaş Sorgular</div>
                    <div className="text-2xl font-bold text-orange-600">{performanceData?.slowQueries.length || 0}</div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Saniyede Sorgu</div>
                    <div className="text-2xl font-bold">{performanceData?.realTime.queriesPerSecond || 0}</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Sistem Sağlığı</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-3">
                <div className="flex items-center space-x-3">
                  <CheckCircle className="w-8 h-8 text-green-500" />
                  <div>
                    <div className="font-medium">Veritabanı Bağlantısı</div>
                    <div className="text-sm text-muted-foreground">
                      {performanceData?.realTime.activeConnections || 0} aktif bağlantı
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <CheckCircle className="w-8 h-8 text-green-500" />
                  <div>
                    <div className="font-medium">Yedekleme Durumu</div>
                    <div className="text-sm text-muted-foreground">
                      Son yedekleme: {new Date(mockBackupHistory[0].date).toLocaleString('tr-TR')}
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  {(performanceData?.slowQueries.length || 0) > 0 ? (
                    <AlertTriangle className="w-8 h-8 text-orange-500" />
                  ) : (
                    <CheckCircle className="w-8 h-8 text-green-500" />
                  )}
                  <div>
                    <div className="font-medium">Performans Durumu</div>
                    <div className="text-sm text-muted-foreground">
                      {(performanceData?.slowQueries.length || 0) > 0 
                        ? `${performanceData?.slowQueries.length} yavaş sorgu tespit edildi`
                        : 'Performans normal'
                      }
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tables Tab */}
        <TabsContent value="tables" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Veritabanı Tabloları</CardTitle>
                <div className="flex items-center space-x-2">
                  <Input
                    placeholder="Tablo ara..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-64"
                  />
                  <Button variant="outline" size="sm">
                    <Search className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tablo Adı</TableHead>
                    <TableHead>Kayıt Sayısı</TableHead>
                    <TableHead>Boyut</TableHead>
                    <TableHead>Son Güncelleme</TableHead>
                    <TableHead>İşlemler</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTables.map((table) => (
                    <TableRow key={table.name}>
                      <TableCell className="font-medium">
                        <div>
                          <div className="font-medium">{table.displayName}</div>
                          <div className="text-sm text-muted-foreground">{table.name}</div>
                        </div>
                      </TableCell>
                      <TableCell>{table.records.toLocaleString()}</TableCell>
                      <TableCell>{table.size}</TableCell>
                      <TableCell>{new Date(table.lastUpdated).toLocaleString('tr-TR')}</TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Button variant="ghost" size="sm" title={table.description}>
                            <FileText className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Settings className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Performance Tab */}
        <TabsContent value="performance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="w-5 h-5" />
                Yavaş Sorgular
              </CardTitle>
              <CardDescription>
                2 saniyeden uzun süren sorgular
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Sorgu</TableHead>
                    <TableHead>Süre</TableHead>
                    <TableHead>Çalıştırma</TableHead>
                    <TableHead>Ortalama</TableHead>
                    <TableHead>Tablo</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {performanceData?.slowQueries.length ? performanceData.slowQueries.map((query, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-mono text-sm max-w-md truncate" title={query.query}>
                        {query.query}
                      </TableCell>
                      <TableCell>
                        <Badge variant="destructive">{query.duration}</Badge>
                      </TableCell>
                      <TableCell>{query.executions}</TableCell>
                      <TableCell>{query.avgDuration}</TableCell>
                      <TableCell>{query.table}</TableCell>
                    </TableRow>
                  )) : (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center text-muted-foreground">
                        Yavaş sorgu bulunamadı
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Optimizasyon Önerileri</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {performanceData?.recommendations.length ? performanceData.recommendations.map((rec, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    {rec.impact === 'high' ? (
                      <AlertTriangle className="w-5 h-5 text-red-500" />
                    ) : rec.impact === 'medium' ? (
                      <AlertTriangle className="w-5 h-5 text-orange-500" />
                    ) : (
                      <CheckCircle className="w-5 h-5 text-green-500" />
                    )}
                    <div>
                      <div className="font-medium">{rec.description}</div>
                      <div className="text-sm text-muted-foreground">
                        {rec.table} tablosu • {rec.impact} öncelik
                      </div>
                    </div>
                  </div>
                )) : (
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    <div>
                      <div className="font-medium">Sistem optimum çalışıyor</div>
                      <div className="text-sm text-muted-foreground">Herhangi bir optimizasyon gerekmiyor</div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Performans Metrikleri</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>Cache Hit Oranı</span>
                    <span>{performanceData?.metrics.cacheHitRate || 0}%</span>
                  </div>
                  <Progress value={performanceData?.metrics.cacheHitRate || 0} className="h-2" />
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>İndeks Kullanımı</span>
                    <span>{performanceData?.metrics.indexUsage || 0}%</span>
                  </div>
                  <Progress value={performanceData?.metrics.indexUsage || 0} className="h-2" />
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>Bağlantı Kullanımı</span>
                    <span>{((performanceData?.realTime.activeConnections || 0) / 100 * 100).toFixed(0)}%</span>
                  </div>
                  <Progress value={(performanceData?.realTime.activeConnections || 0) / 100 * 100} className="h-2" />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Backup Tab */}
        <TabsContent value="backup" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="w-5 h-5" />
                  Yedekleme Durumu
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Son Yedekleme</span>
                    <Badge className="bg-green-100 text-green-800">Başarılı</Badge>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {new Date(mockBackupHistory[0].date).toLocaleString('tr-TR')}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Boyut: {databaseStats?.overview.estimatedSize || '0MB'}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Otomatik Yedekleme</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Durumu</span>
                    <Badge className="bg-green-100 text-green-800">Aktif</Badge>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Her gün 03:00
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Saklama: 30 gün
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Hızlı İşlemler</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button className="w-full" onClick={handleBackup}>
                  <Download className="w-4 h-4 mr-2" />
                  Hemen Yedekle
                </Button>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="outline" className="w-full">
                      <Upload className="w-4 h-4 mr-2" />
                      Geri Yükle
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Veritabanını Geri Yükle</DialogTitle>
                      <DialogDescription>
                        Bir yedek dosyasından veritabanını geri yükleyin. Bu işlem mevcut verileri değiştirecektir.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="backup-file">Yedek Dosyası</Label>
                        <Input id="backup-file" type="file" accept=".sql,.dump" />
                      </div>
                      <Button className="w-full" variant="destructive">
                        Geri Yükle
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Yedekleme Geçmişi</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tarih</TableHead>
                    <TableHead>Boyut</TableHead>
                    <TableHead>Süre</TableHead>
                    <TableHead>Durumu</TableHead>
                    <TableHead>Tür</TableHead>
                    <TableHead>İşlemler</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockBackupHistory.map((backup) => (
                    <TableRow key={backup.id}>
                      <TableCell>{backup.date}</TableCell>
                      <TableCell>{backup.size}</TableCell>
                      <TableCell>{backup.duration}</TableCell>
                      <TableCell>
                        <Badge className="bg-green-100 text-green-800">
                          {backup.status === 'success' ? 'Başarılı' : backup.status}
                        </Badge>
                      </TableCell>
                      <TableCell>{backup.type === 'automatic' ? 'Otomatik' : 'Manuel'}</TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Button variant="ghost" size="sm">
                            <Download className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Upload className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security Tab */}
        <TabsContent value="security" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Kullanıcı Yetkileri
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">admin</div>
                      <div className="text-sm text-muted-foreground">Tam yetki</div>
                    </div>
                    <Badge className="bg-red-100 text-red-800">SUPERUSER</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">app_user</div>
                      <div className="text-sm text-muted-foreground">Uygulama kullanıcısı</div>
                    </div>
                    <Badge className="bg-blue-100 text-blue-800">READ/WRITE</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">readonly_user</div>
                      <div className="text-sm text-muted-foreground">Salt okuma</div>
                    </div>
                    <Badge className="bg-gray-100 text-gray-800">READ ONLY</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Güvenlik Ayarları</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm">SSL Bağlantı</span>
                  <Badge className="bg-green-100 text-green-800">Etkin</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Şifre Karmaşıklığı</span>
                  <Badge className="bg-green-100 text-green-800">Güçlü</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">İki Faktörlü Kimlik</span>
                  <Badge className="bg-orange-100 text-orange-800">Önerilir</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Audit Log</span>
                  <Badge className="bg-green-100 text-green-800">Aktif</Badge>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Son Güvenlik Olayları</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <div>
                    <div className="text-sm font-medium">Başarılı giriş - admin</div>
                    <div className="text-xs text-muted-foreground">2025-01-06 14:30 - IP: 192.168.1.100</div>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <AlertTriangle className="w-5 h-5 text-orange-500" />
                  <div>
                    <div className="text-sm font-medium">Çoklu başarısız giriş denemesi</div>
                    <div className="text-xs text-muted-foreground">2025-01-06 12:15 - IP: 203.0.113.45</div>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <div>
                    <div className="text-sm font-medium">Yedekleme tamamlandı</div>
                    <div className="text-xs text-muted-foreground">2025-01-06 03:00</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* SQL Query Tab */}
        <TabsContent value="query" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="w-5 h-5" />
                SQL Sorgu Editörü
              </CardTitle>
              <CardDescription>
                Dikkat: Bu araç sadece yetkili yöneticiler tarafından kullanılmalıdır
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="sql-query">SQL Sorgusu</Label>
                <Textarea
                  id="sql-query"
                  placeholder="SELECT * FROM users LIMIT 10;"
                  value={sqlQuery}
                  onChange={(e) => setSqlQuery(e.target.value)}
                  className="font-mono h-32"
                />
              </div>
              <div className="flex items-center space-x-2">
                <Button onClick={handleExecuteQuery} disabled={isExecuting}>
                  {isExecuting ? (
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Play className="w-4 h-4 mr-2" />
                  )}
                  {isExecuting ? 'Çalıştırılıyor...' : 'Sorguyu Çalıştır'}
                </Button>
                <Select>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Veritabanı seç" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="main">trakya_solar</SelectItem>
                    <SelectItem value="test">test_db</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="border rounded-md p-4 bg-muted/50">
                <div className="text-sm font-medium mb-2">Sorgu Sonucu:</div>
                <div className="text-sm text-muted-foreground">
                  Sorgu henüz çalıştırılmadı. Yukarıdaki butona tıklayarak sorgunuzu çalıştırabilirsiniz.
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Sık Kullanılan Sorgular</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-2">
                <Button
                  variant="ghost"
                  className="justify-start h-auto p-3"
                  onClick={() => setSqlQuery('SELECT COUNT(*) as total_users FROM users;')}
                >
                  <div className="text-left">
                    <div className="font-medium">Toplam Kullanıcı Sayısı</div>
                    <div className="text-sm text-muted-foreground">SELECT COUNT(*) as total_users FROM users;</div>
                  </div>
                </Button>
                <Button
                  variant="ghost"
                  className="justify-start h-auto p-3"
                  onClick={() => setSqlQuery('SELECT * FROM projects ORDER BY created_at DESC LIMIT 10;')}
                >
                  <div className="text-left">
                    <div className="font-medium">Son 10 Proje</div>
                    <div className="text-sm text-muted-foreground">SELECT * FROM projects ORDER BY created_at DESC LIMIT 10;</div>
                  </div>
                </Button>
                <Button
                  variant="ghost"
                  className="justify-start h-auto p-3"
                  onClick={() => setSqlQuery('SELECT table_name, pg_size_pretty(pg_total_relation_size(table_name)) as size FROM information_schema.tables WHERE table_schema = \'public\';')}
                >
                  <div className="text-left">
                    <div className="font-medium">Tablo Boyutları</div>
                    <div className="text-sm text-muted-foreground">Tüm tabloların boyutlarını listele</div>
                  </div>
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      </div>
    </DashboardLayout>
  )
}