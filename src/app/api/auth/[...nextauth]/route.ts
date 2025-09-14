import NextAuth from "next-auth"
import { authOptions } from "@/lib/auth"

const handler = NextAuth(authOptions)

async function authHandler(req: Request, context: { params: Promise<{ nextauth: string[] }> }) {
  // Await params first to fix async API error
  const params = await context.params

  // Create a new context with resolved params
  const newContext = {
    params
  }

  return handler(req, newContext)
}

export { authHandler as GET, authHandler as POST }