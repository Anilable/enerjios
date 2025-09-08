import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { PrismaClient } from '@prisma/client'
import { authOptions } from '@/lib/auth'

const prisma = new PrismaClient()

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    
    // Extract filter parameters
    const search = searchParams.get('search') || ''
    const projectType = searchParams.get('projectType')
    const priority = searchParams.get('priority')
    const status = searchParams.get('status')
    const assignedEngineerId = searchParams.get('assignedEngineerId')
    const source = searchParams.get('source')
    const dateStart = searchParams.get('dateStart')
    const dateEnd = searchParams.get('dateEnd')

    // Build where clause
    const where: any = {}

    // Search filter
    if (search) {
      where.OR = [
        { customerName: { contains: search, mode: 'insensitive' } },
        { customerEmail: { contains: search, mode: 'insensitive' } },
        { location: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } }
      ]
    }

    // Type filters
    if (projectType && projectType !== 'all') {
      where.projectType = projectType
    }
    if (priority && priority !== 'all') {
      where.priority = priority
    }
    if (status && status !== 'all') {
      where.status = status
    }
    if (assignedEngineerId && assignedEngineerId !== 'all') {
      where.assignedEngineerId = assignedEngineerId
    }
    if (source && source !== 'all') {
      where.source = source
    }

    // Date range filter
    if (dateStart || dateEnd) {
      where.createdAt = {}
      if (dateStart) {
        where.createdAt.gte = new Date(dateStart)
      }
      if (dateEnd) {
        where.createdAt.lte = new Date(dateEnd + 'T23:59:59.999Z')
      }
    }

    // Role-based filtering
    if (session.user.role === 'COMPANY') {
      // Companies can only see their assigned requests or unassigned ones
      where.OR = [
        { assignedEngineerId: session.user.id },
        { assignedEngineerId: null }
      ]
    } else if (session.user.role === 'CUSTOMER') {
      // Customers can only see their own requests
      where.customerId = session.user.customer?.id
    }

    const projectRequests = await prisma.projectRequest.findMany({
      where,
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
          take: 1,
          include: {
            user: {
              select: {
                name: true
              }
            }
          }
        }
      },
      orderBy: [
        { priority: 'desc' },
        { createdAt: 'desc' }
      ]
    })

    // Transform data to match frontend format
    const transformedRequests = projectRequests.map(request => ({
      id: request.id,
      customerName: request.customerName,
      customerEmail: request.customerEmail,
      customerPhone: request.customerPhone || '',
      location: request.location || '',
      address: request.address || '',
      projectType: request.projectType,
      estimatedCapacity: request.estimatedCapacity || 0,
      estimatedBudget: request.estimatedBudget,
      estimatedRevenue: request.estimatedRevenue,
      description: request.description || '',
      status: request.status,
      priority: request.priority,
      source: request.source,
      hasPhotos: request.hasPhotos,
      scheduledVisitDate: request.scheduledVisitDate?.toISOString(),
      assignedEngineerId: request.assignedEngineerId,
      assignedEngineerName: request.assignedEngineer?.name,
      tags: Array.isArray(request.tags) ? request.tags : [],
      notes: Array.isArray(request.notes) ? request.notes : [],
      createdAt: request.createdAt.toISOString(),
      updatedAt: request.updatedAt.toISOString(),
      statusHistory: request.statusHistory.map(history => ({
        id: history.id,
        status: history.status,
        timestamp: history.timestamp.toISOString(),
        userId: history.userId,
        userName: history.userName,
        note: history.note
      }))
    }))

    return NextResponse.json(transformedRequests)
  } catch (error) {
    console.error('Error fetching project requests:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Only allow ADMIN, COMPANY, and CUSTOMER roles to create requests
    if (!['ADMIN', 'COMPANY', 'CUSTOMER'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()
    
    // Validate required fields
    const requiredFields = ['customerName', 'customerEmail', 'projectType']
    const missingFields = requiredFields.filter(field => !body[field])
    
    if (missingFields.length > 0) {
      return NextResponse.json(
        { error: `Missing required fields: ${missingFields.join(', ')}` },
        { status: 400 }
      )
    }

    // Create project request
    const projectRequest = await prisma.projectRequest.create({
      data: {
        customerName: body.customerName,
        customerEmail: body.customerEmail,
        customerPhone: body.customerPhone || null,
        location: body.location || null,
        address: body.address || null,
        projectType: body.projectType,
        estimatedCapacity: body.estimatedCapacity ? parseFloat(body.estimatedCapacity) : null,
        estimatedBudget: body.estimatedBudget ? parseFloat(body.estimatedBudget) : null,
        estimatedRevenue: body.estimatedRevenue ? parseFloat(body.estimatedRevenue) : null,
        description: body.description || null,
        priority: body.priority || 'MEDIUM',
        source: body.source || 'WEBSITE',
        tags: body.tags || [],
        notes: body.notes || [],
        contactPreference: body.contactPreference || null,
        customerId: body.customerId || null,
        assignedEngineerId: body.assignedEngineerId || null,
        scheduledVisitDate: body.scheduledVisitDate ? new Date(body.scheduledVisitDate) : null
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

    // Create initial status history entry
    await prisma.projectRequestStatusHistory.create({
      data: {
        projectRequestId: projectRequest.id,
        status: 'OPEN',
        previousStatus: null,
        userId: session.user.id,
        userName: session.user.name || 'Unknown User',
        note: 'Proje talebi oluşturuldu'
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
      statusHistory: [{
        id: '1',
        status: 'OPEN',
        timestamp: projectRequest.createdAt.toISOString(),
        userId: session.user.id,
        userName: session.user.name || 'Unknown User',
        note: 'Proje talebi oluşturuldu'
      }]
    }

    return NextResponse.json(response, { status: 201 })
  } catch (error) {
    console.error('Error creating project request:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}