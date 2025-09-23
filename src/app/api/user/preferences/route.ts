import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth-utils'

export async function PUT(request: NextRequest) {
  try {
    const user = await requireAuth()
    const body = await request.json()
    
    // Simple validation
    if (typeof body.darkMode !== 'boolean') {
      return NextResponse.json(
        { error: 'darkMode must be a boolean' },
        { status: 400 }
      )
    }
    
    if (!['tr', 'en'].includes(body.language)) {
      return NextResponse.json(
        { error: 'language must be tr or en' },
        { status: 400 }
      )
    }
    
    if (typeof body.timezone !== 'string') {
      return NextResponse.json(
        { error: 'timezone must be a string' },
        { status: 400 }
      )
    }

    // For now, we'll just return success since we're storing settings in localStorage
    // In a real implementation, you might want to store these in a separate UserSettings table
    
    return NextResponse.json({
      message: 'Sistem tercihleri başarıyla güncellendi'
    })
  } catch (error) {
    console.error('Preferences update error:', error)
    return NextResponse.json(
      { error: 'Sistem tercihleri güncellenirken hata oluştu' },
      { status: 500 }
    )
  }
}