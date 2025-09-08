'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import {
  LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, RadialBarChart, RadialBar, 
  ComposedChart, Bar, ReferenceLine
} from 'recharts'
import {
  Battery, Zap, TrendingUp, TrendingDown, Activity, AlertTriangle,
  CheckCircle, Settings, RefreshCw, Download, Thermometer,
  Power, Clock, Target, Gauge, BarChart3, Wifi, WifiOff,
  Sun, Moon, Home, ArrowUp, ArrowDown, ArrowRight
} from 'lucide-react'

interface BatterySystemTabProps {
  project: any
}

// Real-time battery data
const batteryRealTimeData = {
  stateOfCharge: 63,
  voltage: 51.2,
  current: 8.5,
  power: 435, // watts
  temperature: 24.5,
  health: 98,
  cycles: 245,
  status: 'charging',
  mode: 'auto',
  connectionStatus: 'connected',
  lastUpdate: new Date().toISOString()
}

// Battery performance over time
const batteryPerformanceData = [
  { time: '00:00', soc: 45, voltage: 50.8, current: -2.1, power: -107, temp: 22.1 },
  { time: '02:00', soc: 42, voltage: 50.5, current: -1.8, power: -91, temp: 21.8 },
  { time: '04:00', soc: 40, voltage: 50.2, current: -1.5, power: -75, temp: 21.5 },
  { time: '06:00', soc: 38, voltage: 49.9, current: -1.2, power: -60, temp: 21.2 },
  { time: '08:00', soc: 40, voltage: 50.1, current: 3.2, power: 160, temp: 22.5 },
  { time: '10:00', soc: 45, voltage: 50.8, current: 6.8, power: 345, temp: 24.1 },
  { time: '12:00', soc: 52, voltage: 51.5, current: 8.9, power: 458, temp: 25.8 },
  { time: '14:00', soc: 58, voltage: 52.1, current: 9.2, power: 479, temp: 26.2 },
  { time: '16:00', soc: 63, voltage: 52.8, current: 7.5, power: 396, temp: 25.5 },
  { time: '18:00', soc: 68, voltage: 53.2, current: 4.2, power: 224, temp: 24.8 },
  { time: '20:00', soc: 65, voltage: 52.9, current: -2.8, power: -148, temp: 23.5 },
  { time: '22:00', soc: 62, voltage: 52.6, current: -3.5, power: -184, temp: 22.9 }
]

// Monthly battery statistics
const monthlyBatteryStats = [
  { month: 'Oca', throughput: 1250, cycles: 18, efficiency: 94.2, savings: 420 },
  { month: 'Şub', throughput: 1380, cycles: 20, efficiency: 94.8, savings: 465 },
  { month: 'Mar', throughput: 1520, cycles: 22, efficiency: 95.1, savings: 512 },
  { month: 'Nis', throughput: 1680, cycles: 24, efficiency: 95.3, savings: 568 },
  { month: 'May', throughput: 1850, cycles: 26, efficiency: 95.0, savings: 625 },
  { month: 'Haz', throughput: 1920, cycles: 27, efficiency: 94.7, savings: 648 }
]

// Battery health indicators
const batteryHealthData = [
  { metric: 'Kapasite Sağlığı', current: 98, target: 95, status: 'excellent' },
  { metric: 'Döngü Ömrü', current: 245, target: 6000, status: 'excellent' },
  { metric: 'Sıcaklık Yönetimi', current: 24.5, target: 25, status: 'good' },
  { metric: 'Voltaj Dengesi', current: 99.2, target: 98, status: 'excellent' },
  { metric: 'İç Direnç', current: 12.5, target: 15, status: 'good' }
]

// Battery alerts and events
const batteryAlerts = [
  { type: 'info', message: 'Batarya optimum şarj seviyesinde', time: '30 dakika önce', severity: 'low' },
  { type: 'success', message: 'Günlük şarj-deşarj döngüsü tamamlandı', time: '2 saat önce', severity: 'info' },
  { type: 'warning', message: 'Sıcaklık 26°C üzerine çıktı', time: '4 saat önce', severity: 'medium' }
]

// Energy flow visualization data
const energyFlowData = {
  solar: { production: 8.9, status: 'active' },
  home: { consumption: 6.2, status: 'active' },
  battery: { power: 2.1, status: 'charging', soc: 63 },
  grid: { power: 0.6, status: 'export', direction: 'out' }
}

export function BatterySystemTab({ project }: BatterySystemTabProps) {
  const [selectedPeriod, setSelectedPeriod] = useState('24h')
  const [viewMode, setViewMode] = useState('overview')
  const [isLiveData, setIsLiveData] = useState(true)

  // Simulate real-time data updates
  useEffect(() => {
    const interval = setInterval(() => {
      if (isLiveData) {
        // Update real-time data (simulated)
        batteryRealTimeData.stateOfCharge += (Math.random() - 0.5) * 0.5
        batteryRealTimeData.current += (Math.random() - 0.5) * 0.2
        batteryRealTimeData.power = batteryRealTimeData.voltage * batteryRealTimeData.current
      }
    }, 5000)

    return () => clearInterval(interval)
  }, [isLiveData])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'charging': return 'text-green-600 bg-green-100'
      case 'discharging': return 'text-orange-600 bg-orange-100'
      case 'standby': return 'text-blue-600 bg-blue-100'
      case 'fault': return 'text-red-600 bg-red-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'charging': return <TrendingUp className="w-4 h-4" />
      case 'discharging': return <TrendingDown className="w-4 h-4" />
      case 'standby': return <Clock className="w-4 h-4" />
      case 'fault': return <AlertTriangle className="w-4 h-4" />
      default: return <Activity className="w-4 h-4" />
    }
  }

  return (
    <div className="space-y-6">
      {/* Real-time Battery Status */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="flex items-center p-4">
            <div className={`p-3 rounded-full mr-4 ${getStatusColor(batteryRealTimeData.status)}`}>
              <Battery className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Şarj Durumu</p>
              <p className="text-2xl font-bold">{batteryRealTimeData.stateOfCharge.toFixed(0)}%</p>
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                {getStatusIcon(batteryRealTimeData.status)}
                <span className="capitalize">{batteryRealTimeData.status === 'charging' ? 'Şarj oluyor' : 'Deşarj oluyor'}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center p-4">
            <div className="p-3 rounded-full bg-blue-100 mr-4">
              <Zap className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Anlık Güç</p>
              <p className="text-2xl font-bold">{Math.abs(batteryRealTimeData.power).toFixed(0)}W</p>
              <p className="text-xs text-muted-foreground">
                {batteryRealTimeData.current.toFixed(1)}A @ {batteryRealTimeData.voltage.toFixed(1)}V
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center p-4">
            <div className="p-3 rounded-full bg-green-100 mr-4">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Sistem Sağlığı</p>
              <p className="text-2xl font-bold">{batteryRealTimeData.health}%</p>
              <p className="text-xs text-muted-foreground">
                {batteryRealTimeData.cycles} döngü
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center p-4">
            <div className="p-3 rounded-full bg-yellow-100 mr-4">
              <Thermometer className="h-6 w-6 text-yellow-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Sıcaklık</p>
              <p className="text-2xl font-bold">{batteryRealTimeData.temperature.toFixed(1)}°C</p>
              <p className="text-xs text-muted-foreground">
                {batteryRealTimeData.connectionStatus === 'connected' ? (
                  <span className="flex items-center gap-1 text-green-600">
                    <Wifi className="w-3 h-3" />
                    Bağlı
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-red-600">
                    <WifiOff className="w-3 h-3" />
                    Bağlantı yok
                  </span>
                )}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Energy Flow Diagram */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Enerji Akış Diyagramı
          </CardTitle>
          <CardDescription>
            Anlık enerji akışı ve sistem bileşenleri arası etkileşim
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="relative p-8">
            {/* Solar Panel */}
            <div className="absolute top-4 left-1/2 transform -translate-x-1/2">
              <div className="flex flex-col items-center">
                <div className="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center mb-2">
                  <Sun className="w-8 h-8 text-yellow-600" />
                </div>
                <div className="text-center">
                  <p className="text-sm font-medium">Solar Üretim</p>
                  <p className="text-lg font-bold text-yellow-600">{energyFlowData.solar.production} kW</p>
                </div>
                {/* Arrow to battery */}
                <div className="absolute top-20 left-10 w-px h-16 bg-green-400"></div>
                <ArrowDown className="absolute top-36 left-6 w-4 h-4 text-green-600" />
              </div>
            </div>

            {/* Battery */}
            <div className="absolute top-40 left-1/2 transform -translate-x-1/2">
              <div className="flex flex-col items-center">
                <div className={`w-24 h-24 rounded-full flex items-center justify-center mb-2 ${getStatusColor(energyFlowData.battery.status)}`}>
                  <Battery className="w-10 h-10" />
                </div>
                <div className="text-center">
                  <p className="text-sm font-medium">Batarya Sistemi</p>
                  <p className="text-lg font-bold">{energyFlowData.battery.power} kW</p>
                  <p className="text-xs text-muted-foreground">{energyFlowData.battery.soc}% SoC</p>
                </div>
              </div>
            </div>

            {/* Home Load */}
            <div className="absolute top-40 left-8">
              <div className="flex flex-col items-center">
                <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mb-2">
                  <Home className="w-8 h-8 text-blue-600" />
                </div>
                <div className="text-center">
                  <p className="text-sm font-medium">Ev Tüketimi</p>
                  <p className="text-lg font-bold text-blue-600">{energyFlowData.home.consumption} kW</p>
                </div>
                {/* Arrow from battery */}
                <div className="absolute top-10 right-0 w-16 h-px bg-blue-400"></div>
                <ArrowRight className="absolute top-8 right-16 w-4 h-4 text-blue-600" />
              </div>
            </div>

            {/* Grid Connection */}
            <div className="absolute top-40 right-8">
              <div className="flex flex-col items-center">
                <div className="w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center mb-2">
                  <Power className="w-8 h-8 text-purple-600" />
                </div>
                <div className="text-center">
                  <p className="text-sm font-medium">Şebeke</p>
                  <p className="text-lg font-bold text-purple-600">
                    {energyFlowData.grid.direction === 'out' ? '+' : '-'}{energyFlowData.grid.power} kW
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {energyFlowData.grid.direction === 'out' ? 'Satış' : 'Alış'}
                  </p>
                </div>
                {/* Arrow to/from battery */}
                <div className="absolute top-10 left-0 w-16 h-px bg-purple-400"></div>
                {energyFlowData.grid.direction === 'out' ? (
                  <ArrowLeft className="absolute top-8 left-16 w-4 h-4 text-purple-600" />
                ) : (
                  <ArrowRight className="absolute top-8 left-0 w-4 h-4 text-purple-600" />
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="24h">Son 24 Saat</SelectItem>
              <SelectItem value="7d">Son 7 Gün</SelectItem>
              <SelectItem value="30d">Son 30 Gün</SelectItem>
              <SelectItem value="1y">Son 1 Yıl</SelectItem>
            </SelectContent>
          </Select>

          <Select value={viewMode} onValueChange={setViewMode}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="overview">Genel Bakış</SelectItem>
              <SelectItem value="detailed">Detaylı Analiz</SelectItem>
              <SelectItem value="health">Sağlık Raporu</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant={isLiveData ? "default" : "outline"}
            size="sm"
            onClick={() => setIsLiveData(!isLiveData)}
          >
            <Activity className={`w-4 h-4 mr-2 ${isLiveData ? 'animate-pulse' : ''}`} />
            {isLiveData ? 'Canlı Veri' : 'Statik Veri'}
          </Button>
          <Button variant="outline" size="sm">
            <RefreshCw className="w-4 h-4 mr-2" />
            Yenile
          </Button>
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Rapor İndir
          </Button>
        </div>
      </div>

      {/* Battery Performance Charts */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Batarya Performansı (24 Saat)
            </CardTitle>
            <CardDescription>
              Şarj durumu, voltaj ve akım değişimi
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <ComposedChart data={batteryPerformanceData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="time" />
                <YAxis yAxisId="left" />
                <YAxis yAxisId="right" orientation="right" />
                <Tooltip formatter={(value, name) => {
                  const unit = name === 'soc' ? '%' : 
                              name === 'voltage' ? 'V' : 
                              name === 'current' ? 'A' : 
                              name === 'power' ? 'W' : ''
                  return [`${value}${unit}`, name === 'soc' ? 'Şarj' : 
                                               name === 'voltage' ? 'Voltaj' :
                                               name === 'current' ? 'Akım' :
                                               name === 'power' ? 'Güç' : name]
                }} />
                <Area
                  yAxisId="left"
                  type="monotone"
                  dataKey="soc"
                  fill="#10b981"
                  fillOpacity={0.3}
                  stroke="#10b981"
                />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="voltage"
                  stroke="#3b82f6"
                  strokeWidth={2}
                />
                <Bar
                  yAxisId="right"
                  dataKey="current"
                  fill="#f59e0b"
                  opacity={0.7}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Gauge className="h-5 w-5" />
              Batarya Sağlık Göstergeleri
            </CardTitle>
            <CardDescription>
              Sistem bileşenlerinin sağlık durumu
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {batteryHealthData.map((metric) => (
              <div key={metric.metric} className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">{metric.metric}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm">
                      {metric.metric.includes('Döngü') ? metric.current : 
                       metric.metric.includes('Sıcaklık') ? `${metric.current}°C` :
                       `${metric.current}%`}
                    </span>
                    <Badge variant={
                      metric.status === 'excellent' ? 'default' :
                      metric.status === 'good' ? 'secondary' : 'destructive'
                    } size="sm">
                      {metric.status === 'excellent' ? 'Mükemmel' :
                       metric.status === 'good' ? 'İyi' : 'Dikkat'}
                    </Badge>
                  </div>
                </div>
                {!metric.metric.includes('Döngü') && (
                  <Progress 
                    value={metric.metric.includes('Sıcaklık') ? 
                           ((30 - metric.current) / 30) * 100 :
                           (metric.current / metric.target) * 100} 
                    className="h-2" 
                  />
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Monthly Statistics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Aylık Batarya İstatistikleri
          </CardTitle>
          <CardDescription>
            Enerji işlem hacmi ve verimlilik trendi
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <ComposedChart data={monthlyBatteryStats}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis yAxisId="left" />
              <YAxis yAxisId="right" orientation="right" />
              <Tooltip formatter={(value, name) => {
                const unit = name === 'throughput' ? ' kWh' :
                            name === 'cycles' ? ' döngü' :
                            name === 'efficiency' ? '%' :
                            name === 'savings' ? '₺' : ''
                return [`${value}${unit}`, 
                       name === 'throughput' ? 'Enerji Hacmi' :
                       name === 'cycles' ? 'Döngü Sayısı' :
                       name === 'efficiency' ? 'Verimlilik' :
                       name === 'savings' ? 'Tasarruf' : name]
              }} />
              <Bar yAxisId="left" dataKey="throughput" fill="#3b82f6" name="throughput" />
              <Line yAxisId="right" type="monotone" dataKey="efficiency" stroke="#10b981" strokeWidth={3} name="efficiency" />
              <Line yAxisId="left" type="monotone" dataKey="savings" stroke="#f59e0b" strokeWidth={2} name="savings" />
            </ComposedChart>
          </ResponsiveContainer>

          <div className="grid grid-cols-4 gap-4 mt-6">
            <div className="text-center p-3 bg-blue-50 rounded-lg">
              <p className="text-2xl font-bold text-blue-600">
                {monthlyBatteryStats.reduce((sum, month) => sum + month.throughput, 0).toFixed(0)}
              </p>
              <p className="text-sm text-blue-600 font-medium">Toplam Enerji (kWh)</p>
            </div>
            <div className="text-center p-3 bg-green-50 rounded-lg">
              <p className="text-2xl font-bold text-green-600">
                {(monthlyBatteryStats.reduce((sum, month) => sum + month.efficiency, 0) / monthlyBatteryStats.length).toFixed(1)}%
              </p>
              <p className="text-sm text-green-600 font-medium">Ortalama Verimlilik</p>
            </div>
            <div className="text-center p-3 bg-purple-50 rounded-lg">
              <p className="text-2xl font-bold text-purple-600">
                {monthlyBatteryStats.reduce((sum, month) => sum + month.cycles, 0)}
              </p>
              <p className="text-sm text-purple-600 font-medium">Toplam Döngü</p>
            </div>
            <div className="text-center p-3 bg-yellow-50 rounded-lg">
              <p className="text-2xl font-bold text-yellow-600">
                ₺{monthlyBatteryStats.reduce((sum, month) => sum + month.savings, 0).toFixed(0)}
              </p>
              <p className="text-sm text-yellow-600 font-medium">Toplam Tasarruf</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Alerts and Recommendations */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Sistem Uyarıları
            </CardTitle>
            <CardDescription>
              Batarya durumu ve öneriler
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {batteryAlerts.map((alert, index) => (
              <div key={index} className={`p-3 rounded-lg border-l-4 ${
                alert.type === 'warning' ? 'border-yellow-500 bg-yellow-50' :
                alert.type === 'info' ? 'border-blue-500 bg-blue-50' :
                'border-green-500 bg-green-50'
              }`}>
                <div className="flex items-start gap-3">
                  {alert.type === 'warning' ? (
                    <AlertTriangle className="h-5 w-5 text-yellow-500 mt-0.5" />
                  ) : alert.type === 'info' ? (
                    <Activity className="h-5 w-5 text-blue-500 mt-0.5" />
                  ) : (
                    <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                  )}
                  <div className="flex-1">
                    <p className="text-sm font-medium">{alert.message}</p>
                    <p className="text-xs text-muted-foreground mt-1">{alert.time}</p>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Batarya Ayarları
            </CardTitle>
            <CardDescription>
              Sistem konfigürasyonu ve optimizasyon
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Çalışma Modu</span>
                <Badge variant="outline">{batteryRealTimeData.mode === 'auto' ? 'Otomatik' : 'Manuel'}</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Min. Şarj Seviyesi</span>
                <span className="text-sm">20%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Max. Şarj Seviyesi</span>
                <span className="text-sm">95%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Maksimum Akım</span>
                <span className="text-sm">50A</span>
              </div>
            </div>

            <Separator />

            <div className="space-y-2">
              <Button variant="outline" className="w-full justify-start">
                <Target className="w-4 h-4 mr-2" />
                Şarj Stratejisi Optimizasyonu
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Gauge className="w-4 h-4 mr-2" />
                Kalibrasyonu Başlat
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Settings className="w-4 h-4 mr-2" />
                Gelişmiş Ayarlar
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}