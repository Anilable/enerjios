'use client'

import { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/hooks/use-toast'
import { 
  Upload, 
  Camera, 
  X, 
  Check, 
  AlertCircle, 
  FileImage,
  Loader2
} from 'lucide-react'
import Image from 'next/image'

interface PhotoUploadInterfaceProps {
  photoRequest: {
    id: string
    token: string
    status: string
    photos: Array<{
      id: string
      filename: string
      originalName: string
      thumbnailUrl?: string | null
      approved?: boolean | null
      createdAt: Date
    }>
  }
  isCompleted: boolean
}

interface UploadFile extends File {
  id: string
  preview: string
  uploadProgress: number
  uploadStatus: 'pending' | 'uploading' | 'success' | 'error'
  error?: string
}

export function PhotoUploadInterface({ photoRequest, isCompleted }: PhotoUploadInterfaceProps) {
  const { toast } = useToast()
  const [files, setFiles] = useState<UploadFile[]>([])
  const [uploading, setUploading] = useState(false)

  const onDrop = useCallback((acceptedFiles: File[]) => {
    // Validate file size and type
    const validFiles = acceptedFiles.filter(file => {
      if (file.size > 10 * 1024 * 1024) { // 10MB limit
        toast({
          title: 'Dosya çok büyük',
          description: `${file.name} dosyası 10MB'dan büyük. Lütfen daha küçük bir dosya seçin.`,
          variant: 'destructive'
        })
        return false
      }
      
      if (!file.type.startsWith('image/')) {
        toast({
          title: 'Geçersiz dosya türü',
          description: `${file.name} bir resim dosyası değil. Sadece JPG, PNG dosyaları kabul edilir.`,
          variant: 'destructive'
        })
        return false
      }

      return true
    })

    const newFiles: UploadFile[] = validFiles.map(file => ({
      ...file,
      id: Math.random().toString(36),
      preview: URL.createObjectURL(file),
      uploadProgress: 0,
      uploadStatus: 'pending'
    }))

    setFiles(prev => [...prev, ...newFiles])
  }, [toast])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.webp']
    },
    multiple: true,
    disabled: uploading || isCompleted
  })

  const removeFile = (fileId: string) => {
    setFiles(prev => {
      const file = prev.find(f => f.id === fileId)
      if (file) {
        URL.revokeObjectURL(file.preview)
      }
      return prev.filter(f => f.id !== fileId)
    })
  }

  const uploadFiles = async () => {
    if (files.length === 0) return

    setUploading(true)

    for (const file of files) {
      if (file.uploadStatus === 'success') continue

      try {
        setFiles(prev => prev.map(f => 
          f.id === file.id 
            ? { ...f, uploadStatus: 'uploading', uploadProgress: 0 }
            : f
        ))

        const formData = new FormData()
        formData.append('file', file)
        formData.append('token', photoRequest.token)
        formData.append('originalName', file.name)

        const xhr = new XMLHttpRequest()

        // Upload progress
        xhr.upload.addEventListener('progress', (e) => {
          if (e.lengthComputable) {
            const progress = (e.loaded / e.total) * 100
            setFiles(prev => prev.map(f => 
              f.id === file.id 
                ? { ...f, uploadProgress: progress }
                : f
            ))
          }
        })

        // Upload completion
        await new Promise<void>((resolve, reject) => {
          xhr.addEventListener('load', () => {
            if (xhr.status === 200) {
              setFiles(prev => prev.map(f => 
                f.id === file.id 
                  ? { ...f, uploadStatus: 'success', uploadProgress: 100 }
                  : f
              ))
              resolve()
            } else {
              const errorText = xhr.responseText || 'Upload failed'
              setFiles(prev => prev.map(f => 
                f.id === file.id 
                  ? { ...f, uploadStatus: 'error', error: errorText }
                  : f
              ))
              reject(new Error(errorText))
            }
          })

          xhr.addEventListener('error', () => {
            setFiles(prev => prev.map(f => 
              f.id === file.id 
                ? { ...f, uploadStatus: 'error', error: 'Network error' }
                : f
            ))
            reject(new Error('Network error'))
          })

          xhr.open('POST', '/api/photo-upload')
          xhr.send(formData)
        })

      } catch (error) {
        console.error('Upload failed:', error)
        toast({
          title: 'Yükleme başarısız',
          description: `${file.name} yüklenirken hata oluştu.`,
          variant: 'destructive'
        })
      }
    }

    setUploading(false)
    
    // Check if all files uploaded successfully
    const allSuccess = files.every(f => f.uploadStatus === 'success')
    if (allSuccess) {
      toast({
        title: 'Başarılı',
        description: 'Tüm fotoğraflar başarıyla yüklendi!',
      })
      
      // Clear uploaded files after a delay
      setTimeout(() => {
        files.forEach(file => URL.revokeObjectURL(file.preview))
        setFiles([])
        // Refresh the page to show uploaded photos
        window.location.reload()
      }, 2000)
    }
  }

  const captureFromCamera = () => {
    // Create a file input for camera capture
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = 'image/*'
    input.capture = 'environment' // Use rear camera
    input.multiple = true

    input.onchange = (event) => {
      const files = (event.target as HTMLInputElement).files
      if (files) {
        onDrop(Array.from(files))
      }
    }

    input.click()
  }

  if (isCompleted) {
    return (
      <Card>
        <CardContent className="p-12 text-center">
          <Check className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Fotoğraflar Başarıyla Gönderildi
          </h3>
          <p className="text-gray-600 mb-4">
            Fotoğraflarınız mühendisimiz tarafından incelendi ve onaylandı.
          </p>
          <p className="text-sm text-gray-500">
            Teklifiniz hazırlanıyor, en kısa sürede sizinle iletişime geçeceğiz.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Existing uploaded photos */}
      {photoRequest.photos.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Yüklenmiş Fotoğraflar ({photoRequest.photos.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {photoRequest.photos.map((photo) => (
                <div key={photo.id} className="relative group">
                  <div className="aspect-square rounded-lg overflow-hidden border-2 border-gray-200">
                    {photo.thumbnailUrl ? (
                      <Image
                        src={photo.thumbnailUrl}
                        alt={photo.originalName}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                        <FileImage className="w-8 h-8 text-gray-400" />
                      </div>
                    )}
                  </div>
                  <div className="absolute top-2 right-2">
                    <Badge 
                      variant={
                        photo.approved === true ? 'default' :
                        photo.approved === false ? 'destructive' :
                        'secondary'
                      }
                      className="text-xs"
                    >
                      {photo.approved === true ? 'Onaylandı' :
                       photo.approved === false ? 'Reddedildi' :
                       'İnceleniyor'}
                    </Badge>
                  </div>
                  <p className="text-xs text-gray-600 mt-1 truncate">
                    {photo.originalName}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Upload Interface */}
      <Card>
        <CardHeader>
          <CardTitle>Yeni Fotoğraf Yükle</CardTitle>
        </CardHeader>
        <CardContent>
          {/* Drop Zone */}
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer
              ${isDragActive ? 'border-primary bg-primary/5' : 'border-gray-300 hover:border-primary hover:bg-gray-50'}
              ${(uploading || isCompleted) ? 'cursor-not-allowed opacity-50' : ''}
            `}
          >
            <input {...getInputProps()} />
            <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            {isDragActive ? (
              <p className="text-primary font-medium">Fotoğrafları buraya bırakın...</p>
            ) : (
              <>
                <p className="text-gray-600 mb-2">
                  Fotoğrafları sürükleyip bırakın veya
                </p>
                <p className="text-primary font-medium">dosya seçmek için tıklayın</p>
              </>
            )}
            <p className="text-xs text-gray-500 mt-2">
              JPG, PNG - Maksimum 10MB
            </p>
          </div>

          {/* Camera Button */}
          <div className="flex justify-center mt-4">
            <Button
              onClick={captureFromCamera}
              variant="outline"
              className="gap-2"
              disabled={uploading || isCompleted}
            >
              <Camera className="w-4 h-4" />
              Kameradan Çek
            </Button>
          </div>

          {/* Selected Files */}
          {files.length > 0 && (
            <div className="mt-6">
              <h4 className="font-medium mb-4">Seçilen Fotoğraflar ({files.length})</h4>
              <div className="space-y-3">
                {files.map((file) => (
                  <div key={file.id} className="flex items-center space-x-3 p-3 border rounded-lg">
                    <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0">
                      <Image
                        src={file.preview}
                        alt={file.name}
                        width={48}
                        height={48}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {file.name}
                      </p>
                      <p className="text-xs text-gray-500">
                        {(file.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                      
                      {file.uploadStatus === 'uploading' && (
                        <div className="mt-1">
                          <Progress value={file.uploadProgress} className="h-1" />
                          <p className="text-xs text-gray-500 mt-1">
                            Yükleniyor... {Math.round(file.uploadProgress)}%
                          </p>
                        </div>
                      )}
                      
                      {file.uploadStatus === 'error' && (
                        <p className="text-xs text-red-600 mt-1">
                          {file.error || 'Yükleme başarısız'}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center space-x-2">
                      {file.uploadStatus === 'success' && (
                        <Check className="w-5 h-5 text-green-500" />
                      )}
                      {file.uploadStatus === 'error' && (
                        <AlertCircle className="w-5 h-5 text-red-500" />
                      )}
                      {file.uploadStatus === 'uploading' && (
                        <Loader2 className="w-5 h-5 text-primary animate-spin" />
                      )}
                      
                      {file.uploadStatus === 'pending' && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeFile(file.id)}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Upload Button */}
              {files.some(f => f.uploadStatus === 'pending') && (
                <div className="flex justify-center mt-6">
                  <Button
                    onClick={uploadFiles}
                    disabled={uploading}
                    size="lg"
                    className="gap-2"
                  >
                    {uploading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Upload className="w-4 h-4" />
                    )}
                    Fotoğrafları Yükle
                  </Button>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}