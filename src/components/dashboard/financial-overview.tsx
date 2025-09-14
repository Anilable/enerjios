'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { useFinancialRates, useSolarIndustryRates } from '@/hooks/use-exchange-rates'
import { 
  TrendingUp, TrendingDown, DollarSign, Euro, 
  RefreshCw, AlertTriangle, Info, Zap, 
  Calculator, PieChart, BarChart3
} from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

export function FinancialOverview() {
  const {
    majorRates,
    loading,
    error,
    refetch,
    getRateChange,
    formatCurrency,
    bulletinDate,
    lastUpdated
  } = useFinancialRates()

  const {
    solarRates,
    calculateEquipmentCost,
    getImportCosts,
    loading: solarLoading
  } = useSolarIndustryRates()

  // Data validation - check if rates are reasonable
  const isValidRate = (rate: number | null | undefined): boolean => {
    if (!rate || rate === null) return false
    return rate > 0 && rate < 1000 // Basic sanity check
  }

  // Fallback rates if data is invalid or unavailable
  const fallbackRates = {
    USD: { selling: 30.5, buying: 30.2 },
    EUR: { selling: 33.2, buying: 32.9 }
  }

  const safeUSDRate = isValidRate(majorRates.USD?.selling)
    ? majorRates.USD?.selling!
    : fallbackRates.USD.selling

  const safeEURRate = isValidRate(majorRates.EUR?.selling)
    ? majorRates.EUR?.selling!
    : fallbackRates.EUR.selling

  // Sample equipment costs for demonstration
  const sampleEquipmentCosts = {
    panels: 25000, // USD
    inverters: 8000, // EUR
    accessories: 3500 // USD
  }

  const importCosts = getImportCosts(sampleEquipmentCosts)

  // Sample portfolio data for chart
  const portfolioData = [
    { name: 'Oca', tryValue: 2450000, usdValue: 82000, eurValue: 75000 },
    { name: 'Şub', tryValue: 2680000, usdValue: 89000, eurValue: 82000 },
    { name: 'Mar', tryValue: 2890000, usdValue: 94000, eurValue: 87000 },
    { name: 'Nis', tryValue: 3120000, usdValue: 101000, eurValue: 93000 },
    { name: 'May', tryValue: 3350000, usdValue: 108000, eurValue: 99000 },
    { name: 'Haz', tryValue: 3580000, usdValue: 115000, eurValue: 105000 },
  ]

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-4 w-4" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-20 mb-2" />
                <Skeleton className="h-4 w-24" />
              </CardContent>
            </Card>
          ))}
        </div>
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-48" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-64 w-full" />
          </CardContent>
        </Card>
      </div>
    )
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="w-5 h-5" />
            Finansal Genel Bakış
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <AlertTriangle className="w-8 h-8 mx-auto text-yellow-500 mb-2" />
            <p className="text-sm text-muted-foreground mb-4">
              {error}
            </p>
            <Button variant="outline" size="sm" onClick={refetch}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Tekrar Dene
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  const usdChange = getRateChange('USD')
  const eurChange = getRateChange('EUR')

  return (
    <div className="space-y-6">
      {/* Currency Rate Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">USD</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ₺{safeUSDRate.toFixed(2)}
              {!isValidRate(majorRates.USD?.selling) && (
                <span className="text-xs text-orange-600 ml-1">*</span>
              )}
            </div>
            {usdChange && (
              <div className={`flex items-center text-xs ${
                usdChange.direction === 'up' ? 'text-red-600' :
                usdChange.direction === 'down' ? 'text-green-600' : 'text-gray-600'
              }`}>
                {usdChange.direction === 'up' ? (
                  <TrendingUp className="w-3 h-3 mr-1" />
                ) : usdChange.direction === 'down' ? (
                  <TrendingDown className="w-3 h-3 mr-1" />
                ) : null}
                {usdChange.changePercent.toFixed(2)}%
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">EUR</CardTitle>
            <Euro className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ₺{safeEURRate.toFixed(2)}
              {!isValidRate(majorRates.EUR?.selling) && (
                <span className="text-xs text-orange-600 ml-1">*</span>
              )}
            </div>
            {eurChange && (
              <div className={`flex items-center text-xs ${
                eurChange.direction === 'up' ? 'text-red-600' :
                eurChange.direction === 'down' ? 'text-green-600' : 'text-gray-600'
              }`}>
                {eurChange.direction === 'up' ? (
                  <TrendingUp className="w-3 h-3 mr-1" />
                ) : eurChange.direction === 'down' ? (
                  <TrendingDown className="w-3 h-3 mr-1" />
                ) : null}
                {eurChange.changePercent.toFixed(2)}%
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">İthalat Maliyeti</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(importCosts.total)}
            </div>
            <p className="text-xs text-muted-foreground">
              Örnek ekipman seti
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Portföy Değeri</CardTitle>
            <PieChart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(portfolioData[portfolioData.length - 1].tryValue)}
            </div>
            <div className="flex items-center text-xs text-green-600">
              <TrendingUp className="w-3 h-3 mr-1" />
              +12.5% (6 ay)
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Solar Industry Rates */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="w-5 h-5" />
            Solar Endüstri Döviz Kurları
          </CardTitle>
          <CardDescription>
            Solar ekipman ithalatı için güncel kurlar
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            {Object.entries(solarRates).map(([currency, rate]) => (
              <div key={currency} className="p-4 border rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium">{currency}/TRY</span>
                  <Badge variant={
                    currency === 'USD' ? 'default' : 
                    currency === 'EUR' ? 'secondary' : 'outline'
                  }>
                    {currency === 'USD' ? 'Amerika' : 
                     currency === 'EUR' ? 'Avrupa' : 'Çin'}
                  </Badge>
                </div>
                
                <div className="text-xl font-bold mb-1">
                  {rate ? `₺${(rate.selling || rate.forexSelling || 0).toFixed(2)}` : 'N/A'}
                </div>
                
                <div className="text-xs text-muted-foreground">
                  {currency === 'USD' ? 'Paneller, Aksesuarlar' :
                   currency === 'EUR' ? 'İnverterler, Bataryalar' :
                   'Üretim Ekipmanları'}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-center gap-2 mb-3">
              <Calculator className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-medium text-blue-900">Örnek Ekipman Maliyeti</span>
            </div>
            
            <div className="grid gap-3 text-sm">
              <div className="flex justify-between">
                <span className="text-blue-800">Paneller (25,000 USD):</span>
                <span className="font-medium text-blue-900">{formatCurrency(importCosts.panels)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-blue-800">İnverterler (8,000 EUR):</span>
                <span className="font-medium text-blue-900">{formatCurrency(importCosts.inverters)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-blue-800">Aksesuarlar (3,500 USD):</span>
                <span className="font-medium text-blue-900">{formatCurrency(importCosts.accessories)}</span>
              </div>
              <hr className="border-blue-300" />
              <div className="flex justify-between font-bold">
                <span className="text-blue-900">Toplam Maliyet:</span>
                <span className="text-blue-900">{formatCurrency(importCosts.total)}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Portfolio Performance Chart */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                Portföy Performansı
              </CardTitle>
              <CardDescription>
                Son 6 ayın proje portföy değeri (TRY)
              </CardDescription>
            </div>
            <Button variant="outline" size="sm" onClick={refetch} disabled={loading}>
              <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Güncelle
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={portfolioData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis 
                tickFormatter={(value) => `₺${(value / 1000000).toFixed(1)}M`}
              />
              <Tooltip 
                formatter={(value: number) => [formatCurrency(value), 'Portföy Değeri']}
                labelFormatter={(label) => `Ay: ${label}`}
              />
              <Line 
                type="monotone" 
                dataKey="tryValue" 
                stroke="#3b82f6" 
                strokeWidth={2}
                dot={{ fill: '#3b82f6' }}
              />
            </LineChart>
          </ResponsiveContainer>
          
          <div className="grid grid-cols-3 gap-4 mt-6">
            <div className="text-center p-3 bg-green-50 rounded-lg">
              <div className="text-lg font-bold text-green-600">+12.5%</div>
              <div className="text-xs text-green-700">6 Aylık Büyüme</div>
            </div>
            <div className="text-center p-3 bg-blue-50 rounded-lg">
              <div className="text-lg font-bold text-blue-600">₺{(portfolioData[portfolioData.length - 1].tryValue / 1000000).toFixed(1)}M</div>
              <div className="text-xs text-blue-700">Mevcut Değer</div>
            </div>
            <div className="text-center p-3 bg-orange-50 rounded-lg">
              <div className="text-lg font-bold text-orange-600">₺{(portfolioData.reduce((sum, month) => sum + month.tryValue, 0) / portfolioData.length / 1000000).toFixed(1)}M</div>
              <div className="text-xs text-orange-700">Ortalama Değer</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Data Source Information */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-start gap-2 text-sm text-muted-foreground">
            <Info className="w-4 h-4 mt-0.5" />
            <div className="space-y-1">
              <p>
                Döviz kurları Türkiye Cumhuriyet Merkez Bankası'ndan alınmaktadır.
                {(!isValidRate(majorRates.USD?.selling) || !isValidRate(majorRates.EUR?.selling)) && (
                  <span className="text-orange-600"> *Bazı kurlar fallback veriler kullanıyor.</span>
                )}
              </p>
              <div className="flex gap-4 flex-wrap">
                <span>Bülten Tarihi: {bulletinDate || 'Bilinmiyor'}</span>
                <span>Son Güncelleme: {lastUpdated ? new Date(lastUpdated).toLocaleString('tr-TR') : 'Bilinmiyor'}</span>
                {error && (
                  <span className="text-red-600">Hata: {error}</span>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}