'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { useToast } from '@/hooks/use-toast'
import {
  Check,
  X,
  Eye,
  Download,
  Calendar,
  User,
  MapPin,
  Building,
  Mail,
  Phone,
  Clock,
  Camera,
  ExternalLink,
  Loader2,
  ChevronLeft,
  ChevronRight,
  MessageCircle,
  FileText,
  Home,
  Zap
} from 'lucide-react'
import Image from 'next/image'
import { format } from 'date-fns'
import { tr } from 'date-fns/locale'

interface PhotoRequestDetailProps {
  photoRequest: any
  currentUser: any
}

export function PhotoRequestDetail({ photoRequest, currentUser }: PhotoRequestDetailProps) {
  const [selectedPhoto, setSelectedPhoto] = useState<any>(null)
  const [photoIndex, setPhotoIndex] = useState(0)
  const [reviewDialog, setReviewDialog] = useState(false)
  const [reviewData, setReviewData] = useState({ approved: true, rejectionReason: '' })
  const [updating, setUpdating] = useState(false)
  const { toast } = useToast()

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDING':
        return <Badge variant="outline" className="text-yellow-600 border-yellow-600"><Clock className="w-3 h-3 mr-1" />Bekliyor</Badge>
      case 'UPLOADED':
        return <Badge variant="secondary" className="text-blue-600"><Camera className="w-3 h-3 mr-1" />Yüklendi</Badge>
      case 'REVIEWED':
        return <Badge className="text-green-600 bg-green-100 border-green-600"><Check className="w-3 h-3 mr-1" />İncelendi</Badge>
      case 'EXPIRED':
        return <Badge variant="destructive"><X className="w-3 h-3 mr-1" />Süresi Dolmuş</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const openPhotoReview = (photo: any, index: number) => {
    setSelectedPhoto(photo)
    setPhotoIndex(index)
    setReviewData({
      approved: photo.approved !== false,
      rejectionReason: photo.rejectionReason || ''
    })
    setReviewDialog(true)
  }

  const navigatePhoto = (direction: 'prev' | 'next') => {
    const newIndex = direction === 'prev' 
      ? Math.max(0, photoIndex - 1)
      : Math.min(photoRequest.photos.length - 1, photoIndex + 1)
    
    setPhotoIndex(newIndex)
    const newPhoto = photoRequest.photos[newIndex]
    setSelectedPhoto(newPhoto)
    setReviewData({
      approved: newPhoto.approved !== false,
      rejectionReason: newPhoto.rejectionReason || ''
    })
  }

  const reviewPhoto = async () => {
    if (!selectedPhoto) return

    setUpdating(true)
    try {
      const response = await fetch('/api/admin/photo-review', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          photoId: selectedPhoto.id,
          approved: reviewData.approved,
          rejectionReason: reviewData.approved ? '' : reviewData.rejectionReason
        })
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Review failed')
      }

      // Update local state
      const updatedPhotos = photoRequest.photos.map((photo: any) =>
        photo.id === selectedPhoto.id
          ? {
              ...photo,
              approved: reviewData.approved,
              rejectionReason: reviewData.approved ? null : reviewData.rejectionReason
            }
          : photo
      )
      photoRequest.photos = updatedPhotos

      toast({
        title: 'Başarılı',
        description: `Fotoğraf ${reviewData.approved ? 'onaylandı' : 'reddedildi'}`
      })

      setReviewDialog(false)
    } catch (error) {
      console.error('Photo review error:', error)
      toast({
        title: 'Hata',
        description: error instanceof Error ? error.message : 'İnceleme başarısız',
        variant: 'destructive'
      })
    } finally {
      setUpdating(false)
    }
  }

  const copyUploadLink = () => {
    const url = `${window.location.origin}/photo-upload/${photoRequest.token}`
    navigator.clipboard.writeText(url)
    toast({
      title: 'Kopyalandı',
      description: 'Yükleme bağlantısı panoya kopyalandı'
    })
  }

  const customerDisplayName = photoRequest.customer
    ? `${photoRequest.customer.firstName} ${photoRequest.customer.lastName}`.trim() || photoRequest.customer.companyName
    : photoRequest.customerName

  return (
    <div className="space-y-6">
      {/* Header Info */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5" />
                Talep Bilgileri
              </CardTitle>
              {getStatusBadge(photoRequest.status)}
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="text-sm text-gray-600">Müşteri</Label>
                <div className="font-medium">{customerDisplayName}</div>
                {photoRequest.customerEmail && (
                  <div className="flex items-center gap-1 text-sm text-gray-500">
                    <Mail className="w-3 h-3" />
                    {photoRequest.customerEmail}
                  </div>
                )}
                {photoRequest.customer?.phone && (
                  <div className="flex items-center gap-1 text-sm text-gray-500">
                    <Phone className="w-3 h-3" />
                    {photoRequest.customer.phone}
                  </div>
                )}
              </div>

              <div>
                <Label className="text-sm text-gray-600">Mühendis</Label>
                <div className="font-medium">
                  {photoRequest.engineerTitle} {photoRequest.engineerName}
                </div>
                <div className="text-sm text-gray-500">
                  {photoRequest.requestedBy.name}
                </div>
              </div>

              <div>
                <Label className="text-sm text-gray-600">Oluşturulma</Label>
                <div className="flex items-center gap-1 text-sm">
                  <Calendar className="w-3 h-3" />
                  {format(new Date(photoRequest.createdAt), 'dd MMM yyyy HH:mm', { locale: tr })}
                </div>
              </div>

              <div>
                <Label className="text-sm text-gray-600">Son Tarih</Label>
                <div className="flex items-center gap-1 text-sm">
                  <Clock className="w-3 h-3" />
                  {format(new Date(photoRequest.expiresAt), 'dd MMM yyyy HH:mm', { locale: tr })}
                </div>
              </div>
            </div>

            {photoRequest.project && (
              <div>
                <Label className="text-sm text-gray-600">Proje Bilgileri</Label>
                <div className="bg-gray-50 rounded-lg p-3 mt-1">
                  <div className="font-medium">{photoRequest.project.name}</div>
                  <div className="text-sm text-gray-600 flex items-center gap-4 mt-1">
                    <span className="flex items-center gap-1">
                      <Zap className="w-3 h-3" />
                      {photoRequest.project.capacity}kW
                    </span>
                    <span className="flex items-center gap-1">
                      <Home className="w-3 h-3" />
                      {photoRequest.project.type}
                    </span>
                  </div>
                  {photoRequest.project.location && (
                    <div className="flex items-center gap-1 text-sm text-gray-500 mt-1">
                      <MapPin className="w-3 h-3" />
                      {photoRequest.project.location.address}
                    </div>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Camera className="w-5 h-5" />
              Fotoğraf Özeti
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center">
              <div className="text-3xl font-bold">{photoRequest.photos.length}</div>
              <div className="text-sm text-gray-600">Toplam Fotoğraf</div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Onaylı:</span>
                <span className="font-medium text-green-600">
                  {photoRequest.photos.filter((p: any) => p.approved === true).length}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Reddedilen:</span>
                <span className="font-medium text-red-600">
                  {photoRequest.photos.filter((p: any) => p.approved === false).length}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Bekleyen:</span>
                <span className="font-medium text-yellow-600">
                  {photoRequest.photos.filter((p: any) => p.approved === null).length}
                </span>
              </div>
            </div>

            <Button 
              variant="outline" 
              size="sm" 
              className="w-full"
              onClick={copyUploadLink}
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              Yükleme Bağlantısını Kopyala
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Message */}
      {photoRequest.message && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageCircle className="w-5 h-5" />
              Mesaj
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="whitespace-pre-line text-sm text-gray-700 leading-relaxed">
              {photoRequest.message}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Guidelines */}
      {photoRequest.guidelines && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Fotoğraf Çekim Rehberi
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="whitespace-pre-line text-sm text-gray-700 leading-relaxed">
              {photoRequest.guidelines}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Photos Grid */}
      {photoRequest.photos.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Camera className="w-5 h-5" />
              Yüklenen Fotoğraflar ({photoRequest.photos.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {photoRequest.photos.map((photo: any, index: number) => (
                <div key={photo.id} className="relative group">
                  <div className="aspect-square rounded-lg overflow-hidden bg-gray-100 cursor-pointer">
                    <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                      <Camera className="w-8 h-8 text-gray-400" />
                    </div>
                    {/* Photo status overlay */}
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => openPhotoReview(photo, index)}
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        İncele
                      </Button>
                    </div>
                  </div>
                  
                  <div className="mt-2">
                    <div className="text-xs text-gray-600 truncate">
                      {photo.originalName}
                    </div>
                    <div className="flex items-center justify-between mt-1">
                      <div className="text-xs text-gray-500">
                        {format(new Date(photo.createdAt), 'dd MMM', { locale: tr })}
                      </div>
                      <div>
                        {photo.approved === true && (
                          <Badge className="bg-green-100 text-green-800">
                            <Check className="w-3 h-3 mr-1" />
                            Onaylı
                          </Badge>
                        )}
                        {photo.approved === false && (
                          <Badge variant="destructive">
                            <X className="w-3 h-3 mr-1" />
                            Red
                          </Badge>
                        )}
                        {photo.approved === null && (
                          <Badge variant="outline">
                            <Clock className="w-3 h-3 mr-1" />
                            Bekliyor
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Photo Review Dialog */}
      <Dialog open={reviewDialog} onOpenChange={setReviewDialog}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>
              Fotoğraf İnceleme ({photoIndex + 1} / {photoRequest.photos.length})
            </DialogTitle>
            <DialogDescription>
              {selectedPhoto?.originalName}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Photo Navigation */}
            <div className="flex items-center justify-between">
              <Button
                variant="outline"
                size="sm"
                disabled={photoIndex === 0}
                onClick={() => navigatePhoto('prev')}
              >
                <ChevronLeft className="w-4 h-4 mr-1" />
                Önceki
              </Button>
              
              <div className="flex items-center gap-2">
                <Badge variant={reviewData.approved ? 'default' : 'destructive'}>
                  {reviewData.approved ? 'Onaylanacak' : 'Reddedilecek'}
                </Badge>
              </div>

              <Button
                variant="outline"
                size="sm"
                disabled={photoIndex === photoRequest.photos.length - 1}
                onClick={() => navigatePhoto('next')}
              >
                Sonraki
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </div>

            {/* Photo Display */}
            <div className="aspect-video bg-gray-100 rounded-lg flex items-center justify-center">
              <Camera className="w-16 h-16 text-gray-400" />
              <div className="ml-4 text-gray-600">
                <div className="font-medium">{selectedPhoto?.originalName}</div>
                <div className="text-sm">
                  {selectedPhoto?.fileSize && `${Math.round(selectedPhoto.fileSize / 1024)} KB`}
                </div>
              </div>
            </div>

            {/* Review Controls */}
            <div className="space-y-4">
              <div className="flex gap-4">
                <Button
                  variant={reviewData.approved ? 'default' : 'outline'}
                  onClick={() => setReviewData({ ...reviewData, approved: true })}
                  className="flex-1"
                >
                  <Check className="w-4 h-4 mr-2" />
                  Onayla
                </Button>
                <Button
                  variant={!reviewData.approved ? 'destructive' : 'outline'}
                  onClick={() => setReviewData({ ...reviewData, approved: false })}
                  className="flex-1"
                >
                  <X className="w-4 h-4 mr-2" />
                  Reddet
                </Button>
              </div>

              {!reviewData.approved && (
                <div>
                  <Label htmlFor="rejection-reason">Red Sebebi</Label>
                  <Textarea
                    id="rejection-reason"
                    value={reviewData.rejectionReason}
                    onChange={(e) => setReviewData({ 
                      ...reviewData, 
                      rejectionReason: e.target.value 
                    })}
                    placeholder="Fotoğrafın neden reddedildiğini açıklayın..."
                    className="mt-1"
                  />
                </div>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setReviewDialog(false)}>
              İptal
            </Button>
            <Button 
              onClick={reviewPhoto} 
              disabled={updating || (!reviewData.approved && !reviewData.rejectionReason.trim())}
            >
              {updating && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {reviewData.approved ? 'Onayla' : 'Reddet'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}