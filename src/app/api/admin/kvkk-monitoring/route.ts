import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { kvkkEmailService } from '@/lib/services/kvkk-email-service'
import { kvkkComplianceAutomation } from '@/lib/services/kvkk-compliance-automation'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({
        success: false,
        message: 'Yetkisiz erişim'
      }, { status: 401 })
    }

    const now = new Date()

    // Monitoring queries
    const [
      overdueApplications,
      dueSoonApplications,
      totalPendingApplications,
      avgResponseTime,
      complianceStats
    ] = await Promise.all([
      // Overdue applications (past deadline)
      prisma.kVKKApplication.findMany({
        where: {
          responseDeadline: { lt: now },
          status: { in: ['PENDING', 'IN_PROGRESS'] }
        },
        select: {
          id: true,
          applicationNo: true,
          applicantName: true,
          applicantEmail: true,
          requestType: true,
          submittedAt: true,
          responseDeadline: true,
          status: true
        },
        orderBy: { responseDeadline: 'asc' }
      }),

      // Due soon applications (within 7 days)
      prisma.kVKKApplication.findMany({
        where: {
          responseDeadline: {
            gte: now,
            lte: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000) // 7 days from now
          },
          status: { in: ['PENDING', 'IN_PROGRESS'] }
        },
        select: {
          id: true,
          applicationNo: true,
          applicantName: true,
          applicantEmail: true,
          requestType: true,
          submittedAt: true,
          responseDeadline: true,
          status: true
        },
        orderBy: { responseDeadline: 'asc' }
      }),

      // Total pending applications
      prisma.kVKKApplication.count({
        where: {
          status: { in: ['PENDING', 'IN_PROGRESS'] }
        }
      }),

      // Average response time for completed applications
      prisma.$queryRaw<{ avg_days: number | null }[]>`
        SELECT AVG(EXTRACT(DAY FROM ("processedAt" - "submittedAt"))) as avg_days
        FROM "KVKKApplication"
        WHERE status = 'COMPLETED' AND "processedAt" IS NOT NULL
      `,

      // Compliance statistics
      prisma.$queryRaw<{
        total: bigint;
        on_time: bigint;
        late: bigint;
        overdue_pending: bigint;
      }[]>`
        SELECT
          COUNT(*) as total,
          COUNT(CASE WHEN status = 'COMPLETED' AND "processedAt" <= "responseDeadline" THEN 1 END) as on_time,
          COUNT(CASE WHEN status = 'COMPLETED' AND "processedAt" > "responseDeadline" THEN 1 END) as late,
          COUNT(CASE WHEN status IN ('PENDING', 'IN_PROGRESS') AND "responseDeadline" < NOW() THEN 1 END) as overdue_pending
        FROM "KVKKApplication"
        WHERE "submittedAt" >= NOW() - INTERVAL '90 days'
      `
    ])

    // Calculate metrics
    const overdueCount = overdueApplications.length
    const dueSoonCount = dueSoonApplications.length
    const avgDays = avgResponseTime[0]?.avg_days ? Math.round(Number(avgResponseTime[0].avg_days)) : 0

    const stats = complianceStats[0]
    const complianceRate = stats && Number(stats.total) > 0
      ? Math.round((Number(stats.on_time) / Number(stats.total)) * 100)
      : 100

    // Create monitoring alerts
    const alerts = []

    if (overdueCount > 0) {
      alerts.push({
        type: 'critical',
        title: 'Süresi Geçen Başvurular',
        message: `${overdueCount} başvurunun yasal süresi geçmiş`,
        count: overdueCount,
        action: 'Acil müdahale gerekli'
      })
    }

    if (dueSoonCount > 0) {
      alerts.push({
        type: 'warning',
        title: 'Yaklaşan Süreler',
        message: `${dueSoonCount} başvurunun süresi 7 gün içinde dolacak`,
        count: dueSoonCount,
        action: 'Öncelik verilmeli'
      })
    }

    if (complianceRate < 90) {
      alerts.push({
        type: 'warning',
        title: 'Düşük Uyumluluk Oranı',
        message: `Son 90 günde uyumluluk oranı %${complianceRate}`,
        count: complianceRate,
        action: 'Süreç iyileştirmesi önerilir'
      })
    }

    if (avgDays > 25) {
      alerts.push({
        type: 'info',
        title: 'Yüksek Ortalama Yanıt Süresi',
        message: `Ortalama yanıt süresi ${avgDays} gün`,
        count: avgDays,
        action: 'Süreç optimizasyonu önerilir'
      })
    }

    // Create recommendations
    const recommendations = []

    if (overdueCount > 0) {
      recommendations.push({
        priority: 'high',
        title: 'Acil Eylem Gerekli',
        description: 'Süresi geçen başvuruları hemen değerlendirin',
        action: 'view_overdue'
      })
    }

    if (totalPendingApplications > 10) {
      recommendations.push({
        priority: 'medium',
        title: 'Yüksek Başvuru Sayısı',
        description: 'Bekleyen başvuru sayısı normalin üzerinde',
        action: 'increase_capacity'
      })
    }

    if (complianceRate < 95) {
      recommendations.push({
        priority: 'medium',
        title: 'Uyumluluk İyileştirmesi',
        description: 'Süreç standardizasyonu ve otomasyon önerilir',
        action: 'improve_process'
      })
    }

    return NextResponse.json({
      success: true,
      monitoring: {
        overview: {
          overdueCount,
          dueSoonCount,
          totalPendingApplications,
          avgResponseDays: avgDays,
          complianceRate
        },
        alerts,
        recommendations,
        overdueApplications,
        dueSoonApplications,
        lastUpdated: now.toISOString()
      }
    })

  } catch (error) {
    console.error('KVKK Monitoring Error:', error)

    return NextResponse.json({
      success: false,
      message: 'Monitoring verisi alınırken hata oluştu'
    }, { status: 500 })
  }
}

// Auto-escalation endpoint
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({
        success: false,
        message: 'Yetkisiz erişim'
      }, { status: 401 })
    }

    const { action, applicationIds } = await request.json()

    switch (action) {
      case 'escalate_overdue':
        // Mark overdue applications for escalation
        await prisma.kVKKApplication.updateMany({
          where: {
            id: { in: applicationIds },
            status: { in: ['PENDING', 'IN_PROGRESS'] }
          },
          data: {
            // Add escalation flag or update status
            // You could add an escalated field to the schema
          }
        })

        // Create audit log for escalation
        await prisma.kVKKAuditLog.createMany({
          data: applicationIds.map((id: string) => ({
            action: 'APPLICATION_ESCALATED',
            applicationId: id,
            performedBy: session.user.email || 'system',
            details: {
              reason: 'Deadline exceeded',
              escalatedAt: new Date().toISOString()
            },
            performedAt: new Date()
          }))
        })

        // Send overdue notifications
        const overdueResult = await kvkkEmailService.sendOverdueNotifications(applicationIds)
        console.log('Overdue notifications result:', overdueResult)
        break

      case 'send_reminders':
        // Create audit log for reminders
        await prisma.kVKKAuditLog.createMany({
          data: applicationIds.map((id: string) => ({
            action: 'REMINDER_SENT',
            applicationId: id,
            performedBy: session.user.email || 'system',
            details: {
              reminderType: 'deadline_approaching',
              sentAt: new Date().toISOString()
            },
            performedAt: new Date()
          }))
        })

        // Send reminder notifications
        const reminderResult = await kvkkEmailService.sendReminderNotifications(applicationIds)
        console.log('Reminder notifications result:', reminderResult)
        break

      default:
        return NextResponse.json({
          success: false,
          message: 'Geçersiz eylem'
        }, { status: 400 })
    }

    return NextResponse.json({
      success: true,
      message: 'Eylem başarıyla gerçekleştirildi'
    })

  } catch (error) {
    console.error('KVKK Auto-escalation Error:', error)

    return NextResponse.json({
      success: false,
      message: 'Otomatik eylem gerçekleştirilemedi'
    }, { status: 500 })
  }
}