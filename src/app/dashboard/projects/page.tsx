import { requireAuth } from '@/lib/auth-utils'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Building, Plus, Users, TrendingUp, Calendar, Zap } from 'lucide-react'
import Link from 'next/link'

export default async function ProjectsPage() {
  const user = await requireAuth()

  const projects = [
    {
      id: '1',
      name: 'İstanbul Çatı GES',
      location: 'Kadıköy, İstanbul',
      capacity: '10 kW',
      status: 'Aktif',
      progress: 75,
      customer: 'Ahmet Yılmaz',
      startDate: '2024-01-15'
    },
    {
      id: '2', 
      name: 'Bursa Fabrika GES',
      location: 'Nilüfer, Bursa',
      capacity: '500 kW',
      status: 'Devam Ediyor',
      progress: 45,
      customer: 'ABC Tekstil',
      startDate: '2024-02-01'
    },
    {
      id: '3',
      name: 'Antalya Villa GES', 
      location: 'Kemer, Antalya',
      capacity: '25 kW',
      status: 'Tamamlandı',
      progress: 100,
      customer: 'Murat Özkan',
      startDate: '2023-12-10'
    }
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Aktif': return 'bg-green-100 text-green-800'
      case 'Devam Ediyor': return 'bg-blue-100 text-blue-800' 
      case 'Tamamlandı': return 'bg-gray-100 text-gray-800'
      default: return 'bg-yellow-100 text-yellow-800'
    }
  }

  return (
    <DashboardLayout title="Projeler">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Projelerim</h1>
            <p className="text-gray-600">Solar enerji projelerinizi yönetin</p>
          </div>
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Yeni Proje
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Toplam Projeler</CardTitle>
              <Building className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{projects.length}</div>
              <p className="text-xs text-muted-foreground">Aktif projeler</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Toplam Kapasite</CardTitle>
              <Zap className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">535 kW</div>
              <p className="text-xs text-muted-foreground">Kurulu güç</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Aktif Müşteriler</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">3</div>
              <p className="text-xs text-muted-foreground">Devam eden</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Bu Ay Gelir</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">₺24.5K</div>
              <p className="text-xs text-muted-foreground">+12% geçen ay</p>
            </CardContent>
          </Card>
        </div>

        {/* Projects List */}
        <Card>
          <CardHeader>
            <CardTitle>Proje Listesi</CardTitle>
            <CardDescription>Tüm solar enerji projeleriniz</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {projects.map((project) => (
                <Link key={project.id} href={`/dashboard/projects/${project.id}`}>
                  <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors cursor-pointer">
                    <div className="flex items-center space-x-4">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <Building className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900">{project.name}</h3>
                        <p className="text-sm text-gray-500">{project.location} • {project.capacity}</p>
                        <p className="text-sm text-gray-500">Müşteri: {project.customer}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <Badge className={getStatusColor(project.status)}>
                          {project.status}
                        </Badge>
                        <p className="text-sm text-gray-500 mt-1">%{project.progress} tamamlandı</p>
                      </div>
                      
                      <div className="flex items-center text-sm text-gray-500">
                        <Calendar className="w-4 h-4 mr-1" />
                        {new Date(project.startDate).toLocaleDateString('tr-TR')}
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}