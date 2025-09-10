import { NextAuthOptions } from "next-auth"
import { PrismaAdapter } from "@auth/prisma-adapter"
import CredentialsProvider from "next-auth/providers/credentials"
import GoogleProvider from "next-auth/providers/google"
import bcrypt from "bcryptjs"
import { db } from "./db"

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
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.role = user.role
        token.status = user.status
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
      // Allows relative callback URLs
      if (url.startsWith("/")) return `${baseUrl}${url}`
      
      // Allows callback URLs on the same origin
      else if (new URL(url).origin === baseUrl) return url
      
      return baseUrl
    },
  },
  events: {
    async signIn({ user, isNewUser }) {
      if (isNewUser) {
        console.log(`New user signed up: ${user.email}`)
        
        // Create default customer profile for new Google users
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