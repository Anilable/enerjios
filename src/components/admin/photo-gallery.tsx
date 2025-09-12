'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useToast } from '@/hooks/use-toast'
import { 
  Check, 
  X, 
  Eye, 
  Calendar, 
  User, 
  MapPin,
  Clock,
  Camera,
  Download,
  ExternalLink,
  Loader2,
  ChevronLeft,
  ChevronRight
} from 'lucide-react'
import Image from 'next/image'
import { format } from 'date-fns'
import { tr } from 'date-fns/locale'

interface PhotoRequest {
  id: string
  token: string
  status: string
  customerName: string
  customerEmail?: string | null
  customerPhone?: string | null
  projectName?: string | null
  engineerName: string
  engineerTitle: string
  message?: string | null
  expiresAt: string
  createdAt: string
  uploadedAt?: string | null
  reviewedAt?: string | null
  photos: Photo[]
  _count: {
    photos: number
  }
}

interface Photo {
  id: string
  filename: string
  originalName: string
  thumbnailUrl?: string | null
  approved?: boolean | null
  rejectionReason?: string | null
  createdAt: string
}

export function PhotoGallery() {
  const { toast } = useToast()
  const [photoRequests, setPhotoRequests] = useState<PhotoRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedRequest, setSelectedRequest] = useState<PhotoRequest | null>(null)
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null)
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [reviewDialog, setReviewDialog] = useState(false)
  const [photoIndex, setPhotoIndex] = useState(0)
  const [reviewData, setReviewData] = useState({
    approved: true,
    rejectionReason: ''
  })
  const [updating, setUpdating] = useState(false)

  const fetchPhotoRequests = async () => {
    try {
      const response = await fetch(`/api/admin/photo-request${statusFilter !== 'all' ? `?status=${statusFilter}` : ''}`)
      if (!response.ok) throw new Error('Failed to fetch photo requests')
      
      const data = await response.json()
      setPhotoRequests(data.photoRequests)
    } catch (error) {
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
  }, [statusFilter])

  const openReviewDialog = (request: PhotoRequest, photo: Photo) => {
    setSelectedRequest(request)
    setSelectedPhoto(photo)
    setPhotoIndex(request.photos.findIndex(p => p.id === photo.id))
    setReviewData({
      approved: photo.approved !== false,
      rejectionReason: photo.rejectionReason || ''
    })
    setReviewDialog(true)
  }

  const navigatePhoto = (direction: 'prev' | 'next') => {
    if (!selectedRequest) return
    
    const newIndex = direction === 'prev' 
      ? Math.max(0, photoIndex - 1)
      : Math.min(selectedRequest.photos.length - 1, photoIndex + 1)
    
    setPhotoIndex(newIndex)
    const newPhoto = selectedRequest.photos[newIndex]
    setSelectedPhoto(newPhoto)
    setReviewData({
      approved: newPhoto.approved !== false,
      rejectionReason: newPhoto.rejectionReason || ''
    })
  }

  const reviewPhoto = async () => {
    if (!selectedPhoto || !selectedRequest) return

    setUpdating(true)
    try {
      const response = await fetch(`/api/admin/photo-review`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          photoId: selectedPhoto.id,
          approved: reviewData.approved,
          rejectionReason: reviewData.approved ? null : reviewData.rejectionReason
        })
      })

      if (!response.ok) throw new Error('Review failed')

      toast({
        title: 'Başarılı',
        description: `Fotoğraf ${reviewData.approved ? 'onaylandı' : 'reddedildi'}`,
      })

      // Refresh data
      await fetchPhotoRequests()
      setReviewDialog(false)

    } catch (error) {
      toast({
        title: 'Hata',
        description: 'Fotoğraf değerlendirme işlemi başarısız',
        variant: 'destructive'
      })
    } finally {
      setUpdating(false)
    }
  }

  const markAsReviewed = async (requestId: string) => {
    try {
      const response = await fetch(`/api/admin/photo-request/${requestId}/complete`, {
        method: 'POST'
      })

      if (!response.ok) throw new Error('Failed to mark as reviewed')

      toast({
        title: 'Başarılı',
        description: 'Fotoğraf talebi tamamlandı olarak işaretlendi',
      })

      await fetchPhotoRequests()

    } catch (error) {
      toast({
        title: 'Hata',
        description: 'İşlem başarısız',
        variant: 'destructive'
      })
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDING':
        return <Badge variant="outline">Bekliyor</Badge>
      case 'UPLOADED':
        return <Badge variant="secondary">Yüklendi</Badge>
      case 'REVIEWED':
        return <Badge variant="default">İncelendi</Badge>
      case 'EXPIRED':
        return <Badge variant="destructive">Süresi Dolmuş</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const getApprovalBadge = (approved?: boolean | null) => {
    if (approved === true) return <Badge className="bg-green-100 text-green-800">Onaylandı</Badge>
    if (approved === false) return <Badge variant="destructive">Reddedildi</Badge>
    return <Badge variant="secondary">Bekliyor</Badge>
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="p-12 text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
          <p>Fotoğraf talepleri yükleniyor...</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Camera className="w-5 h-5" />
            Fotoğraf Talepleri
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <Label htmlFor="status-filter">Durum:</Label>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger id="status-filter" className="w-48">
                <SelectValue placeholder="Durum seçin" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tümü</SelectItem>
                <SelectItem value="PENDING">Bekliyor</SelectItem>
                <SelectItem value="UPLOADED">Yüklendi</SelectItem>
                <SelectItem value="REVIEWED">İncelendi</SelectItem>
                <SelectItem value="EXPIRED">Süresi Dolmuş</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Photo Requests List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {photoRequests.map((request) => (
          <Card key={request.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg">{request.customerName}</CardTitle>
                  {request.projectName && (
                    <p className="text-sm text-gray-600">{request.projectName}</p>
                  )}
                </div>
                {getStatusBadge(request.status)}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4 text-sm text-gray-600">
                <div className="flex items-center gap-1">
                  <User className="w-4 h-4" />
                  <span>{request.engineerTitle} {request.engineerName}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  <span>{format(new Date(request.createdAt), 'dd MMM yyyy', { locale: tr })}</span>
                </div>
              </div>

              <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center gap-1">
                  <Camera className="w-4 h-4" />
                  <span>{request._count.photos} fotoğraf</span>
                </div>
                {request.uploadedAt && (
                  <div className="flex items-center gap-1 text-green-600">
                    <Check className="w-4 h-4" />
                    <span>Yüklendi</span>
                  </div>
                )}
              </div>

              {/* Photo Thumbnails */}
              {request.photos.length > 0 && (
                <div className="grid grid-cols-4 gap-2">
                  {request.photos.slice(0, 8).map((photo) => (
                    <div
                      key={photo.id}
                      className="relative aspect-square rounded-lg overflow-hidden border-2 border-gray-200 cursor-pointer hover:border-primary transition-colors"
                      onClick={() => openReviewDialog(request, photo)}
                    >
                      {photo.thumbnailUrl ? (
                        <Image
                          src={photo.thumbnailUrl}
                          alt={photo.originalName}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                          <Camera className="w-6 h-6 text-gray-400" />
                        </div>
                      )}
                      <div className="absolute top-1 right-1">
                        {getApprovalBadge(photo.approved)}
                      </div>
                    </div>
                  ))}
                  {request.photos.length > 8 && (
                    <div className="aspect-square rounded-lg bg-gray-100 flex items-center justify-center text-sm text-gray-600">
                      +{request.photos.length - 8}
                    </div>
                  )}
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-2 pt-4 border-t">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1 gap-2"
                  onClick={() => window.open(`/photo-upload/${request.token}`, '_blank')}
                >
                  <ExternalLink className="w-4 h-4" />
                  Müşteri Görünümü
                </Button>
                
                {request.status === 'UPLOADED' && (
                  <Button
                    size="sm"
                    onClick={() => markAsReviewed(request.id)}
                    className="gap-2"
                  >
                    <Check className="w-4 h-4" />
                    Tamamlandı
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {photoRequests.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <Camera className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Fotoğraf Talebi Bulunamadı
            </h3>
            <p className="text-gray-600">
              Seçilen filtreler için fotoğraf talebi bulunmuyor.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Photo Review Dialog */}
      <Dialog open={reviewDialog} onOpenChange={setReviewDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <span>Fotoğraf İnceleme</span>
              {selectedRequest && (
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => navigatePhoto('prev')}
                    disabled={photoIndex === 0}
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                  <span className="text-sm text-gray-600">
                    {photoIndex + 1} / {selectedRequest.photos.length}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => navigatePhoto('next')}
                    disabled={photoIndex === selectedRequest.photos.length - 1}
                  >
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              )}
            </DialogTitle>
            {selectedPhoto && (
              <DialogDescription>
                {selectedPhoto.originalName}
              </DialogDescription>
            )}
          </DialogHeader>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Photo Display */}
            <div className="space-y-4">
              {selectedPhoto?.thumbnailUrl ? (
                <div className="relative aspect-square rounded-lg overflow-hidden border">
                  <Image
                    src={selectedPhoto.thumbnailUrl.replace('/thumbnails/', '/photos/')}
                    alt={selectedPhoto.originalName}
                    fill
                    className="object-cover"
                  />
                </div>
              ) : (
                <div className="aspect-square rounded-lg bg-gray-100 flex items-center justify-center">
                  <Camera className="w-16 h-16 text-gray-400" />
                </div>
              )}
              
              {selectedPhoto && (
                <div className="text-sm text-gray-600">
                  <p>Dosya: {selectedPhoto.originalName}</p>
                  <p>Yükleme: {format(new Date(selectedPhoto.createdAt), 'dd MMM yyyy HH:mm', { locale: tr })}</p>
                </div>
              )}
            </div>

            {/* Review Form */}
            <div className="space-y-4">
              <div>
                <Label>Değerlendirme</Label>
                <div className="flex gap-4 mt-2">
                  <Button
                    variant={reviewData.approved ? "default" : "outline"}
                    onClick={() => setReviewData(prev => ({ ...prev, approved: true }))}
                    className="flex-1 gap-2"
                  >
                    <Check className="w-4 h-4" />
                    Onayla
                  </Button>
                  <Button
                    variant={!reviewData.approved ? "destructive" : "outline"}
                    onClick={() => setReviewData(prev => ({ ...prev, approved: false }))}
                    className="flex-1 gap-2"
                  >
                    <X className="w-4 h-4" />
                    Reddet
                  </Button>
                </div>
              </div>

              {!reviewData.approved && (
                <div>
                  <Label htmlFor="rejection-reason">Red Sebebi</Label>
                  <Textarea
                    id="rejection-reason"
                    value={reviewData.rejectionReason}
                    onChange={(e) => setReviewData(prev => ({ ...prev, rejectionReason: e.target.value }))}
                    placeholder="Fotoğrafın neden reddedildiğini açıklayın..."
                    rows={3}
                  />
                </div>
              )}

              {/* Request Info */}
              {selectedRequest && (
                <div className="border-t pt-4">
                  <h4 className="font-medium mb-2">Talep Bilgileri</h4>
                  <div className="space-y-2 text-sm">
                    <p><span className="font-medium">Müşteri:</span> {selectedRequest.customerName}</p>
                    <p><span className="font-medium">Mühendis:</span> {selectedRequest.engineerName}</p>
                    {selectedRequest.projectName && (
                      <p><span className="font-medium">Proje:</span> {selectedRequest.projectName}</p>
                    )}
                    <p><span className="font-medium">Son Tarih:</span> {format(new Date(selectedRequest.expiresAt), 'dd MMM yyyy', { locale: tr })}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setReviewDialog(false)}>
              İptal
            </Button>
            <Button onClick={reviewPhoto} disabled={updating || (!reviewData.approved && !reviewData.rejectionReason.trim())}>
              {updating ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : null}
              Kaydet
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}