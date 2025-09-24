import { requireAuth } from '@/lib/auth-utils'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Building, Plus, Users, TrendingUp, Calendar, Zap } from 'lucide-react'
import Link from 'next/link'

interface Project {
  id: string
  name: string
  type: string
  status: string
  capacity: number
  progress?: number
  startDate?: string
  location: {
    city: string
    district: string
    address: string
  }
  customer: {
    firstName: string
    lastName: string
    companyName?: string
  }
  createdAt: string
  updatedAt: string
}

export default async function ProjectsPage() {
  const user = await requireAuth()

  // Fetch real projects from database
  const projects: Project[] = []

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
              <div className="text-2xl font-bold">&#8378;24.5K</div>
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
              {projects.length === 0 ? (
                <div className="text-center py-8">
                  <Building className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-lg font-medium text-gray-900 mb-2">Henüz proje bulunmuyor</p>
                  <p className="text-gray-500 mb-4">İlk solar enerji projenizi oluşturun</p>
                  <Link href="/dashboard/projects/new">
                    <Button>
                      <Plus className="w-4 h-4 mr-2" />
                      Yeni Proje Oluştur
                    </Button>
                  </Link>
                </div>
              ) : (
                projects.map((project) => (
                  <Link key={project.id} href={`/dashboard/projects/${project.id}`}>
                    <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors cursor-pointer">
                      <div className="flex items-center space-x-4">
                        <div className="p-2 bg-blue-100 rounded-lg">
                          <Building className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                          <h3 className="font-medium text-gray-900">{project.name}</h3>
                          <p className="text-sm text-gray-500">{project.location.city}, {project.location.district} • {project.capacity}kW</p>
                          <p className="text-sm text-gray-500">Müşteri: {project.customer.companyName || `${project.customer.firstName} ${project.customer.lastName}`}</p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-4">
                        <div className="text-right">
                          <Badge className={getStatusColor(project.status)}>
                            {project.status}
                          </Badge>
                          <p className="text-sm text-gray-500 mt-1">%{project.progress || 0} tamamlandı</p>
                        </div>

                        <div className="flex items-center text-sm text-gray-500">
                          <Calendar className="w-4 h-4 mr-1" />
                          {project.startDate ? new Date(project.startDate).toLocaleDateString('tr-TR') : 'Tarih yok'}
                        </div>
                      </div>
                    </div>
                  </Link>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}