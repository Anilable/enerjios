import { notFound } from 'next/navigation'
import { prisma } from '@/lib/db'
import { PhotoUploadForm } from '@/components/photo-upload/photo-upload-form'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { CalendarDays, Camera, Clock, MapPin, User } from 'lucide-react'

interface PhotoUploadPageProps {
  params: Promise<{
    token: string
  }>
}

async function getPhotoRequest(token: string) {
  try {
    const photoRequest = await prisma.photoRequest.findUnique({
      where: { 
        token,
        status: 'PENDING' // Only allow uploads for pending requests
      },
      include: {
        customer: {
          select: {
            firstName: true,
            lastName: true,
            companyName: true
          }
        },
        project: {
          select: {
            name: true,
            type: true,
            capacity: true
          }
        },
        photos: {
          select: {
            id: true,
            filename: true,
            originalName: true,
            thumbnailUrl: true,
            approved: true,
            createdAt: true
          },
          orderBy: {
            createdAt: 'desc'
          }
        }
      }
    })

    if (!photoRequest) {
      return null
    }

    // Check if token has expired
    const now = new Date()
    if (photoRequest.expiresAt < now) {
      return { expired: true, photoRequest }
    }

    return { expired: false, photoRequest }
  } catch (error) {
    console.error('Error fetching photo request:', error)
    return null
  }
}

export default async function PhotoUploadPage({ params }: PhotoUploadPageProps) {
  const { token } = await params
  const result = await getPhotoRequest(token)

  if (!result) {
    notFound()
  }

  if (result.expired) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
                <Clock className="h-6 w-6 text-red-600" />
              </div>
              <h2 className="text-lg font-medium text-gray-900 mb-2">Süresi Dolmuş</h2>
              <p className="text-sm text-gray-600 mb-4">
                Bu fotoğraf yükleme bağlantısının süresi dolmuş. Lütfen yeni bir bağlantı talebinde bulunun.
              </p>
              <div className="text-xs text-gray-400">
                Son geçerlilik tarihi: {result.photoRequest.expiresAt.toLocaleDateString('tr-TR')}
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const { photoRequest } = result
  const customerName = photoRequest.customer ? 
    `${photoRequest.customer.firstName} ${photoRequest.customer.lastName}`.trim() || photoRequest.customer.companyName :
    photoRequest.customerName

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <div className="bg-white border-b shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">🌞</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">EnerjiOS</h1>
                <p className="text-sm text-gray-600">Güneş Enerjisi Fotoğraf Yükleme</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Badge 
                variant={
                  photoRequest.status === 'REVIEWED' ? 'default' : 
                  photoRequest.status === 'UPLOADED' ? 'secondary' : 
                  'outline'
                }
              >
                {photoRequest.status === 'REVIEWED' ? 'Tamamlandı' :
                 photoRequest.status === 'UPLOADED' ? 'Yüklendi' :
                 'Bekliyor'}
              </Badge>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Request Details */}
          <div className="lg:col-span-1">
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="w-5 h-5" />
                  Talep Detayları
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="text-sm text-gray-600">Müşteri</div>
                  <div className="font-medium">{photoRequest.customerName}</div>
                </div>
                
                {photoRequest.project && (
                  <div>
                    <div className="text-sm text-gray-600">Proje</div>
                    <div className="font-medium">{photoRequest.project.name}</div>
                    <div className="text-sm text-gray-500">
                      {photoRequest.project.capacity}kW - {photoRequest.project.type}
                    </div>
                  </div>
                )}

                <div>
                  <div className="text-sm text-gray-600">Mühendis</div>
                  <div className="font-medium">
                    {photoRequest.engineerTitle} {photoRequest.engineerName}
                  </div>
                </div>

                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <CalendarDays className="w-4 h-4" />
                  <span>
                    Son tarih: {new Date(photoRequest.expiresAt).toLocaleDateString('tr-TR')}
                  </span>
                </div>

                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Camera className="w-4 h-4" />
                  <span>
                    {photoRequest.photos.length} fotoğraf yüklendi
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Message */}
            <Card>
              <CardHeader>
                <CardTitle>Mesaj</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="whitespace-pre-line text-sm text-gray-700">
                  {photoRequest.message}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Upload Interface */}
          <div className="lg:col-span-2">
            <PhotoUploadForm
              token={token}
              photoRequestId={photoRequest.id}
              customerName={customerName}
              maxPhotos={20}
              maxFileSize={10 * 1024 * 1024} // 10MB
              existingPhotos={photoRequest.photos}
            />
          </div>
        </div>

        {/* Guidelines */}
        {photoRequest.guidelines && (
          <Card className="mt-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Camera className="w-5 h-5" />
                Fotoğraf Çekim Rehberi
              </CardTitle>
              <CardDescription>
                En iyi sonuçlar için bu rehberi takip edin
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="whitespace-pre-line text-sm text-gray-700 leading-relaxed">
                {photoRequest.guidelines}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}