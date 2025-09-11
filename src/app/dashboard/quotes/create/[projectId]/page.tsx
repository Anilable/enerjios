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
import html2canvas from 'html2canvas'
import jsPDF from 'jspdf'

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
  const [projectRequest, setProjectRequest] = useState<ProjectRequest | null>(null)
  const [activeStep, setActiveStep] = useState(1)
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
    tax: 18, // Default 18% KDV
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
        const response = await fetch('/api/products')
        if (response.ok) {
          const data = await response.json()
          setProducts(data)
        }
      } catch (error) {
        console.error('Error loading products:', error)
      }
    }

    loadProducts()
  }, [])

  // Generate initial quote items based on project capacity
  const generateInitialItems = (capacity: number, projectType: string) => {
    const items: QuoteItem[] = []
    
    // Calculate panel requirements (assuming 550W panels)
    const panelWattage = 550
    const panelCount = Math.ceil((capacity * 1000) / panelWattage)
    
    // Solar Panels
    items.push({
      id: '1',
      category: 'PANEL',
      name: 'Longi Solar 550W Mono Panel',
      description: 'Yüksek verimli monokristal güneş paneli',
      pricingType: 'UNIT',
      unitPrice: 3500,
      quantity: panelCount,
      discount: 0,
      tax: 18,
      subtotal: panelCount * 3500,
      total: panelCount * 3500 * 1.18
    })

    // Inverter (size based on capacity)
    const inverterSize = capacity
    items.push({
      id: '2',
      category: 'INVERTER',
      name: `Huawei ${inverterSize}KTL İnverter`,
      description: 'Şebeke bağlantılı solar inverter',
      pricingType: 'UNIT',
      unitPrice: capacity * 1200,
      quantity: 1,
      discount: 0,
      tax: 18,
      subtotal: capacity * 1200,
      total: capacity * 1200 * 1.18
    })

    // Mounting System
    items.push({
      id: '3',
      category: 'MOUNTING',
      name: 'Alüminyum Montaj Sistemi',
      description: 'Çatı tipi montaj konstrüksiyonu',
      pricingType: 'SET',
      unitPrice: panelCount * 450,
      quantity: 1,
      discount: 0,
      tax: 18,
      subtotal: panelCount * 450,
      total: panelCount * 450 * 1.18
    })

    // DC/AC Cables
    items.push({
      id: '4',
      category: 'OTHER',
      name: 'DC/AC Kablo Seti',
      description: 'Solar kablo, konnektör ve aksesuarlar',
      pricingType: 'SET',
      unitPrice: capacity * 350,
      quantity: 1,
      discount: 0,
      tax: 18,
      subtotal: capacity * 350,
      total: capacity * 350 * 1.18
    })

    // Project Cost
    items.push({
      id: '5',
      category: 'PROJECT_COST',
      name: 'Proje ve Mühendislik Hizmetleri',
      description: 'Proje tasarım, onay ve danışmanlık',
      pricingType: 'FIXED',
      unitPrice: 15000,
      quantity: 1,
      discount: 0,
      tax: 18,
      subtotal: 15000,
      total: 15000 * 1.18
    })

    // Labor
    items.push({
      id: '6',
      category: 'LABOR',
      name: 'Montaj ve İşçilik',
      description: 'Profesyonel kurulum ekibi',
      pricingType: 'KW',
      unitPrice: 800,
      quantity: capacity,
      discount: 0,
      tax: 18,
      subtotal: capacity * 800,
      total: capacity * 800 * 1.18
    })

    // Transport
    items.push({
      id: '7',
      category: 'TRANSPORT',
      name: 'Nakliye ve Lojistik',
      description: 'Malzeme taşıma ve depolama',
      pricingType: 'FIXED',
      unitPrice: 5000,
      quantity: 1,
      discount: 0,
      tax: 18,
      subtotal: 5000,
      total: 5000 * 1.18
    })

    setQuoteData(prev => ({
      ...prev,
      items: items
    }))

    calculateTotals(items)
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
      tax: 18,
      subtotal: 0,
      total: 0
    }

    const updatedItems = [...quoteData.items, newItem]
    setQuoteData(prev => ({
      ...prev,
      items: updatedItems
    }))
  }

  // Update item
  const updateItem = (itemId: string, field: keyof QuoteItem, value: any) => {
    const updatedItems = quoteData.items.map(item => {
      if (item.id === itemId) {
        const updatedItem = { ...item, [field]: value }
        
        // Recalculate subtotal and total
        updatedItem.subtotal = updatedItem.unitPrice * updatedItem.quantity
        const discountAmount = updatedItem.subtotal * (updatedItem.discount / 100)
        const afterDiscount = updatedItem.subtotal - discountAmount
        const taxAmount = afterDiscount * (updatedItem.tax / 100)
        updatedItem.total = afterDiscount + taxAmount
        
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
        throw new Error('Failed to save quote')
      }

      const savedQuote = await response.json()

      // Update local state with saved quote data
      setQuoteData(prev => ({
        ...prev,
        id: savedQuote.id,
        quoteNumber: savedQuote.quoteNumber
      }))

      toast({
        title: 'Başarılı',
        description: status === 'SENT' ? 'Teklif müşteriye gönderildi' : 'Teklif taslağı kaydedildi'
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

  // Generate preview data
  const generatePreviewData = (): any => {
    return {
      id: quoteData.id || 'preview',
      quoteNumber: quoteData.quoteNumber || `Q-${Date.now().toString().slice(-8)}`,
      customerName: quoteData.customerName,
      customerEmail: quoteData.customerEmail,
      customerPhone: quoteData.customerPhone,
      projectType: quoteData.projectType,
      systemSize: quoteData.capacity,
      panelCount: quoteData.items.filter(item => item.category === 'PANEL').reduce((sum, item) => sum + item.quantity, 0),
      capacity: quoteData.capacity,
      items: quoteData.items.map(item => ({
        id: item.id,
        name: item.name,
        type: item.category,
        brand: '',
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        totalPrice: item.total,
        specifications: {
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
      projectTitle: `${quoteData.capacity} kW Güneş Enerji Sistemi`,
      designData: {
        location: projectRequest?.location || 'Belirtilmemiş',
        roofArea: quoteData.capacity * 8, // rough estimate
        irradiance: 1450,
        tiltAngle: 30,
        azimuth: 180
      },
      financialAnalysis: {
        annualProduction: Math.round(quoteData.capacity * 1450),
        annualSavings: Math.round(quoteData.capacity * 1450 * 2.2),
        paybackPeriod: Math.round(quoteData.total / (quoteData.capacity * 1450 * 2.2)),
        npv25: Math.round(quoteData.capacity * 1450 * 2.2 * 15),
        irr: 12
      }
    }
  }

  // PDF Generation
  const generatePDF = async () => {
    try {
      const previewElement = document.getElementById('quote-preview-content')
      if (!previewElement) {
        toast({
          title: 'Hata',
          description: 'PDF oluşturulurken hata oluştu',
          variant: 'destructive'
        })
        return
      }

      const canvas = await html2canvas(previewElement, {
        scale: 2,
        useCORS: true,
        allowTaint: true
      })

      const imgData = canvas.toDataURL('image/png')
      const pdf = new jsPDF('p', 'mm', 'a4')
      const imgWidth = 210
      const pageHeight = 295
      const imgHeight = (canvas.height * imgWidth) / canvas.width
      let heightLeft = imgHeight

      let position = 0

      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight)
      heightLeft -= pageHeight

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight
        pdf.addPage()
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight)
        heightLeft -= pageHeight
      }

      const quoteNumber = quoteData.quoteNumber || `Q-${Date.now().toString().slice(-8)}`
      pdf.save(`Teklif-${quoteNumber}.pdf`)

      toast({
        title: 'Başarılı',
        description: 'PDF başarıyla indirildi'
      })
    } catch (error) {
      console.error('Error generating PDF:', error)
      toast({
        title: 'Hata',
        description: 'PDF oluşturulurken hata oluştu',
        variant: 'destructive'
      })
    }
  }

  // Handle step navigation
  const nextStep = () => {
    if (activeStep < 4) {
      setActiveStep(activeStep + 1)
      if (activeStep === 3) {
        setShowPreview(true)
      }
    }
  }

  const prevStep = () => {
    if (activeStep > 1) {
      setActiveStep(activeStep - 1)
      if (activeStep === 4) {
        setShowPreview(false)
      }
    }
  }

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

        {/* Progress Steps */}
        <div className="flex items-center justify-center space-x-4">
          {[1, 2, 3, 4].map((step) => (
            <div
              key={step}
              className={`flex items-center ${step < 4 ? 'flex-1' : ''}`}
            >
              <div
                className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                  activeStep >= step
                    ? 'bg-primary text-white border-primary'
                    : 'bg-white text-gray-400 border-gray-300'
                }`}
              >
                {activeStep > step ? (
                  <Check className="w-5 h-5" />
                ) : (
                  <span>{step}</span>
                )}
              </div>
              {step < 4 && (
                <div
                  className={`flex-1 h-1 mx-2 ${
                    activeStep > step ? 'bg-primary' : 'bg-gray-200'
                  }`}
                />
              )}
            </div>
          ))}
        </div>
        <div className="flex justify-center space-x-8 text-sm">
          <span className={activeStep >= 1 ? 'text-primary font-medium' : 'text-gray-400'}>
            Proje Bilgileri
          </span>
          <span className={activeStep >= 2 ? 'text-primary font-medium' : 'text-gray-400'}>
            Malzeme Seçimi
          </span>
          <span className={activeStep >= 3 ? 'text-primary font-medium' : 'text-gray-400'}>
            Fiyatlandırma
          </span>
          <span className={activeStep >= 4 ? 'text-primary font-medium' : 'text-gray-400'}>
            Önizleme
          </span>
        </div>

        {/* Main Content */}
        {showPreview ? (
          <div id="quote-preview-content">
            <QuotePreview
              quote={generatePreviewData()}
              onEdit={() => setShowPreview(false)}
              onSend={() => saveQuote('SENT')}
              onDownload={generatePDF}
            />
          </div>
        ) : (
          <>
            {/* Quote Builder Table */}
            <Card>
              <CardHeader>
                <CardTitle>Malzeme Listesi</CardTitle>
                <CardDescription>
                  Teklif için gerekli malzemeleri ekleyin ve fiyatlandırın
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
                            <Input
                              value={item.name}
                              onChange={(e) => updateItem(item.id, 'name', e.target.value)}
                              placeholder="Malzeme adı"
                              className="w-full"
                            />
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
                        <span>KDV (18%):</span>
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

            {/* Step Navigation */}
            <div className="flex justify-between mt-8">
              <Button
                variant="outline"
                onClick={prevStep}
                disabled={activeStep <= 1}
              >
                <ChevronLeft className="w-4 h-4 mr-2" />
                Önceki
              </Button>
              <Button
                onClick={nextStep}
                disabled={activeStep >= 4}
              >
                {activeStep === 3 ? 'Önizlemeye Geç' : 'Sonraki'}
                <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  )
}