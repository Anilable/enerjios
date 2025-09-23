import { prisma } from '@/lib/prisma'

interface ComplianceMetrics {
  totalApplications: number
  completedOnTime: number
  completedLate: number
  stillPending: number
  overdueCount: number
  avgResponseDays: number
  complianceScore: number
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
  recommendations: string[]
}

interface ComplianceTrend {
  date: string
  score: number
  totalApplications: number
  overdueCount: number
}

export class KVKKComplianceAutomation {

  // Helper function to calculate response deadline (30 days from submission)
  private calculateResponseDeadline(submittedAt: Date): Date {
    const deadline = new Date(submittedAt)
    deadline.setDate(deadline.getDate() + 30)
    return deadline
  }

  async calculateComplianceScore(periodDays: number = 30): Promise<ComplianceMetrics> {
    const now = new Date()
    const periodStart = new Date(now.getTime() - periodDays * 24 * 60 * 60 * 1000)

    try {
      // Get comprehensive application data for the period
      const [applications, avgResponseData] = await Promise.all([
        prisma.kVKKApplication.findMany({
          where: {
            submittedAt: { gte: periodStart }
          },
          select: {
            id: true,
            status: true,
            submittedAt: true,
            processedAt: true
          }
        }),
        prisma.$queryRaw`
          SELECT AVG(EXTRACT(DAY FROM ("processedAt" - "submittedAt"))) as avg_days
          FROM "KVKKApplication"
          WHERE status = 'COMPLETED'
            AND "processedAt" IS NOT NULL
            AND "submittedAt" >= ${periodStart}
        `
      ])

      const totalApplications = applications.length

      // Calculate completion metrics
      const completedOnTime = applications.filter(app => {
        if (app.status !== 'COMPLETED' || !app.processedAt) return false
        const deadline = this.calculateResponseDeadline(app.submittedAt)
        return app.processedAt <= deadline
      }).length

      const completedLate = applications.filter(app => {
        if (app.status !== 'COMPLETED' || !app.processedAt) return false
        const deadline = this.calculateResponseDeadline(app.submittedAt)
        return app.processedAt > deadline
      }).length

      const stillPending = applications.filter(app =>
        ['PENDING', 'IN_REVIEW'].includes(app.status)
      ).length

      const overdueCount = applications.filter(app => {
        if (!['PENDING', 'IN_REVIEW'].includes(app.status)) return false
        const deadline = this.calculateResponseDeadline(app.submittedAt)
        return deadline < now
      }).length

      // Calculate average response time
      const avgDays = Array.isArray(avgResponseData) && avgResponseData[0]?.avg_days
        ? Math.round(Number(avgResponseData[0].avg_days))
        : 0

      // Calculate compliance score
      let complianceScore = 100

      if (totalApplications > 0) {
        const onTimeRate = completedOnTime / (completedOnTime + completedLate)
        const overdueRate = overdueCount / totalApplications

        // Base score on on-time completion rate
        complianceScore = Math.round(onTimeRate * 100)

        // Penalty for overdue applications
        complianceScore -= Math.round(overdueRate * 50)

        // Penalty for high average response time
        if (avgDays > 25) complianceScore -= 10
        if (avgDays > 30) complianceScore -= 10

        // Ensure score doesn't go below 0
        complianceScore = Math.max(0, complianceScore)
      }

      // Determine risk level
      const riskLevel = this.determineRiskLevel(complianceScore, overdueCount, avgDays)

      // Generate recommendations
      const recommendations = this.generateRecommendations({
        complianceScore,
        overdueCount,
        avgDays,
        stillPending,
        totalApplications
      })

      const metrics: ComplianceMetrics = {
        totalApplications,
        completedOnTime,
        completedLate,
        stillPending,
        overdueCount,
        avgResponseDays: avgDays,
        complianceScore,
        riskLevel,
        recommendations
      }

      // Store compliance metrics in database
      await this.storeComplianceMetrics(metrics, periodDays)

      return metrics

    } catch (error) {
      console.error('Error calculating compliance score:', error)
      throw new Error('Compliance score calculation failed')
    }
  }

  private determineRiskLevel(score: number, overdueCount: number, avgDays: number): 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' {
    if (overdueCount > 5 || score < 50) return 'CRITICAL'
    if (overdueCount > 2 || score < 70 || avgDays > 25) return 'HIGH'
    if (overdueCount > 0 || score < 85 || avgDays > 20) return 'MEDIUM'
    return 'LOW'
  }

  private generateRecommendations(metrics: {
    complianceScore: number
    overdueCount: number
    avgDays: number
    stillPending: number
    totalApplications: number
  }): string[] {
    const recommendations: string[] = []

    if (metrics.overdueCount > 0) {
      recommendations.push(`${metrics.overdueCount} süresi geçen başvuru için acil müdahale gerekli`)
    }

    if (metrics.complianceScore < 70) {
      recommendations.push('Düşük uyumluluk skoru - süreç iyileştirmesi kritik')
    }

    if (metrics.avgDays > 25) {
      recommendations.push('Yüksek ortalama yanıt süresi - kaynak artırımı önerili')
    }

    if (metrics.stillPending > 10) {
      recommendations.push('Yüksek bekleyen başvuru sayısı - iş akışı optimizasyonu gerekli')
    }

    if (metrics.complianceScore >= 90) {
      recommendations.push('Mükemmel uyumluluk performansı - mevcut süreçleri koruyun')
    }

    if (recommendations.length === 0) {
      recommendations.push('Genel uyumluluk durumu tatmin edici')
    }

    return recommendations
  }

  private async storeComplianceMetrics(metrics: ComplianceMetrics, periodDays: number) {
    try {
      // Create or update compliance record
      await prisma.kVKKAuditLog.create({
        data: {
          action: 'COMPLIANCE_METRICS_CALCULATED',
          details: {
            ...metrics,
            periodDays,
            calculatedAt: new Date().toISOString()
          },
          timestamp: new Date()
        }
      })
    } catch (error) {
      console.error('Error storing compliance metrics:', error)
    }
  }

  async getComplianceTrend(days: number = 30): Promise<ComplianceTrend[]> {
    try {
      const endDate = new Date()
      const startDate = new Date(endDate.getTime() - days * 24 * 60 * 60 * 1000)

      // Get daily compliance data with calculated deadlines
      const dailyMetrics = await prisma.$queryRaw`
        SELECT
          DATE("submittedAt") as date,
          COUNT(*) as total_applications,
          COUNT(CASE
            WHEN status = 'COMPLETED' AND "processedAt" <= ("submittedAt" + INTERVAL '30 days')
            THEN 1
          END) as on_time,
          COUNT(CASE
            WHEN status IN ('PENDING', 'IN_REVIEW') AND ("submittedAt" + INTERVAL '30 days') < NOW()
            THEN 1
          END) as overdue
        FROM "KVKKApplication"
        WHERE "submittedAt" >= ${startDate}
        GROUP BY DATE("submittedAt")
        ORDER BY DATE("submittedAt")
      `

      const trend: ComplianceTrend[] = []

      if (Array.isArray(dailyMetrics)) {
        for (const metric of dailyMetrics) {
          const data = metric as any
          const score = Number(data.total_applications) > 0
            ? Math.round((Number(data.on_time) / Number(data.total_applications)) * 100)
            : 100

          trend.push({
            date: data.date,
            score,
            totalApplications: Number(data.total_applications),
            overdueCount: Number(data.overdue)
          })
        }
      }

      return trend
    } catch (error) {
      console.error('Error getting compliance trend:', error)
      return []
    }
  }

  async generateAutomatedReport(): Promise<{
    summary: ComplianceMetrics
    trend: ComplianceTrend[]
    criticalIssues: any[]
    actionItems: any[]
  }> {
    try {
      // Get current metrics
      const summary = await this.calculateComplianceScore(30)

      // Get trend data
      const trend = await this.getComplianceTrend(30)

      // Get critical issues (overdue applications)
      const now = new Date()
      const allApplications = await prisma.kVKKApplication.findMany({
        where: {
          status: { in: ['PENDING', 'IN_REVIEW'] }
        },
        select: {
          id: true,
          applicationNo: true,
          firstName: true,
          lastName: true,
          requestType: true,
          submittedAt: true
        },
        orderBy: { submittedAt: 'asc' }
      })

      // Filter for overdue applications
      const criticalIssues = allApplications
        .filter(app => {
          const deadline = this.calculateResponseDeadline(app.submittedAt)
          return deadline < now
        })
        .slice(0, 10)
        .map(app => ({
          ...app,
          applicantName: `${app.firstName} ${app.lastName}`,
          responseDeadline: this.calculateResponseDeadline(app.submittedAt)
        }))

      // Generate action items
      const actionItems = [
        ...(summary.overdueCount > 0 ? [{
          priority: 'CRITICAL',
          title: 'Süresi Geçen Başvurular',
          description: `${summary.overdueCount} başvuru için acil müdahale`,
          action: 'immediate_review'
        }] : []),
        ...(summary.avgResponseDays > 25 ? [{
          priority: 'HIGH',
          title: 'Yanıt Süresi Optimizasyonu',
          description: `Ortalama ${summary.avgResponseDays} gün - hedef maksimum 20 gün`,
          action: 'process_improvement'
        }] : []),
        ...(summary.complianceScore < 85 ? [{
          priority: 'MEDIUM',
          title: 'Uyumluluk Skoru İyileştirmesi',
          description: `Mevcut skor %${summary.complianceScore} - hedef minimum %85`,
          action: 'compliance_review'
        }] : [])
      ]

      return {
        summary,
        trend,
        criticalIssues,
        actionItems
      }
    } catch (error) {
      console.error('Error generating automated report:', error)
      throw new Error('Automated report generation failed')
    }
  }
}

export const kvkkComplianceAutomation = new KVKKComplianceAutomation()