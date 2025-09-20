// src/middleware.ts (NİHAİ VE KESİN ÇÖZÜM)

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // 1. Her istek için benzersiz bir "davetiye kodu" (nonce) oluştur.
  const nonce = Buffer.from(crypto.randomUUID()).toString('base64');

  // 🔥 GÜNCELLEME: 'strict-dynamic' eklendi.
  // Bu, nonce ile yüklenen güvenilir bir betiğin,
  // başka betikler oluşturmasına izin verir. Google OAuth için bu gereklidir.
  const cspHeader = `
    default-src 'self';
    script-src 'self' 'unsafe-eval' 'nonce-${nonce}' 'strict-dynamic';
    style-src 'self' 'unsafe-inline' https://accounts.google.com https://fonts.googleapis.com;
    font-src 'self' https://fonts.gstatic.com;
    frame-src 'self' https://accounts.google.com;
    connect-src 'self' https://accounts.google.com https://www.googleapis.com https://*.googleapis.com;
    img-src 'self' data: https: blob: https://*.googleusercontent.com https://www.gstatic.com;
    frame-ancestors 'none';
  `.replace(/\s{2,}/g, ' ').trim();

  // 3. Mevcut istek başlıklarını kopyala.
  const requestHeaders = new Headers(request.headers);

  // 4. Bu yeni başlıkları, Next.js'in kullanması için ayarla.
  requestHeaders.set('x-nonce', nonce);
  requestHeaders.set('Content-Security-Policy', cspHeader);

  // 5. İsteği, bu yeni ve güncellenmiş başlıklarla birlikte sayfaya ilet.
  const response = NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });

  // 6. Son olarak, bu başlıkları tarayıcıya da gönder.
  response.headers.set('Content-Security-Policy', cspHeader);

  return response;
}

// Middleware'in hangi sayfalarda çalışacağını belirtir.
export const config = {
  matcher: [
    {
      source: '/((?!api|_next/static|_next/image|favicon.ico).*)',
      missing: [
        { type: 'header', key: 'next-router-prefetch' },
        { type: 'header', key: 'purpose', value: 'prefetch' },
      ],
    },
  ],
}