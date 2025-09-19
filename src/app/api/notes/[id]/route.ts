import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from '@/lib/get-session'
import { prisma } from '@/lib/prisma'
import { UpdateNoteData } from '@/types/note'

interface Params {
  id: string
}

// GET - Fetch a specific note
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<Params> }
) {
  try {
    const session = await getServerSession()

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id: noteId } = await params

    const note = await prisma.projectRequestNote.findUnique({
      where: { id: noteId },
      include: {
        projectRequest: {
          select: {
            id: true,
            customerName: true
          }
        }
      }
    })

    if (!note) {
      return NextResponse.json({ error: 'Note not found' }, { status: 404 })
    }

    // Check permissions: Only admin, the creator, company users, or installation team can view
    if (session.user.role !== 'ADMIN' &&
        note.createdBy !== session.user.id &&
        session.user.role !== 'COMPANY' &&
        session.user.role !== 'INSTALLATION_TEAM') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Don't show private notes to other users (except admin)
    if (note.isPrivate &&
        session.user.role !== 'ADMIN' &&
        note.createdBy !== session.user.id) {
      return NextResponse.json({ error: 'Note not found' }, { status: 404 })
    }

    return NextResponse.json(note)
  } catch (error) {
    console.error('Error fetching note:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// PUT - Update a note
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<Params> }
) {
  try {
    const session = await getServerSession()

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json() as UpdateNoteData
    const { content, tags, priority, isPrivate } = body

    if (content !== undefined) {
      if (typeof content !== 'string' || content.trim().length === 0) {
        return NextResponse.json({ error: 'Note content must be a non-empty string' }, { status: 400 })
      }
      if (content.length > 2000) {
        return NextResponse.json({ error: 'Note content must be less than 2000 characters' }, { status: 400 })
      }
    }

    const { id: noteId } = await params

    // Find the existing note
    const existingNote = await prisma.projectRequestNote.findUnique({
      where: { id: noteId }
    })

    if (!existingNote) {
      return NextResponse.json({ error: 'Note not found' }, { status: 404 })
    }

    // Check permissions: Only admin or the creator can edit
    if (session.user.role !== 'ADMIN' && existingNote.createdBy !== session.user.id) {
      return NextResponse.json({ error: 'You can only edit your own notes' }, { status: 403 })
    }

    // Update the note
    const updatedNote = await prisma.projectRequestNote.update({
      where: { id: noteId },
      data: {
        ...(content !== undefined && { content: content.trim() }),
        ...(tags !== undefined && { tags }),
        ...(priority !== undefined && { priority }),
        ...(isPrivate !== undefined && { isPrivate }),
        isEdited: true,
        updatedAt: new Date()
      }
    })

    // Update the project request's updatedAt timestamp
    await prisma.projectRequest.update({
      where: { id: existingNote.projectRequestId },
      data: { updatedAt: new Date() }
    })

    return NextResponse.json(updatedNote)
  } catch (error) {
    console.error('Error updating note:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// DELETE - Delete a note
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<Params> }
) {
  try {
    const session = await getServerSession()

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id: noteId } = await params

    // Find the existing note
    const existingNote = await prisma.projectRequestNote.findUnique({
      where: { id: noteId }
    })

    if (!existingNote) {
      return NextResponse.json({ error: 'Note not found' }, { status: 404 })
    }

    // Check permissions: Only admin or the creator can delete
    if (session.user.role !== 'ADMIN' && existingNote.createdBy !== session.user.id) {
      return NextResponse.json({ error: 'You can only delete your own notes' }, { status: 403 })
    }

    // Delete the note
    await prisma.projectRequestNote.delete({
      where: { id: noteId }
    })

    // Update the project request's updatedAt timestamp
    await prisma.projectRequest.update({
      where: { id: existingNote.projectRequestId },
      data: { updatedAt: new Date() }
    })

    return NextResponse.json({ message: 'Note deleted successfully' })
  } catch (error) {
    console.error('Error deleting note:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}