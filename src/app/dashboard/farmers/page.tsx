'use client'

import { useState, useEffect } from 'react'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Tractor,
  Plus,
  Search,
  MoreHorizontal,
  MapPin,
  Phone,
  Mail,
  Wheat,
  Droplets,
  Trash2,
  Edit,
  Loader2,
  AlertTriangle
} from 'lucide-react'
import { toast } from 'sonner'

interface Farmer {
  id: string
  name: string
  email: string
  phone: string
  farmName: string
  location: string
  farmSize: string
  cropType: string
  systemSize: string
  status: string
  joinDate: string
  farmCount: number
  projectCount: number
  irrigationType: string
  livestockCount: number
  monthlyConsumption: number
  coldStorage: boolean
}

export default function FarmersPage() {
  const [farmers, setFarmers] = useState<Farmer[]>([])
  const [filteredFarmers, setFilteredFarmers] = useState<Farmer[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [farmerToDelete, setFarmerToDelete] = useState<Farmer | null>(null)
  const [deleting, setDeleting] = useState(false)

  // Fetch farmers from API
  const fetchFarmers = async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch('/api/farmers')

      if (!response.ok) {
        throw new Error(`Failed to fetch farmers: ${response.statusText}`)
      }

      const farmersData = await response.json()
      setFarmers(farmersData)
      setFilteredFarmers(farmersData)
    } catch (err) {
      console.error('Error fetching farmers:', err)
      setError(err instanceof Error ? err.message : 'An error occurred while fetching farmers')
      toast.error('Çiftçiler yüklenirken hata oluştu')
    } finally {
      setLoading(false)
    }
  }

  // Delete farmer
  const deleteFarmer = async (farmerId: string) => {
    try {
      setDeleting(true)

      const response = await fetch(`/api/farmers?id=${farmerId}`, {
        method: 'DELETE'
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to delete farmer')
      }

      // Remove from local state
      const updatedFarmers = farmers.filter(farmer => farmer.id !== farmerId)
      setFarmers(updatedFarmers)
      setFilteredFarmers(updatedFarmers.filter(farmer =>
        farmer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        farmer.farmName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        farmer.email.toLowerCase().includes(searchTerm.toLowerCase())
      ))

      toast.success('Çiftçi başarıyla silindi')
      setDeleteDialogOpen(false)
      setFarmerToDelete(null)
    } catch (err) {
      console.error('Error deleting farmer:', err)
      toast.error(err instanceof Error ? err.message : 'Çiftçi silinirken hata oluştu')
    } finally {
      setDeleting(false)
    }
  }

  // Filter farmers based on search term
  useEffect(() => {
    if (!searchTerm) {
      setFilteredFarmers(farmers)
    } else {
      const filtered = farmers.filter(farmer =>
        farmer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        farmer.farmName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        farmer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        farmer.location.toLowerCase().includes(searchTerm.toLowerCase())
      )
      setFilteredFarmers(filtered)
    }
  }, [searchTerm, farmers])

  // Load farmers on component mount
  useEffect(() => {
    fetchFarmers()
  }, [])

  // Calculate statistics
  const stats = {
    totalFarmers: farmers.length,
    totalFarmSize: farmers.reduce((sum, farmer) => {
      const size = parseFloat(farmer.farmSize.replace(/[^\d.]/g, '')) || 0
      return sum + size
    }, 0),
    totalSystemSize: farmers.reduce((sum, farmer) => {
      const size = parseFloat(farmer.systemSize.replace(/[^\d.]/g, '')) || 0
      return sum + size
    }, 0),
    newThisMonth: farmers.filter(farmer => {
      const joinDate = new Date(farmer.joinDate)
      const thisMonth = new Date()
      return joinDate.getMonth() === thisMonth.getMonth() &&
             joinDate.getFullYear() === thisMonth.getFullYear()
    }).length
  }

  const openDeleteDialog = (farmer: Farmer) => {
    setFarmerToDelete(farmer)
    setDeleteDialogOpen(true)
  }

  const confirmDelete = () => {
    if (farmerToDelete) {
      deleteFarmer(farmerToDelete.id)
    }
  }

  return (
    <DashboardLayout title="Çiftçi Yönetimi">
      <div className="space-y-6">
        {/* Header Actions */}
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Çiftçi ara..."
                className="pl-10 w-64"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          <Button className="flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Yeni Çiftçi Ekle
          </Button>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-2">
                <Tractor className="w-5 h-5 text-green-600" />
                <div>
                  <p className="text-2xl font-bold">
                    {loading ? <Skeleton className="h-8 w-12" /> : stats.totalFarmers}
                  </p>
                  <p className="text-sm text-muted-foreground">Toplam Çiftçi</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-2">
                <Wheat className="w-5 h-5 text-yellow-600" />
                <div>
                  <p className="text-2xl font-bold">
                    {loading ? <Skeleton className="h-8 w-16" /> : stats.totalFarmSize.toLocaleString()}
                  </p>
                  <p className="text-sm text-muted-foreground">Toplam Dönüm</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-2">
                <Droplets className="w-5 h-5 text-blue-600" />
                <div>
                  <p className="text-2xl font-bold">
                    {loading ? <Skeleton className="h-8 w-16" /> : `${stats.totalSystemSize.toFixed(1)} kW`}
                  </p>
                  <p className="text-sm text-muted-foreground">Kurulu Güç</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-2">
                <Tractor className="w-5 h-5 text-purple-600" />
                <div>
                  <p className="text-2xl font-bold">
                    {loading ? <Skeleton className="h-8 w-8" /> : stats.newThisMonth}
                  </p>
                  <p className="text-sm text-muted-foreground">Bu Ay Yeni</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Error State */}
        {error && (
          <Card className="border-red-200 bg-red-50">
            <CardContent className="p-6">
              <div className="flex items-center gap-2 text-red-700">
                <AlertTriangle className="w-5 h-5" />
                <div>
                  <p className="font-medium">Hata</p>
                  <p className="text-sm">{error}</p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-2"
                    onClick={fetchFarmers}
                  >
                    Tekrar Dene
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Farmers Table */}
        <Card>
          <CardHeader>
            <CardTitle>Çiftçi Listesi</CardTitle>
            <CardDescription>
              Kayıtlı çiftçileri ve tarım işletmelerini görüntüleyin
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4">Çiftçi</th>
                    <th className="text-left py-3 px-4">Çiftlik</th>
                    <th className="text-left py-3 px-4">Konum</th>
                    <th className="text-left py-3 px-4">Alan/Ürün</th>
                    <th className="text-left py-3 px-4">GES Gücü</th>
                    <th className="text-left py-3 px-4">Durum</th>
                    <th className="text-left py-3 px-4">İşlemler</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    // Loading skeleton
                    Array.from({ length: 5 }).map((_, index) => (
                      <tr key={index} className="border-b">
                        <td className="py-3 px-4">
                          <div>
                            <Skeleton className="h-5 w-32 mb-1" />
                            <Skeleton className="h-4 w-40" />
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div>
                            <Skeleton className="h-5 w-28 mb-1" />
                            <Skeleton className="h-4 w-32" />
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <Skeleton className="h-4 w-24" />
                        </td>
                        <td className="py-3 px-4">
                          <div>
                            <Skeleton className="h-5 w-20 mb-1" />
                            <Skeleton className="h-4 w-24" />
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <Skeleton className="h-6 w-16" />
                        </td>
                        <td className="py-3 px-4">
                          <Skeleton className="h-6 w-16" />
                        </td>
                        <td className="py-3 px-4">
                          <Skeleton className="h-8 w-8" />
                        </td>
                      </tr>
                    ))
                  ) : filteredFarmers.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-8 px-4 text-center text-muted-foreground">
                        {searchTerm ? 'Arama kriterlerinize uygun çiftçi bulunamadı.' : 'Henüz kayıtlı çiftçi bulunmuyor.'}
                      </td>
                    </tr>
                  ) : (
                    filteredFarmers.map((farmer) => (
                      <tr key={farmer.id} className="border-b hover:bg-gray-50">
                        <td className="py-3 px-4">
                          <div>
                            <p className="font-medium">{farmer.name}</p>
                            <div className="flex items-center gap-1 text-sm text-muted-foreground">
                              <Mail className="w-3 h-3" />
                              {farmer.email}
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div>
                            <p className="font-medium">{farmer.farmName}</p>
                            <div className="flex items-center gap-1 text-sm text-muted-foreground">
                              <Phone className="w-3 h-3" />
                              {farmer.phone}
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-1 text-sm">
                            <MapPin className="w-3 h-3" />
                            {farmer.location}
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div>
                            <p className="font-medium">{farmer.farmSize}</p>
                            <p className="text-sm text-muted-foreground">{farmer.cropType}</p>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <Badge variant="outline" className="bg-green-50 text-green-700">
                            {farmer.systemSize}
                          </Badge>
                        </td>
                        <td className="py-3 px-4">
                          <Badge
                            variant={farmer.status === 'Aktif' ? 'default' : 'secondary'}
                            className={
                              farmer.status === 'Aktif'
                                ? 'bg-green-100 text-green-800'
                                : farmer.status === 'Planlama'
                                ? 'bg-yellow-100 text-yellow-800'
                                : 'bg-gray-100 text-gray-800'
                            }
                          >
                            {farmer.status}
                          </Badge>
                        </td>
                        <td className="py-3 px-4">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreHorizontal className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem>
                                <Edit className="w-4 h-4 mr-2" />
                                Düzenle
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                className="text-red-600"
                                onClick={() => openDeleteDialog(farmer)}
                              >
                                <Trash2 className="w-4 h-4 mr-2" />
                                Sil
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Regional Distribution */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Bölgesel Dağılım</CardTitle>
              <CardDescription>
                Çiftçilerin bölgelere göre dağılımı
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Konya</span>
                  <div className="flex items-center gap-2">
                    <div className="w-20 bg-gray-200 rounded-full h-2">
                      <div className="bg-green-600 h-2 rounded-full" style={{width: '65%'}}></div>
                    </div>
                    <span className="text-sm font-medium">
                      {filteredFarmers.filter(f => f.location.includes('Konya')).length} çiftçi
                    </span>
                  </div>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-sm">Ankara</span>
                  <div className="flex items-center gap-2">
                    <div className="w-20 bg-gray-200 rounded-full h-2">
                      <div className="bg-green-600 h-2 rounded-full" style={{width: '45%'}}></div>
                    </div>
                    <span className="text-sm font-medium">
                      {filteredFarmers.filter(f => f.location.includes('Ankara')).length} çiftçi
                    </span>
                  </div>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-sm">Antalya</span>
                  <div className="flex items-center gap-2">
                    <div className="w-20 bg-gray-200 rounded-full h-2">
                      <div className="bg-green-600 h-2 rounded-full" style={{width: '35%'}}></div>
                    </div>
                    <span className="text-sm font-medium">
                      {filteredFarmers.filter(f => f.location.includes('Antalya')).length} çiftçi
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Ürün Türleri</CardTitle>
              <CardDescription>
                Çiftliklerde yetiştirilen ürün dağılımı
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center gap-3 p-3 bg-yellow-50 rounded-lg">
                  <Wheat className="w-5 h-5 text-yellow-600" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">Tahıl (Buğday, Arpa, Mısır)</p>
                    <p className="text-xs text-gray-500">
                      {filteredFarmers.filter(f =>
                        f.cropType.toLowerCase().includes('buğday') ||
                        f.cropType.toLowerCase().includes('arpa') ||
                        f.cropType.toLowerCase().includes('mısır')
                      ).length} çiftlik
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                  <Droplets className="w-5 h-5 text-green-600" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">Sera Ürünleri</p>
                    <p className="text-xs text-gray-500">
                      {filteredFarmers.filter(f =>
                        f.cropType.toLowerCase().includes('domates') ||
                        f.cropType.toLowerCase().includes('biber') ||
                        f.cropType.toLowerCase().includes('sera')
                      ).length} çiftlik
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-orange-50 rounded-lg">
                  <Tractor className="w-5 h-5 text-orange-600" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">Diğer Ürünler</p>
                    <p className="text-xs text-gray-500">
                      {filteredFarmers.filter(f =>
                        !f.cropType.toLowerCase().includes('buğday') &&
                        !f.cropType.toLowerCase().includes('arpa') &&
                        !f.cropType.toLowerCase().includes('mısır') &&
                        !f.cropType.toLowerCase().includes('domates') &&
                        !f.cropType.toLowerCase().includes('biber') &&
                        !f.cropType.toLowerCase().includes('sera')
                      ).length} çiftlik
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Delete Confirmation Dialog */}
        <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-red-600" />
                Çiftçiyi Sil
              </DialogTitle>
              <DialogDescription>
                <strong>{farmerToDelete?.name}</strong> isimli çiftçiyi silmek istediğinizden emin misiniz?
                Bu işlem geri alınamaz ve çiftçiye ait tüm veriler silinecektir.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setDeleteDialogOpen(false)}
                disabled={deleting}
              >
                İptal
              </Button>
              <Button
                variant="destructive"
                onClick={confirmDelete}
                disabled={deleting}
              >
                {deleting ? (
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
      </div>
    </DashboardLayout>
  )
}