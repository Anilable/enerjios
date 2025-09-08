'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ProjectRequestAPI } from '@/lib/api/project-requests'
import { ProjectRequest } from '@/types/project-request'
import { useToast } from '@/hooks/use-toast'
import { Loader2 } from 'lucide-react'

interface ProjectRequestButtonProps {
  customerId?: string
  customerName: string
  customerEmail: string
  customerPhone?: string
  customerAddress?: string
  customerCity?: string
  trigger?: React.ReactNode
}

export function ProjectRequestButton({
  customerId,
  customerName,
  customerEmail,
  customerPhone,
  customerAddress,
  customerCity,
  trigger
}: ProjectRequestButtonProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  // Pre-populated form data from customer
  const [formData, setFormData] = useState({
    customerName,
    customerEmail,
    customerPhone: customerPhone || '',
    location: customerCity || '',
    address: customerAddress || '',
    projectType: 'RESIDENTIAL' as ProjectRequest['projectType'],
    estimatedCapacity: '',
    estimatedBudget: '',
    description: '',
    priority: 'MEDIUM' as ProjectRequest['priority'],
    source: 'REFERRAL' as ProjectRequest['source'],
    tags: ''
  })

  const handleOpen = () => {
    // Reset form with customer data
    setFormData({
      customerName,
      customerEmail,
      customerPhone: customerPhone || '',
      location: customerCity || '',
      address: customerAddress || '',
      projectType: 'RESIDENTIAL',
      estimatedCapacity: '',
      estimatedBudget: '',
      description: '',
      priority: 'MEDIUM',
      source: 'REFERRAL',
      tags: ''
    })
    setIsOpen(true)
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.projectType) {
      toast({
        title: 'Hata',
        description: 'Proje türü seçiniz',
        variant: 'destructive'
      })
      return
    }

    setIsLoading(true)

    try {
      const newRequest: Partial<ProjectRequest> = {
        customerId,
        customerName: formData.customerName,
        customerEmail: formData.customerEmail,
        customerPhone: formData.customerPhone,
        location: formData.location,
        address: formData.address,
        projectType: formData.projectType,
        estimatedCapacity: formData.estimatedCapacity ? parseFloat(formData.estimatedCapacity) : 0,
        estimatedBudget: formData.estimatedBudget ? parseFloat(formData.estimatedBudget) : undefined,
        description: formData.description,
        priority: formData.priority,
        source: formData.source,
        tags: formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag),
        status: 'OPEN',
        hasPhotos: false,
        notes: [`Müşteri yönetiminden oluşturuldu: ${new Date().toLocaleDateString('tr-TR')}`],
        statusHistory: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }

      await ProjectRequestAPI.create(newRequest)

      toast({
        title: 'Başarılı',
        description: `${customerName} için proje talebi oluşturuldu`,
      })

      setIsOpen(false)
    } catch (error) {
      console.error('Error creating project request:', error)
      toast({
        title: 'Hata',
        description: 'Proje talebi oluşturulurken hata oluştu',
        variant: 'destructive'
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      {trigger ? (
        <div onClick={handleOpen}>{trigger}</div>
      ) : (
        <Button onClick={handleOpen} variant="outline" size="sm">
          Proje Talebi Oluştur
        </Button>
      )}

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Yeni Proje Talebi Oluştur</DialogTitle>
            <DialogDescription>
              {customerName} için proje talebi oluşturun. Müşteri bilgileri otomatik doldurulmuştur.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Customer Information (Pre-filled) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="customerName">Müşteri Adı</Label>
                <Input
                  id="customerName"
                  value={formData.customerName}
                  onChange={(e) => handleInputChange('customerName', e.target.value)}
                  disabled
                  className="bg-gray-50"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="customerEmail">E-posta</Label>
                <Input
                  id="customerEmail"
                  type="email"
                  value={formData.customerEmail}
                  onChange={(e) => handleInputChange('customerEmail', e.target.value)}
                  disabled
                  className="bg-gray-50"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="customerPhone">Telefon</Label>
                <Input
                  id="customerPhone"
                  value={formData.customerPhone}
                  onChange={(e) => handleInputChange('customerPhone', e.target.value)}
                  placeholder="+90 532 123 4567"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="location">Konum</Label>
                <Input
                  id="location"
                  value={formData.location}
                  onChange={(e) => handleInputChange('location', e.target.value)}
                  placeholder="İstanbul, Kadıköy"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Adres</Label>
              <Input
                id="address"
                value={formData.address}
                onChange={(e) => handleInputChange('address', e.target.value)}
                placeholder="Tam adres bilgisi"
              />
            </div>

            {/* Project Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="projectType">Proje Türü *</Label>
                <Select 
                  value={formData.projectType} 
                  onValueChange={(value) => handleInputChange('projectType', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Proje türü seçin" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="RESIDENTIAL">Konut</SelectItem>
                    <SelectItem value="COMMERCIAL">Ticari</SelectItem>
                    <SelectItem value="INDUSTRIAL">Endüstriyel</SelectItem>
                    <SelectItem value="AGRICULTURAL">Tarımsal</SelectItem>
                    <SelectItem value="ROOFTOP">Çatı GES</SelectItem>
                    <SelectItem value="LAND">Arazi GES</SelectItem>
                    <SelectItem value="AGRISOLAR">Tarımsal GES</SelectItem>
                    <SelectItem value="CARPARK">Otopark GES</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="estimatedCapacity">Tahmini Kapasite (kW)</Label>
                <Input
                  id="estimatedCapacity"
                  type="number"
                  value={formData.estimatedCapacity}
                  onChange={(e) => handleInputChange('estimatedCapacity', e.target.value)}
                  placeholder="25"
                  min="0"
                  step="0.1"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="estimatedBudget">Tahmini Bütçe (TL)</Label>
                <Input
                  id="estimatedBudget"
                  type="number"
                  value={formData.estimatedBudget}
                  onChange={(e) => handleInputChange('estimatedBudget', e.target.value)}
                  placeholder="150000"
                  min="0"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="priority">Öncelik</Label>
                <Select 
                  value={formData.priority} 
                  onValueChange={(value) => handleInputChange('priority', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="LOW">Düşük</SelectItem>
                    <SelectItem value="MEDIUM">Orta</SelectItem>
                    <SelectItem value="HIGH">Yüksek</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="source">Kaynak</Label>
                <Select 
                  value={formData.source} 
                  onValueChange={(value) => handleInputChange('source', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="WEBSITE">Website</SelectItem>
                    <SelectItem value="PHONE">Telefon</SelectItem>
                    <SelectItem value="EMAIL">E-posta</SelectItem>
                    <SelectItem value="REFERRAL">Referans</SelectItem>
                    <SelectItem value="SOCIAL_MEDIA">Sosyal Medya</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="tags">Etiketler</Label>
                <Input
                  id="tags"
                  value={formData.tags}
                  onChange={(e) => handleInputChange('tags', e.target.value)}
                  placeholder="Acil, Yüksek Bütçe (virgülle ayırın)"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Açıklama</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Proje detayları ve müşteri istekleri..."
                rows={3}
              />
            </div>

            <DialogFooter>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setIsOpen(false)}
                disabled={isLoading}
              >
                İptal
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Oluşturuluyor...
                  </>
                ) : (
                  'Talep Oluştur'
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  )
}