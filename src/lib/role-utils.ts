/**
 * Client-safe role utility functions
 * These functions don't import any server-only modules and can be used in client components
 */

import { UserRole } from "@/types/auth"

export function hasRole(userRole: string, allowedRoles: UserRole[]): boolean {
  return allowedRoles.includes(userRole as UserRole)
}

export function getRoleName(role: string): string {
  const roleNames = {
    ADMIN: 'Administrator',
    COMPANY: 'GES Firması',
    CUSTOMER: 'Müşteri',
    FARMER: 'Çiftçi',
    BANK: 'Banka'
  }
  return roleNames[role as keyof typeof roleNames] || role
}

export function getRoleColor(role: string): string {
  const roleColors = {
    ADMIN: 'bg-red-100 text-red-800',
    COMPANY: 'bg-blue-100 text-blue-800',
    CUSTOMER: 'bg-green-100 text-green-800',
    FARMER: 'bg-yellow-100 text-yellow-800',
    BANK: 'bg-purple-100 text-purple-800'
  }
  return roleColors[role as keyof typeof roleColors] || 'bg-gray-100 text-gray-800'
}