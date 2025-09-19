import { ProjectRequestNote, CreateNoteData, UpdateNoteData } from '@/types/note'

const API_BASE_URL = '/api'

export class NotesAPI {
  // Get all notes for a project request
  static async getByProjectRequestId(projectRequestId: string): Promise<ProjectRequestNote[]> {
    const response = await fetch(`${API_BASE_URL}/project-requests/${projectRequestId}/notes-enhanced`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      throw new Error(`Failed to fetch notes: ${response.statusText}`)
    }

    return response.json()
  }

  // Create a new note
  static async create(projectRequestId: string, data: CreateNoteData): Promise<ProjectRequestNote> {
    console.log('📝 Creating note for project:', projectRequestId, data)

    const response = await fetch(`${API_BASE_URL}/project-requests/${projectRequestId}/notes-enhanced`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('❌ Failed to create note:', errorText)
      throw new Error(`Failed to create note: ${response.status} ${response.statusText} - ${errorText}`)
    }

    const result = await response.json()
    console.log('✅ Note created successfully:', result.id)
    return result
  }

  // Get a specific note by ID
  static async getById(noteId: string): Promise<ProjectRequestNote> {
    const response = await fetch(`${API_BASE_URL}/notes/${noteId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      throw new Error(`Failed to fetch note: ${response.statusText}`)
    }

    return response.json()
  }

  // Update a note
  static async update(noteId: string, data: UpdateNoteData): Promise<ProjectRequestNote> {
    console.log('📝 Updating note:', noteId, data)

    const response = await fetch(`${API_BASE_URL}/notes/${noteId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('❌ Failed to update note:', errorText)
      throw new Error(`Failed to update note: ${response.status} ${response.statusText} - ${errorText}`)
    }

    const result = await response.json()
    console.log('✅ Note updated successfully:', result.id)
    return result
  }

  // Delete a note
  static async delete(noteId: string): Promise<void> {
    console.log('🗑️ Deleting note:', noteId)

    const response = await fetch(`${API_BASE_URL}/notes/${noteId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('❌ Failed to delete note:', errorText)
      throw new Error(`Failed to delete note: ${response.status} ${response.statusText} - ${errorText}`)
    }

    console.log('✅ Note deleted successfully')
  }
}