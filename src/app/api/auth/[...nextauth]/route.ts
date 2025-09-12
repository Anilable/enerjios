import NextAuth from "next-auth"
import { authOptions } from "@/lib/auth"
import { headers, cookies } from 'next/headers'

async function auth(req: Request, context: { params: Promise<{ nextauth: string[] }> }) {
  // Await headers, cookies, and params to fix async API error
  const headersList = await headers()
  const cookieStore = await cookies()
  const params = await context.params
  
  return NextAuth(authOptions)(req, context)
}

export { auth as GET, auth as POST }