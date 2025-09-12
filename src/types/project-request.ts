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
  | 'INSTAGRAM'
  | 'FACEBOOK'
  | 'LINKEDIN'
  | 'TWITTER'
  | 'WHATSAPP'
  | 'GOOGLE_ADS'
  | 'YOUTUBE'

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
  INSTAGRAM: 'Instagram',
  FACEBOOK: 'Facebook',
  LINKEDIN: 'LinkedIn',
  TWITTER: 'Twitter',
  WHATSAPP: 'WhatsApp',
  GOOGLE_ADS: 'Google Ads',
  YOUTUBE: 'YouTube'
}