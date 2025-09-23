'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Separator } from '@/components/ui/separator'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Sun,
  MapPin,
  Calculator,
  Building,
  User,
  Phone,
  Mail,
  FileText,
  Check,
  AlertCircle,
  Zap,
  TrendingUp,
  PiggyBank,
  Box,
  Clock,
  Send,
  Image,
  Download
} from 'lucide-react'
import { DesignerState } from '@/app/dashboard/designer/page'

interface DesignerQuoteModalProps {
  isOpen: boolean
  onClose: () => void
  designerState: DesignerState
}

export function DesignerQuoteModal({ isOpen, onClose, designerState }: DesignerQuoteModalProps) {
  const { data: session } = useSession()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [activeTab, setActiveTab] = useState('project')
  
  // Form states
  const [formData, setFormData] = useState({
    // Customer info
    name: session?.user?.name || '',
    email: session?.user?.email || '',
    phone: '',
    company: '',
    
    // Project details
    projectType: 'residential',
    propertyType: 'detached_house',
    installationType: 'rooftop',
    
    // Additional info
    message: '',
    urgency: 'normal',
    financingNeeded: false,
    
    // Preferences
    preferredBrands: [] as string[],
    preferredStartDate: '',
    budgetRange: ''
  })

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async () => {
    setIsSubmitting(true)
    
    try {
      // Prepare the quote request data with all designer information
      const quoteRequestData = {
        ...formData,
        designData: {
          roofPoints: designerState.roofPoints,
          panels: designerState.panels,
          location: designerState.location,
          calculations: designerState.calculations,
          roofArea: designerState.calculations.roofArea,
          usableArea: designerState.calculations.usableArea,
          totalPanels: designerState.calculations.totalPanels,
          totalPower: designerState.calculations.totalPower,
          annualProduction: designerState.calculations.annualProduction,
          coordinates: designerState.location?.coordinates,
          irradiance: designerState.location?.irradiance,
          address: designerState.location?.address
        },
        timestamp: new Date().toISOString(),
        source: '3d_designer',
        userId: session?.user?.id
      }
      
      const response = await fetch('/api/quotes/designer-request', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(quoteRequestData)
      })
      
      if (response.ok) {
        setSubmitted(true)
      } else {
        throw new Error('Failed to submit quote request')
      }
    } catch (error) {
      console.error('Error submitting quote:', error)
      alert('Teklif gönderilirken bir hata oluştu. Lütfen tekrar deneyin.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const exportDesignData = async () => {
    try {
      if (!designerState.location || designerState.calculations.totalPanels === 0) {
        alert('PDF oluşturma için önce konum seçin ve panel yerleştirin.')
        return
      }

      const { exportDesignToPDF } = await import('@/lib/design-export')

      const exportData = {
        projectName: formData.name ? `${formData.name} - Solar Tasarım` : 'Güneş Enerji Projesi',
        customerName: formData.name || undefined,
        location: designerState.location.address,
        coordinates: designerState.location.coordinates,
        calculations: designerState.calculations,
        irradiance: designerState.location.irradiance,
        timestamp: new Date()
      }

      await exportDesignToPDF('designer-map-container', exportData)

    } catch (error) {
      console.error('Error exporting design:', error)
      alert('PDF oluşturulurken hata oluştu: ' + (error as Error).message)
    }
  }

  if (submitted) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-md">
          <div className="flex flex-col items-center text-center py-8">
            <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mb-4">
              <Check className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Teklif Talebiniz Alındı!</h3>
            <p className="text-gray-600 mb-6">
              Proje detaylarınız ve çatı tasarımınız firmalarımıza iletildi. 
              En kısa sürede size geri dönüş yapılacaktır.
            </p>
            <div className="flex gap-3">
              <Button variant="outline" onClick={exportDesignData}>
                <Download className="w-4 h-4 mr-2" />
                Tasarım Raporu İndir
              </Button>
              <Button onClick={onClose}>
                Tamam
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-2xl flex items-center gap-2">
            <Sun className="w-6 h-6 text-primary" />
            Proje için Detaylı Teklif Talebi
          </DialogTitle>
          <DialogDescription>
            3D tasarımınız ve hesaplamalarınız ile birlikte firmalardan teklif alın
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto">
          {/* Project Summary Card */}
          <Card className="p-4 mb-4 bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20">
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-primary" />
                  <span className="font-medium">{designerState.location?.address || 'Konum seçilmedi'}</span>
                </div>
                <div className="flex gap-6">
                  <div className="flex items-center gap-1">
                    <Box className="w-4 h-4 text-gray-600" />
                    <span className="text-sm">{designerState.calculations.roofArea}m² çatı</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Zap className="w-4 h-4 text-yellow-600" />
                    <span className="text-sm">{designerState.calculations.totalPanels} panel</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <TrendingUp className="w-4 h-4 text-green-600" />
                    <span className="text-sm">{(designerState.calculations.totalPower / 1000).toFixed(1)}kW</span>
                  </div>
                </div>
              </div>
              <Badge variant="secondary" className="bg-primary/10">
                <Sun className="w-3 h-3 mr-1" />
                {designerState.location?.irradiance || 0} kWh/m²/yıl
              </Badge>
            </div>
          </Card>

          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="project">Proje Detayları</TabsTrigger>
              <TabsTrigger value="contact">İletişim Bilgileri</TabsTrigger>
              <TabsTrigger value="preferences">Tercihler</TabsTrigger>
            </TabsList>

            <TabsContent value="project" className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Proje Tipi</Label>
                  <Select value={formData.projectType} onValueChange={(v) => handleInputChange('projectType', v)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="residential">Konut</SelectItem>
                      <SelectItem value="commercial">Ticari</SelectItem>
                      <SelectItem value="industrial">Endüstriyel</SelectItem>
                      <SelectItem value="agricultural">Tarımsal</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Mülk Tipi</Label>
                  <Select value={formData.propertyType} onValueChange={(v) => handleInputChange('propertyType', v)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="detached_house">Müstakil Ev</SelectItem>
                      <SelectItem value="apartment">Apartman</SelectItem>
                      <SelectItem value="villa">Villa</SelectItem>
                      <SelectItem value="factory">Fabrika</SelectItem>
                      <SelectItem value="warehouse">Depo</SelectItem>
                      <SelectItem value="farm">Çiftlik</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Kurulum Tipi</Label>
                  <Select value={formData.installationType} onValueChange={(v) => handleInputChange('installationType', v)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="rooftop">Çatı Üstü</SelectItem>
                      <SelectItem value="ground">Arazi</SelectItem>
                      <SelectItem value="carport">Otopark Gölgeliği</SelectItem>
                      <SelectItem value="agrisolar">Agri-Solar</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Aciliyet</Label>
                  <Select value={formData.urgency} onValueChange={(v) => handleInputChange('urgency', v)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="urgent">Acil (1 hafta içinde)</SelectItem>
                      <SelectItem value="normal">Normal (1 ay içinde)</SelectItem>
                      <SelectItem value="planning">Planlama Aşaması (3 ay)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Design Summary */}
              <Card className="p-4 bg-gray-50">
                <h4 className="font-medium mb-3 flex items-center gap-2">
                  <Calculator className="w-4 h-4" />
                  Tasarım Özeti
                </h4>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Panel Sayısı:</span>
                    <span className="font-medium">{designerState.calculations.totalPanels} adet</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Toplam Güç:</span>
                    <span className="font-medium">{(designerState.calculations.totalPower / 1000).toFixed(1)} kW</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Yıllık Üretim:</span>
                    <span className="font-medium">{designerState.calculations.annualProduction.toLocaleString()} kWh</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Tahmini Yatırım:</span>
                    <span className="font-medium">₺{designerState.calculations.investment.toLocaleString()}</span>
                  </div>
                </div>
              </Card>

              <div>
                <Label>Ek Notlar</Label>
                <Textarea
                  value={formData.message}
                  onChange={(e) => handleInputChange('message', e.target.value)}
                  placeholder="Projeniz hakkında eklemek istediğiniz detaylar..."
                  rows={4}
                />
              </div>
            </TabsContent>

            <TabsContent value="contact" className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">
                    <User className="w-4 h-4 inline mr-1" />
                    Ad Soyad *
                  </Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="phone">
                    <Phone className="w-4 h-4 inline mr-1" />
                    Telefon *
                  </Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    placeholder="05XX XXX XX XX"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="email">
                    <Mail className="w-4 h-4 inline mr-1" />
                    E-posta *
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="company">
                    <Building className="w-4 h-4 inline mr-1" />
                    Firma (Opsiyonel)
                  </Label>
                  <Input
                    id="company"
                    value={formData.company}
                    onChange={(e) => handleInputChange('company', e.target.value)}
                  />
                </div>
              </div>

              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  İletişim bilgileriniz sadece teklif sürecinde kullanılacak ve gizli tutulacaktır.
                </AlertDescription>
              </Alert>
            </TabsContent>

            <TabsContent value="preferences" className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Tercih Edilen Başlangıç Tarihi</Label>
                  <Input
                    type="date"
                    value={formData.preferredStartDate}
                    onChange={(e) => handleInputChange('preferredStartDate', e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                  />
                </div>

                <div>
                  <Label>Bütçe Aralığı</Label>
                  <Select value={formData.budgetRange} onValueChange={(v) => handleInputChange('budgetRange', v)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Seçiniz" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0-100">₺0 - ₺100,000</SelectItem>
                      <SelectItem value="100-250">₺100,000 - ₺250,000</SelectItem>
                      <SelectItem value="250-500">₺250,000 - ₺500,000</SelectItem>
                      <SelectItem value="500-1000">₺500,000 - ₺1,000,000</SelectItem>
                      <SelectItem value="1000+">₺1,000,000+</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-3">
                <Label>Tercih Edilen Panel Markaları (Opsiyonel)</Label>
                <div className="grid grid-cols-3 gap-2">
                  {['JinkoSolar', 'Canadian Solar', 'Trina Solar', 'LONGi', 'JA Solar', 'Hanwha Q-Cells'].map(brand => (
                    <div key={brand} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id={brand}
                        checked={formData.preferredBrands.includes(brand)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            handleInputChange('preferredBrands', [...formData.preferredBrands, brand])
                          } else {
                            handleInputChange('preferredBrands', formData.preferredBrands.filter(b => b !== brand))
                          }
                        }}
                        className="rounded border-gray-300"
                      />
                      <label htmlFor={brand} className="text-sm">{brand}</label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="financing"
                  checked={formData.financingNeeded}
                  onChange={(e) => handleInputChange('financingNeeded', e.target.checked)}
                  className="rounded border-gray-300"
                />
                <label htmlFor="financing" className="text-sm">
                  Finansman desteği istiyorum
                </label>
              </div>

              <Alert className="bg-green-50 border-green-200">
                <PiggyBank className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-800">
                  Finansman seçeneği işaretlenirse, anlaşmalı bankalarımızdan kredi teklifleri de alabilirsiniz.
                </AlertDescription>
              </Alert>
            </TabsContent>
          </Tabs>
        </div>

        <Separator className="my-4" />

        <DialogFooter>
          <div className="flex items-center gap-4 w-full">
            <Button variant="outline" onClick={exportDesignData}>
              <Download className="w-4 h-4 mr-2" />
              Tasarım Raporu İndir
            </Button>
            <div className="flex-1" />
            <Button variant="outline" onClick={onClose}>
              İptal
            </Button>
            <Button 
              onClick={handleSubmit} 
              disabled={isSubmitting || !formData.name || !formData.phone || !formData.email}
            >
              {isSubmitting ? (
                <>
                  <Clock className="w-4 h-4 mr-2 animate-spin" />
                  Gönderiliyor...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Teklif Talep Et
                </>
              )}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}