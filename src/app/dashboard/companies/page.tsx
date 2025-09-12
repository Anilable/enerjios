import { requireAuth } from '@/lib/auth-utils'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { 
  Building, 
  Plus, 
  Search, 
  MoreHorizontal,
  MapPin,
  Phone,
  Mail,
  Calendar
} from 'lucide-react'

const mockCompanies = [
  {
    id: '1',
    name: 'ABC Enerji Ltd.',
    sector: 'Enerji',
    location: 'İstanbul',
    phone: '+90 212 555 0101',
    email: 'info@abcenerji.com',
    status: 'Aktif',
    projectCount: 15,
    joinDate: '2023-05-15'
  },
  {
    id: '2',
    name: 'GES Teknoloji A.Ş.',
    sector: 'Teknoloji',
    location: 'Ankara',
    phone: '+90 312 555 0202',
    email: 'contact@gesteknoloji.com',
    status: 'Aktif',
    projectCount: 8,
    joinDate: '2023-08-22'
  },
  {
    id: '3',
    name: 'Solar Çözümler Ltd.',
    sector: 'Enerji',
    location: 'İzmir',
    phone: '+90 232 555 0303',
    email: 'info@solarcozumler.com',
    status: 'Pasif',
    projectCount: 3,
    joinDate: '2023-02-10'
  }
]

export default async function CompaniesPage() {
  const user = await requireAuth()

  return (
    <DashboardLayout title="Şirket Yönetimi">
      <div className="space-y-6">
        {/* Header Actions */}
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input 
                placeholder="Şirket ara..." 
                className="pl-10 w-64"
              />
            </div>
          </div>
          <Button className="flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Yeni Şirket Ekle
          </Button>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-2">
                <Building className="w-5 h-5 text-blue-600" />
                <div>
                  <p className="text-2xl font-bold">45</p>
                  <p className="text-sm text-muted-foreground">Toplam Şirket</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-2">
                <Building className="w-5 h-5 text-green-600" />
                <div>
                  <p className="text-2xl font-bold">38</p>
                  <p className="text-sm text-muted-foreground">Aktif Şirket</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-2">
                <Building className="w-5 h-5 text-orange-600" />
                <div>
                  <p className="text-2xl font-bold">125</p>
                  <p className="text-sm text-muted-foreground">Toplam Proje</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-2">
                <Building className="w-5 h-5 text-purple-600" />
                <div>
                  <p className="text-2xl font-bold">7</p>
                  <p className="text-sm text-muted-foreground">Bu Ay Yeni</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Companies Table */}
        <Card>
          <CardHeader>
            <CardTitle>Şirket Listesi</CardTitle>
            <CardDescription>
              Kayıtlı şirketleri görüntüleyin ve yönetin
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4">Şirket</th>
                    <th className="text-left py-3 px-4">Sektör</th>
                    <th className="text-left py-3 px-4">Konum</th>
                    <th className="text-left py-3 px-4">İletişim</th>
                    <th className="text-left py-3 px-4">Proje Sayısı</th>
                    <th className="text-left py-3 px-4">Durum</th>
                    <th className="text-left py-3 px-4">İşlemler</th>
                  </tr>
                </thead>
                <tbody>
                  {mockCompanies.map((company) => (
                    <tr key={company.id} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4">
                        <div>
                          <p className="font-medium">{company.name}</p>
                          <p className="text-sm text-muted-foreground">
                            Kayıt: {new Date(company.joinDate).toLocaleDateString('tr-TR')}
                          </p>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <Badge variant="secondary">{company.sector}</Badge>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1 text-sm">
                          <MapPin className="w-3 h-3" />
                          {company.location}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-1 text-sm">
                            <Phone className="w-3 h-3" />
                            {company.phone}
                          </div>
                          <div className="flex items-center gap-1 text-sm">
                            <Mail className="w-3 h-3" />
                            {company.email}
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-medium">{company.projectCount} proje</span>
                      </td>
                      <td className="py-3 px-4">
                        <Badge 
                          variant={company.status === 'Aktif' ? 'default' : 'secondary'}
                          className={company.status === 'Aktif' ? 'bg-green-100 text-green-800' : ''}
                        >
                          {company.status}
                        </Badge>
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

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Son Aktiviteler</CardTitle>
            <CardDescription>
              Şirketlerle ilgili son aktiviteler
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                <Building className="w-5 h-5 text-blue-600" />
                <div className="flex-1">
                  <p className="text-sm font-medium">ABC Enerji Ltd. yeni proje başlattı</p>
                  <p className="text-xs text-gray-500">2 saat önce</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                <Plus className="w-5 h-5 text-green-600" />
                <div className="flex-1">
                  <p className="text-sm font-medium">Yeni şirket kaydı: Solar Çözümler Ltd.</p>
                  <p className="text-xs text-gray-500">1 gün önce</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3 p-3 bg-orange-50 rounded-lg">
                <Calendar className="w-5 h-5 text-orange-600" />
                <div className="flex-1">
                  <p className="text-sm font-medium">GES Teknoloji A.Ş. proje teslimi</p>
                  <p className="text-xs text-gray-500">3 gün önce</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}