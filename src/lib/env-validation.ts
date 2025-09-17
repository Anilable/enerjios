/**
 * Environment variable validation utilities
 * Helps validate OAuth configuration and provide helpful error messages
 */

export interface OAuthProviderConfig {
  name: string
  enabled: boolean
  missingVars: string[]
}

export function validateGoogleOAuth(): OAuthProviderConfig {
  const required = ['GOOGLE_CLIENT_ID', 'GOOGLE_CLIENT_SECRET']
  const missing = required.filter(key => !process.env[key])

  return {
    name: 'Google',
    enabled: missing.length === 0,
    missingVars: missing
  }
}

export function validateAppleOAuth(): OAuthProviderConfig {
  const required = ['APPLE_ID', 'APPLE_SECRET']
  const missing = required.filter(key => !process.env[key])

  return {
    name: 'Apple',
    enabled: missing.length === 0,
    missingVars: missing
  }
}

export function validateAllOAuthProviders() {
  const google = validateGoogleOAuth()
  const apple = validateAppleOAuth()

  return {
    google,
    apple,
    hasAnyProvider: google.enabled || apple.enabled,
    enabledProviders: [google, apple].filter(p => p.enabled).map(p => p.name.toLowerCase()),
    disabledProviders: [google, apple].filter(p => !p.enabled)
  }
}

export function logOAuthStatus() {
  if (process.env.NODE_ENV === 'development') {
    const status = validateAllOAuthProviders()

    console.log('🔐 OAuth Providers Status:')
    console.log(`  Google: ${status.google.enabled ? '✅ Enabled' : '❌ Disabled'}`)
    if (!status.google.enabled && status.google.missingVars.length > 0) {
      console.log(`    Missing: ${status.google.missingVars.join(', ')}`)
    }

    console.log(`  Apple: ${status.apple.enabled ? '✅ Enabled' : '❌ Disabled'}`)
    if (!status.apple.enabled && status.apple.missingVars.length > 0) {
      console.log(`    Missing: ${status.apple.missingVars.join(', ')}`)
    }

    if (!status.hasAnyProvider) {
      console.log('⚠️  No OAuth providers configured. Only email/password login available.')
    }
  }
}

/**
 * Rate limiting for OAuth attempts
 * Helps prevent OAuth abuse
 */
const oauthAttempts = new Map<string, { count: number; lastAttempt: number }>()

export function checkOAuthRateLimit(identifier: string, maxAttempts: number = 5, windowMs: number = 15 * 60 * 1000): boolean {
  const now = Date.now()
  const attempts = oauthAttempts.get(identifier)

  if (!attempts) {
    oauthAttempts.set(identifier, { count: 1, lastAttempt: now })
    return true
  }

  // Reset if window has passed
  if (now - attempts.lastAttempt > windowMs) {
    oauthAttempts.set(identifier, { count: 1, lastAttempt: now })
    return true
  }

  // Check if under limit
  if (attempts.count < maxAttempts) {
    attempts.count++
    attempts.lastAttempt = now
    return true
  }

  return false
}

export function clearOAuthRateLimit(identifier: string) {
  oauthAttempts.delete(identifier)
}