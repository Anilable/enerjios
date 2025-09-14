import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { db, checkDatabaseConnection } from './db'

// Database operation wrapper with connection management
export async function withDatabase<T>(
  operation: () => Promise<T>,
  options?: {
    timeout?: number
    retries?: number
    skipHealthCheck?: boolean
  }
): Promise<T> {
  const { timeout = 30000, retries = 3, skipHealthCheck = false } = options || {}

  // Health check before operation (optional)
  if (!skipHealthCheck) {
    const healthCheck = await checkDatabaseConnection()
    if (!healthCheck.healthy) {
      throw new Error(`Database connection unhealthy: ${healthCheck.message}`)
    }
  }

  let lastError: Error | null = null

  // Retry logic for transient failures
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      // Execute operation with timeout
      const result = await Promise.race([
        operation(),
        new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error('Database operation timeout')), timeout)
        )
      ])
      return result
    } catch (error) {
      lastError = error instanceof Error ? error : new Error('Unknown database error')

      // Check if error is retryable
      if (isRetryableError(lastError) && attempt < retries) {
        console.warn(`Database operation failed (attempt ${attempt}/${retries}):`, lastError.message)
        // Exponential backoff: 100ms, 200ms, 400ms...
        await new Promise(resolve => setTimeout(resolve, 100 * Math.pow(2, attempt - 1)))
        continue
      }

      break
    }
  }

  throw lastError || new Error('Database operation failed after retries')
}

// API route wrapper with database connection management
export function withDatabaseAPI<TParams = any>(
  handler: (
    request: NextRequest,
    context: { params: TParams },
    db: PrismaClient
  ) => Promise<NextResponse>
) {
  return async (request: NextRequest, context: { params: TParams }) => {
    try {
      // Pass database instance to handler
      const response = await withDatabase(
        () => handler(request, context, db),
        {
          timeout: 60000, // 60 seconds for API operations
          retries: 2,
          skipHealthCheck: false
        }
      )
      return response
    } catch (error) {
      console.error('Database API error:', error)

      // Return appropriate error response
      if (error instanceof Error) {
        if (error.message.includes('timeout')) {
          return NextResponse.json(
            { error: 'Database operation timeout', details: 'The request took too long to complete' },
            { status: 504 }
          )
        }

        if (error.message.includes('connection') || error.message.includes('pool')) {
          return NextResponse.json(
            { error: 'Database connection error', details: 'Unable to connect to database' },
            { status: 503 }
          )
        }
      }

      return NextResponse.json(
        { error: 'Internal server error', details: 'Database operation failed' },
        { status: 500 }
      )
    }
  }
}

// Check if error is retryable
function isRetryableError(error: Error): boolean {
  const retryablePatterns = [
    'connection',
    'timeout',
    'pool',
    'network',
    'ECONNRESET',
    'ECONNREFUSED',
    'ETIMEDOUT'
  ]

  const errorMessage = error.message.toLowerCase()
  return retryablePatterns.some(pattern => errorMessage.includes(pattern))
}

// Transaction wrapper with proper error handling
export async function withTransaction<T>(
  operation: (tx: any) => Promise<T>,
  options?: {
    timeout?: number
    isolationLevel?: 'ReadUncommitted' | 'ReadCommitted' | 'RepeatableRead' | 'Serializable'
  }
): Promise<T> {
  const { timeout = 30000, isolationLevel = 'ReadCommitted' } = options || {}

  return withDatabase(
    () => db.$transaction(
      operation,
      {
        timeout,
        isolationLevel
      }
    ),
    {
      timeout: timeout + 5000, // Add buffer for transaction overhead
      retries: 2
    }
  )
}

// Batch operation wrapper
export async function withBatch<T>(
  operations: (() => Promise<T>)[],
  options?: {
    concurrency?: number
    timeout?: number
  }
): Promise<T[]> {
  const { concurrency = 5, timeout = 60000 } = options || {}

  // Execute operations in batches with controlled concurrency
  const results: T[] = []

  for (let i = 0; i < operations.length; i += concurrency) {
    const batch = operations.slice(i, i + concurrency)
    const batchResults = await Promise.all(
      batch.map(operation =>
        withDatabase(operation, { timeout: timeout / batch.length, retries: 1 })
      )
    )
    results.push(...batchResults)
  }

  return results
}