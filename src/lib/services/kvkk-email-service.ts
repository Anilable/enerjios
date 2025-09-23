import { Resend } from 'resend'
import { prisma } from '@/lib/prisma'
import {
  kvkkOverdueNotification,
  kvkkReminderNotification,
  kvkkComplianceReport,
  type KVKKNotificationData
} from '@/lib/email-templates/kvkk-notifications'

class KVKKEmailService {
  private resend: Resend | null = null
  private adminEmails: string[]
  private fromEmail: string

  constructor() {
    this.adminEmails = process.env.KVKK_ADMIN_EMAILS?.split(',') || []
    this.fromEmail = process.env.FROM_EMAIL || 'info@enerjios.com'
    this.initializeResend()
  }

  private initializeResend() {
    if (!process.env.RESEND_API_KEY) {
      console.warn('RESEND_API_KEY missing. Email notifications disabled.')
      return
    }

    this.resend = new Resend(process.env.RESEND_API_KEY)
  }

  // Helper function to calculate response deadline (30 days from submission)
  private calculateResponseDeadline(submittedAt: Date): Date {
    const deadline = new Date(submittedAt)
    deadline.setDate(deadline.getDate() + 30)
    return deadline
  }

  async sendOverdueNotifications(applicationIds: string[]) {
    if (!this.resend || !this.adminEmails.length) {
      console.log('Email service not configured, skipping notifications')
      return { success: false, message: 'Email service not configured' }
    }

    try {
      const applications = await prisma.kVKKApplication.findMany({
        where: {
          id: { in: applicationIds },
          status: { in: ['PENDING', 'IN_REVIEW'] }
        },
        select: {
          id: true,
          applicationNo: true,
          firstName: true,
          lastName: true,
          email: true,
          requestType: true,
          submittedAt: true
        }
      })

      const emailPromises = applications.map(async (app) => {
        const responseDeadline = this.calculateResponseDeadline(app.submittedAt)
        const daysOverdue = Math.ceil(
          (new Date().getTime() - responseDeadline.getTime()) / (1000 * 60 * 60 * 24)
        )

        // Skip if not actually overdue
        if (daysOverdue <= 0) return

        const notificationData: KVKKNotificationData = {
          applicationNo: app.applicationNo,
          applicantName: `${app.firstName} ${app.lastName}`,
          applicantEmail: app.email,
          requestType: app.requestType,
          submittedAt: app.submittedAt.toISOString(),
          responseDeadline: responseDeadline.toISOString(),
          daysOverdue
        }

        const emailContent = kvkkOverdueNotification(notificationData)

        // Send to admin emails using Resend
        for (const adminEmail of this.adminEmails) {
          await this.resend!.emails.send({
            from: this.fromEmail,
            to: adminEmail,
            subject: emailContent.subject,
            html: emailContent.html
          })
        }

        // Log notification
        await prisma.kVKKAuditLog.create({
          data: {
            action: 'OVERDUE_NOTIFICATION_SENT',
            details: {
              applicationId: app.id,
              adminEmails: this.adminEmails,
              daysOverdue,
              notificationType: 'overdue'
            },
            timestamp: new Date()
          }
        })
      })

      await Promise.all(emailPromises)

      return {
        success: true,
        message: `Overdue notifications sent for ${applications.length} applications`
      }
    } catch (error) {
      console.error('Error sending overdue notifications:', error)
      return {
        success: false,
        message: 'Failed to send overdue notifications'
      }
    }
  }

  async sendReminderNotifications(applicationIds: string[]) {
    if (!this.resend || !this.adminEmails.length) {
      console.log('Email service not configured, skipping notifications')
      return { success: false, message: 'Email service not configured' }
    }

    try {
      const applications = await prisma.kVKKApplication.findMany({
        where: {
          id: { in: applicationIds },
          status: { in: ['PENDING', 'IN_REVIEW'] }
        },
        select: {
          id: true,
          applicationNo: true,
          firstName: true,
          lastName: true,
          email: true,
          requestType: true,
          submittedAt: true
        }
      })

      const emailPromises = applications.map(async (app) => {
        const responseDeadline = this.calculateResponseDeadline(app.submittedAt)
        const daysRemaining = Math.ceil(
          (responseDeadline.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
        )

        // Skip if deadline has passed or too far away
        if (daysRemaining <= 0 || daysRemaining > 7) return

        const notificationData: KVKKNotificationData = {
          applicationNo: app.applicationNo,
          applicantName: `${app.firstName} ${app.lastName}`,
          applicantEmail: app.email,
          requestType: app.requestType,
          submittedAt: app.submittedAt.toISOString(),
          responseDeadline: responseDeadline.toISOString(),
          daysRemaining
        }

        const emailContent = kvkkReminderNotification(notificationData)

        // Send to admin emails using Resend
        for (const adminEmail of this.adminEmails) {
          await this.resend!.emails.send({
            from: this.fromEmail,
            to: adminEmail,
            subject: emailContent.subject,
            html: emailContent.html
          })
        }

        // Log notification
        await prisma.kVKKAuditLog.create({
          data: {
            action: 'REMINDER_NOTIFICATION_SENT',
            details: {
              applicationId: app.id,
              adminEmails: this.adminEmails,
              daysRemaining,
              notificationType: 'reminder'
            },
            timestamp: new Date()
          }
        })
      })

      await Promise.all(emailPromises)

      return {
        success: true,
        message: `Reminder notifications sent for ${applications.length} applications`
      }
    } catch (error) {
      console.error('Error sending reminder notifications:', error)
      return {
        success: false,
        message: 'Failed to send reminder notifications'
      }
    }
  }

  async sendDailyComplianceReport() {
    if (!this.resend || !this.adminEmails.length) {
      console.log('Email service not configured, skipping report')
      return { success: false, message: 'Email service not configured' }
    }

    try {
      const now = new Date()

      // Get all pending applications and calculate their deadlines
      const allPendingApplications = await prisma.kVKKApplication.findMany({
        where: {
          status: { in: ['PENDING', 'IN_REVIEW'] }
        },
        select: {
          id: true,
          submittedAt: true
        }
      })

      // Calculate overdue and due soon counts
      let overdueCount = 0
      let dueSoonCount = 0

      allPendingApplications.forEach(app => {
        const deadline = this.calculateResponseDeadline(app.submittedAt)
        const daysUntilDeadline = Math.ceil(
          (deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
        )

        if (daysUntilDeadline < 0) {
          overdueCount++
        } else if (daysUntilDeadline <= 7) {
          dueSoonCount++
        }
      })

      // Get other stats
      const [
        totalPendingApplications,
        avgResponseTime,
        complianceStats
      ] = await Promise.all([
        prisma.kVKKApplication.count({
          where: {
            status: { in: ['PENDING', 'IN_REVIEW'] }
          }
        }),
        prisma.$queryRaw`
          SELECT AVG(EXTRACT(DAY FROM ("processedAt" - "submittedAt"))) as avg_days
          FROM "KVKKApplication"
          WHERE status = 'COMPLETED' AND "processedAt" IS NOT NULL
        `,
        prisma.$queryRaw`
          SELECT
            COUNT(*) as total,
            COUNT(CASE
              WHEN status = 'COMPLETED' AND "processedAt" <= ("submittedAt" + INTERVAL '30 days')
              THEN 1
            END) as on_time
          FROM "KVKKApplication"
          WHERE "submittedAt" >= NOW() - INTERVAL '30 days'
        `
      ])

      const avgDays = Array.isArray(avgResponseTime) && avgResponseTime[0]?.avg_days
        ? Math.round(Number(avgResponseTime[0].avg_days))
        : 0

      const stats = Array.isArray(complianceStats) ? complianceStats[0] as any : { total: 0, on_time: 0 }
      const complianceRate = Number(stats.total) > 0
        ? Math.round((Number(stats.on_time) / Number(stats.total)) * 100)
        : 100

      const reportData = {
        overdueCount,
        dueSoonCount,
        complianceRate,
        totalPending: totalPendingApplications,
        avgResponseDays: avgDays
      }

      const emailContent = kvkkComplianceReport(reportData)

      // Send to admin emails using Resend
      for (const adminEmail of this.adminEmails) {
        await this.resend!.emails.send({
          from: this.fromEmail,
          to: adminEmail,
          subject: emailContent.subject,
          html: emailContent.html
        })
      }

      // Log report sending
      await prisma.kVKKAuditLog.create({
        data: {
          action: 'COMPLIANCE_REPORT_SENT',
          details: {
            adminEmails: this.adminEmails,
            reportData,
            reportType: 'daily_compliance'
          },
          timestamp: new Date()
        }
      })

      return {
        success: true,
        message: 'Daily compliance report sent successfully'
      }
    } catch (error) {
      console.error('Error sending compliance report:', error)
      return {
        success: false,
        message: 'Failed to send compliance report'
      }
    }
  }

  async testEmailConfiguration() {
    if (!this.resend) {
      return { success: false, message: 'Resend API not configured' }
    }

    try {
      // Test by checking if all required configurations are present
      if (process.env.RESEND_API_KEY && this.fromEmail && this.adminEmails.length > 0) {
        return {
          success: true,
          message: `Resend API configured with ${this.fromEmail}, ${this.adminEmails.length} admin emails`
        }
      } else {
        return {
          success: false,
          message: 'Missing RESEND_API_KEY, FROM_EMAIL, or KVKK_ADMIN_EMAILS'
        }
      }
    } catch (error) {
      console.error('Email configuration test failed:', error)
      return { success: false, message: 'Email configuration test failed' }
    }
  }
}

export const kvkkEmailService = new KVKKEmailService()