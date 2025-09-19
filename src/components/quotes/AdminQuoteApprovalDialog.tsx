'use client'

import React, { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { CheckCircle, AlertTriangle, Package, DollarSign } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'
import { useToast } from '@/hooks/use-toast'

interface QuoteItem {
  id: string
  productId: string
  description: string
  quantity: number
  unitPrice: number
  total: number
  product?: {
    id: string
    name: string
    stock: number
  }
}

interface Quote {
  id: string
  quoteNumber: string
  total: number
  status: string
  items: QuoteItem[]
  customer: {
    id: string
    firstName?: string
    lastName?: string
    companyName?: string
  }
  project: {
    id: string
    name: string
  }
}

interface AdminQuoteApprovalDialogProps {
  quote: Quote
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

export function AdminQuoteApprovalDialog({
  quote,
  isOpen,
  onClose,
  onSuccess
}: AdminQuoteApprovalDialogProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [notes, setNotes] = useState('')
  const { toast } = useToast()

  const handleApprove = async () => {
    console.log('🟡 Frontend: Starting approval process for quote:', quote.id)
    setLoading(true)
    setError(null)

    try {
      console.log('🟡 Frontend: Making API call to /api/quotes/' + quote.id + '/approve')
      const response = await fetch(`/api/quotes/${quote.id}/approve`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          notes: notes.trim() || undefined
        }),
      })

      console.log('🟡 Frontend: API response status:', response.status)

      const data = await response.json()

      if (response.ok) {
        toast({
          title: "Teklif Onaylandı",
          description: "Teklif başarıyla onaylandı ve stoklar güncellendi",
        })
        onSuccess()
        onClose()
      } else {
        setError(data.error || 'Onaylama işlemi başarısız')
      }
    } catch (err) {
      setError('Bağlantı hatası')
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    setNotes('')
    setError(null)
    onClose()
  }

  const customerName = quote.customer
    ? (quote.customer.companyName ||
       `${quote.customer.firstName || ''} ${quote.customer.lastName || ''}`.trim() ||
       'İsimsiz Müşteri')
    : 'Müşteri Bilgisi Bulunamadı'

  // Check for stock issues
  const stockIssues = (quote.items || []).filter(item => {
    if (!item.product || item.productId?.startsWith('temp_')) return false
    return item.product.stock < item.quantity
  })

  const hasStockIssues = stockIssues.length > 0

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Teklif Onayı - Yönetici</DialogTitle>
          <DialogDescription>
            Teklif #{quote.quoteNumber} - {customerName} - {formatCurrency(quote.total)}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {error && (
            <Alert className="border-red-200 bg-red-50">
              <AlertTriangle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-800">{error}</AlertDescription>
            </Alert>
          )}

          {hasStockIssues && (
            <Alert className="border-orange-200 bg-orange-50">
              <AlertTriangle className="h-4 w-4 text-orange-600" />
              <AlertDescription className="text-orange-800">
                <strong>Stok Uyarısı:</strong> Bazı ürünlerde yetersiz stok bulunuyor.
                Onay durumunda mevcut stok sıfırlanacak veya eksi değer alacaktır.
              </AlertDescription>
            </Alert>
          )}

          {/* Quote Summary */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Müşteri
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="font-semibold">{customerName}</p>
                <p className="text-sm text-muted-foreground">{quote.project.name}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Toplam Tutar
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-primary">
                  {formatCurrency(quote.total)}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Ürün Sayısı
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">
                  {quote.items?.length || 0}
                </p>
                <p className="text-sm text-muted-foreground">
                  {(quote.items || []).reduce((sum, item) => sum + item.quantity, 0)} adet toplam
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Items List */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Teklif Kalemleri ve Stok Durumu
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {(quote.items || []).map((item) => {
                  const itemData = JSON.parse(item.description || '{}')
                  const isStockIssue = item.product && !item.productId?.startsWith('temp_') &&
                    item.product.stock < item.quantity

                  return (
                    <div
                      key={item.id}
                      className={`flex items-center justify-between p-3 border rounded-lg ${
                        isStockIssue ? 'border-orange-300 bg-orange-50' : 'border-gray-200'
                      }`}
                    >
                      <div className="flex-1">
                        <p className="font-medium">{itemData.name || 'Özel Kalem'}</p>
                        <p className="text-sm text-muted-foreground">
                          {itemData.description || ''}
                        </p>
                        <div className="flex items-center gap-4 mt-1 text-sm">
                          <span>Miktar: {item.quantity}</span>
                          <span>Birim: {formatCurrency(item.unitPrice)}</span>
                          <span className="font-medium">
                            Toplam: {formatCurrency(item.total)}
                          </span>
                        </div>
                      </div>

                      <div className="text-right ml-4">
                        {item.product && !item.productId?.startsWith('temp_') ? (
                          <div>
                            <p className={`text-sm font-medium ${
                              isStockIssue ? 'text-orange-600' : 'text-green-600'
                            }`}>
                              Mevcut Stok: {item.product.stock}
                            </p>
                            {isStockIssue && (
                              <p className="text-xs text-orange-600">
                                Yetersiz stok! ({item.quantity - item.product.stock} eksik)
                              </p>
                            )}
                          </div>
                        ) : (
                          <p className="text-sm text-muted-foreground">
                            Katalog dışı ürün
                          </p>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>

          {/* Admin Notes */}
          <Card>
            <CardHeader>
              <CardTitle>Onay Notları (Opsiyonel)</CardTitle>
            </CardHeader>
            <CardContent>
              <Label htmlFor="notes" className="text-sm text-muted-foreground">
                Bu onay ile ilgili notlarınızı yazabilirsiniz
              </Label>
              <Textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Onay notları, özel talimatlar veya açıklamalar..."
                rows={3}
                className="mt-2"
              />
            </CardContent>
          </Card>

          {/* Warning for Stock Reduction */}
          <Alert className="border-blue-200 bg-blue-50">
            <CheckCircle className="h-4 w-4 text-blue-600" />
            <AlertDescription className="text-blue-800">
              <strong>Onay Sonrası Değişiklikler:</strong>
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>Teklif durumu "ONAYLANDI" olarak güncellenecek</li>
                <li>Katalog ürünlerinin stokları otomatik düşülecek</li>
                <li>Onay tarihi ve onaylayan kişi kaydedilecek</li>
                <li>Bu işlem geri alınamaz</li>
              </ul>
            </AlertDescription>
          </Alert>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <Button
              onClick={handleApprove}
              disabled={loading}
              className="bg-green-600 hover:bg-green-700"
              size="lg"
            >
              {loading ? (
                'Onaylanıyor...'
              ) : (
                <>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Teklifi Onayla ve Stokları Düş
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
  )
}