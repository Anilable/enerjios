'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { CookieSettingsModal } from '@/components/cookie-settings-modal'
import {
  Cookie,
  Settings,
  Shield,
  BarChart3,
  Megaphone,
  Globe,
  Calendar,
  ArrowLeft,
  ExternalLink,
  Info,
  CheckCircle,
  XCircle
} from 'lucide-react'

export default function CerezPolitikasi() {
  const lastUpdated = "15 Aralık 2024"
  const [cookieModalOpen, setCookieModalOpen] = useState(false)

  const cookieTypes = [
    {
      name: "Zorunlu Çerezler",
      icon: Shield,
      color: "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300",
      required: true,
      description: "Web sitesinin temel işlevleri için gerekli",
      examples: ["Oturum yönetimi", "Güvenlik", "Form verileri"],
      duration: "Oturum süresince"
    },
    {
      name: "Analitik Çerezler",
      icon: BarChart3,
      color: "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300",
      required: false,
      description: "Site kullanımını analiz etmek için",
      examples: ["Google Analytics", "Sayfa görüntüleme", "Kullanıcı davranışı"],
      duration: "2 yıl"
    },
    {
      name: "Pazarlama Çerezleri",
      icon: Megaphone,
      color: "bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-300",
      required: false,
      description: "Kişiselleştirilmiş içerik ve reklamlar",
      examples: ["Hedeflenmiş reklamlar", "Sosyal medya", "Kampanya takibi"],
      duration: "1 yıl"
    },
    {
      name: "Fonksiyonel Çerezler",
      icon: Settings,
      color: "bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-300",
      required: false,
      description: "Gelişmiş özellikler ve kişiselleştirme",
      examples: ["Dil tercihi", "Tema ayarları", "Kullanıcı tercihleri"],
      duration: "1 yıl"
    }
  ]

  const cookieList = [
    {
      name: "_session_id",
      category: "Zorunlu",
      purpose: "Oturum yönetimi ve güvenlik",
      duration: "Oturum",
      provider: "EnerjiOS",
      required: true
    },
    {
      name: "_csrf_token",
      category: "Zorunlu",
      purpose: "CSRF saldırılarına karşı koruma",
      duration: "Oturum",
      provider: "EnerjiOS",
      required: true
    },
    {
      name: "enerjios_cookie_consent",
      category: "Zorunlu",
      purpose: "Çerez tercihlerini hatırlama",
      duration: "1 yıl",
      provider: "EnerjiOS",
      required: true
    },
    {
      name: "_ga",
      category: "Analitik",
      purpose: "Google Analytics - Kullanıcı analizi",
      duration: "2 yıl",
      provider: "Google",
      required: false
    },
    {
      name: "_gid",
      category: "Analitik",
      purpose: "Google Analytics - Oturum analizi",
      duration: "24 saat",
      provider: "Google",
      required: false
    },
    {
      name: "_gat",
      category: "Analitik",
      purpose: "Google Analytics - İstek hızı sınırlama",
      duration: "1 dakika",
      provider: "Google",
      required: false
    },
    {
      name: "theme_preference",
      category: "Fonksiyonel",
      purpose: "Kullanıcı tema tercihi (açık/koyu)",
      duration: "1 yıl",
      provider: "EnerjiOS",
      required: false
    },
    {
      name: "language",
      category: "Fonksiyonel",
      purpose: "Dil tercihi ayarları",
      duration: "1 yıl",
      provider: "EnerjiOS",
      required: false
    }
  ]

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center gap-4 mb-6">
            <Link href="/" className="flex items-center text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300">
              <ArrowLeft className="h-5 w-5 mr-2" />
              Ana Sayfaya Dön
            </Link>
          </div>

          <div className="flex items-start gap-6">
            <div className="p-4 bg-orange-100 dark:bg-orange-900/20 rounded-2xl">
              <Cookie className="h-8 w-8 text-orange-600 dark:text-orange-400" />
            </div>
            <div className="flex-1">
              <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
                Çerez Politikası
              </h1>
              <p className="text-xl text-gray-600 dark:text-gray-300 leading-relaxed">
                Web sitemizde kullandığımız çerezler hakkında detaylı bilgiler
                ve çerez tercihlerinizi nasıl yönetebileceğiniz
              </p>
              <div className="flex items-center gap-4 mt-4 text-sm text-gray-500 dark:text-gray-400">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Son güncelleme: {lastUpdated}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-2"
                  onClick={() => setCookieModalOpen(true)}
                >
                  <Settings className="h-4 w-4" />
                  Çerez Ayarları
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
        {/* Çerez Nedir */}
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl flex items-center gap-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                <Info className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              Çerez Nedir?
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
              Çerezler, web sitelerinin düzgün çalışması ve kullanıcı deneyimini iyileştirmek
              için tarayıcınızda saklanan küçük metin dosyalarıdır. Bu dosyalar, web sitesinin
              size daha iyi hizmet vermesini sağlar ve tercihlerinizi hatırlar.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-blue-50 dark:bg-blue-900/10 rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Oturum Çerezleri</h4>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Tarayıcıyı kapattığınızda silinen geçici çerezler
                </p>
              </div>

              <div className="bg-green-50 dark:bg-green-900/10 rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Kalıcı Çerezler</h4>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Belirli bir süre boyunca tarayıcınızda kalan çerezler
                </p>
              </div>

              <div className="bg-purple-50 dark:bg-purple-900/10 rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Üçüncü Taraf Çerezleri</h4>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Başka web sitelerinden gelen çerezler (Google Analytics gibi)
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Çerez Kategorileri */}
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl flex items-center gap-3">
              <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded-lg">
                <Cookie className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
              Kullandığımız Çerez Kategorileri
            </CardTitle>
            <CardDescription>
              Web sitemizde kullandığımız çerez türleri ve amaçları
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {cookieTypes.map((type) => {
                const IconComponent = type.icon
                return (
                  <Card key={type.name} className="relative">
                    <CardHeader className="pb-4">
                      <div className="flex items-start justify-between">
                        <div className="flex gap-3">
                          <div className="p-2 bg-gray-100 dark:bg-gray-800 rounded-lg">
                            <IconComponent className="h-5 w-5" />
                          </div>
                          <div>
                            <CardTitle className="text-lg flex items-center gap-2">
                              {type.name}
                              {type.required ? (
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
                            </CardTitle>
                            <CardDescription className="mt-1">
                              {type.description}
                            </CardDescription>
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div>
                          <h5 className="text-sm font-medium text-gray-900 dark:text-white mb-2">Örnekler:</h5>
                          <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
                            {type.examples.map((example, index) => (
                              <li key={index}>• {example}</li>
                            ))}
                          </ul>
                        </div>
                        <div className="text-sm">
                          <span className="font-medium text-gray-900 dark:text-white">Süre: </span>
                          <span className="text-gray-600 dark:text-gray-300">{type.duration}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </CardContent>
        </Card>

        {/* Detaylı Çerez Listesi */}
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl flex items-center gap-3">
              <div className="p-2 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
                <BarChart3 className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              </div>
              Detaylı Çerez Listesi
            </CardTitle>
            <CardDescription>
              Web sitemizde kullanılan tüm çerezlerin listesi ve amaçları
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full border border-gray-200 dark:border-gray-700 rounded-lg">
                <thead className="bg-gray-50 dark:bg-gray-800">
                  <tr>
                    <th className="text-left p-4 border-b border-gray-200 dark:border-gray-700 font-semibold">
                      Çerez Adı
                    </th>
                    <th className="text-left p-4 border-b border-gray-200 dark:border-gray-700 font-semibold">
                      Kategori
                    </th>
                    <th className="text-left p-4 border-b border-gray-200 dark:border-gray-700 font-semibold">
                      Amaç
                    </th>
                    <th className="text-left p-4 border-b border-gray-200 dark:border-gray-700 font-semibold">
                      Süre
                    </th>
                    <th className="text-left p-4 border-b border-gray-200 dark:border-gray-700 font-semibold">
                      Sağlayıcı
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {cookieList.map((cookie, index) => (
                    <tr key={index} className="border-b border-gray-100 dark:border-gray-800">
                      <td className="p-4">
                        <code className="bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded text-sm">
                          {cookie.name}
                        </code>
                      </td>
                      <td className="p-4">
                        <Badge
                          variant={cookie.required ? "default" : "outline"}
                          className={cookie.required ? "bg-green-100 text-green-800" : ""}
                        >
                          {cookie.category}
                        </Badge>
                      </td>
                      <td className="p-4 text-sm text-gray-600 dark:text-gray-300">
                        {cookie.purpose}
                      </td>
                      <td className="p-4 text-sm text-gray-600 dark:text-gray-300">
                        {cookie.duration}
                      </td>
                      <td className="p-4 text-sm text-gray-600 dark:text-gray-300">
                        {cookie.provider}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Üçüncü Taraf Çerezleri */}
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl flex items-center gap-3">
              <div className="p-2 bg-red-100 dark:bg-red-900/20 rounded-lg">
                <Globe className="h-6 w-6 text-red-600 dark:text-red-400" />
              </div>
              Üçüncü Taraf Çerezleri
            </CardTitle>
            <CardDescription>
              Web sitemizde kullanılan dış servis sağlayıcıların çerezleri
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="border-l-4 border-blue-500 pl-4">
                <h4 className="font-semibold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                  Google Analytics
                  <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800">
                    <ExternalLink className="h-4 w-4" />
                  </a>
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
                  Web site trafiğini analiz etmek ve kullanıcı davranışlarını anlamak için kullanılır.
                  Bu çerezler yalnızca analitik çerezleri kabul ettiğinizde aktif olur.
                </p>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  Çerezler: _ga, _gid, _gat_gtag_*
                </div>
              </div>

              <div className="border-l-4 border-green-500 pl-4">
                <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Harita Hizmetleri (Mapbox)</h4>
                <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
                  Proje konumlarını göstermek için kullandığımız harita hizmeti çerezleri.
                  Bu çerezler zorunlu olarak sınıflandırılmıştır.
                </p>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  Çerezler: mapbox_*, __MAPBOX_TRAFFIC_*
                </div>
              </div>

              <div className="border-l-4 border-purple-500 pl-4">
                <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Sosyal Medya Widget'ları</h4>
                <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
                  Sosyal medya paylaşım butonları ve içerik gösterimi için kullanılan çerezler.
                  Bu çerezler pazarlama çerezleri olarak sınıflandırılmıştır.
                </p>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  Sağlayıcılar: YouTube, LinkedIn, Twitter
                </div>
              </div>
            </div>

            <div className="bg-yellow-50 dark:bg-yellow-900/10 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
              <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Önemli Not</h4>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Üçüncü taraf çerezleri, ilgili hizmet sağlayıcıların kendi gizlilik politikalarına tabidir.
                Bu çerezlerin nasıl kullanıldığı hakkında daha fazla bilgi için ilgili şirketlerin
                gizlilik politikalarını incelemenizi öneririz.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Çerez Yönetimi */}
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl flex items-center gap-3">
              <div className="p-2 bg-indigo-100 dark:bg-indigo-900/20 rounded-lg">
                <Settings className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
              </div>
              Çerez Tercihlerinizi Nasıl Yönetebilirsiniz?
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h4 className="font-semibold text-gray-900 dark:text-white">Site Üzerinden Yönetim</h4>
                <div className="space-y-3">
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    Çerez tercihlerinizi web sitemiz üzerinden kolayca yönetebilirsiniz:
                  </p>
                  <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
                    <li>• Footer'daki "Çerez Ayarları" linkini tıklayın</li>
                    <li>• Çerez banner'ındaki "Ayarlar" butonunu kullanın</li>
                    <li>• İstediğiniz kategorileri açıp kapatın</li>
                    <li>• Tercihlerinizi kaydedin</li>
                  </ul>
                  <Button
                    className="mt-3"
                    onClick={() => setCookieModalOpen(true)}
                  >
                    <Settings className="h-4 w-4 mr-2" />
                    Çerez Ayarlarını Aç
                  </Button>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="font-semibold text-gray-900 dark:text-white">Tarayıcı Ayarları</h4>
                <div className="space-y-3">
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    Tarayıcınızın ayarlarından çerezleri yönetebilirsiniz:
                  </p>
                  <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
                    <li>• <strong>Chrome:</strong> Ayarlar &gt; Gizlilik ve güvenlik &gt; Çerezler</li>
                    <li>• <strong>Firefox:</strong> Tercihler &gt; Gizlilik ve Güvenlik</li>
                    <li>• <strong>Safari:</strong> Tercihler &gt; Gizlilik &gt; Çerezler</li>
                    <li>• <strong>Edge:</strong> Ayarlar &gt; Çerezler ve site izinleri</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800 rounded-lg p-4">
              <h4 className="font-semibold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                <XCircle className="h-4 w-4 text-red-600" />
                Önemli Uyarı
              </h4>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Zorunlu çerezleri devre dışı bırakırsanız veya tüm çerezleri engellerseniz,
                web sitemizin bazı özellikleri düzgün çalışmayabilir. Bu durumda site
                işlevselliğinde sorunlar yaşayabilirsiniz.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* İletişim ve Güncellemeler */}
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">İletişim ve Güncellemeler</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Sorularınız İçin</h4>
                <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
                  Çerez politikamız hakkında sorularınız varsa bizimle iletişime geçebilirsiniz:
                </p>
                <div className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
                  <p><strong>E-posta:</strong> info@enerjios.com</p>
                </div>
              </div>

              <div>
                <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Politika Güncellemeleri</h4>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Bu çerez politikası düzenli olarak gözden geçirilir ve gerektiğinde güncellenir.
                  Önemli değişiklikler web sitemiz üzerinden duyurulur ve güncel tarih bu sayfada belirtilir.
                </p>
              </div>
            </div>

            <Separator />

            <div className="text-center space-y-4">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Bu çerez politikası {lastUpdated} tarihinde güncellenmiştir.
              </p>
              <div className="flex justify-center gap-4 flex-wrap">
                <Link href="/kvkk">
                  <Button variant="outline" size="sm">KVKK Aydınlatma Metni</Button>
                </Link>
                <Link href="/gizlilik-politikasi">
                  <Button variant="outline" size="sm">Gizlilik Politikası</Button>
                </Link>
                <Link href="/kvkk-basvuru">
                  <Button variant="outline" size="sm">KVKK Başvuru</Button>
                </Link>
                <Button
                  size="sm"
                  className="bg-orange-600 hover:bg-orange-700"
                  onClick={() => setCookieModalOpen(true)}
                >
                  <Settings className="h-4 w-4 mr-2" />
                  Çerez Ayarları
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <CookieSettingsModal
        open={cookieModalOpen}
        onOpenChange={setCookieModalOpen}
      />
    </div>
  )
}