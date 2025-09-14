'use client'

import { useState, useEffect, useRef } from 'react'
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
  const [completedTabs, setCompletedTabs] = useState<Set<string>>(new Set())
  const [autoProgressEnabled, setAutoProgressEnabled] = useState(true)
  const progressTimeout = useRef<NodeJS.Timeout | null>(null)
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
        return !!(
          formData.customerName &&
          formData.customerEmail &&
          formData.customerPhone &&
          !errors.customerName &&
          !errors.customerEmail &&
          !errors.customerPhone
        )
      case 'project':
        return !!(
          formData.projectType &&
          formData.location &&
          !errors.projectType &&
          !errors.location
        )
      case 'details':
        return !!(
          formData.contactPreference &&
          formData.source &&
          formData.priority &&
          !errors.contactPreference &&
          !errors.source &&
          !errors.priority
        )
      default:
        return false
    }
  }

  // Auto-progression logic
  const getNextTab = (currentTab: string): string | null => {
    switch (currentTab) {
      case 'customer':
        return 'project'
      case 'project':
        return 'details'
      case 'details':
        return null // No next tab
      default:
        return null
    }
  }

  const autoProgressToNextTab = (currentTab: string) => {
    if (!autoProgressEnabled) return

    const nextTab = getNextTab(currentTab)
    if (nextTab) {
      // Clear any existing timeout
      if (progressTimeout.current) {
        clearTimeout(progressTimeout.current)
      }

      // Set a timeout for smooth transition
      progressTimeout.current = setTimeout(() => {
        setActiveTab(nextTab)
        // Update completed tabs
        setCompletedTabs(prev => new Set([...prev, currentTab]))
      }, 1500) // 1.5 second delay for smooth user experience
    }
  }

  // Monitor tab completion and trigger auto-progression
  useEffect(() => {
    const currentTabValid = isTabValid(activeTab)

    if (currentTabValid) {
      // Mark current tab as completed
      setCompletedTabs(prev => new Set([...prev, activeTab]))

      // Auto-progress to next tab
      autoProgressToNextTab(activeTab)
    } else {
      // Clear any pending progression if tab becomes invalid
      if (progressTimeout.current) {
        clearTimeout(progressTimeout.current)
        progressTimeout.current = null
      }

      // Remove from completed tabs if it becomes invalid
      setCompletedTabs(prev => {
        const newSet = new Set(prev)
        newSet.delete(activeTab)
        return newSet
      })
    }

    // Cleanup timeout on unmount or activeTab change
    return () => {
      if (progressTimeout.current) {
        clearTimeout(progressTimeout.current)
        progressTimeout.current = null
      }
    }
  }, [activeTab, formData, errors, autoProgressEnabled])

  // Enhanced form progress tracking
  const getFormProgress = () => {
    const requiredFields = [
      'customerName',
      'customerEmail',
      'location',
      'projectType',
      'systemType',
      'contactPreference',
      'source',
      'priority'
    ]

    let completedFields = 0
    const totalFields = requiredFields.length

    requiredFields.forEach(field => {
      if (formData[field as keyof typeof formData]) {
        completedFields++
      }
    })

    return {
      completed: completedFields,
      total: totalFields,
      percentage: Math.round((completedFields / totalFields) * 100)
    }
  }

  // Get missing required fields for validation summary
  const getMissingFields = () => {
    const missingFields: Array<{field: string, label: string}> = []

    if (!formData.customerName) missingFields.push({field: 'customerName', label: 'Müşteri Adı'})
    if (!formData.customerEmail) missingFields.push({field: 'customerEmail', label: 'E-posta Adresi'})
    if (!formData.location) missingFields.push({field: 'location', label: 'Konum Bilgisi'})
    if (!formData.projectType) missingFields.push({field: 'projectType', label: 'Proje Türü'})
    if (!formData.systemType) missingFields.push({field: 'systemType', label: 'Sistem Tipi'})
    if (!formData.contactPreference) missingFields.push({field: 'contactPreference', label: 'İletişim Tercihi'})
    if (!formData.source) missingFields.push({field: 'source', label: 'Müşteri Kaynağı'})
    if (!formData.priority) missingFields.push({field: 'priority', label: 'Öncelik Durumu'})

    return missingFields
  }

  // Get validation errors list
  const getValidationErrors = () => {
    return Object.entries(errors)
      .filter(([_, error]) => error)
      .map(([field, error]) => ({field, error}))
  }

  // Check if form can be submitted
  const canSubmitForm = () => {
    const missingFields = getMissingFields()
    const validationErrors = getValidationErrors()
    return missingFields.length === 0 && validationErrors.length === 0
  }

  // Get field styling based on validation state
  const getFieldClassName = (fieldName: string, baseClassName: string = '') => {
    const hasError = errors[fieldName as keyof FormErrors]
    const isMissing = getMissingFields().some(field => field.field === fieldName)
    const hasValue = formData[fieldName as keyof typeof formData]

    let className = baseClassName

    if (hasError) {
      className += ' border-red-300 bg-red-50/50 focus:border-red-400 focus:ring-red-400/20'
    } else if (isMissing && !hasValue) {
      className += ' border-amber-300 bg-amber-50/30 focus:border-amber-400 focus:ring-amber-400/20'
    } else if (hasValue) {
      className += ' border-green-300 bg-green-50/20 focus:border-green-400 focus:ring-green-400/20'
    }

    return className
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-[95vw] lg:max-w-7xl max-h-[95vh] overflow-y-auto">
        <DialogHeader className="bg-gradient-to-r from-orange-500 via-orange-400 to-yellow-400 p-3 rounded-t-lg -m-6 mb-3">
          <DialogTitle className="text-lg flex items-center gap-2 text-white">
            <FileText className="h-4 w-4" />
            Yeni Proje Talebi
          </DialogTitle>
          <DialogDescription className="text-orange-50 text-xs">
            Müşteri bilgilerini ve proje detaylarını girerek yeni talep oluşturun
          </DialogDescription>
          <div className="flex items-center justify-end gap-2 text-xs text-orange-100 mt-1">
            <span>
              {getFormProgress().completed}/{getFormProgress().total} tamamlandı ({getFormProgress().percentage}%)
              {autoProgressEnabled && completedTabs.size > 0 && (
                <span className="ml-2 text-xs bg-orange-600 px-1.5 py-0.5 rounded">
                  {completedTabs.size}/3 bölüm
                </span>
              )}
            </span>
            <Progress value={getFormProgress().percentage} className="w-12 h-1" />
          </div>
        </DialogHeader>

        {/* Auto-progression notification - more compact */}
        {autoProgressEnabled && isTabValid(activeTab) && getNextTab(activeTab) && (
          <Alert className="border-orange-200 bg-orange-50 py-2">
            <Info className="h-3 w-3 text-orange-600" />
            <AlertDescription className="text-orange-800 text-xs">
              Bu bölüm tamamlandı! {getNextTab(activeTab) === 'project' ? 'Proje Detayları' : getNextTab(activeTab) === 'details' ? 'Ek Bilgiler' : ''} sekmesine geçiliyor...
            </AlertDescription>
          </Alert>
        )}

        {/* General Error Alert */}
        {errors.general && (
          <Alert className="border-red-200 bg-red-50 mb-3 py-2">
            <AlertTriangle className="h-3 w-3 text-red-600" />
            <AlertDescription className="text-red-800 text-xs">
              {errors.general}
            </AlertDescription>
          </Alert>
        )}
        
        <form onSubmit={handleSubmit}>
          <Tabs value={activeTab} onValueChange={(tab) => {
            // Clear any pending auto-progression
            if (progressTimeout.current) {
              clearTimeout(progressTimeout.current)
              progressTimeout.current = null
            }

            // Temporarily disable auto-progression for manual navigation
            setAutoProgressEnabled(false)
            setActiveTab(tab)

            // Re-enable auto-progression after a short delay
            setTimeout(() => setAutoProgressEnabled(true), 2000)
          }} className="mt-2">
            <TabsList className="grid w-full grid-cols-3 bg-orange-50 h-9">
              <TabsTrigger value="customer" className={cn(
                "flex items-center gap-1 text-xs data-[state=active]:bg-orange-500 data-[state=active]:text-white py-1",
                completedTabs.has('customer') && "bg-green-50 text-green-700"
              )}>
                <User className="h-3 w-3" />
                <span className="hidden sm:inline">Müşteri</span>
                {completedTabs.has('customer') ? (
                  <CheckCircle className="h-2.5 w-2.5 ml-0.5 text-green-600" />
                ) : isTabValid('customer') ? (
                  <CheckCircle className="h-2.5 w-2.5 ml-0.5 text-green-600 animate-pulse" />
                ) : (
                  errors.customerName || errors.customerEmail || errors.customerPhone ? (
                    <AlertTriangle className="h-2.5 w-2.5 ml-0.5 text-red-600" />
                  ) : null
                )}
              </TabsTrigger>
              <TabsTrigger value="project" className={cn(
                "flex items-center gap-1 text-xs data-[state=active]:bg-orange-500 data-[state=active]:text-white py-1",
                completedTabs.has('project') && "bg-green-50 text-green-700"
              )}>
                <Sun className="h-3 w-3" />
                <span className="hidden sm:inline">Proje</span>
                {completedTabs.has('project') ? (
                  <CheckCircle className="h-2.5 w-2.5 ml-0.5 text-green-600" />
                ) : isTabValid('project') ? (
                  <CheckCircle className="h-2.5 w-2.5 ml-0.5 text-green-600 animate-pulse" />
                ) : (
                  errors.projectType || errors.location ? (
                    <AlertTriangle className="h-2.5 w-2.5 ml-0.5 text-red-600" />
                  ) : null
                )}
              </TabsTrigger>
              <TabsTrigger value="details" className={cn(
                "flex items-center gap-1 text-xs data-[state=active]:bg-orange-500 data-[state=active]:text-white py-1",
                completedTabs.has('details') && "bg-green-50 text-green-700"
              )}>
                <FileText className="h-3 w-3" />
                <span className="hidden sm:inline">Detaylar</span>
                {completedTabs.has('details') ? (
                  <CheckCircle className="h-2.5 w-2.5 ml-0.5 text-green-600" />
                ) : isTabValid('details') ? (
                  <CheckCircle className="h-2.5 w-2.5 ml-0.5 text-green-600 animate-pulse" />
                ) : (
                  errors.contactPreference || errors.source || errors.priority ? (
                    <AlertTriangle className="h-2.5 w-2.5 ml-0.5 text-red-600" />
                  ) : null
                )}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="customer" className="space-y-2 mt-3">
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-3">
                {/* Customer Search Section */}
                <Card className="border-orange-100">
                  <CardHeader className="pb-2 p-3">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <User className="h-3 w-3 text-orange-600" />
                      Müşteri Seçimi
                    </CardTitle>
                    <CardDescription className="text-xs">
                      Mevcut müşteri seçin veya yeni ekleyin
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-2 pt-0 p-3">
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
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    <div className="space-y-1">
                      <Label htmlFor="customerName" className="flex items-center gap-1 text-xs">
                        <User className="h-3 w-3" />
                        Müşteri Adı *
                      </Label>
                      <Input
                        id="customerName"
                        value={formData.customerName}
                        onChange={(e) => handleInputChange('customerName', e.target.value)}
                        placeholder="Ahmet Yılmaz"
                        className={cn(getFieldClassName('customerName'), "h-8 text-sm")}
                        required
                      />
                      {errors.customerName && (
                        <p className="text-xs text-red-600 flex items-center gap-1">
                          <AlertTriangle className="h-2.5 w-2.5" />
                          {errors.customerName}
                        </p>
                      )}
                    </div>
                    
                    <div className="space-y-1">
                      <Label htmlFor="customerEmail" className="flex items-center gap-1 text-xs">
                        <Mail className="h-3 w-3" />
                        E-posta *
                      </Label>
                      <Input
                        id="customerEmail"
                        type="email"
                        value={formData.customerEmail}
                        onChange={(e) => handleInputChange('customerEmail', e.target.value)}
                        placeholder="ahmet@example.com"
                        className={cn(getFieldClassName('customerEmail'), "h-8 text-sm")}
                        required
                      />
                      {errors.customerEmail && (
                        <p className="text-xs text-red-600 flex items-center gap-1">
                          <AlertTriangle className="h-2.5 w-2.5" />
                          {errors.customerEmail}
                        </p>
                      )}
                    </div>
                    
                    <div className="space-y-1">
                      <Label htmlFor="customerPhone" className="flex items-center gap-1 text-xs">
                        <Phone className="h-3 w-3" />
                        Telefon
                      </Label>
                      <Input
                        id="customerPhone"
                        value={formData.customerPhone}
                        onChange={(e) => handleInputChange('customerPhone', e.target.value)}
                        placeholder="+90 532 123 4567"
                        className={cn(getFieldClassName('customerPhone'), "h-8 text-sm")}
                      />
                      {errors.customerPhone && (
                        <p className="text-xs text-red-600 flex items-center gap-1">
                          <AlertTriangle className="h-2.5 w-2.5" />
                          {errors.customerPhone}
                        </p>
                      )}
                    </div>

                    <div className="space-y-1">
                      <Label htmlFor="contactPreference" className="text-xs">İletişim Tercihi</Label>
                      <Select
                        value={formData.contactPreference}
                        onValueChange={(value) => handleInputChange('contactPreference', value)}
                      >
                        <SelectTrigger className="h-8 text-sm">
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
                  <div className="space-y-1">
                    <Label className="text-xs">Müşteri Kaynağı</Label>
                    <div className="grid grid-cols-4 md:grid-cols-8 gap-1">
                      {Object.entries(REQUEST_SOURCE_LABELS).map(([value, label]) => {
                        const Icon = sourceIcons[value as keyof typeof sourceIcons]
                        return (
                          <Card
                            key={value}
                            className={cn(
                              "cursor-pointer transition-all hover:shadow-sm p-1",
                              formData.source === value && "ring-1 ring-orange-400 bg-orange-50"
                            )}
                            onClick={() => handleInputChange('source', value)}
                          >
                            <div className="flex flex-col items-center gap-0.5 text-xs">
                              <Icon className="h-3 w-3" />
                              <span className="text-xs truncate">{label}</span>
                            </div>
                          </Card>
                        )
                      })}
                    </div>
                  </div>
                </CardContent>
              </Card>
              </div>
            </TabsContent>

            <TabsContent value="project" className="space-y-2 mt-3">
              <Card className="border-orange-100">
                <CardHeader className="pb-2 p-3">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Sun className="h-3 w-3 text-orange-600" />
                    Proje Detayları
                  </CardTitle>
                  <CardDescription className="text-xs">
                    Kurulum yapılacak alan ve sistem tipini belirtin
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-2 pt-0 p-3">
                  {/* Location */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    <div className="space-y-1">
                      <Label htmlFor="location" className="flex items-center gap-1 text-xs">
                        <MapPin className="h-3 w-3" />
                        Konum *
                      </Label>
                      <Input
                        id="location"
                        value={formData.location}
                        onChange={(e) => handleInputChange('location', e.target.value)}
                        placeholder="İstanbul, Kadıköy"
                        className={cn(getFieldClassName('location'), "h-8 text-sm")}
                        required
                      />
                      {errors.location && (
                        <p className="text-xs text-red-600 flex items-center gap-1">
                          <AlertTriangle className="h-2.5 w-2.5" />
                          {errors.location}
                        </p>
                      )}
                    </div>

                    <div className="space-y-1">
                      <Label htmlFor="estimatedCapacity" className="text-xs">Tahmini Kapasite (kW)</Label>
                      <Input
                        id="estimatedCapacity"
                        type="number"
                        value={formData.estimatedCapacity}
                        onChange={(e) => handleInputChange('estimatedCapacity', e.target.value)}
                        placeholder="25"
                        min="0"
                        step="0.1"
                        className={cn(errors.estimatedCapacity ? 'border-red-300' : '', "h-8 text-sm")}
                      />
                      {errors.estimatedCapacity && (
                        <p className="text-xs text-red-600 flex items-center gap-1">
                          <AlertTriangle className="h-2.5 w-2.5" />
                          {errors.estimatedCapacity}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Project Type Selection */}
                  <div className="space-y-1">
                    <Label className="flex items-center gap-1 text-xs">
                      Kurulum Alanı *
                      {errors.projectType && (
                        <AlertTriangle className="h-2.5 w-2.5 text-red-600" />
                      )}
                    </Label>
                    <div className="grid grid-cols-4 gap-1">
                      {(['RESIDENTIAL', 'COMMERCIAL', 'INDUSTRIAL', 'AGRICULTURAL'] as ProjectType[]).map((type) => {
                        const Icon = projectTypeIcons[type]
                        return (
                          <Card
                            key={type}
                            className={cn(
                              "cursor-pointer transition-all hover:shadow-sm p-2 text-center",
                              formData.projectType === type && "ring-1 ring-orange-400 bg-orange-50",
                              errors.projectType && "border-red-300",
                              !formData.projectType && getMissingFields().some(field => field.field === 'projectType') && "border-amber-300 bg-amber-50/30"
                            )}
                            onClick={() => handleInputChange('projectType', type)}
                          >
                            <Icon className="h-4 w-4 mx-auto mb-1 text-orange-600" />
                            <p className="text-xs font-medium">{PROJECT_TYPE_LABELS[type]}</p>
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
                  <div className="space-y-1">
                    <Label className="text-xs">Sistem Tipi</Label>
                    <RadioGroup
                      value={formData.systemType}
                      onValueChange={(value) => handleInputChange('systemType', value)}
                    >
                      <div className="grid grid-cols-3 gap-1">
                        <Card className={cn(
                          "cursor-pointer p-2",
                          formData.systemType === 'ONGRID' && "ring-1 ring-orange-400 bg-orange-50"
                        )}>
                          <RadioGroupItem value="ONGRID" id="ongrid" className="sr-only" />
                          <Label htmlFor="ongrid" className="cursor-pointer">
                            <div className="flex flex-col items-center gap-1 text-center">
                              <Wifi className="h-3 w-3 text-green-600" />
                              <div>
                                <p className="text-xs font-medium">On-Grid</p>
                                <p className="text-xs text-muted-foreground">Şebeke bağlantılı</p>
                              </div>
                            </div>
                          </Label>
                        </Card>

                        <Card className={cn(
                          "cursor-pointer p-2",
                          formData.systemType === 'OFFGRID' && "ring-1 ring-orange-400 bg-orange-50"
                        )}>
                          <RadioGroupItem value="OFFGRID" id="offgrid" className="sr-only" />
                          <Label htmlFor="offgrid" className="cursor-pointer">
                            <div className="flex flex-col items-center gap-1 text-center">
                              <WifiOff className="h-3 w-3 text-orange-600" />
                              <div>
                                <p className="text-xs font-medium">Off-Grid</p>
                                <p className="text-xs text-muted-foreground">Bağımsız sistem</p>
                              </div>
                            </div>
                          </Label>
                        </Card>

                        <Card className={cn(
                          "cursor-pointer p-2",
                          formData.systemType === 'HYBRID' && "ring-1 ring-orange-400 bg-orange-50"
                        )}>
                          <RadioGroupItem value="HYBRID" id="hybrid" className="sr-only" />
                          <Label htmlFor="hybrid" className="cursor-pointer">
                            <div className="flex flex-col items-center gap-1 text-center">
                              <Zap className="h-3 w-3 text-orange-600" />
                              <div>
                                <p className="text-xs font-medium">Hibrit</p>
                                <p className="text-xs text-muted-foreground">Depolamalı sistem</p>
                              </div>
                            </div>
                          </Label>
                        </Card>
                      </div>
                    </RadioGroup>
                    {errors.systemType && (
                      <p className="text-xs text-red-600 flex items-center gap-1">
                        <AlertTriangle className="h-2.5 w-2.5" />
                        {errors.systemType}
                      </p>
                    )}
                  </div>

                  {/* Storage Option */}
                  {formData.systemType === 'ONGRID' && (
                    <div className="flex items-center space-x-2 p-2 bg-orange-50 rounded-md">
                      <input
                        type="checkbox"
                        id="includeStorage"
                        checked={formData.includeStorage}
                        onChange={(e) => handleInputChange('includeStorage', e.target.checked)}
                        className="h-3 w-3"
                      />
                      <Label htmlFor="includeStorage" className="flex items-center gap-1 cursor-pointer text-xs">
                        <Battery className="h-3 w-3 text-yellow-600" />
                        Enerji depolama sistemi ekle
                      </Label>
                    </div>
                  )}

                  <div className="space-y-1.5">
                    <Label htmlFor="address" className="text-sm">Detaylı Adres</Label>
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

            <TabsContent value="details" className="space-y-2 mt-3">
              <Card className="border-orange-100">
                <CardHeader className="pb-2 p-3">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <FileText className="h-3 w-3 text-orange-600" />
                    Ek Bilgiler ve Tercihler
                  </CardTitle>
                  <CardDescription className="text-xs">
                    Proje ile ilgili ek detayları ve tercihlerinizi belirtin
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-2 pt-0 p-3">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    <div className="space-y-1">
                      <Label htmlFor="estimatedBudget" className="flex items-center gap-1 text-xs">
                        <DollarSign className="h-3 w-3" />
                        Tahmini Bütçe (TL)
                      </Label>
                      <Input
                        id="estimatedBudget"
                        type="number"
                        value={formData.estimatedBudget}
                        onChange={(e) => handleInputChange('estimatedBudget', e.target.value)}
                        placeholder="150000"
                        min="0"
                        className={cn(errors.estimatedBudget ? 'border-red-300' : '', "h-8 text-sm")}
                      />
                      {errors.estimatedBudget && (
                        <p className="text-sm text-red-600 flex items-center gap-1">
                          <AlertTriangle className="h-3 w-3" />
                          {errors.estimatedBudget}
                        </p>
                      )}
                    </div>
                    
                    <div className="space-y-1.5">
                      <Label htmlFor="preferredVisitDate" className="flex items-center gap-1.5 text-sm">
                        <Calendar className="h-3.5 w-3.5" />
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

                  <div className="space-y-1.5">
                    <Label htmlFor="priority" className="text-sm">Öncelik Durumu</Label>
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

                  <div className="space-y-1.5">
                    <Label htmlFor="tags" className="flex items-center gap-1.5 text-sm">
                      <Tag className="h-3.5 w-3.5" />
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

                  <div className="space-y-1.5">
                    <Label htmlFor="description" className="text-sm">Proje Notları ve Özel İstekler</Label>
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
                  <div className="space-y-2 p-3 bg-orange-50 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="urgentRequest"
                        checked={formData.urgentRequest}
                        onChange={(e) => handleInputChange('urgentRequest', e.target.checked)}
                        className="h-4 w-4"
                      />
                      <Label htmlFor="urgentRequest" className="flex items-center gap-2 cursor-pointer text-sm">
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
                      <Label htmlFor="hasExistingSystem" className="cursor-pointer text-sm">
                        Mevcut güneş enerjisi sistemi var
                      </Label>
                    </div>
                  </div>

                  {/* Success Tip */}
                  <Alert className="border-orange-200 bg-orange-50">
                    <Info className="h-4 w-4 text-orange-600" />
                    <AlertDescription className="text-orange-800">
                      <strong>İpucu:</strong> Detaylı bilgi sağladığınız talepler daha hızlı işleme alınır ve daha doğru fiyatlandırma yapılır.
                    </AlertDescription>
                  </Alert>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* Enhanced Validation Summary */}
          {(!canSubmitForm() || getMissingFields().length > 0 || getValidationErrors().length > 0) && (
            <div className="mt-3">
              {/* Form Progress Summary */}
              <Card className="border-l-4 border-l-amber-400 bg-amber-50/50">
                <CardContent className="p-3">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4 text-amber-600" />
                      <span className="text-sm font-medium text-amber-800">Form Tamamlama Durumu</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-amber-700">
                      <span>{getFormProgress().completed}/{getFormProgress().total} tamamlandı</span>
                      <Progress value={getFormProgress().percentage} className="w-12 h-1.5" />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                    {/* Missing Required Fields */}
                    {getMissingFields().length > 0 && (
                      <div>
                        <p className="text-sm font-medium text-red-800 mb-2 flex items-center gap-1">
                          <X className="h-3 w-3" />
                          Eksik Zorunlu Alanlar ({getMissingFields().length})
                        </p>
                        <ul className="space-y-1">
                          {getMissingFields().map(({field, label}) => (
                            <li key={field} className="text-sm text-red-700 flex items-center gap-1">
                              <div className="h-1.5 w-1.5 bg-red-500 rounded-full" />
                              {label}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Validation Errors */}
                    {getValidationErrors().length > 0 && (
                      <div>
                        <p className="text-sm font-medium text-red-800 mb-2 flex items-center gap-1">
                          <AlertTriangle className="h-3 w-3" />
                          Düzeltilmesi Gereken Hatalar ({getValidationErrors().length})
                        </p>
                        <ul className="space-y-1">
                          {getValidationErrors().map(({field, error}) => (
                            <li key={field} className="text-sm text-red-700 flex items-center gap-1">
                              <div className="h-1.5 w-1.5 bg-red-500 rounded-full" />
                              {error}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Success State */}
                    {canSubmitForm() && (
                      <div className="md:col-span-2">
                        <div className="flex items-center gap-2 text-green-700 bg-green-50 p-3 rounded-lg border border-green-200">
                          <CheckCircle className="h-4 w-4" />
                          <span className="text-sm font-medium">Tüm gerekli alanlar tamamlandı! Form gönderilebilir.</span>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          <DialogFooter className="mt-4 bg-gradient-to-r from-orange-50 to-yellow-50 p-4 rounded-lg">
            <Button type="button" variant="outline" onClick={handleClose}>
              İptal
            </Button>

            <div className="relative group">
              <Button
                type="submit"
                disabled={isSubmitting || !canSubmitForm()}
                className="min-w-[120px] relative"
              >
                {isSubmitting ? (
                  <div className="flex items-center gap-2">
                    <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
                    Gönderiliyor...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    {canSubmitForm() ? (
                      <CheckCircle className="h-4 w-4" />
                    ) : (
                      <AlertTriangle className="h-4 w-4" />
                    )}
                    Talep Oluştur
                  </div>
                )}
              </Button>

              {/* Custom Tooltip */}
              {!canSubmitForm() && (
                <div className="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-50">
                  <div className="bg-gray-900 text-white text-xs rounded-lg px-3 py-2 max-w-80">
                    <div className="space-y-2">
                      <p className="font-medium">Form gönderilemez çünkü:</p>
                      {getMissingFields().length > 0 && (
                        <div>
                          <p className="text-gray-300">Eksik alanlar:</p>
                          <ul className="text-gray-200 list-disc list-inside pl-2">
                            {getMissingFields().slice(0, 3).map(({field, label}) => (
                              <li key={field}>{label}</li>
                            ))}
                            {getMissingFields().length > 3 && (
                              <li>...ve {getMissingFields().length - 3} alan daha</li>
                            )}
                          </ul>
                        </div>
                      )}
                      {getValidationErrors().length > 0 && (
                        <div>
                          <p className="text-gray-300">Düzeltilmesi gereken hatalar:</p>
                          <ul className="text-gray-200 list-disc list-inside pl-2">
                            {getValidationErrors().slice(0, 2).map(({field, error}) => (
                              <li key={field}>{error}</li>
                            ))}
                            {getValidationErrors().length > 2 && (
                              <li>...ve {getValidationErrors().length - 2} hata daha</li>
                            )}
                          </ul>
                        </div>
                      )}
                    </div>
                    {/* Arrow */}
                    <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
                  </div>
                </div>
              )}
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}