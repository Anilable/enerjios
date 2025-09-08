'use client';

import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Card, CardContent } from '@/components/ui/card';
import { Mail, MessageCircle, Phone, Send, AlertTriangle, CheckCircle } from 'lucide-react';

interface QuoteSendDialogProps {
  quote: any;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function QuoteSendDialog({ quote, isOpen, onClose, onSuccess }: QuoteSendDialogProps) {
  const [selectedChannels, setSelectedChannels] = useState<string[]>(['EMAIL']);
  const [customerEmail, setCustomerEmail] = useState(quote?.customer?.user?.email || '');
  const [customerPhone, setCustomerPhone] = useState(quote?.customer?.phone || '');
  const [customerName, setCustomerName] = useState(
    quote?.customer?.companyName || 
    `${quote?.customer?.firstName || ''} ${quote?.customer?.lastName || ''}`.trim() ||
    ''
  );
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleChannelToggle = (channel: string) => {
    setSelectedChannels(prev => 
      prev.includes(channel) 
        ? prev.filter(c => c !== channel)
        : [...prev, channel]
    );
  };

  const handleSubmit = async () => {
    if (selectedChannels.length === 0) {
      setError('Lütfen en az bir gönderim kanalı seçin');
      return;
    }

    if (selectedChannels.includes('EMAIL') && !customerEmail.trim()) {
      setError('Email gönderimi için müşteri email adresi gerekli');
      return;
    }

    if (selectedChannels.includes('WHATSAPP') && !customerPhone.trim()) {
      setError('WhatsApp gönderimi için müşteri telefon numarası gerekli');
      return;
    }

    if (!customerName.trim()) {
      setError('Müşteri adı gerekli');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch(`/api/quotes/${quote.id}/send`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          channels: selectedChannels,
          customerEmail: customerEmail.trim() || undefined,
          customerPhone: customerPhone.trim() || undefined,
          customerName: customerName.trim(),
          message: message.trim() || undefined
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess('Teklif başarıyla gönderildi');
        setTimeout(() => {
          onSuccess();
          onClose();
        }, 2000);
      } else {
        setError(data.error || 'Gönderim başarısız');
      }
    } catch (err) {
      setError('Bağlantı hatası');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY',
      minimumFractionDigits: 2
    }).format(amount);
  };

  const resetForm = () => {
    setSelectedChannels(['EMAIL']);
    setCustomerEmail(quote?.customer?.user?.email || '');
    setCustomerPhone(quote?.customer?.phone || '');
    setCustomerName(
      quote?.customer?.companyName || 
      `${quote?.customer?.firstName || ''} ${quote?.customer?.lastName || ''}`.trim() ||
      ''
    );
    setMessage('');
    setError(null);
    setSuccess(null);
  };

  const handleClose = () => {
    if (!loading) {
      resetForm();
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <Send className="h-5 w-5 mr-2" />
            Teklif Gönder
          </DialogTitle>
          <DialogDescription>
            Teklif #{quote?.quoteNumber} - {formatCurrency(quote?.total || 0)}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {error && (
            <Alert className="border-red-200 bg-red-50">
              <AlertTriangle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-800">{error}</AlertDescription>
            </Alert>
          )}

          {success && (
            <Alert className="border-green-200 bg-green-50">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">{success}</AlertDescription>
            </Alert>
          )}

          {/* Delivery Channels */}
          <div className="space-y-4">
            <Label className="text-base font-semibold">Gönderim Kanalları</Label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Card 
                className={`cursor-pointer transition-all ${
                  selectedChannels.includes('EMAIL') 
                    ? 'ring-2 ring-blue-500 bg-blue-50' 
                    : 'hover:shadow-md'
                }`}
                onClick={() => handleChannelToggle('EMAIL')}
              >
                <CardContent className="p-4 text-center">
                  <Mail className={`h-8 w-8 mx-auto mb-2 ${
                    selectedChannels.includes('EMAIL') ? 'text-blue-600' : 'text-gray-400'
                  }`} />
                  <h4 className="font-medium">Email</h4>
                  <p className="text-xs text-gray-600 mt-1">
                    PDF ek ile gönderim
                  </p>
                  <div className="mt-2">
                    <Checkbox 
                      checked={selectedChannels.includes('EMAIL')}
                      onChange={() => handleChannelToggle('EMAIL')}
                    />
                  </div>
                </CardContent>
              </Card>

              <Card 
                className={`cursor-pointer transition-all ${
                  selectedChannels.includes('WHATSAPP') 
                    ? 'ring-2 ring-green-500 bg-green-50' 
                    : 'hover:shadow-md'
                }`}
                onClick={() => handleChannelToggle('WHATSAPP')}
              >
                <CardContent className="p-4 text-center">
                  <MessageCircle className={`h-8 w-8 mx-auto mb-2 ${
                    selectedChannels.includes('WHATSAPP') ? 'text-green-600' : 'text-gray-400'
                  }`} />
                  <h4 className="font-medium">WhatsApp</h4>
                  <p className="text-xs text-gray-600 mt-1">
                    Link ile gönderim
                  </p>
                  <div className="mt-2">
                    <Checkbox 
                      checked={selectedChannels.includes('WHATSAPP')}
                      onChange={() => handleChannelToggle('WHATSAPP')}
                    />
                  </div>
                </CardContent>
              </Card>

              <Card 
                className={`cursor-pointer transition-all opacity-50 ${
                  selectedChannels.includes('SMS') 
                    ? 'ring-2 ring-purple-500 bg-purple-50' 
                    : 'hover:shadow-md'
                }`}
                onClick={() => {}} // Disabled for now
              >
                <CardContent className="p-4 text-center">
                  <Phone className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                  <h4 className="font-medium text-gray-500">SMS</h4>
                  <p className="text-xs text-gray-500 mt-1">
                    Yakında aktif
                  </p>
                  <div className="mt-2">
                    <Checkbox disabled />
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Customer Information */}
          <div className="space-y-4">
            <Label className="text-base font-semibold">Müşteri Bilgileri</Label>
            
            <div>
              <Label htmlFor="customerName">Ad Soyad / Firma Adı *</Label>
              <Input
                id="customerName"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="Müşteri adı veya firma adı"
                required
              />
            </div>

            {selectedChannels.includes('EMAIL') && (
              <div>
                <Label htmlFor="customerEmail">Email Adresi *</Label>
                <Input
                  id="customerEmail"
                  type="email"
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                  placeholder="musteri@example.com"
                  required
                />
              </div>
            )}

            {selectedChannels.includes('WHATSAPP') && (
              <div>
                <Label htmlFor="customerPhone">Telefon Numarası *</Label>
                <Input
                  id="customerPhone"
                  type="tel"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  placeholder="0555 123 45 67"
                  required
                />
              </div>
            )}
          </div>

          {/* Custom Message */}
          <div className="space-y-2">
            <Label htmlFor="message">Özel Mesaj (Opsiyonel)</Label>
            <Textarea
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Müşteriye özel bir mesaj eklemek istiyorsanız buraya yazın..."
              rows={3}
            />
            <p className="text-xs text-gray-500">
              Bu mesaj otomatik teklif metni ile birlikte gönderilecektir.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <Button
              onClick={handleSubmit}
              disabled={loading || selectedChannels.length === 0}
              className="flex-1"
              size="lg"
            >
              {loading ? (
                'Gönderiliyor...'
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Teklifi Gönder
                </>
              )}
            </Button>
            <Button
              onClick={handleClose}
              variant="outline"
              disabled={loading}
              size="lg"
            >
              İptal
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}