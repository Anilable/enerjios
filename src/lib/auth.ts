import { NextAuthOptions } from "next-auth"
import { PrismaAdapter } from "@auth/prisma-adapter"
import CredentialsProvider from "next-auth/providers/credentials"
import GoogleProvider from "next-auth/providers/google"
import AppleProvider from "next-auth/providers/apple"
import bcrypt from "bcryptjs"
import { db } from "./db"
import { logOAuthStatus, checkOAuthRateLimit } from "./env-validation"

// Log OAuth configuration status in development
logOAuthStatus()

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(db) as any,
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/auth/signin",
  },
  providers: [
    // Google OAuth - Only enabled if credentials are provided
    ...(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
      ? [
          GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            authorization: {
              params: {
                prompt: "consent",
                access_type: "offline",
                response_type: "code"
              }
            }
          }),
        ]
      : []),
    // Apple OAuth - Only enabled if credentials are provided
    ...(process.env.APPLE_ID && process.env.APPLE_SECRET
      ? [
          AppleProvider({
            clientId: process.env.APPLE_ID,
            clientSecret: process.env.APPLE_SECRET,
            authorization: {
              params: {
                scope: 'name email',
                response_mode: 'form_post',
              }
            }
          }),
        ]
      : []),
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        try {
          const user = await db.user.findUnique({
            where: {
              email: credentials.email,
            },
            include: {
              company: true,
              customer: true,
              farmer: true,
            },
          })

          if (!user || !user.password) {
            return null
          }

          const isPasswordValid = await bcrypt.compare(
            credentials.password,
            user.password
          )

          if (!isPasswordValid) {
            return null
          }

          // For testing, allow PENDING status for now
          // In production, uncomment the check below
          // if (user.status !== "ACTIVE") {
          //   return null
          // }

          return {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
            status: user.status,
            image: user.image,
          }
        } catch (error) {
          console.error("Auth error:", error)
          return null
        }
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      // Always allow credentials login
      if (account?.provider === "credentials") {
        return true
      }

      // OAuth sign in (Google or Apple)
      if (account?.provider === "google" || account?.provider === "apple") {
        try {
          // Rate limiting for OAuth attempts
          if (!checkOAuthRateLimit(user.email!, 10, 15 * 60 * 1000)) {
            console.warn(`OAuth rate limit exceeded for ${user.email}`)
            return false
          }

          // Validate email
          if (!user.email) {
            console.error(`${account?.provider} sign-in: No email provided`)
            return false
          }

          // Check if user exists
          const existingUser = await db.user.findUnique({
            where: { email: user.email },
          })

          if (existingUser) {
            // Update existing user with OAuth info if needed
            await db.user.update({
              where: { id: existingUser.id },
              data: {
                name: user.name || existingUser.name,
                image: user.image || existingUser.image,
              }
            })
          } else {
            // For new users via OAuth, ensure they have required fields
            if (!user.name && account?.provider === "apple") {
              // Apple might not provide name, use email as fallback
              user.name = user.email.split('@')[0]
            }
          }

          return true
        } catch (error) {
          console.error(`${account?.provider} sign-in error:`, error)
          return false
        }
      }

      return true
    },
    async jwt({ token, user, trigger, session, account }) {
      if (user) {
        token.role = user.role
        token.status = user.status
      }

      // Handle OAuth (Google or Apple)
      if (account?.provider === "google" || account?.provider === "apple") {
        try {
          const dbUser = await db.user.findUnique({
            where: { email: token.email! },
          })

          if (dbUser) {
            token.role = dbUser.role
            token.status = dbUser.status
          }
        } catch (error) {
          console.error("JWT callback error:", error)
        }
      }

      // Update token from session if needed
      if (trigger === "update" && session) {
        token.name = session.user?.name
        token.email = session.user?.email
      }

      return token
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.sub!
        session.user.role = token.role as string
        session.user.status = token.status as string
      }

      return session
    },
    async redirect({ url, baseUrl }) {
      // Debug logging
      console.log('Redirect callback:', { url, baseUrl })

      // Use the correct port based on environment
      const correctBaseUrl = process.env.NODE_ENV === 'development'
        ? 'http://localhost:3000'
        : baseUrl

      // Allows relative callback URLs
      if (url.startsWith("/")) return `${correctBaseUrl}${url}`

      // Allows callback URLs on the same origin or localhost with correct port
      const urlObj = new URL(url, correctBaseUrl)
      const baseUrlObj = new URL(correctBaseUrl)

      if (urlObj.origin === baseUrlObj.origin ||
          (urlObj.hostname === 'localhost' && baseUrlObj.hostname === 'localhost')) {
        return url.startsWith('http') ? url : `${correctBaseUrl}${url.startsWith('/') ? '' : '/'}${url}`
      }

      return correctBaseUrl
    },
  },
  events: {
    async signIn({ user, isNewUser }) {
      if (isNewUser) {
        console.log(`New user signed up: ${user.email}`)
        
        // Create default customer profile for new OAuth users
        if (user.email && !user.role) {
          await db.user.update({
            where: { id: user.id },
            data: { role: 'CUSTOMER', status: 'ACTIVE' }
          })

          await db.customer.create({
            data: {
              userId: user.id,
              type: 'INDIVIDUAL',
              firstName: user.name?.split(' ')[0] || '',
              lastName: user.name?.split(' ')[1] || '',
            }
          })
        }
      }
    },
  },
  debug: process.env.NODE_ENV === "development",
}