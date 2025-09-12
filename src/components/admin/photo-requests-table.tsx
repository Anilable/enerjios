'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { useToast } from '@/hooks/use-toast'
import {
  Eye,
  Calendar,
  User,
  Camera,
  Clock,
  Search,
  Filter,
  ExternalLink,
  CheckCircle,
  XCircle,
  AlertCircle,
  Loader2
} from 'lucide-react'
import { format } from 'date-fns'
import { tr } from 'date-fns/locale'
import Link from 'next/link'

interface PhotoRequest {
  id: string
  token: string
  status: 'PENDING' | 'UPLOADED' | 'REVIEWED' | 'EXPIRED'
  customerName: string
  customerEmail?: string | null
  engineerName: string
  engineerTitle: string
  createdAt: string
  expiresAt: string
  uploadedAt?: string | null
  reviewedAt?: string | null
  customer?: {
    firstName: string
    lastName: string
    companyName?: string | null
    user: {
      name: string
      email: string
    }
  } | null
  project?: {
    name: string
    type: string
    status: string
  } | null
  requestedBy: {
    name: string
    email: string
  }
  photos: {
    id: string
    filename: string
    thumbnailUrl?: string | null
    approved?: boolean | null
    createdAt: string
  }[]
  _count: {
    photos: number
  }
}

interface PhotoRequestsResponse {
  photoRequests: PhotoRequest[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

export function PhotoRequestsTable() {
  const [photoRequests, setPhotoRequests] = useState<PhotoRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [page, setPage] = useState(1)
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0
  })
  const { toast } = useToast()

  const fetchPhotoRequests = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '10'
      })
      
      if (statusFilter && statusFilter !== 'all') {
        params.append('status', statusFilter)
      }

      const response = await fetch(`/api/admin/photo-request?${params}`)
      if (!response.ok) {
        throw new Error('Failed to fetch photo requests')
      }

      const data: PhotoRequestsResponse = await response.json()
      setPhotoRequests(data.photoRequests)
      setPagination(data.pagination)

    } catch (error) {
      console.error('Error fetching photo requests:', error)
      toast({
        title: 'Hata',
        description: 'Fotoğraf talepleri yüklenirken hata oluştu',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPhotoRequests()
  }, [statusFilter, page])

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDING':
        return <Badge variant="outline" className="text-yellow-600 border-yellow-600"><Clock className="w-3 h-3 mr-1" />Bekliyor</Badge>
      case 'UPLOADED':
        return <Badge variant="secondary" className="text-blue-600"><Camera className="w-3 h-3 mr-1" />Yüklendi</Badge>
      case 'REVIEWED':
        return <Badge className="text-green-600 bg-green-100 border-green-600"><CheckCircle className="w-3 h-3 mr-1" />İncelendi</Badge>
      case 'EXPIRED':
        return <Badge variant="destructive"><XCircle className="w-3 h-3 mr-1" />Süresi Dolmuş</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const getPhotoStatusSummary = (photos: PhotoRequest['photos']) => {
    const approved = photos.filter(p => p.approved === true).length
    const rejected = photos.filter(p => p.approved === false).length
    const pending = photos.filter(p => p.approved === null).length

    return (
      <div className="flex gap-1 text-xs">
        {approved > 0 && <Badge className="bg-green-100 text-green-800">{approved} ✓</Badge>}
        {rejected > 0 && <Badge variant="destructive">{rejected} ✗</Badge>}
        {pending > 0 && <Badge variant="outline">{pending} ⏳</Badge>}
      </div>
    )
  }

  const filteredRequests = photoRequests.filter(request =>
    request.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    request.engineerName.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <CardTitle className="flex items-center gap-2">
            <User className="w-5 h-5" />
            Fotoğraf Talepleri ({pagination.total})
          </CardTitle>
          
          <div className="flex flex-col gap-2 md:flex-row md:items-center">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Müşteri veya mühendis ara..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 w-64"
              />
            </div>
            
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-48">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Durum filtrele" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tüm Durumlar</SelectItem>
                <SelectItem value="PENDING">Bekliyor</SelectItem>
                <SelectItem value="UPLOADED">Yüklendi</SelectItem>
                <SelectItem value="REVIEWED">İncelendi</SelectItem>
                <SelectItem value="EXPIRED">Süresi Dolmuş</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin mr-2" />
            Yükleniyor...
          </div>
        ) : filteredRequests.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <AlertCircle className="w-12 h-12 mx-auto mb-4 text-gray-400" />
            Fotoğraf talebi bulunamadı
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Müşteri</TableHead>
                <TableHead>Mühendis</TableHead>
                <TableHead>Durum</TableHead>
                <TableHead>Fotoğraflar</TableHead>
                <TableHead>Tarih</TableHead>
                <TableHead>Son Tarih</TableHead>
                <TableHead>İşlemler</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredRequests.map((request) => (
                <TableRow key={request.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{request.customerName}</div>
                      {request.customerEmail && (
                        <div className="text-sm text-gray-500">{request.customerEmail}</div>
                      )}
                      {request.project && (
                        <div className="text-xs text-gray-400">
                          📋 {request.project.name}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  
                  <TableCell>
                    <div>
                      <div className="font-medium">{request.engineerName}</div>
                      <div className="text-sm text-gray-500">{request.engineerTitle}</div>
                    </div>
                  </TableCell>
                  
                  <TableCell>{getStatusBadge(request.status)}</TableCell>
                  
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{request._count.photos}</span>
                      {request._count.photos > 0 && getPhotoStatusSummary(request.photos)}
                    </div>
                  </TableCell>
                  
                  <TableCell>
                    <div className="text-sm">
                      {format(new Date(request.createdAt), 'dd MMM yyyy', { locale: tr })}
                    </div>
                    <div className="text-xs text-gray-500">
                      {format(new Date(request.createdAt), 'HH:mm')}
                    </div>
                  </TableCell>
                  
                  <TableCell>
                    <div className="text-sm">
                      {format(new Date(request.expiresAt), 'dd MMM yyyy', { locale: tr })}
                    </div>
                    <div className="text-xs text-gray-500">
                      {format(new Date(request.expiresAt), 'HH:mm')}
                    </div>
                  </TableCell>
                  
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Link href={`/dashboard/photo-requests/${request.id}`}>
                        <Button size="sm" variant="outline">
                          <Eye className="w-4 h-4 mr-1" />
                          İncele
                        </Button>
                      </Link>
                      
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                          const url = `${window.location.origin}/photo-upload/${request.token}`
                          navigator.clipboard.writeText(url)
                          toast({
                            title: 'Kopyalandı',
                            description: 'Yükleme bağlantısı panoya kopyalandı'
                          })
                        }}
                      >
                        <ExternalLink className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-6">
            <Button
              variant="outline"
              size="sm"
              disabled={page === 1}
              onClick={() => setPage(page - 1)}
            >
              Önceki
            </Button>
            
            <span className="text-sm text-gray-600">
              {page} / {pagination.totalPages}
            </span>
            
            <Button
              variant="outline"
              size="sm"
              disabled={page === pagination.totalPages}
              onClick={() => setPage(page + 1)}
            >
              Sonraki
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}