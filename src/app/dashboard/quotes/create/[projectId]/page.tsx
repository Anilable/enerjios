'use client'

import { useState, useEffect, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
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
  Check,
  X,
  Loader2,
  ChevronLeft,
  ChevronRight
} from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { ProjectRequestAPI } from '@/lib/api/project-requests'
import { ProjectRequest } from '@/types/project-request'
import { formatCurrency } from '@/lib/utils'
import { QuotePreview } from '@/components/quotes/quote-preview'
import { QuoteDeliveryModal } from '@/components/quotes/quote-delivery-modal'
import html2canvas from 'html2canvas'

// Quote item categories
const QUOTE_CATEGORIES = {
  PANEL: 'Panel',
  INVERTER: 'İnverter',
  BATTERY: 'Batarya',
  MOUNTING: 'Konstrüksiyon',
  PROJECT_COST: 'Proje Maliyeti',
  LABOR: 'İşçilik',
  TRANSPORT: 'Nakliye',
  OTHER: 'Diğer'
}

// Ready-made solar packages
const SOLAR_PACKAGES = {
  RESIDENTIAL_5KW: {
    name: '5kW Konut Paketi',
    description: 'Standart konut için 5kW solar sistem',
    capacity: 5,
    items: [
      {
        category: 'PANEL',
        name: 'Monokristalin Panel 540W',
        quantity: 10,
        unitPrice: 950,
        description: 'Jinko Tiger Neo 540W',
        brand: 'Jinko',
        specifications: { power: 540, efficiency: 22.3 }
      },
      {
        category: 'INVERTER',
        name: 'Huawei İnverter 5kW',
        quantity: 1,
        unitPrice: 4500,
        description: 'SUN2000-5KTL-M1',
        brand: 'Huawei',
        specifications: { power: 5000, efficiency: 98.2 }
      },
      {
        category: 'MOUNTING',
        name: 'Çatı Montaj Sistemi',
        quantity: 1,
        unitPrice: 2500,
        description: 'Alüminyum ray ve bağlantı elemanları',
        brand: 'Trakya Solar'
      },
      {
        category: 'LABOR',
        name: 'Kurulum İşçiliği',
        quantity: 24,
        unitPrice: 150,
        description: '3 günlük profesyonel kurulum'
      }
    ]
  },
  RESIDENTIAL_10KW: {
    name: '10kW Konut Paketi',
    description: 'Büyük konut için 10kW solar sistem',
    capacity: 10,
    items: [
      {
        category: 'PANEL',
        name: 'Monokristalin Panel 540W',
        quantity: 19,
        unitPrice: 950,
        description: 'Jinko Tiger Neo 540W',
        brand: 'Jinko',
        specifications: { power: 540, efficiency: 22.3 }
      },
      {
        category: 'INVERTER',
        name: 'Huawei İnverter 10kW',
        quantity: 1,
        unitPrice: 6500,
        description: 'SUN2000-10KTL-M1',
        brand: 'Huawei',
        specifications: { power: 10000, efficiency: 98.4 }
      },
      {
        category: 'MOUNTING',
        name: 'Çatı Montaj Sistemi',
        quantity: 1,
        unitPrice: 4500,
        description: 'Alüminyum ray ve bağlantı elemanları',
        brand: 'Trakya Solar'
      },
      {
        category: 'LABOR',
        name: 'Kurulum İşçiliği',
        quantity: 40,
        unitPrice: 150,
        description: '5 günlük profesyonel kurulum'
      }
    ]
  },
  COMMERCIAL_20KW: {
    name: '20kW Ticari Paket',
    description: 'Küçük işletme için 20kW solar sistem',
    capacity: 20,
    items: [
      {
        category: 'PANEL',
        name: 'Monokristalin Panel 540W',
        quantity: 37,
        unitPrice: 950,
        description: 'Jinko Tiger Neo 540W',
        brand: 'Jinko',
        specifications: { power: 540, efficiency: 22.3 }
      },
      {
        category: 'INVERTER',
        name: 'Huawei İnverter 20kW',
        quantity: 1,
        unitPrice: 12000,
        description: 'SUN2000-20KTL-M0',
        brand: 'Huawei',
        specifications: { power: 20000, efficiency: 98.6 }
      },
      {
        category: 'MOUNTING',
        name: 'Çatı/Zemin Montaj Sistemi',
        quantity: 1,
        unitPrice: 8000,
        description: 'Endüstriyel montaj sistemi',
        brand: 'Trakya Solar'
      },
      {
        category: 'LABOR',
        name: 'Kurulum İşçiliği',
        quantity: 80,
        unitPrice: 150,
        description: '10 günlük profesyonel kurulum'
      }
    ]
  }
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
  projectTitle?: string
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

export default function CreateQuotePage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const projectId = params.projectId as string

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [showPreview, setShowPreview] = useState(false)
  const [showDeliveryModal, setShowDeliveryModal] = useState(false)
  const [projectRequest, setProjectRequest] = useState<ProjectRequest | null>(null)
  // Removed activeStep for single page layout
  const [products, setProducts] = useState<any[]>([])
  
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
    terms: 'Teklif geçerlilik süresi imza tarihinden itibaren 30 gündür.\nFiyatlara KDV dahildir.\nMontaj ve işçilik ücretleri dahildir.',
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
              
              return {
                id: item.id,
                category: parsedDescription.category || 'OTHER',
                productId: item.productId,
                name: parsedDescription.name || '',
                description: parsedDescription.description || '',
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
  const generateInitialItems = (capacity: number, projectType: string) => {
    const items: QuoteItem[] = []

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
    const taxAmount = subtotal * (quoteData.tax / 100)
    const discountAmount = subtotal * (quoteData.discount / 100)
    const total = subtotal - discountAmount + taxAmount

    setQuoteData(prev => ({
      ...prev,
      subtotal: subtotal,
      total: total
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

  // Apply ready-made package
  const applyPackage = (packageKey: keyof typeof SOLAR_PACKAGES) => {
    const selectedPackage = SOLAR_PACKAGES[packageKey]
    const packageItems: ExtendedQuoteItem[] = selectedPackage.items.map((item, index) => ({
      id: `package-${Date.now()}-${index}`,
      category: item.category as keyof typeof QUOTE_CATEGORIES,
      name: item.name,
      description: item.description,
      pricingType: 'UNIT',
      unitPrice: item.unitPrice,
      quantity: item.quantity,
      discount: 0,
      tax: 20,
      subtotal: item.unitPrice * item.quantity,
      total: item.unitPrice * item.quantity * 1.2,
      brand: (item as any).brand || '',
      specifications: (item as any).specifications || undefined
    }))

    setQuoteData(prev => ({ 
      ...prev, 
      items: packageItems,
      capacity: selectedPackage.capacity 
    }))

    toast({
      title: 'Paket Uygulandı',
      description: `${selectedPackage.name} başarıyla eklendi`
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

  // Remove item
  const removeItem = (itemId: string) => {
    const updatedItems = quoteData.items.filter(item => item.id !== itemId)
    setQuoteData(prev => ({
      ...prev,
      items: updatedItems
    }))
    calculateTotals(updatedItems)
  }

  // Save quote
  const saveQuote = async (status: 'DRAFT' | 'SENT' = 'DRAFT') => {
    try {
      setSaving(true)
      
      // Prepare quote data for API
      const quotePayload = {
        ...quoteData,
        status: status,
        quoteNumber: quoteData.quoteNumber || `Q-${Date.now().toString().slice(-8)}`,
        createdAt: new Date().toISOString()
      }

      let response
      if (status === 'DRAFT') {
        // Save as draft
        response = await fetch('/api/quotes/drafts', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(quotePayload)
        })
      } else {
        // Send quote
        response = await fetch('/api/quotes', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(quotePayload)
        })
      }

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
      // First save the quote as SENT
      const quotePayload = {
        ...quoteData,
        status: 'SENT',
        quoteNumber: quoteData.quoteNumber || `Q-${Date.now().toString().slice(-8)}`,
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
        throw new Error('Failed to save quote')
      }

      const savedQuote = await response.json()

      // Now send via selected delivery methods
      const deliveryPromises = deliveryMethods.map(async (method) => {
        return fetch('/api/quotes/delivery', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            quoteId: savedQuote.id,
            method: method.type,
            recipient: method.recipient,
            quoteData: generatePreviewData()
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
      } else if (item.category === 'PANEL') {
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

  // Generate preview data
  const generatePreviewData = (): any => {
    const systemPowerKw = calculateSystemPower()
    const annualProduction = Math.round(systemPowerKw * 1450) // kWh per year
    const annualSavings = Math.round(annualProduction * 2.2) // TL per kWh
    const paybackPeriod = quoteData.total > 0 && annualSavings > 0
      ? Math.round((quoteData.total / annualSavings) * 10) / 10
      : 0

    return {
      id: quoteData.id || 'preview',
      quoteNumber: quoteData.quoteNumber || `Q-${Date.now().toString().slice(-8)}`,
      customerName: quoteData.customerName,
      customerEmail: quoteData.customerEmail,
      customerPhone: quoteData.customerPhone,
      projectType: quoteData.projectType,
      systemSize: systemPowerKw,
      panelCount: quoteData.items.filter(item => item.category === 'PANEL').reduce((sum, item) => sum + item.quantity, 0),
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
          power: item.category === 'PANEL' ? 550 : undefined,
          efficiency: 20
        }
      })),
      laborCost: quoteData.items.filter(item => item.category === 'LABOR').reduce((sum, item) => sum + item.total, 0) || 15000,
      subtotal: quoteData.subtotal,
      tax: quoteData.subtotal * (quoteData.tax / 100),
      total: quoteData.total,
      status: quoteData.status,
      createdAt: new Date(),
      validUntil: new Date(Date.now() + quoteData.validity * 24 * 60 * 60 * 1000),
      version: 1,
      projectTitle: `${systemPowerKw.toFixed(1)} kW Güneş Enerji Sistemi`,
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
      // Save quote as draft first using existing working logic
      setSaving(true)
      
      const quotePayload = {
        ...quoteData,
        status: 'DRAFT',
        quoteNumber: quoteData.quoteNumber || `Q-${Date.now().toString().slice(-8)}`,
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
      case 'PANEL': return <Zap className="w-4 h-4" />
      case 'INVERTER': return <Calculator className="w-4 h-4" />
      case 'BATTERY': return <Battery className="w-4 h-4" />
      case 'MOUNTING': return <Wrench className="w-4 h-4" />
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
              onClick={() => router.back()}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Geri
            </Button>
            <div>
              <h1 className="text-2xl font-bold">Teklif Oluştur</h1>
              <p className="text-muted-foreground">
                {projectRequest?.customerName} - {projectRequest?.estimatedCapacity} kW {projectRequest?.projectType}
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
            {/* Project Information */}
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Proje Bilgileri</CardTitle>
                <CardDescription>
                  Teklif için proje detaylarını girin
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="customerName">Müşteri Adı</Label>
                    <Input
                      id="customerName"
                      value={quoteData.customerName}
                      onChange={(e) => setQuoteData(prev => ({ ...prev, customerName: e.target.value }))}
                      placeholder="Müşteri adını girin"
                    />
                  </div>
                  <div>
                    <Label htmlFor="customerEmail">E-posta</Label>
                    <Input
                      id="customerEmail"
                      type="email"
                      value={quoteData.customerEmail}
                      onChange={(e) => setQuoteData(prev => ({ ...prev, customerEmail: e.target.value }))}
                      placeholder="E-posta adresini girin"
                    />
                  </div>
                  <div>
                    <Label htmlFor="customerPhone">Telefon</Label>
                    <Input
                      id="customerPhone"
                      value={quoteData.customerPhone || ''}
                      onChange={(e) => setQuoteData(prev => ({ ...prev, customerPhone: e.target.value }))}
                      placeholder="Telefon numarasını girin"
                    />
                  </div>
                  <div>
                    <Label htmlFor="projectType">Proje Türü</Label>
                    <Select
                      value={quoteData.projectType || ''}
                      onValueChange={(value) => setQuoteData(prev => ({ ...prev, projectType: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Proje türü seçin" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="RESIDENTIAL">Konut</SelectItem>
                        <SelectItem value="COMMERCIAL">Ticari</SelectItem>
                        <SelectItem value="INDUSTRIAL">Endüstriyel</SelectItem>
                        <SelectItem value="AGRICULTURAL">Tarımsal</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="capacity">Sistem Kapasitesi (kW)</Label>
                    <Input
                      id="capacity"
                      type="number"
                      value={quoteData.capacity || ''}
                      onChange={(e) => setQuoteData(prev => ({ ...prev, capacity: parseFloat(e.target.value) || 0 }))}
                      placeholder="Kapasite girin"
                    />
                  </div>
                  <div>
                    <Label htmlFor="quoteNumber">Teklif Numarası</Label>
                    <Input
                      id="quoteNumber"
                      value={quoteData.quoteNumber || ''}
                      onChange={(e) => setQuoteData(prev => ({ ...prev, quoteNumber: e.target.value }))}
                      placeholder="Otomatik oluşturulacak"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Ready-made Packages */}
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Hazır Paketler</CardTitle>
                <CardDescription>
                  Hızlı teklif için hazır paketlerden birini seçin
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {Object.entries(SOLAR_PACKAGES).map(([key, pkg]) => (
                    <Card 
                      key={key}
                      className="cursor-pointer hover:shadow-md transition-shadow border-2 hover:border-primary/50"
                      onClick={() => applyPackage(key as keyof typeof SOLAR_PACKAGES)}
                    >
                      <CardHeader className="pb-2">
                        <CardTitle className="text-lg flex items-center gap-2">
                          <Package className="w-5 h-5 text-primary" />
                          {pkg.name}
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-gray-600 mb-3">{pkg.description}</p>
                        <div className="space-y-1">
                          <div className="flex justify-between text-sm">
                            <span>Kapasite:</span>
                            <span className="font-medium">{pkg.capacity} kW</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span>Ürün Sayısı:</span>
                            <span className="font-medium">{pkg.items.length} adet</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span>Tahmini Fiyat:</span>
                            <span className="font-medium text-primary">
                              ₺{pkg.items.reduce((sum, item) => sum + (item.unitPrice * item.quantity), 0).toLocaleString()}
                            </span>
                          </div>
                        </div>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="w-full mt-3"
                          onClick={(e) => {
                            e.stopPropagation()
                            applyPackage(key as keyof typeof SOLAR_PACKAGES)
                          }}
                        >
                          Bu Paketi Seç
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>

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
                      {quoteData.items.map((item) => (
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
                                {products
                                  .filter((product) => {
                                    // Filter products by category
                                    if (item.category === 'PANEL' && product.type === 'SOLAR_PANEL') return true
                                    if (item.category === 'INVERTER' && product.type === 'INVERTER') return true
                                    if (item.category === 'BATTERY' && product.type === 'BATTERY') return true
                                    if (item.category === 'MOUNTING' && product.type === 'MOUNTING_SYSTEM') return true
                                    if (item.category === 'OTHER' &&
                                        (product.type === 'CABLE' ||
                                         product.type === 'MONITORING' ||
                                         product.type === 'ACCESSORY')) return true
                                    return false
                                  })
                                  .map((product) => (
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
                                ))}
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
                            >
                              <Trash2 className="w-4 h-4 text-red-500" />
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr>
                        <td colSpan={11} className="py-3 px-4">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={addItem}
                          >
                            <Plus className="w-4 h-4 mr-2" />
                            Yeni Satır Ekle
                          </Button>
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
                        <span>KDV ({quoteData.tax}%):</span>
                        <span className="font-medium">
                          {formatCurrency(quoteData.subtotal * (quoteData.tax / 100))}
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
          quoteNumber={quoteData.quoteNumber || `Q-${Date.now().toString().slice(-8)}`}
        />
      </div>
    </DashboardLayout>
  )
}