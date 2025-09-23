import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth-utils'
import { checkApiPermissions } from '@/lib/permissions'
import { prisma } from '@/lib/prisma'

export async function GET(_request: NextRequest) {
  try {
    const user = await requireAuth()

    // Check permissions - only admins can access database performance info
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

    // Get performance metrics
    const startTime = Date.now()
    
    // Test database response time with a simple query
    await prisma.user.findFirst()
    const responseTime = Date.now() - startTime

    // Get recent activity for performance analysis
    const now = new Date()
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000)
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000)

    const [
      recentActivity,
      dailyActivity,
      totalUsers,
      activeProjects
    ] = await Promise.all([
      // Recent activity (last hour)
      Promise.all([
        prisma.user.count({ where: { createdAt: { gte: oneHourAgo } } }),
        prisma.project.count({ where: { createdAt: { gte: oneHourAgo } } }),
        prisma.quote.count({ where: { createdAt: { gte: oneHourAgo } } }),
        prisma.projectRequest.count({ where: { createdAt: { gte: oneHourAgo } } })
      ]).then(([users, projects, quotes, requests]) => users + projects + quotes + requests),
      
      // Daily activity
      Promise.all([
        prisma.user.count({ where: { createdAt: { gte: oneDayAgo } } }),
        prisma.project.count({ where: { createdAt: { gte: oneDayAgo } } }),
        prisma.quote.count({ where: { createdAt: { gte: oneDayAgo } } }),
        prisma.projectRequest.count({ where: { createdAt: { gte: oneDayAgo } } })
      ]).then(([users, projects, quotes, requests]) => users + projects + quotes + requests),
      
      // Total users for connection simulation
      prisma.user.count(),
      
      // Active projects
      prisma.project.count({
        where: {
          status: 'IN_PROGRESS'
        }
      })
    ])

    // Simulate performance metrics based on real data
    const queriesPerSecond = Math.max(1, Math.round(recentActivity / 36)) // Rough estimate
    const activeConnections = Math.min(100, Math.max(1, Math.round(totalUsers / 10)))
    const cpuUsage = Math.min(100, Math.max(10, queriesPerSecond * 2 + Math.random() * 10))
    const memoryUsage = Math.min(100, Math.max(20, activeConnections + Math.random() * 20))

    // Simulate slow queries based on complexity
    const slowQueries = []
    if (dailyActivity > 100) {
      slowQueries.push({
        query: 'SELECT p.*, c.name as company_name FROM projects p JOIN companies c ON p.companyId = c.id WHERE p.status = ?',
        duration: '1.2s',
        executions: Math.round(dailyActivity / 20),
        avgDuration: '0.8s',
        table: 'projects',
        suggestion: 'Proje durumu için indeks ekleyin'
      })
    }
    
    if (totalUsers > 50) {
      slowQueries.push({
        query: 'SELECT COUNT(*) FROM users u JOIN customers c ON u.id = c.userId WHERE u.createdAt > ?',
        duration: '0.9s',
        executions: Math.round(dailyActivity / 30),
        avgDuration: '0.6s',
        table: 'users',
        suggestion: 'createdAt sütunu için indeks optimizasyonu'
      })
    }

    return NextResponse.json({
      realTime: {
        responseTime: `${responseTime}ms`,
        queriesPerSecond,
        activeConnections,
        cpuUsage: Math.round(cpuUsage),
        memoryUsage: Math.round(memoryUsage)
      },
      activity: {
        lastHour: recentActivity,
        last24Hours: dailyActivity,
        totalOperations: dailyActivity * 7 // Rough weekly estimate
      },
      slowQueries,
      recommendations: [
        {
          type: 'index',
          table: 'projects',
          column: 'status',
          impact: 'high',
          description: 'Proje durumu sorguları için indeks ekleyin'
        },
        {
          type: 'index',
          table: 'users',
          column: 'createdAt',
          impact: 'medium',
          description: 'Tarih bazlı sorgular için indeks optimizasyonu'
        },
        {
          type: 'vacuum',
          table: 'project_requests',
          impact: 'low',
          description: 'Tablo bakımı için vakumlama önerilir'
        }
      ],
      metrics: {
        cacheHitRate: Math.min(100, Math.max(80, 95 - (slowQueries.length * 5))),
        indexUsage: Math.min(100, Math.max(70, 90 - (slowQueries.length * 3))),
        connectionEfficiency: Math.min(100, Math.max(60, 85 - (activeConnections / 10)))
      }
    })

  } catch (error) {
    console.error('Database performance error:', error)
    return NextResponse.json(
      { error: 'Performans bilgileri alınamadı' },
      { status: 500 }
    )
  }
}