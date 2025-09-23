// src/lib/cache.ts
interface CacheEntry<T> {
  data: T
  timestamp: number
  ttl: number
}

class MemoryCache {
  private cache = new Map<string, CacheEntry<any>>()

  set<T>(key: string, data: T, ttlMs: number = 5 * 60 * 1000): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl: ttlMs
    })
  }

  get<T>(key: string): T | null {
    const entry = this.cache.get(key)
    
    if (!entry) {
      return null
    }

    if (Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(key)
      return null
    }

    return entry.data
  }

  delete(key: string): void {
    this.cache.delete(key)
  }

  clear(): void {
    this.cache.clear()
  }

  // Clean up expired entries
  cleanup(): void {
    const now = Date.now()
    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > entry.ttl) {
        this.cache.delete(key)
      }
    }
  }
}

export const cache = new MemoryCache()

// Cache key generators with better structure
export const cacheKeys = {
  reports: (type: string, dateRange: string, userId: string, companyId?: string) => 
    `reports:${type}:${dateRange}:${companyId || userId}`,
  finance: (type: string, userId: string, companyId?: string) => 
    `finance:${type}:${companyId || userId}`,
  dashboard: (userId: string, companyId?: string) => 
    `dashboard:${companyId || userId}`,
  database: (type: string) => 
    `database:${type}`,
  performance: () => 
    `performance:metrics`
}

// Cache wrapper for API functions
export function withCache<T extends any[], R>(
  fn: (...args: T) => Promise<R>,
  keyGenerator: (...args: T) => string,
  ttlMs: number = 5 * 60 * 1000
) {
  return async (...args: T): Promise<R> => {
    const key = keyGenerator(...args)
    const cached = cache.get<R>(key)
    
    if (cached) {
      return cached
    }

    const result = await fn(...args)
    cache.set(key, result, ttlMs)
    
    return result
  }
}

// Cleanup expired entries every 10 minutes
setInterval(() => {
  cache.cleanup()
}, 10 * 60 * 1000)