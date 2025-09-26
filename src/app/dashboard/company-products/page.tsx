'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { useToast } from '@/hooks/use-toast'
import { Toaster } from '@/components/ui/toaster'
import { formatCurrency } from '@/lib/utils'
import { Textarea } from '@/components/ui/textarea'
import {
  Plus,
  Search,
  MoreHorizontal,
  Zap,
  Battery,
  Sun,
  Settings,
  Edit,
  Trash2,
  Package,
  Cable,
  Monitor,
  Loader2
} from 'lucide-react'

type Product = {
  id: string
  name: string
  code?: string
  category: string
  type?: string
  brand: string
  model: string
  power: string
  price: number
  purchasePrice?: number
  stock: number
  status: string
  warranty: string
  description?: string
  specifications?: any
  companyName?: string
  createdAt: string
  updatedAt: string
}

type Category = {
  id: string
  name: string
  type?: string
  count: number
}

const PRODUCT_TYPES = [
  { value: 'SOLAR_PANEL', label: 'Panel', icon: Sun },
  { value: 'INVERTER', label: 'İnverter', icon: Zap },
  { value: 'BATTERY', label: 'Batarya', icon: Battery },
  { value: 'MOUNTING_SYSTEM', label: 'Konstrüksiyon', icon: Settings },
  { value: 'CABLE', label: 'Kablolar', icon: Cable },
  { value: 'MONITORING', label: 'İzleme Sistemleri', icon: Monitor },
  { value: 'ACCESSORY', label: 'Aksesuarlar', icon: Package }
]

export default function CompanyProductsPage() {
  const { data: session } = useSession()
  const { toast } = useToast()
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string | null>(null)
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    type: 'SOLAR_PANEL',
    brand: '',
    model: '',
    power: '',
    price: '',
    purchasePrice: '',
    stock: '',
    warranty: '',
    description: ''
  })

  useEffect(() => {
    if (session?.user) {
      fetchProducts()
      fetchCategories()
    }
  }, [session])

  const fetchProducts = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/products')
      if (response.ok) {
        const data = await response.json()
        setProducts(data)
      } else {
        console.error('Failed to fetch products')
        toast({
          title: 'Hata',
          description: 'Ürünler yüklenirken bir hata oluştu',
          variant: 'destructive'
        })
      }
    } catch (error) {
      console.error('Error fetching products:', error)
      toast({
        title: 'Hata',
        description: 'Ürünler yüklenirken bir hata oluştu',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/products/categories')
      if (response.ok) {
        const data = await response.json()
        setCategories(data)
      }
    } catch (error) {
      console.error('Error fetching categories:', error)
    }
  }

  const resetForm = () => {
    setFormData({
      name: '',
      code: '',
      type: 'SOLAR_PANEL',
      brand: '',
      model: '',
      power: '',
      price: '',
      purchasePrice: '',
      stock: '',
      warranty: '',
      description: ''
    })
  }

  const handleAddProduct = async () => {
    try {
      const response = await fetch('/api/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          price: parseFloat(formData.price),
          purchasePrice: formData.purchasePrice ? parseFloat(formData.purchasePrice) : null,
          power: formData.power ? parseFloat(formData.power) : null,
          stock: parseInt(formData.stock) || 0,
          warranty: formData.warranty ? parseInt(formData.warranty) : null
        }),
      })

      if (response.ok) {
        const newProduct = await response.json()
        setProducts(prev => [newProduct, ...prev])
        setShowAddDialog(false)
        resetForm()
        toast({
          title: 'Başarılı',
          description: 'Ürün başarıyla eklendi',
        })
      } else {
        const error = await response.json()
        toast({
          title: 'Hata',
          description: error.error || 'Ürün eklenirken bir hata oluştu',
          variant: 'destructive'
        })
      }
    } catch (error) {
      console.error('Error adding product:', error)
      toast({
        title: 'Hata',
        description: 'Ürün eklenirken bir hata oluştu',
        variant: 'destructive'
      })
    }
  }

  const handleEditProduct = async () => {
    if (!selectedProduct) return

    try {
      const response = await fetch(`/api/products/${selectedProduct.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          price: parseFloat(formData.price),
          purchasePrice: formData.purchasePrice ? parseFloat(formData.purchasePrice) : null,
          power: formData.power ? parseFloat(formData.power) : null,
          stock: parseInt(formData.stock) || 0,
          warranty: formData.warranty ? parseInt(formData.warranty) : null
        }),
      })

      if (response.ok) {
        fetchProducts() // Refresh the list
        setShowEditDialog(false)
        resetForm()
        setSelectedProduct(null)
        toast({
          title: 'Başarılı',
          description: 'Ürün başarıyla güncellendi',
        })
      } else {
        const error = await response.json()
        toast({
          title: 'Hata',
          description: error.error || 'Ürün güncellenirken bir hata oluştu',
          variant: 'destructive'
        })
      }
    } catch (error) {
      console.error('Error updating product:', error)
      toast({
        title: 'Hata',
        description: 'Ürün güncellenirken bir hata oluştu',
        variant: 'destructive'
      })
    }
  }

  const handleDeleteProduct = async () => {
    if (!selectedProduct) return

    try {
      const response = await fetch(`/api/products/${selectedProduct.id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        setProducts(prev => prev.filter(p => p.id !== selectedProduct.id))
        setShowDeleteDialog(false)
        setSelectedProduct(null)
        toast({
          title: 'Başarılı',
          description: 'Ürün başarıyla silindi',
        })
      } else {
        const error = await response.json()
        toast({
          title: 'Hata',
          description: error.error || 'Ürün silinirken bir hata oluştu',
          variant: 'destructive'
        })
      }
    } catch (error) {
      console.error('Error deleting product:', error)
      toast({
        title: 'Hata',
        description: 'Ürün silinirken bir hata oluştu',
        variant: 'destructive'
      })
    }
  }

  const openEditDialog = (product: Product) => {
    setSelectedProduct(product)
    setFormData({
      name: product.name,
      code: product.code || '',
      type: product.type || 'SOLAR_PANEL',
      brand: product.brand,
      model: product.model,
      power: product.power?.replace('W', '') || '',
      price: product.price.toString(),
      purchasePrice: product.purchasePrice?.toString() || '',
      stock: product.stock.toString(),
      warranty: product.warranty?.replace(' yıl', '') || '',
      description: product.description || ''
    })
    setShowEditDialog(true)
  }

  const openDeleteDialog = (product: Product) => {
    setSelectedProduct(product)
    setShowDeleteDialog(true)
  }

  const getProductTypeIcon = (type: string) => {
    const productType = PRODUCT_TYPES.find(pt => pt.value === type)
    return productType ? productType.icon : Package
  }

  const getProductTypeLabel = (type: string) => {
    const productType = PRODUCT_TYPES.find(pt => pt.value === type)
    return productType ? productType.label : 'Diğer'
  }

  // Filter products
  const filteredProducts = products.filter(product => {
    const matchesSearch = searchTerm === '' ||
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.code?.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesCategory = !selectedCategoryFilter || product.category === selectedCategoryFilter

    return matchesSearch && matchesCategory
  })

  return (
    <DashboardLayout
      title="Ürün Yönetimi"
      breadcrumbs={[
        { label: 'Anasayfa', href: '/dashboard' },
        { label: 'Ürün Yönetimi' }
      ]}
    >
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-2xl font-bold">Ürün Yönetimi</h2>
            <p className="text-muted-foreground">
              Firmanıza ait ürünleri yönetin ve maliyetlerinizi takip edin
            </p>
          </div>
          <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Ürün Ekle
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>Yeni Ürün Ekle</DialogTitle>
                <DialogDescription>
                  Firmanızın ürün kataloğuna yeni bir ürün ekleyin
                </DialogDescription>
              </DialogHeader>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Ürün Adı *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Ürün adı girin"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="code">Ürün Kodu</Label>
                  <Input
                    id="code"
                    value={formData.code}
                    onChange={(e) => setFormData(prev => ({ ...prev, code: e.target.value }))}
                    placeholder="Ürün kodu"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="type">Kategori *</Label>
                  <Select value={formData.type} onValueChange={(value) => setFormData(prev => ({ ...prev, type: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {PRODUCT_TYPES.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          <div className="flex items-center gap-2">
                            <type.icon className="w-4 h-4" />
                            {type.label}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="brand">Marka *</Label>
                  <Input
                    id="brand"
                    value={formData.brand}
                    onChange={(e) => setFormData(prev => ({ ...prev, brand: e.target.value }))}
                    placeholder="Marka adı"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="model">Model</Label>
                  <Input
                    id="model"
                    value={formData.model}
                    onChange={(e) => setFormData(prev => ({ ...prev, model: e.target.value }))}
                    placeholder="Model adı"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="power">Güç (W)</Label>
                  <Input
                    id="power"
                    type="number"
                    value={formData.power}
                    onChange={(e) => setFormData(prev => ({ ...prev, power: e.target.value }))}
                    placeholder="Güç (Watt)"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="price">Satış Fiyatı (₺) *</Label>
                  <Input
                    id="price"
                    type="number"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
                    placeholder="Satış fiyatı"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="purchasePrice">Maliyet Fiyatı (₺)</Label>
                  <Input
                    id="purchasePrice"
                    type="number"
                    step="0.01"
                    value={formData.purchasePrice}
                    onChange={(e) => setFormData(prev => ({ ...prev, purchasePrice: e.target.value }))}
                    placeholder="Maliyet fiyatı"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="stock">Stok Miktarı</Label>
                  <Input
                    id="stock"
                    type="number"
                    value={formData.stock}
                    onChange={(e) => setFormData(prev => ({ ...prev, stock: e.target.value }))}
                    placeholder="Stok miktarı"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="warranty">Garanti Süresi (Yıl)</Label>
                  <Input
                    id="warranty"
                    type="number"
                    value={formData.warranty}
                    onChange={(e) => setFormData(prev => ({ ...prev, warranty: e.target.value }))}
                    placeholder="Garanti süresi"
                  />
                </div>
                <div className="col-span-2 space-y-2">
                  <Label htmlFor="description">Açıklama</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Ürün açıklaması"
                    rows={3}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowAddDialog(false)}>
                  İptal
                </Button>
                <Button onClick={handleAddProduct} disabled={!formData.name || !formData.brand || !formData.price}>
                  Ekle
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Search and Filter */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Ürün adı, marka, model veya kod ile ara..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
              <Select value={selectedCategoryFilter || 'all'} onValueChange={(value) => setSelectedCategoryFilter(value === 'all' ? null : value)}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Kategori Seç" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tüm Kategoriler</SelectItem>
                  {PRODUCT_TYPES.map((type) => (
                    <SelectItem key={type.value} value={type.label}>
                      <div className="flex items-center gap-2">
                        <type.icon className="w-4 h-4" />
                        {type.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Products */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {loading ? (
            Array.from({ length: 8 }).map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader>
                  <div className="h-4 bg-gray-200 rounded w-3/4" />
                  <div className="h-3 bg-gray-200 rounded w-1/2" />
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="h-3 bg-gray-200 rounded" />
                    <div className="h-3 bg-gray-200 rounded w-2/3" />
                    <div className="h-8 bg-gray-200 rounded" />
                  </div>
                </CardContent>
              </Card>
            ))
          ) : filteredProducts.length > 0 ? (
            filteredProducts.map((product) => {
              const IconComponent = getProductTypeIcon(product.type || 'ACCESSORY')
              return (
                <Card key={product.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        <IconComponent className="w-5 h-5 text-primary" />
                        <div>
                          <CardTitle className="text-lg leading-tight">{product.name}</CardTitle>
                          <CardDescription className="text-sm">
                            {product.brand} {product.model}
                          </CardDescription>
                        </div>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => openEditDialog(product)}>
                            <Edit className="w-4 h-4 mr-2" />
                            Düzenle
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => openDeleteDialog(product)}
                            className="text-red-600"
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Sil
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Badge variant="secondary" className="text-xs">
                        {getProductTypeLabel(product.type || 'ACCESSORY')}
                      </Badge>
                      <Badge variant={product.status === 'Stokta' ? 'default' : product.status === 'Azalıyor' ? 'secondary' : 'destructive'} className="text-xs">
                        {product.status}
                      </Badge>
                    </div>

                    {product.power && product.power !== '-' && (
                      <div className="text-sm text-muted-foreground">
                        Güç: {product.power}
                      </div>
                    )}

                    <div className="flex justify-between items-center">
                      <div>
                        <div className="text-lg font-bold text-primary">
                          {formatCurrency(product.price)}
                        </div>
                        {product.purchasePrice && (
                          <div className="text-sm text-muted-foreground">
                            Maliyet: {formatCurrency(product.purchasePrice)}
                          </div>
                        )}
                      </div>
                      <div className="text-right text-sm text-muted-foreground">
                        Stok: {product.stock}
                      </div>
                    </div>

                    {product.code && (
                      <div className="text-xs text-muted-foreground">
                        Kod: {product.code}
                      </div>
                    )}
                  </CardContent>
                </Card>
              )
            })
          ) : (
            <div className="col-span-full text-center py-12">
              <Package className="w-16 h-16 mx-auto text-gray-300 mb-4" />
              <h3 className="text-lg font-semibold text-gray-600 mb-2">
                {searchTerm || selectedCategoryFilter ? 'Arama kriterlerinize uygun ürün bulunamadı' : 'Henüz ürün bulunmuyor'}
              </h3>
              <p className="text-gray-500 mb-4">
                {searchTerm || selectedCategoryFilter
                  ? 'Farklı arama terimleri deneyebilir veya filtreleri temizleyebilirsiniz.'
                  : 'İlk ürününüzü eklemek için "Ürün Ekle" butonunu kullanın.'
                }
              </p>
              {!searchTerm && !selectedCategoryFilter && (
                <Button onClick={() => setShowAddDialog(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  İlk Ürününüzü Ekleyin
                </Button>
              )}
            </div>
          )}
        </div>

        {/* Edit Dialog */}
        <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Ürün Düzenle</DialogTitle>
              <DialogDescription>
                Ürün bilgilerini güncelleyin
              </DialogDescription>
            </DialogHeader>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-name">Ürün Adı *</Label>
                <Input
                  id="edit-name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Ürün adı girin"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-code">Ürün Kodu</Label>
                <Input
                  id="edit-code"
                  value={formData.code}
                  onChange={(e) => setFormData(prev => ({ ...prev, code: e.target.value }))}
                  placeholder="Ürün kodu"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-type">Kategori *</Label>
                <Select value={formData.type} onValueChange={(value) => setFormData(prev => ({ ...prev, type: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {PRODUCT_TYPES.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        <div className="flex items-center gap-2">
                          <type.icon className="w-4 h-4" />
                          {type.label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-brand">Marka *</Label>
                <Input
                  id="edit-brand"
                  value={formData.brand}
                  onChange={(e) => setFormData(prev => ({ ...prev, brand: e.target.value }))}
                  placeholder="Marka adı"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-model">Model</Label>
                <Input
                  id="edit-model"
                  value={formData.model}
                  onChange={(e) => setFormData(prev => ({ ...prev, model: e.target.value }))}
                  placeholder="Model adı"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-power">Güç (W)</Label>
                <Input
                  id="edit-power"
                  type="number"
                  value={formData.power}
                  onChange={(e) => setFormData(prev => ({ ...prev, power: e.target.value }))}
                  placeholder="Güç (Watt)"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-price">Satış Fiyatı (₺) *</Label>
                <Input
                  id="edit-price"
                  type="number"
                  step="0.01"
                  value={formData.price}
                  onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
                  placeholder="Satış fiyatı"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-purchasePrice">Maliyet Fiyatı (₺)</Label>
                <Input
                  id="edit-purchasePrice"
                  type="number"
                  step="0.01"
                  value={formData.purchasePrice}
                  onChange={(e) => setFormData(prev => ({ ...prev, purchasePrice: e.target.value }))}
                  placeholder="Maliyet fiyatı"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-stock">Stok Miktarı</Label>
                <Input
                  id="edit-stock"
                  type="number"
                  value={formData.stock}
                  onChange={(e) => setFormData(prev => ({ ...prev, stock: e.target.value }))}
                  placeholder="Stok miktarı"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-warranty">Garanti Süresi (Yıl)</Label>
                <Input
                  id="edit-warranty"
                  type="number"
                  value={formData.warranty}
                  onChange={(e) => setFormData(prev => ({ ...prev, warranty: e.target.value }))}
                  placeholder="Garanti süresi"
                />
              </div>
              <div className="col-span-2 space-y-2">
                <Label htmlFor="edit-description">Açıklama</Label>
                <Textarea
                  id="edit-description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Ürün açıklaması"
                  rows={3}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowEditDialog(false)}>
                İptal
              </Button>
              <Button onClick={handleEditProduct} disabled={!formData.name || !formData.brand || !formData.price}>
                Güncelle
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Dialog */}
        <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Ürünü Sil</DialogTitle>
              <DialogDescription>
                Bu ürünü silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.
              </DialogDescription>
            </DialogHeader>
            {selectedProduct && (
              <div className="py-4">
                <div className="bg-muted rounded p-4">
                  <div className="font-semibold">{selectedProduct.name}</div>
                  <div className="text-sm text-muted-foreground">{selectedProduct.brand} {selectedProduct.model}</div>
                  <div className="text-sm font-medium mt-2">{formatCurrency(selectedProduct.price)}</div>
                </div>
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
                İptal
              </Button>
              <Button variant="destructive" onClick={handleDeleteProduct}>
                Sil
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
      <Toaster />
    </DashboardLayout>
  )
}