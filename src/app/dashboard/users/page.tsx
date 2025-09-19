'use client'

import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import {
  Users,
  UserPlus,
  Search,
  MoreHorizontal,
  Shield,
  Mail,
  Phone,
  Edit,
  Trash2,
  UserX,
  UserCheck
} from 'lucide-react'
import { useSession } from 'next-auth/react'
import { useState, useEffect } from 'react'
import { toast } from 'sonner'

interface User {
  id: string
  name: string
  email: string
  phone?: string
  role: string
  status: string
  createdAt: string
  updatedAt: string
}

interface UserStats {
  total: number
  active: number
  roles: Record<string, number>
  monthlyNew: number
}

export default function UsersPage() {
  const { data: session } = useSession()
  const isAdmin = session?.user?.role === 'ADMIN'

  const [users, setUsers] = useState<User[]>([])
  const [stats, setStats] = useState<UserStats>({
    total: 0,
    active: 0,
    roles: {},
    monthlyNew: 0
  })
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [updating, setUpdating] = useState<string | null>(null)

  // Add new user modal state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isCreating, setIsCreating] = useState(false)
  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    phone: '',
    role: '',
    status: 'ACTIVE'
  })

  // Fetch users from API
  const fetchUsers = async () => {
    if (!isAdmin) return

    try {
      setLoading(true)
      const response = await fetch('/api/admin/users')
      if (response.ok) {
        const data = await response.json()
        setUsers(data.data.users)
        setStats(data.data.stats)
      } else {
        const errorData = await response.json()
        toast.error(`API Error: ${errorData.error}`)
      }
    } catch (error) {
      toast.error('Kullanıcılar yüklenirken hata oluştu')
      console.error('Fetch error:', error)
    } finally {
      setLoading(false)
    }
  }

  // Toggle user active status
  const toggleUserStatus = async (userId: string, currentStatus: string) => {
    if (!isAdmin) return

    setUpdating(userId)
    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: currentStatus === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE' })
      })

      const data = await response.json()
      if (response.ok) {
        toast.success(data.message)
        await fetchUsers()
      } else {
        toast.error(data.error || 'Durum güncellenirken hata oluştu')
      }
    } catch (error) {
      toast.error('Güncelleme işlemi başarısız')
      console.error('Update error:', error)
    } finally {
      setUpdating(null)
    }
  }

  // Delete user
  const deleteUser = async (userId: string, userName: string) => {
    if (!isAdmin) return

    if (!confirm(`${userName} kullanıcısını silmek istediğinize emin misiniz?`)) {
      return
    }

    setUpdating(userId)
    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'DELETE'
      })

      const data = await response.json()
      if (response.ok) {
        toast.success(data.message)
        await fetchUsers()
      } else {
        toast.error(data.error || 'Silme işlemi başarısız')
      }
    } catch (error) {
      toast.error('Silme işlemi başarısız')
      console.error('Delete error:', error)
    } finally {
      setUpdating(null)
    }
  }

  // Create new user
  const createUser = async () => {
    if (!isAdmin) return

    // Basic validation
    if (!newUser.name.trim() || !newUser.email.trim() || !newUser.role) {
      toast.error('İsim, email ve rol alanları zorunludur')
      return
    }

    setIsCreating(true)
    try {
      const response = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newUser)
      })

      const data = await response.json()
      if (response.ok) {
        toast.success(data.message)
        setIsAddModalOpen(false)
        setNewUser({
          name: '',
          email: '',
          phone: '',
          role: '',
          status: 'ACTIVE'
        })
        await fetchUsers()
      } else {
        toast.error(data.error || 'Kullanıcı oluşturulurken hata oluştu')
      }
    } catch (error) {
      toast.error('Oluşturma işlemi başarısız')
      console.error('Create error:', error)
    } finally {
      setIsCreating(false)
    }
  }

  useEffect(() => {
    if (isAdmin) {
      fetchUsers()
    }
  }, [isAdmin])

  // Filter users based on search
  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (!isAdmin) {
    return (
      <DashboardLayout title="Kullanıcı Yönetimi">
        <div className="text-center py-8">
          <p className="text-muted-foreground">Bu sayfaya erişim için admin yetkisi gereklidir.</p>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout title="Kullanıcı Yönetimi">
      <div className="space-y-6">
        {/* Header Actions */}
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Kullanıcı ara..."
                className="pl-10 w-64"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-2">
                <UserPlus className="w-4 h-4" />
                Yeni Kullanıcı Ekle
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Yeni Kullanıcı Ekle</DialogTitle>
                <DialogDescription>
                  Sisteme yeni bir kullanıcı ekleyin. Gerekli bilgileri doldurun.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="name" className="text-right">
                    İsim *
                  </Label>
                  <Input
                    id="name"
                    className="col-span-3"
                    value={newUser.name}
                    onChange={(e) => setNewUser(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Kullanıcı adı"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="email" className="text-right">
                    Email *
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    className="col-span-3"
                    value={newUser.email}
                    onChange={(e) => setNewUser(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="kullanici@ornek.com"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="phone" className="text-right">
                    Telefon
                  </Label>
                  <Input
                    id="phone"
                    className="col-span-3"
                    value={newUser.phone}
                    onChange={(e) => setNewUser(prev => ({ ...prev, phone: e.target.value }))}
                    placeholder="+90 555 123 4567"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="role" className="text-right">
                    Rol *
                  </Label>
                  <Select
                    value={newUser.role}
                    onValueChange={(value) => setNewUser(prev => ({ ...prev, role: value }))}
                  >
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder="Rol seçiniz" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="CUSTOMER">Müşteri</SelectItem>
                      <SelectItem value="COMPANY">Şirket</SelectItem>
                      <SelectItem value="FARMER">Çiftçi</SelectItem>
                      <SelectItem value="BANK">Banka</SelectItem>
                      <SelectItem value="INSTALLATION_TEAM">Kurulum Ekibi</SelectItem>
                      <SelectItem value="ADMIN">Admin</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsAddModalOpen(false)} disabled={isCreating}>
                  İptal
                </Button>
                <Button onClick={createUser} disabled={isCreating}>
                  {isCreating ? 'Oluşturuluyor...' : 'Kullanıcı Ekle'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-blue-600" />
                <div>
                  <p className="text-2xl font-bold">{loading ? '...' : stats.total}</p>
                  <p className="text-sm text-muted-foreground">Toplam Kullanıcı</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-green-600" />
                <div>
                  <p className="text-2xl font-bold">{loading ? '...' : stats.active}</p>
                  <p className="text-sm text-muted-foreground">Aktif Kullanıcı</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-orange-600" />
                <div>
                  <p className="text-2xl font-bold">{loading ? '...' : (stats.roles['ADMIN'] || 0)}</p>
                  <p className="text-sm text-muted-foreground">Admin</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-purple-600" />
                <div>
                  <p className="text-2xl font-bold">{loading ? '...' : stats.monthlyNew}</p>
                  <p className="text-sm text-muted-foreground">Bu Ay Eklenen</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Users Table */}
        <Card>
          <CardHeader>
            <CardTitle>Kullanıcı Listesi</CardTitle>
            <CardDescription>
              Sistem kullanıcılarını görüntüleyin ve yönetin
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4">Kullanıcı</th>
                    <th className="text-left py-3 px-4">Rol</th>
                    <th className="text-left py-3 px-4">İletişim</th>
                    <th className="text-left py-3 px-4">Durum</th>
                    <th className="text-left py-3 px-4">Kayıt Tarihi</th>
                    <th className="text-left py-3 px-4">İşlemler</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    Array.from({ length: 3 }).map((_, i) => (
                      <tr key={i} className="border-b">
                        <td className="py-3 px-4">
                          <div className="animate-pulse">
                            <div className="h-4 bg-gray-200 rounded w-32 mb-2"></div>
                            <div className="h-3 bg-gray-200 rounded w-48"></div>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="h-6 bg-gray-200 rounded w-20 animate-pulse"></div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="animate-pulse space-y-1">
                            <div className="h-3 bg-gray-200 rounded w-36"></div>
                            <div className="h-3 bg-gray-200 rounded w-32"></div>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="h-6 bg-gray-200 rounded w-16 animate-pulse"></div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="h-4 bg-gray-200 rounded w-20 animate-pulse"></div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="h-8 bg-gray-200 rounded w-8 animate-pulse"></div>
                        </td>
                      </tr>
                    ))
                  ) : filteredUsers.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-muted-foreground">
                        {searchTerm ? 'Arama kriterlerine uygun kullanıcı bulunamadı' : 'Henüz kullanıcı bulunmuyor'}
                      </td>
                    </tr>
                  ) : (
                    filteredUsers.map((user) => (
                      <tr key={user.id} className="border-b hover:bg-gray-50">
                        <td className="py-3 px-4">
                          <div>
                            <p className="font-medium">{user.name}</p>
                            <p className="text-sm text-muted-foreground">{user.email}</p>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <Badge variant={
                            user.role === 'ADMIN' ? 'default' :
                            user.role === 'COMPANY' ? 'secondary' :
                            user.role === 'INSTALLATION_TEAM' ? 'secondary' : 'outline'
                          }>
                            {user.role === 'ADMIN' ? 'Admin' :
                             user.role === 'COMPANY' ? 'Şirket' :
                             user.role === 'CUSTOMER' ? 'Müşteri' :
                             user.role === 'FARMER' ? 'Çiftçi' :
                             user.role === 'BANK' ? 'Banka' :
                             user.role === 'INSTALLATION_TEAM' ? 'Kurulum Ekibi' : user.role}
                          </Badge>
                        </td>
                        <td className="py-3 px-4">
                          <div className="space-y-1">
                            <div className="flex items-center gap-1 text-sm">
                              <Mail className="w-3 h-3" />
                              {user.email}
                            </div>
                            {user.phone && (
                              <div className="flex items-center gap-1 text-sm">
                                <Phone className="w-3 h-3" />
                                {user.phone}
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <Badge
                            variant={user.status === 'ACTIVE' ? 'default' : 'secondary'}
                            className={user.status === 'ACTIVE' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}
                          >
                            {user.status === 'ACTIVE' ? 'Aktif' : 'Pasif'}
                          </Badge>
                        </td>
                        <td className="py-3 px-4 text-sm">
                          {new Date(user.createdAt).toLocaleDateString('tr-TR')}
                        </td>
                        <td className="py-3 px-4">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm" disabled={updating === user.id}>
                                <MoreHorizontal className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>İşlemler</DropdownMenuLabel>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem onClick={() => console.log('Edit user:', user.id)}>
                                <Edit className="w-4 h-4 mr-2" />
                                Düzenle
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => toggleUserStatus(user.id, user.status)}
                                disabled={updating === user.id}
                              >
                                {user.status === 'ACTIVE' ? (
                                  <>
                                    <UserX className="w-4 h-4 mr-2" />
                                    Devre Dışı Bırak
                                  </>
                                ) : (
                                  <>
                                    <UserCheck className="w-4 h-4 mr-2" />
                                    Aktif Et
                                  </>
                                )}
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                className="text-red-600"
                                onClick={() => deleteUser(user.id, user.name)}
                                disabled={updating === user.id || user.id === session?.user?.id}
                              >
                                <Trash2 className="w-4 h-4 mr-2" />
                                Sil
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Role Management */}
        <Card>
          <CardHeader>
            <CardTitle>Rol Yönetimi</CardTitle>
            <CardDescription>
              Kullanıcı rollerini ve yetkilerini yönetin
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 border rounded-lg">
                <h4 className="font-medium mb-2">Admin</h4>
                <p className="text-sm text-muted-foreground mb-3">
                  Tüm sistem yetkilerine sahip kullanıcılar
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-sm">5 kullanıcı</span>
                  <Button variant="outline" size="sm">Düzenle</Button>
                </div>
              </div>
              
              <div className="p-4 border rounded-lg">
                <h4 className="font-medium mb-2">Sales Manager</h4>
                <p className="text-sm text-muted-foreground mb-3">
                  Satış ve müşteri yönetimi yetkileri
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-sm">8 kullanıcı</span>
                  <Button variant="outline" size="sm">Düzenle</Button>
                </div>
              </div>
              
              <div className="p-4 border rounded-lg">
                <h4 className="font-medium mb-2">Engineer</h4>
                <p className="text-sm text-muted-foreground mb-3">
                  Teknik proje yönetimi yetkileri
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-sm">6 kullanıcı</span>
                  <Button variant="outline" size="sm">Düzenle</Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}