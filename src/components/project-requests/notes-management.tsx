'use client'

import { useState, useEffect, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import { ProjectRequestNote, CreateNoteData, UpdateNoteData, NOTE_PRIORITY_LABELS, NOTE_PRIORITY_COLORS } from '@/types/note'
import { NotesAPI } from '@/lib/api/notes'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { useToast } from '@/hooks/use-toast'
import {
  MessageSquare,
  Plus,
  Edit3,
  Trash2,
  Clock,
  User,
  Lock,
  Globe,
  Tag,
  AlertTriangle,
  CheckCircle,
  Info,
  Loader2,
  X
} from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { tr } from 'date-fns/locale'

interface NotesManagementProps {
  projectRequestId: string
  projectRequestCustomerName?: string
  isOpen: boolean
  onClose: () => void
  onNotesUpdate?: () => void
}

interface NoteFormData {
  content: string
  priority: 'LOW' | 'MEDIUM' | 'HIGH'
  isPrivate: boolean
  tags: string[]
}

export function NotesManagement({
  projectRequestId,
  projectRequestCustomerName = '',
  isOpen,
  onClose,
  onNotesUpdate
}: NotesManagementProps) {
  const [notes, setNotes] = useState<ProjectRequestNote[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isCreating, setIsCreating] = useState(false)
  const [isEditing, setIsEditing] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState<string | null>(null)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [editingNote, setEditingNote] = useState<ProjectRequestNote | null>(null)
  const [deleteConfirmNote, setDeleteConfirmNote] = useState<ProjectRequestNote | null>(null)

  const [formData, setFormData] = useState<NoteFormData>({
    content: '',
    priority: 'MEDIUM',
    isPrivate: false,
    tags: []
  })

  const [tagInput, setTagInput] = useState('')

  const { data: session } = useSession()
  const { toast } = useToast()

  // Load notes
  const loadNotes = useCallback(async () => {
    if (!projectRequestId) return

    try {
      setIsLoading(true)
      const fetchedNotes = await NotesAPI.getByProjectRequestId(projectRequestId)
      setNotes(fetchedNotes)
    } catch (error) {
      console.error('Error loading notes:', error)
      toast({
        title: 'Hata',
        description: 'Notlar yüklenirken hata oluştu',
        variant: 'destructive'
      })
    } finally {
      setIsLoading(false)
    }
  }, [projectRequestId, toast])

  useEffect(() => {
    if (isOpen && projectRequestId) {
      loadNotes()
    }
  }, [isOpen, projectRequestId, loadNotes])

  // Reset form
  const resetForm = () => {
    setFormData({
      content: '',
      priority: 'MEDIUM',
      isPrivate: false,
      tags: []
    })
    setTagInput('')
    setShowCreateForm(false)
    setEditingNote(null)
  }

  // Handle tag management
  const addTag = () => {
    const trimmedTag = tagInput.trim()
    if (trimmedTag && !formData.tags.includes(trimmedTag)) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, trimmedTag]
      }))
      setTagInput('')
    }
  }

  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }))
  }

  const handleTagInputKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      addTag()
    }
  }

  // Create note
  const handleCreateNote = async () => {
    if (!formData.content.trim()) {
      toast({
        title: 'Hata',
        description: 'Not içeriği boş olamaz',
        variant: 'destructive'
      })
      return
    }

    try {
      setIsCreating(true)

      const createData: CreateNoteData = {
        content: formData.content.trim(),
        tags: formData.tags,
        priority: formData.priority,
        isPrivate: formData.isPrivate
      }

      await NotesAPI.create(projectRequestId, createData)

      toast({
        title: 'Başarılı',
        description: 'Not başarıyla eklendi',
      })

      resetForm()
      await loadNotes()
      onNotesUpdate?.()
    } catch (error) {
      console.error('Error creating note:', error)
      toast({
        title: 'Hata',
        description: 'Not eklenirken hata oluştu',
        variant: 'destructive'
      })
    } finally {
      setIsCreating(false)
    }
  }

  // Start editing
  const startEdit = (note: ProjectRequestNote) => {
    setEditingNote(note)
    setFormData({
      content: note.content,
      priority: note.priority || 'MEDIUM',
      isPrivate: note.isPrivate || false,
      tags: Array.isArray(note.tags) ? note.tags as string[] : []
    })
    setShowCreateForm(true)
  }

  // Update note
  const handleUpdateNote = async () => {
    if (!editingNote || !formData.content.trim()) {
      toast({
        title: 'Hata',
        description: 'Not içeriği boş olamaz',
        variant: 'destructive'
      })
      return
    }

    try {
      setIsEditing(editingNote.id)

      const updateData: UpdateNoteData = {
        content: formData.content.trim(),
        tags: formData.tags,
        priority: formData.priority,
        isPrivate: formData.isPrivate
      }

      await NotesAPI.update(editingNote.id, updateData)

      toast({
        title: 'Başarılı',
        description: 'Not başarıyla güncellendi',
      })

      resetForm()
      await loadNotes()
      onNotesUpdate?.()
    } catch (error) {
      console.error('Error updating note:', error)
      toast({
        title: 'Hata',
        description: 'Not güncellenirken hata oluştu',
        variant: 'destructive'
      })
    } finally {
      setIsEditing(null)
    }
  }

  // Delete note
  const handleDeleteNote = async (note: ProjectRequestNote) => {
    try {
      setIsDeleting(note.id)
      await NotesAPI.delete(note.id)

      toast({
        title: 'Başarılı',
        description: 'Not başarıyla silindi',
      })

      setDeleteConfirmNote(null)
      await loadNotes()
      onNotesUpdate?.()
    } catch (error) {
      console.error('Error deleting note:', error)
      toast({
        title: 'Hata',
        description: 'Not silinirken hata oluştu',
        variant: 'destructive'
      })
    } finally {
      setIsDeleting(null)
    }
  }

  const canEditNote = (note: ProjectRequestNote) => {
    return session?.user?.role === 'ADMIN' || note.createdBy === session?.user?.id
  }

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'HIGH': return <AlertTriangle className="w-4 h-4" />
      case 'MEDIUM': return <Info className="w-4 h-4" />
      case 'LOW': return <CheckCircle className="w-4 h-4" />
      default: return <Info className="w-4 h-4" />
    }
  }

  return (
    <>
      {/* Main Notes Dialog */}
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              <MessageSquare className="w-6 h-6 text-blue-600" />
              Notlar - {projectRequestCustomerName}
            </DialogTitle>
            <DialogDescription>
              Proje talebi için notları görüntüleyin, düzenleyin ve yönetin
            </DialogDescription>
          </DialogHeader>

          <div className="flex-1 overflow-hidden flex flex-col gap-4">
            {/* Add New Note Button */}
            <div className="flex justify-between items-center">
              <div className="text-sm text-muted-foreground">
                Toplam {notes.length} not
              </div>
              <Button
                onClick={() => setShowCreateForm(true)}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Plus className="w-4 h-4 mr-2" />
                Yeni Not
              </Button>
            </div>

            {/* Create/Edit Form */}
            {showCreateForm && (
              <Card className="border-2 border-blue-200">
                <CardHeader>
                  <CardTitle className="text-lg">
                    {editingNote ? 'Notu Düzenle' : 'Yeni Not Ekle'}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Content */}
                  <div>
                    <label className="text-sm font-medium mb-2 block">Not İçeriği</label>
                    <Textarea
                      value={formData.content}
                      onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                      placeholder="Notunuzu buraya yazın..."
                      className="min-h-[100px]"
                      maxLength={2000}
                    />
                    <div className="text-xs text-muted-foreground mt-1">
                      {formData.content.length}/2000 karakter
                    </div>
                  </div>

                  {/* Priority and Privacy */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium mb-2 block">Öncelik</label>
                      <Select
                        value={formData.priority}
                        onValueChange={(value: any) => setFormData(prev => ({ ...prev, priority: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="LOW">Düşük</SelectItem>
                          <SelectItem value="MEDIUM">Orta</SelectItem>
                          <SelectItem value="HIGH">Yüksek</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="flex items-end">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="isPrivate"
                          checked={formData.isPrivate}
                          onCheckedChange={(checked) =>
                            setFormData(prev => ({ ...prev, isPrivate: !!checked }))
                          }
                        />
                        <label htmlFor="isPrivate" className="text-sm font-medium">
                          Özel not
                        </label>
                      </div>
                    </div>
                  </div>

                  {/* Tags */}
                  <div>
                    <label className="text-sm font-medium mb-2 block">Etiketler</label>
                    <div className="flex flex-wrap gap-2 mb-2">
                      {formData.tags.map((tag, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {tag}
                          <button
                            onClick={() => removeTag(tag)}
                            className="ml-1 hover:text-red-500"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <Input
                        value={tagInput}
                        onChange={(e) => setTagInput(e.target.value)}
                        onKeyPress={handleTagInputKeyPress}
                        placeholder="Etiket ekle..."
                        className="text-sm"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={addTag}
                        disabled={!tagInput.trim()}
                      >
                        Ekle
                      </Button>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 pt-2">
                    <Button
                      onClick={editingNote ? handleUpdateNote : handleCreateNote}
                      disabled={!formData.content.trim() || isCreating || !!isEditing}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      {(isCreating || isEditing) ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          {editingNote ? 'Güncelleniyor...' : 'Kaydediliyor...'}
                        </>
                      ) : (
                        <>
                          <CheckCircle className="w-4 h-4 mr-2" />
                          {editingNote ? 'Güncelle' : 'Kaydet'}
                        </>
                      )}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={resetForm}
                      disabled={isCreating || !!isEditing}
                    >
                      İptal
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Notes List */}
            <div className="flex-1 overflow-y-auto space-y-3">
              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
                  <span className="ml-2 text-muted-foreground">Notlar yükleniyor...</span>
                </div>
              ) : notes.length === 0 ? (
                <Card className="border-dashed border-2 border-gray-300">
                  <CardContent className="py-8 text-center">
                    <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                    <div className="text-gray-600 font-medium mb-1">Henüz not eklenmemiş</div>
                    <div className="text-gray-500 text-sm">İlk notu eklemek için yukarıdaki butonu kullanın</div>
                  </CardContent>
                </Card>
              ) : (
                notes.map((note) => (
                  <Card key={note.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      {/* Header */}
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-2">
                            {getPriorityIcon(note.priority || 'MEDIUM')}
                            <Badge className={NOTE_PRIORITY_COLORS[note.priority || 'MEDIUM']}>
                              {NOTE_PRIORITY_LABELS[note.priority || 'MEDIUM']}
                            </Badge>
                          </div>

                          {note.isPrivate && (
                            <Badge variant="outline" className="text-purple-600 border-purple-200">
                              <Lock className="w-3 h-3 mr-1" />
                              Özel
                            </Badge>
                          )}

                          {note.isEdited && (
                            <Badge variant="outline" className="text-gray-500">
                              Düzenlenmiş
                            </Badge>
                          )}
                        </div>

                        {canEditNote(note) && (
                          <div className="flex gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => startEdit(note)}
                              disabled={!!isEditing}
                              className="h-8 w-8 p-0"
                            >
                              <Edit3 className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setDeleteConfirmNote(note)}
                              disabled={!!isDeleting}
                              className="h-8 w-8 p-0 hover:text-red-600"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        )}
                      </div>

                      {/* Content */}
                      <div className="mb-3">
                        <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                          {note.content}
                        </p>
                      </div>

                      {/* Tags */}
                      {note.tags && Array.isArray(note.tags) && (note.tags as string[]).length > 0 && (
                        <div className="flex flex-wrap gap-1 mb-3">
                          {(note.tags as string[]).map((tag, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              <Tag className="w-3 h-3 mr-1" />
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      )}

                      {/* Footer */}
                      <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t">
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-1">
                            <User className="w-3 h-3" />
                            {note.createdByName}
                            {note.createdByRole && (
                              <span className="text-gray-400">({note.createdByRole})</span>
                            )}
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
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!deleteConfirmNote} onOpenChange={() => setDeleteConfirmNote(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Notu Sil</DialogTitle>
            <DialogDescription>
              Bu notu silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.
            </DialogDescription>
          </DialogHeader>

          {deleteConfirmNote && (
            <div className="py-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm font-medium text-gray-900 mb-2">
                  {deleteConfirmNote.createdByName} tarafından oluşturuldu
                </p>
                <p className="text-sm text-gray-600 line-clamp-3">
                  {deleteConfirmNote.content}
                </p>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteConfirmNote(null)}
              disabled={!!isDeleting}
            >
              İptal
            </Button>
            <Button
              variant="destructive"
              onClick={() => deleteConfirmNote && handleDeleteNote(deleteConfirmNote)}
              disabled={!!isDeleting}
            >
              {isDeleting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Siliniyor...
                </>
              ) : (
                <>
                  <Trash2 className="w-4 h-4 mr-2" />
                  Sil
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}