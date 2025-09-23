import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const cookieConsentSchema = z.object({
  necessary: z.boolean(),
  analytics: z.boolean(),
  marketing: z.boolean(),
  functional: z.boolean(),
  timestamp: z.number(),
  version: z.string()
})

function getClientInfo(request: NextRequest) {
  const forwarded = request.headers.get('x-forwarded-for')
  const realIp = request.headers.get('x-real-ip')
  const ipAddress = forwarded?.split(',')[0] || realIp || '127.0.0.1'
  const userAgent = request.headers.get('user-agent') || 'unknown'

  return { ipAddress, userAgent }
}

function generateSessionId(): string {
  return Math.random().toString(36).substring(2) + Date.now().toString(36)
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = cookieConsentSchema.parse(body)
    const { ipAddress, userAgent } = getClientInfo(request)

    // Get user session if logged in
    const session = await getServerSession(authOptions)
    const userId = session?.user?.id || null

    // Generate session ID for anonymous users
    let sessionId = null
    if (!userId) {
      // Try to get existing session ID from cookie or generate new one
      sessionId = request.cookies.get('session_id')?.value || generateSessionId()
    }

    // Calculate expiry date (1 year from now)
    const expiresAt = new Date()
    expiresAt.setFullYear(expiresAt.getFullYear() + 1)

    // Save consent to database
    const cookieConsent = await prisma.cookieConsent.create({
      data: {
        userId,
        sessionId,
        consent: validatedData,
        ipAddress,
        userAgent,
        version: validatedData.version,
        expiresAt
      }
    })

    // Log the action for KVKK compliance
    await prisma.kVKKAuditLog.create({
      data: {
        userId,
        sessionId,
        action: 'cookie_consent_given',
        details: {
          consent: validatedData,
          method: 'web_interface',
          source: 'cookie_banner'
        },
        ipAddress,
        userAgent
      }
    })

    // Prepare response
    const response = NextResponse.json({
      success: true,
      consentId: cookieConsent.id,
      message: 'Çerez tercihleri kaydedildi'
    })

    // Set session ID cookie for anonymous users
    if (!userId && sessionId) {
      response.cookies.set('session_id', sessionId, {
        maxAge: 365 * 24 * 60 * 60, // 1 year
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax'
      })
    }

    return response

  } catch (error) {
    console.error('Cookie consent error:', error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid consent data', details: error.issues },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to save cookie consent' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { ipAddress, userAgent } = getClientInfo(request)

    // Get user session if logged in
    const session = await getServerSession(authOptions)
    const userId = session?.user?.id || null

    // Get session ID for anonymous users
    const sessionId = request.cookies.get('session_id')?.value || null

    if (!userId && !sessionId) {
      return NextResponse.json({ consent: null })
    }

    // Find the most recent consent for this user/session
    const consent = await prisma.cookieConsent.findFirst({
      where: {
        OR: [
          { userId: userId },
          { sessionId: sessionId }
        ],
        expiresAt: {
          gt: new Date() // Not expired
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    if (!consent) {
      return NextResponse.json({ consent: null })
    }

    // Check if consent version is current
    const currentVersion = '1.0.0'
    if (consent.version !== currentVersion) {
      // Version mismatch, consent is outdated
      return NextResponse.json({
        consent: null,
        reason: 'version_mismatch',
        message: 'Çerez politikası güncellenmiştir'
      })
    }

    return NextResponse.json({
      consent: consent.consent,
      timestamp: consent.timestamp,
      version: consent.version
    })

  } catch (error) {
    console.error('Get cookie consent error:', error)
    return NextResponse.json(
      { error: 'Failed to retrieve cookie consent' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { ipAddress, userAgent } = getClientInfo(request)

    // Get user session if logged in
    const session = await getServerSession(authOptions)
    const userId = session?.user?.id || null

    // Get session ID for anonymous users
    const sessionId = request.cookies.get('session_id')?.value || null

    if (!userId && !sessionId) {
      return NextResponse.json({ success: false, message: 'No consent found' })
    }

    // Delete all consents for this user/session
    await prisma.cookieConsent.deleteMany({
      where: {
        OR: [
          { userId: userId },
          { sessionId: sessionId }
        ]
      }
    })

    // Log the withdrawal for KVKK compliance
    await prisma.kVKKAuditLog.create({
      data: {
        userId,
        sessionId,
        action: 'cookie_consent_withdrawn',
        details: {
          method: 'api_request',
          source: 'user_request'
        },
        ipAddress,
        userAgent
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Çerez onayı geri çekildi'
    })

  } catch (error) {
    console.error('Delete cookie consent error:', error)
    return NextResponse.json(
      { error: 'Failed to withdraw cookie consent' },
      { status: 500 }
    )
  }
}