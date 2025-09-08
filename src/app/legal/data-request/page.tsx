'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { FileText, Send, Shield, Clock, CheckCircle, AlertTriangle } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

type KVKKRequestType = 
  | 'access'
  | 'rectification'
  | 'erasure'
  | 'portability'
  | 'object'
  | 'complaint'

interface KVKKRequestForm {
  requestType: KVKKRequestType | ''
  firstName: string
  lastName: string
  tcKimlik: string
  email: string
  phone: string
  address: string
  description: string
  documents: FileList | null
  consentGiven: boolean
}

const requestTypes = {
  access: {
    title: 'Bilgi Talebi (Erişim Hakkı)',
    description: 'Kişisel verilerimin işlenip işlenmediğini öğrenmek ve işleniyorsa detayları almak istiyorum',
    responseTime: '30 gün',
    documents: 'Kimlik fotokopisi gerekli'
  },
  rectification: {
    title: 'Düzeltme Talebi',
    description: 'Eksik veya yanlış işlenen kişisel verilerimin düzeltilmesini istiyorum',
    responseTime: '30 gün',
    documents: 'Kimlik fotokopisi + Düzeltme belgeleri'
  },
  erasure: {
    title: 'Silme Talebi',
    description: 'Kişisel verilerimin silinmesini veya yok edilmesini istiyorum',
    responseTime: '30 gün',
    documents: 'Kimlik fotokopisi gerekli'
  },
  portability: {
    title: 'Veri Taşınabilirliği',
    description: 'Kişisel verilerimi başka bir veri sorumlusuna aktarmak istiyorum',
    responseTime: '30 gün',
    documents: 'Kimlik fotokopisi + Yetki belgesi'
  },
  object: {
    title: 'İtiraz Talebi',
    description: 'Kişisel verilerimin işlenmesine itiraz ediyorum',
    responseTime: '30 gün',
    documents: 'Kimlik fotokopisi + İtiraz gerekçesi'
  },
  complaint: {
    title: 'Şikayet',
    description: 'KVKK ihlali nedeniyle şikayette bulunmak istiyorum',
    responseTime: '30 gün',
    documents: 'Kimlik fotokopisi + Şikayet belgeleri'
  }
}

export default function DataRequestPage() {
  const { toast } = useToast()
  const [form, setForm] = useState<KVKKRequestForm>({
    requestType: '',
    firstName: '',
    lastName: '',
    tcKimlik: '',
    email: '',
    phone: '',
    address: '',
    description: '',
    documents: null,
    consentGiven: false
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)

  const handleInputChange = (field: keyof KVKKRequestForm, value: any) => {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm(prev => ({ ...prev, documents: e.target.files }))
  }

  const validateForm = (): boolean => {
    if (!form.requestType) {
      toast({ title: "Hata", description: "Lütfen talep türünü seçin", variant: "destructive" })
      return false
    }
    if (!form.firstName || !form.lastName) {
      toast({ title: "Hata", description: "Ad ve soyad zorunludur", variant: "destructive" })
      return false
    }
    if (!/^\d{11}$/.test(form.tcKimlik)) {
      toast({ title: "Hata", description: "Geçerli bir TC Kimlik numarası girin", variant: "destructive" })
      return false
    }
    if (!/\S+@\S+\.\S+/.test(form.email)) {
      toast({ title: "Hata", description: "Geçerli bir e-posta adresi girin", variant: "destructive" })
      return false
    }
    if (!form.consentGiven) {
      toast({ title: "Hata", description: "KVKK aydınlatma metnini onaylamanız gerekir", variant: "destructive" })
      return false
    }
    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) return
    
    setIsSubmitting(true)
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // Here you would normally send the request to your API
      // const response = await fetch('/api/kvkk-request', {
      //   method: 'POST',
      //   body: formData
      // })
      
      setIsSubmitted(true)
      toast({
        title: "Başvuru Alındı",
        description: "KVKK talebiniz başarıyla gönderildi. 30 gün içinde yanıtlanacaktır.",
      })
    } catch (error) {
      toast({
        title: "Hata",
        description: "Başvuru gönderilirken bir hata oluştu. Lütfen tekrar deneyin.",
        variant: "destructive"
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-2xl mx-auto px-4">
          <Card className="p-8 text-center">
            <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Başvuru Alındı</h1>
            <p className="text-gray-600 mb-6">
              KVKK talebiniz başarıyla gönderildi. Başvuru numaranız: <strong>KVKK-{Date.now()}</strong>
            </p>
            <div className="bg-blue-50 p-4 rounded-lg mb-6">
              <p className="text-sm text-blue-800">
                Talebiniz 30 gün içinde değerlendirilecek ve sonucu e-posta adresinize bildirilecektir.
              </p>
            </div>
            <Button onClick={() => window.location.reload()}>
              Yeni Başvuru Yap
            </Button>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <Shield className="w-8 h-8 text-blue-600" />
            <h1 className="text-3xl font-bold text-gray-900">KVKK Veri Talebi</h1>
          </div>
          <p className="text-gray-600">
            6698 sayılı KVKK kapsamında kişisel verilerinizle ilgili haklarınızı kullanabilirsiniz.
          </p>
        </div>

        <Card className="p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Request Type Selection */}
            <div>
              <Label htmlFor="requestType" className="text-base font-medium">
                Talep Türü *
              </Label>
              <Select value={form.requestType} onValueChange={(value: KVKKRequestType) => handleInputChange('requestType', value)}>
                <SelectTrigger className="mt-2">
                  <SelectValue placeholder="Talep türünü seçin..." />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(requestTypes).map(([key, type]) => (
                    <SelectItem key={key} value={key}>
                      {type.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {form.requestType && (
                <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                  <h4 className="font-medium text-blue-900 mb-2">
                    {requestTypes[form.requestType].title}
                  </h4>
                  <p className="text-sm text-blue-800 mb-3">
                    {requestTypes[form.requestType].description}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="outline">
                      <Clock className="w-3 h-3 mr-1" />
                      {requestTypes[form.requestType].responseTime}
                    </Badge>
                    <Badge variant="outline">
                      <FileText className="w-3 h-3 mr-1" />
                      {requestTypes[form.requestType].documents}
                    </Badge>
                  </div>
                </div>
              )}
            </div>

            <Separator />

            {/* Personal Information */}
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="firstName">Ad *</Label>
                <Input
                  id="firstName"
                  value={form.firstName}
                  onChange={(e) => handleInputChange('firstName', e.target.value)}
                  placeholder="Adınız"
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="lastName">Soyad *</Label>
                <Input
                  id="lastName"
                  value={form.lastName}
                  onChange={(e) => handleInputChange('lastName', e.target.value)}
                  placeholder="Soyadınız"
                  className="mt-1"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="tcKimlik">TC Kimlik Numarası *</Label>
              <Input
                id="tcKimlik"
                value={form.tcKimlik}
                onChange={(e) => handleInputChange('tcKimlik', e.target.value)}
                placeholder="12345678901"
                maxLength={11}
                className="mt-1"
              />
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="email">E-posta *</Label>
                <Input
                  id="email"
                  type="email"
                  value={form.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  placeholder="ornek@email.com"
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="phone">Telefon</Label>
                <Input
                  id="phone"
                  value={form.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  placeholder="+90 5XX XXX XX XX"
                  className="mt-1"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="address">Adres</Label>
              <Textarea
                id="address"
                value={form.address}
                onChange={(e) => handleInputChange('address', e.target.value)}
                placeholder="Açık adresiniz..."
                className="mt-1"
                rows={3}
              />
            </div>

            <div>
              <Label htmlFor="description">Talep Açıklaması *</Label>
              <Textarea
                id="description"
                value={form.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Talebinizi detaylı olarak açıklayın..."
                className="mt-1"
                rows={4}
              />
            </div>

            {/* File Upload */}
            <div>
              <Label htmlFor="documents">Ek Belgeler</Label>
              <Input
                id="documents"
                type="file"
                onChange={handleFileUpload}
                accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                multiple
                className="mt-1"
              />
              <p className="text-xs text-gray-500 mt-1">
                Kimlik fotokopisi ve diğer gerekli belgeleri yükleyebilirsiniz. (PDF, JPG, PNG, DOC formatları kabul edilir)
              </p>
            </div>

            <Separator />

            {/* Consent */}
            <div className="flex items-start space-x-3">
              <Checkbox
                id="consent"
                checked={form.consentGiven}
                onCheckedChange={(checked) => handleInputChange('consentGiven', checked)}
                className="mt-1"
              />
              <div className="flex-1">
                <Label htmlFor="consent" className="text-sm cursor-pointer">
                  KVKK Aydınlatma Metni ve Onayı *
                </Label>
                <p className="text-xs text-gray-600 mt-2">
                  Bu başvuru formunda verdiğim kişisel verilerin, 6698 sayılı Kişisel Verilerin Korunması Kanunu 
                  kapsamında talebimin değerlendirilmesi ve sonuçlandırılması amacıyla işlenmesine açık rızam ile onay veriyorum.
                  Bu kapsamda kimlik bilgilerimin doğrulanması, başvuru sürecimin takip edilmesi ve gerekli işlemlerin 
                  yürütülmesi için verilerimin işlenmesini kabul ediyorum.
                </p>
              </div>
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="font-medium text-amber-800 mb-2">Önemli Bilgiler:</h4>
                  <ul className="text-sm text-amber-700 space-y-1">
                    <li>• Başvuru süreci en fazla 30 gün sürer</li>
                    <li>• Kimlik doğrulama için ek belgeler istenebilir</li>
                    <li>• Başvuru sonucu e-posta ile bildirilecektir</li>
                    <li>• Eksik bilgiler nedeniyle başvuru reddedilebilir</li>
                  </ul>
                </div>
              </div>
            </div>

            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full"
              size="lg"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  Gönderiliyor...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Başvuruyu Gönder
                </>
              )}
            </Button>
          </form>
        </Card>

        {/* Contact Info */}
        <div className="mt-8 text-center text-sm text-gray-500">
          <p>
            Sorularınız için: <strong>kvkk@trakyasolar.com</strong> | 
            <strong> +90 284 XXX XX XX</strong>
          </p>
        </div>
      </div>
    </div>
  )
}