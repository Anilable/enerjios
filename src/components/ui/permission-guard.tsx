'use client'

import { useSession } from 'next-auth/react'
import { PermissionManager, Permission, Role } from '@/lib/permissions'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Shield } from 'lucide-react'
import { ReactNode } from 'react'

interface PermissionGuardProps {
  /**
   * Required permissions to show the children
   */
  permissions: Permission[]

  /**
   * Whether ALL permissions are required (true) or ANY permission is sufficient (false)
   * @default true
   */
  requireAll?: boolean

  /**
   * Content to render when permission is granted
   */
  children: ReactNode

  /**
   * Content to render when permission is denied
   * If not provided, renders nothing (hides content)
   */
  fallback?: ReactNode

  /**
   * Whether to show a permission denied message when access is blocked
   * @default false
   */
  showDeniedMessage?: boolean

  /**
   * Custom denied message
   */
  deniedMessage?: string

  /**
   * Resource type for context-specific checks
   */
  resourceType?: string

  /**
   * Resource owner ID for ownership checks
   */
  resourceOwnerId?: string

  /**
   * Resource company ID for company-based checks
   */
  resourceCompanyId?: string
}

export function PermissionGuard({
  permissions,
  requireAll = true,
  children,
  fallback,
  showDeniedMessage = false,
  deniedMessage = 'Bu içeriği görüntüleme yetkiniz bulunmamaktadır.',
  resourceType,
  resourceOwnerId,
  resourceCompanyId
}: PermissionGuardProps) {
  const { data: session } = useSession()

  // If no session, deny access
  if (!session?.user) {
    if (showDeniedMessage) {
      return (
        <Alert>
          <Shield className="h-4 w-4" />
          <AlertDescription>
            Bu içeriği görüntülemek için giriş yapmanız gerekiyor.
          </AlertDescription>
        </Alert>
      )
    }
    return <>{fallback}</>
  }

  const permissionManager = new PermissionManager(
    session.user.role as Role,
    session.user.id,
    session.user.companyId
  )

  // Check permissions
  const hasPermission = requireAll
    ? permissionManager.hasAllPermissions(permissions)
    : permissionManager.hasAnyPermission(permissions)

  // Additional resource-based checks
  let hasResourceAccess = true
  if (resourceType) {
    hasResourceAccess = permissionManager.canAccessResource(
      resourceType,
      resourceOwnerId,
      resourceCompanyId
    )
  }

  const canAccess = hasPermission && hasResourceAccess

  if (!canAccess) {
    if (showDeniedMessage) {
      return (
        <Alert>
          <Shield className="h-4 w-4" />
          <AlertDescription>
            {deniedMessage}
          </AlertDescription>
        </Alert>
      )
    }
    return <>{fallback}</>
  }

  return <>{children}</>
}

/**
 * Hook to check permissions in components
 */
export function usePermissions() {
  const { data: session } = useSession()

  if (!session?.user) {
    return {
      hasPermission: () => false,
      hasAnyPermission: () => false,
      hasAllPermissions: () => false,
      canAccessResource: () => false,
      userRole: null,
      permissionManager: null
    }
  }

  const permissionManager = new PermissionManager(
    session.user.role as Role,
    session.user.id,
    session.user.companyId
  )

  return {
    hasPermission: (permission: Permission) => permissionManager.hasPermission(permission),
    hasAnyPermission: (permissions: Permission[]) => permissionManager.hasAnyPermission(permissions),
    hasAllPermissions: (permissions: Permission[]) => permissionManager.hasAllPermissions(permissions),
    canAccessResource: (resourceType: string, resourceOwnerId?: string, resourceCompanyId?: string) =>
      permissionManager.canAccessResource(resourceType, resourceOwnerId, resourceCompanyId),
    userRole: session.user.role as Role,
    permissionManager
  }
}

/**
 * Component to show content only for specific roles
 */
interface RoleGuardProps {
  allowedRoles: Role[]
  children: ReactNode
  fallback?: ReactNode
  showDeniedMessage?: boolean
}

export function RoleGuard({ allowedRoles, children, fallback, showDeniedMessage = false }: RoleGuardProps) {
  const { data: session } = useSession()

  if (!session?.user) {
    return <>{fallback}</>
  }

  const userRole = session.user.role as Role
  const hasAccess = allowedRoles.includes(userRole)

  if (!hasAccess) {
    if (showDeniedMessage) {
      return (
        <Alert>
          <Shield className="h-4 w-4" />
          <AlertDescription>
            Bu içeriği görüntüleme yetkiniz bulunmamaktadır.
          </AlertDescription>
        </Alert>
      )
    }
    return <>{fallback}</>
  }

  return <>{children}</>
}

/**
 * Higher-order component to wrap entire pages with permission checks
 */
export function withPermissions<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  requiredPermissions: Permission[],
  options?: {
    requireAll?: boolean
    fallbackComponent?: React.ComponentType
    showDeniedMessage?: boolean
  }
) {
  return function PermissionWrapper(props: P) {
    const fallback = options?.fallbackComponent ? <options.fallbackComponent /> : null

    return (
      <PermissionGuard
        permissions={requiredPermissions}
        requireAll={options?.requireAll}
        fallback={fallback}
        showDeniedMessage={options?.showDeniedMessage}
      >
        <WrappedComponent {...props} />
      </PermissionGuard>
    )
  }
}

/**
 * Utility component to hide pricing/financial data from Installation Team
 */
interface PricingGuardProps {
  children: ReactNode
  fallback?: ReactNode
  role?: Role
}

export function PricingGuard({ children, fallback, role }: PricingGuardProps) {
  return (
    <PermissionGuard
      permissions={['finance:read', 'quotes:read', 'products:manage_pricing']}
      requireAll={false}
      fallback={fallback}
    >
      {children}
    </PermissionGuard>
  )
}

/**
 * Component to show content only to financial data viewers
 */
export function FinancialDataGuard({ children, fallback }: { children: ReactNode; fallback?: ReactNode }) {
  return (
    <PermissionGuard
      permissions={['finance:read']}
      fallback={fallback}
    >
      {children}
    </PermissionGuard>
  )
}