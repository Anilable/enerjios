export interface ProjectRequestNote {
  id: string
  projectRequestId: string
  content: string
  createdAt: string
  updatedAt: string
  createdBy: string
  createdByName: string
  createdByRole?: string
  isEdited: boolean
  tags?: string[]
  priority?: 'LOW' | 'MEDIUM' | 'HIGH'
  isPrivate?: boolean
}

export interface CreateNoteData {
  content: string
  tags?: string[]
  priority?: 'LOW' | 'MEDIUM' | 'HIGH'
  isPrivate?: boolean
}

export interface UpdateNoteData {
  content?: string
  tags?: string[]
  priority?: 'LOW' | 'MEDIUM' | 'HIGH'
  isPrivate?: boolean
}

export const NOTE_PRIORITY_LABELS: Record<string, string> = {
  LOW: 'Düşük',
  MEDIUM: 'Orta',
  HIGH: 'Yüksek'
}

export const NOTE_PRIORITY_COLORS: Record<string, string> = {
  LOW: 'bg-green-100 text-green-800 border-green-200',
  MEDIUM: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  HIGH: 'bg-red-100 text-red-800 border-red-200'
}