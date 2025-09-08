'use client'

import { useState } from 'react'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Separator } from '@/components/ui/separator'
import { 
  Settings, 
  User,
  Bell,
  Shield,
  Zap,
  Eye,
  EyeOff,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Save,
  Download,
  Trash2,
  AlertTriangle,
  CheckCircle,
  Clock,
  Globe,
  Palette,
  Database,
  Key,
  Smartphone,
  CreditCard
} from 'lucide-react'

interface UserProfile {
  name: string
  email: string
  phone: string
  address: string
  city: string
  postalCode: string
  dateOfBirth: string
  profession: string
}

interface NotificationSettings {
  emailNotifications: boolean
  smsNotifications: boolean
  pushNotifications: boolean
  systemUpdates: boolean
  maintenanceAlerts: boolean
  performanceReports: boolean
  billingReminders: boolean
  marketingEmails: boolean
}

interface SystemPreferences {
  language: string
  timezone: string
  currency: string
  theme: string
  dateFormat: string
  energyUnit: string
}

export default function SettingsPage() {
  const [selectedTab, setSelectedTab] = useState('profile')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const [profile, setProfile] = useState<UserProfile>({
    name: 'Mehmet Yılmaz',
    email: 'mehmet.yilmaz@email.com',
    phone: '+90 555 123 4567',
    address: 'Bahçelievler Mah. Solar Sk. No:15',
    city: 'İstanbul',
    postalCode: '34180',
    dateOfBirth: '1985-03-15',
    profession: 'Mühendis'
  })

  const [notifications, setNotifications] = useState<NotificationSettings>({
    emailNotifications: true,
    smsNotifications: true,
    pushNotifications: false,
    systemUpdates: true,
    maintenanceAlerts: true,
    performanceReports: true,
    billingReminders: true,
    marketingEmails: false
  })

  const [preferences, setPreferences] = useState<SystemPreferences>({
    language: 'tr',
    timezone: 'Europe/Istanbul',
    currency: 'TRY',
    theme: 'light',
    dateFormat: 'DD/MM/YYYY',
    energyUnit: 'kWh'
  })

  const handleSave = async () => {
    setIsLoading(true)
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))
    setIsLoading(false)
  }

  const handleProfileUpdate = (field: keyof UserProfile, value: string) => {
    setProfile(prev => ({ ...prev, [field]: value }))
  }

  const handleNotificationUpdate = (field: keyof NotificationSettings, value: boolean) => {
    setNotifications(prev => ({ ...prev, [field]: value }))
  }

  const handlePreferenceUpdate = (field: keyof SystemPreferences, value: string) => {
    setPreferences(prev => ({ ...prev, [field]: value }))
  }

  return (
    <DashboardLayout title="Ayarlar">
      {/* Page Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <p className="text-gray-600">Hesap ayarlarınızı ve tercihlerinizi yönetin</p>
        </div>
        <Button 
          onClick={handleSave} 
          disabled={isLoading}
          className="bg-primary hover:bg-primary/90"
        >
          {isLoading ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
              Kaydediliyor...
            </>
          ) : (
            <>
              <Save className="w-4 h-4 mr-2" />
              Değişiklikleri Kaydet
            </>
          )}
        </Button>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3">
          <Card>
            <CardContent className="p-6">
              <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-6">
                <TabsList className="grid grid-cols-5 w-full">
                  <TabsTrigger value="profile">Profil</TabsTrigger>
                  <TabsTrigger value="notifications">Bildirimler</TabsTrigger>
                  <TabsTrigger value="preferences">Tercihler</TabsTrigger>
                  <TabsTrigger value="security">Güvenlik</TabsTrigger>
                  <TabsTrigger value="data">Veri Yönetimi</TabsTrigger>
                </TabsList>

                {/* Profile Tab */}
                <TabsContent value="profile" className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-2">
                        <User className="w-5 h-5" />
                        <span>Kişisel Bilgiler</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <Label htmlFor="name">Ad Soyad</Label>
                          <Input
                            id="name"
                            value={profile.name}
                            onChange={(e) => handleProfileUpdate('name', e.target.value)}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="profession">Meslek</Label>
                          <Input
                            id="profession"
                            value={profile.profession}
                            onChange={(e) => handleProfileUpdate('profession', e.target.value)}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="email">E-posta</Label>
                          <div className="relative">
                            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                            <Input
                              id="email"
                              type="email"
                              value={profile.email}
                              onChange={(e) => handleProfileUpdate('email', e.target.value)}
                              className="pl-10"
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="phone">Telefon</Label>
                          <div className="relative">
                            <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                            <Input
                              id="phone"
                              value={profile.phone}
                              onChange={(e) => handleProfileUpdate('phone', e.target.value)}
                              className="pl-10"
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="dateOfBirth">Doğum Tarihi</Label>
                          <div className="relative">
                            <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                            <Input
                              id="dateOfBirth"
                              type="date"
                              value={profile.dateOfBirth}
                              onChange={(e) => handleProfileUpdate('dateOfBirth', e.target.value)}
                              className="pl-10"
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="city">Şehir</Label>
                          <Select value={profile.city} onValueChange={(value) => handleProfileUpdate('city', value)}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="İstanbul">İstanbul</SelectItem>
                              <SelectItem value="Ankara">Ankara</SelectItem>
                              <SelectItem value="İzmir">İzmir</SelectItem>
                              <SelectItem value="Edirne">Edirne</SelectItem>
                              <SelectItem value="Tekirdağ">Tekirdağ</SelectItem>
                              <SelectItem value="Kırklareli">Kırklareli</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="address">Adres</Label>
                        <div className="relative">
                          <MapPin className="absolute left-3 top-3 text-gray-400 w-4 h-4" />
                          <Input
                            id="address"
                            value={profile.address}
                            onChange={(e) => handleProfileUpdate('address', e.target.value)}
                            className="pl-10"
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Notifications Tab */}
                <TabsContent value="notifications" className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-2">
                        <Bell className="w-5 h-5" />
                        <span>Bildirim Tercihleri</span>
                      </CardTitle>
                      <CardDescription>
                        Hangi bildirimler ve nasıl almak istediğinizi seçin
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div className="space-y-1">
                            <p className="font-medium">E-posta Bildirimleri</p>
                            <p className="text-sm text-gray-600">Önemli güncellemeler e-posta ile gönderilsin</p>
                          </div>
                          <Switch
                            checked={notifications.emailNotifications}
                            onCheckedChange={(checked) => handleNotificationUpdate('emailNotifications', checked)}
                          />
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="space-y-1">
                            <p className="font-medium">SMS Bildirimleri</p>
                            <p className="text-sm text-gray-600">Acil durumlar için SMS gönderilsin</p>
                          </div>
                          <Switch
                            checked={notifications.smsNotifications}
                            onCheckedChange={(checked) => handleNotificationUpdate('smsNotifications', checked)}
                          />
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="space-y-1">
                            <p className="font-medium">Mobil Bildirimler</p>
                            <p className="text-sm text-gray-600">Uygulama bildirimleri</p>
                          </div>
                          <Switch
                            checked={notifications.pushNotifications}
                            onCheckedChange={(checked) => handleNotificationUpdate('pushNotifications', checked)}
                          />
                        </div>

                        <Separator />

                        <h4 className="font-medium text-gray-900">Bildirim Kategorileri</h4>

                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <div className="space-y-1">
                              <p className="font-medium">Sistem Güncellemeleri</p>
                              <p className="text-sm text-gray-600">Platform güncellemeleri ve yenilikler</p>
                            </div>
                            <Switch
                              checked={notifications.systemUpdates}
                              onCheckedChange={(checked) => handleNotificationUpdate('systemUpdates', checked)}
                            />
                          </div>

                          <div className="flex items-center justify-between">
                            <div className="space-y-1">
                              <p className="font-medium">Bakım Uyarıları</p>
                              <p className="text-sm text-gray-600">Sistem bakım gerektirdiğinde bildirim</p>
                            </div>
                            <Switch
                              checked={notifications.maintenanceAlerts}
                              onCheckedChange={(checked) => handleNotificationUpdate('maintenanceAlerts', checked)}
                            />
                          </div>

                          <div className="flex items-center justify-between">
                            <div className="space-y-1">
                              <p className="font-medium">Performans Raporları</p>
                              <p className="text-sm text-gray-600">Aylık sistem performans raporları</p>
                            </div>
                            <Switch
                              checked={notifications.performanceReports}
                              onCheckedChange={(checked) => handleNotificationUpdate('performanceReports', checked)}
                            />
                          </div>

                          <div className="flex items-center justify-between">
                            <div className="space-y-1">
                              <p className="font-medium">Faturalama Hatırlatıcıları</p>
                              <p className="text-sm text-gray-600">Ödeme tarihleri yaklaştığında hatırlatma</p>
                            </div>
                            <Switch
                              checked={notifications.billingReminders}
                              onCheckedChange={(checked) => handleNotificationUpdate('billingReminders', checked)}
                            />
                          </div>

                          <div className="flex items-center justify-between">
                            <div className="space-y-1">
                              <p className="font-medium">Pazarlama E-postaları</p>
                              <p className="text-sm text-gray-600">Promosyonlar ve özel teklifler</p>
                            </div>
                            <Switch
                              checked={notifications.marketingEmails}
                              onCheckedChange={(checked) => handleNotificationUpdate('marketingEmails', checked)}
                            />
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Preferences Tab */}
                <TabsContent value="preferences" className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-2">
                        <Palette className="w-5 h-5" />
                        <span>Görünüm ve Tercihler</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <Label htmlFor="language">Dil</Label>
                          <Select value={preferences.language} onValueChange={(value) => handlePreferenceUpdate('language', value)}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="tr">🇹🇷 Türkçe</SelectItem>
                              <SelectItem value="en">🇺🇸 English</SelectItem>
                              <SelectItem value="de">🇩🇪 Deutsch</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="timezone">Saat Dilimi</Label>
                          <Select value={preferences.timezone} onValueChange={(value) => handlePreferenceUpdate('timezone', value)}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Europe/Istanbul">İstanbul (UTC+3)</SelectItem>
                              <SelectItem value="Europe/London">London (UTC+0)</SelectItem>
                              <SelectItem value="Europe/Berlin">Berlin (UTC+1)</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="currency">Para Birimi</Label>
                          <Select value={preferences.currency} onValueChange={(value) => handlePreferenceUpdate('currency', value)}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="TRY">₺ Türk Lirası</SelectItem>
                              <SelectItem value="USD">$ US Dollar</SelectItem>
                              <SelectItem value="EUR">€ Euro</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="theme">Tema</Label>
                          <Select value={preferences.theme} onValueChange={(value) => handlePreferenceUpdate('theme', value)}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="light">Açık Tema</SelectItem>
                              <SelectItem value="dark">Koyu Tema</SelectItem>
                              <SelectItem value="auto">Sistem Ayarı</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="dateFormat">Tarih Formatı</Label>
                          <Select value={preferences.dateFormat} onValueChange={(value) => handlePreferenceUpdate('dateFormat', value)}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="DD/MM/YYYY">DD/MM/YYYY</SelectItem>
                              <SelectItem value="MM/DD/YYYY">MM/DD/YYYY</SelectItem>
                              <SelectItem value="YYYY-MM-DD">YYYY-MM-DD</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="energyUnit">Enerji Birimi</Label>
                          <Select value={preferences.energyUnit} onValueChange={(value) => handlePreferenceUpdate('energyUnit', value)}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="kWh">kWh (Kilowatt Saat)</SelectItem>
                              <SelectItem value="MWh">MWh (Megawatt Saat)</SelectItem>
                              <SelectItem value="Wh">Wh (Watt Saat)</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Security Tab */}
                <TabsContent value="security" className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-2">
                        <Shield className="w-5 h-5" />
                        <span>Güvenlik Ayarları</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="space-y-4">
                        <div className="p-4 border rounded-lg">
                          <h4 className="font-medium mb-2">Şifre Değiştir</h4>
                          <div className="space-y-3">
                            <div className="space-y-2">
                              <Label htmlFor="currentPassword">Mevcut Şifre</Label>
                              <div className="relative">
                                <Input
                                  id="currentPassword"
                                  type={showPassword ? "text" : "password"}
                                  className="pr-10"
                                />
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="absolute right-0 top-0 h-full px-3"
                                  onClick={() => setShowPassword(!showPassword)}
                                >
                                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </Button>
                              </div>
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="newPassword">Yeni Şifre</Label>
                              <Input
                                id="newPassword"
                                type="password"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="confirmPassword">Yeni Şifre Tekrar</Label>
                              <Input
                                id="confirmPassword"
                                type="password"
                              />
                            </div>
                            <Button className="w-full">
                              <Key className="w-4 h-4 mr-2" />
                              Şifreyi Güncelle
                            </Button>
                          </div>
                        </div>

                        <div className="p-4 border rounded-lg">
                          <h4 className="font-medium mb-2">İki Faktörlü Doğrulama</h4>
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm text-gray-600">Hesabınızı ekstra güvenlik katmanı ile koruyun</p>
                              <Badge className="bg-green-100 text-green-800 mt-2">
                                <CheckCircle className="w-3 h-3 mr-1" />
                                Aktif
                              </Badge>
                            </div>
                            <Button variant="outline">
                              <Smartphone className="w-4 h-4 mr-2" />
                              Yönet
                            </Button>
                          </div>
                        </div>

                        <div className="p-4 border rounded-lg">
                          <h4 className="font-medium mb-2">Güvenlik Günlüğü</h4>
                          <div className="space-y-2 text-sm">
                            <div className="flex items-center space-x-2">
                              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                              <span>Başarılı giriş - 2 saat önce (Chrome, İstanbul)</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                              <span>Şifre değiştirildi - 1 hafta önce</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                              <span>Başarılı giriş - 1 hafta önce (Safari, İstanbul)</span>
                            </div>
                          </div>
                          <Button variant="outline" className="w-full mt-3" size="sm">
                            Tüm Aktiviteyi Görüntüle
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Data Management Tab */}
                <TabsContent value="data" className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-2">
                        <Database className="w-5 h-5" />
                        <span>Veri Yönetimi</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="space-y-4">
                        <div className="p-4 border rounded-lg">
                          <h4 className="font-medium mb-2">Veri Dışa Aktarımı</h4>
                          <p className="text-sm text-gray-600 mb-3">
                            Hesap verilerinizi ve sistem performans verilerinizi dışa aktarın
                          </p>
                          <div className="flex space-x-2">
                            <Button variant="outline" className="flex-1">
                              <Download className="w-4 h-4 mr-2" />
                              Hesap Verilerini İndir
                            </Button>
                            <Button variant="outline" className="flex-1">
                              <Download className="w-4 h-4 mr-2" />
                              Sistem Verilerini İndir
                            </Button>
                          </div>
                        </div>

                        <div className="p-4 border rounded-lg">
                          <h4 className="font-medium mb-2">Veri Saklama Süresi</h4>
                          <div className="space-y-3">
                            <div className="flex justify-between items-center">
                              <span className="text-sm">Performans Verileri</span>
                              <Badge variant="secondary">5 Yıl</Badge>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-sm">Faturalama Verileri</span>
                              <Badge variant="secondary">7 Yıl</Badge>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-sm">Sistem Günlükleri</span>
                              <Badge variant="secondary">1 Yıl</Badge>
                            </div>
                          </div>
                        </div>

                        <div className="p-4 border border-red-200 rounded-lg bg-red-50">
                          <h4 className="font-medium mb-2 text-red-800">Tehlikeli Bölge</h4>
                          <p className="text-sm text-red-600 mb-3">
                            Bu işlemler geri alınamaz. Lütfen dikkatli olun.
                          </p>
                          <div className="space-y-2">
                            <Button variant="outline" className="w-full border-orange-300 text-orange-600 hover:bg-orange-50">
                              <AlertTriangle className="w-4 h-4 mr-2" />
                              Hesabımı Geçici Olarak Deaktive Et
                            </Button>
                            <Button variant="destructive" className="w-full">
                              <Trash2 className="w-4 h-4 mr-2" />
                              Hesabımı Kalıcı Olarak Sil
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Hesap Durumu</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Hesap Tipi</span>
                <Badge className="bg-blue-100 text-blue-800">Standart</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Üyelik Tarihi</span>
                <span className="text-sm">15.01.2024</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Son Giriş</span>
                <span className="text-sm">2 saat önce</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Profil Tamamlanma</span>
                <span className="text-sm text-green-600">95%</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Güvenlik Durumu</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">İki Faktörlü Doğrulama</span>
                <Badge className="bg-green-100 text-green-800">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  Aktif
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Son Şifre Değişimi</span>
                <span className="text-sm">1 hafta önce</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Güvenlik Skoru</span>
                <Badge className="bg-green-100 text-green-800">Mükemmel</Badge>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Depolama Kullanımı</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Belgeler</span>
                  <span>2.4 GB / 5 GB</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-blue-600 h-2 rounded-full" style={{width: '48%'}}></div>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Performans Verileri</span>
                  <span>1.2 GB / 2 GB</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-green-600 h-2 rounded-full" style={{width: '60%'}}></div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Hızlı Eylemler</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="ghost" className="w-full justify-start text-sm p-2">
                <Download className="w-4 h-4 mr-2" />
                Veri Dışa Aktar
              </Button>
              <Button variant="ghost" className="w-full justify-start text-sm p-2">
                <Key className="w-4 h-4 mr-2" />
                Şifre Değiştir
              </Button>
              <Button variant="ghost" className="w-full justify-start text-sm p-2">
                <CreditCard className="w-4 h-4 mr-2" />
                Faturalama Bilgileri
              </Button>
              <Button variant="ghost" className="w-full justify-start text-sm p-2">
                <Globe className="w-4 h-4 mr-2" />
                Gizlilik Ayarları
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  )
}