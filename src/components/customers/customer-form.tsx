'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Textarea } from '@/components/ui/textarea'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { useEmail } from '@/hooks/use-email'
import { useToast } from '@/hooks/use-toast'
import {
  User,
  Building,
  MapPin,
  Target,
  Tag,
  Save,
  X,
  Plus,
  Check,
  ChevronsUpDown
} from 'lucide-react'
import type { CustomerData } from '@/app/dashboard/customers/page'

interface CustomerFormProps {
  customer: CustomerData | null
  onSave: (customer: CustomerData) => void
  onCancel: () => void
}

export function CustomerForm({ customer, onSave, onCancel }: CustomerFormProps) {
  const { sendCustomerWelcome, sending } = useEmail()
  const { toast } = useToast()
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    district: '',
    customerType: 'INDIVIDUAL' as CustomerData['customerType'],
    leadSource: 'WEBSITE' as CustomerData['leadSource'],
    status: 'LEAD' as CustomerData['status'],
    priority: 'MEDIUM' as CustomerData['priority'],
    assignedTo: 'Mehmet Özkan',
    notes: '',
    companyName: '',
    taxNumber: '',
    
    // Lead Information
    estimatedBudget: 0,
    projectSize: '',
    timeline: '',
    electricityBill: 0,
    roofType: '',
    hasRoof: true,
    propertyType: ''
  })

  const [tags, setTags] = useState<string[]>([])
  const [newTag, setNewTag] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [cityOpen, setCityOpen] = useState(false)

  // Load existing customer data
  useEffect(() => {
    if (customer) {
      setFormData({
        firstName: customer.firstName,
        lastName: customer.lastName,
        email: customer.email,
        phone: customer.phone,
        address: customer.address,
        city: customer.city,
        district: customer.district,
        customerType: customer.customerType,
        leadSource: customer.leadSource,
        status: customer.status,
        priority: customer.priority,
        assignedTo: customer.assignedTo,
        notes: customer.notes,
        companyName: customer.companyName || '',
        taxNumber: customer.taxNumber || '',
        estimatedBudget: customer.leadInfo.estimatedBudget,
        projectSize: customer.leadInfo.projectSize,
        timeline: customer.leadInfo.timeline,
        electricityBill: customer.leadInfo.electricityBill,
        roofType: customer.leadInfo.roofType,
        hasRoof: customer.leadInfo.hasRoof,
        propertyType: customer.leadInfo.propertyType
      })
      setTags(customer.tags)
    }
  }, [customer])

  const cities = [
    'Adana', 'Adıyaman', 'Afyonkarahisar', 'Ağrı', 'Amasya', 'Ankara', 'Antalya', 'Artvin',
    'Aydın', 'Balıkesir', 'Bilecik', 'Bingöl', 'Bitlis', 'Bolu', 'Burdur', 'Bursa',
    'Çanakkale', 'Çankırı', 'Çorum', 'Denizli', 'Diyarbakır', 'Edirne', 'Elazığ', 'Erzincan',
    'Erzurum', 'Eskişehir', 'Gaziantep', 'Giresun', 'Gümüşhane', 'Hakkâri', 'Hatay', 'Isparta',
    'Mersin', 'İstanbul', 'İzmir', 'Kars', 'Kastamonu', 'Kayseri', 'Kırklareli', 'Kırşehir',
    'Kocaeli', 'Konya', 'Kütahya', 'Malatya', 'Manisa', 'Kahramanmaraş', 'Mardin', 'Muğla',
    'Muş', 'Nevşehir', 'Niğde', 'Ordu', 'Rize', 'Sakarya', 'Samsun', 'Siirt', 'Sinop',
    'Sivas', 'Tekirdağ', 'Tokat', 'Trabzon', 'Tunceli', 'Şanlıurfa', 'Uşak', 'Van',
    'Yozgat', 'Zonguldak', 'Aksaray', 'Bayburt', 'Karaman', 'Kırıkkale', 'Batman', 'Şırnak',
    'Bartın', 'Ardahan', 'Iğdır', 'Yalova', 'Karabük', 'Kilis', 'Osmaniye', 'Düzce'
  ].sort((a, b) => a.localeCompare(b, 'tr', { sensitivity: 'base' }))

  const teamMembers = [
    'Mehmet Özkan', 'Ali Kaya', 'Fatma Yılmaz', 'Ahmet Demir', 'Ayşe Şahin'
  ]

  const validateForm = () => {
    const newErrors: Record<string, string> = {}
    
    if (!formData.firstName) newErrors.firstName = 'Ad gerekli'
    if (!formData.lastName) newErrors.lastName = 'Soyad gerekli'
    if (!formData.email) newErrors.email = 'Email gerekli'
    if (!formData.phone) newErrors.phone = 'Telefon gerekli'
    if (!formData.city) newErrors.city = 'Şehir gerekli'
    
    if (formData.customerType === 'CORPORATE' && !formData.companyName) {
      newErrors.companyName = 'Şirket adı gerekli'
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleAddTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setTags(prev => [...prev, newTag.trim()])
      setNewTag('')
    }
  }

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(prev => prev.filter(tag => tag !== tagToRemove))
  }

  const handleSave = async () => {
    if (!validateForm()) return

    const now = new Date()
    const customerData: CustomerData = {
      id: customer?.id || Date.now().toString(),
      firstName: formData.firstName,
      lastName: formData.lastName,
      fullName: `${formData.firstName} ${formData.lastName}`,
      email: formData.email,
      phone: formData.phone,
      address: formData.address,
      city: formData.city,
      district: formData.district,
      customerType: formData.customerType,
      leadSource: formData.leadSource,
      status: formData.status,
      priority: formData.priority,
      assignedTo: formData.assignedTo,
      tags,
      notes: formData.notes,
      companyName: formData.companyName,
      taxNumber: formData.taxNumber,
      lastContact: customer?.lastContact || now,
      createdAt: customer?.createdAt || now,
      updatedAt: now,
      
      leadInfo: {
        estimatedBudget: formData.estimatedBudget,
        projectSize: formData.projectSize,
        timeline: formData.timeline,
        electricityBill: formData.electricityBill,
        roofType: formData.roofType,
        hasRoof: formData.hasRoof,
        propertyType: formData.propertyType
      },
      
      interactions: customer?.interactions || [],
      quotes: customer?.quotes || [],
      projects: customer?.projects || []
    }
    
    // Send welcome email for new customers
    if (!customer && formData.email) {
      try {
        await sendCustomerWelcome(
          formData.email,
          {
            customerName: `${formData.firstName} ${formData.lastName}`,
            email: formData.email,
            phone: formData.phone,
            dashboardUrl: `${window.location.origin}/dashboard`,
            projectAssignee: formData.assignedTo
          }
        )
        
        toast({
          title: "Hoş geldin e-postası gönderildi",
          description: "Müşteriye hoş geldin e-postası başarıyla gönderildi.",
        })
      } catch (error) {
        console.error('Welcome email failed:', error)
        toast({
          title: "E-posta gönderilemedi",
          description: "Hoş geldin e-postası gönderilemedi, ancak müşteri kaydedildi.",
          variant: "destructive"
        })
      }
    }

    onSave(customerData)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            {customer ? 'Müşteriyi Düzenle' : 'Yeni Müşteri Ekle'}
          </h2>
          <p className="text-gray-600">Müşteri bilgilerini eksiksiz doldurun</p>
        </div>
        
        <div className="flex space-x-2">
          <Button variant="outline" onClick={onCancel}>
            <X className="w-4 h-4 mr-2" />
            İptal
          </Button>
          <Button onClick={handleSave} disabled={sending}>
            <Save className="w-4 h-4 mr-2" />
            {sending ? 'Kaydediliyor...' : 'Kaydet'}
          </Button>
        </div>
      </div>

      <Tabs defaultValue="basic" className="space-y-6">
        <TabsList>
          <TabsTrigger value="basic">Temel Bilgiler</TabsTrigger>
          <TabsTrigger value="lead">Lead Bilgileri</TabsTrigger>
          <TabsTrigger value="management">Yönetim</TabsTrigger>
        </TabsList>

        {/* Basic Info Tab */}
        <TabsContent value="basic" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <User className="w-5 h-5 mr-2" />
                Kişisel Bilgiler
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="customerType">Müşteri Tipi</Label>
                  <Select 
                    value={formData.customerType} 
                    onValueChange={(value: any) => setFormData(prev => ({ ...prev, customerType: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="INDIVIDUAL">Bireysel</SelectItem>
                      <SelectItem value="CORPORATE">Kurumsal</SelectItem>
                      <SelectItem value="FARMER">Çiftçi</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="firstName">Ad *</Label>
                  <Input
                    id="firstName"
                    value={formData.firstName}
                    onChange={(e) => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
                    className={errors.firstName ? 'border-red-500' : ''}
                  />
                  {errors.firstName && (
                    <p className="text-sm text-red-600 mt-1">{errors.firstName}</p>
                  )}
                </div>
                
                <div>
                  <Label htmlFor="lastName">Soyad *</Label>
                  <Input
                    id="lastName"
                    value={formData.lastName}
                    onChange={(e) => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
                    className={errors.lastName ? 'border-red-500' : ''}
                  />
                  {errors.lastName && (
                    <p className="text-sm text-red-600 mt-1">{errors.lastName}</p>
                  )}
                </div>
              </div>

              {formData.customerType === 'CORPORATE' && (
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="companyName">Şirket Adı *</Label>
                    <Input
                      id="companyName"
                      value={formData.companyName}
                      onChange={(e) => setFormData(prev => ({ ...prev, companyName: e.target.value }))}
                      className={errors.companyName ? 'border-red-500' : ''}
                    />
                    {errors.companyName && (
                      <p className="text-sm text-red-600 mt-1">{errors.companyName}</p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="taxNumber">Vergi Numarası</Label>
                    <Input
                      id="taxNumber"
                      value={formData.taxNumber}
                      onChange={(e) => setFormData(prev => ({ ...prev, taxNumber: e.target.value }))}
                    />
                  </div>
                </div>
              )}

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    className={errors.email ? 'border-red-500' : ''}
                  />
                  {errors.email && (
                    <p className="text-sm text-red-600 mt-1">{errors.email}</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="phone">Telefon *</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                    className={errors.phone ? 'border-red-500' : ''}
                  />
                  {errors.phone && (
                    <p className="text-sm text-red-600 mt-1">{errors.phone}</p>
                  )}
                </div>
              </div>

              <div>
                <Label htmlFor="address">Adres</Label>
                <Input
                  id="address"
                  value={formData.address}
                  onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="city">Şehir *</Label>
                  <Popover open={cityOpen} onOpenChange={setCityOpen}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={cityOpen}
                        className={`w-full justify-between ${errors.city ? 'border-red-500' : ''}`}
                      >
                        {formData.city || "Şehir seçin..."}
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-full p-0">
                      <Command>
                        <CommandInput placeholder="Şehir ara..." className="h-9" />
                        <CommandList>
                          <CommandEmpty>Şehir bulunamadı.</CommandEmpty>
                          <CommandGroup>
                            {cities.map((city) => (
                              <CommandItem
                                key={city}
                                value={city}
                                onSelect={(currentValue) => {
                                  setFormData(prev => ({
                                    ...prev,
                                    city: currentValue === formData.city ? "" : currentValue
                                  }))
                                  setCityOpen(false)
                                }}
                              >
                                <Check
                                  className={`mr-2 h-4 w-4 ${
                                    formData.city === city ? "opacity-100" : "opacity-0"
                                  }`}
                                />
                                {city}
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                  {errors.city && (
                    <p className="text-sm text-red-600 mt-1">{errors.city}</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="district">İlçe</Label>
                  <Input
                    id="district"
                    value={formData.district}
                    onChange={(e) => setFormData(prev => ({ ...prev, district: e.target.value }))}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Lead Info Tab */}
        <TabsContent value="lead" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Target className="w-5 h-5 mr-2" />
                Proje Bilgileri
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="estimatedBudget">Tahmini Bütçe (₺)</Label>
                  <Input
                    id="estimatedBudget"
                    type="number"
                    value={formData.estimatedBudget}
                    onChange={(e) => setFormData(prev => ({ ...prev, estimatedBudget: Number(e.target.value) }))}
                  />
                </div>
                <div>
                  <Label htmlFor="projectSize">Proje Boyutu</Label>
                  <Select 
                    value={formData.projectSize} 
                    onValueChange={(value) => setFormData(prev => ({ ...prev, projectSize: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Sistem büyüklüğü" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="5-10kW">5-10kW (Küçük Ev)</SelectItem>
                      <SelectItem value="10-20kW">10-20kW (Büyük Ev)</SelectItem>
                      <SelectItem value="20-50kW">20-50kW (Küçük İşletme)</SelectItem>
                      <SelectItem value="50-100kW">50-100kW (Orta İşletme)</SelectItem>
                      <SelectItem value="100kW+">100kW+ (Büyük İşletme)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="electricityBill">Aylık Elektrik Faturası (₺)</Label>
                  <Input
                    id="electricityBill"
                    type="number"
                    value={formData.electricityBill}
                    onChange={(e) => setFormData(prev => ({ ...prev, electricityBill: Number(e.target.value) }))}
                  />
                </div>
                <div>
                  <Label htmlFor="timeline">Zaman Çizelgesi</Label>
                  <Select 
                    value={formData.timeline} 
                    onValueChange={(value) => setFormData(prev => ({ ...prev, timeline: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Proje süresi" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Hemen">Hemen (1 ay içinde)</SelectItem>
                      <SelectItem value="1-2 ay">1-2 ay içinde</SelectItem>
                      <SelectItem value="2-6 ay">2-6 ay içinde</SelectItem>
                      <SelectItem value="6+ ay">6+ ay sonra</SelectItem>
                      <SelectItem value="Belirsiz">Belirsiz</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="propertyType">Mülk Tipi</Label>
                  <Select 
                    value={formData.propertyType} 
                    onValueChange={(value) => setFormData(prev => ({ ...prev, propertyType: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Mülk türü" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Müstakil Ev">Müstakil Ev</SelectItem>
                      <SelectItem value="Villa">Villa</SelectItem>
                      <SelectItem value="Apartman">Apartman</SelectItem>
                      <SelectItem value="İş Yeri">İş Yeri</SelectItem>
                      <SelectItem value="Fabrika">Fabrika</SelectItem>
                      <SelectItem value="Tarım">Tarım Arazisi</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="roofType">Çatı Tipi</Label>
                  <Select 
                    value={formData.roofType} 
                    onValueChange={(value) => setFormData(prev => ({ ...prev, roofType: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Çatı türü" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Kiremit">Kiremit</SelectItem>
                      <SelectItem value="Beton">Beton</SelectItem>
                      <SelectItem value="Sac">Sac</SelectItem>
                      <SelectItem value="Membran">Membran</SelectItem>
                      <SelectItem value="Diğer">Diğer</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Management Tab */}
        <TabsContent value="management" className="space-y-6">
          <div className="grid lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Lead Yönetimi</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="leadSource">Lead Kaynağı</Label>
                  <Select 
                    value={formData.leadSource} 
                    onValueChange={(value: any) => setFormData(prev => ({ ...prev, leadSource: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="WEBSITE">Website</SelectItem>
                      <SelectItem value="REFERRAL">Referans</SelectItem>
                      <SelectItem value="SOCIAL_MEDIA">Sosyal Medya</SelectItem>
                      <SelectItem value="ADVERTISEMENT">Reklam</SelectItem>
                      <SelectItem value="OTHER">Diğer</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="status">Durum</Label>
                    <Select 
                      value={formData.status} 
                      onValueChange={(value: any) => setFormData(prev => ({ ...prev, status: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="LEAD">Potansiyel</SelectItem>
                        <SelectItem value="QUALIFIED">Nitelikli</SelectItem>
                        <SelectItem value="PROPOSAL_SENT">Teklif Gönderildi</SelectItem>
                        <SelectItem value="NEGOTIATION">Müzakere</SelectItem>
                        <SelectItem value="CUSTOMER">Müşteri</SelectItem>
                        <SelectItem value="LOST">Kaybedildi</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="priority">Öncelik</Label>
                    <Select 
                      value={formData.priority} 
                      onValueChange={(value: any) => setFormData(prev => ({ ...prev, priority: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="LOW">Düşük</SelectItem>
                        <SelectItem value="MEDIUM">Orta</SelectItem>
                        <SelectItem value="HIGH">Yüksek</SelectItem>
                        <SelectItem value="URGENT">Acil</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label htmlFor="assignedTo">Sorumlu</Label>
                  <Select 
                    value={formData.assignedTo} 
                    onValueChange={(value) => setFormData(prev => ({ ...prev, assignedTo: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {teamMembers.map(member => (
                        <SelectItem key={member} value={member}>{member}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Tag className="w-5 h-5 mr-2" />
                  Etiketler & Notlar
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Etiketler</Label>
                  <div className="flex space-x-2 mb-2">
                    <Input
                      placeholder="Yeni etiket"
                      value={newTag}
                      onChange={(e) => setNewTag(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleAddTag()}
                    />
                    <Button size="sm" onClick={handleAddTag}>
                      <Plus className="w-3 h-3" />
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {tags.map(tag => (
                      <Badge key={tag} variant="secondary" className="cursor-pointer">
                        {tag}
                        <X 
                          className="w-3 h-3 ml-1" 
                          onClick={() => handleRemoveTag(tag)}
                        />
                      </Badge>
                    ))}
                  </div>
                </div>

                <div>
                  <Label htmlFor="notes">Notlar</Label>
                  <Textarea
                    id="notes"
                    rows={4}
                    value={formData.notes}
                    onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                    placeholder="Müşteri hakkında notlar..."
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}