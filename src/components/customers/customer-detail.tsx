'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { 
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  FileText,
  MessageSquare,
  TrendingUp,
  Edit,
  ArrowLeft,
  Plus,
  Send,
  Clock,
  Target,
  Zap,
  Building,
  Tag,
  FolderKanban,
  ExternalLink
} from 'lucide-react'
import type { CustomerData } from '@/app/dashboard/customers/page'
import { ProjectRequestAPI } from '@/lib/api/project-requests'
import { ProjectRequest, PROJECT_REQUEST_STATUS_LABELS } from '@/types/project-request'
import { ProjectRequestButton } from '@/components/admin/project-request-button'

interface CustomerDetailProps {
  customer: CustomerData
  onEdit: () => void
  onClose: () => void
}

export function CustomerDetail({ customer, onEdit, onClose }: CustomerDetailProps) {
  const [activeTab, setActiveTab] = useState('overview')
  const [projectRequests, setProjectRequests] = useState<ProjectRequest[]>([])
  const [loadingRequests, setLoadingRequests] = useState(false)
  const [newInteraction, setNewInteraction] = useState({
    type: 'NOTE' as const,
    subject: '',
    description: ''
  })

  // Fetch project requests for this customer
  useEffect(() => {
    const fetchProjectRequests = async () => {
      try {
        setLoadingRequests(true)
        // Fetch all project requests and filter by customer email
        // Since we might not have customerId always, we can match by email
        const allRequests = await ProjectRequestAPI.getAll()
        const customerRequests = allRequests.filter(
          req => req.customerEmail === customer.email || req.customerId === customer.id
        )
        setProjectRequests(customerRequests)
      } catch (error) {
        console.error('Error fetching project requests:', error)
      } finally {
        setLoadingRequests(false)
      }
    }

    fetchProjectRequests()
  }, [customer.email, customer.id])

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('tr-TR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date)
  }

  const getStatusColor = (status: CustomerData['status']) => {
    switch (status) {
      case 'LEAD': return 'bg-gray-100 text-gray-800'
      case 'QUALIFIED': return 'bg-blue-100 text-blue-800'
      case 'PROPOSAL_SENT': return 'bg-yellow-100 text-yellow-800'
      case 'NEGOTIATION': return 'bg-orange-100 text-orange-800'
      case 'CUSTOMER': return 'bg-green-100 text-green-800'
      case 'LOST': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusLabel = (status: CustomerData['status']) => {
    switch (status) {
      case 'LEAD': return 'Potansiyel'
      case 'QUALIFIED': return 'Nitelikli'
      case 'PROPOSAL_SENT': return 'Teklif Gönderildi'
      case 'NEGOTIATION': return 'Müzakere'
      case 'CUSTOMER': return 'Müşteri'
      case 'LOST': return 'Kaybedildi'
      default: return 'Bilinmiyor'
    }
  }

  const getInteractionIcon = (type: string) => {
    switch (type) {
      case 'CALL': return Phone
      case 'EMAIL': return Mail
      case 'MEETING': return Calendar
      case 'NOTE': return MessageSquare
      case 'QUOTE_SENT': return FileText
      case 'FOLLOW_UP': return Clock
      default: return MessageSquare
    }
  }

  const getInteractionColor = (type: string) => {
    switch (type) {
      case 'CALL': return 'text-blue-600'
      case 'EMAIL': return 'text-green-600'
      case 'MEETING': return 'text-purple-600'
      case 'NOTE': return 'text-gray-600'
      case 'QUOTE_SENT': return 'text-orange-600'
      case 'FOLLOW_UP': return 'text-yellow-600'
      default: return 'text-gray-600'
    }
  }

  const getDaysSinceContact = (date: Date) => {
    const today = new Date()
    const contactDate = new Date(date)
    const diffTime = Math.abs(today.getTime() - contactDate.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  const handleAddInteraction = () => {
    if (!newInteraction.subject || !newInteraction.description) return
    
    // In a real app, this would save to the database
    console.log('Adding interaction:', newInteraction)
    
    // Reset form
    setNewInteraction({
      type: 'NOTE',
      subject: '',
      description: ''
    })
  }

  const daysSinceContact = getDaysSinceContact(customer.lastContact)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="outline" size="sm" onClick={onClose}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Geri
          </Button>
          
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              {customer.fullName}
              {customer.companyName && (
                <span className="text-lg text-gray-600 font-normal ml-2">
                  - {customer.companyName}
                </span>
              )}
            </h2>
            <div className="flex items-center space-x-2 mt-1">
              <Badge className={`${getStatusColor(customer.status)} border-0`}>
                {getStatusLabel(customer.status)}
              </Badge>
              <Badge variant="outline" className="text-xs">
                {customer.assignedTo}
              </Badge>
              {daysSinceContact > 7 && customer.status !== 'CUSTOMER' && (
                <Badge variant="destructive" className="text-xs">
                  {daysSinceContact} gün önce iletişim
                </Badge>
              )}
            </div>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm">
            <Phone className="w-4 h-4 mr-2" />
            Ara
          </Button>
          <Button variant="outline" size="sm">
            <Mail className="w-4 h-4 mr-2" />
            Email Gönder
          </Button>
          <Button variant="outline" size="sm">
            <FileText className="w-4 h-4 mr-2" />
            Teklif Oluştur
          </Button>
          <Button onClick={onEdit}>
            <Edit className="w-4 h-4 mr-2" />
            Düzenle
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Genel Bakış</TabsTrigger>
          <TabsTrigger value="interactions">İletişim Geçmişi</TabsTrigger>
          <TabsTrigger value="quotes">Teklifler</TabsTrigger>
          <TabsTrigger value="projectRequests">Proje Talepleri</TabsTrigger>
          <TabsTrigger value="projects">Projeler</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Contact Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <User className="w-5 h-5 mr-2" />
                  İletişim Bilgileri
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Mail className="w-4 h-4 text-gray-400" />
                  <div>
                    <div className="font-medium">{customer.email}</div>
                    <Button variant="link" size="sm" className="p-0 h-auto text-xs text-primary">
                      Email Gönder
                    </Button>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Phone className="w-4 h-4 text-gray-400" />
                  <div>
                    <div className="font-medium">{customer.phone}</div>
                    <Button variant="link" size="sm" className="p-0 h-auto text-xs text-primary">
                      Ara
                    </Button>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <MapPin className="w-4 h-4 text-gray-400" />
                  <div>
                    <div className="font-medium">{customer.city}, {customer.district}</div>
                    <div className="text-sm text-gray-600">{customer.address}</div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  <div>
                    <div className="text-sm text-gray-600">Son İletişim</div>
                    <div className="font-medium">{formatDate(customer.lastContact)}</div>
                  </div>
                </div>

                {customer.companyName && (
                  <div className="flex items-center space-x-2">
                    <Building className="w-4 h-4 text-gray-400" />
                    <div>
                      <div className="font-medium">{customer.companyName}</div>
                      {customer.taxNumber && (
                        <div className="text-sm text-gray-600">VN: {customer.taxNumber}</div>
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Lead Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Target className="w-5 h-5 mr-2" />
                  Proje Detayları
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <div className="text-gray-600">Bütçe</div>
                    <div className="font-semibold text-green-600">
                      ₺{customer.leadInfo.estimatedBudget.toLocaleString()}
                    </div>
                  </div>
                  <div>
                    <div className="text-gray-600">Sistem Boyutu</div>
                    <div className="font-medium">{customer.leadInfo.projectSize}</div>
                  </div>
                  <div>
                    <div className="text-gray-600">Zaman Çizelgesi</div>
                    <div className="font-medium">{customer.leadInfo.timeline}</div>
                  </div>
                  <div>
                    <div className="text-gray-600">Aylık Fatura</div>
                    <div className="font-medium">₺{customer.leadInfo.electricityBill}</div>
                  </div>
                  <div>
                    <div className="text-gray-600">Mülk Tipi</div>
                    <div className="font-medium">{customer.leadInfo.propertyType}</div>
                  </div>
                  <div>
                    <div className="text-gray-600">Çatı Tipi</div>
                    <div className="font-medium">{customer.leadInfo.roofType}</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Summary Stats */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <TrendingUp className="w-5 h-5 mr-2" />
                  Özet İstatistikler
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-1 gap-3">
                  <div className="bg-blue-50 rounded-lg p-3 text-center">
                    <div className="text-2xl font-bold text-blue-600">{customer.quotes.length}</div>
                    <div className="text-sm text-blue-800">Gönderilen Teklif</div>
                  </div>
                  
                  <div className="bg-green-50 rounded-lg p-3 text-center">
                    <div className="text-2xl font-bold text-green-600">
                      ₺{customer.quotes.reduce((sum, q) => sum + q.total, 0).toLocaleString()}
                    </div>
                    <div className="text-sm text-green-800">Toplam Teklif Değeri</div>
                  </div>
                  
                  <div className="bg-orange-50 rounded-lg p-3 text-center">
                    <div className="text-2xl font-bold text-orange-600">{customer.interactions.length}</div>
                    <div className="text-sm text-orange-800">İletişim Sayısı</div>
                  </div>
                  
                  <div className="bg-purple-50 rounded-lg p-3 text-center">
                    <div className="text-2xl font-bold text-purple-600">{customer.projects.length}</div>
                    <div className="text-sm text-purple-800">Aktif Proje</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Tags and Notes */}
          <div className="grid lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Tag className="w-5 h-5 mr-2" />
                  Etiketler
                </CardTitle>
              </CardHeader>
              <CardContent>
                {customer.tags.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {customer.tags.map(tag => (
                      <Badge key={tag} variant="secondary">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">Henüz etiket eklenmemiş</p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <MessageSquare className="w-5 h-5 mr-2" />
                  Notlar
                </CardTitle>
              </CardHeader>
              <CardContent>
                {customer.notes ? (
                  <p className="text-sm text-gray-700">{customer.notes}</p>
                ) : (
                  <p className="text-sm text-gray-500">Henüz not eklenmemiş</p>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Interactions Tab */}
        <TabsContent value="interactions" className="space-y-6">
          {/* Add New Interaction */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Plus className="w-5 h-5 mr-2" />
                Yeni İletişim Ekle
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <Select 
                    value={newInteraction.type} 
                    onValueChange={(value: any) => setNewInteraction(prev => ({ ...prev, type: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="CALL">Telefon Görüşmesi</SelectItem>
                      <SelectItem value="EMAIL">Email</SelectItem>
                      <SelectItem value="MEETING">Toplantı</SelectItem>
                      <SelectItem value="NOTE">Not</SelectItem>
                      <SelectItem value="QUOTE_SENT">Teklif Gönderimi</SelectItem>
                      <SelectItem value="FOLLOW_UP">Takip</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="md:col-span-2">
                  <Input
                    placeholder="Konu"
                    value={newInteraction.subject}
                    onChange={(e) => setNewInteraction(prev => ({ ...prev, subject: e.target.value }))}
                  />
                </div>
              </div>
              
              <Textarea
                placeholder="Detaylı açıklama..."
                rows={3}
                value={newInteraction.description}
                onChange={(e) => setNewInteraction(prev => ({ ...prev, description: e.target.value }))}
              />
              
              <Button onClick={handleAddInteraction} disabled={!newInteraction.subject || !newInteraction.description}>
                <Plus className="w-4 h-4 mr-2" />
                İletişim Ekle
              </Button>
            </CardContent>
          </Card>

          {/* Interaction History */}
          <Card>
            <CardHeader>
              <CardTitle>İletişim Geçmişi</CardTitle>
            </CardHeader>
            <CardContent>
              {customer.interactions.length > 0 ? (
                <div className="space-y-4">
                  {customer.interactions.map((interaction) => {
                    const Icon = getInteractionIcon(interaction.type)
                    return (
                      <div key={interaction.id} className="border-l-2 border-gray-200 pl-4 relative">
                        <div className="absolute -left-2 top-1 bg-white border-2 border-gray-300 rounded-full p-1">
                          <Icon className={`w-3 h-3 ${getInteractionColor(interaction.type)}`} />
                        </div>
                        
                        <div className="space-y-1">
                          <div className="flex items-center justify-between">
                            <h4 className="font-medium">{interaction.subject}</h4>
                            <span className="text-xs text-gray-500">
                              {formatDate(interaction.date)}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600">{interaction.description}</p>
                          <div className="text-xs text-gray-500">
                            {interaction.userName} tarafından eklendi
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              ) : (
                <p className="text-sm text-gray-500 text-center py-8">
                  Henüz iletişim kaydı bulunmuyor
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Quotes Tab */}
        <TabsContent value="quotes" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Teklifler</span>
                <Button size="sm">
                  <Plus className="w-4 h-4 mr-2" />
                  Yeni Teklif
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {customer.quotes.length > 0 ? (
                <div className="space-y-3">
                  {customer.quotes.map((quote) => (
                    <div key={quote.id} className="border rounded-lg p-4 hover:shadow-sm transition-shadow">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium">{quote.quoteNumber}</h4>
                          <p className="text-sm text-gray-600">
                            {formatDate(quote.createdAt)}
                          </p>
                        </div>
                        <div className="text-right">
                          <div className="font-semibold">₺{quote.total.toLocaleString()}</div>
                          <Badge variant="secondary" className="text-xs">
                            {quote.status}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500 text-center py-8">
                  Henüz teklif oluşturulmamış
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Project Requests Tab */}
        <TabsContent value="projectRequests" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center">
                  <FolderKanban className="w-5 h-5 mr-2" />
                  Proje Talepleri
                </span>
                <ProjectRequestButton
                  customerId={customer.id}
                  customerName={customer.fullName}
                  customerEmail={customer.email}
                  customerPhone={customer.phone}
                  customerAddress={customer.address}
                  customerCity={customer.city}
                  trigger={
                    <Button size="sm">
                      <Plus className="w-4 h-4 mr-2" />
                      Yeni Talep
                    </Button>
                  }
                />
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loadingRequests ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  <span className="ml-2 text-sm text-gray-600">Yükleniyor...</span>
                </div>
              ) : projectRequests.length > 0 ? (
                <div className="space-y-3">
                  {projectRequests.map((request) => (
                    <div key={request.id} className="border rounded-lg p-4 hover:shadow-sm transition-shadow">
                      <div className="flex items-start justify-between">
                        <div className="flex-1 space-y-2">
                          <div className="flex items-center justify-between">
                            <h4 className="font-medium">
                              #{request.id.slice(-6)} - {request.projectType}
                            </h4>
                            <div className="flex items-center space-x-2">
                              <Badge 
                                variant="outline" 
                                className={`text-xs ${
                                  request.status === 'OPEN' ? 'border-blue-500 text-blue-600' :
                                  request.status === 'CONTACTED' ? 'border-purple-500 text-purple-600' :
                                  request.status === 'ASSIGNED' ? 'border-orange-500 text-orange-600' :
                                  request.status === 'SITE_VISIT' ? 'border-yellow-500 text-yellow-600' :
                                  request.status === 'CONVERTED_TO_PROJECT' ? 'border-green-500 text-green-600' :
                                  'border-red-500 text-red-600'
                                }`}
                              >
                                {PROJECT_REQUEST_STATUS_LABELS[request.status]}
                              </Badge>
                              <Badge 
                                variant="outline" 
                                className={`text-xs ${
                                  request.priority === 'HIGH' ? 'border-red-500 text-red-600' :
                                  request.priority === 'MEDIUM' ? 'border-yellow-500 text-yellow-600' :
                                  'border-green-500 text-green-600'
                                }`}
                              >
                                {request.priority === 'HIGH' ? 'Yüksek' : 
                                 request.priority === 'MEDIUM' ? 'Orta' : 'Düşük'}
                              </Badge>
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                            <div>
                              <span className="text-gray-600">Kapasite:</span>
                              <span className="ml-1 font-medium">{request.estimatedCapacity} kW</span>
                            </div>
                            {request.estimatedBudget && (
                              <div>
                                <span className="text-gray-600">Bütçe:</span>
                                <span className="ml-1 font-medium">₺{request.estimatedBudget.toLocaleString()}</span>
                              </div>
                            )}
                            <div>
                              <span className="text-gray-600">Kaynak:</span>
                              <span className="ml-1 font-medium">{request.source}</span>
                            </div>
                            <div>
                              <span className="text-gray-600">Tarih:</span>
                              <span className="ml-1 font-medium">
                                {new Date(request.createdAt).toLocaleDateString('tr-TR')}
                              </span>
                            </div>
                          </div>
                          
                          {request.description && (
                            <p className="text-sm text-gray-600 line-clamp-2">
                              {request.description}
                            </p>
                          )}
                          
                          {request.tags && request.tags.length > 0 && (
                            <div className="flex items-center space-x-1">
                              <Tag className="w-3 h-3 text-gray-400" />
                              {request.tags.map((tag, index) => (
                                <Badge key={index} variant="secondary" className="text-xs">
                                  {tag}
                                </Badge>
                              ))}
                            </div>
                          )}
                        </div>
                        
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => window.location.href = '/dashboard/project-requests'}
                        >
                          <ExternalLink className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <FolderKanban className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-500 mb-4">
                    Bu müşteri için henüz proje talebi oluşturulmamış
                  </p>
                  <ProjectRequestButton
                    customerId={customer.id}
                    customerName={customer.fullName}
                    customerEmail={customer.email}
                    customerPhone={customer.phone}
                    customerAddress={customer.address}
                    customerCity={customer.city}
                    trigger={
                      <Button size="sm" variant="outline">
                        <Plus className="w-4 h-4 mr-2" />
                        İlk Talebi Oluştur
                      </Button>
                    }
                  />
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Projects Tab */}
        <TabsContent value="projects" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Projeler</CardTitle>
            </CardHeader>
            <CardContent>
              {customer.projects.length > 0 ? (
                <div className="space-y-3">
                  {customer.projects.map((project) => (
                    <div key={project.id} className="border rounded-lg p-4 hover:shadow-sm transition-shadow">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium">{project.projectName}</h4>
                          <p className="text-sm text-gray-600">
                            Başlama: {formatDate(project.startDate)}
                          </p>
                        </div>
                        <Badge variant="outline">
                          {project.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500 text-center py-8">
                  Henüz proje bulunmuyor
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}