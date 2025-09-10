'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar,
  ComposedChart, ReferenceLine
} from 'recharts'
import {
  Zap, TrendingUp, TrendingDown, Activity, Sun, Moon, Cloud,
  Calculator, Download, RefreshCw, AlertTriangle, CheckCircle,
  Battery, Home, Factory, Gauge, Target, Calendar
} from 'lucide-react'

interface EnergyConsumptionTabProps {
  project: any
}

const realTimeData = [
  { time: '06:00', production: 0, consumption: 2.5, battery: 45, grid: -2.5 },
  { time: '07:00', production: 1.2, consumption: 3.1, battery: 44, grid: -1.9 },
  { time: '08:00', production: 3.5, consumption: 4.2, battery: 43, grid: -0.7 },
  { time: '09:00', production: 6.8, consumption: 5.1, battery: 45, grid: 1.7 },
  { time: '10:00', production: 9.2, consumption: 6.3, battery: 48, grid: 2.9 },
  { time: '11:00', production: 11.5, consumption: 7.1, battery: 52, grid: 4.4 },
  { time: '12:00', production: 12.8, consumption: 8.2, battery: 57, grid: 4.6 },
  { time: '13:00', production: 12.1, consumption: 9.1, battery: 60, grid: 3.0 },
  { time: '14:00', production: 10.8, consumption: 8.5, battery: 62, grid: 2.3 },
  { time: '15:00', production: 8.9, consumption: 7.8, battery: 63, grid: 1.1 },
  { time: '16:00', production: 6.2, consumption: 6.9, battery: 62, grid: -0.7 },
  { time: '17:00', production: 3.1, consumption: 8.1, battery: 58, grid: -5.0 },
  { time: '18:00', production: 0.8, consumption: 9.2, battery: 52, grid: -8.4 }
]

const monthlyData = [
  { month: 'Oca', production: 6500, consumption: 8200, savings: 5525, grid: 1700 },
  { month: 'Şub', production: 7200, consumption: 7800, savings: 6120, grid: 600 },
  { month: 'Mar', production: 8500, consumption: 7500, savings: 7225, grid: -1000 },
  { month: 'Nis', production: 9200, consumption: 7200, savings: 7820, grid: -2000 },
  { month: 'May', production: 10500, consumption: 6800, savings: 8925, grid: -3700 },
  { month: 'Haz', production: 11200, consumption: 6500, savings: 9520, grid: -4700 },
  { month: 'Tem', production: 11800, consumption: 6800, savings: 10030, grid: -5000 },
  { month: 'Ağu', production: 11500, consumption: 7100, savings: 9775, grid: -4400 },
  { month: 'Eyl', production: 9800, consumption: 7300, savings: 8330, grid: -2500 },
  { month: 'Eki', production: 8200, consumption: 7800, savings: 6970, grid: -400 },
  { month: 'Kas', production: 6800, consumption: 8100, savings: 5780, grid: 1300 },
  { month: 'Ara', production: 5800, consumption: 8500, savings: 4930, grid: 2700 }
]

const efficiencyData = [
  { category: 'Panel Verimi', current: 18.2, target: 18.5, status: 'good' },
  { category: 'İnverter Verimi', current: 97.8, target: 98.0, status: 'excellent' },
  { category: 'Sistem Verimi', current: 84.5, target: 85.0, status: 'good' },
  { category: 'Kablo Kaybı', current: 2.1, target: 2.0, status: 'warning' }
]

const consumptionByCategory = [
  { category: 'Ev Aletleri', consumption: 35, color: '#3b82f6' },
  { category: 'Isıtma/Soğutma', consumption: 28, color: '#ef4444' },
  { category: 'Aydınlatma', consumption: 15, color: '#22c55e' },
  { category: 'Elektrikli Araç', consumption: 12, color: '#f59e0b' },
  { category: 'Diğer', consumption: 10, color: '#8b5cf6' }
]

const performanceAlerts = [
  { type: 'warning', message: 'Panel temizliği gerekiyor - Verim %3 düşük', time: '2 saat önce' },
  { type: 'info', message: 'Bugün rekor üretim gerçekleşti: 68.5 kWh', time: '4 saat önce' },
  { type: 'success', message: 'Aylık hedef %105 gerçekleşti', time: '1 gün önce' }
]

export function EnergyConsumptionTab({ project }: EnergyConsumptionTabProps) {
  const [timeRange, setTimeRange] = useState('today')
  const [viewMode, setViewMode] = useState('detailed')

  const currentProduction = 8.9 // kW
  const currentConsumption = 7.8 // kW
  const batteryLevel = 63 // %
  const gridFlow = 1.1 // kW (positive = export, negative = import)

  return (
    <div className="space-y-6">
      {/* Real-time Status */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="flex items-center p-4">
            <div className="p-3 rounded-full bg-yellow-100 mr-4">
              <Sun className="h-6 w-6 text-yellow-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Anlık Üretim</p>
              <p className="text-2xl font-bold text-yellow-600">{currentProduction} kW</p>
              <p className="text-xs text-muted-foreground">Güneşli hava</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center p-4">
            <div className="p-3 rounded-full bg-blue-100 mr-4">
              <Home className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Anlık Tüketim</p>
              <p className="text-2xl font-bold text-blue-600">{currentConsumption} kW</p>
              <p className="text-xs text-muted-foreground">Normal seviye</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center p-4">
            <div className="p-3 rounded-full bg-green-100 mr-4">
              <Battery className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Batarya Durumu</p>
              <p className="text-2xl font-bold text-green-600">{batteryLevel}%</p>
              <p className="text-xs text-muted-foreground">Şarj oluyor</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center p-4">
            <div className={`p-3 rounded-full mr-4 ${gridFlow > 0 ? 'bg-green-100' : 'bg-red-100'}`}>
              <Activity className={`h-6 w-6 ${gridFlow > 0 ? 'text-green-600' : 'text-red-600'}`} />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Şebeke</p>
              <p className={`text-2xl font-bold ${gridFlow > 0 ? 'text-green-600' : 'text-red-600'}`}>
                {gridFlow > 0 ? '+' : ''}{gridFlow} kW
              </p>
              <p className="text-xs text-muted-foreground">
                {gridFlow > 0 ? 'Şebekeye satış' : 'Şebekeden alış'}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Control Panel */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="today">Bugün</SelectItem>
              <SelectItem value="week">Bu Hafta</SelectItem>
              <SelectItem value="month">Bu Ay</SelectItem>
              <SelectItem value="year">Bu Yıl</SelectItem>
            </SelectContent>
          </Select>

          <Select value={viewMode} onValueChange={setViewMode}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="detailed">Detaylı Görünüm</SelectItem>
              <SelectItem value="summary">Özet Görünüm</SelectItem>
              <SelectItem value="comparison">Karşılaştırma</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Yenile
          </Button>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Rapor İndir
          </Button>
        </div>
      </div>

      {/* Main Energy Flow Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Günlük Enerji Akışı
          </CardTitle>
          <CardDescription>
            Üretim, tüketim ve şebeke etkileşimi (Son 24 saat)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={400}>
            <ComposedChart data={realTimeData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="time" />
              <YAxis />
              <Tooltip formatter={(value, name) => {
                const formattedName = 
                  name === 'production' ? 'Üretim' :
                  name === 'consumption' ? 'Tüketim' :
                  name === 'grid' ? 'Şebeke' : name
                return [`${value} kW`, formattedName]
              }} />
              <ReferenceLine y={0} stroke="#666" strokeDasharray="2 2" />
              <Area
                type="monotone"
                dataKey="production"
                fill="#fbbf24"
                stroke="#f59e0b"
                fillOpacity={0.3}
              />
              <Line
                type="monotone"
                dataKey="consumption"
                stroke="#3b82f6"
                strokeWidth={2}
              />
              <Bar
                dataKey="grid"
                fill="#10b981"
              />
            </ComposedChart>
          </ResponsiveContainer>

          <div className="grid grid-cols-3 gap-4 mt-6">
            <div className="text-center p-3 bg-yellow-50 rounded-lg">
              <p className="text-2xl font-bold text-yellow-600">
                {realTimeData.reduce((sum, hour) => sum + hour.production, 0).toFixed(1)}
              </p>
              <p className="text-sm text-yellow-600 font-medium">kWh Günlük Üretim</p>
            </div>
            <div className="text-center p-3 bg-blue-50 rounded-lg">
              <p className="text-2xl font-bold text-blue-600">
                {realTimeData.reduce((sum, hour) => sum + hour.consumption, 0).toFixed(1)}
              </p>
              <p className="text-sm text-blue-600 font-medium">kWh Günlük Tüketim</p>
            </div>
            <div className="text-center p-3 bg-green-50 rounded-lg">
              <p className="text-2xl font-bold text-green-600">
                {(realTimeData.reduce((sum, hour) => sum + hour.production, 0) - 
                  realTimeData.reduce((sum, hour) => sum + hour.consumption, 0)).toFixed(1)}
              </p>
              <p className="text-sm text-green-600 font-medium">kWh Net Üretim</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Monthly Analysis & Consumption Breakdown */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Aylık Performans Analizi
            </CardTitle>
            <CardDescription>
              12 aylık üretim ve tüketim trendi
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value) => [`${value} kWh`]} />
                <Bar dataKey="production" fill="#fbbf24" name="Üretim" />
                <Bar dataKey="consumption" fill="#3b82f6" name="Tüketim" />
              </BarChart>
            </ResponsiveContainer>

            <div className="grid grid-cols-2 gap-4 mt-4">
              <div className="text-center p-3 bg-yellow-50 rounded-lg">
                <p className="text-xl font-bold text-yellow-600">
                  {(monthlyData.reduce((sum, month) => sum + month.production, 0) / 1000).toFixed(1)}k
                </p>
                <p className="text-xs text-yellow-600 font-medium">Yıllık Üretim (kWh)</p>
              </div>
              <div className="text-center p-3 bg-blue-50 rounded-lg">
                <p className="text-xl font-bold text-blue-600">
                  {(monthlyData.reduce((sum, month) => sum + month.consumption, 0) / 1000).toFixed(1)}k
                </p>
                <p className="text-xs text-blue-600 font-medium">Yıllık Tüketim (kWh)</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChart className="h-5 w-5" />
              Tüketim Dağılımı
            </CardTitle>
            <CardDescription>
              Enerji tüketiminin kategorilere göre dağılımı
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={consumptionByCategory}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  dataKey="consumption"
                  label={({ category, consumption }) => `${category}: ${consumption}%`}
                >
                  {consumptionByCategory.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>

            <div className="space-y-3 mt-4">
              {consumptionByCategory.map((item) => (
                <div key={item.category} className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: item.color }}
                    ></div>
                    <span className="text-sm">{item.category}</span>
                  </div>
                  <span className="text-sm font-medium">{item.consumption}%</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* System Efficiency & Alerts */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Gauge className="h-5 w-5" />
              Sistem Verimi
            </CardTitle>
            <CardDescription>
              Sistem bileşenlerinin performans analizi
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {efficiencyData.map((item) => (
              <div key={item.category} className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">{item.category}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm">{item.current}%</span>
                    <Badge variant={
                      item.status === 'excellent' ? 'default' :
                      item.status === 'good' ? 'secondary' : 'destructive'
                    }>
                      {item.status === 'excellent' ? 'Mükemmel' :
                       item.status === 'good' ? 'İyi' : 'Dikkat'}
                    </Badge>
                  </div>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full ${
                      item.status === 'excellent' ? 'bg-green-500' :
                      item.status === 'good' ? 'bg-blue-500' : 'bg-yellow-500'
                    }`}
                    style={{ width: `${(item.current / item.target) * 100}%` }}
                  ></div>
                </div>
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Mevcut: {item.current}%</span>
                  <span>Hedef: {item.target}%</span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Performans Uyarıları
            </CardTitle>
            <CardDescription>
              Sistem durumu ve öneriler
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {performanceAlerts.map((alert, index) => (
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

            <div className="pt-4">
              <Button variant="outline" className="w-full">
                <Target className="w-4 h-4 mr-2" />
                Optimizasyon Önerilerini Gör
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Financial Impact */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            Finansal Etki Analizi
          </CardTitle>
          <CardDescription>
            Enerji üretimi ve tasarrufların mali değeri
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <p className="text-2xl font-bold text-green-600">₺18,450</p>
              <p className="text-sm text-green-600 font-medium">Bu Ay Tasarruf</p>
              <p className="text-xs text-muted-foreground">+%12 geçen aya göre</p>
            </div>
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <p className="text-2xl font-bold text-blue-600">₺5,280</p>
              <p className="text-sm text-blue-600 font-medium">Şebekeye Satış</p>
              <p className="text-xs text-muted-foreground">2,640 kWh @ ₺2.00</p>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <p className="text-2xl font-bold text-purple-600">₺195,600</p>
              <p className="text-sm text-purple-600 font-medium">Yıllık Tasarruf</p>
              <p className="text-xs text-muted-foreground">Projeksiyon</p>
            </div>
            <div className="text-center p-4 bg-yellow-50 rounded-lg">
              <p className="text-2xl font-bold text-yellow-600">4.2 Yıl</p>
              <p className="text-sm text-yellow-600 font-medium">Geri Ödeme</p>
              <p className="text-xs text-muted-foreground">Kalan süre</p>
            </div>
          </div>

          <div className="mt-6">
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value) => [`₺${value}`, 'Tasarruf']} />
                <Line 
                  type="monotone" 
                  dataKey="savings" 
                  stroke="#10b981" 
                  strokeWidth={3}
                  dot={{ fill: '#10b981', strokeWidth: 2, r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}