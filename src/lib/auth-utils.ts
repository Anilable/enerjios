import 'server-only'
import { getServerSession } from "./server-session"
import { redirect } from "next/navigation"
import { UserRole } from "@/types/auth"

export async function getCurrentUser() {
  try {
    const session = await getServerSession()
    return session?.user
  } catch (error) {
    console.error("Error getting current user:", error)
    return null
  }
}

export async function requireAuth() {
  const user = await getCurrentUser()
  if (!user) {
    redirect("/auth/signin")
  }
  return user
}

export async function requireRole(allowedRoles: UserRole[]) {
  const user = await requireAuth()
  
  if (!allowedRoles.includes(user.role as UserRole)) {
    redirect("/unauthorized")
  }
  
  return user
}

export async function requireAdmin() {
  return await requireRole(["ADMIN"])
}

export async function requireCompany() {
  return await requireRole(["ADMIN", "COMPANY"])
}

export async function requireCustomer() {
  return await requireRole(["ADMIN", "CUSTOMER", "FARMER"])
}

export async function requireInstallationTeam() {
  return await requireRole(["ADMIN", "INSTALLATION_TEAM"])
}

export async function requireInstallationAccess() {
  return await requireRole(["ADMIN", "COMPANY", "INSTALLATION_TEAM"])
}

// Re-export client-safe role utilities for backward compatibility
export { hasRole, getRoleName, getRoleColor } from './role-utils'