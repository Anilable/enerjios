'use client'

import { useState, useEffect } from 'react'

export interface SolarPanel {
  id: string
  name: string
  brand: string
  model: string
  power: number
  efficiency: number
  dimensions: string
  warranty: number
  price: number
  stock: number
  isAvailable: boolean
  specifications: Record<string, any>
}

export function useSolarPanels() {
  const [panels, setPanels] = useState<SolarPanel[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchSolarPanels = async () => {
      try {
        setLoading(true)
        const response = await fetch('/api/products?type=SOLAR_PANEL&available=true')

        if (!response.ok) {
          throw new Error('Failed to fetch solar panels')
        }

        const products = await response.json()

        // Transform API response to our SolarPanel interface
        const transformedPanels: SolarPanel[] = products.map((product: any) => ({
          id: product.id,
          name: product.name,
          brand: product.brand,
          model: product.model,
          power: product.power ? parseInt(product.power.replace('W', '')) : 0,
          efficiency: product.efficiency ||
            (product.specifications?.efficiency ? parseFloat(product.specifications.efficiency) : 21.0),
          dimensions: product.specifications?.dimensions ||
            `${(product.specifications?.width || 2.27)}m x ${(product.specifications?.height || 1.13)}m`,
          warranty: product.warranty ? parseInt(product.warranty.replace(' yıl', '')) : 25,
          price: product.price,
          stock: product.stock,
          isAvailable: product.isAvailable && product.stock > 0,
          specifications: product.specifications || {}
        }))

        // Filter only available panels with stock
        const availablePanels = transformedPanels.filter(panel =>
          panel.isAvailable && panel.stock > 0 && panel.power > 0
        )

        setPanels(availablePanels)
        setError(null)
      } catch (err) {
        console.error('Error fetching solar panels:', err)
        setError(err instanceof Error ? err.message : 'Failed to fetch solar panels')
      } finally {
        setLoading(false)
      }
    }

    fetchSolarPanels()
  }, [])

  const refetch = () => {
    const fetchSolarPanels = async () => {
      try {
        const response = await fetch('/api/products?type=SOLAR_PANEL&available=true')
        if (!response.ok) throw new Error('Failed to fetch solar panels')
        const products = await response.json()

        const transformedPanels: SolarPanel[] = products.map((product: any) => ({
          id: product.id,
          name: product.name,
          brand: product.brand,
          model: product.model,
          power: product.power ? parseInt(product.power.replace('W', '')) : 0,
          efficiency: product.efficiency ||
            (product.specifications?.efficiency ? parseFloat(product.specifications.efficiency) : 21.0),
          dimensions: product.specifications?.dimensions ||
            `${(product.specifications?.width || 2.27)}m x ${(product.specifications?.height || 1.13)}m`,
          warranty: product.warranty ? parseInt(product.warranty.replace(' yıl', '')) : 25,
          price: product.price,
          stock: product.stock,
          isAvailable: product.isAvailable && product.stock > 0,
          specifications: product.specifications || {}
        }))

        const availablePanels = transformedPanels.filter(panel =>
          panel.isAvailable && panel.stock > 0 && panel.power > 0
        )

        setPanels(availablePanels)
        setError(null)
      } catch (err) {
        console.error('Error refetching solar panels:', err)
        setError(err instanceof Error ? err.message : 'Failed to fetch solar panels')
      }
    }

    fetchSolarPanels()
  }

  return { panels, loading, error, refetch }
}