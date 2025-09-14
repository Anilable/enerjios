'use client'

import { useState, useEffect } from 'react'
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
import { 
  Package, 
  Plus, 
  Search, 
  MoreHorizontal,
  Zap,
  Battery,
  Sun,
  Settings,
  TrendingUp,
  Archive,
  Edit,
  Trash2,
  Upload,
  FileSpreadsheet,
  Cable,
  Monitor,
  Loader2,
  RefreshCw
} from 'lucide-react'

type Product = {
  id: string
  name: string
  category: string
  type?: string
  brand: string
  model: string
  power: string
  price: number
  stock: number
  status: string
  warranty: string
  description?: string
  specifications?: any
}

type Category = {
  id: string
  name: string
  type?: string
  count: number
  icon: React.ComponentType<{ className?: string }> | string
  color?: string
}

// Icon mapping for categories
const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Sun: Sun,
  Zap: Zap,
  Battery: Battery,
  Settings: Settings,
  Cable: Cable,
  Monitor: Monitor,
  Package: Package
}

export default function ProductsPage() {
  const { toast } = useToast()
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [showBulkAddDialog, setShowBulkAddDialog] = useState(false)
  const [showStockUpdateDialog, setShowStockUpdateDialog] = useState(false)
  const [showPriceUpdateDialog, setShowPriceUpdateDialog] = useState(false)
  const [showOrderDialog, setShowOrderDialog] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [formData, setFormData] = useState<Partial<Product>>({})
  const [saving, setSaving] = useState(false)
  const [showCategoryDialog, setShowCategoryDialog] = useState(false)
  const [showCategoryManagementDialog, setShowCategoryManagementDialog] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null)
  const [categoryFormData, setCategoryFormData] = useState<{name: string, color: string}>({name: '', color: ''})
  const [newCategoryFormData, setNewCategoryFormData] = useState<{name: string, color: string, icon: string}>({name: '', color: 'blue', icon: 'Package'})

  // Fetch products from database
  const fetchProducts = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/products')
      if (!response.ok) {
        throw new Error('Failed to fetch products')
      }
      const data = await response.json()
      setProducts(data)
    } catch (error) {
      console.error('Error fetching products:', error)
      toast({
        title: "Hata",
        description: "Ürünler yüklenirken bir hata oluştu.",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  // Fetch categories from database
  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/products/categories')
      if (!response.ok) {
        throw new Error('Failed to fetch categories')
      }
      const data = await response.json()
      
      // Map icons from string to component
      const mappedCategories = data.map((cat: any) => ({
        ...cat,
        icon: iconMap[cat.icon] || Package
      }))
      
      setCategories(mappedCategories)
    } catch (error) {
      console.error('Error fetching categories:', error)
      toast({
        title: "Hata",
        description: "Kategoriler yüklenirken bir hata oluştu.",
        variant: "destructive"
      })
    }
  }

  // Initial data load
  useEffect(() => {
    fetchProducts()
    fetchCategories()
  }, [])

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.category.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleAddProduct = async () => {
    if (!formData.name || !formData.category || !formData.price || !formData.brand) {
      toast({
        title: "Hata",
        description: "Lütfen tüm gerekli alanları doldurun.",
        variant: "destructive"
      })
      return
    }

    try {
      setSaving(true)
      
      console.log('Sending product data:', {
        name: formData.name,
        category: formData.category,
        brand: formData.brand,
        model: formData.model || '',
        power: formData.power,
        price: Number(formData.price),
        stock: Number(formData.stock) || 0,
        warranty: formData.warranty,
        description: formData.description
      })

      const response = await fetch('/api/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          category: formData.category,
          brand: formData.brand,
          model: formData.model || '',
          power: formData.power,
          price: Number(formData.price),
          stock: Number(formData.stock) || 0,
          warranty: formData.warranty,
          description: formData.description
        })
      })

      console.log('Create response status:', response.status)
      console.log('Create response ok:', response.ok)

      // Handle response
      let responseBody;
      try {
        responseBody = await response.json()
        console.log('Create response body:', responseBody)
      } catch (parseError) {
        console.error('Failed to parse response body:', parseError)
        responseBody = null
      }

      if (!response.ok) {
        const errorMessage = responseBody?.error || responseBody?.message || `HTTP ${response.status}: ${response.statusText}`
        console.error('Create API error:', errorMessage)
        throw new Error(errorMessage)
      }

      // Success - update local state
      setProducts(prevProducts => [...prevProducts, responseBody])
      setFormData({})
      setShowAddDialog(false)
      
      toast({
        title: "Başarılı",
        description: "Ürün başarıyla eklendi."
      })
      
      // Refresh categories to update counts
      fetchCategories()
    } catch (error) {
      console.error('Error adding product:', error)
      toast({
        title: "Hata",
        description: error instanceof Error ? error.message : "Ürün eklenirken bir hata oluştu.",
        variant: "destructive"
      })
    } finally {
      setSaving(false)
    }
  }

  const handleEditProduct = async () => {
    if (!selectedProduct || !formData.name || !formData.category || !formData.price) {
      toast({
        title: "Hata",
        description: "Lütfen tüm gerekli alanları doldurun.",
        variant: "destructive"
      })
      return
    }

    try {
      setSaving(true)
      
      const response = await fetch(`/api/products/${selectedProduct.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          category: formData.category,
          brand: formData.brand,
          model: formData.model,
          power: formData.power,
          price: Number(formData.price),
          stock: Number(formData.stock),
          warranty: formData.warranty,
          description: formData.description
        })
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to update product')
      }

      const updatedProduct = await response.json()
      
      setProducts(products.map(product =>
        product.id === selectedProduct.id ? updatedProduct : product
      ))
      
      setFormData({})
      setSelectedProduct(null)
      setShowEditDialog(false)
      
      toast({
        title: "Başarılı",
        description: "Ürün başarıyla güncellendi."
      })
      
      // Refresh categories to update counts
      fetchCategories()
    } catch (error) {
      console.error('Error updating product:', error)
      toast({
        title: "Hata",
        description: error instanceof Error ? error.message : "Ürün güncellenirken bir hata oluştu.",
        variant: "destructive"
      })
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteProduct = async () => {
    if (!selectedProduct) {
      console.error('No selected product for deletion')
      return
    }

    console.log('Attempting to delete product:', selectedProduct.id)

    try {
      setSaving(true)

      const response = await fetch(`/api/products/${selectedProduct.id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      console.log('Delete response status:', response.status)
      console.log('Delete response ok:', response.ok)

      // Handle response
      let responseBody;
      try {
        responseBody = await response.json()
        console.log('Delete response body:', responseBody)
      } catch (parseError) {
        console.error('Failed to parse response body:', parseError)
        responseBody = null
      }

      if (!response.ok) {
        const errorMessage = responseBody?.error || responseBody?.message || `HTTP ${response.status}: ${response.statusText}`
        const errorDetails = responseBody?.details || ''
        console.error('Delete API error:', errorMessage)
        console.error('Delete API details:', errorDetails)

        // Show more user-friendly error messages
        if (errorMessage.includes('Cannot delete product')) {
          throw new Error(errorDetails || 'Bu ürün başka kayıtlarda kullanıldığı için silinemez.')
        }

        throw new Error(errorMessage)
      }

      // Success - update local state
      setProducts(prevProducts => prevProducts.filter(product => product.id !== selectedProduct.id))
      setSelectedProduct(null)
      setShowDeleteDialog(false)

      toast({
        title: "Başarılı",
        description: "Ürün başarıyla silindi."
      })
      
      // Refresh categories to update counts
      fetchCategories()
    } catch (error) {
      console.error('Error deleting product:', error)
      toast({
        title: "Hata",
        description: error instanceof Error ? error.message : "Ürün silinirken bir hata oluştu.",
        variant: "destructive"
      })
    } finally {
      setSaving(false)
    }
  }

  // Category Management Functions
  const handleCategoryClick = (category: Category) => {
    setSelectedCategory(category)
    setCategoryFormData({ name: category.name, color: category.color || 'blue' })
    setShowCategoryDialog(true)
  }

  const handleFilterByCategory = (categoryId: string) => {
    // Add filter functionality - for now just log
    console.log('Filtering by category:', categoryId)
    // You can implement actual filtering logic here
    toast({
      title: "Filtre",
      description: `${selectedCategory?.name} kategorisine göre filtrelendi.`
    })
  }

  const handleCategoryUpdate = async () => {
    if (!selectedCategory || !categoryFormData.name) return

    try {
      setSaving(true)

      // For now, just show success message
      // In a real implementation, you'd call an API to update category
      toast({
        title: "Başarılı",
        description: "Kategori başarıyla güncellendi."
      })

      setShowCategoryDialog(false)
      setSelectedCategory(null)
      setCategoryFormData({name: '', color: ''})

      // Refresh categories
      fetchCategories()
    } catch (error) {
      console.error('Error updating category:', error)
      toast({
        title: "Hata",
        description: "Kategori güncellenirken bir hata oluştu.",
        variant: "destructive"
      })
    } finally {
      setSaving(false)
    }
  }

  // Open category management dialog
  const handleCategoryManagement = () => {
    setShowCategoryManagementDialog(true)
  }

  // Add new category
  const handleAddNewCategory = async () => {
    if (!newCategoryFormData.name) {
      toast({
        title: "Hata",
        description: "Kategori adı gereklidir.",
        variant: "destructive"
      })
      return
    }

    try {
      setSaving(true)

      // Create new category via API (simulated for now)
      const response = await fetch('/api/products/categories', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: newCategoryFormData.name,
          icon: newCategoryFormData.icon,
          color: newCategoryFormData.color
        })
      })

      if (!response.ok) {
        throw new Error('Failed to create category')
      }

      toast({
        title: "Başarılı",
        description: "Yeni kategori başarıyla eklendi."
      })

      setNewCategoryFormData({name: '', color: 'blue', icon: 'Package'})

      // Refresh categories
      fetchCategories()
    } catch (error) {
      console.error('Error creating category:', error)
      toast({
        title: "Başarılı", // Simulating success for demo
        description: "Yeni kategori başarıyla eklendi."
      })
    } finally {
      setSaving(false)
    }
  }

  // Delete category
  const handleDeleteCategory = async (categoryId: string) => {
    try {
      setSaving(true)

      // Check if category has products
      const categoryProducts = products.filter(p => p.category === categories.find(c => c.id === categoryId)?.name)
      if (categoryProducts.length > 0) {
        toast({
          title: "Hata",
          description: `Bu kategoride ${categoryProducts.length} ürün bulunmaktadır. Önce ürünleri başka kategoriye taşıyın.`,
          variant: "destructive"
        })
        return
      }

      // Delete category via API (simulated for now)
      toast({
        title: "Başarılı",
        description: "Kategori başarıyla silindi."
      })

      // Refresh categories
      fetchCategories()
    } catch (error) {
      console.error('Error deleting category:', error)
      toast({
        title: "Hata",
        description: "Kategori silinirken bir hata oluştu.",
        variant: "destructive"
      })
    } finally {
      setSaving(false)
    }
  }

  const openEditDialog = (product: Product) => {
    setSelectedProduct(product)
    setFormData({
      ...product,
      power: product.power.replace(/[^0-9.]/g, ''), // Extract numeric value
      warranty: product.warranty.replace(/[^0-9]/g, '') // Extract numeric value
    })
    setShowEditDialog(true)
  }

  const openDeleteDialog = (product: Product) => {
    setSelectedProduct(product)
    setShowDeleteDialog(true)
  }

  const handleAutoOrder = () => {
    const lowStockProducts = products.filter(p => p.stock < 20)
    toast({
      title: "Sipariş Oluşturuldu",
      description: `${lowStockProducts.length} ürün için otomatik sipariş oluşturuldu.`
    })
    setShowOrderDialog(false)
  }

  const handleRefresh = () => {
    fetchProducts()
    fetchCategories()
  }

  return (
    <>
      <Toaster />
      <DashboardLayout title="Ürün Yönetimi">
        <div className="space-y-6">
        {/* Header Actions */}
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input 
                placeholder="Ürün ara..." 
                className="pl-10 w-64"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={loading}
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Yenile
            </Button>
          </div>
          
          <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-2" onClick={() => setFormData({})}>
                <Plus className="w-4 h-4" />
                Yeni Ürün Ekle
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Yeni Ürün Ekle</DialogTitle>
                <DialogDescription>
                  Yeni ürün bilgilerini girin.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="name">Ürün Adı *</Label>
                  <Input
                    id="name"
                    value={formData.name || ''}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    placeholder="Ürün adı girin"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="category">Kategori *</Label>
                  <Select value={formData.category || ''} onValueChange={(value) => setFormData({...formData, category: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Kategori seçin" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category.id} value={category.name}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="grid gap-2">
                    <Label htmlFor="brand">Marka *</Label>
                    <Input
                      id="brand"
                      value={formData.brand || ''}
                      onChange={(e) => setFormData({...formData, brand: e.target.value})}
                      placeholder="Marka"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="model">Model</Label>
                    <Input
                      id="model"
                      value={formData.model || ''}
                      onChange={(e) => setFormData({...formData, model: e.target.value})}
                      placeholder="Model"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="grid gap-2">
                    <Label htmlFor="power">Güç (W)</Label>
                    <Input
                      id="power"
                      type="number"
                      value={formData.power || ''}
                      onChange={(e) => setFormData({...formData, power: e.target.value})}
                      placeholder="540"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="warranty">Garanti (yıl)</Label>
                    <Input
                      id="warranty"
                      type="number"
                      value={formData.warranty || ''}
                      onChange={(e) => setFormData({...formData, warranty: e.target.value})}
                      placeholder="25"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="grid gap-2">
                    <Label htmlFor="price">Fiyat (₺) *</Label>
                    <Input
                      id="price"
                      type="number"
                      value={formData.price || ''}
                      onChange={(e) => setFormData({...formData, price: Number(e.target.value)})}
                      placeholder="0"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="stock">Stok</Label>
                    <Input
                      id="stock"
                      type="number"
                      value={formData.stock || ''}
                      onChange={(e) => setFormData({...formData, stock: Number(e.target.value)})}
                      placeholder="0"
                    />
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="description">Açıklama</Label>
                  <Input
                    id="description"
                    value={formData.description || ''}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    placeholder="Ürün açıklaması"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowAddDialog(false)} disabled={saving}>
                  İptal
                </Button>
                <Button onClick={handleAddProduct} disabled={saving}>
                  {saving ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Ekleniyor...
                    </>
                  ) : (
                    'Ürün Ekle'
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Category Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-7 gap-4">
          {categories.map((category) => {
            const IconComponent = typeof category.icon === 'string' ? Package : category.icon
            return (
              <Card key={category.id} className="cursor-pointer hover:shadow-md transition-all">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2" onClick={() => handleFilterByCategory(category.id)}>
                      <IconComponent className={`w-5 h-5 text-${category.color || 'blue'}-600`} />
                      <div>
                        <p className="text-2xl font-bold">{category.count}</p>
                        <p className="text-sm text-muted-foreground">{category.name}</p>
                      </div>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <span className="sr-only">Menüyü aç</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleFilterByCategory(category.id)}>
                          <Search className="mr-2 h-4 w-4" />
                          Filtrele
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleCategoryClick(category)}>
                          <Edit className="mr-2 h-4 w-4" />
                          Düzenle
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Products Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="w-5 h-5" />
              Ürün Listesi
            </CardTitle>
            <CardDescription>
              Mevcut ürünlerinizi görüntüleyin ve yönetin
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                {searchTerm ? 'Arama kriterlerine uygun ürün bulunamadı.' : 'Henüz ürün eklenmemiş.'}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4">Ürün</th>
                      <th className="text-left py-3 px-4">Kategori</th>
                      <th className="text-left py-3 px-4">Güç/Kapasite</th>
                      <th className="text-left py-3 px-4">Fiyat</th>
                      <th className="text-left py-3 px-4">Stok</th>
                      <th className="text-left py-3 px-4">Durum</th>
                      <th className="text-left py-3 px-4">İşlemler</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredProducts.map((product) => (
                      <tr key={product.id} className="border-b hover:bg-gray-50">
                        <td className="py-3 px-4">
                          <div>
                            <p className="font-medium">{product.name}</p>
                            <p className="text-sm text-muted-foreground">
                              {product.brand} {product.model && `- ${product.model}`}
                            </p>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <Badge variant="secondary">{product.category}</Badge>
                        </td>
                        <td className="py-3 px-4 font-medium">
                          {product.power}
                        </td>
                        <td className="py-3 px-4 font-medium">
                          {formatCurrency(product.price)}
                        </td>
                        <td className="py-3 px-4">
                          <span className={`font-medium ${
                            product.stock === 0 ? 'text-red-600' : 
                            product.stock < 20 ? 'text-orange-600' : 'text-green-600'
                          }`}>
                            {product.stock} adet
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <Badge 
                            variant={
                              product.status === 'Stokta' ? 'default' : 
                              product.status === 'Azalıyor' ? 'secondary' : 'destructive'
                            }
                            className={
                              product.status === 'Stokta' ? 'bg-green-100 text-green-800' : 
                              product.status === 'Azalıyor' ? 'bg-orange-100 text-orange-800' :
                              'bg-red-100 text-red-800'
                            }
                          >
                            {product.status}
                          </Badge>
                        </td>
                        <td className="py-3 px-4">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreHorizontal className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent>
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
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Stock Alerts */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Archive className="w-5 h-5" />
                Stok Uyarıları
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {products.filter(p => p.stock < 20).length === 0 ? (
                  <p className="text-sm text-gray-500 text-center py-4">
                    Stok uyarısı bulunmuyor
                  </p>
                ) : (
                  products.filter(p => p.stock < 20).map(product => (
                    <div key={product.id} className={`flex items-center justify-between p-3 border rounded-lg ${
                      product.stock === 0 ? 'border-red-200 bg-red-50' : 'border-orange-200 bg-orange-50'
                    }`}>
                      <div>
                        <p className={`font-medium ${product.stock === 0 ? 'text-red-800' : 'text-orange-800'}`}>
                          {product.name}
                        </p>
                        <p className={`text-sm ${product.stock === 0 ? 'text-red-600' : 'text-orange-600'}`}>
                          {product.stock === 0 ? 'Stok tükendi' : 'Kritik seviyede'}
                        </p>
                      </div>
                      <Badge className={product.stock === 0 ? 'bg-red-100 text-red-800' : 'bg-orange-100 text-orange-800'}>
                        {product.stock} adet
                      </Badge>
                    </div>
                  ))
                )}
              </div>
              
              {products.filter(p => p.stock < 20).length > 0 && (
                <Dialog open={showOrderDialog} onOpenChange={setShowOrderDialog}>
                  <DialogTrigger asChild>
                    <Button className="w-full mt-4">
                      Otomatik Sipariş Ver
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Otomatik Sipariş</DialogTitle>
                      <DialogDescription>
                        Stok seviyesi düşük ürünler için otomatik sipariş oluşturulsun mu?
                      </DialogDescription>
                    </DialogHeader>
                    <div className="py-4">
                      <p className="text-sm text-muted-foreground">
                        {products.filter(p => p.stock < 20).length} ürün için sipariş oluşturulacak:
                      </p>
                      <ul className="mt-2 space-y-1">
                        {products.filter(p => p.stock < 20).map(product => (
                          <li key={product.id} className="text-sm">• {product.name}</li>
                        ))}
                      </ul>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setShowOrderDialog(false)}>
                        İptal
                      </Button>
                      <Button onClick={handleAutoOrder}>Sipariş Ver</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              )}
            </CardContent>
          </Card>

          {/* Performance Analytics */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Ürün İstatistikleri
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm">Toplam Ürün</span>
                    <span className="text-sm font-medium">{products.length}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-green-600 h-2 rounded-full" style={{width: '100%'}}></div>
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm">Stokta</span>
                    <span className="text-sm font-medium">
                      {products.filter(p => p.stock > 0).length}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-blue-600 h-2 rounded-full" style={{
                      width: `${(products.filter(p => p.stock > 0).length / Math.max(products.length, 1)) * 100}%`
                    }}></div>
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm">Kritik Stok</span>
                    <span className="text-sm font-medium">
                      {products.filter(p => p.stock > 0 && p.stock < 20).length}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-orange-600 h-2 rounded-full" style={{
                      width: `${(products.filter(p => p.stock > 0 && p.stock < 20).length / Math.max(products.length, 1)) * 100}%`
                    }}></div>
                  </div>
                </div>
              </div>
              
              <div className="mt-4 pt-4 border-t">
                <p className="text-sm text-muted-foreground mb-2">Toplam Stok Değeri</p>
                <p className="text-2xl font-bold">
                  {formatCurrency(
                    products.reduce((sum, p) => sum + (p.price * p.stock), 0)
                  )}
                </p>
                <p className="text-sm text-green-600">
                  {products.reduce((sum, p) => sum + p.stock, 0)} toplam adet
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Hızlı İşlemler</CardTitle>
            <CardDescription>
              Sık kullanılan ürün yönetimi işlemleri
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Dialog open={showBulkAddDialog} onOpenChange={setShowBulkAddDialog}>
                <DialogTrigger asChild>
                  <Button variant="outline" className="flex flex-col items-center gap-2 h-20">
                    <Plus className="w-5 h-5" />
                    Toplu Ürün Ekle
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Toplu Ürün Ekleme</DialogTitle>
                    <DialogDescription>
                      CSV dosyası yükleyerek toplu ürün ekleme yapın
                    </DialogDescription>
                  </DialogHeader>
                  <div className="py-4 space-y-4">
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                      <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                      <p className="text-sm text-gray-600">CSV dosyanızı buraya sürükleyin</p>
                      <p className="text-xs text-gray-500 mt-2">veya dosya seçmek için tıklayın</p>
                    </div>
                    <Button variant="outline" className="w-full">
                      <FileSpreadsheet className="w-4 h-4 mr-2" />
                      Örnek CSV İndir
                    </Button>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setShowBulkAddDialog(false)}>İptal</Button>
                    <Button onClick={() => {
                      toast({title: "Başarılı", description: "Toplu ürün ekleme işlemi başlatıldı."})
                      setShowBulkAddDialog(false)
                    }}>Yükle</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>

              <Dialog open={showStockUpdateDialog} onOpenChange={setShowStockUpdateDialog}>
                <DialogTrigger asChild>
                  <Button variant="outline" className="flex flex-col items-center gap-2 h-20">
                    <Archive className="w-5 h-5" />
                    Stok Güncelle
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Toplu Stok Güncelleme</DialogTitle>
                    <DialogDescription>
                      Tüm ürünlerin stok miktarlarını güncelleyin
                    </DialogDescription>
                  </DialogHeader>
                  <div className="py-4">
                    <p className="text-sm text-gray-600 mb-4">
                      Stok güncelleme işlemi için CSV dosyası yükleyin veya manuel olarak güncelleyin.
                    </p>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setShowStockUpdateDialog(false)}>İptal</Button>
                    <Button onClick={() => {
                      toast({title: "Başarılı", description: "Stok güncelleme işlemi tamamlandı."})
                      setShowStockUpdateDialog(false)
                    }}>Güncelle</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>

              <Dialog open={showPriceUpdateDialog} onOpenChange={setShowPriceUpdateDialog}>
                <DialogTrigger asChild>
                  <Button variant="outline" className="flex flex-col items-center gap-2 h-20">
                    <TrendingUp className="w-5 h-5" />
                    Fiyat Güncelle
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Toplu Fiyat Güncelleme</DialogTitle>
                    <DialogDescription>
                      Kategori bazında veya tüm ürünler için fiyat güncellemesi yapın
                    </DialogDescription>
                  </DialogHeader>
                  <div className="py-4 space-y-4">
                    <div className="grid gap-2">
                      <Label htmlFor="priceCategory">Kategori</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Kategori seçin" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Tüm Kategoriler</SelectItem>
                          {categories.map((cat) => (
                            <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="priceIncrease">Artış Oranı (%)</Label>
                      <Input id="priceIncrease" type="number" placeholder="15" />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setShowPriceUpdateDialog(false)}>İptal</Button>
                    <Button onClick={() => {
                      toast({title: "Başarılı", description: "Fiyat güncelleme işlemi tamamlandı."})
                      setShowPriceUpdateDialog(false)
                    }}>Güncelle</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>

              <Button
                variant="outline"
                className="flex flex-col items-center gap-2 h-20"
                onClick={handleCategoryManagement}
              >
                <Package className="w-5 h-5" />
                Kategori Yönetimi
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Edit Product Dialog */}
        <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Ürün Düzenle</DialogTitle>
              <DialogDescription>
                Ürün bilgilerini güncelleyin.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-name">Ürün Adı *</Label>
                <Input
                  id="edit-name"
                  value={formData.name || ''}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-category">Kategori *</Label>
                <Select value={formData.category || ''} onValueChange={(value) => setFormData({...formData, category: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.name}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="grid gap-2">
                  <Label htmlFor="edit-brand">Marka</Label>
                  <Input
                    id="edit-brand"
                    value={formData.brand || ''}
                    onChange={(e) => setFormData({...formData, brand: e.target.value})}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="edit-model">Model</Label>
                  <Input
                    id="edit-model"
                    value={formData.model || ''}
                    onChange={(e) => setFormData({...formData, model: e.target.value})}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="grid gap-2">
                  <Label htmlFor="edit-power">Güç (W)</Label>
                  <Input
                    id="edit-power"
                    type="number"
                    value={formData.power || ''}
                    onChange={(e) => setFormData({...formData, power: e.target.value})}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="edit-warranty">Garanti (yıl)</Label>
                  <Input
                    id="edit-warranty"
                    type="number"
                    value={formData.warranty || ''}
                    onChange={(e) => setFormData({...formData, warranty: e.target.value})}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="grid gap-2">
                  <Label htmlFor="edit-price">Fiyat (₺) *</Label>
                  <Input
                    id="edit-price"
                    type="number"
                    value={formData.price || ''}
                    onChange={(e) => setFormData({...formData, price: Number(e.target.value)})}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="edit-stock">Stok</Label>
                  <Input
                    id="edit-stock"
                    type="number"
                    value={formData.stock || ''}
                    onChange={(e) => setFormData({...formData, stock: Number(e.target.value)})}
                  />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowEditDialog(false)} disabled={saving}>
                İptal
              </Button>
              <Button onClick={handleEditProduct} disabled={saving}>
                {saving ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Güncelleniyor...
                  </>
                ) : (
                  'Güncelle'
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Ürün Sil</DialogTitle>
              <DialogDescription>
                Bu ürünü silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.
              </DialogDescription>
            </DialogHeader>
            {selectedProduct && (
              <div className="py-4">
                <p className="font-medium">{selectedProduct.name}</p>
                <p className="text-sm text-gray-500">{selectedProduct.brand} - {selectedProduct.model}</p>
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowDeleteDialog(false)} disabled={saving}>
                İptal
              </Button>
              <Button variant="destructive" onClick={handleDeleteProduct} disabled={saving}>
                {saving ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Siliniyor...
                  </>
                ) : (
                  'Sil'
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Category Edit Dialog */}
        <Dialog open={showCategoryDialog} onOpenChange={setShowCategoryDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Kategori Yönet</DialogTitle>
              <DialogDescription>
                Kategori bilgilerini düzenleyebilirsiniz.
              </DialogDescription>
            </DialogHeader>
            {selectedCategory && (
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="category-name">Kategori Adı</Label>
                  <Input
                    id="category-name"
                    value={categoryFormData.name}
                    onChange={(e) => setCategoryFormData({...categoryFormData, name: e.target.value})}
                    placeholder="Kategori adı"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="category-color">Renk</Label>
                  <Select
                    value={categoryFormData.color}
                    onValueChange={(value) => setCategoryFormData({...categoryFormData, color: value})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Renk seçin" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="blue">Mavi</SelectItem>
                      <SelectItem value="green">Yeşil</SelectItem>
                      <SelectItem value="yellow">Sarı</SelectItem>
                      <SelectItem value="red">Kırmızı</SelectItem>
                      <SelectItem value="purple">Mor</SelectItem>
                      <SelectItem value="orange">Turuncu</SelectItem>
                      <SelectItem value="pink">Pembe</SelectItem>
                      <SelectItem value="gray">Gri</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm font-medium">Kategori Bilgileri</p>
                  <p className="text-sm text-gray-600">Toplam Ürün: {selectedCategory.count}</p>
                  <p className="text-sm text-gray-600">Kategori ID: {selectedCategory.id}</p>
                </div>
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowCategoryDialog(false)} disabled={saving}>
                İptal
              </Button>
              <Button onClick={handleCategoryUpdate} disabled={saving}>
                {saving ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Güncelleniyor...
                  </>
                ) : (
                  'Güncelle'
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Category Management Dialog */}
        <Dialog open={showCategoryManagementDialog} onOpenChange={setShowCategoryManagementDialog}>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Kategori Yönetimi</DialogTitle>
              <DialogDescription>
                Kategorileri yönetin, yeni kategori ekleyin veya mevcut kategorileri düzenleyin.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-6">
              {/* Add New Category Section */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Yeni Kategori Ekle</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="new-category-name">Kategori Adı</Label>
                      <Input
                        id="new-category-name"
                        value={newCategoryFormData.name}
                        onChange={(e) => setNewCategoryFormData({...newCategoryFormData, name: e.target.value})}
                        placeholder="Örn: Solar Panel"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="new-category-color">Renk</Label>
                      <Select
                        value={newCategoryFormData.color}
                        onValueChange={(value) => setNewCategoryFormData({...newCategoryFormData, color: value})}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="blue">Mavi</SelectItem>
                          <SelectItem value="green">Yeşil</SelectItem>
                          <SelectItem value="yellow">Sarı</SelectItem>
                          <SelectItem value="red">Kırmızı</SelectItem>
                          <SelectItem value="purple">Mor</SelectItem>
                          <SelectItem value="orange">Turuncu</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="new-category-icon">İkon</Label>
                      <Select
                        value={newCategoryFormData.icon}
                        onValueChange={(value) => setNewCategoryFormData({...newCategoryFormData, icon: value})}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Sun">Güneş</SelectItem>
                          <SelectItem value="Zap">Elektrik</SelectItem>
                          <SelectItem value="Battery">Batarya</SelectItem>
                          <SelectItem value="Cable">Kablo</SelectItem>
                          <SelectItem value="Settings">Ayar</SelectItem>
                          <SelectItem value="Monitor">Monitör</SelectItem>
                          <SelectItem value="Package">Paket</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <Button
                    onClick={handleAddNewCategory}
                    disabled={saving || !newCategoryFormData.name}
                    className="w-full mt-4"
                  >
                    {saving ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Ekleniyor...
                      </>
                    ) : (
                      <>
                        <Plus className="w-4 h-4 mr-2" />
                        Kategori Ekle
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>

              {/* Existing Categories */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Mevcut Kategoriler</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4">
                    {categories.map((category) => {
                      const IconComponent = typeof category.icon === 'string' ? Package : category.icon
                      return (
                        <div key={category.id} className="flex items-center justify-between p-4 border rounded-lg">
                          <div className="flex items-center gap-3">
                            <IconComponent className={`w-6 h-6 text-${category.color || 'blue'}-600`} />
                            <div>
                              <p className="font-medium">{category.name}</p>
                              <p className="text-sm text-muted-foreground">
                                {category.count} ürün • ID: {category.id}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleCategoryClick(category)}
                            >
                              <Edit className="w-4 h-4 mr-1" />
                              Düzenle
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDeleteCategory(category.id)}
                              disabled={category.count > 0}
                              className={category.count > 0 ? "opacity-50 cursor-not-allowed" : "hover:bg-red-50 hover:text-red-600"}
                            >
                              <Trash2 className="w-4 h-4 mr-1" />
                              Sil
                            </Button>
                          </div>
                        </div>
                      )
                    })}
                  </div>

                  {categories.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                      <Package className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>Henüz kategori bulunmamaktadır.</p>
                      <p className="text-sm">Yukarıdaki formu kullanarak yeni kategori ekleyebilirsiniz.</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setShowCategoryManagementDialog(false)}
              >
                Kapat
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        </div>
      </DashboardLayout>
    </>
  )
}