'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Separator } from '@/components/ui/separator'
import {
  MapPin,
  Sun,
  Box,
  Zap,
  Phone,
  Mail,
  Building,
  Calendar,
  TrendingUp,
  Eye,
  MessageSquare,
  Download,
  Clock,
  AlertCircle,
  CheckCircle,
  User,
  Calculator,
  FileText,
  Map as MapIcon
} from 'lucide-react'

interface QuoteLead {
  id: string
  customerName: string
  customerEmail: string
  customerPhone: string
  customerCompany?: string
  location: string
  latitude?: number
  longitude?: number
  projectType: string
  propertyType: string
  installationType: string
  systemSize: number
  panelCount: number
  roofArea: number
  usableArea: number
  estimatedProduction: number
  estimatedInvestment: number
  solarIrradiance: number
  urgency: string
  financingNeeded: boolean
  message?: string
  source: string
  status: string
  createdAt: string
  designData?: any
  roofDrawing?: any
  panelLayout?: any
}

export function CompanyQuoteLeads() {
  const [leads, setLeads] = useState<QuoteLead[]>([])
  const [selectedLead, setSelectedLead] = useState<QuoteLead | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('new')

  useEffect(() => {
    fetchQuoteLeads()
  }, [])

  const fetchQuoteLeads = async () => {
    try {
      const response = await fetch('/api/quotes/company-leads')
      const data = await response.json()
      setLeads(data.leads || [])
    } catch (error) {
      console.error('Error fetching quote leads:', error)
    } finally {
      setLoading(false)
    }
  }

  const getUrgencyBadge = (urgency: string) => {
    switch (urgency) {
      case 'urgent':
        return <Badge variant="destructive">Acil</Badge>
      case 'normal':
        return <Badge variant="secondary">Normal</Badge>
      case 'planning':
        return <Badge variant="outline">Planlama</Badge>
      default:
        return null
    }
  }

  const getSourceBadge = (source: string) => {
    switch (source) {
      case 'DESIGNER_3D':
        return (
          <Badge className="bg-gradient-to-r from-primary to-blue-600 text-white">
            <Box className="w-3 h-3 mr-1" />
            3D Tasarım
          </Badge>
        )
      case 'CALCULATOR':
        return (
          <Badge variant="secondary">
            <Calculator className="w-3 h-3 mr-1" />
            Hesaplayıcı
          </Badge>
        )
      default:
        return <Badge variant="outline">{source}</Badge>
    }
  }

  const filteredLeads = leads.filter(lead => {
    switch (activeTab) {
      case 'new':
        return lead.status === 'PENDING'
      case 'contacted':
        return lead.status === 'CONTACTED'
      case 'quoted':
        return lead.status === 'QUOTED'
      case 'won':
        return lead.status === 'WON'
      default:
        return true
    }
  })

  const markAsViewed = async (leadId: string) => {
    try {
      await fetch(`/api/quotes/company-leads/${leadId}/view`, {
        method: 'POST'
      })
    } catch (error) {
      console.error('Error marking lead as viewed:', error)
    }
  }

  const downloadDesignData = (lead: QuoteLead) => {
    const data = {
      customer: {
        name: lead.customerName,
        email: lead.customerEmail,
        phone: lead.customerPhone,
        company: lead.customerCompany
      },
      project: {
        type: lead.projectType,
        property: lead.propertyType,
        installation: lead.installationType,
        location: lead.location,
        coordinates: {
          lat: lead.latitude,
          lng: lead.longitude
        }
      },
      technical: {
        systemSize: lead.systemSize,
        panelCount: lead.panelCount,
        roofArea: lead.roofArea,
        usableArea: lead.usableArea,
        estimatedProduction: lead.estimatedProduction,
        solarIrradiance: lead.solarIrradiance
      },
      design: JSON.parse(lead.designData || '{}'),
      roofDrawing: JSON.parse(lead.roofDrawing || '[]'),
      panelLayout: JSON.parse(lead.panelLayout || '[]')
    }

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `lead-${lead.id}-design.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Teklif Talepleri</CardTitle>
          <CardDescription>
            3D Designer ve hesaplayıcıdan gelen teklif talepleri
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="new">
                Yeni ({leads.filter(l => l.status === 'PENDING').length})
              </TabsTrigger>
              <TabsTrigger value="contacted">
                İletişimde ({leads.filter(l => l.status === 'CONTACTED').length})
              </TabsTrigger>
              <TabsTrigger value="quoted">
                Teklif Verildi ({leads.filter(l => l.status === 'QUOTED').length})
              </TabsTrigger>
              <TabsTrigger value="won">
                Kazanılan ({leads.filter(l => l.status === 'WON').length})
              </TabsTrigger>
              <TabsTrigger value="all">
                Tümü ({leads.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value={activeTab} className="mt-6">
              <ScrollArea className="h-[600px]">
                <div className="space-y-4">
                  {filteredLeads.map((lead) => (
                    <Card
                      key={lead.id}
                      className="cursor-pointer hover:shadow-md transition-shadow"
                      onClick={() => {
                        setSelectedLead(lead)
                        markAsViewed(lead.id)
                      }}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-start gap-3">
                            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                              {lead.source === 'DESIGNER_3D' ? (
                                <Box className="w-5 h-5 text-primary" />
                              ) : (
                                <Calculator className="w-5 h-5 text-primary" />
                              )}
                            </div>
                            <div>
                              <h4 className="font-semibold flex items-center gap-2">
                                {lead.customerName}
                                {getUrgencyBadge(lead.urgency)}
                              </h4>
                              <div className="flex items-center gap-4 text-sm text-gray-600 mt-1">
                                <span className="flex items-center gap-1">
                                  <MapPin className="w-3 h-3" />
                                  {lead.location}
                                </span>
                                <span className="flex items-center gap-1">
                                  <Clock className="w-3 h-3" />
                                  {new Date(lead.createdAt).toLocaleDateString('tr-TR')}
                                </span>
                              </div>
                            </div>
                          </div>
                          {getSourceBadge(lead.source)}
                        </div>

                        <div className="grid grid-cols-4 gap-4 mt-4">
                          <div className="bg-gray-50 rounded-lg p-3">
                            <div className="text-sm text-gray-600">Sistem</div>
                            <div className="font-semibold">{lead.systemSize} kW</div>
                          </div>
                          <div className="bg-gray-50 rounded-lg p-3">
                            <div className="text-sm text-gray-600">Panel</div>
                            <div className="font-semibold">{lead.panelCount} adet</div>
                          </div>
                          <div className="bg-gray-50 rounded-lg p-3">
                            <div className="text-sm text-gray-600">Çatı Alanı</div>
                            <div className="font-semibold">{lead.roofArea} m²</div>
                          </div>
                          <div className="bg-gray-50 rounded-lg p-3">
                            <div className="text-sm text-gray-600">Üretim</div>
                            <div className="font-semibold">{(lead.estimatedProduction / 1000).toFixed(0)}k kWh</div>
                          </div>
                        </div>

                        {lead.source === 'DESIGNER_3D' && (
                          <div className="flex items-center gap-2 mt-3 p-2 bg-blue-50 rounded-lg">
                            <Box className="w-4 h-4 text-blue-600" />
                            <span className="text-sm text-blue-800">
                              Detaylı 3D tasarım ve çatı çizimi mevcut
                            </span>
                          </div>
                        )}

                        <div className="flex items-center gap-2 mt-3">
                          <Button size="sm" variant="outline" onClick={(e) => {
                            e.stopPropagation()
                            window.location.href = `tel:${lead.customerPhone}`
                          }}>
                            <Phone className="w-3 h-3 mr-1" />
                            Ara
                          </Button>
                          <Button size="sm" variant="outline" onClick={(e) => {
                            e.stopPropagation()
                            window.location.href = `mailto:${lead.customerEmail}`
                          }}>
                            <Mail className="w-3 h-3 mr-1" />
                            E-posta
                          </Button>
                          {lead.source === 'DESIGNER_3D' && (
                            <Button size="sm" variant="outline" onClick={(e) => {
                              e.stopPropagation()
                              downloadDesignData(lead)
                            }}>
                              <Download className="w-3 h-3 mr-1" />
                              Tasarımı İndir
                            </Button>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </ScrollArea>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Lead Detail Modal */}
      {selectedLead && (
        <Dialog open={!!selectedLead} onOpenChange={() => setSelectedLead(null)}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <User className="w-5 h-5" />
                  {selectedLead.customerName}
                </span>
                <div className="flex gap-2">
                  {getUrgencyBadge(selectedLead.urgency)}
                  {getSourceBadge(selectedLead.source)}
                </div>
              </DialogTitle>
              <DialogDescription>
                Teklif Talebi Detayları - {new Date(selectedLead.createdAt).toLocaleString('tr-TR')}
              </DialogDescription>
            </DialogHeader>

            <div className="grid grid-cols-2 gap-6 mt-6">
              {/* Customer Information */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Müşteri Bilgileri</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Ad Soyad:</span>
                    <span className="font-medium">{selectedLead.customerName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Telefon:</span>
                    <a href={`tel:${selectedLead.customerPhone}`} className="font-medium text-primary hover:underline">
                      {selectedLead.customerPhone}
                    </a>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">E-posta:</span>
                    <a href={`mailto:${selectedLead.customerEmail}`} className="font-medium text-primary hover:underline">
                      {selectedLead.customerEmail}
                    </a>
                  </div>
                  {selectedLead.customerCompany && (
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Firma:</span>
                      <span className="font-medium">{selectedLead.customerCompany}</span>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Project Information */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Proje Bilgileri</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Proje Tipi:</span>
                    <span className="font-medium capitalize">{selectedLead.projectType}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Mülk Tipi:</span>
                    <span className="font-medium">{selectedLead.propertyType}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Kurulum:</span>
                    <span className="font-medium">{selectedLead.installationType}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Finansman:</span>
                    <span className="font-medium">
                      {selectedLead.financingNeeded ? (
                        <Badge variant="secondary">İsteniyor</Badge>
                      ) : (
                        'Gerek yok'
                      )}
                    </span>
                  </div>
                </CardContent>
              </Card>

              {/* Location Information */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    Konum Bilgileri
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Adres:</span>
                    <span className="font-medium text-right">{selectedLead.location}</span>
                  </div>
                  {selectedLead.latitude && selectedLead.longitude && (
                    <>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Koordinatlar:</span>
                        <span className="font-medium">
                          {selectedLead.latitude.toFixed(6)}, {selectedLead.longitude.toFixed(6)}
                        </span>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        className="w-full mt-2"
                        onClick={() => {
                          window.open(
                            `https://www.google.com/maps?q=${selectedLead.latitude},${selectedLead.longitude}`,
                            '_blank'
                          )
                        }}
                      >
                        <MapIcon className="w-3 h-3 mr-1" />
                        Haritada Göster
                      </Button>
                    </>
                  )}
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Güneşlenme:</span>
                    <span className="font-medium">{selectedLead.solarIrradiance} kWh/m²/yıl</span>
                  </div>
                </CardContent>
              </Card>

              {/* Technical Details */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Zap className="w-4 h-4" />
                    Teknik Detaylar
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Sistem Gücü:</span>
                    <span className="font-medium">{selectedLead.systemSize} kW</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Panel Sayısı:</span>
                    <span className="font-medium">{selectedLead.panelCount} adet</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Çatı Alanı:</span>
                    <span className="font-medium">{selectedLead.roofArea} m²</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Kullanılabilir Alan:</span>
                    <span className="font-medium">{selectedLead.usableArea} m²</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Yıllık Üretim:</span>
                    <span className="font-medium">{selectedLead.estimatedProduction.toLocaleString()} kWh</span>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Message */}
            {selectedLead.message && (
              <Card className="mt-6">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <MessageSquare className="w-4 h-4" />
                    Müşteri Notu
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-700">{selectedLead.message}</p>
                </CardContent>
              </Card>
            )}

            {/* 3D Design Data */}
            {selectedLead.source === 'DESIGNER_3D' && selectedLead.designData && (
              <Card className="mt-6">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Box className="w-4 h-4" />
                    3D Tasarım Verileri
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="bg-gradient-to-r from-primary/10 to-blue-500/10 rounded-lg p-4">
                    <p className="text-sm text-gray-700 mb-3">
                      Bu teklif talebi 3D Designer ile oluşturulmuş detaylı çatı çizimi ve panel yerleşimi içermektedir.
                    </p>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={() => downloadDesignData(selectedLead)}
                      >
                        <Download className="w-4 h-4 mr-2" />
                        Tasarım Verilerini İndir
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          window.open('/dashboard/designer', '_blank')
                        }}
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        Designer'da Görüntüle
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            <Separator className="my-6" />

            {/* Action Buttons */}
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setSelectedLead(null)}>
                Kapat
              </Button>
              <Button onClick={() => window.location.href = `mailto:${selectedLead.customerEmail}`}>
                <Mail className="w-4 h-4 mr-2" />
                E-posta Gönder
              </Button>
              <Button variant="default" onClick={() => window.location.href = `tel:${selectedLead.customerPhone}`}>
                <Phone className="w-4 h-4 mr-2" />
                Müşteriyi Ara
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}