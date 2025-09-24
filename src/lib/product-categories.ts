// Solar product categories and specifications

export interface ProductCategory {
  id: string
  name: string
  slug: string
  description: string
  parentId?: string
  specifications: ProductSpecification[]
  icon: string
  color: string
  isActive: boolean
  sortOrder: number
}

export interface ProductSpecification {
  id: string
  name: string
  type: 'text' | 'number' | 'boolean' | 'select' | 'multiselect' | 'range'
  unit?: string
  required: boolean
  options?: string[]
  min?: number
  max?: number
  defaultValue?: any
  group: string
}

export interface Product {
  id: string
  name: string
  code?: string
  model: string
  brand: string
  categoryId: string
  subcategoryId?: string
  description: string
  specifications: Record<string, any>
  pricing: ProductPricing
  inventory: ProductInventory
  images: string[]
  documents: ProductDocument[]
  certifications: string[]
  warranty: ProductWarranty
  status: 'ACTIVE' | 'INACTIVE' | 'DISCONTINUED'
  createdAt: string
  updatedAt: string
}

export interface ProductPricing {
  basePrice: number
  currency: 'TRY' | 'USD' | 'EUR'
  costPrice?: number
  purchasePriceUsd?: number
  margin?: number
  purchaseDate?: string
  discountTiers: Array<{
    minQuantity: number
    discount: number
    discountType: 'PERCENTAGE' | 'FIXED'
  }>
  priceHistory: Array<{
    price: number
    effectiveDate: string
    reason: string
    updatedBy: string
  }>
  vatRate: number
  isVatIncluded: boolean
}

export interface ProductInventory {
  sku: string
  barcode?: string
  stockQuantity: number
  reservedQuantity: number
  availableQuantity: number
  minimumStock: number
  maximumStock: number
  reorderPoint: number
  location: string
  supplier: string
  leadTime: number // days
  lastStockUpdate: string
  stockMovements: Array<{
    type: 'IN' | 'OUT' | 'ADJUSTMENT'
    quantity: number
    reason: string
    date: string
    reference?: string
  }>
}

export interface ProductDocument {
  id: string
  name: string
  type: 'DATASHEET' | 'MANUAL' | 'CERTIFICATE' | 'WARRANTY' | 'OTHER'
  url: string
  language: string
  version?: string
  uploadDate: string
}

export interface ProductWarranty {
  duration: number
  unit: 'MONTHS' | 'YEARS'
  type: 'MANUFACTURER' | 'DISTRIBUTOR' | 'INSTALLATION'
  coverage: string[]
  conditions: string
}

// Predefined solar product categories
export const SOLAR_CATEGORIES: ProductCategory[] = [
  {
    id: 'panels',
    name: 'Güneş Panelleri',
    slug: 'gunes-panelleri',
    description: 'Mono ve polikristal güneş panelleri',
    specifications: [
      {
        id: 'power',
        name: 'Güç (Watt)',
        type: 'number',
        unit: 'W',
        required: true,
        min: 50,
        max: 1000,
        group: 'Elektriksel'
      },
      {
        id: 'voltage',
        name: 'Voltaj',
        type: 'number',
        unit: 'V',
        required: true,
        min: 12,
        max: 48,
        group: 'Elektriksel'
      },
      {
        id: 'current',
        name: 'Akım',
        type: 'number',
        unit: 'A',
        required: true,
        group: 'Elektriksel'
      },
      {
        id: 'efficiency',
        name: 'Verimlilik',
        type: 'number',
        unit: '%',
        required: true,
        min: 15,
        max: 25,
        group: 'Performans'
      },
      {
        id: 'cell_type',
        name: 'Hücre Tipi',
        type: 'select',
        required: true,
        options: ['Monokristal', 'Polikristal', 'İnce Film', 'Bifacial'],
        group: 'Teknik'
      },
      {
        id: 'dimensions',
        name: 'Boyutlar (mm)',
        type: 'text',
        required: true,
        group: 'Fiziksel'
      },
      {
        id: 'weight',
        name: 'Ağırlık',
        type: 'number',
        unit: 'kg',
        required: true,
        group: 'Fiziksel'
      },
      {
        id: 'temperature_coefficient',
        name: 'Sıcaklık Katsayısı',
        type: 'number',
        unit: '%/°C',
        required: false,
        group: 'Performans'
      },
      {
        id: 'warranty_years',
        name: 'Garanti Süresi',
        type: 'number',
        unit: 'yıl',
        required: true,
        min: 10,
        max: 30,
        group: 'Garanti'
      }
    ],
    icon: 'Sun',
    color: 'bg-yellow-500',
    isActive: true,
    sortOrder: 1
  },
  {
    id: 'inverters',
    name: 'İnverterler',
    slug: 'inverterler',
    description: 'String ve merkezi inverterler',
    specifications: [
      {
        id: 'power_rating',
        name: 'Güç Değeri',
        type: 'number',
        unit: 'kW',
        required: true,
        min: 1,
        max: 100,
        group: 'Elektriksel'
      },
      {
        id: 'input_voltage',
        name: 'Giriş Voltajı',
        type: 'range',
        unit: 'V',
        required: true,
        group: 'Elektriksel'
      },
      {
        id: 'output_voltage',
        name: 'Çıkış Voltajı',
        type: 'number',
        unit: 'V',
        required: true,
        group: 'Elektriksel'
      },
      {
        id: 'efficiency',
        name: 'Verimlilik',
        type: 'number',
        unit: '%',
        required: true,
        min: 90,
        max: 99,
        group: 'Performans'
      },
      {
        id: 'mppt_trackers',
        name: 'MPPT Sayısı',
        type: 'number',
        required: true,
        min: 1,
        max: 12,
        group: 'Teknik'
      },
      {
        id: 'inverter_type',
        name: 'İnverter Tipi',
        type: 'select',
        required: true,
        options: ['String İnverter', 'Merkezi İnverter', 'Mikro İnverter', 'Güç Optimize Edici'],
        group: 'Teknik'
      },
      {
        id: 'protection_class',
        name: 'Koruma Sınıfı',
        type: 'select',
        required: true,
        options: ['IP65', 'IP66', 'IP67', 'NEMA 3R', 'NEMA 4X'],
        group: 'Koruma'
      },
      {
        id: 'monitoring',
        name: 'İzleme Özelliği',
        type: 'boolean',
        required: false,
        group: 'Özellikler'
      },
      {
        id: 'communication',
        name: 'İletişim',
        type: 'multiselect',
        options: ['WiFi', 'Ethernet', 'RS485', 'Zigbee', '4G'],
        required: false,
        group: 'Özellikler'
      }
    ],
    icon: 'Zap',
    color: 'bg-blue-500',
    isActive: true,
    sortOrder: 2
  },
  {
    id: 'mounting',
    name: 'Montaj Sistemleri',
    slug: 'montaj-sistemleri',
    description: 'Çatı ve arazi montaj sistemleri',
    specifications: [
      {
        id: 'mounting_type',
        name: 'Montaj Tipi',
        type: 'select',
        required: true,
        options: ['Çatı Üstü', 'Çatı Entegre', 'Arazi', 'Carport', 'Tracker'],
        group: 'Teknik'
      },
      {
        id: 'material',
        name: 'Malzeme',
        type: 'select',
        required: true,
        options: ['Alüminyum', 'Galvaniz Çelik', 'Paslanmaz Çelik'],
        group: 'Malzeme'
      },
      {
        id: 'roof_type',
        name: 'Çatı Tipi',
        type: 'multiselect',
        options: ['Kiremit', 'Trapez Sac', 'Sandviç Panel', 'Beton', 'Bitüm'],
        required: false,
        group: 'Uyumluluk'
      },
      {
        id: 'tilt_angle',
        name: 'Eğim Açısı',
        type: 'range',
        unit: '°',
        required: false,
        min: 0,
        max: 60,
        group: 'Teknik'
      },
      {
        id: 'wind_load',
        name: 'Rüzgar Yükü',
        type: 'number',
        unit: 'N/m²',
        required: true,
        group: 'Dayanım'
      },
      {
        id: 'snow_load',
        name: 'Kar Yükü',
        type: 'number',
        unit: 'N/m²',
        required: true,
        group: 'Dayanım'
      }
    ],
    icon: 'Grid3x3',
    color: 'bg-gray-500',
    isActive: true,
    sortOrder: 3
  },
  {
    id: 'batteries',
    name: 'Bataryalar',
    slug: 'bataryalar',
    description: 'Lityum ve kurşun asit bataryalar',
    specifications: [
      {
        id: 'capacity',
        name: 'Kapasite',
        type: 'number',
        unit: 'kWh',
        required: true,
        min: 1,
        max: 100,
        group: 'Elektriksel'
      },
      {
        id: 'voltage',
        name: 'Voltaj',
        type: 'number',
        unit: 'V',
        required: true,
        group: 'Elektriksel'
      },
      {
        id: 'battery_type',
        name: 'Batarya Tipi',
        type: 'select',
        required: true,
        options: ['Lityum İyon', 'LiFePO4', 'Kurşun Asit', 'Gel', 'AGM'],
        group: 'Teknik'
      },
      {
        id: 'cycles',
        name: 'Döngü Sayısı',
        type: 'number',
        required: true,
        min: 1000,
        max: 10000,
        group: 'Dayanım'
      },
      {
        id: 'dod',
        name: 'Deşarj Derinliği',
        type: 'number',
        unit: '%',
        required: true,
        min: 50,
        max: 100,
        group: 'Performans'
      },
      {
        id: 'charge_efficiency',
        name: 'Şarj Verimliliği',
        type: 'number',
        unit: '%',
        required: true,
        group: 'Performans'
      }
    ],
    icon: 'Battery',
    color: 'bg-green-500',
    isActive: true,
    sortOrder: 4
  },
  {
    id: 'cables',
    name: 'Kablolar',
    slug: 'kablolar',
    description: 'DC ve AC kablolar',
    specifications: [
      {
        id: 'cable_type',
        name: 'Kablo Tipi',
        type: 'select',
        required: true,
        options: ['DC Solar Kablo', 'AC Güç Kablosu', 'İletişim Kablosu', 'Topraklama Kablosu'],
        group: 'Teknik'
      },
      {
        id: 'cross_section',
        name: 'Kesit',
        type: 'number',
        unit: 'mm²',
        required: true,
        group: 'Elektriksel'
      },
      {
        id: 'voltage_rating',
        name: 'Voltaj Değeri',
        type: 'number',
        unit: 'V',
        required: true,
        group: 'Elektriksel'
      },
      {
        id: 'current_rating',
        name: 'Akım Değeri',
        type: 'number',
        unit: 'A',
        required: true,
        group: 'Elektriksel'
      },
      {
        id: 'insulation',
        name: 'İzolasyon',
        type: 'select',
        required: true,
        options: ['XLPE', 'PVC', 'Halojensiz', 'EPR'],
        group: 'Malzeme'
      },
      {
        id: 'uv_resistance',
        name: 'UV Dayanımı',
        type: 'boolean',
        required: true,
        group: 'Dayanım'
      }
    ],
    icon: 'Cable',
    color: 'bg-orange-500',
    isActive: true,
    sortOrder: 5
  },
  {
    id: 'accessories',
    name: 'Aksesuarlar',
    slug: 'aksesuarlar',
    description: 'Sigorta, şalter ve diğer aksesuarlar',
    specifications: [
      {
        id: 'accessory_type',
        name: 'Aksesuar Tipi',
        type: 'select',
        required: true,
        options: [
          'DC Sigorta', 'AC Sigorta', 'Şalter', 'Kontaktör', 'Sayaç', 
          'Monitör', 'Konnektör', 'Sigortaj', 'Parafudr', 'İzolasyon Transformatörü'
        ],
        group: 'Teknik'
      },
      {
        id: 'rating',
        name: 'Değer',
        type: 'text',
        required: true,
        group: 'Elektriksel'
      },
      {
        id: 'protection_type',
        name: 'Koruma Tipi',
        type: 'multiselect',
        options: ['Aşırı Akım', 'Aşırı Voltaj', 'Düşük Voltaj', 'Toprak Kaçağı', 'Ark Koruması'],
        required: false,
        group: 'Koruma'
      }
    ],
    icon: 'Settings',
    color: 'bg-purple-500',
    isActive: true,
    sortOrder: 6
  }
]

export class ProductCategoryManager {
  static getCategories(): ProductCategory[] {
    return SOLAR_CATEGORIES.filter(cat => cat.isActive)
      .sort((a, b) => a.sortOrder - b.sortOrder)
  }

  static getCategoryById(id: string): ProductCategory | undefined {
    return SOLAR_CATEGORIES.find(cat => cat.id === id)
  }

  static getCategoryBySlug(slug: string): ProductCategory | undefined {
    return SOLAR_CATEGORIES.find(cat => cat.slug === slug)
  }

  static getSpecificationsByCategory(categoryId: string): ProductSpecification[] {
    const category = this.getCategoryById(categoryId)
    return category?.specifications || []
  }

  static validateProductData(product: Partial<Product>): Array<{field: string, message: string}> {
    const errors: Array<{field: string, message: string}> = []
    
    if (!product.name) {
      errors.push({ field: 'name', message: 'Ürün adı gereklidir' })
    }
    
    if (!product.categoryId) {
      errors.push({ field: 'categoryId', message: 'Kategori seçimi gereklidir' })
    }
    
    if (!product.brand) {
      errors.push({ field: 'brand', message: 'Marka bilgisi gereklidir' })
    }

    if (product.categoryId) {
      const category = this.getCategoryById(product.categoryId)
      if (category) {
        const requiredSpecs = category.specifications.filter(spec => spec.required)
        
        requiredSpecs.forEach(spec => {
          const value = product.specifications?.[spec.id]
          if (value === undefined || value === null || value === '') {
            errors.push({ 
              field: `specifications.${spec.id}`, 
              message: `${spec.name} alanı gereklidir` 
            })
          }
        })
      }
    }

    return errors
  }

  static formatSpecificationValue(value: any, spec: ProductSpecification): string {
    if (value === undefined || value === null) return '-'
    
    switch (spec.type) {
      case 'number':
        return `${value}${spec.unit ? ' ' + spec.unit : ''}`
      case 'boolean':
        return value ? 'Evet' : 'Hayır'
      case 'select':
        return value.toString()
      case 'multiselect':
        return Array.isArray(value) ? value.join(', ') : value.toString()
      case 'range':
        return typeof value === 'object' && value.min && value.max 
          ? `${value.min} - ${value.max}${spec.unit ? ' ' + spec.unit : ''}`
          : value.toString()
      default:
        return value.toString()
    }
  }

  static generateSKU(product: Partial<Product>): string {
    const category = this.getCategoryById(product.categoryId || '')
    const categoryCode = category?.slug.substring(0, 3).toUpperCase() || 'PRD'
    const brandCode = product.brand?.substring(0, 3).toUpperCase() || 'UNK'
    const randomSuffix = Math.random().toString(36).substring(2, 8).toUpperCase()
    
    return `${categoryCode}-${brandCode}-${randomSuffix}`
  }

  static calculateMargin(costPrice: number, sellingPrice: number): number {
    if (costPrice === 0) return 0
    return ((sellingPrice - costPrice) / costPrice) * 100
  }

  static applyDiscount(basePrice: number, quantity: number, discountTiers: ProductPricing['discountTiers']): number {
    let applicableDiscount = 0
    
    // Find the best discount tier for the quantity
    discountTiers
      .filter(tier => quantity >= tier.minQuantity)
      .forEach(tier => {
        if (tier.discount > applicableDiscount) {
          applicableDiscount = tier.discount
        }
      })

    if (applicableDiscount === 0) return basePrice

    // Apply discount based on type
    const discountTier = discountTiers.find(tier => tier.discount === applicableDiscount)
    if (discountTier?.discountType === 'PERCENTAGE') {
      return basePrice * (1 - applicableDiscount / 100)
    } else {
      return Math.max(0, basePrice - applicableDiscount)
    }
  }

  static updateStock(
    inventory: ProductInventory, 
    quantity: number, 
    type: 'IN' | 'OUT' | 'ADJUSTMENT',
    reason: string,
    reference?: string
  ): ProductInventory {
    const movement = {
      type,
      quantity: Math.abs(quantity),
      reason,
      date: new Date().toISOString(),
      reference
    }

    let newStockQuantity = inventory.stockQuantity

    if (type === 'IN') {
      newStockQuantity += Math.abs(quantity)
    } else if (type === 'OUT') {
      newStockQuantity -= Math.abs(quantity)
    } else if (type === 'ADJUSTMENT') {
      newStockQuantity = Math.abs(quantity) // Set to exact quantity
    }

    return {
      ...inventory,
      stockQuantity: Math.max(0, newStockQuantity),
      availableQuantity: Math.max(0, newStockQuantity - inventory.reservedQuantity),
      lastStockUpdate: new Date().toISOString(),
      stockMovements: [...inventory.stockMovements, movement]
    }
  }
}
