'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { AlertCircle, Eye, EyeOff, Sun, Building, User, Tractor } from 'lucide-react'

export function SignUpForm() {
  const router = useRouter()
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: '',
    companyName: '',
    taxNumber: '',
    phone: '',
    city: '',
  })
  
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    // Validation
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

    if (!formData.role) {
      setError('Lütfen hesap tipini seçin')
      setIsLoading(false)
      return
    }

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.message || 'Kayıt yapılırken bir hata oluştu')
      }

      // Redirect to signin with success message
      router.push('/auth/signin?message=Kayıt başarılı! Giriş yapabilirsiniz.')
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Kayıt yapılırken bir hata oluştu')
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'COMPANY':
        return <Building className="h-4 w-4" />
      case 'FARMER':
        return <Tractor className="h-4 w-4" />
      default:
        return <User className="h-4 w-4" />
    }
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

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="role">Hesap Tipi</Label>
            <Select
              value={formData.role}
              onValueChange={(value) => handleInputChange('role', value)}
              required
            >
              <SelectTrigger>
                <SelectValue placeholder="Hesap tipini seçin" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="CUSTOMER">
                  <div className="flex items-center space-x-2">
                    <User className="h-4 w-4" />
                    <span>Bireysel Müşteri</span>
                  </div>
                </SelectItem>
                <SelectItem value="COMPANY">
                  <div className="flex items-center space-x-2">
                    <Building className="h-4 w-4" />
                    <span>GES Kurulum Firması</span>
                  </div>
                </SelectItem>
                <SelectItem value="FARMER">
                  <div className="flex items-center space-x-2">
                    <Tractor className="h-4 w-4" />
                    <span>Çiftçi / Tarımsal GES</span>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {formData.role === 'COMPANY' && (
            <div className="space-y-2">
              <Label htmlFor="companyName">Firma Adı</Label>
              <Input
                id="companyName"
                type="text"
                placeholder="ABC GES Enerji Ltd."
                value={formData.companyName}
                onChange={(e) => handleInputChange('companyName', e.target.value)}
                required={formData.role === 'COMPANY'}
                disabled={isLoading}
              />
            </div>
          )}

          {formData.role === 'COMPANY' && (
            <div className="space-y-2">
              <Label htmlFor="taxNumber">Vergi Numarası</Label>
              <Input
                id="taxNumber"
                type="text"
                placeholder="1234567890"
                value={formData.taxNumber}
                onChange={(e) => handleInputChange('taxNumber', e.target.value)}
                required={formData.role === 'COMPANY'}
                disabled={isLoading}
              />
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="name">
              {formData.role === 'COMPANY' ? 'Yetkili Kişi' : 'Ad Soyad'}
            </Label>
            <Input
              id="name"
              type="text"
              placeholder={formData.role === 'COMPANY' ? 'Ahmet Yılmaz' : 'Ad Soyad'}
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              required
              disabled={isLoading}
            />
          </div>
          
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

          <div className="space-y-2">
            <Label htmlFor="phone">Telefon</Label>
            <Input
              id="phone"
              type="tel"
              placeholder="0555 123 45 67"
              value={formData.phone}
              onChange={(e) => handleInputChange('phone', e.target.value)}
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

          <Button 
            type="submit" 
            className="w-full" 
            disabled={isLoading}
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