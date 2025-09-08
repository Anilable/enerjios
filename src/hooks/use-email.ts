'use client'

import { useState, useCallback } from 'react'
import apiClient, { EmailRequest, EmailResponse, APIError } from '@/lib/api-client'
import type { EmailTemplateData } from '@/types/api'

interface UseEmailReturn {
  sending: boolean
  error: string | null
  lastResponse: EmailResponse | null
  sendEmail: (request: EmailRequest) => Promise<EmailResponse | null>
  sendProjectStatusUpdate: (
    to: string | string[], 
    data: EmailTemplateData['projectStatusUpdate']
  ) => Promise<EmailResponse | null>
  sendCustomerWelcome: (
    to: string, 
    data: EmailTemplateData['customerWelcome']
  ) => Promise<EmailResponse | null>
  sendInvoiceNotification: (
    to: string, 
    data: EmailTemplateData['invoiceGenerated']
  ) => Promise<EmailResponse | null>
  sendMaintenanceReminder: (
    to: string, 
    data: EmailTemplateData['maintenanceReminder']
  ) => Promise<EmailResponse | null>
  clearError: () => void
}

export function useEmail(): UseEmailReturn {
  const [sending, setSending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [lastResponse, setLastResponse] = useState<EmailResponse | null>(null)

  const clearError = useCallback(() => {
    setError(null)
  }, [])

  const sendEmail = useCallback(async (request: EmailRequest): Promise<EmailResponse | null> => {
    setSending(true)
    setError(null)

    try {
      const response = await apiClient.sendEmail(request)
      setLastResponse(response)
      return response
    } catch (err) {
      const errorMessage = err instanceof APIError 
        ? err.message 
        : 'Failed to send email'
      setError(errorMessage)
      console.error('Email send error:', err)
      return null
    } finally {
      setSending(false)
    }
  }, [])

  const sendProjectStatusUpdate = useCallback(async (
    to: string | string[],
    data: EmailTemplateData['projectStatusUpdate']
  ): Promise<EmailResponse | null> => {
    return await sendEmail({
      to,
      template: 'projectStatusUpdate',
      data
    })
  }, [sendEmail])

  const sendCustomerWelcome = useCallback(async (
    to: string,
    data: EmailTemplateData['customerWelcome']
  ): Promise<EmailResponse | null> => {
    return await sendEmail({
      to,
      template: 'customerWelcome',
      data
    })
  }, [sendEmail])

  const sendInvoiceNotification = useCallback(async (
    to: string,
    data: EmailTemplateData['invoiceGenerated']
  ): Promise<EmailResponse | null> => {
    return await sendEmail({
      to,
      template: 'invoiceGenerated',
      data
    })
  }, [sendEmail])

  const sendMaintenanceReminder = useCallback(async (
    to: string,
    data: EmailTemplateData['maintenanceReminder']
  ): Promise<EmailResponse | null> => {
    return await sendEmail({
      to,
      template: 'maintenanceReminder',
      data
    })
  }, [sendEmail])

  return {
    sending,
    error,
    lastResponse,
    sendEmail,
    sendProjectStatusUpdate,
    sendCustomerWelcome,
    sendInvoiceNotification,
    sendMaintenanceReminder,
    clearError
  }
}

// Specialized hook for bulk email operations
export function useBulkEmail() {
  const [sending, setSending] = useState(false)
  const [progress, setProgress] = useState(0)
  const [results, setResults] = useState<Array<{
    recipient: string
    success: boolean
    error?: string
    messageId?: string
  }>>([])

  const sendBulkEmails = useCallback(async (
    recipients: string[],
    template: EmailRequest['template'],
    getData: (recipient: string) => Record<string, any>
  ) => {
    setSending(true)
    setProgress(0)
    setResults([])

    const batchResults: typeof results = []
    
    for (let i = 0; i < recipients.length; i++) {
      const recipient = recipients[i]
      
      try {
        const data = getData(recipient)
        const response = await apiClient.sendEmail({
          to: recipient,
          template,
          data
        })

        batchResults.push({
          recipient,
          success: true,
          messageId: response.messageId
        })
      } catch (error) {
        batchResults.push({
          recipient,
          success: false,
          error: error instanceof APIError ? error.message : 'Failed to send'
        })
      }

      setProgress(Math.round(((i + 1) / recipients.length) * 100))
      setResults([...batchResults])

      // Add small delay to avoid rate limiting
      if (i < recipients.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 100))
      }
    }

    setSending(false)
    return batchResults
  }, [])

  const sendProjectUpdatesToTeam = useCallback(async (
    teamEmails: string[],
    projectData: EmailTemplateData['projectStatusUpdate']
  ) => {
    return await sendBulkEmails(
      teamEmails,
      'projectStatusUpdate',
      () => projectData
    )
  }, [sendBulkEmails])

  return {
    sending,
    progress,
    results,
    sendBulkEmails,
    sendProjectUpdatesToTeam
  }
}

// Hook for email automation based on project events
export function useProjectEmailAutomation() {
  const { sendEmail } = useEmail()

  const automateProjectEmails = useCallback(async (
    projectId: string,
    event: 'created' | 'statusChanged' | 'completed' | 'cancelled',
    projectData: {
      name: string
      customerEmail: string
      customerName: string
      status: string
      progress: number
      systemSize: number
      location: string
      assignedTo?: string
      teamEmails?: string[]
    }
  ) => {
    const baseProjectUrl = `${window.location.origin}/dashboard/projects/${projectId}`
    
    const emailPromises: Promise<any>[] = []

    switch (event) {
      case 'created':
        // Send welcome email to customer
        emailPromises.push(
          sendEmail({
            to: projectData.customerEmail,
            template: 'customerWelcome',
            data: {
              customerName: projectData.customerName,
              email: projectData.customerEmail,
              phone: '', // Would come from customer data
              dashboardUrl: baseProjectUrl,
              projectAssignee: projectData.assignedTo
            }
          })
        )
        break

      case 'statusChanged':
        // Send status update to customer
        emailPromises.push(
          sendEmail({
            to: projectData.customerEmail,
            template: 'projectStatusUpdate',
            data: {
              projectName: projectData.name,
              status: projectData.status,
              progress: projectData.progress,
              systemSize: projectData.systemSize,
              location: projectData.location,
              projectUrl: baseProjectUrl
            }
          })
        )

        // Send update to team if provided
        if (projectData.teamEmails?.length) {
          emailPromises.push(
            ...projectData.teamEmails.map(email =>
              sendEmail({
                to: email,
                template: 'projectStatusUpdate',
                data: {
                  projectName: projectData.name,
                  status: projectData.status,
                  progress: projectData.progress,
                  message: 'Takım bildirimi: Proje durumu güncellendi',
                  systemSize: projectData.systemSize,
                  location: projectData.location,
                  projectUrl: baseProjectUrl
                }
              })
            )
          )
        }
        break

      case 'completed':
        // Send completion notification
        emailPromises.push(
          sendEmail({
            to: projectData.customerEmail,
            template: 'projectStatusUpdate',
            data: {
              projectName: projectData.name,
              status: 'Tamamlandı',
              progress: 100,
              message: 'Tebrikler! Solar sisteminiz başarıyla kuruldu ve devreye alındı.',
              systemSize: projectData.systemSize,
              location: projectData.location,
              nextStep: 'Sistem performansını takip etmeye başlayabilirsiniz.',
              projectUrl: baseProjectUrl
            }
          })
        )
        break

      case 'cancelled':
        // Send cancellation notification
        emailPromises.push(
          sendEmail({
            to: projectData.customerEmail,
            template: 'projectStatusUpdate',
            data: {
              projectName: projectData.name,
              status: 'İptal Edildi',
              progress: projectData.progress,
              message: 'Projeniz iptal edilmiştir. Daha fazla bilgi için lütfen bizimle iletişime geçin.',
              systemSize: projectData.systemSize,
              location: projectData.location,
              projectUrl: baseProjectUrl
            }
          })
        )
        break
    }

    try {
      const results = await Promise.allSettled(emailPromises)
      
      const successful = results.filter(r => r.status === 'fulfilled').length
      const failed = results.filter(r => r.status === 'rejected').length
      
      console.log(`Email automation for ${event}: ${successful} sent, ${failed} failed`)
      
      return {
        success: failed === 0,
        sent: successful,
        failed,
        results
      }
    } catch (error) {
      console.error('Email automation error:', error)
      return {
        success: false,
        sent: 0,
        failed: emailPromises.length,
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }, [sendEmail])

  return {
    automateProjectEmails
  }
}

// Hook for scheduled maintenance reminders
export function useMaintenanceEmailScheduler() {
  const { sendMaintenanceReminder } = useEmail()

  const scheduleMaintenanceReminders = useCallback(async (
    projects: Array<{
      id: string
      customerName: string
      customerEmail: string
      systemName: string
      lastMaintenance: Date
      maintenanceInterval: number // months
    }>
  ) => {
    const now = new Date()
    const reminders: Array<{
      projectId: string
      type: 'due' | 'upcoming' | 'overdue'
      daysUntilDue: number
    }> = []

    const emailPromises = projects.map(async (project) => {
      const lastMaintenance = new Date(project.lastMaintenance)
      const nextDue = new Date(lastMaintenance)
      nextDue.setMonth(nextDue.getMonth() + project.maintenanceInterval)
      
      const daysUntilDue = Math.ceil((nextDue.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
      
      let shouldSendReminder = false
      let reminderType: 'due' | 'upcoming' | 'overdue' = 'upcoming'
      
      if (daysUntilDue < 0) {
        // Overdue
        shouldSendReminder = Math.abs(daysUntilDue) % 7 === 0 // Weekly reminders when overdue
        reminderType = 'overdue'
      } else if (daysUntilDue <= 7) {
        // Due within a week
        shouldSendReminder = true
        reminderType = 'due'
      } else if (daysUntilDue <= 30) {
        // Due within a month
        shouldSendReminder = daysUntilDue % 7 === 0 // Weekly reminders
        reminderType = 'upcoming'
      }

      if (shouldSendReminder) {
        reminders.push({
          projectId: project.id,
          type: reminderType,
          daysUntilDue
        })

        const urgencyMessage = reminderType === 'overdue' 
          ? `Bakım ${Math.abs(daysUntilDue)} gün gecikmeli!`
          : reminderType === 'due'
          ? 'Bakım zamanı geldi!'
          : `Bakım ${daysUntilDue} gün sonra`

        return await sendMaintenanceReminder(
          project.customerEmail,
          {
            customerName: project.customerName,
            projectName: project.systemName,
            lastMaintenance: lastMaintenance.toLocaleDateString('tr-TR'),
            suggestedDate: nextDue.toLocaleDateString('tr-TR'),
            maintenanceType: 'Periyodik bakım ve kontrol',
            scheduleUrl: `${window.location.origin}/maintenance/schedule/${project.id}`,
            performanceIssues: reminderType === 'overdue' 
              ? 'Geciken bakım sistem performansını olumsuz etkileyebilir.'
              : undefined
          }
        )
      }

      return null
    })

    const results = await Promise.allSettled(emailPromises)
    const successful = results.filter(r => r.status === 'fulfilled' && r.value).length
    
    return {
      remindersSent: successful,
      totalChecked: projects.length,
      upcomingMaintenance: reminders
    }
  }, [sendMaintenanceReminder])

  return {
    scheduleMaintenanceReminders
  }
}

export default useEmail