'use client'

import { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { 
  Upload, 
  Camera, 
  X, 
  Check, 
  AlertCircle, 
  Image as ImageIcon,
  Loader2,
  Plus
} from 'lucide-react'

interface PhotoUploadFormProps {
  token: string
  photoRequestId: string
  customerName: string
  maxPhotos?: number
  maxFileSize?: number
  existingPhotos?: any[]
}

interface UploadFile {
  id: string
  file: File
  preview: string
  status: 'pending' | 'uploading' | 'success' | 'error'
  progress: number
  error?: string
}

export function PhotoUploadForm({
  token,
  photoRequestId,
  customerName,
  maxPhotos = 20,
  maxFileSize = 10 * 1024 * 1024, // 10MB
  existingPhotos = []
}: PhotoUploadFormProps) {
  const [files, setFiles] = useState<UploadFile[]>([])
  const [isUploading, setIsUploading] = useState(false)
  const [uploadComplete, setUploadComplete] = useState(false)

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const totalPhotos = existingPhotos.length + files.length + acceptedFiles.length
    
    if (totalPhotos > maxPhotos) {
      alert(`Maksimum ${maxPhotos} fotoğraf yükleyebilirsiniz. Şu anda ${existingPhotos.length + files.length} fotoğrafınız var.`)
      return
    }

    const newFiles = acceptedFiles.map(file => ({
      id: Math.random().toString(36).substring(7),
      file,
      preview: URL.createObjectURL(file),
      status: 'pending' as const,
      progress: 0
    }))

    setFiles(prev => [...prev, ...newFiles])
  }, [files, existingPhotos.length, maxPhotos])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.webp']
    },
    maxSize: maxFileSize,
    disabled: isUploading || uploadComplete
  })

  const removeFile = (id: string) => {
    setFiles(prev => {
      const updated = prev.filter(f => f.id !== id)
      // Clean up preview URLs
      const removed = prev.find(f => f.id === id)
      if (removed) {
        URL.revokeObjectURL(removed.preview)
      }
      return updated
    })
  }

  const uploadFiles = async () => {
    if (files.length === 0) return

    setIsUploading(true)
    
    for (const file of files) {
      if (file.status !== 'pending') continue

      try {
        // Update status to uploading
        setFiles(prev => prev.map(f => 
          f.id === file.id ? { ...f, status: 'uploading', progress: 0 } : f
        ))

        const formData = new FormData()
        formData.append('file', file.file)
        formData.append('token', token)
        formData.append('originalName', file.file.name)

        const response = await fetch('/api/photo-upload', {
          method: 'POST',
          body: formData
        })

        if (!response.ok) {
          const errorData = await response.json()
          console.error('❌ Upload failed:', {
            status: response.status,
            statusText: response.statusText,
            errorData,
            token,
            fileName: file.file.name
          })
          throw new Error(errorData.error || `Upload failed: ${response.status} ${response.statusText}`)
        }

        const result = await response.json()

        // Update status to success
        setFiles(prev => prev.map(f => 
          f.id === file.id ? { ...f, status: 'success', progress: 100 } : f
        ))

      } catch (error) {
        // Update status to error
        setFiles(prev => prev.map(f => 
          f.id === file.id ? { 
            ...f, 
            status: 'error', 
            progress: 0, 
            error: error instanceof Error ? error.message : 'Upload failed' 
          } : f
        ))
      }
    }

    setIsUploading(false)

    // Check if all uploads were successful
    const allSuccessful = files.every(f => f.status === 'success')
    if (allSuccessful) {
      setUploadComplete(true)
    }
  }

  const hasUploads = files.length > 0
  const pendingUploads = files.filter(f => f.status === 'pending').length
  const successfulUploads = files.filter(f => f.status === 'success').length
  const failedUploads = files.filter(f => f.status === 'error').length

  if (uploadComplete && successfulUploads > 0) {
    return (
      <Card>
        <CardContent className="p-12 text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
            <Check className="h-6 w-6 text-green-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Fotoğraflar Başarıyla Yüklendi!
          </h3>
          <p className="text-gray-600 mb-4">
            {successfulUploads} fotoğraf başarıyla yüklendi ve inceleme için gönderildi.
          </p>
          <p className="text-sm text-gray-500">
            Fotoğraflarınız incelendikten sonra size geri dönüş yapılacaktır.
          </p>
          <div className="mt-6">
            <Badge className="bg-green-100 text-green-800">
              Yükleme Tamamlandı
            </Badge>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Upload Area */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Camera className="w-5 h-5" />
            Fotoğraf Yükle
          </CardTitle>
          <div className="text-sm text-gray-600">
            {existingPhotos.length + files.length} / {maxPhotos} fotoğraf
          </div>
        </CardHeader>
        <CardContent>
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
              isDragActive 
                ? 'border-primary bg-primary/5' 
                : 'border-gray-300 hover:border-primary hover:bg-primary/5'
            } ${isUploading || uploadComplete ? 'cursor-not-allowed opacity-50' : ''}`}
          >
            <input {...getInputProps()} />
            <div className="flex flex-col items-center">
              {isDragActive ? (
                <>
                  <Upload className="w-12 h-12 text-primary mb-4" />
                  <p className="text-lg font-medium text-primary">Fotoğrafları buraya bırakın</p>
                </>
              ) : (
                <>
                  <ImageIcon className="w-12 h-12 text-gray-400 mb-4" />
                  <p className="text-lg font-medium text-gray-900 mb-2">
                    Fotoğrafları buraya sürükleyin veya
                  </p>
                  <Button variant="outline" disabled={isUploading || uploadComplete}>
                    <Plus className="w-4 h-4 mr-2" />
                    Dosya Seç
                  </Button>
                </>
              )}
              <div className="mt-4 text-sm text-gray-500">
                <p>JPG, PNG, WebP - Maksimum {Math.round(maxFileSize / 1024 / 1024)}MB</p>
                <p>Maksimum {maxPhotos} fotoğraf</p>
              </div>
            </div>
          </div>

          {/* Mobile Camera Capture */}
          <div className="mt-4 md:hidden">
            <Button 
              variant="outline" 
              className="w-full"
              onClick={() => {
                const input = document.createElement('input')
                input.type = 'file'
                input.accept = 'image/*'
                input.capture = 'camera'
                input.multiple = true
                input.onchange = (e) => {
                  const files = (e.target as HTMLInputElement).files
                  if (files) {
                    onDrop(Array.from(files))
                  }
                }
                input.click()
              }}
              disabled={isUploading || uploadComplete}
            >
              <Camera className="w-4 h-4 mr-2" />
              Kamera ile Çek
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* File Preview */}
      {hasUploads && (
        <Card>
          <CardHeader>
            <CardTitle>Seçilen Fotoğraflar</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {files.map((file) => (
                <div key={file.id} className="relative group">
                  <div className="aspect-square rounded-lg overflow-hidden bg-gray-100">
                    <img
                      src={file.preview}
                      alt={file.file.name}
                      className="w-full h-full object-cover"
                    />
                    
                    {/* Status Overlay */}
                    <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                      {file.status === 'pending' && (
                        <Badge variant="secondary" className="text-xs">
                          Bekliyor
                        </Badge>
                      )}
                      {file.status === 'uploading' && (
                        <div className="flex flex-col items-center">
                          <Loader2 className="w-6 h-6 text-white animate-spin mb-2" />
                          <div className="text-white text-xs">
                            {file.progress}%
                          </div>
                        </div>
                      )}
                      {file.status === 'success' && (
                        <Badge className="bg-green-100 text-green-800">
                          <Check className="w-3 h-3 mr-1" />
                          Başarılı
                        </Badge>
                      )}
                      {file.status === 'error' && (
                        <Badge variant="destructive" className="text-xs">
                          <AlertCircle className="w-3 h-3 mr-1" />
                          Hata
                        </Badge>
                      )}
                    </div>

                    {/* Remove Button */}
                    {file.status === 'pending' && (
                      <Button
                        variant="destructive"
                        size="sm"
                        className="absolute top-2 right-2 h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => removeFile(file.id)}
                      >
                        <X className="w-3 h-3" />
                      </Button>
                    )}
                  </div>
                  
                  <div className="mt-1 text-xs text-gray-600 truncate">
                    {file.file.name}
                  </div>
                  
                  {file.error && (
                    <div className="mt-1 text-xs text-red-600">
                      {file.error}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Upload Button */}
            {pendingUploads > 0 && (
              <div className="mt-6 flex justify-center">
                <Button 
                  onClick={uploadFiles}
                  disabled={isUploading}
                  size="lg"
                  className="min-w-[200px]"
                >
                  {isUploading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Yükleniyor...
                    </>
                  ) : (
                    <>
                      <Upload className="w-4 h-4 mr-2" />
                      {pendingUploads} Fotoğraf Yükle
                    </>
                  )}
                </Button>
              </div>
            )}

            {/* Upload Summary */}
            {(successfulUploads > 0 || failedUploads > 0) && (
              <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                <div className="text-sm">
                  {successfulUploads > 0 && (
                    <div className="text-green-600 mb-1">
                      ✅ {successfulUploads} fotoğraf başarıyla yüklendi
                    </div>
                  )}
                  {failedUploads > 0 && (
                    <div className="text-red-600">
                      ❌ {failedUploads} fotoğraf yüklenemedi
                    </div>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Existing Photos */}
      {existingPhotos.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Daha Önceden Yüklenen Fotoğraflar</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {existingPhotos.map((photo) => (
                <div key={photo.id} className="relative">
                  <div className="aspect-square rounded-lg overflow-hidden bg-gray-100">
                    <img
                      src={photo.thumbnailUrl || photo.filePath}
                      alt={photo.originalName}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="mt-1 text-xs text-gray-600 truncate">
                    {photo.originalName}
                  </div>
                  <div className="mt-1">
                    <Badge 
                      variant={photo.approved === true ? 'default' : photo.approved === false ? 'destructive' : 'secondary'}
                      className="text-xs"
                    >
                      {photo.approved === true ? 'Onaylandı' : 
                       photo.approved === false ? 'Reddedildi' : 
                       'İnceleniyor'}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}