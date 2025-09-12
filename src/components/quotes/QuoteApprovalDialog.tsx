'use client';

import React, { useState, useRef } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Card, CardContent } from '@/components/ui/card';
import { CheckCircle, XCircle, PenTool, AlertTriangle } from 'lucide-react';
import SignatureCanvas from 'react-signature-canvas';

interface QuoteApprovalDialogProps {
  quote: any;
  token: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function QuoteApprovalDialog({ quote, token, isOpen, onClose, onSuccess }: QuoteApprovalDialogProps) {
  const [action, setAction] = useState<'approve' | 'reject' | null>(null);
  const [comments, setComments] = useState('');
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showSignature, setShowSignature] = useState(false);
  
  const signatureRef = useRef<SignatureCanvas>(null);

  const handleSubmit = async () => {
    if (!action) return;

    if (action === 'approve' && !acceptedTerms) {
      setError('Lütfen şartları kabul edin');
      return;
    }

    if (action === 'approve' && !customerName.trim()) {
      setError('Lütfen adınızı girin');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      let signatureData = null;
      if (action === 'approve' && signatureRef.current && !signatureRef.current.isEmpty()) {
        signatureData = signatureRef.current.toDataURL();
      }

      const response = await fetch(`/api/quotes/public/${token}/${action}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          customerName,
          customerPhone,
          comments,
          signatureData,
          acceptedTerms: action === 'approve' ? acceptedTerms : undefined
        }),
      });

      const data = await response.json();

      if (response.ok) {
        onSuccess();
        onClose();
      } else {
        setError(data.error || 'İşlem başarısız');
      }
    } catch (err) {
      setError('Bağlantı hatası');
    } finally {
      setLoading(false);
    }
  };

  const clearSignature = () => {
    if (signatureRef.current) {
      signatureRef.current.clear();
    }
  };

  const resetForm = () => {
    setAction(null);
    setComments('');
    setAcceptedTerms(false);
    setCustomerName('');
    setCustomerPhone('');
    setError(null);
    setShowSignature(false);
    if (signatureRef.current) {
      signatureRef.current.clear();
    }
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY',
      minimumFractionDigits: 2
    }).format(amount);
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Teklif Değerlendirmesi</DialogTitle>
          <DialogDescription>
            Teklif #{quote.quoteNumber} - {formatCurrency(quote.total)}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {error && (
            <Alert className="border-red-200 bg-red-50">
              <AlertTriangle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-800">{error}</AlertDescription>
            </Alert>
          )}

          {/* Action Selection */}
          {!action && (
            <div className="space-y-4">
              <div className="text-center">
                <h3 className="text-lg font-semibold mb-2">Bu teklifi değerlendirin</h3>
                <p className="text-gray-600">Lütfen seçiminizi yapın:</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Card 
                  className="cursor-pointer hover:shadow-md transition-shadow border-green-200 hover:border-green-400"
                  onClick={() => setAction('approve')}
                >
                  <CardContent className="p-6 text-center">
                    <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-3" />
                    <h4 className="font-semibold text-green-800">Teklifi Onayla</h4>
                    <p className="text-sm text-gray-600 mt-2">
                      Bu teklifi kabul ediyorum
                    </p>
                  </CardContent>
                </Card>

                <Card 
                  className="cursor-pointer hover:shadow-md transition-shadow border-red-200 hover:border-red-400"
                  onClick={() => setAction('reject')}
                >
                  <CardContent className="p-6 text-center">
                    <XCircle className="h-12 w-12 text-red-600 mx-auto mb-3" />
                    <h4 className="font-semibold text-red-800">Teklifi Reddet</h4>
                    <p className="text-sm text-gray-600 mt-2">
                      Bu teklifi kabul etmiyorum
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {/* Approval Form */}
          {action === 'approve' && (
            <div className="space-y-4">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
                  <h4 className="font-semibold text-green-800">Teklif Onayı</h4>
                </div>
                <p className="text-sm text-green-700 mt-1">
                  Bu teklifi onaylamak üzeresiniz. Lütfen aşağıdaki bilgileri doldurun.
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="customerName">Ad Soyad / Firma Adı *</Label>
                  <input
                    id="customerName"
                    type="text"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                    placeholder="Adınızı veya firma adınızı girin"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="customerPhone">Telefon</Label>
                  <input
                    id="customerPhone"
                    type="tel"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                    placeholder="İletişim telefon numaranız (opsiyonel)"
                  />
                </div>

                <div>
                  <Label htmlFor="comments">Yorumlar (Opsiyonel)</Label>
                  <Textarea
                    id="comments"
                    value={comments}
                    onChange={(e) => setComments(e.target.value)}
                    placeholder="Ek yorumlarınız varsa buraya yazabilirsiniz..."
                    rows={3}
                  />
                </div>

                {/* Digital Signature */}
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="showSignature"
                      checked={showSignature}
                      onCheckedChange={(checked) => setShowSignature(checked as boolean)}
                    />
                    <Label htmlFor="showSignature" className="flex items-center">
                      <PenTool className="h-4 w-4 mr-1" />
                      Dijital imza ekle
                    </Label>
                  </div>

                  {showSignature && (
                    <div className="border rounded-lg p-4">
                      <Label className="text-sm font-medium mb-2 block">Dijital İmza</Label>
                      <div className="border rounded-md bg-white">
                        <SignatureCanvas
                          ref={signatureRef}
                          canvasProps={{
                            width: 400,
                            height: 150,
                            className: 'signature-canvas w-full'
                          }}
                        />
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={clearSignature}
                        className="mt-2"
                      >
                        İmzayı Temizle
                      </Button>
                    </div>
                  )}
                </div>

                {/* Terms Acceptance */}
                <div className="space-y-3">
                  <div className="flex items-start space-x-2">
                    <Checkbox
                      id="acceptTerms"
                      checked={acceptedTerms}
                      onCheckedChange={(checked) => setAcceptedTerms(checked as boolean)}
                      required
                    />
                    <Label htmlFor="acceptTerms" className="text-sm leading-5">
                      Bu teklifte belirtilen şartları kabul ediyorum. Proje başlatma sürecinin 
                      başlatılması için gerekli ön ödemeleri zamanında yapacağımı taahhüt ederim.
                    </Label>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Rejection Form */}
          {action === 'reject' && (
            <div className="space-y-4">
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-center">
                  <XCircle className="h-5 w-5 text-red-600 mr-2" />
                  <h4 className="font-semibold text-red-800">Teklif Reddi</h4>
                </div>
                <p className="text-sm text-red-700 mt-1">
                  Bu teklifi reddetmek üzeresiniz. Geri bildiriminiz bizim için değerli.
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="customerName">Ad Soyad / Firma Adı *</Label>
                  <input
                    id="customerName"
                    type="text"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                    placeholder="Adınızı veya firma adınızı girin"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="comments">Red Sebebi (Opsiyonel)</Label>
                  <Textarea
                    id="comments"
                    value={comments}
                    onChange={(e) => setComments(e.target.value)}
                    placeholder="Teklifi reddetme sebebinizi paylaşır mısınız? Bu, gelecekte size daha iyi teklifler sunmamıza yardımcı olur."
                    rows={4}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          {action && (
            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              <Button
                onClick={handleSubmit}
                disabled={loading}
                className={action === 'approve' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'}
                size="lg"
              >
                {loading ? (
                  'İşleniyor...'
                ) : (
                  <>
                    {action === 'approve' ? (
                      <>
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Teklifi Onayla
                      </>
                    ) : (
                      <>
                        <XCircle className="h-4 w-4 mr-2" />
                        Teklifi Reddet
                      </>
                    )}
                  </>
                )}
              </Button>
              <Button
                onClick={() => setAction(null)}
                variant="outline"
                disabled={loading}
                size="lg"
              >
                Geri
              </Button>
            </div>
          )}

          {!action && (
            <div className="flex justify-end">
              <Button onClick={handleClose} variant="outline">
                İptal
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}