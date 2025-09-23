'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { AlertCircle, Eye, EyeOff, Sun, Building, User, Tractor, Factory } from 'lucide-react'

export function SignUpForm() {
  const router = useRouter()
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    userType: '',
    // Personal info
    firstName: '',
    lastName: '',
    phone: '',
    city: '',
    // Corporate info
    companyName: '',
    taxNumber: '',
    sector: '',
    // GES Company info
    specializations: [],
    // Farmer info
    farmName: '',
    farmLocation: '',
    farmSize: '',
    crops: [],
  })

  const [kvkkAccepted, setKvkkAccepted] = useState(false)
  
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')
    setSuccess('')

    // Validation
    if (!kvkkAccepted) {
      setError('KVKK Aydınlatma Metni\'ni kabul etmeniz gereklidir')
      setIsLoading(false)
      return
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Şifreler eşleşmiyor')
      setIsLoading(false)
      return
    }

    if (formData.password.length < 6) {
      setError('Şifre en az 6 karakter olmalıdır')
      setIsLoading(false)
      return
    }

    if (!formData.userType) {
      setError('Lütfen kullanıcı tipini seçin')
      setIsLoading(false)
      return
    }

    // User type specific validation
    if (formData.userType === 'epc') {
      if (!formData.companyName || !formData.taxNumber) {
        setError('EPC hesap için firma adı ve vergi numarası gereklidir')
        setIsLoading(false)
        return
      }
    }

    if (formData.userType === 'ges-firmasi') {
      if (!formData.companyName || !formData.taxNumber) {
        setError('GES firması hesabı için firma adı ve vergi numarası gereklidir')
        setIsLoading(false)
        return
      }
    }

    if (formData.userType === 'ciftci') {
      if (!formData.farmName || !formData.farmLocation) {
        setError('Çiftçi hesabı için çiftlik adı ve lokasyon gereklidir')
        setIsLoading(false)
        return
      }
    }

    if ((formData.userType === 'bireysel' || formData.userType === 'ciftci') && (!formData.firstName || !formData.lastName)) {
      setError('Ad ve soyad alanları gereklidir')
      setIsLoading(false)
      return
    }

    // Validate tax number format for companies
    if ((formData.userType === 'epc' || formData.userType === 'ges-firmasi') && formData.taxNumber) {
      if (!/^\d{10}$/.test(formData.taxNumber)) {
        setError('Vergi numarası 10 haneli olmalıdır')
        setIsLoading(false)
        return
      }
    }

    // Validate phone number format
    if (formData.phone && !/^[0-9\s\-\+\(\)]{10,}$/.test(formData.phone.replace(/\s/g, ''))) {
      setError('Geçerli bir telefon numarası girin')
      setIsLoading(false)
      return
    }

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          // Set name field for API compatibility
          name: formData.userType === 'bireysel' || formData.userType === 'ciftci'
            ? `${formData.firstName} ${formData.lastName}`.trim()
            : formData.name
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.message || 'Kayıt yapılırken bir hata oluştu')
      }

      // Show success message and redirect
      setSuccess('Kayıt başarılı! Giriş sayfasına yönlendiriliyorsunuz...')
      setTimeout(() => {
        router.push('/auth/signin?message=Kayıt başarılı! Giriş yapabilirsiniz.')
      }, 2000)
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Kayıt yapılırken bir hata oluştu')
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const getUserTypeIcon = (userType: string) => {
    switch (userType) {
      case 'bireysel':
        return <User className="h-4 w-4" />
      case 'epc':
        return <Building className="h-4 w-4" />
      case 'ges-firmasi':
        return <Factory className="h-4 w-4" />
      case 'ciftci':
        return <Tractor className="h-4 w-4" />
      default:
        return <User className="h-4 w-4" />
    }
  }

  const getUserTypeDescription = (userType: string) => {
    switch (userType) {
      case 'bireysel':
        return 'Ev güneş enerjisi sistemi için bireysel başvuru'
      case 'epc':
        return 'İşletme güneş enerjisi sistemi için EPC başvuru'
      case 'ges-firmasi':
        return 'GES kurulum ve danışmanlık hizmeti veren firma'
      case 'ciftci':
        return 'Tarımsal güneş enerjisi sistemi için çiftçi başvurusu'
      default:
        return ''
    }
  }

  const handleArrayFieldChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value.split(',').map(item => item.trim()).filter(item => item.length > 0)
    }))
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="space-y-1 text-center">
        <div className="flex items-center justify-center mb-4">
          <div className="flex items-center space-x-2">
            <Sun className="h-8 w-8 text-primary" />
            <span className="text-2xl font-bold text-primary">EnerjiOS</span>
          </div>
        </div>
        <CardTitle className="text-2xl">Kayıt Ol</CardTitle>
        <CardDescription>
          EnerjiOS'a katılın ve güneş enerjisinin gücünü keşfedin
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {error && (
          <div className="flex items-center space-x-2 text-sm text-red-600 bg-red-50 p-3 rounded-md">
            <AlertCircle className="h-4 w-4" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="flex items-center space-x-2 text-sm text-green-600 bg-green-50 p-3 rounded-md">
            <div className="h-4 w-4 rounded-full bg-green-600 flex items-center justify-center">
              <div className="h-2 w-2 bg-white rounded-full" />
            </div>
            <span>{success}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="userType">Kullanıcı Tipi</Label>
              <p className="text-sm text-gray-600">Size uygun olan kullanıcı tipini seçin</p>
            </div>

            <div className="grid grid-cols-1 gap-3">
              {[
                { value: 'bireysel', label: 'Bireysel', icon: <User className="h-5 w-5" /> },
                { value: 'epc', label: 'EPC', icon: <Building className="h-5 w-5" /> },
                { value: 'ges-firmasi', label: 'GES Firması', icon: <Factory className="h-5 w-5" /> },
                { value: 'ciftci', label: 'Çiftçi', icon: <Tractor className="h-5 w-5" /> }
              ].map((option) => (
                <div
                  key={option.value}
                  className={`relative flex cursor-pointer rounded-lg border p-4 transition-colors ${
                    formData.userType === option.value
                      ? 'border-primary bg-primary/5 ring-2 ring-primary/20'
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                  onClick={() => handleInputChange('userType', option.value)}
                >
                  <div className="flex items-start space-x-3">
                    <div className={`mt-0.5 ${
                      formData.userType === option.value ? 'text-primary' : 'text-gray-400'
                    }`}>
                      {option.icon}
                    </div>
                    <div className="flex-1">
                      <h3 className={`text-sm font-medium ${
                        formData.userType === option.value ? 'text-primary' : 'text-gray-900'
                      }`}>
                        {option.label}
                      </h3>
                      <p className="text-xs text-gray-500 mt-1">
                        {getUserTypeDescription(option.value)}
                      </p>
                    </div>
                    <div className={`ml-2 h-5 w-5 rounded-full border-2 flex items-center justify-center ${
                      formData.userType === option.value
                        ? 'border-primary bg-primary'
                        : 'border-gray-300'
                    }`}>
                      {formData.userType === option.value && (
                        <div className="h-2 w-2 rounded-full bg-white" />
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Bireysel Fields */}
          {formData.userType === 'bireysel' && (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">Ad</Label>
                  <Input
                    id="firstName"
                    type="text"
                    placeholder="Ahmet"
                    value={formData.firstName}
                    onChange={(e) => handleInputChange('firstName', e.target.value)}
                    required
                    disabled={isLoading}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Soyad</Label>
                  <Input
                    id="lastName"
                    type="text"
                    placeholder="Yılmaz"
                    value={formData.lastName}
                    onChange={(e) => handleInputChange('lastName', e.target.value)}
                    required
                    disabled={isLoading}
                  />
                </div>
              </div>
            </>
          )}

          {/* EPC Fields */}
          {formData.userType === 'epc' && (
            <>
              <div className="space-y-2">
                <Label htmlFor="companyName">Firma Adı</Label>
                <Input
                  id="companyName"
                  type="text"
                  placeholder="ABC Enerji Ltd. Şti."
                  value={formData.companyName}
                  onChange={(e) => handleInputChange('companyName', e.target.value)}
                  required
                  disabled={isLoading}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="taxNumber">Vergi Numarası</Label>
                  <Input
                    id="taxNumber"
                    type="text"
                    placeholder="1234567890"
                    value={formData.taxNumber}
                    onChange={(e) => handleInputChange('taxNumber', e.target.value)}
                    required
                    disabled={isLoading}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="sector">Sektör</Label>
                  <Input
                    id="sector"
                    type="text"
                    placeholder="İmalat, Tarım, Hizmet vb."
                    value={formData.sector}
                    onChange={(e) => handleInputChange('sector', e.target.value)}
                    disabled={isLoading}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="name">Yetkili Kişi</Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="Ahmet Yılmaz"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  required
                  disabled={isLoading}
                />
              </div>
            </>
          )}

          {/* GES Firması Fields */}
          {formData.userType === 'ges-firmasi' && (
            <>
              <div className="space-y-2">
                <Label htmlFor="companyName">Firma Adı</Label>
                <Input
                  id="companyName"
                  type="text"
                  placeholder="XYZ GES Kurulum Ltd."
                  value={formData.companyName}
                  onChange={(e) => handleInputChange('companyName', e.target.value)}
                  required
                  disabled={isLoading}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="taxNumber">Vergi Numarası</Label>
                  <Input
                    id="taxNumber"
                    type="text"
                    placeholder="1234567890"
                    value={formData.taxNumber}
                    onChange={(e) => handleInputChange('taxNumber', e.target.value)}
                    required
                    disabled={isLoading}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="specializations">Uzmanlık Alanları</Label>
                  <Input
                    id="specializations"
                    type="text"
                    placeholder="Çatı GES, Arazi GES, Tarımsal GES"
                    value={Array.isArray(formData.specializations) ? formData.specializations.join(', ') : ''}
                    onChange={(e) => handleArrayFieldChange('specializations', e.target.value)}
                    disabled={isLoading}
                  />
                  <p className="text-xs text-gray-500">Virgülle ayırarak yazın</p>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="name">Yetkili Kişi</Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="Ahmet Yılmaz"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  required
                  disabled={isLoading}
                />
              </div>
            </>
          )}

          {/* Çiftçi Fields */}
          {formData.userType === 'ciftci' && (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">Ad</Label>
                  <Input
                    id="firstName"
                    type="text"
                    placeholder="Ahmet"
                    value={formData.firstName}
                    onChange={(e) => handleInputChange('firstName', e.target.value)}
                    required
                    disabled={isLoading}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Soyad</Label>
                  <Input
                    id="lastName"
                    type="text"
                    placeholder="Yılmaz"
                    value={formData.lastName}
                    onChange={(e) => handleInputChange('lastName', e.target.value)}
                    required
                    disabled={isLoading}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="farmName">Çiftlik Adı</Label>
                <Input
                  id="farmName"
                  type="text"
                  placeholder="Yılmaz Çiftliği"
                  value={formData.farmName}
                  onChange={(e) => handleInputChange('farmName', e.target.value)}
                  required
                  disabled={isLoading}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="farmLocation">Çiftlik Lokasyonu</Label>
                  <Input
                    id="farmLocation"
                    type="text"
                    placeholder="Edirne/Merkez"
                    value={formData.farmLocation}
                    onChange={(e) => handleInputChange('farmLocation', e.target.value)}
                    required
                    disabled={isLoading}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="farmSize">Çiftlik Büyüklüğü (Dönüm)</Label>
                  <Input
                    id="farmSize"
                    type="number"
                    placeholder="100"
                    min="0"
                    step="0.1"
                    value={formData.farmSize}
                    onChange={(e) => handleInputChange('farmSize', e.target.value)}
                    disabled={isLoading}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="crops">Yetiştirilen Ürünler</Label>
                <Input
                  id="crops"
                  type="text"
                  placeholder="Buğday, Mısır, Ayçiçeği"
                  value={Array.isArray(formData.crops) ? formData.crops.join(', ') : ''}
                  onChange={(e) => handleArrayFieldChange('crops', e.target.value)}
                  disabled={isLoading}
                />
                <p className="text-xs text-gray-500">Virgülle ayırarak yazın</p>
              </div>
            </>
          )}
          {/* Common Fields for All User Types */}
          <div className="space-y-2">
            <Label htmlFor="email">E-posta</Label>
            <Input
              id="email"
              type="email"
              placeholder="ornek@email.com"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              required
              disabled={isLoading}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="phone">Telefon</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="0555 123 45 67"
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                required
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="city">Şehir</Label>
              <Input
                id="city"
                type="text"
                placeholder="İstanbul"
                value={formData.city}
                onChange={(e) => handleInputChange('city', e.target.value)}
                disabled={isLoading}
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="password">Şifre</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                value={formData.password}
                onChange={(e) => handleInputChange('password', e.target.value)}
                required
                disabled={isLoading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                disabled={isLoading}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Şifre Tekrarı</Label>
            <div className="relative">
              <Input
                id="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                placeholder="••••••••"
                value={formData.confirmPassword}
                onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                required
                disabled={isLoading}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                disabled={isLoading}
              >
                {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          {/* KVKK Consent */}
          <div className="flex items-start space-x-2">
            <Checkbox
              id="kvkk-consent"
              checked={kvkkAccepted}
              onCheckedChange={(checked) => setKvkkAccepted(checked === true)}
              className="mt-0.5"
            />
            <div className="grid gap-1.5 leading-none">
              <Label
                htmlFor="kvkk-consent"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                <Link
                  href="/kvkk"
                  target="_blank"
                  className="text-primary hover:underline"
                >
                  KVKK Aydınlatma Metni
                </Link>
                'ni okudum ve kabul ediyorum
              </Label>
              <p className="text-xs text-gray-500">
                Kişisel verilerinizin işlenmesine ilişkin aydınlatma metnini kabul etmeniz gerekmektedir.
              </p>
            </div>
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={isLoading || !kvkkAccepted}
          >
            {isLoading ? 'Kayıt yapılıyor...' : 'Kayıt Ol'}
          </Button>
        </form>
      </CardContent>

      <div className="px-6 pb-6 text-center text-sm">
        Zaten hesabınız var mı?{' '}
        <Link 
          href="/auth/signin" 
          className="text-primary hover:underline font-medium"
        >
          Giriş yapın
        </Link>
      </div>
    </Card>
  )
}