'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  PermissionGuard,
  RoleGuard,
  PricingGuard,
  FinancialDataGuard,
  usePermissions
} from '@/components/ui/permission-guard'
import {
  Shield,
  DollarSign,
  Settings,
  Users,
  FileText,
  Zap,
  CheckCircle,
  XCircle
} from 'lucide-react'

export function PermissionTest() {
  const { userRole, hasPermission, permissionManager } = usePermissions()

  if (!userRole) {
    return (
      <Card>
        <CardContent className="p-6">
          <Alert>
            <Shield className="h-4 w-4" />
            <AlertDescription>
              Bu testi görmek için giriş yapmalısınız.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    )
  }

  const permissions = [
    { name: 'finance:read', label: 'Finansal Veri Okuma' },
    { name: 'quotes:read', label: 'Teklif Okuma' },
    { name: 'products:manage_pricing', label: 'Ürün Fiyat Yönetimi' },
    { name: 'installations:read', label: 'Kurulum Okuma' },
    { name: 'projects:read', label: 'Proje Okuma' },
    { name: 'customers:read', label: 'Müşteri Okuma' },
    { name: 'system:settings', label: 'Sistem Ayarları' },
    { name: 'users:manage_roles', label: 'Rol Yönetimi' }
  ]

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Rol Tabanlı Erişim Kontrolü Test Paneli
          </CardTitle>
          <CardDescription>
            Mevcut kullanıcı rolünüz: <Badge variant="outline">{userRole}</Badge>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {permissions.map((permission) => {
              const hasAccess = hasPermission(permission.name as any)
              return (
                <div
                  key={permission.name}
                  className={`p-3 border rounded-lg flex items-center justify-between ${
                    hasAccess ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
                  }`}
                >
                  <span className="text-sm font-medium">{permission.label}</span>
                  {hasAccess ? (
                    <CheckCircle className="w-4 h-4 text-green-600" />
                  ) : (
                    <XCircle className="w-4 h-4 text-red-600" />
                  )}
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Pricing Guard Test */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="w-5 h-5" />
              Fiyat Bilgisi Testi
            </CardTitle>
          </CardHeader>
          <CardContent>
            <PricingGuard
              fallback={
                <Alert>
                  <Shield className="h-4 w-4" />
                  <AlertDescription>
                    Fiyat bilgileri gizlenmiştir. Bu veri Installation Team rolü için erişilebilir değildir.
                  </AlertDescription>
                </Alert>
              }
            >
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="text-2xl font-bold text-green-600 mb-2">₺125,000</div>
                <div className="text-sm text-green-800">Bu fiyat bilgisi sadece yetkili rollerde görünür.</div>
              </div>
            </PricingGuard>
          </CardContent>
        </Card>

        {/* Financial Data Guard Test */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Finansal Analiz Testi
            </CardTitle>
          </CardHeader>
          <CardContent>
            <FinancialDataGuard
              fallback={
                <Alert>
                  <Shield className="h-4 w-4" />
                  <AlertDescription>
                    Finansal analiz verileri gizlenmiştir. Bu veriler Installation Team rolü için erişilebilir değildir.
                  </AlertDescription>
                </Alert>
              }
            >
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span>ROI:</span>
                  <span className="font-bold">%12.5</span>
                </div>
                <div className="flex justify-between">
                  <span>NPV:</span>
                  <span className="font-bold">₺850,000</span>
                </div>
                <div className="text-xs text-gray-600">Bu finansal veriler sadece yetkili rollerde görünür.</div>
              </div>
            </FinancialDataGuard>
          </CardContent>
        </Card>

        {/* Admin Only Test */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="w-5 h-5" />
              Admin Yetkisi Testi
            </CardTitle>
          </CardHeader>
          <CardContent>
            <RoleGuard
              allowedRoles={['ADMIN']}
              fallback={
                <Alert>
                  <Shield className="h-4 w-4" />
                  <AlertDescription>
                    Bu alan sadece Admin kullanıcıları için erişilebilir.
                  </AlertDescription>
                </Alert>
              }
            >
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="font-bold text-blue-600 mb-2">Admin Panel</div>
                <div className="text-sm text-blue-800">Bu alan sadece Admin rolündeki kullanıcılar tarafından görülebilir.</div>
                <Button className="mt-3" size="sm">
                  Sistem Ayarları
                </Button>
              </div>
            </RoleGuard>
          </CardContent>
        </Card>

        {/* Installation Team Specific Test */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="w-5 h-5" />
              Kurulum Ekibi Testi
            </CardTitle>
          </CardHeader>
          <CardContent>
            <RoleGuard
              allowedRoles={['INSTALLATION_TEAM', 'ADMIN']}
              fallback={
                <Alert>
                  <Shield className="h-4 w-4" />
                  <AlertDescription>
                    Bu alan sadece Kurulum Ekibi ve Admin kullanıcıları için erişilebilir.
                  </AlertDescription>
                </Alert>
              }
            >
              <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
                <div className="font-bold text-orange-600 mb-2">Kurulum Bilgileri</div>
                <div className="text-sm text-orange-800 space-y-1">
                  <p>• Proje: Solar GES Kurulumu</p>
                  <p>• Konum: İstanbul, Beşiktaş</p>
                  <p>• Planlanan Tarih: 25 Mart 2024</p>
                  <p>• Ekip Lideri: Ahmet Yılmaz</p>
                </div>
              </div>
            </RoleGuard>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Test Sonuçları</CardTitle>
          <CardDescription>
            Bu test paneli, rol tabanlı erişim kontrollerinin doğru çalışıp çalışmadığını gösterir.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm">
            <p><strong>Mevcut Rol:</strong> {userRole}</p>
            <p><strong>Finansal Veri Erişimi:</strong> {hasPermission('finance:read') ? '✅ Var' : '❌ Yok'}</p>
            <p><strong>Fiyat Yönetimi:</strong> {hasPermission('products:manage_pricing') ? '✅ Var' : '❌ Yok'}</p>
            <p><strong>Kurulum Erişimi:</strong> {hasPermission('installations:read') ? '✅ Var' : '❌ Yok'}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}