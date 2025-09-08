import * as Sentry from '@sentry/nextjs'

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  
  // Performance Monitoring
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
  
  // Session Replay
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,
  
  // Release tracking
  release: process.env.VERCEL_GIT_COMMIT_SHA,
  
  integrations: [
    new Sentry.Replay({
      maskAllText: true,
      blockAllMedia: true,
    }),
  ],
  
  // Error filtering
  beforeSend(event, hint) {
    // Don't send events for known non-critical errors
    const error = hint.originalException
    
    if (error instanceof Error) {
      // Filter out network errors
      if (error.message?.includes('Network request failed')) {
        return null
      }
      
      // Filter out non-actionable errors
      if (error.message?.includes('Non-Error promise rejection captured')) {
        return null
      }
      
      // Filter out development-only errors
      if (process.env.NODE_ENV === 'development' && error.message?.includes('Hydration')) {
        return null
      }
    }
    
    return event
  },
  
  // Additional context
  initialScope: {
    tags: {
      component: 'trakya-solar-client',
      platform: 'web'
    }
  }
})