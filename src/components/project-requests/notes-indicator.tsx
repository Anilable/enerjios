'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { ProjectRequestNote, NOTE_PRIORITY_COLORS } from '@/types/note'
import { NotesAPI } from '@/lib/api/notes'
import { Badge } from '@/components/ui/badge'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Button } from '@/components/ui/button'
import {
  MessageSquare,
  Lock,
  User,
  Clock,
  AlertTriangle,
  Info,
  CheckCircle,
  Plus
} from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { tr } from 'date-fns/locale'

interface NotesIndicatorProps {
  projectRequestId: string
  customerName?: string
  onManageNotes?: () => void
  compact?: boolean
  showCount?: boolean
  request?: any // Full project request object for fallback handling
}

export function NotesIndicator({
  projectRequestId,
  customerName = '',
  onManageNotes,
  compact = false,
  showCount = true
}: NotesIndicatorProps) {
  const [notes, setNotes] = useState<ProjectRequestNote[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [hasHighPriority, setHasHighPriority] = useState(false)
  const { data: session } = useSession()

  useEffect(() => {
    if (projectRequestId && session && ['ADMIN', 'COMPANY'].includes(session.user.role)) {
      loadNotes()
    }
  }, [projectRequestId, session])

  const loadNotes = async () => {
    try {
      setIsLoading(true)
      const fetchedNotes = await NotesAPI.getByProjectRequestId(projectRequestId)
      setNotes(fetchedNotes)
      setHasHighPriority(fetchedNotes.some(note => note.priority === 'HIGH'))
    } catch (error) {
      console.error('Error loading notes for indicator:', error)
      setNotes([])
      setHasHighPriority(false)
    } finally {
      setIsLoading(false)
    }
  }

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'HIGH': return <AlertTriangle className="w-3 h-3" />
      case 'MEDIUM': return <Info className="w-3 h-3" />
      case 'LOW': return <CheckCircle className="w-3 h-3" />
      default: return <Info className="w-3 h-3" />
    }
  }

  const getIndicatorColor = () => {
    if (notes.length === 0) return 'bg-gray-400'
    if (hasHighPriority) return 'bg-red-500 animate-pulse'
    if (notes.some(note => note.priority === 'MEDIUM')) return 'bg-yellow-500'
    return 'bg-blue-500'
  }

  const truncateText = (text: string, maxLength: number = 100) => {
    if (text.length <= maxLength) return text
    return text.slice(0, maxLength) + '...'
  }

  // Don't show notes indicator for unauthorized users
  if (!session || !['ADMIN', 'COMPANY'].includes(session.user.role)) {
    return null
  }

  if (notes.length === 0 && !compact) return null

  const NotesButton = (
    <Button
      variant="ghost"
      size={compact ? "sm" : "default"}
      className={`
        relative p-1 h-auto min-h-0
        ${notes.length > 0 ? 'hover:bg-blue-50' : 'hover:bg-gray-50'}
      `}
      onClick={(e) => {
        e.stopPropagation()
        onManageNotes?.()
      }}
    >
      <MessageSquare className={`${compact ? 'w-3 h-3' : 'w-4 h-4'} text-gray-600`} />
      {showCount && (
        <div className={`
          absolute -top-1 -right-1 ${getIndicatorColor()} text-white text-xs
          rounded-full w-4 h-4 flex items-center justify-center font-bold
          ${compact ? 'text-[10px] w-3 h-3' : ''}
        `}>
          {notes.length > 99 ? '99+' : notes.length}
        </div>
      )}
    </Button>
  )

  if (compact) {
    return NotesButton
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        {NotesButton}
      </PopoverTrigger>
      <PopoverContent className="w-80" align="end">
        <div className="space-y-3">
          {/* Header */}
          <div className="flex items-center justify-between">
            <h4 className="font-medium flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-blue-600" />
              Notlar
              {customerName && (
                <span className="text-sm text-muted-foreground">
                  - {customerName}
                </span>
              )}
            </h4>
            <Button
              size="sm"
              onClick={(e) => {
                e.stopPropagation()
                onManageNotes?.()
              }}
              className="h-6 px-2 text-xs"
            >
              <Plus className="w-3 h-3 mr-1" />
              Yönet
            </Button>
          </div>

          {/* Notes list */}
          <div className="space-y-2 max-h-80 overflow-y-auto">
            {isLoading ? (
              <div className="text-center text-sm text-muted-foreground py-4">
                Notlar yükleniyor...
              </div>
            ) : notes.length === 0 ? (
              <div className="text-center text-sm text-muted-foreground py-4">
                Henüz not eklenmemiş
              </div>
            ) : (
              notes.slice(0, 5).map((note, index) => (
                <div
                  key={note.id}
                  className="p-3 border rounded-lg hover:bg-gray-50 cursor-pointer text-sm"
                  onClick={(e) => {
                    e.stopPropagation()
                    onManageNotes?.()
                  }}
                >
                  {/* Note header */}
                  <div className="flex items-center gap-2 mb-2">
                    {getPriorityIcon(note.priority || 'MEDIUM')}
                    <Badge
                      className={`text-xs ${NOTE_PRIORITY_COLORS[note.priority || 'MEDIUM']}`}
                    >
                      {note.priority || 'MEDIUM'}
                    </Badge>
                    {note.isPrivate && (
                      <Lock className="w-3 h-3 text-purple-500" />
                    )}
                    {note.isEdited && (
                      <span className="text-xs text-gray-500">(düzenlenmiş)</span>
                    )}
                  </div>

                  {/* Note content */}
                  <p className="text-gray-700 mb-2 leading-relaxed">
                    {truncateText(note.content)}
                  </p>

                  {/* Note footer */}
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <User className="w-3 h-3" />
                      {note.createdByName}
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {formatDistanceToNow(new Date(note.createdAt), {
                        addSuffix: true,
                        locale: tr
                      })}
                    </div>
                  </div>
                </div>
              ))
            )}

            {notes.length > 5 && (
              <div className="text-center py-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation()
                    onManageNotes?.()
                  }}
                  className="text-xs text-blue-600 hover:text-blue-700"
                >
                  +{notes.length - 5} daha fazla not görüntüle
                </Button>
              </div>
            )}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}