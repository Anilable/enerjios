import { requireAuth } from '@/lib/auth-utils'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { 
  Shield, 
  Key, 
  Lock, 
  Activity,
  AlertTriangle,
  Eye,
  Settings,
  Clock,
  Globe,
  Smartphone,
  Monitor
} from 'lucide-react'

const securityLogs = [
  {
    id: '1',
    action: 'Başarılı giriş',
    user: 'admin@trakyasolar.com',
    ip: '192.168.1.100',
    device: 'Chrome on Windows',
    time: '2024-01-15 14:30:22',
    status: 'success'
  },
  {
    id: '2',
    action: 'Şifre değişikliği',
    user: 'mehmet@trakyasolar.com',
    ip: '192.168.1.105',
    device: 'Firefox on macOS',
    time: '2024-01-15 13:45:10',
    status: 'success'
  },
  {
    id: '3',
    action: 'Başarısız giriş denemesi',
    user: 'unknown@example.com',
    ip: '185.123.45.67',
    device: 'Chrome on Linux',
    time: '2024-01-15 12:15:33',
    status: 'warning'
  },
  {
    id: '4',
    action: '2FA devre dışı bırakıldı',
    user: 'ali@trakyasolar.com',
    ip: '192.168.1.110',
    device: 'Safari on iOS',
    time: '2024-01-15 11:20:44',
    status: 'warning'
  }
]

export default async function SecurityPage() {
  const user = await requireAuth()

  return (
    <DashboardLayout title="Güvenlik Ayarları">
      <div className="space-y-6">
        {/* Security Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-green-600" />
                <div>
                  <p className="text-2xl font-bold">98%</p>
                  <p className="text-sm text-muted-foreground">Güvenlik Skoru</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-2">
                <Activity className="w-5 h-5 text-blue-600" />
                <div>
                  <p className="text-2xl font-bold">156</p>
                  <p className="text-sm text-muted-foreground">Bu Ay Giriş</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-orange-600" />
                <div>
                  <p className="text-2xl font-bold">3</p>
                  <p className="text-sm text-muted-foreground">Güvenlik Uyarısı</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-2">
                <Eye className="w-5 h-5 text-purple-600" />
                <div>
                  <p className="text-2xl font-bold">24</p>
                  <p className="text-sm text-muted-foreground">Aktif Oturum</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Authentication Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Key className="w-5 h-5" />
              Kimlik Doğrulama Ayarları
            </CardTitle>
            <CardDescription>
              Giriş güvenliği ve kimlik doğrulama seçenekleri
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="two-factor" className="text-base font-medium">
                      İki Faktörlü Kimlik Doğrulama (2FA)
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Hesap güvenliği için ek doğrulama katmanı
                    </p>
                  </div>
                  <Switch id="two-factor" defaultChecked />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="password-policy" className="text-base font-medium">
                      Güçlü Şifre Politikası
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Minimum 8 karakter, büyük-küçük harf ve sayı
                    </p>
                  </div>
                  <Switch id="password-policy" defaultChecked />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="session-timeout" className="text-base font-medium">
                      Otomatik Oturum Kapatma
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      30 dakika inaktivite sonrası
                    </p>
                  </div>
                  <Switch id="session-timeout" defaultChecked />
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="login-notification" className="text-base font-medium">
                      Giriş Bildirimleri
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Yeni giriş yapıldığında email gönder
                    </p>
                  </div>
                  <Switch id="login-notification" defaultChecked />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="ip-whitelist" className="text-base font-medium">
                      IP Kısıtlaması
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Sadece belirlenen IP'lerden erişim
                    </p>
                  </div>
                  <Switch id="ip-whitelist" />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="device-tracking" className="text-base font-medium">
                      Cihaz İzleme
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Yeni cihazlardan giriş onayı iste
                    </p>
                  </div>
                  <Switch id="device-tracking" defaultChecked />
                </div>
              </div>
            </div>
            
            <div className="pt-4 border-t">
              <div className="flex gap-4">
                <Button>Ayarları Kaydet</Button>
                <Button variant="outline">Test Et</Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Password Policy */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lock className="w-5 h-5" />
              Şifre Politikası
            </CardTitle>
            <CardDescription>
              Organizasyon geneli şifre kuralları
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="min-length">Minimum Uzunluk</Label>
                  <Input id="min-length" type="number" defaultValue="8" className="mt-1" />
                </div>
                
                <div>
                  <Label htmlFor="password-expiry">Şifre Geçerlilik Süresi (gün)</Label>
                  <Input id="password-expiry" type="number" defaultValue="90" className="mt-1" />
                </div>
                
                <div>
                  <Label htmlFor="login-attempts">Maksimum Giriş Denemesi</Label>
                  <Input id="login-attempts" type="number" defaultValue="5" className="mt-1" />
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Şifre Gereksinimleri</Label>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <input type="checkbox" id="uppercase" defaultChecked className="rounded" />
                      <Label htmlFor="uppercase" className="text-sm">Büyük harf zorunlu</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input type="checkbox" id="lowercase" defaultChecked className="rounded" />
                      <Label htmlFor="lowercase" className="text-sm">Küçük harf zorunlu</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input type="checkbox" id="numbers" defaultChecked className="rounded" />
                      <Label htmlFor="numbers" className="text-sm">Sayı zorunlu</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input type="checkbox" id="special" className="rounded" />
                      <Label htmlFor="special" className="text-sm">Özel karakter zorunlu</Label>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="pt-4 border-t">
              <Button>Politikayı Güncelle</Button>
            </div>
          </CardContent>
        </Card>

        {/* Security Logs */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="w-5 h-5" />
              Güvenlik Logları
            </CardTitle>
            <CardDescription>
              Son güvenlik olayları ve giriş kayıtları
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4">Olay</th>
                    <th className="text-left py-3 px-4">Kullanıcı</th>
                    <th className="text-left py-3 px-4">IP Adresi</th>
                    <th className="text-left py-3 px-4">Cihaz</th>
                    <th className="text-left py-3 px-4">Zaman</th>
                    <th className="text-left py-3 px-4">Durum</th>
                  </tr>
                </thead>
                <tbody>
                  {securityLogs.map((log) => (
                    <tr key={log.id} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4 font-medium">{log.action}</td>
                      <td className="py-3 px-4 text-sm">{log.user}</td>
                      <td className="py-3 px-4 text-sm font-mono">{log.ip}</td>
                      <td className="py-3 px-4 text-sm">{log.device}</td>
                      <td className="py-3 px-4 text-sm">{log.time}</td>
                      <td className="py-3 px-4">
                        <Badge 
                          variant={log.status === 'success' ? 'default' : 'secondary'}
                          className={
                            log.status === 'success' ? 'bg-green-100 text-green-800' : 
                            'bg-orange-100 text-orange-800'
                          }
                        >
                          {log.status === 'success' ? 'Başarılı' : 'Uyarı'}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            <div className="flex justify-between items-center pt-4 border-t">
              <Button variant="outline">Tüm Logları Görüntüle</Button>
              <Button variant="outline">Dışa Aktar</Button>
            </div>
          </CardContent>
        </Card>

        {/* Active Sessions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Monitor className="w-5 h-5" />
              Aktif Oturumlar
            </CardTitle>
            <CardDescription>
              Şu anda sistemde aktif olan kullanıcı oturumları
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  <Monitor className="w-5 h-5 text-blue-600" />
                  <div>
                    <p className="font-medium">Chrome on Windows</p>
                    <p className="text-sm text-muted-foreground">192.168.1.100 • İstanbul, Türkiye</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className="bg-green-100 text-green-800">Bu Cihaz</Badge>
                  <Button variant="outline" size="sm" disabled>Sonlandır</Button>
                </div>
              </div>
              
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  <Smartphone className="w-5 h-5 text-green-600" />
                  <div>
                    <p className="font-medium">Safari on iOS</p>
                    <p className="text-sm text-muted-foreground">192.168.1.105 • Ankara, Türkiye</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">Mobil</Badge>
                  <Button variant="outline" size="sm">Sonlandır</Button>
                </div>
              </div>
              
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  <Globe className="w-5 h-5 text-orange-600" />
                  <div>
                    <p className="font-medium">Firefox on macOS</p>
                    <p className="text-sm text-muted-foreground">185.123.45.67 • İzmir, Türkiye</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className="bg-orange-100 text-orange-800">Uzak Konum</Badge>
                  <Button variant="outline" size="sm">Sonlandır</Button>
                </div>
              </div>
            </div>
            
            <div className="pt-4 border-t">
              <Button variant="destructive">Tüm Diğer Oturumları Sonlandır</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}