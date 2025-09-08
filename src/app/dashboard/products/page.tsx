'use client'

import { useState } from 'react'
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
  FileSpreadsheet
} from 'lucide-react'

type Product = {
  id: string
  name: string
  category: string
  brand: string
  model: string
  power: string
  price: number
  stock: number
  status: string
  warranty: string
}

type Category = {
  id: string
  name: string
  count: number
  icon: React.ComponentType<{ className?: string }>
  isEditing?: boolean
  originalName?: string
}

const initialCategories: Category[] = [
  { id: '1', name: 'Solar Paneller', count: 45, icon: Sun },
  { id: '2', name: 'İnverterler', count: 23, icon: Zap },
  { id: '3', name: 'Bataryalar', count: 18, icon: Battery },
  { id: '4', name: 'Montaj Malzemeleri', count: 67, icon: Settings },
]

const initialProducts: Product[] = [
  {
    id: '1',
    name: 'Mono PERC 540W Solar Panel',
    category: 'Solar Paneller',
    brand: 'JinkoSolar',
    model: 'JKM540M-72HL4-V',
    power: '540W',
    price: 1250,
    stock: 150,
    status: 'Stokta',
    warranty: '25 yıl'
  },
  {
    id: '2',
    name: 'String İnverter 10kW',
    category: 'İnverterler',
    brand: 'Huawei',
    model: 'SUN2000-10KTL-M1',
    power: '10kW',
    price: 8500,
    stock: 25,
    status: 'Stokta',
    warranty: '10 yıl'
  },
  {
    id: '3',
    name: 'Lithium Batarya 10kWh',
    category: 'Bataryalar',
    brand: 'BYD',
    model: 'Battery-Box Premium LVS 10.2',
    power: '10.2kWh',
    price: 15000,
    stock: 8,
    status: 'Azalıyor',
    warranty: '10 yıl'
  },
  {
    id: '4',
    name: 'Çatı Montaj Rail Sistemi',
    category: 'Montaj Malzemeleri',
    brand: 'Schletter',
    model: 'Eco Rail System',
    power: '-',
    price: 45,
    stock: 0,
    status: 'Tükendi',
    warranty: '15 yıl'
  }
]

export default function ProductsPage() {
  const { toast } = useToast()
  const [products, setProducts] = useState<Product[]>(initialProducts)
  const [searchTerm, setSearchTerm] = useState('')
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [showBulkAddDialog, setShowBulkAddDialog] = useState(false)
  const [showStockUpdateDialog, setShowStockUpdateDialog] = useState(false)
  const [showPriceUpdateDialog, setShowPriceUpdateDialog] = useState(false)
  const [showCategoryDialog, setShowCategoryDialog] = useState(false)
  const [showOrderDialog, setShowOrderDialog] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [formData, setFormData] = useState<Partial<Product>>({})
  const [categories, setCategories] = useState<Category[]>(initialCategories)
  const [showDeleteCategoryDialog, setShowDeleteCategoryDialog] = useState(false)
  const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(null)
  const [newCategoryName, setNewCategoryName] = useState('')
  const [isAddingNewCategory, setIsAddingNewCategory] = useState(false)
  const [isSavingCategories, setIsSavingCategories] = useState(false)

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.category.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleAddProduct = () => {
    if (!formData.name || !formData.category || !formData.price || !formData.stock) {
      toast({
        title: "Hata",
        description: "Lütfen tüm gerekli alanları doldurun.",
        variant: "destructive"
      })
      return
    }

    const newProduct: Product = {
      id: Date.now().toString(),
      name: formData.name || '',
      category: formData.category || '',
      brand: formData.brand || '',
      model: formData.model || '',
      power: formData.power || '',
      price: Number(formData.price) || 0,
      stock: Number(formData.stock) || 0,
      status: Number(formData.stock) > 20 ? 'Stokta' : Number(formData.stock) > 0 ? 'Azalıyor' : 'Tükendi',
      warranty: formData.warranty || ''
    }

    setProducts([...products, newProduct])
    setFormData({})
    setShowAddDialog(false)
    toast({
      title: "Başarılı",
      description: "Ürün başarıyla eklendi."
    })
  }

  const handleEditProduct = () => {
    if (!selectedProduct || !formData.name || !formData.category || !formData.price || formData.stock === undefined) {
      toast({
        title: "Hata",
        description: "Lütfen tüm gerekli alanları doldurun.",
        variant: "destructive"
      })
      return
    }

    const updatedProducts = products.map(product =>
      product.id === selectedProduct.id
        ? {
            ...product,
            ...formData,
            price: Number(formData.price),
            stock: Number(formData.stock),
            status: Number(formData.stock) > 20 ? 'Stokta' : Number(formData.stock) > 0 ? 'Azalıyor' : 'Tükendi'
          }
        : product
    )

    setProducts(updatedProducts)
    setFormData({})
    setSelectedProduct(null)
    setShowEditDialog(false)
    toast({
      title: "Başarılı",
      description: "Ürün başarıyla güncellendi."
    })
  }

  const handleDeleteProduct = () => {
    if (!selectedProduct) return

    const updatedProducts = products.filter(product => product.id !== selectedProduct.id)
    setProducts(updatedProducts)
    setSelectedProduct(null)
    setShowDeleteDialog(false)
    toast({
      title: "Başarılı",
      description: "Ürün başarıyla silindi."
    })
  }

  // Category Management Functions
  const handleEditCategory = (categoryId: string) => {
    setCategories(prev => 
      prev.map(category => 
        category.id === categoryId 
          ? { ...category, isEditing: true, originalName: category.name }
          : { ...category, isEditing: false }
      )
    )
  }

  const handleSaveCategoryEdit = (categoryId: string) => {
    const category = categories.find(c => c.id === categoryId)
    if (!category || !category.name.trim()) {
      toast({
        title: "Hata",
        description: "Kategori adı boş olamaz.",
        variant: "destructive"
      })
      return
    }

    // Check for duplicate names
    const isDuplicate = categories.some(c => 
      c.id !== categoryId && c.name.toLowerCase() === category.name.toLowerCase()
    )

    if (isDuplicate) {
      toast({
        title: "Hata",
        description: "Bu kategori adı zaten kullanılıyor.",
        variant: "destructive"
      })
      return
    }

    setCategories(prev => 
      prev.map(c => 
        c.id === categoryId 
          ? { ...c, isEditing: false, originalName: undefined }
          : c
      )
    )

    toast({
      title: "Başarılı",
      description: "Kategori başarıyla güncellendi."
    })
  }

  const handleCancelCategoryEdit = (categoryId: string) => {
    setCategories(prev => 
      prev.map(category => 
        category.id === categoryId 
          ? { 
              ...category, 
              name: category.originalName || category.name,
              isEditing: false, 
              originalName: undefined 
            }
          : category
      )
    )
  }

  const handleCategoryNameChange = (categoryId: string, newName: string) => {
    setCategories(prev => 
      prev.map(category => 
        category.id === categoryId 
          ? { ...category, name: newName }
          : category
      )
    )
  }

  const handleAddNewCategory = () => {
    if (!newCategoryName.trim()) {
      toast({
        title: "Hata",
        description: "Kategori adı boş olamaz.",
        variant: "destructive"
      })
      return
    }

    // Check for duplicate names
    const isDuplicate = categories.some(c => 
      c.name.toLowerCase() === newCategoryName.toLowerCase()
    )

    if (isDuplicate) {
      toast({
        title: "Hata",
        description: "Bu kategori adı zaten kullanılıyor.",
        variant: "destructive"
      })
      return
    }

    const newCategory: Category = {
      id: Date.now().toString(),
      name: newCategoryName.trim(),
      count: 0,
      icon: Package
    }

    setCategories(prev => [...prev, newCategory])
    setNewCategoryName('')
    setIsAddingNewCategory(false)

    toast({
      title: "Başarılı",
      description: "Yeni kategori başarıyla eklendi."
    })
  }

  const handleDeleteCategory = (category: Category) => {
    // Check if category is used by products
    const isUsed = products.some(product => product.category === category.name)
    
    if (isUsed) {
      toast({
        title: "Hata",
        description: "Bu kategori ürünler tarafından kullanılıyor. Önce ilgili ürünleri başka kategorilere taşıyın.",
        variant: "destructive"
      })
      return
    }

    setCategoryToDelete(category)
    setShowDeleteCategoryDialog(true)
  }

  const confirmDeleteCategory = () => {
    if (categoryToDelete) {
      setCategories(prev => prev.filter(c => c.id !== categoryToDelete.id))
      setCategoryToDelete(null)
      setShowDeleteCategoryDialog(false)
      
      toast({
        title: "Başarılı",
        description: "Kategori başarıyla silindi."
      })
    }
  }

  const handleSaveAllCategories = async () => {
    setIsSavingCategories(true)
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // Update category counts based on current products
    const updatedCategories = categories.map(category => ({
      ...category,
      count: products.filter(product => product.category === category.name).length,
      isEditing: false,
      originalName: undefined
    }))

    setCategories(updatedCategories)
    setIsSavingCategories(false)
    setShowCategoryDialog(false)
    setIsAddingNewCategory(false)
    setNewCategoryName('')

    toast({
      title: "Başarılı",
      description: "Kategori değişiklikleri kaydedildi."
    })
  }

  const handleCloseCategoryDialog = () => {
    // Reset any unsaved changes
    setCategories(prev => 
      prev.filter(c => c.id !== 'temp').map(category => ({
        ...category,
        name: category.originalName || category.name,
        isEditing: false,
        originalName: undefined
      }))
    )
    setIsAddingNewCategory(false)
    setNewCategoryName('')
    setShowCategoryDialog(false)
  }

  const openEditDialog = (product: Product) => {
    setSelectedProduct(product)
    setFormData(product)
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
                    <Label htmlFor="brand">Marka</Label>
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
                    <Label htmlFor="power">Güç/Kapasite</Label>
                    <Input
                      id="power"
                      value={formData.power || ''}
                      onChange={(e) => setFormData({...formData, power: e.target.value})}
                      placeholder="örn. 540W"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="warranty">Garanti</Label>
                    <Input
                      id="warranty"
                      value={formData.warranty || ''}
                      onChange={(e) => setFormData({...formData, warranty: e.target.value})}
                      placeholder="örn. 25 yıl"
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
                    <Label htmlFor="stock">Stok *</Label>
                    <Input
                      id="stock"
                      type="number"
                      value={formData.stock || ''}
                      onChange={(e) => setFormData({...formData, stock: Number(e.target.value)})}
                      placeholder="0"
                    />
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowAddDialog(false)}>
                  İptal
                </Button>
                <Button onClick={handleAddProduct}>Ürün Ekle</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Category Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {categories.map((category, index) => (
            <Card key={index}>
              <CardContent className="p-6">
                <div className="flex items-center gap-2">
                  <category.icon className="w-5 h-5 text-blue-600" />
                  <div>
                    <p className="text-2xl font-bold">{category.count}</p>
                    <p className="text-sm text-muted-foreground">{category.name}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
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
                            {product.brand} - {product.model}
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
                {products.filter(p => p.stock < 20).map(product => (
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
                ))}
              </div>
              
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
            </CardContent>
          </Card>

          {/* Performance Analytics */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Ürün Performansı
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm">En Çok Satan</span>
                    <span className="text-sm font-medium">540W Solar Panel</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-green-600 h-2 rounded-full" style={{width: '85%'}}></div>
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm">En Karlı</span>
                    <span className="text-sm font-medium">String İnverter</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-blue-600 h-2 rounded-full" style={{width: '72%'}}></div>
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm">Hızlı Tükenen</span>
                    <span className="text-sm font-medium">Lithium Batarya</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-orange-600 h-2 rounded-full" style={{width: '90%'}}></div>
                  </div>
                </div>
              </div>
              
              <div className="mt-4 pt-4 border-t">
                <p className="text-sm text-muted-foreground mb-2">Bu Ay Satış</p>
                <p className="text-2xl font-bold">{formatCurrency(145000)}</p>
                <p className="text-sm text-green-600">↗ %12 artış</p>
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
                          <SelectItem value="solar">Solar Paneller</SelectItem>
                          <SelectItem value="inverter">İnverterler</SelectItem>
                          <SelectItem value="battery">Bataryalar</SelectItem>
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

              <Dialog open={showCategoryDialog} onOpenChange={handleCloseCategoryDialog}>
                <DialogTrigger asChild>
                  <Button variant="outline" className="flex flex-col items-center gap-2 h-20">
                    <Package className="w-5 h-5" />
                    Kategori Yönetimi
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle>Kategori Yönetimi</DialogTitle>
                    <DialogDescription>
                      Ürün kategorilerini yönetin. Kategoriler otomatik olarak güncellenir.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="py-4">
                    <div className="space-y-3 max-h-60 overflow-y-auto">
                      {categories.map((category) => (
                        <div key={category.id} className="flex items-center justify-between p-3 border rounded-lg bg-gray-50">
                          <div className="flex items-center space-x-2 flex-1">
                            <category.icon className="w-4 h-4 text-gray-500" />
                            {category.isEditing ? (
                              <Input
                                value={category.name}
                                onChange={(e) => handleCategoryNameChange(category.id, e.target.value)}
                                className="h-8 text-sm flex-1"
                                autoFocus
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') {
                                    handleSaveCategoryEdit(category.id)
                                  } else if (e.key === 'Escape') {
                                    handleCancelCategoryEdit(category.id)
                                  }
                                }}
                              />
                            ) : (
                              <div className="flex-1">
                                <span className="font-medium">{category.name}</span>
                                <span className="text-xs text-gray-500 ml-2">({category.count} ürün)</span>
                              </div>
                            )}
                          </div>
                          <div className="flex items-center space-x-1">
                            {category.isEditing ? (
                              <>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="h-8 w-8 p-0 text-green-600 hover:text-green-700 hover:bg-green-50"
                                  onClick={() => handleSaveCategoryEdit(category.id)}
                                >
                                  ✓
                                </Button>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                                  onClick={() => handleCancelCategoryEdit(category.id)}
                                >
                                  ✕
                                </Button>
                              </>
                            ) : (
                              <>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="h-8 w-8 p-0"
                                  onClick={() => handleEditCategory(category.id)}
                                >
                                  <Edit className="w-3 h-3" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                                  onClick={() => handleDeleteCategory(category)}
                                >
                                  <Trash2 className="w-3 h-3" />
                                </Button>
                              </>
                            )}
                          </div>
                        </div>
                      ))}
                      
                      {/* Add new category row */}
                      {isAddingNewCategory && (
                        <div className="flex items-center justify-between p-3 border border-dashed rounded-lg bg-blue-50">
                          <div className="flex items-center space-x-2 flex-1">
                            <Package className="w-4 h-4 text-gray-500" />
                            <Input
                              value={newCategoryName}
                              onChange={(e) => setNewCategoryName(e.target.value)}
                              placeholder="Yeni kategori adı"
                              className="h-8 text-sm flex-1"
                              autoFocus
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                  handleAddNewCategory()
                                } else if (e.key === 'Escape') {
                                  setIsAddingNewCategory(false)
                                  setNewCategoryName('')
                                }
                              }}
                            />
                          </div>
                          <div className="flex items-center space-x-1">
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-8 w-8 p-0 text-green-600 hover:text-green-700 hover:bg-green-50"
                              onClick={handleAddNewCategory}
                            >
                              ✓
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                              onClick={() => {
                                setIsAddingNewCategory(false)
                                setNewCategoryName('')
                              }}
                            >
                              ✕
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                    
                    {!isAddingNewCategory && (
                      <Button
                        variant="outline"
                        className="w-full mt-4"
                        onClick={() => setIsAddingNewCategory(true)}
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Yeni Kategori Ekle
                      </Button>
                    )}
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={handleCloseCategoryDialog}>
                      İptal
                    </Button>
                    <Button 
                      onClick={handleSaveAllCategories} 
                      disabled={isSavingCategories}
                    >
                      {isSavingCategories ? 'Kaydediliyor...' : 'Kaydet'}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
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
                  <Label htmlFor="edit-price">Fiyat (₺) *</Label>
                  <Input
                    id="edit-price"
                    type="number"
                    value={formData.price || ''}
                    onChange={(e) => setFormData({...formData, price: Number(e.target.value)})}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="edit-stock">Stok *</Label>
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
              <Button variant="outline" onClick={() => setShowEditDialog(false)}>
                İptal
              </Button>
              <Button onClick={handleEditProduct}>Güncelle</Button>
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
              <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
                İptal
              </Button>
              <Button variant="destructive" onClick={handleDeleteProduct}>
                Sil
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Category Confirmation Dialog */}
        <Dialog open={showDeleteCategoryDialog} onOpenChange={setShowDeleteCategoryDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Kategoriyi Sil</DialogTitle>
              <DialogDescription>
                Bu kategoriyi silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.
              </DialogDescription>
            </DialogHeader>
            {categoryToDelete && (
              <div className="py-4">
                <div className="flex items-center space-x-2 p-3 border rounded-lg bg-gray-50">
                  <categoryToDelete.icon className="w-5 h-5 text-gray-500" />
                  <div>
                    <p className="font-medium">{categoryToDelete.name}</p>
                    <p className="text-sm text-gray-500">{categoryToDelete.count} ürün</p>
                  </div>
                </div>
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => {
                setShowDeleteCategoryDialog(false)
                setCategoryToDelete(null)
              }}>
                İptal
              </Button>
              <Button variant="destructive" onClick={confirmDeleteCategory}>
                Sil
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        </div>
      </DashboardLayout>
    </>
  )
}