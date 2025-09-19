export type ProjectRequestStatus = 
  | 'OPEN' 
  | 'CONTACTED' 
  | 'ASSIGNED' 
  | 'SITE_VISIT' 
  | 'CONVERTED_TO_PROJECT' 
  | 'LOST'

export type ProjectType = 
  | 'RESIDENTIAL' 
  | 'COMMERCIAL' 
  | 'INDUSTRIAL' 
  | 'AGRICULTURAL'
  | 'ROOFTOP'
  | 'LAND'
  | 'AGRISOLAR'
  | 'CARPARK'
  | 'ONGRID'
  | 'OFFGRID'
  | 'STORAGE'
  | 'HYBRID'

export type Priority = 
  | 'LOW' 
  | 'MEDIUM' 
  | 'HIGH'

export type RequestSource =
  | 'WEBSITE'
  | 'PHONE'
  | 'EMAIL'
  | 'REFERRAL'
  | 'SOCIAL_MEDIA'
  | 'WALK_IN'
  | 'PARTNER_REFERRAL'
  | 'WHATSAPP'
  | 'OTHER'

export interface ProjectRequest {
  id: string
  requestNumber: string // Human-readable request number like PR-2024-001
  customerId?: string
  customerName: string
  customerEmail: string
  customerPhone: string
  location: string
  address: string
  projectType: ProjectType
  estimatedCapacity: number // kW
  estimatedBudget?: number
  estimatedRevenue?: number
  description: string
  status: ProjectRequestStatus
  priority: Priority
  source: RequestSource
  hasPhotos: boolean
  scheduledVisitDate?: string
  assignedEngineerId?: string
  assignedEngineerName?: string
  tags: string[]
  notes: string[]
  contactPreference?: string
  createdAt: string
  updatedAt: string
  statusHistory: ProjectRequestStatusHistoryItem[]
}

export interface ProjectRequestStatusHistoryItem {
  id: string
  status: ProjectRequestStatus
  timestamp: string
  userId: string
  userName: string
  note?: string
}

export interface KanbanColumn {
  id: ProjectRequestStatus
  title: string
  color: string
  requests: ProjectRequest[]
  count: number
}

export interface ProjectRequestFilters {
  search: string
  projectType?: ProjectType
  priority?: Priority
  assignedEngineerId?: string
  source?: RequestSource
  dateRange?: {
    start: string
    end: string
  }
}

export const PROJECT_REQUEST_STATUS_LABELS: Record<ProjectRequestStatus, string> = {
  OPEN: 'Açık',
  CONTACTED: 'İletişime Geçildi', 
  ASSIGNED: 'Atama Yapıldı',
  SITE_VISIT: 'Saha Ziyareti',
  CONVERTED_TO_PROJECT: 'Projeye Dönüştürüldü',
  LOST: 'Kaybedildi'
}

export const PROJECT_TYPE_LABELS: Record<ProjectType, string> = {
  RESIDENTIAL: 'Konut',
  COMMERCIAL: 'Ticari',
  INDUSTRIAL: 'Endüstriyel', 
  AGRICULTURAL: 'Tarımsal',
  ROOFTOP: 'Çatı GES',
  LAND: 'Arazi GES',
  AGRISOLAR: 'Tarımsal GES',
  CARPARK: 'Otopark GES',
  ONGRID: 'Şebeke Bağlantılı (On-Grid)',
  OFFGRID: 'Şebekeden Bağımsız (Off-Grid)',
  STORAGE: 'Enerji Depolama',
  HYBRID: 'Hibrit Sistem'
}

export const REQUEST_SOURCE_LABELS: Record<RequestSource, string> = {
  WEBSITE: 'Web Sitesi',
  PHONE: 'Telefon',
  EMAIL: 'E-posta',
  REFERRAL: 'Referans',
  SOCIAL_MEDIA: 'Sosyal Medya',
  WALK_IN: 'Ziyaretçi',
  PARTNER_REFERRAL: 'Partner Referansı',
  WHATSAPP: 'WhatsApp',
  OTHER: 'Diğer'
}

// Color schemes for request sources
export const REQUEST_SOURCE_COLORS: Record<RequestSource, {
  background: string
  text: string
  border: string
  badge: string
  icon: string
}> = {
  WEBSITE: {
    background: 'bg-blue-50',
    text: 'text-blue-700',
    border: 'border-blue-200',
    badge: 'bg-blue-100 text-blue-800 border-blue-200',
    icon: 'text-blue-600'
  },
  PHONE: {
    background: 'bg-green-50',
    text: 'text-green-700',
    border: 'border-green-200',
    badge: 'bg-green-100 text-green-800 border-green-200',
    icon: 'text-green-600'
  },
  EMAIL: {
    background: 'bg-purple-50',
    text: 'text-purple-700',
    border: 'border-purple-200',
    badge: 'bg-purple-100 text-purple-800 border-purple-200',
    icon: 'text-purple-600'
  },
  REFERRAL: {
    background: 'bg-orange-50',
    text: 'text-orange-700',
    border: 'border-orange-200',
    badge: 'bg-orange-100 text-orange-800 border-orange-200',
    icon: 'text-orange-600'
  },
  SOCIAL_MEDIA: {
    background: 'bg-pink-50',
    text: 'text-pink-700',
    border: 'border-pink-200',
    badge: 'bg-pink-100 text-pink-800 border-pink-200',
    icon: 'text-pink-600'
  },
  WALK_IN: {
    background: 'bg-indigo-50',
    text: 'text-indigo-700',
    border: 'border-indigo-200',
    badge: 'bg-indigo-100 text-indigo-800 border-indigo-200',
    icon: 'text-indigo-600'
  },
  PARTNER_REFERRAL: {
    background: 'bg-amber-50',
    text: 'text-amber-700',
    border: 'border-amber-200',
    badge: 'bg-amber-100 text-amber-800 border-amber-200',
    icon: 'text-amber-600'
  },
  WHATSAPP: {
    background: 'bg-emerald-50',
    text: 'text-emerald-700',
    border: 'border-emerald-200',
    badge: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    icon: 'text-emerald-600'
  },
  OTHER: {
    background: 'bg-gray-50',
    text: 'text-gray-700',
    border: 'border-gray-200',
    badge: 'bg-gray-100 text-gray-800 border-gray-200',
    icon: 'text-gray-600'
  }
}

// Icons for request sources
export const REQUEST_SOURCE_ICONS: Record<RequestSource, string> = {
  WEBSITE: '🌐',
  PHONE: '📞',
  EMAIL: '📧',
  REFERRAL: '👥',
  SOCIAL_MEDIA: '📱',
  WALK_IN: '🚶',
  PARTNER_REFERRAL: '🤝',
  WHATSAPP: '💬',
  OTHER: '📋'
}