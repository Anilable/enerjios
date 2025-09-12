'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import { 
  Home,
  Leaf,
  Sun,
  Droplets,
  Calendar,
  TrendingUp,
  Users,
  Phone,
  MapPin,
  AlertTriangle,
  CheckCircle,
  Clock,
  DollarSign,
  Zap,
  Thermometer,
  CloudRain,
  Activity,
  Wind,
  Settings
} from 'lucide-react'
import type { AgrovoltaicProject, CropData, RegionalData } from '@/app/dashboard/agri-solar/page'

interface FarmingDashboardProps {
  project: AgrovoltaicProject
  cropDatabase: CropData[]
  regionalData: RegionalData[]
}

interface WeatherData {
  temperature: number
  humidity: number
  windSpeed: number
  precipitation: number
  solarRadiation: number
  forecast: Array<{
    day: string
    temp: number
    condition: string
    rain: number
  }>
}

interface TaskItem {
  id: string
  title: string
  category: 'PLANTING' | 'IRRIGATION' | 'HARVEST' | 'MAINTENANCE' | 'ENERGY'
  priority: 'LOW' | 'MEDIUM' | 'HIGH'
  dueDate: Date
  completed: boolean
  description: string
}

export function FarmingDashboard({ project, cropDatabase, regionalData }: FarmingDashboardProps) {
  const [activeTab, setActiveTab] = useState('overview')
  const [weatherData] = useState<WeatherData>({
    temperature: 22,
    humidity: 65,
    windSpeed: 12,
    precipitation: 2,
    solarRadiation: 850,
    forecast: [
      { day: 'Pazartesi', temp: 24, condition: 'Güneşli', rain: 0 },
      { day: 'Salı', temp: 26, condition: 'Parçalı Bulutlu', rain: 10 },
      { day: 'Çarşamba', temp: 23, condition: 'Yağmurlu', rain: 80 },
      { day: 'Perşembe', temp: 21, condition: 'Bulutlu', rain: 40 },
      { day: 'Cuma', temp: 25, condition: 'Güneşli', rain: 0 }
    ]
  })

  const [tasks] = useState<TaskItem[]>([
    {
      id: '1',
      title: 'Buğday Hasadı Başlangıcı',
      category: 'HARVEST',
      priority: 'HIGH',
      dueDate: new Date('2024-07-15'),
      completed: false,
      description: 'Ana parsel buğday hasadı için combine rezervasyonu'
    },
    {
      id: '2',
      title: 'Solar Panel Temizliği',
      category: 'MAINTENANCE',
      priority: 'MEDIUM',
      dueDate: new Date('2024-07-20'),
      completed: false,
      description: 'Aylık panel temizliği ve verim kontrolü'
    },
    {
      id: '3',
      title: 'Damla Sulama Kontrolü',
      category: 'IRRIGATION',
      priority: 'HIGH',
      dueDate: new Date('2024-07-10'),
      completed: true,
      description: 'Sistem basıncı ve filtre temizliği'
    },
    {
      id: '4',
      title: 'İkinci Ürün Ekimi',
      category: 'PLANTING',
      priority: 'MEDIUM',
      dueDate: new Date('2024-08-01'),
      completed: false,
      description: 'Buğday hasadı sonrası mısır ekimi'
    }
  ])

  const getCurrentCrop = () => {
    return cropDatabase.find(c => c.id === project.primaryCrop)
  }

  const getCurrentRegion = () => {
    return regionalData.find(r => r.region.includes(project.location)) || regionalData[0]
  }

  const calculateFarmMetrics = () => {
    const currentCrop = getCurrentCrop()
    const region = getCurrentRegion()
    
    if (!currentCrop || !region) return null

    // Energy production estimation (simplified)
    const solarCapacity = project.availableArea * 0.5 * 450 / 1000 // kW
    const annualProduction = solarCapacity * region.avgSunHours * 365 * 0.8

    // Agriculture projection
    const expectedYield = currentCrop.yieldPerHectare * project.availableArea * 0.85 // 15% reduction for agrovoltaics
    const cropRevenue = expectedYield * currentCrop.marketPrice * 1000

    // Energy revenue
    const energyRevenue = annualProduction * 1.2 // TRY/kWh

    return {
      solarCapacity,
      annualProduction,
      expectedYield,
      cropRevenue,
      energyRevenue,
      totalRevenue: cropRevenue + energyRevenue,
      waterSavings: project.availableArea * 2000 * 0.25 // 25% water savings
    }
  }

  const getTasksByCategory = (category: string) => {
    return tasks.filter(task => task.category === category)
  }

  const getUpcomingTasks = () => {
    const now = new Date()
    const upcoming = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000) // 7 days
    
    return tasks
      .filter(task => !task.completed && task.dueDate <= upcoming)
      .sort((a, b) => a.dueDate.getTime() - b.dueDate.getTime())
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'HIGH': return 'text-red-600 bg-red-50'
      case 'MEDIUM': return 'text-yellow-600 bg-yellow-50'
      case 'LOW': return 'text-green-600 bg-green-50'
      default: return 'text-gray-600 bg-gray-50'
    }
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'PLANTING': return Leaf
      case 'IRRIGATION': return Droplets
      case 'HARVEST': return Home
      case 'MAINTENANCE': return Settings
      case 'ENERGY': return Zap
      default: return Activity
    }
  }

  const metrics = calculateFarmMetrics()
  const currentCrop = getCurrentCrop()
  const currentRegion = getCurrentRegion()
  const upcomingTasks = getUpcomingTasks()

  return (
    <div className="space-y-6">
      {/* Farm Overview Cards */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Toplam Alan</p>
                <p className="text-2xl font-bold">{project.totalArea} ha</p>
              </div>
              <Home className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Solar Kapasites</p>
                <p className="text-2xl font-bold">{metrics?.solarCapacity.toFixed(1)} kW</p>
              </div>
              <Sun className="w-8 h-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Tahmini Verim</p>
                <p className="text-2xl font-bold">{metrics?.expectedYield.toFixed(1)} ton</p>
              </div>
              <Leaf className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Toplam Gelir</p>
                <p className="text-2xl font-bold">₺{metrics ? (metrics.totalRevenue / 1000).toFixed(0) : '0'}K</p>
              </div>
              <DollarSign className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Genel Bakış</TabsTrigger>
          <TabsTrigger value="weather">Hava Durumu</TabsTrigger>
          <TabsTrigger value="tasks">Görevler</TabsTrigger>
          <TabsTrigger value="analytics">Analizler</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            {/* Farm Status */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Home className="w-5 h-5 mr-2" />
                  Çiftlik Durumu
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>Sezon İlerlemesi</span>
                    <span>65%</span>
                  </div>
                  <Progress value={65} className="h-2" />
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Ana Ürün:</span>
                    <div className="font-semibold">{currentCrop?.name}</div>
                  </div>
                  <div>
                    <span className="text-gray-600">Bölge:</span>
                    <div className="font-semibold">{currentRegion?.region.split(' ')[0]}</div>
                  </div>
                  <div>
                    <span className="text-gray-600">Sulama:</span>
                    <div className="font-semibold">
                      {project.irrigationType === 'DRIP' ? 'Damla' :
                       project.irrigationType === 'SPRINKLER' ? 'Yağmurlama' :
                       project.irrigationType === 'FLOOD' ? 'Salma' : 'Yok'}
                    </div>
                  </div>
                  <div>
                    <span className="text-gray-600">Toprak:</span>
                    <div className="font-semibold">{project.soilType}</div>
                  </div>
                </div>

                <div className="pt-4 border-t">
                  <h4 className="font-medium mb-2">Yaklaşan Etkinlikler</h4>
                  <div className="space-y-2">
                    {upcomingTasks.slice(0, 3).map((task) => {
                      const Icon = getCategoryIcon(task.category)
                      return (
                        <div key={task.id} className="flex items-center space-x-3 text-sm">
                          <Icon className="w-4 h-4 text-gray-500" />
                          <span className="flex-1">{task.title}</span>
                          <Badge className={getPriorityColor(task.priority)}>
                            {task.priority === 'HIGH' ? 'Acil' : task.priority === 'MEDIUM' ? 'Normal' : 'Düşük'}
                          </Badge>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Energy Performance */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Zap className="w-5 h-5 mr-2" />
                  Enerji Performansı
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-3 bg-yellow-50 rounded-lg">
                    <div className="text-lg font-bold text-yellow-700">
                      {metrics ? (metrics.annualProduction / 1000).toFixed(1) : '0'} MWh
                    </div>
                    <div className="text-xs text-yellow-600">Yıllık Üretim</div>
                  </div>
                  <div className="text-center p-3 bg-green-50 rounded-lg">
                    <div className="text-lg font-bold text-green-700">
                      ₺{metrics ? (metrics.energyRevenue / 1000).toFixed(0) : '0'}K
                    </div>
                    <div className="text-xs text-green-600">Enerji Geliri</div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>Bugünkü Üretim</span>
                    <span>85%</span>
                  </div>
                  <Progress value={85} className="h-2" />
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Günlük Ortalama:</span>
                    <span className="font-medium">
                      {metrics ? (metrics.annualProduction / 365).toFixed(0) : '0'} kWh
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Bu Ay Toplam:</span>
                    <span className="font-medium">
                      {metrics ? (metrics.annualProduction / 12 / 1000).toFixed(1) : '0'} MWh
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Sistem Verimi:</span>
                    <span className="font-medium text-green-600">82%</span>
                  </div>
                </div>

                <div className="pt-4 border-t">
                  <Button variant="outline" size="sm" className="w-full">
                    <Activity className="w-4 h-4 mr-2" />
                    Detaylı İstatistikler
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Weather Tab */}
        <TabsContent value="weather" className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            {/* Current Weather */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <CloudRain className="w-5 h-5 mr-2" />
                  Mevcut Hava Durumu
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center mb-6">
                  <div className="text-4xl font-bold">{weatherData.temperature}°C</div>
                  <div className="text-gray-600">Güneşli</div>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
                    <span className="flex items-center">
                      <Droplets className="w-4 h-4 mr-2 text-blue-500" />
                      Nem
                    </span>
                    <span className="font-medium">%{weatherData.humidity}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
                    <span className="flex items-center">
                      <Wind className="w-4 h-4 mr-2 text-gray-500" />
                      Rüzgar
                    </span>
                    <span className="font-medium">{weatherData.windSpeed} km/h</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
                    <span className="flex items-center">
                      <Sun className="w-4 h-4 mr-2 text-yellow-500" />
                      Radyasyon
                    </span>
                    <span className="font-medium">{weatherData.solarRadiation} W/m²</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
                    <span className="flex items-center">
                      <CloudRain className="w-4 h-4 mr-2 text-blue-500" />
                      Yağış
                    </span>
                    <span className="font-medium">{weatherData.precipitation} mm</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 5-Day Forecast */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Calendar className="w-5 h-5 mr-2" />
                  5 Günlük Tahmin
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {weatherData.forecast.map((day, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex-1">
                        <div className="font-medium">{day.day}</div>
                        <div className="text-sm text-gray-600">{day.condition}</div>
                      </div>
                      <div className="text-center">
                        <div className="font-bold">{day.temp}°C</div>
                        <div className="text-xs text-blue-600">{day.rain}% yağış</div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-4 p-3 bg-yellow-50 rounded-lg">
                  <div className="flex items-center text-yellow-800">
                    <AlertTriangle className="w-4 h-4 mr-2" />
                    <span className="text-sm font-medium">Tarım Önerisi</span>
                  </div>
                  <p className="text-sm text-yellow-700 mt-1">
                    Çarşamba yağış bekleniyor. Sulama programını ayarlayın.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Tasks Tab */}
        <TabsContent value="tasks" className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            {/* Upcoming Tasks */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Clock className="w-5 h-5 mr-2" />
                  Yaklaşan Görevler
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {upcomingTasks.map((task) => {
                    const Icon = getCategoryIcon(task.category)
                    const isOverdue = new Date() > task.dueDate
                    
                    return (
                      <div key={task.id} className={`p-3 border rounded-lg ${isOverdue ? 'border-red-200 bg-red-50' : ''}`}>
                        <div className="flex items-start justify-between">
                          <div className="flex items-start space-x-3">
                            <Icon className={`w-5 h-5 mt-0.5 ${isOverdue ? 'text-red-500' : 'text-gray-500'}`} />
                            <div className="flex-1">
                              <h4 className="font-medium">{task.title}</h4>
                              <p className="text-sm text-gray-600 mt-1">{task.description}</p>
                              <div className="flex items-center space-x-2 mt-2">
                                <Badge className={getPriorityColor(task.priority)}>
                                  {task.priority === 'HIGH' ? 'Acil' : task.priority === 'MEDIUM' ? 'Normal' : 'Düşük'}
                                </Badge>
                                <span className="text-xs text-gray-500">
                                  {task.dueDate.toLocaleDateString('tr-TR')}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Task Categories */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Activity className="w-5 h-5 mr-2" />
                  Görev Kategorileri
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {['PLANTING', 'IRRIGATION', 'HARVEST', 'MAINTENANCE', 'ENERGY'].map((category) => {
                    const categoryTasks = getTasksByCategory(category)
                    const completedTasks = categoryTasks.filter(t => t.completed).length
                    const progress = categoryTasks.length > 0 ? (completedTasks / categoryTasks.length) * 100 : 0
                    const Icon = getCategoryIcon(category)
                    
                    return (
                      <div key={category} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <Icon className="w-4 h-4 text-gray-500" />
                            <span className="font-medium">
                              {category === 'PLANTING' ? 'Ekim' :
                               category === 'IRRIGATION' ? 'Sulama' :
                               category === 'HARVEST' ? 'Hasat' :
                               category === 'MAINTENANCE' ? 'Bakım' : 'Enerji'}
                            </span>
                          </div>
                          <span className="text-sm text-gray-600">
                            {completedTasks}/{categoryTasks.length}
                          </span>
                        </div>
                        <Progress value={progress} className="h-2" />
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            {/* Revenue Analysis */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <TrendingUp className="w-5 h-5 mr-2" />
                  Gelir Analizi
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-3 bg-green-50 rounded-lg">
                    <div className="text-lg font-bold text-green-700">
                      ₺{metrics ? (metrics.cropRevenue / 1000).toFixed(0) : '0'}K
                    </div>
                    <div className="text-xs text-green-600">Tarım Geliri</div>
                  </div>
                  <div className="text-center p-3 bg-yellow-50 rounded-lg">
                    <div className="text-lg font-bold text-yellow-700">
                      ₺{metrics ? (metrics.energyRevenue / 1000).toFixed(0) : '0'}K
                    </div>
                    <div className="text-xs text-yellow-600">Enerji Geliri</div>
                  </div>
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Tarım Payı:</span>
                    <span className="font-medium">
                      %{metrics ? ((metrics.cropRevenue / metrics.totalRevenue) * 100).toFixed(0) : '0'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Enerji Payı:</span>
                    <span className="font-medium">
                      %{metrics ? ((metrics.energyRevenue / metrics.totalRevenue) * 100).toFixed(0) : '0'}
                    </span>
                  </div>
                  <div className="flex justify-between pt-2 border-t">
                    <span className="font-medium">Toplam Gelir:</span>
                    <span className="font-bold text-blue-600">
                      ₺{metrics ? (metrics.totalRevenue / 1000).toFixed(0) : '0'}K/yıl
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Sustainability Metrics */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Leaf className="w-5 h-5 mr-2" />
                  Sürdürülebilirlik
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-3 bg-blue-50 rounded-lg">
                    <div className="text-lg font-bold text-blue-700">
                      {metrics ? (metrics.waterSavings / 1000).toFixed(1) : '0'}
                    </div>
                    <div className="text-xs text-blue-600">Ton Su Tasarrufu</div>
                  </div>
                  <div className="text-center p-3 bg-green-50 rounded-lg">
                    <div className="text-lg font-bold text-green-700">
                      {metrics ? (metrics.annualProduction * 0.5 / 1000).toFixed(1) : '0'}
                    </div>
                    <div className="text-xs text-green-600">Ton CO₂ Tasarrufu</div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Arazi Verimliliği</span>
                      <span>92%</span>
                    </div>
                    <Progress value={92} className="h-2" />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Enerji Verimliliği</span>
                      <span>88%</span>
                    </div>
                    <Progress value={88} className="h-2" />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Su Kullanım Verimliliği</span>
                      <span>95%</span>
                    </div>
                    <Progress value={95} className="h-2" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}