import { withAuth } from "next-auth/middleware"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'

// Initialize rate limiter if Redis is available
let ratelimit: Ratelimit | null = null
if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
  ratelimit = new Ratelimit({
    redis: Redis.fromEnv(),
    limiter: Ratelimit.slidingWindow(60, '1 m'),
    analytics: true,
  })
}

export default withAuth(
  async function middleware(req) {
    const token = req.nextauth.token
    const pathname = req.nextUrl.pathname
    const response = NextResponse.next()

    // Rate limiting for API routes
    if (pathname.startsWith('/api/') && ratelimit) {
      const ip = (req as any).ip ?? req.headers.get('x-forwarded-for') ?? '127.0.0.1'
      const { success, limit, reset, remaining } = await ratelimit.limit(ip)

      if (!success) {
        return new NextResponse('Too Many Requests', {
          status: 429,
          headers: {
            'Retry-After': Math.round((reset - Date.now()) / 1000).toString(),
            'X-RateLimit-Limit': limit.toString(),
            'X-RateLimit-Remaining': remaining.toString(),
            'X-RateLimit-Reset': new Date(reset).toISOString(),
          },
        })
      }
    }

    // Security headers
    response.headers.set('X-DNS-Prefetch-Control', 'off')
    response.headers.set('X-Download-Options', 'noopen')
    response.headers.set('X-Permitted-Cross-Domain-Policies', 'none')

    // Allow access to auth pages for unauthenticated users
    if (pathname.startsWith("/auth/")) {
      if (token) {
        // Redirect authenticated users away from auth pages
        return NextResponse.redirect(new URL("/dashboard", req.url))
      }
      return response
    }

    // Public routes that don't require authentication
    const publicRoutes = ["/", "/about", "/contact", "/pricing"]
    if (publicRoutes.includes(pathname) || pathname.startsWith("/photo-upload/")) {
      return response
    }

    // Protected routes - require authentication
    if (!token) {
      return NextResponse.redirect(new URL("/auth/signin", req.url))
    }

    // Role-based access control
    const userRole = token.role as string
    const userStatus = token.status as string

    // Check if user account is active
    if (userStatus !== "ACTIVE") {
      return NextResponse.redirect(new URL("/auth/account-suspended", req.url))
    }

    // Dashboard routes - accessible by all authenticated users
    if (pathname.startsWith("/dashboard")) {
      // All authenticated users with ACTIVE status can access dashboard
      if (!["ADMIN", "COMPANY", "CUSTOMER", "FARMER", "INSTALLATION_TEAM"].includes(userRole)) {
        return NextResponse.redirect(new URL("/unauthorized", req.url))
      }
    }

    return response
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const pathname = req.nextUrl.pathname

        // Allow access to public routes
        const publicRoutes = ["/", "/about", "/contact", "/pricing", "/auth", "/photo-upload"]
        if (publicRoutes.some(route => pathname.startsWith(route))) {
          return true
        }

        // Require token for protected routes
        return !!token
      },
    },
  }
)

export const config = {
  matcher: [
    // Match all paths except static files and API routes
    "/((?!api|_next/static|_next/image|favicon.ico|images|icons).*)",
  ],
}