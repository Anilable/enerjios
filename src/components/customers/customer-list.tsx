'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  Search,
  Filter,
  Eye,
  Edit,
  Phone,
  Mail,
  Calendar,
  MapPin,
  Tag,
  TrendingUp,
  FileText,
  User,
  Building,
  Camera,
  FolderPlus,
  Download,
  RefreshCw,
  Trash2,
  AlertTriangle
} from 'lucide-react'
import type { CustomerData } from '@/app/dashboard/customers/page'
import { PhotoRequestButton } from '@/components/admin/photo-request-button'
import { ProjectRequestButton } from '@/components/admin/project-request-button'
import { useToast } from '@/hooks/use-toast'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'

interface CustomerListProps {
  customers: CustomerData[]
  onViewCustomer: (customer: CustomerData) => void
  onEditCustomer: (customer: CustomerData) => void
  getStatusColor: (status: CustomerData['status']) => string
  getStatusLabel: (status: CustomerData['status']) => string
  getPriorityColor: (priority: CustomerData['priority']) => string
}

export function CustomerList({
  customers,
  onViewCustomer,
  onEditCustomer,
  getStatusColor,
  getStatusLabel,
  getPriorityColor
}: CustomerListProps) {
  const router = useRouter()
  const { data: session } = useSession()
  const { toast } = useToast()
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [priorityFilter, setPriorityFilter] = useState<string>('all')
  const [typeFilter, setTypeFilter] = useState<string>('all')
  const [sortBy, setSortBy] = useState<string>('lastContact')
  const [isExporting, setIsExporting] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [deleteCustomerId, setDeleteCustomerId] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [showForceDeleteDialog, setShowForceDeleteDialog] = useState(false)
  const [forceDeleteData, setForceDeleteData] = useState<any>(null)

  // Check if user is admin - this will be verified on the backend
  const isAdmin = true // For now, show the button to all users, backend will handle authorization

  const filteredCustomers = customers.filter(customer => {
    const matchesSearch = searchQuery === '' || 
      customer.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      customer.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      customer.phone.includes(searchQuery) ||
      customer.city.toLowerCase().includes(searchQuery.toLowerCase())
    
    const matchesStatus = statusFilter === 'all' || customer.status === statusFilter
    const matchesPriority = priorityFilter === 'all' || customer.priority === priorityFilter
    const matchesType = typeFilter === 'all' || customer.customerType === typeFilter
    
    return matchesSearch && matchesStatus && matchesPriority && matchesType
  }).sort((a, b) => {
    switch (sortBy) {
      case 'lastContact':
        return new Date(b.lastContact).getTime() - new Date(a.lastContact).getTime()
      case 'createdAt':
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      case 'name':
        return a.fullName.localeCompare(b.fullName)
      case 'priority':
        const priorityOrder = { 'URGENT': 4, 'HIGH': 3, 'MEDIUM': 2, 'LOW': 1 }
        return priorityOrder[b.priority] - priorityOrder[a.priority]
      default:
        return 0
    }
  })

  const formatDate = (date: Date | string | null | undefined) => {
    try {
      if (!date) {
        return 'Tarih belirtilmemiş'
      }

      const dateObj = typeof date === 'string' ? new Date(date) : date

      // Check if date is valid
      if (!dateObj || isNaN(dateObj.getTime()) || !isFinite(dateObj.getTime())) {
        return 'Tarih belirtilmemiş'
      }

      return new Intl.DateTimeFormat('tr-TR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      }).format(dateObj)
    } catch (error) {
      console.warn('Date formatting error:', error)
      return 'Tarih belirtilmemiş'
    }
  }

  const getCustomerTypeLabel = (type: CustomerData['customerType']) => {
    switch (type) {
      case 'INDIVIDUAL': return 'Bireysel'
      case 'CORPORATE': return 'Kurumsal'
      case 'FARMER': return 'Çiftçi'
      default: return 'Bilinmiyor'
    }
  }

  const getCustomerTypeIcon = (type: CustomerData['customerType']) => {
    switch (type) {
      case 'INDIVIDUAL': return User
      case 'CORPORATE': return Building
      case 'FARMER': return Building // Could use a tractor icon
      default: return User
    }
  }

  const getDaysSinceContact = (date: Date | string | null | undefined) => {
    try {
      if (!date) {
        return 0
      }

      const contactDate = typeof date === 'string' ? new Date(date) : date

      if (!contactDate || isNaN(contactDate.getTime()) || !isFinite(contactDate.getTime())) {
        return 0
      }

      const today = new Date()
      const diffTime = Math.abs(today.getTime() - contactDate.getTime())
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
      return diffDays
    } catch (error) {
      console.warn('Date calculation error:', error)
      return 0
    }
  }

  const handleCreateQuote = async (customer: CustomerData) => {
    try {
      // First, check if customer has existing project requests
      const response = await fetch(`/api/project-requests?customerId=${customer.id}`)

      if (response.ok) {
        const projectRequests = await response.json()

        if (projectRequests.length > 0) {
          // Customer has existing project requests, route to quote creation with most recent project
          const mostRecentProject = projectRequests[0] // API returns sorted by createdAt desc
          router.push(`/dashboard/quotes/create/${mostRecentProject.id}`)
        } else {
          // No existing project requests, route to project request creation first
          router.push(`/dashboard/project-requests/new?customerId=${customer.id}`)
        }
      } else {
        // API error, fallback to project request creation
        console.warn('Failed to fetch project requests, falling back to project request creation')
        router.push(`/dashboard/project-requests/new?customerId=${customer.id}`)
      }
    } catch (error) {
      console.error('Error checking customer projects:', error)
      // Error occurred, fallback to project request creation
      router.push(`/dashboard/project-requests/new?customerId=${customer.id}`)
    }
  }

  const handleExportCustomers = async () => {
    setIsExporting(true)
    try {
      // Export filtered customers to CSV
      const headers = ['Ad Soyad', 'Email', 'Telefon', 'Şehir', 'Durum', 'Öncelik', 'Bütçe', 'Son İletişim']
      const csvData = [
        headers.join(','),
        ...filteredCustomers.map(customer => [
          `"${customer.fullName}"`,
          `"${customer.email}"`,
          `"${customer.phone}"`,
          `"${customer.city}"`,
          `"${getStatusLabel(customer.status)}"`,
          `"${customer.priority}"`,
          `"₺${customer.leadInfo.estimatedBudget.toLocaleString()}"`,
          `"${formatDate(customer.lastContact)}"`
        ].join(','))
      ].join('\n')

      const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' })
      const link = document.createElement('a')
      const url = URL.createObjectURL(blob)
      link.setAttribute('href', url)
      link.setAttribute('download', `musteri-listesi-${new Date().toLocaleDateString('tr-TR')}.csv`)
      link.style.visibility = 'hidden'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    } catch (error) {
      console.error('Export failed:', error)
    } finally {
      setIsExporting(false)
    }
  }

  const handleRefreshData = async () => {
    setIsRefreshing(true)
    try {
      // Refresh customer data - you may want to add a refresh callback prop
      await new Promise(resolve => setTimeout(resolve, 1000)) // Simulate API call
      window.location.reload() // Simple refresh for now
    } catch (error) {
      console.error('Refresh failed:', error)
    } finally {
      setIsRefreshing(false)
    }
  }

  const handleDeleteCustomer = async (forceDelete = false) => {
    if (!deleteCustomerId) return

    console.log('🔥 Frontend: Starting delete for customer:', deleteCustomerId, 'Force:', forceDelete)
    setIsDeleting(true)
    try {
      const url = forceDelete
        ? `/api/customers/${deleteCustomerId}?force=true`
        : `/api/customers/${deleteCustomerId}`

      const response = await fetch(url, {
        method: 'DELETE',
      })

      console.log('🔥 Frontend: API response status:', response.status)
      const data = await response.json()
      console.log('🔥 Frontend: API response data:', data)

      if (response.ok) {
        toast({
          title: 'Müşteri Silindi',
          description: 'Müşteri başarıyla silindi.',
        })
        // Refresh the page to update the list
        window.location.reload()
      } else if (response.status === 400 && data.canForceDelete && !forceDelete) {
        // Show force delete confirmation
        setIsDeleting(false)
        setDeleteCustomerId(null)
        setForceDeleteData(data)
        setShowForceDeleteDialog(true)
        return
      } else {
        // Check if there's associated data
        if (data.details) {
          let errorMessage = 'Bu müşteri silinemez çünkü ilişkili veriler var:\n'
          if (data.details.quotes > 0) {
            errorMessage += `\n• ${data.details.quotes} teklif`
          }
          if (data.details.projectRequests > 0) {
            errorMessage += `\n• ${data.details.projectRequests} proje talebi`
          }
          if (data.details.photoRequests > 0) {
            errorMessage += `\n• ${data.details.photoRequests} fotoğraf talebi`
          }
          toast({
            title: 'Silme Başarısız',
            description: errorMessage,
            variant: 'destructive',
          })
        } else {
          toast({
            title: 'Silme Başarısız',
            description: data.error || 'Müşteri silinirken bir hata oluştu.',
            variant: 'destructive',
          })
        }
      }
    } catch (error) {
      console.error('Delete failed:', error)
      toast({
        title: 'Hata',
        description: 'Bağlantı hatası. Lütfen tekrar deneyin.',
        variant: 'destructive',
      })
    } finally {
      setIsDeleting(false)
      setDeleteCustomerId(null)
    }
  }

  const handleForceDeleteCustomer = async () => {
    if (!forceDeleteData) return

    console.log('🔥 Frontend: Starting FORCE delete for customer:', deleteCustomerId)

    // Set the delete customer ID for the force delete
    const customerIdToDelete = deleteCustomerId || forceDeleteData.customerId
    setDeleteCustomerId(customerIdToDelete)

    await handleDeleteCustomer(true)
    setShowForceDeleteDialog(false)
    setForceDeleteData(null)
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Müşteri adı, email, telefon veya şehir ara..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <div className="flex gap-2 flex-wrap">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-36">
                  <SelectValue placeholder="Durum" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tüm Durumlar</SelectItem>
                  <SelectItem value="LEAD">Potansiyel</SelectItem>
                  <SelectItem value="QUALIFIED">Nitelikli</SelectItem>
                  <SelectItem value="PROPOSAL_SENT">Teklif Gönderildi</SelectItem>
                  <SelectItem value="NEGOTIATION">Müzakere</SelectItem>
                  <SelectItem value="CUSTOMER">Müşteri</SelectItem>
                  <SelectItem value="LOST">Kaybedildi</SelectItem>
                </SelectContent>
              </Select>

              <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Öncelik" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tüm Öncelikler</SelectItem>
                  <SelectItem value="URGENT">Acil</SelectItem>
                  <SelectItem value="HIGH">Yüksek</SelectItem>
                  <SelectItem value="MEDIUM">Orta</SelectItem>
                  <SelectItem value="LOW">Düşük</SelectItem>
                </SelectContent>
              </Select>

              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Tip" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tüm Tipler</SelectItem>
                  <SelectItem value="INDIVIDUAL">Bireysel</SelectItem>
                  <SelectItem value="CORPORATE">Kurumsal</SelectItem>
                  <SelectItem value="FARMER">Çiftçi</SelectItem>
                </SelectContent>
              </Select>

              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-36">
                  <SelectValue placeholder="Sırala" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="lastContact">Son İletişim</SelectItem>
                  <SelectItem value="createdAt">Kayıt Tarihi</SelectItem>
                  <SelectItem value="name">İsim</SelectItem>
                  <SelectItem value="priority">Öncelik</SelectItem>
                </SelectContent>
              </Select>

              {/* Action Buttons */}
              <div className="flex gap-2 ml-auto">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleRefreshData}
                  disabled={isRefreshing}
                >
                  <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
                  {isRefreshing ? 'Yenileniyor...' : 'Yenile'}
                </Button>

                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleExportCustomers}
                  disabled={isExporting}
                >
                  <Download className="w-4 h-4 mr-2" />
                  {isExporting ? 'Dışa Aktarılıyor...' : 'Dışa Aktar'}
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Results Summary */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-600">
          {filteredCustomers.length} müşteri gösteriliyor
        </p>
        <div className="text-sm text-gray-600">
          <span>Pipeline Değeri: </span>
          <span className="font-medium text-gray-900">
            ₺{filteredCustomers
              .filter(c => c.status !== 'LOST' && c.status !== 'CUSTOMER')
              .reduce((sum, c) => sum + (c.leadInfo.estimatedBudget || 0), 0)
              .toLocaleString()
            }
          </span>
        </div>
      </div>

      {/* Customer Cards */}
      <div className="grid gap-4">
        {filteredCustomers.map((customer) => {
          const TypeIcon = getCustomerTypeIcon(customer.customerType)
          const daysSinceContact = getDaysSinceContact(customer.lastContact)
          
          return (
            <Card key={customer.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1 space-y-3">
                    {/* Header */}
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-2">
                        <TypeIcon className="w-5 h-5 text-gray-400" />
                        <div>
                          <h3 className="font-semibold text-gray-900">
                            {customer.fullName}
                            {customer.companyName && (
                              <span className="text-sm text-gray-500 font-normal ml-2">
                                ({customer.companyName})
                              </span>
                            )}
                          </h3>
                          <p className="text-sm text-gray-600">{getCustomerTypeLabel(customer.customerType)}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Badge className={`${getStatusColor(customer.status)} border-0`}>
                          {getStatusLabel(customer.status)}
                        </Badge>
                        
                        <Badge className={`${getPriorityColor(customer.priority)} border-0 text-xs`}>
                          {customer.priority}
                        </Badge>
                      </div>
                    </div>

                    {/* Contact & Location Info */}
                    <div className="grid md:grid-cols-4 gap-4 text-sm">
                      <div className="flex items-center space-x-2">
                        <Mail className="w-4 h-4 text-gray-400" />
                        <div>
                          <div className="font-medium">{customer.email}</div>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Phone className="w-4 h-4 text-gray-400" />
                        <div>
                          <div className="font-medium">{customer.phone}</div>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <MapPin className="w-4 h-4 text-gray-400" />
                        <div>
                          <div className="font-medium">{customer.city}, {customer.district}</div>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        <div>
                          <div className="font-medium">
                            {daysSinceContact === 0 ? 'Bugün' : 
                             daysSinceContact === 1 ? 'Dün' :
                             `${daysSinceContact} gün önce`}
                          </div>
                          <div className="text-gray-600">Son İletişim</div>
                        </div>
                      </div>
                    </div>

                    {/* Lead Information */}
                    <div className="bg-gray-50 rounded-lg p-3">
                      <div className="grid md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <span className="text-gray-600">Bütçe:</span>
                          <span className="ml-2 font-medium">₺{customer.leadInfo.estimatedBudget.toLocaleString()}</span>
                        </div>
                        <div>
                          <span className="text-gray-600">Sistem:</span>
                          <span className="ml-2 font-medium">{customer.leadInfo.projectSize}</span>
                        </div>
                        <div>
                          <span className="text-gray-600">Fatura:</span>
                          <span className="ml-2 font-medium">₺{customer.leadInfo.electricityBill}</span>
                        </div>
                        <div>
                          <span className="text-gray-600">Süre:</span>
                          <span className="ml-2 font-medium">{customer.leadInfo.timeline}</span>
                        </div>
                      </div>
                    </div>

                    {/* Tags */}
                    {customer.tags.length > 0 && (
                      <div className="flex items-center space-x-2">
                        <Tag className="w-3 h-3 text-gray-400" />
                        <div className="flex space-x-1">
                          {customer.tags.map((tag, index) => (
                            <Badge key={index} variant="secondary" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Recent Activity */}
                    <div className="grid md:grid-cols-3 gap-4 pt-2 border-t border-gray-100">
                      <div className="text-sm">
                        <span className="text-gray-600">Teklifler:</span>
                        <span className="ml-2 font-medium">
                          {customer.quotes.length}
                          {customer.quotes.length > 0 && (
                            <span className="text-green-600"> (₺{customer.quotes.reduce((sum, q) => sum + q.total, 0).toLocaleString()})</span>
                          )}
                        </span>
                      </div>
                      <div className="text-sm">
                        <span className="text-gray-600">Projeler:</span>
                        <span className="ml-2 font-medium">{customer.projects.length}</span>
                      </div>
                      <div className="text-sm">
                        <span className="text-gray-600">Sorumlu:</span>
                        <span className="ml-2 font-medium">{customer.assignedTo}</span>
                      </div>
                    </div>

                    {/* Notes Preview */}
                    {customer.notes && (
                      <div className="bg-blue-50 rounded-lg p-2">
                        <p className="text-sm text-blue-800 line-clamp-2">{customer.notes}</p>
                      </div>
                    )}

                    {/* Warning for Stale Contacts */}
                    {daysSinceContact > 7 && customer.status !== 'CUSTOMER' && customer.status !== 'LOST' && (
                      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-2 flex items-center space-x-2">
                        <Calendar className="w-4 h-4 text-yellow-600" />
                        <span className="text-sm text-yellow-800">
                          {daysSinceContact} gün önce iletişime geçildi - Takip gerekli
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col space-y-2 ml-6">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onViewCustomer(customer)}
                    >
                      <Eye className="w-3 h-3 mr-1" />
                      Detay
                    </Button>

                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onEditCustomer(customer)}
                    >
                      <Edit className="w-3 h-3 mr-1" />
                      Düzenle
                    </Button>

                    {isAdmin && (
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => setDeleteCustomerId(customer.id)}
                      >
                        <Trash2 className="w-3 h-3 mr-1" />
                        Sil
                      </Button>
                    )}
                    
                    <Button
                      size="sm"
                      variant="default"
                      onClick={() => window.open(`tel:${customer.phone}`, '_self')}
                    >
                      <Phone className="w-3 h-3 mr-1" />
                      Ara
                    </Button>

                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => window.open(`mailto:${customer.email}?subject=Trakya Solar - ${customer.fullName}`, '_blank')}
                    >
                      <Mail className="w-3 h-3 mr-1" />
                      Mail
                    </Button>

                    <Button size="sm" variant="outline" onClick={() => handleCreateQuote(customer)}>
                      <FileText className="w-3 h-3 mr-1" />
                      Teklif
                    </Button>

                    <PhotoRequestButton
                      customerId={customer.id}
                      customerName={customer.fullName}
                      customerEmail={customer.email}
                      customerPhone={customer.phone}
                      trigger={
                        <Button size="sm" variant="outline" className="w-full">
                          <Camera className="w-3 h-3 mr-1" />
                          Fotoğraf İste
                        </Button>
                      }
                    />

                    <ProjectRequestButton
                      customerId={customer.id}
                      customerName={customer.fullName}
                      customerEmail={customer.email}
                      customerPhone={customer.phone}
                      customerAddress={customer.address}
                      customerCity={customer.city}
                      trigger={
                        <Button size="sm" variant="outline" className="w-full">
                          <FolderPlus className="w-3 h-3 mr-1" />
                          Proje Talebi
                        </Button>
                      }
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Empty State */}
      {filteredCustomers.length === 0 && (
        <div className="text-center py-12">
          <Search className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Müşteri bulunamadı</h3>
          <p className="text-gray-600 mb-4">
            {searchQuery || statusFilter !== 'all' || priorityFilter !== 'all' || typeFilter !== 'all'
              ? 'Arama kriterlerinizi değiştirmeyi deneyin' 
              : 'Henüz hiç müşteri kaydı yok'
            }
          </p>
          {!searchQuery && statusFilter === 'all' && priorityFilter === 'all' && typeFilter === 'all' && (
            <Button onClick={() => {}}>
              Yeni Müşteri Ekle
            </Button>
          )}
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteCustomerId} onOpenChange={() => setDeleteCustomerId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-600" />
              Müşteri Silme Onayı
            </AlertDialogTitle>
            <AlertDialogDescription>
              Bu müşteriyi silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.
              {deleteCustomerId && (
                <div className="mt-2 p-3 bg-gray-50 rounded-md">
                  <strong>
                    {customers.find(c => c.id === deleteCustomerId)?.fullName}
                  </strong>
                </div>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>
              İptal
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteCustomer}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {isDeleting ? 'Siliniyor...' : 'Müşteriyi Sil'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Force Delete Confirmation Dialog */}
      <AlertDialog open={showForceDeleteDialog} onOpenChange={setShowForceDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-600" />
              Zorla Silme Onayı
            </AlertDialogTitle>
            <AlertDialogDescription>
              <div className="space-y-3">
                <p className="text-red-700 font-medium">
                  ⚠️ Bu müşterinin aşağıdaki bağlı verileri bulunmaktadır:
                </p>

                {forceDeleteData && (
                  <div className="bg-red-50 border border-red-200 rounded-md p-3 space-y-2">
                    {forceDeleteData.details.quotes > 0 && (
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-red-600" />
                        <span>{forceDeleteData.details.quotes} adet teklif</span>
                      </div>
                    )}
                    {forceDeleteData.details.projectRequests > 0 && (
                      <div className="flex items-center gap-2">
                        <FolderPlus className="w-4 h-4 text-red-600" />
                        <span>{forceDeleteData.details.projectRequests} adet proje talebi</span>
                      </div>
                    )}
                    {forceDeleteData.details.photoRequests > 0 && (
                      <div className="flex items-center gap-2">
                        <Camera className="w-4 h-4 text-red-600" />
                        <span>{forceDeleteData.details.photoRequests} adet fotoğraf talebi</span>
                      </div>
                    )}
                  </div>
                )}

                <p className="text-gray-700">
                  Bu müşteriyi silmek, yukarıdaki tüm bağlı verileri de kalıcı olarak silecektir.
                  <strong className="text-red-700"> Bu işlem geri alınamaz.</strong>
                </p>

                <p className="text-red-700 font-medium">
                  Yine de silmek istiyor musunuz?
                </p>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>
              İptal
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleForceDeleteCustomer}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {isDeleting ? 'Siliniyor...' : 'Zorla Sil'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}