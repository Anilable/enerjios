import * as Sentry from '@sentry/nextjs'

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  
  // Edge runtime specific configuration
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.05 : 1.0,
  
  // Release tracking
  release: process.env.VERCEL_GIT_COMMIT_SHA,
  
  // Minimal configuration for edge runtime
  integrations: [
    // Only essential integrations for edge
  ],
  
  // Additional context
  initialScope: {
    tags: {
      component: 'trakya-solar-edge',
      platform: 'edge'
    }
  }
})