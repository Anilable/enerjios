import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth-utils'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth()

    // Get user settings from database
    const userSettings = await prisma.user.findUnique({
      where: { id: user.id },
      select: {
        phone: true,
        company: {
          select: {
            name: true
          }
        }
      }
    })

    // Default settings structure - we'll store these in localStorage on client side
    const defaultSettings = {
      phone: userSettings?.phone || '',
      company: userSettings?.company?.name || '',
      notifications: {
        email: true,
        projectUpdates: true,
        payments: false,
        weather: true
      },
      security: {
        twoFactorEnabled: false
      },
      preferences: {
        darkMode: false,
        language: 'tr',
        timezone: 'Europe/Istanbul'
      }
    }

    return NextResponse.json(defaultSettings)
  } catch (error) {
    console.error('Settings API error:', error)
    return NextResponse.json(
      { error: 'Ayarlar alınırken hata oluştu' },
      { status: 500 }
    )
  }
}