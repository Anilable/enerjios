import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db as prisma } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { sessionId, message, type = 'user' } = await request.json()
    
    // Store message in database
    const chatMessage = await prisma.chatMessage.create({
      data: {
        sessionId,
        userId: session.user.id,
        content: message,
        senderType: type,
        timestamp: new Date()
      }
    })

    // If this is the first message, create chat session
    const existingSession = await prisma.chatSession.findUnique({
      where: { id: sessionId }
    })

    if (!existingSession) {
      await prisma.chatSession.create({
        data: {
          id: sessionId,
          userId: session.user.id,
          status: 'waiting',
          startTime: new Date(),
          category: 'general',
          priority: 'medium'
        }
      })
    }

    // Auto-assign to agent if available
    const availableAgent = await prisma.user.findFirst({
      where: {
        role: 'AGENT',
        status: 'ACTIVE'
      }
    })

    if (availableAgent && !existingSession?.agentId) {
      await prisma.chatSession.update({
        where: { id: sessionId },
        data: {
          agentId: availableAgent.id,
          status: 'active'
        }
      })
    }

    return NextResponse.json({ 
      success: true, 
      message: chatMessage,
      agentAssigned: !!availableAgent
    })
  } catch (error) {
    console.error('Chat message error:', error)
    return NextResponse.json(
      { error: 'Failed to send message' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const sessionId = searchParams.get('sessionId')

    if (!sessionId) {
      return NextResponse.json(
        { error: 'Session ID required' },
        { status: 400 }
      )
    }

    const messages = await prisma.chatMessage.findMany({
      where: {
        sessionId,
        userId: session.user.id
      },
      orderBy: {
        timestamp: 'asc'
      }
    })

    return NextResponse.json({ messages })
  } catch (error) {
    console.error('Chat messages fetch error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch messages' },
      { status: 500 }
    )
  }
}