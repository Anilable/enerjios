'use client'

import { useState } from 'react'
import { ProjectRequest, PROJECT_REQUEST_STATUS_LABELS, PROJECT_TYPE_LABELS } from '@/types/project-request'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Textarea } from '@/components/ui/textarea'
import { 
  MapPin, 
  Phone, 
  Mail, 
  Calendar, 
  Zap, 
  DollarSign, 
  User, 
  Camera,
  Clock,
  AlertTriangle,
  CheckCircle,
  MessageSquare,
  History,
  Edit,
  FileText,
  Building,
  Package,
  Wrench
} from 'lucide-react'
import { formatCurrency } from '@/lib/utils'

interface ProjectRequestDetailsProps {
  request: ProjectRequest | null
  isOpen: boolean
  onClose: () => void
  onUpdateStatus: (requestId: string, newStatus: ProjectRequest['status']) => void
  onAddNote: (requestId: string, note: string) => void
}

export function ProjectRequestDetails({ 
  request, 
  isOpen, 
  onClose, 
  onUpdateStatus, 
  onAddNote 
}: ProjectRequestDetailsProps) {
  const [newNote, setNewNote] = useState('')
  const [isAddingNote, setIsAddingNote] = useState(false)

  if (!request) return null

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'HIGH': return 'bg-red-100 text-red-800 border-red-200'
      case 'MEDIUM': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'LOW': return 'bg-green-100 text-green-800 border-green-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'HIGH': return <AlertTriangle className="w-4 h-4" />
      case 'MEDIUM': return <Clock className="w-4 h-4" />
      case 'LOW': return <CheckCircle className="w-4 h-4" />
      default: return null
    }
  }

  const getPriorityLabel = (priority: string) => {
    switch (priority) {
      case 'HIGH': return 'Yüksek'
      case 'MEDIUM': return 'Orta'
      case 'LOW': return 'Düşük'
      default: return priority
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'OPEN': return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'CONTACTED': return 'bg-purple-100 text-purple-800 border-purple-200'
      case 'ASSIGNED': return 'bg-orange-100 text-orange-800 border-orange-200'
      case 'SITE_VISIT': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'CONVERTED_TO_PROJECT': return 'bg-green-100 text-green-800 border-green-200'
      case 'LOST': return 'bg-red-100 text-red-800 border-red-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('tr-TR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase()
  }

  // Tahmini malzeme listesi oluşturma
  const generateEstimatedMaterials = (capacity: number, projectType: string) => {
    const materials = []
    
    // Panel sayısı hesaplaması (ortalama 400W panel varsayımı)
    const panelCount = Math.ceil(capacity * 1000 / 400)
    materials.push({ name: 'Güneş Paneli', quantity: panelCount, unit: 'adet', description: `${400}W Monokristal` })
    
    // Inverter sayısı
    const inverterCount = Math.ceil(capacity / 5) // 5kW'lık inverterlar
    materials.push({ name: 'İnverter', quantity: inverterCount, unit: 'adet', description: `${inverterCount > 1 ? '5kW' : capacity + 'kW'} String İnverter` })
    
    // Montaj malzemeleri
    materials.push({ name: 'Montaj Rayı', quantity: Math.ceil(panelCount / 2), unit: 'adet', description: 'Alüminyum montaj rayı' })
    materials.push({ name: 'Montaj Kelepçesi', quantity: panelCount * 4, unit: 'adet', description: 'Panel kelepçesi' })
    
    // Kablo ve elektrik malzemeleri
    const dcCableLength = Math.ceil(panelCount * 5) // Panel başına 5m kablo
    materials.push({ name: 'DC Kablo', quantity: dcCableLength, unit: 'm', description: '4mm² DC kablo' })
    materials.push({ name: 'AC Kablo', quantity: Math.ceil(capacity * 10), unit: 'm', description: '2.5mm² AC kablo' })
    
    if (projectType === 'ROOFTOP') {
      materials.push({ name: 'Çatı Ankrajı', quantity: Math.ceil(panelCount / 4), unit: 'set', description: 'Çatı montaj ankrajı' })
    } else if (projectType === 'LAND') {
      materials.push({ name: 'Beton Temel', quantity: Math.ceil(panelCount / 10), unit: 'adet', description: 'Arazi montaj temeli' })
    }
    
    return materials
  }

  const handleAddNote = () => {
    if (newNote.trim()) {
      onAddNote(request.id, newNote.trim())
      setNewNote('')
      setIsAddingNote(false)
    }
  }

  const getSourceLabel = (source: string) => {
    switch (source) {
      case 'WEBSITE': return 'Website'
      case 'PHONE': return 'Telefon'
      case 'EMAIL': return 'E-posta'
      case 'REFERRAL': return 'Referans'
      case 'SOCIAL_MEDIA': return 'Sosyal Medya'
      default: return source
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-7xl w-[98vw] max-h-[98vh] overflow-y-auto p-8 gap-8">
        <DialogHeader>
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-3">
              <Avatar className="w-12 h-12">
                <AvatarFallback className="text-lg font-bold bg-primary/10 text-primary">
                  {getInitials(request.customerName)}
                </AvatarFallback>
              </Avatar>
              <div>
                <DialogTitle className="text-xl">{request.customerName}</DialogTitle>
                <DialogDescription className="flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  {request.location}
                </DialogDescription>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge 
                variant="outline" 
                className={`${getStatusColor(request.status)} flex items-center gap-1`}
              >
                {PROJECT_REQUEST_STATUS_LABELS[request.status]}
              </Badge>
              <Badge 
                variant="outline" 
                className={`${getPriorityColor(request.priority)} flex items-center gap-1`}
              >
                {getPriorityIcon(request.priority)}
                {getPriorityLabel(request.priority)}
              </Badge>
            </div>
          </div>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Main Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Customer Information */}
            <div className="bg-gray-50 rounded-lg p-4 space-y-3">
              <h3 className="font-semibold flex items-center gap-2">
                <User className="w-4 h-4" />
                Müşteri Bilgileri
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="w-4 h-4 text-muted-foreground" />
                  <span>{request.customerPhone}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Mail className="w-4 h-4 text-muted-foreground" />
                  <span className="truncate">{request.customerEmail}</span>
                </div>
                <div className="flex items-center gap-2 text-sm md:col-span-2">
                  <Building className="w-4 h-4 text-muted-foreground" />
                  <span>{request.address}</span>
                </div>
              </div>
            </div>

            {/* Project Details */}
            <div className="bg-gray-50 rounded-lg p-4 space-y-3">
              <h3 className="font-semibold flex items-center gap-2">
                <FileText className="w-4 h-4" />
                Proje Detayları
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Proje Türü:</span>
                  <Badge variant="outline">{PROJECT_TYPE_LABELS[request.projectType]}</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground flex items-center gap-1">
                    <Zap className="w-3 h-3" />
                    Kapasite:
                  </span>
                  <span className="font-medium">{request.estimatedCapacity} kW</span>
                </div>
                {request.estimatedBudget && (
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground flex items-center gap-1">
                      <DollarSign className="w-3 h-3" />
                      Bütçe:
                    </span>
                    <span className="font-medium">{formatCurrency(request.estimatedBudget)}</span>
                  </div>
                )}
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Kaynak:</span>
                  <Badge variant="secondary">{getSourceLabel(request.source)}</Badge>
                </div>
                {request.assignedEngineerName && (
                  <div className="flex justify-between items-center md:col-span-2">
                    <span className="text-sm text-muted-foreground">Atanan Mühendis:</span>
                    <span className="font-medium">{request.assignedEngineerName}</span>
                  </div>
                )}
                {request.scheduledVisitDate && (
                  <div className="flex justify-between items-center md:col-span-2">
                    <span className="text-sm text-muted-foreground flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      Planlanan Ziyaret:
                    </span>
                    <span className="font-medium">{formatDate(request.scheduledVisitDate)}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Description */}
            {request.description && (
              <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                <h3 className="font-semibold">Açıklama</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {request.description}
                </p>
              </div>
            )}

            {/* Tags */}
            {request.tags.length > 0 && (
              <div className="space-y-3">
                <h3 className="font-semibold">Etiketler</h3>
                <div className="flex flex-wrap gap-2">
                  {request.tags.map((tag, index) => (
                    <Badge key={index} variant="secondary" className="bg-primary/5 text-primary">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Photos */}
            {request.hasPhotos && (
              <div className="space-y-3">
                <h3 className="font-semibold flex items-center gap-2">
                  <Camera className="w-4 h-4" />
                  Fotoğraflar
                </h3>
                <div className="bg-gray-50 rounded-lg p-4 text-center text-sm text-muted-foreground">
                  Bu talebe bağlı fotoğraflar bulunmaktadır
                </div>
              </div>
            )}

            {/* Notes */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold flex items-center gap-2">
                  <MessageSquare className="w-4 h-4" />
                  Notlar ({request.notes.length})
                </h3>
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => setIsAddingNote(true)}
                >
                  <Edit className="w-3 h-3 mr-1" />
                  Not Ekle
                </Button>
              </div>
              
              {isAddingNote && (
                <div className="space-y-2">
                  <Textarea
                    placeholder="Not yazın..."
                    value={newNote}
                    onChange={(e) => setNewNote(e.target.value)}
                    rows={3}
                  />
                  <div className="flex gap-2">
                    <Button size="sm" onClick={handleAddNote}>
                      Kaydet
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      onClick={() => {
                        setIsAddingNote(false)
                        setNewNote('')
                      }}
                    >
                      İptal
                    </Button>
                  </div>
                </div>
              )}

              <div className="space-y-2 max-h-64 overflow-y-auto">
                {request.notes.length === 0 ? (
                  <div className="bg-gray-50 rounded-lg p-4 text-center text-sm text-muted-foreground">
                    Henüz not eklenmemiş
                  </div>
                ) : (
                  request.notes.map((note, index) => (
                    <div key={index} className="bg-white border rounded-lg p-3 text-sm">
                      {note}
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Right Column - Status History & Actions */}
          <div className="space-y-6">
            {/* Status History */}
            <div className="space-y-3">
              <h3 className="font-semibold flex items-center gap-2">
                <History className="w-4 h-4" />
                Durum Geçmişi
              </h3>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {request.statusHistory.map((item) => (
                  <div key={item.id} className="bg-white border rounded-lg p-3 text-sm">
                    <div className="flex items-center justify-between mb-1">
                      <Badge variant="outline" className={getStatusColor(item.status)}>
                        {PROJECT_REQUEST_STATUS_LABELS[item.status]}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {formatDate(item.timestamp)}
                      </span>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {item.userName}
                    </div>
                    {item.note && (
                      <div className="text-xs mt-1 text-muted-foreground">
                        {item.note}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Info */}
            <div className="bg-gray-50 rounded-lg p-4 space-y-2">
              <h3 className="font-semibold text-sm">Hızlı Bilgiler</h3>
              <div className="space-y-1 text-xs">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Talep No:</span>
                  <span className="font-mono">#{request.id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Oluşturma:</span>
                  <span>{formatDate(request.createdAt)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Güncelleme:</span>
                  <span>{formatDate(request.updatedAt)}</span>
                </div>
                {request.estimatedRevenue && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Tahmini Gelir:</span>
                    <span className="font-medium">{formatCurrency(request.estimatedRevenue)}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Estimated Materials */}
            <div className="space-y-2">
              <h3 className="font-semibold text-sm flex items-center gap-2">
                <Package className="w-4 h-4" />
                Tahmini Malzeme Listesi
              </h3>
              <div className="bg-gray-50 rounded-lg p-3 space-y-2 max-h-48 overflow-y-auto">
                {generateEstimatedMaterials(request.estimatedCapacity, request.projectType).map((material, index) => (
                  <div key={index} className="flex justify-between items-start text-sm">
                    <div className="flex-1">
                      <div className="font-medium">{material.name}</div>
                      <div className="text-xs text-muted-foreground">{material.description}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">{material.quantity} {material.unit}</div>
                    </div>
                  </div>
                ))}
                <div className="text-xs text-muted-foreground mt-2 pt-2 border-t">
                  * Bu liste {request.estimatedCapacity}kW kapasiteye göre tahminidir. Kesin malzeme listesi saha ziyareti sonrası oluşturulacaktır.
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="space-y-2">
              <h3 className="font-semibold text-sm flex items-center gap-2">
                <Wrench className="w-4 h-4" />
                Hızlı İşlemler
              </h3>
              <div className="space-y-2">
                <Button 
                  className="w-full text-sm" 
                  size="sm"
                  onClick={() => {
                    window.open(`tel:${request.customerPhone}`)
                  }}
                >
                  <Phone className="w-4 h-4 mr-2" />
                  Müşteriyi Ara
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full text-sm" 
                  size="sm"
                  onClick={() => {
                    window.open(`mailto:${request.customerEmail}`)
                  }}
                >
                  <Mail className="w-4 h-4 mr-2" />
                  E-posta Gönder
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full text-sm" 
                  size="sm"
                  onClick={() => {
                    // TODO: Ziyaret planlama modal'ı
                    alert('Ziyaret planlama özelliği henüz aktif değil')
                  }}
                >
                  <Calendar className="w-4 h-4 mr-2" />
                  Ziyaret Planla
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full text-sm" 
                  size="sm"
                  onClick={() => {
                    window.open(`/dashboard/quotes/create/${request.id}`, '_blank')
                  }}
                >
                  <FileText className="w-4 h-4 mr-2" />
                  Fiyat Teklifi Oluştur
                </Button>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}