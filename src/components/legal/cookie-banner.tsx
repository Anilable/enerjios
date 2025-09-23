'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Cookie, Settings, X } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import CookieSettingsModal from './cookie-settings-modal'

interface CookieConsent {
  necessary: boolean
  analytics: boolean
  marketing: boolean
  functional: boolean
  timestamp: number
  version: string
}

const CONSENT_VERSION = '1.0.0'
const CONSENT_KEY = 'enerjios_cookie_consent'

export default function CookieBanner() {
  const [showBanner, setShowBanner] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [consent, setConsent] = useState<CookieConsent | null>(null)

  useEffect(() => {
    // Check if consent exists in localStorage
    const storedConsent = localStorage.getItem(CONSENT_KEY)

    if (!storedConsent) {
      // No consent found, show banner
      setShowBanner(true)
    } else {
      try {
        const parsedConsent = JSON.parse(storedConsent) as CookieConsent

        // Check if consent version is outdated
        if (parsedConsent.version !== CONSENT_VERSION) {
          // Version mismatch, show banner again
          setShowBanner(true)
        } else {
          // Valid consent found
          setConsent(parsedConsent)
          applyConsentSettings(parsedConsent)
        }
      } catch (error) {
        // Invalid consent data, show banner
        setShowBanner(true)
      }
    }
  }, [])

  const applyConsentSettings = (consent: CookieConsent) => {
    // Apply consent settings to third-party scripts
    if (typeof window !== 'undefined') {
      // Google Analytics
      if (consent.analytics) {
        // Enable Google Analytics
        (window as any).gtag = function() {
          (window as any).dataLayer = (window as any).dataLayer || [];
          (window as any).dataLayer.push(arguments);
        }
        ;(window as any).gtag('consent', 'update', {
          'analytics_storage': 'granted'
        })
      } else {
        // Disable Google Analytics
        (window as any).gtag('consent', 'update', {
          'analytics_storage': 'denied'
        })
      }

      // Marketing cookies
      if (consent.marketing) {
        // Enable marketing cookies
        (window as any).gtag('consent', 'update', {
          'ad_storage': 'granted',
          'ad_user_data': 'granted',
          'ad_personalization': 'granted'
        })
      } else {
        // Disable marketing cookies
        (window as any).gtag('consent', 'update', {
          'ad_storage': 'denied',
          'ad_user_data': 'denied',
          'ad_personalization': 'denied'
        })
      }
    }
  }

  const saveConsent = (newConsent: CookieConsent) => {
    // Save to localStorage
    localStorage.setItem(CONSENT_KEY, JSON.stringify(newConsent))

    // Save to database via API
    fetch('/api/legal/cookie-consent', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newConsent)
    })

    // Apply settings
    applyConsentSettings(newConsent)
    setConsent(newConsent)
    setShowBanner(false)
  }

  const handleAcceptAll = () => {
    const newConsent: CookieConsent = {
      necessary: true,
      analytics: true,
      marketing: true,
      functional: true,
      timestamp: Date.now(),
      version: CONSENT_VERSION
    }
    saveConsent(newConsent)
  }

  const handleRejectAll = () => {
    const newConsent: CookieConsent = {
      necessary: true, // Always true
      analytics: false,
      marketing: false,
      functional: false,
      timestamp: Date.now(),
      version: CONSENT_VERSION
    }
    saveConsent(newConsent)
  }

  const handleSaveSettings = (settings: Partial<CookieConsent>) => {
    const newConsent: CookieConsent = {
      necessary: true,
      analytics: settings.analytics || false,
      marketing: settings.marketing || false,
      functional: settings.functional || false,
      timestamp: Date.now(),
      version: CONSENT_VERSION
    }
    saveConsent(newConsent)
    setShowSettings(false)
  }

  if (!showBanner) return null

  return (
    <>
      <AnimatePresence>
        {showBanner && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className="fixed bottom-0 left-0 right-0 z-50 p-4 md:p-6"
          >
            <Card className="max-w-7xl mx-auto bg-white dark:bg-gray-900 border-2 border-blue-200 dark:border-blue-800 shadow-2xl">
              <div className="p-6 md:p-8">
                <div className="flex flex-col lg:flex-row gap-6 items-start lg:items-center">
                  {/* Icon and Content */}
                  <div className="flex-1 flex gap-4">
                    <div className="flex-shrink-0">
                      <div className="p-3 bg-blue-100 dark:bg-blue-900/20 rounded-full">
                        <Cookie className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                      </div>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                        🍪 Çerez Kullanımı Hakkında
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                        Size en iyi kullanıcı deneyimini sunmak için çerezler kullanıyoruz.
                        Sitemizi kullanmaya devam ederek çerez kullanımımızı kabul etmiş olursunuz.
                        Çerez tercihlerinizi istediğiniz zaman değiştirebilirsiniz.
                      </p>
                      <div className="mt-3 flex flex-wrap gap-2 text-xs">
                        <a
                          href="/kvkk"
                          className="text-blue-600 dark:text-blue-400 hover:underline"
                        >
                          KVKK Aydınlatma Metni
                        </a>
                        <span className="text-gray-400">•</span>
                        <a
                          href="/cerez-politikasi"
                          className="text-blue-600 dark:text-blue-400 hover:underline"
                        >
                          Çerez Politikası
                        </a>
                        <span className="text-gray-400">•</span>
                        <a
                          href="/gizlilik-politikasi"
                          className="text-blue-600 dark:text-blue-400 hover:underline"
                        >
                          Gizlilik Politikası
                        </a>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
                    <Button
                      onClick={() => setShowSettings(true)}
                      variant="outline"
                      className="w-full sm:w-auto border-gray-300 hover:bg-gray-100 dark:border-gray-600 dark:hover:bg-gray-800"
                    >
                      <Settings className="h-4 w-4 mr-2" />
                      Ayarlar
                    </Button>
                    <Button
                      onClick={handleRejectAll}
                      variant="outline"
                      className="w-full sm:w-auto border-red-300 text-red-600 hover:bg-red-50 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-900/20"
                    >
                      Reddet
                    </Button>
                    <Button
                      onClick={handleAcceptAll}
                      className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      Tümünü Kabul Et
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Cookie Settings Modal */}
      <CookieSettingsModal
        open={showSettings}
        onOpenChange={setShowSettings}
        onSave={handleSaveSettings}
        currentConsent={consent}
      />
    </>
  )
}