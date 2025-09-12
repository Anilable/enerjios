'use client'

import { useState } from 'react'
import { ProjectRequest, ProjectType, PROJECT_TYPE_LABELS, REQUEST_SOURCE_LABELS } from '@/types/project-request'
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
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Separator } from '@/components/ui/separator'
import { Progress } from '@/components/ui/progress'
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
  TreePine,
  Car,
  Sun,
  Check,
  ChevronsUpDown,
  AlertCircle,
  FileText,
  DollarSign,
  Tag,
  Calendar,
  Instagram,
  Facebook,
  Linkedin,
  Twitter,
  MessageCircle,
  Search,
  Youtube,
  Globe,
  X,
  CheckCircle,
  AlertTriangle,
  Info
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

const sourceIcons = {
  WEBSITE: Globe,
  PHONE: Phone,
  EMAIL: Mail,
  REFERRAL: User,
  SOCIAL_MEDIA: MessageCircle,
  INSTAGRAM: Instagram,
  FACEBOOK: Facebook,
  LINKEDIN: Linkedin,
  TWITTER: Twitter,
  WHATSAPP: MessageCircle,
  GOOGLE_ADS: Search,
  YOUTUBE: Youtube
}


interface FormErrors {
  customerName?: string
  customerEmail?: string
  customerPhone?: string
  location?: string
  address?: string
  projectType?: string
  systemType?: string
  estimatedCapacity?: string
  estimatedBudget?: string
  preferredVisitDate?: string
  contactPreference?: string
  source?: string
  priority?: string
  tags?: string
  description?: string
  general?: string
}

interface EnhancedProjectRequestDialogProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (request: ProjectRequest) => void
  prefilledCustomer?: {
    id?: string
    name: string
    email: string
    phone?: string
    address?: string
    city?: string
  }
}

export function EnhancedProjectRequestDialog({ isOpen, onClose, onSubmit, prefilledCustomer }: EnhancedProjectRequestDialogProps) {
  const [activeTab, setActiveTab] = useState('customer')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(
    prefilledCustomer ? {
      id: prefilledCustomer.id || '',
      name: prefilledCustomer.name,
      email: prefilledCustomer.email,
      phone: prefilledCustomer.phone || '',
      company: '',
      previousProjects: 0,
      totalCapacity: 0
    } : null
  )
  const [customerSearchOpen, setCustomerSearchOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState<FormErrors>({})
  
  // Use the customer search hook
  const { customers: filteredCustomers, isLoading: isSearching, error: searchError } = useCustomerSearch(searchQuery)
  
  
  const [formData, setFormData] = useState({
    customerName: prefilledCustomer?.name || '',
    customerEmail: prefilledCustomer?.email || '',
    customerPhone: prefilledCustomer?.phone || '',
    location: prefilledCustomer?.city || '',
    address: prefilledCustomer?.address || '',
    projectType: '' as ProjectType | '',
    systemType: 'ONGRID' as 'ONGRID' | 'OFFGRID' | 'HYBRID',
    includeStorage: false,
    estimatedCapacity: '',
    estimatedBudget: '',
    description: '',
    priority: 'MEDIUM' as 'LOW' | 'MEDIUM' | 'HIGH',
    source: 'WEBSITE' as any,
    tags: '',
    urgentRequest: false,
    hasExistingSystem: false,
    preferredVisitDate: '',
    contactPreference: 'PHONE' as 'PHONE' | 'EMAIL' | 'WHATSAPP',
    availableTimeSlots: [] as string[]
  })

  // Enhanced form validation
  const validateForm = (): boolean => {
    const newErrors: FormErrors = {}

    // Customer Name Validation
    if (!formData.customerName.trim()) {
      newErrors.customerName = 'Müşteri adı gereklidir'
    } else if (formData.customerName.length < 2) {
      newErrors.customerName = 'Müşteri adı en az 2 karakter olmalıdır'
    } else if (formData.customerName.length > 100) {
      newErrors.customerName = 'Müşteri adı en fazla 100 karakter olabilir'
    } else if (!/^[a-zA-ZÇçĞğıİÖöŞşÜü\s]+$/.test(formData.customerName)) {
      newErrors.customerName = 'Müşteri adı sadece harf ve boşluk içerebilir'
    }

    // Email Validation
    if (!formData.customerEmail.trim()) {
      newErrors.customerEmail = 'E-posta adresi gereklidir'
    } else if (!/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(formData.customerEmail)) {
      newErrors.customerEmail = 'Geçerli bir e-posta adresi giriniz (örn: ornek@email.com)'
    } else if (formData.customerEmail.length > 255) {
      newErrors.customerEmail = 'E-posta adresi en fazla 255 karakter olabilir'
    }

    // Phone Validation (Optional but if provided, must be valid)
    if (formData.customerPhone) {
      const phoneRegex = /^(\+90|0)?([5][0-9]{9})$/
      const cleanPhone = formData.customerPhone.replace(/[\s-()]/g, '')
      if (!phoneRegex.test(cleanPhone)) {
        newErrors.customerPhone = 'Geçerli bir Türk cep telefonu numarası giriniz (örn: 0532 123 4567)'
      }
    }

    // Location Validation
    if (!formData.location.trim()) {
      newErrors.location = 'Konum bilgisi gereklidir'
    } else if (formData.location.length < 3) {
      newErrors.location = 'Konum bilgisi en az 3 karakter olmalıdır'
    } else if (formData.location.length > 200) {
      newErrors.location = 'Konum bilgisi en fazla 200 karakter olabilir'
    }

    // Address Validation (Optional)
    if (formData.address && formData.address.length > 500) {
      newErrors.address = 'Adres bilgisi en fazla 500 karakter olabilir'
    }

    // Project Type Validation
    if (!formData.projectType) {
      newErrors.projectType = 'Proje türü seçimi gereklidir'
    }

    // System Type Validation (always required)
    if (!formData.systemType) {
      newErrors.systemType = 'Sistem tipi seçimi gereklidir'
    }

    // Estimated Capacity Validation (Optional but if provided, must be valid)
    if (formData.estimatedCapacity) {
      const capacity = Number(formData.estimatedCapacity)
      if (isNaN(capacity)) {
        newErrors.estimatedCapacity = 'Kapasite değeri sayı olmalıdır'
      } else if (capacity <= 0) {
        newErrors.estimatedCapacity = 'Kapasite değeri 0\'dan büyük olmalıdır'
      } else if (capacity > 10000) {
        newErrors.estimatedCapacity = 'Kapasite değeri 10.000 kW\'ı geçemez'
      }
    }

    // Estimated Budget Validation (Optional but if provided, must be valid)
    if (formData.estimatedBudget) {
      const budget = Number(formData.estimatedBudget)
      if (isNaN(budget)) {
        newErrors.estimatedBudget = 'Bütçe değeri sayı olmalıdır'
      } else if (budget <= 0) {
        newErrors.estimatedBudget = 'Bütçe değeri 0\'dan büyük olmalıdır'
      } else if (budget > 100000000) {
        newErrors.estimatedBudget = 'Bütçe değeri 100 milyon TL\'yi geçemez'
      }
    }

    // Preferred Visit Date Validation (Optional but if provided, must be valid)
    if (formData.preferredVisitDate) {
      const visitDate = new Date(formData.preferredVisitDate)
      const today = new Date()
      today.setHours(0, 0, 0, 0) // Reset time to compare only dates
      if (visitDate < today) {
        newErrors.preferredVisitDate = 'Ziyaret tarihi bugünden önce olamaz'
      } else if (visitDate > new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)) {
        newErrors.preferredVisitDate = 'Ziyaret tarihi 1 yıldan uzak olamaz'
      }
    }

    // Contact Preference Validation
    if (!formData.contactPreference) {
      newErrors.contactPreference = 'İletişim tercihi seçimi gereklidir'
    }

    // Source Validation
    if (!formData.source) {
      newErrors.source = 'Müşteri kaynağı seçimi gereklidir'
    }

    // Priority Validation
    if (!formData.priority) {
      newErrors.priority = 'Öncelik durumu seçimi gereklidir'
    }

    // Tags Validation (Optional but if provided, must be valid)
    if (formData.tags && formData.tags.length > 200) {
      newErrors.tags = 'Etiketler en fazla 200 karakter olabilir'
    }

    // Description Validation (Optional but if provided, must be valid)
    if (formData.description && formData.description.length > 1000) {
      newErrors.description = 'Açıklama en fazla 1000 karakter olabilir'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

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
    // Clear customer-related errors
    setErrors(prev => ({
      ...prev,
      customerName: undefined,
      customerEmail: undefined,
      customerPhone: undefined
    }))
  }

  // Real-time field validation
  const validateField = (field: string, value: any): string | undefined => {
    switch (field) {
      case 'customerName':
        if (!value?.trim()) return 'Müşteri adı gereklidir'
        if (value.length < 2) return 'Müşteri adı en az 2 karakter olmalıdır'
        if (value.length > 100) return 'Müşteri adı en fazla 100 karakter olabilir'
        if (!/^[a-zA-ZÇçĞğıİÖöŞşÜü\s]+$/.test(value)) return 'Müşteri adı sadece harf ve boşluk içerebilir'
        break
        
      case 'customerEmail':
        if (!value?.trim()) return 'E-posta adresi gereklidir'
        if (!/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(value)) return 'Geçerli bir e-posta adresi giriniz'
        if (value.length > 255) return 'E-posta adresi en fazla 255 karakter olabilir'
        break
        
      case 'customerPhone':
        if (value) {
          const phoneRegex = /^(\+90|0)?([5][0-9]{9})$/
          const cleanPhone = value.replace(/[\s-()]/g, '')
          if (!phoneRegex.test(cleanPhone)) return 'Geçerli bir Türk cep telefonu numarası giriniz'
        }
        break
        
      case 'location':
        if (!value?.trim()) return 'Konum bilgisi gereklidir'
        if (value.length < 3) return 'Konum bilgisi en az 3 karakter olmalıdır'
        if (value.length > 200) return 'Konum bilgisi en fazla 200 karakter olabilir'
        break
        
      case 'address':
        if (value && value.length > 500) return 'Adres bilgisi en fazla 500 karakter olabilir'
        break
        
      case 'projectType':
        if (!value) return 'Proje türü seçimi gereklidir'
        break
        
      case 'systemType':
        if (!value) return 'Sistem tipi seçimi gereklidir'
        break
        
      case 'estimatedCapacity':
        if (value) {
          const capacity = Number(value)
          if (isNaN(capacity)) return 'Kapasite değeri sayı olmalıdır'
          if (capacity <= 0) return 'Kapasite değeri 0\'dan büyük olmalıdır'
          if (capacity > 10000) return 'Kapasite değeri 10.000 kW\'ı geçemez'
        }
        break
        
      case 'estimatedBudget':
        if (value) {
          const budget = Number(value)
          if (isNaN(budget)) return 'Bütçe değeri sayı olmalıdır'
          if (budget <= 0) return 'Bütçe değeri 0\'dan büyük olmalıdır'
          if (budget > 100000000) return 'Bütçe değeri 100 milyon TL\'yi geçemez'
        }
        break
        
      case 'preferredVisitDate':
        if (value) {
          const visitDate = new Date(value)
          const today = new Date()
          today.setHours(0, 0, 0, 0)
          if (visitDate < today) return 'Ziyaret tarihi bugünden önce olamaz'
          if (visitDate > new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)) return 'Ziyaret tarihi 1 yıldan uzak olamaz'
        }
        break
        
      case 'tags':
        if (value && value.length > 200) return 'Etiketler en fazla 200 karakter olabilir'
        break
        
      case 'description':
        if (value && value.length > 1000) return 'Açıklama en fazla 1000 karakter olabilir'
        break
    }
    return undefined
  }

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    
    // Real-time validation
    const fieldError = validateField(field, value)
    setErrors(prev => ({ ...prev, [field]: fieldError }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setErrors({})

    console.log('Form submission started:', { formData })
    
    if (!validateForm()) {
      console.log('Form validation failed:', errors)
      setIsSubmitting(false)
      return
    }
    
    console.log('Form validation passed')

    try {
      // Determine actual project type based on system type
      let finalProjectType: ProjectType = formData.projectType || 'RESIDENTIAL'
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
        estimatedRevenue: parseFloat(formData.estimatedBudget) || undefined,
        contactPreference: formData.contactPreference
      }

      console.log('Calling onSubmit with:', newRequest)
      await onSubmit(newRequest)
      console.log('Form submission successful')
      resetForm()
      
    } catch (error) {
      console.error('Form submission error:', error)
      setErrors({
        general: error instanceof Error ? error.message : 'Bir hata oluştu. Lütfen tekrar deneyin.'
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const resetForm = () => {
    setFormData({
      customerName: prefilledCustomer?.name || '',
      customerEmail: prefilledCustomer?.email || '',
      customerPhone: prefilledCustomer?.phone || '',
      location: prefilledCustomer?.city || '',
      address: prefilledCustomer?.address || '',
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
      preferredVisitDate: '',
      contactPreference: 'PHONE',
      availableTimeSlots: []
    })
    setSelectedCustomer(prefilledCustomer ? {
      id: prefilledCustomer.id || '',
      name: prefilledCustomer.name,
      email: prefilledCustomer.email,
      phone: prefilledCustomer.phone || '',
      company: '',
      previousProjects: 0,
      totalCapacity: 0
    } : null)
    setActiveTab('customer')
    setErrors({})
  }

  const handleClose = () => {
    resetForm()
    onClose()
  }

  const isTabValid = (tab: string) => {
    switch (tab) {
      case 'customer':
        return formData.customerName && formData.customerEmail && !errors.customerName && !errors.customerEmail
      case 'project':
        return formData.projectType && formData.location && !errors.projectType && !errors.location
      case 'details':
        return true
      default:
        return false
    }
  }

  const getFormProgress = () => {
    let completedFields = 0
    const totalFields = 6 // Required fields count
    
    if (formData.customerName) completedFields++
    if (formData.customerEmail) completedFields++
    if (formData.location) completedFields++
    if (formData.projectType) completedFields++
    if (formData.source) completedFields++
    if (formData.contactPreference) completedFields++
    
    return Math.round((completedFields / totalFields) * 100)
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[95vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl flex items-center gap-2">
            <FileText className="h-6 w-6 text-primary" />
            Yeni Proje Talebi
          </DialogTitle>
          <DialogDescription className="flex items-center justify-between">
            <span>Müşteri bilgilerini ve proje detaylarını girerek yeni talep oluşturun</span>
            <div className="flex items-center gap-2 text-sm">
              <span>Tamamlama: {getFormProgress()}%</span>
              <Progress value={getFormProgress()} className="w-16 h-2" />
            </div>
          </DialogDescription>
        </DialogHeader>

        {/* General Error Alert */}
        {errors.general && (
          <Alert className="border-red-200 bg-red-50 mb-4">
            <AlertTriangle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800">
              {errors.general}
            </AlertDescription>
          </Alert>
        )}
        
        <form onSubmit={handleSubmit}>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-4">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="customer" className="flex items-center gap-2">
                <User className="h-4 w-4" />
                Müşteri Bilgileri
                {isTabValid('customer') ? (
                  <CheckCircle className="h-3 w-3 ml-1 text-green-600" />
                ) : (
                  errors.customerName || errors.customerEmail ? (
                    <AlertTriangle className="h-3 w-3 ml-1 text-red-600" />
                  ) : null
                )}
              </TabsTrigger>
              <TabsTrigger value="project" className="flex items-center gap-2">
                <Sun className="h-4 w-4" />
                Proje Detayları
                {isTabValid('project') ? (
                  <CheckCircle className="h-3 w-3 ml-1 text-green-600" />
                ) : (
                  errors.projectType || errors.location ? (
                    <AlertTriangle className="h-3 w-3 ml-1 text-red-600" />
                  ) : null
                )}
              </TabsTrigger>
              <TabsTrigger value="details" className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Ek Bilgiler
              </TabsTrigger>
            </TabsList>

            <TabsContent value="customer" className="space-y-4 mt-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Müşteri Seçimi</CardTitle>
                  <CardDescription>
                    Mevcut müşteri seçin veya yeni müşteri bilgilerini girin
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Enhanced Customer Search */}
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
                              <span className="flex items-center gap-2">
                                <User className="h-4 w-4" />
                                {selectedCustomer.name}
                              </span>
                              {selectedCustomer.previousProjects && selectedCustomer.previousProjects > 0 && (
                                <Badge variant="secondary" className="ml-2">
                                  {selectedCustomer.previousProjects} önceki proje
                                </Badge>
                              )}
                            </div>
                          ) : (
                            <span className="text-muted-foreground flex items-center gap-2">
                              <Search className="h-4 w-4" />
                              Müşteri seçin veya yeni ekleyin...
                            </span>
                          )}
                          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-full p-0">
                        <Command shouldFilter={false}>
                          <CommandInput 
                            placeholder="İsim, e-posta veya telefon ile ara..." 
                            value={searchQuery}
                            onValueChange={setSearchQuery}
                          />
                          <CommandList>
                            {isSearching ? (
                              <div className="p-4 text-center">
                                <div className="flex items-center justify-center gap-2">
                                  <div className="animate-spin w-4 h-4 border-2 border-primary border-t-transparent rounded-full" />
                                  <span className="text-sm text-muted-foreground">Aranıyor...</span>
                                </div>
                              </div>
                            ) : searchError ? (
                              <div className="p-4 text-center">
                                <Alert className="border-red-200 bg-red-50">
                                  <AlertTriangle className="h-4 w-4 text-red-600" />
                                  <AlertDescription className="text-red-800">
                                    Arama sırasında hata: {searchError}
                                  </AlertDescription>
                                </Alert>
                              </div>
                            ) : (
                              <>
                                <CommandEmpty>
                                  <div className="p-4 text-center">
                                    <p className="text-sm text-muted-foreground mb-2">Müşteri bulunamadı</p>
                                    <Button 
                                      type="button" 
                                      variant="link" 
                                      className="text-xs"
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
                                      className="cursor-pointer p-3"
                                    >
                                      <div className="flex flex-col w-full">
                                        <div className="flex items-center justify-between">
                                          <span className="font-medium">{customer.name}</span>
                                          <div className="flex items-center gap-1">
                                            {customer.company && (
                                              <Badge variant="outline" className="text-xs">{customer.company}</Badge>
                                            )}
                                            {customer.previousProjects && customer.previousProjects > 0 && (
                                              <Badge variant="secondary" className="text-xs">
                                                {customer.previousProjects} proje
                                              </Badge>
                                            )}
                                          </div>
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
                                        {customer.totalCapacity && customer.totalCapacity > 0 && (
                                          <div className="text-xs text-muted-foreground mt-1">
                                            <span className="flex items-center gap-1">
                                              <Zap className="h-3 w-3" />
                                              {customer.totalCapacity} kW toplam kapasite
                                            </span>
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

                  <Separator />

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
                        className={errors.customerName ? 'border-red-300' : ''}
                        required
                      />
                      {errors.customerName && (
                        <p className="text-sm text-red-600 flex items-center gap-1">
                          <AlertTriangle className="h-3 w-3" />
                          {errors.customerName}
                        </p>
                      )}
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
                        className={errors.customerEmail ? 'border-red-300' : ''}
                        required
                      />
                      {errors.customerEmail && (
                        <p className="text-sm text-red-600 flex items-center gap-1">
                          <AlertTriangle className="h-3 w-3" />
                          {errors.customerEmail}
                        </p>
                      )}
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
                        className={errors.customerPhone ? 'border-red-300' : ''}
                      />
                      {errors.customerPhone && (
                        <p className="text-sm text-red-600 flex items-center gap-1">
                          <AlertTriangle className="h-3 w-3" />
                          {errors.customerPhone}
                        </p>
                      )}
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="contactPreference">İletişim Tercihi</Label>
                      <Select 
                        value={formData.contactPreference} 
                        onValueChange={(value) => handleInputChange('contactPreference', value)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="PHONE">
                            <div className="flex items-center gap-2">
                              <Phone className="h-4 w-4" />
                              Telefon
                            </div>
                          </SelectItem>
                          <SelectItem value="EMAIL">
                            <div className="flex items-center gap-2">
                              <Mail className="h-4 w-4" />
                              E-posta
                            </div>
                          </SelectItem>
                          <SelectItem value="WHATSAPP">
                            <div className="flex items-center gap-2">
                              <MessageCircle className="h-4 w-4" />
                              WhatsApp
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Enhanced Source Selection */}
                  <div className="space-y-2">
                    <Label>Müşteri Kaynağı</Label>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                      {Object.entries(REQUEST_SOURCE_LABELS).map(([value, label]) => {
                        const Icon = sourceIcons[value as keyof typeof sourceIcons]
                        return (
                          <Card
                            key={value}
                            className={cn(
                              "cursor-pointer transition-all hover:shadow-sm p-2",
                              formData.source === value && "ring-2 ring-primary bg-primary/5"
                            )}
                            onClick={() => handleInputChange('source', value)}
                          >
                            <div className="flex items-center gap-2 text-sm">
                              <Icon className="h-4 w-4" />
                              <span className="truncate">{label}</span>
                            </div>
                          </Card>
                        )
                      })}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="project" className="space-y-4 mt-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Proje Detayları</CardTitle>
                  <CardDescription>
                    Kurulum yapılacak alan ve sistem tipini belirtin
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Location */}
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
                        className={errors.location ? 'border-red-300' : ''}
                        required
                      />
                      {errors.location && (
                        <p className="text-sm text-red-600 flex items-center gap-1">
                          <AlertTriangle className="h-3 w-3" />
                          {errors.location}
                        </p>
                      )}
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
                        className={errors.estimatedCapacity ? 'border-red-300' : ''}
                      />
                      {errors.estimatedCapacity && (
                        <p className="text-sm text-red-600 flex items-center gap-1">
                          <AlertTriangle className="h-3 w-3" />
                          {errors.estimatedCapacity}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Project Type Selection */}
                  <div className="space-y-3">
                    <Label className="flex items-center gap-2">
                      Kurulum Alanı *
                      {errors.projectType && (
                        <AlertTriangle className="h-3 w-3 text-red-600" />
                      )}
                    </Label>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {(['RESIDENTIAL', 'COMMERCIAL', 'INDUSTRIAL', 'AGRICULTURAL'] as ProjectType[]).map((type) => {
                        const Icon = projectTypeIcons[type]
                        return (
                          <Card
                            key={type}
                            className={cn(
                              "cursor-pointer transition-all hover:shadow-md p-4 text-center",
                              formData.projectType === type && "ring-2 ring-primary bg-primary/5",
                              errors.projectType && "border-red-300"
                            )}
                            onClick={() => handleInputChange('projectType', type)}
                          >
                            <Icon className="h-8 w-8 mx-auto mb-2 text-primary" />
                            <p className="text-sm font-medium">{PROJECT_TYPE_LABELS[type]}</p>
                          </Card>
                        )
                      })}
                    </div>
                    {errors.projectType && (
                      <p className="text-sm text-red-600 flex items-center gap-1">
                        <AlertTriangle className="h-3 w-3" />
                        {errors.projectType}
                      </p>
                    )}
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
                          "cursor-pointer p-4",
                          formData.systemType === 'ONGRID' && "ring-2 ring-primary bg-primary/5"
                        )}>
                          <RadioGroupItem value="ONGRID" id="ongrid" className="sr-only" />
                          <Label htmlFor="ongrid" className="cursor-pointer">
                            <div className="flex items-center gap-3">
                              <Wifi className="h-5 w-5 text-green-600" />
                              <div>
                                <p className="font-medium">On-Grid</p>
                                <p className="text-xs text-muted-foreground">Şebeke bağlantılı sistem</p>
                              </div>
                            </div>
                          </Label>
                        </Card>

                        <Card className={cn(
                          "cursor-pointer p-4",
                          formData.systemType === 'OFFGRID' && "ring-2 ring-primary bg-primary/5"
                        )}>
                          <RadioGroupItem value="OFFGRID" id="offgrid" className="sr-only" />
                          <Label htmlFor="offgrid" className="cursor-pointer">
                            <div className="flex items-center gap-3">
                              <WifiOff className="h-5 w-5 text-orange-600" />
                              <div>
                                <p className="font-medium">Off-Grid</p>
                                <p className="text-xs text-muted-foreground">Bağımsız sistem</p>
                              </div>
                            </div>
                          </Label>
                        </Card>

                        <Card className={cn(
                          "cursor-pointer p-4",
                          formData.systemType === 'HYBRID' && "ring-2 ring-primary bg-primary/5"
                        )}>
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
                        </Card>
                      </div>
                    </RadioGroup>
                    {errors.systemType && (
                      <p className="text-sm text-red-600 flex items-center gap-1">
                        <AlertTriangle className="h-3 w-3" />
                        {errors.systemType}
                      </p>
                    )}
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

                  <div className="space-y-2">
                    <Label htmlFor="address">Detaylı Adres</Label>
                    <Textarea
                      id="address"
                      value={formData.address}
                      onChange={(e) => handleInputChange('address', e.target.value)}
                      placeholder="Kurulum yapılacak detaylı adres bilgisi..."
                      rows={2}
                      className={errors.address ? 'border-red-300' : ''}
                    />
                    {errors.address && (
                      <p className="text-sm text-red-600 flex items-center gap-1">
                        <AlertTriangle className="h-3 w-3" />
                        {errors.address}
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="details" className="space-y-4 mt-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Ek Bilgiler ve Tercihler</CardTitle>
                  <CardDescription>
                    Proje ile ilgili ek detayları ve tercihlerinizi belirtin
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
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
                        className={errors.estimatedBudget ? 'border-red-300' : ''}
                      />
                      {errors.estimatedBudget && (
                        <p className="text-sm text-red-600 flex items-center gap-1">
                          <AlertTriangle className="h-3 w-3" />
                          {errors.estimatedBudget}
                        </p>
                      )}
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
                        className={errors.preferredVisitDate ? 'border-red-300' : ''}
                      />
                      {errors.preferredVisitDate && (
                        <p className="text-sm text-red-600 flex items-center gap-1">
                          <AlertTriangle className="h-3 w-3" />
                          {errors.preferredVisitDate}
                        </p>
                      )}
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
                      className={errors.tags ? 'border-red-300' : ''}
                    />
                    {errors.tags && (
                      <p className="text-sm text-red-600 flex items-center gap-1">
                        <AlertTriangle className="h-3 w-3" />
                        {errors.tags}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Proje Notları ve Özel İstekler</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => handleInputChange('description', e.target.value)}
                      placeholder="Müşteri istekleri, özel durumlar, dikkat edilmesi gerekenler..."
                      rows={4}
                      className={errors.description ? 'border-red-300' : ''}
                    />
                    {errors.description && (
                      <p className="text-sm text-red-600 flex items-center gap-1">
                        <AlertTriangle className="h-3 w-3" />
                        {errors.description}
                      </p>
                    )}
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

                  {/* Success Tip */}
                  <Alert className="border-blue-200 bg-blue-50">
                    <Info className="h-4 w-4 text-blue-600" />
                    <AlertDescription className="text-blue-800">
                      <strong>İpucu:</strong> Detaylı bilgi sağladığınız talepler daha hızlı işleme alınır ve daha doğru fiyatlandırma yapılır.
                    </AlertDescription>
                  </Alert>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* Comprehensive Validation Message */}
          {(!formData.customerName || !formData.customerEmail || !formData.projectType || !formData.location || !formData.systemType || !formData.contactPreference || !formData.source || !formData.priority || Object.keys(errors).length > 0) && (
            <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
              <div className="flex items-center gap-2 text-amber-800">
                <AlertTriangle className="h-4 w-4" />
                <span className="font-medium">Form Durumu:</span>
              </div>
              
              {/* Required fields that are missing */}
              {(!formData.customerName || !formData.customerEmail || !formData.projectType || !formData.location || !formData.systemType || !formData.contactPreference || !formData.source || !formData.priority) && (
                <div className="mt-2">
                  <p className="text-sm font-medium text-amber-800 mb-1">Eksik Zorunlu Alanlar:</p>
                  <ul className="text-sm text-amber-700 list-disc list-inside">
                    {!formData.customerName && <li>Müşteri Adı</li>}
                    {!formData.customerEmail && <li>E-posta Adresi</li>}
                    {!formData.projectType && <li>Proje Türü</li>}
                    {!formData.location && <li>Konum Bilgisi</li>}
                    {!formData.systemType && <li>Sistem Tipi</li>}
                    {!formData.contactPreference && <li>İletişim Tercihi</li>}
                    {!formData.source && <li>Müşteri Kaynağı</li>}
                    {!formData.priority && <li>Öncelik Durumu</li>}
                  </ul>
                </div>
              )}
              
              {/* Validation errors */}
              {Object.keys(errors).length > 0 && (
                <div className="mt-2">
                  <p className="text-sm font-medium text-red-800 mb-1">Düzeltilmesi Gereken Hatalar:</p>
                  <ul className="text-sm text-red-700 list-disc list-inside">
                    {Object.entries(errors).map(([field, error]) => 
                      error && <li key={field}>{error}</li>
                    )}
                  </ul>
                </div>
              )}
            </div>
          )}

          <DialogFooter className="mt-6">
            <Button type="button" variant="outline" onClick={handleClose}>
              İptal
            </Button>
            <Button 
              type="submit"
              disabled={isSubmitting || !formData.customerName || !formData.customerEmail || !formData.projectType || !formData.location || !formData.systemType || !formData.contactPreference || !formData.source || !formData.priority || Object.keys(errors).length > 0}
              className="min-w-[120px]"
            >
              {isSubmitting ? (
                <div className="flex items-center gap-2">
                  <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
                  Gönderiliyor...
                </div>
              ) : (
                'Talep Oluştur'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}