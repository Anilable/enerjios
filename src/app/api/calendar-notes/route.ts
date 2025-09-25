import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from '@/lib/server-session'
import { prisma } from '@/lib/prisma'
import { CalendarNoteType } from '@prisma/client'

// GET - Fetch calendar notes for current user
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession()
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const date = searchParams.get('date') // Optional: filter by specific date

    // Debug: Log user role
    console.log('📅 Calendar Notes API - User role:', session.user.role)

    // If user is installation team, they can see all notes
    // Otherwise, they can only see their own notes
    const where: any = session.user.role === 'INSTALLATION_TEAM' ? {} : {
      createdBy: session.user.id
    }

    console.log('📅 Calendar Notes API - Where clause:', where)

    if (date) {
      where.date = date
    }

    const notes = await prisma.calendarNote.findMany({
      where,
      orderBy: {
        createdAt: 'desc'
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

    return NextResponse.json(notes)
  } catch (error) {
    console.error('Error fetching calendar notes:', error)
    return NextResponse.json(
      { error: 'Failed to fetch calendar notes' },
      { status: 500 }
    )
  }
}

// POST - Create new calendar note
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession()
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { date, title, content, type = 'NOTE' } = body

    // Validate required fields
    if (!date || !title || !content) {
      return NextResponse.json(
        { error: 'Missing required fields: date, title, content are required' },
        { status: 400 }
      )
    }

    // Validate date format (YYYY-MM-DD)
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/
    if (!dateRegex.test(date)) {
      return NextResponse.json(
        { error: 'Invalid date format. Use YYYY-MM-DD format' },
        { status: 400 }
      )
    }

    // Validate type
    if (!Object.values(CalendarNoteType).includes(type)) {
      return NextResponse.json(
        { error: 'Invalid note type' },
        { status: 400 }
      )
    }

    const note = await prisma.calendarNote.create({
      data: {
        date,
        title,
        content,
        type,
        createdBy: session.user.id
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

    console.log('✅ Calendar note created successfully:', note.id)

    return NextResponse.json(note, { status: 201 })
  } catch (error) {
    console.error('❌ Error creating calendar note:', error)
    return NextResponse.json(
      {
        error: 'Failed to create calendar note',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}