import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    // Check database connection
    await prisma.$queryRaw`SELECT 1`

    // Check environment variables
    const requiredEnvVars = [
      'NEXTAUTH_URL',
      'NEXTAUTH_SECRET',
      'DATABASE_URL'
    ]

    const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar])

    // KVKK specific checks
    const kvkkEnvVars = {
      RESEND_API_KEY: process.env.RESEND_API_KEY,
      FROM_EMAIL: process.env.FROM_EMAIL,
      KVKK_ADMIN_EMAILS: process.env.KVKK_ADMIN_EMAILS
    }

    const kvkkConfigured = Object.values(kvkkEnvVars).every(Boolean)

    return NextResponse.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      database: 'connected',
      environment: {
        missing: missingEnvVars,
        kvkkConfigured,
        nodeEnv: process.env.NODE_ENV
      },
      services: {
        kvkk: {
          monitoring: 'available',
          compliance: 'available',
          testing: 'available',
          scheduler: 'available',
          emailNotifications: kvkkConfigured ? 'configured' : 'not_configured'
        }
      },
      version: '1.0.0'
    })

  } catch (error) {
    console.error('Health check failed:', error)

    return NextResponse.json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Unknown error',
      database: 'disconnected'
    }, { status: 503 })
  }
}