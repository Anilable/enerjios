'use client'

import { useState, useEffect, useCallback } from 'react'

export interface CookieConsent {
  necessary: boolean
  analytics: boolean
  marketing: boolean
  functional: boolean
  timestamp: number
  version: string
}

interface UseCookieConsentReturn {
  consent: CookieConsent | null
  hasConsent: boolean
  isLoading: boolean
  updateConsent: (newConsent: Partial<CookieConsent>) => Promise<void>
  withdrawConsent: () => Promise<void>
  refreshConsent: () => Promise<void>
}

const CONSENT_VERSION = '1.0.0'
const CONSENT_KEY = 'enerjios_cookie_consent'

export function useCookieConsent(): UseCookieConsentReturn {
  const [consent, setConsent] = useState<CookieConsent | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Load consent from localStorage on mount
  useEffect(() => {
    loadLocalConsent()
  }, [])

  const loadLocalConsent = useCallback(() => {
    try {
      const stored = localStorage.getItem(CONSENT_KEY)
      if (stored) {
        const parsed = JSON.parse(stored) as CookieConsent

        // Check version compatibility
        if (parsed.version === CONSENT_VERSION) {
          setConsent(parsed)
          applyConsentSettings(parsed)
        } else {
          // Version mismatch, clear stored consent
          localStorage.removeItem(CONSENT_KEY)
          setConsent(null)
        }
      }
    } catch (error) {
      console.error('Error loading consent from localStorage:', error)
      localStorage.removeItem(CONSENT_KEY)
    } finally {
      setIsLoading(false)
    }
  }, [])

  const refreshConsent = useCallback(async () => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/legal/cookie-consent')
      const data = await response.json()

      if (data.consent) {
        const serverConsent = data.consent as CookieConsent
        setConsent(serverConsent)
        localStorage.setItem(CONSENT_KEY, JSON.stringify(serverConsent))
        applyConsentSettings(serverConsent)
      } else {
        setConsent(null)
        localStorage.removeItem(CONSENT_KEY)
      }
    } catch (error) {
      console.error('Error refreshing consent:', error)
      // Fall back to local storage
      loadLocalConsent()
    } finally {
      setIsLoading(false)
    }
  }, [loadLocalConsent])

  const applyConsentSettings = useCallback((consent: CookieConsent) => {
    if (typeof window === 'undefined') return

    // Google Analytics
    if (consent.analytics) {
      // Enable Google Analytics
      if (typeof window.gtag === 'function') {
        window.gtag('consent', 'update', {
          'analytics_storage': 'granted'
        })
      }

      // Load Google Analytics if not already loaded
      loadGoogleAnalytics()
    } else {
      // Disable Google Analytics
      if (typeof window.gtag === 'function') {
        window.gtag('consent', 'update', {
          'analytics_storage': 'denied'
        })
      }
    }

    // Marketing cookies
    if (consent.marketing) {
      if (typeof window.gtag === 'function') {
        window.gtag('consent', 'update', {
          'ad_storage': 'granted',
          'ad_user_data': 'granted',
          'ad_personalization': 'granted'
        })
      }
    } else {
      if (typeof window.gtag === 'function') {
        window.gtag('consent', 'update', {
          'ad_storage': 'denied',
          'ad_user_data': 'denied',
          'ad_personalization': 'denied'
        })
      }
    }

    // Functional cookies
    if (consent.functional) {
      // Enable functional features
      enableFunctionalFeatures()
    } else {
      // Disable functional features
      disableFunctionalFeatures()
    }
  }, [])

  const loadGoogleAnalytics = useCallback(() => {
    if (typeof window === 'undefined') return

    const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID
    if (!GA_MEASUREMENT_ID) return

    // Check if GA is already loaded
    if (document.querySelector(`script[src*="googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}"]`)) {
      return
    }

    // Load Google Analytics
    const script = document.createElement('script')
    script.async = true
    script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`
    document.head.appendChild(script)

    script.onload = () => {
      window.dataLayer = window.dataLayer || []
      function gtag(...args: any[]) {
        window.dataLayer.push(args)
      }
      window.gtag = gtag

      gtag('js', new Date())
      gtag('config', GA_MEASUREMENT_ID, {
        page_title: document.title,
        page_location: window.location.href
      })
    }
  }, [])

  const enableFunctionalFeatures = useCallback(() => {
    // Load theme preferences
    const theme = localStorage.getItem('theme')
    if (theme) {
      document.documentElement.setAttribute('data-theme', theme)
    }

    // Load language preferences
    const language = localStorage.getItem('language')
    if (language) {
      document.documentElement.setAttribute('lang', language)
    }

    // Load other functional preferences
    const preferences = localStorage.getItem('ui_preferences')
    if (preferences) {
      try {
        const parsed = JSON.parse(preferences)
        // Apply UI preferences
        Object.keys(parsed).forEach(key => {
          document.documentElement.style.setProperty(`--${key}`, parsed[key])
        })
      } catch (error) {
        console.error('Error applying UI preferences:', error)
      }
    }
  }, [])

  const disableFunctionalFeatures = useCallback(() => {
    // Clear theme
    document.documentElement.removeAttribute('data-theme')

    // Reset language
    document.documentElement.setAttribute('lang', 'tr')

    // Clear UI preferences
    const preferences = localStorage.getItem('ui_preferences')
    if (preferences) {
      try {
        const parsed = JSON.parse(preferences)
        Object.keys(parsed).forEach(key => {
          document.documentElement.style.removeProperty(`--${key}`)
        })
      } catch (error) {
        console.error('Error clearing UI preferences:', error)
      }
    }
  }, [])

  const updateConsent = useCallback(async (newConsent: Partial<CookieConsent>) => {
    const updatedConsent: CookieConsent = {
      necessary: true, // Always true
      analytics: newConsent.analytics ?? false,
      marketing: newConsent.marketing ?? false,
      functional: newConsent.functional ?? false,
      timestamp: Date.now(),
      version: CONSENT_VERSION
    }

    try {
      // Save to server
      const response = await fetch('/api/legal/cookie-consent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedConsent)
      })

      if (!response.ok) {
        throw new Error('Failed to save consent')
      }

      // Save to local storage
      localStorage.setItem(CONSENT_KEY, JSON.stringify(updatedConsent))

      // Update state
      setConsent(updatedConsent)

      // Apply settings
      applyConsentSettings(updatedConsent)

    } catch (error) {
      console.error('Error updating consent:', error)
      throw error
    }
  }, [applyConsentSettings])

  const withdrawConsent = useCallback(async () => {
    try {
      // Call server to withdraw consent
      const response = await fetch('/api/legal/cookie-consent', {
        method: 'DELETE'
      })

      if (!response.ok) {
        throw new Error('Failed to withdraw consent')
      }

      // Clear local storage
      localStorage.removeItem(CONSENT_KEY)

      // Clear state
      setConsent(null)

      // Disable all non-necessary features
      applyConsentSettings({
        necessary: true,
        analytics: false,
        marketing: false,
        functional: false,
        timestamp: Date.now(),
        version: CONSENT_VERSION
      })

    } catch (error) {
      console.error('Error withdrawing consent:', error)
      throw error
    }
  }, [applyConsentSettings])

  return {
    consent,
    hasConsent: consent !== null,
    isLoading,
    updateConsent,
    withdrawConsent,
    refreshConsent
  }
}

// Type declarations for window object
declare global {
  interface Window {
    dataLayer: any[]
    gtag: (...args: any[]) => void
  }
}