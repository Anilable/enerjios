import { PrismaClient } from '@prisma/client'

// Extend global type for Prisma instance
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

// Enhanced Prisma configuration with connection pool optimization
const createPrismaClient = () => {
  const client = new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
    datasources: {
      db: {
        url: process.env.DATABASE_URL,
      },
    },
    // Connection pool configuration
    transactionOptions: {
      timeout: 30000, // 30 seconds transaction timeout
      isolationLevel: 'ReadCommitted',
    },
  })

  // Note: beforeExit hook removed - not supported in Prisma 5.0+ library engine
  // Connection cleanup is handled by process exit handlers below

  return client
}

// Singleton pattern with proper cleanup
export const db = globalForPrisma.prisma ?? createPrismaClient()

// Store in global only in development to prevent hot reload issues
if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = db
}

// Export prisma as alias for compatibility
export const prisma = db

// Connection cleanup utility for API routes
export const closePrismaConnection = async () => {
  try {
    await db.$disconnect()
    console.log('Prisma connection closed successfully')
  } catch (error) {
    console.error('Error closing Prisma connection:', error)
  }
}

// Connection health check utility
export const checkDatabaseConnection = async () => {
  try {
    await db.$queryRaw`SELECT 1`
    return { healthy: true, message: 'Database connection is healthy' }
  } catch (error) {
    console.error('Database connection check failed:', error)
    return {
      healthy: false,
      message: error instanceof Error ? error.message : 'Unknown database error'
    }
  }
}

// Graceful shutdown handler for production
if (process.env.NODE_ENV === 'production') {
  process.on('SIGINT', async () => {
    console.log('SIGINT received: closing database connection')
    await closePrismaConnection()
    process.exit(0)
  })

  process.on('SIGTERM', async () => {
    console.log('SIGTERM received: closing database connection')
    await closePrismaConnection()
    process.exit(0)
  })
}