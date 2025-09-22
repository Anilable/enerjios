'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { useToast } from '@/hooks/use-toast'
import {
  MapPin,
  User,
  Phone,
  Mail,
  Home,
  Building,
  Zap,
  Calendar,
  CheckCircle,
  AlertCircle
} from 'lucide-react'

interface FreeInspectionFormProps {
  onSubmit?: (data: any) => void
  embedded?: boolean
}

export function FreeInspectionForm({ onSubmit, embedded = false }: FreeInspectionFormProps) {
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)

  const [formData, setFormData] = useState({
    // Kişisel Bilgiler
    fullName: '',
    email: '',
    phone: '',

    // Lokasyon Bilgileri
    city: '',
    district: '',
    address: '',

    // Proje Detayları
    propertyType: 'house', // house, apartment, business, factory, farm
    roofType: 'flat', // flat, tiled, metal, concrete
    roofArea: '',
    monthlyElectricBill: '',
    electricityUsage: '',

    // Keşif Tercihleri
    preferredDate: '',
    preferredTime: 'morning', // morning, afternoon, evening
    notes: ''
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.fullName) newErrors.fullName = 'Ad soyad gerekli'
    if (!formData.email) newErrors.email = 'Email gerekli'
    if (!formData.phone) newErrors.phone = 'Telefon gerekli'
    if (!formData.city) newErrors.city = 'Şehir gerekli'
    if (!formData.address) newErrors.address = 'Adres gerekli'
    if (!formData.monthlyElectricBill && !formData.electricityUsage) {
      newErrors.monthlyElectricBill = 'Elektrik faturası veya tüketim bilgisi gerekli'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) return

    setIsSubmitting(true)
    try {
      // Send to API
      const response = await fetch('/api/inspection-requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      if (!response.ok) {
        throw new Error('Failed to submit request')
      }

      setIsSuccess(true)
      toast({
        title: 'Başarılı!',
        description: 'Ücretsiz keşif talebiniz alındı. En kısa sürede sizinle iletişime geçeceğiz.'
      })

      // Call external onSubmit if provided
      if (onSubmit) {
        onSubmit(formData)
      }

      // Reset form after 3 seconds
      setTimeout(() => {
        setFormData({
          fullName: '',
          email: '',
          phone: '',
          city: '',
          district: '',
          address: '',
          propertyType: 'house',
          roofType: 'flat',
          roofArea: '',
          monthlyElectricBill: '',
          electricityUsage: '',
          preferredDate: '',
          preferredTime: 'morning',
          notes: ''
        })
        setIsSuccess(false)
      }, 3000)

    } catch (error) {
      toast({
        title: 'Hata',
        description: 'Talebiniz gönderilirken bir hata oluştu. Lütfen tekrar deneyin.',
        variant: 'destructive'
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isSuccess) {
    return (
      <Card className={embedded ? '' : 'max-w-2xl mx-auto'}>
        <CardContent className="py-12">
          <div className="text-center space-y-4">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto" />
            <h3 className="text-2xl font-bold">Talebiniz Alındı!</h3>
            <p className="text-gray-600">
              Ücretsiz keşif talebiniz başarıyla alındı. Uzman ekibimiz en kısa sürede sizinle iletişime geçecektir.
            </p>
            <div className="pt-4">
              <Alert className="max-w-md mx-auto">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Genellikle 24 saat içinde dönüş sağlamaktayız. Acil durumlar için lütfen 0850 123 45 67 numarasından bize ulaşın.
                </AlertDescription>
              </Alert>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={embedded ? '' : 'max-w-2xl mx-auto'}>
      <CardHeader>
        <CardTitle className="text-2xl flex items-center gap-2">
          <MapPin className="w-6 h-6 text-orange-500" />
          Ücretsiz Keşif Talebi
        </CardTitle>
        <CardDescription>
          Güneş enerjisi sistemi kurulumu için ücretsiz keşif hizmetimizden yararlanın
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Kişisel Bilgiler */}
          <div className="space-y-4">
            <h3 className="font-semibold flex items-center gap-2">
              <User className="w-4 h-4" />
              Kişisel Bilgiler
            </h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="fullName">Ad Soyad *</Label>
                <Input
                  id="fullName"
                  value={formData.fullName}
                  onChange={(e) => setFormData(prev => ({ ...prev, fullName: e.target.value }))}
                  className={errors.fullName ? 'border-red-500' : ''}
                />
                {errors.fullName && <p className="text-sm text-red-500 mt-1">{errors.fullName}</p>}
              </div>

              <div>
                <Label htmlFor="phone">Telefon *</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                    className={`pl-10 ${errors.phone ? 'border-red-500' : ''}`}
                    placeholder="0555 123 4567"
                  />
                </div>
                {errors.phone && <p className="text-sm text-red-500 mt-1">{errors.phone}</p>}
              </div>

              <div className="md:col-span-2">
                <Label htmlFor="email">Email *</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    className={`pl-10 ${errors.email ? 'border-red-500' : ''}`}
                    placeholder="ornek@email.com"
                  />
                </div>
                {errors.email && <p className="text-sm text-red-500 mt-1">{errors.email}</p>}
              </div>
            </div>
          </div>

          {/* Lokasyon Bilgileri */}
          <div className="space-y-4">
            <h3 className="font-semibold flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              Lokasyon Bilgileri
            </h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="city">Şehir *</Label>
                <Input
                  id="city"
                  value={formData.city}
                  onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
                  className={errors.city ? 'border-red-500' : ''}
                  placeholder="İstanbul"
                />
                {errors.city && <p className="text-sm text-red-500 mt-1">{errors.city}</p>}
              </div>

              <div>
                <Label htmlFor="district">İlçe</Label>
                <Input
                  id="district"
                  value={formData.district}
                  onChange={(e) => setFormData(prev => ({ ...prev, district: e.target.value }))}
                  placeholder="Kadıköy"
                />
              </div>

              <div className="md:col-span-2">
                <Label htmlFor="address">Adres *</Label>
                <Textarea
                  id="address"
                  value={formData.address}
                  onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                  className={errors.address ? 'border-red-500' : ''}
                  placeholder="Mahalle, sokak ve diğer adres detayları"
                  rows={2}
                />
                {errors.address && <p className="text-sm text-red-500 mt-1">{errors.address}</p>}
              </div>
            </div>
          </div>

          {/* Proje Detayları */}
          <div className="space-y-4">
            <h3 className="font-semibold flex items-center gap-2">
              <Zap className="w-4 h-4" />
              Proje Detayları
            </h3>

            <div>
              <Label>Mülk Tipi</Label>
              <RadioGroup
                value={formData.propertyType}
                onValueChange={(value) => setFormData(prev => ({ ...prev, propertyType: value }))}
                className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-2"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="house" id="house" />
                  <Label htmlFor="house" className="cursor-pointer">Müstakil Ev</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="apartment" id="apartment" />
                  <Label htmlFor="apartment" className="cursor-pointer">Apartman</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="business" id="business" />
                  <Label htmlFor="business" className="cursor-pointer">İşyeri</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="factory" id="factory" />
                  <Label htmlFor="factory" className="cursor-pointer">Fabrika</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="farm" id="farm" />
                  <Label htmlFor="farm" className="cursor-pointer">Çiftlik</Label>
                </div>
              </RadioGroup>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="roofType">Çatı Tipi</Label>
                <Select
                  value={formData.roofType}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, roofType: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="flat">Düz/Teras</SelectItem>
                    <SelectItem value="tiled">Kiremit</SelectItem>
                    <SelectItem value="metal">Metal</SelectItem>
                    <SelectItem value="concrete">Beton</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="roofArea">Çatı Alanı (m²)</Label>
                <Input
                  id="roofArea"
                  type="number"
                  value={formData.roofArea}
                  onChange={(e) => setFormData(prev => ({ ...prev, roofArea: e.target.value }))}
                  placeholder="Opsiyonel"
                />
              </div>

              <div>
                <Label htmlFor="monthlyElectricBill">Aylık Elektrik Faturası (₺) *</Label>
                <Input
                  id="monthlyElectricBill"
                  type="number"
                  value={formData.monthlyElectricBill}
                  onChange={(e) => setFormData(prev => ({ ...prev, monthlyElectricBill: e.target.value }))}
                  className={errors.monthlyElectricBill ? 'border-red-500' : ''}
                  placeholder="500"
                />
                {errors.monthlyElectricBill && <p className="text-sm text-red-500 mt-1">{errors.monthlyElectricBill}</p>}
              </div>

              <div>
                <Label htmlFor="electricityUsage">Aylık Tüketim (kWh)</Label>
                <Input
                  id="electricityUsage"
                  type="number"
                  value={formData.electricityUsage}
                  onChange={(e) => setFormData(prev => ({ ...prev, electricityUsage: e.target.value }))}
                  placeholder="Opsiyonel"
                />
              </div>
            </div>
          </div>

          {/* Keşif Tercihleri */}
          <div className="space-y-4">
            <h3 className="font-semibold flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Keşif Tercihleri
            </h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="preferredDate">Tercih Edilen Tarih</Label>
                <Input
                  id="preferredDate"
                  type="date"
                  value={formData.preferredDate}
                  onChange={(e) => setFormData(prev => ({ ...prev, preferredDate: e.target.value }))}
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>

              <div>
                <Label htmlFor="preferredTime">Tercih Edilen Zaman</Label>
                <Select
                  value={formData.preferredTime}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, preferredTime: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="morning">Sabah (09:00 - 12:00)</SelectItem>
                    <SelectItem value="afternoon">Öğle (12:00 - 15:00)</SelectItem>
                    <SelectItem value="evening">Akşam (15:00 - 18:00)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="md:col-span-2">
                <Label htmlFor="notes">Notlar</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="Varsa eklemek istediğiniz notlar..."
                  rows={3}
                />
              </div>
            </div>
          </div>

          {/* Submit */}
          <div className="flex justify-end gap-4">
            <Button
              type="submit"
              disabled={isSubmitting}
              className="px-8"
            >
              {isSubmitting ? 'Gönderiliyor...' : 'Keşif Talebi Gönder'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}