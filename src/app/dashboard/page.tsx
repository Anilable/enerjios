'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Sun, Building, Users, TrendingUp, DollarSign, Compass, Calculator, FileText, BarChart3, FolderPlus, Calendar, ClipboardList } from 'lucide-react'
import { getRoleName } from '@/lib/role-utils'
import { Suspense, useEffect, useState } from 'react'
import { FinancialOverview } from '@/components/dashboard/financial-overview'
import { WeatherWidget } from '@/components/dashboard/weather-widget'
import Link from 'next/link'

interface DashboardMetrics {
  projects: {
    total: number
    change: number
    changeText: string
  }
  customers: {
    total: number
    change: number
    changeText: string
  }
  capacity: {
    total: string
    totalRaw: number
    change: number
    changeText: string
  }
  revenue: {
    total: string
    totalRaw: number
    changePercent: number
    changeText: string
  }
}

interface RecentProject {
  id: string
  name: string
  capacity: number
  status: string
  type: string
  location: string
}

export default function DashboardPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null)
  const [metricsLoading, setMetricsLoading] = useState(true)
  const [recentProjects, setRecentProjects] = useState<RecentProject[]>([])
  const [projectsLoading, setProjectsLoading] = useState(true)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin')
    }
  }, [status, router])

  useEffect(() => {
    if (session?.user) {
      fetchMetrics()
      fetchRecentProjects()
    }
  }, [session])

  const fetchMetrics = async () => {
    try {
      setMetricsLoading(true)
      const response = await fetch('/api/dashboard/metrics')
      if (response.ok) {
        const data = await response.json()
        setMetrics(data)
      } else {
        console.error('Failed to fetch metrics, status:', response.status)
      }
    } catch (error) {
      console.error('Error fetching metrics:', error)
    } finally {
      setMetricsLoading(false)
    }
  }

  const fetchRecentProjects = async () => {
    try {
      setProjectsLoading(true)
      const response = await fetch('/api/dashboard/recent-projects')
      if (response.ok) {
        const data = await response.json()
        setRecentProjects(data)
      } else {
        console.error('Failed to fetch recent projects')
      }
    } catch (error) {
      console.error('Error fetching recent projects:', error)
    } finally {
      setProjectsLoading(false)
    }
  }

  if (status === 'loading') {
    return (
      <DashboardLayout
        title="Yükleniyor..."
        breadcrumbs={[
          { label: 'Anasayfa', href: '/' },
          { label: 'Dashboard' }
        ]}
      >
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <Card key={i}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-4 w-4" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-8 w-16 mb-2" />
                  <Skeleton className="h-3 w-24" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </DashboardLayout>
    )
  }

  if (status === 'unauthenticated' || !session?.user) {
    return null
  }

  const user = session.user

  return (
    <DashboardLayout 
      title={`Hoş geldiniz, ${user.name}! 👋`}
      breadcrumbs={[
        { label: 'Anasayfa', href: '/' },
        { label: 'Dashboard' }
      ]}
    >
      <div className="mb-6">
        <p className="text-gray-600">
          EnerjiOS dashboard'unuza hoş geldiniz. 
          {user.role === 'COMPANY' && ' Firma projelerinizi ve tekliflerinizi buradan yönetebilirsiniz.'}
          {user.role === 'FARMER' && ' Çiftlik projelerinizi ve tarımsal GES sistemlerinizi buradan takip edebilirsiniz.'}
          {user.role === 'CUSTOMER' && ' GES projelerinizi ve tasarruf analizlerinizi buradan görüntüleyebilirsiniz.'}
          {user.role === 'ADMIN' && ' Sistem yönetimi ve tüm kullanıcı verilerini buradan yönetebilirsiniz.'}
          {user.role === 'INSTALLATION_TEAM' && ' Kurulum projelerinizi ve teknik dökümantasyonu buradan yönetebilirsiniz.'}
        </p>
      </div>

      {/* Quick Actions Section */}
      <Card className="mb-8 bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
        <CardHeader>
          <CardTitle className="text-xl flex items-center gap-2">
            <Compass className="h-6 w-6 text-blue-600" />
            Hızlı İşlemler
          </CardTitle>
          <CardDescription>
            En çok kullanılan araçlara hızlı erişim
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
            <Link href="/dashboard/project-requests">
              <Button
                variant="default"
                className="w-full h-24 flex-col gap-2 bg-gradient-to-br from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 shadow-lg hover:shadow-xl transition-all transform hover:scale-105"
              >
                <FolderPlus className="h-8 w-8" />
                <div>
                  <div className="font-semibold">Proje Talepleri</div>
                  <div className="text-xs opacity-90">Yeni Talep</div>
                </div>
              </Button>
            </Link>

            <Link href="/dashboard/designer">
              <Button
                variant="default"
                className="w-full h-24 flex-col gap-2 bg-gradient-to-br from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg hover:shadow-xl transition-all transform hover:scale-105"
              >
                <Compass className="h-8 w-8" />
                <div>
                  <div className="font-semibold">Proje Tasarımcısı</div>
                  <div className="text-xs opacity-90">3D Çatı Analizi</div>
                </div>
              </Button>
            </Link>

            <Link href="/dashboard/project-requests">
              <Button
                variant="default"
                className="w-full h-24 flex-col gap-2 bg-gradient-to-br from-purple-600 to-violet-600 hover:from-purple-700 hover:to-violet-700 shadow-lg hover:shadow-xl transition-all transform hover:scale-105"
              >
                <ClipboardList className="h-8 w-8" />
                <div>
                  <div className="font-semibold">Talep İzleme</div>
                  <div className="text-xs opacity-90">Proje Takibi</div>
                </div>
              </Button>
            </Link>
            
            {user.role !== 'INSTALLATION_TEAM' && (
              <Link href="/dashboard/calculator">
                <Button
                  variant="outline"
                  className="w-full h-24 flex-col gap-2 border-2 hover:bg-gray-50 hover:scale-105 transition-all"
                >
                  <Calculator className="h-8 w-8 text-green-600" />
                  <div>
                    <div className="font-semibold">GES Hesaplayıcı</div>
                    <div className="text-xs text-gray-600">Maliyet Analizi</div>
                  </div>
                </Button>
              </Link>
            )}

            {user.role !== 'INSTALLATION_TEAM' && (
              <Link href="/dashboard/quotes">
                <Button
                  variant="outline"
                  className="w-full h-24 flex-col gap-2 border-2 hover:bg-gray-50 hover:scale-105 transition-all"
                >
                  <FileText className="h-8 w-8 text-orange-600" />
                  <div>
                    <div className="font-semibold">Teklifler</div>
                    <div className="text-xs text-gray-600">Fiyat Teklifleri</div>
                  </div>
                </Button>
              </Link>
            )}

            {user.role === 'INSTALLATION_TEAM' && (
              <Link href="/dashboard/project-requests">
                <Button
                  variant="outline"
                  className="w-full h-24 flex-col gap-2 border-2 hover:bg-gray-50 hover:scale-105 transition-all"
                >
                  <Building className="h-8 w-8 text-blue-600" />
                  <div>
                    <div className="font-semibold">Kurulum Projeleri</div>
                    <div className="text-xs text-gray-600">Aktif Kurulumlar</div>
                  </div>
                </Button>
              </Link>
            )}
            
            <Link href="/dashboard/reports">
              <Button 
                variant="outline" 
                className="w-full h-24 flex-col gap-2 border-2 hover:bg-gray-50 hover:scale-105 transition-all"
              >
                <BarChart3 className="h-8 w-8 text-purple-600" />
                <div>
                  <div className="font-semibold">Raporlar</div>
                  <div className="text-xs text-gray-600">Performans Analizi</div>
                </div>
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Toplam Projeler</CardTitle>
              <Building className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {metricsLoading ? (
                <>
                  <Skeleton className="h-8 w-16 mb-2" />
                  <Skeleton className="h-3 w-24" />
                </>
              ) : (
                <>
                  <div className="text-2xl font-bold">{metrics?.projects.total || 0}</div>
                  <p className="text-xs text-muted-foreground">{metrics?.projects.changeText || 'Değişim yok'}</p>
                </>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Aktif Müşteriler</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {metricsLoading ? (
                <>
                  <Skeleton className="h-8 w-16 mb-2" />
                  <Skeleton className="h-3 w-24" />
                </>
              ) : (
                <>
                  <div className="text-2xl font-bold">{metrics?.customers.total || 0}</div>
                  <p className="text-xs text-muted-foreground">{metrics?.customers.changeText || 'Değişim yok'}</p>
                </>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Toplam Kapasite</CardTitle>
              <Sun className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {metricsLoading ? (
                <>
                  <Skeleton className="h-8 w-20 mb-2" />
                  <Skeleton className="h-3 w-24" />
                </>
              ) : (
                <>
                  <div className="text-2xl font-bold">{metrics?.capacity.total || '0 kW'}</div>
                  <p className="text-xs text-muted-foreground">{metrics?.capacity.changeText || 'Değişim yok'}</p>
                </>
              )}
            </CardContent>
          </Card>

          {user.role !== 'INSTALLATION_TEAM' ? (
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Aylık Gelir</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                {metricsLoading ? (
                  <>
                    <Skeleton className="h-8 w-20 mb-2" />
                    <Skeleton className="h-3 w-28" />
                  </>
                ) : (
                  <>
                    <div className="text-2xl font-bold">{metrics?.revenue.total || '₺0'}</div>
                    <p className="text-xs text-muted-foreground">{metrics?.revenue.changeText || 'Değişim yok'}</p>
                  </>
                )}
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Kurulum Oranı</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                {metricsLoading ? (
                  <>
                    <Skeleton className="h-8 w-20 mb-2" />
                    <Skeleton className="h-3 w-28" />
                  </>
                ) : (
                  <>
                    <div className="text-2xl font-bold">92%</div>
                    <p className="text-xs text-muted-foreground">Başarılı tamamlanan kurulumlar</p>
                  </>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Recent Projects and Financial Overview */}
        <div className={`grid grid-cols-1 gap-6 mb-8 ${user.role !== 'INSTALLATION_TEAM' ? 'lg:grid-cols-7' : 'lg:grid-cols-1'}`}>
          {/* Recent Projects - Taking up 3/7 of the space or full width for Installation Team */}
          <div className={user.role !== 'INSTALLATION_TEAM' ? "lg:col-span-3" : ""}>
            <Card className="h-full">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building className="h-5 w-5" />
                  Son Projeler
                </CardTitle>
                <CardDescription>
                  En son eklenen ve güncellenen GES projeleri
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {projectsLoading ? (
                    Array.from({ length: 5 }).map((_, i) => (
                      <div key={i} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div className="space-y-2">
                          <Skeleton className="h-4 w-40" />
                          <Skeleton className="h-3 w-32" />
                          <Skeleton className="h-3 w-24" />
                        </div>
                        <Skeleton className="h-6 w-20" />
                      </div>
                    ))
                  ) : recentProjects.length > 0 ? (
                    recentProjects.map((project) => (
                      <div key={project.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                        <div>
                          <p className="font-semibold text-lg">{project.name}</p>
                          <p className="text-sm text-gray-600">
                            <span className="font-medium">{Math.round(project.capacity)} kW</span> • {project.location}
                          </p>
                          <p className="text-xs text-gray-500 capitalize">
                            {project.type === 'ROOFTOP' ? 'Çatı GES' :
                             project.type === 'LAND' ? 'Arazi GES' :
                             project.type === 'AGRISOLAR' ? 'Tarımsal GES' :
                             project.type === 'INDUSTRIAL' ? 'Endüstriyel GES' : project.type}
                          </p>
                        </div>
                        <Badge
                          variant={
                            project.status === 'COMPLETED' ? 'default' :
                            project.status === 'IN_PROGRESS' ? 'secondary' :
                            project.status === 'PLANNED' ? 'secondary' :
                            'outline'
                          }
                          className={
                            project.status === 'COMPLETED' ? 'bg-green-100 text-green-800' :
                            project.status === 'IN_PROGRESS' ? 'bg-blue-100 text-blue-800' :
                            project.status === 'PLANNED' ? 'bg-yellow-100 text-yellow-800' :
                            project.status === 'CANCELLED' ? 'bg-red-100 text-red-800' :
                            ''
                          }
                        >
                          {project.status === 'COMPLETED' ? 'Tamamlandı' :
                           project.status === 'IN_PROGRESS' ? 'Devam Ediyor' :
                           project.status === 'PLANNED' ? 'Planlanıyor' :
                           project.status === 'CANCELLED' ? 'İptal Edildi' :
                           'Taslak'}
                        </Badge>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-12 text-gray-500">
                      <Building className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                      <p className="text-lg font-medium mb-2">Henüz proje bulunmuyor</p>
                      <p className="text-sm mb-4">İlk GES projenizi oluşturmak için aşağıdaki bağlantıyı kullanabilirsiniz.</p>
                      <Link href="/dashboard/project-requests" className="text-primary hover:underline font-medium">
                        Yeni proje oluştur →
                      </Link>
                    </div>
                  )}
                </div>

                {recentProjects.length > 0 && (
                  <div className="mt-6 pt-4 border-t">
                    <Link href="/dashboard/project-requests" className="text-primary hover:underline text-sm font-medium">
                      Tüm projeleri görüntüle →
                    </Link>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Financial Overview - Taking up 4/7 of the space (hidden for Installation Team) */}
          {user.role !== 'INSTALLATION_TEAM' && (
            <div className="lg:col-span-4">
              <Card className="h-full">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <DollarSign className="h-5 w-5" />
                    Döviz Kurları
                  </CardTitle>
                  <CardDescription>
                    Güncel döviz kurları ve proje maliyetleri
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <FinancialOverview />
                </CardContent>
              </Card>
            </div>
          )}

          {/* Installation Overview for Installation Team */}
          {user.role === 'INSTALLATION_TEAM' && (
            <Card className="h-full">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building className="h-5 w-5" />
                  Kurulum Özeti
                </CardTitle>
                <CardDescription>
                  Aktif kurulumlar ve görevler
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Bekleyen Kurulumlar</span>
                    <span className="font-semibold">5</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Devam Eden</span>
                    <span className="font-semibold text-blue-600">3</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Bu Ay Tamamlanan</span>
                    <span className="font-semibold text-green-600">12</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Ortalama Süre</span>
                    <span className="font-semibold">2.5 gün</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Weather Widget - Below recent projects */}
        <div className="col-span-full">
          <Suspense fallback={
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sun className="h-5 w-5 text-yellow-500" />
                  Hava Durumu ve Solar Verimlilik
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <Skeleton className="h-20 w-full" />
                  <Skeleton className="h-32 w-full" />
                </div>
              </CardContent>
            </Card>
          }>
            <WeatherWidget />
          </Suspense>
        </div>
    </DashboardLayout>
  )
}