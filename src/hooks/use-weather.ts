'use client'

import { useState, useEffect, useCallback } from 'react'
import apiClient, { WeatherData, APIError } from '@/lib/api-client'

interface UseWeatherOptions {
  autoFetch?: boolean
  refreshInterval?: number // milliseconds
  fallbackData?: WeatherData | null
}

interface UseWeatherReturn {
  data: WeatherData | null
  loading: boolean
  error: string | null
  refetch: () => Promise<void>
  getWeatherForLocation: (lat: number, lng: number, projectId?: string) => Promise<void>
}

export function useWeather(
  lat?: number,
  lng?: number,
  projectId?: string,
  options: UseWeatherOptions = {}
): UseWeatherReturn {
  const [data, setData] = useState<WeatherData | null>(options.fallbackData || null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const {
    autoFetch = true,
    refreshInterval,
    fallbackData
  } = options

  const fetchWeatherData = useCallback(async (
    latitude: number,
    longitude: number,
    projectId?: string
  ) => {
    if (!latitude || !longitude) {
      setError('Coordinates are required')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const weatherData = await apiClient.getWeatherData(latitude, longitude, projectId)
      setData(weatherData)
    } catch (err) {
      const errorMessage = err instanceof APIError 
        ? err.message 
        : 'Failed to fetch weather data'
      setError(errorMessage)
      
      // Use fallback data if available
      if (fallbackData) {
        setData(fallbackData)
      }
      
      console.error('Weather fetch error:', err)
    } finally {
      setLoading(false)
    }
  }, [fallbackData])

  const refetch = useCallback(async () => {
    if (lat && lng) {
      await fetchWeatherData(lat, lng, projectId)
    }
  }, [lat, lng, projectId, fetchWeatherData])

  const getWeatherForLocation = useCallback(async (
    latitude: number,
    longitude: number,
    projectId?: string
  ) => {
    await fetchWeatherData(latitude, longitude, projectId)
  }, [fetchWeatherData])

  // Initial fetch
  useEffect(() => {
    if (autoFetch && lat && lng) {
      fetchWeatherData(lat, lng, projectId)
    }
  }, [autoFetch, lat, lng, projectId, fetchWeatherData])

  // Auto refresh interval
  useEffect(() => {
    if (refreshInterval && lat && lng) {
      const interval = setInterval(() => {
        fetchWeatherData(lat, lng, projectId)
      }, refreshInterval)

      return () => clearInterval(interval)
    }
  }, [refreshInterval, lat, lng, projectId, fetchWeatherData])

  return {
    data,
    loading,
    error,
    refetch,
    getWeatherForLocation
  }
}

// Specialized hook for dashboard weather widget
export function useDashboardWeather() {
  // Use Lüleburgaz, Kırklareli coordinates (company location)
  const LULEBURGAZ_LAT = 41.4023
  const LULEBURGAZ_LNG = 27.3564

  return useWeather(LULEBURGAZ_LAT, LULEBURGAZ_LNG, undefined, {
    autoFetch: true,
    refreshInterval: 10 * 60 * 1000, // 10 minutes
  })
}

// Hook for project-specific weather
export function useProjectWeather(
  projectId: string,
  coordinates?: { lat: number; lng: number }
) {
  const [lat, lng] = coordinates ? [coordinates.lat, coordinates.lng] : [null, null]
  
  return useWeather(lat || undefined, lng || undefined, projectId, {
    autoFetch: !!coordinates,
    refreshInterval: 15 * 60 * 1000, // 15 minutes
  })
}

// Hook for weather-based energy forecasting
export function useEnergyForecast(
  lat: number,
  lng: number,
  systemSize: number,
  days: number = 7
) {
  const [forecast, setForecast] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchForecast = useCallback(async () => {
    if (!lat || !lng || !systemSize) return

    setLoading(true)
    setError(null)

    try {
      const forecastData = await apiClient.getEnergyForecast(lat, lng, systemSize, days)
      setForecast(forecastData)
    } catch (err) {
      const errorMessage = err instanceof APIError 
        ? err.message 
        : 'Failed to fetch energy forecast'
      setError(errorMessage)
      console.error('Energy forecast error:', err)
    } finally {
      setLoading(false)
    }
  }, [lat, lng, systemSize, days])

  useEffect(() => {
    fetchForecast()
  }, [fetchForecast])

  return {
    forecast,
    loading,
    error,
    refetch: fetchForecast
  }
}

// Utility hook for weather alerts and notifications
export function useWeatherAlerts(weatherData: WeatherData | null) {
  const [alerts, setAlerts] = useState<Array<{
    type: 'warning' | 'info' | 'severe'
    message: string
    impact: string
  }>>([])

  useEffect(() => {
    if (!weatherData) {
      setAlerts([])
      return
    }

    const newAlerts = []
    const { current, solarMetrics } = weatherData

    // High wind warning
    if (current.windSpeed > 50) {
      newAlerts.push({
        type: 'warning' as const,
        message: 'Yüksek rüzgar hızı',
        impact: 'Panel güvenliği kontrol edilmeli'
      })
    }

    // Low solar efficiency warning
    if (solarMetrics.weatherImpact === 'high') {
      newAlerts.push({
        type: 'warning' as const,
        message: 'Düşük güneş verimi',
        impact: 'Beklenen üretim %30 azalabilir'
      })
    }

    // Extreme temperature warning
    if (current.temperature > 40 || current.temperature < -10) {
      newAlerts.push({
        type: 'warning' as const,
        message: 'Aşırı sıcaklık koşulları',
        impact: 'Sistem performansı etkilenebilir'
      })
    }

    // UV index information
    if (current.uvIndex >= 8) {
      newAlerts.push({
        type: 'info' as const,
        message: 'Yüksek UV indeksi',
        impact: 'Optimum güneş koşulları'
      })
    }

    // Maintenance weather window
    if (current.windSpeed < 20 && current.cloudCover < 30 && !current.weather.main.includes('Rain')) {
      newAlerts.push({
        type: 'info' as const,
        message: 'İdeal bakım hava koşulları',
        impact: 'Panel temizliği için uygun'
      })
    }

    setAlerts(newAlerts)
  }, [weatherData])

  return alerts
}

export default useWeather