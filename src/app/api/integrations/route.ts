import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { z } from 'zod'

// Schema for API integration configuration
const integrationConfigSchema = z.object({
  name: z.string().min(1),
  provider: z.enum(['WEATHER_API', 'PRICING_API', 'PAYMENT_GATEWAY', 'SMS_SERVICE', 'EMAIL_SERVICE', 'MAPS_API']),
  apiKey: z.string().min(1),
  apiSecret: z.string().optional(),
  baseUrl: z.string().url(),
  configuration: z.record(z.any()).optional(),
  isActive: z.boolean().default(true),
  rateLimits: z.object({
    requestsPerMinute: z.number().positive(),
    requestsPerHour: z.number().positive(),
    requestsPerDay: z.number().positive()
  }).optional()
})

// Available API integrations
const AVAILABLE_INTEGRATIONS = {
  WEATHER_API: {
    name: 'Weather API',
    description: 'Real-time weather data for solar calculations',
    requiredFields: ['apiKey', 'baseUrl'],
    testEndpoint: '/weather/current'
  },
  PRICING_API: {
    name: 'Product Pricing API',
    description: 'Real-time product pricing updates',
    requiredFields: ['apiKey', 'apiSecret', 'baseUrl'],
    testEndpoint: '/products/prices'
  },
  PAYMENT_GATEWAY: {
    name: 'Payment Gateway',
    description: 'Process payments and manage transactions',
    requiredFields: ['apiKey', 'apiSecret', 'merchantId'],
    testEndpoint: '/payments/health'
  },
  SMS_SERVICE: {
    name: 'SMS Service',
    description: 'Send SMS notifications to customers',
    requiredFields: ['apiKey', 'username', 'password'],
    testEndpoint: '/sms/balance'
  },
  EMAIL_SERVICE: {
    name: 'Email Service',
    description: 'Send email notifications and campaigns',
    requiredFields: ['apiKey', 'domain'],
    testEndpoint: '/email/health'
  },
  MAPS_API: {
    name: 'Maps API',
    description: 'Satellite imagery and location services',
    requiredFields: ['apiKey'],
    testEndpoint: '/maps/geocode'
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user?.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get all configured integrations
    const integrations = await db.apiIntegration.findMany({
      orderBy: { createdAt: 'desc' }
    })

    // Return integrations with available providers
    return NextResponse.json({
      success: true,
      integrations: integrations.map(integration => ({
        ...integration,
        apiKey: '***masked***', // Mask sensitive data
        apiSecret: integration.apiSecret ? '***masked***' : null
      })),
      availableProviders: AVAILABLE_INTEGRATIONS
    })
    
  } catch (error) {
    console.error('Error fetching integrations:', error)
    return NextResponse.json(
      { error: 'Failed to fetch integrations' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user?.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const validatedData = integrationConfigSchema.parse(body)

    // Test the integration before saving
    const testResult = await testIntegration(validatedData)
    if (!testResult.success) {
      return NextResponse.json(
        { error: 'Integration test failed', details: testResult.error },
        { status: 400 }
      )
    }

    // Create new integration
    const integration = await db.apiIntegration.create({
      data: {
        name: validatedData.name,
        provider: validatedData.provider,
        apiKey: validatedData.apiKey,
        apiSecret: validatedData.apiSecret,
        baseUrl: validatedData.baseUrl,
        configuration: validatedData.configuration || {},
        isActive: validatedData.isActive,
        rateLimits: validatedData.rateLimits,
        lastTestedAt: new Date(),
        testResult: testResult
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Integration created successfully',
      integration: {
        ...integration,
        apiKey: '***masked***',
        apiSecret: integration.apiSecret ? '***masked***' : null
      }
    })
    
  } catch (error) {
    console.error('Error creating integration:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid data', details: error.errors },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { error: 'Failed to create integration' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user?.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { id, ...updateData } = body
    
    if (!id) {
      return NextResponse.json(
        { error: 'Integration ID is required' },
        { status: 400 }
      )
    }

    const validatedData = integrationConfigSchema.partial().parse(updateData)

    // Test the integration if credentials changed
    let testResult = null
    if (validatedData.apiKey || validatedData.baseUrl) {
      const existingIntegration = await db.apiIntegration.findUnique({
        where: { id }
      })
      
      if (!existingIntegration) {
        return NextResponse.json(
          { error: 'Integration not found' },
          { status: 404 }
        )
      }

      const testConfig = {
        ...existingIntegration,
        ...validatedData
      }
      
      testResult = await testIntegration(testConfig)
      if (!testResult.success) {
        return NextResponse.json(
          { error: 'Integration test failed', details: testResult.error },
          { status: 400 }
        )
      }
    }

    // Update integration
    const integration = await db.apiIntegration.update({
      where: { id },
      data: {
        ...validatedData,
        lastTestedAt: testResult ? new Date() : undefined,
        testResult: testResult || undefined
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Integration updated successfully',
      integration: {
        ...integration,
        apiKey: '***masked***',
        apiSecret: integration.apiSecret ? '***masked***' : null
      }
    })
    
  } catch (error) {
    console.error('Error updating integration:', error)
    return NextResponse.json(
      { error: 'Failed to update integration' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user?.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    
    if (!id) {
      return NextResponse.json(
        { error: 'Integration ID is required' },
        { status: 400 }
      )
    }

    await db.apiIntegration.delete({
      where: { id }
    })

    return NextResponse.json({
      success: true,
      message: 'Integration deleted successfully'
    })
    
  } catch (error) {
    console.error('Error deleting integration:', error)
    return NextResponse.json(
      { error: 'Failed to delete integration' },
      { status: 500 }
    )
  }
}

// Helper function to test API integrations
async function testIntegration(config: any): Promise<{ success: boolean; error?: string; responseTime?: number }> {
  const startTime = Date.now()
  
  try {
    const provider = AVAILABLE_INTEGRATIONS[config.provider as keyof typeof AVAILABLE_INTEGRATIONS]
    if (!provider) {
      return { success: false, error: 'Unknown provider' }
    }

    const testUrl = `${config.baseUrl}${provider.testEndpoint}`
    const headers: Record<string, string> = {
      'Content-Type': 'application/json'
    }

    // Add authentication headers based on provider
    switch (config.provider) {
      case 'WEATHER_API':
      case 'MAPS_API':
        headers['Authorization'] = `Bearer ${config.apiKey}`
        break
      case 'PRICING_API':
        headers['X-API-Key'] = config.apiKey
        headers['X-API-Secret'] = config.apiSecret
        break
      case 'PAYMENT_GATEWAY':
        headers['Authorization'] = `Basic ${Buffer.from(`${config.apiKey}:${config.apiSecret}`).toString('base64')}`
        break
      case 'SMS_SERVICE':
        headers['Authorization'] = `ApiKey ${config.apiKey}`
        break
      case 'EMAIL_SERVICE':
        headers['Authorization'] = `Bearer ${config.apiKey}`
        break
    }

    const response = await fetch(testUrl, {
      method: 'GET',
      headers,
      timeout: 10000 // 10 second timeout
    })

    const responseTime = Date.now() - startTime

    if (response.ok) {
      return { success: true, responseTime }
    } else {
      return { 
        success: false, 
        error: `HTTP ${response.status}: ${response.statusText}`,
        responseTime 
      }
    }
    
  } catch (error) {
    const responseTime = Date.now() - startTime
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error',
      responseTime 
    }
  }
}