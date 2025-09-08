'use client'

import { useState } from 'react'
import { ProjectRequest, ProjectType } from '@/types/project-request'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

interface NewProjectRequestDialogProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (request: ProjectRequest) => void
}

export function NewProjectRequestDialog({ isOpen, onClose, onSubmit }: NewProjectRequestDialogProps) {
  const [formData, setFormData] = useState({
    customerName: '',
    customerEmail: '',
    customerPhone: '',
    location: '',
    address: '',
    projectType: '' as ProjectType | '',
    estimatedCapacity: '',
    estimatedBudget: '',
    description: '',
    priority: 'MEDIUM' as 'LOW' | 'MEDIUM' | 'HIGH',
    source: 'WEBSITE' as 'WEBSITE' | 'PHONE' | 'EMAIL' | 'REFERRAL' | 'SOCIAL_MEDIA',
    tags: ''
  })

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.customerName || !formData.customerEmail || !formData.projectType) {
      return
    }

    const newRequest: ProjectRequest = {
      id: Date.now().toString(),
      customerName: formData.customerName,
      customerEmail: formData.customerEmail,
      customerPhone: formData.customerPhone,
      location: formData.location,
      address: formData.address,
      projectType: formData.projectType as ProjectType,
      estimatedCapacity: parseFloat(formData.estimatedCapacity) || 0,
      estimatedBudget: parseFloat(formData.estimatedBudget) || undefined,
      description: formData.description,
      status: 'OPEN',
      priority: formData.priority,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      statusHistory: [
        {
          id: '1',
          status: 'OPEN',
          timestamp: new Date().toISOString(),
          userId: 'current-user',
          userName: 'Mevcut Kullanıcı'
        }
      ],
      notes: [],
      tags: formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag),
      source: formData.source,
      hasPhotos: false,
      estimatedRevenue: parseFloat(formData.estimatedBudget) || undefined
    }

    onSubmit(newRequest)
    
    // Reset form
    setFormData({
      customerName: '',
      customerEmail: '',
      customerPhone: '',
      location: '',
      address: '',
      projectType: '',
      estimatedCapacity: '',
      estimatedBudget: '',
      description: '',
      priority: 'MEDIUM',
      source: 'WEBSITE',
      tags: ''
    })
  }

  const handleClose = () => {
    setFormData({
      customerName: '',
      customerEmail: '',
      customerPhone: '',
      location: '',
      address: '',
      projectType: '',
      estimatedCapacity: '',
      estimatedBudget: '',
      description: '',
      priority: 'MEDIUM',
      source: 'WEBSITE',
      tags: ''
    })
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Yeni Proje Talebi</DialogTitle>
          <DialogDescription>
            Müşteri bilgilerini ve proje detaylarını girerek yeni talep oluşturun
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Customer Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="customerName">Müşteri Adı *</Label>
              <Input
                id="customerName"
                value={formData.customerName}
                onChange={(e) => handleInputChange('customerName', e.target.value)}
                placeholder="Ahmet Yılmaz"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="customerEmail">E-posta *</Label>
              <Input
                id="customerEmail"
                type="email"
                value={formData.customerEmail}
                onChange={(e) => handleInputChange('customerEmail', e.target.value)}
                placeholder="ahmet@example.com"
                required
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
            <Button type="button" variant="outline" onClick={handleClose}>
              İptal
            </Button>
            <Button type="submit">
              Talep Oluştur
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}