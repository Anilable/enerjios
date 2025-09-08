'use client'

import { useState, useEffect } from 'react'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Zap, 
  TrendingUp, 
  TrendingDown,
  Sun, 
  Battery,
  Home,
  BarChart3,
  Calendar,
  Download,
  Leaf,
  DollarSign,
  Clock,
  Target,
  AlertCircle,
  CheckCircle
} from 'lucide-react'

interface EnergyData {
  timestamp: string
  production: number
  consumption: number
  gridFeed: number
  gridDraw: number
  selfConsumption: number
}

interface SystemStats {
  totalCapacity: number
  currentProduction: number
  todayProduction: number
  monthProduction: number
  yearProduction: number
  todayConsumption: number
  monthConsumption: number
  selfConsumptionRate: number
  gridFeedRate: number
  todaySavings: number
  monthSavings: number
  yearSavings: number
  co2Saved: number
  systemEfficiency: number
}

const mockEnergyData: EnergyData[] = [
  { timestamp: '06:00', production: 0.2, consumption: 0.8, gridFeed: 0, gridDraw: 0.6, selfConsumption: 0.2 },
  { timestamp: '08:00', production: 2.1, consumption: 1.2, gridFeed: 0.9, gridDraw: 0, selfConsumption: 1.2 },
  { timestamp: '10:00', production: 4.8, consumption: 1.5, gridFeed: 3.3, gridDraw: 0, selfConsumption: 1.5 },
  { timestamp: '12:00', production: 6.2, consumption: 2.1, gridFeed: 4.1, gridDraw: 0, selfConsumption: 2.1 },
  { timestamp: '14:00', production: 5.9, consumption: 1.8, gridFeed: 4.1, gridDraw: 0, selfConsumption: 1.8 },
  { timestamp: '16:00', production: 4.3, consumption: 2.4, gridFeed: 1.9, gridDraw: 0, selfConsumption: 2.4 },
  { timestamp: '18:00', production: 1.8, consumption: 3.2, gridFeed: 0, gridDraw: 1.4, selfConsumption: 1.8 },
  { timestamp: '20:00', production: 0.1, consumption: 2.8, gridFeed: 0, gridDraw: 2.7, selfConsumption: 0.1 }
]

const mockSystemStats: SystemStats = {
  totalCapacity: 10.5,
  currentProduction: 4.2,
  todayProduction: 42.8,
  monthProduction: 1284,
  yearProduction: 14520,
  todayConsumption: 38.4,
  monthConsumption: 1152,
  selfConsumptionRate: 68,
  gridFeedRate: 32,
  todaySavings: 107,
  monthSavings: 3210,
  yearSavings: 36300,
  co2Saved: 7.2,
  systemEfficiency: 94
}

export default function EnergyPage() {
  const [selectedTab, setSelectedTab] = useState('overview')
  const [currentTime, setCurrentTime] = useState(new Date())
  const [stats] = useState<SystemStats>(mockSystemStats)
  const [energyData] = useState<EnergyData[]>(mockEnergyData)

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  const getSystemStatus = () => {
    const hour = currentTime.getHours()
    const isProducing = hour >= 6 && hour <= 18
    const efficiency = stats.systemEfficiency

    if (!isProducing) return { status: 'Gece Modu', color: 'bg-blue-100 text-blue-800', icon: <Clock className="w-4 h-4" /> }
    if (efficiency >= 90) return { status: 'Mükemmel', color: 'bg-green-100 text-green-800', icon: <CheckCircle className="w-4 h-4" /> }
    if (efficiency >= 80) return { status: 'İyi', color: 'bg-yellow-100 text-yellow-800', icon: <Target className="w-4 h-4" /> }
    return { status: 'Dikkat', color: 'bg-red-100 text-red-800', icon: <AlertCircle className="w-4 h-4" /> }
  }

  const systemStatus = getSystemStatus()

  return (
    <DashboardLayout title="Enerji Üretimi">
      {/* Current Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-blue-600">{stats.currentProduction} kW</p>
                <p className="text-sm text-gray-600">Anlık Üretim</p>
              </div>
              <div className="p-2 bg-blue-100 rounded-lg">
                <Zap className="w-6 h-6 text-blue-600" />
              </div>
            </div>
            <div className="mt-4 flex items-center">
              <Progress value={(stats.currentProduction / stats.totalCapacity) * 100} className="flex-1" />
              <span className="ml-2 text-xs text-gray-500">
                {((stats.currentProduction / stats.totalCapacity) * 100).toFixed(0)}%
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-green-600">{stats.todayProduction} kWh</p>
                <p className="text-sm text-gray-600">Bugün Üretilen</p>
              </div>
              <div className="p-2 bg-green-100 rounded-lg">
                <Sun className="w-6 h-6 text-green-600" />
              </div>
            </div>
            <div className="mt-4">
              <Badge className={systemStatus.color}>
                {systemStatus.icon}
                <span className="ml-1">{systemStatus.status}</span>
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-purple-600">₺{stats.todaySavings}</p>
                <p className="text-sm text-gray-600">Bugün Tasarruf</p>
              </div>
              <div className="p-2 bg-purple-100 rounded-lg">
                <DollarSign className="w-6 h-6 text-purple-600" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
              <span className="text-green-600">+12% bu hafta</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-orange-600">{stats.selfConsumptionRate}%</p>
                <p className="text-sm text-gray-600">Öz Tüketim Oranı</p>
              </div>
              <div className="p-2 bg-orange-100 rounded-lg">
                <Home className="w-6 h-6 text-orange-600" />
              </div>
            </div>
            <div className="mt-4">
              <Progress value={stats.selfConsumptionRate} className="flex-1" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Enerji Analizi</CardTitle>
              <CardDescription>
                Günlük enerji üretim ve tüketim grafiği
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-6">
                <TabsList className="grid grid-cols-4 w-full">
                  <TabsTrigger value="overview">Genel</TabsTrigger>
                  <TabsTrigger value="daily">Günlük</TabsTrigger>
                  <TabsTrigger value="monthly">Aylık</TabsTrigger>
                  <TabsTrigger value="yearly">Yıllık</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-6">
                  {/* Daily Chart Simulation */}
                  <div className="bg-gradient-to-r from-blue-50 to-green-50 p-6 rounded-lg">
                    <h3 className="text-lg font-semibold mb-4">Bugünün Enerji Akışı</h3>
                    <div className="grid grid-cols-4 gap-4">
                      {energyData.slice(-4).map((data, index) => (
                        <div key={index} className="text-center">
                          <p className="text-xs text-gray-600 mb-2">{data.timestamp}</p>
                          <div className="space-y-2">
                            <div className="bg-yellow-200 rounded p-2">
                              <Sun className="w-4 h-4 text-yellow-600 mx-auto mb-1" />
                              <p className="text-xs font-medium">{data.production} kW</p>
                              <p className="text-xs text-gray-600">Üretim</p>
                            </div>
                            <div className="bg-blue-200 rounded p-2">
                              <Home className="w-4 h-4 text-blue-600 mx-auto mb-1" />
                              <p className="text-xs font-medium">{data.consumption} kW</p>
                              <p className="text-xs text-gray-600">Tüketim</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Energy Flow Visualization */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Card className="bg-gradient-to-br from-green-50 to-green-100">
                      <CardContent className="p-6 text-center">
                        <div className="w-16 h-16 bg-green-200 rounded-full flex items-center justify-center mx-auto mb-4">
                          <TrendingUp className="w-8 h-8 text-green-600" />
                        </div>
                        <h3 className="text-lg font-semibold text-green-800">Şebekeye Verilen</h3>
                        <p className="text-3xl font-bold text-green-600 my-2">
                          {(stats.todayProduction * (stats.gridFeedRate / 100)).toFixed(1)} kWh
                        </p>
                        <p className="text-sm text-green-700">Bugün şebekeye beslenen enerji</p>
                      </CardContent>
                    </Card>

                    <Card className="bg-gradient-to-br from-blue-50 to-blue-100">
                      <CardContent className="p-6 text-center">
                        <div className="w-16 h-16 bg-blue-200 rounded-full flex items-center justify-center mx-auto mb-4">
                          <Home className="w-8 h-8 text-blue-600" />
                        </div>
                        <h3 className="text-lg font-semibold text-blue-800">Öz Tüketim</h3>
                        <p className="text-3xl font-bold text-blue-600 my-2">
                          {(stats.todayProduction * (stats.selfConsumptionRate / 100)).toFixed(1)} kWh
                        </p>
                        <p className="text-sm text-blue-700">Üretilen enerjiden kullanılan</p>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>

                <TabsContent value="daily" className="space-y-4">
                  <div className="bg-gray-50 p-6 rounded-lg">
                    <h3 className="text-lg font-semibold mb-4">Saatlik Üretim Grafiği</h3>
                    <div className="grid grid-cols-8 gap-2">
                      {energyData.map((data, index) => (
                        <div key={index} className="text-center">
                          <div className="bg-yellow-400 rounded-t" style={{ height: `${(data.production / 6.2) * 60}px`, minHeight: '4px' }}></div>
                          <p className="text-xs mt-2 text-gray-600">{data.timestamp}</p>
                          <p className="text-xs font-medium">{data.production} kW</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="monthly" className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card>
                      <CardContent className="p-6 text-center">
                        <Zap className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                        <p className="text-2xl font-bold text-blue-600">{stats.monthProduction}</p>
                        <p className="text-sm text-gray-600">kWh Bu Ay</p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-6 text-center">
                        <DollarSign className="w-8 h-8 text-green-600 mx-auto mb-2" />
                        <p className="text-2xl font-bold text-green-600">₺{stats.monthSavings}</p>
                        <p className="text-sm text-gray-600">Aylık Tasarruf</p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-6 text-center">
                        <Home className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                        <p className="text-2xl font-bold text-purple-600">{stats.monthConsumption}</p>
                        <p className="text-sm text-gray-600">kWh Tüketim</p>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>

                <TabsContent value="yearly" className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Yıllık Performans</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600">Toplam Üretim</span>
                          <span className="font-bold text-blue-600">{stats.yearProduction.toLocaleString('tr-TR')} kWh</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600">Toplam Tasarruf</span>
                          <span className="font-bold text-green-600">₺{stats.yearSavings.toLocaleString('tr-TR')}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600">Sistem Verimi</span>
                          <span className="font-bold text-purple-600">{stats.systemEfficiency}%</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600">CO₂ Tasarrufu</span>
                          <span className="font-bold text-orange-600">{stats.co2Saved} ton</span>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Çevresel Etki</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="text-center">
                          <Leaf className="w-12 h-12 text-green-600 mx-auto mb-2" />
                          <p className="text-2xl font-bold text-green-600">{stats.co2Saved} ton</p>
                          <p className="text-sm text-gray-600">CO₂ Emisyon Tasarrufu</p>
                        </div>
                        <div className="space-y-2 text-sm text-gray-600">
                          <p>• {(stats.co2Saved * 2.5).toFixed(1)} ağaç dikim etkisi</p>
                          <p>• {(stats.co2Saved * 45).toFixed(0)} km araç emisyonu tasarrufu</p>
                          <p>• {(stats.yearProduction * 0.45).toFixed(0)} kg kömür yakılması engellendi</p>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Sistem Bilgileri</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Kurulu Güç</span>
                  <span className="font-medium">{stats.totalCapacity} kW</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Sistem Verimi</span>
                  <Badge className="bg-green-100 text-green-800">{stats.systemEfficiency}%</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Son Güncelleme</span>
                  <span className="text-sm">{currentTime.toLocaleTimeString('tr-TR')}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Bu Ay Özet</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  ₺{stats.monthSavings.toLocaleString('tr-TR')}
                </div>
                <p className="text-sm text-gray-600">Aylık Tasarruf</p>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Üretim</span>
                  <span className="font-medium">{stats.monthProduction.toLocaleString('tr-TR')} kWh</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Tüketim</span>
                  <span className="font-medium">{stats.monthConsumption.toLocaleString('tr-TR')} kWh</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Şebekeye Satış</span>
                  <span className="font-medium text-green-600">
                    {((stats.monthProduction * stats.gridFeedRate) / 100).toFixed(0)} kWh
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Hızlı İşlemler</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button className="w-full" variant="outline">
                <BarChart3 className="w-4 h-4 mr-2" />
                Detaylı Rapor
              </Button>
              <Button className="w-full" variant="outline">
                <Download className="w-4 h-4 mr-2" />
                Verileri İndir
              </Button>
              <Button className="w-full" variant="outline" asChild>
                <a href="/projects">
                  <Calendar className="w-4 h-4 mr-2" />
                  Proje Detayı
                </a>
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Sistem Durumu</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Panel Durumu</span>
                  <Badge className="bg-green-100 text-green-800">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Normal
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">İnverter</span>
                  <Badge className="bg-green-100 text-green-800">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Aktif
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Şebeke Bağlantısı</span>
                  <Badge className="bg-green-100 text-green-800">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Bağlı
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  )
}