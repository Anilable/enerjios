import { useState, useEffect } from 'react'

export interface LicenseInfo {
  isValid: boolean
  licenseType: 'BASIC' | 'PROFESSIONAL' | 'ENTERPRISE'
  expiryDate: string
  features: {
    roofDrawing: boolean
    panelPlacement: boolean
    advancedCalculations: boolean
    exportFeatures: boolean
    unlimitedProjects: boolean
  }
  projectsRemaining?: number
  maxRoofArea?: number // m² limit
  maxPanels?: number // panel count limit
}

export function useLicenseValidation() {
  const [licenseInfo, setLicenseInfo] = useState<LicenseInfo | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchLicenseInfo = async () => {
      setIsLoading(true)
      setError(null)

      try {
        const response = await fetch('/api/license/validate')
        
        if (!response.ok) {
          throw new Error('Failed to validate license')
        }

        const data = await response.json()
        setLicenseInfo(data)
      } catch (err) {
        console.error('License validation error:', err)
        setError(err instanceof Error ? err.message : 'License validation failed')
        
        // Set default basic license for development/demo
        setLicenseInfo({
          isValid: true,
          licenseType: 'BASIC',
          expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days
          features: {
            roofDrawing: true,
            panelPlacement: true,
            advancedCalculations: false,
            exportFeatures: false,
            unlimitedProjects: false
          },
          projectsRemaining: 3,
          maxRoofArea: 200,
          maxPanels: 50
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchLicenseInfo()
  }, [])

  const checkFeatureAccess = (feature: keyof LicenseInfo['features']): boolean => {
    if (!licenseInfo?.isValid) return false
    return licenseInfo.features[feature]
  }

  const checkRoofAreaLimit = (area: number): { allowed: boolean; message?: string } => {
    if (!licenseInfo?.isValid) {
      return { allowed: false, message: 'Geçersiz lisans' }
    }

    if (licenseInfo.licenseType === 'ENTERPRISE') {
      return { allowed: true }
    }

    if (licenseInfo.maxRoofArea && area > licenseInfo.maxRoofArea) {
      return {
        allowed: false,
        message: `Çatı alanı limiti aşıldı. Maksimum ${licenseInfo.maxRoofArea}m² (Mevcut: ${area}m²)`
      }
    }

    return { allowed: true }
  }

  const checkPanelLimit = (panelCount: number): { allowed: boolean; message?: string } => {
    if (!licenseInfo?.isValid) {
      return { allowed: false, message: 'Geçersiz lisans' }
    }

    if (licenseInfo.licenseType === 'ENTERPRISE') {
      return { allowed: true }
    }

    if (licenseInfo.maxPanels && panelCount > licenseInfo.maxPanels) {
      return {
        allowed: false,
        message: `Panel sayısı limiti aşıldı. Maksimum ${licenseInfo.maxPanels} panel (Mevcut: ${panelCount})`
      }
    }

    return { allowed: true }
  }

  return {
    licenseInfo,
    isLoading,
    error,
    checkFeatureAccess,
    checkRoofAreaLimit,
    checkPanelLimit
  }
}