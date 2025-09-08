'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Phone, MapPin, User, Calendar } from 'lucide-react'

interface LeadCaptureDialogProps {
  children: React.ReactNode
  title?: string
  description?: string
}

export function LeadCaptureDialog({ 
  children, 
  title = "Ücretsiz Keşif Talep Et",
  description = "Uzmanlarımız sizi arayarak randevu planlayalım"
}: LeadCaptureDialogProps) {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    city: '',
    preferredTime: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isOpen, setIsOpen] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    // Simulate form submission
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // Here you would normally send the data to your API
    console.log('Lead captured:', formData)
    
    setIsSubmitting(false)
    setIsOpen(false)
    
    // Reset form
    setFormData({ name: '', phone: '', city: '', preferredTime: '' })
    
    // Show success message (you might want to use a toast here)
    alert('Teşekkürler! En kısa sürede sizi arayacağız.')
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Phone className="w-5 h-5 text-primary" />
            {title}
          </DialogTitle>
          <DialogDescription>
            {description}
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name" className="flex items-center gap-2">
              <User className="w-4 h-4" />
              Ad Soyad *
            </Label>
            <Input
              id="name"
              placeholder="Adınızı ve soyadınızı girin"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="phone" className="flex items-center gap-2">
              <Phone className="w-4 h-4" />
              Telefon Numarası *
            </Label>
            <Input
              id="phone"
              type="tel"
              placeholder="0532 123 45 67"
              value={formData.phone}
              onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="city" className="flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              Şehir
            </Label>
            <Input
              id="city"
              placeholder="Hangi şehirdesiniz?"
              value={formData.city}
              onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="preferredTime" className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Tercih Edilen Arama Saati
            </Label>
            <Input
              id="preferredTime"
              placeholder="Örn: 14:00-18:00 arası"
              value={formData.preferredTime}
              onChange={(e) => setFormData(prev => ({ ...prev, preferredTime: e.target.value }))}
            />
          </div>
          
          <div className="flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2 pt-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => setIsOpen(false)}
              disabled={isSubmitting}
            >
              İptal
            </Button>
            <Button 
              type="submit" 
              disabled={!formData.name || !formData.phone || isSubmitting}
            >
              {isSubmitting ? 'Gönderiliyor...' : 'Randevu Talep Et'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}