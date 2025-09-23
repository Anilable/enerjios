'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Shield, BarChart3, Megaphone, Settings, Info, Cookie } from 'lucide-react'
import { toast } from 'sonner'

interface CookieConsent {
  necessary: boolean
  analytics: boolean
  marketing: boolean
  functional: boolean
  timestamp?: number
  version?: string
}

interface CookieSettingsModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSave: (consent: Partial<CookieConsent>) => void
  currentConsent?: CookieConsent | null
}

export default function CookieSettingsModal({
  open,
  onOpenChange,
  onSave,
  currentConsent
}: CookieSettingsModalProps) {
  const [settings, setSettings] = useState<CookieConsent>({
    necessary: true,
    analytics: currentConsent?.analytics || false,
    marketing: currentConsent?.marketing || false,
    functional: currentConsent?.functional || false
  })

  useEffect(() => {
    if (currentConsent) {
      setSettings({
        necessary: true,
        analytics: currentConsent.analytics,
        marketing: currentConsent.marketing,
        functional: currentConsent.functional
      })
    }
  }, [currentConsent])

  const handleSave = () => {
    onSave(settings)
    toast.success('Çerez tercihleri kaydedildi', {
      description: 'Tercihleriniz başarıyla güncellendi.'
    })
  }

  const handleAcceptAll = () => {
    const allAccepted = {
      necessary: true,
      analytics: true,
      marketing: true,
      functional: true
    }
    setSettings(allAccepted)
    onSave(allAccepted)
    toast.success('Tüm çerezler kabul edildi')
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold flex items-center gap-2">
            <Cookie className="h-6 w-6 text-blue-600" />
            Çerez Ayarları
          </DialogTitle>
          <DialogDescription>
            Web sitemizde kullandığımız çerezleri ve tercihlerinizi yönetin. KVKK kapsamında
            verilerinizin korunması bizim için önemlidir.
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="overview" className="mt-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="overview">Genel Bakış</TabsTrigger>
            <TabsTrigger value="details">Detaylı Bilgi</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4 mt-6">
            {/* Necessary Cookies */}
            <Card>
              <CardHeader className="pb-4">
                <div className="flex items-start justify-between">
                  <div className="flex gap-3">
                    <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded-lg">
                      <Shield className="h-5 w-5 text-green-600 dark:text-green-400" />
                    </div>
                    <div>
                      <CardTitle className="text-base">Zorunlu Çerezler</CardTitle>
                      <CardDescription className="text-sm mt-1">
                        Web sitesinin temel işlevleri için gereklidir
                      </CardDescription>
                    </div>
                  </div>
                  <Switch checked={true} disabled className="data-[state=checked]:bg-green-600" />
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Bu çerezler web sitemizin düzgün çalışması için gereklidir. Oturum yönetimi,
                  güvenlik ve form verilerinin geçici saklanması gibi temel işlevleri sağlar.
                </p>
              </CardContent>
            </Card>

            {/* Analytics Cookies */}
            <Card>
              <CardHeader className="pb-4">
                <div className="flex items-start justify-between">
                  <div className="flex gap-3">
                    <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                      <BarChart3 className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <CardTitle className="text-base">Analitik Çerezler</CardTitle>
                      <CardDescription className="text-sm mt-1">
                        Site kullanımını analiz etmemize yardımcı olur
                      </CardDescription>
                    </div>
                  </div>
                  <Switch
                    checked={settings.analytics}
                    onCheckedChange={(checked) =>
                      setSettings({ ...settings, analytics: checked })
                    }
                  />
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Google Analytics kullanarak ziyaretçi istatistikleri, sayfa görüntülenmeleri
                  ve kullanıcı davranışlarını analiz ediyoruz. Bu veriler site deneyimini
                  iyileştirmek için kullanılır.
                </p>
              </CardContent>
            </Card>

            {/* Marketing Cookies */}
            <Card>
              <CardHeader className="pb-4">
                <div className="flex items-start justify-between">
                  <div className="flex gap-3">
                    <div className="p-2 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
                      <Megaphone className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                    </div>
                    <div>
                      <CardTitle className="text-base">Pazarlama Çerezleri</CardTitle>
                      <CardDescription className="text-sm mt-1">
                        Kişiselleştirilmiş içerik ve reklamlar için
                      </CardDescription>
                    </div>
                  </div>
                  <Switch
                    checked={settings.marketing}
                    onCheckedChange={(checked) =>
                      setSettings({ ...settings, marketing: checked })
                    }
                  />
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Size özel içerik ve teklifler sunmak için kullanılır. Sosyal medya
                  entegrasyonları ve hedeflenmiş pazarlama kampanyaları için gereklidir.
                </p>
              </CardContent>
            </Card>

            {/* Functional Cookies */}
            <Card>
              <CardHeader className="pb-4">
                <div className="flex items-start justify-between">
                  <div className="flex gap-3">
                    <div className="p-2 bg-orange-100 dark:bg-orange-900/20 rounded-lg">
                      <Settings className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                    </div>
                    <div>
                      <CardTitle className="text-base">Fonksiyonel Çerezler</CardTitle>
                      <CardDescription className="text-sm mt-1">
                        Gelişmiş özellikler ve kişiselleştirme
                      </CardDescription>
                    </div>
                  </div>
                  <Switch
                    checked={settings.functional}
                    onCheckedChange={(checked) =>
                      setSettings({ ...settings, functional: checked })
                    }
                  />
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Dil tercihleri, tema ayarları ve kullanıcı arayüzü tercihlerinizi
                  hatırlamamızı sağlar. Daha kişisel bir deneyim sunar.
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="details" className="mt-6">
            <div className="space-y-6">
              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
                <div className="flex gap-3">
                  <Info className="h-5 w-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-gray-700 dark:text-gray-300">
                    <p className="font-semibold mb-2">Çerezler Hakkında</p>
                    <p>
                      Çerezler, web sitelerinin düzgün çalışması ve kullanıcı deneyimini
                      iyileştirmek için kullanılan küçük veri dosyalarıdır. KVKK ve AB GDPR
                      düzenlemelerine uygun olarak, kişisel verilerinizin korunması için
                      gerekli tüm önlemleri alıyoruz.
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="font-semibold text-lg">Kullanılan Çerezler</h3>

                {/* Cookie Table */}
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-2">Çerez Adı</th>
                        <th className="text-left p-2">Kategori</th>
                        <th className="text-left p-2">Amaç</th>
                        <th className="text-left p-2">Süre</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b">
                        <td className="p-2">_session_id</td>
                        <td className="p-2">Zorunlu</td>
                        <td className="p-2">Oturum yönetimi</td>
                        <td className="p-2">Oturum</td>
                      </tr>
                      <tr className="border-b">
                        <td className="p-2">_csrf_token</td>
                        <td className="p-2">Zorunlu</td>
                        <td className="p-2">Güvenlik</td>
                        <td className="p-2">Oturum</td>
                      </tr>
                      <tr className="border-b">
                        <td className="p-2">_ga</td>
                        <td className="p-2">Analitik</td>
                        <td className="p-2">Google Analytics</td>
                        <td className="p-2">2 yıl</td>
                      </tr>
                      <tr className="border-b">
                        <td className="p-2">_gid</td>
                        <td className="p-2">Analitik</td>
                        <td className="p-2">Google Analytics</td>
                        <td className="p-2">24 saat</td>
                      </tr>
                      <tr className="border-b">
                        <td className="p-2">theme_preference</td>
                        <td className="p-2">Fonksiyonel</td>
                        <td className="p-2">Tema tercihi</td>
                        <td className="p-2">1 yıl</td>
                      </tr>
                      <tr className="border-b">
                        <td className="p-2">language</td>
                        <td className="p-2">Fonksiyonel</td>
                        <td className="p-2">Dil tercihi</td>
                        <td className="p-2">1 yıl</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="font-semibold">Çerezleri Nasıl Kontrol Edebilirsiniz?</h3>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Tarayıcınızın ayarlarından çerezleri engelleyebilir veya silebilirsiniz.
                  Ancak bu durumda web sitemizin bazı özellikleri düzgün çalışmayabilir.
                </p>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <DialogFooter className="flex-col sm:flex-row gap-3 mt-6">
          <div className="flex-1">
            <p className="text-xs text-gray-500">
              Daha fazla bilgi için{' '}
              <a href="/cerez-politikasi" className="text-blue-600 hover:underline">
                Çerez Politikamızı
              </a>{' '}
              inceleyebilirsiniz.
            </p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              İptal
            </Button>
            <Button variant="outline" onClick={handleAcceptAll}>
              Tümünü Kabul Et
            </Button>
            <Button onClick={handleSave} className="bg-blue-600 hover:bg-blue-700">
              Seçimleri Kaydet
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}