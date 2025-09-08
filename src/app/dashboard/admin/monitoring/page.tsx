'use client'

import { useState, useEffect, useCallback } from 'react'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  LineChart, Line, AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts'
import {
  Activity, Cpu, HardDrive, Wifi, Users, Database,
  AlertTriangle, CheckCircle, Clock, Zap, Globe,
  Server, Shield, RefreshCw, TrendingUp, TrendingDown,
  Monitor, Gauge, BarChart3, Eye, Settings
} from 'lucide-react'

interface SystemMetrics {
  timestamp: string
  cpu: number
  memory: number
  disk: number
  network: {
    inbound: number
    outbound: number
  }
  activeUsers: number
  apiCalls: number
  responseTime: number
  errorRate: number
  uptime: number
}

interface AlertItem {
  id: string
  type: 'error' | 'warning' | 'info'
  title: string
  message: string
  timestamp: string
  resolved: boolean
}

interface ServiceStatus {
  name: string
  status: 'healthy' | 'degraded' | 'down'
  responseTime: number
  uptime: number
  lastCheck: string
}

export default function MonitoringPage() {
  const [metrics, setMetrics] = useState<SystemMetrics[]>([])
  const [alerts, setAlerts] = useState<AlertItem[]>([])
  const [services, setServices] = useState<ServiceStatus[]>([])
  const [timeRange, setTimeRange] = useState('1h')
  const [isLive, setIsLive] = useState(false)
  const [loading, setLoading] = useState(true)

  const fetchMetrics = useCallback(async () => {
    try {
      // Mock data - replace with actual monitoring API
      const now = new Date()
      const mockMetrics: SystemMetrics[] = []
      
      for (let i = 59; i >= 0; i--) {
        const timestamp = new Date(now.getTime() - i * 60000)
        mockMetrics.push({
          timestamp: timestamp.toISOString(),
          cpu: Math.random() * 80 + 10,
          memory: Math.random() * 70 + 20,
          disk: Math.random() * 50 + 30,
          network: {
            inbound: Math.random() * 1000,
            outbound: Math.random() * 800
          },
          activeUsers: Math.floor(Math.random() * 500) + 100,
          apiCalls: Math.floor(Math.random() * 10000) + 5000,
          responseTime: Math.random() * 500 + 100,
          errorRate: Math.random() * 5,
          uptime: 99.9 - Math.random() * 0.5
        })
      }
      
      setMetrics(mockMetrics)
    } catch (error) {
      console.error('Error fetching metrics:', error)
    }
  }, [])

  const fetchAlerts = async () => {
    try {
      const mockAlerts: AlertItem[] = [
        {
          id: '1',
          type: 'error',
          title: 'Yüksek CPU Kullanımı',
          message: 'CPU kullanımı %85\'i aştı',
          timestamp: new Date(Date.now() - 300000).toISOString(),
          resolved: false
        },
        {
          id: '2',
          type: 'warning',
          title: 'Yavaş API Yanıtı',
          message: 'Ortalama yanıt süresi 2 saniyeyi aştı',
          timestamp: new Date(Date.now() - 600000).toISOString(),
          resolved: false
        },
        {
          id: '3',
          type: 'info',
          title: 'Yedekleme Tamamlandı',
          message: 'Günlük veritabanı yedeği başarıyla tamamlandı',
          timestamp: new Date(Date.now() - 3600000).toISOString(),
          resolved: true
        }
      ]
      
      setAlerts(mockAlerts)
    } catch (error) {
      console.error('Error fetching alerts:', error)
    }
  }

  const fetchServices = async () => {
    try {
      const mockServices: ServiceStatus[] = [
        {
          name: 'Web Server',
          status: 'healthy',
          responseTime: 145,
          uptime: 99.98,
          lastCheck: new Date().toISOString()
        },
        {
          name: 'Database',
          status: 'healthy',
          responseTime: 23,
          uptime: 99.95,
          lastCheck: new Date().toISOString()
        },
        {
          name: 'API Gateway',
          status: 'degraded',
          responseTime: 890,
          uptime: 99.2,
          lastCheck: new Date().toISOString()
        },
        {
          name: 'File Storage',
          status: 'healthy',
          responseTime: 67,
          uptime: 99.99,
          lastCheck: new Date().toISOString()
        },
        {
          name: 'Email Service',
          status: 'healthy',
          responseTime: 234,
          uptime: 99.87,
          lastCheck: new Date().toISOString()
        }
      ]
      
      setServices(mockServices)
    } catch (error) {
      console.error('Error fetching services:', error)
    }
  }

  useEffect(() => {
    const loadData = async () => {
      setLoading(true)
      await Promise.all([fetchMetrics(), fetchAlerts(), fetchServices()])
      setLoading(false)
    }
    
    loadData()
  }, [fetchMetrics])

  useEffect(() => {
    let interval: NodeJS.Timeout
    
    if (isLive) {
      interval = setInterval(() => {
        fetchMetrics()
        fetchAlerts()
        fetchServices()
      }, 30000) // Update every 30 seconds
    }
    
    return () => {
      if (interval) clearInterval(interval)
    }
  }, [isLive, fetchMetrics])

  const getStatusBadge = (status: ServiceStatus['status']) => {
    const variants = {
      healthy: { variant: 'default' as const, label: 'Sağlıklı', color: 'bg-green-600' },
      degraded: { variant: 'secondary' as const, label: 'Yavaş', color: 'bg-yellow-600' },
      down: { variant: 'destructive' as const, label: 'Çalışmıyor', color: 'bg-red-600' }
    }
    const config = variants[status]
    
    return (
      <Badge variant={config.variant} className={config.color}>
        {config.label}
      </Badge>
    )
  }

  const getAlertIcon = (type: AlertItem['type']) => {
    const icons = {
      error: AlertTriangle,
      warning: AlertTriangle,
      info: CheckCircle
    }
    return icons[type]
  }

  const getAlertColor = (type: AlertItem['type']) => {
    const colors = {
      error: 'text-red-600',
      warning: 'text-yellow-600',
      info: 'text-blue-600'
    }
    return colors[type]
  }

  const latestMetrics = metrics[metrics.length - 1]
  const avgResponseTime = metrics.reduce((sum, m) => sum + m.responseTime, 0) / metrics.length || 0
  const totalApiCalls = metrics.reduce((sum, m) => sum + m.apiCalls, 0)
  const avgErrorRate = metrics.reduce((sum, m) => sum + m.errorRate, 0) / metrics.length || 0

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">System Monitoring</h1>
            <p className="text-muted-foreground mt-1">
              Sistem performansını ve sağlığını izleyin
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-[150px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1h">Son 1 Saat</SelectItem>
                <SelectItem value="6h">Son 6 Saat</SelectItem>
                <SelectItem value="24h">Son 24 Saat</SelectItem>
                <SelectItem value="7d">Son 7 Gün</SelectItem>
              </SelectContent>
            </Select>
            <Button
              variant={isLive ? "default" : "outline"}
              onClick={() => setIsLive(!isLive)}
            >
              {isLive ? (
                <>
                  <Activity className="w-4 h-4 mr-2 animate-pulse" />
                  Canlı İzleme
                </>
              ) : (
                <>
                  <Monitor className="w-4 h-4 mr-2" />
                  Canlı İzleme Başlat
                </>
              )}
            </Button>
            <Button variant="outline" onClick={fetchMetrics}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Yenile
            </Button>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <Cpu className="w-5 h-5 text-blue-600" />
                <Badge variant={latestMetrics?.cpu > 80 ? "destructive" : "secondary"}>
                  {latestMetrics?.cpu.toFixed(1)}%
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">CPU Kullanımı</p>
              <Progress value={latestMetrics?.cpu} className="mt-2" />
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <HardDrive className="w-5 h-5 text-green-600" />
                <Badge variant={latestMetrics?.memory > 70 ? "destructive" : "secondary"}>
                  {latestMetrics?.memory.toFixed(1)}%
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">Bellek Kullanımı</p>
              <Progress value={latestMetrics?.memory} className="mt-2" />
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <Clock className="w-5 h-5 text-purple-600" />
                <span className="font-medium">{avgResponseTime.toFixed(0)}ms</span>
              </div>
              <p className="text-sm text-muted-foreground">Ortalama Yanıt Süresi</p>
              <div className="flex items-center mt-2">
                {avgResponseTime > 1000 ? (
                  <TrendingUp className="w-4 h-4 text-red-600 mr-1" />
                ) : (
                  <TrendingDown className="w-4 h-4 text-green-600 mr-1" />
                )}
                <span className="text-sm">
                  {avgResponseTime > 1000 ? 'Yavaş' : 'Normal'}
                </span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <Users className="w-5 h-5 text-orange-600" />
                <span className="font-medium">{latestMetrics?.activeUsers}</span>
              </div>
              <p className="text-sm text-muted-foreground">Aktif Kullanıcılar</p>
              <div className="flex items-center mt-2">
                <Activity className="w-4 h-4 text-green-600 mr-1" />
                <span className="text-sm">Çevrimiçi</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Monitoring Content */}
        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Genel Bakış</TabsTrigger>
            <TabsTrigger value="performance">Performans</TabsTrigger>
            <TabsTrigger value="services">Servisler</TabsTrigger>
            <TabsTrigger value="alerts">Uyarılar</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle>Sistem Kaynak Kullanımı</CardTitle>
                  <CardDescription>CPU, Bellek ve Disk kullanımı</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={metrics.slice(-20)}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis 
                        dataKey="timestamp" 
                        tickFormatter={(value) => new Date(value).toLocaleTimeString('tr-TR', { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                      />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Area type="monotone" dataKey="cpu" stackId="1" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.3} />
                      <Area type="monotone" dataKey="memory" stackId="2" stroke="#10b981" fill="#10b981" fillOpacity={0.3} />
                      <Area type="monotone" dataKey="disk" stackId="3" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.3} />
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>API Performansı</CardTitle>
                  <CardDescription>API çağrıları ve yanıt süreleri</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={metrics.slice(-20)}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis 
                        dataKey="timestamp" 
                        tickFormatter={(value) => new Date(value).toLocaleTimeString('tr-TR', { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                      />
                      <YAxis yAxisId="left" />
                      <YAxis yAxisId="right" orientation="right" />
                      <Tooltip />
                      <Legend />
                      <Line 
                        yAxisId="left" 
                        type="monotone" 
                        dataKey="responseTime" 
                        stroke="#8b5cf6" 
                        name="Yanıt Süresi (ms)"
                      />
                      <Line 
                        yAxisId="right" 
                        type="monotone" 
                        dataKey="errorRate" 
                        stroke="#ef4444" 
                        name="Hata Oranı (%)"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Zap className="w-5 h-5 text-yellow-600" />
                    <span className="font-medium">Toplam API Çağrıları</span>
                  </div>
                  <p className="text-2xl font-bold">{totalApiCalls.toLocaleString()}</p>
                  <p className="text-sm text-muted-foreground">Son 1 saatte</p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Globe className="w-5 h-5 text-blue-600" />
                    <span className="font-medium">Uptime</span>
                  </div>
                  <p className="text-2xl font-bold">
                    {latestMetrics?.uptime.toFixed(2)}%
                  </p>
                  <p className="text-sm text-muted-foreground">Son 30 günde</p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertTriangle className="w-5 h-5 text-red-600" />
                    <span className="font-medium">Hata Oranı</span>
                  </div>
                  <p className="text-2xl font-bold">{avgErrorRate.toFixed(2)}%</p>
                  <p className="text-sm text-muted-foreground">Ortalama</p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="performance" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Network Trafiği</CardTitle>
                <CardDescription>Gelen ve giden network trafiği</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={metrics.slice(-20)}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="timestamp" 
                      tickFormatter={(value) => new Date(value).toLocaleTimeString('tr-TR', { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                    />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="network.inbound" fill="#3b82f6" name="Gelen (KB/s)" />
                    <Bar dataKey="network.outbound" fill="#10b981" name="Giden (KB/s)" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="services" className="space-y-4">
            <div className="grid gap-4">
              {services.map((service) => (
                <Card key={service.name}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Server className="w-6 h-6 text-muted-foreground" />
                        <div>
                          <h4 className="font-medium">{service.name}</h4>
                          <p className="text-sm text-muted-foreground">
                            Son kontrol: {new Date(service.lastCheck).toLocaleTimeString('tr-TR')}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <div className="text-sm text-muted-foreground">Yanıt Süresi</div>
                          <div className="font-medium">{service.responseTime}ms</div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm text-muted-foreground">Uptime</div>
                          <div className="font-medium">{service.uptime}%</div>
                        </div>
                        {getStatusBadge(service.status)}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="alerts" className="space-y-4">
            <div className="space-y-3">
              {alerts.map((alert) => {
                const Icon = getAlertIcon(alert.type)
                return (
                  <Card key={alert.id} className={`${alert.resolved ? 'opacity-60' : ''}`}>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3">
                          <Icon className={`w-5 h-5 mt-0.5 ${getAlertColor(alert.type)}`} />
                          <div>
                            <h4 className="font-medium">{alert.title}</h4>
                            <p className="text-sm text-muted-foreground mt-1">{alert.message}</p>
                            <p className="text-xs text-muted-foreground mt-2">
                              {new Date(alert.timestamp).toLocaleString('tr-TR')}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {alert.resolved ? (
                            <Badge variant="outline" className="text-green-600 border-green-600">
                              Çözüldü
                            </Badge>
                          ) : (
                            <Button size="sm" variant="outline">
                              Çöz
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  )
}