import { PartnerType, PartnerStatus, QuoteRequestStatus, PartnerQuoteRequestStatus, CommissionStatus } from '@prisma/client'

export interface Partner {
  id: string
  companyId: string
  type: PartnerType
  status: PartnerStatus
  serviceAreas: string[]
  specialties: string[]
  minimumProjectSize?: number
  maximumProjectSize?: number
  responseTimeHours: number
  portfolioImages: string[]
  certifications: CertificationDocument[]
  description?: string
  preferredContact: string
  totalLeads: number
  convertedLeads: number
  averageResponseTime?: number
  customerRating: number
  totalRevenue: number
  totalProjects: number
  commissionRate: number
  tier: string
  verifiedAt?: Date
  verifiedBy?: string
  verificationNotes?: string
  createdAt: Date
  updatedAt: Date
  company: {
    id: string
    name: string
    city?: string
    district?: string
    phone?: string
    website?: string
    logo?: string
  }
}

export interface CertificationDocument {
  id: string
  name: string
  type: string
  issuedBy: string
  issuedDate: string
  expiryDate?: string
  documentUrl: string
  verified: boolean
}

export interface QuoteRequest {
  id: string
  customerId?: string
  customerName: string
  customerEmail: string
  customerPhone?: string
  projectType: string
  location: string
  address?: string
  estimatedCapacity?: number
  budget?: number
  description?: string
  urgency: string
  status: QuoteRequestStatus
  preferredPartnerType?: PartnerType
  maxPartnersToContact: number
  expectedStartDate?: Date
  createdAt: Date
  updatedAt: Date
  expiresAt: Date
}

export interface PartnerQuoteRequest {
  id: string
  partnerId: string
  quoteRequestId: string
  status: PartnerQuoteRequestStatus
  sentAt: Date
  respondedAt?: Date
  viewedAt?: Date
  declinedAt?: Date
  selectedAt?: Date
  quotedPrice?: number
  currency: string
  timeline?: string
  notes?: string
  attachments?: string[]
  validUntil?: Date
  installationIncluded: boolean
  warrantyYears?: number
  maintenanceIncluded: boolean
  financingAvailable: boolean
  createdAt: Date
  updatedAt: Date
  partner: {
    id: string
    company: {
      name: string
      logo?: string
    }
  }
  quoteRequest: QuoteRequest
}

export interface Commission {
  id: string
  partnerId: string
  projectId?: string
  quoteRequestId?: string
  amount: number
  currency: string
  rate: number
  projectValue: number
  status: CommissionStatus
  dueDate: Date
  paidAt?: Date
  invoiceUrl?: string
  paymentMethod?: string
  description?: string
  notes?: string
  createdAt: Date
  updatedAt: Date
}

export interface PartnerReview {
  id: string
  partnerId: string
  customerId?: string
  customerName: string
  customerEmail?: string
  rating: number
  review?: string
  projectType?: string
  projectValue?: number
  verified: boolean
  helpful: number
  qualityRating?: number
  timelinessRating?: number
  communicationRating?: number
  approved: boolean
  moderatedBy?: string
  moderatedAt?: Date
  createdAt: Date
  updatedAt: Date
}

export interface PartnerRegistrationRequest {
  companyId: string
  type: PartnerType
  serviceAreas: string[]
  specialties: string[]
  minimumProjectSize?: number
  maximumProjectSize?: number
  responseTimeHours: number
  portfolioImages: string[]
  certifications: Omit<CertificationDocument, 'id' | 'verified'>[]
  description?: string
  preferredContact: string
}

export interface PartnerSearchFilters {
  location?: string
  partnerType?: PartnerType
  minRating?: number
  maxDistance?: number
  specialties?: string[]
  minProjectSize?: number
  maxProjectSize?: number
  verified?: boolean
  sortBy?: 'rating' | 'distance' | 'responseTime' | 'totalProjects'
  sortOrder?: 'asc' | 'desc'
}

export interface QuoteRequestFilters {
  status?: QuoteRequestStatus
  projectType?: string
  location?: string
  minBudget?: number
  maxBudget?: number
  urgency?: string
  partnerType?: PartnerType
  dateFrom?: Date
  dateTo?: Date
}

export const PARTNER_TYPES = [
  { value: 'INSTALLATION_COMPANY', label: 'Installation Company' },
  { value: 'MANUFACTURER', label: 'Manufacturer' },
  { value: 'CONSULTANT', label: 'Consultant' },
  { value: 'FINANCIAL_PARTNER', label: 'Financial Partner' },
] as const

export const PARTNER_STATUSES = [
  { value: 'PENDING_VERIFICATION', label: 'Pending Verification' },
  { value: 'VERIFIED', label: 'Verified' },
  { value: 'SUSPENDED', label: 'Suspended' },
  { value: 'REJECTED', label: 'Rejected' },
] as const

export const QUOTE_REQUEST_STATUSES = [
  { value: 'OPEN', label: 'Open' },
  { value: 'PARTNER_RESPONSES_RECEIVED', label: 'Responses Received' },
  { value: 'CUSTOMER_REVIEWING', label: 'Customer Reviewing' },
  { value: 'PARTNER_SELECTED', label: 'Partner Selected' },
  { value: 'PROJECT_STARTED', label: 'Project Started' },
  { value: 'COMPLETED', label: 'Completed' },
  { value: 'EXPIRED', label: 'Expired' },
  { value: 'CANCELLED', label: 'Cancelled' },
] as const

export const URGENCY_LEVELS = [
  { value: 'URGENT', label: 'Urgent (< 1 week)' },
  { value: 'NORMAL', label: 'Normal (1-4 weeks)' },
  { value: 'FLEXIBLE', label: 'Flexible (> 1 month)' },
] as const