'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Shield, Users, Building, Settings, Eye, Edit, Trash2,
  Plus, Search, Filter, CheckCircle, AlertCircle,
  User, Crown, Star, Briefcase, Banknote, HelpCircle
} from 'lucide-react'
import { Permission, Role, ROLE_PERMISSIONS, PermissionManager } from '@/lib/permissions'

interface UserPermission {
  id: string
  userId: string
  userName: string
  userEmail: string
  role: Role
  companyId?: string
  companyName?: string
  customPermissions: Permission[]
  revokedPermissions: Permission[]
  isActive: boolean
  lastUpdated: string
}

const PERMISSION_CATEGORIES = {
  'User Management': [
    'users:create', 'users:read', 'users:update', 'users:delete', 'users:manage_roles'
  ],
  'Company Management': [
    'companies:create', 'companies:read', 'companies:update', 'companies:delete', 
    'companies:verify', 'companies:suspend'
  ],
  'Project Management': [
    'projects:create', 'projects:read', 'projects:update', 'projects:delete',
    'projects:approve', 'projects:assign'
  ],
  'Quote Management': [
    'quotes:create', 'quotes:read', 'quotes:update', 'quotes:delete',
    'quotes:approve', 'quotes:send'
  ],
  'Customer Management': [
    'customers:create', 'customers:read', 'customers:update', 'customers:delete',
    'customers:import', 'customers:export'
  ],
  'Product Management': [
    'products:create', 'products:read', 'products:update', 'products:delete',
    'products:manage_pricing'
  ],
  'Financial Management': [
    'finance:read', 'finance:update', 'finance:reports', 'finance:invoicing', 'finance:payments'
  ],
  'Analytics & Reporting': [
    'analytics:read', 'analytics:advanced', 'reports:create', 'reports:read', 'reports:export'
  ],
  'System Administration': [
    'system:settings', 'system:monitoring', 'system:integrations', 'system:backups', 'system:logs'
  ],
  'Designer & Tools': [
    'designer:use', 'designer:advanced', 'calculator:use', 'calculator:advanced'
  ],
  'Content Management': [
    'content:create', 'content:read', 'content:update', 'content:delete', 'content:publish'
  ]
}

export default function PermissionsPage() {
  const { data: session } = useSession()
  const [userPermissions, setUserPermissions] = useState<UserPermission[]>([])
  const [selectedUser, setSelectedUser] = useState<UserPermission | null>(null)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [roleFilter, setRoleFilter] = useState('all')
  const [loading, setLoading] = useState(true)

  // Edit form state
  const [editForm, setEditForm] = useState<{
    customPermissions: Permission[]
    revokedPermissions: Permission[]
  }>({
    customPermissions: [],
    revokedPermissions: []
  })

  useEffect(() => {
    fetchUserPermissions()
  }, [])

  const fetchUserPermissions = async () => {
    try {
      // Mock data - replace with actual API
      const mockData: UserPermission[] = [
        {
          id: '1',
          userId: '1',
          userName: 'John Doe',
          userEmail: 'john@example.com',
          role: 'COMPANY',
          companyId: '1',
          companyName: 'Güneş Enerji Solutions',
          customPermissions: ['analytics:advanced'],
          revokedPermissions: [],
          isActive: true,
          lastUpdated: '2024-01-20'
        },
        {
          id: '2',
          userId: '2',
          userName: 'Jane Smith',
          userEmail: 'jane@customer.com',
          role: 'CUSTOMER',
          customPermissions: [],
          revokedPermissions: ['designer:use'],
          isActive: true,
          lastUpdated: '2024-01-19'
        },
        {
          id: '3',
          userId: '3',
          userName: 'Support Agent',
          userEmail: 'support@trakya.com',
          role: 'SUPPORT',
          customPermissions: ['users:delete'],
          revokedPermissions: ['system:backups'],
          isActive: true,
          lastUpdated: '2024-01-18'
        }
      ]
      
      setUserPermissions(mockData)
    } catch (error) {
      console.error('Error fetching user permissions:', error)
    } finally {
      setLoading(false)
    }
  }

  const getRoleIcon = (role: Role) => {
    const icons = {
      ADMIN: Crown,
      COMPANY: Building,
      CUSTOMER: User,
      FARMER: Star,
      BANK: Banknote,
      SUPPORT: HelpCircle
    }
    return icons[role] || User
  }

  const getRoleColor = (role: Role) => {
    const colors = {
      ADMIN: 'text-purple-600 bg-purple-100',
      COMPANY: 'text-blue-600 bg-blue-100',
      CUSTOMER: 'text-green-600 bg-green-100',
      FARMER: 'text-yellow-600 bg-yellow-100',
      BANK: 'text-gray-600 bg-gray-100',
      SUPPORT: 'text-orange-600 bg-orange-100'
    }
    return colors[role] || 'text-gray-600 bg-gray-100'
  }

  const getEffectivePermissions = (userPerm: UserPermission): Permission[] => {
    const basePermissions = ROLE_PERMISSIONS[userPerm.role]
    const customPermissions = userPerm.customPermissions
    const revokedPermissions = userPerm.revokedPermissions

    // Start with base permissions, add custom, remove revoked
    const allPermissions = [...new Set([...basePermissions, ...customPermissions])]
    return allPermissions.filter(permission => !revokedPermissions.includes(permission))
  }

  const handleEditUser = (userPerm: UserPermission) => {
    setSelectedUser(userPerm)
    setEditForm({
      customPermissions: userPerm.customPermissions,
      revokedPermissions: userPerm.revokedPermissions
    })
    setIsEditModalOpen(true)
  }

  const handleSavePermissions = async () => {
    if (!selectedUser) return

    try {
      // API call to update permissions
      const updatedUser = {
        ...selectedUser,
        customPermissions: editForm.customPermissions,
        revokedPermissions: editForm.revokedPermissions,
        lastUpdated: new Date().toISOString().split('T')[0]
      }

      setUserPermissions(prev => 
        prev.map(user => user.id === selectedUser.id ? updatedUser : user)
      )
      
      setIsEditModalOpen(false)
    } catch (error) {
      console.error('Error updating permissions:', error)
    }
  }

  const toggleCustomPermission = (permission: Permission) => {
    setEditForm(prev => ({
      ...prev,
      customPermissions: prev.customPermissions.includes(permission)
        ? prev.customPermissions.filter(p => p !== permission)
        : [...prev.customPermissions, permission]
    }))
  }

  const toggleRevokedPermission = (permission: Permission) => {
    if (!selectedUser) return
    
    const basePermissions = ROLE_PERMISSIONS[selectedUser.role]
    if (!basePermissions.includes(permission)) return // Can't revoke what user doesn't have

    setEditForm(prev => ({
      ...prev,
      revokedPermissions: prev.revokedPermissions.includes(permission)
        ? prev.revokedPermissions.filter(p => p !== permission)
        : [...prev.revokedPermissions, permission]
    }))
  }

  const filteredUsers = userPermissions.filter(user => {
    const matchesSearch = 
      user.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.userEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (user.companyName && user.companyName.toLowerCase().includes(searchTerm.toLowerCase()))
    
    const matchesRole = roleFilter === 'all' || user.role === roleFilter
    
    return matchesSearch && matchesRole
  })

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Yetki Yönetimi</h1>
            <p className="text-muted-foreground mt-1">
              Kullanıcı yetkilerini ve izinlerini yönetin
            </p>
          </div>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Toplam Kullanıcı</p>
                  <p className="text-2xl font-bold">{userPermissions.length}</p>
                </div>
                <Users className="w-8 h-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Özel Yetki</p>
                  <p className="text-2xl font-bold">
                    {userPermissions.filter(u => u.customPermissions.length > 0).length}
                  </p>
                </div>
                <Shield className="w-8 h-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Kısıtlı Yetki</p>
                  <p className="text-2xl font-bold">
                    {userPermissions.filter(u => u.revokedPermissions.length > 0).length}
                  </p>
                </div>
                <AlertCircle className="w-8 h-8 text-yellow-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Aktif Kullanıcı</p>
                  <p className="text-2xl font-bold">
                    {userPermissions.filter(u => u.isActive).length}
                  </p>
                </div>
                <CheckCircle className="w-8 h-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Kullanıcı adı, email veya firma ile ara..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <Select value={roleFilter} onValueChange={setRoleFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Rol" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tüm Roller</SelectItem>
                  <SelectItem value="ADMIN">Admin</SelectItem>
                  <SelectItem value="COMPANY">Firma</SelectItem>
                  <SelectItem value="CUSTOMER">Müşteri</SelectItem>
                  <SelectItem value="FARMER">Çiftçi</SelectItem>
                  <SelectItem value="BANK">Banka</SelectItem>
                  <SelectItem value="SUPPORT">Destek</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Users Table */}
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Kullanıcı</TableHead>
                <TableHead>Rol</TableHead>
                <TableHead>Firma</TableHead>
                <TableHead>Özel Yetkiler</TableHead>
                <TableHead>Kısıtlanan Yetkiler</TableHead>
                <TableHead>Durum</TableHead>
                <TableHead>İşlemler</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.map((userPerm) => {
                const Icon = getRoleIcon(userPerm.role)
                const effectivePermissions = getEffectivePermissions(userPerm)
                
                return (
                  <TableRow key={userPerm.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                          <User className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <div className="font-medium">{userPerm.userName}</div>
                          <div className="text-sm text-muted-foreground">{userPerm.userEmail}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={getRoleColor(userPerm.role)}>
                        <Icon className="w-3 h-3 mr-1" />
                        {userPerm.role}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {userPerm.companyName ? (
                        <span className="text-sm">{userPerm.companyName}</span>
                      ) : (
                        <span className="text-sm text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {userPerm.customPermissions.slice(0, 2).map(permission => (
                          <Badge key={permission} variant="outline" className="text-xs">
                            {permission}
                          </Badge>
                        ))}
                        {userPerm.customPermissions.length > 2 && (
                          <Badge variant="outline" className="text-xs">
                            +{userPerm.customPermissions.length - 2}
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {userPerm.revokedPermissions.slice(0, 2).map(permission => (
                          <Badge key={permission} variant="destructive" className="text-xs">
                            {permission}
                          </Badge>
                        ))}
                        {userPerm.revokedPermissions.length > 2 && (
                          <Badge variant="destructive" className="text-xs">
                            +{userPerm.revokedPermissions.length - 2}
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {userPerm.isActive ? (
                        <Badge variant="default">Aktif</Badge>
                      ) : (
                        <Badge variant="secondary">Pasif</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEditUser(userPerm)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            // Show effective permissions
                            alert(`Toplam yetki sayısı: ${effectivePermissions.length}`)
                          }}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </Card>

        {/* Edit Permissions Modal */}
        {selectedUser && (
          <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Yetki Düzenle: {selectedUser.userName}</DialogTitle>
                <DialogDescription>
                  Kullanıcının özel yetkilerini ekleyin veya mevcut yetkilerini kısıtlayın
                </DialogDescription>
              </DialogHeader>

              <Tabs defaultValue="custom" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="custom">Özel Yetkiler</TabsTrigger>
                  <TabsTrigger value="revoked">Kısıtlanan Yetkiler</TabsTrigger>
                </TabsList>

                <TabsContent value="custom" className="space-y-4">
                  <div className="text-sm text-muted-foreground mb-4">
                    Kullanıcının rolü ({selectedUser.role}) tarafından sağlanmayan ek yetkileri seçin
                  </div>
                  
                  {Object.entries(PERMISSION_CATEGORIES).map(([category, permissions]) => {
                    const basePermissions = ROLE_PERMISSIONS[selectedUser.role]
                    const availablePermissions = permissions.filter(p => !basePermissions.includes(p as Permission))
                    
                    if (availablePermissions.length === 0) return null

                    return (
                      <Card key={category}>
                        <CardHeader className="pb-3">
                          <CardTitle className="text-base">{category}</CardTitle>
                        </CardHeader>
                        <CardContent className="grid grid-cols-2 gap-3">
                          {availablePermissions.map(permission => (
                            <div key={permission} className="flex items-center space-x-2">
                              <Checkbox
                                id={`custom-${permission}`}
                                checked={editForm.customPermissions.includes(permission as Permission)}
                                onCheckedChange={() => toggleCustomPermission(permission as Permission)}
                              />
                              <Label htmlFor={`custom-${permission}`} className="text-sm">
                                {permission}
                              </Label>
                            </div>
                          ))}
                        </CardContent>
                      </Card>
                    )
                  })}
                </TabsContent>

                <TabsContent value="revoked" className="space-y-4">
                  <div className="text-sm text-muted-foreground mb-4">
                    Kullanıcının rolü tarafından sağlanan yetkilerden kısıtlanacak olanları seçin
                  </div>
                  
                  {Object.entries(PERMISSION_CATEGORIES).map(([category, permissions]) => {
                    const basePermissions = ROLE_PERMISSIONS[selectedUser.role]
                    const revocablePermissions = permissions.filter(p => basePermissions.includes(p as Permission))
                    
                    if (revocablePermissions.length === 0) return null

                    return (
                      <Card key={category}>
                        <CardHeader className="pb-3">
                          <CardTitle className="text-base">{category}</CardTitle>
                        </CardHeader>
                        <CardContent className="grid grid-cols-2 gap-3">
                          {revocablePermissions.map(permission => (
                            <div key={permission} className="flex items-center space-x-2">
                              <Checkbox
                                id={`revoked-${permission}`}
                                checked={editForm.revokedPermissions.includes(permission as Permission)}
                                onCheckedChange={() => toggleRevokedPermission(permission as Permission)}
                              />
                              <Label htmlFor={`revoked-${permission}`} className="text-sm">
                                {permission}
                              </Label>
                            </div>
                          ))}
                        </CardContent>
                      </Card>
                    )
                  })}
                </TabsContent>
              </Tabs>

              <DialogFooter>
                <Button variant="outline" onClick={() => setIsEditModalOpen(false)}>
                  İptal
                </Button>
                <Button onClick={handleSavePermissions}>
                  Kaydet
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </DashboardLayout>
  )
}