/**
 * Installation Team Permissions Documentation Component
 * Shows what Installation Team members can and cannot access
 */

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { CheckCircle, XCircle, Info } from 'lucide-react'

interface PermissionItem {
  name: string
  description: string
  allowed: boolean
  icon?: React.ReactNode
}

const INSTALLATION_TEAM_PERMISSIONS: PermissionItem[] = [
  // Allowed permissions
  {
    name: 'Proje Talepleri Görüntüleme',
    description: 'Müşteri proje taleplerini görüntüleyebilir ve durumunu güncelleyebilir',
    allowed: true,
  },
  {
    name: 'Müşteri İletişim Bilgileri',
    description: 'Müşterilerin adres, telefon ve e-posta bilgilerine erişebilir',
    allowed: true,
  },
  {
    name: 'Teknik Spesifikasyonlar',
    description: 'Proje kapasitesi, konum ve teknik detayları görüntüleyebilir',
    allowed: true,
  },
  {
    name: 'Kurulum Yönetimi',
    description: 'Kurulum durumu, ilerleme ve tamamlama raporları oluşturabilir',
    allowed: true,
  },
  {
    name: 'Fotoğraf Talepleri',
    description: 'Müşterilerden fotoğraf talep edebilir ve yüklemeleri inceleyebilir',
    allowed: true,
  },
  {
    name: 'Raporlama',
    description: 'Kurulum ilerlemesi ve tamamlama raporları oluşturabilir',
    allowed: true,
  },
  {
    name: 'Proje Tasarımcısı (Temel)',
    description: 'Kurulum planlaması için temel tasarım araçlarını kullanabilir',
    allowed: true,
  },

  // Restricted permissions
  {
    name: 'Fiyatlandırma Bilgileri',
    description: 'Müşteri bütçesi, teklif fiyatları ve maliyet analizi görüntüleyemez',
    allowed: false,
  },
  {
    name: 'Finansal Veriler',
    description: 'Gelir, kâr marjları ve finansal raporlara erişemez',
    allowed: false,
  },
  {
    name: 'Teklif Yönetimi',
    description: 'Fiyat teklifleri oluşturamaz veya görüntüleyemez',
    allowed: false,
  },
  {
    name: 'Komisyon Bilgileri',
    description: 'Satış komisyonları ve ödeme detaylarını görüntüleyemez',
    allowed: false,
  },
  {
    name: 'İş Analitiği',
    description: 'Satış analitiği ve iş performans verilerine erişemez',
    allowed: false,
  },
  {
    name: 'Kullanıcı Yönetimi',
    description: 'Diğer kullanıcıları yönetemez veya roller atayamaz',
    allowed: false,
  },
  {
    name: 'Sistem Yönetimi',
    description: 'Sistem ayarları ve admin paneline erişemez',
    allowed: false,
  },
]

export function InstallationTeamPermissions() {
  const allowedPermissions = INSTALLATION_TEAM_PERMISSIONS.filter(p => p.allowed)
  const restrictedPermissions = INSTALLATION_TEAM_PERMISSIONS.filter(p => !p.allowed)

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Allowed Permissions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-green-700">
            <CheckCircle className="h-5 w-5" />
            İzin Verilen Yetkiler
          </CardTitle>
          <CardDescription>
            Kurulum Ekibi üyelerinin erişebildiği özellikler
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {allowedPermissions.map((permission, index) => (
            <div key={index} className="flex items-start gap-3 p-3 bg-green-50 rounded-lg border border-green-200">
              <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <h4 className="font-medium text-green-900 mb-1">{permission.name}</h4>
                <p className="text-sm text-green-700">{permission.description}</p>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Restricted Permissions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-700">
            <XCircle className="h-5 w-5" />
            Kısıtlanan Yetkiler
          </CardTitle>
          <CardDescription>
            Kurulum Ekibi üyelerinin erişemediği özellikler
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {restrictedPermissions.map((permission, index) => (
            <div key={index} className="flex items-start gap-3 p-3 bg-red-50 rounded-lg border border-red-200">
              <XCircle className="h-4 w-4 text-red-600 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <h4 className="font-medium text-red-900 mb-1">{permission.name}</h4>
                <p className="text-sm text-red-700">{permission.description}</p>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Usage Guidelines */}
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-blue-700">
            <Info className="h-5 w-5" />
            Kullanım Rehberi
          </CardTitle>
          <CardDescription>
            Kurulum Ekibi rolü için önemli bilgiler ve kullanım önerileri
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <h4 className="font-medium text-blue-900 mb-2">🎯 Rol Amacı</h4>
              <p className="text-sm text-blue-800">
                Kurulum ekipleri teknik çalışmalara odaklanabilir, finansal bilgiler gizli kalırken
                müşteri iletişimi ve proje takibi yapabilir.
              </p>
            </div>

            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <h4 className="font-medium text-blue-900 mb-2">🔒 Güvenlik</h4>
              <p className="text-sm text-blue-800">
                Fiyatlandırma ve finansal veriler korunur, sadece teknik ve operasyonel
                bilgilere erişim sağlanır.
              </p>
            </div>

            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <h4 className="font-medium text-blue-900 mb-2">📋 Görevler</h4>
              <p className="text-sm text-blue-800">
                Proje takibi, müşteri iletişimi, kurulum planlaması ve teknik dokümantasyon
                yönetimi yapabilir.
              </p>
            </div>

            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <h4 className="font-medium text-blue-900 mb-2">📊 Raporlama</h4>
              <p className="text-sm text-blue-800">
                Kurulum ilerlemesi, tamamlama oranları ve teknik raporlar oluşturabilir,
                finansal analizlere erişemez.
              </p>
            </div>
          </div>

          <div className="mt-6 p-4 bg-amber-50 rounded-lg border border-amber-200">
            <h4 className="font-medium text-amber-900 mb-2 flex items-center gap-2">
              <Info className="h-4 w-4" />
              Önemli Notlar
            </h4>
            <ul className="text-sm text-amber-800 space-y-1">
              <li>• Kurulum Ekibi üyeleri maliyet ve fiyat bilgilerini göremez</li>
              <li>• Müşteri iletişim bilgilerine tam erişim vardır</li>
              <li>• Proje durumunu güncelleyebilir ancak finansal verileri değiştiremez</li>
              <li>• Admin yetkisi olmadan diğer kullanıcıları yönetemez</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}