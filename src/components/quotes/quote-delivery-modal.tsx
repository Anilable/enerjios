'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import {
  Mail,
  Phone,
  MessageCircle,
  Send,
  X,
  CheckCircle,
  AlertCircle,
  Loader2
} from 'lucide-react'

interface DeliveryMethod {
  type: 'email' | 'sms' | 'whatsapp'
  enabled: boolean
  recipient: string
  status?: 'pending' | 'sending' | 'sent' | 'failed'
}

interface QuoteDeliveryModalProps {
  isOpen: boolean
  onClose: () => void
  onSend: (methods: DeliveryMethod[]) => Promise<void>
  customerEmail?: string
  customerPhone?: string
  quoteNumber?: string
}

export function QuoteDeliveryModal({
  isOpen,
  onClose,
  onSend,
  customerEmail = '',
  customerPhone = '',
  quoteNumber = ''
}: QuoteDeliveryModalProps) {
  const [deliveryMethods, setDeliveryMethods] = useState<DeliveryMethod[]>([
    {
      type: 'email',
      enabled: !!customerEmail,
      recipient: customerEmail,
      status: 'pending'
    },
    {
      type: 'sms',
      enabled: false,
      recipient: customerPhone,
      status: 'pending'
    },
    {
      type: 'whatsapp',
      enabled: false,
      recipient: customerPhone,
      status: 'pending'
    }
  ])

  const [isSending, setIsSending] = useState(false)
  const [hasStartedSending, setHasStartedSending] = useState(false)

  const updateMethod = (type: 'email' | 'sms' | 'whatsapp', updates: Partial<DeliveryMethod>) => {
    setDeliveryMethods(prev => prev.map(method =>
      method.type === type ? { ...method, ...updates } : method
    ))
  }

  const handleSend = async () => {
    const enabledMethods = deliveryMethods.filter(method => method.enabled && method.recipient.trim())

    if (enabledMethods.length === 0) {
      return
    }

    setIsSending(true)
    setHasStartedSending(true)

    try {
      // Update status to sending for enabled methods
      enabledMethods.forEach(method => {
        updateMethod(method.type, { status: 'sending' })
      })

      await onSend(enabledMethods)

      // Update status to sent for all methods
      enabledMethods.forEach(method => {
        updateMethod(method.type, { status: 'sent' })
      })

      // Auto close after 2 seconds if all sent successfully
      setTimeout(() => {
        onClose()
      }, 2000)

    } catch (error) {
      console.error('Delivery failed:', error)
      // Update status to failed for all methods
      enabledMethods.forEach(method => {
        updateMethod(method.type, { status: 'failed' })
      })
    } finally {
      setIsSending(false)
    }
  }

  const getMethodIcon = (type: string) => {
    switch (type) {
      case 'email': return Mail
      case 'sms': return Phone
      case 'whatsapp': return MessageCircle
      default: return Mail
    }
  }

  const getMethodLabel = (type: string) => {
    switch (type) {
      case 'email': return 'E-posta'
      case 'sms': return 'SMS'
      case 'whatsapp': return 'WhatsApp'
      default: return type
    }
  }

  const getStatusIcon = (status?: string) => {
    switch (status) {
      case 'sending': return <Loader2 className="w-4 h-4 animate-spin text-blue-500" />
      case 'sent': return <CheckCircle className="w-4 h-4 text-green-500" />
      case 'failed': return <AlertCircle className="w-4 h-4 text-red-500" />
      default: return null
    }
  }

  const enabledCount = deliveryMethods.filter(m => m.enabled && m.recipient.trim()).length

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Send className="w-5 h-5" />
            Teklif Gönderme Yöntemi Seçin
          </DialogTitle>
          <DialogDescription>
            Teklif {quoteNumber} müşteriye hangi yöntemlerle gönderilsin?
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {deliveryMethods.map((method) => {
            const Icon = getMethodIcon(method.type)
            const label = getMethodLabel(method.type)
            const statusIcon = getStatusIcon(method.status)

            return (
              <div key={method.type} className="space-y-3">
                <div className="flex items-center space-x-3">
                  <Checkbox
                    id={method.type}
                    checked={method.enabled}
                    onCheckedChange={(checked) =>
                      updateMethod(method.type, { enabled: !!checked })
                    }
                    disabled={isSending || !method.recipient.trim()}
                  />
                  <Icon className="w-4 h-4 text-gray-500" />
                  <Label
                    htmlFor={method.type}
                    className="flex-1 font-medium"
                  >
                    {label}
                  </Label>
                  {statusIcon}
                </div>

                {method.enabled && (
                  <div className="ml-7">
                    <Input
                      placeholder={
                        method.type === 'email'
                          ? 'müşteri@email.com'
                          : '+90 555 123 4567'
                      }
                      value={method.recipient}
                      onChange={(e) =>
                        updateMethod(method.type, { recipient: e.target.value })
                      }
                      disabled={isSending}
                      type={method.type === 'email' ? 'email' : 'tel'}
                    />
                  </div>
                )}
              </div>
            )
          })}

          {enabledCount === 0 && (
            <div className="text-center py-4 text-gray-500">
              <AlertCircle className="w-8 h-8 mx-auto mb-2 text-gray-400" />
              <p className="text-sm">En az bir gönderim yöntemi seçin</p>
            </div>
          )}
        </div>

        <Separator />

        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isSending}
          >
            <X className="w-4 h-4 mr-2" />
            İptal
          </Button>

          <Button
            onClick={handleSend}
            disabled={enabledCount === 0 || isSending}
            className="min-w-[140px]"
          >
            {isSending ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Gönderiliyor...
              </>
            ) : (
              <>
                <Send className="w-4 h-4 mr-2" />
                {hasStartedSending ? 'Tekrar Gönder' : `${enabledCount} Yöntemle Gönder`}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}