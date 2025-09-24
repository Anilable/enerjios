import React, { useState, useEffect } from 'react'

export type RateSource = 'manual' | 'internal' | 'external' | 'fallback'

export interface ExchangeRates {
  USD: number
  EUR: number
  GBP: number
  updatedAt: string
  sources?: Record<'USD' | 'EUR' | 'GBP', RateSource>
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

      const collectedRates: Partial<Record<'USD' | 'EUR' | 'GBP', number>> = {}
      const sources: Record<'USD' | 'EUR' | 'GBP', RateSource> = {
        USD: 'fallback',
        EUR: 'fallback',
        GBP: 'fallback'
      }
      let latestUpdatedAt: string | null = null

      const recordRate = (currency: 'USD' | 'EUR' | 'GBP', rate: number, source: RateSource, updatedAt?: string) => {
        if (typeof rate === 'number' && !Number.isNaN(rate)) {
          collectedRates[currency] = rate
          sources[currency] = source
          if (updatedAt) {
            const current = latestUpdatedAt ? new Date(latestUpdatedAt) : null
            const candidate = new Date(updatedAt)
            if (!latestUpdatedAt || (current && candidate > current)) {
              latestUpdatedAt = candidate.toISOString()
            }
          }
        }
      }

      const hasCurrency = (currency: 'USD' | 'EUR' | 'GBP') => typeof collectedRates[currency] === 'number'

      // 1. Manual exchange rates from admin panel (highest priority)
      try {
        response = await fetch('/api/admin/exchange-rates?active=true')
        if (response?.ok) {
          data = await response.json()
          const manualRates = Array.isArray(data?.data) ? data.data : []
          manualRates.forEach((rate: any) => {
            const currency = (rate?.currency || '').toUpperCase()
            if ((['USD', 'EUR', 'GBP'] as const).includes(currency) && typeof rate?.rate === 'number') {
              recordRate(currency, rate.rate, 'manual', rate.updatedAt || rate.createdAt)
            }
          })
        } else if (response?.status === 401) {
          console.warn('Manual exchange rates endpoint unauthorized, continuing with other sources')
        }
      } catch (err) {
        console.warn('Manual exchange rates fetch failed, continuing with other sources')
      }

      // 2. Internal exchange rates API for remaining currencies
      if (!hasCurrency('USD') || !hasCurrency('EUR') || !hasCurrency('GBP')) {
        try {
          response = await fetch('/api/exchange-rates')
          if (response.ok) {
            data = await response.json()
            if (data.majorCurrencies) {
              (['USD', 'EUR', 'GBP'] as const).forEach((currency) => {
                if (!hasCurrency(currency)) {
                  const currencyData = data.majorCurrencies[currency]
                  const rate = currencyData?.selling || currencyData?.forexSelling || currencyData?.buying || currencyData?.forexBuying
                  if (typeof rate === 'number') {
                    recordRate(currency, rate, 'internal', data.lastUpdated)
                  }
                }
              })
            }
          }
        } catch (err) {
          console.warn('Internal exchange rates API failed, falling back to external source')
        }
      }

      // 3. External API for any currencies still missing
      if (!hasCurrency('USD') || !hasCurrency('EUR') || !hasCurrency('GBP')) {
        try {
          response = await fetch('https://api.exchangerate-api.com/v4/latest/TRY')
          if (response.ok) {
            data = await response.json();
            (['USD', 'EUR', 'GBP'] as const).forEach((currency) => {
              if (!hasCurrency(currency)) {
                const apiRate = data.rates?.[currency]
                if (typeof apiRate === 'number' && apiRate > 0) {
                  // API returns TRY -> currency, invert to get currency -> TRY
                  recordRate(currency, 1 / apiRate, 'external')
                }
              }
            })
            if (!latestUpdatedAt && data.time_last_updated) {
              latestUpdatedAt = new Date(data.time_last_updated * 1000).toISOString()
            }
          }
        } catch (err) {
          console.warn('External exchange rates API failed, using fallback values')
        }
      }

      // 4. Final fallback values (hardcoded)
      const fallbackDefaults: Record<'USD' | 'EUR' | 'GBP', number> = {
        USD: 33.5,
        EUR: 36.2,
        GBP: 42.1
      };

      (['USD', 'EUR', 'GBP'] as const).forEach((currency) => {
        if (!hasCurrency(currency)) {
          recordRate(currency, fallbackDefaults[currency], 'fallback')
        }
      })

      const finalRates: ExchangeRates = {
        USD: collectedRates.USD as number,
        EUR: collectedRates.EUR as number,
        GBP: collectedRates.GBP as number,
        updatedAt: latestUpdatedAt || new Date().toISOString(),
        sources
      }

      if (Object.values(sources).every((source) => source === 'fallback')) {
        setError('Güncel kurlar alınamadı, yaklaşık değerler kullanılıyor')
      } else if (sources.USD !== 'manual') {
        setError('USD için manuel kur bulunamadı, alternatif kaynak kullanılıyor')
      }

      setRates(finalRates)
      ratesCache = { rates: finalRates, timestamp: Date.now() }

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
    <div className="space-y-4">
      <div className="flex flex-wrap gap-4 text-sm">
        <div className="flex items-center gap-2 p-2 bg-gray-50 rounded">
          <span className="font-medium">USD:</span>
          <span className="text-green-600 font-bold">₺{rates.USD.toFixed(4)}</span>
        </div>
        <div className="flex items-center gap-2 p-2 bg-gray-50 rounded">
          <span className="font-medium">EUR:</span>
          <span className="text-blue-600 font-bold">₺{rates.EUR.toFixed(4)}</span>
        </div>
        <div className="flex items-center gap-2 p-2 bg-gray-50 rounded">
          <span className="font-medium">GBP:</span>
          <span className="text-purple-600 font-bold">₺{rates.GBP.toFixed(4)}</span>
        </div>
      </div>

      <div className="flex gap-2 text-xs">
        <button
          onClick={refresh}
          className="px-3 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors"
          title="Kurları yenile"
        >
          🔄 Yenile
        </button>
        <a
          href="/dashboard/admin/exchange-rates"
          className="px-3 py-1 bg-green-100 text-green-700 rounded hover:bg-green-200 transition-colors"
          title="Manuel düzenleme"
        >
          ✏️ Manuel Düzenle
        </a>
      </div>

      <div className="text-xs text-gray-500">
        Son güncelleme: {new Date(rates.updatedAt).toLocaleString('tr-TR')}
      </div>
    </div>
  )
}
