import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'
import { NextRequest, NextResponse } from 'next/server'

// Initialize Redis (fallback to in-memory for development)
const redis = process.env.UPSTASH_REDIS_URL && process.env.UPSTASH_REDIS_TOKEN
  ? new Redis({
      url: process.env.UPSTASH_REDIS_URL,
      token: process.env.UPSTASH_REDIS_TOKEN,
    })
  : undefined

// Different rate limit configurations for different endpoints
const rateLimitConfigs = {
  // Authentication endpoints - stricter limits
  auth: new Ratelimit({
    redis: redis || new Map() as any,
    limiter: Ratelimit.slidingWindow(5, '1 m'), // 5 requests per minute
    analytics: true,
  }),

  // API endpoints - moderate limits
  api: new Ratelimit({
    redis: redis || new Map() as any,
    limiter: Ratelimit.slidingWindow(100, '1 m'), // 100 requests per minute
    analytics: true,
  }),

  // Heavy calculations - conservative limits
  calculator: new Ratelimit({
    redis: redis || new Map() as any,
    limiter: Ratelimit.slidingWindow(20, '1 m'), // 20 calculations per minute
    analytics: true,
  }),

  // File uploads - very strict limits
  upload: new Ratelimit({
    redis: redis || new Map() as any,
    limiter: Ratelimit.slidingWindow(10, '5 m'), // 10 uploads per 5 minutes
    analytics: true,
  }),

  // General - lenient limits
  general: new Ratelimit({
    redis: redis || new Map() as any,
    limiter: Ratelimit.slidingWindow(1000, '1 m'), // 1000 requests per minute
    analytics: true,
  }),
}

export type RateLimitType = keyof typeof rateLimitConfigs

// Get client identifier from request
function getClientId(request: NextRequest): string {
  // Try to get user ID from session if available
  const sessionId = request.cookies.get('next-auth.session-token')?.value
  if (sessionId) return `session:${sessionId}`

  // Fallback to IP address
  const forwarded = request.headers.get('x-forwarded-for')
  const ip = forwarded?.split(',')[0] || request.headers.get('x-real-ip') || 'anonymous'
  return `ip:${ip}`
}

// Rate limiting middleware
export async function rateLimit(
  request: NextRequest,
  type: RateLimitType = 'general'
): Promise<{ success: boolean; limit: number; remaining: number; reset: Date } | null> {
  const ratelimit = rateLimitConfigs[type]
  const clientId = getClientId(request)

  try {
    const result = await ratelimit.limit(clientId)
    
    return {
      success: result.success,
      limit: result.limit,
      remaining: result.remaining,
      reset: new Date(result.reset)
    }
  } catch (error) {
    console.error('Rate limiting error:', error)
    // Allow request if rate limiting fails
    return null
  }
}

// Wrapper for API routes
export function withRateLimit(
  handler: (req: NextRequest) => Promise<NextResponse>,
  type: RateLimitType = 'api'
) {
  return async (req: NextRequest) => {
    const result = await rateLimit(req, type)
    
    if (result && !result.success) {
      return NextResponse.json(
        { 
          error: 'Rate limit exceeded',
          message: 'Çok fazla istek gönderdiniz. Lütfen daha sonra tekrar deneyin.',
          limit: result.limit,
          remaining: result.remaining,
          resetTime: result.reset.toISOString()
        },
        { 
          status: 429,
          headers: {
            'X-RateLimit-Limit': result.limit.toString(),
            'X-RateLimit-Remaining': result.remaining.toString(),
            'X-RateLimit-Reset': result.reset.getTime().toString(),
            'Retry-After': Math.round((result.reset.getTime() - Date.now()) / 1000).toString()
          }
        }
      )
    }

    // Add rate limit headers to response
    const response = await handler(req)
    
    if (result) {
      response.headers.set('X-RateLimit-Limit', result.limit.toString())
      response.headers.set('X-RateLimit-Remaining', result.remaining.toString())
      response.headers.set('X-RateLimit-Reset', result.reset.getTime().toString())
    }

    return response
  }
}

// IP whitelist for internal services
const WHITELIST_IPS = [
  '127.0.0.1',
  '::1',
  // Add production server IPs here
]

export function isWhitelisted(request: NextRequest): boolean {
  const forwarded = request.headers.get('x-forwarded-for')
  const ip = forwarded?.split(',')[0] || request.headers.get('x-real-ip')
  
  return ip ? WHITELIST_IPS.includes(ip) : false
}

// Security middleware for sensitive endpoints
export function withSecurityChecks(
  handler: (req: NextRequest) => Promise<NextResponse>,
  options: {
    requireAuth?: boolean
    rateLimitType?: RateLimitType
    allowedMethods?: string[]
    requireHTTPS?: boolean
  } = {}
) {
  return async (req: NextRequest) => {
    // Check HTTPS in production
    if (options.requireHTTPS && process.env.NODE_ENV === 'production') {
      const proto = req.headers.get('x-forwarded-proto')
      if (proto !== 'https') {
        return NextResponse.json(
          { error: 'HTTPS required' },
          { status: 426 } // Upgrade Required
        )
      }
    }

    // Check allowed methods
    if (options.allowedMethods && !options.allowedMethods.includes(req.method)) {
      return NextResponse.json(
        { error: 'Method not allowed' },
        { status: 405, headers: { 'Allow': options.allowedMethods.join(', ') } }
      )
    }

    // Apply rate limiting (skip for whitelisted IPs)
    if (!isWhitelisted(req)) {
      const result = await rateLimit(req, options.rateLimitType || 'api')
      
      if (result && !result.success) {
        return NextResponse.json(
          { error: 'Rate limit exceeded' },
          { status: 429 }
        )
      }
    }

    return handler(req)
  }
}