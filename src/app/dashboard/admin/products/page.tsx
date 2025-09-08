'use client'

import { useState, useEffect } from 'react'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { ProductForm } from '@/components/products/product-form'
import { DataExportService } from '@/lib/data-import-export'
import {
  Package, Plus, Search, Filter, Edit, Eye, Trash2, Copy,
  MoreHorizontal, Download, Upload, AlertCircle, CheckCircle,
  Clock, Zap, Sun, Battery, Grid3x3, Cable, Settings as SettingsIcon,
  TrendingUp, TrendingDown, DollarSign, Warehouse, Barcode, 
  FileSpreadsheet, FileText, BarChart3, Target, AlertTriangle,
  RefreshCw, Archive, Star, BookOpen
} from 'lucide-react'
import { Product, ProductCategoryManager, ProductInventory } from '@/lib/product-categories'

interface ProductWithStats extends Product {
  salesCount: number
  revenue: number
  lastSold: string
  profitMargin: number
  stockValue: number
  monthlyTrend: 'up' | 'down' | 'stable'
  popularityScore: number
}

export default function ProductManagementPage() {
  const [products, setProducts] = useState<ProductWithStats[]>([])
  const [filteredProducts, setFilteredProducts] = useState<ProductWithStats[]>([])
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [stockFilter, setStockFilter] = useState('all')

  const categories = ProductCategoryManager.getCategories()

  useEffect(() => {
    fetchProducts()
  }, [])

  useEffect(() => {
    filterProducts()
  }, [products, searchTerm, categoryFilter, statusFilter, stockFilter])

  const fetchProducts = async () => {
    try {
      // Mock data - replace with actual API
      const mockProducts: ProductWithStats[] = [
        {
          id: '1',
          name: 'Jinko Solar Tiger Pro 540W',
          model: 'JKM540M-7RL3',
          brand: 'JinkoSolar',
          categoryId: 'panels',
          description: 'Yüksek verimli monokristal güneş paneli',
          specifications: {
            power: 540,
            voltage: 49.5,
            current: 10.9,
            efficiency: 21.7,
            cell_type: 'Monokristal',
            dimensions: '2278×1134×35',
            weight: 27.5,
            warranty_years: 25
          },
          pricing: {
            basePrice: 1850,
            currency: 'TRY',
            costPrice: 1400,
            margin: 32.1,
            discountTiers: [
              { minQuantity: 10, discount: 5, discountType: 'PERCENTAGE' },
              { minQuantity: 50, discount: 10, discountType: 'PERCENTAGE' }
            ],
            priceHistory: [],
            vatRate: 20,
            isVatIncluded: true
          },
          inventory: {
            sku: 'PAN-JIN-540M7R',
            stockQuantity: 245,
            reservedQuantity: 12,
            availableQuantity: 233,
            minimumStock: 50,
            maximumStock: 500,
            reorderPoint: 75,
            location: 'A-12-03',
            supplier: 'JinkoSolar Turkey',
            leadTime: 14,
            lastStockUpdate: '2024-01-20T10:30:00Z',
            stockMovements: []
          },
          images: [],
          documents: [],
          certifications: ['CE', 'IEC 61215', 'IEC 61730'],
          warranty: {
            duration: 25,
            unit: 'YEARS',
            type: 'MANUFACTURER',
            coverage: ['Performance', 'Product'],
            conditions: 'Standard warranty conditions apply'
          },
          status: 'ACTIVE',
          createdAt: '2024-01-15T00:00:00Z',
          updatedAt: '2024-01-20T10:30:00Z',
          // Stats
          salesCount: 156,
          revenue: 288600,
          lastSold: '2024-01-19',
          profitMargin: 32.1,
          stockValue: 453250,
          monthlyTrend: 'up',
          popularityScore: 89
        },
        {
          id: '2',
          name: 'Huawei SUN2000-20KTL-M2',
          model: 'SUN2000-20KTL-M2',
          brand: 'Huawei',
          categoryId: 'inverters',
          description: '20kW üç fazlı string inverter',
          specifications: {
            power_rating: 20,
            input_voltage: { min: 160, max: 1000 },
            output_voltage: 400,
            efficiency: 98.6,
            mppt_trackers: 2,
            inverter_type: 'String İnverter',
            protection_class: 'IP65',
            monitoring: true,
            communication: ['WiFi', 'Ethernet', '4G']
          },
          pricing: {
            basePrice: 28500,
            currency: 'TRY',
            costPrice: 21000,
            margin: 35.7,
            discountTiers: [
              { minQuantity: 5, discount: 3, discountType: 'PERCENTAGE' }
            ],
            priceHistory: [],
            vatRate: 20,
            isVatIncluded: true
          },
          inventory: {
            sku: 'INV-HUA-20KTL',
            stockQuantity: 28,
            reservedQuantity: 3,
            availableQuantity: 25,
            minimumStock: 10,
            maximumStock: 50,
            reorderPoint: 15,
            location: 'B-05-01',
            supplier: 'Huawei Technologies',
            leadTime: 21,
            lastStockUpdate: '2024-01-19T15:45:00Z',
            stockMovements: []
          },
          images: [],
          documents: [],
          certifications: ['CE', 'VDE-AR-N 4105', 'G99'],
          warranty: {
            duration: 5,
            unit: 'YEARS',
            type: 'MANUFACTURER',
            coverage: ['Product', 'Performance'],
            conditions: 'Manufacturer warranty terms apply'
          },
          status: 'ACTIVE',
          createdAt: '2024-01-10T00:00:00Z',
          updatedAt: '2024-01-19T15:45:00Z',
          // Stats
          salesCount: 42,
          revenue: 1197000,
          lastSold: '2024-01-18',
          profitMargin: 35.7,
          stockValue: 798000,
          monthlyTrend: 'stable',
          popularityScore: 76
        },
        {
          id: '3',
          name: 'K2 Systems TopFix 200A',
          model: 'TopFix 200A',
          brand: 'K2 Systems',
          categoryId: 'mounting',
          description: 'Kiremit çatı montaj sistemi',
          specifications: {
            mounting_type: 'Çatı Üstü',
            material: 'Alüminyum',
            roof_type: ['Kiremit'],
            wind_load: 2400,
            snow_load: 5400
          },
          pricing: {
            basePrice: 85,
            currency: 'TRY',
            costPrice: 62,
            margin: 37.1,
            discountTiers: [
              { minQuantity: 100, discount: 8, discountType: 'PERCENTAGE' }
            ],
            priceHistory: [],
            vatRate: 20,
            isVatIncluded: true
          },
          inventory: {
            sku: 'MNT-K2-TF200A',
            stockQuantity: 8,
            reservedQuantity: 0,
            availableQuantity: 8,
            minimumStock: 50,
            maximumStock: 200,
            reorderPoint: 75,
            location: 'C-08-02',
            supplier: 'K2 Systems GmbH',
            leadTime: 10,
            lastStockUpdate: '2024-01-18T09:15:00Z',
            stockMovements: []
          },
          images: [],
          documents: [],
          certifications: ['CE', 'ETA-11/0093'],
          warranty: {
            duration: 10,
            unit: 'YEARS',
            type: 'MANUFACTURER',
            coverage: ['Material', 'Corrosion'],
            conditions: 'Installation according to manual required'
          },
          status: 'ACTIVE',
          createdAt: '2024-01-08T00:00:00Z',
          updatedAt: '2024-01-18T09:15:00Z',
          // Stats
          salesCount: 234,
          revenue: 19890,
          lastSold: '2024-01-17',
          profitMargin: 37.1,
          stockValue: 680,
          monthlyTrend: 'down',
          popularityScore: 94
        }
      ]

      setProducts(mockProducts)
    } catch (error) {
      console.error('Error fetching products:', error)
    } finally {
      setLoading(false)
    }
  }

  const filterProducts = () => {
    let filtered = [...products]

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.inventory.sku.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Category filter
    if (categoryFilter !== 'all') {
      filtered = filtered.filter(product => product.categoryId === categoryFilter)
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(product => product.status === statusFilter)
    }

    // Stock filter
    if (stockFilter !== 'all') {
      switch (stockFilter) {
        case 'low':
          filtered = filtered.filter(product => product.inventory.availableQuantity <= product.inventory.reorderPoint)
          break
        case 'out':
          filtered = filtered.filter(product => product.inventory.availableQuantity === 0)
          break
        case 'good':
          filtered = filtered.filter(product => product.inventory.availableQuantity > product.inventory.reorderPoint)
          break
      }
    }

    setFilteredProducts(filtered)
  }

  const getCategoryIcon = (categoryId: string) => {
    const icons = {
      panels: Sun,
      inverters: Zap,
      mounting: Grid3x3,
      batteries: Battery,
      cables: Cable,
      accessories: SettingsIcon
    }
    return icons[categoryId as keyof typeof icons] || Package
  }

  const getCategoryBadge = (categoryId: string) => {
    const category = categories.find(cat => cat.id === categoryId)
    const Icon = getCategoryIcon(categoryId)
    return (
      <Badge variant="outline" className="flex items-center gap-1">
        <Icon className="w-3 h-3" />
        {category?.name || categoryId}
      </Badge>
    )
  }

  const getStockStatus = (inventory: ProductInventory) => {
    const { availableQuantity, reorderPoint } = inventory
    
    if (availableQuantity === 0) {
      return { status: 'out', label: 'Tükendi', color: 'text-red-600 bg-red-100' }
    } else if (availableQuantity <= reorderPoint) {
      return { status: 'low', label: 'Az Kaldı', color: 'text-yellow-600 bg-yellow-100' }
    } else {
      return { status: 'good', label: 'Uygun', color: 'text-green-600 bg-green-100' }
    }
  }

  const getTrendIcon = (trend: 'up' | 'down' | 'stable') => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="w-4 h-4 text-green-600" />
      case 'down':
        return <TrendingDown className="w-4 h-4 text-red-600" />
      default:
        return <BarChart3 className="w-4 h-4 text-gray-600" />
    }
  }

  const handleCreateProduct = async (productData: Partial<Product>) => {
    try {
      // API call to create product
      console.log('Creating product:', productData)
      setIsCreateModalOpen(false)
      await fetchProducts() // Refresh list
    } catch (error) {
      console.error('Error creating product:', error)
    }
  }

  const handleEditProduct = async (productData: Partial<Product>) => {
    try {
      // API call to update product
      console.log('Updating product:', productData)
      setIsEditModalOpen(false)
      setSelectedProduct(null)
      await fetchProducts() // Refresh list
    } catch (error) {
      console.error('Error updating product:', error)
    }
  }

  const handleDeleteProduct = async (productId: string) => {
    if (!confirm('Bu ürünü silmek istediğinizden emin misiniz?')) return

    try {
      // API call to delete product
      console.log('Deleting product:', productId)
      await fetchProducts() // Refresh list
    } catch (error) {
      console.error('Error deleting product:', error)
    }
  }

  const handleDuplicateProduct = async (product: Product) => {
    const duplicatedProduct = {
      ...product,
      id: undefined,
      name: `${product.name} (Kopya)`,
      inventory: {
        ...product.inventory,
        sku: '',
        stockQuantity: 0,
        availableQuantity: 0
      }
    }
    setSelectedProduct(duplicatedProduct)
    setIsEditModalOpen(true)
  }

  const exportProducts = async () => {
    await DataExportService.exportData(filteredProducts, {
      format: 'xlsx',
      filename: 'products_export',
      columns: [
        'name', 'brand', 'model', 'categoryId', 'status',
        'pricing.basePrice', 'inventory.stockQuantity', 'inventory.sku'
      ]
    })
  }

  // Calculate summary statistics
  const totalProducts = products.length
  const activeProducts = products.filter(p => p.status === 'ACTIVE').length
  const lowStockProducts = products.filter(p => p.inventory.availableQuantity <= p.inventory.reorderPoint).length
  const outOfStockProducts = products.filter(p => p.inventory.availableQuantity === 0).length
  const totalStockValue = products.reduce((sum, p) => sum + p.stockValue, 0)
  const avgPopularity = products.reduce((sum, p) => sum + p.popularityScore, 0) / products.length || 0

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Ürün Yönetimi</h1>
            <p className="text-muted-foreground mt-1">
              Ürün kataloğu ve stok yönetimi
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" onClick={exportProducts}>
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
            <Button variant="outline">
              <Upload className="w-4 h-4 mr-2" />
              Import
            </Button>
            <Button onClick={() => setIsCreateModalOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Yeni Ürün
            </Button>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Toplam Ürün</p>
                  <p className="text-2xl font-bold">{totalProducts}</p>
                </div>
                <Package className="w-8 h-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Aktif Ürün</p>
                  <p className="text-2xl font-bold">{activeProducts}</p>
                </div>
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Az Stok</p>
                  <p className="text-2xl font-bold text-yellow-600">{lowStockProducts}</p>
                </div>
                <AlertTriangle className="w-8 h-8 text-yellow-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Tükenen</p>
                  <p className="text-2xl font-bold text-red-600">{outOfStockProducts}</p>
                </div>
                <AlertCircle className="w-8 h-8 text-red-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Stok Değeri</p>
                  <p className="text-2xl font-bold">₺{(totalStockValue / 1000000).toFixed(1)}M</p>
                </div>
                <DollarSign className="w-8 h-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Ort. Popülerlik</p>
                  <p className="text-2xl font-bold">{avgPopularity.toFixed(0)}%</p>
                </div>
                <Star className="w-8 h-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Ürün adı, marka, model veya SKU ile ara..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Kategori" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tüm Kategoriler</SelectItem>
                  {categories.map(category => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Durum" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tüm Durumlar</SelectItem>
                  <SelectItem value="ACTIVE">Aktif</SelectItem>
                  <SelectItem value="INACTIVE">Pasif</SelectItem>
                  <SelectItem value="DISCONTINUED">Üretimi Durmuş</SelectItem>
                </SelectContent>
              </Select>
              <Select value={stockFilter} onValueChange={setStockFilter}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Stok Durumu" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tüm Stoklar</SelectItem>
                  <SelectItem value="good">Uygun Stok</SelectItem>
                  <SelectItem value="low">Az Stok</SelectItem>
                  <SelectItem value="out">Tükenen</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Products Table */}
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Ürün</TableHead>
                <TableHead>Kategori</TableHead>
                <TableHead>SKU</TableHead>
                <TableHead>Fiyat</TableHead>
                <TableHead>Stok</TableHead>
                <TableHead>Satış</TableHead>
                <TableHead>Trend</TableHead>
                <TableHead>Durum</TableHead>
                <TableHead>İşlemler</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredProducts.map((product) => {
                const stockStatus = getStockStatus(product.inventory)
                const Icon = getCategoryIcon(product.categoryId)
                
                return (
                  <TableRow key={product.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                          <Icon className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <div className="font-medium">{product.name}</div>
                          <div className="text-sm text-muted-foreground">
                            {product.brand} • {product.model}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {getCategoryBadge(product.categoryId)}
                    </TableCell>
                    <TableCell>
                      <div className="font-mono text-sm">{product.inventory.sku}</div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">
                          {product.pricing.basePrice.toLocaleString()} ₺
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Margin: %{product.profitMargin.toFixed(1)}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{product.inventory.availableQuantity}</span>
                          <Badge className={stockStatus.color} variant="outline">
                            {stockStatus.label}
                          </Badge>
                        </div>
                        {product.inventory.reservedQuantity > 0 && (
                          <div className="text-xs text-muted-foreground">
                            {product.inventory.reservedQuantity} rezerve
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{product.salesCount} adet</div>
                        <div className="text-sm text-muted-foreground">
                          ₺{(product.revenue / 1000).toFixed(0)}k
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        {getTrendIcon(product.monthlyTrend)}
                        <span className="text-sm">{product.popularityScore}%</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={product.status === 'ACTIVE' ? 'default' : 'secondary'}>
                        {product.status === 'ACTIVE' ? 'Aktif' : product.status === 'INACTIVE' ? 'Pasif' : 'Üretimi Durmuş'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>İşlemler</DropdownMenuLabel>
                          <DropdownMenuItem 
                            onClick={() => {
                              setSelectedProduct(product)
                              setIsEditModalOpen(true)
                            }}
                          >
                            <Edit className="mr-2 h-4 w-4" />
                            Düzenle
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleDuplicateProduct(product)}>
                            <Copy className="mr-2 h-4 w-4" />
                            Kopyala
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => handleDeleteProduct(product.id)}>
                            <Trash2 className="mr-2 h-4 w-4" />
                            Sil
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </Card>

        {/* Create Product Modal */}
        <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
          <DialogContent className="max-w-6xl max-h-[95vh] overflow-y-auto">
            <ProductForm
              onSave={handleCreateProduct}
              onCancel={() => setIsCreateModalOpen(false)}
            />
          </DialogContent>
        </Dialog>

        {/* Edit Product Modal */}
        <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
          <DialogContent className="max-w-6xl max-h-[95vh] overflow-y-auto">
            <ProductForm
              product={selectedProduct || undefined}
              onSave={handleEditProduct}
              onCancel={() => {
                setIsEditModalOpen(false)
                setSelectedProduct(null)
              }}
            />
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  )
}