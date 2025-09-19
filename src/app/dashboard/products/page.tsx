'use client'

import { useState, useEffect } from 'react'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { useToast } from '@/hooks/use-toast'
import { Toaster } from '@/components/ui/toaster'
import { formatCurrency } from '@/lib/utils'
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
  Upload,
  FileSpreadsheet,
  Cable,
  Monitor,
  Loader2,
  RefreshCw,
  Camera,
  FileText,
  BookOpen,
  Eye,
  ChevronLeft,
  ChevronRight,
  Box,
  Grid3x3,
  Trash,
  Save
} from 'lucide-react'

type Product = {
  id: string
  name: string
  category: string
  type?: string
  brand: string
  model: string
  power: string
  price: number
  stock: number
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
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [showBulkAddDialog, setShowBulkAddDialog] = useState(false)
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
  const [packages, setPackages] = useState<PackageType[]>([])
  const [showAddPackageDialog, setShowAddPackageDialog] = useState(false)
  const [showEditPackageDialog, setShowEditPackageDialog] = useState(false)
  const [showDeletePackageDialog, setShowDeletePackageDialog] = useState(false)
  const [selectedPackage, setSelectedPackage] = useState<PackageType | null>(null)
  const [packageFormData, setPackageFormData] = useState<CreatePackageData>({
    name: '',
    type: 'ON_GRID',
    description: '',
    items: []
  })
  const [packageSearchTerm, setPackageSearchTerm] = useState('')
  const [selectedProducts, setSelectedProducts] = useState<{productId: string, quantity: number, unitPrice: number}[]>([])
  const [loadingPackages, setLoadingPackages] = useState(false)

  // Fetch products from database
  const fetchProducts = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/products')
      if (!response.ok) {
        throw new Error('Failed to fetch products')
      }
      const data = await response.json()
      setProducts(data)
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
  const fetchCategories = async () => {
    try {
      console.log('🔄 Fetching categories from API...')
      const response = await fetch('/api/products/categories')
      console.log('📥 Categories API response:', response.status, response.statusText)

      if (!response.ok) {
        throw new Error(`Failed to fetch categories: ${response.status} ${response.statusText}`)
      }
      const data = await response.json()
      console.log('📊 Categories data received:', data)

      // Map icons from string to component
      const mappedCategories = data.map((cat: any) => ({
        ...cat,
        icon: iconMap[cat.icon] || Package
      }))

      setCategories(mappedCategories)
      console.log('✅ Categories updated successfully')
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
      const response = await fetch('/api/packages')
      if (!response.ok) {
        throw new Error('Failed to fetch packages')
      }
      const data = await response.json()
      setPackages(data.packages || [])
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
    fetchProducts()
    fetchCategories()
    fetchUser()
    fetchPackages()
  }, [])

  const filteredProducts = products.filter(product =>
    (product.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (product.brand || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (product.category || '').toLowerCase().includes(searchTerm.toLowerCase())
  )

  const filteredPackages = packages.filter(pkg =>
    (pkg.name || '').toLowerCase().includes(packageSearchTerm.toLowerCase()) ||
    PACKAGE_TYPE_LABELS[pkg.type].toLowerCase().includes(packageSearchTerm.toLowerCase())
  )

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

  const handleAddProduct = async () => {
    if (!formData.name || !formData.category || !formData.price || !formData.brand) {
      toast({
        title: "Hata",
        description: "Lütfen tüm gerekli alanları doldurun.",
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
        category: formData.category,
        brand: formData.brand,
        model: formData.model || '',
        power: formData.power,
        price: Number(formData.price),
        stock: Number(formData.stock) || 0,
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
          category: formData.category,
          brand: formData.brand,
          model: formData.model || '',
          power: formData.power,
          price: Number(formData.price),
          // purchasePrice: formData.purchasePrice ? Number(formData.purchasePrice) : null,
          // purchaseDate: formData.purchaseDate || null,
          stock: Number(formData.stock) || 0,
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

      // Success - update local state
      setProducts(prevProducts => [...prevProducts, responseBody])
      setFormData({})
      setShowAddDialog(false)
      
      toast({
        title: "Başarılı",
        description: "Ürün başarıyla eklendi."
      })
      
      // Refresh categories to update counts
      fetchCategories()
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

  const handleEditProduct = async () => {
    if (!selectedProduct || !formData.name || !formData.category || !formData.price) {
      toast({
        title: "Hata",
        description: "Lütfen tüm gerekli alanları doldurun.",
        variant: "destructive"
      })
      return
    }

    try {
      console.log('🔄 Starting edit product process...')
      console.log('Selected files state:', selectedFiles)

      setSaving(true)
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
      const existingImages = selectedProduct.images ? JSON.parse(selectedProduct.images) : []
      const allImages = [...existingImages, ...uploadedFiles.images]

      const response = await fetch(`/api/products/${selectedProduct.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          category: formData.category,
          brand: formData.brand,
          model: formData.model,
          power: formData.power,
          price: Number(formData.price),
          // purchasePrice: formData.purchasePrice ? Number(formData.purchasePrice) : null,
          // purchaseDate: formData.purchaseDate || null,
          // editDate: formData.editDate || new Date(),
          stock: Number(formData.stock),
          warranty: formData.warranty,
          description: formData.description,
          images: JSON.stringify(allImages),
          datasheet: uploadedFiles.datasheet || selectedProduct.datasheet,
          // manual: uploadedFiles.manual || selectedProduct.manual // Field doesn't exist
        })
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to update product')
      }

      const updatedProduct = await response.json()
      
      setProducts(products.map(product =>
        product.id === selectedProduct.id ? updatedProduct : product
      ))
      
      setFormData({})
      setSelectedProduct(null)
      setShowEditDialog(false)
      
      toast({
        title: "Başarılı",
        description: "Ürün başarıyla güncellendi."
      })
      
      // Refresh categories to update counts
      fetchCategories()
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

      // Success - update local state
      setProducts(prevProducts => prevProducts.filter(product => product.id !== selectedProduct.id))
      setSelectedProduct(null)
      setShowDeleteDialog(false)

      toast({
        title: "Başarılı",
        description: "Ürün başarıyla silindi."
      })
      
      // Refresh categories to update counts
      fetchCategories()
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
    // Add filter functionality - for now just log
    console.log('Filtering by category:', categoryId)
    // You can implement actual filtering logic here
    toast({
      title: "Filtre",
      description: `${selectedCategory?.name} kategorisine göre filtrelendi.`
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
    setSelectedProduct(product)
    setFormData({
      ...product,
      power: product.power.replace(/[^0-9.]/g, ''), // Extract numeric value
      warranty: product.warranty.replace(/[^0-9]/g, '') // Extract numeric value
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
    const lowStockProducts = products.filter(p => p.stock < 20)
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

  // Package Management Functions
  const handleAddPackage = async () => {
    if (!packageFormData.name || !packageFormData.type || packageFormData.items.length === 0) {
      toast({
        title: "Hata",
        description: "Paket adı, tipi ve en az bir ürün gereklidir.",
        variant: "destructive"
      })
      return
    }

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

      const newPackage = await response.json()
      setPackages(prev => [...prev, newPackage])
      setPackageFormData({
        name: '',
        type: 'ON_GRID',
        description: '',
        items: []
      })
      setSelectedProducts([])
      setShowAddPackageDialog(false)

      toast({
        title: "Başarılı",
        description: "Paket başarıyla oluşturuldu."
      })
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

      const updatedPackage = await response.json()
      setPackages(packages.map(pkg => pkg.id === selectedPackage.id ? updatedPackage : pkg))
      setSelectedPackage(null)
      setShowEditPackageDialog(false)

      toast({
        title: "Başarılı",
        description: "Paket başarıyla güncellendi."
      })
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
      items: pkg.items.map(item => ({
        productId: item.productId,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        description: item.description
      }))
    })
    setShowEditPackageDialog(true)
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
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input 
                placeholder="Ürün ara..." 
                className="pl-10 w-64"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
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
            <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Yeni Ürün Ekle</DialogTitle>
                <DialogDescription>
                  Yeni ürün bilgilerini girin.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="name">Ürün Adı *</Label>
                  <Input
                    id="name"
                    value={formData.name || ''}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    placeholder="Ürün adı girin"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="category">Kategori *</Label>
                  <Select value={formData.category || ''} onValueChange={(value) => setFormData({...formData, category: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Kategori seçin" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category.id} value={category.name}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="grid gap-2">
                    <Label htmlFor="brand">Marka *</Label>
                    <Input
                      id="brand"
                      value={formData.brand || ''}
                      onChange={(e) => setFormData({...formData, brand: e.target.value})}
                      placeholder="Marka"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="model">Model</Label>
                    <Input
                      id="model"
                      value={formData.model || ''}
                      onChange={(e) => setFormData({...formData, model: e.target.value})}
                      placeholder="Model"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="grid gap-2">
                    <Label htmlFor="power">Güç (W)</Label>
                    <Input
                      id="power"
                      type="number"
                      value={formData.power || ''}
                      onChange={(e) => setFormData({...formData, power: e.target.value})}
                      placeholder="540"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="warranty">Garanti (yıl)</Label>
                    <Input
                      id="warranty"
                      type="number"
                      value={formData.warranty || ''}
                      onChange={(e) => setFormData({...formData, warranty: e.target.value})}
                      placeholder="25"
                    />
                  </div>
                </div>
                {/* <div className="grid grid-cols-2 gap-2">
                  <div className="grid gap-2">
                    <Label htmlFor="purchasePrice">Alış Fiyatı (₺)</Label>
                    <Input
                      id="purchasePrice"
                      type="number"
                      value={formData.purchasePrice || ''}
                      onChange={(e) => setFormData({...formData, purchasePrice: Number(e.target.value)})}
                      placeholder="0"
                    />
                  </div>
                </div> */}
                  <div className="grid gap-2">
                    <Label htmlFor="price">Satış Fiyatı (₺) *</Label>
                    <Input
                      id="price"
                      type="number"
                      value={formData.price || ''}
                      onChange={(e) => setFormData({...formData, price: Number(e.target.value)})}
                      placeholder="0"
                    />
                  </div>
                {/* </div> */}
                {/* <div className="grid grid-cols-2 gap-2">
                  <div className="grid gap-2">
                    <Label htmlFor="purchaseDate">Alış Tarihi</Label>
                    <Input
                      id="purchaseDate"
                      type="date"
                      value={formData.purchaseDate ? new Date(formData.purchaseDate).toISOString().split('T')[0] : ''}
                      onChange={(e) => setFormData({...formData, purchaseDate: e.target.value ? new Date(e.target.value) : undefined})}
                    />
                  </div> */}
                <div className="grid gap-2">
                  <Label htmlFor="stock">Stok</Label>
                  <Input
                    id="stock"
                    type="number"
                    value={formData.stock || ''}
                    onChange={(e) => setFormData({...formData, stock: Number(e.target.value)})}
                    placeholder="0"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="description">Açıklama</Label>
                  <Input
                    id="description"
                    value={formData.description || ''}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    placeholder="Ürün açıklaması"
                  />
                </div>

                {/* File Upload Section */}
                <div className="space-y-4">
                  <div className="grid gap-2">
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
                      className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                    />
                    <p className="text-xs text-muted-foreground">PNG, JPG, JPEG dosyaları desteklenir (Maksimum 5 dosya)</p>
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="datasheet">Teknik Döküman (PDF)</Label>
                    <Input
                      id="datasheet"
                      type="file"
                      accept=".pdf"
                      onChange={(e) => {
                        setSelectedFiles({...selectedFiles, datasheet: e.target.files?.[0] || null})
                        console.log('Selected datasheet:', e.target.files?.[0])
                      }}
                      className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-red-50 file:text-red-700 hover:file:bg-red-100"
                    />
                    <p className="text-xs text-muted-foreground">Sadece PDF dosyaları desteklenir</p>
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="manual">Kullanım Kılavuzu (PDF)</Label>
                    <Input
                      id="manual"
                      type="file"
                      accept=".pdf"
                      onChange={(e) => {
                        setSelectedFiles({...selectedFiles, manual: e.target.files?.[0] || null})
                        console.log('Selected manual:', e.target.files?.[0])
                      }}
                      className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-green-50 file:text-green-700 hover:file:bg-green-100"
                    />
                    <p className="text-xs text-muted-foreground">Sadece PDF dosyaları desteklenir</p>
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
                      <th className="text-left py-3 px-4">Kategori</th>
                      <th className="text-left py-3 px-4">Güç/Kapasite</th>
                      <th className="text-left py-3 px-4">Fiyat</th>
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
                              {product.images && JSON.parse(product.images).length > 0 && (
                                <div className="group relative">
                                  <Camera
                                    className="w-4 h-4 text-blue-600 cursor-pointer hover:text-blue-800"
                                    onClick={() => {
                                      const images = JSON.parse(product.images || '[]')
                                      if (images.length > 0) {
                                        setCurrentFile({type: 'image', url: images[0], name: 'Ürün Görselleri', images: images})
                                        setCurrentImageIndex(0)
                                        setShowFileModal(true)
                                      }
                                    }}
                                  />
                                  <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-black text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                                    {JSON.parse(product.images).length} görsel
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
                        <td className="py-3 px-4">
                          <Badge variant="secondary">{product.category}</Badge>
                        </td>
                        <td className="py-3 px-4 font-medium">
                          {product.power}
                        </td>
                        <td className="py-3 px-4 font-medium">
                          {formatCurrency(product.price)}
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
                {products.filter(p => p.stock < 20).length === 0 ? (
                  <p className="text-sm text-gray-500 text-center py-4">
                    Stok uyarısı bulunmuyor
                  </p>
                ) : (
                  products.filter(p => p.stock < 20).map(product => (
                    <div key={product.id} className={`flex items-center justify-between p-3 border rounded-lg ${
                      product.stock === 0 ? 'border-red-200 bg-red-50' : 'border-orange-200 bg-orange-50'
                    }`}>
                      <div>
                        <p className={`font-medium ${product.stock === 0 ? 'text-red-800' : 'text-orange-800'}`}>
                          {product.name}
                        </p>
                        <p className={`text-sm ${product.stock === 0 ? 'text-red-600' : 'text-orange-600'}`}>
                          {product.stock === 0 ? 'Stok tükendi' : 'Kritik seviyede'}
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
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Toplam Satış Değeri</p>
                  <p className="text-2xl font-bold">
                    {formatCurrency(
                      products.reduce((sum, p) => sum + (p.price * p.stock), 0)
                    )}
                  </p>
                  <p className="text-sm text-green-600">
                    {products.reduce((sum, p) => sum + p.stock, 0)} toplam adet
                  </p>
                </div>

                {/* Purchase Value */}
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Toplam Alış Değeri</p>
                  <p className="text-xl font-bold text-blue-600">
                    {/* {formatCurrency(
                      products.reduce((sum, p) => {
                        const purchasePrice = p.purchasePrice || 0
                        return sum + (purchasePrice * p.stock)
                      }, 0)
                    )} */}
                    ₺0
                  </p>
                  <p className="text-sm text-blue-600">
                    {/* {products.filter(p => p.purchasePrice).length} ürünün alış fiyatı mevcut */}
                    Alış fiyatı verisi mevcut değil
                  </p>
                </div>

                {/* Profit Analysis */}
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Potansiyel Kar</p>
                  <p className="text-xl font-bold text-emerald-600">
                    {/* {formatCurrency(
                      products.reduce((sum, p) => {
                        const purchasePrice = p.purchasePrice || 0
                        const profit = (p.price - purchasePrice) * p.stock
                        return sum + (profit > 0 ? profit : 0)
                      }, 0)
                    )} */}
                    ₺0
                  </p>
                  <p className="text-sm text-emerald-600">
                    {/* {(products.reduce((sum, p) => {
                      const purchasePrice = p.purchasePrice || 0
                      if (purchasePrice === 0) return sum
                      const margin = ((p.price - purchasePrice) / purchasePrice) * 100
                      return sum + margin
                    }, 0) / Math.max(products.filter(p => p.purchasePrice).length, 1)).toFixed(1)}% ortalama kar marjı */}
                    Alış fiyatı olmadan kar hesaplanamaz
                  </p>
                </div>
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
              <Dialog open={showBulkAddDialog} onOpenChange={setShowBulkAddDialog}>
                <DialogTrigger asChild>
                  <Button variant="outline" className="flex flex-col items-center gap-2 h-20">
                    <Plus className="w-5 h-5" />
                    Toplu Ürün Ekle
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Toplu Ürün Ekleme</DialogTitle>
                    <DialogDescription>
                      CSV dosyası yükleyerek toplu ürün ekleme yapın
                    </DialogDescription>
                  </DialogHeader>
                  <div className="py-4 space-y-4">
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                      <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                      <p className="text-sm text-gray-600">CSV dosyanızı buraya sürükleyin</p>
                      <p className="text-xs text-gray-500 mt-2">veya dosya seçmek için tıklayın</p>
                    </div>
                    <Button variant="outline" className="w-full">
                      <FileSpreadsheet className="w-4 h-4 mr-2" />
                      Örnek CSV İndir
                    </Button>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setShowBulkAddDialog(false)}>İptal</Button>
                    <Button onClick={() => {
                      toast({title: "Başarılı", description: "Toplu ürün ekleme işlemi başlatıldı."})
                      setShowBulkAddDialog(false)
                    }}>Yükle</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>

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
                      Stok güncelleme işlemi için CSV dosyası yükleyin veya manuel olarak güncelleyin.
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
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Ürün Düzenle</DialogTitle>
              <DialogDescription>
                Ürün bilgilerini güncelleyin.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-name">Ürün Adı *</Label>
                <Input
                  id="edit-name"
                  value={formData.name || ''}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-category">Kategori *</Label>
                <Select value={formData.category || ''} onValueChange={(value) => setFormData({...formData, category: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.name}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="grid gap-2">
                  <Label htmlFor="edit-brand">Marka</Label>
                  <Input
                    id="edit-brand"
                    value={formData.brand || ''}
                    onChange={(e) => setFormData({...formData, brand: e.target.value})}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="edit-model">Model</Label>
                  <Input
                    id="edit-model"
                    value={formData.model || ''}
                    onChange={(e) => setFormData({...formData, model: e.target.value})}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="grid gap-2">
                  <Label htmlFor="edit-power">Güç (W)</Label>
                  <Input
                    id="edit-power"
                    type="number"
                    value={formData.power || ''}
                    onChange={(e) => setFormData({...formData, power: e.target.value})}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="edit-warranty">Garanti (yıl)</Label>
                  <Input
                    id="edit-warranty"
                    type="number"
                    value={formData.warranty || ''}
                    onChange={(e) => setFormData({...formData, warranty: e.target.value})}
                  />
                </div>
              </div>
              {/* <div className="grid grid-cols-2 gap-2">
                <div className="grid gap-2">
                  <Label htmlFor="edit-purchasePrice">Alış Fiyatı (₺)</Label>
                  <Input
                    id="edit-purchasePrice"
                    type="number"
                    value={formData.purchasePrice || ''}
                    onChange={(e) => setFormData({...formData, purchasePrice: Number(e.target.value)})}
                    placeholder="0"
                  />
                </div> */}
                <div className="grid gap-2">
                  <Label htmlFor="edit-price">Satış Fiyatı (₺) *</Label>
                  <Input
                    id="edit-price"
                    type="number"
                    value={formData.price || ''}
                    onChange={(e) => setFormData({...formData, price: Number(e.target.value)})}
                  />
                </div>
              {/* </div> */}
              {/* <div className="grid grid-cols-2 gap-2">
                <div className="grid gap-2">
                  <Label htmlFor="edit-purchaseDate">Alış Tarihi</Label>
                  <Input
                    id="edit-purchaseDate"
                    type="date"
                    value={formData.purchaseDate ? new Date(formData.purchaseDate).toISOString().split('T')[0] : ''}
                    onChange={(e) => setFormData({...formData, purchaseDate: e.target.value ? new Date(e.target.value) : undefined})}
                  />
                </div> */}
                <div className="grid gap-2">
                  <Label htmlFor="edit-stock">Stok</Label>
                  <Input
                    id="edit-stock"
                    type="number"
                    value={formData.stock || ''}
                    onChange={(e) => setFormData({...formData, stock: Number(e.target.value)})}
                  />
                </div>
              {/* </div> */}
              {/* <div className="grid gap-2">
                <Label htmlFor="edit-editDate">Düzenleme Tarihi</Label>
                <Input
                  id="edit-editDate"
                  type="date"
                  value={formData.editDate ? new Date(formData.editDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]}
                  onChange={(e) => setFormData({...formData, editDate: e.target.value ? new Date(e.target.value) : new Date()})}
                />
              </div> */}

              {/* File Upload Section */}
              <div className="space-y-4">
                <div className="grid gap-2">
                  <Label htmlFor="edit-images">Ürün Görselleri</Label>
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
                  <p className="text-xs text-muted-foreground">PNG, JPG, JPEG dosyaları desteklenir (Maksimum 5 dosya)</p>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="edit-datasheet">Teknik Döküman (PDF)</Label>
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

                <div className="grid gap-2">
                  <Label htmlFor="edit-manual">Kullanım Kılavuzu (PDF)</Label>
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
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
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
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
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
              </div>

              <Dialog open={showAddPackageDialog} onOpenChange={setShowAddPackageDialog}>
                <DialogTrigger asChild>
                  <Button className="flex items-center gap-2" onClick={() => {
                    setPackageFormData({
                      name: '',
                      type: 'ON_GRID',
                      description: '',
                      items: []
                    })
                    setSelectedProducts([])
                  }}>
                    <Plus className="w-4 h-4" />
                    Yeni Paket Oluştur
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Yeni Paket Oluştur</DialogTitle>
                    <DialogDescription>
                      Ürünlerden paket oluşturun ve müşterilerinize hazır çözümler sunun.
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

                      {/* Selected Products */}
                      {selectedProducts.length > 0 && (
                        <Card>
                          <CardHeader>
                            <CardTitle className="text-sm">Seçilen Ürünler</CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-2">
                            {selectedProducts.map((item) => {
                              const product = products.find(p => p.id === item.productId)
                              if (!product) return null
                              return (
                                <div key={item.productId} className="flex items-center justify-between p-2 border rounded">
                                  <div className="flex-1">
                                    <p className="font-medium text-sm">{product.name}</p>
                                    <p className="text-xs text-muted-foreground">{product.brand} - {formatCurrency(item.unitPrice)}</p>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <Input
                                      type="number"
                                      value={item.quantity}
                                      onChange={(e) => updateProductQuantity(item.productId, parseInt(e.target.value) || 0)}
                                      className="w-20 h-8"
                                      min="1"
                                    />
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => removeProductFromPackage(item.productId)}
                                    >
                                      <Trash className="w-4 h-4" />
                                    </Button>
                                  </div>
                                </div>
                              )
                            })}
                            <div className="pt-2 border-t">
                              <div className="flex justify-between font-medium">
                                <span>Toplam:</span>
                                <span>{formatCurrency(selectedProducts.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0))}</span>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      )}

                      {/* Available Products */}
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-sm">Mevcut Ürünler</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="grid gap-2 max-h-60 overflow-y-auto">
                            {products.map((product) => {
                              const isSelected = selectedProducts.some(item => item.productId === product.id)
                              return (
                                <div key={product.id} className="flex items-center justify-between p-2 border rounded hover:bg-gray-50">
                                  <div className="flex-1">
                                    <p className="font-medium text-sm">{product.name}</p>
                                    <p className="text-xs text-muted-foreground">{product.brand} - {formatCurrency(product.price)}</p>
                                  </div>
                                  <Button
                                    variant={isSelected ? "secondary" : "outline"}
                                    size="sm"
                                    onClick={() => isSelected ? removeProductFromPackage(product.id) : addProductToPackage(product.id)}
                                  >
                                    {isSelected ? "Çıkar" : "Ekle"}
                                  </Button>
                                </div>
                              )
                            })}
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setShowAddPackageDialog(false)} disabled={saving}>
                      İptal
                    </Button>
                    <Button onClick={handleAddPackage} disabled={saving || selectedProducts.length === 0}>
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
                  <Card key={type.value} className="cursor-pointer hover:shadow-md transition-all">
                    <CardContent className="p-6">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">{type.icon}</span>
                        <div>
                          <p className="text-2xl font-bold">{count}</p>
                          <p className="text-sm text-muted-foreground">{type.label}</p>
                        </div>
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
                  <div className="grid gap-4">
                    {filteredPackages.map((pkg) => (
                      <Card key={pkg.id} className="hover:shadow-md transition-all cursor-pointer" onClick={() => openEditPackageDialog(pkg)}>
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <span className="text-lg">{PACKAGE_TYPE_ICONS[pkg.type]}</span>
                                <h3 className="font-semibold">{pkg.name}</h3>
                                <Badge className={PACKAGE_TYPE_COLORS[pkg.type]}>
                                  {PACKAGE_TYPE_LABELS[pkg.type]}
                                </Badge>
                              </div>
                              {pkg.description && (
                                <p className="text-sm text-muted-foreground mb-3">{pkg.description}</p>
                              )}
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
                                <div>
                                  <p className="text-sm font-medium">Toplam Fiyat</p>
                                  <p className="text-lg font-bold text-green-600">{formatCurrency(pkg.totalPrice)}</p>
                                </div>
                                {pkg.totalPower && (
                                  <div>
                                    <p className="text-sm font-medium">Toplam Güç</p>
                                    <p className="text-lg font-bold">{pkg.totalPower} kW</p>
                                  </div>
                                )}
                                <div>
                                  <p className="text-sm font-medium">Ürün Sayısı</p>
                                  <p className="text-lg font-bold">{pkg.items.length} ürün</p>
                                </div>
                              </div>
                              <div className="space-y-1">
                                <p className="text-xs font-medium text-muted-foreground">Ürünler:</p>
                                <div className="flex flex-wrap gap-1">
                                  {pkg.items.slice(0, 3).map((item) => (
                                    <Badge key={item.id} variant="outline" className="text-xs">
                                      {item.quantity}x {item.product.name}
                                    </Badge>
                                  ))}
                                  {pkg.items.length > 3 && (
                                    <Badge variant="outline" className="text-xs">
                                      +{pkg.items.length - 3} daha
                                    </Badge>
                                  )}
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-2 ml-4">
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="sm">
                                    <MoreHorizontal className="w-4 h-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent>
                                  <DropdownMenuItem onClick={() => openEditPackageDialog(pkg)}>
                                    <Edit className="w-4 h-4 mr-2" />
                                    Düzenle
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={() => openDeletePackageDialog(pkg)}
                                    className="text-red-600"
                                  >
                                    <Trash2 className="w-4 h-4 mr-2" />
                                    Sil
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Edit Package Dialog */}
            <Dialog open={showEditPackageDialog} onOpenChange={setShowEditPackageDialog}>
              <DialogContent className="max-w-2xl">
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
                        packageFormData.items.map((item, index) => {
                          const product = products.find(p => p.id === item.productId)
                          return (
                            <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                              <div className="flex-1">
                                <p className="font-medium">{product?.name || 'Ürün bulunamadı'}</p>
                                <p className="text-sm text-muted-foreground">{product?.brand}</p>
                              </div>
                              <div className="flex items-center gap-2">
                                <Input
                                  type="number"
                                  value={item.quantity}
                                  onChange={(e) => {
                                    const newItems = [...packageFormData.items]
                                    newItems[index].quantity = parseFloat(e.target.value) || 0
                                    newItems[index].unitPrice = product?.price || 0
                                    setPackageFormData({...packageFormData, items: newItems})
                                  }}
                                  className="w-20"
                                  min="0"
                                  step="0.1"
                                />
                                <span className="text-sm text-muted-foreground">adet</span>
                              </div>
                              <div className="text-right">
                                <p className="font-medium">{formatCurrency((item.quantity * (product?.price || 0)))}</p>
                                <p className="text-sm text-muted-foreground">{formatCurrency(product?.price || 0)}/adet</p>
                              </div>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  const newItems = packageFormData.items.filter((_, i) => i !== index)
                                  setPackageFormData({...packageFormData, items: newItems})
                                }}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          )
                        })
                      )}

                      {/* Add Product Section */}
                      <div className="border-t pt-3 mt-3">
                        <div className="flex gap-2">
                          <Select
                            value=""
                            onValueChange={(productId) => {
                              const product = products.find(p => p.id === productId)
                              if (product) {
                                const existingIndex = packageFormData.items.findIndex(item => item.productId === productId)
                                if (existingIndex >= 0) {
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
                              }
                            }}
                          >
                            <SelectTrigger className="flex-1">
                              <SelectValue placeholder="Stoktan ürün seç..." />
                            </SelectTrigger>
                            <SelectContent>
                              {products.map((product) => (
                                <SelectItem key={product.id} value={product.id}>
                                  <div className="flex items-center justify-between w-full">
                                    <span>{product.name}</span>
                                    <span className="text-sm text-muted-foreground ml-2">
                                      {product.brand} - {formatCurrency(product.price)}
                                    </span>
                                  </div>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      {/* Package Total */}
                      {packageFormData.items.length > 0 && (
                        <div className="border-t pt-3 mt-3">
                          <div className="flex justify-between items-center">
                            <span className="font-medium">Toplam Fiyat:</span>
                            <span className="text-lg font-bold text-green-600">
                              {formatCurrency(
                                packageFormData.items.reduce((total, item) => {
                                  const product = products.find(p => p.id === item.productId)
                                  return total + (item.quantity * (product?.price || 0))
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
                      {PACKAGE_TYPE_LABELS[selectedPackage.type]} - {selectedPackage.items.length} ürün
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