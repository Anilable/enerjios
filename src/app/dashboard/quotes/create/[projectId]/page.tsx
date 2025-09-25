'use client'

import { useState, useEffect, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  ArrowLeft,
  Plus,
  Trash2,
  Calculator,
  Package,
  Zap,
  Battery,
  Wrench,
  Truck,
  FileText,
  Save,
  Send,
  Eye,
  Download,
  Loader2,
  Search
} from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { ProjectRequestAPI } from '@/lib/api/project-requests'
import { ProjectRequest } from '@/types/project-request'
import { formatCurrency } from '@/lib/utils'
import { QuotePreview } from '@/components/quotes/quote-preview'
import { QuoteDeliveryModal } from '@/components/quotes/quote-delivery-modal'
import { ProductType } from '@prisma/client'

// Quote item categories
const QUOTE_CATEGORIES = {
  SOLAR_PANELS: 'Solar Paneller',
  INVERTERS: 'İnverterler',
  BATTERIES: 'Bataryalar',
  MOUNTING_MATERIALS: 'Montaj Malzemeleri',
  CABLES: 'Kablolar',
  MONITORING_SYSTEMS: 'İzleme Sistemleri',
  ACCESSORIES: 'Aksesuarlar',
  AKU: 'AKÜ',
  DC_PUMP: 'DC Pompa',
  CHARGE_CONTROL: 'Şarj Kontrol',
  PROJECT_COST: 'Proje Maliyeti',
  LABOR: 'İşçilik',
  TRANSPORT: 'Nakliye',
  OTHER: 'Diğer'
}

// Helper function to convert project type to Turkish
const getProjectTypeInTurkish = (type: string | undefined) => {
  if (!type) return 'Güneş Enerji Projesi'
  const typeMap: Record<string, string> = {
    'RESIDENTIAL': 'Konut',
    'COMMERCIAL': 'Ticari',
    'INDUSTRIAL': 'Endüstriyel',
    'AGRICULTURAL': 'Tarımsal',
    'ROOFTOP': 'Çatı GES',
    'LAND': 'Arazi GES',
    'AGRISOLAR': 'Tarımsal GES',
    'CARPARK': 'Otopark GES'
  }
  return typeMap[type] || 'Güneş Enerji Projesi'
}

// Helper function to map product category string to quote category
function getCategoryFromProductCategory(productCategory: string): string {
  // Normalize the category string and map to quote categories
  const normalizedCategory = productCategory?.toLowerCase().trim()

  const categoryMap: Record<string, string> = {
    // Solar Panels
    'solar paneller': 'Solar Paneller',
    'panel': 'Solar Paneller',
    'güneş paneli': 'Solar Paneller',
    'solar panel': 'Solar Paneller',

    // Inverters - API'den gelen "İnverter" (tekil) -> "İnverterler" (çoğul)
    'inverterler': 'İnverterler',
    'inverter': 'İnverterler',
    'invertör': 'İnverterler',
    'İnverter': 'İnverterler', // Database'de büyük harfle başlayan

    // Batteries - API'den gelen "Batarya" -> hem "Bataryalar" hem "AKÜ"ye map et
    'bataryalar': 'Bataryalar',
    'batarya': 'Bataryalar', // Database'deki kategori ismi
    'Batarya': 'Bataryalar', // Database'de büyük harfle başlayan
    'battery': 'Bataryalar',
    'akü': 'AKÜ',
    'aku': 'AKÜ',
    'Akü': 'AKÜ',
    'AKÜ': 'AKÜ',

    // Mounting Materials
    'montaj malzemeleri': 'Montaj Malzemeleri',
    'konstrüksiyon': 'Montaj Malzemeleri',
    'mounting': 'Montaj Malzemeleri',

    // Cables
    'kablolar': 'Kablolar',
    'cable': 'Kablolar',
    'kablo': 'Kablolar',
    'Kablo': 'Kablolar',

    // Monitoring Systems
    'izleme sistemleri': 'İzleme Sistemleri',
    'monitoring': 'İzleme Sistemleri',

    // Accessories
    'aksesuarlar': 'Aksesuarlar',
    'accessory': 'Aksesuarlar',
    'Aksesuarlar': 'Aksesuarlar', // Database'de büyük harfle başlayan

    // DC Pump
    'dc pompa': 'DC Pompa',
    'dc pump': 'DC Pompa',

    // Charge Control
    'şarj kontrol': 'Şarj Kontrol',
    'charge controller': 'Şarj Kontrol'
  }

  return categoryMap[normalizedCategory] || 'Diğer'
}

// Legacy function for ProductType (keep for backwards compatibility)
function getCategoryFromType(type: ProductType): string {
  const categoryMap: Record<ProductType, string> = {
    SOLAR_PANEL: 'Panel',
    INVERTER: 'İnverter',
    BATTERY: 'AKÜ',
    MOUNTING_SYSTEM: 'Konstrüksiyon',
    CABLE: 'Diğer',
    MONITORING: 'Diğer',
    ACCESSORY: 'Diğer'
  }
  return categoryMap[type] || 'Diğer'
}

// Package type mapping for UI display
const PACKAGE_TYPE_LABELS: Record<string, string> = {
  ON_GRID: 'Şebekeye Bağlı',
  OFF_GRID: 'Şebekeden Bağımsız',
  TARIMSAL_SULAMA: 'Tarımsal Sulama',
  DC_POMPALAR: 'DC Pompalar'
}

const PACKAGE_TYPE_ICONS: Record<string, string> = {
  ON_GRID: '🔌',
  OFF_GRID: '🔋',
  TARIMSAL_SULAMA: '💧',
  DC_POMPALAR: '⛽'
}

// Package type interface
interface Package {
  id: string
  parentId?: string
  name: string
  description?: string
  type: 'ON_GRID' | 'OFF_GRID' | 'HYBRID' | 'TARIMSAL_SULAMA' | 'AKILLI_SISTEM'
  totalPrice: number
  totalPower?: number
  isActive: boolean
  parent?: Package
  children?: Package[]
  items: Array<{
    productId?: string
    productName: string
    quantity: number
    unitPrice: number
    totalPrice: number
  }>
  createdAt: Date
  updatedAt: Date
}

// Pricing types
const PRICING_TYPES = {
  UNIT: 'Adet',
  KW: 'kW',
  SET: 'Takım',
  METER: 'Metre',
  HOUR: 'Saat',
  FIXED: 'Sabit',
  PERCENTAGE: 'Yüzde'
}

interface QuoteItem {
  id: string
  category: keyof typeof QUOTE_CATEGORIES
  productId?: string
  name: string
  description?: string
  pricingType: keyof typeof PRICING_TYPES
  unitPrice: number
  quantity: number
  discount: number
  tax: number
  subtotal: number
  total: number
}

interface QuoteData {
  id?: string
  quoteNumber?: string
  projectRequestId: string
  customerName: string
  customerEmail: string
  customerPhone: string
  projectType: string
  systemSize?: number
  panelCount?: number
  capacity: number
  items: ExtendedQuoteItem[]
  laborCost?: number
  subtotal: number
  discount: number
  tax: number
  total: number
  validity: number // days
  notes: string
  terms: string
  status: 'DRAFT' | 'SENT' | 'VIEWED' | 'ACCEPTED' | 'REJECTED' | 'EXPIRED'
  createdAt?: Date
  validUntil?: Date
  version?: number
  designData?: {
    location: string
    roofArea: number
    irradiance: number
    tiltAngle: number
    azimuth: number
  }
  financialAnalysis?: {
    annualProduction: number
    annualSavings: number
    paybackPeriod: number
    npv25: number
    irr: number
  }
}

interface ExtendedQuoteItem extends QuoteItem {
  type?: 'PANEL' | 'INVERTER' | 'BATTERY' | 'MOUNTING' | 'OTHER'
  brand?: string
  totalPrice?: number
  specifications?: {
    power?: number
    efficiency?: number
  }
}

// Generate unique quote number with higher entropy
const generateUniqueQuoteNumber = () => {
  const timestamp = Date.now()
  const random = Math.random().toString(36).substring(2, 8).toUpperCase()
  const uuid = crypto.randomUUID().replace(/-/g, '').slice(0, 6).toUpperCase()
  return `Q-${timestamp}-${random}-${uuid}`
}

export default function CreateQuotePage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const projectId = params.projectId as string

  // Filter packages based on search and type
  const filterPackages = () => {
    let filtered = allPackages

    // Search filter
    if (packageSearchTerm) {
      filtered = filtered.filter(pkg => {
        const searchInPackage = (p: Package): boolean => {
          const nameMatch = p.name.toLowerCase().includes(packageSearchTerm.toLowerCase())
          const descMatch = p.description?.toLowerCase().includes(packageSearchTerm.toLowerCase()) || false
          const typeLabel = PACKAGE_TYPE_LABELS[p.type] || p.type
          const typeMatch = typeLabel.toLowerCase().includes(packageSearchTerm.toLowerCase())

          // Also search in children
          const childMatch = p.children?.some(child => searchInPackage(child)) || false

          return nameMatch || descMatch || typeMatch || childMatch
        }
        return searchInPackage(pkg)
      })
    }

    // Type filter
    if (packageTypeFilter !== 'all') {
      filtered = filtered.filter(pkg => {
        const typeMatch = pkg.type === packageTypeFilter
        const childTypeMatch = pkg.children?.some(child => child.type === packageTypeFilter) || false
        return typeMatch || childTypeMatch
      })
    }

    setPackages(filtered)
  }

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [showPreview, setShowPreview] = useState(false)
  const [showDeliveryModal, setShowDeliveryModal] = useState(false)
  const [projectRequest, setProjectRequest] = useState<ProjectRequest | null>(null)
  // Removed activeStep for single page layout
  const [products, setProducts] = useState<any[]>([])
  const [packages, setPackages] = useState<Package[]>([])
  const [allPackages, setAllPackages] = useState<Package[]>([]) // Keep original list for filtering
  const [loadingPackages, setLoadingPackages] = useState(true)
  const [packageSearchTerm, setPackageSearchTerm] = useState('')
  const [packageTypeFilter, setPackageTypeFilter] = useState<string>('all')
  const [productSearchTerm, setProductSearchTerm] = useState('')

  // Apply filters when search term or type filter changes
  useEffect(() => {
    filterPackages()
  }, [packageSearchTerm, packageTypeFilter, allPackages])
  
  const [quoteData, setQuoteData] = useState<QuoteData>({
    projectRequestId: projectId,
    customerName: '',
    customerEmail: '',
    customerPhone: '',
    projectType: '',
    capacity: 0,
    items: [],
    subtotal: 0,
    discount: 0,
    tax: 20, // Default 20% KDV
    total: 0,
    validity: 30,
    notes: '',
    terms: 'Teklif geçerlilik süresi imza tarihinden itibaren 30 gündür.\nFiyatlara KDV dahildir.',
    status: 'DRAFT'
  })

  // Load project request data and existing drafts
  useEffect(() => {
    const loadProjectData = async () => {
      try {
        setLoading(true)
        const request = await ProjectRequestAPI.getById(projectId)
        setProjectRequest(request)
        
        // Check for existing drafts for this project
        const draftsResponse = await fetch(`/api/quotes/drafts?projectRequestId=${projectId}`)
        let existingDraft = null
        
        if (draftsResponse.ok) {
          const drafts = await draftsResponse.json()
          if (drafts.length > 0) {
            existingDraft = drafts[0] // Use the most recent draft
          }
        }

        if (existingDraft) {
          // Load existing draft data
          setQuoteData({
            id: existingDraft.id,
            quoteNumber: existingDraft.quoteNumber,
            projectRequestId: existingDraft.projectRequestId,
            customerName: existingDraft.customerName,
            customerEmail: existingDraft.customerEmail,
            customerPhone: existingDraft.customerPhone || '',
            projectType: existingDraft.projectType,
            capacity: existingDraft.capacity,
            items: existingDraft.items?.map((item: any) => {
              let parsedDescription: any = {}
              try {
                parsedDescription = JSON.parse(item.description || '{}')
              } catch {
                parsedDescription = { name: item.description || '', category: 'OTHER' }
              }
              
              console.log('🔧 DRAFT LOAD: Item data:', {
                itemId: item.id,
                productId: item.productId,
                parsedName: parsedDescription.name,
                originalDesc: item.description
              })

              return {
                id: item.id,
                category: parsedDescription.category || 'OTHER',
                productId: item.productId || '',
                name: parsedDescription.name || item.name || '',
                description: parsedDescription.description || item.description || '',
                pricingType: parsedDescription.pricingType || 'UNIT',
                unitPrice: item.unitPrice,
                quantity: item.quantity,
                discount: parsedDescription.discount || 0,
                tax: parsedDescription.tax || 0,
                subtotal: item.unitPrice * item.quantity,
                total: item.total
              }
            }) || [],
            subtotal: existingDraft.subtotal,
            discount: existingDraft.discount,
            tax: existingDraft.tax,
            total: existingDraft.total,
            validity: Math.ceil((new Date(existingDraft.validUntil).getTime() - Date.now()) / (24 * 60 * 60 * 1000)),
            notes: existingDraft.notes || '',
            terms: existingDraft.terms || '',
            status: existingDraft.status,
            createdAt: new Date(existingDraft.createdAt),
            validUntil: new Date(existingDraft.validUntil)
          })

          toast({
            title: 'Taslak Yüklendi',
            description: 'Bu proje için daha önce kaydedilen taslak yüklendi'
          })
        } else {
          // Pre-fill quote data with project info
          setQuoteData(prev => ({
            ...prev,
            customerName: request.customerName,
            customerEmail: request.customerEmail,
            customerPhone: request.customerPhone || '',
            projectType: request.projectType,
            capacity: request.estimatedCapacity || 0
          }))

          // Auto-generate initial items based on capacity
          generateInitialItems(request.estimatedCapacity || 0, request.projectType)
        }
      } catch (error) {
        console.error('Error loading project:', error)
        toast({
          title: 'Hata',
          description: 'Proje bilgileri yüklenirken hata oluştu',
          variant: 'destructive'
        })
      } finally {
        setLoading(false)
      }
    }

    loadProjectData()
  }, [projectId, toast])

  // Load packages from database with hierarchy
  useEffect(() => {
    const loadPackages = async () => {
      try {
        setLoadingPackages(true)
        console.log('🔍 Fetching packages from API...')
        const response = await fetch('/api/packages?isActive=true&includeChildren=true')
        console.log('📡 Package API Response status:', response.status)

        if (!response.ok) {
          const errorText = await response.text()
          console.error('❌ Package API Error:', {
            status: response.status,
            statusText: response.statusText,
            url: response.url,
            error: errorText
          })
          throw new Error(`HTTP ${response.status}: ${errorText}`)
        }

        const data = await response.json()
        console.log('📦 Packages from API:', data.packages)
        // Filter only root packages (no parentId) - children will be shown as nested
        const rootPackages = data.packages?.filter((pkg: Package) => !pkg.parentId) || []
        setAllPackages(rootPackages) // Store original for filtering
        setPackages(rootPackages)
      } catch (error) {
        console.error('💥 Error fetching packages:', error)
        // Show user-friendly error
        toast({
          title: "Paketler Yüklenemedi",
          description: "Paket bilgileri alınırken bir hata oluştu. Lütfen sayfayı yenileyin.",
          variant: "destructive"
        })
      } finally {
        setLoadingPackages(false)
      }
    }
    loadPackages()
  }, [])

  // Load products from database
  useEffect(() => {
    const loadProducts = async () => {
      try {
        console.log('🔍 QUOTE CREATE: Fetching products from API...')
        const response = await fetch('/api/products')
        console.log('📡 QUOTE CREATE: API Response status:', response.status)

        if (response.ok) {
          const data = await response.json()
          console.log('📦 QUOTE CREATE: Raw products from API:', data)
          console.log('📊 QUOTE CREATE: Products count:', data.length)
          setProducts(data)

          // Show sample products with prices
          data.slice(0, 3).forEach((product: any, index: number) => {
            console.log(`💰 QUOTE CREATE: Product ${index + 1}:`, {
              id: product.id,
              name: product.name,
              type: product.type,
              price: product.price,
              brand: product.brand,
              stock: product.stock,
              model: product.model,
              power: product.power
            })
          })
        } else {
          console.error('❌ QUOTE CREATE: Failed to fetch products:', response.status, response.statusText)
        }
      } catch (error) {
        console.error('❌ QUOTE CREATE: Error loading products:', error)
      }
    }

    loadProducts()
  }, [])

  // Generate initial quote items based on project capacity
  const generateInitialItems = (_capacity: number, _projectType: string) => {
    // Don't add any hardcoded products - user will select from database
    // Only keep empty array to avoid breaking existing code

    console.log('📝 Empty quote initialized - user will add products from database')

    // Return empty items array - no hardcoded products
    setQuoteData(prev => ({
      ...prev,
      items: []
    }))

    calculateTotals([])
  }

  // Calculate totals
  const calculateTotals = (items: QuoteItem[]) => {
    const subtotal = items.reduce((sum, item) => sum + item.subtotal, 0)
    const discountAmount = subtotal * (quoteData.discount / 100)
    const subtotalAfterDiscount = subtotal - discountAmount
    const taxAmount = subtotalAfterDiscount * (20 / 100) // Fixed 20% tax rate
    const total = subtotalAfterDiscount + taxAmount

    console.log('💰 CALCULATION DEBUG:', {
      itemCount: items.length,
      rawSubtotal: subtotal,
      discountPercent: quoteData.discount,
      discountAmount,
      subtotalAfterDiscount,
      taxAmount,
      total
    })

    setQuoteData(prev => ({
      ...prev,
      subtotal: subtotal,
      total: total,
      tax: 20 // Ensure tax rate stays at 20%
    }))
  }

  // Add new item
  const addItem = () => {
    const newItem: QuoteItem = {
      id: Date.now().toString(),
      category: 'OTHER',
      name: '',
      description: '',
      pricingType: 'UNIT',
      unitPrice: 0,
      quantity: 1,
      discount: 0,
      tax: 20,
      subtotal: 0,
      total: 0
    }

    const updatedItems = [...quoteData.items, newItem]
    setQuoteData(prev => ({
      ...prev,
      items: updatedItems
    }))
  }

  // Apply package from database - ADDS to existing items
  const applyPackage = (packageData: Package) => {
    const timestamp = Date.now()
    const packageItems: ExtendedQuoteItem[] = packageData.items.map((item, index) => ({
      id: `package-${timestamp}-${index}`,
      category: 'OTHER', // Default category, user can change later
      productId: item.productId,
      name: item.productName,
      description: item.productName,
      pricingType: 'UNIT',
      unitPrice: item.unitPrice,
      quantity: item.quantity,
      discount: 0,
      tax: 20,
      subtotal: item.unitPrice * item.quantity,
      total: item.unitPrice * item.quantity * 1.2,
      brand: '',
      specifications: undefined
    }))

    // IMPORTANT: Combine existing items with new package items
    const combinedItems = [...quoteData.items, ...packageItems]

    setQuoteData(prev => ({
      ...prev,
      items: combinedItems,
      capacity: prev.capacity + (packageData.totalPower ? packageData.totalPower / 1000 : 0) // Add to existing capacity
    }))

    // Calculate totals for all items
    calculateTotals(combinedItems)

    toast({
      title: 'Paket Eklendi',
      description: `${packageData.name} başarıyla eklendi - Paket Fiyatı: ₺${packageData.totalPrice.toLocaleString()}`
    })
  }

  // Update item
  const updateItem = (itemId: string, field: keyof QuoteItem, value: any) => {
    console.log('🔄 QUOTE CREATE: updateItem called:', { itemId, field, value })

    const updatedItems = quoteData.items.map(item => {
      if (item.id === itemId) {
        const updatedItem = { ...item, [field]: value }

        console.log('🔧 QUOTE CREATE: Item before update:', item)
        console.log('🔧 QUOTE CREATE: Item after field update:', updatedItem)

        // Recalculate subtotal and total
        updatedItem.subtotal = updatedItem.unitPrice * updatedItem.quantity
        const discountAmount = updatedItem.subtotal * (updatedItem.discount / 100)
        const afterDiscount = updatedItem.subtotal - discountAmount
        const taxAmount = afterDiscount * (updatedItem.tax / 100)
        updatedItem.total = afterDiscount + taxAmount

        console.log('💰 QUOTE CREATE: Final calculated item:', {
          unitPrice: updatedItem.unitPrice,
          quantity: updatedItem.quantity,
          subtotal: updatedItem.subtotal,
          total: updatedItem.total
        })

        return updatedItem
      }
      return item
    })

    setQuoteData(prev => ({
      ...prev,
      items: updatedItems
    }))

    calculateTotals(updatedItems)
  }

  // Remove item with confirmation
  const removeItem = (itemId: string) => {
    const item = quoteData.items.find(i => i.id === itemId)
    if (!item) return

    // Show confirmation for expensive items
    const itemTotal = item.totalPrice || item.total || 0
    if (itemTotal > 10000) {
      const confirmRemove = window.confirm(`${item.name} (₺${itemTotal.toLocaleString()}) öğesini kaldırmak istediğinize emin misiniz?`)
      if (!confirmRemove) return
    }

    const updatedItems = quoteData.items.filter(item => item.id !== itemId)
    setQuoteData(prev => ({
      ...prev,
      items: updatedItems
    }))
    calculateTotals(updatedItems)

    toast({
      title: 'Ürün Kaldırıldı',
      description: `${item.name} listeden kaldırıldı`
    })
  }

  // Clear all items with confirmation
  const clearAllItems = () => {
    if (quoteData.items.length === 0) {
      toast({
        title: 'Liste Zaten Boş',
        description: 'Kaldırılacak ürün bulunmuyor',
        variant: 'default'
      })
      return
    }

    const confirmClear = window.confirm(`Tüm seçili ürünleri (${quoteData.items.length} adet) kaldırmak istediğinize emin misiniz?`)
    if (!confirmClear) return

    setQuoteData(prev => ({
      ...prev,
      items: [],
      subtotal: 0,
      tax: 0,
      total: 0
    }))

    toast({
      title: 'Liste Temizlendi',
      description: 'Tüm ürünler listeden kaldırıldı'
    })
  }

  // Save quote
  const saveQuote = async (status: 'DRAFT' | 'SENT' = 'DRAFT') => {
    try {
      setSaving(true)
      
      // Prepare quote data for API
      // Generate new quote number only if creating new quote (no existing ID)
      const finalQuoteNumber = quoteData.id ? quoteData.quoteNumber : generateUniqueQuoteNumber()
      console.log('📤 Save Quote - Using quote number:', finalQuoteNumber)

      const quotePayload = {
        ...quoteData,
        status: status,
        quoteNumber: finalQuoteNumber,
        createdAt: new Date().toISOString()
      }

      // Use the same endpoint for both draft and sent quotes
      const response = await fetch('/api/quotes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(quotePayload)
      })

      if (!response.ok) {
        console.error('Response not OK:', response.status, response.statusText)
        console.error('Response URL:', response.url)
        const errorText = await response.text()
        console.error('Response text:', errorText)

        let errorData
        try {
          errorData = JSON.parse(errorText)
        } catch (e) {
          errorData = { error: errorText || 'Unknown error' }
        }

        console.error('Quote save error:', errorData)
        console.error('Quote payload was:', quotePayload)
        throw new Error(errorData.error || 'Failed to save quote')
      }

      const savedQuote = await response.json()

      // Update local state with saved quote data
      setQuoteData(prev => ({
        ...prev,
        id: savedQuote.id,
        quoteNumber: savedQuote.quoteNumber
      }))

      // Show success feedback
      console.log('✅ Quote saved successfully:', savedQuote.id)
      toast({
        title: 'Başarılı',
        description: status === 'SENT' ? 'Teklif müşteriye gönderildi' : 'Teklif taslağı kaydedildi',
        variant: 'default'
      })

      // Only redirect to quotes page when sending, stay on page for drafts
      if (status === 'SENT') {
        router.push('/dashboard/quotes')
      }
    } catch (error) {
      console.error('Error saving quote:', error)
      toast({
        title: 'Hata',
        description: 'Teklif kaydedilirken hata oluştu',
        variant: 'destructive'
      })
    } finally {
      setSaving(false)
    }
  }

  // Handle quote delivery
  const handleQuoteDelivery = async (deliveryMethods: any[]) => {
    try {
      let savedQuote: any

      // If quote doesn't have an ID, save it first as DRAFT
      if (!quoteData.id) {
        // Generate new quote number for new draft
        const draftQuoteNumber = generateUniqueQuoteNumber()
        console.log('📝 Draft Save - Generated quote number:', draftQuoteNumber)

        const draftPayload = {
          ...quoteData,
          status: 'DRAFT',
          quoteNumber: draftQuoteNumber,
          createdAt: new Date().toISOString()
        }

        const draftResponse = await fetch('/api/quotes', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(draftPayload)
        })

        if (!draftResponse.ok) {
          throw new Error('Failed to save quote as draft')
        }

        savedQuote = await draftResponse.json()

        // Update local state with saved quote data
        setQuoteData(prev => ({
          ...prev,
          id: savedQuote.id,
          quoteNumber: savedQuote.quoteNumber
        }))
      } else {
        // Quote exists, just use current data
        savedQuote = {
          ...quoteData,
          status: 'SENT'
        }
      }

      // Now send via selected delivery methods
      const deliveryPromises = deliveryMethods.map(async (method) => {
        return fetch('/api/quotes/delivery', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            quoteData: generatePreviewData(),
            deliveryMethod: {
              type: method.type,
              email: method.recipient,
              phone: method.recipient
            }
          })
        })
      })

      await Promise.all(deliveryPromises)

      // Update local state
      setQuoteData(prev => ({
        ...prev,
        id: savedQuote.id,
        quoteNumber: savedQuote.quoteNumber
      }))

      toast({
        title: 'Başarılı',
        description: `Teklif ${deliveryMethods.length} yöntemle müşteriye gönderildi`
      })

      // Redirect to quotes page
      router.push('/dashboard/quotes')

    } catch (error) {
      console.error('Error delivering quote:', error)
      throw error // Re-throw to let modal handle the error state
    }
  }

  // Calculate system power from products
  const calculateSystemPower = () => {
    let totalPower = 0

    // Calculate power from products in quote items
    quoteData.items.forEach(item => {
      if (item.productId && item.productId.startsWith('cmf')) {
        // Find the product from loaded products
        const product = products.find(p => p.id === item.productId)
        if (product) {
          // Extract power from product data
          let power = 0
          if (product.power && typeof product.power === 'string') {
            // Remove 'W' and convert to number
            power = parseFloat(product.power.replace('W', '')) || 0
          } else if (product.power && typeof product.power === 'number') {
            power = product.power
          }

          // Add to total power (W to kW conversion)
          totalPower += (power * item.quantity) / 1000
        }
      } else if (item.category === 'SOLAR_PANELS') {
        // Estimate power for panels without product ID
        const estimatedPanelPower = 550 // 550W per panel
        totalPower += (estimatedPanelPower * item.quantity) / 1000
      }
    })

    console.log('🔋 POWER CALCULATION:', {
      totalPowerKw: totalPower,
      quoteItems: quoteData.items.length,
      products: products.length
    })

    return totalPower
  }

  // Generate preview data - MUST MATCH PDF DATA
  const generatePreviewData = (): any => {
    const systemPowerKw = calculateSystemPower()
    const annualProduction = Math.round(systemPowerKw * 1450) // kWh per year
    const annualSavings = Math.round(annualProduction * 5.20) // TL per kWh - MUST MATCH PDF (was 2.2)
    const paybackPeriod = quoteData.total > 0 && annualSavings > 0
      ? Math.round((quoteData.total / annualSavings) * 10) / 10
      : 0

    // Calculate labor cost from actual items
    const laborCost = quoteData.items
      .filter(item => item.category === 'LABOR')
      .reduce((sum, item) => sum + item.total, 0)

    // Recalculate totals to match PDF logic exactly
    const calculatedSubtotal = quoteData.items.reduce((sum, item) => sum + (item.unitPrice * item.quantity), 0)
    const discountAmount = calculatedSubtotal * ((quoteData.discount || 0) / 100)
    const subtotalAfterDiscount = calculatedSubtotal - discountAmount
    const calculatedTax = subtotalAfterDiscount * 0.20 // Fixed 20% tax rate
    const calculatedTotal = subtotalAfterDiscount + calculatedTax

    return {
      id: quoteData.id || 'preview',
      quoteNumber: quoteData.quoteNumber || generateUniqueQuoteNumber(),
      customerName: quoteData.customerName,
      customerEmail: quoteData.customerEmail,
      customerPhone: quoteData.customerPhone,
      projectType: quoteData.projectType,
      systemSize: systemPowerKw,
      panelCount: quoteData.items.filter(item => item.category === 'SOLAR_PANELS').reduce((sum, item) => sum + item.quantity, 0),
      capacity: systemPowerKw,
      items: quoteData.items.map(item => ({
        id: item.id,
        name: item.name,
        type: item.category,
        brand: item.brand || '',
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        totalPrice: item.total,
        specifications: item.specifications || {
          power: item.category === 'SOLAR_PANELS' ? 550 : undefined,
          efficiency: 20
        }
      })),
      laborCost: laborCost, // Use actual labor cost
      subtotal: calculatedSubtotal, // Use recalculated value to match PDF
      tax: calculatedTax, // Use recalculated tax to match PDF
      taxPercent: 20, // Fixed 20% tax rate
      discount: quoteData.discount, // Include discount for consistency
      total: calculatedTotal, // Use recalculated total to match PDF
      status: quoteData.status,
      createdAt: new Date(),
      validUntil: new Date(Date.now() + quoteData.validity * 24 * 60 * 60 * 1000),
      version: 1,
      designData: {
        location: projectRequest?.location || 'Belirtilmemiş',
        roofArea: systemPowerKw * 8, // rough estimate (8 m² per kW)
        irradiance: 1450,
        tiltAngle: 30,
        azimuth: 180
      },
      financialAnalysis: {
        annualProduction: annualProduction,
        annualSavings: annualSavings,
        paybackPeriod: paybackPeriod,
        npv25: Math.round(annualSavings * 15), // NPV over 25 years
        irr: 12
      }
    }
  }

  // Professional PDF Generation
  const generateProfessionalPDF = async () => {
    try {
      console.log('🎯 PDF GENERATION: Starting PDF generation')
      console.log('📋 PDF GENERATION: Quote data:', quoteData)

      // Save quote as draft first using existing working logic
      setSaving(true)
      
      // Always generate new quote number for drafts to avoid collisions
      const newQuoteNumber = generateUniqueQuoteNumber()
      console.log('🆔 Generated new quote number:', newQuoteNumber)
      console.log('📋 Existing quoteData.quoteNumber:', quoteData.quoteNumber)

      const quotePayload = {
        ...quoteData,
        status: 'DRAFT',
        quoteNumber: newQuoteNumber, // Always use fresh quote number
        createdAt: new Date().toISOString()
      }

      const response = await fetch('/api/quotes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(quotePayload)
      })

      if (!response.ok) {
        const errorData = await response.text()
        console.error('Failed to save quote:', errorData)
        throw new Error(`Failed to save quote: ${response.status}`)
      }

      const savedQuote = await response.json()
      console.log('Quote saved successfully:', savedQuote.id)
      
      // Now download PDF using the new API route
      const pdfResponse = await fetch(`/api/quotes/${savedQuote.id}/pdf`, {
        method: 'GET',
        headers: {
          'Accept': 'application/pdf'
        }
      })

      if (!pdfResponse.ok) {
        const errorData = await pdfResponse.text()
        console.error('Failed to generate PDF:', errorData)
        throw new Error(`Failed to generate PDF: ${pdfResponse.status}`)
      }

      // Download the PDF
      const blob = await pdfResponse.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `teklif-${quotePayload.quoteNumber}.pdf`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
      
      toast({
        title: 'Başarılı',
        description: 'Profesyonel PDF raporu başarıyla indirildi'
      })
      
      setSaving(false)
    } catch (error) {
      console.error('Error generating professional PDF:', error)
      toast({
        title: 'Hata',
        description: 'PDF oluşturulurken hata oluştu',
        variant: 'destructive'
      })
      setSaving(false)
    }
  }

  // Removed step navigation for single page layout

  const getCategoryIcon = (category: keyof typeof QUOTE_CATEGORIES) => {
    switch (category) {
      case 'SOLAR_PANELS': return <Zap className="w-4 h-4" />
      case 'INVERTERS': return <Calculator className="w-4 h-4" />
      case 'BATTERIES': return <Battery className="w-4 h-4" />
      case 'MOUNTING_MATERIALS': return <Wrench className="w-4 h-4" />
      case 'CABLES': return <Package className="w-4 h-4" />
      case 'MONITORING_SYSTEMS': return <Calculator className="w-4 h-4" />
      case 'ACCESSORIES': return <Package className="w-4 h-4" />
      case 'AKU': return <Battery className="w-4 h-4" />
      case 'DC_PUMP': return <Package className="w-4 h-4" />
      case 'CHARGE_CONTROL': return <Calculator className="w-4 h-4" />
      case 'TRANSPORT': return <Truck className="w-4 h-4" />
      case 'PROJECT_COST': return <FileText className="w-4 h-4" />
      case 'LABOR': return <Package className="w-4 h-4" />
      default: return <Package className="w-4 h-4" />
    }
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-96">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <span className="ml-2">Yükleniyor...</span>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => showPreview ? setShowPreview(false) : router.back()}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              {showPreview ? 'Düzenlemeye Dön' : 'Geri'}
            </Button>
            <div>
              <h1 className="text-2xl font-bold">Teklif Oluştur</h1>
              <p className="text-muted-foreground">
                {projectRequest?.customerName} - {projectRequest?.estimatedCapacity} kW {getProjectTypeInTurkish(projectRequest?.projectType)}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              onClick={() => saveQuote('DRAFT')}
              disabled={saving}
            >
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Kaydediliyor...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  {quoteData.id ? 'Taslağı Güncelle' : 'Taslak Kaydet'}
                </>
              )}
            </Button>
            <Button
              variant="outline"
              onClick={() => setShowPreview(!showPreview)}
            >
              <Eye className="w-4 h-4 mr-2" />
              {showPreview ? 'Düzenlemeye Dön' : 'Önizle'}
            </Button>
            <Button
              onClick={() => saveQuote('SENT')}
              disabled={saving}
            >
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Gönderiliyor...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Teklifi Gönder
                </>
              )}
            </Button>
          </div>
        </div>


        {/* Main Content */}
        {showPreview ? (
          <div id="quote-preview-content">
            <QuotePreview
              quote={generatePreviewData()}
              onEdit={() => setShowPreview(false)}
              onSend={() => setShowDeliveryModal(true)}
              onDownload={generateProfessionalPDF}
            />
          </div>
        ) : (
          <>

            {/* Ready-made Packages from Database */}
            {!loadingPackages && allPackages.length > 0 && (
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle>Hazır Paketler</CardTitle>
                  <CardDescription>
                    Hızlı teklif için hazır paketlerden birini seçin
                  </CardDescription>

                  {/* Package Search and Filters */}
                  <div className="flex gap-3 mt-4">
                    <div className="flex-1 relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <Input
                        placeholder="Paket ara (ad, açıklama, tür)..."
                        value={packageSearchTerm}
                        onChange={(e) => setPackageSearchTerm(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                    <Select
                      value={packageTypeFilter}
                      onValueChange={setPackageTypeFilter}
                    >
                      <SelectTrigger className="w-48">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Tüm Türler</SelectItem>
                        {Object.entries(PACKAGE_TYPE_LABELS).map(([key, label]) => (
                          <SelectItem key={key} value={key}>
                            <span className="flex items-center gap-2">
                              {PACKAGE_TYPE_ICONS[key as keyof typeof PACKAGE_TYPE_ICONS]}
                              {label}
                            </span>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Search Results Info */}
                  {(packageSearchTerm || packageTypeFilter !== 'all') && (
                    <div className="mt-2 text-sm text-gray-600">
                      {packages.length === 0 ? (
                        <span className="text-orange-600">Arama kriterlerinize uygun paket bulunamadı</span>
                      ) : (
                        <span>
                          {packages.length} paket bulundu
                          {packageSearchTerm && ` "${packageSearchTerm}" için`}
                          {packageTypeFilter !== 'all' && ` (${PACKAGE_TYPE_LABELS[packageTypeFilter as keyof typeof PACKAGE_TYPE_LABELS]})`}
                        </span>
                      )}
                    </div>
                  )}
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {packages.map((pkg) => (
                      <div key={pkg.id} className="space-y-2">
                        {/* Main Package */}
                        <Card className="cursor-pointer hover:shadow-md transition-shadow border-2 hover:border-primary/50"
                              onClick={() => applyPackage(pkg)}>
                          <CardHeader className="pb-2">
                            <CardTitle className="text-lg flex items-center gap-2">
                              <span className="text-lg">{PACKAGE_TYPE_ICONS[pkg.type]}</span>
                              {pkg.name}
                              {pkg.children && pkg.children.length > 0 && (
                                <Badge variant="secondary" className="ml-auto">
                                  {pkg.children.length} alt paket
                                </Badge>
                              )}
                            </CardTitle>
                            <Badge variant="outline" className="mt-1 w-fit">
                              {PACKAGE_TYPE_LABELS[pkg.type] || pkg.type}
                            </Badge>
                          </CardHeader>
                          <CardContent>
                            {pkg.description && (
                              <p className="text-sm text-gray-600 mb-3">{pkg.description}</p>
                            )}
                            <div className="space-y-1">
                              {pkg.totalPower && (
                                <div className="flex justify-between text-sm">
                                  <span>Kapasite:</span>
                                  <span className="font-medium">{(pkg.totalPower / 1000).toFixed(1)} kW</span>
                                </div>
                              )}
                              <div className="flex justify-between text-sm">
                                <span>Ürün Sayısı:</span>
                                <span className="font-medium">{pkg.items?.length || 0} adet</span>
                              </div>

                              {/* Package Items List */}
                              {pkg.items && pkg.items.length > 0 && (
                                <div className="mt-3 border rounded-lg p-2 bg-gray-50">
                                  <p className="text-xs font-medium mb-2 text-gray-700">Paket İçeriği:</p>
                                  <div className="space-y-1">
                                    {pkg.items.slice(0, 4).map((item, index) => (
                                      <div key={index} className="flex justify-between text-xs">
                                        <span className="text-gray-600">
                                          {item.quantity}x {item.productName || 'Ürün'}
                                        </span>
                                        <span className="font-medium text-gray-800">
                                          ₺{((item.quantity || 1) * (item.unitPrice || 0)).toLocaleString()}
                                        </span>
                                      </div>
                                    ))}
                                    {pkg.items.length > 4 && (
                                      <div className="text-xs text-gray-500 italic">
                                        +{pkg.items.length - 4} daha fazla ürün
                                      </div>
                                    )}
                                  </div>
                                </div>
                              )}

                              <div className="flex justify-between items-center text-sm border-t pt-2 mt-2">
                                <span className="font-medium">Toplam Fiyat:</span>
                                <span className="text-lg font-bold text-primary bg-primary/10 px-3 py-1 rounded-lg">
                                  ₺{pkg.totalPrice.toLocaleString()}
                                </span>
                              </div>
                            </div>
                            <Button
                              variant="outline"
                              size="sm"
                              className="w-full mt-3"
                              onClick={(e) => {
                                e.stopPropagation()
                                applyPackage(pkg)
                              }}
                            >
                              Bu Paketi Seç
                            </Button>
                          </CardContent>
                        </Card>

                        {/* Sub Packages */}
                        {pkg.children && pkg.children.length > 0 && (
                          <div className="ml-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                            {pkg.children.map((subPkg) => (
                              <Card
                                key={subPkg.id}
                                className="cursor-pointer hover:shadow-md transition-shadow border border-gray-200 hover:border-primary/50 bg-gray-50/50"
                                onClick={() => applyPackage(subPkg)}
                              >
                                <CardContent className="p-4">
                                  <div className="flex items-center gap-2 mb-2">
                                    <span className="text-sm">📁</span>
                                    <h4 className="font-medium text-sm">{subPkg.name}</h4>
                                  </div>
                                  {subPkg.description && (
                                    <p className="text-xs text-gray-600 mb-2">{subPkg.description}</p>
                                  )}
                                  <div className="space-y-1 text-xs">
                                    {subPkg.totalPower && (
                                      <div className="flex justify-between">
                                        <span>Kapasite:</span>
                                        <span className="font-medium">{(subPkg.totalPower / 1000).toFixed(1)} kW</span>
                                      </div>
                                    )}
                                    <div className="flex justify-between">
                                      <span>Ürünler:</span>
                                      <span className="font-medium">{subPkg.items?.length || 0} adet</span>
                                    </div>

                                    {/* Sub Package Items List */}
                                    {subPkg.items && subPkg.items.length > 0 && (
                                      <div className="mt-2 p-1 bg-white rounded border">
                                        <div className="space-y-0.5">
                                          {subPkg.items.slice(0, 3).map((item, index) => (
                                            <div key={index} className="flex justify-between text-xs">
                                              <span className="text-gray-600 truncate">
                                                {item.quantity}x {(item.productName || 'Ürün').substring(0, 15)}
                                              </span>
                                              <span className="font-medium">
                                                ₺{((item.quantity || 1) * (item.unitPrice || 0)).toLocaleString()}
                                              </span>
                                            </div>
                                          ))}
                                          {subPkg.items.length > 3 && (
                                            <div className="text-xs text-gray-500 italic">
                                              +{subPkg.items.length - 3} daha
                                            </div>
                                          )}
                                        </div>
                                      </div>
                                    )}

                                    <div className="flex justify-between items-center border-t pt-1 mt-1">
                                      <span className="font-medium">Fiyat:</span>
                                      <span className="font-bold text-primary">
                                        ₺{subPkg.totalPrice.toLocaleString()}
                                      </span>
                                    </div>
                                  </div>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="w-full mt-2 h-7 text-xs"
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      applyPackage(subPkg)
                                    }}
                                  >
                                    Alt Paketi Seç
                                  </Button>
                                </CardContent>
                              </Card>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Quote Builder Table */}
            <Card>
              <CardHeader>
                <CardTitle>Malzeme Listesi</CardTitle>
                <CardDescription>
                  Teklif için gerekli malzemeleri ekleyin ve fiyatlandırın veya yukarıdan hazır paket seçin
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-3 px-4">Kategori</th>
                        <th className="text-left py-3 px-4">Malzeme</th>
                        <th className="text-left py-3 px-4">Açıklama</th>
                        <th className="text-left py-3 px-4">Fiyat Tipi</th>
                        <th className="text-right py-3 px-4">Birim Fiyat</th>
                        <th className="text-center py-3 px-4">Miktar</th>
                        <th className="text-right py-3 px-4">İndirim %</th>
                        <th className="text-right py-3 px-4">KDV %</th>
                        <th className="text-right py-3 px-4">Ara Toplam</th>
                        <th className="text-right py-3 px-4">Toplam</th>
                        <th className="text-center py-3 px-4">İşlem</th>
                      </tr>
                    </thead>
                    <tbody>
                      {quoteData.items.length === 0 ? (
                        <tr>
                          <td colSpan={11} className="py-12 text-center">
                            <div className="flex flex-col items-center justify-center space-y-3">
                              <Package className="w-12 h-12 text-gray-300" />
                              <p className="text-gray-500 text-lg">Henüz ürün veya paket eklenmedi</p>
                              <p className="text-gray-400 text-sm">
                                Yukarıdaki "Malzeme Listesi" veya "Paketler" bölümlerinden ürün ekleyebilirsiniz
                              </p>
                            </div>
                          </td>
                        </tr>
                      ) : (
                        quoteData.items.map((item) => (
                        <tr key={item.id} className="border-b hover:bg-gray-50">
                          <td className="py-3 px-4">
                            <div className="flex items-center space-x-2">
                              {getCategoryIcon(item.category)}
                              <Select
                                value={item.category}
                                onValueChange={(value) => updateItem(item.id, 'category', value)}
                              >
                                <SelectTrigger className="w-32">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  {Object.entries(QUOTE_CATEGORIES).map(([key, label]) => (
                                    <SelectItem key={key} value={key}>
                                      {label}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <Select
                              value={item.productId || ''}
                              onValueChange={(value) => {
                                console.log('🎯 QUOTE CREATE: Product selected with ID:', value)
                                const selectedProduct = products.find(p => p.id === value)
                                console.log('🔍 QUOTE CREATE: Found product:', selectedProduct)

                                if (selectedProduct) {
                                  console.log('💰 QUOTE CREATE: Setting price:', selectedProduct.price || 0)
                                  console.log('📋 QUOTE CREATE: Product details:', {
                                    name: selectedProduct.name,
                                    brand: selectedProduct.brand,
                                    price: selectedProduct.price,
                                    type: selectedProduct.type
                                  })

                                  // Update all fields at once to avoid race condition
                                  const updatedItems = quoteData.items.map(currentItem => {
                                    if (currentItem.id === item.id) {
                                      const updatedItem = {
                                        ...currentItem,
                                        productId: value,
                                        name: selectedProduct.name,
                                        unitPrice: selectedProduct.price || 0,
                                        description: `${selectedProduct.brand} ${selectedProduct.model} - ${selectedProduct.power}`
                                      }
                                      // Recalculate totals
                                      updatedItem.subtotal = updatedItem.unitPrice * updatedItem.quantity
                                      const discountAmount = updatedItem.subtotal * (updatedItem.discount / 100)
                                      const afterDiscount = updatedItem.subtotal - discountAmount
                                      const taxAmount = afterDiscount * (updatedItem.tax / 100)
                                      updatedItem.total = afterDiscount + taxAmount

                                      console.log('✅ QUOTE CREATE: Item updated with price:', updatedItem.unitPrice)
                                      return updatedItem
                                    }
                                    return currentItem
                                  })

                                  setQuoteData(prev => ({
                                    ...prev,
                                    items: updatedItems
                                  }))
                                  calculateTotals(updatedItems)
                                } else {
                                  console.error('❌ QUOTE CREATE: Product not found for ID:', value)
                                }
                              }}
                            >
                              <SelectTrigger className="w-full">
                                <SelectValue placeholder="Malzeme seçin" />
                              </SelectTrigger>
                              <SelectContent>
                                <div className="p-2 border-b">
                                  <Input
                                    placeholder="Ürün ara..."
                                    value={productSearchTerm}
                                    onChange={(e) => setProductSearchTerm(e.target.value)}
                                    className="mb-2"
                                  />
                                </div>
{(() => {
                                  console.log('🔍 PRODUCTS: Filtering by category:', item.category);
                                  const filteredProducts = products.filter(product => {
                                    // Category filter
                                    let categoryMatch = true
                                    if (item.category !== 'OTHER') {
                                      const categoryDisplayValue = QUOTE_CATEGORIES[item.category as keyof typeof QUOTE_CATEGORIES]
                                      const productCategoryLower = (product.category || '').toLocaleLowerCase('tr-TR').trim()

                                      // Special handling for battery categories
                                      if (categoryDisplayValue === 'AKÜ') {
                                        // AKÜ kategorisi seçildiğinde hem AKÜ hem Batarya kategorisindeki ürünleri getir
                                        categoryMatch = productCategoryLower === 'akü' ||
                                                       productCategoryLower === 'aku' ||
                                                       productCategoryLower === 'batarya'
                                      } else if (categoryDisplayValue === 'Bataryalar') {
                                        // Bataryalar kategorisi seçildiğinde hem Batarya hem AKÜ kategorisindeki ürünleri getir
                                        categoryMatch = productCategoryLower === 'batarya' ||
                                                       productCategoryLower === 'akü' ||
                                                       productCategoryLower === 'aku'
                                      } else if (categoryDisplayValue === 'İnverterler') {
                                        // İnverterler kategorisi için tekil "İnverter" de dahil et (Türkçe İ ile)
                                        categoryMatch = productCategoryLower === 'inverter' ||
                                                       productCategoryLower === 'inverterler' ||
                                                       productCategoryLower === 'invertör' ||
                                                       productCategoryLower === 'İnverter'.toLocaleLowerCase('tr-TR') ||
                                                       productCategoryLower === 'İnverterler'.toLocaleLowerCase('tr-TR')
                                      } else {
                                        // Diğer kategoriler için normal eşleştirme
                                        const productCategory = getCategoryFromProductCategory(product.category || '')
                                        categoryMatch = productCategory === categoryDisplayValue
                                      }
                                    }

                                    // Search filter
                                    let searchMatch = true
                                    if (productSearchTerm) {
                                      const searchTerm = productSearchTerm.toLowerCase()
                                      searchMatch = product.name.toLowerCase().includes(searchTerm) ||
                                                   product.brand.toLowerCase().includes(searchTerm) ||
                                                   (product.category && product.category.toLowerCase().includes(searchTerm))
                                    }

                                    return categoryMatch && searchMatch
                                  });

                                  if (filteredProducts.length === 0) {
                                    return (
                                      <div className="p-4 text-center text-gray-500 text-sm">
                                        {productSearchTerm
                                          ? `"${productSearchTerm}" için ürün bulunamadı`
                                          : 'Bu kategoride ürün bulunamadı'
                                        }
                                      </div>
                                    )
                                  }

                                  return filteredProducts.map((product) => (
                                    <SelectItem
                                      key={product.id}
                                      value={product.id}
                                      disabled={product.stock <= 0}
                                    >
                                      <div className="flex justify-between items-center w-full">
                                        <span className={product.stock <= 0 ? 'text-gray-400' : ''}>
                                          {product.name} - {product.brand}
                                        </span>
                                        <span className={`ml-2 text-xs ${product.stock <= 0 ? 'text-red-500' : product.stock < 10 ? 'text-orange-500' : 'text-green-600'}`}>
                                          Stok: {product.stock}
                                        </span>
                                      </div>
                                    </SelectItem>
                                  ))
                                })()}
                              </SelectContent>
                            </Select>
                          </td>
                          <td className="py-3 px-4">
                            <Input
                              value={item.description || ''}
                              onChange={(e) => updateItem(item.id, 'description', e.target.value)}
                              placeholder="Açıklama"
                              className="w-full"
                            />
                          </td>
                          <td className="py-3 px-4">
                            <Select
                              value={item.pricingType}
                              onValueChange={(value) => updateItem(item.id, 'pricingType', value)}
                            >
                              <SelectTrigger className="w-24">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {Object.entries(PRICING_TYPES).map(([key, label]) => (
                                  <SelectItem key={key} value={key}>
                                    {label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </td>
                          <td className="py-3 px-4">
                            <Input
                              type="number"
                              value={item.unitPrice}
                              onChange={(e) => updateItem(item.id, 'unitPrice', parseFloat(e.target.value) || 0)}
                              className="w-28 text-right"
                            />
                          </td>
                          <td className="py-3 px-4">
                            <Input
                              type="number"
                              value={item.quantity}
                              onChange={(e) => updateItem(item.id, 'quantity', parseFloat(e.target.value) || 0)}
                              className="w-20 text-center"
                            />
                          </td>
                          <td className="py-3 px-4">
                            <Input
                              type="number"
                              value={item.discount}
                              onChange={(e) => updateItem(item.id, 'discount', parseFloat(e.target.value) || 0)}
                              className="w-20 text-right"
                            />
                          </td>
                          <td className="py-3 px-4">
                            <Input
                              type="number"
                              value={item.tax}
                              onChange={(e) => updateItem(item.id, 'tax', parseFloat(e.target.value) || 0)}
                              className="w-20 text-right"
                            />
                          </td>
                          <td className="py-3 px-4 text-right font-medium">
                            {formatCurrency(item.subtotal)}
                          </td>
                          <td className="py-3 px-4 text-right font-bold">
                            {formatCurrency(item.total)}
                          </td>
                          <td className="py-3 px-4 text-center">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => removeItem(item.id)}
                              className="hover:bg-red-50 transition-colors"
                              title="Ürünü Kaldır"
                            >
                              <Trash2 className="w-4 h-4 text-red-500 hover:text-red-600" />
                            </Button>
                          </td>
                        </tr>
                      ))
                    )}
                    </tbody>
                    <tfoot>
                      <tr>
                        <td colSpan={11} className="py-3 px-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={addItem}
                              >
                                <Plus className="w-4 h-4 mr-2" />
                                Yeni Satır Ekle
                              </Button>
                              {quoteData.items.length > 0 && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={clearAllItems}
                                  className="text-red-600 hover:text-red-700 hover:bg-red-50 hover:border-red-300"
                                >
                                  <Trash2 className="w-4 h-4 mr-2" />
                                  Tümünü Temizle ({quoteData.items.length})
                                </Button>
                              )}
                            </div>
                            {quoteData.items.length > 0 && (
                              <div className="text-sm text-gray-600">
                                Toplam {quoteData.items.length} ürün - ₺{quoteData.total.toLocaleString()}
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>

                {/* Totals Section */}
                <div className="mt-6 border-t pt-6">
                  <div className="flex justify-end">
                    <div className="w-96 space-y-2">
                      <div className="flex justify-between">
                        <span>Ara Toplam:</span>
                        <span className="font-medium">{formatCurrency(quoteData.subtotal)}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span>İndirim (%):</span>
                        <div className="flex items-center space-x-2">
                          <Input
                            type="number"
                            value={quoteData.discount}
                            onChange={(e) => {
                              const discount = parseFloat(e.target.value) || 0
                              setQuoteData(prev => ({ ...prev, discount }))
                              calculateTotals(quoteData.items)
                            }}
                            className="w-20 text-right"
                          />
                          <span className="font-medium">
                            -{formatCurrency(quoteData.subtotal * (quoteData.discount / 100))}
                          </span>
                        </div>
                      </div>
                      <div className="flex justify-between">
                        <span>KDV (20%):</span>
                        <span className="font-medium">
                          {formatCurrency((quoteData.subtotal - (quoteData.subtotal * (quoteData.discount / 100))) * 0.20)}
                        </span>
                      </div>
                      <div className="flex justify-between text-xl font-bold border-t pt-2">
                        <span>Genel Toplam:</span>
                        <span className="text-primary">{formatCurrency(quoteData.total)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Additional Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Teklif Notları</CardTitle>
                </CardHeader>
                <CardContent>
                  <textarea
                    className="w-full h-32 p-3 border rounded-lg"
                    placeholder="Müşteriye özel notlar..."
                    value={quoteData.notes}
                    onChange={(e) => setQuoteData(prev => ({ ...prev, notes: e.target.value }))}
                  />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Şartlar ve Koşullar</CardTitle>
                </CardHeader>
                <CardContent>
                  <textarea
                    className="w-full h-32 p-3 border rounded-lg"
                    placeholder="Teklif şartları..."
                    value={quoteData.terms}
                    onChange={(e) => setQuoteData(prev => ({ ...prev, terms: e.target.value }))}
                  />
                </CardContent>
              </Card>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end mt-8 space-x-4">
              <Button
                variant="outline"
                onClick={() => setShowPreview(!showPreview)}
              >
                <Eye className="w-4 h-4 mr-2" />
                {showPreview ? 'Düzenle' : 'Önizleme'}
              </Button>
              <Button
                variant="outline"
                onClick={generateProfessionalPDF}
              >
                <Download className="w-4 h-4 mr-2" />
                PDF Raporu İndir
              </Button>
              <Button
                onClick={() => saveQuote('DRAFT')}
                disabled={saving}
              >
                <Save className="w-4 h-4 mr-2" />
                {saving ? 'Kaydediliyor...' : (quoteData.id ? 'Taslağı Güncelle' : 'Taslak Kaydet')}
              </Button>
              <Button onClick={() => setShowDeliveryModal(true)}>
                <Send className="w-4 h-4 mr-2" />
                Teklifi Gönder
              </Button>
            </div>
          </>
        )}

        {/* Quote Delivery Modal */}
        <QuoteDeliveryModal
          isOpen={showDeliveryModal}
          onClose={() => setShowDeliveryModal(false)}
          onSend={handleQuoteDelivery}
          customerEmail={quoteData.customerEmail}
          customerPhone={quoteData.customerPhone}
          quoteNumber={quoteData.quoteNumber || generateUniqueQuoteNumber()}
        />
      </div>
    </DashboardLayout>
  )
}