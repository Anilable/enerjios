'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Separator } from '@/components/ui/separator'
import { Avatar, AvatarFallback, AvatarInitials } from '@/components/ui/avatar'
import { Switch } from '@/components/ui/switch'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  User, Phone, Mail, MapPin, Building2, Calendar, FileText,
  Edit, Save, X, Plus, MessageSquare, Star, Clock, DollarSign,
  CreditCard, Receipt, Download, Upload, Eye, AlertCircle,
  CheckCircle, History, Camera, QrCode, Printer, Send
} from 'lucide-react'

interface CustomerInfoTabProps {
  project: any
}

// Extended customer data
const customerData = {
  personal: {
    id: 'CUST-001',
    name: 'Mehmet Yılmaz',
    email: 'mehmet@example.com',
    phone: '+90 532 123 4567',
    alternatePhone: '+90 532 987 6543',
    birthDate: '1975-08-15',
    idNumber: '12345678901',
    profession: 'Çiftçi',
    avatar: null
  },
  company: {
    name: 'Yılmaz Çiftliği',
    taxNumber: '1234567890',
    taxOffice: 'Keşan Vergi Dairesi',
    registrationNumber: 'REG-2018-001',
    sector: 'Tarım',
    employeeCount: '10-50',
    establishedYear: 2018
  },
  address: {
    primary: {
      type: 'Proje Adresi',
      street: 'Keşan Yolu Üzeri',
      district: 'Keşan',
      city: 'Edirne',
      postalCode: '22800',
      country: 'Türkiye'
    },
    billing: {
      type: 'Fatura Adresi',
      street: 'Cumhuriyet Mahallesi, Atatürk Cad. No:15',
      district: 'Keşan',
      city: 'Edirne',
      postalCode: '22800',
      country: 'Türkiye'
    }
  },
  preferences: {
    language: 'tr',
    currency: 'TRY',
    timezone: 'Europe/Istanbul',
    communicationChannel: 'email',
    marketingConsent: true,
    dataProcessingConsent: true,
    newsletterSubscription: false
  },
  financial: {
    creditRating: 'A',
    paymentTerms: '30 gün',
    preferredPaymentMethod: 'Banka Havalesi',
    discount: 0,
    vatExempt: false
  }
}

// Communication history
const communicationHistory = [
  {
    id: 'COMM-001',
    type: 'phone',
    subject: 'Kurulum programı görüşmesi',
    date: '2024-12-20',
    time: '14:30',
    duration: '15 dakika',
    notes: 'Müşteri ile kurulum tarihi onaylandı. 22 Aralık sabahı başlanacak.',
    status: 'completed',
    employee: 'Ahmet Kaya'
  },
  {
    id: 'COMM-002',
    type: 'email',
    subject: 'Proje teklifinin onaylanması',
    date: '2024-12-19',
    time: '16:45',
    notes: 'Teklif onaylandı ve sözleşme imzalandı. Ödeme planı: %50 peşin, %50 kurulum sonrası.',
    status: 'completed',
    employee: 'Sistem'
  },
  {
    id: 'COMM-003',
    type: 'site-visit',
    subject: 'Saha incelemesi ve ölçüm',
    date: '2024-12-18',
    time: '10:00',
    duration: '2 saat',
    notes: 'Çatı durumu ve elektrik altyapısı incelendi. Panel yerleşimi planlandı.',
    status: 'completed',
    employee: 'Mehmet Arslan'
  },
  {
    id: 'COMM-004',
    type: 'phone',
    subject: 'İlk görüşme ve bilgi toplama',
    date: '2024-12-17',
    time: '11:20',
    duration: '25 dakika',
    notes: 'Müşteri ihtiyaçları ve bütçesi belirlendi. Saha ziyareti planlandı.',
    status: 'completed',
    employee: 'Elif Özkan'
  }
]

// Documents and contracts
const customerDocuments = [
  {
    id: 'DOC-001',
    name: 'GES Kurulum Sözleşmesi',
    type: 'contract',
    status: 'signed',
    date: '2024-12-19',
    size: '2.1 MB',
    format: 'PDF'
  },
  {
    id: 'DOC-002',
    name: 'Kimlik Fotokopisi',
    type: 'identity',
    status: 'approved',
    date: '2024-12-18',
    size: '856 KB',
    format: 'PDF'
  },
  {
    id: 'DOC-003',
    name: 'Elektrik Faturası',
    type: 'utility',
    status: 'approved',
    date: '2024-12-18',
    size: '1.2 MB',
    format: 'PDF'
  },
  {
    id: 'DOC-004',
    name: 'İmza Beyannamesi',
    type: 'declaration',
    status: 'signed',
    date: '2024-12-19',
    size: '445 KB',
    format: 'PDF'
  }
]

// Payment history
const paymentHistory = [
  {
    id: 'PAY-001',
    amount: 92500,
    description: 'Peşin ödeme (%50)',
    date: '2024-12-19',
    method: 'Banka Havalesi',
    status: 'completed',
    receipt: 'RECEIPT-001.pdf'
  },
  {
    id: 'PAY-002',
    amount: 92500,
    description: 'Kurulum sonrası ödeme (%50)',
    date: '2024-12-24',
    method: 'Banka Havalesi',
    status: 'pending',
    receipt: null
  }
]

const communicationTypeConfig = {
  phone: { label: 'Telefon', icon: Phone, color: 'text-blue-600' },
  email: { label: 'Email', icon: Mail, color: 'text-green-600' },
  'site-visit': { label: 'Saha Ziyareti', icon: MapPin, color: 'text-purple-600' },
  meeting: { label: 'Toplantı', icon: Users, color: 'text-orange-600' }
}

export function CustomerInfoTab({ project }: CustomerInfoTabProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editedData, setEditedData] = useState(customerData)
  const [activeTab, setActiveTab] = useState('profile')
  const [isAddCommunicationOpen, setIsAddCommunicationOpen] = useState(false)

  const handleSave = () => {
    // Save customer data via API
    console.log('Saving customer data:', editedData)
    setIsEditing(false)
  }

  const handleCancel = () => {
    setEditedData(customerData)
    setIsEditing(false)
  }

  return (
    <div className="space-y-6">
      {/* Customer Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16">
                <AvatarFallback className="text-lg">
                  <AvatarInitials name={customerData.personal.name} />
                </AvatarFallback>
              </Avatar>
              <div>
                <h3 className="text-2xl font-bold">{customerData.personal.name}</h3>
                <p className="text-muted-foreground">{customerData.company.name}</p>
                <div className="flex items-center gap-4 mt-2">
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <Phone className="w-4 h-4" />
                    {customerData.personal.phone}
                  </div>
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <Mail className="w-4 h-4" />
                    {customerData.personal.email}
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-green-600 border-green-600">
                <Star className="w-3 h-3 mr-1" />
                Premium Müşteri
              </Badge>
              {isEditing ? (
                <div className="flex gap-2">
                  <Button size="sm" onClick={handleSave}>
                    <Save className="w-4 h-4 mr-2" />
                    Kaydet
                  </Button>
                  <Button size="sm" variant="outline" onClick={handleCancel}>
                    <X className="w-4 h-4 mr-2" />
                    İptal
                  </Button>
                </div>
              ) : (
                <Button size="sm" onClick={() => setIsEditing(true)}>
                  <Edit className="w-4 h-4 mr-2" />
                  Düzenle
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Customer Details Tabs */}
      <Card>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <CardHeader>
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="profile">Kişisel Bilgiler</TabsTrigger>
              <TabsTrigger value="company">Firma Bilgileri</TabsTrigger>
              <TabsTrigger value="communication">İletişim Geçmişi</TabsTrigger>
              <TabsTrigger value="documents">Belgeler</TabsTrigger>
              <TabsTrigger value="financial">Mali Durum</TabsTrigger>
            </TabsList>
          </CardHeader>
          
          <CardContent>
            <TabsContent value="profile" className="space-y-6 mt-6">
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-4">
                  <h4 className="text-lg font-semibold">Kişisel Bilgiler</h4>
                  
                  <div className="grid gap-4">
                    <div>
                      <Label htmlFor="name">Ad Soyad</Label>
                      <Input
                        id="name"
                        value={editedData.personal.name}
                        onChange={(e) => setEditedData({
                          ...editedData,
                          personal: { ...editedData.personal, name: e.target.value }
                        })}
                        disabled={!isEditing}
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="email">Email</Label>
                        <Input
                          id="email"
                          type="email"
                          value={editedData.personal.email}
                          onChange={(e) => setEditedData({
                            ...editedData,
                            personal: { ...editedData.personal, email: e.target.value }
                          })}
                          disabled={!isEditing}
                        />
                      </div>
                      <div>
                        <Label htmlFor="phone">Telefon</Label>
                        <Input
                          id="phone"
                          value={editedData.personal.phone}
                          onChange={(e) => setEditedData({
                            ...editedData,
                            personal: { ...editedData.personal, phone: e.target.value }
                          })}
                          disabled={!isEditing}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="alternatePhone">Alternatif Telefon</Label>
                        <Input
                          id="alternatePhone"
                          value={editedData.personal.alternatePhone}
                          onChange={(e) => setEditedData({
                            ...editedData,
                            personal: { ...editedData.personal, alternatePhone: e.target.value }
                          })}
                          disabled={!isEditing}
                        />
                      </div>
                      <div>
                        <Label htmlFor="profession">Meslek</Label>
                        <Input
                          id="profession"
                          value={editedData.personal.profession}
                          onChange={(e) => setEditedData({
                            ...editedData,
                            personal: { ...editedData.personal, profession: e.target.value }
                          })}
                          disabled={!isEditing}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="birthDate">Doğum Tarihi</Label>
                        <Input
                          id="birthDate"
                          type="date"
                          value={editedData.personal.birthDate}
                          onChange={(e) => setEditedData({
                            ...editedData,
                            personal: { ...editedData.personal, birthDate: e.target.value }
                          })}
                          disabled={!isEditing}
                        />
                      </div>
                      <div>
                        <Label htmlFor="idNumber">TC Kimlik No</Label>
                        <Input
                          id="idNumber"
                          value={editedData.personal.idNumber}
                          onChange={(e) => setEditedData({
                            ...editedData,
                            personal: { ...editedData.personal, idNumber: e.target.value }
                          })}
                          disabled={!isEditing}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="text-lg font-semibold">Adres Bilgileri</h4>
                  
                  {Object.entries(editedData.address).map(([key, address]) => (
                    <div key={key} className="p-4 border rounded-lg space-y-3">
                      <h5 className="font-medium text-sm">{address.type}</h5>
                      <div className="grid gap-3">
                        <div>
                          <Label htmlFor={`${key}-street`}>Adres</Label>
                          <Textarea
                            id={`${key}-street`}
                            value={address.street}
                            onChange={(e) => setEditedData({
                              ...editedData,
                              address: {
                                ...editedData.address,
                                [key]: { ...address, street: e.target.value }
                              }
                            })}
                            disabled={!isEditing}
                            rows={2}
                          />
                        </div>
                        <div className="grid grid-cols-3 gap-3">
                          <div>
                            <Label htmlFor={`${key}-district`}>İlçe</Label>
                            <Input
                              id={`${key}-district`}
                              value={address.district}
                              onChange={(e) => setEditedData({
                                ...editedData,
                                address: {
                                  ...editedData.address,
                                  [key]: { ...address, district: e.target.value }
                                }
                              })}
                              disabled={!isEditing}
                            />
                          </div>
                          <div>
                            <Label htmlFor={`${key}-city`}>İl</Label>
                            <Input
                              id={`${key}-city`}
                              value={address.city}
                              onChange={(e) => setEditedData({
                                ...editedData,
                                address: {
                                  ...editedData.address,
                                  [key]: { ...address, city: e.target.value }
                                }
                              })}
                              disabled={!isEditing}
                            />
                          </div>
                          <div>
                            <Label htmlFor={`${key}-postalCode`}>Posta Kodu</Label>
                            <Input
                              id={`${key}-postalCode`}
                              value={address.postalCode}
                              onChange={(e) => setEditedData({
                                ...editedData,
                                address: {
                                  ...editedData.address,
                                  [key]: { ...address, postalCode: e.target.value }
                                }
                              })}
                              disabled={!isEditing}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h4 className="text-lg font-semibold">Tercihler</h4>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  <div>
                    <Label htmlFor="language">Dil</Label>
                    <Select 
                      value={editedData.preferences.language} 
                      onValueChange={(value) => setEditedData({
                        ...editedData,
                        preferences: { ...editedData.preferences, language: value }
                      })}
                      disabled={!isEditing}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="tr">Türkçe</SelectItem>
                        <SelectItem value="en">English</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="communicationChannel">İletişim Kanalı</Label>
                    <Select
                      value={editedData.preferences.communicationChannel}
                      onValueChange={(value) => setEditedData({
                        ...editedData,
                        preferences: { ...editedData.preferences, communicationChannel: value }
                      })}
                      disabled={!isEditing}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="email">Email</SelectItem>
                        <SelectItem value="phone">Telefon</SelectItem>
                        <SelectItem value="sms">SMS</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="currency">Para Birimi</Label>
                    <Select
                      value={editedData.preferences.currency}
                      onValueChange={(value) => setEditedData({
                        ...editedData,
                        preferences: { ...editedData.preferences, currency: value }
                      })}
                      disabled={!isEditing}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="TRY">₺ Türk Lirası</SelectItem>
                        <SelectItem value="USD">$ ABD Doları</SelectItem>
                        <SelectItem value="EUR">€ Euro</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Pazarlama İzni</Label>
                      <p className="text-sm text-muted-foreground">Pazarlama mesajları alabilir</p>
                    </div>
                    <Switch
                      checked={editedData.preferences.marketingConsent}
                      onCheckedChange={(checked) => setEditedData({
                        ...editedData,
                        preferences: { ...editedData.preferences, marketingConsent: checked }
                      })}
                      disabled={!isEditing}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Bülten Aboneliği</Label>
                      <p className="text-sm text-muted-foreground">Haftalık bülten alabilir</p>
                    </div>
                    <Switch
                      checked={editedData.preferences.newsletterSubscription}
                      onCheckedChange={(checked) => setEditedData({
                        ...editedData,
                        preferences: { ...editedData.preferences, newsletterSubscription: checked }
                      })}
                      disabled={!isEditing}
                    />
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="company" className="space-y-6 mt-6">
              <div className="grid gap-6 md:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Building2 className="h-5 w-5" />
                      Firma Bilgileri
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="companyName">Firma Adı</Label>
                      <Input
                        id="companyName"
                        value={editedData.company.name}
                        onChange={(e) => setEditedData({
                          ...editedData,
                          company: { ...editedData.company, name: e.target.value }
                        })}
                        disabled={!isEditing}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="taxNumber">Vergi Numarası</Label>
                        <Input
                          id="taxNumber"
                          value={editedData.company.taxNumber}
                          onChange={(e) => setEditedData({
                            ...editedData,
                            company: { ...editedData.company, taxNumber: e.target.value }
                          })}
                          disabled={!isEditing}
                        />
                      </div>
                      <div>
                        <Label htmlFor="taxOffice">Vergi Dairesi</Label>
                        <Input
                          id="taxOffice"
                          value={editedData.company.taxOffice}
                          onChange={(e) => setEditedData({
                            ...editedData,
                            company: { ...editedData.company, taxOffice: e.target.value }
                          })}
                          disabled={!isEditing}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="sector">Sektör</Label>
                        <Input
                          id="sector"
                          value={editedData.company.sector}
                          onChange={(e) => setEditedData({
                            ...editedData,
                            company: { ...editedData.company, sector: e.target.value }
                          })}
                          disabled={!isEditing}
                        />
                      </div>
                      <div>
                        <Label htmlFor="establishedYear">Kuruluş Yılı</Label>
                        <Input
                          id="establishedYear"
                          type="number"
                          value={editedData.company.establishedYear}
                          onChange={(e) => setEditedData({
                            ...editedData,
                            company: { ...editedData.company, establishedYear: parseInt(e.target.value) }
                          })}
                          disabled={!isEditing}
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="employeeCount">Çalışan Sayısı</Label>
                      <Select
                        value={editedData.company.employeeCount}
                        onValueChange={(value) => setEditedData({
                          ...editedData,
                          company: { ...editedData.company, employeeCount: value }
                        })}
                        disabled={!isEditing}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1-10">1-10</SelectItem>
                          <SelectItem value="10-50">10-50</SelectItem>
                          <SelectItem value="50-100">50-100</SelectItem>
                          <SelectItem value="100+">100+</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <CreditCard className="h-5 w-5" />
                      Mali Bilgiler
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Kredi Notu</Label>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="default" className="bg-green-600">
                            {editedData.financial.creditRating}
                          </Badge>
                          <span className="text-sm text-muted-foreground">Mükemmel</span>
                        </div>
                      </div>
                      <div>
                        <Label>Ödeme Vadesi</Label>
                        <p className="text-sm mt-1">{editedData.financial.paymentTerms}</p>
                      </div>
                    </div>

                    <div>
                      <Label>Tercih Edilen Ödeme Yöntemi</Label>
                      <p className="text-sm mt-1">{editedData.financial.preferredPaymentMethod}</p>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <Label>KDV Muafiyeti</Label>
                        <p className="text-sm text-muted-foreground">KDV'den muaf durumu</p>
                      </div>
                      <Switch
                        checked={editedData.financial.vatExempt}
                        onCheckedChange={(checked) => setEditedData({
                          ...editedData,
                          financial: { ...editedData.financial, vatExempt: checked }
                        })}
                        disabled={!isEditing}
                      />
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="communication" className="space-y-6 mt-6">
              <div className="flex items-center justify-between">
                <h4 className="text-lg font-semibold">İletişim Geçmişi</h4>
                
                <Dialog open={isAddCommunicationOpen} onOpenChange={setIsAddCommunicationOpen}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="w-4 h-4 mr-2" />
                      Yeni İletişim Ekle
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Yeni İletişim Kaydı</DialogTitle>
                      <DialogDescription>
                        Müşteri ile yapılan iletişimi kaydedin
                      </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label>İletişim Türü</Label>
                          <Select>
                            <SelectTrigger>
                              <SelectValue placeholder="Tür seçin" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="phone">Telefon</SelectItem>
                              <SelectItem value="email">Email</SelectItem>
                              <SelectItem value="site-visit">Saha Ziyareti</SelectItem>
                              <SelectItem value="meeting">Toplantı</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label>Tarih</Label>
                          <Input type="date" />
                        </div>
                      </div>
                      <div>
                        <Label>Konu</Label>
                        <Input placeholder="İletişim konusu" />
                      </div>
                      <div>
                        <Label>Notlar</Label>
                        <Textarea placeholder="Detaylar ve notlar" rows={4} />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setIsAddCommunicationOpen(false)}>
                        İptal
                      </Button>
                      <Button onClick={() => setIsAddCommunicationOpen(false)}>
                        Kaydet
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>

              <div className="space-y-4">
                {communicationHistory.map((comm) => {
                  const typeConfig = communicationTypeConfig[comm.type as keyof typeof communicationTypeConfig]
                  const TypeIcon = typeConfig.icon

                  return (
                    <Card key={comm.id}>
                      <CardContent className="p-4">
                        <div className="flex items-start gap-4">
                          <div className={`p-2 rounded-lg bg-gray-100`}>
                            <TypeIcon className={`w-5 h-5 ${typeConfig.color}`} />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <h5 className="font-medium">{comm.subject}</h5>
                              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Calendar className="w-4 h-4" />
                                {comm.date} {comm.time}
                                {comm.duration && (
                                  <>
                                    <Clock className="w-4 h-4 ml-2" />
                                    {comm.duration}
                                  </>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center gap-2 mt-1 mb-2">
                              <Badge variant="outline" size="sm">
                                {typeConfig.label}
                              </Badge>
                              <Badge variant="secondary" size="sm">
                                {comm.employee}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">{comm.notes}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            </TabsContent>

            <TabsContent value="documents" className="space-y-6 mt-6">
              <div className="flex items-center justify-between">
                <h4 className="text-lg font-semibold">Müşteri Belgeleri</h4>
                <div className="flex gap-2">
                  <Button variant="outline">
                    <Upload className="w-4 h-4 mr-2" />
                    Belge Yükle
                  </Button>
                  <Button variant="outline">
                    <QrCode className="w-4 h-4 mr-2" />
                    QR Kod
                  </Button>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                {customerDocuments.map((doc) => (
                  <Card key={doc.id}>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="p-3 bg-blue-50 rounded-lg">
                          <FileText className="h-6 w-6 text-blue-600" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <h5 className="font-medium">{doc.name}</h5>
                            <Badge variant={
                              doc.status === 'signed' ? 'default' :
                              doc.status === 'approved' ? 'secondary' : 'outline'
                            }>
                              {doc.status === 'signed' ? 'İmzalandı' :
                               doc.status === 'approved' ? 'Onaylandı' :
                               doc.status === 'pending' ? 'Beklemede' : doc.status}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {doc.format} • {doc.size} • {doc.date}
                          </p>
                          <div className="flex gap-2 mt-2">
                            <Button variant="ghost" size="sm">
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="sm">
                              <Download className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="sm">
                              <Send className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="financial" className="space-y-6 mt-6">
              <div className="grid gap-6 md:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <DollarSign className="h-5 w-5" />
                      Ödeme Geçmişi
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {paymentHistory.map((payment) => (
                        <div key={payment.id} className="flex items-center justify-between p-3 border rounded-lg">
                          <div>
                            <p className="font-medium">₺{payment.amount.toLocaleString()}</p>
                            <p className="text-sm text-muted-foreground">{payment.description}</p>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge variant={payment.status === 'completed' ? 'default' : 'outline'}>
                                {payment.status === 'completed' ? 'Tamamlandı' : 'Beklemede'}
                              </Badge>
                              <span className="text-xs text-muted-foreground">
                                {payment.date} • {payment.method}
                              </span>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            {payment.receipt && (
                              <Button variant="ghost" size="sm">
                                <Receipt className="w-4 h-4" />
                              </Button>
                            )}
                            <Button variant="ghost" size="sm">
                              <Download className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Calculator className="h-5 w-5" />
                      Mali Özet
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center p-3 bg-blue-50 rounded-lg">
                        <p className="text-2xl font-bold text-blue-600">₺185K</p>
                        <p className="text-sm text-blue-600 font-medium">Toplam Sözleşme</p>
                      </div>
                      <div className="text-center p-3 bg-green-50 rounded-lg">
                        <p className="text-2xl font-bold text-green-600">₺92.5K</p>
                        <p className="text-sm text-green-600 font-medium">Ödenen Tutar</p>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Kalan Bakiye:</span>
                        <span className="font-medium">₺92,500</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Son Ödeme:</span>
                        <span className="font-medium">24 Ara 2024</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Ödeme Durumu:</span>
                        <Badge variant="secondary">Zamanında</Badge>
                      </div>
                    </div>

                    <Separator />

                    <div className="space-y-2">
                      <Button variant="outline" className="w-full justify-start">
                        <Receipt className="w-4 h-4 mr-2" />
                        Fatura Oluştur
                      </Button>
                      <Button variant="outline" className="w-full justify-start">
                        <Send className="w-4 h-4 mr-2" />
                        Ödeme Hatırlatması Gönder
                      </Button>
                      <Button variant="outline" className="w-full justify-start">
                        <History className="w-4 h-4 mr-2" />
                        Tüm İşlem Geçmişi
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </CardContent>
        </Tabs>
      </Card>
    </div>
  )
}