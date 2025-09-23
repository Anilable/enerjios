import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth-utils'

const notificationsSchema = {
  email: 'boolean',
  projectUpdates: 'boolean',
  payments: 'boolean',
  weather: 'boolean'
}

export async function PUT(request: NextRequest) {
  try {
    const user = await requireAuth()
    const body = await request.json()
    
    // Simple validation
    for (const [key, expectedType] of Object.entries(notificationsSchema)) {
      if (key in body && typeof body[key] !== expectedType) {
        return NextResponse.json(
          { error: `${key} must be a ${expectedType}` },
          { status: 400 }
        )
      }
    }

    // For now, we'll just return success since we're storing settings in localStorage
    // In a real implementation, you might want to store these in a separate UserSettings table
    
    return NextResponse.json({
      message: 'Bildirim ayarları başarıyla güncellendi'
    })
  } catch (error) {
    console.error('Notifications update error:', error)
    return NextResponse.json(
      { error: 'Bildirim ayarları güncellenirken hata oluştu' },
      { status: 500 }
    )
  }
}