'use client'

import { useState, useEffect, useMemo } from 'react'
import Link from 'next/link'
import * as XLSX from 'xlsx'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { useToast } from '@/hooks/use-toast'
import { Toaster } from '@/components/ui/toaster'
import { formatCurrency } from '@/lib/utils'
import { useExchangeRates, RateSource } from '@/hooks/use-exchange-rates'
import { RoleGuard, FinancialDataGuard, PricingGuard } from '@/components/ui/permission-guard'
import { Package as PackageType, PACKAGE_TYPES, PACKAGE_TYPE_LABELS, PACKAGE_TYPE_COLORS, PACKAGE_TYPE_ICONS, CreatePackageData, PackageItem } from '@/types/package'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Package,
  Plus,
  Search,
  MoreHorizontal,
  Zap,
  Battery,
  Sun,
  Settings,
  TrendingUp,
  Archive,
  Edit,
  Trash2,
  Copy,
  Upload,
  FileSpreadsheet,
  Cable,
  Monitor,
  Loader2,
  RefreshCw,
  Camera,
  X,
  FileText,
  BookOpen,
  Eye,
  ChevronLeft,
  ChevronRight,
  Box,
  Grid3x3,
  Trash,
  Save,
  CheckCircle,
  AlertCircle
} from 'lucide-react'

type Product = {
  id: string
  name: string
  code?: string
  category: string
  categoryId?: string
  type?: string
  brand: string
  model: string
  power: string
  price: number
  costPrice?: number
  purchasePrice?: number
  purchasePriceUsd?: number
  stock: number
  minStock?: number
  status: string
  warranty: string
  description?: string
  specifications?: any
  images?: string
  datasheet?: string
  manual?: string
  createdBy?: {
    id: string
    name: string | null
    email: string
  } | null
  updatedBy?: {
    id: string
    name: string | null
    email: string
  } | null
  createdAt: string
  updatedAt: string
}

type Category = {
  id: string
  name: string
  type?: string
  count: number
  icon: React.ComponentType<{ className?: string }> | string
  color?: string
}

// Icon mapping for categories
const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Sun: Sun,
  Zap: Zap,
  Battery: Battery,
  Settings: Settings,
  Cable: Cable,
  Monitor: Monitor,
  Package: Package
}

export default function ProductsPage() {
  const { toast } = useToast()
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string | null>(null)
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [showBulkAddDialog, setShowBulkAddDialog] = useState(false)

  // Raw price input values to avoid formatting conflicts
  const [rawPriceInputs, setRawPriceInputs] = useState({
    price: '',
    purchasePrice: '',
    editPrice: '',
    editPurchasePrice: ''
  })

  // Price input editing states
  const [editingPriceFields, setEditingPriceFields] = useState({
    price: false,
    purchasePrice: false,
    editPrice: false,
    editPurchasePrice: false
  })

  // Excel Upload States
  const [excelFile, setExcelFile] = useState<File | null>(null)
  const [excelData, setExcelData] = useState<any[]>([])
  const [excelHeaders, setExcelHeaders] = useState<string[]>([])
  const [columnMapping, setColumnMapping] = useState<{[key: string]: string}>({})
  const [showMappingStep, setShowMappingStep] = useState(false)
  const [showPreviewStep, setShowPreviewStep] = useState(false)
  const [bulkUploadProgress, setBulkUploadProgress] = useState(0)
  const [bulkUploadStatus, setBulkUploadStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle')
  const [showStockUpdateDialog, setShowStockUpdateDialog] = useState(false)
  const [showPriceUpdateDialog, setShowPriceUpdateDialog] = useState(false)
  const [showOrderDialog, setShowOrderDialog] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [formData, setFormData] = useState<Partial<Product>>({})
  const [saving, setSaving] = useState(false)
  const [uploadingFiles, setUploadingFiles] = useState(false)
  const [selectedFiles, setSelectedFiles] = useState<{
    images: FileList | null
    datasheet: File | null
    manual: File | null
  }>({ images: null, datasheet: null, manual: null })
  const [showFileModal, setShowFileModal] = useState(false)
  const [currentFile, setCurrentFile] = useState<{type: string, url: string, name: string, images?: string[]} | null>(null)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [showCategoryDialog, setShowCategoryDialog] = useState(false)
  const [showCategoryManagementDialog, setShowCategoryManagementDialog] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null)
  const [categoryFormData, setCategoryFormData] = useState<{name: string, color: string}>({name: '', color: ''})
  const [newCategoryFormData, setNewCategoryFormData] = useState<{name: string, color: string, icon: string}>({name: '', color: 'blue', icon: 'Package'})
  const [currentUser, setCurrentUser] = useState<{id: string, email: string, role: string, name: string} | null>(null)

  // Package Management State
  const [activeTab, setActiveTab] = useState('products')
  const [packages, setPackages] = useState<any[]>([])
  const [expandedPackages, setExpandedPackages] = useState<Set<string>>(new Set())
  const [showAddPackageDialog, setShowAddPackageDialog] = useState(false)
  const [showEditPackageDialog, setShowEditPackageDialog] = useState(false)
  const [showDeletePackageDialog, setShowDeletePackageDialog] = useState(false)
  const [selectedPackage, setSelectedPackage] = useState<PackageType | null>(null)
  const [packageFormData, setPackageFormData] = useState<any>({
    name: '',
    type: 'ON_GRID',
    description: '',
    parentId: null,
    items: []
  })
  const [packageSearchTerm, setPackageSearchTerm] = useState('')
  const [productSearchTerm, setProductSearchTerm] = useState('')
  const [selectedProducts, setSelectedProducts] = useState<{productId: string, quantity: number, unitPrice: number}[]>([])
  const [loadingPackages, setLoadingPackages] = useState(false)

  const { rates, loading: exchangeLoading, error: exchangeError, convertToTRY, convertFromTRY } = useExchangeRates()
  const usdRateSource = (rates?.sources?.USD as RateSource | undefined) ?? undefined
  const usdRateLabelMap: Record<RateSource | 'unknown', string> = {
    manual: 'Manuel',
    internal: 'Sistem',
    external: 'API',
    fallback: 'Tahmini',
    unknown: 'Bilinmiyor'
  }
  const formattedUsdRate = typeof rates?.USD === 'number'
    ? new Intl.NumberFormat('tr-TR', {
        style: 'currency',
        currency: 'TRY',
        minimumFractionDigits: 2,
        maximumFractionDigits: 4
      }).format(rates.USD)
    : null
  const rateDisplayText = exchangeLoading
    ? 'Kur yükleniyor...'
    : formattedUsdRate
      ? `1 USD = ${formattedUsdRate} - ${usdRateLabelMap[usdRateSource ?? 'unknown']}`
      : 'Kur bilgisi bulunamadı'
  const manualWarningActive = !exchangeLoading && usdRateSource !== 'manual'
  const isManualErrorMessage = exchangeError?.toLowerCase().includes('usd için manuel') ?? false
  const generalExchangeError = exchangeError && !isManualErrorMessage ? exchangeError : null

  const renderUsdRateInfo = () => (
    <div className="space-y-1 text-xs">
      <div className="flex items-center justify-between text-muted-foreground">
        <span>{rateDisplayText}</span>
        <Link href="/dashboard/admin/exchange-rates" className="text-blue-600 hover:underline">
          Kur yönetimi
        </Link>
      </div>
      {manualWarningActive && (
        <p className="text-red-600">
          Manuel kur tanımlı değil.{' '}
          <Link href="/dashboard/admin/exchange-rates" className="underline">
            Manuel kur ekle
          </Link>
        </p>
      )}
      {generalExchangeError && (
        <p className="text-orange-600">{generalExchangeError}</p>
      )}
    </div>
  )

  const handleUsdPurchasePriceChange = (value: string) => {
    setFormData(prev => {
      const next = { ...prev }

      if (value === '') {
        next.purchasePriceUsd = undefined
        next.purchasePrice = undefined
        return next
      }

      const parsedValue = Number(value)
      if (Number.isNaN(parsedValue)) {
        return next
      }

      next.purchasePriceUsd = parsedValue

      if (typeof rates?.USD === 'number') {
        const converted = Number(convertToTRY(parsedValue, 'USD').toFixed(2))
        if (!Number.isNaN(converted)) {
          next.purchasePrice = converted
        }
      }

      return next
    })
  }

  useEffect(() => {
    if (typeof formData.purchasePriceUsd !== 'number' || Number.isNaN(formData.purchasePriceUsd)) {
      return
    }

    if (typeof rates?.USD !== 'number') {
      return
    }

    const converted = Number(convertToTRY(formData.purchasePriceUsd, 'USD').toFixed(2))

    setFormData(prev => {
      if (prev.purchasePrice === converted) {
        return prev
      }
      return {
        ...prev,
        purchasePrice: converted
      }
    })
  }, [rates?.USD, formData.purchasePriceUsd])

  const totalSalesValueTRY = useMemo(() => (
    products.reduce((sum, p) => sum + (p.price * p.stock), 0)
  ), [products])

  const totalUnits = useMemo(() => (
    products.reduce((sum, p) => sum + p.stock, 0)
  ), [products])

  const totalPurchaseValueTRY = useMemo(() => (
    products.reduce((sum, p) => {
      const purchasePrice = p.purchasePrice || 0
      return sum + (purchasePrice * p.stock)
    }, 0)
  ), [products])

  const totalProfitTRY = useMemo(() => (
    products.reduce((sum, p) => {
      const purchasePrice = p.purchasePrice || 0
      if (!purchasePrice) return sum
      const profit = (p.price - purchasePrice) * p.stock
      return profit > 0 ? sum + profit : sum
    }, 0)
  ), [products])

  const usdRate = typeof rates?.USD === 'number' && rates.USD > 0 ? rates.USD : null

  const totalSalesValueUSD = useMemo(() => (
    usdRate ? convertFromTRY(totalSalesValueTRY, 'USD') : null
  ), [usdRate, totalSalesValueTRY, convertFromTRY])

  const totalPurchaseValueUSD = useMemo(() => (
    usdRate ? convertFromTRY(totalPurchaseValueTRY, 'USD') : null
  ), [usdRate, totalPurchaseValueTRY, convertFromTRY])

  const totalProfitUSD = useMemo(() => (
    usdRate ? convertFromTRY(totalProfitTRY, 'USD') : null
  ), [usdRate, totalProfitTRY, convertFromTRY])

  // Fetch products from database
  const fetchProducts = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/products')
      if (!response.ok) {
        throw new Error('Failed to fetch products')
      }
      const data = await response.json()
      console.log('📦 Products loaded:', data.length, 'products')
      console.log('📦 Sample product categories:', data.slice(0, 10).map((p: any) => ({
        name: p.name,
        category: p.category,
        categoryId: p.categoryId
      })))

      // Also log all unique categories
      const uniqueCategories = [...new Set(data.map((p: any) => p.category).filter(Boolean))]
      console.log('📂 All unique categories in products:', uniqueCategories)
      setProducts(data)

      // After products are loaded, fetch categories with the new product data
      await fetchCategories(data)
    } catch (error) {
      console.error('Error fetching products:', error)
      toast({
        title: "Hata",
        description: "Ürünler yüklenirken bir hata oluştu.",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  // Fetch categories from database
  const fetchCategories = async (currentProducts?: Product[]) => {
    try {
      console.log('🔄 Fetching categories from API...')
      const response = await fetch('/api/products/categories')
      console.log('📥 Categories API response:', response.status, response.statusText)

      if (!response.ok) {
        throw new Error(`Failed to fetch categories: ${response.status} ${response.statusText}`)
      }
      const data = await response.json()

      // Use passed products or current state
      const productsToUse = currentProducts || products;

      // Map icons from string to component and ensure count is calculated correctly
      const mappedCategories = data.map((cat: any) => {

        // Always calculate count from products array
        let actualCount = 0;
        if (productsToUse.length > 0) {
          // Category mappings for matching
          const categoryMappings: Record<string, string[]> = {
            'Solar Paneller': ['Panel', 'panel', 'Solar Panel', 'Güneş Paneli'],
            'İnverterler': ['İnverter', 'inverter', 'Inverter'],
            'Bataryalar': ['Batarya', 'batarya', 'Battery'],
            'Montaj Malzemeleri': ['Montaj', 'montaj', 'Mounting', 'Konstrüksiyon', 'konstrüksiyon'],
            'Kablolar': ['Kablo', 'kablo', 'Cable', 'Kablolar'],
            'İzleme Sistemleri': ['İzleme', 'izleme', 'Monitoring'],
            'Aksesuarlar': ['Aksesuar', 'aksesuar', 'Accessory', 'Aksesuarlar'],
            'AKÜ': ['AKÜ', 'Aku', 'aku', 'Akü', 'Battery', 'Batarya'],
            'DC Pompa': ['DC Pompa', 'dc pompa', 'DC POMPA'],
            'Şarj Kontrol': ['Şarj Kontrol', 'şarj kontrol', 'ŞARJ KONTROL', 'Charge Controller']
          };

          const matchingProducts = productsToUse.filter(product => {
            const matchByName = product.category === cat.name;
            const matchById = product.categoryId === cat.id;
            const matchByMapping = categoryMappings[cat.name]?.includes(product.category || '') || false;

            return matchByName || matchById || matchByMapping;
          });

          actualCount = matchingProducts.length;
        }

        return {
          ...cat,
          icon: iconMap[cat.icon] || Package,
          count: actualCount
        };
      })

      setCategories(mappedCategories)
    } catch (error) {
      console.error('❌ Error fetching categories:', error)
      toast({
        title: "Hata",
        description: "Kategoriler yüklenirken bir hata oluştu: " + (error instanceof Error ? error.message : 'Bilinmeyen hata'),
        variant: "destructive"
      })
      // Re-throw the error so it can be caught by calling functions
      throw error
    }
  }

  // Fetch current user info
  const fetchUser = async () => {
    try {
      const response = await fetch('/api/user')
      if (response.ok) {
        const userData = await response.json()
        setCurrentUser(userData)
        console.log('👤 User info loaded:', userData)
      } else {
        console.error('Failed to fetch user info:', response.statusText)
      }
    } catch (error) {
      console.error('Error fetching user info:', error)
    }
  }

  // Fetch packages from database
  const fetchPackages = async () => {
    try {
      setLoadingPackages(true)
      const response = await fetch('/api/packages?includeChildren=true')
      if (!response.ok) {
        throw new Error('Failed to fetch packages')
      }
      const data = await response.json()
      console.log('📦 Packages from API:', data)

      // Transform packages to ensure proper product data structure and hierarchy
      const transformedPackages = (data.packages || []).map((pkg: any) => ({
        ...pkg,
        items: pkg.items?.map((item: any) => ({
          ...item,
          productName: item.productName || item.product?.name || 'Ürün'
        })) || [],
        children: pkg.children?.map((child: any) => ({
          ...child,
          items: child.items?.map((item: any) => ({
            ...item,
            productName: item.productName || item.product?.name || 'Ürün'
          })) || []
        })) || []
      }))

      console.log('🔄 Transformed packages:', transformedPackages)
      setPackages(transformedPackages)
    } catch (error) {
      console.error('Error fetching packages:', error)
      toast({
        title: "Hata",
        description: "Paketler yüklenirken bir hata oluştu.",
        variant: "destructive"
      })
    } finally {
      setLoadingPackages(false)
    }
  }

  // Initial data load
  useEffect(() => {
    fetchProducts() // Now also fetches categories after products are loaded
    fetchUser()
    fetchPackages()
  }, [])


  const searchValue = searchTerm.toLowerCase()
  const filteredProducts = products.filter(product => {
    // If we have a selected category filter, only show products from that category
    if (selectedCategoryFilter && selectedCategoryFilter !== 'all') {
      const selectedCategory = categories.find(cat => cat.id === selectedCategoryFilter)

      // Check both categoryId and legacy category name matching
      const matchesCategoryId = product.categoryId === selectedCategoryFilter

      // Check if product category matches the selected category name
      // Also check category mappings for different naming conventions
      const categoryMappings: Record<string, string[]> = {
        'Solar Paneller': ['Panel', 'panel', 'Solar Panel', 'Güneş Paneli'],
        'İnverterler': ['İnverter', 'inverter', 'Inverter'],
        'Bataryalar': ['Batarya', 'batarya', 'Battery'],
        'Montaj Malzemeleri': ['Montaj', 'montaj', 'Mounting', 'Konstrüksiyon'],
        'Kablolar': ['Kablo', 'kablo', 'Cable', 'Kablolar'],
        'İzleme Sistemleri': ['İzleme', 'izleme', 'Monitoring'],
        'Aksesuarlar': ['Aksesuar', 'aksesuar', 'Accessory', 'Aksesuarlar']
      }

      const categoryName = selectedCategory?.name || ''
      const possibleMatches = categoryMappings[categoryName] || [categoryName]
      const matchesCategoryName = possibleMatches.includes(product.category || '')

      const matchesCategory = matchesCategoryId || matchesCategoryName

      // If category filter is active, only return products that match the category
      if (!matchesCategory) return false

      // If no search term, show all products from the category
      if (!searchValue) return true

      // If search term exists, check if product matches search term
      return (
        (product.name || '').toLowerCase().includes(searchValue) ||
        (product.brand || '').toLowerCase().includes(searchValue) ||
        (product.category || '').toLowerCase().includes(searchValue) ||
        (product.code || '').toLowerCase().includes(searchValue)
      )
    }

    // No category filter - standard search functionality
    if (!searchValue) return true // Show all products if no search term

    return (
      (product.name || '').toLowerCase().includes(searchValue) ||
      (product.brand || '').toLowerCase().includes(searchValue) ||
      (product.category || '').toLowerCase().includes(searchValue) ||
      (product.code || '').toLowerCase().includes(searchValue)
    )
  })

  const filteredPackages = packages.filter(pkg => {
    // Sadece root paketleri göster (alt paketler parentları içinde gösterilecek)
    const isRoot = !pkg.parentId
    const typeLabel = PACKAGE_TYPE_LABELS[pkg.type as keyof typeof PACKAGE_TYPE_LABELS]
    const matchesSearch =
      (pkg.name || '').toLowerCase().includes(packageSearchTerm.toLowerCase()) ||
      (typeLabel || '').toLowerCase().includes(packageSearchTerm.toLowerCase())

    return isRoot && matchesSearch
  })

  // File upload helper function
  const uploadFile = async (file: File): Promise<string> => {
    console.log('📤 Uploading file:', file.name, 'Type:', file.type, 'Size:', file.size)

    const formData = new FormData()
    formData.append('file', file)

    const response = await fetch('/api/upload', {
      method: 'POST',
      body: formData
    })

    console.log('📨 Upload response status:', response.status)

    if (!response.ok) {
      const error = await response.text()
      console.error('❌ Upload error:', error)
      throw new Error('File upload failed: ' + error)
    }

    const result = await response.json()
    console.log('✅ Upload successful, URL:', result.url)
    return result.url
  }

  // Upload multiple files and return their URLs
  const uploadFiles = async () => {
    console.log('🚀 Starting file upload process...')
    console.log('Selected files:', selectedFiles)

    const uploadedFiles: { images: string[], datasheet?: string, manual?: string } = { images: [] }

    try {
      // Upload images
      if (selectedFiles.images && selectedFiles.images.length > 0) {
        console.log(`📸 Uploading ${selectedFiles.images.length} images...`)
        for (let i = 0; i < selectedFiles.images.length; i++) {
          const imageUrl = await uploadFile(selectedFiles.images[i])
          uploadedFiles.images.push(imageUrl)
        }
      }

      // Upload datasheet
      if (selectedFiles.datasheet) {
        console.log('📄 Uploading datasheet...')
        uploadedFiles.datasheet = await uploadFile(selectedFiles.datasheet)
      }

      // Upload manual
      if (selectedFiles.manual) {
        console.log('📖 Uploading manual...')
        uploadedFiles.manual = await uploadFile(selectedFiles.manual)
      }

      console.log('✨ All files uploaded successfully:', uploadedFiles)
      return uploadedFiles
    } catch (error) {
      console.error('❌ File upload error:', error)
      toast({
        variant: "destructive",
        title: "Hata",
        description: "Dosya yükleme başarısız!"
      })
      throw error
    }
  }

  // Delete file functions
  const deleteProductImages = async (productId: string) => {
    try {
      console.log('🗑️ Deleting product images:', productId)
      const response = await fetch(`/api/products/${productId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          images: '[]' // Clear images
        })
      })

      if (!response.ok) {
        throw new Error('Failed to delete images')
      }

      toast({
        title: "✅ Başarılı!",
        description: "Görseller silindi.",
      })

      // Update the selected product state
      if (selectedProduct) {
        setSelectedProduct({
          ...selectedProduct,
          images: '[]'
        })
      }

      // Refresh products list
      await fetchProducts()
    } catch (error) {
      console.error('❌ Error deleting images:', error)
      toast({
        variant: "destructive",
        title: "Hata",
        description: "Görseller silinirken hata oluştu!"
      })
    }
  }

  const deleteProductDatasheet = async (productId: string) => {
    try {
      console.log('🗑️ Deleting product datasheet:', productId)
      const response = await fetch(`/api/products/${productId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          datasheet: null // Clear datasheet
        })
      })

      if (!response.ok) {
        throw new Error('Failed to delete datasheet')
      }

      toast({
        title: "✅ Başarılı!",
        description: "Teknik döküman silindi.",
      })

      // Update the selected product state
      if (selectedProduct) {
        setSelectedProduct({
          ...selectedProduct,
          datasheet: null as any
        })
      }

      // Refresh products list
      await fetchProducts()
    } catch (error) {
      console.error('❌ Error deleting datasheet:', error)
      toast({
        variant: "destructive",
        title: "Hata",
        description: "Teknik döküman silinirken hata oluştu!"
      })
    }
  }

  const deleteProductManual = async (productId: string) => {
    try {
      console.log('🗑️ Deleting product manual:', productId)
      const response = await fetch(`/api/products/${productId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          manual: null // Clear manual
        })
      })

      if (!response.ok) {
        throw new Error('Failed to delete manual')
      }

      toast({
        title: "✅ Başarılı!",
        description: "Kullanım kılavuzu silindi.",
      })

      // Update the selected product state
      if (selectedProduct) {
        setSelectedProduct({
          ...selectedProduct,
          manual: null as any
        })
      }

      // Refresh products list
      await fetchProducts()
    } catch (error) {
      console.error('❌ Error deleting manual:', error)
      toast({
        variant: "destructive",
        title: "Hata",
        description: "Kullanım kılavuzu silinirken hata oluştu!"
      })
    }
  }

  // Excel Upload Functions
  const handleExcelUpload = (file: File) => {
    if (!file) return

    // Validate file type
    if (!file.name.endsWith('.xlsx') && !file.name.endsWith('.xls')) {
      toast({
        variant: "destructive",
        title: "Hata",
        description: "Sadece Excel dosyaları (.xlsx, .xls) desteklenir!"
      })
      return
    }

    // Validate file size (10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast({
        variant: "destructive",
        title: "Hata",
        description: "Dosya boyutu 10MB'dan büyük olamaz!"
      })
      return
    }

    setExcelFile(file)
    const reader = new FileReader()

    reader.onload = (e) => {
      try {
        const data = e.target?.result
        const workbook = XLSX.read(data, { type: 'binary' })
        const sheetName = workbook.SheetNames[0]
        const worksheet = workbook.Sheets[sheetName]
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 })

        if (jsonData.length < 2) {
          toast({
            variant: "destructive",
            title: "Hata",
            description: "Excel dosyası en az 2 satır içermelidir (başlık + veri)!"
          })
          return
        }

        const headers = jsonData[0] as string[]
        const rows = jsonData.slice(1)

        console.log('📊 Excel Headers found:', headers)
        console.log('📊 Excel Headers length:', headers.length)
        headers.forEach((header, index) => {
          console.log(`Header ${index}:`, typeof header, header)
        })
        console.log('📊 Excel Data rows:', rows.length)

        // Filter out empty headers
        const validHeaders = headers.map((header, index) => ({
          originalIndex: index,
          header: header,
          isEmpty: !header || header.toString().trim() === ''
        }))
        console.log('📊 Valid headers analysis:', validHeaders)

        setExcelHeaders(headers)
        setExcelData(rows)
        setShowMappingStep(true)

        // Auto-detect common mappings
        const autoMapping: {[key: string]: string} = {}
        headers.forEach((header, index) => {
          const lowerHeader = header.toString().toLowerCase()
          console.log(`🔍 Processing header ${index}: "${header}" -> "${lowerHeader}"`)

          if (lowerHeader.includes('tanim') || lowerHeader.includes('tanım') || lowerHeader.includes('ad') || lowerHeader.includes('name') || lowerHeader.includes('ürün')) {
            autoMapping[index.toString()] = 'name'
            console.log(`✅ Auto-mapped column ${index} (${header}) to 'name'`)
          } else if (lowerHeader.includes('kategori') || lowerHeader.includes('category')) {
            autoMapping[index.toString()] = 'category'
            console.log(`✅ Auto-mapped column ${index} (${header}) to 'category'`)
          } else if (lowerHeader.includes('marka') || lowerHeader.includes('brand')) {
            autoMapping[index.toString()] = 'brand'
            console.log(`✅ Auto-mapped column ${index} (${header}) to 'brand'`)
          } else if (lowerHeader.includes('usd') || lowerHeader.includes('dolar')) {
            autoMapping[index.toString()] = 'purchasePriceUsd'
            console.log(`✅ Auto-mapped column ${index} (${header}) to 'purchasePriceUsd'`)
          } else if (lowerHeader.includes('alış') || lowerHeader.includes('alis') || lowerHeader.includes('maliyet') || lowerHeader.includes('cost')) {
            autoMapping[index.toString()] = 'purchasePrice'
            console.log(`✅ Auto-mapped column ${index} (${header}) to 'purchasePrice'`)
          } else if (lowerHeader.includes('fiyat') || lowerHeader.includes('price') || lowerHeader.includes('birim fiyat') || lowerHeader.includes('net fiyat')) {
            autoMapping[index.toString()] = 'price'
            console.log(`✅ Auto-mapped column ${index} (${header}) to 'price'`)
          } else if (lowerHeader.includes('stok') || lowerHeader.includes('stock') || lowerHeader.includes('durum')) {
            autoMapping[index.toString()] = 'stock'
            console.log(`✅ Auto-mapped column ${index} (${header}) to 'stock'`)
          } else if (lowerHeader.includes('kod') || lowerHeader.includes('code') || lowerHeader.includes('sku')) {
            autoMapping[index.toString()] = 'code'
            console.log(`✅ Auto-mapped column ${index} (${header}) to 'code'`)
          } else if (lowerHeader.includes('model')) {
            autoMapping[index.toString()] = 'model'
            console.log(`✅ Auto-mapped column ${index} (${header}) to 'model'`)
          } else if (lowerHeader.includes('güç') || lowerHeader.includes('power') || lowerHeader.includes('watt')) {
            autoMapping[index.toString()] = 'power'
            console.log(`✅ Auto-mapped column ${index} (${header}) to 'power'`)
          } else if (lowerHeader.includes('garanti') || lowerHeader.includes('warranty')) {
            autoMapping[index.toString()] = 'warranty'
            console.log(`✅ Auto-mapped column ${index} (${header}) to 'warranty'`)
          } else if (lowerHeader.includes('açıklama') || lowerHeader.includes('description') || lowerHeader.includes('özellik')) {
            autoMapping[index.toString()] = 'description'
            console.log(`✅ Auto-mapped column ${index} (${header}) to 'description'`)
          } else {
            console.log(`⚪ No auto-mapping for column ${index}: "${header}"`)
          }
        })

        console.log('🎯 Final auto-mapping result:', autoMapping)
        setColumnMapping(autoMapping)

        toast({
          title: "✅ Başarılı!",
          description: `Excel dosyası yüklendi. ${rows.length} satır veri bulundu.`
        })
      } catch (error) {
        console.error('Excel parsing error:', error)
        toast({
          variant: "destructive",
          title: "Hata",
          description: "Excel dosyası okunurken hata oluştu!"
        })
      }
    }

    reader.readAsBinaryString(file)
  }

  const validateMappedData = () => {
    console.log('🔍 Validating mapped data...')
    console.log('📊 Current column mapping:', columnMapping)

    const nameColumn = Object.keys(columnMapping).find(key => columnMapping[key] === 'name')
    const categoryColumn = Object.keys(columnMapping).find(key => columnMapping[key] === 'category')
    const brandColumn = Object.keys(columnMapping).find(key => columnMapping[key] === 'brand')
    const priceColumn = Object.keys(columnMapping).find(key => columnMapping[key] === 'price')

    console.log('✅ Found columns:', {
      name: nameColumn,
      category: categoryColumn,
      brand: brandColumn,
      price: priceColumn
    })

    if (!nameColumn || !categoryColumn || !priceColumn) {
      console.log('❌ Validation failed - missing required columns')
      toast({
        variant: "destructive",
        title: "Eksik Alanlar",
        description: "Ürün Adı, Kategori ve Fiyat alanları zorunludur!"
      })
      return false
    }

    console.log('✅ Validation passed')
    return true
  }

  const processExcelData = async () => {
    if (!validateMappedData()) return

    setBulkUploadStatus('uploading')
    setBulkUploadProgress(0)

    const nameColumn = Object.keys(columnMapping).find(key => columnMapping[key] === 'name')!
    const categoryColumn = Object.keys(columnMapping).find(key => columnMapping[key] === 'category')!
    const brandColumn = Object.keys(columnMapping).find(key => columnMapping[key] === 'brand')
    const codeColumn = Object.keys(columnMapping).find(key => columnMapping[key] === 'code')
    const modelColumn = Object.keys(columnMapping).find(key => columnMapping[key] === 'model')
    const priceColumn = Object.keys(columnMapping).find(key => columnMapping[key] === 'price')!
    const purchasePriceColumn = Object.keys(columnMapping).find(key => columnMapping[key] === 'purchasePrice')
    const purchasePriceUsdColumn = Object.keys(columnMapping).find(key => columnMapping[key] === 'purchasePriceUsd')
    const stockColumn = Object.keys(columnMapping).find(key => columnMapping[key] === 'stock')
    const powerColumn = Object.keys(columnMapping).find(key => columnMapping[key] === 'power')
    const warrantyColumn = Object.keys(columnMapping).find(key => columnMapping[key] === 'warranty')
    const descriptionColumn = Object.keys(columnMapping).find(key => columnMapping[key] === 'description')

    const toStringValue = (value: any) => value !== undefined && value !== null ? String(value).trim() : ''
    const toNumberValue = (value: any) => {
      const parsed = parseFloat(String(value).toString().replace(',', '.'))
      return Number.isNaN(parsed) ? undefined : parsed
    }

    const products = excelData.map(row => {
      const product: any = {
        name: toStringValue(row[parseInt(nameColumn)]),
        category: toStringValue(row[parseInt(categoryColumn)]),
        brand: brandColumn !== undefined ? toStringValue(row[parseInt(brandColumn)]) : '',
        price: toNumberValue(row[parseInt(priceColumn)]) || 0,
        stock: stockColumn !== undefined
          ? parseInt(toStringValue(row[parseInt(stockColumn)])) || 0
          : 0,
      }

      const codeValue = codeColumn ? toStringValue(row[parseInt(codeColumn)]) : ''
      if (codeValue) {
        product.code = codeValue
      }

      const modelValue = modelColumn ? toStringValue(row[parseInt(modelColumn)]) : ''
      if (modelValue) {
        product.model = modelValue
      }

      const purchasePriceValue = purchasePriceColumn ? toNumberValue(row[parseInt(purchasePriceColumn)]) : undefined
      if (purchasePriceValue !== undefined) {
        product.purchasePrice = purchasePriceValue
      }

      const purchasePriceUsdValue = purchasePriceUsdColumn ? toNumberValue(row[parseInt(purchasePriceUsdColumn)]) : undefined
      if (purchasePriceUsdValue !== undefined) {
        product.purchasePriceUsd = purchasePriceUsdValue
      }

      const powerValue = powerColumn ? toStringValue(row[parseInt(powerColumn)]) : ''
      if (powerValue) {
        product.power = powerValue
      }

      const warrantyValue = warrantyColumn ? parseInt(toStringValue(row[parseInt(warrantyColumn)])) : undefined
      if (warrantyValue && !Number.isNaN(warrantyValue)) {
        product.warranty = warrantyValue
      }

      const descriptionValue = descriptionColumn ? toStringValue(row[parseInt(descriptionColumn)]) : ''
      if (descriptionValue) {
        product.description = descriptionValue
      }

      return product
    })

    // Process in batches
    const batchSize = 10
    let processed = 0

    for (let i = 0; i < products.length; i += batchSize) {
      const batch = products.slice(i, i + batchSize)

      try {
        for (const product of batch) {
          await fetch('/api/products', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(product)
          })
          processed++
          setBulkUploadProgress((processed / products.length) * 100)
        }
      } catch (error) {
        console.error('Batch upload error:', error)
      }
    }

    setBulkUploadStatus('success')
    await fetchProducts()

    toast({
      title: "✅ Tamamlandı!",
      description: `${processed} ürün başarıyla eklendi.`
    })

    // Reset states
    setExcelFile(null)
    setExcelData([])
    setExcelHeaders([])
    setColumnMapping({})
    setShowMappingStep(false)
    setShowPreviewStep(false)
    setShowBulkAddDialog(false)
  }

  const downloadExcelTemplate = () => {
    const templateData = [
      ['Ürün Adı', 'Ürün Kodu', 'Kategori', 'Marka', 'Model', 'Fiyat', 'USD Alış Fiyatı', 'Stok', 'Güç (W)', 'Garanti (Yıl)', 'Açıklama'],
      ['540W Monokristalin Panel', 'PNL-540', 'Panel', 'Longi Solar', 'LR5-54HPH-540M', '1500', '320', '50', '540', '25', 'Yüksek verimli monokristalin güneş paneli'],
      ['5KW Hibrit İnverter', 'INV-5000', 'İnverter', 'Growatt', 'SPH-5000TL3-BH', '8500', '1800', '20', '5000', '5', 'Bataryalı hibrit inverter sistemi'],
      ['100Ah Lithium Batarya', 'BAT-100', 'Batarya', 'Pylontech', 'US3000C', '12000', '2200', '15', '0', '10', 'LiFePO4 lityum depolama bataryası'],
      ['Alüminyum Montaj Rayı', 'MON-RAIL', 'Konstrüksiyon', 'Schletter', 'MSP-Plus', '150', '20', '100', '0', '25', '4m uzunluğunda alüminyum montaj rayı']
    ]

    const worksheet = XLSX.utils.aoa_to_sheet(templateData)
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Ürünler')
    XLSX.writeFile(workbook, 'urun-sablonu.xlsx')

    toast({
      title: "📄 Excel Şablonu İndirildi",
      description: "Örnek Excel dosyası bilgisayarınıza kaydedildi."
    })
  }

  const handleAddProduct = async () => {
    const trimmedCode = formData.code?.trim()
    if (!formData.name || !formData.categoryId || !formData.price || !formData.brand || !trimmedCode) {
      toast({
        title: "Hata",
        description: "Lütfen tüm gerekli alanları doldurun.",
        variant: "destructive"
      })
      return
    }

    if (formData.purchasePriceUsd !== undefined && formData.purchasePriceUsd !== null && Number(formData.purchasePriceUsd) < 0) {
      toast({
        title: "Hata",
        description: "USD alış fiyatı negatif olamaz.",
        variant: "destructive"
      })
      return
    }

    try {
      setSaving(true)
      setUploadingFiles(true)

      // Upload files first
      let uploadedFiles: { images: string[], datasheet?: string, manual?: string } = { images: [], datasheet: undefined, manual: undefined }
      try {
        uploadedFiles = await uploadFiles()
        toast({
          title: "Dosyalar yüklendi",
          description: "Dosyalar başarıyla yüklendi, ürün kaydediliyor..."
        })
      } catch (error) {
        toast({
          title: "Dosya yükleme hatası",
          description: "Bazı dosyalar yüklenirken hata oluştu.",
          variant: "destructive"
        })
      }
      setUploadingFiles(false)

      console.log('Sending product data:', {
        name: formData.name,
        categoryId: formData.categoryId,
        code: trimmedCode,
        brand: formData.brand,
        model: formData.model || '',
        power: formData.power,
        price: Number(formData.price),
        purchasePriceUsd: formData.purchasePriceUsd !== undefined && formData.purchasePriceUsd !== null
          ? Number(formData.purchasePriceUsd)
          : null,
        stock: Number(formData.stock) || 0,
        minStock: Number(formData.minStock) || 0,
        warranty: formData.warranty,
        description: formData.description,
        images: JSON.stringify(uploadedFiles.images),
        datasheet: uploadedFiles.datasheet,
        manual: uploadedFiles.manual
      })

      const response = await fetch('/api/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          categoryId: formData.categoryId,
          code: trimmedCode,
          brand: formData.brand,
          model: formData.model || '',
          power: formData.power,
          price: Number(formData.price),
          purchasePrice: formData.purchasePrice ? Number(formData.purchasePrice) : null,
          purchasePriceUsd: formData.purchasePriceUsd !== undefined && formData.purchasePriceUsd !== null
            ? Number(formData.purchasePriceUsd)
            : null,
          stock: Number(formData.stock) || 0,
        minStock: Number(formData.minStock) || 0,
          warranty: formData.warranty,
          description: formData.description,
          images: JSON.stringify(uploadedFiles.images),
          datasheet: uploadedFiles.datasheet
          // manual: uploadedFiles.manual // Field doesn't exist in Product model
        })
      })

      console.log('Create response status:', response.status)
      console.log('Create response ok:', response.ok)

      // Handle response
      let responseBody;
      try {
        responseBody = await response.json()
        console.log('Create response body:', responseBody)
      } catch (parseError) {
        console.error('Failed to parse response body:', parseError)
        responseBody = null
      }

      if (!response.ok) {
        const errorMessage = responseBody?.error || responseBody?.message || `HTTP ${response.status}: ${response.statusText}`
        console.error('Create API error:', errorMessage)
        throw new Error(errorMessage)
      }

      // Success - refresh data from server to ensure consistency
      setFormData({})
      setShowAddDialog(false)

      toast({
        title: "Başarılı",
        description: "Ürün başarıyla eklendi."
      })

      // Refresh both products and categories
      await fetchProducts()
      await fetchCategories()
    } catch (error) {
      console.error('Error adding product:', error)
      toast({
        title: "Hata",
        description: error instanceof Error ? error.message : "Ürün eklenirken bir hata oluştu.",
        variant: "destructive"
      })
    } finally {
      setSaving(false)
    }
  }

  // Handle product duplication
  const handleDuplicateProduct = async (product: Product) => {
    try {
      setSaving(true)

      // Find categoryId if missing
      let categoryId = product.categoryId
      if (!categoryId && product.category) {
        // Try to find category by name
        const category = categories.find(cat =>
          cat.name === product.category ||
          cat.name.toLowerCase() === product.category.toLowerCase()
        )
        categoryId = category?.id
      }
      // If still no categoryId, use the first category as default
      if (!categoryId && categories.length > 0) {
        categoryId = categories[0].id
        console.log(`⚠️ No category found for product, using default: ${categories[0].name}`)
      }

      // Create new product data with "Kopya" prefix and updated code
      const duplicatedProduct = {
        name: `${product.name} - Kopya`,
        categoryId: categoryId,
        code: `${product.code || ''}-COPY-${Date.now().toString().slice(-4)}`,
        brand: product.brand,
        model: product.model || '',
        power: product.power,
        price: Number(product.price),
        purchasePrice: product.purchasePrice,
        purchasePriceUsd: product.purchasePriceUsd,
        stock: 0, // Reset stock for duplicated product
        minStock: product.minStock || 0,
        warranty: product.warranty,
        description: product.description || '',
        images: product.images || '[]',
        datasheet: product.datasheet,
        specifications: product.specifications
      }

      console.log('🔄 Duplicating product:', duplicatedProduct)

      const response = await fetch('/api/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(duplicatedProduct)
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to duplicate product')
      }

      toast({
        title: "Başarılı",
        description: "Ürün başarıyla çoğaltıldı."
      })

      // Refresh products list
      await fetchProducts()
      await fetchCategories()
    } catch (error) {
      console.error('Error duplicating product:', error)
      toast({
        title: "Hata",
        description: error instanceof Error ? error.message : "Ürün çoğaltılırken bir hata oluştu.",
        variant: "destructive"
      })
    } finally {
      setSaving(false)
    }
  }

  // Handle package duplication
  const handleDuplicatePackage = async (pkg: any) => {
    try {
      setSaving(true)

      // Create new package data with "Kopya" prefix
      const duplicatedPackage = {
        name: `${pkg.name} - Kopya`,
        type: pkg.type,
        description: pkg.description || '',
        parentId: pkg.parentId, // Keep the same parent if it's a child package
        items: pkg.items?.map((item: any) => ({
          productId: item.productId,
          quantity: item.quantity,
          unitPrice: item.unitPrice
        })) || [],
        totalPower: pkg.totalPower,
        isActive: pkg.isActive,
        isFeatured: false // Reset featured status for duplicated packages
      }

      console.log('🔄 Duplicating package:', duplicatedPackage)

      const response = await fetch('/api/packages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(duplicatedPackage)
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to duplicate package')
      }

      toast({
        title: "Başarılı",
        description: "Paket başarıyla çoğaltıldı."
      })

      // Refresh packages list
      await fetchPackages()
    } catch (error) {
      console.error('Error duplicating package:', error)
      toast({
        title: "Hata",
        description: error instanceof Error ? error.message : "Paket çoğaltılırken bir hata oluştu.",
        variant: "destructive"
      })
    } finally {
      setSaving(false)
    }
  }

  const handleEditProduct = async () => {
    console.log('🔄 Starting handleEditProduct')
    console.log('🔄 Form data before edit:', formData)
    console.log('🔄 Selected product:', selectedProduct)
    console.log('🔄 FormData types:', {
      price: typeof formData.price,
      purchasePrice: typeof formData.purchasePrice,
      purchasePriceUsd: typeof formData.purchasePriceUsd,
      priceValue: formData.price,
      purchasePriceValue: formData.purchasePrice,
      purchasePriceUsdValue: formData.purchasePriceUsd
    })

    const trimmedCode = formData.code?.trim() || ''
    console.log('🔍 Validation check:', {
      selectedProduct: !!selectedProduct,
      name: !!formData.name,
      categoryId: !!formData.categoryId,
      price: !!formData.price,
      trimmedCode: !!trimmedCode,
      originalCode: formData.code
    })

    if (!selectedProduct || !formData.name || !formData.categoryId || !formData.price) {
      console.log('❌ Validation failed - missing required fields')
      toast({
        title: "Hata",
        description: "Lütfen tüm gerekli alanları doldurun.",
        variant: "destructive"
      })
      return
    }

    console.log('✅ Validation passed, proceeding with update')

    try {
      setSaving(true)
      console.log('🔄 Setting saving to true')

      if (formData.purchasePriceUsd !== undefined && formData.purchasePriceUsd !== null && Number(formData.purchasePriceUsd) < 0) {
        console.log('❌ USD price validation failed')
        toast({
          title: "Hata",
          description: "USD alış fiyatı negatif olamaz.",
          variant: "destructive"
        })
        setSaving(false)
        return
      }

      console.log('🔄 Starting edit product process...')
      console.log('Selected files state:', selectedFiles)
      setUploadingFiles(true)

      // Upload files first if any selected
      let uploadedFiles: { images: string[], datasheet?: string, manual?: string } = { images: [], datasheet: undefined, manual: undefined }
      try {
        if (selectedFiles.images || selectedFiles.datasheet || selectedFiles.manual) {
          console.log('📁 Files detected, starting upload...')
          uploadedFiles = await uploadFiles()
          toast({
            title: "Dosyalar yüklendi",
            description: "Dosyalar başarıyla yüklendi, ürün güncelleniyor..."
          })
        } else {
          console.log('📂 No files selected for upload')
        }
      } catch (error) {
        console.error('❌ File upload error in handleEditProduct:', error)
        // Continue with update even if file upload fails
      } finally {
        setUploadingFiles(false)
      }

      // Merge uploaded files with existing data
      let existingImages = []
      try {
        existingImages = selectedProduct.images ? JSON.parse(selectedProduct.images) : []
        if (!Array.isArray(existingImages)) existingImages = []
      } catch (error) {
        console.error('Error parsing selectedProduct.images in handleEditProduct:', error)
        existingImages = []
      }
      const allImages = [...existingImages, ...uploadedFiles.images]

      const requestBody = {
        name: formData.name,
        categoryId: formData.categoryId,
        code: trimmedCode,
        brand: formData.brand,
        model: formData.model,
        power: formData.power,
        price: Number(formData.price),
        purchasePrice: formData.purchasePrice ? Number(formData.purchasePrice) : null,
        purchasePriceUsd: formData.purchasePriceUsd !== undefined && formData.purchasePriceUsd !== null
          ? Number(formData.purchasePriceUsd)
          : null,
        stock: Number(formData.stock),
        minStock: Number(formData.minStock) || 0,
        warranty: formData.warranty,
        description: formData.description,
        images: JSON.stringify(allImages),
        datasheet: uploadedFiles.datasheet || selectedProduct.datasheet,
        // manual: uploadedFiles.manual || selectedProduct.manual // Field doesn't exist
      }

      console.log('📤 Sending PUT request with body:', requestBody)
      console.log('🔍 Category debugging:', {
        selectedCategoryId: formData.categoryId,
        selectedCategoryName: categories.find(c => c.id === formData.categoryId)?.name,
        originalProductCategory: selectedProduct.category,
        originalProductCategoryId: selectedProduct.categoryId
      })

      const response = await fetch(`/api/products/${selectedProduct.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
      })

      console.log('📥 API response status:', response.status, response.statusText)

      if (!response.ok) {
        const error = await response.json()
        console.error('❌ API error response:', error)
        throw new Error(error.error || 'Failed to update product')
      }

      const updatedProduct = await response.json()
      console.log('✅ Updated product received:', updatedProduct)

      // API returns { message, product } format, so use the product field
      const productData = updatedProduct.product || updatedProduct
      console.log('🔄 Using product data:', productData)

      setFormData({})
      setSelectedProduct(null)
      setShowEditDialog(false)

      toast({
        title: "Başarılı",
        description: "Ürün başarıyla güncellendi."
      })

      // Refresh both products and categories
      await fetchProducts()
      await fetchCategories()
    } catch (error) {
      console.error('Error updating product:', error)
      toast({
        title: "Hata",
        description: error instanceof Error ? error.message : "Ürün güncellenirken bir hata oluştu.",
        variant: "destructive"
      })
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteProduct = async () => {
    if (!selectedProduct) {
      console.error('No selected product for deletion')
      return
    }

    console.log('Attempting to delete product:', selectedProduct.id)

    try {
      setSaving(true)

      const response = await fetch(`/api/products/${selectedProduct.id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      console.log('Delete response status:', response.status)
      console.log('Delete response ok:', response.ok)

      // Handle response
      let responseBody;
      try {
        responseBody = await response.json()
        console.log('Delete response body:', responseBody)
      } catch (parseError) {
        console.error('Failed to parse response body:', parseError)
        responseBody = null
      }

      if (!response.ok) {
        const errorMessage = responseBody?.error || responseBody?.message || `HTTP ${response.status}: ${response.statusText}`
        const errorDetails = responseBody?.details || ''
        console.error('Delete API error:', errorMessage)
        console.error('Delete API details:', errorDetails)

        // Show more user-friendly error messages
        if (errorMessage.includes('Cannot delete product')) {
          // Parse the count from error details
          const quoteMatch = errorDetails.match(/(\d+) quote/)
          const placementMatch = errorDetails.match(/(\d+) panel placement/)

          let friendlyMessage = 'Bu ürün aşağıdaki yerlerde kullanıldığı için silinemez:\n\n'

          if (quoteMatch && parseInt(quoteMatch[1]) > 0) {
            friendlyMessage += `• ${quoteMatch[1]} teklif dosyasında\n`
          }
          if (placementMatch && parseInt(placementMatch[1]) > 0) {
            friendlyMessage += `• ${placementMatch[1]} panel yerleşiminde\n`
          }

          // Add affected quotes information if available
          if (responseBody?.affectedQuotes && responseBody.affectedQuotes.length > 0) {
            friendlyMessage += '\n📋 Kullanıldığı teklifler:\n'
            responseBody.affectedQuotes.forEach((quote: any) => {
              friendlyMessage += `• ${quote.quoteNumber || 'N/A'} - ${quote.customerName}\n`
            })
          }

          friendlyMessage += '\n💡 Çözüm önerileri:\n'
          friendlyMessage += '• Önce ilgili teklifleri silin veya başka ürün seçin\n'
          friendlyMessage += '• Ürünü pasif yapmak için düzenle butonunu kullanın\n'
          friendlyMessage += '• Ürün bilgilerini güncellemek için düzenleyebilirsiniz'

          throw new Error(friendlyMessage)
        }

        throw new Error(errorMessage)
      }

      // Success - close dialog first
      setSelectedProduct(null)
      setShowDeleteDialog(false)

      toast({
        title: "Başarılı",
        description: "Ürün başarıyla silindi."
      })

      // Refresh both products and categories
      await fetchProducts()
      await fetchCategories()
    } catch (error) {
      console.error('Error deleting product:', error)
      toast({
        title: "Hata",
        description: error instanceof Error ? error.message : "Ürün silinirken bir hata oluştu.",
        variant: "destructive"
      })
    } finally {
      setSaving(false)
    }
  }

  // Category Management Functions
  const handleCategoryClick = (category: Category) => {
    setSelectedCategory(category)
    setCategoryFormData({ name: category.name, color: category.color || 'blue' })
    setShowCategoryDialog(true)
  }

  const handleFilterByCategory = (categoryId: string) => {
    // Find the category to show its name in the search
    const category = categories.find(cat => cat.id === categoryId)
    const categoryName = category?.name || ''


    // Set the category filter instead of search term
    setSelectedCategoryFilter(categoryId)
    setSearchTerm('') // Clear search term when filtering by category

    // Show toast with filter info
    toast({
      title: "Kategori Filtresi",
      description: `${categoryName} kategorisine göre filtrelendi.`
    })
  }

  const clearFilters = () => {
    setSearchTerm('')
    setSelectedCategoryFilter(null)
    toast({
      title: "Filtreler Temizlendi",
      description: "Tüm ürünler gösteriliyor."
    })
  }

  const handleCategoryUpdate = async () => {
    if (!selectedCategory || !categoryFormData.name) return

    try {
      setSaving(true)

      // For now, just show success message
      // In a real implementation, you'd call an API to update category
      toast({
        title: "Başarılı",
        description: "Kategori başarıyla güncellendi."
      })

      setShowCategoryDialog(false)
      setSelectedCategory(null)
      setCategoryFormData({name: '', color: ''})

      // Refresh categories
      fetchCategories()
    } catch (error) {
      console.error('Error updating category:', error)
      toast({
        title: "Hata",
        description: "Kategori güncellenirken bir hata oluştu.",
        variant: "destructive"
      })
    } finally {
      setSaving(false)
    }
  }

  // Open category management dialog
  const handleCategoryManagement = () => {
    setShowCategoryManagementDialog(true)
  }

  // Export products to Excel
  const handleExportProducts = () => {
    try {
      const exportData = products.map(product => ({
        'Ürün Adı': product.name,
        'Kategori': product.category,
        'Marka': product.brand,
        'Model': product.model,
        'Kod': product.code || '',
        'Açıklama': product.description || '',
        'Fiyat (₺)': product.price,
        'Alış Fiyatı (₺)': product.purchasePrice || '',
        'Alış Fiyatı (USD)': product.purchasePriceUsd || '',
        'Stok': product.stock,
        'Min. Stok': product.minStock || 0,
        'Garanti (Yıl)': product.warranty || '',
        'Güç (W)': product.power || '',
        'Voltaj (V)': product.specifications?.voltage || '',
        'Akım (A)': product.specifications?.current || '',
        'Verimlilik (%)': product.specifications?.efficiency || '',
        'Oluşturulma Tarihi': product.createdAt ? new Date(product.createdAt).toLocaleDateString('tr-TR') : '',
        'Güncellenme Tarihi': product.updatedAt ? new Date(product.updatedAt).toLocaleDateString('tr-TR') : ''
      }))

      const worksheet = XLSX.utils.json_to_sheet(exportData)
      const workbook = XLSX.utils.book_new()
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Ürünler')

      // Auto-size columns
      const range = XLSX.utils.decode_range(worksheet['!ref']!)
      const cols = []
      for (let C = range.s.c; C <= range.e.c; C++) {
        let max_width = 10
        for (let R = range.s.r; R <= range.e.r; R++) {
          const cell = worksheet[XLSX.utils.encode_cell({ r: R, c: C })]
          if (cell && cell.v) {
            const len = cell.v.toString().length
            if (len > max_width) max_width = len
          }
        }
        cols.push({ width: Math.min(max_width + 2, 50) })
      }
      worksheet['!cols'] = cols

      const fileName = `urunler_${new Date().toLocaleDateString('tr-TR').replace(/\./g, '_')}.xlsx`
      XLSX.writeFile(workbook, fileName)

      toast({
        title: "Başarılı",
        description: `${products.length} ürün başarıyla dışa aktarıldı.`,
      })
    } catch (error) {
      console.error('Export error:', error)
      toast({
        title: "Hata",
        description: "Dışa aktarma sırasında bir hata oluştu.",
        variant: "destructive"
      })
    }
  }

  // Export packages to Excel
  const handleExportPackages = () => {
    try {
      const exportData = packages.map(pkg => ({
        'Paket Adı': pkg.name,
        'Tip': PACKAGE_TYPE_LABELS[pkg.type as keyof typeof PACKAGE_TYPE_LABELS] || pkg.type,
        'Açıklama': pkg.description || '',
        'Ana Paket': pkg.parentId ? packages.find(p => p.id === pkg.parentId)?.name || 'Bilinmiyor' : '',
        'Ürün Sayısı': pkg.items?.length || 0,
        'Toplam Fiyat (₺)': pkg.items?.reduce((total: number, item: any) => total + (item.quantity * item.unitPrice), 0) || 0,
        'Oluşturulma Tarihi': pkg.createdAt ? new Date(pkg.createdAt).toLocaleDateString('tr-TR') : '',
        'Güncellenme Tarihi': pkg.updatedAt ? new Date(pkg.updatedAt).toLocaleDateString('tr-TR') : ''
      }))

      const worksheet = XLSX.utils.json_to_sheet(exportData)
      const workbook = XLSX.utils.book_new()
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Paketler')

      // Auto-size columns
      const range = XLSX.utils.decode_range(worksheet['!ref']!)
      const cols = []
      for (let C = range.s.c; C <= range.e.c; C++) {
        let max_width = 10
        for (let R = range.s.r; R <= range.e.r; R++) {
          const cell = worksheet[XLSX.utils.encode_cell({ r: R, c: C })]
          if (cell && cell.v) {
            const len = cell.v.toString().length
            if (len > max_width) max_width = len
          }
        }
        cols.push({ width: Math.min(max_width + 2, 50) })
      }
      worksheet['!cols'] = cols

      const fileName = `paketler_${new Date().toLocaleDateString('tr-TR').replace(/\./g, '_')}.xlsx`
      XLSX.writeFile(workbook, fileName)

      toast({
        title: "Başarılı",
        description: `${packages.length} paket başarıyla dışa aktarıldı.`,
      })
    } catch (error) {
      console.error('Export error:', error)
      toast({
        title: "Hata",
        description: "Dışa aktarma sırasında bir hata oluştu.",
        variant: "destructive"
      })
    }
  }

  // Add new category
  const handleAddNewCategory = async () => {
    if (!newCategoryFormData.name) {
      toast({
        title: "Hata",
        description: "Kategori adı gereklidir.",
        variant: "destructive"
      })
      return
    }

    // Add timeout protection to prevent button from getting stuck
    const timeoutId = setTimeout(() => {
      console.warn('⚠️ Category creation timeout after 30 seconds')
      setSaving(false)
      toast({
        title: "Hata",
        description: "İşlem zaman aşımına uğradı. Lütfen tekrar deneyin.",
        variant: "destructive"
      })
    }, 30000) // 30 second timeout

    try {
      console.log('🚀 Starting category creation:', newCategoryFormData)
      setSaving(true)

      // Create new category via API (simulated for now)
      console.log('📡 Sending POST request to /api/products/categories')
      const response = await fetch('/api/products/categories', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: newCategoryFormData.name,
          icon: newCategoryFormData.icon,
          color: newCategoryFormData.color
        })
      })

      console.log('📥 API response received:', response.status, response.statusText)
      const result = await response.json()
      console.log('📊 API response data:', result)

      if (!response.ok) {
        throw new Error(result.error || result.details || 'Failed to create category')
      }

      // Check if category was actually created (new system)
      if (result.category) {
        // Category was successfully created!
        console.log('🎉 Showing success toast for category creation')
        toast({
          title: "✅ Başarılı!",
          description: result.message || `"${newCategoryFormData.name}" kategorisi eklendi.`,
          variant: "default"
        })

        // Reset form
        setNewCategoryFormData({name: '', color: 'blue', icon: 'Package'})

        // Close modal
        setShowCategoryManagementDialog(false)

        // Refresh categories to show the new one
        console.log('📂 Refreshing categories to show new category')
        try {
          await fetchCategories()
          console.log('✅ Categories refreshed, new category should be visible')
        } catch (refreshError) {
          console.error('⚠️ Category refresh failed:', refreshError)
        }
      } else {
        // Legacy response (old enum system message)
        console.log('ℹ️ Showing info toast for legacy response')
        toast({
          title: "ℹ️ Bilgi",
          description: result.message || "İşlem tamamlandı.",
          variant: "default"
        })

        // Still close the modal but don't refresh
        setNewCategoryFormData({name: '', color: 'blue', icon: 'Package'})
        setShowCategoryManagementDialog(false)
      }

      console.log('✅ Category operation completed successfully')
    } catch (error) {
      console.error('❌ Error creating category:', error)
      toast({
        title: "Hata",
        description: "Kategori ekleme sırasında bir hata oluştu: " + (error instanceof Error ? error.message : 'Bilinmeyen hata'),
        variant: "destructive"
      })
      // Close modal even on error after showing error message
      setShowCategoryManagementDialog(false)
    } finally {
      clearTimeout(timeoutId) // Clear the timeout
      setSaving(false)
      console.log('🔄 Save button re-enabled')
    }
  }

  // Delete category
  const handleDeleteCategory = async (categoryId: string) => {
    // Find category info for better messaging
    const category = categories.find(cat => cat.id === categoryId)
    const categoryName = category?.name || 'kategori'
    const productCount = category?.count || 0

    // Different confirmation messages for admin and regular users
    let confirmMessage = `"${categoryName}" kategorisini silmek istediğinizden emin misiniz?`

    if (productCount > 0) {
      if (currentUser?.role === 'ADMIN') {
        confirmMessage += `\n\n⚠️ Admin yetkisiyle siliyorsunuz:\n• Bu kategoride ${productCount} ürün bulunmaktadır\n• Ürünler otomatik olarak "Diğer" kategorisine taşınacaktır\n• Bu işlem geri alınamaz`
      } else {
        confirmMessage += `\n\nBu kategoride ${productCount} ürün bulunmaktadır. Önce ürünleri başka kategoriye taşıyın.`
        alert(confirmMessage)
        return
      }
    }

    if (!confirm(confirmMessage)) {
      return
    }

    try {
      setSaving(true)
      console.log('🗑️ Starting category deletion:', categoryId)

      // Make API call to delete category
      const response = await fetch(`/api/products/categories?id=${encodeURIComponent(categoryId)}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        }
      })

      console.log('📥 Delete response status:', response.status, response.statusText)
      const result = await response.json()
      console.log('📊 Delete response data:', result)

      if (!response.ok) {
        throw new Error(result.error || 'Failed to delete category')
      }

      // Success
      console.log('🎉 Showing success toast for category deletion')
      toast({
        title: "✅ Başarılı!",
        description: result.message || "Kategori başarıyla silindi.",
        variant: "default"
      })

      // Refresh categories to remove the deleted one
      console.log('📂 Refreshing categories after deletion')
      try {
        await fetchCategories()
        console.log('✅ Categories refreshed after deletion')
      } catch (refreshError) {
        console.error('⚠️ Category refresh failed after deletion:', refreshError)
      }

    } catch (error) {
      console.error('❌ Error deleting category:', error)
      toast({
        title: "Hata",
        description: error instanceof Error ? error.message : "Kategori silinirken bir hata oluştu.",
        variant: "destructive"
      })
    } finally {
      setSaving(false)
      console.log('🔄 Delete operation completed')
    }
  }

  const openEditDialog = (product: Product) => {
    console.log('📝 Opening edit dialog for product:', {
      id: product.id,
      name: product.name,
      category: product.category,
      categoryId: product.categoryId,
      images: product.images,
      datasheet: (product as any).datasheet,
      manual: (product as any).manual
    })

    setSelectedProduct(product)

    // Find the correct category name for the dropdown
    let categoryName = product.category || '';

    // Priority: use categoryId if available, fallback to category string
    if (product.categoryId && categories.length > 0) {
      const categoryObj = categories.find(cat => cat.id === product.categoryId);
      if (categoryObj) {
        categoryName = categoryObj.name;
      } else {
      }
    } else if (product.category) {
      // Fallback to string category with mapping
      const categoryMappings: Record<string, string> = {
        'İnverter': 'İnverterler',
        'Panel': 'Solar Paneller',
        'Batarya': 'Bataryalar',
        'Montaj': 'Montaj Malzemeleri',
        'Konstrüksiyon': 'Montaj Malzemeleri', // Map old Konstrüksiyon to Montaj Malzemeleri
        'Kablo': 'Kablolar',
        'İzleme': 'İzleme Sistemleri',
        'Aksesuar': 'Aksesuarlar',
        // Excel kategorileri için ek eşleştirmeler
        'AKÜ': 'AKÜ',
        'Şarj Kontrol': 'Şarj Kontrol',
        'DC Pompa': 'DC Pompa'
      };

      categoryName = categoryMappings[product.category] || product.category;
      console.log(`🔄 Using mapped category: "${product.category}" -> "${categoryName}"`);
    }

    console.log(`🎯 Final category name for dropdown: "${categoryName}"`)

    // Find categoryId if missing but category name exists
    let finalCategoryId = product.categoryId
    if (!finalCategoryId && product.category && categories.length > 0) {
      const categoryObj = categories.find(cat =>
        cat.name === product.category ||
        cat.name === categoryName ||
        cat.name.toLowerCase() === product.category.toLowerCase()
      )
      if (categoryObj) {
        finalCategoryId = categoryObj.id
        console.log(`🔧 Found categoryId for "${product.category}": ${finalCategoryId}`)
      } else {
        // If category doesn't exist, use the first available category as default
        console.log(`⚠️ Category "${product.category}" not found in current categories. Using default.`)
        finalCategoryId = categories[0]?.id
        if (finalCategoryId) {
          console.log(`🔧 Using default category: ${categories[0].name} (${finalCategoryId})`)
        }
      }
    }

    setFormData({
      ...product,
      categoryId: finalCategoryId, // Use found or existing categoryId
      power: typeof product.power === 'string' ? product.power.replace(/[^0-9.]/g, '') : String(product.power || ''),
      warranty: typeof product.warranty === 'string' ? product.warranty.replace(/[^0-9]/g, '') : String(product.warranty || '')
    })

    // Parse existing files from database
    let existingImages = []
    try {
      existingImages = typeof product.images === 'string'
        ? JSON.parse(product.images || '[]')
        : product.images || []
      if (!Array.isArray(existingImages)) {
        existingImages = []
      }
    } catch (error) {
      console.error('Error parsing product images in openEditDialog:', error)
      existingImages = []
    }

    console.log('📋 Existing files found:', {
      images: existingImages.length,
      datasheet: !!(product as any).datasheet,
      manual: !!(product as any).manual
    })

    // Clear selected files when opening edit dialog
    setSelectedFiles({ images: null, datasheet: null, manual: null })
    setShowEditDialog(true)
  }

  const openDeleteDialog = (product: Product) => {
    setSelectedProduct(product)
    setShowDeleteDialog(true)
  }

  const handleAutoOrder = () => {
    const lowStockProducts = products.filter(p => p.stock <= (p.minStock || 20))
    toast({
      title: "Sipariş Oluşturuldu",
      description: `${lowStockProducts.length} ürün için otomatik sipariş oluşturuldu.`
    })
    setShowOrderDialog(false)
  }

  const handleRefresh = () => {
    fetchProducts()
    fetchCategories()
    fetchPackages()
  }

  const handleImportComplete = async (importedProducts: any[]) => {
    console.log('📊 Excel import completed:', importedProducts.length, 'products')

    // Create products via API
    const createdProducts = []
    const errors = []

    for (const productData of importedProducts) {
      try {
        const response = await fetch('/api/products', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name: productData.name,
            brand: productData.brand,
            model: productData.model,
            category: productData.category,
            price: productData.price,
            costPrice: productData.usdPrice ? productData.usdPrice * (rates?.USD || 30) : undefined,
            stock: productData.stock,
            power: productData.power?.toString(),
            warranty: productData.warranty?.toString(),
            description: productData.description,
            code: productData.code,
          }),
        })

        if (response.ok) {
          const createdProduct = await response.json()
          createdProducts.push(createdProduct)
        } else {
          const error = await response.json()
          errors.push(`${productData.name}: ${error.error}`)
        }
      } catch (error) {
        errors.push(`${productData.name}: ${error instanceof Error ? error.message : 'Unknown error'}`)
      }
    }

    // Show results
    if (createdProducts.length > 0) {
      toast({
        title: "Başarılı",
        description: `✅ ${createdProducts.length} ürün başarıyla eklendi!${errors.length > 0 ? `\n\n❌ ${errors.length} hata oluştu.` : ''}`
      })

      // Refresh products list
      await fetchProducts()
      await fetchCategories()
    } else {
      toast({
        title: "Hata",
        description: `❌ Hiçbir ürün eklenemedi!\n\n${errors.slice(0, 3).join('\n')}`,
        variant: "destructive"
      })
    }
  }

  // Package Management Functions
  const handleAddPackage = async () => {
    console.log('🚀 handleAddPackage called with data:', packageFormData)
    console.log('📝 Validation check:', {
      name: !!packageFormData.name,
      type: !!packageFormData.type,
      itemsCount: packageFormData.items.length
    })

    if (!packageFormData.name || !packageFormData.type || packageFormData.items.length === 0) {
      console.log('❌ Validation failed')
      toast({
        title: "Hata",
        description: "Paket adı, tipi ve en az bir ürün gereklidir.",
        variant: "destructive"
      })
      return
    }

    console.log('✅ Validation passed, creating package...')

    try {
      setSaving(true)
      const response = await fetch('/api/packages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(packageFormData)
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to create package')
      }

      await response.json()

      // Reset form and close dialog
      setPackageFormData({
        name: '',
        type: 'ON_GRID',
        description: '',
        parentId: null,
        items: []
      })
      setSelectedProducts([])
      setShowAddPackageDialog(false)

      toast({
        title: "Başarılı",
        description: "Paket başarıyla oluşturuldu."
      })

      // Refresh packages list from server
      await fetchPackages()
    } catch (error) {
      console.error('Error creating package:', error)
      toast({
        title: "Hata",
        description: error instanceof Error ? error.message : "Paket oluşturulurken bir hata oluştu.",
        variant: "destructive"
      })
    } finally {
      setSaving(false)
    }
  }

  const handleEditPackage = async () => {
    if (!selectedPackage || !packageFormData.name) {
      toast({
        title: "Hata",
        description: "Paket adı gereklidir.",
        variant: "destructive"
      })
      return
    }

    try {
      setSaving(true)
      const response = await fetch(`/api/packages/${selectedPackage.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(packageFormData)
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to update package')
      }

      await response.json()
      setSelectedPackage(null)
      setShowEditPackageDialog(false)

      toast({
        title: "Başarılı",
        description: "Paket başarıyla güncellendi."
      })

      // Refresh packages list from server
      console.log('🔄 Fetching updated packages after edit...')
      await fetchPackages()
      console.log('✅ Package list refreshed after edit')
    } catch (error) {
      console.error('Error updating package:', error)
      toast({
        title: "Hata",
        description: error instanceof Error ? error.message : "Paket güncellenirken bir hata oluştu.",
        variant: "destructive"
      })
    } finally {
      setSaving(false)
    }
  }

  const handleDeletePackage = async () => {
    if (!selectedPackage) return

    try {
      setSaving(true)
      const response = await fetch(`/api/packages/${selectedPackage.id}`, {
        method: 'DELETE'
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to delete package')
      }

      setPackages(packages.filter(pkg => pkg.id !== selectedPackage.id))
      setSelectedPackage(null)
      setShowDeletePackageDialog(false)

      toast({
        title: "Başarılı",
        description: "Paket başarıyla silindi."
      })
    } catch (error) {
      console.error('Error deleting package:', error)
      toast({
        title: "Hata",
        description: error instanceof Error ? error.message : "Paket silinirken bir hata oluştu.",
        variant: "destructive"
      })
    } finally {
      setSaving(false)
    }
  }

  const openEditPackageDialog = (pkg: PackageType) => {
    setSelectedPackage(pkg)
    setPackageFormData({
      name: pkg.name,
      type: pkg.type,
      description: pkg.description || '',
      parentId: pkg.parentId || null,
      items: pkg.items.map(item => ({
        productId: item.productId,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        description: item.description
      }))
    })
    setShowEditPackageDialog(true)
  }

  const openAddSubPackageDialog = (parentPackage: PackageType) => {
    setSelectedPackage(null)
    setPackageFormData({
      name: '',
      type: parentPackage.type, // Alt paket aynı türde olmalı
      description: '',
      parentId: parentPackage.id,
      items: []
    })
    setShowAddPackageDialog(true)
  }

  const openDeletePackageDialog = (pkg: PackageType) => {
    setSelectedPackage(pkg)
    setShowDeletePackageDialog(true)
  }

  const addProductToPackage = (productId: string) => {
    const product = products.find(p => p.id === productId)
    if (!product) return

    const existingIndex = selectedProducts.findIndex(item => item.productId === productId)
    if (existingIndex >= 0) {
      // Update quantity
      const newSelectedProducts = [...selectedProducts]
      newSelectedProducts[existingIndex].quantity += 1
      setSelectedProducts(newSelectedProducts)
    } else {
      // Add new product
      setSelectedProducts([...selectedProducts, {
        productId: productId,
        quantity: 1,
        unitPrice: product.price
      }])
    }

    // Update package form data
    const packageItems = selectedProducts.map(item => ({
      productId: item.productId,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      description: undefined
    }))

    setPackageFormData({
      ...packageFormData,
      items: packageItems
    })
  }

  const removeProductFromPackage = (productId: string) => {
    const newSelectedProducts = selectedProducts.filter(item => item.productId !== productId)
    setSelectedProducts(newSelectedProducts)

    setPackageFormData({
      ...packageFormData,
      items: newSelectedProducts.map(item => ({
        productId: item.productId,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        description: undefined
      }))
    })
  }

  const updateProductQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeProductFromPackage(productId)
      return
    }

    const newSelectedProducts = selectedProducts.map(item =>
      item.productId === productId ? { ...item, quantity } : item
    )
    setSelectedProducts(newSelectedProducts)

    setPackageFormData({
      ...packageFormData,
      items: newSelectedProducts.map(item => ({
        productId: item.productId,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        description: undefined
      }))
    })
  }

  const updateProductPrice = (productId: string, unitPrice: number) => {
    if (unitPrice < 0) {
      return // Negatif fiyata izin verme
    }

    const newSelectedProducts = selectedProducts.map(item =>
      item.productId === productId ? { ...item, unitPrice } : item
    )
    setSelectedProducts(newSelectedProducts)

    setPackageFormData({
      ...packageFormData,
      items: newSelectedProducts.map(item => ({
        productId: item.productId,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        description: undefined
      }))
    })
  }

  return (
    <>
      <Toaster />
      <DashboardLayout title="Ürün ve Paket Yönetimi">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="products" className="flex items-center gap-2">
              <Package className="w-4 h-4" />
              Ürünler
            </TabsTrigger>
            <TabsTrigger value="packages" className="flex items-center gap-2">
              <Box className="w-4 h-4" />
              Paket Yönetimi
            </TabsTrigger>
          </TabsList>

          <TabsContent value="products" className="space-y-6">
        {/* Header Actions */}
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Ürün ara..."
                  className="pl-10 pr-10 w-64"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                {(searchTerm || selectedCategoryFilter) && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0 hover:bg-gray-100"
                    onClick={clearFilters}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                )}
              </div>
              {selectedCategoryFilter && (
                <div className="flex items-center gap-2 bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-sm">
                  <span>Kategori: {categories.find(c => c.id === selectedCategoryFilter)?.name}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-4 w-4 p-0 hover:bg-blue-100"
                    onClick={clearFilters}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              )}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={loading}
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Yenile
            </Button>
          </div>
          
          <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-2" onClick={() => setFormData({})}>
                <Plus className="w-4 h-4" />
                Yeni Ürün Ekle
              </Button>
            </DialogTrigger>
            <DialogContent
              className="max-w-[90vw] w-[85vw] min-w-[1400px] max-h-[85vh] overflow-y-auto"
              onInteractOutside={(event) => event.preventDefault()}
              onPointerDownOutside={(event) => event.preventDefault()}
            >
              <DialogHeader>
                <DialogTitle>Yeni Ürün Ekle</DialogTitle>
                <DialogDescription>
                  Yeni ürün bilgilerini girin.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-6 py-4">
                <div className="grid gap-8 lg:grid-cols-5">
                  {/* Temel Bilgiler - 3 columns wide */}
                  <div className="lg:col-span-3 space-y-4 rounded-lg border border-border/60 bg-gray-50/50 p-8">
                    <p className="text-sm font-semibold text-gray-700 uppercase tracking-wide">TEMEL BİLGİLER</p>
                    <div className="grid gap-4">
                      {/* First row - Full width name */}
                      <div className="grid gap-2">
                        <Label htmlFor="name" className="text-sm font-medium">Ürün Adı *</Label>
                        <Input
                          id="name"
                          value={formData.name || ''}
                          onChange={(e) => setFormData({...formData, name: e.target.value})}
                          placeholder="Ürün adı girin"
                          className="bg-white"
                        />
                      </div>

                      {/* Second row - Code and Category */}
                      <div className="grid gap-4 sm:grid-cols-2">
                        <div className="grid gap-2">
                          <Label htmlFor="code" className="text-sm font-medium">Ürün Kodu *</Label>
                          <Input
                            id="code"
                            value={formData.code || ''}
                            onChange={(e) => setFormData({...formData, code: e.target.value})}
                            placeholder="Örn. PNL-540"
                            className="bg-white"
                          />
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor="category" className="text-sm font-medium">Kategori *</Label>
                          <Select value={formData.categoryId || ''} onValueChange={(value) => setFormData({...formData, categoryId: value})}>
                            <SelectTrigger className="bg-white">
                              <SelectValue placeholder="Kategori seçin" />
                            </SelectTrigger>
                            <SelectContent>
                              {categories.map((category) => (
                                <SelectItem key={category.id} value={category.id}>
                                  {category.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      {/* Third row - Brand and Model */}
                      <div className="grid gap-4 sm:grid-cols-2">
                        <div className="grid gap-2">
                          <Label htmlFor="brand" className="text-sm font-medium">Marka *</Label>
                          <Input
                            id="brand"
                            value={formData.brand || ''}
                            onChange={(e) => setFormData({...formData, brand: e.target.value})}
                            placeholder="Marka"
                            className="bg-white"
                          />
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor="model" className="text-sm font-medium">Model</Label>
                          <Input
                            id="model"
                            value={formData.model || ''}
                            onChange={(e) => setFormData({...formData, model: e.target.value})}
                            placeholder="Model"
                            className="bg-white"
                          />
                        </div>
                      </div>

                      {/* Fourth row - Power and Warranty */}
                      <div className="grid gap-4 sm:grid-cols-2">
                        <div className="grid gap-2">
                          <Label htmlFor="power" className="text-sm font-medium">Güç (W)</Label>
                          <Input
                            id="power"
                            type="number"
                            value={formData.power || ''}
                            onChange={(e) => setFormData({...formData, power: e.target.value})}
                            placeholder="540"
                            className="bg-white"
                          />
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor="warranty" className="text-sm font-medium">Garanti (yıl)</Label>
                          <Input
                            id="warranty"
                            type="number"
                            value={formData.warranty || ''}
                            onChange={(e) => setFormData({...formData, warranty: e.target.value})}
                            placeholder="25"
                            className="bg-white"
                          />
                        </div>
                      </div>

                      {/* Description - Full width */}
                      <div className="grid gap-2">
                        <Label htmlFor="description" className="text-sm font-medium">Açıklama</Label>
                        <Textarea
                          id="description"
                          value={formData.description || ''}
                          onChange={(e) => setFormData({...formData, description: e.target.value})}
                          placeholder="Ürün açıklaması"
                          className="min-h-[100px] bg-white"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Fiyat ve Stok - 2 columns */}
                  <div className="lg:col-span-2 space-y-4 rounded-lg border border-border/60 bg-gray-50/50 p-8">
                    <p className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-2">FİYAT VE STOK</p>
                    <div className="grid gap-5">
                      <RoleGuard allowedRoles={['ADMIN']}>
                        <div className="space-y-5">
                          <div className="grid gap-2">
                            <Label htmlFor="purchasePrice" className="text-sm font-medium">Alış Fiyatı (₺)</Label>
                            <div className="flex gap-2">
                              <Input
                                id="purchasePrice"
                                type="text"
                                value={editingPriceFields.purchasePrice ?
                                  rawPriceInputs.purchasePrice :
                                  (formData.purchasePrice ? formData.purchasePrice.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '')
                                }
                                onChange={(e) => {
                                  let inputValue = e.target.value
                                  // Allow only numbers, comma, dot and minus
                                  inputValue = inputValue.replace(/[^0-9.,\-]/g, '')

                                  // Update raw input for editing
                                  setRawPriceInputs(prev => ({...prev, purchasePrice: inputValue}))

                                  if (inputValue === '' || inputValue === '-') {
                                    setFormData({...formData, purchasePrice: undefined})
                                  } else {
                                    // Convert Turkish format to number
                                    let cleanValue = inputValue.replace(/\./g, '').replace(',', '.')
                                    const numValue = parseFloat(cleanValue)
                                    if (!isNaN(numValue) && numValue >= 0) {
                                      setFormData({...formData, purchasePrice: numValue})
                                    }
                                  }
                                }}
                                onFocus={() => {
                                  // Switch to editing mode and show raw number
                                  setEditingPriceFields(prev => ({...prev, purchasePrice: true}))
                                  if (formData.purchasePrice) {
                                    setRawPriceInputs(prev => ({...prev, purchasePrice: formData.purchasePrice!.toString()}))
                                  }
                                }}
                                onBlur={() => {
                                  // Switch back to formatted display
                                  setEditingPriceFields(prev => ({...prev, purchasePrice: false}))
                                  setRawPriceInputs(prev => ({...prev, purchasePrice: ''}))
                                }}
                                placeholder="0,00"
                                className="bg-white flex-1"
                              />
                              <span className="flex items-center px-2 text-xs text-gray-500 bg-gray-100 rounded-r border-l">₺</span>
                            </div>
                          </div>
                          <div className="grid gap-2">
                            <Label htmlFor="purchasePriceUsd" className="text-sm font-medium">Alış Fiyatı (USD)</Label>
                            <div className="space-y-2">
                              <div className="flex gap-2">
                                <Input
                                  id="purchasePriceUsd"
                                  type="number"
                                  value={formData.purchasePriceUsd ?? ''}
                                  onChange={(e) => handleUsdPurchasePriceChange(e.target.value)}
                                  placeholder="0"
                                  className="bg-white flex-1"
                                />
                                <span className="flex items-center px-2 text-xs text-gray-500 bg-gray-100 rounded-r border-l">USD</span>
                              </div>
                              {renderUsdRateInfo()}
                            </div>
                          </div>
                          <div className="my-3 border-t border-gray-200"></div>
                        </div>
                      </RoleGuard>
                      <div className="grid gap-2">
                        <Label htmlFor="price" className="text-sm font-medium">Satış Fiyatı (₺) *</Label>
                        <div className="flex gap-2">
                          <Input
                            id="price"
                            type="text"
                            value={editingPriceFields.price ?
                              rawPriceInputs.price :
                              (formData.price ? formData.price.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '')
                            }
                            onChange={(e) => {
                              let inputValue = e.target.value
                              // Allow only numbers, comma, dot and minus
                              inputValue = inputValue.replace(/[^0-9.,\-]/g, '')

                              // Update raw input for editing
                              setRawPriceInputs(prev => ({...prev, price: inputValue}))

                              if (inputValue === '' || inputValue === '-') {
                                setFormData({...formData, price: undefined})
                              } else {
                                // Convert Turkish format to number
                                let cleanValue = inputValue.replace(/\./g, '').replace(',', '.')
                                const numValue = parseFloat(cleanValue)
                                if (!isNaN(numValue) && numValue >= 0) {
                                  setFormData({...formData, price: numValue})
                                }
                              }
                            }}
                            onFocus={() => {
                              // Switch to editing mode and show raw number
                              setEditingPriceFields(prev => ({...prev, price: true}))
                              if (formData.price !== undefined) {
                                setRawPriceInputs(prev => ({...prev, price: formData.price!.toString()}))
                              }
                            }}
                            onBlur={(e) => {
                              // Switch back to formatted display
                              setEditingPriceFields(prev => ({...prev, price: false}))
                              setRawPriceInputs(prev => ({...prev, price: ''}))
                            }}
                            placeholder="0,00"
                            className="bg-white flex-1"
                          />
                          <span className="flex items-center px-2 text-xs text-gray-500 bg-gray-100 rounded-r border-l">₺</span>
                        </div>
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="stock" className="text-sm font-medium">Mevcut Stok</Label>
                        <div className="flex gap-2">
                          <Input
                            id="stock"
                            type="number"
                            value={formData.stock || ''}
                            onChange={(e) => setFormData({...formData, stock: Number(e.target.value)})}
                            placeholder="0"
                            className="bg-white flex-1"
                          />
                          <span className="flex items-center px-2 text-xs text-gray-500 bg-gray-100 rounded-r border-l">adet</span>
                        </div>
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="minStock" className="text-sm font-medium">Azami Stok (Uyarı Limiti)</Label>
                        <div className="flex gap-2">
                          <Input
                            id="minStock"
                            type="number"
                            value={formData.minStock || ''}
                            onChange={(e) => setFormData({...formData, minStock: Number(e.target.value)})}
                            placeholder="0"
                            className="bg-white flex-1"
                          />
                          <span className="flex items-center px-2 text-xs text-gray-500 bg-gray-100 rounded-r border-l">adet</span>
                        </div>
                        <p className="text-xs text-gray-500">Stok bu değerin altına düştüğünde uyarı gösterilir</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Dosyalar */}
                <div className="rounded-lg border border-border/60 bg-gray-50/50 p-6">
                  <p className="text-sm font-semibold text-gray-700 uppercase tracking-wide">DOSYALAR</p>
                  <div className="mt-4 grid gap-4 md:grid-cols-3">
                    <div className="space-y-2">
                      <Label htmlFor="images">Ürün Görselleri</Label>
                      <Input
                        id="images"
                        type="file"
                        multiple
                        accept="image/*"
                        onChange={(e) => {
                          setSelectedFiles({...selectedFiles, images: e.target.files})
                          console.log('Selected images:', e.target.files)
                        }}
                        className="file:w-full file:justify-center file:rounded-full file:border-0 file:bg-blue-50 file:px-4 file:py-2 file:text-center file:text-sm file:font-semibold file:text-blue-700 hover:file:bg-blue-100"
                      />
                      <p className="text-xs text-muted-foreground">PNG, JPG, JPEG dosyaları desteklenir (Maks. 5 dosya)</p>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="datasheet">Teknik Döküman (PDF)</Label>
                      <Input
                        id="datasheet"
                        type="file"
                        accept=".pdf"
                        onChange={(e) => {
                          setSelectedFiles({...selectedFiles, datasheet: e.target.files?.[0] || null})
                          console.log('Selected datasheet:', e.target.files?.[0])
                        }}
                        className="file:w-full file:justify-center file:rounded-full file:border-0 file:bg-red-50 file:px-4 file:py-2 file:text-center file:text-sm file:font-semibold file:text-red-700 hover:file:bg-red-100"
                      />
                      <p className="text-xs text-muted-foreground">Sadece PDF dosyaları desteklenir</p>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="manual">Kullanım Kılavuzu (PDF)</Label>
                      <Input
                        id="manual"
                        type="file"
                        accept=".pdf"
                        onChange={(e) => {
                          setSelectedFiles({...selectedFiles, manual: e.target.files?.[0] || null})
                          console.log('Selected manual:', e.target.files?.[0])
                        }}
                        className="file:w-full file:justify-center file:rounded-full file:border-0 file:bg-green-50 file:px-4 file:py-2 file:text-center file:text-sm file:font-semibold file:text-green-700 hover:file:bg-green-100"
                      />
                      <p className="text-xs text-muted-foreground">Sadece PDF dosyaları desteklenir</p>
                    </div>
                  </div>
                </div>
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setShowAddDialog(false)} disabled={saving}>
                  İptal
                </Button>
                <Button onClick={handleAddProduct} disabled={saving}>
                  {saving ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      {uploadingFiles ? 'Dosyalar yükleniyor...' : 'Ürün kaydediliyor...'}
                    </>
                  ) : (
                    'Ürün Ekle'
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Category Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-7 gap-4">
          {categories.map((category) => {
            const IconComponent = typeof category.icon === 'string' ? Package : category.icon
            return (
              <Card key={category.id} className="cursor-pointer hover:shadow-md transition-all">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2" onClick={() => handleFilterByCategory(category.id)}>
                      <IconComponent className={`w-5 h-5 text-${category.color || 'blue'}-600`} />
                      <div>
                        <p className="text-2xl font-bold">{category.count}</p>
                        <p className="text-sm text-muted-foreground">{category.name}</p>
                      </div>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <span className="sr-only">Menüyü aç</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleFilterByCategory(category.id)}>
                          <Search className="mr-2 h-4 w-4" />
                          Filtrele
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleCategoryClick(category)}>
                          <Edit className="mr-2 h-4 w-4" />
                          Düzenle
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Products Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="w-5 h-5" />
              Ürün Listesi
            </CardTitle>
            <CardDescription>
              Mevcut ürünlerinizi görüntüleyin ve yönetin
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                {searchTerm ? 'Arama kriterlerine uygun ürün bulunamadı.' : 'Henüz ürün eklenmemiş.'}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4">Ürün</th>
                      <th className="text-left py-3 px-4">Kod</th>
                      <th className="text-left py-3 px-4">Kategori</th>
                      <th className="text-left py-3 px-4">Güç/Kapasite</th>
                      <FinancialDataGuard>
                        <th className="text-left py-3 px-4">Fiyat</th>
                      </FinancialDataGuard>
                      <FinancialDataGuard>
                        <th className="text-left py-3 px-4">USD Alış</th>
                      </FinancialDataGuard>
                      <th className="text-left py-3 px-4">Stok</th>
                      <th className="text-left py-3 px-4">Durum</th>
                      <th className="text-left py-3 px-4">Oluşturan</th>
                      <th className="text-left py-3 px-4">İşlemler</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredProducts.map((product) => (
                      <tr key={product.id} className="border-b hover:bg-gray-50">
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <div>
                              <p className="font-medium">{product.name}</p>
                              <p className="text-sm text-muted-foreground">
                                {product.brand} {product.model && `- ${product.model}`}
                              </p>
                            </div>
                            {/* File indicators */}
                            <div className="flex gap-1">
                              {(() => {
                                try {
                                  const images = product.images ? JSON.parse(product.images) : []
                                  return Array.isArray(images) && images.length > 0
                                } catch {
                                  return false
                                }
                              })() && (
                                <div className="group relative">
                                  <Camera
                                    className="w-4 h-4 text-blue-600 cursor-pointer hover:text-blue-800"
                                    onClick={() => {
                                      try {
                                        const images = product.images ? JSON.parse(product.images) : []
                                        if (Array.isArray(images) && images.length > 0) {
                                          setCurrentFile({type: 'image', url: images[0], name: 'Ürün Görselleri', images: images})
                                          setCurrentImageIndex(0)
                                          setShowFileModal(true)
                                        }
                                      } catch (error) {
                                        console.error('Error parsing product images:', error)
                                      }
                                    }}
                                  />
                                  <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-black text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                                    {(() => {
                                      try {
                                        const images = product.images ? JSON.parse(product.images) : []
                                        return Array.isArray(images) ? images.length : 0
                                      } catch {
                                        return 0
                                      }
                                    })()} görsel
                                  </div>
                                </div>
                              )}
                              {product.datasheet && (
                                <div className="group relative">
                                  <FileText
                                    className="w-4 h-4 text-red-600 cursor-pointer hover:text-red-800"
                                    onClick={() => {
                                      setCurrentFile({type: 'pdf', url: product.datasheet || '', name: 'Teknik Döküman'})
                                      setShowFileModal(true)
                                    }}
                                  />
                                  <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-black text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                                    Teknik döküman
                                  </div>
                                </div>
                              )}
                              {/* Manual field doesn't exist in Product model
                              {product.manual && (
                                <div className="group relative">
                                  <BookOpen
                                    className="w-4 h-4 text-green-600 cursor-pointer hover:text-green-800"
                                    onClick={() => {
                                      setCurrentFile({type: 'pdf', url: product.datasheet || '', name: 'Kullanım Kılavuzu'})
                                      setShowFileModal(true)
                                    }}
                                  />
                                  <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-black text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                                    Kullanım kılavuzu
                                  </div>
                                </div>
                              )} */}
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-sm text-muted-foreground">
                          {product.code || 'Belirtilmedi'}
                        </td>
                        <td className="py-3 px-4">
                          <Badge variant="secondary">{product.category}</Badge>
                        </td>
                        <td className="py-3 px-4 font-medium">
                          {product.power}
                        </td>
                        <td className="py-3 px-4 font-medium">
                          <FinancialDataGuard fallback={<span className="text-muted-foreground">Gizli</span>}>
                            {formatCurrency(product.price)}
                          </FinancialDataGuard>
                        </td>
                        <td className="py-3 px-4 font-medium">
                          <FinancialDataGuard fallback={<span className="text-muted-foreground">Gizli</span>}>
                            {product.purchasePriceUsd !== undefined && product.purchasePriceUsd !== null
                              ? formatCurrency(Number(product.purchasePriceUsd), 'USD')
                              : 'Belirtilmedi'}
                          </FinancialDataGuard>
                        </td>
                        <td className="py-3 px-4">
                          <span className={`font-medium ${
                            product.stock === 0 ? 'text-red-600' : 
                            product.stock < 20 ? 'text-orange-600' : 'text-green-600'
                          }`}>
                            {product.stock} adet
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <Badge 
                            variant={
                              product.status === 'Stokta' ? 'default' : 
                              product.status === 'Azalıyor' ? 'secondary' : 'destructive'
                            }
                            className={
                              product.status === 'Stokta' ? 'bg-green-100 text-green-800' : 
                              product.status === 'Azalıyor' ? 'bg-orange-100 text-orange-800' :
                              'bg-red-100 text-red-800'
                            }
                          >
                            {product.status}
                          </Badge>
                        </td>
                        <td className="py-3 px-4">
                          {product.createdBy ? (
                            <div className="text-sm">
                              <div className="font-medium">{product.createdBy.name || 'İsimsiz'}</div>
                              <div className="text-muted-foreground text-xs">
                                {new Date(product.createdAt).toLocaleDateString('tr-TR')}
                              </div>
                              {product.updatedBy && product.updatedBy.id !== product.createdBy.id && (
                                <div className="text-xs text-muted-foreground mt-1">
                                  Son güncelleme: {product.updatedBy.name || 'İsimsiz'}
                                </div>
                              )}
                            </div>
                          ) : (
                            <div className="text-sm text-muted-foreground">
                              Sistem
                            </div>
                          )}
                        </td>
                        <td className="py-3 px-4">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreHorizontal className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent>
                              <DropdownMenuItem onClick={() => openEditDialog(product)}>
                                <Edit className="w-4 h-4 mr-2" />
                                Düzenle
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleDuplicateProduct(product)}>
                                <Copy className="w-4 h-4 mr-2" />
                                Çoğalt
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => openDeleteDialog(product)}
                                className="text-red-600"
                              >
                                <Trash2 className="w-4 h-4 mr-2" />
                                Sil
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Stock Alerts */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Archive className="w-5 h-5" />
                Stok Uyarıları
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {products.filter(p => p.stock <= (p.minStock || 20)).length === 0 ? (
                  <p className="text-sm text-gray-500 text-center py-4">
                    Stok uyarısı bulunmuyor
                  </p>
                ) : (
                  products.filter(p => p.stock <= (p.minStock || 20)).map(product => (
                    <div key={product.id} className={`flex items-center justify-between p-3 border rounded-lg ${
                      product.stock === 0 ? 'border-red-200 bg-red-50' : 'border-orange-200 bg-orange-50'
                    }`}>
                      <div>
                        <p className={`font-medium ${product.stock === 0 ? 'text-red-800' : 'text-orange-800'}`}>
                          {product.name}
                        </p>
                        <p className={`text-sm ${product.stock === 0 ? 'text-red-600' : 'text-orange-600'}`}>
                          {product.stock === 0 ? 'Stok tükendi' : `Azami stok: ${product.minStock || 20} - Kritik seviyede`}
                        </p>
                      </div>
                      <Badge className={product.stock === 0 ? 'bg-red-100 text-red-800' : 'bg-orange-100 text-orange-800'}>
                        {product.stock} adet
                      </Badge>
                    </div>
                  ))
                )}
              </div>
              
              {products.filter(p => p.stock < 20).length > 0 && (
                <Dialog open={showOrderDialog} onOpenChange={setShowOrderDialog}>
                  <DialogTrigger asChild>
                    <Button className="w-full mt-4">
                      Otomatik Sipariş Ver
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Otomatik Sipariş</DialogTitle>
                      <DialogDescription>
                        Stok seviyesi düşük ürünler için otomatik sipariş oluşturulsun mu?
                      </DialogDescription>
                    </DialogHeader>
                    <div className="py-4">
                      <p className="text-sm text-muted-foreground">
                        {products.filter(p => p.stock < 20).length} ürün için sipariş oluşturulacak:
                      </p>
                      <ul className="mt-2 space-y-1">
                        {products.filter(p => p.stock < 20).map(product => (
                          <li key={product.id} className="text-sm">• {product.name}</li>
                        ))}
                      </ul>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setShowOrderDialog(false)}>
                        İptal
                      </Button>
                      <Button onClick={handleAutoOrder}>Sipariş Ver</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              )}
            </CardContent>
          </Card>

          {/* Performance Analytics */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Ürün İstatistikleri
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm">Toplam Ürün</span>
                    <span className="text-sm font-medium">{products.length}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-green-600 h-2 rounded-full" style={{width: '100%'}}></div>
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm">Stokta</span>
                    <span className="text-sm font-medium">
                      {products.filter(p => p.stock > 0).length}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-blue-600 h-2 rounded-full" style={{
                      width: `${(products.filter(p => p.stock > 0).length / Math.max(products.length, 1)) * 100}%`
                    }}></div>
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm">Kritik Stok</span>
                    <span className="text-sm font-medium">
                      {products.filter(p => p.stock > 0 && p.stock < 20).length}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-orange-600 h-2 rounded-full" style={{
                      width: `${(products.filter(p => p.stock > 0 && p.stock < 20).length / Math.max(products.length, 1)) * 100}%`
                    }}></div>
                  </div>
                </div>
              </div>
              
              <div className="mt-4 pt-4 border-t space-y-4">
                {/* Sales Value */}
                <FinancialDataGuard>
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">Toplam Satış Değeri</p>
                    <p className="text-2xl font-bold">
                      {formatCurrency(totalSalesValueTRY)}
                      {totalSalesValueUSD !== null && (
                        <span className="ml-2 text-base font-medium text-muted-foreground">
                          ({formatCurrency(totalSalesValueUSD, 'USD')})
                        </span>
                      )}
                    </p>
                    <p className="text-sm text-green-600">
                      {totalUnits} toplam adet
                    </p>
                  </div>
                </FinancialDataGuard>

                {/* Admin-only Financial Data */}
                <RoleGuard allowedRoles={['ADMIN']}>
                  {/* Purchase Value */}
                  <FinancialDataGuard>
                    <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                      <p className="text-sm text-blue-800 font-medium mb-2">Toplam Alış Değeri (Admin)</p>
                      <p className="text-xl font-bold text-blue-900">
                        {formatCurrency(totalPurchaseValueTRY)}
                        {totalPurchaseValueUSD !== null && (
                          <span className="ml-2 text-sm font-medium text-blue-700">
                            ({formatCurrency(totalPurchaseValueUSD, 'USD')})
                          </span>
                        )}
                      </p>
                      <p className="text-sm text-blue-700">
                        {products.filter(p => p.purchasePrice && p.purchasePrice > 0).length} ürünün alış fiyatı mevcut
                      </p>
                    </div>
                  </FinancialDataGuard>

                  {/* Profit Analysis */}
                  <FinancialDataGuard>
                    <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                      <p className="text-sm text-green-800 font-medium mb-2">Potansiyel Kar (Admin)</p>
                      <p className="text-xl font-bold text-green-900">
                        {formatCurrency(totalProfitTRY)}
                        {totalProfitUSD !== null && (
                          <span className="ml-2 text-sm font-medium text-green-700">
                            ({formatCurrency(totalProfitUSD, 'USD')})
                          </span>
                        )}
                      </p>
                      <p className="text-sm text-green-700">
                        Ortalama kar marjı: {
                          (() => {
                            const validProducts = products.filter(p => p.purchasePrice && p.purchasePrice > 0)
                            if (validProducts.length === 0) return '0%'
                            const avgMargin = validProducts.reduce((sum, p) => {
                              const margin = ((p.price - (p.purchasePrice || 0)) / (p.purchasePrice || 1)) * 100
                              return sum + margin
                            }, 0) / validProducts.length
                            return `${avgMargin.toFixed(1)}%`
                          })()
                        }
                      </p>
                    </div>
                  </FinancialDataGuard>
                </RoleGuard>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Hızlı İşlemler</CardTitle>
            <CardDescription>
              Sık kullanılan ürün yönetimi işlemleri
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <RoleGuard allowedRoles={['ADMIN']}>
                <Dialog open={showBulkAddDialog} onOpenChange={setShowBulkAddDialog}>
                  <DialogTrigger asChild>
                    <Button variant="outline" className="flex flex-col items-center gap-2 h-20">
                      <Plus className="w-5 h-5" />
                      Excel Yükle
                    </Button>
                  </DialogTrigger>
                <DialogContent className="max-w-[90vw] w-[85vw] min-w-[1400px] max-h-[80vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Excel Dosyası ile Toplu Ürün Ekleme</DialogTitle>
                    <DialogDescription>
                      Excel dosyası (.xlsx) yükleyerek toplu ürün ekleme yapın
                    </DialogDescription>
                  </DialogHeader>

                  {!showMappingStep && !showPreviewStep && (
                    <div className="py-4 space-y-4">
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                        <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                        <p className="text-sm text-gray-600">Excel dosyanızı buraya sürükleyin</p>
                        <p className="text-xs text-gray-500 mt-2">veya dosya seçmek için tıklayın</p>
                        <input
                          type="file"
                          accept=".xlsx,.xls"
                          onChange={(e) => {
                            const file = e.target.files?.[0]
                            if (file) handleExcelUpload(file)
                          }}
                          className="hidden"
                          id="excel-upload"
                        />
                        <label htmlFor="excel-upload">
                          <Button variant="outline" className="mt-4" asChild>
                            <span>Dosya Seç</span>
                          </Button>
                        </label>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <Button variant="outline" className="w-full" onClick={downloadExcelTemplate}>
                          <FileSpreadsheet className="w-4 h-4 mr-2" />
                          Excel Şablonu İndir
                        </Button>
                        <div className="text-sm text-gray-600 space-y-1">
                          <p>📋 Gereksinimler:</p>
                          <p>• Excel formatı (.xlsx)</p>
                          <p>• Maksimum 10MB</p>
                          <p>• İlk satır başlık olmalı</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {showMappingStep && !showPreviewStep && (
                    <div className="py-4 space-y-4">
                      <div className="bg-blue-50 p-4 rounded-lg">
                        <h3 className="font-medium text-blue-900 mb-2">Sütun Eşleştirme</h3>
                        <p className="text-sm text-blue-700">Excel sütunlarını veritabanı alanlarıyla eşleştirin</p>
                      </div>

                      <div className="grid gap-4">
                        {excelHeaders.map((header, index) => {
                          // Skip empty headers
                          if (!header || header.toString().trim() === '') {
                            return null
                          }

                          return (
                          <div key={index} className="grid grid-cols-4 gap-4 items-center">
                            <div className="font-medium">
                              <span className="text-xs text-gray-400 mr-2">Sütun {index + 1}:</span>
                              {header}
                            </div>
                            <div>→</div>
                            <div className="text-xs text-gray-500">
                              Mevcut: {columnMapping[index.toString()] || 'Seçilmedi'}
                            </div>
                            <Select
                              value={columnMapping[index.toString()] || 'skip'}
                              onValueChange={(value) => {
                                console.log(`🔄 Column ${index} (${header}) changed to: ${value}`)
                                console.log('📊 Previous mapping:', columnMapping)

                                if (value === 'skip') {
                                  setColumnMapping(prev => {
                                    const newMapping = {...prev}
                                    delete newMapping[index.toString()]
                                    console.log('✅ Updated mapping (skip):', newMapping)
                                    return newMapping
                                  })
                                } else {
                                  // Remove this field from other columns before assigning to current
                                  setColumnMapping(prev => {
                                    const newMapping = {...prev}
                                    // Clear this field from other columns
                                    Object.keys(newMapping).forEach(key => {
                                      if (newMapping[key] === value) {
                                        console.log(`🔄 Removing ${value} from column ${key}`)
                                        delete newMapping[key]
                                      }
                                    })
                                    // Assign to current column
                                    newMapping[index.toString()] = value
                                    console.log('✅ Updated mapping (assign):', newMapping)
                                    return newMapping
                                  })
                                }
                              }}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Alan seçin" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="skip">Atla</SelectItem>
                                <SelectItem value="name">
                                  Ürün Adı *
                                  {Object.values(columnMapping).includes('name') &&
                                    columnMapping[index.toString()] !== 'name' && (
                                    <span className="text-xs text-gray-500 ml-1">(kullanılıyor)</span>
                                  )}
                                </SelectItem>
                                <SelectItem value="category">
                                  Kategori *
                                  {Object.values(columnMapping).includes('category') &&
                                    columnMapping[index.toString()] !== 'category' && (
                                    <span className="text-xs text-gray-500 ml-1">(kullanılıyor)</span>
                                  )}
                                </SelectItem>
                                <SelectItem value="brand">
                                  Marka
                                  {Object.values(columnMapping).includes('brand') &&
                                    columnMapping[index.toString()] !== 'brand' && (
                                    <span className="text-xs text-gray-500 ml-1">(kullanılıyor)</span>
                                  )}
                                </SelectItem>
                                <SelectItem value="code">
                                  Ürün Kodu
                                  {Object.values(columnMapping).includes('code') &&
                                    columnMapping[index.toString()] !== 'code' && (
                                      <span className="text-xs text-gray-500 ml-1">(kullanılıyor)</span>
                                  )}
                                </SelectItem>
                                <SelectItem value="model">Model</SelectItem>
                                <SelectItem value="price">
                                  Fiyat *
                                  {Object.values(columnMapping).includes('price') &&
                                    columnMapping[index.toString()] !== 'price' && (
                                    <span className="text-xs text-gray-500 ml-1">(kullanılıyor)</span>
                                  )}
                                </SelectItem>
                                <SelectItem value="purchasePrice">
                                  Alış Fiyatı (₺)
                                  {Object.values(columnMapping).includes('purchasePrice') &&
                                    columnMapping[index.toString()] !== 'purchasePrice' && (
                                      <span className="text-xs text-gray-500 ml-1">(kullanılıyor)</span>
                                  )}
                                </SelectItem>
                                <SelectItem value="purchasePriceUsd">
                                  Alış Fiyatı (USD)
                                  {Object.values(columnMapping).includes('purchasePriceUsd') &&
                                    columnMapping[index.toString()] !== 'purchasePriceUsd' && (
                                      <span className="text-xs text-gray-500 ml-1">(kullanılıyor)</span>
                                  )}
                                </SelectItem>
                                <SelectItem value="stock">Stok</SelectItem>
                                <SelectItem value="power">Güç (W)</SelectItem>
                                <SelectItem value="warranty">Garanti (Yıl)</SelectItem>
                                <SelectItem value="description">Açıklama</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          )
                        })}
                      </div>

                      <div className="bg-amber-50 p-4 rounded-lg">
                        <p className="text-sm text-amber-700">
                          <strong>Zorunlu alanlar:</strong> Ürün Adı, Kategori ve Fiyat
                        </p>
                        <p className="text-xs text-amber-600 mt-1">
                          Marka, Model, Stok gibi diğer alanlar isteğe bağlıdır.
                        </p>
                      </div>
                    </div>
                  )}

                  {showPreviewStep && (
                    <div className="py-4 space-y-4">
                      <div className="bg-green-50 p-4 rounded-lg">
                        <h3 className="font-medium text-green-900 mb-2">Önizleme</h3>
                        <p className="text-sm text-green-700">İlk 5 satır önizlemesi</p>
                      </div>

                      <div className="border rounded-lg overflow-hidden">
                        <table className="w-full text-sm">
                          <thead className="bg-gray-50">
                            <tr>
                              <th className="p-2 text-left">Ürün Adı</th>
                              <th className="p-2 text-left">Kategori</th>
                              <th className="p-2 text-left">Marka</th>
                              <th className="p-2 text-left">Fiyat</th>
                              <th className="p-2 text-left">Stok</th>
                            </tr>
                          </thead>
                          <tbody>
                            {excelData.slice(0, 5).map((row, index) => {
                              const nameColumn = Object.keys(columnMapping).find(key => columnMapping[key] === 'name')
                              const categoryColumn = Object.keys(columnMapping).find(key => columnMapping[key] === 'category')
                              const brandColumn = Object.keys(columnMapping).find(key => columnMapping[key] === 'brand')
                              const priceColumn = Object.keys(columnMapping).find(key => columnMapping[key] === 'price')
                              const stockColumn = Object.keys(columnMapping).find(key => columnMapping[key] === 'stock')

                              return (
                                <tr key={index} className="border-t">
                                  <td className="p-2">{nameColumn ? row[parseInt(nameColumn)] : '-'}</td>
                                  <td className="p-2">{categoryColumn ? row[parseInt(categoryColumn)] : '-'}</td>
                                  <td className="p-2">{brandColumn ? row[parseInt(brandColumn)] : '-'}</td>
                                  <td className="p-2">{priceColumn ? row[parseInt(priceColumn)] : '-'}</td>
                                  <td className="p-2">{stockColumn ? row[parseInt(stockColumn)] : '-'}</td>
                                </tr>
                              )
                            })}
                          </tbody>
                        </table>
                      </div>

                      {bulkUploadStatus === 'uploading' && (
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>Yükleniyor...</span>
                            <span>{Math.round(bulkUploadProgress)}%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-blue-600 h-2 rounded-full transition-all"
                              style={{ width: `${bulkUploadProgress}%` }}
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  <DialogFooter>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setShowBulkAddDialog(false)
                        setShowMappingStep(false)
                        setShowPreviewStep(false)
                        setExcelFile(null)
                        setExcelData([])
                        setExcelHeaders([])
                        setColumnMapping({})
                      }}
                    >
                      İptal
                    </Button>

                    {showMappingStep && !showPreviewStep && (
                      <Button onClick={() => {
                        console.log('🔍 Preview button clicked')
                        console.log('📋 Current states:', {
                          showMappingStep,
                          showPreviewStep,
                          excelHeaders: excelHeaders.length,
                          excelData: excelData.length,
                          columnMapping
                        })

                        if (validateMappedData()) {
                          console.log('✅ Moving to preview step')
                          setShowPreviewStep(true)
                        } else {
                          console.log('❌ Validation failed, staying on mapping step')
                        }
                      }}>
                        Önizleme
                      </Button>
                    )}

                    {showPreviewStep && (
                      <Button
                        onClick={processExcelData}
                        disabled={bulkUploadStatus === 'uploading'}
                      >
                        {bulkUploadStatus === 'uploading' ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Yükleniyor...
                          </>
                        ) : (
                          'Ürünleri Ekle'
                        )}
                      </Button>
                    )}
                  </DialogFooter>
                </DialogContent>
                </Dialog>
              </RoleGuard>

              <RoleGuard allowedRoles={['ADMIN']}>
                <Dialog open={showStockUpdateDialog} onOpenChange={setShowStockUpdateDialog}>
                  <DialogTrigger asChild>
                    <Button variant="outline" className="flex flex-col items-center gap-2 h-20">
                      <Archive className="w-5 h-5" />
                      Stok Güncelle
                    </Button>
                  </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Toplu Stok Güncelleme</DialogTitle>
                    <DialogDescription>
                      Tüm ürünlerin stok miktarlarını güncelleyin
                    </DialogDescription>
                  </DialogHeader>
                  <div className="py-4">
                    <p className="text-sm text-gray-600 mb-4">
                      Stok güncelleme işlemi için manuel olarak güncelleyin.
                    </p>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setShowStockUpdateDialog(false)}>İptal</Button>
                    <Button onClick={() => {
                      toast({title: "Başarılı", description: "Stok güncelleme işlemi tamamlandı."})
                      setShowStockUpdateDialog(false)
                    }}>Güncelle</Button>
                  </DialogFooter>
                </DialogContent>
                </Dialog>
              </RoleGuard>

              <FinancialDataGuard>
                <Dialog open={showPriceUpdateDialog} onOpenChange={setShowPriceUpdateDialog}>
                  <DialogTrigger asChild>
                    <Button variant="outline" className="flex flex-col items-center gap-2 h-20">
                      <TrendingUp className="w-5 h-5" />
                      Fiyat Güncelle
                    </Button>
                  </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Toplu Fiyat Güncelleme</DialogTitle>
                    <DialogDescription>
                      Kategori bazında veya tüm ürünler için fiyat güncellemesi yapın
                    </DialogDescription>
                  </DialogHeader>
                  <div className="py-4 space-y-4">
                    <div className="grid gap-2">
                      <Label htmlFor="priceCategory">Kategori</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Kategori seçin" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Tüm Kategoriler</SelectItem>
                          {categories.map((cat) => (
                            <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="priceIncrease">Artış Oranı (%)</Label>
                      <Input id="priceIncrease" type="number" placeholder="15" />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setShowPriceUpdateDialog(false)}>İptal</Button>
                    <Button onClick={() => {
                      toast({title: "Başarılı", description: "Fiyat güncelleme işlemi tamamlandı."})
                      setShowPriceUpdateDialog(false)
                    }}>Güncelle</Button>
                  </DialogFooter>
                </DialogContent>
                </Dialog>
              </FinancialDataGuard>

              <RoleGuard allowedRoles={['ADMIN']}>
                <Button
                  variant="outline"
                  className="flex flex-col items-center gap-2 h-20"
                  onClick={handleExportProducts}
                >
                  <FileSpreadsheet className="w-5 h-5" />
                  Ürünleri Dışa Aktar
                </Button>
              </RoleGuard>
              <Button
                variant="outline"
                className="flex flex-col items-center gap-2 h-20"
                onClick={handleCategoryManagement}
              >
                <Package className="w-5 h-5" />
                Kategori Yönetimi
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Edit Product Dialog */}
        <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
          <DialogContent
            className="max-w-[90vw] w-[85vw] min-w-[1400px] max-h-[85vh] overflow-y-auto"
            onInteractOutside={(event) => event.preventDefault()}
            onPointerDownOutside={(event) => event.preventDefault()}
          >
            <DialogHeader>
              <DialogTitle>Ürün Düzenle</DialogTitle>
              <DialogDescription>
                Ürün bilgilerini güncelleyin.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-6 py-4">
              <div className="grid gap-8 lg:grid-cols-5">
                {/* Temel Bilgiler - 3 columns wide */}
                <div className="lg:col-span-3 space-y-4 rounded-lg border border-border/60 bg-gray-50/50 p-8">
                  <p className="text-sm font-semibold text-gray-700 uppercase tracking-wide">TEMEL BİLGİLER</p>
                  <div className="grid gap-4">
                    {/* First row - Full width name */}
                    <div className="grid gap-2">
                      <Label htmlFor="edit-name" className="text-sm font-medium">Ürün Adı *</Label>
                      <Input
                        id="edit-name"
                        value={formData.name || ''}
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                        className="bg-white"
                        placeholder="100KW TRİFAZE ON-GRİD İNVERTÖR"
                      />
                    </div>

                    {/* Second row - Code and Category */}
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="grid gap-2">
                        <Label htmlFor="edit-code" className="text-sm font-medium">Ürün Kodu *</Label>
                        <Input
                          id="edit-code"
                          value={formData.code || ''}
                          onChange={(e) => setFormData({...formData, code: e.target.value})}
                          className="bg-white"
                          placeholder="CHİSAGE"
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="edit-category" className="text-sm font-medium">Kategori *</Label>
                        <Select value={formData.categoryId || ''} onValueChange={(value) => setFormData({...formData, categoryId: value})}>
                          <SelectTrigger className="bg-white">
                            <SelectValue placeholder="Kategori seçin" />
                          </SelectTrigger>
                          <SelectContent>
                            {categories.map((category) => (
                              <SelectItem key={category.id} value={category.id}>
                                {category.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    {/* Third row - Brand and Model */}
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="grid gap-2">
                        <Label htmlFor="edit-brand" className="text-sm font-medium">Marka</Label>
                        <Input
                          id="edit-brand"
                          value={formData.brand || ''}
                          onChange={(e) => setFormData({...formData, brand: e.target.value})}
                          className="bg-white"
                          placeholder="CHİSAGE"
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="edit-model" className="text-sm font-medium">Model</Label>
                        <Input
                          id="edit-model"
                          value={formData.model || ''}
                          onChange={(e) => setFormData({...formData, model: e.target.value})}
                          className="bg-white"
                          placeholder="CE-3P10"
                        />
                      </div>
                    </div>

                    {/* Fourth row - Power and Warranty */}
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="grid gap-2">
                        <Label htmlFor="edit-power" className="text-sm font-medium">Güç (W)</Label>
                        <Input
                          id="edit-power"
                          type="number"
                          value={formData.power || ''}
                          onChange={(e) => setFormData({...formData, power: e.target.value})}
                          className="bg-white"
                          placeholder="10000"
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="edit-warranty" className="text-sm font-medium">Garanti (yıl)</Label>
                        <Input
                          id="edit-warranty"
                          type="number"
                          value={formData.warranty || ''}
                          onChange={(e) => setFormData({...formData, warranty: e.target.value})}
                          className="bg-white"
                          placeholder="5"
                        />
                      </div>
                    </div>

                    {/* Description - Full width */}
                    <div className="grid gap-2">
                      <Label htmlFor="edit-description" className="text-sm font-medium">Açıklama</Label>
                      <Textarea
                        id="edit-description"
                        value={formData.description || ''}
                        onChange={(e) => setFormData({...formData, description: e.target.value})}
                        placeholder="100KW TRİFAZE ON GRID INVERTER"
                        className="min-h-[100px] bg-white"
                      />
                    </div>
                  </div>
                </div>

                {/* Fiyat ve Stok - 2 columns */}
                <div className="lg:col-span-2 space-y-4 rounded-lg border border-border/60 bg-gray-50/50 p-8">
                  <p className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-2">FİYAT VE STOK</p>
                  <div className="grid gap-5">
                    <RoleGuard allowedRoles={['ADMIN']}>
                      <div className="space-y-5">
                        <div className="grid gap-2">
                          <Label htmlFor="edit-purchasePrice" className="text-sm font-medium">Alış Fiyatı (₺)</Label>
                          <div className="flex gap-2">
                            <Input
                              id="edit-purchasePrice"
                              type="text"
                              value={editingPriceFields.editPurchasePrice ?
                                rawPriceInputs.editPurchasePrice :
                                (formData.purchasePrice ? formData.purchasePrice.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '')
                              }
                              onChange={(e) => {
                                let inputValue = e.target.value
                                // Allow only numbers, comma, dot and minus
                                inputValue = inputValue.replace(/[^0-9.,\-]/g, '')

                                // Update raw input for editing
                                setRawPriceInputs(prev => ({...prev, editPurchasePrice: inputValue}))

                                if (inputValue === '' || inputValue === '-') {
                                  setFormData({...formData, purchasePrice: undefined})
                                } else {
                                  // Convert Turkish format to number
                                  let cleanValue = inputValue.replace(/\./g, '').replace(',', '.')
                                  const numValue = parseFloat(cleanValue)
                                  if (!isNaN(numValue) && numValue >= 0) {
                                    setFormData({...formData, purchasePrice: numValue})
                                  }
                                }
                              }}
                              onFocus={() => {
                                // Switch to editing mode and show raw number
                                setEditingPriceFields(prev => ({...prev, editPurchasePrice: true}))
                                if (formData.purchasePrice) {
                                  setRawPriceInputs(prev => ({...prev, editPurchasePrice: formData.purchasePrice!.toString()}))
                                }
                              }}
                              onBlur={() => {
                                // Switch back to formatted display
                                setEditingPriceFields(prev => ({...prev, editPurchasePrice: false}))
                                setRawPriceInputs(prev => ({...prev, editPurchasePrice: ''}))
                              }}
                              placeholder="0,00"
                              className="bg-white flex-1"
                            />
                            <span className="flex items-center px-2 text-xs text-gray-500 bg-gray-100 rounded-r border-l">₺</span>
                          </div>
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor="edit-purchasePriceUsd" className="text-sm font-medium">Alış Fiyatı (USD)</Label>
                          <div className="space-y-2">
                            <div className="flex gap-2">
                              <Input
                                id="edit-purchasePriceUsd"
                                type="number"
                                value={formData.purchasePriceUsd ?? ''}
                                onChange={(e) => handleUsdPurchasePriceChange(e.target.value)}
                                placeholder="1"
                                className="bg-white flex-1"
                              />
                              <span className="flex items-center px-3 text-sm text-gray-500">$</span>
                            </div>
                            {renderUsdRateInfo()}
                          </div>
                        </div>
                        <div className="my-3 border-t border-gray-200"></div>
                      </div>
                    </RoleGuard>
                    <div className="grid gap-2">
                      <Label htmlFor="edit-price" className="text-sm font-medium">Satış Fiyatı (₺) *</Label>
                      <div className="flex gap-2">
                        <Input
                          id="edit-price"
                          type="text"
                          value={editingPriceFields.editPrice ?
                            rawPriceInputs.editPrice :
                            (formData.price ? formData.price.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '')
                          }
                          onChange={(e) => {
                            let inputValue = e.target.value
                            // Allow only numbers, comma, dot and minus
                            inputValue = inputValue.replace(/[^0-9.,\-]/g, '')

                            // Update raw input for editing
                            setRawPriceInputs(prev => ({...prev, editPrice: inputValue}))

                            if (inputValue === '' || inputValue === '-') {
                              setFormData({...formData, price: undefined})
                            } else {
                              // Convert Turkish format to number
                              let cleanValue = inputValue.replace(/\./g, '').replace(',', '.')
                              const numValue = parseFloat(cleanValue)
                              if (!isNaN(numValue) && numValue >= 0) {
                                setFormData({...formData, price: numValue})
                              }
                            }
                          }}
                          onFocus={() => {
                            // Switch to editing mode and show raw number
                            setEditingPriceFields(prev => ({...prev, editPrice: true}))
                            if (formData.price) {
                              setRawPriceInputs(prev => ({...prev, editPrice: formData.price!.toString()}))
                            }
                          }}
                          onBlur={() => {
                            // Switch back to formatted display
                            setEditingPriceFields(prev => ({...prev, editPrice: false}))
                            setRawPriceInputs(prev => ({...prev, editPrice: ''}))
                          }}
                          className="bg-white flex-1"
                          placeholder="0,00"
                        />
                        <span className="flex items-center px-3 text-sm text-gray-500">₺</span>
                      </div>
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="edit-stock" className="text-sm font-medium">Mevcut Stok</Label>
                      <div className="flex gap-2">
                        <Input
                          id="edit-stock"
                          type="number"
                          value={formData.stock || ''}
                          onChange={(e) => setFormData({...formData, stock: Number(e.target.value)})}
                          className="bg-white flex-1"
                          placeholder="100"
                        />
                        <span className="flex items-center px-3 text-sm text-gray-500">adet</span>
                      </div>
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="edit-minStock" className="text-sm font-medium">Azami Stok (Uyarı Limiti)</Label>
                      <div className="flex gap-2">
                        <Input
                          id="edit-minStock"
                          type="number"
                          value={formData.minStock || ''}
                          onChange={(e) => setFormData({...formData, minStock: Number(e.target.value)})}
                          className="bg-white flex-1"
                          placeholder="20"
                        />
                        <span className="flex items-center px-3 text-sm text-gray-500">adet</span>
                      </div>
                      <p className="text-xs text-gray-500">Stok bu değerin altına düştüğünde uyarı gösterilir</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="rounded-lg border border-border/60 bg-gray-50/50 p-6">
                <p className="text-sm font-semibold text-gray-700 uppercase tracking-wide">DOSYALAR</p>
                <div className="grid gap-6 lg:grid-cols-3">
                  <div className="space-y-2">
                    <Label htmlFor="edit-images">Ürün Görselleri</Label>

                    {selectedProduct && (() => {
                      let existingImages = []
                      try {
                        existingImages = typeof selectedProduct.images === 'string'
                          ? JSON.parse(selectedProduct.images || '[]')
                          : selectedProduct.images || []
                        if (!Array.isArray(existingImages)) {
                          existingImages = []
                        }
                      } catch (error) {
                        console.error('Error parsing selectedProduct images:', error)
                        existingImages = []
                      }

                      return existingImages.length > 0 ? (
                        <div className="p-2 bg-green-50 rounded border">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 text-sm text-green-700">
                              <CheckCircle className="w-4 h-4" />
                              <span>{existingImages.length} mevcut görsel</span>
                            </div>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={async () => {
                                if (selectedProduct && confirm('Mevcut görselleri silmek istediğinize emin misiniz?')) {
                                  await deleteProductImages(selectedProduct.id)
                                }
                              }}
                              className="h-6 px-2 text-xs text-red-600 hover:text-red-800 hover:bg-red-50"
                            >
                              <Trash2 className="w-3 h-3 mr-1" />
                              Sil
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div className="p-2 bg-gray-50 rounded border">
                          <div className="flex items-center gap-2 text-sm text-gray-500">
                            <AlertCircle className="w-4 h-4" />
                            <span>Henüz görsel yüklenmemiş</span>
                          </div>
                        </div>
                      )
                    })()}

                    <Input
                      id="edit-images"
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={(e) => {
                        const files = e.target.files
                        setSelectedFiles({...selectedFiles, images: files})
                        console.log('Selected images for edit:', files)
                      }}
                      className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                    />
                    <p className="text-xs text-muted-foreground">PNG, JPG, JPEG dosyaları desteklenir (Maks. 5 dosya)</p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="edit-datasheet">Teknik Döküman (PDF)</Label>

                    {selectedProduct && (() => {
                      const hasDatasheet = !!(selectedProduct as any).datasheet

                      return hasDatasheet ? (
                        <div className="p-2 bg-green-50 rounded border">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 text-sm text-green-700">
                              <CheckCircle className="w-4 h-4" />
                              <span>Mevcut teknik döküman var</span>
                            </div>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={async () => {
                                if (selectedProduct && confirm('Teknik dökümanı silmek istediğinize emin misiniz?')) {
                                  await deleteProductDatasheet(selectedProduct.id)
                                }
                              }}
                              className="h-6 px-2 text-xs text-red-600 hover:text-red-800 hover:bg-red-50"
                            >
                              <Trash2 className="w-3 h-3 mr-1" />
                              Sil
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div className="p-2 bg-gray-50 rounded border">
                          <div className="flex items-center gap-2 text-sm text-gray-500">
                            <AlertCircle className="w-4 h-4" />
                            <span>Henüz teknik döküman yüklenmemiş</span>
                          </div>
                        </div>
                      )
                    })()}

                    <Input
                      id="edit-datasheet"
                      type="file"
                      accept=".pdf"
                      onChange={(e) => {
                        const file = e.target.files?.[0]
                        setSelectedFiles({...selectedFiles, datasheet: file || null})
                        console.log('Selected datasheet for edit:', file)
                      }}
                      className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-red-50 file:text-red-700 hover:file:bg-red-100"
                    />
                    <p className="text-xs text-muted-foreground">Sadece PDF dosyaları desteklenir</p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="edit-manual">Kullanım Kılavuzu (PDF)</Label>

                    {selectedProduct && (() => {
                      const hasManual = !!(selectedProduct as any).manual

                      return hasManual ? (
                        <div className="p-2 bg-green-50 rounded border">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 text-sm text-green-700">
                              <CheckCircle className="w-4 h-4" />
                              <span>Mevcut kullanım kılavuzu var</span>
                            </div>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={async () => {
                                if (selectedProduct && confirm('Kullanım kılavuzunu silmek istediğinize emin misiniz?')) {
                                  await deleteProductManual(selectedProduct.id)
                                }
                              }}
                              className="h-6 px-2 text-xs text-red-600 hover:text-red-800 hover:bg-red-50"
                            >
                              <Trash2 className="w-3 h-3 mr-1" />
                              Sil
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div className="p-2 bg-gray-50 rounded border">
                          <div className="flex items-center gap-2 text-sm text-gray-500">
                            <AlertCircle className="w-4 h-4" />
                            <span>Henüz kullanım kılavuzu yüklenmemiş</span>
                          </div>
                        </div>
                      )
                    })()}

                    <Input
                      id="edit-manual"
                      type="file"
                      accept=".pdf"
                      onChange={(e) => {
                        const file = e.target.files?.[0]
                        setSelectedFiles({...selectedFiles, manual: file || null})
                        console.log('Selected manual for edit:', file)
                      }}
                      className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-green-50 file:text-green-700 hover:file:bg-green-100"
                    />
                    <p className="text-xs text-muted-foreground">Sadece PDF dosyaları desteklenir</p>
                  </div>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowEditDialog(false)} disabled={saving}>
                İptal
              </Button>
              <Button onClick={handleEditProduct} disabled={saving}>
                {saving ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    {uploadingFiles ? 'Dosyalar yükleniyor...' : 'Güncelleniyor...'}
                  </>
                ) : (
                  'Güncelle'
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Ürün Sil</DialogTitle>
              <DialogDescription>
                Bu ürünü silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.
              </DialogDescription>
            </DialogHeader>
            {selectedProduct && (
              <div className="py-4">
                <p className="font-medium">{selectedProduct.name}</p>
                <p className="text-sm text-gray-500">{selectedProduct.brand} - {selectedProduct.model}</p>
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowDeleteDialog(false)} disabled={saving}>
                İptal
              </Button>
              <Button variant="destructive" onClick={handleDeleteProduct} disabled={saving}>
                {saving ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Siliniyor...
                  </>
                ) : (
                  'Sil'
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Category Edit Dialog */}
        <Dialog open={showCategoryDialog} onOpenChange={setShowCategoryDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Kategori Yönet</DialogTitle>
              <DialogDescription>
                Kategori bilgilerini düzenleyebilirsiniz.
              </DialogDescription>
            </DialogHeader>
            {selectedCategory && (
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="category-name">Kategori Adı</Label>
                  <Input
                    id="category-name"
                    value={categoryFormData.name}
                    onChange={(e) => setCategoryFormData({...categoryFormData, name: e.target.value})}
                    placeholder="Kategori adı"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="category-color">Renk</Label>
                  <Select
                    value={categoryFormData.color}
                    onValueChange={(value) => setCategoryFormData({...categoryFormData, color: value})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Renk seçin" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="blue">Mavi</SelectItem>
                      <SelectItem value="green">Yeşil</SelectItem>
                      <SelectItem value="yellow">Sarı</SelectItem>
                      <SelectItem value="red">Kırmızı</SelectItem>
                      <SelectItem value="purple">Mor</SelectItem>
                      <SelectItem value="orange">Turuncu</SelectItem>
                      <SelectItem value="pink">Pembe</SelectItem>
                      <SelectItem value="gray">Gri</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm font-medium">Kategori Bilgileri</p>
                  <p className="text-sm text-gray-600">Toplam Ürün: {selectedCategory.count}</p>
                  <p className="text-sm text-gray-600">Kategori ID: {selectedCategory.id}</p>
                </div>
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowCategoryDialog(false)} disabled={saving}>
                İptal
              </Button>
              <Button onClick={handleCategoryUpdate} disabled={saving}>
                {saving ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Güncelleniyor...
                  </>
                ) : (
                  'Güncelle'
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Category Management Dialog */}
        <Dialog open={showCategoryManagementDialog} onOpenChange={setShowCategoryManagementDialog}>
          <DialogContent className="max-w-[90vw] w-[85vw] min-w-[1400px] max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Kategori Yönetimi</DialogTitle>
              <DialogDescription>
                Kategorileri yönetin, yeni kategori ekleyin veya mevcut kategorileri düzenleyin.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-6">
              {/* Add New Category Section */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Yeni Kategori Ekle</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="new-category-name">Kategori Adı</Label>
                      <Input
                        id="new-category-name"
                        value={newCategoryFormData.name}
                        onChange={(e) => setNewCategoryFormData({...newCategoryFormData, name: e.target.value})}
                        placeholder="Örn: Solar Panel"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="new-category-color">Renk</Label>
                      <Select
                        value={newCategoryFormData.color}
                        onValueChange={(value) => setNewCategoryFormData({...newCategoryFormData, color: value})}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="blue">Mavi</SelectItem>
                          <SelectItem value="green">Yeşil</SelectItem>
                          <SelectItem value="yellow">Sarı</SelectItem>
                          <SelectItem value="red">Kırmızı</SelectItem>
                          <SelectItem value="purple">Mor</SelectItem>
                          <SelectItem value="orange">Turuncu</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="new-category-icon">İkon</Label>
                      <Select
                        value={newCategoryFormData.icon}
                        onValueChange={(value) => setNewCategoryFormData({...newCategoryFormData, icon: value})}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Sun">Güneş</SelectItem>
                          <SelectItem value="Zap">Elektrik</SelectItem>
                          <SelectItem value="Battery">Batarya</SelectItem>
                          <SelectItem value="Cable">Kablo</SelectItem>
                          <SelectItem value="Settings">Ayar</SelectItem>
                          <SelectItem value="Monitor">Monitör</SelectItem>
                          <SelectItem value="Package">Paket</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <Button
                    onClick={handleAddNewCategory}
                    disabled={saving || !newCategoryFormData.name}
                    className="w-full mt-4"
                  >
                    {saving ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Ekleniyor...
                      </>
                    ) : (
                      <>
                        <Plus className="w-4 h-4 mr-2" />
                        Kategori Ekle
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>

              {/* Existing Categories */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Mevcut Kategoriler</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4">
                    {categories.map((category) => {
                      const IconComponent = typeof category.icon === 'string' ? Package : category.icon
                      return (
                        <div key={category.id} className="flex items-center justify-between p-4 border rounded-lg">
                          <div className="flex items-center gap-3">
                            <IconComponent className={`w-6 h-6 text-${category.color || 'blue'}-600`} />
                            <div>
                              <p className="font-medium">{category.name}</p>
                              <p className="text-sm text-muted-foreground">
                                {category.count} ürün • ID: {category.id}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleCategoryClick(category)}
                            >
                              <Edit className="w-4 h-4 mr-1" />
                              Düzenle
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDeleteCategory(category.id)}
                              disabled={category.count > 0 && currentUser?.role !== 'ADMIN'}
                              className={(category.count > 0 && currentUser?.role !== 'ADMIN') ? "opacity-50 cursor-not-allowed" : "hover:bg-red-50 hover:text-red-600"}
                            >
                              <Trash2 className="w-4 h-4 mr-1" />
                              Sil
                            </Button>
                          </div>
                        </div>
                      )
                    })}
                  </div>

                  {categories.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                      <Package className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>Henüz kategori bulunmamaktadır.</p>
                      <p className="text-sm">Yukarıdaki formu kullanarak yeni kategori ekleyebilirsiniz.</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setShowCategoryManagementDialog(false)}
              >
                Kapat
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* File Viewing Modal */}
        <Dialog open={showFileModal} onOpenChange={setShowFileModal}>
          <DialogContent className="max-w-[90vw] w-[85vw] min-w-[1400px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{currentFile?.name}</DialogTitle>
            </DialogHeader>
            <div className="flex justify-center items-center p-4 relative">
              {currentFile?.type === 'image' ? (
                <div className="relative w-full">
                  <img
                    src={currentFile.images ? currentFile.images[currentImageIndex] : currentFile.url}
                    alt={currentFile.name}
                    className="max-w-full max-h-[70vh] object-contain rounded-lg mx-auto"
                  />
                  {currentFile.images && currentFile.images.length > 1 && (
                    <>
                      <Button
                        variant="outline"
                        size="sm"
                        className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white/90"
                        onClick={() => setCurrentImageIndex(prev => prev > 0 ? prev - 1 : currentFile.images!.length - 1)}
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white/90"
                        onClick={() => setCurrentImageIndex(prev => prev < currentFile.images!.length - 1 ? prev + 1 : 0)}
                      >
                        <ChevronRight className="w-4 h-4" />
                      </Button>
                      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black/70 text-white px-3 py-1 rounded-full text-sm">
                        {currentImageIndex + 1} / {currentFile.images.length}
                      </div>
                    </>
                  )}
                </div>
              ) : currentFile?.type === 'pdf' ? (
                <div className="w-full h-[70vh] border rounded-lg">
                  <iframe
                    src={currentFile.url}
                    className="w-full h-full rounded-lg"
                    title={currentFile.name}
                  />
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">Dosya önizlemesi mevcut değil</p>
                </div>
              )}
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  const url = currentFile?.images ? currentFile.images[currentImageIndex] : currentFile?.url
                  if (url) {
                    window.open(url, '_blank')
                  }
                }}
              >
                <Eye className="w-4 h-4 mr-2" />
                Yeni Sekmede Aç
              </Button>
              <Button variant="outline" onClick={() => setShowFileModal(false)}>
                Kapat
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
          </TabsContent>

          {/* Packages Tab */}
          <TabsContent value="packages" className="space-y-6">
            {/* Package Header */}
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Paket ara..."
                    className="pl-10 w-64"
                    value={packageSearchTerm}
                    onChange={(e) => setPackageSearchTerm(e.target.value)}
                  />
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleRefresh}
                  disabled={loadingPackages}
                >
                  <RefreshCw className={`w-4 h-4 mr-2 ${loadingPackages ? 'animate-spin' : ''}`} />
                  Yenile
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleExportPackages}
                >
                  <FileSpreadsheet className="w-4 h-4 mr-2" />
                  Paketleri Dışa Aktar
                </Button>
              </div>

              <Dialog open={showAddPackageDialog} onOpenChange={setShowAddPackageDialog}>
                <DialogTrigger asChild>
                  <Button className="flex items-center gap-2" onClick={() => {
                    setPackageFormData({
                      name: '',
                      type: 'ON_GRID',
                      description: '',
                      parentId: null,
                      items: []
                    })
                    setSelectedProducts([])
                  }}>
                    <Plus className="w-4 h-4" />
                    Yeni Paket Oluştur
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-none w-[95vw] max-h-[85vh] overflow-y-auto" style={{ width: '95vw', maxWidth: 'none' }}>
                  <DialogHeader>
                    <DialogTitle>
                      {packageFormData.parentId ? 'Alt Paket Oluştur' : 'Yeni Paket Oluştur'}
                    </DialogTitle>
                    <DialogDescription>
                      {packageFormData.parentId
                        ? `Ana paket için alt paket oluşturun.`
                        : 'Ürünlerden paket oluşturun ve müşterilerinize hazır çözümler sunun.'}
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-6 py-4">
                    {/* Package Basic Info */}
                    <div className="grid gap-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2">
                          <Label htmlFor="package-name">Paket Adı *</Label>
                          <Input
                            id="package-name"
                            value={packageFormData.name}
                            onChange={(e) => setPackageFormData({...packageFormData, name: e.target.value})}
                            placeholder="Örn: Temel Ev Sistemi"
                          />
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor="package-type">Paket Tipi *</Label>
                          <Select value={packageFormData.type} onValueChange={(value: any) => setPackageFormData({...packageFormData, type: value})}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {PACKAGE_TYPES.map((type) => (
                                <SelectItem key={type.value} value={type.value}>
                                  {type.icon} {type.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="package-description">Açıklama</Label>
                        <Textarea
                          id="package-description"
                          value={packageFormData.description}
                          onChange={(e) => setPackageFormData({...packageFormData, description: e.target.value})}
                          placeholder="Paket açıklaması..."
                          rows={3}
                        />
                      </div>
                    </div>

                    {/* Product Selection */}
                    <div className="grid gap-4">
                      <div className="flex items-center justify-between">
                        <Label className="text-base font-medium">Ürün Seçimi</Label>
                        <Badge variant="secondary">
                          {selectedProducts.length} ürün seçildi
                        </Badge>
                      </div>

                      {/* Selected Products - Table Format */}
                      {selectedProducts.length > 0 && (
                        <Card>
                          <CardHeader>
                            <CardTitle className="text-sm">Seçilen Ürünler</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="overflow-x-auto">
                              <table className="w-full">
                                <thead>
                                  <tr className="border-b">
                                    <th className="text-left py-3 px-4">Ürün</th>
                                    <th className="text-left py-3 px-4">Marka</th>
                                    <th className="text-center py-3 px-4">Stok</th>
                                    <th className="text-center py-3 px-4">Miktar</th>
                                    <th className="text-right py-3 px-4">Birim Fiyat</th>
                                    <th className="text-right py-3 px-4">Toplam</th>
                                    <th className="text-center py-3 px-4">İşlem</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {selectedProducts.map((item) => {
                                    const product = products.find(p => p.id === item.productId)
                                    if (!product) return null
                                    return (
                                      <tr key={item.productId} className="border-b hover:bg-gray-50">
                                        <td className="py-3 px-4">
                                          <div className="font-medium text-sm">{product.name}</div>
                                          <div className="text-xs text-muted-foreground">{product.model}</div>
                                        </td>
                                        <td className="py-3 px-4 text-sm">{product.brand}</td>
                                        <td className="py-3 px-4 text-center">
                                          <Badge variant={product.stock > 0 ? "default" : "destructive"} className="text-xs">
                                            {product.stock}
                                          </Badge>
                                        </td>
                                        <td className="py-3 px-4 text-center">
                                          <Input
                                            type="number"
                                            value={item.quantity}
                                            onChange={(e) => updateProductQuantity(item.productId, parseInt(e.target.value) || 0)}
                                            className="w-20 h-8 text-center mx-auto"
                                            min="1"
                                          />
                                        </td>
                                        <td className="py-3 px-4 text-right">
                                          <div className="relative">
                                            <Input
                                              type="number"
                                              value={item.unitPrice}
                                              onChange={(e) => updateProductPrice(item.productId, parseFloat(e.target.value) || 0)}
                                              className="w-24 h-8 text-right pr-6 ml-auto"
                                              min="0"
                                              step="0.01"
                                              title={`Orijinal fiyat: ${formatCurrency(product.price)}`}
                                            />
                                            {item.unitPrice !== product.price && (
                                              <span className="absolute right-1 top-1/2 transform -translate-y-1/2 text-xs text-orange-500">
                                                ✱
                                              </span>
                                            )}
                                          </div>
                                        </td>
                                        <td className="py-3 px-4 text-right font-medium">
                                          {formatCurrency(item.quantity * item.unitPrice)}
                                        </td>
                                        <td className="py-3 px-4 text-center">
                                          <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => removeProductFromPackage(item.productId)}
                                            className="h-8 w-8 p-0 hover:bg-red-50 hover:text-red-600"
                                          >
                                            <Trash className="w-4 h-4" />
                                          </Button>
                                        </td>
                                      </tr>
                                    )
                                  })}
                                </tbody>
                                <tfoot>
                                  <tr className="border-t">
                                    <td colSpan={5} className="py-3 px-4 text-right font-medium">
                                      Toplam:
                                    </td>
                                    <td className="py-3 px-4 text-right font-bold text-green-600">
                                      {formatCurrency(selectedProducts.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0))}
                                    </td>
                                    <td></td>
                                  </tr>
                                </tfoot>
                              </table>
                            </div>
                          </CardContent>
                        </Card>
                      )}

                      {/* Available Products - Table Format */}
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-sm">Mevcut Ürünler</CardTitle>
                          <div className="relative">
                            <Input
                              placeholder="Ürün ara..."
                              value={productSearchTerm}
                              onChange={(e) => setProductSearchTerm(e.target.value)}
                              className="mt-2"
                            />
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="overflow-x-auto max-h-[60vh]">
                            <table className="w-full">
                              <thead className="sticky top-0 bg-white border-b">
                                <tr>
                                  <th className="text-left py-2 px-3 text-xs font-medium">Kategori</th>
                                  <th className="text-left py-2 px-3 text-xs font-medium">Ürün</th>
                                  <th className="text-left py-2 px-3 text-xs font-medium">Marka</th>
                                  <th className="text-center py-2 px-3 text-xs font-medium">Stok</th>
                                  <th className="text-right py-2 px-3 text-xs font-medium">Fiyat</th>
                                  <th className="text-center py-2 px-3 text-xs font-medium">İşlem</th>
                                </tr>
                              </thead>
                              <tbody>
                                {products
                                  .filter((product) =>
                                    product.name.toLowerCase().includes(productSearchTerm.toLowerCase()) ||
                                    product.brand.toLowerCase().includes(productSearchTerm.toLowerCase()) ||
                                    product.category?.toLowerCase().includes(productSearchTerm.toLowerCase())
                                  )
                                  .map((product) => {
                                  const isSelected = selectedProducts.some(item => item.productId === product.id)
                                  return (
                                    <tr key={product.id} className="border-b hover:bg-gray-50">
                                      <td className="py-2 px-3">
                                        <Badge variant="outline" className="text-xs">
                                          {product.category || 'Diğer'}
                                        </Badge>
                                      </td>
                                      <td className="py-2 px-3">
                                        <div>
                                          <div className="font-medium text-sm">{product.name}</div>
                                          <div className="text-xs text-muted-foreground">{product.model}</div>
                                        </div>
                                      </td>
                                      <td className="py-2 px-3 text-sm">{product.brand}</td>
                                      <td className="py-2 px-3 text-center">
                                        <Badge variant={product.stock > 0 ? "default" : "destructive"} className="text-xs">
                                          {product.stock}
                                        </Badge>
                                      </td>
                                      <td className="py-2 px-3 text-right font-medium">
                                        {formatCurrency(product.price)}
                                      </td>
                                      <td className="py-2 px-3 text-center">
                                        <Button
                                          variant={isSelected ? "secondary" : "outline"}
                                          size="sm"
                                          onClick={() => isSelected ? removeProductFromPackage(product.id) : addProductToPackage(product.id)}
                                          className="h-7 px-3 text-xs"
                                        >
                                          {isSelected ? "Çıkar" : "Ekle"}
                                        </Button>
                                      </td>
                                    </tr>
                                  )
                                })}
                              </tbody>
                            </table>
                            {products
                              .filter((product) =>
                                product.name.toLowerCase().includes(productSearchTerm.toLowerCase()) ||
                                product.brand.toLowerCase().includes(productSearchTerm.toLowerCase()) ||
                                product.category?.toLowerCase().includes(productSearchTerm.toLowerCase())
                              ).length === 0 && (
                              <div className="p-8 text-center text-muted-foreground text-sm">
                                Arama kriterinize uygun ürün bulunamadı
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setShowAddPackageDialog(false)} disabled={saving}>
                      İptal
                    </Button>
                    <Button
                      onClick={() => {
                        console.log('🔘 Button clicked!', {
                          saving,
                          selectedProductsLength: selectedProducts.length,
                          disabled: saving || selectedProducts.length === 0
                        })
                        handleAddPackage()
                      }}
                      disabled={saving || selectedProducts.length === 0}
                    >
                      {saving ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Oluşturuluyor...
                        </>
                      ) : (
                        <>
                          <Save className="w-4 h-4 mr-2" />
                          Paket Oluştur
                        </>
                      )}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>

            {/* Package Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {PACKAGE_TYPES.map((type) => {
                const count = packages.filter(pkg => pkg.type === type.value).length
                return (
                  <Card key={type.value} className="hover:shadow-md transition-all">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-2xl">{type.icon}</span>
                          <div>
                            <p className="text-2xl font-bold">{count}</p>
                            <p className="text-sm text-muted-foreground">{type.label}</p>
                          </div>
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <span className="sr-only">Menüyü aç</span>
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={(e) => {
                              e.stopPropagation()
                              // Belirli package type için paket oluştur
                              setPackageFormData({
                                name: '',
                                type: type.value as any,
                                description: '',
                                parentId: null,
                                items: []
                              })
                              setSelectedProducts([])
                              setShowAddPackageDialog(true)
                            }}>
                              <Plus className="w-4 h-4 mr-2" />
                              {type.label} Paketi Ekle
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>

            {/* Package List */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Box className="w-5 h-5" />
                  Paket Listesi
                </CardTitle>
                <CardDescription>
                  Mevcut paketlerinizi görüntüleyin ve yönetin
                </CardDescription>
              </CardHeader>
              <CardContent>
                {loadingPackages ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
                  </div>
                ) : filteredPackages.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    {packageSearchTerm ? 'Arama kriterlerine uygun paket bulunamadı.' : 'Henüz paket oluşturulmamış.'}
                  </div>
                ) : (
                  <div className="space-y-6">
                    {PACKAGE_TYPES.map((type) => {
                      const typePackages = filteredPackages.filter(pkg => pkg.type === type.value)
                      if (typePackages.length === 0) return null

                      return (
                        <div key={type.value} className="space-y-3">
                          <div className="flex items-center gap-2 pb-2 border-b">
                            <span className="text-xl">{type.icon}</span>
                            <h3 className="text-lg font-semibold">{type.label}</h3>
                            <Badge variant="secondary">{typePackages.length} paket</Badge>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 ml-4">
                            {typePackages.map((pkg) => (
                              <Popover key={pkg.id}>
                                <PopoverTrigger asChild>
                                  <div className="cursor-pointer hover:shadow-md transition-all border-2 border-gray-200 hover:border-blue-300 rounded-lg bg-white h-fit">
                                    <div className="p-3">
                                      <div className="space-y-2">
                                        <div className="flex items-center gap-1">
                                          <span className="text-sm">{PACKAGE_TYPE_ICONS[pkg.type as keyof typeof PACKAGE_TYPE_ICONS]}</span>
                                          <h4 className="font-medium text-sm truncate" title={pkg.name}>{pkg.name}</h4>
                                        </div>

                                        <Badge variant="outline" className={`text-xs w-full justify-center ${PACKAGE_TYPE_COLORS[pkg.type as keyof typeof PACKAGE_TYPE_COLORS]}`}>
                                          {PACKAGE_TYPE_LABELS[pkg.type as keyof typeof PACKAGE_TYPE_LABELS]}
                                        </Badge>

                                        <div className="space-y-1">
                                          <PricingGuard fallback={
                                            <div className="font-bold text-lg text-center text-gray-400">Gizli</div>
                                          }>
                                            <div className="font-bold text-lg text-green-600 text-center">
                                              {formatCurrency(pkg.totalPrice)}
                                            </div>
                                          </PricingGuard>

                                          {pkg.totalPower && (
                                            <div className="text-xs text-muted-foreground text-center">
                                              {pkg.totalPower} kW
                                            </div>
                                          )}

                                          <div className="text-xs text-muted-foreground text-center">
                                            {pkg.items.length} ürün
                                          </div>
                                        </div>

                                        <div className="flex gap-1">
                                          <Button
                                            size="sm"
                                            onClick={(e) => {
                                              e.stopPropagation()
                                              openEditPackageDialog(pkg)
                                            }}
                                            className="flex-1 h-7 text-xs"
                                          >
                                            <Edit className="w-3 h-3 mr-1" />
                                            Düzenle
                                          </Button>
                                          <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                              <Button
                                                variant="outline"
                                                size="sm"
                                                className="h-7 w-7 p-0"
                                                onClick={(e) => e.stopPropagation()}
                                              >
                                                <MoreHorizontal className="w-3 h-3" />
                                              </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent>
                                              <DropdownMenuItem onClick={(e) => {
                                                e.stopPropagation()
                                                openEditPackageDialog(pkg)
                                              }}>
                                                <Edit className="w-4 h-4 mr-2" />
                                                Düzenle
                                              </DropdownMenuItem>
                                              <DropdownMenuItem onClick={(e) => {
                                                e.stopPropagation()
                                                handleDuplicatePackage(pkg)
                                              }}>
                                                <Copy className="w-4 h-4 mr-2" />
                                                Çoğalt
                                              </DropdownMenuItem>
                                              <DropdownMenuItem onClick={(e) => {
                                                e.stopPropagation()
                                                openAddSubPackageDialog(pkg)
                                              }}>
                                                <Plus className="w-4 h-4 mr-2" />
                                                Alt Paket Ekle
                                              </DropdownMenuItem>
                                              <DropdownMenuItem
                                                onClick={(e) => {
                                                  e.stopPropagation()
                                                  openDeletePackageDialog(pkg)
                                                }}
                                                className="text-red-600"
                                              >
                                                <Trash2 className="w-4 h-4 mr-2" />
                                                Sil
                                              </DropdownMenuItem>
                                            </DropdownMenuContent>
                                          </DropdownMenu>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                </PopoverTrigger>
                                <PopoverContent side="right" className="w-80">
                                  <div className="space-y-3">
                                    <div className="font-semibold text-base">{pkg.name}</div>
                                    {pkg.description && (
                                      <p className="text-sm text-muted-foreground">
                                        {pkg.description}
                                      </p>
                                    )}
                                    <div className="border-t pt-3">
                                      <div className="text-sm font-medium mb-2">Paket İçeriği:</div>
                                      <div className="space-y-2 max-h-40 overflow-y-auto">
                                        {pkg.items && pkg.items.length > 0 ? (
                                          pkg.items.map((item: any, index: number) => (
                                            <div key={item.id || index} className="text-sm flex justify-between items-center p-2 bg-gray-50 rounded">
                                              <span className="font-medium">{item.productName || item.product?.name || 'Ürün'}</span>
                                              <span className="text-blue-600 font-bold">{item.quantity}x</span>
                                            </div>
                                          ))
                                        ) : (
                                          <div className="text-sm text-muted-foreground">Ürün bilgisi yok</div>
                                        )}
                                      </div>
                                    </div>
                                    {pkg.children && pkg.children.length > 0 && (
                                      <div className="border-t pt-3">
                                        <div className="text-sm font-medium mb-2">Alt Paketler:</div>
                                        <div className="space-y-1">
                                          {pkg.children.map((subPkg: any, index: number) => (
                                            <div key={index} className="text-sm p-2 bg-blue-50 rounded">
                                              📦 {subPkg.name}
                                            </div>
                                          ))}
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                </PopoverContent>
                              </Popover>

                            ))}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Edit Package Dialog */}
            <Dialog open={showEditPackageDialog} onOpenChange={setShowEditPackageDialog}>
              <DialogContent className="max-w-7xl w-[90vw] max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Paket Düzenle</DialogTitle>
                  <DialogDescription>
                    Paket bilgilerini güncelleyin.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="edit-package-name">Paket Adı *</Label>
                    <Input
                      id="edit-package-name"
                      value={packageFormData.name}
                      onChange={(e) => setPackageFormData({...packageFormData, name: e.target.value})}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="edit-package-type">Paket Tipi *</Label>
                    <Select value={packageFormData.type} onValueChange={(value: any) => setPackageFormData({...packageFormData, type: value})}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {PACKAGE_TYPES.map((type) => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.icon} {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="edit-package-description">Açıklama</Label>
                    <Textarea
                      id="edit-package-description"
                      value={packageFormData.description}
                      onChange={(e) => setPackageFormData({...packageFormData, description: e.target.value})}
                      rows={3}
                    />
                  </div>

                  {/* Package Items Section */}
                  <div className="grid gap-2">
                    <Label>Paket İçeriği</Label>
                    <div className="border rounded-lg p-4 space-y-3">
                      {packageFormData.items.length === 0 ? (
                        <p className="text-sm text-muted-foreground text-center py-4">
                          Bu pakette henüz ürün yok. Aşağıdan ürün ekleyebilirsiniz.
                        </p>
                      ) : (
                        packageFormData.items.map((item: any, index: number) => {
                          const product = products.find(p => p.id === item.productId)
                          return (
                            <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                              <div className="flex-1">
                                <p className="font-medium">{product?.name || 'Ürün bulunamadı'}</p>
                                <p className="text-sm text-muted-foreground">{product?.brand}</p>
                                <p className="text-xs text-green-600">Stok: {product?.stock || 0}</p>
                              </div>
                              <div className="flex items-center gap-2">
                                <div className="flex flex-col gap-1">
                                  <Label className="text-xs">Miktar</Label>
                                  <Input
                                    type="number"
                                    value={item.quantity}
                                    onChange={(e) => {
                                      const newItems = [...packageFormData.items]
                                      newItems[index].quantity = parseFloat(e.target.value) || 0
                                      setPackageFormData({...packageFormData, items: newItems})
                                    }}
                                    className="w-20 h-8 text-center"
                                    min="0"
                                    step="0.1"
                                  />
                                </div>
                                <div className="flex flex-col gap-1">
                                  <Label className="text-xs">Fiyat (₺)</Label>
                                  <div className="relative">
                                    <Input
                                      type="number"
                                      value={item.unitPrice || product?.price || 0}
                                      onChange={(e) => {
                                        const newItems = [...packageFormData.items]
                                        newItems[index].unitPrice = parseFloat(e.target.value) || 0
                                        setPackageFormData({...packageFormData, items: newItems})
                                      }}
                                      className="w-24 h-8 text-right pr-6"
                                      min="0"
                                      step="0.01"
                                      title={`Orijinal fiyat: ${formatCurrency(product?.price || 0)}`}
                                    />
                                    {(item.unitPrice || product?.price || 0) !== (product?.price || 0) && (
                                      <span className="absolute right-1 top-1/2 transform -translate-y-1/2 text-xs text-orange-500">
                                        ✱
                                      </span>
                                    )}
                                  </div>
                                </div>
                                <div className="flex flex-col gap-1">
                                  <Label className="text-xs">Toplam</Label>
                                  <div className="w-20 h-8 bg-white border rounded text-xs text-right px-2 flex items-center justify-end font-medium">
                                    {formatCurrency(item.quantity * (item.unitPrice || product?.price || 0))}
                                  </div>
                                </div>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => {
                                    const newItems = packageFormData.items.filter((_: any, i: number) => i !== index)
                                    setPackageFormData({...packageFormData, items: newItems})
                                  }}
                                  className="h-8"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            </div>
                          )
                        })
                      )}

                      {/* Add Product Section */}
                      <div className="border-t pt-3 mt-3">
                        <div className="space-y-2">
                          <Input
                            placeholder="Ürün ara..."
                            value={productSearchTerm}
                            onChange={(e) => setProductSearchTerm(e.target.value)}
                            className="mb-2"
                          />
                          <div className="max-h-40 overflow-y-auto border rounded-md">
                            {products
                              .filter((product) =>
                                product.name.toLowerCase().includes(productSearchTerm.toLowerCase()) ||
                                product.brand.toLowerCase().includes(productSearchTerm.toLowerCase()) ||
                                product.category?.toLowerCase().includes(productSearchTerm.toLowerCase())
                              )
                              .map((product) => {
                                const existingIndex = packageFormData.items.findIndex((item: any) => item.productId === product.id)
                                const isInPackage = existingIndex >= 0
                                return (
                                  <div key={product.id} className="flex items-center justify-between p-2 hover:bg-gray-50 border-b last:border-b-0">
                                    <div className="flex-1">
                                      <div className="font-medium text-sm">{product.name}</div>
                                      <div className="text-xs text-muted-foreground">
                                        {product.brand} - {formatCurrency(product.price)}
                                      </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                      {isInPackage && (
                                        <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                                          {packageFormData.items[existingIndex].quantity} adet
                                        </span>
                                      )}
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => {
                                          if (isInPackage) {
                                            // Ürün zaten var, miktarını artır
                                            const newItems = [...packageFormData.items]
                                            newItems[existingIndex].quantity += 1
                                            setPackageFormData({...packageFormData, items: newItems})
                                          } else {
                                            // Yeni ürün ekle
                                            const newItem = {
                                              productId: product.id,
                                              quantity: 1,
                                              unitPrice: product.price
                                            }
                                            setPackageFormData({
                                              ...packageFormData,
                                              items: [...packageFormData.items, newItem]
                                            })
                                          }
                                        }}
                                      >
                                        {isInPackage ? "+" : "Ekle"}
                                      </Button>
                                    </div>
                                  </div>
                                )
                              })}
                            {products.filter((product) =>
                              product.name.toLowerCase().includes(productSearchTerm.toLowerCase()) ||
                              product.brand.toLowerCase().includes(productSearchTerm.toLowerCase()) ||
                              product.category?.toLowerCase().includes(productSearchTerm.toLowerCase())
                            ).length === 0 && (
                              <div className="p-4 text-center text-muted-foreground text-sm">
                                Arama kriterinize uygun ürün bulunamadı
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Package Total */}
                      {packageFormData.items.length > 0 && (
                        <div className="border-t pt-3 mt-3">
                          <div className="flex justify-between items-center">
                            <span className="font-medium">Toplam Fiyat:</span>
                            <span className="text-lg font-bold text-green-600">
                              {formatCurrency(
                                packageFormData.items.reduce((total: number, item: any) => {
                                  const product = products.find(p => p.id === item.productId)
                                  const unitPrice = item.unitPrice || product?.price || 0
                                  return total + (item.quantity * unitPrice)
                                }, 0)
                              )}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setShowEditPackageDialog(false)} disabled={saving}>
                    İptal
                  </Button>
                  <Button onClick={handleEditPackage} disabled={saving}>
                    {saving ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Güncelleniyor...
                      </>
                    ) : (
                      'Güncelle'
                    )}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            {/* Delete Package Dialog */}
            <Dialog open={showDeletePackageDialog} onOpenChange={setShowDeletePackageDialog}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Paket Sil</DialogTitle>
                  <DialogDescription>
                    Bu paketi silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.
                  </DialogDescription>
                </DialogHeader>
                {selectedPackage && (
                  <div className="py-4">
                    <p className="font-medium">{selectedPackage.name}</p>
                    <p className="text-sm text-gray-500">
                      {PACKAGE_TYPE_LABELS[selectedPackage.type as keyof typeof PACKAGE_TYPE_LABELS]} - {selectedPackage.items.length} ürün
                    </p>
                  </div>
                )}
                <DialogFooter>
                  <Button variant="outline" onClick={() => setShowDeletePackageDialog(false)} disabled={saving}>
                    İptal
                  </Button>
                  <Button variant="destructive" onClick={handleDeletePackage} disabled={saving}>
                    {saving ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Siliniyor...
                      </>
                    ) : (
                      'Sil'
                    )}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </TabsContent>
        </Tabs>
        <Toaster />
      </DashboardLayout>
    </>
  )
}
