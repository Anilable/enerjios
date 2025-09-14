interface RateLimitOptions {
  interval: number // Time window in milliseconds
  uniqueTokenPerInterval: number // Max unique tokens per interval
  tokensPerInterval: number // Max requests per token per interval
}

interface TokenBucket {
  tokens: number
  lastRefill: number
  requests: number
}

// In-memory store for rate limiting
const store = new Map<string, TokenBucket>()

export function rateLimit(options: RateLimitOptions) {
  return {
    async check(limit: number, token: string): Promise<void> {
      return new Promise((resolve, reject) => {
        const now = Date.now()
        const key = token

        // Clean up old entries periodically
        if (store.size > options.uniqueTokenPerInterval * 2) {
          const cutoff = now - options.interval * 2
          for (const [k, bucket] of store.entries()) {
            if (bucket.lastRefill < cutoff) {
              store.delete(k)
            }
          }
        }

        // Get or create bucket
        let bucket = store.get(key)

        if (!bucket) {
          bucket = {
            tokens: options.tokensPerInterval,
            lastRefill: now,
            requests: 0
          }
          store.set(key, bucket)
        }

        // Refill tokens if interval has passed
        const timePassed = now - bucket.lastRefill
        if (timePassed >= options.interval) {
          bucket.tokens = options.tokensPerInterval
          bucket.lastRefill = now
          bucket.requests = 0
        }

        // Check if request is allowed
        if (bucket.tokens > 0) {
          bucket.tokens--
          bucket.requests++
          resolve()
        } else {
          reject(new Error('Rate limit exceeded'))
        }
      })
    }
  }
}

// Specialized rate limiter for NREL API calls
export const nrelRateLimit = rateLimit({
  interval: 60 * 1000, // 1 minute
  uniqueTokenPerInterval: 100, // Max 100 different users
  tokensPerInterval: 10, // 10 requests per user per minute
})

// General API rate limiter
export const generalRateLimit = rateLimit({
  interval: 60 * 1000, // 1 minute
  uniqueTokenPerInterval: 500, // Max 500 different users
  tokensPerInterval: 100, // 100 requests per user per minute
})