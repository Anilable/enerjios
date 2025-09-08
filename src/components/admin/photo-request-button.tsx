'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/hooks/use-toast'
import { Camera, Send, Loader2 } from 'lucide-react'
import { useSession } from 'next-auth/react'

interface PhotoRequestButtonProps {
  customerId?: string
  customerName: string
  customerEmail?: string
  customerPhone?: string
  projectId?: string
  projectName?: string
  variant?: 'default' | 'outline' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  trigger?: React.ReactNode
}

export function PhotoRequestButton({
  customerId,
  customerName,
  customerEmail,
  customerPhone,
  projectId,
  projectName,
  variant = 'outline',
  size = 'sm',
  trigger
}: PhotoRequestButtonProps) {
  const { data: session } = useSession()
  const { toast } = useToast()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    engineerName: session?.user?.name || '',
    engineerTitle: 'Mühendis',
    customerEmail: customerEmail || '',
    customerPhone: customerPhone || '',
    message: `Merhaba ${customerName},

Ben TrakyaSolar'dan ${session?.user?.name || 'Mühendis'}. ${projectName ? projectName + ' projesi için' : ''} teklifinizi hazırlamak üzere çalışıyorum.

Size en uygun çözümü sunabilmemiz için çatınızdan birkaç fotoğraf çekmemiz gerekiyor. Aşağıdaki linke tıklayarak fotoğraflarınızı kolayca yükleyebilirsiniz.

Teşekkürler,
${session?.user?.name || 'TrakyaSolar Ekibi'}`,
    guidelines: `Fotoğraf çekerken lütfen şu noktalara dikkat edin:

• Çatınızı geniş açıdan çekin (mümkünse uzaktan)
• Gün ışığında, net görüntüler alın
• Çatının tüm yönlerini gösterin (kuzey, güney, doğu, batı)
• Bacalar, anten gibi engelleri belirtin
• Çevre binaların gölge durumunu gösterin
• En az 4-5 farklı açıdan fotoğraf çekin

Fotoğraflar güneş enerjisi sistem tasarımında çok kritik rol oynar. Net ve detaylı fotoğraflar, size daha doğru ve uygun fiyatlı teklifler sunmamızı sağlar.`,
    expiryDays: 7
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!session?.user?.id) {
      toast({
        title: 'Hata',
        description: 'Oturum açmanız gerekiyor',
        variant: 'destructive'
      })
      return
    }

    setLoading(true)
    try {
      // Check if customerId is a mock ID (numeric string) and skip it
      const isMockCustomerId = customerId && /^\d+$/.test(customerId)
      
      const requestData = {
        // Only include customerId if it's a real database ID (not mock)
        ...(customerId && !isMockCustomerId ? { customerId } : {}),
        ...(projectId ? { projectId } : {}),
        customerName,
        customerEmail: formData.customerEmail,
        customerPhone: formData.customerPhone,
        engineerName: formData.engineerName,
        engineerTitle: formData.engineerTitle,
        message: formData.message,
        guidelines: formData.guidelines,
        expiryDays: formData.expiryDays,
        requestedById: session.user.id
      }
      
      console.log('📤 Sending photo request with data:', {
        ...requestData,
        isMockCustomerId,
        originalCustomerId: customerId
      })
      
      const response = await fetch('/api/admin/photo-request', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData)
      })

      if (!response.ok) {
        const errorData = await response.json()
        console.error('❌ Photo request error:', errorData)
        throw new Error(errorData.details || errorData.error || 'Fotoğraf talebi gönderilirken hata oluştu')
      }

      const result = await response.json()
      
      // Show success message with email status
      const emailStatus = result.emailSent ? 
        '✅ E-posta gönderildi' : 
        `⚠️ E-posta gönderilemedi: ${result.emailError || 'Bilinmeyen hata'}`
      
      toast({
        title: 'Başarılı',
        description: `Fotoğraf talebi oluşturuldu.\n${emailStatus}\nToken: ${result.token.substring(0, 12)}...`,
        duration: result.emailSent ? 5000 : 8000
      })
      
      console.log('📧 Email Status:', { 
        sent: result.emailSent, 
        error: result.emailError, 
        messageId: result.messageId,
        token: result.token,
        uploadUrl: result.uploadUrl
      })
      
      setOpen(false)
    } catch (error) {
      toast({
        title: 'Hata',
        description: error instanceof Error ? error.message : 'Bir hata oluştu',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant={variant} size={size} className="gap-2">
            <Camera className="h-4 w-4" />
            Fotoğraf İste
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Camera className="h-5 w-5" />
            Fotoğraf Talebi Gönder
          </DialogTitle>
          <DialogDescription>
            {customerName}'dan {projectName ? `${projectName} projesi için` : ''} çatı fotoğrafları talep et
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="engineerName">Mühendis Adı</Label>
              <Input
                id="engineerName"
                value={formData.engineerName}
                onChange={(e) => setFormData(prev => ({ ...prev, engineerName: e.target.value }))}
                required
              />
            </div>
            <div>
              <Label htmlFor="engineerTitle">Ünvan</Label>
              <Input
                id="engineerTitle"
                value={formData.engineerTitle}
                onChange={(e) => setFormData(prev => ({ ...prev, engineerTitle: e.target.value }))}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="customerEmail">Müşteri E-posta</Label>
              <Input
                id="customerEmail"
                type="email"
                value={formData.customerEmail}
                onChange={(e) => setFormData(prev => ({ ...prev, customerEmail: e.target.value }))}
                placeholder="ornek@email.com"
              />
            </div>
            <div>
              <Label htmlFor="customerPhone">Müşteri Telefon</Label>
              <Input
                id="customerPhone"
                value={formData.customerPhone}
                onChange={(e) => setFormData(prev => ({ ...prev, customerPhone: e.target.value }))}
                placeholder="0532 123 45 67"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="message">Mesaj</Label>
            <Textarea
              id="message"
              value={formData.message}
              onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
              rows={6}
              required
            />
          </div>

          <div>
            <Label htmlFor="guidelines">Fotoğraf Rehberi</Label>
            <Textarea
              id="guidelines"
              value={formData.guidelines}
              onChange={(e) => setFormData(prev => ({ ...prev, guidelines: e.target.value }))}
              rows={8}
              required
            />
          </div>

          <div>
            <Label htmlFor="expiryDays">Geçerlilik Süresi (Gün)</Label>
            <Input
              id="expiryDays"
              type="number"
              min="1"
              max="30"
              value={formData.expiryDays}
              onChange={(e) => setFormData(prev => ({ ...prev, expiryDays: parseInt(e.target.value) || 7 }))}
              required
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              İptal
            </Button>
            <Button type="submit" disabled={loading} className="gap-2">
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
              Talebi Gönder
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}