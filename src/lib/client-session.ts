'use client'

import { useSession as useNextAuthSession, signIn, signOut } from 'next-auth/react'

/**
 * Client-only session utilities for Next.js 15 App Router
 * These functions can only be used in Client Components
 */

export function useSession() {
  return useNextAuthSession()
}

export { signIn, signOut }

export function useCurrentUser() {
  const { data: session } = useNextAuthSession()
  return session?.user
}

export function useAuth() {
  const { data: session, status } = useNextAuthSession()

  return {
    user: session?.user,
    isAuthenticated: !!session,
    isLoading: status === 'loading',
    signIn,
    signOut
  }
}