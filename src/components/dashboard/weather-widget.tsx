'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { useDashboardWeather, useWeatherAlerts } from '@/hooks/use-weather'
import { formatTemperature, getWeatherIcon, formatWindSpeed, getWindDirection, getUVIndexDescription, getSolarEfficiencyRating } from '@/lib/api-client'
import {
  Sun, Cloud, CloudRain, CloudSnow, Eye, Wind, Droplets,
  Thermometer, Gauge, TrendingUp, AlertTriangle, RefreshCw,
  MapPin, Clock, Zap
} from 'lucide-react'

export function WeatherWidget() {
  const {
    data: weather,
    loading,
    error,
    refetch,
    locationError,
    isUsingFallback,
    requestLocationPermission
  } = useDashboardWeather()
  const alerts = useWeatherAlerts(weather)
  const [showDetails, setShowDetails] = useState(false)

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sun className="w-5 h-5" />
            Hava Durumu
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Skeleton className="w-16 h-16 rounded-full" />
            <div className="text-right">
              <Skeleton className="w-20 h-8 mb-2" />
              <Skeleton className="w-24 h-4" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Skeleton className="h-16 rounded-lg" />
            <Skeleton className="h-16 rounded-lg" />
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error || !weather) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sun className="w-5 h-5" />
            Hava Durumu
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4">
            <AlertTriangle className="w-8 h-8 mx-auto text-yellow-500 mb-2" />
            <p className="text-sm text-muted-foreground mb-4">
              {error || 'Hava durumu bilgisi alınamadı'}
            </p>
            <Button variant="outline" size="sm" onClick={refetch} disabled={loading}>
              <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              {loading ? 'Deneniyor...' : 'Tekrar Dene'}
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  const { current, location, solarMetrics } = weather
  const solarRating = getSolarEfficiencyRating(current.irradiance)

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Sun className="w-5 h-5" />
            Hava Durumu
          </CardTitle>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => setShowDetails(!showDetails)}
          >
            {showDetails ? 'Gizle' : 'Detay'}
          </Button>
        </div>
        <div className="flex items-center gap-1 text-sm text-muted-foreground">
          <MapPin className="w-3 h-3" />
          {location.name}
          {isUsingFallback && (
            <Badge variant="outline" className="ml-2 text-xs">
              Varsayılan Konum
            </Badge>
          )}
          <Clock className="w-3 h-3 ml-2" />
          {new Date(current.lastUpdated).toLocaleTimeString('tr-TR', {
            hour: '2-digit',
            minute: '2-digit'
          })}
        </div>

        {locationError && (
          <div className="text-xs text-amber-600 flex items-center gap-1 mt-1">
            <AlertTriangle className="w-3 h-3" />
            {locationError}
          </div>
        )}

        {/* Debug info in development */}
        {process.env.NODE_ENV === 'development' && weather?.location && (
          <div className="text-xs text-gray-500 mt-1">
            Debug: {weather.location.coordinates[1]?.toFixed(4)}, {weather.location.coordinates[0]?.toFixed(4)}
          </div>
        )}
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Current Weather */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img
              src={getWeatherIcon(current.weather.icon)}
              alt={current.weather.description}
              className="w-16 h-16"
            />
            <div>
              <div className="text-2xl font-bold">
                {formatTemperature(current.temperature)}
              </div>
              <div className="text-sm text-muted-foreground capitalize">
                {current.weather.description}
              </div>
            </div>
          </div>
          
          <div className="text-right">
            <div className="text-sm text-muted-foreground">Hissedilen</div>
            <div className="font-medium">{formatTemperature(current.feelsLike)}</div>
          </div>
        </div>

        {/* Solar Efficiency */}
        <div className="p-3 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg border border-yellow-200">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-yellow-600" />
              <span className="text-sm font-medium">Solar Verimlilik</span>
            </div>
            <Badge variant={
              solarRating.rating === 'Mükemmel' ? 'default' :
              solarRating.rating === 'İyi' ? 'secondary' :
              solarRating.rating === 'Orta' ? 'outline' : 'destructive'
            }>
              {solarRating.rating}
            </Badge>
          </div>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">Işınım:</span>
              <span className="font-medium ml-1">{current.irradiance} W/m²</span>
            </div>
            <div>
              <span className="text-muted-foreground">Verim:</span>
              <span className="font-medium ml-1">%{solarRating.efficiency}</span>
            </div>
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            {solarRating.description}
          </p>
        </div>

        {/* Weather Alerts */}
        {alerts.length > 0 && (
          <div className="space-y-2">
            {alerts.slice(0, 2).map((alert, index) => (
              <div key={index} className={`p-2 rounded-lg text-sm ${
                alert.type === 'warning' ? 'bg-yellow-50 border-yellow-200 border' :
                alert.type === 'severe' ? 'bg-red-50 border-red-200 border' :
                'bg-blue-50 border-blue-200 border'
              }`}>
                <div className="flex items-center gap-2">
                  <AlertTriangle className={`w-3 h-3 ${
                    alert.type === 'warning' ? 'text-yellow-600' :
                    alert.type === 'severe' ? 'text-red-600' :
                    'text-blue-600'
                  }`} />
                  <span className="font-medium">{alert.message}</span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {alert.impact}
                </p>
              </div>
            ))}
          </div>
        )}

        {/* Quick Stats */}
        <div className="grid grid-cols-2 gap-3">
          <div className="p-3 bg-muted/50 rounded-lg">
            <div className="flex items-center gap-2 mb-1">
              <Droplets className="w-4 h-4 text-blue-500" />
              <span className="text-sm">Nem</span>
            </div>
            <div className="font-bold">%{current.humidity}</div>
          </div>
          
          <div className="p-3 bg-muted/50 rounded-lg">
            <div className="flex items-center gap-2 mb-1">
              <Wind className="w-4 h-4 text-gray-500" />
              <span className="text-sm">Rüzgar</span>
            </div>
            <div className="font-bold">
              {formatWindSpeed(current.windSpeed)}
              <span className="text-xs text-muted-foreground ml-1">
                {getWindDirection(current.windDirection)}
              </span>
            </div>
          </div>
        </div>

        {/* Detailed Information (Collapsible) */}
        {showDetails && (
          <div className="space-y-3 pt-3 border-t">
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Basınç:</span>
                <span className="font-medium">{current.pressure} hPa</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Görüş:</span>
                <span className="font-medium">{current.visibility} km</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">UV İndeksi:</span>
                <span className="font-medium">
                  {current.uvIndex} ({getUVIndexDescription(current.uvIndex)})
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Bulutluluk:</span>
                <span className="font-medium">%{current.cloudCover}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <span className="text-muted-foreground">Gün Doğumu:</span>
                <div className="font-medium">
                  {new Date(current.sunrise).toLocaleTimeString('tr-TR', { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  })}
                </div>
              </div>
              <div>
                <span className="text-muted-foreground">Gün Batımı:</span>
                <div className="font-medium">
                  {new Date(current.sunset).toLocaleTimeString('tr-TR', { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  })}
                </div>
              </div>
            </div>

            {/* Today's Energy Forecast */}
            <div className="p-3 bg-blue-50 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="w-4 h-4 text-blue-600" />
                <span className="text-sm font-medium text-blue-900">Bugünkü Enerji Tahmini</span>
              </div>
              <div className="text-lg font-bold text-blue-900">
                {solarMetrics.estimatedDailyOutput} kWh
              </div>
              <p className="text-xs text-blue-700">
                {solarMetrics.peakSunHours} saat etkili güneşlenme
              </p>
            </div>

            {/* 7-day Forecast Preview */}
            <div className="space-y-2">
              <h4 className="text-sm font-medium">7 Günlük Tahmin</h4>
              <div className="grid gap-2">
                {weather.forecast.slice(0, 3).map((day, index) => (
                  <div key={index} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <img
                        src={getWeatherIcon(day.weather.icon)}
                        alt={day.weather.description}
                        className="w-6 h-6"
                      />
                      <span>
                        {index === 0 ? 'Bugün' : 
                         index === 1 ? 'Yarın' : 
                         new Date(day.date).toLocaleDateString('tr-TR', { weekday: 'short' })}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-muted-foreground">
                        {day.temperature.min}°/{day.temperature.max}°
                      </span>
                      <span className="font-medium text-xs">
                        {day.estimatedOutput} kWh
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex justify-center gap-2 pt-2">
          <Button variant="outline" size="sm" onClick={refetch} disabled={loading}>
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            {loading ? 'Güncelleniyor...' : 'Güncelle'}
          </Button>
          {isUsingFallback && (
            <Button
              variant="outline"
              size="sm"
              onClick={requestLocationPermission}
              title="Konum erişimini yeniden dene"
            >
              <MapPin className="w-4 h-4 mr-2" />
              Konumu Al
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}