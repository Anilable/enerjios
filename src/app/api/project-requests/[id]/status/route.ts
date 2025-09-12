import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

interface Params {
  id: string
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<Params> }
) {
  try {
    const { id } = await params
    console.log('[STATUS_UPDATE] Starting request for ID:', id)
    
    const session = await getServerSession(authOptions)
    
    console.log('[STATUS_UPDATE] Session check:', {
      hasSession: !!session,
      userId: session?.user?.id,
      userRole: session?.user?.role,
      userEmail: session?.user?.email
    })
    
    if (!session) {
      console.log('[STATUS_UPDATE] No session found')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Only allow ADMIN and COMPANY roles to update status
    if (!['ADMIN', 'COMPANY'].includes(session.user.role)) {
      console.log('[STATUS_UPDATE] Insufficient role:', session.user.role)
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()
    const { status, note } = body
    
    console.log('[STATUS_UPDATE] Request body:', { status, note })

    if (!status) {
      return NextResponse.json({ error: 'Status is required' }, { status: 400 })
    }

    // Validate status enum
    const validStatuses = ['OPEN', 'CONTACTED', 'ASSIGNED', 'SITE_VISIT', 'CONVERTED_TO_PROJECT', 'LOST']
    if (!validStatuses.includes(status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 })
    }

    // Get current request
    console.log('[STATUS_UPDATE] Fetching project request...')
    const currentRequest = await prisma.projectRequest.findUnique({
      where: { id }
    })

    if (!currentRequest) {
      console.log('[STATUS_UPDATE] Project request not found:', id)
      return NextResponse.json({ error: 'Project request not found' }, { status: 404 })
    }

    console.log('[STATUS_UPDATE] Current request found:', {
      id: currentRequest.id,
      currentStatus: currentRequest.status,
      newStatus: status
    })

    // Don't update if status is the same
    if (currentRequest.status === status) {
      console.log('[STATUS_UPDATE] Status already set to:', status)
      return NextResponse.json({ message: 'Status is already set to this value' })
    }

    // Update the status
    console.log('[STATUS_UPDATE] Updating project request status...')
    const updatedRequest = await prisma.projectRequest.update({
      where: { id },
      data: { 
        status: status as any,
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
        }
      }
    })
    
    console.log('[STATUS_UPDATE] Project request updated successfully:', {
      id: updatedRequest.id,
      newStatus: updatedRequest.status
    })

    // Create status history entry
    await prisma.projectRequestStatusHistory.create({
      data: {
        projectRequestId: id,
        status: status as any,
        previousStatus: currentRequest.status,
        userId: session.user.id,
        userName: session.user.name || 'Unknown User',
        note: note || `Durum ${getStatusLabel(status)} olarak güncellendi`
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
      statusHistory: [{
        id: 'new',
        status: updatedRequest.status,
        timestamp: new Date().toISOString(),
        userId: session.user.id,
        userName: session.user.name || 'Unknown User',
        note: note || `Durum ${getStatusLabel(status)} olarak güncellendi`
      }]
    }

    console.log('[STATUS_UPDATE] Returning successful response')
    return NextResponse.json(response)
  } catch (error) {
    console.error('[STATUS_UPDATE] Error updating project request status:', error)
    
    // More detailed error logging
    if (error instanceof Error) {
      console.error('[STATUS_UPDATE] Error details:', {
        name: error.name,
        message: error.message,
        stack: error.stack
      })
    }
    
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

function getStatusLabel(status: string): string {
  switch (status) {
    case 'OPEN': return 'Açık'
    case 'CONTACTED': return 'İletişime Geçildi'
    case 'ASSIGNED': return 'Atama Yapıldı'
    case 'SITE_VISIT': return 'Saha Ziyareti'
    case 'CONVERTED_TO_PROJECT': return 'Projeye Dönüştürüldü'
    case 'LOST': return 'Kaybedildi'
    default: return status
  }
}