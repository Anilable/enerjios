import { NextResponse } from 'next/server'
import { ZodError } from 'zod'
import { Prisma } from '@prisma/client'
import * as Sentry from '@sentry/nextjs'

export interface ApiError extends Error {
  statusCode: number
  code?: string
}

export class AppError extends Error {
  statusCode: number
  isOperational: boolean
  code?: string

  constructor(message: string, statusCode: number, isOperational = true, code?: string) {
    super(message)
    this.statusCode = statusCode
    this.isOperational = isOperational
    this.code = code

    Error.captureStackTrace(this, this.constructor)
  }
}

export function handleApiError(error: unknown): NextResponse {
  // Log error to Sentry in production
  if (process.env.NODE_ENV === 'production') {
    Sentry.captureException(error)
  }

  console.error('API Error:', error)

  // Zod validation errors
  if (error instanceof ZodError) {
    return NextResponse.json(
      {
        error: 'Validation Error',
        message: 'Invalid request data',
        details: error.errors.map(err => ({
          field: err.path.join('.'),
          message: err.message,
        })),
      },
      { status: 400 }
    )
  }

  // Prisma errors
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    switch (error.code) {
      case 'P2002':
        return NextResponse.json(
          {
            error: 'Conflict',
            message: 'A record with this data already exists',
            code: 'DUPLICATE_ENTRY',
          },
          { status: 409 }
        )
      case 'P2025':
        return NextResponse.json(
          {
            error: 'Not Found',
            message: 'Record not found',
            code: 'RECORD_NOT_FOUND',
          },
          { status: 404 }
        )
      case 'P2003':
        return NextResponse.json(
          {
            error: 'Bad Request',
            message: 'Invalid reference to related record',
            code: 'FOREIGN_KEY_VIOLATION',
          },
          { status: 400 }
        )
      default:
        return NextResponse.json(
          {
            error: 'Database Error',
            message: 'A database error occurred',
            code: 'DATABASE_ERROR',
          },
          { status: 500 }
        )
    }
  }

  // Custom app errors
  if (error instanceof AppError) {
    return NextResponse.json(
      {
        error: error.message,
        code: error.code,
      },
      { status: error.statusCode }
    )
  }

  // Rate limiting errors
  if (error instanceof Error && error.message.includes('Too Many Requests')) {
    return NextResponse.json(
      {
        error: 'Too Many Requests',
        message: 'Rate limit exceeded. Please try again later.',
        code: 'RATE_LIMIT_EXCEEDED',
      },
      { status: 429 }
    )
  }

  // Network/External API errors
  if (error instanceof Error && error.message.includes('fetch')) {
    return NextResponse.json(
      {
        error: 'Service Unavailable',
        message: 'External service is temporarily unavailable',
        code: 'EXTERNAL_SERVICE_ERROR',
      },
      { status: 503 }
    )
  }

  // Generic error handling
  const statusCode = (error as ApiError)?.statusCode || 500
  const message = process.env.NODE_ENV === 'production' 
    ? 'An unexpected error occurred'
    : (error as Error)?.message || 'Unknown error'

  return NextResponse.json(
    {
      error: 'Internal Server Error',
      message,
      code: 'INTERNAL_ERROR',
    },
    { status: statusCode }
  )
}

// Error handler for async API routes
export function withErrorHandling(
  handler: (req: Request, context?: any) => Promise<Response>
) {
  return async (req: Request, context?: any) => {
    try {
      return await handler(req, context)
    } catch (error) {
      return handleApiError(error)
    }
  }
}

// Success response helper
export function successResponse<T>(data: T, message?: string, status = 200) {
  return NextResponse.json(
    {
      success: true,
      message: message || 'Success',
      data,
    },
    { status }
  )
}

// Error response helper
export function errorResponse(
  message: string,
  statusCode = 500,
  code?: string,
  details?: any
) {
  return NextResponse.json(
    {
      success: false,
      error: message,
      code,
      details,
    },
    { status: statusCode }
  )
}