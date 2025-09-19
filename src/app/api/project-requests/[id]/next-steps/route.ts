import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { NextStepAutomationService } from '@/lib/services/next-step-automation'
import { Priority } from '@/types/next-step'

interface Params {
  id: string
}

export async function GET(
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

    const nextSteps = await NextStepAutomationService.getNextStepsForRequest(id)

    return NextResponse.json(nextSteps)
  } catch (error) {
    console.error('Error fetching next steps:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(
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
    const { title, description, dueDate, priority = 'MEDIUM' } = body

    if (!title || !dueDate) {
      return NextResponse.json(
        { error: 'Title and due date are required' },
        { status: 400 }
      )
    }

    const nextStep = await NextStepAutomationService.createCustomStep(
      id,
      title,
      description,
      new Date(dueDate),
      priority as Priority
    )

    return NextResponse.json(nextStep, { status: 201 })
  } catch (error) {
    console.error('Error creating next step:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}