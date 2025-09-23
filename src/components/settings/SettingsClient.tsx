'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Separator } from '@/components/ui/separator'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from 'sonner'
import { 
  User, 
  Bell, 
  Shield, 
  Palette, 
  Save,
  Loader2
} from 'lucide-react'

interface UserSettings {
  firstName: string
  lastName: string
  email: string
  phone: string
  company: string
  notifications: {
    email: boolean
    projectUpdates: boolean
    payments: boolean
    weather: boolean
  }
  security: {
    twoFactorEnabled: boolean
  }
  preferences: {
    darkMode: boolean
    language: string
    timezone: string
  }
}

export function SettingsClient() {
  const { data: session, update } = useSession()
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [settings, setSettings] = useState<UserSettings>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    company: '',
    notifications: {
      email: true,
      projectUpdates: true,
      payments: false,
      weather: true
    },
    security: {
      twoFactorEnabled: false
    },
    preferences: {
      darkMode: false,
      language: 'tr',
      timezone: 'Europe/Istanbul'
    }
  })

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })

  useEffect(() => {
    if (session?.user) {
      loadUserSettings()
    }
  }, [session])

  const loadUserSettings = async () => {
    try {
      setLoading(true)
      
      // Load basic user data from API
      const response = await fetch('/api/user/settings')
      if (response.ok) {
        const data = await response.json()
        
        // Load preferences from localStorage
        const savedNotifications = localStorage.getItem('user-notifications')
        const savedPreferences = localStorage.getItem('user-preferences')
        
        setSettings(prev => ({
          ...prev,
          firstName: session?.user?.name?.split(' ')[0] || '',
          lastName: session?.user?.name?.split(' ')[1] || '',
          email: session?.user?.email || '',
          phone: data.phone || '',
          company: data.company || '',
          notifications: savedNotifications ? JSON.parse(savedNotifications) : data.notifications,
          preferences: savedPreferences ? JSON.parse(savedPreferences) : data.preferences
        }))
        
        // Apply dark mode if saved
        if (savedPreferences) {
          const prefs = JSON.parse(savedPreferences)
          if (prefs.darkMode) {
            document.documentElement.classList.add('dark')
          }
        }
      }
    } catch (error) {
      console.error('Error loading settings:', error)
      toast.error('Ayarlar yüklenirken hata oluştu')
    } finally {
      setLoading(false)
    }
  }

  const saveProfile = async () => {
    try {
      setSaving(true)
      const response = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          firstName: settings.firstName,
          lastName: settings.lastName,
          email: settings.email,
          phone: settings.phone,
          company: settings.company
        })
      })

      if (response.ok) {
        // Update session with new name
        await update({
          name: `${settings.firstName} ${settings.lastName}`.trim()
        })
        toast.success('Profil bilgileri güncellendi')
      } else {
        throw new Error('Failed to update profile')
      }
    } catch (error) {
      console.error('Error saving profile:', error)
      toast.error('Profil güncellenirken hata oluştu')
    } finally {
      setSaving(false)
    }
  }

  const saveNotifications = async () => {
    try {
      setSaving(true)
      
      // Save to localStorage
      localStorage.setItem('user-notifications', JSON.stringify(settings.notifications))
      
      const response = await fetch('/api/user/notifications', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(settings.notifications)
      })

      if (response.ok) {
        toast.success('Bildirim ayarları güncellendi')
      } else {
        throw new Error('Failed to update notifications')
      }
    } catch (error) {
      console.error('Error saving notifications:', error)
      toast.error('Bildirim ayarları güncellenirken hata oluştu')
    } finally {
      setSaving(false)
    }
  }

  const changePassword = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('Yeni şifreler eşleşmiyor')
      return
    }

    if (passwordData.newPassword.length < 6) {
      toast.error('Yeni şifre en az 6 karakter olmalıdır')
      return
    }

    try {
      setSaving(true)
      const response = await fetch('/api/user/password', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword
        })
      })

      if (response.ok) {
        setPasswordData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        })
        toast.success('Şifre başarıyla değiştirildi')
      } else {
        const error = await response.json()
        toast.error(error.message || 'Şifre değiştirilirken hata oluştu')
      }
    } catch (error) {
      console.error('Error changing password:', error)
      toast.error('Şifre değiştirilirken hata oluştu')
    } finally {
      setSaving(false)
    }
  }

  const savePreferences = async () => {
    try {
      setSaving(true)
      
      // Save to localStorage
      localStorage.setItem('user-preferences', JSON.stringify(settings.preferences))
      
      const response = await fetch('/api/user/preferences', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(settings.preferences)
      })

      if (response.ok) {
        toast.success('Sistem tercihleri güncellendi')
        
        // Apply dark mode immediately
        if (settings.preferences.darkMode) {
          document.documentElement.classList.add('dark')
        } else {
          document.documentElement.classList.remove('dark')
        }
      } else {
        throw new Error('Failed to update preferences')
      }
    } catch (error) {
      console.error('Error saving preferences:', error)
      toast.error('Sistem tercihleri güncellenirken hata oluştu')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin" />
        <span className="ml-2">Ayarlar yükleniyor...</span>
      </div>
    )
  }

  return (
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
              <Input 
                id="firstName" 
                value={settings.firstName}
                onChange={(e) => setSettings(prev => ({ ...prev, firstName: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">Soyad</Label>
              <Input 
                id="lastName" 
                value={settings.lastName}
                onChange={(e) => setSettings(prev => ({ ...prev, lastName: e.target.value }))}
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="email">E-posta</Label>
            <Input 
              id="email" 
              type="email" 
              value={settings.email}
              onChange={(e) => setSettings(prev => ({ ...prev, email: e.target.value }))}
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="phone">Telefon</Label>
              <Input 
                id="phone" 
                type="tel" 
                placeholder="+90 555 123 45 67"
                value={settings.phone}
                onChange={(e) => setSettings(prev => ({ ...prev, phone: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="company">Şirket</Label>
              <Input 
                id="company" 
                placeholder="Şirket adı"
                value={settings.company}
                onChange={(e) => setSettings(prev => ({ ...prev, company: e.target.value }))}
              />
            </div>
          </div>

          <Button onClick={saveProfile} disabled={saving}>
            {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
            Profili Güncelle
          </Button>
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
            <Switch 
              checked={settings.notifications.email}
              onCheckedChange={(checked) => 
                setSettings(prev => ({ 
                  ...prev, 
                  notifications: { ...prev.notifications, email: checked }
                }))
              }
            />
          </div>
          
          <Separator />
          
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Proje Güncellemeleri</Label>
              <p className="text-sm text-muted-foreground">
                Proje durumu değişikliklerinde bildirim alın
              </p>
            </div>
            <Switch 
              checked={settings.notifications.projectUpdates}
              onCheckedChange={(checked) => 
                setSettings(prev => ({ 
                  ...prev, 
                  notifications: { ...prev.notifications, projectUpdates: checked }
                }))
              }
            />
          </div>
          
          <Separator />
          
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Ödeme Bildirimleri</Label>
              <p className="text-sm text-muted-foreground">
                Ödeme ve fatura bildirimlerini alın
              </p>
            </div>
            <Switch 
              checked={settings.notifications.payments}
              onCheckedChange={(checked) => 
                setSettings(prev => ({ 
                  ...prev, 
                  notifications: { ...prev.notifications, payments: checked }
                }))
              }
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Hava Durumu Uyarıları</Label>
              <p className="text-sm text-muted-foreground">
                Solar sistem performansını etkileyecek hava koşulları
              </p>
            </div>
            <Switch 
              checked={settings.notifications.weather}
              onCheckedChange={(checked) => 
                setSettings(prev => ({ 
                  ...prev, 
                  notifications: { ...prev.notifications, weather: checked }
                }))
              }
            />
          </div>

          <Button onClick={saveNotifications} disabled={saving}>
            {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
            Bildirim Ayarlarını Kaydet
          </Button>
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
            <Input 
              id="currentPassword" 
              type="password"
              value={passwordData.currentPassword}
              onChange={(e) => setPasswordData(prev => ({ ...prev, currentPassword: e.target.value }))}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="newPassword">Yeni Şifre</Label>
            <Input 
              id="newPassword" 
              type="password"
              value={passwordData.newPassword}
              onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Yeni Şifre (Tekrar)</Label>
            <Input 
              id="confirmPassword" 
              type="password"
              value={passwordData.confirmPassword}
              onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
            />
          </div>
          
          <Button onClick={changePassword} disabled={saving}>
            {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Shield className="w-4 h-4 mr-2" />}
            Şifreyi Değiştir
          </Button>
          
          <Separator />
          
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>İki Faktörlü Kimlik Doğrulama</Label>
              <p className="text-sm text-muted-foreground">
                Hesabınızın güvenliği için ek koruma katmanı
              </p>
            </div>
            <Switch 
              checked={settings.security.twoFactorEnabled}
              onCheckedChange={(checked) => {
                setSettings(prev => ({ 
                  ...prev, 
                  security: { ...prev.security, twoFactorEnabled: checked }
                }))
                if (checked) {
                  toast.info('İki faktörlü kimlik doğrulama yakında aktif edilecek')
                }
              }}
            />
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
            <Switch 
              checked={settings.preferences.darkMode}
              onCheckedChange={(checked) => 
                setSettings(prev => ({ 
                  ...prev, 
                  preferences: { ...prev.preferences, darkMode: checked }
                }))
              }
            />
          </div>
          
          <Separator />
          
          <div className="space-y-2">
            <Label htmlFor="language">Dil</Label>
            <Select 
              value={settings.preferences.language}
              onValueChange={(value) => 
                setSettings(prev => ({ 
                  ...prev, 
                  preferences: { ...prev.preferences, language: value }
                }))
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="tr">Türkçe</SelectItem>
                <SelectItem value="en">English</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="timezone">Zaman Dilimi</Label>
            <Select 
              value={settings.preferences.timezone}
              onValueChange={(value) => 
                setSettings(prev => ({ 
                  ...prev, 
                  preferences: { ...prev.preferences, timezone: value }
                }))
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Europe/Istanbul">Istanbul (GMT+3)</SelectItem>
                <SelectItem value="UTC">UTC (GMT+0)</SelectItem>
                <SelectItem value="Europe/London">London (GMT+0)</SelectItem>
                <SelectItem value="America/New_York">New York (GMT-5)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button onClick={savePreferences} disabled={saving}>
            {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
            Tercihleri Kaydet
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}