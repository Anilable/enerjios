import { NextRequest, NextResponse } from 'next/server'

const baseUrl = process.env.NEXT_PUBLIC_DOMAIN || 'https://trakyasolar.com'

export async function GET(request: NextRequest) {
  const robots = `User-agent: *
Allow: /

# Sitemap
Sitemap: ${baseUrl}/sitemap.xml

# Block sensitive areas
Disallow: /api/
Disallow: /admin/
Disallow: /_next/
Disallow: /dashboard/*/private/
Disallow: /auth/error

# Allow important pages
Allow: /dashboard
Allow: /dashboard/agri-solar
Allow: /dashboard/financing

# Crawl delay
Crawl-delay: 1`

  return new NextResponse(robots, {
    headers: {
      'Content-Type': 'text/plain',
      'Cache-Control': 's-maxage=86400, stale-while-revalidate', // Cache for 1 day
    },
  })
}