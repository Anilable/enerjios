export interface PerformanceMetric {
  id: string
  name: string
  category: 'business' | 'technical' | 'customer' | 'financial'
  type: 'counter' | 'gauge' | 'histogram' | 'timer'
  value: number
  unit?: string
  timestamp: string
  metadata?: Record<string, any>
  tags?: Record<string, string>
}

export interface BusinessMetrics {
  // Project metrics
  totalProjects: number
  activeProjects: number
  completedProjects: number
  projectCompletionRate: number
  averageProjectDuration: number // days
  
  // Quote metrics
  totalQuotes: number
  quotesAccepted: number
  quotesRejected: number
  quoteAcceptanceRate: number
  averageQuoteValue: number
  
  // Revenue metrics
  totalRevenue: number
  monthlyRevenue: number
  averageProjectRevenue: number
  revenueGrowthRate: number
  
  // Customer metrics
  totalCustomers: number
  newCustomers: number
  customerRetentionRate: number
  customerSatisfactionScore: number
  
  // System capacity metrics
  totalSystemCapacity: number // kW
  averageSystemSize: number // kW
  monthlyCapacityInstalled: number // kW
}

export interface TechnicalMetrics {
  // API performance
  apiResponseTime: number // ms
  apiSuccessRate: number // %
  apiErrorRate: number // %
  apiThroughput: number // requests/minute
  
  // Database performance
  dbQueryTime: number // ms
  dbConnectionCount: number
  dbErrorRate: number // %
  
  // System resources
  cpuUsage: number // %
  memoryUsage: number // %
  diskUsage: number // %
  networkLatency: number // ms
  
  // Application metrics
  activeUsers: number
  sessionDuration: number // minutes
  pageLoadTime: number // ms
  errorCount: number
}

export interface CustomerMetrics {
  // Engagement metrics
  loginFrequency: number // logins/month
  featureUsage: Record<string, number>
  supportTickets: number
  averageResponseTime: number // hours
  
  // Conversion metrics
  leadToCustomerRate: number // %
  quoteToSaleRate: number // %
  averageConversionTime: number // days
  
  // Satisfaction metrics
  npsScore: number // -100 to 100
  satisfactionRating: number // 1-5
  referralRate: number // %
}

export interface FinancialMetrics {
  // Revenue metrics
  totalRevenue: number
  monthlyRecurringRevenue: number
  averageOrderValue: number
  revenuePerCustomer: number
  
  // Cost metrics
  customerAcquisitionCost: number
  operatingCosts: number
  profitMargin: number // %
  
  // Cash flow metrics
  accountsReceivable: number
  accountsPayable: number
  cashFlow: number
}

export interface MetricAlert {
  id: string
  metricName: string
  condition: 'above' | 'below' | 'equals'
  threshold: number
  currentValue: number
  severity: 'low' | 'medium' | 'high' | 'critical'
  message: string
  timestamp: string
  acknowledged?: boolean
  acknowledgedBy?: string
  acknowledgedAt?: string
}

class PerformanceMetricsTracker {
  private metrics: Map<string, PerformanceMetric[]> = new Map()
  private alerts: MetricAlert[] = []
  private alertRules: Map<string, { condition: 'above' | 'below' | 'equals'; threshold: number; severity: 'low' | 'medium' | 'high' | 'critical' }> = new Map()
  
  constructor() {
    this.initializeAlertRules()
    this.startMetricsCollection()
  }

  private initializeAlertRules() {
    // Business metric alerts
    this.alertRules.set('projectCompletionRate', { condition: 'below', threshold: 0.8, severity: 'medium' })
    this.alertRules.set('quoteAcceptanceRate', { condition: 'below', threshold: 0.3, severity: 'high' })
    this.alertRules.set('customerSatisfactionScore', { condition: 'below', threshold: 4.0, severity: 'high' })
    
    // Technical metric alerts
    this.alertRules.set('apiResponseTime', { condition: 'above', threshold: 2000, severity: 'medium' })
    this.alertRules.set('apiErrorRate', { condition: 'above', threshold: 0.05, severity: 'high' })
    this.alertRules.set('cpuUsage', { condition: 'above', threshold: 0.8, severity: 'medium' })
    this.alertRules.set('memoryUsage', { condition: 'above', threshold: 0.85, severity: 'high' })
    this.alertRules.set('diskUsage', { condition: 'above', threshold: 0.9, severity: 'critical' })
    
    // Customer metric alerts
    this.alertRules.set('supportTickets', { condition: 'above', threshold: 50, severity: 'medium' })
    this.alertRules.set('averageResponseTime', { condition: 'above', threshold: 24, severity: 'high' })
    
    // Financial metric alerts
    this.alertRules.set('profitMargin', { condition: 'below', threshold: 0.15, severity: 'high' })
    this.alertRules.set('cashFlow', { condition: 'below', threshold: 0, severity: 'critical' })
  }

  public recordMetric(
    name: string,
    value: number,
    category: 'business' | 'technical' | 'customer' | 'financial' = 'business',
    type: 'counter' | 'gauge' | 'histogram' | 'timer' = 'gauge',
    unit?: string,
    tags?: Record<string, string>,
    metadata?: Record<string, any>
  ): void {
    const metric: PerformanceMetric = {
      id: `${name}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name,
      category,
      type,
      value,
      unit,
      timestamp: new Date().toISOString(),
      tags,
      metadata
    }

    if (!this.metrics.has(name)) {
      this.metrics.set(name, [])
    }

    this.metrics.get(name)!.push(metric)

    // Keep only last 1000 entries per metric to manage memory
    const metricArray = this.metrics.get(name)!
    if (metricArray.length > 1000) {
      metricArray.splice(0, metricArray.length - 1000)
    }

    // Check for alerts
    this.checkAlerts(name, value)
  }

  public getBusinessMetrics(): BusinessMetrics {
    // In real implementation, this would query the database
    // For now, return mock data with some calculated metrics
    const mockData: BusinessMetrics = {
      totalProjects: this.getLatestMetricValue('totalProjects') || 156,
      activeProjects: this.getLatestMetricValue('activeProjects') || 23,
      completedProjects: this.getLatestMetricValue('completedProjects') || 133,
      projectCompletionRate: 0.85,
      averageProjectDuration: 35,
      
      totalQuotes: this.getLatestMetricValue('totalQuotes') || 289,
      quotesAccepted: this.getLatestMetricValue('quotesAccepted') || 156,
      quotesRejected: 45,
      quoteAcceptanceRate: 0.54,
      averageQuoteValue: 185000,
      
      totalRevenue: 28750000,
      monthlyRevenue: 4200000,
      averageProjectRevenue: 184295,
      revenueGrowthRate: 0.28,
      
      totalCustomers: 342,
      newCustomers: 23,
      customerRetentionRate: 0.92,
      customerSatisfactionScore: 4.6,
      
      totalSystemCapacity: 7850, // kW
      averageSystemSize: 50.3, // kW
      monthlyCapacityInstalled: 1150 // kW
    }

    return mockData
  }

  public getTechnicalMetrics(): TechnicalMetrics {
    return {
      apiResponseTime: this.getLatestMetricValue('apiResponseTime') || 450,
      apiSuccessRate: this.getLatestMetricValue('apiSuccessRate') || 0.998,
      apiErrorRate: this.getLatestMetricValue('apiErrorRate') || 0.002,
      apiThroughput: this.getLatestMetricValue('apiThroughput') || 125,
      
      dbQueryTime: this.getLatestMetricValue('dbQueryTime') || 85,
      dbConnectionCount: this.getLatestMetricValue('dbConnectionCount') || 12,
      dbErrorRate: this.getLatestMetricValue('dbErrorRate') || 0.001,
      
      cpuUsage: this.getLatestMetricValue('cpuUsage') || 0.45,
      memoryUsage: this.getLatestMetricValue('memoryUsage') || 0.67,
      diskUsage: this.getLatestMetricValue('diskUsage') || 0.34,
      networkLatency: this.getLatestMetricValue('networkLatency') || 25,
      
      activeUsers: this.getLatestMetricValue('activeUsers') || 18,
      sessionDuration: this.getLatestMetricValue('sessionDuration') || 28,
      pageLoadTime: this.getLatestMetricValue('pageLoadTime') || 1200,
      errorCount: this.getLatestMetricValue('errorCount') || 3
    }
  }

  public getCustomerMetrics(): CustomerMetrics {
    return {
      loginFrequency: this.getLatestMetricValue('loginFrequency') || 3.2,
      featureUsage: {
        'designer': this.getLatestMetricValue('featureUsage.designer') || 245,
        'quotes': this.getLatestMetricValue('featureUsage.quotes') || 189,
        'projects': this.getLatestMetricValue('featureUsage.projects') || 156,
        'monitoring': this.getLatestMetricValue('featureUsage.monitoring') || 134
      },
      supportTickets: this.getLatestMetricValue('supportTickets') || 12,
      averageResponseTime: this.getLatestMetricValue('averageResponseTime') || 4.5,
      
      leadToCustomerRate: this.getLatestMetricValue('leadToCustomerRate') || 0.34,
      quoteToSaleRate: this.getLatestMetricValue('quoteToSaleRate') || 0.54,
      averageConversionTime: this.getLatestMetricValue('averageConversionTime') || 12,
      
      npsScore: this.getLatestMetricValue('npsScore') || 72,
      satisfactionRating: this.getLatestMetricValue('satisfactionRating') || 4.6,
      referralRate: this.getLatestMetricValue('referralRate') || 0.23
    }
  }

  public getFinancialMetrics(): FinancialMetrics {
    return {
      totalRevenue: this.getLatestMetricValue('totalRevenue') || 28750000,
      monthlyRecurringRevenue: this.getLatestMetricValue('monthlyRecurringRevenue') || 450000,
      averageOrderValue: this.getLatestMetricValue('averageOrderValue') || 184295,
      revenuePerCustomer: this.getLatestMetricValue('revenuePerCustomer') || 84064,
      
      customerAcquisitionCost: this.getLatestMetricValue('customerAcquisitionCost') || 2150,
      operatingCosts: this.getLatestMetricValue('operatingCosts') || 3200000,
      profitMargin: this.getLatestMetricValue('profitMargin') || 0.24,
      
      accountsReceivable: this.getLatestMetricValue('accountsReceivable') || 2100000,
      accountsPayable: this.getLatestMetricValue('accountsPayable') || 890000,
      cashFlow: this.getLatestMetricValue('cashFlow') || 1200000
    }
  }

  public getMetricHistory(name: string, hours: number = 24): PerformanceMetric[] {
    const metrics = this.metrics.get(name) || []
    const cutoff = new Date(Date.now() - hours * 60 * 60 * 1000)
    
    return metrics
      .filter(metric => new Date(metric.timestamp) >= cutoff)
      .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
  }

  public getMetricStatistics(name: string, hours: number = 24): {
    current: number
    average: number
    min: number
    max: number
    trend: 'up' | 'down' | 'stable'
    count: number
  } | null {
    const history = this.getMetricHistory(name, hours)
    if (history.length === 0) return null

    const values = history.map(m => m.value)
    const current = values[values.length - 1]
    const average = values.reduce((sum, val) => sum + val, 0) / values.length
    const min = Math.min(...values)
    const max = Math.max(...values)
    
    // Simple trend calculation
    let trend: 'up' | 'down' | 'stable' = 'stable'
    if (values.length > 1) {
      const firstHalf = values.slice(0, Math.floor(values.length / 2))
      const secondHalf = values.slice(Math.floor(values.length / 2))
      const firstAvg = firstHalf.reduce((sum, val) => sum + val, 0) / firstHalf.length
      const secondAvg = secondHalf.reduce((sum, val) => sum + val, 0) / secondHalf.length
      
      if (secondAvg > firstAvg * 1.05) trend = 'up'
      else if (secondAvg < firstAvg * 0.95) trend = 'down'
    }

    return {
      current,
      average,
      min,
      max,
      trend,
      count: values.length
    }
  }

  public getActiveAlerts(): MetricAlert[] {
    return this.alerts.filter(alert => !alert.acknowledged)
  }

  public acknowledgeAlert(alertId: string, userId: string): boolean {
    const alert = this.alerts.find(a => a.id === alertId)
    if (!alert) return false

    alert.acknowledged = true
    alert.acknowledgedBy = userId
    alert.acknowledgedAt = new Date().toISOString()
    
    return true
  }

  public getDashboardData() {
    const business = this.getBusinessMetrics()
    const technical = this.getTechnicalMetrics()
    const customer = this.getCustomerMetrics()
    const financial = this.getFinancialMetrics()
    const alerts = this.getActiveAlerts()

    return {
      summary: {
        totalProjects: business.totalProjects,
        totalRevenue: business.totalRevenue,
        activeUsers: technical.activeUsers,
        systemHealth: this.calculateSystemHealth([
          technical.apiSuccessRate,
          1 - technical.cpuUsage,
          1 - technical.memoryUsage,
          customer.satisfactionRating / 5
        ])
      },
      business,
      technical,
      customer,
      financial,
      alerts: {
        total: alerts.length,
        critical: alerts.filter(a => a.severity === 'critical').length,
        high: alerts.filter(a => a.severity === 'high').length,
        medium: alerts.filter(a => a.severity === 'medium').length,
        low: alerts.filter(a => a.severity === 'low').length,
        recent: alerts.slice(0, 5)
      }
    }
  }

  private getLatestMetricValue(name: string): number | undefined {
    const metrics = this.metrics.get(name)
    if (!metrics || metrics.length === 0) return undefined
    return metrics[metrics.length - 1].value
  }

  private checkAlerts(metricName: string, value: number): void {
    const rule = this.alertRules.get(metricName)
    if (!rule) return

    let triggered = false
    
    switch (rule.condition) {
      case 'above':
        triggered = value > rule.threshold
        break
      case 'below':
        triggered = value < rule.threshold
        break
      case 'equals':
        triggered = value === rule.threshold
        break
    }

    if (triggered) {
      // Check if we already have an active alert for this metric
      const existingAlert = this.alerts.find(
        alert => alert.metricName === metricName && !alert.acknowledged
      )

      if (!existingAlert) {
        const alert: MetricAlert = {
          id: `alert-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          metricName,
          condition: rule.condition,
          threshold: rule.threshold,
          currentValue: value,
          severity: rule.severity,
          message: this.generateAlertMessage(metricName, rule, value),
          timestamp: new Date().toISOString()
        }

        this.alerts.push(alert)
        console.warn(`ALERT: ${alert.message}`)
        
        // In real implementation, send notifications
        this.sendAlertNotification(alert)
      }
    }
  }

  private generateAlertMessage(metricName: string, rule: any, value: number): string {
    const condition = rule.condition === 'above' ? 'exceeded' : 'fell below'
    return `${metricName} ${condition} threshold: ${value} ${rule.condition} ${rule.threshold}`
  }

  private async sendAlertNotification(alert: MetricAlert): Promise<void> {
    // In real implementation, send to monitoring systems, Slack, email, etc.
    console.log(`Would send ${alert.severity} alert notification:`, alert.message)
  }

  private calculateSystemHealth(scores: number[]): number {
    const average = scores.reduce((sum, score) => sum + score, 0) / scores.length
    return Math.round(average * 100)
  }

  private startMetricsCollection(): void {
    // Collect system metrics every minute
    setInterval(() => {
      this.collectSystemMetrics()
    }, 60000) // 1 minute

    // Collect business metrics every 5 minutes
    setInterval(() => {
      this.collectBusinessMetrics()
    }, 300000) // 5 minutes
  }

  private collectSystemMetrics(): void {
    // Mock system metrics collection
    this.recordMetric('cpuUsage', Math.random() * 0.8, 'technical', 'gauge', '%')
    this.recordMetric('memoryUsage', 0.6 + Math.random() * 0.2, 'technical', 'gauge', '%')
    this.recordMetric('diskUsage', 0.3 + Math.random() * 0.1, 'technical', 'gauge', '%')
    this.recordMetric('apiResponseTime', 300 + Math.random() * 400, 'technical', 'timer', 'ms')
    this.recordMetric('activeUsers', 15 + Math.floor(Math.random() * 10), 'technical', 'gauge')
  }

  private collectBusinessMetrics(): void {
    // Mock business metrics collection
    const currentProjects = this.getLatestMetricValue('totalProjects') || 150
    this.recordMetric('totalProjects', currentProjects + Math.floor(Math.random() * 3), 'business', 'counter')
    
    const currentRevenue = this.getLatestMetricValue('totalRevenue') || 28000000
    this.recordMetric('totalRevenue', currentRevenue + Math.floor(Math.random() * 50000), 'business', 'counter', 'TL')
  }

  public exportMetrics(hours: number = 24): any {
    const allMetrics: any = {}
    
    for (const [name, metrics] of this.metrics.entries()) {
      allMetrics[name] = this.getMetricHistory(name, hours)
    }

    return {
      exportedAt: new Date().toISOString(),
      timeRange: `${hours} hours`,
      metrics: allMetrics,
      summary: this.getDashboardData()
    }
  }
}

// Global metrics tracker instance
export const metricsTracker = new PerformanceMetricsTracker()

// Helper functions for common metrics recording
export const recordProjectCreated = () => metricsTracker.recordMetric('projectsCreated', 1, 'business', 'counter')
export const recordQuoteGenerated = (value: number) => metricsTracker.recordMetric('quoteGenerated', value, 'business', 'counter', 'TL')
export const recordApiCall = (responseTime: number, success: boolean) => {
  metricsTracker.recordMetric('apiResponseTime', responseTime, 'technical', 'timer', 'ms')
  metricsTracker.recordMetric('apiSuccess', success ? 1 : 0, 'technical', 'counter')
}
export const recordUserLogin = () => metricsTracker.recordMetric('userLogins', 1, 'customer', 'counter')
export const recordRevenue = (amount: number) => metricsTracker.recordMetric('revenue', amount, 'financial', 'counter', 'TL')

export default metricsTracker