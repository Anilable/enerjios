'use client'

import { useState } from 'react'
import { ProjectRequest, ProjectType, PROJECT_TYPE_LABELS } from '@/types/project-request'
import { useCustomerSearch, type Customer } from '@/hooks/use-customer-search'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Home,
  Building,
  Factory,
  Zap,
  Battery,
  Wifi,
  WifiOff,
  Package,
  TreePine,
  Car,
  Sun,
  Check,
  ChevronsUpDown,
  AlertCircle,
  FileText,
  DollarSign,
  Tag,
  Calendar
} from 'lucide-react'
import { cn } from '@/lib/utils'


const projectTypeIcons = {
  RESIDENTIAL: Home,
  COMMERCIAL: Building,
  INDUSTRIAL: Factory,
  AGRICULTURAL: TreePine,
  ROOFTOP: Sun,
  LAND: MapPin,
  AGRISOLAR: TreePine,
  CARPARK: Car,
  ONGRID: Wifi,
  OFFGRID: WifiOff,
  STORAGE: Battery,
  HYBRID: Zap
}

interface NewProjectRequestDialogV2Props {
  isOpen: boolean
  onClose: () => void
  onSubmit: (request: ProjectRequest) => void
}

export function NewProjectRequestDialogV2({ isOpen, onClose, onSubmit }: NewProjectRequestDialogV2Props) {
  const [activeTab, setActiveTab] = useState('customer')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null)
  const [customerSearchOpen, setCustomerSearchOpen] = useState(false)
  
  // Use the customer search hook
  const { customers: filteredCustomers, isLoading: isSearching } = useCustomerSearch(searchQuery)
  
  const [formData, setFormData] = useState({
    customerName: '',
    customerEmail: '',
    customerPhone: '',
    location: '',
    address: '',
    projectType: '' as ProjectType | '',
    systemType: 'ONGRID' as 'ONGRID' | 'OFFGRID' | 'HYBRID',
    includeStorage: false,
    estimatedCapacity: '',
    estimatedBudget: '',
    description: '',
    priority: 'MEDIUM' as 'LOW' | 'MEDIUM' | 'HIGH',
    source: 'WEBSITE' as 'WEBSITE' | 'PHONE' | 'EMAIL' | 'REFERRAL' | 'SOCIAL_MEDIA',
    tags: '',
    urgentRequest: false,
    hasExistingSystem: false,
    preferredVisitDate: ''
  })


  // Handle customer selection
  const handleCustomerSelect = (customer: Customer) => {
    setSelectedCustomer(customer)
    setFormData(prev => ({
      ...prev,
      customerName: customer.name,
      customerEmail: customer.email,
      customerPhone: customer.phone
    }))
    setCustomerSearchOpen(false)
  }

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.customerName || !formData.customerEmail || !formData.projectType) {
      return
    }

    // Determine actual project type based on system type
    let finalProjectType = formData.projectType
    if (formData.systemType === 'OFFGRID') {
      finalProjectType = 'OFFGRID' as ProjectType
    } else if (formData.systemType === 'HYBRID' || formData.includeStorage) {
      finalProjectType = 'HYBRID' as ProjectType
    } else if (formData.systemType === 'ONGRID') {
      finalProjectType = 'ONGRID' as ProjectType
    }

    const newRequest: ProjectRequest = {
      id: Date.now().toString(),
      requestNumber: `REQ-${Date.now().toString().slice(-8)}`,
      customerId: selectedCustomer?.id,
      customerName: formData.customerName,
      customerEmail: formData.customerEmail,
      customerPhone: formData.customerPhone,
      location: formData.location,
      address: formData.address,
      projectType: finalProjectType,
      estimatedCapacity: parseFloat(formData.estimatedCapacity) || 0,
      estimatedBudget: parseFloat(formData.estimatedBudget) || undefined,
      description: formData.description,
      status: 'OPEN',
      priority: formData.urgentRequest ? 'HIGH' : formData.priority,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      scheduledVisitDate: formData.preferredVisitDate || undefined,
      statusHistory: [
        {
          id: '1',
          status: 'OPEN',
          timestamp: new Date().toISOString(),
          userId: 'current-user',
          userName: 'Mevcut Kullanıcı'
        }
      ],
      notes: [],
      tags: formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag),
      source: formData.source,
      hasPhotos: false,
      estimatedRevenue: parseFloat(formData.estimatedBudget) || undefined
    }

    onSubmit(newRequest)
    resetForm()
  }

  const resetForm = () => {
    setFormData({
      customerName: '',
      customerEmail: '',
      customerPhone: '',
      location: '',
      address: '',
      projectType: '',
      systemType: 'ONGRID',
      includeStorage: false,
      estimatedCapacity: '',
      estimatedBudget: '',
      description: '',
      priority: 'MEDIUM',
      source: 'WEBSITE',
      tags: '',
      urgentRequest: false,
      hasExistingSystem: false,
      preferredVisitDate: ''
    })
    setSelectedCustomer(null)
    setActiveTab('customer')
  }

  const handleClose = () => {
    resetForm()
    onClose()
  }

  const isTabValid = (tab: string) => {
    switch (tab) {
      case 'customer':
        return formData.customerName && formData.customerEmail
      case 'project':
        return formData.projectType && formData.location
      case 'details':
        return true
      default:
        return false
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">Yeni Proje Talebi</DialogTitle>
          <DialogDescription>
            Müşteri bilgilerini ve proje detaylarını girerek yeni talep oluşturun
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit}>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-4">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="customer" className="flex items-center gap-2">
                <User className="h-4 w-4" />
                Müşteri Bilgileri
                {isTabValid('customer') && <Check className="h-3 w-3 ml-1 text-green-600" />}
              </TabsTrigger>
              <TabsTrigger value="project" className="flex items-center gap-2">
                <Sun className="h-4 w-4" />
                Proje Detayları
                {isTabValid('project') && <Check className="h-3 w-3 ml-1 text-green-600" />}
              </TabsTrigger>
              <TabsTrigger value="details" className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Ek Bilgiler
              </TabsTrigger>
            </TabsList>

            <TabsContent value="customer" className="space-y-4 mt-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Müşteri Seçimi</CardTitle>
                  <CardDescription>
                    Mevcut müşteri seçin veya yeni müşteri bilgilerini girin
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Customer Search */}
                  <div className="space-y-2">
                    <Label>Müşteri Ara</Label>
                    <Popover open={customerSearchOpen} onOpenChange={setCustomerSearchOpen}>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          role="combobox"
                          aria-expanded={customerSearchOpen}
                          className="w-full justify-between"
                        >
                          {selectedCustomer ? (
                            <div className="flex items-center justify-between w-full">
                              <span>{selectedCustomer.name}</span>
                              {selectedCustomer.previousProjects && (
                                <Badge variant="secondary" className="ml-2">
                                  {selectedCustomer.previousProjects} önceki proje
                                </Badge>
                              )}
                            </div>
                          ) : (
                            "Müşteri seçin veya yeni ekleyin..."
                          )}
                          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-full p-0">
                        <Command>
                          <CommandInput 
                            placeholder="İsim, e-posta veya telefon ile ara..." 
                            value={searchQuery}
                            onValueChange={setSearchQuery}
                          />
                          <CommandList>
                            {isSearching ? (
                              <div className="p-4 text-center">
                                <p className="text-sm text-muted-foreground">Aranıyor...</p>
                              </div>
                            ) : (
                              <>
                                <CommandEmpty>
                                  <div className="p-4 text-center">
                                    <p className="text-sm text-muted-foreground">Müşteri bulunamadı</p>
                                    <Button 
                                      type="button" 
                                      variant="link" 
                                      className="mt-2"
                                      onClick={() => {
                                        setCustomerSearchOpen(false)
                                        setSelectedCustomer(null)
                                      }}
                                    >
                                      Yeni müşteri olarak devam et
                                    </Button>
                                  </div>
                                </CommandEmpty>
                                <CommandGroup>
                              {filteredCustomers.map((customer) => (
                                <CommandItem
                                  key={customer.id}
                                  onSelect={() => handleCustomerSelect(customer)}
                                  className="cursor-pointer"
                                >
                                  <div className="flex flex-col w-full">
                                    <div className="flex items-center justify-between">
                                      <span className="font-medium">{customer.name}</span>
                                      {customer.company && (
                                        <Badge variant="outline" className="ml-2">{customer.company}</Badge>
                                      )}
                                    </div>
                                    <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                                      <span className="flex items-center gap-1">
                                        <Mail className="h-3 w-3" />
                                        {customer.email}
                                      </span>
                                      <span className="flex items-center gap-1">
                                        <Phone className="h-3 w-3" />
                                        {customer.phone}
                                      </span>
                                    </div>
                                    {customer.previousProjects && (
                                      <div className="text-xs text-muted-foreground mt-1">
                                        {customer.previousProjects} proje • {customer.totalCapacity} kW toplam kapasite
                                      </div>
                                    )}
                                  </div>
                                </CommandItem>
                              ))}
                                </CommandGroup>
                              </>
                            )}
                          </CommandList>
                        </Command>
                      </PopoverContent>
                    </Popover>
                  </div>

                  {/* Customer Details */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="customerName" className="flex items-center gap-2">
                        <User className="h-4 w-4" />
                        Müşteri Adı *
                      </Label>
                      <Input
                        id="customerName"
                        value={formData.customerName}
                        onChange={(e) => handleInputChange('customerName', e.target.value)}
                        placeholder="Ahmet Yılmaz"
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="customerEmail" className="flex items-center gap-2">
                        <Mail className="h-4 w-4" />
                        E-posta *
                      </Label>
                      <Input
                        id="customerEmail"
                        type="email"
                        value={formData.customerEmail}
                        onChange={(e) => handleInputChange('customerEmail', e.target.value)}
                        placeholder="ahmet@example.com"
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="customerPhone" className="flex items-center gap-2">
                        <Phone className="h-4 w-4" />
                        Telefon
                      </Label>
                      <Input
                        id="customerPhone"
                        value={formData.customerPhone}
                        onChange={(e) => handleInputChange('customerPhone', e.target.value)}
                        placeholder="+90 532 123 4567"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="source">Müşteri Kaynağı</Label>
                      <Select 
                        value={formData.source} 
                        onValueChange={(value) => handleInputChange('source', value)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="WEBSITE">Website</SelectItem>
                          <SelectItem value="PHONE">Telefon</SelectItem>
                          <SelectItem value="EMAIL">E-posta</SelectItem>
                          <SelectItem value="REFERRAL">Referans</SelectItem>
                          <SelectItem value="SOCIAL_MEDIA">Sosyal Medya</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="project" className="space-y-4 mt-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Proje Tipi</CardTitle>
                  <CardDescription>
                    Kurulum yapılacak alan ve sistem tipini seçin
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Project Type Selection */}
                  <div className="space-y-3">
                    <Label>Kurulum Alanı *</Label>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {(['RESIDENTIAL', 'COMMERCIAL', 'INDUSTRIAL', 'AGRICULTURAL'] as ProjectType[]).map((type) => {
                        const Icon = projectTypeIcons[type]
                        return (
                          <Card
                            key={type}
                            className={cn(
                              "cursor-pointer transition-all hover:shadow-md",
                              formData.projectType === type && "ring-2 ring-primary"
                            )}
                            onClick={() => handleInputChange('projectType', type)}
                          >
                            <CardContent className="p-4 text-center">
                              <Icon className="h-8 w-8 mx-auto mb-2 text-primary" />
                              <p className="text-sm font-medium">{PROJECT_TYPE_LABELS[type]}</p>
                            </CardContent>
                          </Card>
                        )
                      })}
                    </div>
                  </div>

                  {/* System Type Selection */}
                  <div className="space-y-3">
                    <Label>Sistem Tipi</Label>
                    <RadioGroup 
                      value={formData.systemType} 
                      onValueChange={(value) => handleInputChange('systemType', value)}
                    >
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <Card className={cn(
                          "cursor-pointer",
                          formData.systemType === 'ONGRID' && "ring-2 ring-primary"
                        )}>
                          <CardContent className="p-4">
                            <RadioGroupItem value="ONGRID" id="ongrid" className="sr-only" />
                            <Label htmlFor="ongrid" className="cursor-pointer">
                              <div className="flex items-center gap-3">
                                <Wifi className="h-5 w-5 text-green-600" />
                                <div>
                                  <p className="font-medium">On-Grid</p>
                                  <p className="text-xs text-muted-foreground">Şebeke bağlantılı</p>
                                </div>
                              </div>
                            </Label>
                          </CardContent>
                        </Card>

                        <Card className={cn(
                          "cursor-pointer",
                          formData.systemType === 'OFFGRID' && "ring-2 ring-primary"
                        )}>
                          <CardContent className="p-4">
                            <RadioGroupItem value="OFFGRID" id="offgrid" className="sr-only" />
                            <Label htmlFor="offgrid" className="cursor-pointer">
                              <div className="flex items-center gap-3">
                                <WifiOff className="h-5 w-5 text-orange-600" />
                                <div>
                                  <p className="font-medium">Off-Grid</p>
                                  <p className="text-xs text-muted-foreground">Şebekeden bağımsız</p>
                                </div>
                              </div>
                            </Label>
                          </CardContent>
                        </Card>

                        <Card className={cn(
                          "cursor-pointer",
                          formData.systemType === 'HYBRID' && "ring-2 ring-primary"
                        )}>
                          <CardContent className="p-4">
                            <RadioGroupItem value="HYBRID" id="hybrid" className="sr-only" />
                            <Label htmlFor="hybrid" className="cursor-pointer">
                              <div className="flex items-center gap-3">
                                <Zap className="h-5 w-5 text-blue-600" />
                                <div>
                                  <p className="font-medium">Hibrit</p>
                                  <p className="text-xs text-muted-foreground">Depolamalı sistem</p>
                                </div>
                              </div>
                            </Label>
                          </CardContent>
                        </Card>
                      </div>
                    </RadioGroup>
                  </div>

                  {/* Storage Option */}
                  {formData.systemType === 'ONGRID' && (
                    <div className="flex items-center space-x-2 p-4 bg-muted rounded-lg">
                      <input
                        type="checkbox"
                        id="includeStorage"
                        checked={formData.includeStorage}
                        onChange={(e) => handleInputChange('includeStorage', e.target.checked)}
                        className="h-4 w-4"
                      />
                      <Label htmlFor="includeStorage" className="flex items-center gap-2 cursor-pointer">
                        <Battery className="h-4 w-4 text-yellow-600" />
                        Enerji depolama sistemi ekle
                      </Label>
                    </div>
                  )}

                  {/* Location and Capacity */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="location" className="flex items-center gap-2">
                        <MapPin className="h-4 w-4" />
                        Konum *
                      </Label>
                      <Input
                        id="location"
                        value={formData.location}
                        onChange={(e) => handleInputChange('location', e.target.value)}
                        placeholder="İstanbul, Kadıköy"
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="estimatedCapacity">Tahmini Kapasite (kW)</Label>
                      <Input
                        id="estimatedCapacity"
                        type="number"
                        value={formData.estimatedCapacity}
                        onChange={(e) => handleInputChange('estimatedCapacity', e.target.value)}
                        placeholder="25"
                        min="0"
                        step="0.1"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="address">Detaylı Adres</Label>
                    <Textarea
                      id="address"
                      value={formData.address}
                      onChange={(e) => handleInputChange('address', e.target.value)}
                      placeholder="Kurulum yapılacak detaylı adres bilgisi..."
                      rows={2}
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="details" className="space-y-4 mt-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Ek Bilgiler</CardTitle>
                  <CardDescription>
                    Proje ile ilgili ek detayları belirtin
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="estimatedBudget" className="flex items-center gap-2">
                        <DollarSign className="h-4 w-4" />
                        Tahmini Bütçe (TL)
                      </Label>
                      <Input
                        id="estimatedBudget"
                        type="number"
                        value={formData.estimatedBudget}
                        onChange={(e) => handleInputChange('estimatedBudget', e.target.value)}
                        placeholder="150000"
                        min="0"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="preferredVisitDate" className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        Tercih Edilen Ziyaret Tarihi
                      </Label>
                      <Input
                        id="preferredVisitDate"
                        type="date"
                        value={formData.preferredVisitDate}
                        onChange={(e) => handleInputChange('preferredVisitDate', e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="priority">Öncelik Durumu</Label>
                    <Select 
                      value={formData.priority} 
                      onValueChange={(value) => handleInputChange('priority', value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="LOW">
                          <div className="flex items-center gap-2">
                            <div className="h-2 w-2 rounded-full bg-gray-400" />
                            Düşük
                          </div>
                        </SelectItem>
                        <SelectItem value="MEDIUM">
                          <div className="flex items-center gap-2">
                            <div className="h-2 w-2 rounded-full bg-yellow-400" />
                            Orta
                          </div>
                        </SelectItem>
                        <SelectItem value="HIGH">
                          <div className="flex items-center gap-2">
                            <div className="h-2 w-2 rounded-full bg-red-400" />
                            Yüksek
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="tags" className="flex items-center gap-2">
                      <Tag className="h-4 w-4" />
                      Etiketler
                    </Label>
                    <Input
                      id="tags"
                      value={formData.tags}
                      onChange={(e) => handleInputChange('tags', e.target.value)}
                      placeholder="Acil, Yüksek Bütçe, Referans (virgülle ayırın)"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Proje Notları</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => handleInputChange('description', e.target.value)}
                      placeholder="Müşteri istekleri, özel durumlar, dikkat edilmesi gerekenler..."
                      rows={4}
                    />
                  </div>

                  {/* Additional Options */}
                  <div className="space-y-3 p-4 bg-muted rounded-lg">
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="urgentRequest"
                        checked={formData.urgentRequest}
                        onChange={(e) => handleInputChange('urgentRequest', e.target.checked)}
                        className="h-4 w-4"
                      />
                      <Label htmlFor="urgentRequest" className="flex items-center gap-2 cursor-pointer">
                        <AlertCircle className="h-4 w-4 text-red-600" />
                        Acil talep (24 saat içinde dönüş)
                      </Label>
                    </div>

                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="hasExistingSystem"
                        checked={formData.hasExistingSystem}
                        onChange={(e) => handleInputChange('hasExistingSystem', e.target.checked)}
                        className="h-4 w-4"
                      />
                      <Label htmlFor="hasExistingSystem" className="cursor-pointer">
                        Mevcut güneş enerjisi sistemi var
                      </Label>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          <DialogFooter className="mt-6">
            <Button type="button" variant="outline" onClick={handleClose}>
              İptal
            </Button>
            <Button 
              type="submit"
              disabled={!formData.customerName || !formData.customerEmail || !formData.projectType}
            >
              Talep Oluştur
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}