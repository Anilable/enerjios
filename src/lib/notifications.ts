import { prisma } from '@/lib/db'
import { getSocket } from '@/lib/socket'

import { NotificationType as PrismaNotificationType } from '@prisma/client'

export type NotificationType = 'QUOTE_RECEIVED' | 'QUOTE_ACCEPTED' | 'PROJECT_UPDATE' | 'PAYMENT_DUE' | 'INSTALLATION_SCHEDULED' | 'MAINTENANCE_REMINDER' | 'SYSTEM_ALERT'

export interface NotificationData {
  title: string
  message: string
  type: NotificationType
  userId: string
  projectId?: string
  actionUrl?: string
}

export class NotificationService {
  // Create and send notification
  static async create(data: NotificationData) {
    try {
      // Save to database
      const notification = await prisma.notification.create({
        data: {
          title: data.title,
          message: data.message,
          type: data.type,
          userId: data.userId,
          projectId: data.projectId,
          actionUrl: data.actionUrl,
          read: false
        },
        include: {
          user: {
            select: { id: true, name: true, email: true }
          }
        }
      })

      // Send real-time notification via Socket.io
      const socket = getSocket()
      if (socket) {
        socket.to(`user:${data.userId}`).emit('notification', {
          id: notification.id,
          title: notification.title,
          message: notification.message,
          type: notification.type,
          timestamp: notification.createdAt.toISOString(),
          actionUrl: notification.actionUrl
        })
      }

      return notification
    } catch (error) {
      console.error('Failed to create notification:', error)
      throw error
    }
  }

  // Create multiple notifications
  static async createMany(notifications: NotificationData[]) {
    try {
      const results = await Promise.all(
        notifications.map(notification => this.create(notification))
      )
      return results
    } catch (error) {
      console.error('Failed to create notifications:', error)
      throw error
    }
  }

  // Mark notification as read
  static async markAsRead(notificationId: string, userId: string) {
    try {
      const notification = await prisma.notification.updateMany({
        where: {
          id: notificationId,
          userId: userId
        },
        data: {
          read: true
        }
      })

      return notification
    } catch (error) {
      console.error('Failed to mark notification as read:', error)
      throw error
    }
  }

  // Mark all notifications as read for user
  static async markAllAsRead(userId: string) {
    try {
      const notifications = await prisma.notification.updateMany({
        where: {
          userId: userId,
          read: false
        },
        data: {
          read: true
        }
      })

      return notifications
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error)
      throw error
    }
  }

  // Get user notifications
  static async getUserNotifications(userId: string, options?: {
    page?: number
    limit?: number
    unreadOnly?: boolean
    type?: NotificationType
  }) {
    try {
      const page = options?.page ?? 1
      const limit = options?.limit ?? 20
      const skip = (page - 1) * limit

      const where = {
        userId,
        ...(options?.unreadOnly && { read: false }),
        ...(options?.type && { type: options.type })
      }

      const [notifications, total] = await Promise.all([
        prisma.notification.findMany({
          where,
          orderBy: { createdAt: 'desc' },
          skip,
          take: limit
        }),
        prisma.notification.count({ where })
      ])

      return {
        notifications,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      }
    } catch (error) {
      console.error('Failed to get user notifications:', error)
      throw error
    }
  }

  // Delete notification
  static async delete(notificationId: string, userId: string) {
    try {
      const notification = await prisma.notification.deleteMany({
        where: {
          id: notificationId,
          userId: userId
        }
      })

      return notification
    } catch (error) {
      console.error('Failed to delete notification:', error)
      throw error
    }
  }

  // Get unread count
  static async getUnreadCount(userId: string) {
    try {
      const count = await prisma.notification.count({
        where: {
          userId,
          read: false
        }
      })

      return count
    } catch (error) {
      console.error('Failed to get unread count:', error)
      throw error
    }
  }

  // Notification templates for common scenarios
  static async notifyProjectStatusChange(userId: string, projectId: string, status: string) {
    const statusMessages = {
      'APPROVED': {
        title: 'Proje Onaylandı! 🎉',
        message: 'Projeniz onaylandı ve işlemler başlatıldı.',
        type: 'PROJECT_UPDATE' as NotificationType
      },
      'REJECTED': {
        title: 'Proje İncelemeye Alındı',
        message: 'Projeniz inceleme aşamasında. En kısa sürede geri döneceğiz.',
        type: 'PROJECT_UPDATE' as NotificationType
      },
      'COMPLETED': {
        title: 'Proje Tamamlandı! ✅',
        message: 'Projenizin kurulumu başarıyla tamamlandı.',
        type: 'PROJECT_UPDATE' as NotificationType
      }
    }

    const template = statusMessages[status as keyof typeof statusMessages]
    if (template) {
      await this.create({
        ...template,
        userId,
        projectId,
        actionUrl: `/dashboard/projects/${projectId}`
      })
    }
  }

  static async notifyNewQuote(userId: string, projectId: string) {
    await this.create({
      title: 'Yeni Teklif Hazır! 📄',
      message: 'Projeniz için yeni bir teklif hazırlandı.',
      type: 'QUOTE_RECEIVED',
      userId,
      projectId,
      actionUrl: `/dashboard/projects/${projectId}/quote`
    })
  }

  static async notifyPaymentReceived(userId: string, amount: number, projectId?: string) {
    await this.create({
      title: 'Ödeme Alındı! 💳',
      message: `${amount.toLocaleString('tr-TR')} TL ödemeniz başarıyla alındı.`,
      type: 'PAYMENT_DUE',
      userId,
      projectId,
      actionUrl: projectId ? `/dashboard/projects/${projectId}/payments` : '/dashboard/payments'
    })
  }
}