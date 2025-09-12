import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { EmailService } from '@/lib/email'

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || (session.user.role !== 'ADMIN' && session.user.role !== 'COMPANY')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    console.log('🧪 Testing email service...')
    
    // Test email service configuration
    const testResult = await EmailService.testEmailService()
    
    if (!testResult.success) {
      return NextResponse.json({
        success: false,
        error: testResult.error,
        environment: {
          RESEND_API_KEY: process.env.RESEND_API_KEY ? '✅ Set' : '❌ Not set',
          FROM_EMAIL: process.env.FROM_EMAIL || '❌ Not set',
          COMPANY_NAME: process.env.COMPANY_NAME || '⚠️ Using default',
          NEXTAUTH_URL: process.env.NEXTAUTH_URL || '❌ Not set'
        }
      }, { status: 400 })
    }

    // Test with sample photo request data (without actually sending email)
    const sampleData = {
      customerName: 'Test Customer',
      customerEmail: 'test@example.com',
      engineerName: 'Test Engineer',
      engineerTitle: 'Mühendis',
      message: 'Bu bir test mesajıdır.',
      guidelines: 'Test fotoğraf rehberi.',
      uploadUrl: 'https://example.com/upload/test-token',
      expiryDays: 7,
      token: 'test-token-12345'
    }

    return NextResponse.json({
      success: true,
      message: 'Email service configuration is valid',
      environment: {
        RESEND_API_KEY: process.env.RESEND_API_KEY ? '✅ Set' : '❌ Not set',
        FROM_EMAIL: process.env.FROM_EMAIL || '❌ Not set',
        COMPANY_NAME: process.env.COMPANY_NAME || '⚠️ Using default (TrakyaSolar)',
        NEXTAUTH_URL: process.env.NEXTAUTH_URL || '❌ Not set'
      },
      sampleEmailData: sampleData
    })

  } catch (error) {
    console.error('Email service test failed:', error)
    return NextResponse.json({ 
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      environment: {
        RESEND_API_KEY: process.env.RESEND_API_KEY ? '✅ Set' : '❌ Not set',
        FROM_EMAIL: process.env.FROM_EMAIL || '❌ Not set',
        COMPANY_NAME: process.env.COMPANY_NAME || '⚠️ Using default',
        NEXTAUTH_URL: process.env.NEXTAUTH_URL || '❌ Not set'
      }
    }, { status: 500 })
  }
}

// Test sending actual email (only for development)
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || (session.user.role !== 'ADMIN' && session.user.role !== 'COMPANY')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Only allow in development
    if (process.env.NODE_ENV !== 'development') {
      return NextResponse.json({ 
        error: 'Test email sending only available in development' 
      }, { status: 403 })
    }

    const { email } = await req.json()
    if (!email) {
      return NextResponse.json({ error: 'Email address required' }, { status: 400 })
    }

    console.log('📧 Sending test email to:', email)

    const testResult = await EmailService.sendPhotoRequest({
      customerName: 'Test Customer',
      customerEmail: email,
      engineerName: session.user.name || 'Test Engineer',
      engineerTitle: 'Mühendis',
      message: `Merhaba,

Bu bir test e-postasıdır. Eğer bu e-postayı aldıysanız, e-posta servisi düzgün çalışıyor demektir.

Test tarihi: ${new Date().toLocaleString('tr-TR')}
Test eden: ${session.user.name}

Bu testten sonra gerçek fotoğraf talebi gönderebilirsiniz.`,
      guidelines: `Test Fotoğraf Rehberi:
• Bu sadece bir test
• Gerçek fotoğraf yüklemeyin
• Sistem çalışıyor durumda`,
      uploadUrl: `${process.env.NEXTAUTH_URL}/photo-upload/test-token-123456`,
      expiryDays: 7,
      token: 'test-token-123456'
    })

    return NextResponse.json({
      success: testResult.success,
      message: testResult.success ? 'Test email sent successfully' : 'Test email failed',
      error: testResult.error,
      messageId: testResult.messageId,
      sentTo: email
    })

  } catch (error) {
    console.error('Test email sending failed:', error)
    return NextResponse.json({ 
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}