import { requireAuth } from '@/lib/auth-utils'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { 
  Tractor, 
  Plus, 
  Search, 
  MoreHorizontal,
  MapPin,
  Phone,
  Mail,
  Wheat,
  Droplets
} from 'lucide-react'

const mockFarmers = [
  {
    id: '1',
    name: 'Ahmet Kaya',
    farmName: 'Kaya Çiftliği',
    location: 'Konya, Çumra',
    phone: '+90 532 123 4567',
    email: 'ahmet@kayaciftligi.com',
    farmSize: '250 dönüm',
    cropType: 'Buğday, Arpa',
    systemSize: '50 kW',
    status: 'Aktif',
    joinDate: '2023-03-15'
  },
  {
    id: '2',
    name: 'Fatma Demir',
    farmName: 'Demir Tarım',
    location: 'Ankara, Polatlı',
    phone: '+90 532 987 6543',
    email: 'fatma@demirtarim.com',
    farmSize: '180 dönüm',
    cropType: 'Mısır, Ayçiçeği',
    systemSize: '35 kW',
    status: 'Aktif',
    joinDate: '2023-06-22'
  },
  {
    id: '3',
    name: 'Mehmet Özkan',
    farmName: 'Özkan Sera',
    location: 'Antalya, Demre',
    phone: '+90 532 456 7890',
    email: 'mehmet@ozkansera.com',
    farmSize: '45 dönüm',
    cropType: 'Domates, Biber',
    systemSize: '25 kW',
    status: 'Planlama',
    joinDate: '2023-09-10'
  }
]

export default async function FarmersPage() {
  const user = await requireAuth()

  return (
    <DashboardLayout title="Çiftçi Yönetimi">
      <div className="space-y-6">
        {/* Header Actions */}
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input 
                placeholder="Çiftçi ara..." 
                className="pl-10 w-64"
              />
            </div>
          </div>
          <Button className="flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Yeni Çiftçi Ekle
          </Button>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-2">
                <Tractor className="w-5 h-5 text-green-600" />
                <div>
                  <p className="text-2xl font-bold">156</p>
                  <p className="text-sm text-muted-foreground">Toplam Çiftçi</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-2">
                <Wheat className="w-5 h-5 text-yellow-600" />
                <div>
                  <p className="text-2xl font-bold">12,450</p>
                  <p className="text-sm text-muted-foreground">Toplam Dönüm</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-2">
                <Droplets className="w-5 h-5 text-blue-600" />
                <div>
                  <p className="text-2xl font-bold">2.8 MW</p>
                  <p className="text-sm text-muted-foreground">Kurulu Güç</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-2">
                <Tractor className="w-5 h-5 text-purple-600" />
                <div>
                  <p className="text-2xl font-bold">23</p>
                  <p className="text-sm text-muted-foreground">Bu Ay Yeni</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Farmers Table */}
        <Card>
          <CardHeader>
            <CardTitle>Çiftçi Listesi</CardTitle>
            <CardDescription>
              Kayıtlı çiftçileri ve tarım işletmelerini görüntüleyin
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4">Çiftçi</th>
                    <th className="text-left py-3 px-4">Çiftlik</th>
                    <th className="text-left py-3 px-4">Konum</th>
                    <th className="text-left py-3 px-4">Alan/Ürün</th>
                    <th className="text-left py-3 px-4">GES Gücü</th>
                    <th className="text-left py-3 px-4">Durum</th>
                    <th className="text-left py-3 px-4">İşlemler</th>
                  </tr>
                </thead>
                <tbody>
                  {mockFarmers.map((farmer) => (
                    <tr key={farmer.id} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4">
                        <div>
                          <p className="font-medium">{farmer.name}</p>
                          <div className="flex items-center gap-1 text-sm text-muted-foreground">
                            <Mail className="w-3 h-3" />
                            {farmer.email}
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div>
                          <p className="font-medium">{farmer.farmName}</p>
                          <div className="flex items-center gap-1 text-sm text-muted-foreground">
                            <Phone className="w-3 h-3" />
                            {farmer.phone}
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1 text-sm">
                          <MapPin className="w-3 h-3" />
                          {farmer.location}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div>
                          <p className="font-medium">{farmer.farmSize}</p>
                          <p className="text-sm text-muted-foreground">{farmer.cropType}</p>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <Badge variant="outline" className="bg-green-50 text-green-700">
                          {farmer.systemSize}
                        </Badge>
                      </td>
                      <td className="py-3 px-4">
                        <Badge 
                          variant={farmer.status === 'Aktif' ? 'default' : 'secondary'}
                          className={farmer.status === 'Aktif' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}
                        >
                          {farmer.status}
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

        {/* Regional Distribution */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Bölgesel Dağılım</CardTitle>
              <CardDescription>
                Çiftçilerin bölgelere göre dağılımı
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Konya</span>
                  <div className="flex items-center gap-2">
                    <div className="w-20 bg-gray-200 rounded-full h-2">
                      <div className="bg-green-600 h-2 rounded-full" style={{width: '65%'}}></div>
                    </div>
                    <span className="text-sm font-medium">42 çiftçi</span>
                  </div>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm">Ankara</span>
                  <div className="flex items-center gap-2">
                    <div className="w-20 bg-gray-200 rounded-full h-2">
                      <div className="bg-green-600 h-2 rounded-full" style={{width: '45%'}}></div>
                    </div>
                    <span className="text-sm font-medium">28 çiftçi</span>
                  </div>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm">Antalya</span>
                  <div className="flex items-center gap-2">
                    <div className="w-20 bg-gray-200 rounded-full h-2">
                      <div className="bg-green-600 h-2 rounded-full" style={{width: '35%'}}></div>
                    </div>
                    <span className="text-sm font-medium">22 çiftçi</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Ürün Türleri</CardTitle>
              <CardDescription>
                Çiftliklerde yetiştirilen ürün dağılımı
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center gap-3 p-3 bg-yellow-50 rounded-lg">
                  <Wheat className="w-5 h-5 text-yellow-600" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">Tahıl (Buğday, Arpa, Mısır)</p>
                    <p className="text-xs text-gray-500">68 çiftlik</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                  <Droplets className="w-5 h-5 text-green-600" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">Sera Ürünleri</p>
                    <p className="text-xs text-gray-500">34 çiftlik</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 p-3 bg-orange-50 rounded-lg">
                  <Tractor className="w-5 h-5 text-orange-600" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">Hayvancılık</p>
                    <p className="text-xs text-gray-500">28 çiftlik</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  )
}