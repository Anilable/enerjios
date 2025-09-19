import "next-auth"
import "next-auth/jwt"

declare module "next-auth" {
  interface User {
    role: string
    status: string
  }

  interface Session {
    user: {
      id: string
      email: string
      name?: string | null
      image?: string | null
      role: string
      status: string
    }
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role: string
    status: string
  }
}

export interface AuthUser {
  id: string
  email: string
  name?: string | null
  role: 'ADMIN' | 'COMPANY' | 'CUSTOMER' | 'FARMER' | 'BANK' | 'INSTALLATION_TEAM'
  status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED' | 'PENDING'
}

export type UserRole = 'ADMIN' | 'COMPANY' | 'CUSTOMER' | 'FARMER' | 'BANK' | 'INSTALLATION_TEAM'