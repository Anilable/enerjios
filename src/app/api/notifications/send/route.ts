import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { z } from 'zod'
import { notificationSystem, NotificationType, NotificationRecipient, NotificationData } from '@/lib/notification-system'

const sendNotificationSchema = z.object({
  type: z.enum([
    'project_created',
    'quote_ready',
    'quote_approved',
    'installation_scheduled',
    'installation_completed',
    'payment_reminder',
    'system_status_update',
    'maintenance_reminder'
  ]),
  recipient: z.object({
    name: z.string(),
    email: z.string().email(),
    phone: z.string().optional(),
    language: z.enum(['tr', 'en']).optional(),
    preferences: z.object({
      email: z.boolean().optional(),
      sms: z.boolean().optional(),
      whatsapp: z.boolean().optional(),
      push: z.boolean().optional()
    }).optional()
  }),
  data: z.record(z.any()),
  channels: z.array(z.enum(['email', 'sms', 'whatsapp', 'push'])).optional()
})

const bulkSendSchema = z.object({
  notifications: z.array(sendNotificationSchema)
})

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    
    // Check if it's a bulk send request
    if (body.notifications && Array.isArray(body.notifications)) {
      const validatedData = bulkSendSchema.parse(body)
      
      const results = []
      
      for (const notification of validatedData.notifications) {
        try {
          const logs = await notificationSystem.sendNotification(
            notification.type as NotificationType,
            notification.recipient as NotificationRecipient,
            notification.data as NotificationData,
            notification.channels || ['email']
          )
          
          results.push({
            recipient: notification.recipient.email,
            success: true,
            logs
          })
        } catch (error) {
          results.push({
            recipient: notification.recipient.email,
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error'
          })
        }
      }
      
      const successCount = results.filter(r => r.success).length
      const failCount = results.filter(r => !r.success).length
      
      return NextResponse.json({
        success: true,
        message: `${successCount} notification sent successfully, ${failCount} failed`,
        results,
        summary: {
          total: results.length,
          successful: successCount,
          failed: failCount
        }
      })
    } else {
      // Single notification
      const validatedData = sendNotificationSchema.parse(body)
      
      const logs = await notificationSystem.sendNotification(
        validatedData.type as NotificationType,
        validatedData.recipient as NotificationRecipient,
        validatedData.data as NotificationData,
        validatedData.channels || ['email']
      )

      return NextResponse.json({
        success: true,
        message: 'Notification sent successfully',
        logs
      })
    }

  } catch (error) {
    console.error('Notification send error:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to send notification' },
      { status: 500 }
    )
  }
}

// Get notification logs
export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    
    const filters = {
      type: searchParams.get('type') as NotificationType | undefined,
      channel: searchParams.get('channel') || undefined,
      status: searchParams.get('status') || undefined,
      recipient: searchParams.get('recipient') || undefined,
      dateFrom: searchParams.get('dateFrom') || undefined,
      dateTo: searchParams.get('dateTo') || undefined
    }

    const logs = notificationSystem.getNotificationLogs(filters)
    const statistics = notificationSystem.getStatistics(filters.dateFrom, filters.dateTo)

    return NextResponse.json({
      success: true,
      logs,
      statistics,
      totalCount: logs.length
    })

  } catch (error) {
    console.error('Failed to get notification logs:', error)
    
    return NextResponse.json(
      { error: 'Failed to get notification logs' },
      { status: 500 }
    )
  }
}