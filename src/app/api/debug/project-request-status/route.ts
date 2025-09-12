import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

export async function GET() {
  try {
    // Test session
    const session = await getServerSession(authOptions)
    
    console.log('Session debug:', {
      hasSession: !!session,
      userId: session?.user?.id,
      userRole: session?.user?.role,
      userEmail: session?.user?.email
    })

    // Test database connection
    const projectRequestCount = await prisma.projectRequest.count()
    console.log('Database connection test - Project request count:', projectRequestCount)

    // Test fetching first project request
    const firstRequest = await prisma.projectRequest.findFirst({
      select: {
        id: true,
        status: true,
        customerName: true,
        createdAt: true
      }
    })

    console.log('First project request:', firstRequest)

    return NextResponse.json({
      debug: {
        session: {
          authenticated: !!session,
          userId: session?.user?.id || null,
          userRole: session?.user?.role || null,
          userEmail: session?.user?.email || null
        },
        database: {
          connected: true,
          projectRequestCount,
          firstRequest
        }
      }
    })

  } catch (error) {
    console.error('Debug endpoint error:', error)
    return NextResponse.json({
      error: 'Debug test failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    const body = await request.json()
    
    console.log('Test status update request:', {
      session: session?.user?.id,
      requestId: body.requestId,
      newStatus: body.newStatus
    })

    if (!session) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    if (!['ADMIN', 'COMPANY'].includes(session.user.role)) {
      return NextResponse.json({ 
        error: 'Insufficient permissions',
        userRole: session.user.role,
        requiredRoles: ['ADMIN', 'COMPANY']
      }, { status: 403 })
    }

    if (!body.requestId || !body.newStatus) {
      return NextResponse.json({ error: 'Missing requestId or newStatus' }, { status: 400 })
    }

    // Try to find the project request
    const projectRequest = await prisma.projectRequest.findUnique({
      where: { id: body.requestId }
    })

    if (!projectRequest) {
      return NextResponse.json({ error: 'Project request not found' }, { status: 404 })
    }

    console.log('Found project request:', projectRequest.id, 'current status:', projectRequest.status)

    // Test the actual update
    const updatedRequest = await prisma.projectRequest.update({
      where: { id: body.requestId },
      data: { 
        status: body.newStatus,
        updatedAt: new Date()
      }
    })

    console.log('Successfully updated status to:', updatedRequest.status)

    return NextResponse.json({
      success: true,
      oldStatus: projectRequest.status,
      newStatus: updatedRequest.status,
      requestId: updatedRequest.id
    })

  } catch (error) {
    console.error('Test status update error:', error)
    return NextResponse.json({
      error: 'Test update failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}