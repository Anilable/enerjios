export type PackageType = 'ON_GRID' | 'OFF_GRID' | 'TARIMSAL_SULAMA' | 'DC_POMPALAR'

export interface PackageItem {
  id: string
  packageId: string
  productId: string
  quantity: number
  unitPrice: number
  total: number
  description?: string
  order: number
  createdAt: string
  updatedAt: string
  product: {
    id: string
    name: string
    brand: string
    model: string
    power?: number
    price: number
    unitType: string
    images: string
  }
}

export interface Package {
  id: string
  companyId?: string
  parentId?: string
  name: string
  type: PackageType
  description?: string
  totalPrice: number
  totalPower?: number
  estimatedSavings?: number
  images?: string
  isActive: boolean
  isFeatured: boolean
  createdById?: string
  updatedById?: string
  createdAt: string
  updatedAt: string
  items: PackageItem[]
  parent?: Package
  children?: Package[]
  company?: {
    id: string
    name: string
  }
  createdBy?: {
    id: string
    name: string
  }
}

export interface CreatePackageData {
  parentId?: string
  name: string
  type: PackageType
  description?: string
  images?: string[]
  items: Array<{
    productId: string
    quantity: number
    unitPrice: number
    description?: string
    order?: number
  }>
}

export interface UpdatePackageData {
  name?: string
  type?: PackageType
  description?: string
  images?: string[]
  isActive?: boolean
  isFeatured?: boolean
  items?: Array<{
    id?: string
    productId: string
    quantity: number
    unitPrice: number
    description?: string
    order?: number
  }>
}

export const PACKAGE_TYPES = [
  { value: 'ON_GRID', label: 'On Grid', description: 'Standard grid-tied solar systems', icon: '🔌' },
  { value: 'OFF_GRID', label: 'Off Grid', description: 'Battery backup systems', icon: '🔋' },
  { value: 'TARIMSAL_SULAMA', label: 'Tarımsal Sulama', description: 'Agricultural irrigation systems', icon: '🚜' },
  { value: 'DC_POMPALAR', label: 'DC Pompalar', description: 'DC pump systems', icon: '⚡' }
] as const

export const PACKAGE_TYPE_LABELS: Record<PackageType, string> = {
  ON_GRID: 'On Grid',
  OFF_GRID: 'Off Grid',
  TARIMSAL_SULAMA: 'Tarımsal Sulama',
  DC_POMPALAR: 'DC Pompalar'
}

export const PACKAGE_TYPE_COLORS: Record<PackageType, string> = {
  ON_GRID: 'bg-blue-100 text-blue-800',
  OFF_GRID: 'bg-yellow-100 text-yellow-800',
  TARIMSAL_SULAMA: 'bg-green-100 text-green-800',
  DC_POMPALAR: 'bg-purple-100 text-purple-800'
}

export const PACKAGE_TYPE_ICONS: Record<PackageType, string> = {
  ON_GRID: '🔌',
  OFF_GRID: '🔋',
  TARIMSAL_SULAMA: '🚜',
  DC_POMPALAR: '⚡'
}