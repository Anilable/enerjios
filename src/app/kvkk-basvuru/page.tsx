'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Checkbox } from '@/components/ui/checkbox'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  FileText,
  User,
  Mail,
  Phone,
  MapPin,
  CreditCard,
  Building,
  AlertCircle,
  CheckCircle,
  Download,
  Send,
  Shield,
  Info,
  Clock,
  ChevronRight
} from 'lucide-react'
import { toast } from 'sonner'

type RequestType = 'info' | 'access' | 'correction' | 'deletion' | 'portability' | 'objection' | 'other'

const requestTypes = {
  info: {
    title: 'Bilgi Edinme',
    description: 'Kişisel verilerinizin işlenip işlenmediğini öğrenme',
    icon: Info,
    color: 'blue'
  },
  access: {
    title: 'Erişim',
    description: 'İşlenen kişisel verilerinize erişim talep etme',
    icon: FileText,
    color: 'green'
  },
  correction: {
    title: 'Düzeltme',
    description: 'Yanlış veya eksik verilerin düzeltilmesini isteme',
    icon: Shield,
    color: 'yellow'
  },
  deletion: {
    title: 'Silme/Yok Etme',
    description: 'Kişisel verilerinizin silinmesini veya yok edilmesini talep etme',
    icon: AlertCircle,
    color: 'red'
  },
  portability: {
    title: 'Veri Taşınabilirliği',
    description: 'Verilerinizin başka bir veri sorumlusuna aktarılmasını isteme',
    icon: Download,
    color: 'purple'
  },
  objection: {
    title: 'İtiraz',
    description: 'Kişisel veri işlenmesine itiraz etme',
    icon: AlertCircle,
    color: 'orange'
  },
  other: {
    title: 'Diğer',
    description: 'Diğer KVKK haklarınız kapsamındaki talepler',
    icon: FileText,
    color: 'gray'
  }
}

export default function KVKKApplicationPage() {
  const [requestType, setRequestType] = useState<RequestType>('info')
  const [formData, setFormData] = useState({
    fullName: '',
    tcNo: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    district: '',
    postalCode: '',
    details: '',
    previousApplication: false,
    previousApplicationNo: '',
    consentToProcess: false,
    acceptTerms: false
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [applicationNo, setApplicationNo] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validation
    if (!formData.consentToProcess || !formData.acceptTerms) {
      toast.error('Lütfen gerekli onayları verin')
      return
    }

    setIsSubmitting(true)

    try {
      const response = await fetch('/api/legal/kvkk-application', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          requestType
        })
      })

      if (!response.ok) throw new Error('Başvuru gönderilemedi')

      const data = await response.json()
      setApplicationNo(data.applicationNo)

      toast.success('Başvurunuz başarıyla alındı')

      // Reset form
      setFormData({
        fullName: '',
        tcNo: '',
        email: '',
        phone: '',
        address: '',
        city: '',
        district: '',
        postalCode: '',
        details: '',
        previousApplication: false,
        previousApplicationNo: '',
        consentToProcess: false,
        acceptTerms: false
      })
    } catch (error) {
      toast.error('Başvuru gönderilirken bir hata oluştu')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (applicationNo) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-green-50 to-white">
        <div className="container mx-auto px-4 py-16 max-w-2xl">
          <Card className="border-green-200">
            <CardHeader className="text-center">
              <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
              <CardTitle className="text-2xl">Başvurunuz Alındı</CardTitle>
              <CardDescription>
                KVKK başvurunuz başarıyla kaydedildi
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="bg-gray-50 p-6 rounded-lg">
                <p className="text-sm text-gray-600 mb-2">Başvuru Numaranız:</p>
                <p className="text-2xl font-mono font-bold text-gray-900">{applicationNo}</p>
              </div>

              <Alert>
                <Clock className="h-4 w-4" />
                <AlertDescription>
                  Başvurunuz en geç 30 gün içerisinde değerlendirilerek tarafınıza dönüş yapılacaktır.
                  Başvuru durumunuzu takip numaranız ile sorgulayabilirsiniz.
                </AlertDescription>
              </Alert>

              <div className="space-y-2">
                <h3 className="font-medium">Sonraki Adımlar:</h3>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li className="flex items-start gap-2">
                    <ChevronRight className="h-4 w-4 mt-0.5 text-gray-400" />
                    <span>Başvurunuz uzman ekibimiz tarafından incelenecek</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <ChevronRight className="h-4 w-4 mt-0.5 text-gray-400" />
                    <span>Gerekli işlemler başlatılacak</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <ChevronRight className="h-4 w-4 mt-0.5 text-gray-400" />
                    <span>Size e-posta veya telefon ile bilgi verilecek</span>
                  </li>
                </ul>
              </div>

              <div className="flex gap-4">
                <Button
                  onClick={() => setApplicationNo(null)}
                  variant="outline"
                  className="flex-1"
                >
                  Yeni Başvuru
                </Button>
                <Link href="/" className="flex-1">
                  <Button className="w-full">Ana Sayfaya Dön</Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white">
        <div className="container mx-auto px-4 py-16">
          <h1 className="text-4xl font-bold mb-4">KVKK Başvuru Formu</h1>
          <p className="text-xl text-blue-100">
            6698 Sayılı Kişisel Verilerin Korunması Kanunu kapsamındaki haklarınızı kullanmak için başvuru yapabilirsiniz.
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12 max-w-4xl">
        {/* Request Type Selection */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Başvuru Türü</CardTitle>
            <CardDescription>
              Hangi konuda başvuru yapmak istiyorsunuz?
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {Object.entries(requestTypes).map(([key, type]) => {
                const Icon = type.icon
                const isSelected = requestType === key
                return (
                  <button
                    key={key}
                    onClick={() => setRequestType(key as RequestType)}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      isSelected
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <Icon className={`h-6 w-6 mb-2 ${
                      isSelected ? 'text-blue-600' : 'text-gray-400'
                    }`} />
                    <h3 className="font-medium text-sm">{type.title}</h3>
                    <p className="text-xs text-gray-600 mt-1">{type.description}</p>
                  </button>
                )
              })}
            </div>
          </CardContent>
        </Card>

        {/* Application Form */}
        <form onSubmit={handleSubmit}>
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Kişisel Bilgiler</CardTitle>
              <CardDescription>
                Başvurunuzun değerlendirilebilmesi için gerekli bilgileri doldurun
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="fullName">
                    <User className="inline h-4 w-4 mr-1" />
                    Ad Soyad *
                  </Label>
                  <Input
                    id="fullName"
                    value={formData.fullName}
                    onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="tcNo">
                    <CreditCard className="inline h-4 w-4 mr-1" />
                    T.C. Kimlik No *
                  </Label>
                  <Input
                    id="tcNo"
                    value={formData.tcNo}
                    onChange={(e) => setFormData({...formData, tcNo: e.target.value})}
                    maxLength={11}
                    pattern="[0-9]{11}"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">
                    <Mail className="inline h-4 w-4 mr-1" />
                    E-posta *
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">
                    <Phone className="inline h-4 w-4 mr-1" />
                    Telefon *
                  </Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    placeholder="0555 555 5555"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">
                  <MapPin className="inline h-4 w-4 mr-1" />
                  Adres *
                </Label>
                <Textarea
                  id="address"
                  value={formData.address}
                  onChange={(e) => setFormData({...formData, address: e.target.value})}
                  rows={3}
                  required
                />
              </div>

              <div className="grid md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="city">
                    <Building className="inline h-4 w-4 mr-1" />
                    İl *
                  </Label>
                  <Input
                    id="city"
                    value={formData.city}
                    onChange={(e) => setFormData({...formData, city: e.target.value})}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="district">İlçe *</Label>
                  <Input
                    id="district"
                    value={formData.district}
                    onChange={(e) => setFormData({...formData, district: e.target.value})}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="postalCode">Posta Kodu</Label>
                  <Input
                    id="postalCode"
                    value={formData.postalCode}
                    onChange={(e) => setFormData({...formData, postalCode: e.target.value})}
                    maxLength={5}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Başvuru Detayları</CardTitle>
              <CardDescription>
                Talebinizi detaylı olarak açıklayın
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="details">
                  Açıklama *
                </Label>
                <Textarea
                  id="details"
                  value={formData.details}
                  onChange={(e) => setFormData({...formData, details: e.target.value})}
                  rows={6}
                  placeholder="Talebinizi ve nedenlerini detaylı olarak açıklayın..."
                  required
                />
              </div>

              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="previousApplication"
                    checked={formData.previousApplication}
                    onCheckedChange={(checked) =>
                      setFormData({...formData, previousApplication: checked as boolean})
                    }
                  />
                  <Label htmlFor="previousApplication" className="font-normal">
                    Daha önce aynı konuda başvuru yaptım
                  </Label>
                </div>

                {formData.previousApplication && (
                  <div className="space-y-2 pl-6">
                    <Label htmlFor="previousApplicationNo">
                      Önceki Başvuru Numarası
                    </Label>
                    <Input
                      id="previousApplicationNo"
                      value={formData.previousApplicationNo}
                      onChange={(e) => setFormData({...formData, previousApplicationNo: e.target.value})}
                      placeholder="KVKK-2024-XXXXX"
                    />
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Onaylar</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start space-x-2">
                <Checkbox
                  id="consentToProcess"
                  checked={formData.consentToProcess}
                  onCheckedChange={(checked) =>
                    setFormData({...formData, consentToProcess: checked as boolean})
                  }
                />
                <Label htmlFor="consentToProcess" className="font-normal text-sm">
                  Başvurumun değerlendirilebilmesi için yukarıda verdiğim kişisel verilerin işlenmesine izin veriyorum.
                </Label>
              </div>

              <div className="flex items-start space-x-2">
                <Checkbox
                  id="acceptTerms"
                  checked={formData.acceptTerms}
                  onCheckedChange={(checked) =>
                    setFormData({...formData, acceptTerms: checked as boolean})
                  }
                />
                <Label htmlFor="acceptTerms" className="font-normal text-sm">
                  <Link href="/kvkk" className="text-blue-600 hover:underline">
                    KVKK Aydınlatma Metni
                  </Link>
                  'ni okudum ve kabul ediyorum.
                </Label>
              </div>
            </CardContent>
          </Card>

          <div className="flex gap-4">
            <Button
              type="submit"
              disabled={isSubmitting || !formData.consentToProcess || !formData.acceptTerms}
              className="flex-1"
            >
              {isSubmitting ? (
                <>
                  <Clock className="mr-2 h-4 w-4 animate-spin" />
                  Gönderiliyor...
                </>
              ) : (
                <>
                  <Send className="mr-2 h-4 w-4" />
                  Başvuru Gönder
                </>
              )}
            </Button>

            <Link href="/">
              <Button type="button" variant="outline">
                İptal
              </Button>
            </Link>
          </div>
        </form>
      </div>
    </div>
  )
}