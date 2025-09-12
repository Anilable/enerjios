// Advanced permission system for role-based access control
export type Permission = 
  // User Management
  | 'users:create'
  | 'users:read'
  | 'users:update'
  | 'users:delete'
  | 'users:manage_roles'
  
  // Company Management
  | 'companies:create'
  | 'companies:read'
  | 'companies:update'
  | 'companies:delete'
  | 'companies:verify'
  | 'companies:suspend'
  
  // Project Management
  | 'projects:create'
  | 'projects:read'
  | 'projects:update'
  | 'projects:delete'
  | 'projects:approve'
  | 'projects:assign'
  
  // Quote Management
  | 'quotes:create'
  | 'quotes:read'
  | 'quotes:update'
  | 'quotes:delete'
  | 'quotes:approve'
  | 'quotes:send'
  
  // Customer Management
  | 'customers:create'
  | 'customers:read'
  | 'customers:update'
  | 'customers:delete'
  | 'customers:import'
  | 'customers:export'
  
  // Product Management
  | 'products:create'
  | 'products:read'
  | 'products:update'
  | 'products:delete'
  | 'products:manage_pricing'
  
  // Financial Management
  | 'finance:read'
  | 'finance:update'
  | 'finance:reports'
  | 'finance:invoicing'
  | 'finance:payments'
  
  // Analytics & Reporting
  | 'analytics:read'
  | 'analytics:advanced'
  | 'reports:create'
  | 'reports:read'
  | 'reports:export'
  
  // System Administration
  | 'system:settings'
  | 'system:monitoring'
  | 'system:integrations'
  | 'system:backups'
  | 'system:logs'
  
  // Designer & Tools
  | 'designer:use'
  | 'designer:advanced'
  | 'calculator:use'
  | 'calculator:advanced'
  
  // Content Management
  | 'content:create'
  | 'content:read'
  | 'content:update'
  | 'content:delete'
  | 'content:publish'

export type Role = 'ADMIN' | 'COMPANY' | 'CUSTOMER' | 'FARMER' | 'BANK' | 'SUPPORT'

export const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  ADMIN: [
    // Full system access
    'users:create', 'users:read', 'users:update', 'users:delete', 'users:manage_roles',
    'companies:create', 'companies:read', 'companies:update', 'companies:delete', 'companies:verify', 'companies:suspend',
    'projects:create', 'projects:read', 'projects:update', 'projects:delete', 'projects:approve', 'projects:assign',
    'quotes:create', 'quotes:read', 'quotes:update', 'quotes:delete', 'quotes:approve', 'quotes:send',
    'customers:create', 'customers:read', 'customers:update', 'customers:delete', 'customers:import', 'customers:export',
    'products:create', 'products:read', 'products:update', 'products:delete', 'products:manage_pricing',
    'finance:read', 'finance:update', 'finance:reports', 'finance:invoicing', 'finance:payments',
    'analytics:read', 'analytics:advanced', 'reports:create', 'reports:read', 'reports:export',
    'system:settings', 'system:monitoring', 'system:integrations', 'system:backups', 'system:logs',
    'designer:use', 'designer:advanced', 'calculator:use', 'calculator:advanced',
    'content:create', 'content:read', 'content:update', 'content:delete', 'content:publish'
  ],

  COMPANY: [
    // Company-specific permissions
    'projects:create', 'projects:read', 'projects:update', 'projects:delete', 'projects:assign',
    'quotes:create', 'quotes:read', 'quotes:update', 'quotes:delete', 'quotes:send',
    'customers:create', 'customers:read', 'customers:update', 'customers:delete', 'customers:import', 'customers:export',
    'products:read', 'products:update',
    'finance:read', 'finance:reports', 'finance:invoicing', 'finance:payments',
    'analytics:read', 'reports:create', 'reports:read', 'reports:export',
    'designer:use', 'designer:advanced', 'calculator:use', 'calculator:advanced',
    'content:read'
  ],

  CUSTOMER: [
    // Customer-specific permissions
    'projects:read',
    'quotes:read',
    'customers:read', 'customers:update', // Only their own profile
    'products:read',
    'finance:read', // Only their own financial data
    'designer:use', 'calculator:use',
    'content:read'
  ],

  FARMER: [
    // Farmer-specific permissions (extends customer)
    'projects:read', 'projects:create', // Agri-solar projects
    'quotes:read',
    'customers:read', 'customers:update', // Only their own profile
    'products:read',
    'finance:read', // Only their own financial data
    'designer:use', 'calculator:use', 'calculator:advanced', // Advanced for agri-solar
    'content:read'
  ],

  BANK: [
    // Bank-specific permissions
    'projects:read', // To assess loan applications
    'quotes:read',
    'customers:read', // For credit assessment
    'finance:read', 'finance:reports', // Financial assessment
    'analytics:read', 'reports:read',
    'content:read'
  ],

  SUPPORT: [
    // Support team permissions
    'users:read', 'users:update',
    'companies:read', 'companies:update',
    'projects:read', 'projects:update',
    'quotes:read', 'quotes:update',
    'customers:read', 'customers:update', 'customers:import', 'customers:export',
    'products:read',
    'analytics:read', 'reports:read',
    'content:read', 'content:create', 'content:update'
  ]
}

export class PermissionManager {
  private userRole: Role
  private userId: string
  private companyId?: string

  constructor(userRole: Role, userId: string, companyId?: string) {
    this.userRole = userRole
    this.userId = userId
    this.companyId = companyId
  }

  /**
   * Check if user has a specific permission
   */
  hasPermission(permission: Permission): boolean {
    const rolePermissions = ROLE_PERMISSIONS[this.userRole]
    return rolePermissions.includes(permission)
  }

  /**
   * Check if user has any of the specified permissions
   */
  hasAnyPermission(permissions: Permission[]): boolean {
    return permissions.some(permission => this.hasPermission(permission))
  }

  /**
   * Check if user has all of the specified permissions
   */
  hasAllPermissions(permissions: Permission[]): boolean {
    return permissions.every(permission => this.hasPermission(permission))
  }

  /**
   * Get all permissions for the user's role
   */
  getUserPermissions(): Permission[] {
    return ROLE_PERMISSIONS[this.userRole]
  }

  /**
   * Check if user can access a specific resource
   * This includes ownership checks for certain resources
   */
  canAccessResource(resourceType: string, resourceOwnerId?: string, resourceCompanyId?: string): boolean {
    // Admin can access everything
    if (this.userRole === 'ADMIN') {
      return true
    }

    // Company users can only access their own company's resources
    if (this.userRole === 'COMPANY' && resourceCompanyId) {
      return this.companyId === resourceCompanyId
    }

    // Customers and farmers can only access their own resources
    if ((this.userRole === 'CUSTOMER' || this.userRole === 'FARMER') && resourceOwnerId) {
      return this.userId === resourceOwnerId
    }

    // Default permission check
    const permission = `${resourceType}:read` as Permission
    return this.hasPermission(permission)
  }

  /**
   * Get filtered permissions based on context
   */
  getContextualPermissions(context?: 'own_company' | 'own_resources'): Permission[] {
    const allPermissions = this.getUserPermissions()

    if (context === 'own_company' && this.userRole === 'COMPANY') {
      // Company users working with their own company data
      return allPermissions
    }

    if (context === 'own_resources' && (this.userRole === 'CUSTOMER' || this.userRole === 'FARMER')) {
      // Customers/farmers working with their own data
      return allPermissions.filter(permission => 
        !permission.includes('delete') && // Cannot delete most resources
        !permission.includes('create') || // Limited creation rights
        permission.includes('customers:') || // Can manage own profile
        permission.includes('projects:create') // Can create projects/quotes
      )
    }

    return allPermissions
  }

  /**
   * Generate permission-based menu items
   */
  getAuthorizedMenuItems() {
    const menuItems = []

    if (this.hasPermission('analytics:read')) {
      menuItems.push({
        label: 'Analytics',
        path: '/dashboard/analytics',
        icon: 'BarChart3'
      })
    }

    if (this.hasAnyPermission(['companies:read', 'companies:create'])) {
      menuItems.push({
        label: 'Firmalar',
        path: '/dashboard/admin/companies',
        icon: 'Building'
      })
    }

    if (this.hasPermission('system:monitoring')) {
      menuItems.push({
        label: 'Sistem İzleme',
        path: '/dashboard/admin/monitoring',
        icon: 'Monitor'
      })
    }

    if (this.hasPermission('system:integrations')) {
      menuItems.push({
        label: 'Entegrasyonlar',
        path: '/dashboard/admin/integrations',
        icon: 'Plug'
      })
    }

    if (this.hasPermission('designer:use')) {
      menuItems.push({
        label: '3D Designer',
        path: '/dashboard/designer',
        icon: 'Box'
      })
    }

    if (this.hasPermission('calculator:use')) {
      menuItems.push({
        label: 'Hesaplayıcı',
        path: '/dashboard/calculator',
        icon: 'Calculator'
      })
    }

    if (this.hasAnyPermission(['projects:read', 'projects:create'])) {
      menuItems.push({
        label: 'Projeler',
        path: '/dashboard/projects',
        icon: 'FolderOpen'
      })
    }

    if (this.hasAnyPermission(['quotes:read', 'quotes:create'])) {
      menuItems.push({
        label: 'Teklifler',
        path: '/dashboard/quotes',
        icon: 'FileText'
      })
    }

    if (this.hasAnyPermission(['customers:read', 'customers:create'])) {
      menuItems.push({
        label: 'Müşteriler',
        path: '/dashboard/customers',
        icon: 'Users'
      })
    }

    if (this.hasPermission('finance:read')) {
      menuItems.push({
        label: 'Finans',
        path: '/dashboard/finance',
        icon: 'DollarSign'
      })
    }

    return menuItems
  }
}

/**
 * Higher-order function to create permission-based route guards
 */
export function requirePermissions(requiredPermissions: Permission[]) {
  return function (userRole: Role, userId: string, companyId?: string) {
    const permissionManager = new PermissionManager(userRole, userId, companyId)
    return permissionManager.hasAllPermissions(requiredPermissions)
  }
}

/**
 * Utility function to check permissions in API routes
 */
export function checkApiPermissions(
  userRole: Role,
  userId: string,
  requiredPermissions: Permission[],
  companyId?: string
): boolean {
  const permissionManager = new PermissionManager(userRole, userId, companyId)
  return permissionManager.hasAllPermissions(requiredPermissions)
}

/**
 * Permission middleware for API routes
 */
export function withPermissions(permissions: Permission[]) {
  return async function middleware(req: any, res: any, next: any) {
    const { user } = req.session || {}
    
    if (!user) {
      return res.status(401).json({ error: 'Unauthorized' })
    }

    const hasPermission = checkApiPermissions(
      user.role,
      user.id,
      permissions,
      user.companyId
    )

    if (!hasPermission) {
      return res.status(403).json({ error: 'Insufficient permissions' })
    }

    next()
  }
}