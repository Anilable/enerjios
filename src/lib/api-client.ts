// API Client utilities for EnerjiOS platform

export interface WeatherData {
  location: {
    name: string
    coordinates: [number, number]
  }
  current: {
    temperature: number
    feelsLike: number
    humidity: number
    pressure: number
    windSpeed: number
    windDirection: number
    cloudCover: number
    visibility: number
    irradiance: number
    uvIndex: number
    weather: {
      main: string
      description: string
      icon: string
    }
    sunrise: string
    sunset: string
    lastUpdated: string
  }
  forecast: Array<{
    date: string
    temperature: {
      min: number
      max: number
    }
    cloudCover: number
    estimatedOutput: number
    avgIrradiance: number
    weather: {
      main: string
      description: string
      icon: string
    }
  }>
  hourlyForecast: Array<{
    date: string
    datetime: string
    temperature: {
      min: number
      max: number
      current: number
    }
    weather: {
      main: string
      description: string
      icon: string
    }
    cloudCover: number
    windSpeed: number
    humidity: number
    estimatedOutput: number
    irradiance: number
  }>
  solarMetrics: {
    currentIrradiance: number
    peakSunHours: number
    estimatedDailyOutput: number
    weatherImpact: 'low' | 'medium' | 'high'
  }
}

export interface ExchangeRate {
  code: string
  name: string
  unit: number
  buying: number | null
  selling: number | null
  forexBuying: number | null
  forexSelling: number | null
  change?: number
  changePercent?: number
  source?: string
}

export interface ExchangeRatesData {
  date: string
  bulletinNo: string
  rates: ExchangeRate[]
  lastUpdated: string
  majorCurrencies: {
    USD: ExchangeRate | null
    EUR: ExchangeRate | null
    GBP: ExchangeRate | null
    JPY: ExchangeRate | null
  }
  solarIndustryRates: {
    USD: ExchangeRate | null
    EUR: ExchangeRate | null
    CNY: ExchangeRate | null
  }
}

export interface CurrencyConversion {
  originalAmount: number
  convertedAmount: number
  fromCurrency: string
  toCurrency: string
  exchangeRate: number
  date: string
  calculatedAt: string
}

export interface EmailRequest {
  to: string | string[]
  template: 'projectStatusUpdate' | 'customerWelcome' | 'invoiceGenerated' | 'maintenanceReminder'
  data: Record<string, any>
  from?: string
  replyTo?: string
}

export interface EmailResponse {
  success: boolean
  messageId?: string
  recipients: string[]
  template: string
  sentAt: string
}

class APIClient {
  private baseUrl: string

  constructor(baseUrl: string = '') {
    this.baseUrl = baseUrl
  }

  private async fetchAPI<T>(
    endpoint: string, 
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`
    
    const defaultHeaders = {
      'Content-Type': 'application/json',
    }

    const config: RequestInit = {
      ...options,
      headers: {
        ...defaultHeaders,
        ...options.headers,
      },
    }

    try {
      const response = await fetch(url, config)
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new APIError(
          errorData.error || `HTTP ${response.status}: ${response.statusText}`,
          response.status,
          errorData
        )
      }

      return await response.json()
    } catch (error) {
      if (error instanceof APIError) {
        throw error
      }
      
      throw new APIError(
        error instanceof Error ? error.message : 'Network error occurred',
        0
      )
    }
  }

  // Weather API methods
  async getWeatherData(lat: number, lng: number, projectId?: string): Promise<WeatherData> {
    const params = new URLSearchParams({
      lat: lat.toString(),
      lng: lng.toString(),
    })
    
    if (projectId) {
      params.set('projectId', projectId)
    }

    return this.fetchAPI<WeatherData>(`/api/weather?${params}`)
  }

  async getWeatherByLocation(location: { lat: number, lng: number, projectId?: string }): Promise<WeatherData> {
    return this.fetchAPI<WeatherData>('/api/weather', {
      method: 'POST',
      body: JSON.stringify(location),
    })
  }

  // Exchange Rates API methods
  async getExchangeRates(includeHistory: boolean = false): Promise<ExchangeRatesData> {
    const params = new URLSearchParams()
    if (includeHistory) {
      params.set('history', 'true')
    }

    return this.fetchAPI<ExchangeRatesData>(`/api/exchange-rates?${params}`)
  }

  async getCurrencyRate(currency: string): Promise<{ rate: ExchangeRate }> {
    return this.fetchAPI<{ rate: ExchangeRate }>(`/api/exchange-rates?currency=${currency}`)
  }

  async convertCurrency(
    amount: number,
    fromCurrency: string,
    toCurrency: string
  ): Promise<CurrencyConversion> {
    return this.fetchAPI<CurrencyConversion>('/api/exchange-rates', {
      method: 'POST',
      body: JSON.stringify({
        amount,
        fromCurrency,
        toCurrency,
      }),
    })
  }

  // Email API methods
  async sendEmail(emailRequest: EmailRequest): Promise<EmailResponse> {
    return this.fetchAPI<EmailResponse>('/api/emails', {
      method: 'POST',
      body: JSON.stringify(emailRequest),
    })
  }

  async getEmailTemplates(): Promise<{ templates: string[] }> {
    return this.fetchAPI<{ templates: string[] }>('/api/emails')
  }

  async previewEmailTemplate(template: string): Promise<string> {
    const response = await fetch(`/api/emails?template=${template}&preview=true`)
    return response.text()
  }

  // Convenience methods for common operations
  async sendProjectStatusUpdate(
    to: string | string[],
    projectData: {
      projectName: string
      status: string
      progress: number
      message?: string
      systemSize: number
      location: string
      nextStep?: string
      projectUrl: string
    }
  ): Promise<EmailResponse> {
    return this.sendEmail({
      to,
      template: 'projectStatusUpdate',
      data: projectData,
    })
  }

  async sendCustomerWelcome(
    to: string,
    customerData: {
      customerName: string
      email: string
      phone: string
      dashboardUrl: string
      projectAssignee?: string
    }
  ): Promise<EmailResponse> {
    return this.sendEmail({
      to,
      template: 'customerWelcome',
      data: customerData,
    })
  }

  async sendInvoiceNotification(
    to: string,
    invoiceData: {
      customerName: string
      invoiceNumber: string
      amount: number
      dueDate: string
      projectName: string
      invoiceUrl: string
      paymentUrl: string
    }
  ): Promise<EmailResponse> {
    return this.sendEmail({
      to,
      template: 'invoiceGenerated',
      data: invoiceData,
    })
  }

  async sendMaintenanceReminder(
    to: string,
    maintenanceData: {
      customerName: string
      projectName: string
      lastMaintenance: string
      suggestedDate: string
      maintenanceType: string
      scheduleUrl: string
      performanceIssues?: string
    }
  ): Promise<EmailResponse> {
    return this.sendEmail({
      to,
      template: 'maintenanceReminder',
      data: maintenanceData,
    })
  }

  // Utility methods for financial calculations with real exchange rates
  async calculateProjectCostInCurrency(
    costInTRY: number,
    targetCurrency: string
  ): Promise<{
    originalCost: number
    convertedCost: number
    currency: string
    exchangeRate: number
    lastUpdated: string
  }> {
    try {
      const conversion = await this.convertCurrency(costInTRY, 'TRY', targetCurrency)
      return {
        originalCost: costInTRY,
        convertedCost: conversion.convertedAmount,
        currency: targetCurrency,
        exchangeRate: conversion.exchangeRate,
        lastUpdated: conversion.calculatedAt
      }
    } catch (error) {
      throw new APIError('Failed to calculate currency conversion', 500)
    }
  }

  // Weather-based energy calculations
  async getEnergyForecast(
    lat: number,
    lng: number,
    systemSize: number,
    days: number = 7
  ): Promise<{
    daily: Array<{
      date: string
      estimatedProduction: number
      weatherCondition: string
      efficiency: number
    }>
    totalEstimated: number
    averageDaily: number
  }> {
    const weather = await this.getWeatherData(lat, lng)
    
    const daily = weather.forecast.slice(0, days).map(day => ({
      date: day.date,
      estimatedProduction: Math.round(day.estimatedOutput * systemSize),
      weatherCondition: day.weather.description,
      efficiency: Math.max(60, 100 - (day.cloudCover * 0.4))
    }))

    const totalEstimated = daily.reduce((sum, day) => sum + day.estimatedProduction, 0)
    const averageDaily = Math.round(totalEstimated / daily.length)

    return {
      daily,
      totalEstimated,
      averageDaily
    }
  }
}

export class APIError extends Error {
  public status: number
  public details?: any

  constructor(message: string, status: number = 500, details?: any) {
    super(message)
    this.name = 'APIError'
    this.status = status
    this.details = details
  }
}

// Singleton instance
const apiClient = new APIClient()
export default apiClient

// Hook for React components
export function useAPI() {
  return apiClient
}

// Utility functions
export const formatCurrency = (amount: number, currency: string = 'TRY'): string => {
  const formatter = new Intl.NumberFormat('tr-TR', {
    style: 'currency',
    currency,
    minimumFractionDigits: currency === 'TRY' ? 0 : 2,
  })
  
  return formatter.format(amount)
}

export const formatTemperature = (temp: number): string => {
  return `${Math.round(temp)}°C`
}

export const getWeatherIcon = (iconCode: string): string => {
  return `https://openweathermap.org/img/wn/${iconCode}@2x.png`
}

export const formatWindSpeed = (speed: number): string => {
  return `${Math.round(speed)} km/h`
}

export const getWindDirection = (degrees: number): string => {
  const directions = ['K', 'KKD', 'KD', 'DKD', 'D', 'DGD', 'GD', 'GGD', 
                      'G', 'GGB', 'GB', 'BGB', 'B', 'BKB', 'KB', 'KKB']
  const index = Math.round(degrees / 22.5) % 16
  return directions[index]
}

export const getUVIndexDescription = (uvIndex: number): string => {
  if (uvIndex <= 2) return 'Düşük'
  if (uvIndex <= 5) return 'Orta'
  if (uvIndex <= 7) return 'Yüksek'
  if (uvIndex <= 10) return 'Çok Yüksek'
  return 'Aşırı'
}

export const getSolarEfficiencyRating = (irradiance: number): {
  rating: string
  efficiency: number
  description: string
} => {
  if (irradiance >= 800) {
    return {
      rating: 'Mükemmel',
      efficiency: 95,
      description: 'Optimum güneş koşulları'
    }
  } else if (irradiance >= 600) {
    return {
      rating: 'İyi',
      efficiency: 80,
      description: 'İyi güneş koşulları'
    }
  } else if (irradiance >= 400) {
    return {
      rating: 'Orta',
      efficiency: 60,
      description: 'Bulutlu koşullar'
    }
  } else if (irradiance >= 200) {
    return {
      rating: 'Düşük',
      efficiency: 40,
      description: 'Çok bulutlu'
    }
  } else {
    return {
      rating: 'Çok Düşük',
      efficiency: 20,
      description: 'Güneş yok'
    }
  }
}