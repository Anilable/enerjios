import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from '@/lib/get-session'
import { prisma } from '@/lib/prisma'
import { CreateNoteData, UpdateNoteData } from '@/types/note'

interface Params {
  id: string
}

// GET - Fetch all notes for a project request
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<Params> }
) {
  try {
    const session = await getServerSession()

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Only allow ADMIN, COMPANY, and assigned engineers to view notes
    if (!['ADMIN', 'COMPANY'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { id: projectRequestId } = await params

    // Verify project request exists and user has permission to view it
    const projectRequest = await prisma.projectRequest.findUnique({
      where: { id: projectRequestId }
    })

    if (!projectRequest) {
      return NextResponse.json({ error: 'Project request not found' }, { status: 404 })
    }

    // Get all notes for this project request
    const notes = await prisma.projectRequestNote.findMany({
      where: {
        projectRequestId,
        // If not admin, don't show private notes from other users
        ...(session.user.role !== 'ADMIN' && {
          OR: [
            { isPrivate: false },
            { createdBy: session.user.id }
          ]
        })
      },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json(notes)
  } catch (error) {
    console.error('Error fetching notes:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST - Create a new note
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<Params> }
) {
  try {
    const session = await getServerSession()

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Only allow ADMIN and COMPANY roles to create notes
    if (!['ADMIN', 'COMPANY'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json() as CreateNoteData
    const { content, tags, priority, isPrivate } = body

    if (!content || typeof content !== 'string' || content.trim().length === 0) {
      return NextResponse.json({ error: 'Note content is required and must be a non-empty string' }, { status: 400 })
    }

    if (content.length > 2000) {
      return NextResponse.json({ error: 'Note content must be less than 2000 characters' }, { status: 400 })
    }

    const { id: projectRequestId } = await params

    // Verify project request exists
    const projectRequest = await prisma.projectRequest.findUnique({
      where: { id: projectRequestId }
    })

    if (!projectRequest) {
      return NextResponse.json({ error: 'Project request not found' }, { status: 404 })
    }

    // Create the note
    const note = await prisma.projectRequestNote.create({
      data: {
        projectRequestId,
        content: content.trim(),
        tags: tags || [],
        priority: priority || 'MEDIUM',
        isPrivate: isPrivate || false,
        createdBy: session.user.id,
        createdByName: session.user.name || 'Unknown User',
        createdByRole: session.user.role
      }
    })

    // Update the project request's updatedAt timestamp
    await prisma.projectRequest.update({
      where: { id: projectRequestId },
      data: { updatedAt: new Date() }
    })

    return NextResponse.json(note, { status: 201 })
  } catch (error) {
    console.error('Error creating note:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}