// src/lib/api-security.ts
import { NextRequest } from 'next/server'
import { headers } from 'next/headers'

interface RateLimitConfig {
  windowMs: number
  maxRequests: number
}

const rateLimitStore = new Map<string, { count: number; resetTime: number }>()

export function rateLimit(config: RateLimitConfig) {
  return (request: NextRequest) => {
    const ip = request.ip || 'unknown'
    const now = Date.now()
    const windowStart = now - config.windowMs
    
    // Clean up old entries
    for (const [key, value] of rateLimitStore.entries()) {
      if (value.resetTime < now) {
        rateLimitStore.delete(key)
      }
    }
    
    const current = rateLimitStore.get(ip) || { count: 0, resetTime: now + config.windowMs }
    
    if (current.resetTime < now) {
      current.count = 1
      current.resetTime = now + config.windowMs
    } else {
      current.count++
    }
    
    rateLimitStore.set(ip, current)
    
    return {
      allowed: current.count <= config.maxRequests,
      remaining: Math.max(0, config.maxRequests - current.count),
      resetTime: current.resetTime
    }
  }
}

export function sanitizeInput(input: string): string {
  return input
    .replace(/[<>'"&]/g, '') // Remove potential XSS characters
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+=/gi, '') // Remove event handlers
    .trim()
    .slice(0, 1000) // Limit length
}

export function sanitizeObject<T extends Record<string, any>>(obj: T): T {
  const sanitized = {} as T
  
  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === 'string') {
      sanitized[key as keyof T] = sanitizeInput(value) as T[keyof T]
    } else if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      sanitized[key as keyof T] = sanitizeObject(value) as T[keyof T]
    } else {
      sanitized[key as keyof T] = value
    }
  }
  
  return sanitized
}

export function validateCSRF(request: NextRequest): boolean {
  const origin = request.headers.get('origin')
  const referer = request.headers.get('referer')
  const host = request.headers.get('host')
  
  // Allow same-origin requests
  if (origin && host && origin.includes(host)) {
    return true
  }
  
  if (referer && host && referer.includes(host)) {
    return true
  }
  
  return false
}

export function logSecurityEvent(event: string, details: any) {
  console.warn(`[SECURITY] ${event}:`, details)
  // In production, send to security monitoring service
}