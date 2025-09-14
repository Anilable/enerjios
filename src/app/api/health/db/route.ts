import { NextRequest, NextResponse } from 'next/server'
import { checkDatabaseConnection, db } from '@/lib/db'
import { withDatabase } from '@/lib/db-wrapper'

export async function GET(request: NextRequest) {
  try {
    // Basic health check
    const healthCheck = await checkDatabaseConnection()

    if (!healthCheck.healthy) {
      return NextResponse.json(
        {
          status: 'unhealthy',
          database: healthCheck,
          timestamp: new Date().toISOString()
        },
        { status: 503 }
      )
    }

    // Extended health check with connection pool info
    const poolInfo = await withDatabase(async () => {
      // Get connection pool metrics (if available)
      try {
        const result = await db.$queryRaw<Array<{ count: bigint }>>`
          SELECT COUNT(*) as count FROM pg_stat_activity
          WHERE datname = current_database() AND state = 'active'
        `
        return {
          activeConnections: Number(result[0]?.count || 0)
        }
      } catch (error) {
        return {
          activeConnections: 'unknown',
          error: error instanceof Error ? error.message : 'Unknown error'
        }
      }
    }, { skipHealthCheck: true })

    // Test a simple query with timing
    const queryStart = Date.now()
    await withDatabase(
      () => db.$queryRaw`SELECT CURRENT_TIMESTAMP`,
      { skipHealthCheck: true }
    )
    const queryTime = Date.now() - queryStart

    return NextResponse.json({
      status: 'healthy',
      database: {
        healthy: true,
        message: 'Database connection is working properly'
      },
      metrics: {
        queryResponseTime: `${queryTime}ms`,
        ...poolInfo
      },
      environment: {
        nodeEnv: process.env.NODE_ENV,
        hasPoolSettings: !!(process.env.DATABASE_URL?.includes('connection_limit'))
      },
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('Database health check failed:', error)

    return NextResponse.json(
      {
        status: 'unhealthy',
        database: {
          healthy: false,
          message: error instanceof Error ? error.message : 'Unknown database error'
        },
        timestamp: new Date().toISOString()
      },
      { status: 503 }
    )
  }
}