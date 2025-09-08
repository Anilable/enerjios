import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    console.log('[DEBUG_AUTH] Starting auth status check...')
    
    const session = await getServerSession(authOptions)
    
    console.log('[DEBUG_AUTH] Session check result:', {
      hasSession: !!session,
      userId: session?.user?.id,
      userRole: session?.user?.role,
      userEmail: session?.user?.email,
      userName: session?.user?.name
    })

    // Test database connection
    console.log('[DEBUG_AUTH] Testing database connection...')
    const projectRequestCount = await prisma.projectRequest.count()
    console.log('[DEBUG_AUTH] Database connection successful. Project request count:', projectRequestCount)

    // Test if user can access project requests
    if (session && ['ADMIN', 'COMPANY'].includes(session.user.role)) {
      const userProjectRequests = await prisma.projectRequest.findMany({
        take: 5,
        select: {
          id: true,
          customerName: true,
          status: true,
          createdAt: true
        },
        orderBy: {
          createdAt: 'desc'
        }
      })
      
      console.log('[DEBUG_AUTH] User can access project requests. Sample data:', userProjectRequests)
      
      return NextResponse.json({
        success: true,
        session: {
          userId: session.user.id,
          userRole: session.user.role,
          userEmail: session.user.email,
          userName: session.user.name
        },
        database: {
          connected: true,
          projectRequestCount
        },
        permissions: {
          canUpdateStatus: true
        },
        sampleData: userProjectRequests
      })
    } else {
      return NextResponse.json({
        success: false,
        error: 'No session or insufficient permissions',
        session: session ? {
          userId: session.user.id,
          userRole: session.user.role,
          userEmail: session.user.email,
          userName: session.user.name
        } : null,
        database: {
          connected: true,
          projectRequestCount
        },
        permissions: {
          canUpdateStatus: false
        }
      })
    }
  } catch (error) {
    console.error('[DEBUG_AUTH] Error during auth status check:', error)
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      details: error instanceof Error ? {
        name: error.name,
        message: error.message,
        stack: error.stack
      } : null
    }, { status: 500 })
  }
}