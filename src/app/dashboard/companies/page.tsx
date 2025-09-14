'use client'

import { useState, useEffect } from 'react'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { useToast } from '@/hooks/use-toast'
import {
  Building,
  Plus,
  Search,
  MoreHorizontal,
  MapPin,
  Phone,
  Mail,
  Calendar,
  Edit,
  Eye,
  Trash2,
  Loader2
} from 'lucide-react'

type Company = {
  id: string
  name: string
  taxNumber: string
  type: 'INSTALLER' | 'MANUFACTURER' | 'CONSULTANT' | 'BANK'
  address: string | null
  city: string | null
  district: string | null
  phone: string | null
  website: string | null
  logo: string | null
  description: string | null
  rating: number
  verified: boolean
  createdAt: Date
  updatedAt: Date
  _count: {
    projects: number
  }
}

export default function CompaniesPage() {
  const { toast } = useToast()
  const [companies, setCompanies] = useState<Company[]>([])
  const [loading, setLoading] = useState(true)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [companyToDelete, setCompanyToDelete] = useState<Company | null>(null)
  const [deleting, setDeleting] = useState(false)

  // Fetch companies from database
  const fetchCompanies = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/companies')
      if (!response.ok) {
        throw new Error('Failed to fetch companies')
      }
      const data = await response.json()
      setCompanies(data)
    } catch (error) {
      console.error('Error fetching companies:', error)
      toast({
        title: 'Hata',
        description: 'Şirketler yüklenirken bir hata oluştu.',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  // Load companies on mount
  useEffect(() => {
    fetchCompanies()
  }, [])

  // Calculate statistics from real data
  const totalCompanies = companies.length
  const activeCompanies = companies.filter(company => company.verified === true).length
  const totalProjects = companies.reduce((sum, company) => sum + company._count.projects, 0)

  // Companies created this month
  const thisMonth = new Date()
  thisMonth.setDate(1)
  const newThisMonth = companies.filter(company =>
    new Date(company.createdAt) >= thisMonth
  ).length

  // Handle company actions
  const handleViewCompany = (company: Company) => {
    toast({
      title: 'Görüntüle',
      description: `${company.name} şirketi detayları gösteriliyor...`
    })
  }

  const handleEditCompany = (company: Company) => {
    toast({
      title: 'Düzenle',
      description: `${company.name} şirketi düzenleniyor...`
    })
  }

  const handleDeleteCompany = (company: Company) => {
    setCompanyToDelete(company)
    setDeleteDialogOpen(true)
  }

  const confirmDeleteCompany = async () => {
    if (!companyToDelete) return

    try {
      setDeleting(true)

      // Optimistic UI update
      setCompanies(prevCompanies =>
        prevCompanies.filter(c => c.id !== companyToDelete.id)
      )

      const response = await fetch(`/api/companies/${companyToDelete.id}`, {
        method: 'DELETE'
      })

      if (!response.ok) {
        // Revert optimistic update on error
        await fetchCompanies()
        throw new Error('Failed to delete company')
      }

      toast({
        title: 'Başarılı',
        description: `${companyToDelete.name} şirketi silindi.`
      })

      setDeleteDialogOpen(false)
      setCompanyToDelete(null)
    } catch (error) {
      console.error('Error deleting company:', error)
      toast({
        title: 'Hata',
        description: 'Şirket silinirken bir hata oluştu.',
        variant: 'destructive'
      })
    } finally {
      setDeleting(false)
    }
  }

  return (
    <DashboardLayout title="Şirket Yönetimi">
      <div className="space-y-6">
        {/* Header Actions */}
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Şirket ara..."
                className="pl-10 w-64"
              />
            </div>
          </div>
          <Button className="flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Yeni Şirket Ekle
          </Button>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-2">
                <Building className="w-5 h-5 text-blue-600" />
                <div>
                  <p className="text-2xl font-bold">{totalCompanies}</p>
                  <p className="text-sm text-muted-foreground">Toplam Şirket</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-2">
                <Building className="w-5 h-5 text-green-600" />
                <div>
                  <p className="text-2xl font-bold">{activeCompanies}</p>
                  <p className="text-sm text-muted-foreground">Doğrulanmış Şirket</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-2">
                <Building className="w-5 h-5 text-orange-600" />
                <div>
                  <p className="text-2xl font-bold">{totalProjects}</p>
                  <p className="text-sm text-muted-foreground">Toplam Proje</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-2">
                <Building className="w-5 h-5 text-purple-600" />
                <div>
                  <p className="text-2xl font-bold">{newThisMonth}</p>
                  <p className="text-sm text-muted-foreground">Bu Ay Yeni</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Companies Table */}
        <Card>
          <CardHeader>
            <CardTitle>Şirket Listesi</CardTitle>
            <CardDescription>
              Kayıtlı şirketleri görüntüleyin ve yönetin
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
                <span className="ml-2 text-gray-500">Şirketler yükleniyor...</span>
              </div>
            ) : companies.length === 0 ? (
              <div className="text-center py-8">
                <Building className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 mb-2">Henüz şirket bulunmamaktadır.</p>
                <p className="text-sm text-gray-400">İlk şirketi eklemek için "Yeni Şirket Ekle" butonunu kullanın.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4">Şirket</th>
                      <th className="text-left py-3 px-4">Sektör</th>
                      <th className="text-left py-3 px-4">Konum</th>
                      <th className="text-left py-3 px-4">İletişim</th>
                      <th className="text-left py-3 px-4">Proje Sayısı</th>
                      <th className="text-left py-3 px-4">Durum</th>
                      <th className="text-left py-3 px-4">İşlemler</th>
                    </tr>
                  </thead>
                  <tbody>
                    {companies.map((company) => (
                      <tr key={company.id} className="border-b hover:bg-gray-50">
                        <td className="py-3 px-4">
                          <div>
                            <p className="font-medium">{company.name}</p>
                            <p className="text-sm text-muted-foreground">
                              Kayıt: {new Date(company.createdAt).toLocaleDateString('tr-TR')}
                            </p>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <Badge variant="secondary">
                            {company.type === 'INSTALLER' ? 'Kurulum' :
                             company.type === 'MANUFACTURER' ? 'Üretici' :
                             company.type === 'CONSULTANT' ? 'Danışman' :
                             company.type === 'BANK' ? 'Finans' : 'Diğer'}
                          </Badge>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-1 text-sm">
                            <MapPin className="w-3 h-3" />
                            {company.address || 'Belirtilmemiş'}
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="space-y-1">
                            {company.phone && (
                              <div className="flex items-center gap-1 text-sm">
                                <Phone className="w-3 h-3" />
                                {company.phone}
                              </div>
                            )}
                            {company.website && (
                              <div className="flex items-center gap-1 text-sm">
                                <Mail className="w-3 h-3" />
                                {company.website}
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <span className="font-medium">{company._count.projects} proje</span>
                        </td>
                        <td className="py-3 px-4">
                          <Badge
                            variant={company.verified ? 'default' : 'secondary'}
                            className={company.verified ? 'bg-green-100 text-green-800' : ''}
                          >
                            {company.verified ? 'Doğrulanmış' : 'Doğrulanmamış'}
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
                              <DropdownMenuItem onClick={() => handleViewCompany(company)}>
                                <Eye className="w-4 h-4 mr-2" />
                                Görüntüle
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleEditCompany(company)}>
                                <Edit className="w-4 h-4 mr-2" />
                                Düzenle
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleDeleteCompany(company)}
                                className="text-red-600 focus:text-red-600"
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

        {/* Recent Activity - Only show if there are companies */}
        {companies.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Son Aktiviteler</CardTitle>
              <CardDescription>
                Şirketlerle ilgili son aktiviteler
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {companies.slice(0, 3).map((company, index) => (
                  <div key={company.id} className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                    <Building className="w-5 h-5 text-blue-600" />
                    <div className="flex-1">
                      <p className="text-sm font-medium">{company.name} sisteme eklendi</p>
                      <p className="text-xs text-gray-500">
                        {new Date(company.createdAt).toLocaleDateString('tr-TR')}
                      </p>
                    </div>
                  </div>
                ))}

                {companies.length === 0 && (
                  <div className="text-center py-4 text-gray-500">
                    <Calendar className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p>Henüz aktivite bulunmamaktadır.</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Delete Confirmation Dialog */}
        <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Şirketi Sil</DialogTitle>
              <DialogDescription>
                Bu şirketi silmek istediğinizden emin misiniz? Bu işlem geri alınamaz ve şirketin tüm ilişkili verileri silinecektir.
              </DialogDescription>
            </DialogHeader>

            {companyToDelete && (
              <div className="py-4">
                <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                  <p className="font-medium">{companyToDelete.name}</p>
                  <p className="text-sm text-gray-600">Vergi No: {companyToDelete.taxNumber}</p>
                  <p className="text-sm text-gray-600">
                    Tip: {companyToDelete.type === 'INSTALLER' ? 'Kurulum' :
                          companyToDelete.type === 'MANUFACTURER' ? 'Üretici' :
                          companyToDelete.type === 'CONSULTANT' ? 'Danışman' :
                          companyToDelete.type === 'BANK' ? 'Finans' : 'Diğer'}
                  </p>
                  <p className="text-sm text-gray-600">Proje Sayısı: {companyToDelete._count.projects}</p>
                  <Badge
                    variant={companyToDelete.verified ? 'default' : 'secondary'}
                    className={companyToDelete.verified ? 'bg-green-100 text-green-800' : ''}
                  >
                    {companyToDelete.verified ? 'Doğrulanmış' : 'Doğrulanmamış'}
                  </Badge>
                </div>

                {companyToDelete._count.projects > 0 && (
                  <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <p className="text-sm text-yellow-800">
                      ⚠️ Bu şirketin {companyToDelete._count.projects} aktif projesi bulunmaktadır.
                      Şirketi sildiğinizde bu projeler de etkilenebilir.
                    </p>
                  </div>
                )}
              </div>
            )}

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setDeleteDialogOpen(false)
                  setCompanyToDelete(null)
                }}
                disabled={deleting}
              >
                İptal
              </Button>
              <Button
                variant="destructive"
                onClick={confirmDeleteCompany}
                disabled={deleting}
              >
                {deleting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Siliniyor...
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4 mr-2" />
                    Şirketi Sil
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  )
}