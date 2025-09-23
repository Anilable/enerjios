import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { sanitizeObject } from '@/lib/api-security'

export function withValidation<T extends z.ZodSchema>(
  schema: T,
  handler: (request: NextRequest, validatedData: z.infer<T>) => Promise<NextResponse>
) {
  return async (request: NextRequest): Promise<NextResponse> => {
    try {
      let data: any

      if (request.method === 'GET') {
        // Validate query parameters
        const searchParams = request.nextUrl.searchParams
        data = Object.fromEntries(searchParams.entries())
      } else {
        // Validate request body
        data = await request.json()
      }

      // Sanitize input data
      const sanitizedData = sanitizeObject(data)

      // Validate with schema
      const validatedData = schema.parse(sanitizedData)

      return await handler(request, validatedData)
    } catch (error) {
      if (error instanceof z.ZodError) {
        return NextResponse.json(
          {
            error: 'Validation error',
            code: 'VALIDATION_ERROR',
            details: error.issues
          },
          { status: 400 }
        )
      }

      console.error('Validation middleware error:', error)
      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      )
    }
  }
}

export function withRateLimit(
  windowMs: number = 60000, // 1 minute
  maxRequests: number = 100
) {
  const requests = new Map<string, { count: number; resetTime: number }>()

  return function rateLimitMiddleware(
    handler: (request: NextRequest) => Promise<NextResponse>
  ) {
    return async (request: NextRequest): Promise<NextResponse> => {
      const ip = request.ip || 'unknown'
      const now = Date.now()
      
      // Clean up expired entries
      for (const [key, value] of requests.entries()) {
        if (value.resetTime < now) {
          requests.delete(key)
        }
      }
      
      const current = requests.get(ip) || { count: 0, resetTime: now + windowMs }
      
      if (current.resetTime < now) {
        current.count = 1
        current.resetTime = now + windowMs
      } else {
        current.count++
      }
      
      requests.set(ip, current)
      
      if (current.count > maxRequests) {
        return NextResponse.json(
          { error: 'Too many requests' },
          { 
            status: 429,
            headers: {
              'X-RateLimit-Limit': maxRequests.toString(),
              'X-RateLimit-Remaining': '0',
              'X-RateLimit-Reset': current.resetTime.toString()
            }
          }
        )
      }
      
      const response = await handler(request)
      
      // Add rate limit headers
      response.headers.set('X-RateLimit-Limit', maxRequests.toString())
      response.headers.set('X-RateLimit-Remaining', (maxRequests - current.count).toString())
      response.headers.set('X-RateLimit-Reset', current.resetTime.toString())
      
      return response
    }
  }
}