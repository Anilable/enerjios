import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from '@/lib/server-session'
import { prisma } from '@/lib/prisma'
import { CalendarNoteType } from '@prisma/client'

// PATCH - Update calendar note
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  try {
    const session = await getServerSession()
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Check if note exists and belongs to user
    const existingNote = await prisma.calendarNote.findUnique({
      where: { id }
    })

    if (!existingNote) {
      return NextResponse.json(
        { error: 'Calendar note not found' },
        { status: 404 }
      )
    }

    if (existingNote.createdBy !== session.user.id) {
      return NextResponse.json(
        { error: 'Not authorized to update this note' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { date, title, content, type } = body

    // Validate date format if provided
    if (date) {
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/
      if (!dateRegex.test(date)) {
        return NextResponse.json(
          { error: 'Invalid date format. Use YYYY-MM-DD format' },
          { status: 400 }
        )
      }
    }

    // Validate type if provided
    if (type && !Object.values(CalendarNoteType).includes(type)) {
      return NextResponse.json(
        { error: 'Invalid note type' },
        { status: 400 }
      )
    }

    const updatedNote = await prisma.calendarNote.update({
      where: { id },
      data: {
        ...(date && { date }),
        ...(title && { title }),
        ...(content && { content }),
        ...(type && { type })
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    })

    console.log('✅ Calendar note updated successfully:', updatedNote.id)

    return NextResponse.json(updatedNote)
  } catch (error) {
    console.error('❌ Error updating calendar note:', error)
    return NextResponse.json(
      {
        error: 'Failed to update calendar note',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

// DELETE - Delete calendar note
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  try {
    const session = await getServerSession()
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Check if note exists and belongs to user
    const existingNote = await prisma.calendarNote.findUnique({
      where: { id }
    })

    if (!existingNote) {
      return NextResponse.json(
        { error: 'Calendar note not found' },
        { status: 404 }
      )
    }

    if (existingNote.createdBy !== session.user.id) {
      return NextResponse.json(
        { error: 'Not authorized to delete this note' },
        { status: 403 }
      )
    }

    await prisma.calendarNote.delete({
      where: { id }
    })

    console.log('✅ Calendar note deleted successfully:', id)

    return NextResponse.json({
      message: 'Calendar note deleted successfully'
    })
  } catch (error) {
    console.error('❌ Error deleting calendar note:', error)
    return NextResponse.json(
      {
        error: 'Failed to delete calendar note',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}