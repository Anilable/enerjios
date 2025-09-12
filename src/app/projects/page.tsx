'use client'

import { useState } from 'react'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Building, 
  Calendar, 
  MapPin, 
  Zap, 
  TrendingUp, 
  Eye, 
  FileText,
  Download,
  Plus,
  Clock,
  CheckCircle,
  AlertCircle,
  Users,
  PiggyBank
} from 'lucide-react'

interface Project {
  id: string
  name: string
  location: string
  capacity: number
  status: 'planning' | 'in-progress' | 'completed' | 'on-hold'
  progress: number
  startDate: string
  expectedCompletion: string
  totalCost: number
  currentCost: number
  description: string
  contractor: string
  lastUpdate: string
}

const mockProjects: Project[] = [
  {
    id: '1',
    name: 'Konut GES Projesi',
    location: 'İstanbul, Beylikdüzü',
    capacity: 10.5,
    status: 'in-progress',
    progress: 65,
    startDate: '2024-01-15',
    expectedCompletion: '2024-03-15',
    totalCost: 157500,
    currentCost: 102375,
    description: 'Çatı üzerine kurulacak 10.5 kW güneş enerjisi sistemi',
    contractor: 'EnerjiOS Enerji',
    lastUpdate: '2024-02-28'
  },
  {
    id: '2',
    name: 'Fabrika GES Sistemi',
    location: 'Tekirdağ, Çorlu',
    capacity: 250,
    status: 'completed',
    progress: 100,
    startDate: '2023-09-01',
    expectedCompletion: '2023-12-01',
    totalCost: 3750000,
    currentCost: 3750000,
    description: 'Fabrika çatısı ve bahçe alanına kurulu hibrit sistem',
    contractor: 'Solar Tech Solutions',
    lastUpdate: '2023-12-01'
  }
]

export default function ProjectsPage() {
  const [selectedTab, setSelectedTab] = useState('all')
  const [projects] = useState<Project[]>(mockProjects)

  const getStatusColor = (status: Project['status']) => {
    switch (status) {
      case 'planning': return 'bg-blue-100 text-blue-800'
      case 'in-progress': return 'bg-yellow-100 text-yellow-800'
      case 'completed': return 'bg-green-100 text-green-800'
      case 'on-hold': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (status: Project['status']) => {
    switch (status) {
      case 'planning': return <Clock className="w-4 h-4" />
      case 'in-progress': return <AlertCircle className="w-4 h-4" />
      case 'completed': return <CheckCircle className="w-4 h-4" />
      case 'on-hold': return <AlertCircle className="w-4 h-4" />
      default: return <Clock className="w-4 h-4" />
    }
  }

  const getStatusText = (status: Project['status']) => {
    switch (status) {
      case 'planning': return 'Planlama'
      case 'in-progress': return 'Devam Ediyor'
      case 'completed': return 'Tamamlandı'
      case 'on-hold': return 'Beklemede'
      default: return status
    }
  }

  const filteredProjects = projects.filter(project => {
    if (selectedTab === 'all') return true
    return project.status === selectedTab
  })

  const totalCapacity = projects.reduce((sum, project) => sum + project.capacity, 0)
  const completedProjects = projects.filter(p => p.status === 'completed').length
  const activeProjects = projects.filter(p => p.status === 'in-progress').length
  const totalInvestment = projects.reduce((sum, project) => sum + project.totalCost, 0)

  return (
    <DashboardLayout title="Projelerim">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Building className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{projects.length}</p>
                <p className="text-sm text-gray-600">Toplam Proje</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{completedProjects}</p>
                <p className="text-sm text-gray-600">Tamamlanan</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Clock className="w-6 h-6 text-yellow-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{activeProjects}</p>
                <p className="text-sm text-gray-600">Aktif</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Zap className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{totalCapacity.toFixed(1)}</p>
                <p className="text-sm text-gray-600">kW Toplam Güç</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Projelerim</CardTitle>
                <CardDescription>
                  Güneş enerjisi projelerinizi takip edin ve yönetin
                </CardDescription>
              </div>
              <Button className="bg-primary hover:bg-primary/90">
                <Plus className="w-4 h-4 mr-2" />
                Yeni Proje
              </Button>
            </CardHeader>
            <CardContent>
              <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-6">
                <TabsList className="grid grid-cols-4 w-full">
                  <TabsTrigger value="all">Tümü</TabsTrigger>
                  <TabsTrigger value="in-progress">Aktif</TabsTrigger>
                  <TabsTrigger value="completed">Tamamlanan</TabsTrigger>
                  <TabsTrigger value="planning">Planlanan</TabsTrigger>
                </TabsList>

                <TabsContent value={selectedTab} className="space-y-4">
                  {filteredProjects.map((project) => (
                    <Card key={project.id} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex-1">
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">
                              {project.name}
                            </h3>
                            <p className="text-gray-600 text-sm mb-3">
                              {project.description}
                            </p>
                            
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                              <div className="flex items-center space-x-2">
                                <MapPin className="w-4 h-4 text-gray-500" />
                                <span className="text-gray-600">{project.location}</span>
                              </div>
                              <div className="flex items-center space-x-2">
                                <Zap className="w-4 h-4 text-blue-500" />
                                <span className="text-gray-600">{project.capacity} kW</span>
                              </div>
                              <div className="flex items-center space-x-2">
                                <Calendar className="w-4 h-4 text-green-500" />
                                <span className="text-gray-600">{project.expectedCompletion}</span>
                              </div>
                              <div className="flex items-center space-x-2">
                                <Users className="w-4 h-4 text-purple-500" />
                                <span className="text-gray-600">{project.contractor}</span>
                              </div>
                            </div>
                          </div>

                          <Badge className={`${getStatusColor(project.status)} ml-4 flex items-center space-x-1`}>
                            {getStatusIcon(project.status)}
                            <span>{getStatusText(project.status)}</span>
                          </Badge>
                        </div>

                        {project.status === 'in-progress' && (
                          <div className="mb-4">
                            <div className="flex justify-between items-center mb-2">
                              <span className="text-sm text-gray-600">İlerleme</span>
                              <span className="text-sm font-medium">{project.progress}%</span>
                            </div>
                            <Progress value={project.progress} className="h-2" />
                          </div>
                        )}

                        <div className="flex items-center justify-between pt-4 border-t">
                          <div className="flex items-center space-x-4 text-sm text-gray-600">
                            <div className="flex items-center space-x-1">
                              <PiggyBank className="w-4 h-4" />
                              <span>₺{project.currentCost.toLocaleString('tr-TR')} / ₺{project.totalCost.toLocaleString('tr-TR')}</span>
                            </div>
                            <span className="text-gray-400">•</span>
                            <span>Son güncelleme: {project.lastUpdate}</span>
                          </div>

                          <div className="flex space-x-2">
                            <Button variant="outline" size="sm">
                              <Eye className="w-4 h-4 mr-1" />
                              Detay
                            </Button>
                            <Button variant="outline" size="sm">
                              <FileText className="w-4 h-4 mr-1" />
                              Rapor
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}

                  {filteredProjects.length === 0 && (
                    <Card>
                      <CardContent className="text-center py-12">
                        <Building className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                        <p className="text-gray-500 mb-4">
                          {selectedTab === 'all' ? 'Henüz projeniz bulunmuyor' : 'Bu kategoride proje bulunmuyor'}
                        </p>
                        <Button className="bg-primary hover:bg-primary/90">
                          <Plus className="w-4 h-4 mr-2" />
                          İlk Projenizi Oluşturun
                        </Button>
                      </CardContent>
                    </Card>
                  )}
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Finansal Özet</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  ₺{totalInvestment.toLocaleString('tr-TR')}
                </div>
                <p className="text-sm text-gray-600">Toplam Yatırım</p>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Aktif Projeler</span>
                  <span className="font-medium">₺{projects.filter(p => p.status === 'in-progress').reduce((sum, p) => sum + p.totalCost, 0).toLocaleString('tr-TR')}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Tamamlanan</span>
                  <span className="font-medium text-green-600">₺{projects.filter(p => p.status === 'completed').reduce((sum, p) => sum + p.totalCost, 0).toLocaleString('tr-TR')}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Beklenen ROI</span>
                  <span className="font-medium text-blue-600">285%</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Hızlı İşlemler</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button className="w-full" variant="outline" asChild>
                <a href="/calculator">
                  <Plus className="w-4 h-4 mr-2" />
                  Yeni Proje Hesapla
                </a>
              </Button>
              <Button className="w-full" variant="outline" asChild>
                <a href="/quotes">
                  <FileText className="w-4 h-4 mr-2" />
                  Tekliflerim
                </a>
              </Button>
              <Button className="w-full" variant="outline">
                <Download className="w-4 h-4 mr-2" />
                Tüm Raporları İndir
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Güncel Performans</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  12,450
                </div>
                <p className="text-sm text-gray-600">Bu Ay kWh Üretim</p>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Bu Ay Tasarruf</span>
                  <span className="font-medium text-green-600">₺3,124</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Yıllık Tasarruf</span>
                  <span className="font-medium text-green-600">₺45,680</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">CO₂ Tasarrufu</span>
                  <span className="font-medium text-blue-600">5.2 ton</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  )
}