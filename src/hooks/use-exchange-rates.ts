'use client'

import { useState, useEffect, useCallback } from 'react'
import apiClient, { ExchangeRatesData, APIError } from '@/lib/api-client'

interface UseExchangeRatesOptions {
  autoFetch?: boolean
  refreshInterval?: number // milliseconds
  includeHistory?: boolean
}

interface UseExchangeRatesReturn {
  data: ExchangeRatesData | null
  loading: boolean
  error: string | null
  refetch: () => Promise<void>
  convertCurrency: (amount: number, from: string, to: string) => Promise<number | null>
  getCurrencyRate: (currency: string) => number | null
  formatCurrency: (amount: number, currency?: string) => string
}

export function useExchangeRates(
  options: UseExchangeRatesOptions = {}
): UseExchangeRatesReturn {
  const [data, setData] = useState<ExchangeRatesData | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const {
    autoFetch = true,
    refreshInterval = 30 * 60 * 1000, // 30 minutes default
    includeHistory = false
  } = options

  const fetchExchangeRates = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const ratesData = await apiClient.getExchangeRates(includeHistory)
      setData(ratesData)
    } catch (err) {
      const errorMessage = err instanceof APIError 
        ? err.message 
        : 'Failed to fetch exchange rates'
      setError(errorMessage)
      console.error('Exchange rates fetch error:', err)
    } finally {
      setLoading(false)
    }
  }, [includeHistory])

  const refetch = useCallback(async () => {
    await fetchExchangeRates()
  }, [fetchExchangeRates])

  const convertCurrency = useCallback(async (
    amount: number,
    from: string,
    to: string
  ): Promise<number | null> => {
    try {
      const conversion = await apiClient.convertCurrency(amount, from, to)
      return conversion.convertedAmount
    } catch (err) {
      console.error('Currency conversion error:', err)
      return null
    }
  }, [])

  const getCurrencyRate = useCallback((currency: string): number | null => {
    if (!data) return null
    
    const rate = data.rates.find(r => r.code === currency.toUpperCase())
    return rate?.selling || rate?.forexSelling || null
  }, [data])

  const formatCurrency = useCallback((amount: number, currency: string = 'TRY'): string => {
    const formatter = new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency,
      minimumFractionDigits: currency === 'TRY' ? 0 : 2,
    })
    
    return formatter.format(amount)
  }, [])

  // Initial fetch
  useEffect(() => {
    if (autoFetch) {
      fetchExchangeRates()
    }
  }, [autoFetch, fetchExchangeRates])

  // Auto refresh interval
  useEffect(() => {
    if (refreshInterval && autoFetch) {
      const interval = setInterval(fetchExchangeRates, refreshInterval)
      return () => clearInterval(interval)
    }
  }, [refreshInterval, autoFetch, fetchExchangeRates])

  return {
    data,
    loading,
    error,
    refetch,
    convertCurrency,
    getCurrencyRate,
    formatCurrency
  }
}

// Specialized hook for solar industry currencies
export function useSolarIndustryRates() {
  const { data, loading, error, refetch } = useExchangeRates({
    autoFetch: true,
    refreshInterval: 60 * 60 * 1000, // 1 hour
  })

  const solarRates = data?.solarIndustryRates || {
    USD: null,
    EUR: null,
    CNY: null
  }

  const calculateEquipmentCost = useCallback((
    costUSD: number,
    currency: 'TRY' | 'EUR' = 'TRY'
  ): number | null => {
    if (!solarRates.USD) return null

    const tryAmount = costUSD * (solarRates.USD.selling || solarRates.USD.forexSelling || 0)
    
    if (currency === 'TRY') {
      return tryAmount
    }

    if (currency === 'EUR' && solarRates.EUR) {
      return tryAmount / (solarRates.EUR.selling || solarRates.EUR.forexSelling || 1)
    }

    return null
  }, [solarRates])

  const getImportCosts = useCallback((equipmentCosts: {
    panels?: number // USD
    inverters?: number // EUR
    accessories?: number // USD
  }) => {
    const costs = {
      panels: equipmentCosts.panels && solarRates.USD 
        ? equipmentCosts.panels * (solarRates.USD.selling || 0)
        : 0,
      inverters: equipmentCosts.inverters && solarRates.EUR
        ? equipmentCosts.inverters * (solarRates.EUR.selling || 0)
        : 0,
      accessories: equipmentCosts.accessories && solarRates.USD
        ? equipmentCosts.accessories * (solarRates.USD.selling || 0)
        : 0
    }

    return {
      ...costs,
      total: costs.panels + costs.inverters + costs.accessories,
      currency: 'TRY'
    }
  }, [solarRates])

  return {
    solarRates,
    loading,
    error,
    refetch,
    calculateEquipmentCost,
    getImportCosts,
    lastUpdated: data?.lastUpdated
  }
}

// Hook for financial dashboard with currency conversions
export function useFinancialRates() {
  const { data, loading, error, refetch, formatCurrency, convertCurrency } = useExchangeRates({
    includeHistory: true
  })

  const majorRates = data?.majorCurrencies || {
    USD: null,
    EUR: null,
    GBP: null,
    JPY: null
  }

  const calculatePortfolioValue = useCallback(async (projects: Array<{
    id: string
    costTRY: number
    targetCurrency?: string
  }>) => {
    const results = await Promise.allSettled(
      projects.map(async (project) => {
        if (!project.targetCurrency || project.targetCurrency === 'TRY') {
          return { ...project, convertedCost: project.costTRY }
        }

        const converted = await convertCurrency(
          project.costTRY, 
          'TRY', 
          project.targetCurrency
        )

        return { 
          ...project, 
          convertedCost: converted || project.costTRY,
          currency: project.targetCurrency
        }
      })
    )

    return results
      .filter((result): result is PromiseFulfilledResult<any> => result.status === 'fulfilled')
      .map(result => result.value)
  }, [convertCurrency])

  const getRateChange = useCallback((currency: string) => {
    if (!data) return null
    
    const rate = data.rates.find(r => r.code === currency.toUpperCase())
    if (!rate || typeof rate.changePercent !== 'number') return null
    
    return {
      change: rate.change || 0,
      changePercent: rate.changePercent,
      direction: rate.changePercent > 0 ? 'up' : rate.changePercent < 0 ? 'down' : 'stable'
    }
  }, [data])

  return {
    majorRates,
    loading,
    error,
    refetch,
    formatCurrency,
    convertCurrency,
    calculatePortfolioValue,
    getRateChange,
    bulletinDate: data?.date,
    lastUpdated: data?.lastUpdated
  }
}

// Hook for real-time cost calculations in project forms
export function useProjectCostCalculator() {
  const { getCurrencyRate, convertCurrency, formatCurrency } = useExchangeRates()

  const calculateProjectCosts = useCallback((
    systemSize: number,
    panelPricePerWatt: number = 0.8, // USD per watt
    inverterCost: number = 1200, // USD per kW
    installationCostPerKW: number = 500, // TRY per kW
    additionalCosts: number = 0 // TRY
  ) => {
    const usdRate = getCurrencyRate('USD') || 30 // fallback rate

    // Calculate equipment costs in TRY
    const panelCostTRY = systemSize * 1000 * panelPricePerWatt * usdRate
    const inverterCostTRY = systemSize * inverterCost * usdRate
    const installationCostTRY = systemSize * installationCostPerKW
    
    const subtotal = panelCostTRY + inverterCostTRY + installationCostTRY + additionalCosts
    const vat = subtotal * 0.18 // 18% VAT
    const total = subtotal + vat

    return {
      breakdown: {
        panels: {
          cost: panelCostTRY,
          formatted: formatCurrency(panelCostTRY),
          description: `${systemSize} kW @ $${panelPricePerWatt}/W`
        },
        inverter: {
          cost: inverterCostTRY,
          formatted: formatCurrency(inverterCostTRY),
          description: `${systemSize} kW @ $${inverterCost}/kW`
        },
        installation: {
          cost: installationCostTRY,
          formatted: formatCurrency(installationCostTRY),
          description: `${systemSize} kW @ ₺${installationCostPerKW}/kW`
        },
        additional: {
          cost: additionalCosts,
          formatted: formatCurrency(additionalCosts),
          description: 'Ek malzemeler ve hizmetler'
        }
      },
      subtotal: {
        cost: subtotal,
        formatted: formatCurrency(subtotal)
      },
      vat: {
        cost: vat,
        formatted: formatCurrency(vat),
        rate: 18
      },
      total: {
        cost: total,
        formatted: formatCurrency(total)
      },
      costPerKW: {
        cost: total / systemSize,
        formatted: formatCurrency(total / systemSize)
      },
      exchangeRateUsed: usdRate
    }
  }, [getCurrencyRate, formatCurrency])

  const calculateROI = useCallback(async (
    systemCost: number,
    annualProduction: number, // kWh
    electricityPrice: number = 2.5, // TRY per kWh
    escalationRate: number = 0.05, // 5% annual increase
    systemLifespan: number = 25 // years
  ) => {
    let totalSavings = 0
    let currentPrice = electricityPrice

    // Calculate total savings over system lifespan
    for (let year = 1; year <= systemLifespan; year++) {
      const yearlySavings = annualProduction * currentPrice
      totalSavings += yearlySavings
      currentPrice *= (1 + escalationRate)
    }

    const netProfit = totalSavings - systemCost
    const roi = (netProfit / systemCost) * 100
    const paybackPeriod = systemCost / (annualProduction * electricityPrice)

    return {
      systemCost: {
        value: systemCost,
        formatted: formatCurrency(systemCost)
      },
      totalSavings: {
        value: totalSavings,
        formatted: formatCurrency(totalSavings)
      },
      netProfit: {
        value: netProfit,
        formatted: formatCurrency(netProfit)
      },
      roi: {
        value: roi,
        formatted: `%${roi.toFixed(1)}`
      },
      paybackPeriod: {
        value: paybackPeriod,
        formatted: `${paybackPeriod.toFixed(1)} yıl`
      },
      annualSavings: {
        firstYear: annualProduction * electricityPrice,
        formatted: formatCurrency(annualProduction * electricityPrice)
      }
    }
  }, [formatCurrency])

  return {
    calculateProjectCosts,
    calculateROI
  }
}

export default useExchangeRates