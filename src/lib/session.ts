/**
 * Session utilities for Next.js 15 App Router
 *
 * Import the appropriate session utility based on your component type:
 * - For Server Components, Server Actions, and API Routes: use server-session
 * - For Client Components: use client-session
 */

// Re-export server session for convenience (server-only)
export { getServerSession } from './server-session'

// Re-export client session utilities for convenience (client-only)
export {
  useSession,
  useCurrentUser,
  useAuth,
  signIn,
  signOut
} from './client-session'