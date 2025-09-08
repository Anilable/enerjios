import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { db as prisma } from '@/lib/db'

interface RouteParams {
  params: Promise<{ id: string }>
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { isRead } = body

    // Find notification and verify ownership
    const notification = await prisma.notification.findFirst({
      where: {
        id,
        userId: session.user.id
      }
    })

    if (!notification) {
      return NextResponse.json(
        { error: 'Notification not found' },
        { status: 404 }
      )
    }

    // Update notification
    const updatedNotification = await prisma.notification.update({
      where: { id },
      data: {
        isRead: isRead ?? true,
        readAt: isRead !== false ? new Date() : null
      },
      include: {
        project: {
          select: { id: true, name: true }
        }
      }
    })

    return NextResponse.json(updatedNotification)
  } catch (error) {
    console.error('Notification PATCH error:', error)
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Find notification and verify ownership
    const notification = await prisma.notification.findFirst({
      where: {
        id,
        userId: session.user.id
      }
    })

    if (!notification) {
      return NextResponse.json(
        { error: 'Notification not found' },
        { status: 404 }
      )
    }

    // Delete notification
    await prisma.notification.delete({
      where: { id }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Notification DELETE error:', error)
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    )
  }
}