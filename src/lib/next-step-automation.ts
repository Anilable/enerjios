/**
 * Next Step Automation System
 * Client-side calculation of next steps based on project request status and timestamps
 */

import { RequestStatus } from '@/types/project-request'

export interface NextStep {
  id: string
  type: NextStepType
  title: string
  description: string
  dueDate: Date
  priority: 'HIGH' | 'MEDIUM' | 'LOW'
  isOverdue: boolean
  isDueToday: boolean
  status: 'PENDING' | 'COMPLETED'
  createdAt: Date
}

export type NextStepType =
  | 'CONTACT_CUSTOMER'
  | 'SCHEDULE_SITE_VISIT'
  | 'SEND_QUOTE'
  | 'FOLLOW_UP_QUOTE'
  | 'PROJECT_KICKOFF'
  | 'TECHNICAL_REVIEW'
  | 'DOCUMENT_PREPARATION'

export interface NextStepRule {
  fromStatus: RequestStatus
  stepType: NextStepType
  title: string
  description: string
  daysFromStatusChange: number
  priority: 'HIGH' | 'MEDIUM' | 'LOW'
}

// Next step automation rules
const NEXT_STEP_RULES: NextStepRule[] = [
  {
    fromStatus: 'OPEN',
    stepType: 'CONTACT_CUSTOMER',
    title: 'Müşteriyle İletişime Geç',
    description: 'Müşteri ile ilk iletişimi kurarak ihtiyaçlarını öğren',
    daysFromStatusChange: 1,
    priority: 'HIGH'
  },
  {
    fromStatus: 'CONTACTED',
    stepType: 'SCHEDULE_SITE_VISIT',
    title: 'Saha Ziyareti Planla',
    description: 'Müşteri ile saha ziyareti randevusu ayarla',
    daysFromStatusChange: 3,
    priority: 'HIGH'
  },
  {
    fromStatus: 'ASSIGNED',
    stepType: 'TECHNICAL_REVIEW',
    title: 'Teknik İnceleme',
    description: 'Atanan ekip teknik inceleme yapmalı',
    daysFromStatusChange: 2,
    priority: 'MEDIUM'
  },
  {
    fromStatus: 'SITE_VISIT',
    stepType: 'SEND_QUOTE',
    title: 'Teklif Gönder',
    description: 'Saha incelemesi sonrası detaylı teklif hazırla',
    daysFromStatusChange: 2,
    priority: 'HIGH'
  },
  {
    fromStatus: 'SITE_VISIT',
    stepType: 'FOLLOW_UP_QUOTE',
    title: 'Teklif Takibi',
    description: 'Gönderilen teklifin takibini yap',
    daysFromStatusChange: 7,
    priority: 'MEDIUM'
  },
  {
    fromStatus: 'CONVERTED_TO_PROJECT',
    stepType: 'PROJECT_KICKOFF',
    title: 'Proje Başlatma',
    description: 'Proje başlangıç süreçlerini başlat',
    daysFromStatusChange: 1,
    priority: 'HIGH'
  },
  {
    fromStatus: 'CONVERTED_TO_PROJECT',
    stepType: 'DOCUMENT_PREPARATION',
    title: 'Dokümantasyon Hazırla',
    description: 'Proje dokümantasyonunu ve sözleşmeleri hazırla',
    daysFromStatusChange: 3,
    priority: 'MEDIUM'
  }
]

// Step type icons and colors
export const STEP_TYPE_CONFIG = {
  CONTACT_CUSTOMER: {
    icon: '📞',
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200'
  },
  SCHEDULE_SITE_VISIT: {
    icon: '📅',
    color: 'text-green-600',
    bgColor: 'bg-green-50',
    borderColor: 'border-green-200'
  },
  SEND_QUOTE: {
    icon: '📄',
    color: 'text-purple-600',
    bgColor: 'bg-purple-50',
    borderColor: 'border-purple-200'
  },
  FOLLOW_UP_QUOTE: {
    icon: '🔄',
    color: 'text-orange-600',
    bgColor: 'bg-orange-50',
    borderColor: 'border-orange-200'
  },
  PROJECT_KICKOFF: {
    icon: '🚀',
    color: 'text-emerald-600',
    bgColor: 'bg-emerald-50',
    borderColor: 'border-emerald-200'
  },
  TECHNICAL_REVIEW: {
    icon: '🔍',
    color: 'text-indigo-600',
    bgColor: 'bg-indigo-50',
    borderColor: 'border-indigo-200'
  },
  DOCUMENT_PREPARATION: {
    icon: '📋',
    color: 'text-teal-600',
    bgColor: 'bg-teal-50',
    borderColor: 'border-teal-200'
  }
}

export interface ProjectRequestWithTimestamps {
  id: string
  status: RequestStatus
  createdAt: Date
  updatedAt: Date
  statusHistory?: Array<{
    status: RequestStatus
    changedAt: Date
  }>
}

/**
 * Calculate next steps for a project request based on its status and timestamps
 */
export function calculateNextSteps(request: ProjectRequestWithTimestamps): NextStep[] {
  const steps: NextStep[] = []
  const now = new Date()

  // Get status change date (use updatedAt as approximation if no status history)
  const statusChangeDate = request.statusHistory?.find(h => h.status === request.status)?.changedAt || request.updatedAt

  // Find applicable rules for current status
  const applicableRules = NEXT_STEP_RULES.filter(rule => rule.fromStatus === request.status)

  applicableRules.forEach((rule, index) => {
    const dueDate = new Date(statusChangeDate)
    dueDate.setDate(dueDate.getDate() + rule.daysFromStatusChange)

    const isOverdue = now > dueDate
    const isDueToday = now.toDateString() === dueDate.toDateString()

    steps.push({
      id: `${request.id}-${rule.stepType}-${index}`,
      type: rule.stepType,
      title: rule.title,
      description: rule.description,
      dueDate,
      priority: rule.priority,
      isOverdue,
      isDueToday,
      status: 'PENDING',
      createdAt: statusChangeDate
    })
  })

  // Sort by priority and due date
  return steps.sort((a, b) => {
    // High priority first
    if (a.priority !== b.priority) {
      const priorityOrder = { 'HIGH': 0, 'MEDIUM': 1, 'LOW': 2 }
      return priorityOrder[a.priority] - priorityOrder[b.priority]
    }

    // Then by due date
    return a.dueDate.getTime() - b.dueDate.getTime()
  })
}

/**
 * Calculate next steps for multiple project requests
 */
export function calculateNextStepsForRequests(requests: ProjectRequestWithTimestamps[]): Map<string, NextStep[]> {
  const nextStepsMap = new Map<string, NextStep[]>()

  requests.forEach(request => {
    const steps = calculateNextSteps(request)
    nextStepsMap.set(request.id, steps)
  })

  return nextStepsMap
}

/**
 * Get aggregated next step statistics
 */
export function getNextStepStats(requests: ProjectRequestWithTimestamps[]) {
  const allSteps = requests.flatMap(request => calculateNextSteps(request))

  return {
    total: allSteps.length,
    overdue: allSteps.filter(step => step.isOverdue).length,
    dueToday: allSteps.filter(step => step.isDueToday).length,
    pending: allSteps.filter(step => step.status === 'PENDING').length,
    highPriority: allSteps.filter(step => step.priority === 'HIGH').length,
    byStatus: allSteps.reduce((acc, step) => {
      acc[step.type] = (acc[step.type] || 0) + 1
      return acc
    }, {} as Record<NextStepType, number>)
  }
}

/**
 * Format next step for display
 */
export function formatNextStepForDisplay(step: NextStep) {
  const config = STEP_TYPE_CONFIG[step.type]
  const daysUntilDue = Math.ceil((step.dueDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))

  let urgencyText = ''
  let urgencyColor = 'text-gray-500'

  if (step.isOverdue) {
    const overdueDays = Math.abs(daysUntilDue)
    urgencyText = `${overdueDays} gün gecikmiş`
    urgencyColor = 'text-red-600'
  } else if (step.isDueToday) {
    urgencyText = 'Bugün'
    urgencyColor = 'text-orange-600'
  } else if (daysUntilDue <= 3) {
    urgencyText = `${daysUntilDue} gün kaldı`
    urgencyColor = 'text-yellow-600'
  } else {
    urgencyText = `${daysUntilDue} gün kaldı`
    urgencyColor = 'text-blue-600'
  }

  return {
    ...step,
    config,
    urgencyText,
    urgencyColor,
    daysUntilDue
  }
}

/**
 * Get priority badge color
 */
export function getPriorityBadgeColor(priority: NextStep['priority']) {
  switch (priority) {
    case 'HIGH':
      return 'bg-red-100 text-red-800 border-red-200'
    case 'MEDIUM':
      return 'bg-yellow-100 text-yellow-800 border-yellow-200'
    case 'LOW':
      return 'bg-gray-100 text-gray-800 border-gray-200'
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200'
  }
}