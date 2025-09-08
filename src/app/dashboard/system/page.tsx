import { requireAuth } from '@/lib/auth-utils'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { 
  Server, 
  Database, 
  Activity, 
  HardDrive,
  Cpu,
  MemoryStick,
  Network,
  Shield,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  Settings
} from 'lucide-react'

const systemMetrics = {
  cpu: { usage: 45, status: 'normal' },
  memory: { usage: 68, status: 'normal' },
  disk: { usage: 23, status: 'normal' },
  network: { usage: 12, status: 'normal' }
}

const services = [
  { name: 'Web Server', status: 'running', uptime: '15 gün', port: '443' },
  { name: 'Database', status: 'running', uptime: '15 gün', port: '5432' },
  { name: 'API Gateway', status: 'running', uptime: '14 gün', port: '3000' },
  { name: 'Email Service', status: 'running', uptime: '15 gün', port: '587' },
  { name: 'Background Jobs', status: 'warning', uptime: '2 saat', port: '-' },
  { name: 'Backup Service', status: 'running', uptime: '15 gün', port: '-' }
]

const recentLogs = [
  { time: '14:35:22', level: 'INFO', message: 'Backup completed successfully', service: 'Backup' },
  { time: '14:30:15', level: 'WARN', message: 'High memory usage detected', service: 'System' },
  { time: '14:25:33', level: 'INFO', message: 'User login: admin@trakyasolar.com', service: 'Auth' },
  { time: '14:20:44', level: 'INFO', message: 'New project created: PRJ-2024-001', service: 'API' },
  { time: '14:15:12', level: 'ERROR', message: 'Email delivery failed: Invalid recipient', service: 'Email' }
]

export default async function SystemPage() {
  const user = await requireAuth()

  return (
    <DashboardLayout title="Sistem Yönetimi">
      <div className="space-y-6">
        {/* System Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Cpu className="w-5 h-5 text-blue-600" />
                  <div>
                    <p className="text-sm text-muted-foreground">CPU Kullanımı</p>
                    <p className="text-2xl font-bold">{systemMetrics.cpu.usage}%</p>
                  </div>
                </div>
              </div>
              <Progress value={systemMetrics.cpu.usage} className="mt-2" />
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <MemoryStick className="w-5 h-5 text-green-600" />
                  <div>
                    <p className="text-sm text-muted-foreground">RAM Kullanımı</p>
                    <p className="text-2xl font-bold">{systemMetrics.memory.usage}%</p>
                  </div>
                </div>
              </div>
              <Progress value={systemMetrics.memory.usage} className="mt-2" />
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <HardDrive className="w-5 h-5 text-orange-600" />
                  <div>
                    <p className="text-sm text-muted-foreground">Disk Kullanımı</p>
                    <p className="text-2xl font-bold">{systemMetrics.disk.usage}%</p>
                  </div>
                </div>
              </div>
              <Progress value={systemMetrics.disk.usage} className="mt-2" />
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Network className="w-5 h-5 text-purple-600" />
                  <div>
                    <p className="text-sm text-muted-foreground">Ağ Kullanımı</p>
                    <p className="text-2xl font-bold">{systemMetrics.network.usage}%</p>
                  </div>
                </div>
              </div>
              <Progress value={systemMetrics.network.usage} className="mt-2" />
            </CardContent>
          </Card>
        </div>

        {/* Services Status */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Server className="w-5 h-5" />
                  Servis Durumu
                </CardTitle>
                <CardDescription>
                  Sistem servislerinin anlık durumu
                </CardDescription>
              </div>
              <Button variant="outline" size="sm">
                <RefreshCw className="w-4 h-4 mr-2" />
                Yenile
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {services.map((service, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    {service.status === 'running' ? (
                      <CheckCircle className="w-5 h-5 text-green-600" />
                    ) : (
                      <AlertTriangle className="w-5 h-5 text-orange-600" />
                    )}
                    <div>
                      <p className="font-medium">{service.name}</p>
                      <p className="text-sm text-muted-foreground">
                        Port: {service.port} | Uptime: {service.uptime}
                      </p>
                    </div>
                  </div>
                  <Badge 
                    variant={service.status === 'running' ? 'default' : 'secondary'}
                    className={service.status === 'running' ? 'bg-green-100 text-green-800' : 'bg-orange-100 text-orange-800'}
                  >
                    {service.status === 'running' ? 'Çalışıyor' : 'Uyarı'}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* System Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="w-5 h-5" />
                Sistem Bilgileri
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span className="text-muted-foreground">İşletim Sistemi:</span>
                <span>Ubuntu 22.04 LTS</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Kernel:</span>
                <span>5.15.0-78-generic</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Uptime:</span>
                <span>15 gün 14 saat</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Load Average:</span>
                <span>0.45, 0.52, 0.48</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Processes:</span>
                <span>247 çalışıyor</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Son Güncelleme:</span>
                <span>2024-01-10 15:30</span>
              </div>
            </CardContent>
          </Card>

          {/* Recent Logs */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="w-5 h-5" />
                Son Sistem Logları
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {recentLogs.map((log, index) => (
                  <div key={index} className="flex items-start gap-3 p-2 rounded-lg hover:bg-gray-50">
                    <span className="text-xs text-muted-foreground min-w-fit">
                      {log.time}
                    </span>
                    <Badge 
                      variant="secondary" 
                      size="sm"
                      className={
                        log.level === 'ERROR' ? 'bg-red-100 text-red-800' :
                        log.level === 'WARN' ? 'bg-orange-100 text-orange-800' :
                        'bg-blue-100 text-blue-800'
                      }
                    >
                      {log.level}
                    </Badge>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm">{log.message}</p>
                      <p className="text-xs text-muted-foreground">{log.service}</p>
                    </div>
                  </div>
                ))}
              </div>
              <Button variant="outline" className="w-full mt-3">
                Tüm Logları Görüntüle
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Security & Maintenance */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5" />
                Güvenlik Durumu
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span>Firewall</span>
                <Badge className="bg-green-100 text-green-800">Aktif</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span>SSL Sertifikası</span>
                <Badge className="bg-green-100 text-green-800">Geçerli</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span>Güvenlik Güncellemeleri</span>
                <Badge className="bg-green-100 text-green-800">Güncel</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span>Backup Durumu</span>
                <Badge className="bg-green-100 text-green-800">Başarılı</Badge>
              </div>
              <Button className="w-full">
                Güvenlik Taraması Başlat
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5" />
                Bakım İşlemleri
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button variant="outline" className="w-full justify-start">
                <Database className="w-4 h-4 mr-2" />
                Veritabanı Optimizasyonu
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <HardDrive className="w-4 h-4 mr-2" />
                Disk Temizliği
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <RefreshCw className="w-4 h-4 mr-2" />
                Cache Temizliği
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Activity className="w-4 h-4 mr-2" />
                Log Rotasyonu
              </Button>
              <Button className="w-full">
                Otomatik Bakım Zamanla
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  )
}