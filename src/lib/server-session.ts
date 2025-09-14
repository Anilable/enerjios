import { getServerSession as getNextAuthServerSession } from 'next-auth'
import { authOptions } from './auth'

/**
 * Server-only session utility for Next.js 15 App Router
 * This function can only be used in Server Components, Server Actions, and API Routes
 */
export async function getServerSession() {
  try {
    return await getNextAuthServerSession(authOptions)
  } catch (error) {
    console.error("Error getting server session:", error)
    return null
  }
}