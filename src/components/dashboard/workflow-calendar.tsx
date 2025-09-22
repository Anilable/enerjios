'use client'

import { useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  Plus,
  Edit,
  Trash2,
  User,
  MessageSquare,
  AlertCircle,
  CheckCircle
} from 'lucide-react'

interface CalendarNote {
  id: string
  date: string
  title: string
  content: string
  type: 'task' | 'reminder' | 'event' | 'note'
  createdBy: string
}

interface WorkflowCalendarProps {
  projectRequests?: any[]
  notes?: CalendarNote[]
  onNoteAdd?: (note: Omit<CalendarNote, 'id'>) => void
  onNoteEdit?: (id: string, note: Partial<CalendarNote>) => void
  onNoteDelete?: (id: string) => void
}

interface DayData {
  date: Date
  day: number
  isCurrentMonth: boolean
  isToday: boolean
  notes: CalendarNote[]
  projectCount: number
}

export function WorkflowCalendar({
  projectRequests = [],
  notes = [],
  onNoteAdd,
  onNoteEdit,
  onNoteDelete
}: WorkflowCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [noteForm, setNoteForm] = useState({
    title: '',
    content: '',
    type: 'note' as 'task' | 'reminder' | 'event' | 'note'
  })
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null)

  const currentYear = currentDate.getFullYear()
  const currentMonth = currentDate.getMonth()

  // Generate calendar data
  const calendarData = useMemo(() => {
    const firstDayOfMonth = new Date(currentYear, currentMonth, 1)
    const lastDayOfMonth = new Date(currentYear, currentMonth + 1, 0)
    const firstDayOfWeek = firstDayOfMonth.getDay()
    const daysInMonth = lastDayOfMonth.getDate()

    // Calculate start and end dates for the calendar grid
    const startDate = new Date(firstDayOfMonth)
    startDate.setDate(startDate.getDate() - firstDayOfWeek)

    const endDate = new Date(lastDayOfMonth)
    const remainingDays = 6 - lastDayOfMonth.getDay()
    endDate.setDate(endDate.getDate() + remainingDays)

    const days: DayData[] = []
    const currentDayIter = new Date(startDate)
    const today = new Date()

    while (currentDayIter <= endDate) {
      const dateStr = currentDayIter.toISOString().split('T')[0]
      const dayNotes = notes.filter(note => note.date === dateStr)

      // Count project requests for this day
      const dayProjects = projectRequests.filter(request => {
        const requestDate = new Date(request.createdAt)
        return (
          requestDate.getDate() === currentDayIter.getDate() &&
          requestDate.getMonth() === currentDayIter.getMonth() &&
          requestDate.getFullYear() === currentDayIter.getFullYear()
        )
      })

      days.push({
        date: new Date(currentDayIter),
        day: currentDayIter.getDate(),
        isCurrentMonth: currentDayIter.getMonth() === currentMonth,
        isToday: (
          currentDayIter.getDate() === today.getDate() &&
          currentDayIter.getMonth() === today.getMonth() &&
          currentDayIter.getFullYear() === today.getFullYear()
        ),
        notes: dayNotes,
        projectCount: dayProjects.length
      })

      currentDayIter.setDate(currentDayIter.getDate() + 1)
    }

    return days
  }, [currentYear, currentMonth, notes, projectRequests])

  const goToPreviousMonth = () => {
    setCurrentDate(new Date(currentYear, currentMonth - 1, 1))
  }

  const goToNextMonth = () => {
    setCurrentDate(new Date(currentYear, currentMonth + 1, 1))
  }

  const monthNames = [
    'Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran',
    'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'
  ]

  const dayNames = ['Pz', 'Pt', 'Sa', 'Ça', 'Pe', 'Cu', 'Ct']

  const getNoteTypeColor = (type: string) => {
    switch (type) {
      case 'task': return 'bg-blue-100 text-blue-800'
      case 'reminder': return 'bg-yellow-100 text-yellow-800'
      case 'event': return 'bg-purple-100 text-purple-800'
      case 'note': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getNoteTypeLabel = (type: string) => {
    switch (type) {
      case 'task': return 'Görev'
      case 'reminder': return 'Hatırlatma'
      case 'event': return 'Etkinlik'
      case 'note': return 'Not'
      default: return 'Not'
    }
  }

  const handleAddNote = () => {
    if (!selectedDate || !noteForm.title) return

    const dateStr = selectedDate.toISOString().split('T')[0]

    if (onNoteAdd) {
      onNoteAdd({
        date: dateStr,
        title: noteForm.title,
        content: noteForm.content,
        type: noteForm.type,
        createdBy: 'current-user' // This should come from session
      })
    }

    // Reset form
    setNoteForm({ title: '', content: '', type: 'note' })
    setSelectedDate(null)
  }

  const handleEditNote = () => {
    if (!editingNoteId || !noteForm.title) return

    if (onNoteEdit) {
      onNoteEdit(editingNoteId, {
        title: noteForm.title,
        content: noteForm.content,
        type: noteForm.type
      })
    }

    // Reset form
    setNoteForm({ title: '', content: '', type: 'note' })
    setEditingNoteId(null)
  }

  const handleDeleteNote = (id: string) => {
    if (onNoteDelete) {
      onNoteDelete(id)
    }
  }

  const openEditModal = (note: CalendarNote) => {
    setNoteForm({
      title: note.title,
      content: note.content,
      type: note.type
    })
    setEditingNoteId(note.id)
    setSelectedDate(new Date(note.date))
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <CalendarIcon className="h-5 w-5" />
              İş Akışı Takvimi
            </CardTitle>
            <CardDescription>
              Projeler, görevler ve notlarınızı takip edin
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={goToPreviousMonth}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="font-semibold text-lg min-w-[120px] text-center">
              {monthNames[currentMonth]} {currentYear}
            </span>
            <Button
              variant="ghost"
              size="icon"
              onClick={goToNextMonth}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-7 gap-1">
          {/* Day Headers */}
          {dayNames.map((day) => (
            <div key={day} className="text-center text-xs font-semibold text-muted-foreground py-2">
              {day}
            </div>
          ))}

          {/* Calendar Days */}
          {calendarData.map((dayData, index) => (
            <Popover key={index}>
              <PopoverTrigger asChild>
                <Button
                  variant="ghost"
                  className={`
                    h-24 p-2 flex flex-col items-start justify-start hover:bg-gray-50 relative
                    ${!dayData.isCurrentMonth ? 'opacity-50' : ''}
                    ${dayData.isToday ? 'bg-blue-50 hover:bg-blue-100 font-bold' : ''}
                  `}
                  onClick={() => setSelectedDate(dayData.date)}
                >
                  <span className="text-sm">{dayData.day}</span>

                  {/* Notes Display */}
                  <div className="flex-1 w-full mt-1 space-y-1">
                    {/* Project Count Indicator */}
                    {dayData.projectCount > 0 && (
                      <div className="flex items-center gap-1">
                        <div className="w-2 h-2 bg-green-500 rounded-full" />
                        <span className="text-xs text-green-700 font-medium">{dayData.projectCount} proje</span>
                      </div>
                    )}

                    {/* Notes */}
                    {dayData.notes.slice(0, 3).map((note, i) => (
                      <div key={i} className="flex items-center gap-1">
                        <div
                          className={`w-2 h-2 rounded-full flex-shrink-0 ${
                            note.type === 'task' ? 'bg-blue-500' :
                            note.type === 'reminder' ? 'bg-yellow-500' :
                            note.type === 'event' ? 'bg-purple-500' :
                            'bg-gray-500'
                          }`}
                        />
                        <span className={`text-xs truncate ${
                          note.type === 'task' ? 'text-blue-700' :
                          note.type === 'reminder' ? 'text-yellow-700' :
                          note.type === 'event' ? 'text-purple-700' :
                          'text-gray-700'
                        }`}>
                          {note.title}
                        </span>
                      </div>
                    ))}

                    {dayData.notes.length > 3 && (
                      <div className="flex items-center gap-1">
                        <div className="w-2 h-2 bg-gray-300 rounded-full" />
                        <span className="text-xs text-gray-500">+{dayData.notes.length - 3} daha</span>
                      </div>
                    )}
                  </div>
                </Button>
              </PopoverTrigger>

              <PopoverContent className="w-96 p-4" align="start">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold">
                      {dayData.date.toLocaleDateString('tr-TR', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric'
                      })}
                    </h3>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setSelectedDate(dayData.date)
                        setNoteForm({ title: '', content: '', type: 'note' })
                        setEditingNoteId(null)
                      }}
                    >
                      <Plus className="h-3 w-3 mr-1" />
                      Not Ekle
                    </Button>
                  </div>

                  {/* Project Count */}
                  {dayData.projectCount > 0 && (
                    <div className="flex items-center gap-2 p-2 bg-green-50 rounded">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span className="text-sm">{dayData.projectCount} yeni proje talebi</span>
                    </div>
                  )}

                  {/* Notes List */}
                  {dayData.notes.length > 0 ? (
                    <div className="space-y-2">
                      {dayData.notes.map((note) => (
                        <div key={note.id} className="border rounded p-2 space-y-1">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <Badge className={getNoteTypeColor(note.type)} variant="secondary">
                                  {getNoteTypeLabel(note.type)}
                                </Badge>
                                <h4 className="font-medium text-sm">{note.title}</h4>
                              </div>
                              {note.content && (
                                <p className="text-xs text-muted-foreground mt-1">{note.content}</p>
                              )}
                            </div>
                            <div className="flex items-center gap-1">
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => openEditModal(note)}
                              >
                                <Edit className="h-3 w-3" />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleDeleteNote(note.id)}
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      Bu gün için not bulunmuyor
                    </p>
                  )}

                  {/* Add/Edit Note Form */}
                  {(selectedDate?.toDateString() === dayData.date.toDateString()) && (
                    <div className="border-t pt-4 space-y-3">
                      <div>
                        <Label>Başlık</Label>
                        <Input
                          value={noteForm.title}
                          onChange={(e) => setNoteForm(prev => ({ ...prev, title: e.target.value }))}
                          placeholder="Not başlığı..."
                        />
                      </div>
                      <div>
                        <Label>İçerik</Label>
                        <Textarea
                          value={noteForm.content}
                          onChange={(e) => setNoteForm(prev => ({ ...prev, content: e.target.value }))}
                          placeholder="Not içeriği..."
                          rows={3}
                        />
                      </div>
                      <div>
                        <Label>Tür</Label>
                        <select
                          value={noteForm.type}
                          onChange={(e) => setNoteForm(prev => ({ ...prev, type: e.target.value as any }))}
                          className="w-full p-2 border rounded"
                        >
                          <option value="note">Not</option>
                          <option value="task">Görev</option>
                          <option value="reminder">Hatırlatma</option>
                          <option value="event">Etkinlik</option>
                        </select>
                      </div>
                      <Button
                        onClick={editingNoteId ? handleEditNote : handleAddNote}
                        disabled={!noteForm.title}
                        className="w-full"
                      >
                        {editingNoteId ? 'Güncelle' : 'Ekle'}
                      </Button>
                    </div>
                  )}
                </div>
              </PopoverContent>
            </Popover>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}