import { requireAuth } from '@/lib/auth-utils'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Separator } from '@/components/ui/separator'
import { 
  User, 
  Bell, 
  Shield, 
  Palette, 
  Globe,
  Mail,
  Phone,
  MapPin,
  Building
} from 'lucide-react'

export default async function SettingsPage() {
  const user = await requireAuth()

  return (
    <DashboardLayout title="Ayarlar">
      <div className="space-y-6">
        {/* Profile Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5" />
              Profil Bilgileri
            </CardTitle>
            <CardDescription>
              Kişisel bilgilerinizi güncelleyin
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">Ad</Label>
                <Input id="firstName" defaultValue={user.name?.split(' ')[0] || ''} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Soyad</Label>
                <Input id="lastName" defaultValue={user.name?.split(' ')[1] || ''} />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="email">E-posta</Label>
              <Input id="email" type="email" defaultValue={user.email || ''} />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="phone">Telefon</Label>
                <Input id="phone" type="tel" placeholder="+90 555 123 45 67" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="company">Şirket</Label>
                <Input id="company" placeholder="Şirket adı" />
              </div>
            </div>

            <Button>Profili Güncelle</Button>
          </CardContent>
        </Card>

        {/* Notifications */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="w-5 h-5" />
              Bildirimler
            </CardTitle>
            <CardDescription>
              Bildirim tercihlerinizi yönetin
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>E-posta Bildirimleri</Label>
                <p className="text-sm text-muted-foreground">
                  Önemli güncellemeler için e-posta alın
                </p>
              </div>
              <Switch defaultChecked />
            </div>
            
            <Separator />
            
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Proje Güncellemeleri</Label>
                <p className="text-sm text-muted-foreground">
                  Proje durumu değişikliklerinde bildirim alın
                </p>
              </div>
              <Switch defaultChecked />
            </div>
            
            <Separator />
            
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Ödeme Bildirimleri</Label>
                <p className="text-sm text-muted-foreground">
                  Ödeme ve fatura bildirimlerini alın
                </p>
              </div>
              <Switch />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Hava Durumu Uyarıları</Label>
                <p className="text-sm text-muted-foreground">
                  Solar sistem performansını etkileyecek hava koşulları
                </p>
              </div>
              <Switch defaultChecked />
            </div>
          </CardContent>
        </Card>

        {/* Security Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5" />
              Güvenlik
            </CardTitle>
            <CardDescription>
              Hesap güvenliği ayarları
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="currentPassword">Mevcut Şifre</Label>
              <Input id="currentPassword" type="password" />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="newPassword">Yeni Şifre</Label>
              <Input id="newPassword" type="password" />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Yeni Şifre (Tekrar)</Label>
              <Input id="confirmPassword" type="password" />
            </div>
            
            <Button>Şifreyi Değiştir</Button>
            
            <Separator />
            
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>İki Faktörlü Kimlik Doğrulama</Label>
                <p className="text-sm text-muted-foreground">
                  Hesabınızın güvenliği için ek koruma katmanı
                </p>
              </div>
              <Switch />
            </div>
          </CardContent>
        </Card>

        {/* System Preferences */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Palette className="w-5 h-5" />
              Sistem Tercihleri
            </CardTitle>
            <CardDescription>
              Uygulama görünümü ve davranışı
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Koyu Tema</Label>
                <p className="text-sm text-muted-foreground">
                  Arayüzü koyu renklerle görüntüleyin
                </p>
              </div>
              <Switch />
            </div>
            
            <Separator />
            
            <div className="space-y-2">
              <Label htmlFor="language">Dil</Label>
              <select id="language" className="w-full px-3 py-2 border border-gray-300 rounded-md">
                <option value="tr">Türkçe</option>
                <option value="en">English</option>
              </select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="timezone">Zaman Dilimi</Label>
              <select id="timezone" className="w-full px-3 py-2 border border-gray-300 rounded-md">
                <option value="Europe/Istanbul">Istanbul (GMT+3)</option>
                <option value="UTC">UTC (GMT+0)</option>
              </select>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}