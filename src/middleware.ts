// src/middleware.ts (GÜNCELLENMİŞ VE BİRLEŞTİRİLMİŞ HALİ)

import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

// Initialize rate limiter if Redis is available
let ratelimit: Ratelimit | null = null;
if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
  ratelimit = new Ratelimit({
    redis: Redis.fromEnv(),
    limiter: Ratelimit.slidingWindow(60, '1 m'),
    analytics: true,
  });
}

export default withAuth(
  async function middleware(req) {
    const token = req.nextauth.token;
    const pathname = req.nextUrl.pathname;

    // 🔥🔥🔥 GÜNCELLEME BURADA BAŞLIYOR 🔥🔥🔥

    // 1. Her istek için benzersiz bir "davetiye kodu" (nonce) oluştur.
    const nonce = Buffer.from(crypto.randomUUID()).toString('base64');

    // 2. Google OAuth'un ihtiyaç duyduğu TÜM kaynakları içeren CSP kuralını oluştur.
    const cspHeader = `
      default-src 'self';
      script-src 'self' 'unsafe-eval' 'nonce-${nonce}' https://accounts.google.com https://apis.google.com https://www.gstatic.com https://*.googleapis.com;
      style-src 'self' 'unsafe-inline' https://accounts.google.com https://fonts.googleapis.com;
      font-src 'self' https://fonts.gstatic.com;
      frame-src 'self' https://accounts.google.com;
      connect-src 'self' https://accounts.google.com https://www.googleapis.com https://*.googleapis.com;
      img-src 'self' data: https: blob: https://*.googleusercontent.com https://www.gstatic.com;
      frame-ancestors 'none';
    `.replace(/\s{2,}/g, ' ').trim();

    // 3. Mevcut yanıtı oluşturmak için NextResponse.next() kullanmak yerine,
    // önce başlıkları oluşturup sonra yanıtı bu başlıklarla zincirleyeceğiz.
    const requestHeaders = new Headers(req.headers);
    requestHeaders.set('x-nonce', nonce); // nonce'u hem sunucu tarafı bileşenlerin okuması için (x-nonce)
    requestHeaders.set('Content-Security-Policy', cspHeader); // hem de tarayıcıya göndermek için ayarla.

    // 4. İsteği, bu yeni ve güncellenmiş başlıklarla birlikte sayfaya ilet.
    const response = NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });

    // 5. Yanıtın başlıklarını da güncelle (tarayıcıya göndermek için)
    response.headers.set('Content-Security-Policy', cspHeader);

    // 🔥🔥🔥 GÜNCELLEME BURADA BİTİYOR 🔥🔥🔥


    // === SENİN MEVCUT MANTIĞIN OLDUĞU GİBİ KORUNUYOR ===

    // Rate limiting for API routes
    if (pathname.startsWith('/api/') && ratelimit) {
      const ip = req.ip ?? req.headers.get('x-forwarded-for') ?? '127.0.0.1';
      const { success, limit, reset, remaining } = await ratelimit.limit(ip);

      if (!success) {
        return new NextResponse('Too Many Requests', {
          status: 429,
          headers: {
            'Retry-After': Math.round((reset - Date.now()) / 1000).toString(),
            'X-RateLimit-Limit': limit.toString(),
            'X-RateLimit-Remaining': remaining.toString(),
            'X-RateLimit-Reset': new Date(reset).toISOString(),
          },
        });
      }
    }

    // Security headers (senin diğer güvenlik başlıkların da korunuyor)
    response.headers.set('X-DNS-Prefetch-Control', 'off');
    response.headers.set('X-Download-Options', 'noopen');
    response.headers.set('X-Permitted-Cross-Domain-Policies', 'none');

    // Allow access to auth pages for unauthenticated users
    if (pathname.startsWith("/auth/")) {
      if (token) {
        return NextResponse.redirect(new URL("/dashboard", req.url));
      }
      return response;
    }

    // Public routes that don't require authentication
    const publicRoutes = ["/", "/about", "/contact", "/pricing"];
    if (publicRoutes.includes(pathname) || pathname.startsWith("/photo-upload/")) {
      return response;
    }

    // Protected routes - require authentication
    if (!token) {
      return NextResponse.redirect(new URL("/auth/signin", req.url));
    }

    // Role-based access control
    const userRole = token.role as string;
    const userStatus = token.status as string;

    // Check if user account is active
    if (userStatus !== "ACTIVE") {
      return NextResponse.redirect(new URL("/auth/account-suspended", req.url));
    }

    // Dashboard routes - accessible by all authenticated users
    if (pathname.startsWith("/dashboard")) {
      if (!["ADMIN", "COMPANY", "CUSTOMER", "FARMER", "INSTALLATION_TEAM"].includes(userRole)) {
        return NextResponse.redirect(new URL("/unauthorized", req.url));
      }
    }

    return response;
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const pathname = req.nextUrl.pathname;
        const publicRoutes = ["/", "/about", "/contact", "/pricing", "/auth", "/photo-upload"];
        if (publicRoutes.some(route => pathname.startsWith(route))) {
          return true;
        }
        return !!token;
      },
    },
  }
);

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|images|icons).*)",
  ],
};