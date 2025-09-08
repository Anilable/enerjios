export type ActivityType = 
  | 'project_created'
  | 'project_updated'
  | 'project_status_changed'
  | 'quote_generated'
  | 'quote_sent'
  | 'quote_approved'
  | 'quote_rejected'
  | 'customer_contacted'
  | 'email_sent'
  | 'sms_sent'
  | 'document_uploaded'
  | 'document_downloaded'
  | 'payment_received'
  | 'installation_scheduled'
  | 'installation_completed'
  | 'system_issue'
  | 'maintenance_scheduled'
  | 'user_login'
  | 'user_action'
  | 'api_call'
  | 'system_notification'

export type ActivityLevel = 'low' | 'medium' | 'high' | 'critical'

export interface ActivityLog {
  id: string
  type: ActivityType
  level: ActivityLevel
  title: string
  description?: string
  entityType?: 'project' | 'customer' | 'quote' | 'user' | 'system'
  entityId?: string
  userId?: string
  userName?: string
  userRole?: string
  ipAddress?: string
  userAgent?: string
  metadata?: Record<string, any>
  timestamp: string
  sessionId?: string
  requestId?: string
}

export interface ActivityFilter {
  type?: ActivityType[]
  level?: ActivityLevel[]
  entityType?: string
  entityId?: string
  userId?: string
  dateFrom?: string
  dateTo?: string
  search?: string
  limit?: number
  offset?: number
}

export interface ActivityStatistics {
  totalActivities: number
  byType: Record<ActivityType, number>
  byLevel: Record<ActivityLevel, number>
  byUser: Record<string, number>
  byDay: { date: string; count: number }[]
  topActivities: { type: ActivityType; count: number }[]
  recentActivities: ActivityLog[]
}

class ActivityLogger {
  private activities: ActivityLog[] = []
  private maxActivities: number = 10000 // Keep last 10k activities in memory

  public async log(activity: Omit<ActivityLog, 'id' | 'timestamp'>): Promise<ActivityLog> {
    const logEntry: ActivityLog = {
      ...activity,
      id: `activity-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString()
    }

    // Add to memory store
    this.activities.unshift(logEntry)
    
    // Keep only the latest activities
    if (this.activities.length > this.maxActivities) {
      this.activities = this.activities.slice(0, this.maxActivities)
    }

    // In real implementation, persist to database
    await this.persistToDatabase(logEntry)

    // Check for critical activities and send alerts
    if (logEntry.level === 'critical') {
      await this.handleCriticalActivity(logEntry)
    }

    return logEntry
  }

  public async logProjectActivity(
    projectId: string,
    type: ActivityType,
    title: string,
    description?: string,
    userId?: string,
    userName?: string,
    metadata?: Record<string, any>
  ): Promise<ActivityLog> {
    return await this.log({
      type,
      level: this.getDefaultLevel(type),
      title,
      description,
      entityType: 'project',
      entityId: projectId,
      userId,
      userName,
      metadata
    })
  }

  public async logCustomerActivity(
    customerId: string,
    type: ActivityType,
    title: string,
    description?: string,
    userId?: string,
    userName?: string,
    metadata?: Record<string, any>
  ): Promise<ActivityLog> {
    return await this.log({
      type,
      level: this.getDefaultLevel(type),
      title,
      description,
      entityType: 'customer',
      entityId: customerId,
      userId,
      userName,
      metadata
    })
  }

  public async logUserActivity(
    userId: string,
    type: ActivityType,
    title: string,
    description?: string,
    ipAddress?: string,
    userAgent?: string,
    metadata?: Record<string, any>
  ): Promise<ActivityLog> {
    return await this.log({
      type,
      level: this.getDefaultLevel(type),
      title,
      description,
      entityType: 'user',
      entityId: userId,
      userId,
      ipAddress,
      userAgent,
      metadata
    })
  }

  public async logSystemActivity(
    type: ActivityType,
    title: string,
    description?: string,
    level: ActivityLevel = 'medium',
    metadata?: Record<string, any>
  ): Promise<ActivityLog> {
    return await this.log({
      type,
      level,
      title,
      description,
      entityType: 'system',
      metadata
    })
  }

  public async logAPICall(
    endpoint: string,
    method: string,
    statusCode: number,
    userId?: string,
    responseTime?: number,
    ipAddress?: string,
    userAgent?: string
  ): Promise<ActivityLog> {
    const level: ActivityLevel = statusCode >= 500 ? 'high' : statusCode >= 400 ? 'medium' : 'low'
    
    return await this.log({
      type: 'api_call',
      level,
      title: `API Call: ${method} ${endpoint}`,
      description: `Status: ${statusCode}${responseTime ? `, Response time: ${responseTime}ms` : ''}`,
      entityType: 'system',
      userId,
      ipAddress,
      userAgent,
      metadata: {
        endpoint,
        method,
        statusCode,
        responseTime
      }
    })
  }

  public getActivities(filter?: ActivityFilter): ActivityLog[] {
    let filtered = [...this.activities]

    if (filter) {
      if (filter.type && filter.type.length > 0) {
        filtered = filtered.filter(activity => filter.type!.includes(activity.type))
      }

      if (filter.level && filter.level.length > 0) {
        filtered = filtered.filter(activity => filter.level!.includes(activity.level))
      }

      if (filter.entityType) {
        filtered = filtered.filter(activity => activity.entityType === filter.entityType)
      }

      if (filter.entityId) {
        filtered = filtered.filter(activity => activity.entityId === filter.entityId)
      }

      if (filter.userId) {
        filtered = filtered.filter(activity => activity.userId === filter.userId)
      }

      if (filter.dateFrom) {
        filtered = filtered.filter(activity => activity.timestamp >= filter.dateFrom!)
      }

      if (filter.dateTo) {
        filtered = filtered.filter(activity => activity.timestamp <= filter.dateTo!)
      }

      if (filter.search) {
        const searchLower = filter.search.toLowerCase()
        filtered = filtered.filter(activity =>
          activity.title.toLowerCase().includes(searchLower) ||
          activity.description?.toLowerCase().includes(searchLower) ||
          activity.userName?.toLowerCase().includes(searchLower)
        )
      }

      if (filter.offset) {
        filtered = filtered.slice(filter.offset)
      }

      if (filter.limit) {
        filtered = filtered.slice(0, filter.limit)
      }
    }

    return filtered
  }

  public getActivityById(activityId: string): ActivityLog | undefined {
    return this.activities.find(activity => activity.id === activityId)
  }

  public getStatistics(dateFrom?: string, dateTo?: string): ActivityStatistics {
    let activities = this.activities

    if (dateFrom || dateTo) {
      activities = activities.filter(activity => {
        if (dateFrom && activity.timestamp < dateFrom) return false
        if (dateTo && activity.timestamp > dateTo) return false
        return true
      })
    }

    // By type
    const byType = activities.reduce((acc, activity) => {
      acc[activity.type] = (acc[activity.type] || 0) + 1
      return acc
    }, {} as Record<ActivityType, number>)

    // By level
    const byLevel = activities.reduce((acc, activity) => {
      acc[activity.level] = (acc[activity.level] || 0) + 1
      return acc
    }, {} as Record<ActivityLevel, number>)

    // By user
    const byUser = activities.reduce((acc, activity) => {
      if (activity.userName) {
        acc[activity.userName] = (acc[activity.userName] || 0) + 1
      }
      return acc
    }, {} as Record<string, number>)

    // By day (last 30 days)
    const byDay: { date: string; count: number }[] = []
    const now = new Date()
    for (let i = 29; i >= 0; i--) {
      const date = new Date(now)
      date.setDate(date.getDate() - i)
      const dateStr = date.toISOString().split('T')[0]
      
      const count = activities.filter(activity => 
        activity.timestamp.split('T')[0] === dateStr
      ).length
      
      byDay.push({ date: dateStr, count })
    }

    // Top activities
    const topActivities = Object.entries(byType)
      .map(([type, count]) => ({ type: type as ActivityType, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10)

    // Recent activities (last 10)
    const recentActivities = activities.slice(0, 10)

    return {
      totalActivities: activities.length,
      byType,
      byLevel,
      byUser,
      byDay,
      topActivities,
      recentActivities
    }
  }

  public getProjectTimeline(projectId: string): ActivityLog[] {
    return this.activities
      .filter(activity => activity.entityType === 'project' && activity.entityId === projectId)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
  }

  public getCustomerHistory(customerId: string): ActivityLog[] {
    return this.activities
      .filter(activity => activity.entityType === 'customer' && activity.entityId === customerId)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
  }

  public getUserActivity(userId: string, limit: number = 50): ActivityLog[] {
    return this.activities
      .filter(activity => activity.userId === userId)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, limit)
  }

  public async cleanup(olderThanDays: number = 90): Promise<number> {
    const cutoffDate = new Date()
    cutoffDate.setDate(cutoffDate.getDate() - olderThanDays)
    const cutoffISOString = cutoffDate.toISOString()

    const initialCount = this.activities.length
    this.activities = this.activities.filter(activity => activity.timestamp >= cutoffISOString)
    const removedCount = initialCount - this.activities.length

    // In real implementation, also cleanup database
    await this.cleanupDatabase(cutoffISOString)

    return removedCount
  }

  public exportActivities(filter?: ActivityFilter, format: 'json' | 'csv' = 'json'): string {
    const activities = this.getActivities(filter)

    if (format === 'csv') {
      const headers = [
        'ID', 'Type', 'Level', 'Title', 'Description', 'Entity Type', 'Entity ID',
        'User Name', 'User Role', 'Timestamp', 'IP Address'
      ]
      
      const rows = activities.map(activity => [
        activity.id,
        activity.type,
        activity.level,
        activity.title,
        activity.description || '',
        activity.entityType || '',
        activity.entityId || '',
        activity.userName || '',
        activity.userRole || '',
        activity.timestamp,
        activity.ipAddress || ''
      ])

      return [headers, ...rows].map(row => 
        row.map(field => `"${String(field).replace(/"/g, '""')}"`).join(',')
      ).join('\n')
    }

    return JSON.stringify(activities, null, 2)
  }

  private getDefaultLevel(type: ActivityType): ActivityLevel {
    const levelMap: Record<ActivityType, ActivityLevel> = {
      'project_created': 'medium',
      'project_updated': 'low',
      'project_status_changed': 'medium',
      'quote_generated': 'medium',
      'quote_sent': 'medium',
      'quote_approved': 'high',
      'quote_rejected': 'medium',
      'customer_contacted': 'low',
      'email_sent': 'low',
      'sms_sent': 'low',
      'document_uploaded': 'low',
      'document_downloaded': 'low',
      'payment_received': 'high',
      'installation_scheduled': 'high',
      'installation_completed': 'high',
      'system_issue': 'critical',
      'maintenance_scheduled': 'medium',
      'user_login': 'low',
      'user_action': 'low',
      'api_call': 'low',
      'system_notification': 'medium'
    }

    return levelMap[type] || 'medium'
  }

  private async persistToDatabase(activity: ActivityLog): Promise<void> {
    // In real implementation, save to database
    // await db.activities.create({ data: activity })
    console.log('Activity logged:', {
      id: activity.id,
      type: activity.type,
      title: activity.title,
      timestamp: activity.timestamp
    })
  }

  private async cleanupDatabase(cutoffDate: string): Promise<void> {
    // In real implementation, cleanup database
    // await db.activities.deleteMany({ where: { timestamp: { lt: cutoffDate } } })
    console.log(`Would cleanup database activities older than ${cutoffDate}`)
  }

  private async handleCriticalActivity(activity: ActivityLog): Promise<void> {
    // Send alerts for critical activities
    console.warn('CRITICAL ACTIVITY:', activity)
    
    // In real implementation:
    // - Send email/SMS to administrators
    // - Create Slack/Teams notification
    // - Log to external monitoring system
    // - Create incident ticket
  }
}

// Pre-configured activity types with descriptions
export const ACTIVITY_DESCRIPTIONS: Record<ActivityType, string> = {
  'project_created': 'Yeni proje oluşturuldu',
  'project_updated': 'Proje güncellendi',
  'project_status_changed': 'Proje durumu değiştirildi',
  'quote_generated': 'Teklif oluşturuldu',
  'quote_sent': 'Teklif gönderildi',
  'quote_approved': 'Teklif onaylandı',
  'quote_rejected': 'Teklif reddedildi',
  'customer_contacted': 'Müşteri ile iletişim kuruldu',
  'email_sent': 'E-posta gönderildi',
  'sms_sent': 'SMS gönderildi',
  'document_uploaded': 'Belge yüklendi',
  'document_downloaded': 'Belge indirildi',
  'payment_received': 'Ödeme alındı',
  'installation_scheduled': 'Kurulum planlandı',
  'installation_completed': 'Kurulum tamamlandı',
  'system_issue': 'Sistem sorunu',
  'maintenance_scheduled': 'Bakım planlandı',
  'user_login': 'Kullanıcı girişi',
  'user_action': 'Kullanıcı eylemi',
  'api_call': 'API çağrısı',
  'system_notification': 'Sistem bildirimi'
}

export const LEVEL_COLORS: Record<ActivityLevel, string> = {
  'low': 'text-gray-600',
  'medium': 'text-blue-600',
  'high': 'text-orange-600',
  'critical': 'text-red-600'
}

export const TYPE_ICONS: Record<ActivityType, string> = {
  'project_created': '📁',
  'project_updated': '✏️',
  'project_status_changed': '🔄',
  'quote_generated': '💰',
  'quote_sent': '📤',
  'quote_approved': '✅',
  'quote_rejected': '❌',
  'customer_contacted': '📞',
  'email_sent': '📧',
  'sms_sent': '💬',
  'document_uploaded': '📎',
  'document_downloaded': '⬇️',
  'payment_received': '💳',
  'installation_scheduled': '📅',
  'installation_completed': '🔧',
  'system_issue': '⚠️',
  'maintenance_scheduled': '🛠️',
  'user_login': '👤',
  'user_action': '🖱️',
  'api_call': '🔌',
  'system_notification': '🔔'
}

// Global activity logger instance
export const activityLogger = new ActivityLogger()

// Helper functions for common logging patterns
export const logProjectCreate = (projectId: string, projectTitle: string, userId?: string, userName?: string) =>
  activityLogger.logProjectActivity(
    projectId,
    'project_created',
    `Proje oluşturuldu: ${projectTitle}`,
    `${projectTitle} projesi ${userName || 'sistem'} tarafından oluşturuldu`,
    userId,
    userName
  )

export const logProjectStatusChange = (
  projectId: string, 
  projectTitle: string, 
  oldStatus: string, 
  newStatus: string, 
  userId?: string, 
  userName?: string
) =>
  activityLogger.logProjectActivity(
    projectId,
    'project_status_changed',
    `Proje durumu değiştirildi: ${oldStatus} → ${newStatus}`,
    `${projectTitle} projesinin durumu ${oldStatus} durumundan ${newStatus} durumuna değiştirildi`,
    userId,
    userName,
    { oldStatus, newStatus }
  )

export const logQuoteApproval = (projectId: string, quoteId: string, amount: number, userId?: string, userName?: string) =>
  activityLogger.logProjectActivity(
    projectId,
    'quote_approved',
    `Teklif onaylandı: ₺${amount.toLocaleString('tr-TR')}`,
    `${quoteId} numaralı teklif ${userName || 'müşteri'} tarafından onaylandı`,
    userId,
    userName,
    { quoteId, amount }
  )

export const logPaymentReceived = (projectId: string, amount: number, paymentMethod: string, userId?: string) =>
  activityLogger.logProjectActivity(
    projectId,
    'payment_received',
    `Ödeme alındı: ₺${amount.toLocaleString('tr-TR')}`,
    `${paymentMethod} ile ₺${amount.toLocaleString('tr-TR')} ödeme alındı`,
    userId,
    undefined,
    { amount, paymentMethod }
  )

export default activityLogger