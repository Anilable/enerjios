import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { db as prisma } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { type, data, timestamp } = body

    console.log(`[API] Syncing offline ${type} data:`, data)

    switch (type) {
      case 'quote': {
        const quote = await prisma.quote.create({
          data: {
            ...data,
            companyId: session.user.companyId,
            createdAt: new Date(timestamp)
          }
        })
        return NextResponse.json({ success: true, id: quote.id })
      }

      case 'project': {
        const project = await prisma.project.create({
          data: {
            ...data,
            companyId: session.user.companyId,
            createdAt: new Date(timestamp)
          }
        })
        return NextResponse.json({ success: true, id: project.id })
      }

      case 'customer': {
        const customer = await prisma.customer.create({
          data: {
            ...data,
            companyId: session.user.companyId,
            createdAt: new Date(timestamp)
          }
        })
        return NextResponse.json({ success: true, id: customer.id })
      }

      default: {
        return NextResponse.json(
          { error: 'Invalid sync type' },
          { status: 400 }
        )
      }
    }
  } catch (error) {
    console.error('Offline sync error:', error)
    return NextResponse.json(
      { error: 'Sync failed' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Return sync status and pending items
    return NextResponse.json({
      status: 'ready',
      lastSync: new Date().toISOString(),
      pendingItems: 0
    })
  } catch (error) {
    console.error('Sync status error:', error)
    return NextResponse.json(
      { error: 'Failed to get sync status' },
      { status: 500 }
    )
  }
}