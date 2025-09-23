'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  FileText,
  User,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Calendar,
  Filter,
  Search,
  Mail,
  Phone,
  MapPin,
  Eye,
  Edit,
  Send,
  Download,
  BarChart3,
  TrendingUp,
  Users,
  Shield
} from 'lucide-react'
import { toast } from 'sonner'

interface KVKKApplication {
  id: string
  applicationNo: string
  requestType: string
  status: string
  applicantName: string
  applicantEmail: string
  applicantPhone: string
  applicantAddress: string
  applicantCity: string
  applicantDistrict: string
  applicantPostalCode?: string
  requestDetails: string
  previousApplication: boolean
  previousApplicationNo?: string
  submittedAt: string
  responseDeadline: string
  processedAt?: string
  responseDetails?: string
  assignedTo?: string
  ipAddress?: string
  userAgent?: string
}

const statusColors = {
  PENDING: 'bg-yellow-100 text-yellow-800',
  IN_PROGRESS: 'bg-blue-100 text-blue-800',
  COMPLETED: 'bg-green-100 text-green-800',
  REJECTED: 'bg-red-100 text-red-800',
  CANCELLED: 'bg-gray-100 text-gray-800'
}

const statusLabels = {
  PENDING: 'Beklemede',
  IN_PROGRESS: 'İşlemde',
  COMPLETED: 'Tamamlandı',
  REJECTED: 'Reddedildi',
  CANCELLED: 'İptal Edildi'
}

const requestTypeLabels = {
  INFO: 'Bilgi Edinme',
  ACCESS: 'Erişim',
  CORRECTION: 'Düzeltme',
  DELETION: 'Silme/Yok Etme',
  PORTABILITY: 'Veri Taşınabilirliği',
  OBJECTION: 'İtiraz',
  OTHER: 'Diğer'
}

export default function KVKKAdminPage() {
  const { data: session } = useSession()
  const [applications, setApplications] = useState<KVKKApplication[]>([])
  const [filteredApplications, setFilteredApplications] = useState<KVKKApplication[]>([])
  const [selectedApplication, setSelectedApplication] = useState<KVKKApplication | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [typeFilter, setTypeFilter] = useState('all')
  const [responseText, setResponseText] = useState('')
  const [isSubmittingResponse, setIsSubmittingResponse] = useState(false)

  const stats = {
    total: applications.length,
    pending: applications.filter(app => app.status === 'PENDING').length,
    inProgress: applications.filter(app => app.status === 'IN_PROGRESS').length,
    completed: applications.filter(app => app.status === 'COMPLETED').length,
    overdue: applications.filter(app =>
      new Date(app.responseDeadline) < new Date() &&
      !['COMPLETED', 'REJECTED', 'CANCELLED'].includes(app.status)
    ).length
  }

  useEffect(() => {
    fetchApplications()
  }, [])

  useEffect(() => {
    filterApplications()
  }, [applications, searchTerm, statusFilter, typeFilter])

  const fetchApplications = async () => {
    try {
      const response = await fetch('/api/admin/kvkk-applications')
      const data = await response.json()

      if (data.success) {
        setApplications(data.applications)
      } else {
        toast.error('Başvurular yüklenirken hata oluştu')
      }
    } catch (error) {
      console.error('Error fetching applications:', error)
      toast.error('Başvurular yüklenirken hata oluştu')
    } finally {
      setIsLoading(false)
    }
  }

  const filterApplications = () => {
    let filtered = applications

    if (searchTerm) {
      filtered = filtered.filter(app =>
        app.applicationNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        app.applicantName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        app.applicantEmail.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(app => app.status === statusFilter)
    }

    if (typeFilter !== 'all') {
      filtered = filtered.filter(app => app.requestType === typeFilter)
    }

    setFilteredApplications(filtered)
  }

  const updateApplicationStatus = async (applicationId: string, status: string, responseDetails?: string) => {
    try {
      const response = await fetch('/api/admin/kvkk-applications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          applicationId,
          status,
          responseDetails,
          assignedTo: session?.user?.email
        })
      })

      if (response.ok) {
        toast.success('Başvuru durumu güncellendi')
        fetchApplications()
        setSelectedApplication(null)
        setResponseText('')
      } else {
        toast.error('Güncelleme sırasında hata oluştu')
      }
    } catch (error) {
      console.error('Error updating application:', error)
      toast.error('Güncelleme sırasında hata oluştu')
    }
  }

  const handleResponse = async () => {
    if (!selectedApplication || !responseText.trim()) {
      toast.error('Lütfen yanıt metni girin')
      return
    }

    setIsSubmittingResponse(true)

    try {
      await updateApplicationStatus(selectedApplication.id, 'COMPLETED', responseText)
    } finally {
      setIsSubmittingResponse(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('tr-TR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getDaysRemaining = (deadline: string) => {
    const days = Math.ceil((new Date(deadline).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
    return days
  }

  if (isLoading) {
    return (
      <DashboardLayout 
        title="KVKK Yönetimi"
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'KVKK Yönetimi' }
        ]}
      >
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout 
      title="KVKK Yönetimi"
      breadcrumbs={[
        { label: 'Dashboard', href: '/dashboard' },
        { label: 'KVKK Yönetimi' }
      ]}
    >
      <div className="space-y-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-purple-800 text-white rounded-lg p-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">KVKK Başvuru Yönetimi</h1>
            <p className="text-purple-100">
              Kişisel veri koruma başvurularını yönetin ve takip edin
            </p>
          </div>
          <Shield className="h-16 w-16 text-purple-200" />
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Users className="h-8 w-8 text-blue-600" />
              <div>
                <p className="text-2xl font-bold">{stats.total}</p>
                <p className="text-sm text-gray-600">Toplam</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Clock className="h-8 w-8 text-yellow-600" />
              <div>
                <p className="text-2xl font-bold">{stats.pending}</p>
                <p className="text-sm text-gray-600">Beklemede</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-8 w-8 text-blue-600" />
              <div>
                <p className="text-2xl font-bold">{stats.inProgress}</p>
                <p className="text-sm text-gray-600">İşlemde</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-8 w-8 text-green-600" />
              <div>
                <p className="text-2xl font-bold">{stats.completed}</p>
                <p className="text-sm text-gray-600">Tamamlandı</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <AlertCircle className="h-8 w-8 text-red-600" />
              <div>
                <p className="text-2xl font-bold">{stats.overdue}</p>
                <p className="text-sm text-gray-600">Süresi Geçen</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filtreler</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label>Arama</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Başvuru no, ad, e-posta..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Durum</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tümü</SelectItem>
                  <SelectItem value="PENDING">Beklemede</SelectItem>
                  <SelectItem value="IN_PROGRESS">İşlemde</SelectItem>
                  <SelectItem value="COMPLETED">Tamamlandı</SelectItem>
                  <SelectItem value="REJECTED">Reddedildi</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Başvuru Türü</Label>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tümü</SelectItem>
                  <SelectItem value="INFO">Bilgi Edinme</SelectItem>
                  <SelectItem value="ACCESS">Erişim</SelectItem>
                  <SelectItem value="CORRECTION">Düzeltme</SelectItem>
                  <SelectItem value="DELETION">Silme</SelectItem>
                  <SelectItem value="PORTABILITY">Taşınabilirlik</SelectItem>
                  <SelectItem value="OBJECTION">İtiraz</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>&nbsp;</Label>
              <Button
                onClick={() => {
                  setSearchTerm('')
                  setStatusFilter('all')
                  setTypeFilter('all')
                }}
                variant="outline"
                className="w-full"
              >
                Temizle
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Applications Table */}
      <Card>
        <CardHeader>
          <CardTitle>Başvurular ({filteredApplications.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Başvuru No</TableHead>
                  <TableHead>Başvuran</TableHead>
                  <TableHead>Tür</TableHead>
                  <TableHead>Durum</TableHead>
                  <TableHead>Tarih</TableHead>
                  <TableHead>Kalan Süre</TableHead>
                  <TableHead>İşlemler</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredApplications.map((application) => {
                  const daysRemaining = getDaysRemaining(application.responseDeadline)
                  return (
                    <TableRow key={application.id}>
                      <TableCell className="font-mono">
                        {application.applicationNo}
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{application.applicantName}</p>
                          <p className="text-sm text-gray-600">{application.applicantEmail}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        {requestTypeLabels[application.requestType as keyof typeof requestTypeLabels]}
                      </TableCell>
                      <TableCell>
                        <Badge className={statusColors[application.status as keyof typeof statusColors]}>
                          {statusLabels[application.status as keyof typeof statusLabels]}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {formatDate(application.submittedAt)}
                      </TableCell>
                      <TableCell>
                        <span className={`${
                          daysRemaining < 0 ? 'text-red-600 font-medium' :
                          daysRemaining < 7 ? 'text-yellow-600' : 'text-green-600'
                        }`}>
                          {daysRemaining < 0 ? `${Math.abs(daysRemaining)} gün geçti` :
                           daysRemaining === 0 ? 'Bugün' : `${daysRemaining} gün`}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => setSelectedApplication(application)}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                              <DialogHeader>
                                <DialogTitle>
                                  Başvuru Detayı - {selectedApplication?.applicationNo}
                                </DialogTitle>
                                <DialogDescription>
                                  KVKK başvuru detayları ve yanıt işlemleri
                                </DialogDescription>
                              </DialogHeader>

                              {selectedApplication && (
                                <div className="space-y-6">
                                  <div className="grid md:grid-cols-2 gap-6">
                                    <Card>
                                      <CardHeader>
                                        <CardTitle className="text-lg">Başvuran Bilgileri</CardTitle>
                                      </CardHeader>
                                      <CardContent className="space-y-3">
                                        <div className="flex items-center gap-2">
                                          <User className="h-4 w-4 text-gray-500" />
                                          <span className="font-medium">{selectedApplication.applicantName}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                          <Mail className="h-4 w-4 text-gray-500" />
                                          <span>{selectedApplication.applicantEmail}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                          <Phone className="h-4 w-4 text-gray-500" />
                                          <span>{selectedApplication.applicantPhone}</span>
                                        </div>
                                        <div className="flex items-start gap-2">
                                          <MapPin className="h-4 w-4 text-gray-500 mt-1" />
                                          <div>
                                            <p>{selectedApplication.applicantAddress}</p>
                                            <p className="text-sm text-gray-600">
                                              {selectedApplication.applicantDistrict}, {selectedApplication.applicantCity}
                                              {selectedApplication.applicantPostalCode && ` ${selectedApplication.applicantPostalCode}`}
                                            </p>
                                          </div>
                                        </div>
                                      </CardContent>
                                    </Card>

                                    <Card>
                                      <CardHeader>
                                        <CardTitle className="text-lg">Başvuru Bilgileri</CardTitle>
                                      </CardHeader>
                                      <CardContent className="space-y-3">
                                        <div>
                                          <p className="text-sm text-gray-600">Başvuru Türü</p>
                                          <p className="font-medium">
                                            {requestTypeLabels[selectedApplication.requestType as keyof typeof requestTypeLabels]}
                                          </p>
                                        </div>
                                        <div>
                                          <p className="text-sm text-gray-600">Durum</p>
                                          <Badge className={statusColors[selectedApplication.status as keyof typeof statusColors]}>
                                            {statusLabels[selectedApplication.status as keyof typeof statusLabels]}
                                          </Badge>
                                        </div>
                                        <div>
                                          <p className="text-sm text-gray-600">Gönderim Tarihi</p>
                                          <p className="font-medium">{formatDate(selectedApplication.submittedAt)}</p>
                                        </div>
                                        <div>
                                          <p className="text-sm text-gray-600">Son Yanıt Tarihi</p>
                                          <p className="font-medium">{formatDate(selectedApplication.responseDeadline)}</p>
                                        </div>
                                      </CardContent>
                                    </Card>
                                  </div>

                                  <Card>
                                    <CardHeader>
                                      <CardTitle className="text-lg">Başvuru Detayları</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                      <p className="whitespace-pre-wrap">{selectedApplication.requestDetails}</p>
                                    </CardContent>
                                  </Card>

                                  {selectedApplication.status === 'PENDING' && (
                                    <Card>
                                      <CardHeader>
                                        <CardTitle className="text-lg">Yanıt Ver</CardTitle>
                                      </CardHeader>
                                      <CardContent className="space-y-4">
                                        <div className="space-y-2">
                                          <Label>Yanıt Metni</Label>
                                          <Textarea
                                            value={responseText}
                                            onChange={(e) => setResponseText(e.target.value)}
                                            rows={6}
                                            placeholder="Başvuru yanıtınızı buraya yazın..."
                                          />
                                        </div>
                                        <div className="flex gap-2">
                                          <Button
                                            onClick={handleResponse}
                                            disabled={isSubmittingResponse || !responseText.trim()}
                                          >
                                            {isSubmittingResponse ? (
                                              <>
                                                <Clock className="mr-2 h-4 w-4 animate-spin" />
                                                Gönderiliyor...
                                              </>
                                            ) : (
                                              <>
                                                <Send className="mr-2 h-4 w-4" />
                                                Yanıt Gönder
                                              </>
                                            )}
                                          </Button>
                                          <Button
                                            variant="outline"
                                            onClick={() => updateApplicationStatus(selectedApplication.id, 'IN_PROGRESS')}
                                          >
                                            İşleme Al
                                          </Button>
                                          <Button
                                            variant="destructive"
                                            onClick={() => updateApplicationStatus(selectedApplication.id, 'REJECTED', 'Başvuru reddedildi')}
                                          >
                                            Reddet
                                          </Button>
                                        </div>
                                      </CardContent>
                                    </Card>
                                  )}

                                  {selectedApplication.responseDetails && (
                                    <Card>
                                      <CardHeader>
                                        <CardTitle className="text-lg">Verilen Yanıt</CardTitle>
                                      </CardHeader>
                                      <CardContent>
                                        <p className="whitespace-pre-wrap">{selectedApplication.responseDetails}</p>
                                        {selectedApplication.processedAt && (
                                          <p className="text-sm text-gray-600 mt-4">
                                            Yanıtlandı: {formatDate(selectedApplication.processedAt)}
                                          </p>
                                        )}
                                      </CardContent>
                                    </Card>
                                  )}
                                </div>
                              )}
                            </DialogContent>
                          </Dialog>

                          {application.status === 'PENDING' && (
                            <Button
                              size="sm"
                              onClick={() => updateApplicationStatus(application.id, 'IN_PROGRESS')}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </div>

          {filteredApplications.length === 0 && (
            <div className="text-center py-12">
              <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <p className="text-gray-600">Henüz başvuru bulunmuyor</p>
            </div>
          )}
        </CardContent>
      </Card>
      </div>
    </DashboardLayout>
  )
}