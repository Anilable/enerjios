'use client'

import { useState, useCallback } from 'react'

export interface NRELCalculationParams {
  lat: number
  lon: number
  systemCapacity: number // kW
  tilt: number // degrees
  azimuth: number // degrees
  arrayType?: 'fixed_open_rack' | 'fixed_roof_mounted' | 'one_axis' | 'one_axis_backtracking' | 'two_axis'
  moduleType?: 'standard' | 'premium' | 'thin_film'
  systemLosses?: number // percentage
}

export interface NRELCalculationResult {
  // Production data
  annualProduction: number // kWh/year
  monthlyProduction: number[] // kWh for each month

  // Solar resource data
  solarIrradiance: number // Annual kWh/m²
  peakSunHours: number // hours/day
  capacityFactor: number // percentage

  // Financial calculations
  annualSavings: number // TL/year
  electricityRate: number // TL/kWh

  // Environmental impact
  co2Offset: number // kg CO2/year
  treesEquivalent: number // number of trees

  // Weather station info
  stationInfo: {
    location: string
    city: string
    state: string
    distance: number // km
  }
}

export interface SolarResourceData {
  irradiance: number // Annual kWh/m²
  location: string
  distance: number // km
}

export function useNRELCalculation() {
  const [isCalculating, setIsCalculating] = useState(false)
  const [result, setResult] = useState<NRELCalculationResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [lastCalculation, setLastCalculation] = useState<Date | null>(null)

  const calculateSolarProduction = useCallback(async (params: NRELCalculationParams): Promise<NRELCalculationResult | null> => {
    try {
      setIsCalculating(true)
      setError(null)

      const response = await fetch('/api/solar-calculation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(params),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }))
        throw new Error(errorData.message || errorData.error || `HTTP ${response.status}`)
      }

      const data = await response.json()

      if (!data.success) {
        throw new Error(data.message || 'Calculation failed')
      }

      const calculationResult: NRELCalculationResult = data.calculation
      setResult(calculationResult)
      setLastCalculation(new Date())

      return calculationResult
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Güneş enerjisi hesaplaması başarısız oldu'
      setError(errorMessage)
      console.error('NREL calculation error:', err)
      return null
    } finally {
      setIsCalculating(false)
    }
  }, [])

  const getSolarResourceData = useCallback(async (lat: number, lon: number): Promise<SolarResourceData | null> => {
    try {
      const response = await fetch(`/api/solar-calculation?lat=${lat}&lon=${lon}`)

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`)
      }

      const data = await response.json()

      if (!data.success) {
        throw new Error(data.message || 'Resource data fetch failed')
      }

      return data.resource
    } catch (err) {
      console.error('Solar resource data error:', err)
      return null
    }
  }, [])

  const clearResult = useCallback(() => {
    setResult(null)
    setError(null)
    setLastCalculation(null)
  }, [])

  const clearError = useCallback(() => {
    setError(null)
  }, [])

  return {
    // State
    isCalculating,
    result,
    error,
    lastCalculation,

    // Actions
    calculateSolarProduction,
    getSolarResourceData,
    clearResult,
    clearError,

    // Computed properties
    hasResult: !!result,
    hasError: !!error,
    isStale: lastCalculation ? Date.now() - lastCalculation.getTime() > 30 * 60 * 1000 : false, // 30 minutes
  }
}

// Utility function to estimate system capacity from roof area and panel specs
export function estimateSystemCapacity(
  roofArea: number, // m²
  panelPower: number, // W per panel
  panelWidth: number, // m
  panelLength: number, // m
  efficiency: number = 0.8 // Installation efficiency factor
): number {
  const panelArea = panelWidth * panelLength
  const maxPanels = Math.floor((roofArea * efficiency) / panelArea)
  const systemCapacityW = maxPanels * panelPower
  return systemCapacityW / 1000 // Convert to kW
}

// Utility function to convert financial data to Turkish Lira
export function calculateTurkishFinancials(
  annualProduction: number, // kWh/year
  systemCapacityKW: number,
  panelPrice: number // TL per panel
): {
  investment: number // TL
  annualSavings: number // TL/year
  paybackPeriod: number // years
  roi25Year: number // percentage
} {
  const electricityRate = 2.2 // TL/kWh (Turkish average)
  const selfConsumption = 0.9 // 90% self-consumption rate

  // Calculate investment cost
  const systemCostPerKW = 8000 // TL/kW installed (Turkish market average)
  const investment = systemCapacityKW * systemCostPerKW

  // Calculate annual savings
  const annualSavings = annualProduction * electricityRate * selfConsumption

  // Calculate payback period
  const paybackPeriod = investment / annualSavings

  // Calculate 25-year ROI
  const totalSavings25Year = annualSavings * 25 * 0.95 // 5% degradation over 25 years
  const roi25Year = ((totalSavings25Year - investment) / investment) * 100

  return {
    investment: Math.round(investment),
    annualSavings: Math.round(annualSavings),
    paybackPeriod: Math.round(paybackPeriod * 10) / 10,
    roi25Year: Math.round(roi25Year)
  }
}