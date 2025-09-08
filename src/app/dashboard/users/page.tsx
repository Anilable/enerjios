import { requireAuth } from '@/lib/auth-utils'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { 
  Users, 
  UserPlus, 
  Search, 
  MoreHorizontal,
  Shield,
  Mail,
  Phone
} from 'lucide-react'

const mockUsers = [
  {
    id: '1',
    name: 'Ahmet Yılmaz',
    email: 'ahmet@trakyasolar.com',
    phone: '+90 532 123 4567',
    role: 'Admin',
    status: 'Active',
    lastLogin: '2024-01-15'
  },
  {
    id: '2',
    name: 'Mehmet Kaya',
    email: 'mehmet@trakyasolar.com', 
    phone: '+90 532 987 6543',
    role: 'Sales Manager',
    status: 'Active',
    lastLogin: '2024-01-14'
  },
  {
    id: '3',
    name: 'Fatma Demir',
    email: 'fatma@trakyasolar.com',
    phone: '+90 533 456 7890',
    role: 'Engineer',
    status: 'Active',
    lastLogin: '2024-01-13'
  },
  {
    id: '4',
    name: 'Ali Özkan',
    email: 'ali@trakyasolar.com',
    phone: '+90 534 321 0987',
    role: 'Customer Service',
    status: 'Inactive',
    lastLogin: '2024-01-10'
  }
]

export default async function UsersPage() {
  const user = await requireAuth()

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
              />
            </div>
          </div>
          <Button className="flex items-center gap-2">
            <UserPlus className="w-4 h-4" />
            Yeni Kullanıcı Ekle
          </Button>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-blue-600" />
                <div>
                  <p className="text-2xl font-bold">24</p>
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
                  <p className="text-2xl font-bold">21</p>
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
                  <p className="text-2xl font-bold">5</p>
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
                  <p className="text-2xl font-bold">3</p>
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
                    <th className="text-left py-3 px-4">Son Giriş</th>
                    <th className="text-left py-3 px-4">İşlemler</th>
                  </tr>
                </thead>
                <tbody>
                  {mockUsers.map((user) => (
                    <tr key={user.id} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4">
                        <div>
                          <p className="font-medium">{user.name}</p>
                          <p className="text-sm text-muted-foreground">{user.email}</p>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <Badge variant="secondary">{user.role}</Badge>
                      </td>
                      <td className="py-3 px-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-1 text-sm">
                            <Mail className="w-3 h-3" />
                            {user.email}
                          </div>
                          <div className="flex items-center gap-1 text-sm">
                            <Phone className="w-3 h-3" />
                            {user.phone}
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <Badge 
                          variant={user.status === 'Active' ? 'default' : 'secondary'}
                          className={user.status === 'Active' ? 'bg-green-100 text-green-800' : ''}
                        >
                          {user.status === 'Active' ? 'Aktif' : 'Pasif'}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-sm">
                        {new Date(user.lastLogin).toLocaleDateString('tr-TR')}
                      </td>
                      <td className="py-3 px-4">
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}
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