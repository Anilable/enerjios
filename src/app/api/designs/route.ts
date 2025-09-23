import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const {
      name,
      description,
      designerState,
      location,
      calculations
    } = body

    if (!name || !designerState) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Save design to database
    const design = await prisma.design.create({
      data: {
        name,
        description: description || '',
        designData: designerState,
        location: location?.address || '',
        coordinates: location?.coordinates ? {
          lat: location.coordinates.lat,
          lng: location.coordinates.lng
        } : undefined,
        calculations: calculations || {},
        userId: session.user.id,
        status: 'ACTIVE'
      }
    })

    return NextResponse.json({
      success: true,
      id: design.id,
      message: 'Tasarım başarıyla kaydedildi'
    })
  } catch (error) {
    console.error('Error saving design:', error)
    return NextResponse.json(
      { error: 'Failed to save design' },
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

    const designs = await prisma.design.findMany({
      where: {
        userId: session.user.id,
        status: 'ACTIVE'
      },
      orderBy: {
        updatedAt: 'desc'
      },
      select: {
        id: true,
        name: true,
        description: true,
        location: true,
        calculations: true,
        createdAt: true,
        updatedAt: true
      }
    })

    return NextResponse.json(designs)
  } catch (error) {
    console.error('Error fetching designs:', error)
    return NextResponse.json(
      { error: 'Failed to fetch designs' },
      { status: 500 }
    )
  }
}