import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth-utils'
import { checkApiPermissions } from '@/lib/permissions'
import { prisma } from '@/lib/prisma'

export async function GET(_request: NextRequest) {
  try {
    const user = await requireAuth()

    // Check permissions - only admins can access database tables info
    const hasAccess = checkApiPermissions(
      user.role as any,
      user.id,
      ['system:monitoring'],
      undefined
    )

    if (!hasAccess || user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Bu işlem için yetkiniz bulunmamaktadır' },
        { status: 403 }
      )
    }

    // Get detailed table information
    const tables = await Promise.all([
      // Users table
      prisma.user.count().then(count => ({
        name: 'users',
        displayName: 'Kullanıcılar',
        records: count,
        size: `${Math.round(count * 0.5)}KB`, // Rough estimate
        lastUpdated: new Date().toISOString(),
        description: 'Sistem kullanıcıları ve kimlik doğrulama bilgileri'
      })),
      
      // Projects table
      prisma.project.count().then(count => ({
        name: 'projects',
        displayName: 'Projeler',
        records: count,
        size: `${Math.round(count * 2)}KB`,
        lastUpdated: new Date().toISOString(),
        description: 'Güneş enerjisi projeleri ve detayları'
      })),
      
      // Companies table
      prisma.company.count().then(count => ({
        name: 'companies',
        displayName: 'Şirketler',
        records: count,
        size: `${Math.round(count * 1.5)}KB`,
        lastUpdated: new Date().toISOString(),
        description: 'Kayıtlı şirket bilgileri'
      })),
      
      // Customers table
      prisma.customer.count().then(count => ({
        name: 'customers',
        displayName: 'Müşteriler',
        records: count,
        size: `${Math.round(count * 1)}KB`,
        lastUpdated: new Date().toISOString(),
        description: 'Müşteri bilgileri ve iletişim detayları'
      })),
      
      // Quotes table
      prisma.quote.count().then(count => ({
        name: 'quotes',
        displayName: 'Teklifler',
        records: count,
        size: `${Math.round(count * 3)}KB`,
        lastUpdated: new Date().toISOString(),
        description: 'Proje teklifleri ve fiyatlandırma'
      })),
      
      // Products table
      prisma.product.count().then(count => ({
        name: 'products',
        displayName: 'Ürünler',
        records: count,
        size: `${Math.round(count * 2)}KB`,
        lastUpdated: new Date().toISOString(),
        description: 'Güneş paneli ve ekipman kataloğu'
      })),
      
      // Project Requests table
      prisma.projectRequest.count().then(count => ({
        name: 'project_requests',
        displayName: 'Proje Talepleri',
        records: count,
        size: `${Math.round(count * 1.5)}KB`,
        lastUpdated: new Date().toISOString(),
        description: 'Gelen proje talepleri ve başvurular'
      }))
    ])

    // Sort by record count (largest first)
    tables.sort((a, b) => b.records - a.records)

    return NextResponse.json({
      tables,
      summary: {
        totalTables: tables.length,
        totalRecords: tables.reduce((sum, table) => sum + table.records, 0),
        largestTable: tables[0]?.name || 'N/A',
        smallestTable: tables[tables.length - 1]?.name || 'N/A'
      }
    })

  } catch (error) {
    console.error('Database tables error:', error)
    return NextResponse.json(
      { error: 'Tablo bilgileri alınamadı' },
      { status: 500 }
    )
  }
}