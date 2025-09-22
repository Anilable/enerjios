import React, { useState, useEffect } from 'react'

export interface ExchangeRates {
  USD: number
  EUR: number
  GBP: number
  updatedAt: string
}

interface UseExchangeRatesReturn {
  rates: ExchangeRates | null
  loading: boolean
  error: string | null
  refresh: () => void
  convertToTRY: (amount: number, currency: 'USD' | 'EUR' | 'GBP') => number
  convertFromTRY: (amount: number, currency: 'USD' | 'EUR' | 'GBP') => number
}

// Cache for rates to avoid too many API calls
let ratesCache: { rates: ExchangeRates; timestamp: number } | null = null
const CACHE_DURATION = 30 * 60 * 1000 // 30 minutes

export function useExchangeRates(): UseExchangeRatesReturn {
  const [rates, setRates] = useState<ExchangeRates | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchRates = async () => {
    try {
      setLoading(true)
      setError(null)

      // Check cache first
      if (ratesCache && Date.now() - ratesCache.timestamp < CACHE_DURATION) {
        setRates(ratesCache.rates)
        setLoading(false)
        return
      }

      // Try multiple sources in order of preference
      let response: Response | null = null
      let data: any = null

      // 1. Try our internal API first
      try {
        response = await fetch('/api/exchange-rates')
        if (response.ok) {
          data = await response.json()
          if (data.rates) {
            const rates: ExchangeRates = {
              USD: data.rates.USD || 0,
              EUR: data.rates.EUR || 0,
              GBP: data.rates.GBP || 0,
              updatedAt: data.updatedAt || new Date().toISOString()
            }
            setRates(rates)
            ratesCache = { rates, timestamp: Date.now() }
            return
          }
        }
      } catch (err) {
        console.warn('Internal API failed, trying external source')
      }

      // 2. Fallback to external API (exchangerate-api.com)
      try {
        response = await fetch('https://api.exchangerate-api.com/v4/latest/TRY')
        if (response.ok) {
          data = await response.json()
          const rates: ExchangeRates = {
            USD: 1 / (data.rates?.USD || 0.027), // Invert since API returns TRY to other currencies
            EUR: 1 / (data.rates?.EUR || 0.025),
            GBP: 1 / (data.rates?.GBP || 0.021),
            updatedAt: new Date().toISOString()
          }
          setRates(rates)
          ratesCache = { rates, timestamp: Date.now() }
          return
        }
      } catch (err) {
        console.warn('External API failed, using fallback rates')
      }

      // 3. Final fallback - approximate rates (should be updated regularly)
      const fallbackRates: ExchangeRates = {
        USD: 33.5,
        EUR: 36.2,
        GBP: 42.1,
        updatedAt: new Date().toISOString()
      }

      setRates(fallbackRates)
      ratesCache = { rates: fallbackRates, timestamp: Date.now() }
      setError('Güncel kurlar alınamadı, yaklaşık değerler kullanılıyor')

    } catch (err) {
      setError('Döviz kurları yüklenirken hata oluştu')
      console.error('Exchange rates fetch error:', err)
    } finally {
      setLoading(false)
    }
  }

  const refresh = () => {
    ratesCache = null // Clear cache
    fetchRates()
  }

  const convertToTRY = (amount: number, currency: 'USD' | 'EUR' | 'GBP'): number => {
    if (!rates || !rates[currency] || typeof rates[currency] !== 'number') return amount
    return amount * (rates[currency] as number)
  }

  const convertFromTRY = (amount: number, currency: 'USD' | 'EUR' | 'GBP'): number => {
    if (!rates || !rates[currency] || typeof rates[currency] !== 'number') return amount
    return amount / (rates[currency] as number)
  }

  useEffect(() => {
    fetchRates()

    // Auto-refresh every 30 minutes
    const interval = setInterval(fetchRates, 30 * 60 * 1000)
    return () => clearInterval(interval)
  }, [])

  return {
    rates,
    loading,
    error,
    refresh,
    convertToTRY,
    convertFromTRY
  }
}

// Utility function for formatting currency
export function formatCurrency(
  amount: number,
  currency: 'TRY' | 'USD' | 'EUR' | 'GBP' = 'TRY',
  locale: string = 'tr-TR'
): string {
  const symbols = {
    TRY: '₺',
    USD: '$',
    EUR: '€',
    GBP: '£'
  }

  const formatted = new Intl.NumberFormat(locale, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount)

  return `${symbols[currency]}${formatted}`
}

// Component for displaying live exchange rates
export function ExchangeRateDisplay() {
  const { rates, loading, error, refresh } = useExchangeRates()

  if (loading) {
    return <div className="text-sm text-gray-500">Kurlar yükleniyor...</div>
  }

  if (error) {
    return (
      <div className="text-sm text-red-500 cursor-pointer" onClick={refresh}>
        {error} (Yenilemek için tıklayın)
      </div>
    )
  }

  if (!rates) return null

  return (
    <div className="flex gap-4 text-sm">
      <span>USD: ₺{rates.USD.toFixed(2)}</span>
      <span>EUR: ₺{rates.EUR.toFixed(2)}</span>
      <span>GBP: ₺{rates.GBP.toFixed(2)}</span>
      <button
        onClick={refresh}
        className="text-blue-600 hover:text-blue-800"
        title="Kurları yenile"
      >
        ↻
      </button>
    </div>
  )
}