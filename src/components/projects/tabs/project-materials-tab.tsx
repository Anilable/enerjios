'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell
} from 'recharts'
import {
  Package, Plus, Edit, Trash2, Search, Filter, Download,
  CheckCircle, XCircle, Clock, AlertTriangle, Truck, 
  Calculator, FileText, QrCode, Wrench, Zap, Box,
  DollarSign, TrendingUp, Warehouse, ShoppingCart, Eye
} from 'lucide-react'

interface ProjectMaterialsTabProps {
  project: any
}

const materialCategories = [
  { id: 'panels', name: 'Solar Paneller', icon: '⚡', color: '#3b82f6' },
  { id: 'inverters', name: 'İnverterler', icon: '🔌', color: '#10b981' },
  { id: 'mounting', name: 'Montaj Sistemi', icon: '🔧', color: '#f59e0b' },
  { id: 'cables', name: 'Kablolama', icon: '🔗', color: '#ef4444' },
  { id: 'accessories', name: 'Aksesuarlar', icon: '📦', color: '#8b5cf6' },
  { id: 'safety', name: 'Güvenlik', icon: '🛡️', color: '#06b6d4' }
]

const projectMaterials = [
  {
    id: 'MAT-001',
    category: 'panels',
    name: 'SunPower Maxeon 3 400W',
    description: '400W Monokristalin Solar Panel',
    quantity: {
      required: 125,
      ordered: 125,
      delivered: 125,
      installed: 95
    },
    unit: 'adet',
    unitCost: 680,
    totalCost: 85000,
    supplier: 'SunPower Turkey',
    model: 'SPR-MAX3-400',
    warranty: '25 yıl',
    status: 'installed',
    deliveryDate: '2024-12-19',
    location: 'Proje Sahası - Depo A',
    notes: 'Kurulum devam ediyor, 30 panel kaldı'
  },
  {
    id: 'MAT-002',
    category: 'inverters',
    name: 'SMA Sunny Tripower 25000TL',
    description: '25kW Trifaz String İnverter',
    quantity: {
      required: 2,
      ordered: 2,
      delivered: 2,
      installed: 1
    },
    unit: 'adet',
    unitCost: 12500,
    totalCost: 25000,
    supplier: 'SMA Solar Turkey',
    model: 'STP 25000TL-30',
    warranty: '10 yıl',
    status: 'delivered',
    deliveryDate: '2024-12-18',
    location: 'Proje Sahası - Ana Bina',
    notes: '1 adet kuruldu, diğeri hazır'
  },
  {
    id: 'MAT-003',
    category: 'mounting',
    name: 'Alüminyum Ray Sistemi',
    description: '4.2m Alüminyum Montaj Rayı',
    quantity: {
      required: 84,
      ordered: 90,
      delivered: 90,
      installed: 70
    },
    unit: 'adet',
    unitCost: 180,
    totalCost: 15120,
    supplier: 'Mounting Systems Turkey',
    model: 'MS-Rail 42',
    warranty: '10 yıl',
    status: 'installed',
    deliveryDate: '2024-12-17',
    location: 'Proje Sahası - Çatı',
    notes: 'Kurulum %83 tamamlandı'
  },
  {
    id: 'MAT-004',
    category: 'cables',
    name: 'DC Solar Kablo 4mm²',
    description: 'TUV Sertifikalı DC Kablo',
    quantity: {
      required: 500,
      ordered: 550,
      delivered: 550,
      installed: 400
    },
    unit: 'metre',
    unitCost: 12,
    totalCost: 6600,
    supplier: 'Prysmian Group',
    model: 'FLEXİSOL LFHX',
    warranty: '25 yıl',
    status: 'installed',
    deliveryDate: '2024-12-16',
    location: 'Proje Sahası - Çeşitli',
    notes: '150m yedek kablo mevcut'
  },
  {
    id: 'MAT-005',
    category: 'accessories',
    name: 'MC4 Konnektör Çifti',
    description: 'Su Geçirmez DC Konnektör',
    quantity: {
      required: 250,
      ordered: 300,
      delivered: 300,
      installed: 190
    },
    unit: 'çift',
    unitCost: 15,
    totalCost: 4500,
    supplier: 'Multi-Contact',
    model: 'MC4-EVO2',
    warranty: '10 yıl',
    status: 'installed',
    deliveryDate: '2024-12-16',
    location: 'Proje Sahası - Depo B',
    notes: '110 çift yedek stokta'
  },
  {
    id: 'MAT-006',
    category: 'safety',
    name: 'DC Yalıtım İzleyici',
    description: 'Sistem Güvenlik İzleme Cihazı',
    quantity: {
      required: 1,
      ordered: 1,
      delivered: 0,
      installed: 0
    },
    unit: 'adet',
    unitCost: 3500,
    totalCost: 3500,
    supplier: 'Bender GmbH',
    model: 'ISOMETER iso685-D',
    warranty: '5 yıl',
    status: 'ordered',
    deliveryDate: '2024-12-25',
    location: 'Kargo ile gelecek',
    notes: 'Tedarikçiden bekleniyor'
  }
]

const materialStatusConfig = {
  ordered: { label: 'Sipariş Verildi', color: 'bg-blue-500', variant: 'default' as const },
  delivered: { label: 'Teslim Alındı', color: 'bg-green-500', variant: 'secondary' as const },
  installed: { label: 'Kuruldu', color: 'bg-green-600', variant: 'default' as const },
  pending: { label: 'Beklemede', color: 'bg-yellow-500', variant: 'warning' as const },
  cancelled: { label: 'İptal Edildi', color: 'bg-red-500', variant: 'destructive' as const }
}

const costByCategory = materialCategories.map(category => ({
  category: category.name,
  cost: projectMaterials
    .filter(material => material.category === category.id)
    .reduce((sum, material) => sum + material.totalCost, 0),
  color: category.color
}))

const installationProgress = materialCategories.map(category => {
  const materials = projectMaterials.filter(material => material.category === category.id)
  const totalRequired = materials.reduce((sum, material) => sum + material.quantity.required, 0)
  const totalInstalled = materials.reduce((sum, material) => sum + material.quantity.installed, 0)
  
  return {
    category: category.name,
    progress: totalRequired > 0 ? Math.round((totalInstalled / totalRequired) * 100) : 0,
    installed: totalInstalled,
    total: totalRequired
  }
})

export function ProjectMaterialsTab({ project }: ProjectMaterialsTabProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [isAddMaterialOpen, setIsAddMaterialOpen] = useState(false)

  const filteredMaterials = projectMaterials.filter(material => {
    const matchesSearch = 
      material.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      material.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      material.supplier.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesCategory = categoryFilter === 'all' || material.category === categoryFilter
    const matchesStatus = statusFilter === 'all' || material.status === statusFilter
    
    return matchesSearch && matchesCategory && matchesStatus
  })

  const totalCost = projectMaterials.reduce((sum, material) => sum + material.totalCost, 0)
  const totalDelivered = projectMaterials.filter(material => 
    material.status === 'delivered' || material.status === 'installed'
  ).length
  const totalInstalled = projectMaterials.filter(material => 
    material.status === 'installed'
  ).length

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="flex items-center p-4">
            <div className="p-3 rounded-full bg-blue-100 mr-4">
              <Package className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Toplam Malzeme</p>
              <p className="text-2xl font-bold">{projectMaterials.length}</p>
              <p className="text-xs text-muted-foreground">Kalem sayısı</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center p-4">
            <div className="p-3 rounded-full bg-green-100 mr-4">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Teslim Alınan</p>
              <p className="text-2xl font-bold">{totalDelivered}</p>
              <p className="text-xs text-muted-foreground">{totalInstalled} kuruldu</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center p-4">
            <div className="p-3 rounded-full bg-purple-100 mr-4">
              <DollarSign className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Toplam Maliyet</p>
              <p className="text-2xl font-bold">₺{(totalCost / 1000).toFixed(0)}K</p>
              <p className="text-xs text-muted-foreground">Malzeme bedeli</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center p-4">
            <div className="p-3 rounded-full bg-yellow-100 mr-4">
              <TrendingUp className="h-6 w-6 text-yellow-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Kurulum İlerleme</p>
              <p className="text-2xl font-bold">78%</p>
              <p className="text-xs text-muted-foreground">Ortalama</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChart className="h-5 w-5" />
              Maliyet Dağılımı
            </CardTitle>
            <CardDescription>
              Kategorilere göre malzeme maliyetleri
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={costByCategory}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  dataKey="cost"
                  label={({ category, cost }) => `${category}: ₺${(cost/1000).toFixed(0)}K`}
                >
                  {costByCategory.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [`₺${(Number(value)/1000).toFixed(0)}K`]} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart className="h-5 w-5" />
              Kurulum İlerlemesi
            </CardTitle>
            <CardDescription>
              Kategorilere göre kurulum durumu
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {installationProgress.map((item) => (
                <div key={item.category} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">{item.category}</span>
                    <span className="text-sm text-muted-foreground">
                      {item.installed}/{item.total} (%{item.progress})
                    </span>
                  </div>
                  <Progress value={item.progress} className="h-2" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Controls */}
      <div className="flex items-center gap-4 flex-wrap">
        <div className="flex-1 max-w-sm">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Malzeme ara..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8"
            />
          </div>
        </div>

        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Kategori" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tüm Kategoriler</SelectItem>
            {materialCategories.map((category) => (
              <SelectItem key={category.id} value={category.id}>
                {category.icon} {category.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Durum" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tüm Durumlar</SelectItem>
            {Object.entries(materialStatusConfig).map(([key, config]) => (
              <SelectItem key={key} value={key}>
                {config.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <div className="flex gap-2">
          <Dialog open={isAddMaterialOpen} onOpenChange={setIsAddMaterialOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Malzeme Ekle
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Yeni Malzeme Ekle</DialogTitle>
                <DialogDescription>
                  Projeye yeni malzeme kalemi ekleyin
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="material-name">Malzeme Adı</Label>
                    <Input id="material-name" placeholder="Örn: Solar Panel 400W" />
                  </div>
                  <div>
                    <Label htmlFor="material-category">Kategori</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Kategori seçin" />
                      </SelectTrigger>
                      <SelectContent>
                        {materialCategories.map((category) => (
                          <SelectItem key={category.id} value={category.id}>
                            {category.icon} {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div>
                  <Label htmlFor="material-description">Açıklama</Label>
                  <Input id="material-description" placeholder="Malzeme açıklaması" />
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="quantity">Miktar</Label>
                    <Input id="quantity" type="number" placeholder="0" />
                  </div>
                  <div>
                    <Label htmlFor="unit">Birim</Label>
                    <Input id="unit" placeholder="adet/metre/kg" />
                  </div>
                  <div>
                    <Label htmlFor="unit-cost">Birim Fiyat (₺)</Label>
                    <Input id="unit-cost" type="number" placeholder="0" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="supplier">Tedarikçi</Label>
                    <Input id="supplier" placeholder="Tedarikçi firma" />
                  </div>
                  <div>
                    <Label htmlFor="delivery-date">Teslimat Tarihi</Label>
                    <Input id="delivery-date" type="date" />
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsAddMaterialOpen(false)}>
                  İptal
                </Button>
                <Button onClick={() => setIsAddMaterialOpen(false)}>
                  Malzeme Ekle
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            BOM İndir
          </Button>
        </div>
      </div>

      {/* Materials Table */}
      <Card>
        <CardHeader>
          <CardTitle>Malzeme Listesi ({filteredMaterials.length})</CardTitle>
          <CardDescription>
            Proje malzemelerinin detaylı listesi ve durumu
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Malzeme</TableHead>
                  <TableHead>Kategori</TableHead>
                  <TableHead>Durum</TableHead>
                  <TableHead>Miktar</TableHead>
                  <TableHead>Birim Fiyat</TableHead>
                  <TableHead>Toplam</TableHead>
                  <TableHead>Tedarikçi</TableHead>
                  <TableHead>İlerleme</TableHead>
                  <TableHead className="text-right">İşlemler</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredMaterials.map((material) => {
                  const category = materialCategories.find(cat => cat.id === material.category)!
                  const statusConfig = materialStatusConfig[material.status as keyof typeof materialStatusConfig]
                  const installProgress = Math.round((material.quantity.installed / material.quantity.required) * 100)

                  return (
                    <TableRow key={material.id}>
                      <TableCell className="font-medium">
                        <div>
                          <div className="font-semibold">{material.name}</div>
                          <div className="text-sm text-muted-foreground">
                            {material.description}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            #{material.id} • {material.model}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span className="text-lg">{category.icon}</span>
                          <span className="text-sm">{category.name}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={statusConfig.variant}>
                          {statusConfig.label}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div className="font-medium">
                            {material.quantity.required} {material.unit}
                          </div>
                          <div className="text-muted-foreground">
                            Teslim: {material.quantity.delivered}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">₺{material.unitCost.toLocaleString()}</div>
                        <div className="text-xs text-muted-foreground">
                          {material.unit} başına
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">₺{material.totalCost.toLocaleString()}</div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div className="font-medium">{material.supplier}</div>
                          <div className="text-muted-foreground">
                            {material.warranty} garanti
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="w-20">
                          <div className="flex justify-between text-xs mb-1">
                            <span>Kurulum</span>
                            <span>{installProgress}%</span>
                          </div>
                          <Progress value={installProgress} className="h-2" />
                          <div className="text-xs text-muted-foreground mt-1">
                            {material.quantity.installed}/{material.quantity.required}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex gap-1 justify-end">
                          <Button variant="ghost" size="sm">
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <QrCode className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Material Notes & Updates */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Son Güncellemeler
          </CardTitle>
          <CardDescription>
            Malzeme durumu ve teslimat notları
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {projectMaterials.filter(material => material.notes).map((material) => (
              <div key={material.id} className="flex gap-3 p-3 bg-muted/50 rounded-lg">
                <div className="p-2 bg-white rounded-lg">
                  <Package className="h-4 w-4 text-muted-foreground" />
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium">{material.name}</p>
                      <p className="text-sm text-muted-foreground">{material.notes}</p>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {material.deliveryDate}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                    <Warehouse className="w-3 h-3" />
                    {material.location}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}