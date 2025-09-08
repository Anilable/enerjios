// API Types for EnerjiOS Platform

export interface ApiResponse<T> {
  data: T
  success: boolean
  message?: string
  error?: string
}

export interface PaginatedResponse<T> {
  data: T[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

// Weather API Types
export interface WeatherLocation {
  name: string
  coordinates: [number, number] // [lng, lat]
}

export interface WeatherCondition {
  main: string
  description: string
  icon: string
}

export interface CurrentWeather {
  temperature: number
  feelsLike: number
  humidity: number
  pressure: number
  windSpeed: number
  windDirection: number
  cloudCover: number
  visibility: number
  irradiance: number
  uvIndex: number
  weather: WeatherCondition
  sunrise: string
  sunset: string
  lastUpdated: string
}

export interface WeatherForecastDay {
  date: string
  temperature: {
    min: number
    max: number
  }
  cloudCover: number
  estimatedOutput: number
  avgIrradiance: number
  weather: WeatherCondition
}

export interface HourlyWeatherForecast {
  date: string
  datetime: string
  temperature: {
    min: number
    max: number
    current: number
  }
  weather: WeatherCondition
  cloudCover: number
  windSpeed: number
  humidity: number
  estimatedOutput: number
  irradiance: number
}

export interface SolarMetrics {
  currentIrradiance: number
  peakSunHours: number
  estimatedDailyOutput: number
  weatherImpact: 'low' | 'medium' | 'high'
}

export interface WeatherApiResponse {
  location: WeatherLocation
  current: CurrentWeather
  forecast: WeatherForecastDay[]
  hourlyForecast: HourlyWeatherForecast[]
  solarMetrics: SolarMetrics
}

// Exchange Rates API Types
export interface ExchangeRate {
  code: string
  name: string
  unit: number
  buying: number | null
  selling: number | null
  forexBuying: number | null
  forexSelling: number | null
  change?: number
  changePercent?: number
}

export interface MajorCurrencies {
  USD: ExchangeRate | null
  EUR: ExchangeRate | null
  GBP: ExchangeRate | null
  JPY: ExchangeRate | null
}

export interface SolarIndustryRates {
  USD: ExchangeRate | null // US equipment
  EUR: ExchangeRate | null // European equipment  
  CNY: ExchangeRate | null // Chinese manufacturers
}

export interface ExchangeRatesApiResponse {
  date: string
  bulletinNo: string
  rates: ExchangeRate[]
  lastUpdated: string
  majorCurrencies: MajorCurrencies
  solarIndustryRates: SolarIndustryRates
  warning?: string // When using cached data
}

export interface CurrencyConversionRequest {
  amount: number
  fromCurrency: string
  toCurrency: string
}

export interface CurrencyConversionResponse {
  originalAmount: number
  convertedAmount: number
  fromCurrency: string
  toCurrency: string
  exchangeRate: number
  date: string
  calculatedAt: string
}

// Email API Types
export type EmailTemplate = 
  | 'projectStatusUpdate'
  | 'customerWelcome'
  | 'invoiceGenerated'
  | 'maintenanceReminder'

export interface EmailRequest {
  to: string | string[]
  template: EmailTemplate
  data: Record<string, any>
  from?: string
  replyTo?: string
}

export interface EmailResponse {
  success: boolean
  messageId?: string
  recipients: string[]
  template: string
  sentAt: string
}

export interface EmailTemplateData {
  projectStatusUpdate: {
    projectName: string
    status: string
    progress: number
    message?: string
    systemSize: number
    location: string
    nextStep?: string
    projectUrl: string
  }
  customerWelcome: {
    customerName: string
    email: string
    phone: string
    dashboardUrl: string
    projectAssignee?: string
  }
  invoiceGenerated: {
    customerName: string
    invoiceNumber: string
    amount: number
    dueDate: string
    projectName: string
    invoiceUrl: string
    paymentUrl: string
  }
  maintenanceReminder: {
    customerName: string
    projectName: string
    lastMaintenance: string
    suggestedDate: string
    maintenanceType: string
    scheduleUrl: string
    performanceIssues?: string
  }
}

// Project API Types
export interface Project {
  id: string
  name: string
  code: string
  status: ProjectStatus
  priority: ProjectPriority
  type: ProjectType
  customer: Customer
  location: ProjectLocation
  technical: TechnicalSpecs
  financial: FinancialInfo
  timeline: ProjectTimeline
  progress: number
  assignedTo: TeamMember
  team: TeamMember[]
  lastActivity: ProjectActivity
  notes: string[]
  documents: ProjectDocument[]
}

export type ProjectStatus = 
  | 'DESIGN'
  | 'QUOTE_SENT'
  | 'APPROVED'
  | 'IN_PROGRESS'
  | 'COMPLETED'
  | 'CANCELLED'

export type ProjectPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'

export type ProjectType = 'residential' | 'commercial' | 'agricultural'

export interface Customer {
  id: string
  name: string
  email: string
  phone: string
  company?: string
  avatar?: string
}

export interface ProjectLocation {
  address: string
  city: string
  district: string
  coordinates: [number, number]
}

export interface TechnicalSpecs {
  systemSize: number
  panelCount: number
  annualProduction: number
  roofArea: number
  inverterType: string
  batteryCapacity?: number
}

export interface FinancialInfo {
  estimatedCost: number
  quotedPrice?: number
  approvedBudget?: number
  paidAmount?: number
}

export interface ProjectTimeline {
  createdAt: string
  designCompleted?: string
  quoteApproved?: string
  installationStarted?: string
  completedAt?: string
}

export interface TeamMember {
  id: string
  name: string
  role: string
  avatar?: string
}

export interface ProjectActivity {
  action: string
  timestamp: string
  user: string
}

export interface ProjectDocument {
  id: string
  name: string
  type: string
  size: number
  uploadedAt: string
}

// Energy Data Types
export interface EnergyData {
  timestamp: string
  production: number
  consumption: number
  gridImport: number
  gridExport: number
  batteryCharge: number
  batteryDischarge: number
  batteryLevel: number
}

export interface EnergyMetrics {
  totalProduction: number
  totalConsumption: number
  selfConsumption: number
  gridFeedIn: number
  batteryThroughput: number
  efficiency: number
}

// Material/BOM Types
export interface Material {
  id: string
  category: string
  name: string
  description: string
  quantity: MaterialQuantity
  unit: string
  unitCost: number
  totalCost: number
  supplier: string
  model: string
  warranty: string
  status: MaterialStatus
  deliveryDate: string
  location: string
  notes: string
}

export interface MaterialQuantity {
  required: number
  ordered: number
  delivered: number
  installed: number
}

export type MaterialStatus = 
  | 'ordered'
  | 'delivered'
  | 'installed'
  | 'pending'
  | 'cancelled'

export interface MaterialCategory {
  id: string
  name: string
  icon: string
  color: string
}

// Battery System Types
export interface BatterySystem {
  id: string
  projectId: string
  capacity: number // kWh
  voltage: number
  current: number
  power: number
  stateOfCharge: number // %
  health: number // %
  temperature: number
  cycles: number
  status: BatteryStatus
  mode: BatteryMode
  lastUpdate: string
}

export type BatteryStatus = 
  | 'charging'
  | 'discharging'
  | 'standby'
  | 'fault'

export type BatteryMode = 'auto' | 'manual' | 'eco' | 'backup'

export interface BatteryPerformance {
  time: string
  soc: number
  voltage: number
  current: number
  power: number
  temperature: number
}

// Notification Types
export interface Notification {
  id: string
  type: NotificationType
  title: string
  message: string
  severity: NotificationSeverity
  isRead: boolean
  createdAt: string
  actionUrl?: string
  metadata?: Record<string, any>
}

export type NotificationType =
  | 'system_alert'
  | 'project_update'
  | 'maintenance_reminder'
  | 'invoice_generated'
  | 'payment_received'
  | 'weather_warning'

export type NotificationSeverity = 'low' | 'medium' | 'high' | 'critical'

// Analytics Types
export interface DashboardMetrics {
  totalProjects: number
  activeProjects: number
  completedProjects: number
  totalCapacity: number
  totalOutput: number
  totalSavings: number
  averageROI: number
  monthlyGrowth: number
}

export interface PerformanceMetrics {
  energyProduction: EnergyData[]
  financialMetrics: {
    totalSavings: number
    monthlyRevenue: number
    roi: number
    paybackPeriod: number
  }
  systemHealth: {
    overallStatus: 'excellent' | 'good' | 'fair' | 'poor'
    activeSystems: number
    systemsWithIssues: number
    maintenanceRequired: number
  }
}

// Error Types
export interface ApiError {
  code: string
  message: string
  details?: any
  timestamp: string
}

export interface ValidationError {
  field: string
  message: string
  value?: any
}

// Common Response Wrappers
export interface SuccessResponse<T = any> {
  success: true
  data: T
  message?: string
  timestamp: string
}

export interface ErrorResponse {
  success: false
  error: ApiError
  timestamp: string
}

export type APIResponse<T = any> = SuccessResponse<T> | ErrorResponse

// Request/Response helpers
export interface RequestOptions {
  timeout?: number
  retries?: number
  cache?: boolean
  cacheDuration?: number
}

export interface PaginationParams {
  page?: number
  limit?: number
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

export interface FilterParams {
  search?: string
  status?: string
  dateFrom?: string
  dateTo?: string
  [key: string]: any
}