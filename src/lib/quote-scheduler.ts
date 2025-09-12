import { prisma } from '@/lib/prisma';
import { emailService } from '@/lib/email-service';
import { QuoteStatus } from '@prisma/client';

export class QuoteScheduler {
  
  // Check and update expired quotes
  static async checkExpiredQuotes(): Promise<void> {
    try {
      const now = new Date();
      
      // Find quotes that are expired but not marked as expired
      const expiredQuotes = await prisma.quote.findMany({
        where: {
          validUntil: {
            lt: now
          },
          status: {
            in: ['SENT', 'VIEWED']
          }
        },
        include: {
          customer: {
            include: {
              user: true
            }
          },
          createdBy: true,
          company: true
        }
      });

      console.log(`Found ${expiredQuotes.length} expired quotes to update`);

      // Update expired quotes
      for (const quote of expiredQuotes) {
        await prisma.quote.update({
          where: { id: quote.id },
          data: {
            status: QuoteStatus.EXPIRED,
            expiredAt: now
          }
        });

        // Create notification
        await prisma.notification.create({
          data: {
            userId: quote.createdById,
            type: 'SYSTEM_ALERT',
            title: 'Teklif Süresi Doldu',
            message: `${quote.quoteNumber} numaralı teklif süresi doldu.`,
            actionUrl: `/dashboard/quotes/${quote.id}`
          }
        });

        console.log(`Updated quote ${quote.quoteNumber} to expired status`);
      }

    } catch (error) {
      console.error('Error checking expired quotes:', error);
    }
  }

  // Send expiry warnings for quotes expiring soon
  static async sendExpiryWarnings(): Promise<void> {
    try {
      const warningDate = new Date();
      warningDate.setDate(warningDate.getDate() + 2); // 2 days before expiry

      const quotesExpiringSoon = await prisma.quote.findMany({
        where: {
          validUntil: {
            gte: new Date(),
            lte: warningDate
          },
          status: {
            in: ['SENT', 'VIEWED']
          },
          // Don't send warning if already sent in the last 24 hours
          updatedAt: {
            lt: new Date(Date.now() - 24 * 60 * 60 * 1000)
          }
        },
        include: {
          customer: {
            include: {
              user: true
            }
          },
          createdBy: true,
          company: true
        }
      });

      console.log(`Found ${quotesExpiringSoon.length} quotes expiring soon`);

      for (const quote of quotesExpiringSoon) {
        const customerName = quote.customer?.companyName || 
          `${quote.customer?.firstName || ''} ${quote.customer?.lastName || ''}`.trim() || 
          'Müşteri';
        
        const companyName = quote.company?.name || process.env.COMPANY_NAME || 'Trakya Solar';

        try {
          await emailService.sendQuoteExpiryWarning(
            quote,
            customerName,
            companyName
          );

          // Create notification
          await prisma.notification.create({
            data: {
              userId: quote.createdById,
              type: 'SYSTEM_ALERT',
              title: 'Teklif Süresi Yakında Doluyor',
              message: `${quote.quoteNumber} numaralı teklif ${new Date(quote.validUntil).toLocaleDateString('tr-TR')} tarihinde sona erecek.`,
              actionUrl: `/dashboard/quotes/${quote.id}`
            }
          });

          console.log(`Sent expiry warning for quote ${quote.quoteNumber}`);
        } catch (error) {
          console.error(`Failed to send expiry warning for quote ${quote.quoteNumber}:`, error);
        }
      }

    } catch (error) {
      console.error('Error sending expiry warnings:', error);
    }
  }

  // Clean up old notifications
  static async cleanupOldNotifications(): Promise<void> {
    try {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const result = await prisma.notification.deleteMany({
        where: {
          createdAt: {
            lt: thirtyDaysAgo
          },
          read: true
        }
      });

      console.log(`Cleaned up ${result.count} old notifications`);

    } catch (error) {
      console.error('Error cleaning up old notifications:', error);
    }
  }

  // Generate quote analytics
  static async generateQuoteAnalytics(): Promise<void> {
    try {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      // Get quote statistics for the last 30 days
      const stats = await prisma.quote.groupBy({
        by: ['status'],
        where: {
          createdAt: {
            gte: thirtyDaysAgo
          }
        },
        _count: {
          id: true
        },
        _sum: {
          total: true
        }
      });

      // Calculate conversion metrics
      const totalQuotes = await prisma.quote.count({
        where: {
          createdAt: {
            gte: thirtyDaysAgo
          }
        }
      });

      const approvedQuotes = await prisma.quote.count({
        where: {
          createdAt: {
            gte: thirtyDaysAgo
          },
          status: 'APPROVED'
        }
      });

      const conversionRate = totalQuotes > 0 ? (approvedQuotes / totalQuotes * 100).toFixed(2) : '0';

      console.log('Quote Analytics (Last 30 Days):');
      console.log(`Total Quotes: ${totalQuotes}`);
      console.log(`Approved Quotes: ${approvedQuotes}`);
      console.log(`Conversion Rate: ${conversionRate}%`);
      console.log('Status Breakdown:', stats);

      // Store analytics in database (you could create an Analytics table)
      // For now, just log the results

    } catch (error) {
      console.error('Error generating quote analytics:', error);
    }
  }

  // Main scheduler function to run all tasks
  static async runScheduledTasks(): Promise<void> {
    console.log('Running scheduled quote tasks...');
    
    await this.checkExpiredQuotes();
    await this.sendExpiryWarnings();
    await this.cleanupOldNotifications();
    await this.generateQuoteAnalytics();

    console.log('Scheduled quote tasks completed');
  }

  // Send reminder for pending quotes (no activity for X days)
  static async sendPendingQuoteReminders(): Promise<void> {
    try {
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      const pendingQuotes = await prisma.quote.findMany({
        where: {
          status: 'VIEWED',
          viewedAt: {
            lte: sevenDaysAgo
          },
          validUntil: {
            gte: new Date()
          }
        },
        include: {
          customer: {
            include: {
              user: true
            }
          },
          createdBy: true,
          company: true
        }
      });

      console.log(`Found ${pendingQuotes.length} quotes with no activity for 7+ days`);

      for (const quote of pendingQuotes) {
        // Create reminder notification for sales team
        await prisma.notification.create({
          data: {
            userId: quote.createdById,
            type: 'SYSTEM_ALERT',
            title: 'Teklif Takip Gerekli',
            message: `${quote.quoteNumber} numaralı teklif 7 gündür beklemede. Müşteri ile iletişime geçmeyi düşünün.`,
            actionUrl: `/dashboard/quotes/${quote.id}`
          }
        });

        console.log(`Created reminder for quote ${quote.quoteNumber}`);
      }

    } catch (error) {
      console.error('Error sending pending quote reminders:', error);
    }
  }
}