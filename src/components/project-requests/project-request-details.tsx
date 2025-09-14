'use client'

import { useState } from 'react'
import { ProjectRequest, PROJECT_REQUEST_STATUS_LABELS, PROJECT_TYPE_LABELS } from '@/types/project-request'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Textarea } from '@/components/ui/textarea'
import { Separator } from '@/components/ui/separator'
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
  Wrench,
  ExternalLink,
  Copy,
  Star,
  Target,
  Activity,
  TrendingUp
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
      <DialogContent className="max-w-6xl w-[94vw] h-[94vh] overflow-hidden flex flex-col bg-gradient-to-br from-slate-50 to-white border-0 shadow-2xl">
        {/* Modern Header with EnerjiOS Orange Gradient */}
        <DialogHeader className="flex-shrink-0 px-6 py-4 bg-gradient-to-r from-orange-500 to-amber-500 text-white relative overflow-hidden">
          {/* Background Pattern */}
          <div className="absolute inset-0 bg-white/10 bg-opacity-10" style={{
            backgroundImage: `radial-gradient(circle at 20px 20px, rgba(255,255,255,0.15) 1px, transparent 1px)`,
            backgroundSize: '40px 40px'
          }}></div>
          
          <div className="relative z-10">
            <div className="flex items-start justify-between gap-6">
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <Avatar className="w-12 h-12 flex-shrink-0 ring-3 ring-white/30 shadow-lg">
                  <AvatarFallback className="text-lg font-bold bg-white text-orange-600">
                    {getInitials(request.customerName)}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <DialogTitle className="text-xl font-bold text-white mb-1 truncate">
                    {request.customerName}
                  </DialogTitle>
                  <DialogDescription className="flex items-center gap-2 text-orange-100">
                    <MapPin className="w-4 h-4 flex-shrink-0" />
                    <span className="truncate text-sm">{request.location}</span>
                  </DialogDescription>
                  <div className="flex items-center gap-3 mt-1">
                    <div className="flex items-center gap-1 text-white/90">
                      <Target className="w-3 h-3" />
                      <span className="text-xs font-medium">{request.estimatedCapacity} kW</span>
                    </div>
                    {request.estimatedBudget && (
                      <div className="flex items-center gap-1 text-white/90">
                        <DollarSign className="w-3 h-3" />
                        <span className="text-xs font-medium">{formatCurrency(request.estimatedBudget)}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3 flex-shrink-0">
                <Badge 
                  className={`${getStatusColor(request.status)} shadow-lg px-3 py-1.5 text-sm font-medium`}
                >
                  {PROJECT_REQUEST_STATUS_LABELS[request.status]}
                </Badge>
                <Badge 
                  className={`${getPriorityColor(request.priority)} shadow-lg px-3 py-1.5 text-sm font-medium flex items-center gap-1.5`}
                >
                  {getPriorityIcon(request.priority)}
                  <span>{getPriorityLabel(request.priority)}</span>
                </Badge>
              </div>
            </div>
            
            {/* Quick Stats Bar */}
            <div className="mt-4 grid grid-cols-4 gap-3">
              <div className="bg-white/10 backdrop-blur-sm rounded-lg px-2 py-1.5 text-center">
                <div className="text-white/80 text-xs uppercase tracking-wide">Talep No</div>
                <div className="text-white font-mono text-sm font-semibold truncate">#{request.id}</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg px-2 py-1.5 text-center">
                <div className="text-white/80 text-xs uppercase tracking-wide">Kaynak</div>
                <div className="text-white text-sm font-semibold truncate">{getSourceLabel(request.source)}</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg px-2 py-1.5 text-center">
                <div className="text-white/80 text-xs uppercase tracking-wide">Proje Türü</div>
                <div className="text-white text-sm font-semibold truncate">{PROJECT_TYPE_LABELS[request.projectType]}</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg px-2 py-1.5 text-center">
                <div className="text-white/80 text-xs uppercase tracking-wide">Notlar</div>
                <div className="text-white text-sm font-semibold">{request.notes.length}</div>
              </div>
            </div>
          </div>
        </DialogHeader>
        
        {/* Two Column Layout */}
        <div className="flex-1 overflow-hidden flex flex-col lg:flex-row">
          {/* Left Column - Customer & Project Details */}
          <div className="flex-1 overflow-y-auto px-4 lg:px-6 py-4 space-y-4">
            <div className="space-y-4">
              {/* Customer Information Card */}
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 hover:shadow-md transition-shadow">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                    <User className="w-4 h-4 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-900">Müşteri Bilgileri</h3>
                    <p className="text-slate-500 text-xs">İletişim ve adres detayları</p>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="group">
                      <div className="flex items-center gap-3 p-2.5 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors">
                        <div className="w-7 h-7 bg-green-100 rounded-lg flex items-center justify-center">
                          <Phone className="w-3.5 h-3.5 text-green-600" />
                        </div>
                        <div className="flex-1">
                          <div className="text-xs text-slate-500 uppercase tracking-wide mb-0.5">Telefon</div>
                          <div className="font-semibold text-slate-900 text-sm">{request.customerPhone}</div>
                        </div>
                        <Button 
                          size="sm" 
                          variant="ghost" 
                          className="opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => window.open(`tel:${request.customerPhone}`)}
                        >
                          <ExternalLink className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>

                    <div className="group">
                      <div className="flex items-center gap-3 p-2.5 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors">
                        <div className="w-7 h-7 bg-purple-100 rounded-lg flex items-center justify-center">
                          <Mail className="w-3.5 h-3.5 text-purple-600" />
                        </div>
                        <div className="flex-1">
                          <div className="text-xs text-slate-500 uppercase tracking-wide mb-0.5">E-posta</div>
                          <div className="font-semibold text-slate-900 text-sm truncate">{request.customerEmail}</div>
                        </div>
                        <Button 
                          size="sm" 
                          variant="ghost" 
                          className="opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => window.open(`mailto:${request.customerEmail}`)}
                        >
                          <ExternalLink className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>

                  <div className="p-2.5 bg-slate-50 rounded-lg">
                    <div className="flex items-start gap-3">
                      <div className="w-7 h-7 bg-orange-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Building className="w-3.5 h-3.5 text-orange-600" />
                      </div>
                      <div className="flex-1">
                        <div className="text-xs text-slate-500 uppercase tracking-wide mb-0.5">Adres</div>
                        <div className="font-semibold text-slate-900 text-sm leading-relaxed">{request.address}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Project Details Card */}
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 hover:shadow-md transition-shadow">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center">
                    <FileText className="w-4 h-4 text-emerald-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-900">Proje Detayları</h3>
                    <p className="text-slate-500 text-xs">Teknik özellikler ve gereksinimler</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-3 border border-blue-100">
                    <div className="flex items-center gap-2 mb-1">
                      <Zap className="w-4 h-4 text-blue-600" />
                      <span className="text-xs font-medium text-blue-800">Kapasite</span>
                    </div>
                    <div className="text-lg font-bold text-blue-900">{request.estimatedCapacity} kW</div>
                    <div className="text-xs text-blue-600">Tahmini güç kapasitesi</div>
                  </div>
                  
                  {request.estimatedBudget && (
                    <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg p-3 border border-green-100">
                      <div className="flex items-center gap-2 mb-1">
                        <DollarSign className="w-4 h-4 text-green-600" />
                        <span className="text-xs font-medium text-green-800">Bütçe</span>
                      </div>
                      <div className="text-lg font-bold text-green-900">{formatCurrency(request.estimatedBudget)}</div>
                      <div className="text-xs text-green-600">Müşteri bütçesi</div>
                    </div>
                  )}

                  <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg p-3 border border-purple-100">
                    <div className="flex items-center gap-2 mb-1">
                      <Package className="w-4 h-4 text-purple-600" />
                      <span className="text-xs font-medium text-purple-800">Proje Türü</span>
                    </div>
                    <div className="text-sm font-bold text-purple-900">{PROJECT_TYPE_LABELS[request.projectType]}</div>
                    <div className="text-xs text-purple-600">Kurulum tipi</div>
                  </div>

                  <div className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-lg p-3 border border-orange-100">
                    <div className="flex items-center gap-2 mb-1">
                      <Activity className="w-4 h-4 text-orange-600" />
                      <span className="text-xs font-medium text-orange-800">Kaynak</span>
                    </div>
                    <div className="text-sm font-bold text-orange-900">{getSourceLabel(request.source)}</div>
                    <div className="text-xs text-orange-600">Talep kaynağı</div>
                  </div>
                </div>
                
                {(request.assignedEngineerName || request.scheduledVisitDate) && (
                  <>
                    <Separator className="my-6" />
                    <div className="space-y-4">
                      {request.assignedEngineerName && (
                        <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
                          <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center">
                            <User className="w-4 h-4 text-indigo-600" />
                          </div>
                          <div className="flex-1">
                            <div className="text-xs text-slate-500 uppercase tracking-wide">Atanan Mühendis</div>
                            <div className="font-semibold text-slate-900">{request.assignedEngineerName}</div>
                          </div>
                        </div>
                      )}
                      
                      {request.scheduledVisitDate && (
                        <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
                          <div className="w-8 h-8 bg-rose-100 rounded-lg flex items-center justify-center">
                            <Calendar className="w-4 h-4 text-rose-600" />
                          </div>
                          <div className="flex-1">
                            <div className="text-xs text-slate-500 uppercase tracking-wide">Planlanan Ziyaret</div>
                            <div className="font-semibold text-slate-900">{formatDate(request.scheduledVisitDate)}</div>
                          </div>
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>

              {/* Description */}
              {request.description && (
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 hover:shadow-md transition-shadow">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center">
                      <MessageSquare className="w-5 h-5 text-amber-600" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-slate-900">Açıklama</h3>
                      <p className="text-slate-500 text-sm">Müşteri talebi detayları</p>
                    </div>
                  </div>
                  <div className="bg-slate-50 rounded-xl p-4">
                    <p className="text-slate-700 leading-relaxed">
                      {request.description}
                    </p>
                  </div>
                </div>
              )}

              {/* Tags */}
              {request.tags.length > 0 && (
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 hover:shadow-md transition-shadow">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-cyan-100 rounded-xl flex items-center justify-center">
                      <Star className="w-5 h-5 text-cyan-600" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-slate-900">Etiketler</h3>
                      <p className="text-slate-500 text-sm">{request.tags.length} etiket tanımlanmış</p>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {request.tags.map((tag, index) => (
                      <Badge 
                        key={index} 
                        className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-3 py-1.5 text-sm font-medium shadow-sm hover:shadow-md transition-shadow"
                      >
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Photos */}
              {request.hasPhotos && (
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 hover:shadow-md transition-shadow">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-pink-100 rounded-xl flex items-center justify-center">
                      <Camera className="w-5 h-5 text-pink-600" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-slate-900">Fotoğraflar</h3>
                      <p className="text-slate-500 text-sm">Eklenen görsel materyaller</p>
                    </div>
                  </div>
                  <div className="bg-gradient-to-br from-pink-50 to-rose-50 rounded-xl p-6 text-center border border-pink-100">
                    <Camera className="w-12 h-12 text-pink-400 mx-auto mb-3" />
                    <div className="text-slate-700 font-medium mb-1">Fotoğraflar Mevcut</div>
                    <div className="text-slate-500 text-sm">Bu talebe bağlı görsel materyaller bulunmaktadır</div>
                  </div>
                </div>
              )}

              {/* Notes */}
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-violet-100 rounded-xl flex items-center justify-center">
                      <MessageSquare className="w-5 h-5 text-violet-600" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-slate-900">Notlar</h3>
                      <p className="text-slate-500 text-sm">{request.notes.length} not mevcut</p>
                    </div>
                  </div>
                  <Button 
                    className="bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all"
                    onClick={() => setIsAddingNote(true)}
                  >
                    <Edit className="w-4 h-4 mr-2" />
                    Not Ekle
                  </Button>
                </div>
                
                {isAddingNote && (
                  <div className="mb-6 p-4 bg-slate-50 rounded-xl border-2 border-dashed border-slate-300">
                    <Textarea
                      placeholder="Yeni not yazın..."
                      value={newNote}
                      onChange={(e) => setNewNote(e.target.value)}
                      rows={3}
                      className="mb-3 border-slate-200 focus:border-violet-500 focus:ring-violet-500"
                    />
                    <div className="flex gap-2">
                      <Button 
                        onClick={handleAddNote}
                        className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
                      >
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Kaydet
                      </Button>
                      <Button 
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

                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {request.notes.length === 0 ? (
                    <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-xl p-8 text-center border-2 border-dashed border-slate-300">
                      <MessageSquare className="w-12 h-12 text-slate-400 mx-auto mb-3" />
                      <div className="text-slate-600 font-medium mb-1">Henüz not eklenmemiş</div>
                      <div className="text-slate-500 text-sm">İlk notu eklemek için yukarıdaki butonu kullanın</div>
                    </div>
                  ) : (
                    request.notes.map((note, index) => (
                      <div key={index} className="bg-gradient-to-r from-white to-slate-50 border border-slate-200 rounded-xl p-4 hover:shadow-md transition-shadow">
                        <div className="flex items-start gap-3">
                          <div className="w-2 h-2 bg-violet-500 rounded-full mt-2 flex-shrink-0"></div>
                          <p className="text-slate-700 leading-relaxed flex-1">{note}</p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
          </div>

          {/* Right Column - Status History & Actions */}
          <div className="w-full lg:w-80 border-t lg:border-t-0 lg:border-l border-slate-200 px-4 lg:pl-6 py-4 overflow-y-auto bg-slate-50/50">
            <div className="space-y-4">
              {/* Status History */}
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-7 h-7 bg-indigo-100 rounded-lg flex items-center justify-center">
                    <History className="w-3.5 h-3.5 text-indigo-600" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">Durum Geçmişi</h3>
                    <p className="text-slate-500 text-xs">{request.statusHistory.length} güncelleme</p>
                  </div>
                </div>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {request.statusHistory.map((item, index) => (
                    <div key={item.id} className="relative">
                      {index !== request.statusHistory.length - 1 && (
                        <div className="absolute left-4 top-8 w-0.5 h-6 bg-slate-200"></div>
                      )}
                      <div className="flex items-start gap-2 p-2.5 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors">
                        <div className="w-2 h-2 bg-indigo-500 rounded-full mt-1.5 flex-shrink-0"></div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-0.5">
                            <Badge className={`${getStatusColor(item.status)} text-xs px-2 py-0.5`}>
                              {PROJECT_REQUEST_STATUS_LABELS[item.status]}
                            </Badge>
                          </div>
                          <div className="text-xs font-medium text-slate-700 mb-0.5">
                            {item.userName}
                          </div>
                          <div className="text-xs text-slate-500">
                            {formatDate(item.timestamp)}
                          </div>
                          {item.note && (
                            <div className="text-xs mt-1 text-slate-600 bg-white rounded-lg p-1.5 border">
                              {item.note}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Quick Info */}
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-7 h-7 bg-emerald-100 rounded-lg flex items-center justify-center">
                    <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">Hızlı Bilgiler</h3>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between items-center py-1.5 border-b border-slate-100">
                    <span className="text-slate-500 text-xs">Talep No</span>
                    <div className="flex items-center gap-1">
                      <span className="font-mono font-semibold text-slate-900 text-xs">#{request.id}</span>
                      <Button size="sm" variant="ghost" className="h-5 w-5 p-0">
                        <Copy className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                  <div className="flex justify-between items-center py-1.5 border-b border-slate-100">
                    <span className="text-slate-500 text-xs">Oluşturma</span>
                    <span className="text-xs font-medium text-slate-900">{formatDate(request.createdAt)}</span>
                  </div>
                  <div className="flex justify-between items-center py-1.5 border-b border-slate-100">
                    <span className="text-slate-500 text-xs">Güncelleme</span>
                    <span className="text-xs font-medium text-slate-900">{formatDate(request.updatedAt)}</span>
                  </div>
                  {request.estimatedRevenue && (
                    <div className="flex justify-between items-center py-1.5">
                      <span className="text-slate-500 text-xs">Tahmini Gelir</span>
                      <span className="text-xs font-bold text-emerald-600">{formatCurrency(request.estimatedRevenue)}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Estimated Materials */}
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                    <Package className="w-4 h-4 text-orange-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-900">Malzeme Listesi</h3>
                    <p className="text-slate-500 text-xs">Tahmini gereksinimler</p>
                  </div>
                </div>
                <div className="space-y-3 max-h-48 overflow-y-auto">
                  {generateEstimatedMaterials(request.estimatedCapacity, request.projectType).map((material, index) => (
                    <div key={index} className="flex justify-between items-start p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors">
                      <div className="flex-1">
                        <div className="font-semibold text-slate-900 text-sm">{material.name}</div>
                        <div className="text-xs text-slate-500 mt-0.5">{material.description}</div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-slate-900 text-sm">{material.quantity}</div>
                        <div className="text-xs text-slate-500">{material.unit}</div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-4 p-3 bg-amber-50 rounded-xl border border-amber-200">
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                    <div className="text-xs text-amber-700">
                      Bu liste {request.estimatedCapacity}kW kapasiteye göre tahminidir. Kesin malzeme listesi saha ziyareti sonrası oluşturulacaktır.
                    </div>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
                    <Wrench className="w-4 h-4 text-red-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-900">Hızlı İşlemler</h3>
                    <p className="text-slate-500 text-xs">Müşteri etkileşimi</p>
                  </div>
                </div>
                <div className="space-y-3">
                  <Button 
                    className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white shadow-lg hover:shadow-xl transition-all"
                    onClick={() => {
                      window.open(`tel:${request.customerPhone}`)
                    }}
                  >
                    <Phone className="w-4 h-4 mr-2" />
                    Müşteriyi Ara
                  </Button>
                  <Button 
                    className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transition-all"
                    onClick={() => {
                      window.open(`mailto:${request.customerEmail}`)
                    }}
                  >
                    <Mail className="w-4 h-4 mr-2" />
                    E-posta Gönder
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full border-2 border-amber-200 text-amber-700 hover:bg-amber-50 hover:border-amber-300 transition-all"
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
                    className="w-full border-2 border-purple-200 text-purple-700 hover:bg-purple-50 hover:border-purple-300 transition-all"
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
        </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}