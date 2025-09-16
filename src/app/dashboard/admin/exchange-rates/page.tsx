'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'

interface ManualRate {
  id: string
  currency: string
  rate: number
  description?: string
  isActive: boolean
  createdAt: string
  updatedAt: string
  creator: {
    email: string
    name?: string
  }
}

export default function AdminExchangeRatesPage() {
  const [rates, setRates] = useState<ManualRate[]>([])
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)

  // Form state for bulk update
  const [formData, setFormData] = useState({
    USD: '',
    EUR: '',
    CNY: ''
  })

  // Fetch current manual rates
  const fetchRates = async () => {
    try {
      const response = await fetch('/api/admin/exchange-rates')
      if (response.ok) {
        const data = await response.json()
        setRates(data.data || [])
      } else {
        const errorData = await response.json()
        toast.error(`API Error: ${errorData.error}`)
      }
    } catch (error) {
      toast.error('Manuel kurlar yüklenirken hata oluştu')
      console.error('Fetch error:', error)
    } finally {
      setLoading(false)
    }
  }

  // Update exchange rates
  const updateRates = async () => {
    setUpdating(true)

    try {
      // Filter out empty values and convert to numbers
      const ratesToUpdate = Object.entries(formData)
        .filter(([_, value]) => value.trim() !== '')
        .map(([currency, value]) => ({
          currency,
          rate: parseFloat(value.replace(',', '.')),
          description: `Admin tarafından güncellendi - ${new Date().toLocaleString('tr-TR')}`
        }))

      if (ratesToUpdate.length === 0) {
        toast.error('En az bir kur değeri girmelisiniz')
        return
      }

      const response = await fetch('/api/admin/exchange-rates', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          rates: ratesToUpdate
        })
      })

      const data = await response.json()

      if (response.ok) {
        toast.success(data.message)
        setFormData({ USD: '', EUR: '', CNY: '' })
        await fetchRates()
      } else {
        toast.error(data.error || 'Kurlar güncellenirken hata oluştu')
      }
    } catch (error) {
      toast.error('Güncellemede hata oluştu')
      console.error('Update error:', error)
    } finally {
      setUpdating(false)
    }
  }

  // Delete a rate
  const deleteRate = async (id: string, currency: string) => {
    if (!confirm(`${currency} kurunu silmek istediğinize emin misiniz?`)) {
      return
    }

    try {
      const response = await fetch(`/api/admin/exchange-rates/${id}`, {
        method: 'DELETE'
      })

      const data = await response.json()

      if (response.ok) {
        toast.success(data.message)
        await fetchRates()
      } else {
        toast.error(data.error || 'Silme işlemi başarısız')
      }
    } catch (error) {
      toast.error('Silme işleminde hata oluştu')
      console.error('Delete error:', error)
    }
  }

  useEffect(() => {
    fetchRates()
  }, [])

  const handleInputChange = (currency: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [currency]: value
    }))
  }

  if (loading) {
    return (
      <div className="container mx-auto py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="space-y-4">
            <div className="h-32 bg-gray-200 rounded"></div>
            <div className="h-32 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Manuel Döviz Kurları</h1>
          <p className="text-muted-foreground">
            TCMB otomatik kurlarını manuel değerlerle geçersiz kılın
          </p>
        </div>
        <Button onClick={fetchRates} variant="outline">
          🔄 Yenile
        </Button>
      </div>

      {/* Update Form */}
      <Card>
        <CardHeader>
          <CardTitle>Kurları Güncelle</CardTitle>
          <CardDescription>
            USD, EUR ve CNY kurlarını manuel olarak güncelleyin. Boş bırakılan kurlar değiştirilmez.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="USD">USD Kuru</Label>
              <Input
                id="USD"
                type="number"
                step="0.0001"
                placeholder="30.1234"
                value={formData.USD}
                onChange={(e) => handleInputChange('USD', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="EUR">EUR Kuru</Label>
              <Input
                id="EUR"
                type="number"
                step="0.0001"
                placeholder="33.5678"
                value={formData.EUR}
                onChange={(e) => handleInputChange('EUR', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="CNY">CNY Kuru</Label>
              <Input
                id="CNY"
                type="number"
                step="0.0001"
                placeholder="4.1234"
                value={formData.CNY}
                onChange={(e) => handleInputChange('CNY', e.target.value)}
              />
            </div>
          </div>
          <Button
            onClick={updateRates}
            disabled={updating}
            className="w-full md:w-auto"
          >
            {updating ? '⏳ Güncelleniyor...' : '💾 Kurları Kaydet'}
          </Button>
        </CardContent>
      </Card>

      {/* Current Manual Rates */}
      <Card>
        <CardHeader>
          <CardTitle>Mevcut Manuel Kurlar ({rates.length})</CardTitle>
          <CardDescription>
            Şu anda aktif olan manuel döviz kurları
          </CardDescription>
        </CardHeader>
        <CardContent>
          {rates.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p>Henüz manuel kur tanımlanmamış</p>
              <p className="text-sm">Yukarıdaki formu kullanarak manuel kur ekleyebilirsiniz</p>
            </div>
          ) : (
            <div className="space-y-4">
              {rates.map((rate) => (
                <div
                  key={rate.id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="font-mono">
                        {rate.currency}
                      </Badge>
                      <span className="font-semibold text-lg">
                        {rate.rate.toFixed(4)} ₺
                      </span>
                      {rate.isActive && (
                        <Badge variant="default" className="bg-green-500">
                          Aktif
                        </Badge>
                      )}
                    </div>
                    {rate.description && (
                      <p className="text-sm text-muted-foreground">
                        {rate.description}
                      </p>
                    )}
                    <p className="text-xs text-muted-foreground">
                      {rate.creator.name || rate.creator.email} • {' '}
                      {new Date(rate.updatedAt).toLocaleString('tr-TR')}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => deleteRate(rate.id, rate.currency)}
                    >
                      🗑️ Sil
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Test Section */}
      <Card>
        <CardHeader>
          <CardTitle>API Testi</CardTitle>
          <CardDescription>
            Manuel kurların exchange-rates API'sinde çalışıp çalışmadığını test edin
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button
            variant="outline"
            onClick={() => {
              window.open('/api/exchange-rates', '_blank')
            }}
          >
            🔗 Exchange Rates API'sini Aç
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}