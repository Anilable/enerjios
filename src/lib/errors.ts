import { NextResponse } from 'next/server'
import { z } from 'zod'

export class APIError extends Error {
  constructor(
    message: string,
    public statusCode: number = 500,
    public code?: string
  ) {
    super(message)
    this.name = 'APIError'
  }
}

export class ValidationError extends APIError {
  constructor(message: string, public details?: any) {
    super(message, 400, 'VALIDATION_ERROR')
  }
}

export class AuthenticationError extends APIError {
  constructor(message: string = 'Authentication required') {
    super(message, 401, 'AUTHENTICATION_ERROR')
  }
}

export class AuthorizationError extends APIError {
  constructor(message: string = 'Insufficient permissions') {
    super(message, 403, 'AUTHORIZATION_ERROR')
  }
}

export class NotFoundError extends APIError {
  constructor(message: string = 'Resource not found') {
    super(message, 404, 'NOT_FOUND_ERROR')
  }
}

export class ConflictError extends APIError {
  constructor(message: string = 'Resource conflict') {
    super(message, 409, 'CONFLICT_ERROR')
  }
}

export class RateLimitError extends APIError {
  constructor(message: string = 'Too many requests') {
    super(message, 429, 'RATE_LIMIT_ERROR')
  }
}

// Error handler middleware
export function handleAPIError(error: unknown) {
  if (error instanceof APIError) {
    return NextResponse.json(
      { 
        error: error.message, 
        code: error.code,
        ...(error instanceof ValidationError && { details: error.details })
      },
      { status: error.statusCode }
    )
  }
  
  if (error instanceof z.ZodError) {
    return NextResponse.json(
      { 
        error: 'Validation error', 
        code: 'VALIDATION_ERROR',
        details: error.issues
      },
      { status: 400 }
    )
  }
  
  console.error('Unexpected API Error:', error)
  return NextResponse.json(
    { error: 'Internal server error', code: 'INTERNAL_ERROR' },
    { status: 500 }
  )
}