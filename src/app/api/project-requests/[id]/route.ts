import { NextRequest, NextResponse } from 'next/server'

import { getServerSession } from '@/lib/get-session'
import { prisma } from '@/lib/prisma'

interface Params {
  id: string
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<Params> }
) {
  try {
    const session = await getServerSession()
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const projectRequest = await prisma.projectRequest.findUnique({
      where: { id },
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

    if (!projectRequest) {
      return NextResponse.json({ error: 'Project request not found' }, { status: 404 })
    }

    // Role-based access control
    // TODO: Implement proper customer ID check through User-Customer relation
    if (session.user.role === 'CUSTOMER') {
      // Need to fetch customer ID from User-Customer relation
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Transform response
    const response = {
      id: projectRequest.id,
      customerName: projectRequest.customerName,
      customerEmail: projectRequest.customerEmail,
      customerPhone: projectRequest.customerPhone || '',
      location: projectRequest.location || '',
      address: projectRequest.address || '',
      projectType: projectRequest.projectType,
      estimatedCapacity: projectRequest.estimatedCapacity || 0,
      estimatedBudget: projectRequest.estimatedBudget,
      estimatedRevenue: projectRequest.estimatedRevenue,
      description: projectRequest.description || '',
      status: projectRequest.status,
      priority: projectRequest.priority,
      source: projectRequest.source,
      hasPhotos: projectRequest.hasPhotos,
      scheduledVisitDate: projectRequest.scheduledVisitDate?.toISOString(),
      assignedEngineerId: projectRequest.assignedEngineerId,
      assignedEngineerName: projectRequest.assignedEngineer?.name,
      tags: Array.isArray(projectRequest.tags) ? projectRequest.tags : [],
      notes: Array.isArray(projectRequest.notes) ? projectRequest.notes : [],
      createdAt: projectRequest.createdAt.toISOString(),
      updatedAt: projectRequest.updatedAt.toISOString(),
      statusHistory: projectRequest.statusHistory.map(history => ({
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
    console.error('Error fetching project request:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<Params> }
) {
  try {
    const session = await getServerSession()
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Only allow ADMIN and COMPANY roles to update requests
    if (!['ADMIN', 'COMPANY'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()
    const { id } = await params

    // Get current request
    const currentRequest = await prisma.projectRequest.findUnique({
      where: { id }
    })

    if (!currentRequest) {
      return NextResponse.json({ error: 'Project request not found' }, { status: 404 })
    }

    // Update project request
    const projectRequest = await prisma.projectRequest.update({
      where: { id },
      data: {
        customerName: body.customerName || currentRequest.customerName,
        customerEmail: body.customerEmail || currentRequest.customerEmail,
        customerPhone: body.customerPhone !== undefined ? body.customerPhone : currentRequest.customerPhone,
        location: body.location !== undefined ? body.location : currentRequest.location,
        address: body.address !== undefined ? body.address : currentRequest.address,
        projectType: body.projectType || currentRequest.projectType,
        estimatedCapacity: body.estimatedCapacity !== undefined ? 
          (body.estimatedCapacity ? parseFloat(body.estimatedCapacity) : null) : currentRequest.estimatedCapacity,
        estimatedBudget: body.estimatedBudget !== undefined ? 
          (body.estimatedBudget ? parseFloat(body.estimatedBudget) : null) : currentRequest.estimatedBudget,
        estimatedRevenue: body.estimatedRevenue !== undefined ? 
          (body.estimatedRevenue ? parseFloat(body.estimatedRevenue) : null) : currentRequest.estimatedRevenue,
        description: body.description !== undefined ? body.description : currentRequest.description,
        priority: body.priority || currentRequest.priority,
        source: body.source || currentRequest.source,
        tags: body.tags !== undefined ? body.tags : currentRequest.tags,
        notes: body.notes !== undefined ? body.notes : currentRequest.notes,
        contactPreference: body.contactPreference !== undefined ? body.contactPreference : currentRequest.contactPreference,
        assignedEngineerId: body.assignedEngineerId !== undefined ? body.assignedEngineerId : currentRequest.assignedEngineerId,
        scheduledVisitDate: body.scheduledVisitDate !== undefined ? 
          (body.scheduledVisitDate ? new Date(body.scheduledVisitDate) : null) : currentRequest.scheduledVisitDate,
        hasPhotos: body.hasPhotos !== undefined ? body.hasPhotos : currentRequest.hasPhotos
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
      id: projectRequest.id,
      customerName: projectRequest.customerName,
      customerEmail: projectRequest.customerEmail,
      customerPhone: projectRequest.customerPhone || '',
      location: projectRequest.location || '',
      address: projectRequest.address || '',
      projectType: projectRequest.projectType,
      estimatedCapacity: projectRequest.estimatedCapacity || 0,
      estimatedBudget: projectRequest.estimatedBudget,
      estimatedRevenue: projectRequest.estimatedRevenue,
      description: projectRequest.description || '',
      status: projectRequest.status,
      priority: projectRequest.priority,
      source: projectRequest.source,
      hasPhotos: projectRequest.hasPhotos,
      scheduledVisitDate: projectRequest.scheduledVisitDate?.toISOString(),
      assignedEngineerId: projectRequest.assignedEngineerId,
      assignedEngineerName: projectRequest.assignedEngineer?.name,
      tags: Array.isArray(projectRequest.tags) ? projectRequest.tags : [],
      notes: Array.isArray(projectRequest.notes) ? projectRequest.notes : [],
      createdAt: projectRequest.createdAt.toISOString(),
      updatedAt: projectRequest.updatedAt.toISOString(),
      statusHistory: projectRequest.statusHistory.map(history => ({
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
    console.error('Error updating project request:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<Params> }
) {
  try {
    const session = await getServerSession()
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Only allow ADMIN role to delete requests
    if (session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { id } = await params

    // Check if request exists
    const existingRequest = await prisma.projectRequest.findUnique({
      where: { id }
    })

    if (!existingRequest) {
      return NextResponse.json({ error: 'Project request not found' }, { status: 404 })
    }

    // Delete project request (status history will be deleted due to cascade)
    await prisma.projectRequest.delete({
      where: { id }
    })

    return NextResponse.json({ message: 'Project request deleted successfully' })
  } catch (error) {
    console.error('Error deleting project request:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}