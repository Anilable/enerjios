import * as Sentry from '@sentry/nextjs'

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  
  // Performance Monitoring
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
  
  // Release tracking
  release: process.env.VERCEL_GIT_COMMIT_SHA,
  
  // Server-specific configuration
  integrations: [
    new Sentry.Integrations.Http({ tracing: true }),
    new Sentry.Integrations.Express({ app: undefined }),
    new Sentry.Integrations.Postgres(),
  ],
  
  // Error filtering for server
  beforeSend(event, hint) {
    const error = hint.originalException
    
    if (error instanceof Error) {
      // Filter database connection errors in development
      if (process.env.NODE_ENV === 'development' && error.message?.includes('ECONNREFUSED')) {
        return null
      }
      
      // Filter expected authentication errors
      if (error.message?.includes('Authentication failed')) {
        return null
      }
    }
    
    return event
  },
  
  // Additional context
  initialScope: {
    tags: {
      component: 'trakya-solar-server',
      platform: 'node'
    }
  }
})