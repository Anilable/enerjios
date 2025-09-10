'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Separator } from '@/components/ui/separator'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  AlertTriangle, Plus, X, Upload, FileText, Image as ImageIcon,
  Save, Eye, Copy, Barcode, Package, DollarSign, Warehouse,
  Settings, Shield, Clock, Zap
} from 'lucide-react'
import { 
  ProductCategoryManager, 
  Product, 
  ProductSpecification, 
  ProductPricing,
  ProductInventory,
  ProductDocument,
  ProductWarranty 
} from '@/lib/product-categories'

interface ProductFormProps {
  product?: Product
  onSave: (product: Partial<Product>) => Promise<void>
  onCancel: () => void
  isLoading?: boolean
}

export function ProductForm({ product, onSave, onCancel, isLoading = false }: ProductFormProps) {
  const [formData, setFormData] = useState<Partial<Product>>({
    name: '',
    model: '',
    brand: '',
    categoryId: '',
    subcategoryId: '',
    description: '',
    specifications: {},
    pricing: {
      basePrice: 0,
      currency: 'TRY',
      discountTiers: [],
      priceHistory: [],
      vatRate: 20,
      isVatIncluded: true
    },
    inventory: {
      sku: '',
      stockQuantity: 0,
      reservedQuantity: 0,
      availableQuantity: 0,
      minimumStock: 0,
      maximumStock: 1000,
      reorderPoint: 10,
      location: '',
      supplier: '',
      leadTime: 7,
      lastStockUpdate: new Date().toISOString(),
      stockMovements: []
    },
    images: [],
    documents: [],
    certifications: [],
    warranty: {
      duration: 24,
      unit: 'MONTHS',
      type: 'MANUFACTURER',
      coverage: [],
      conditions: ''
    },
    status: 'ACTIVE',
    ...product
  })

  const [errors, setErrors] = useState<Array<{field: string, message: string}>>([])
  const [selectedCategory, setSelectedCategory] = useState<any>(null)
  const [specificationValues, setSpecificationValues] = useState<Record<string, any>>({})
  const [activeTab, setActiveTab] = useState('general')

  const categories = ProductCategoryManager.getCategories()

  useEffect(() => {
    if (formData.categoryId) {
      const category = ProductCategoryManager.getCategoryById(formData.categoryId)
      setSelectedCategory(category)
      
      // Initialize specification values
      if (category?.specifications) {
        const initValues: Record<string, any> = {}
        category.specifications.forEach(spec => {
          initValues[spec.id] = formData.specifications?.[spec.id] || spec.defaultValue || ''
        })
        setSpecificationValues(initValues)
      }
    }
  }, [formData.categoryId])

  useEffect(() => {
    if (product) {
      setFormData(product)
      if (product.specifications) {
        setSpecificationValues(product.specifications)
      }
    }
  }, [product])

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleNestedInputChange = (parent: string, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [parent]: {
        ...prev[parent as keyof typeof prev] as any,
        [field]: value
      }
    }))
  }

  const handleSpecificationChange = (specId: string, value: any) => {
    setSpecificationValues(prev => ({
      ...prev,
      [specId]: value
    }))
    
    setFormData(prev => ({
      ...prev,
      specifications: {
        ...prev.specifications,
        [specId]: value
      }
    }))
  }

  const generateSKU = () => {
    const sku = ProductCategoryManager.generateSKU(formData)
    handleNestedInputChange('inventory', 'sku', sku)
  }

  const addDiscountTier = () => {
    const newTier = {
      minQuantity: 1,
      discount: 0,
      discountType: 'PERCENTAGE' as const
    }
    
    const updatedTiers = [...(formData.pricing?.discountTiers || []), newTier]
    handleNestedInputChange('pricing', 'discountTiers', updatedTiers)
  }

  const removeDiscountTier = (index: number) => {
    const updatedTiers = formData.pricing?.discountTiers?.filter((_, i) => i !== index) || []
    handleNestedInputChange('pricing', 'discountTiers', updatedTiers)
  }

  const updateDiscountTier = (index: number, field: string, value: any) => {
    const updatedTiers = [...(formData.pricing?.discountTiers || [])]
    updatedTiers[index] = { ...updatedTiers[index], [field]: value }
    handleNestedInputChange('pricing', 'discountTiers', updatedTiers)
  }

  const addDocument = (type: ProductDocument['type']) => {
    const newDoc: ProductDocument = {
      id: `doc-${Date.now()}`,
      name: '',
      type,
      url: '',
      language: 'tr',
      uploadDate: new Date().toISOString()
    }
    
    handleInputChange('documents', [...(formData.documents || []), newDoc])
  }

  const updateDocument = (index: number, field: keyof ProductDocument, value: any) => {
    const updatedDocs = [...(formData.documents || [])]
    updatedDocs[index] = { ...updatedDocs[index], [field]: value }
    handleInputChange('documents', updatedDocs)
  }

  const removeDocument = (index: number) => {
    const updatedDocs = formData.documents?.filter((_, i) => i !== index) || []
    handleInputChange('documents', updatedDocs)
  }

  const addCertification = () => {
    const cert = prompt('Sertifika adını girin:')
    if (cert && cert.trim()) {
      handleInputChange('certifications', [...(formData.certifications || []), cert.trim()])
    }
  }

  const removeCertification = (index: number) => {
    const updated = formData.certifications?.filter((_, i) => i !== index) || []
    handleInputChange('certifications', updated)
  }

  const validateForm = (): boolean => {
    const validationErrors = ProductCategoryManager.validateProductData(formData)
    setErrors(validationErrors)
    return validationErrors.length === 0
  }

  const handleSave = async () => {
    if (!validateForm()) {
      setActiveTab('general') // Switch to general tab to show errors
      return
    }

    try {
      await onSave(formData)
    } catch (error) {
      console.error('Error saving product:', error)
    }
  }

  const renderSpecificationField = (spec: ProductSpecification) => {
    const value = specificationValues[spec.id] || ''
    const fieldId = `spec-${spec.id}`

    switch (spec.type) {
      case 'text':
        return (
          <Input
            id={fieldId}
            value={value}
            onChange={(e) => handleSpecificationChange(spec.id, e.target.value)}
            placeholder={spec.name}
          />
        )

      case 'number':
        return (
          <div className="flex gap-2">
            <Input
              id={fieldId}
              type="number"
              value={value}
              onChange={(e) => handleSpecificationChange(spec.id, parseFloat(e.target.value) || 0)}
              placeholder="0"
              min={spec.min}
              max={spec.max}
            />
            {spec.unit && (
              <div className="flex items-center px-3 bg-gray-100 border rounded text-sm text-gray-600">
                {spec.unit}
              </div>
            )}
          </div>
        )

      case 'boolean':
        return (
          <Switch
            checked={Boolean(value)}
            onCheckedChange={(checked) => handleSpecificationChange(spec.id, checked)}
          />
        )

      case 'select':
        return (
          <Select value={value} onValueChange={(val) => handleSpecificationChange(spec.id, val)}>
            <SelectTrigger id={fieldId}>
              <SelectValue placeholder={`${spec.name} seçin`} />
            </SelectTrigger>
            <SelectContent>
              {spec.options?.map(option => (
                <SelectItem key={option} value={option}>{option}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        )

      case 'multiselect':
        return (
          <div className="space-y-2">
            {spec.options?.map(option => (
              <div key={option} className="flex items-center space-x-2">
                <Checkbox
                  checked={Array.isArray(value) ? value.includes(option) : false}
                  onCheckedChange={(checked) => {
                    const currentValue = Array.isArray(value) ? value : []
                    if (checked) {
                      handleSpecificationChange(spec.id, [...currentValue, option])
                    } else {
                      handleSpecificationChange(spec.id, currentValue.filter((v: string) => v !== option))
                    }
                  }}
                />
                <label className="text-sm">{option}</label>
              </div>
            ))}
          </div>
        )

      case 'range':
        const rangeValue = typeof value === 'object' ? value : { min: 0, max: 0 }
        return (
          <div className="flex gap-2">
            <Input
              placeholder="Min"
              type="number"
              value={rangeValue.min || ''}
              onChange={(e) => handleSpecificationChange(spec.id, {
                ...rangeValue,
                min: parseFloat(e.target.value) || 0
              })}
            />
            <span className="flex items-center">-</span>
            <Input
              placeholder="Max"
              type="number"
              value={rangeValue.max || ''}
              onChange={(e) => handleSpecificationChange(spec.id, {
                ...rangeValue,
                max: parseFloat(e.target.value) || 0
              })}
            />
            {spec.unit && (
              <div className="flex items-center px-3 bg-gray-100 border rounded text-sm text-gray-600">
                {spec.unit}
              </div>
            )}
          </div>
        )

      default:
        return (
          <Input
            id={fieldId}
            value={value}
            onChange={(e) => handleSpecificationChange(spec.id, e.target.value)}
          />
        )
    }
  }

  const groupedSpecs = selectedCategory?.specifications.reduce((groups: Record<string, ProductSpecification[]>, spec: ProductSpecification) => {
    if (!groups[spec.group]) groups[spec.group] = []
    groups[spec.group].push(spec)
    return groups
  }, {}) || {}

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">
            {product ? 'Ürün Düzenle' : 'Yeni Ürün Ekle'}
          </h2>
          <p className="text-muted-foreground">
            Ürün bilgilerini ekleyin veya güncelleyin
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={onCancel}>
            İptal
          </Button>
          <Button onClick={handleSave} disabled={isLoading}>
            {isLoading ? (
              <>
                <Clock className="w-4 h-4 mr-2 animate-spin" />
                Kaydediliyor...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Kaydet
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Validation Errors */}
      {errors.length > 0 && (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <div className="space-y-1">
              {errors.map((error, index) => (
                <div key={index} className="text-sm">
                  • {error.message}
                </div>
              ))}
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Main Form */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="general">Genel</TabsTrigger>
          <TabsTrigger value="specifications">Özellikler</TabsTrigger>
          <TabsTrigger value="pricing">Fiyatlandırma</TabsTrigger>
          <TabsTrigger value="inventory">Stok</TabsTrigger>
          <TabsTrigger value="documents">Belgeler</TabsTrigger>
          <TabsTrigger value="warranty">Garanti</TabsTrigger>
        </TabsList>

        {/* General Tab */}
        <TabsContent value="general" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Temel Bilgiler</CardTitle>
              <CardDescription>Ürünün genel bilgileri</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Ürün Adı *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    placeholder="Ürün adını girin"
                  />
                </div>
                <div>
                  <Label htmlFor="model">Model</Label>
                  <Input
                    id="model"
                    value={formData.model}
                    onChange={(e) => handleInputChange('model', e.target.value)}
                    placeholder="Model numarası"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="brand">Marka *</Label>
                  <Input
                    id="brand"
                    value={formData.brand}
                    onChange={(e) => handleInputChange('brand', e.target.value)}
                    placeholder="Marka adı"
                  />
                </div>
                <div>
                  <Label htmlFor="category">Kategori *</Label>
                  <Select 
                    value={formData.categoryId} 
                    onValueChange={(value) => handleInputChange('categoryId', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Kategori seçin" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map(category => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="description">Açıklama</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Ürün açıklaması"
                  rows={3}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="status">Durum</Label>
                  <Select 
                    value={formData.status} 
                    onValueChange={(value) => handleInputChange('status', value)}
                  >
                    <SelectTrigger className="w-[180px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ACTIVE">Aktif</SelectItem>
                      <SelectItem value="INACTIVE">Pasif</SelectItem>
                      <SelectItem value="DISCONTINUED">Üretimi Durmuş</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Specifications Tab */}
        <TabsContent value="specifications" className="space-y-6">
          {selectedCategory ? (
            Object.entries(groupedSpecs || {}).map(([group, specs]) => (
              <Card key={group}>
                <CardHeader>
                  <CardTitle className="text-lg">{group}</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-2 gap-4">
                  {(specs as ProductSpecification[]).map((spec: ProductSpecification) => (
                    <div key={spec.id}>
                      <Label htmlFor={`spec-${spec.id}`}>
                        {spec.name} 
                        {spec.required && <span className="text-red-500 ml-1">*</span>}
                      </Label>
                      {renderSpecificationField(spec)}
                    </div>
                  ))}
                </CardContent>
              </Card>
            ))
          ) : (
            <Card>
              <CardContent className="p-8 text-center">
                <Package className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">
                  Önce bir kategori seçin
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Pricing Tab */}
        <TabsContent value="pricing" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Temel Fiyatlandırma</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="basePrice">Temel Fiyat *</Label>
                  <div className="flex gap-2">
                    <Input
                      id="basePrice"
                      type="number"
                      step="0.01"
                      value={formData.pricing?.basePrice || 0}
                      onChange={(e) => handleNestedInputChange('pricing', 'basePrice', parseFloat(e.target.value) || 0)}
                    />
                    <Select
                      value={formData.pricing?.currency}
                      onValueChange={(value) => handleNestedInputChange('pricing', 'currency', value)}
                    >
                      <SelectTrigger className="w-[100px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="TRY">₺</SelectItem>
                        <SelectItem value="USD">$</SelectItem>
                        <SelectItem value="EUR">€</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div>
                  <Label htmlFor="costPrice">Maliyet Fiyatı</Label>
                  <Input
                    id="costPrice"
                    type="number"
                    step="0.01"
                    value={formData.pricing?.costPrice || 0}
                    onChange={(e) => handleNestedInputChange('pricing', 'costPrice', parseFloat(e.target.value) || 0)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="vatRate">KDV Oranı (%)</Label>
                  <Input
                    id="vatRate"
                    type="number"
                    value={formData.pricing?.vatRate || 20}
                    onChange={(e) => handleNestedInputChange('pricing', 'vatRate', parseFloat(e.target.value) || 0)}
                  />
                </div>
                <div className="flex items-center space-x-2 pt-8">
                  <Switch
                    checked={formData.pricing?.isVatIncluded || false}
                    onCheckedChange={(checked) => handleNestedInputChange('pricing', 'isVatIncluded', checked)}
                  />
                  <Label>KDV Dahil</Label>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Discount Tiers */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>İndirim Kademeleri</CardTitle>
                <Button onClick={addDiscountTier} size="sm">
                  <Plus className="w-4 h-4 mr-2" />
                  Kademe Ekle
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {formData.pricing?.discountTiers?.map((tier, index) => (
                <div key={index} className="flex gap-4 items-end mb-4 p-4 border rounded">
                  <div className="flex-1">
                    <Label>Min. Miktar</Label>
                    <Input
                      type="number"
                      value={tier.minQuantity}
                      onChange={(e) => updateDiscountTier(index, 'minQuantity', parseInt(e.target.value) || 1)}
                    />
                  </div>
                  <div className="flex-1">
                    <Label>İndirim</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={tier.discount}
                      onChange={(e) => updateDiscountTier(index, 'discount', parseFloat(e.target.value) || 0)}
                    />
                  </div>
                  <div className="w-32">
                    <Label>Tip</Label>
                    <Select
                      value={tier.discountType}
                      onValueChange={(value) => updateDiscountTier(index, 'discountType', value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="PERCENTAGE">%</SelectItem>
                        <SelectItem value="FIXED">Sabit</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => removeDiscountTier(index)}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ))}
              {(!formData.pricing?.discountTiers || formData.pricing.discountTiers.length === 0) && (
                <div className="text-center py-8 text-muted-foreground">
                  Henüz indirim kademesi eklenmemiş
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Inventory Tab */}
        <TabsContent value="inventory" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Stok Bilgileri</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="sku">SKU Kodu</Label>
                  <div className="flex gap-2">
                    <Input
                      id="sku"
                      value={formData.inventory?.sku || ''}
                      onChange={(e) => handleNestedInputChange('inventory', 'sku', e.target.value)}
                      placeholder="SKU kodu"
                    />
                    <Button type="button" onClick={generateSKU} size="sm" variant="outline">
                      <Barcode className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                <div>
                  <Label htmlFor="barcode">Barkod</Label>
                  <Input
                    id="barcode"
                    value={formData.inventory?.barcode || ''}
                    onChange={(e) => handleNestedInputChange('inventory', 'barcode', e.target.value)}
                    placeholder="Barkod numarası"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="stockQuantity">Mevcut Stok</Label>
                  <Input
                    id="stockQuantity"
                    type="number"
                    value={formData.inventory?.stockQuantity || 0}
                    onChange={(e) => {
                      const quantity = parseInt(e.target.value) || 0
                      handleNestedInputChange('inventory', 'stockQuantity', quantity)
                      handleNestedInputChange('inventory', 'availableQuantity', 
                        quantity - (formData.inventory?.reservedQuantity || 0))
                    }}
                  />
                </div>
                <div>
                  <Label htmlFor="reservedQuantity">Rezerve Stok</Label>
                  <Input
                    id="reservedQuantity"
                    type="number"
                    value={formData.inventory?.reservedQuantity || 0}
                    onChange={(e) => {
                      const reserved = parseInt(e.target.value) || 0
                      handleNestedInputChange('inventory', 'reservedQuantity', reserved)
                      handleNestedInputChange('inventory', 'availableQuantity',
                        (formData.inventory?.stockQuantity || 0) - reserved)
                    }}
                  />
                </div>
                <div>
                  <Label>Kullanılabilir Stok</Label>
                  <Input
                    value={formData.inventory?.availableQuantity || 0}
                    disabled
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="minimumStock">Minimum Stok</Label>
                  <Input
                    id="minimumStock"
                    type="number"
                    value={formData.inventory?.minimumStock || 0}
                    onChange={(e) => handleNestedInputChange('inventory', 'minimumStock', parseInt(e.target.value) || 0)}
                  />
                </div>
                <div>
                  <Label htmlFor="maximumStock">Maksimum Stok</Label>
                  <Input
                    id="maximumStock"
                    type="number"
                    value={formData.inventory?.maximumStock || 1000}
                    onChange={(e) => handleNestedInputChange('inventory', 'maximumStock', parseInt(e.target.value) || 0)}
                  />
                </div>
                <div>
                  <Label htmlFor="reorderPoint">Yeniden Sipariş</Label>
                  <Input
                    id="reorderPoint"
                    type="number"
                    value={formData.inventory?.reorderPoint || 10}
                    onChange={(e) => handleNestedInputChange('inventory', 'reorderPoint', parseInt(e.target.value) || 0)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="location">Depo Konumu</Label>
                  <Input
                    id="location"
                    value={formData.inventory?.location || ''}
                    onChange={(e) => handleNestedInputChange('inventory', 'location', e.target.value)}
                    placeholder="Raf/Konum bilgisi"
                  />
                </div>
                <div>
                  <Label htmlFor="supplier">Tedarikçi</Label>
                  <Input
                    id="supplier"
                    value={formData.inventory?.supplier || ''}
                    onChange={(e) => handleNestedInputChange('inventory', 'supplier', e.target.value)}
                    placeholder="Tedarikçi adı"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="leadTime">Temin Süresi (gün)</Label>
                <Input
                  id="leadTime"
                  type="number"
                  value={formData.inventory?.leadTime || 7}
                  onChange={(e) => handleNestedInputChange('inventory', 'leadTime', parseInt(e.target.value) || 0)}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Documents Tab */}
        <TabsContent value="documents" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Ürün Belgeleri</CardTitle>
                <div className="flex gap-2">
                  <Button onClick={() => addDocument('DATASHEET')} size="sm" variant="outline">
                    <Plus className="w-4 h-4 mr-2" />
                    Teknik Döküman
                  </Button>
                  <Button onClick={() => addDocument('MANUAL')} size="sm" variant="outline">
                    <Plus className="w-4 h-4 mr-2" />
                    Kullanım Kılavuzu
                  </Button>
                  <Button onClick={() => addDocument('CERTIFICATE')} size="sm" variant="outline">
                    <Plus className="w-4 h-4 mr-2" />
                    Sertifika
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {formData.documents?.map((doc, index) => (
                <div key={doc.id} className="flex gap-4 items-center p-4 border rounded mb-4">
                  <FileText className="w-6 h-6 text-muted-foreground" />
                  <div className="flex-1 grid grid-cols-3 gap-4">
                    <Input
                      placeholder="Belge adı"
                      value={doc.name}
                      onChange={(e) => updateDocument(index, 'name', e.target.value)}
                    />
                    <Input
                      placeholder="URL veya dosya yolu"
                      value={doc.url}
                      onChange={(e) => updateDocument(index, 'url', e.target.value)}
                    />
                    <Select
                      value={doc.language}
                      onValueChange={(value) => updateDocument(index, 'language', value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="tr">Türkçe</SelectItem>
                        <SelectItem value="en">English</SelectItem>
                        <SelectItem value="de">Deutsch</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Badge variant="outline">{doc.type}</Badge>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => removeDocument(index)}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ))}

              {(!formData.documents || formData.documents.length === 0) && (
                <div className="text-center py-8 text-muted-foreground">
                  Henüz belge eklenmemiş
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Sertifikalar</CardTitle>
                <Button onClick={addCertification} size="sm">
                  <Plus className="w-4 h-4 mr-2" />
                  Sertifika Ekle
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {formData.certifications?.map((cert, index) => (
                  <Badge key={index} variant="secondary" className="pr-1">
                    {cert}
                    <button
                      onClick={() => removeCertification(index)}
                      className="ml-2 hover:bg-red-100 rounded p-0.5"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                ))}
              </div>
              {(!formData.certifications || formData.certifications.length === 0) && (
                <p className="text-muted-foreground">Henüz sertifika eklenmemiş</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Warranty Tab */}
        <TabsContent value="warranty" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Garanti Bilgileri</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="warrantyDuration">Garanti Süresi</Label>
                  <Input
                    id="warrantyDuration"
                    type="number"
                    value={formData.warranty?.duration || 24}
                    onChange={(e) => handleNestedInputChange('warranty', 'duration', parseInt(e.target.value) || 0)}
                  />
                </div>
                <div>
                  <Label htmlFor="warrantyUnit">Birim</Label>
                  <Select
                    value={formData.warranty?.unit}
                    onValueChange={(value) => handleNestedInputChange('warranty', 'unit', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="MONTHS">Ay</SelectItem>
                      <SelectItem value="YEARS">Yıl</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="warrantyType">Garanti Tipi</Label>
                  <Select
                    value={formData.warranty?.type}
                    onValueChange={(value) => handleNestedInputChange('warranty', 'type', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="MANUFACTURER">Üretici Garantisi</SelectItem>
                      <SelectItem value="DISTRIBUTOR">Distribütör Garantisi</SelectItem>
                      <SelectItem value="INSTALLATION">Kurulum Garantisi</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="warrantyConditions">Garanti Koşulları</Label>
                <Textarea
                  id="warrantyConditions"
                  value={formData.warranty?.conditions || ''}
                  onChange={(e) => handleNestedInputChange('warranty', 'conditions', e.target.value)}
                  placeholder="Garanti koşulları ve kısıtlamaları"
                  rows={4}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}