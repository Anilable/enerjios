import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { kvkkEmailService } from '@/lib/services/kvkk-email-service'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({
        success: false,
        message: 'Yetkisiz erişim'
      }, { status: 401 })
    }

    const { action } = await request.json()

    switch (action) {
      case 'check_overdue_applications':
        await checkAndNotifyOverdueApplications()
        break

      case 'check_reminder_applications':
        await checkAndSendReminders()
        break

      case 'send_daily_report':
        await sendDailyComplianceReport()
        break

      case 'automated_monitoring':
        await runAutomatedMonitoring()
        break

      default:
        return NextResponse.json({
          success: false,
          message: 'Geçersiz eylem'
        }, { status: 400 })
    }

    return NextResponse.json({
      success: true,
      message: 'Görev başarıyla çalıştırıldı'
    })

  } catch (error) {
    console.error('KVKK Scheduler Error:', error)

    return NextResponse.json({
      success: false,
      message: 'Görev çalıştırılırken hata oluştu'
    }, { status: 500 })
  }
}

async function checkAndNotifyOverdueApplications() {
  console.log('Checking overdue applications...')

  const now = new Date()
  const overdueApplications = await prisma.kVKKApplication.findMany({
    where: {
      responseDeadline: { lt: now },
      status: { in: ['PENDING', 'IN_PROGRESS'] }
    },
    select: {
      id: true,
      applicationNo: true,
      responseDeadline: true
    }
  })

  if (overdueApplications.length > 0) {
    console.log(`Found ${overdueApplications.length} overdue applications`)

    // Check if notifications were already sent today
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const notificationsSentToday = await prisma.kVKKAuditLog.findMany({
      where: {
        action: 'OVERDUE_NOTIFICATION_SENT',
        performedAt: { gte: today },
        applicationId: { in: overdueApplications.map(app => app.id) }
      },
      select: { applicationId: true }
    })

    const notifiedAppIds = new Set(notificationsSentToday.map(log => log.applicationId))
    const unnotifiedApps = overdueApplications.filter(app => !notifiedAppIds.has(app.id))

    if (unnotifiedApps.length > 0) {
      console.log(`Sending notifications for ${unnotifiedApps.length} unnotified overdue applications`)
      await kvkkEmailService.sendOverdueNotifications(unnotifiedApps.map(app => app.id))
    } else {
      console.log('All overdue applications already notified today')
    }
  } else {
    console.log('No overdue applications found')
  }
}

async function checkAndSendReminders() {
  console.log('Checking applications due soon...')

  const now = new Date()
  const reminderThreshold = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000) // 7 days from now

  const dueSoonApplications = await prisma.kVKKApplication.findMany({
    where: {
      responseDeadline: {
        gte: now,
        lte: reminderThreshold
      },
      status: { in: ['PENDING', 'IN_PROGRESS'] }
    },
    select: {
      id: true,
      applicationNo: true,
      responseDeadline: true
    }
  })

  if (dueSoonApplications.length > 0) {
    console.log(`Found ${dueSoonApplications.length} applications due soon`)

    // Check if reminders were already sent in the last 3 days
    const threeDaysAgo = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000)

    const recentReminders = await prisma.kVKKAuditLog.findMany({
      where: {
        action: 'REMINDER_NOTIFICATION_SENT',
        performedAt: { gte: threeDaysAgo },
        applicationId: { in: dueSoonApplications.map(app => app.id) }
      },
      select: { applicationId: true }
    })

    const recentlyRemindedIds = new Set(recentReminders.map(log => log.applicationId))
    const needReminderApps = dueSoonApplications.filter(app => !recentlyRemindedIds.has(app.id))

    if (needReminderApps.length > 0) {
      console.log(`Sending reminders for ${needReminderApps.length} applications`)
      await kvkkEmailService.sendReminderNotifications(needReminderApps.map(app => app.id))
    } else {
      console.log('All due soon applications already reminded recently')
    }
  } else {
    console.log('No applications due soon')
  }
}

async function sendDailyComplianceReport() {
  console.log('Sending daily compliance report...')

  // Check if report was already sent today
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const reportSentToday = await prisma.kVKKAuditLog.findFirst({
    where: {
      action: 'COMPLIANCE_REPORT_SENT',
      performedAt: { gte: today }
    }
  })

  if (!reportSentToday) {
    const result = await kvkkEmailService.sendDailyComplianceReport()
    console.log('Daily compliance report result:', result)
  } else {
    console.log('Daily compliance report already sent today')
  }
}

async function runAutomatedMonitoring() {
  console.log('Running automated KVKK monitoring...')

  // Run all monitoring tasks
  await Promise.all([
    checkAndNotifyOverdueApplications(),
    checkAndSendReminders()
  ])

  // Check if it's time for daily report (once per day at 9 AM)
  const now = new Date()
  if (now.getHours() === 9 && now.getMinutes() < 30) {
    await sendDailyComplianceReport()
  }

  // Log monitoring execution
  await prisma.kVKKAuditLog.create({
    data: {
      action: 'AUTOMATED_MONITORING_EXECUTED',
      applicationId: null,
      performedBy: 'system',
      details: {
        executedAt: now.toISOString(),
        monitoringType: 'automated'
      },
      performedAt: new Date()
    }
  })

  console.log('Automated monitoring completed')
}