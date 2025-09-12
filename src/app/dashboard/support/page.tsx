import { requireAuth } from '@/lib/auth-utils'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { 
  HeadphonesIcon, 
  Plus, 
  Search, 
  MoreHorizontal,
  Clock,
  CheckCircle,
  AlertCircle,
  MessageCircle,
  Phone,
  Mail
} from 'lucide-react'

const mockTickets = [
  {
    id: '1',
    title: 'İnverter arıza bildirimi',
    customer: 'Ahmet Yılmaz',
    email: 'ahmet@example.com',
    priority: 'Yüksek',
    status: 'Açık',
    category: 'Teknik Destek',
    createdAt: '2024-01-15 10:30',
    lastUpdate: '2024-01-15 14:20'
  },
  {
    id: '2',
    title: 'GES kurulum randevusu',
    customer: 'Fatma Kaya',
    email: 'fatma@example.com',
    priority: 'Orta',
    status: 'İşlemde',
    category: 'Kurulum',
    createdAt: '2024-01-14 16:45',
    lastUpdate: '2024-01-15 09:15'
  },
  {
    id: '3',
    title: 'Fatura sorgusu',
    customer: 'Mehmet Özkan',
    email: 'mehmet@example.com',
    priority: 'Düşük',
    status: 'Çözüldü',
    category: 'Faturalandırma',
    createdAt: '2024-01-13 11:20',
    lastUpdate: '2024-01-14 08:30'
  }
]

export default async function SupportPage() {
  const user = await requireAuth()

  return (
    <DashboardLayout title="Destek Yönetimi">
      <div className="space-y-6">
        {/* Header Actions */}
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input 
                placeholder="Destek talebi ara..." 
                className="pl-10 w-64"
              />
            </div>
          </div>
          <Button className="flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Yeni Ticket Oluştur
          </Button>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-2">
                <MessageCircle className="w-5 h-5 text-blue-600" />
                <div>
                  <p className="text-2xl font-bold">147</p>
                  <p className="text-sm text-muted-foreground">Toplam Ticket</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-orange-600" />
                <div>
                  <p className="text-2xl font-bold">23</p>
                  <p className="text-sm text-muted-foreground">Bekleyen</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-yellow-600" />
                <div>
                  <p className="text-2xl font-bold">18</p>
                  <p className="text-sm text-muted-foreground">İşlemde</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <div>
                  <p className="text-2xl font-bold">106</p>
                  <p className="text-sm text-muted-foreground">Çözüldü</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Support Tickets */}
        <Card>
          <CardHeader>
            <CardTitle>Destek Talepleri</CardTitle>
            <CardDescription>
              Müşteri destek taleplerini görüntüleyin ve yönetin
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4">Ticket</th>
                    <th className="text-left py-3 px-4">Müşteri</th>
                    <th className="text-left py-3 px-4">Kategori</th>
                    <th className="text-left py-3 px-4">Öncelik</th>
                    <th className="text-left py-3 px-4">Durum</th>
                    <th className="text-left py-3 px-4">Son Güncelleme</th>
                    <th className="text-left py-3 px-4">İşlemler</th>
                  </tr>
                </thead>
                <tbody>
                  {mockTickets.map((ticket) => (
                    <tr key={ticket.id} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4">
                        <div>
                          <p className="font-medium">#{ticket.id}</p>
                          <p className="text-sm text-muted-foreground">{ticket.title}</p>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div>
                          <p className="font-medium">{ticket.customer}</p>
                          <p className="text-sm text-muted-foreground">{ticket.email}</p>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <Badge variant="outline">{ticket.category}</Badge>
                      </td>
                      <td className="py-3 px-4">
                        <Badge 
                          variant="secondary"
                          className={
                            ticket.priority === 'Yüksek' ? 'bg-red-100 text-red-800' :
                            ticket.priority === 'Orta' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-green-100 text-green-800'
                          }
                        >
                          {ticket.priority}
                        </Badge>
                      </td>
                      <td className="py-3 px-4">
                        <Badge 
                          variant={ticket.status === 'Çözüldü' ? 'default' : 'secondary'}
                          className={
                            ticket.status === 'Çözüldü' ? 'bg-green-100 text-green-800' :
                            ticket.status === 'İşlemde' ? 'bg-blue-100 text-blue-800' :
                            'bg-orange-100 text-orange-800'
                          }
                        >
                          {ticket.status}
                        </Badge>
                      </td>
                      <td className="py-3 px-4">
                        <p className="text-sm">{ticket.lastUpdate}</p>
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

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Quick Response Templates */}
          <Card>
            <CardHeader>
              <CardTitle>Hızlı Yanıt Şablonları</CardTitle>
              <CardDescription>
                Sık kullanılan yanıt şablonları
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
                  <p className="font-medium text-sm">İnverter Arıza Çözümü</p>
                  <p className="text-xs text-gray-500">Teknik destek şablonu</p>
                </div>
                
                <div className="p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
                  <p className="font-medium text-sm">Kurulum Randevu Onayı</p>
                  <p className="text-xs text-gray-500">Randevu şablonu</p>
                </div>
                
                <div className="p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
                  <p className="font-medium text-sm">Genel Bilgilendirme</p>
                  <p className="text-xs text-gray-500">Bilgi şablonu</p>
                </div>
              </div>
              
              <Button variant="outline" className="w-full mt-4">
                Yeni Şablon Ekle
              </Button>
            </CardContent>
          </Card>

          {/* Contact Information */}
          <Card>
            <CardHeader>
              <CardTitle>İletişim Bilgileri</CardTitle>
              <CardDescription>
                Destek ekibi iletişim bilgileri
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                  <Phone className="w-5 h-5 text-blue-600" />
                  <div>
                    <p className="font-medium text-sm">Acil Destek Hattı</p>
                    <p className="text-sm text-blue-600">0850 123 4567</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                  <Mail className="w-5 h-5 text-green-600" />
                  <div>
                    <p className="font-medium text-sm">Destek E-posta</p>
                    <p className="text-sm text-green-600">destek@trakyasolar.com</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 p-3 bg-orange-50 rounded-lg">
                  <HeadphonesIcon className="w-5 h-5 text-orange-600" />
                  <div>
                    <p className="font-medium text-sm">Teknik Destek</p>
                    <p className="text-sm text-orange-600">7/24 Online Destek</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* New Ticket Form */}
        <Card>
          <CardHeader>
            <CardTitle>Hızlı Ticket Oluştur</CardTitle>
            <CardDescription>
              Yeni destek talebi oluşturun
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Müşteri E-posta</label>
                <Input placeholder="musteri@example.com" />
              </div>
              
              <div>
                <label className="text-sm font-medium mb-2 block">Kategori</label>
                <select className="w-full px-3 py-2 border rounded-md">
                  <option>Teknik Destek</option>
                  <option>Kurulum</option>
                  <option>Faturalandırma</option>
                  <option>Genel</option>
                </select>
              </div>
              
              <div className="md:col-span-2">
                <label className="text-sm font-medium mb-2 block">Konu</label>
                <Input placeholder="Ticket konusu" />
              </div>
              
              <div className="md:col-span-2">
                <label className="text-sm font-medium mb-2 block">Açıklama</label>
                <Textarea placeholder="Detaylı açıklama yazın..." rows={3} />
              </div>
              
              <div className="md:col-span-2">
                <Button>Ticket Oluştur</Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}