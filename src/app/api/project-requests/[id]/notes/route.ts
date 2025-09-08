import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { PrismaClient } from '@prisma/client'
import { authOptions } from '@/lib/auth'

const prisma = new PrismaClient()

interface Params {
  id: string
}

export async function POST(
  request: NextRequest,
  { params }: { params: Params }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Only allow ADMIN and COMPANY roles to add notes
    if (!['ADMIN', 'COMPANY'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()
    const { note } = body

    if (!note || typeof note !== 'string' || note.trim().length === 0) {
      return NextResponse.json({ error: 'Note is required and must be a non-empty string' }, { status: 400 })
    }

    // Get current request
    const currentRequest = await prisma.projectRequest.findUnique({
      where: { id: params.id }
    })

    if (!currentRequest) {
      return NextResponse.json({ error: 'Project request not found' }, { status: 404 })
    }

    // Get current notes array
    const currentNotes = Array.isArray(currentRequest.notes) ? currentRequest.notes as string[] : []
    
    // Add timestamp and user info to the note
    const timestampedNote = `[${new Date().toISOString()}] ${session.user.name || 'Unknown User'}: ${note.trim()}`
    const updatedNotes = [...currentNotes, timestampedNote]

    // Update the request with new notes
    const updatedRequest = await prisma.projectRequest.update({
      where: { id: params.id },
      data: { 
        notes: updatedNotes,
        updatedAt: new Date()
      },
      include: {
        customer: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            companyName: true,
            type: true
          }
        },
        assignedEngineer: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        statusHistory: {
          orderBy: { timestamp: 'desc' },
          take: 5,
          include: {
            user: {
              select: {
                name: true
              }
            }
          }
        }
      }
    })

    // Transform response
    const response = {
      id: updatedRequest.id,
      customerName: updatedRequest.customerName,
      customerEmail: updatedRequest.customerEmail,
      customerPhone: updatedRequest.customerPhone || '',
      location: updatedRequest.location || '',
      address: updatedRequest.address || '',
      projectType: updatedRequest.projectType,
      estimatedCapacity: updatedRequest.estimatedCapacity || 0,
      estimatedBudget: updatedRequest.estimatedBudget,
      estimatedRevenue: updatedRequest.estimatedRevenue,
      description: updatedRequest.description || '',
      status: updatedRequest.status,
      priority: updatedRequest.priority,
      source: updatedRequest.source,
      hasPhotos: updatedRequest.hasPhotos,
      scheduledVisitDate: updatedRequest.scheduledVisitDate?.toISOString(),
      assignedEngineerId: updatedRequest.assignedEngineerId,
      assignedEngineerName: updatedRequest.assignedEngineer?.name,
      tags: Array.isArray(updatedRequest.tags) ? updatedRequest.tags : [],
      notes: Array.isArray(updatedRequest.notes) ? updatedRequest.notes : [],
      createdAt: updatedRequest.createdAt.toISOString(),
      updatedAt: updatedRequest.updatedAt.toISOString(),
      statusHistory: updatedRequest.statusHistory.map(history => ({
        id: history.id,
        status: history.status,
        timestamp: history.timestamp.toISOString(),
        userId: history.userId,
        userName: history.userName,
        note: history.note
      }))
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('Error adding note to project request:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}