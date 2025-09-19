import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { NextStepAutomationService } from '@/lib/services/next-step-automation'
import { Priority } from '@/types/next-step'

interface Params {
  id: string
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<Params> }
) {
  try {
    const { id } = await params
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Only allow ADMIN and COMPANY roles
    if (!['ADMIN', 'COMPANY'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()
    const { complete, title, description, dueDate, priority } = body

    let nextStep

    if (complete) {
      // Complete the step
      nextStep = await NextStepAutomationService.completeStep(id, session.user.id)
    } else {
      // Update the step
      const updates: any = {}
      if (title !== undefined) updates.title = title
      if (description !== undefined) updates.description = description
      if (dueDate !== undefined) updates.dueDate = new Date(dueDate)
      if (priority !== undefined) updates.priority = priority as Priority

      nextStep = await NextStepAutomationService.updateStep(id, updates)
    }

    return NextResponse.json(nextStep)
  } catch (error) {
    console.error('Error updating next step:', error)
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
    const { id } = await params
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Only allow ADMIN and COMPANY roles
    if (!['ADMIN', 'COMPANY'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    await NextStepAutomationService.deleteStep(id)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting next step:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}