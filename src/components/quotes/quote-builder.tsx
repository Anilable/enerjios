'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { 
  Plus,
  Trash2,
  Calculator,
  User,
  Zap,
  Package,
  Wrench,
  TrendingUp,
  Save,
  Send,
  AlertCircle,
  CheckCircle
} from 'lucide-react'
import type { QuoteData, QuoteItem } from '@/app/dashboard/quotes/page'

interface QuoteBuilderProps {
  quote: QuoteData | null
  onSave: (quote: QuoteData) => void
  onCancel: () => void
}

interface ProductCatalog {
  panels: Array<{
    id: string
    name: string
    brand: string
    power: number
    voltage: number
    current: number
    efficiency: number
    warranty: number
    price: number
  }>
  inverters: Array<{
    id: string
    name: string
    brand: string
    power: number
    inputVoltage: string
    phases: number
    efficiency: number
    warranty: number
    price: number
  }>
  accessories: Array<{
    id: string
    name: string
    category: string
    unit: string
    price: number
  }>
}

const productCatalog: ProductCatalog = {
  panels: [
    {
      id: 'jinko_540',
      name: 'Tiger Neo 540W',
      brand: 'Jinko Solar',
      power: 540,
      voltage: 41.8,
      current: 12.92,
      efficiency: 21.2,
      warranty: 25,
      price: 950
    },
    {
      id: 'canadian_545',
      name: 'HiKu7 545W',
      brand: 'Canadian Solar',
      power: 545,
      voltage: 41.9,
      current: 13.01,
      efficiency: 21.6,
      warranty: 25,
      price: 970
    },
    {
      id: 'trina_550',
      name: 'Vertex S 550W',
      brand: 'Trina Solar',
      power: 550,
      voltage: 42.1,
      current: 13.06,
      efficiency: 21.8,
      warranty: 25,
      price: 990
    }
  ],
  inverters: [
    {
      id: 'huawei_15k',
      name: 'SUN2000-15KTL-M0',
      brand: 'Huawei',
      power: 15000,
      inputVoltage: '200-1000V',
      phases: 3,
      efficiency: 98.6,
      warranty: 10,
      price: 8500
    },
    {
      id: 'sma_12k',
      name: 'Sunny Tripower 12000TL',
      brand: 'SMA',
      power: 12000,
      inputVoltage: '250-800V',
      phases: 3,
      efficiency: 98.3,
      warranty: 10,
      price: 7800
    }
  ],
  accessories: [
    {
      id: 'mounting_rail',
      name: 'Alüminyum Montaj Rayı',
      category: 'Montaj',
      unit: 'metre',
      price: 45
    },
    {
      id: 'mounting_clamp',
      name: 'Panel Kelepçesi',
      category: 'Montaj', 
      unit: 'adet',
      price: 25
    },
    {
      id: 'dc_cable',
      name: 'DC Kablo 4mm²',
      category: 'Kablo',
      unit: 'metre',
      price: 12
    },
    {
      id: 'ac_cable',
      name: 'AC Kablo 16mm²',
      category: 'Kablo',
      unit: 'metre',
      price: 18
    }
  ]
}

export function QuoteBuilder({ quote, onSave, onCancel }: QuoteBuilderProps) {
  const [formData, setFormData] = useState({
    customerName: '',
    customerEmail: '',
    customerPhone: '',
    customerAddress: '',
    projectTitle: '',
    systemSize: 0,
    panelCount: 0,
    validityDays: 30
  })

  const [items, setItems] = useState<QuoteItem[]>([])
  const [laborHours, setLaborHours] = useState(24)
  const [laborRate, setLaborRate] = useState(150)
  const [marginPercent, setMarginPercent] = useState(25)
  const [taxPercent] = useState(18)
  
  const [calculations, setCalculations] = useState({
    subtotal: 0,
    laborCost: 0,
    margin: 0,
    tax: 0,
    total: 0,
    profitAmount: 0
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  // Load existing quote data
  useEffect(() => {
    if (quote) {
      setFormData({
        customerName: quote.customerName,
        customerEmail: quote.customerEmail,
        customerPhone: quote.customerPhone,
        customerAddress: '', // Not in current QuoteData type
        projectTitle: quote.projectTitle,
        systemSize: quote.systemSize,
        panelCount: quote.panelCount,
        validityDays: 30
      })
      setItems(quote.items)
      setLaborHours(Math.floor(quote.laborCost / laborRate))
      setMarginPercent(quote.margin)
    }
  }, [quote])

  // Calculate totals when items or settings change
  useEffect(() => {
    calculateTotals()
  }, [items, laborHours, laborRate, marginPercent])

  const calculateTotals = () => {
    const subtotal = items.reduce((sum, item) => sum + item.totalPrice, 0)
    const laborCost = laborHours * laborRate
    const subtotalWithLabor = subtotal + laborCost
    const marginAmount = (subtotalWithLabor * marginPercent) / 100
    const taxableAmount = subtotalWithLabor + marginAmount
    const tax = (taxableAmount * taxPercent) / 100
    const total = taxableAmount + tax

    setCalculations({
      subtotal,
      laborCost,
      margin: marginAmount,
      tax,
      total,
      profitAmount: marginAmount
    })
  }

  const addItem = (type: QuoteItem['type']) => {
    const newItem: QuoteItem = {
      id: Date.now().toString(),
      type,
      name: '',
      quantity: 1,
      unitPrice: 0,
      totalPrice: 0
    }
    setItems(prev => [...prev, newItem])
  }

  const updateItem = (id: string, updates: Partial<QuoteItem>) => {
    setItems(prev => prev.map(item => {
      if (item.id === id) {
        const updated = { ...item, ...updates }
        updated.totalPrice = updated.quantity * updated.unitPrice
        return updated
      }
      return item
    }))
  }

  const removeItem = (id: string) => {
    setItems(prev => prev.filter(item => item.id !== id))
  }

  const selectProduct = (itemId: string, productId: string, type: 'panel' | 'inverter') => {
    const product = type === 'panel' 
      ? productCatalog.panels.find(p => p.id === productId)
      : productCatalog.inverters.find(p => p.id === productId)
    
    if (product) {
      updateItem(itemId, {
        name: product.name,
        brand: product.brand,
        unitPrice: product.price,
        specifications: product
      })
    }
  }

  const addPanelSet = () => {
    const panel = productCatalog.panels[0] // Default to first panel
    const newItem: QuoteItem = {
      id: Date.now().toString(),
      type: 'PANEL',
      name: panel.name,
      brand: panel.brand,
      quantity: formData.panelCount || 20,
      unitPrice: panel.price,
      totalPrice: (formData.panelCount || 20) * panel.price,
      specifications: panel
    }
    setItems(prev => [...prev, newItem])
  }

  const addInverterSet = () => {
    const inverter = productCatalog.inverters[0] // Default to first inverter
    const quantity = Math.ceil((formData.systemSize || 10) / 15) // 15kW inverters
    const newItem: QuoteItem = {
      id: Date.now().toString(),
      type: 'INVERTER',
      name: inverter.name,
      brand: inverter.brand,
      quantity,
      unitPrice: inverter.price,
      totalPrice: quantity * inverter.price,
      specifications: inverter
    }
    setItems(prev => [...prev, newItem])
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}
    
    if (!formData.customerName) newErrors.customerName = 'Müşteri adı gerekli'
    if (!formData.customerEmail) newErrors.customerEmail = 'Email gerekli'
    if (!formData.customerPhone) newErrors.customerPhone = 'Telefon gerekli'
    if (!formData.projectTitle) newErrors.projectTitle = 'Proje başlığı gerekli'
    if (items.length === 0) newErrors.items = 'En az bir ürün eklemelisiniz'
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSave = () => {
    if (!validateForm()) return

    const validUntil = new Date()
    validUntil.setDate(validUntil.getDate() + formData.validityDays)

    const newQuote: QuoteData = {
      id: quote?.id || Date.now().toString(),
      quoteNumber: quote?.quoteNumber || `TKF-${new Date().getFullYear()}-${Math.random().toString(36).substr(2, 3).toUpperCase()}`,
      customerId: quote?.customerId || 'temp_customer',
      customerName: formData.customerName,
      customerEmail: formData.customerEmail,
      customerPhone: formData.customerPhone,
      projectTitle: formData.projectTitle,
      status: 'DRAFT',
      systemSize: formData.systemSize,
      panelCount: formData.panelCount,
      items,
      subtotal: calculations.subtotal,
      laborCost: calculations.laborCost,
      tax: calculations.tax,
      total: calculations.total,
      validUntil,
      margin: marginPercent,
      profitAmount: calculations.profitAmount,
      financialAnalysis: {
        annualProduction: formData.systemSize * 1300, // Mock calculation
        investment: calculations.total,
        annualSavings: Math.round(formData.systemSize * 1300 * 2.2 * 0.9),
        paybackPeriod: Math.round((calculations.total / (formData.systemSize * 1300 * 2.2 * 0.9)) * 10) / 10,
        npv25: Math.round(calculations.total * 1.8),
        irr: 12.5,
        cashFlow: []
      },
      createdAt: quote?.createdAt || new Date(),
      updatedAt: new Date(),
      version: quote ? quote.version + 1 : 1
    }

    onSave(newQuote)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            {quote ? 'Teklifi Düzenle' : 'Yeni Teklif Oluştur'}
          </h2>
          <p className="text-gray-600">Profesyonel GES teklifi hazırlayın</p>
        </div>
        
        <div className="flex space-x-2">
          <Button variant="outline" onClick={onCancel}>
            İptal
          </Button>
          <Button onClick={handleSave}>
            <Save className="w-4 h-4 mr-2" />
            Kaydet
          </Button>
        </div>
      </div>

      <Tabs defaultValue="customer" className="space-y-6">
        <TabsList>
          <TabsTrigger value="customer">Müşteri Bilgileri</TabsTrigger>
          <TabsTrigger value="system">Sistem Detayları</TabsTrigger>
          <TabsTrigger value="pricing">Fiyatlandırma</TabsTrigger>
          <TabsTrigger value="financial">Finansal Analiz</TabsTrigger>
        </TabsList>

        {/* Customer Info Tab */}
        <TabsContent value="customer" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <User className="w-5 h-5 mr-2" />
                Müşteri Bilgileri
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="customerName">Müşteri Adı *</Label>
                  <Input
                    id="customerName"
                    value={formData.customerName}
                    onChange={(e) => setFormData(prev => ({ ...prev, customerName: e.target.value }))}
                    className={errors.customerName ? 'border-red-500' : ''}
                  />
                  {errors.customerName && (
                    <p className="text-sm text-red-600 mt-1">{errors.customerName}</p>
                  )}
                </div>
                
                <div>
                  <Label htmlFor="customerEmail">Email *</Label>
                  <Input
                    id="customerEmail"
                    type="email"
                    value={formData.customerEmail}
                    onChange={(e) => setFormData(prev => ({ ...prev, customerEmail: e.target.value }))}
                    className={errors.customerEmail ? 'border-red-500' : ''}
                  />
                  {errors.customerEmail && (
                    <p className="text-sm text-red-600 mt-1">{errors.customerEmail}</p>
                  )}
                </div>
                
                <div>
                  <Label htmlFor="customerPhone">Telefon *</Label>
                  <Input
                    id="customerPhone"
                    value={formData.customerPhone}
                    onChange={(e) => setFormData(prev => ({ ...prev, customerPhone: e.target.value }))}
                    className={errors.customerPhone ? 'border-red-500' : ''}
                  />
                  {errors.customerPhone && (
                    <p className="text-sm text-red-600 mt-1">{errors.customerPhone}</p>
                  )}
                </div>
                
                <div>
                  <Label htmlFor="validityDays">Geçerlilik (Gün)</Label>
                  <Input
                    id="validityDays"
                    type="number"
                    value={formData.validityDays}
                    onChange={(e) => setFormData(prev => ({ ...prev, validityDays: Number(e.target.value) }))}
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="projectTitle">Proje Başlığı *</Label>
                <Input
                  id="projectTitle"
                  value={formData.projectTitle}
                  onChange={(e) => setFormData(prev => ({ ...prev, projectTitle: e.target.value }))}
                  className={errors.projectTitle ? 'border-red-500' : ''}
                  placeholder="Örn: Ev Çatı GES Sistemi - İstanbul"
                />
                {errors.projectTitle && (
                  <p className="text-sm text-red-600 mt-1">{errors.projectTitle}</p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* System Details Tab */}
        <TabsContent value="system" className="space-y-6">
          <div className="grid lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Zap className="w-5 h-5 mr-2" />
                  Sistem Özellikleri
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="systemSize">Sistem Gücü (kW)</Label>
                    <Input
                      id="systemSize"
                      type="number"
                      step="0.1"
                      value={formData.systemSize}
                      onChange={(e) => setFormData(prev => ({ ...prev, systemSize: Number(e.target.value) }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="panelCount">Panel Sayısı</Label>
                    <Input
                      id="panelCount"
                      type="number"
                      value={formData.panelCount}
                      onChange={(e) => setFormData(prev => ({ ...prev, panelCount: Number(e.target.value) }))}
                    />
                  </div>
                </div>
                
                <div className="flex space-x-2">
                  <Button size="sm" onClick={addPanelSet} className="flex-1">
                    <Plus className="w-3 h-3 mr-1" />
                    Panel Seti Ekle
                  </Button>
                  <Button size="sm" onClick={addInverterSet} className="flex-1">
                    <Plus className="w-3 h-3 mr-1" />
                    İnverter Ekle
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Wrench className="w-5 h-5 mr-2" />
                  İşçilik
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="laborHours">Çalışma Saati</Label>
                    <Input
                      id="laborHours"
                      type="number"
                      value={laborHours}
                      onChange={(e) => setLaborHours(Number(e.target.value))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="laborRate">Saat Ücreti (₺)</Label>
                    <Input
                      id="laborRate"
                      type="number"
                      value={laborRate}
                      onChange={(e) => setLaborRate(Number(e.target.value))}
                    />
                  </div>
                </div>
                
                <div className="bg-blue-50 p-3 rounded">
                  <div className="text-sm text-blue-900 font-medium">
                    Toplam İşçilik: ₺{calculations.laborCost.toLocaleString()}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Items List */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center">
                  <Package className="w-5 h-5 mr-2" />
                  Ürün Listesi
                </div>
                <div className="flex space-x-2">
                  <Button size="sm" variant="outline" onClick={() => addItem('PANEL')}>
                    <Plus className="w-3 h-3 mr-1" />
                    Panel
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => addItem('INVERTER')}>
                    <Plus className="w-3 h-3 mr-1" />
                    İnverter
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => addItem('ACCESSORY')}>
                    <Plus className="w-3 h-3 mr-1" />
                    Aksesuar
                  </Button>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {errors.items && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded">
                  <p className="text-sm text-red-600">{errors.items}</p>
                </div>
              )}
              
              <div className="space-y-3">
                {items.map((item, index) => (
                  <div key={item.id} className="border rounded-lg p-4">
                    <div className="grid grid-cols-12 gap-3 items-center">
                      <div className="col-span-1">
                        <Badge variant="secondary" className="text-xs">
                          {item.type}
                        </Badge>
                      </div>
                      
                      <div className="col-span-3">
                        {item.type === 'PANEL' ? (
                          <Select 
                            value={item.specifications?.id || ''} 
                            onValueChange={(value) => selectProduct(item.id, value, 'panel')}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Panel seçin" />
                            </SelectTrigger>
                            <SelectContent>
                              {productCatalog.panels.map(panel => (
                                <SelectItem key={panel.id} value={panel.id}>
                                  {panel.brand} {panel.name} ({panel.power}W)
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        ) : item.type === 'INVERTER' ? (
                          <Select 
                            value={item.specifications?.id || ''} 
                            onValueChange={(value) => selectProduct(item.id, value, 'inverter')}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="İnverter seçin" />
                            </SelectTrigger>
                            <SelectContent>
                              {productCatalog.inverters.map(inverter => (
                                <SelectItem key={inverter.id} value={inverter.id}>
                                  {inverter.brand} {inverter.name} ({inverter.power/1000}kW)
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        ) : (
                          <Input
                            placeholder="Ürün adı"
                            value={item.name}
                            onChange={(e) => updateItem(item.id, { name: e.target.value })}
                          />
                        )}
                      </div>
                      
                      <div className="col-span-2">
                        <Input
                          type="number"
                          placeholder="Adet"
                          value={item.quantity}
                          onChange={(e) => updateItem(item.id, { quantity: Number(e.target.value) })}
                        />
                      </div>
                      
                      <div className="col-span-2">
                        <Input
                          type="number"
                          placeholder="Birim Fiyat"
                          value={item.unitPrice}
                          onChange={(e) => updateItem(item.id, { unitPrice: Number(e.target.value) })}
                        />
                      </div>
                      
                      <div className="col-span-3">
                        <div className="font-medium text-right">
                          ₺{item.totalPrice.toLocaleString()}
                        </div>
                      </div>
                      
                      <div className="col-span-1">
                        <Button 
                          size="sm" 
                          variant="ghost" 
                          onClick={() => removeItem(item.id)}
                        >
                          <Trash2 className="w-3 h-3 text-red-500" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Pricing Tab */}
        <TabsContent value="pricing" className="space-y-6">
          <div className="grid lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Fiyatlandırma Ayarları</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="marginPercent">Kar Marjı (%)</Label>
                  <Input
                    id="marginPercent"
                    type="number"
                    value={marginPercent}
                    onChange={(e) => setMarginPercent(Number(e.target.value))}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Calculator className="w-5 h-5 mr-2" />
                  Fiyat Özeti
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span>Alt Toplam:</span>
                  <span>₺{calculations.subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>İşçilik:</span>
                  <span>₺{calculations.laborCost.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Kar Marjı (%{marginPercent}):</span>
                  <span>₺{calculations.margin.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>KDV (%{taxPercent}):</span>
                  <span>₺{calculations.tax.toLocaleString()}</span>
                </div>
                <Separator />
                <div className="flex justify-between text-lg font-bold">
                  <span>Toplam:</span>
                  <span>₺{calculations.total.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm text-green-600">
                  <span>Kar:</span>
                  <span>₺{calculations.profitAmount.toLocaleString()}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Financial Analysis Tab */}
        <TabsContent value="financial" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <TrendingUp className="w-5 h-5 mr-2" />
                Finansal Analiz
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">
                    {(formData.systemSize * 1300).toLocaleString()} kWh
                  </div>
                  <div className="text-sm text-blue-800">Yıllık Üretim</div>
                </div>
                
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">
                    ₺{Math.round(formData.systemSize * 1300 * 2.2 * 0.9).toLocaleString()}
                  </div>
                  <div className="text-sm text-green-800">Yıllık Tasarruf</div>
                </div>
                
                <div className="text-center p-4 bg-orange-50 rounded-lg">
                  <div className="text-2xl font-bold text-orange-600">
                    {Math.round((calculations.total / (formData.systemSize * 1300 * 2.2 * 0.9)) * 10) / 10} Yıl
                  </div>
                  <div className="text-sm text-orange-800">Geri Ödeme</div>
                </div>
                
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">
                    %12.5
                  </div>
                  <div className="text-sm text-purple-800">IRR</div>
                </div>
              </div>
              
              <div className="text-sm text-gray-600">
                * Hesaplamalar 2.2 TL/kWh elektrik fiyatı ve %90 sistem verimliliği baz alınarak yapılmıştır.
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}