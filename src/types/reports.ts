// src/types/reports.ts
export interface ReportSummary {
  totalSales?: number
  totalCount?: number
  averageValue?: number
  totalProjects?: number
  totalCapacity?: number
  totalRevenue?: number
  totalProfit?: number
  totalCustomers?: number
  individualCustomers?: number
  companyCustomers?: number
  repeatCustomers?: number
  totalValue?: number
  totalCompanies?: number
}

export interface SalesData {
  period: string
  totalAmount: number
  count: number
}

export interface ProjectPerformanceData {
  id: string
  name: string
  status: string
  systemSize: number
  revenue: number
  cost: number
  profit: number
  profitability: number
  company: string
}

export interface CustomerAnalyticsData {
  id: string
  name: string
  type: 'COMPANY' | 'INDIVIDUAL'
  projectCount: number
  totalValue: number
  averageProjectValue: number
  createdAt: string
}

export interface FinancialOverviewData {
  totalRevenue: number
  totalProjects: number
  activeProjects: number
  completedProjects: number
  systemCapacity: number
  avgProjectSize: number
  conversionRate: number
  avgProjectValue: number
}

export interface CompanyPerformanceData {
  id: string
  name: string
  projectCount: number
  totalRevenue: number
  totalCapacity: number
  averageProjectValue: number
  averageProjectSize: number
}

export type ReportData = 
  | SalesData[]
  | ProjectPerformanceData[]
  | CustomerAnalyticsData[]
  | FinancialOverviewData
  | CompanyPerformanceData[]

// Discriminated union for better type safety
export type TypedReportResponse<T extends ReportType> = 
  T extends 'sales-summary' ? ReportResponse<SalesData[]> :
  T extends 'project-performance' ? ReportResponse<ProjectPerformanceData[]> :
  T extends 'customer-analytics' ? ReportResponse<CustomerAnalyticsData[]> :
  T extends 'financial-overview' ? ReportResponse<FinancialOverviewData> :
  T extends 'company-performance' ? ReportResponse<CompanyPerformanceData[]> :
  never

export interface ReportResponse<T = ReportData> {
  data: T
  summary: ReportSummary
  chartData?: SalesData[]
}

export type ReportType = 
  | 'sales-summary'
  | 'project-performance'
  | 'customer-analytics'
  | 'financial-overview'
  | 'company-performance'

export interface ReportsOverviewProps {
  className?: string
}

export interface DashboardStats {
  totalRevenue: number
  totalProjects: number
  activeCustomers: number
  systemCapacity: number
  conversionRate: number
  avgProjectValue: number
  activeProjects: number
  completedProjects: number
  avgProjectSize: number
}