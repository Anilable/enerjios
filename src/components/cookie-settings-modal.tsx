'use client'

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import {
  Settings,
  Cookie,
  Shield,
  BarChart3,
  Megaphone,
  CheckCircle,
  XCircle
} from 'lucide-react'

interface CookieCategory {
  id: string
  name: string
  icon: any
  description: string
  required: boolean
  enabled: boolean
  examples: string[]
}

interface CookieSettingsModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CookieSettingsModal({ open, onOpenChange }: CookieSettingsModalProps) {
  const [categories, setCategories] = useState<CookieCategory[]>([
    {
      id: 'necessary',
      name: 'Zorunlu Çerezler',
      icon: Shield,
      description: 'Web sitesinin temel işlevleri için gerekli çerezler. Bu çerezler devre dışı bırakılamaz.',
      required: true,
      enabled: true,
      examples: ['Oturum yönetimi', 'Güvenlik', 'Form verileri']
    },
    {
      id: 'analytics',
      name: 'Analitik Çerezler',
      icon: BarChart3,
      description: 'Site kullanımını analiz etmek ve deneyimi iyileştirmek için kullanılan çerezler.',
      required: false,
      enabled: false,
      examples: ['Google Analytics', 'Sayfa görüntüleme', 'Kullanıcı davranışı']
    },
    {
      id: 'marketing',
      name: 'Pazarlama Çerezleri',
      icon: Megaphone,
      description: 'Kişiselleştirilmiş içerik ve reklamlar göstermek için kullanılan çerezler.',
      required: false,
      enabled: false,
      examples: ['Hedeflenmiş reklamlar', 'Sosyal medya', 'Kampanya takibi']
    },
    {
      id: 'functional',
      name: 'Fonksiyonel Çerezler',
      icon: Settings,
      description: 'Gelişmiş özellikler ve kişiselleştirme için kullanılan çerezler.',
      required: false,
      enabled: false,
      examples: ['Dil tercihi', 'Tema ayarları', 'Kullanıcı tercihleri']
    }
  ])

  // Load saved preferences on mount
  useEffect(() => {
    const savedPreferences = localStorage.getItem('enerjios_cookie_preferences')
    if (savedPreferences) {
      try {
        const preferences = JSON.parse(savedPreferences)
        setCategories(prev => prev.map(category => ({
          ...category,
          enabled: category.required || preferences[category.id] || false
        })))
      } catch (error) {
        console.error('Error loading cookie preferences:', error)
      }
    }
  }, [])

  const handleCategoryToggle = (categoryId: string, enabled: boolean) => {
    setCategories(prev => prev.map(category =>
      category.id === categoryId
        ? { ...category, enabled: category.required || enabled }
        : category
    ))
  }

  const handleSavePreferences = () => {
    const preferences: Record<string, boolean> = {}
    categories.forEach(category => {
      preferences[category.id] = category.enabled
    })

    // Save to localStorage
    localStorage.setItem('enerjios_cookie_preferences', JSON.stringify(preferences))

    // Save consent timestamp
    localStorage.setItem('enerjios_cookie_consent', new Date().toISOString())

    // Trigger events for tracking scripts
    window.dispatchEvent(new CustomEvent('cookiePreferencesUpdated', {
      detail: preferences
    }))

    onOpenChange(false)
  }

  const handleAcceptAll = () => {
    const allEnabled = categories.map(category => ({
      ...category,
      enabled: true
    }))
    setCategories(allEnabled)

    const preferences: Record<string, boolean> = {}
    allEnabled.forEach(category => {
      preferences[category.id] = true
    })

    localStorage.setItem('enerjios_cookie_preferences', JSON.stringify(preferences))
    localStorage.setItem('enerjios_cookie_consent', new Date().toISOString())

    window.dispatchEvent(new CustomEvent('cookiePreferencesUpdated', {
      detail: preferences
    }))

    onOpenChange(false)
  }

  const handleRejectAll = () => {
    const onlyRequired = categories.map(category => ({
      ...category,
      enabled: category.required
    }))
    setCategories(onlyRequired)

    const preferences: Record<string, boolean> = {}
    onlyRequired.forEach(category => {
      preferences[category.id] = category.enabled
    })

    localStorage.setItem('enerjios_cookie_preferences', JSON.stringify(preferences))
    localStorage.setItem('enerjios_cookie_consent', new Date().toISOString())

    window.dispatchEvent(new CustomEvent('cookiePreferencesUpdated', {
      detail: preferences
    }))

    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl flex items-center gap-3">
            <div className="p-2 bg-orange-100 dark:bg-orange-900/20 rounded-lg">
              <Cookie className="h-6 w-6 text-orange-600 dark:text-orange-400" />
            </div>
            Çerez Ayarları
          </DialogTitle>
          <DialogDescription className="text-base">
            Web sitemizde kullanılan çerez kategorilerini seçerek deneyiminizi kişiselleştirebilirsiniz.
            Zorunlu çerezler web sitesinin temel işlevleri için gereklidir ve devre dışı bırakılamaz.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {categories.map((category) => {
            const IconComponent = category.icon
            return (
              <div key={category.id} className="border rounded-lg p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex gap-3">
                    <div className="p-2 bg-gray-100 dark:bg-gray-800 rounded-lg">
                      <IconComponent className="h-5 w-5" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-gray-900 dark:text-white">
                          {category.name}
                        </h3>
                        {category.required ? (
                          <Badge className="bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Zorunlu
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-gray-600">
                            <XCircle className="h-3 w-3 mr-1" />
                            Opsiyonel
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
                        {category.description}
                      </p>
                      <div>
                        <h4 className="text-xs font-medium text-gray-700 dark:text-gray-400 mb-1">
                          Örnekler:
                        </h4>
                        <div className="flex flex-wrap gap-1">
                          {category.examples.map((example, index) => (
                            <span
                              key={index}
                              className="text-xs bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded"
                            >
                              {example}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={category.enabled}
                      onCheckedChange={(checked) => handleCategoryToggle(category.id, checked)}
                      disabled={category.required}
                    />
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        <Separator />

        <div className="flex flex-col sm:flex-row gap-3 pt-4">
          <Button
            variant="outline"
            onClick={handleRejectAll}
            className="flex-1"
          >
            Sadece Gerekli Çerezler
          </Button>
          <Button
            variant="outline"
            onClick={handleSavePreferences}
            className="flex-1"
          >
            Seçimlerimi Kaydet
          </Button>
          <Button
            onClick={handleAcceptAll}
            className="flex-1 bg-orange-600 hover:bg-orange-700"
          >
            Tümünü Kabul Et
          </Button>
        </div>

        <div className="bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-800 rounded-lg p-4 text-sm text-gray-600 dark:text-gray-300">
          <p>
            <strong>Not:</strong> Çerez tercihlerinizi istediğiniz zaman footer'daki
            "Çerez Ayarları" linkini kullanarak değiştirebilirsiniz. Zorunlu çerezler
            web sitesinin temel işlevleri için gereklidir ve devre dışı bırakılamaz.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  )
}