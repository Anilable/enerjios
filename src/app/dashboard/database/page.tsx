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

// Mock data - in real app, this would come from APIs
const mockDatabaseStatus = {
  postgresql: {
    status: 'connected',
    uptime: '15 gün 8 saat',
    connections: 24,
    maxConnections: 100,
    responseTime: '12ms',
    version: '15.2'
  },
  redis: {
    status: 'connected',
    uptime: '15 gün 8 saat',
    memory: '124MB',
    maxMemory: '2GB',
    responseTime: '2ms',
    version: '7.0.8'
  }
}

const mockDatabaseStats = {
  totalSize: '2.4GB',
  tablesCount: 24,
  recordsCount: '1.2M',
  indexesCount: 85,
  todayQueries: 15420,
  averageResponseTime: '8ms',
  slowQueries: 12,
  backupStatus: 'completed',
  lastBackup: '2025-01-06 03:00:00'
}

const mockTables = [
  { name: 'users', records: 15420, size: '245MB', lastUpdated: '2025-01-06 14:30' },
  { name: 'projects', records: 8965, size: '189MB', lastUpdated: '2025-01-06 14:25' },
  { name: 'solar_panels', records: 25680, size: '421MB', lastUpdated: '2025-01-06 14:20' },
  { name: 'energy_data', records: 450000, size: '850MB', lastUpdated: '2025-01-06 14:35' },
  { name: 'quotes', records: 5240, size: '89MB', lastUpdated: '2025-01-06 14:15' }
]

const mockSlowQueries = [
  {
    query: 'SELECT * FROM energy_data WHERE created_at > ...',
    duration: '2.5s',
    executions: 15,
    avgDuration: '2.1s',
    table: 'energy_data'
  },
  {
    query: 'SELECT COUNT(*) FROM users JOIN projects ...',
    duration: '1.8s',
    executions: 8,
    avgDuration: '1.6s',
    table: 'users'
  },
  {
    query: 'UPDATE solar_panels SET status = ? WHERE ...',
    duration: '1.2s',
    executions: 23,
    avgDuration: '1.0s',
    table: 'solar_panels'
  }
]

const mockBackupHistory = [
  {
    id: 1,
    date: '2025-01-06 03:00:00',
    size: '2.4GB',
    duration: '12 dk',
    status: 'success',
    type: 'automatic'
  },
  {
    id: 2,
    date: '2025-01-05 03:00:00',
    size: '2.3GB',
    duration: '11 dk',
    status: 'success',
    type: 'automatic'
  },
  {
    id: 3,
    date: '2025-01-04 15:30:00',
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
  
  const [realTimeStats, setRealTimeStats] = useState({
    activeConnections: 24,
    queriesPerSecond: 45,
    cpuUsage: 35,
    memoryUsage: 62
  })

  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      setRealTimeStats(prev => ({
        activeConnections: prev.activeConnections + Math.floor(Math.random() * 6) - 3,
        queriesPerSecond: Math.max(0, prev.queriesPerSecond + Math.floor(Math.random() * 20) - 10),
        cpuUsage: Math.max(0, Math.min(100, prev.cpuUsage + Math.floor(Math.random() * 10) - 5)),
        memoryUsage: Math.max(0, Math.min(100, prev.memoryUsage + Math.floor(Math.random() * 6) - 3))
      }))
    }, 3000)

    return () => clearInterval(interval)
  }, [])

  const handleRefresh = async () => {
    setRefreshing(true)
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))
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

  const filteredTables = mockTables.filter(table =>
    table.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

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

  return (
    <div className="space-y-6 p-6">
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
              <div className={`w-2 h-2 rounded-full ${getStatusColor(mockDatabaseStatus.postgresql.status)}`} />
              {getStatusBadge(mockDatabaseStatus.postgresql.status)}
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{realTimeStats.activeConnections}/100</div>
            <p className="text-xs text-muted-foreground">
              Aktif bağlantılar • {mockDatabaseStatus.postgresql.responseTime} yanıt
            </p>
            <div className="mt-2">
              <div className="text-xs text-muted-foreground mb-1">Bağlantı kullanımı</div>
              <Progress value={(realTimeStats.activeConnections / 100) * 100} className="h-2" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Redis Cache</CardTitle>
            <div className="flex items-center space-x-2">
              <div className={`w-2 h-2 rounded-full ${getStatusColor(mockDatabaseStatus.redis.status)}`} />
              {getStatusBadge(mockDatabaseStatus.redis.status)}
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">124MB/2GB</div>
            <p className="text-xs text-muted-foreground">
              Bellek kullanımı • {mockDatabaseStatus.redis.responseTime} yanıt
            </p>
            <div className="mt-2">
              <div className="text-xs text-muted-foreground mb-1">Bellek kullanımı</div>
              <Progress value={(124 / 2048) * 100} className="h-2" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sorgu Performansı</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{realTimeStats.queriesPerSecond}/s</div>
            <p className="text-xs text-muted-foreground">
              Ortalama: 8ms • Yavaş: {mockDatabaseStats.slowQueries}
            </p>
            <div className="mt-2">
              <div className="text-xs text-muted-foreground mb-1">CPU kullanımı</div>
              <Progress value={realTimeStats.cpuUsage} className="h-2" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Depolama</CardTitle>
            <HardDrive className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockDatabaseStats.totalSize}</div>
            <p className="text-xs text-muted-foreground">
              {mockDatabaseStats.tablesCount} tablo • {mockDatabaseStats.recordsCount} kayıt
            </p>
            <div className="mt-2">
              <div className="text-xs text-muted-foreground mb-1">Bellek kullanımı</div>
              <Progress value={realTimeStats.memoryUsage} className="h-2" />
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
                    <div className="text-2xl font-bold">{mockDatabaseStats.totalSize}</div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Tablo Sayısı</div>
                    <div className="text-2xl font-bold">{mockDatabaseStats.tablesCount}</div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Toplam Kayıt</div>
                    <div className="text-2xl font-bold">{mockDatabaseStats.recordsCount}</div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">İndeks Sayısı</div>
                    <div className="text-2xl font-bold">{mockDatabaseStats.indexesCount}</div>
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
                    <div className="text-sm text-muted-foreground">Bugünkü Sorgular</div>
                    <div className="text-2xl font-bold">{mockDatabaseStats.todayQueries.toLocaleString()}</div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Ortalama Yanıt</div>
                    <div className="text-2xl font-bold">{mockDatabaseStats.averageResponseTime}</div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Yavaş Sorgular</div>
                    <div className="text-2xl font-bold text-orange-600">{mockDatabaseStats.slowQueries}</div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Çalışma Süresi</div>
                    <div className="text-2xl font-bold">{mockDatabaseStatus.postgresql.uptime}</div>
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
                    <div className="text-sm text-muted-foreground">Normal çalışıyor</div>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <CheckCircle className="w-8 h-8 text-green-500" />
                  <div>
                    <div className="font-medium">Yedekleme Durumu</div>
                    <div className="text-sm text-muted-foreground">Son yedekleme: {mockDatabaseStats.lastBackup}</div>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <AlertTriangle className="w-8 h-8 text-orange-500" />
                  <div>
                    <div className="font-medium">Performans Uyarısı</div>
                    <div className="text-sm text-muted-foreground">{mockDatabaseStats.slowQueries} yavaş sorgu tespit edildi</div>
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
                      <TableCell className="font-medium">{table.name}</TableCell>
                      <TableCell>{table.records.toLocaleString()}</TableCell>
                      <TableCell>{table.size}</TableCell>
                      <TableCell>{table.lastUpdated}</TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Button variant="ghost" size="sm">
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
                  {mockSlowQueries.map((query, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-mono text-sm max-w-md truncate">
                        {query.query}
                      </TableCell>
                      <TableCell>
                        <Badge variant="destructive">{query.duration}</Badge>
                      </TableCell>
                      <TableCell>{query.executions}</TableCell>
                      <TableCell>{query.avgDuration}</TableCell>
                      <TableCell>{query.table}</TableCell>
                    </TableRow>
                  ))}
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
                <div className="flex items-center space-x-3">
                  <AlertTriangle className="w-5 h-5 text-orange-500" />
                  <div>
                    <div className="font-medium">energy_data tablosuna indeks ekleyin</div>
                    <div className="text-sm text-muted-foreground">created_at sütunu için</div>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <AlertTriangle className="w-5 h-5 text-orange-500" />
                  <div>
                    <div className="font-medium">users tablosu için vakumlama</div>
                    <div className="text-sm text-muted-foreground">Performans artışı sağlayabilir</div>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <div>
                    <div className="font-medium">Bağlantı havuzu optimum</div>
                    <div className="text-sm text-muted-foreground">Herhangi bir işlem gerekmiyor</div>
                  </div>
                </div>
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
                    <span>94%</span>
                  </div>
                  <Progress value={94} className="h-2" />
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>İndeks Kullanımı</span>
                    <span>87%</span>
                  </div>
                  <Progress value={87} className="h-2" />
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>Bağlantı Kullanımı</span>
                    <span>{((realTimeStats.activeConnections / 100) * 100).toFixed(0)}%</span>
                  </div>
                  <Progress value={(realTimeStats.activeConnections / 100) * 100} className="h-2" />
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
                    {mockDatabaseStats.lastBackup}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Boyut: {mockDatabaseStats.totalSize}
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
  )
}