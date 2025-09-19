export type NextStepType =
  | 'CONTACT_CUSTOMER'
  | 'SCHEDULE_SITE_VISIT'
  | 'SEND_QUOTE'
  | 'FOLLOW_UP_QUOTE'
  | 'PROJECT_KICKOFF'
  | 'FOLLOW_UP_GENERAL'
  | 'CUSTOM'

export type Priority =
  | 'LOW'
  | 'MEDIUM'
  | 'HIGH'

export interface ProjectRequestNextStep {
  id: string
  projectRequestId: string
  stepType: NextStepType
  title: string
  description?: string
  dueDate: string
  isOverdue: boolean
  isCompleted: boolean
  completedAt?: string
  completedBy?: string
  completedByUser?: {
    id: string
    name: string
    email: string
  }
  priority: Priority
  automationRule?: string
  metadata?: Record<string, any>
  createdAt: string
  updatedAt: string
}

export interface NextStepAutomationRule {
  id: string
  name: string
  description?: string
  triggerStatus: import('./project-request').ProjectRequestStatus
  stepType: NextStepType
  stepTitle: string
  stepDescription?: string
  daysAfterStatusChange: number
  priority: Priority
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export const NEXT_STEP_TYPE_LABELS: Record<NextStepType, string> = {
  CONTACT_CUSTOMER: 'Müşteriyi Ara',
  SCHEDULE_SITE_VISIT: 'Saha Ziyareti Planla',
  SEND_QUOTE: 'Teklif Gönder',
  FOLLOW_UP_QUOTE: 'Teklif Takibi',
  PROJECT_KICKOFF: 'Proje Başlatma',
  FOLLOW_UP_GENERAL: 'Genel Takip',
  CUSTOM: 'Özel'
}

export const NEXT_STEP_TYPE_DESCRIPTIONS: Record<NextStepType, string> = {
  CONTACT_CUSTOMER: 'Müşteriyle iletişim kurulması gerekiyor',
  SCHEDULE_SITE_VISIT: 'Saha ziyareti planlanması gerekiyor',
  SEND_QUOTE: 'Müşteriye teklif gönderilmesi gerekiyor',
  FOLLOW_UP_QUOTE: 'Gönderilen teklifin takibi yapılmalı',
  PROJECT_KICKOFF: 'Projenin başlatılması gerekiyor',
  FOLLOW_UP_GENERAL: 'Genel durum takibi yapılmalı',
  CUSTOM: 'Özel görev'
}

export const NEXT_STEP_TYPE_COLORS: Record<NextStepType, {
  background: string
  text: string
  border: string
  badge: string
  icon: string
}> = {
  CONTACT_CUSTOMER: {
    background: 'bg-blue-50',
    text: 'text-blue-700',
    border: 'border-blue-200',
    badge: 'bg-blue-100 text-blue-800 border-blue-200',
    icon: 'text-blue-600'
  },
  SCHEDULE_SITE_VISIT: {
    background: 'bg-purple-50',
    text: 'text-purple-700',
    border: 'border-purple-200',
    badge: 'bg-purple-100 text-purple-800 border-purple-200',
    icon: 'text-purple-600'
  },
  SEND_QUOTE: {
    background: 'bg-green-50',
    text: 'text-green-700',
    border: 'border-green-200',
    badge: 'bg-green-100 text-green-800 border-green-200',
    icon: 'text-green-600'
  },
  FOLLOW_UP_QUOTE: {
    background: 'bg-orange-50',
    text: 'text-orange-700',
    border: 'border-orange-200',
    badge: 'bg-orange-100 text-orange-800 border-orange-200',
    icon: 'text-orange-600'
  },
  PROJECT_KICKOFF: {
    background: 'bg-emerald-50',
    text: 'text-emerald-700',
    border: 'border-emerald-200',
    badge: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    icon: 'text-emerald-600'
  },
  FOLLOW_UP_GENERAL: {
    background: 'bg-yellow-50',
    text: 'text-yellow-700',
    border: 'border-yellow-200',
    badge: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    icon: 'text-yellow-600'
  },
  CUSTOM: {
    background: 'bg-gray-50',
    text: 'text-gray-700',
    border: 'border-gray-200',
    badge: 'bg-gray-100 text-gray-800 border-gray-200',
    icon: 'text-gray-600'
  }
}

export const NEXT_STEP_TYPE_ICONS: Record<NextStepType, string> = {
  CONTACT_CUSTOMER: '📞',
  SCHEDULE_SITE_VISIT: '🗓️',
  SEND_QUOTE: '📄',
  FOLLOW_UP_QUOTE: '📧',
  PROJECT_KICKOFF: '🚀',
  FOLLOW_UP_GENERAL: '👀',
  CUSTOM: '⚙️'
}

// Default automation rules
export const DEFAULT_AUTOMATION_RULES: Omit<NextStepAutomationRule, 'id' | 'createdAt' | 'updatedAt'>[] = [
  {
    name: 'Müşteriyi Ara - Yeni Talep',
    description: 'Yeni talep alındıktan sonra 24 saat içinde müşteriyle iletişim kurulması',
    triggerStatus: 'OPEN',
    stepType: 'CONTACT_CUSTOMER',
    stepTitle: 'Müşteriyi Ara',
    stepDescription: 'Yeni talep için müşteriyle iletişim kurulması gerekiyor',
    daysAfterStatusChange: 1,
    priority: 'HIGH',
    isActive: true
  },
  {
    name: 'Saha Ziyareti Planla',
    description: 'Müşteriyle iletişim kurulduktan sonra 3 gün içinde saha ziyareti planlanması',
    triggerStatus: 'CONTACTED',
    stepType: 'SCHEDULE_SITE_VISIT',
    stepTitle: 'Saha Ziyareti Planla',
    stepDescription: 'Müşteriyle iletişim kurulduktan sonra saha ziyareti planlanmalı',
    daysAfterStatusChange: 3,
    priority: 'MEDIUM',
    isActive: true
  },
  {
    name: 'Teklif Gönder',
    description: 'Saha ziyareti tamamlandıktan sonra 2 gün içinde teklif gönderilmesi',
    triggerStatus: 'SITE_VISIT',
    stepType: 'SEND_QUOTE',
    stepTitle: 'Teklif Gönder',
    stepDescription: 'Saha ziyareti tamamlandıktan sonra müşteriye teklif gönderilmeli',
    daysAfterStatusChange: 2,
    priority: 'HIGH',
    isActive: true
  },
  {
    name: 'Teklif Takibi',
    description: 'Teklif gönderildikten 7 gün sonra müşteriyle takip yapılması',
    triggerStatus: 'SITE_VISIT',
    stepType: 'FOLLOW_UP_QUOTE',
    stepTitle: 'Teklif Takibi Yap',
    stepDescription: 'Gönderilen teklifin durumu hakkında müşteriyle iletişim kurulmalı',
    daysAfterStatusChange: 7,
    priority: 'MEDIUM',
    isActive: true
  },
  {
    name: 'Proje Başlatma',
    description: 'Talep projeye dönüştürüldükten sonra proje başlatma süreçleri',
    triggerStatus: 'CONVERTED_TO_PROJECT',
    stepType: 'PROJECT_KICKOFF',
    stepTitle: 'Projeyi Başlat',
    stepDescription: 'Proje başlatma süreçleri ve ilk adımların atılması',
    daysAfterStatusChange: 1,
    priority: 'HIGH',
    isActive: true
  }
]