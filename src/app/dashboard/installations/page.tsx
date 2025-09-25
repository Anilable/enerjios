'use client'

import { useState, useEffect } from 'react'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Calendar,
  Zap,
  CheckCircle,
  Clock,
  MapPin,
  User,
  Wrench,
  ArrowRight,
  AlertTriangle
} from 'lucide-react'
import Link from 'next/link'

interface Installation {
  id: string
  projectId: string
  projectName: string
  customerName: string
  location: string
  status: 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'DELAYED' | 'CANCELLED'
  scheduledDate: string
  startDate?: string
  completionDate?: string
  teamLeader?: string
  teamSize?: number
  progress: number
}

// TODO: Replace with actual data from API
const mockInstallations: Installation[] = []

export default function InstallationsPage() {
  const [installations, setInstallations] = useState<Installation[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // TODO: Fetch actual installation data from API
    const fetchInstallations = async () => {
      try {
        // const response = await fetch('/api/installations')
        // const data = await response.json()
        // setInstallations(data)
        setInstallations([]) // For now, no mock data
      } catch (error) {
        console.error('Error fetching installations:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchInstallations()
  }, [])

  const getStatusBadge = (status: Installation['status']) => {
    const statusConfig = {
      SCHEDULED: { label: 'Planlandı', color: 'bg-blue-100 text-blue-800' },
      IN_PROGRESS: { label: 'Devam Ediyor', color: 'bg-yellow-100 text-yellow-800' },
      COMPLETED: { label: 'Tamamlandı', color: 'bg-green-100 text-green-800' },
      DELAYED: { label: 'Gecikti', color: 'bg-red-100 text-red-800' },
      CANCELLED: { label: 'İptal Edildi', color: 'bg-gray-100 text-gray-800' }
    }
    const config = statusConfig[status]
    return <Badge className={config.color}>{config.label}</Badge>
  }

  const getStatusIcon = (status: Installation['status']) => {
    switch (status) {
      case 'SCHEDULED': return <Calendar className="w-4 h-4" />
      case 'IN_PROGRESS': return <Zap className="w-4 h-4" />
      case 'COMPLETED': return <CheckCircle className="w-4 h-4" />
      case 'DELAYED': return <AlertTriangle className="w-4 h-4" />
      default: return <Clock className="w-4 h-4" />
    }
  }

  const scheduledInstallations = installations.filter(i => i.status === 'SCHEDULED')
  const activeInstallations = installations.filter(i => i.status === 'IN_PROGRESS')
  const completedInstallations = installations.filter(i => i.status === 'COMPLETED')

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Kurulumlar</h1>
          <p className="text-muted-foreground">Güneş enerji sistemi kurulumlarını yönetin</p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Planlanan</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{scheduledInstallations.length}</div>
              <p className="text-xs text-muted-foreground">
                Kurulum bekleyen projeler
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Devam Eden</CardTitle>
              <Zap className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{activeInstallations.length}</div>
              <p className="text-xs text-muted-foreground">
                Şu anda kurulum yapılıyor
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Tamamlanan</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{completedInstallations.length}</div>
              <p className="text-xs text-muted-foreground">
                Bu ay tamamlanan kurulumlar
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Installation Tabs */}
        <Tabs defaultValue="scheduled" className="space-y-4">
          <TabsList>
            <TabsTrigger value="scheduled">
              Planlanan ({scheduledInstallations.length})
            </TabsTrigger>
            <TabsTrigger value="active">
              Devam Eden ({activeInstallations.length})
            </TabsTrigger>
            <TabsTrigger value="completed">
              Tamamlanan ({completedInstallations.length})
            </TabsTrigger>
            <TabsTrigger value="all">
              Tümü ({installations.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="scheduled">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">Planlanan Kurulumlar</h2>
                <Link href="/dashboard/installations/scheduled">
                  <Button variant="outline" size="sm">
                    Detaylı Görünüm <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </div>
              <div className="grid gap-4">
                {scheduledInstallations.map((installation) => (
                  <Card key={installation.id}>
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            {getStatusIcon(installation.status)}
                            <h3 className="font-semibold">{installation.projectName}</h3>
                            {getStatusBadge(installation.status)}
                          </div>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <User className="w-4 h-4" />
                              {installation.customerName}
                            </div>
                            <div className="flex items-center gap-1">
                              <MapPin className="w-4 h-4" />
                              {installation.location}
                            </div>
                            <div className="flex items-center gap-1">
                              <Calendar className="w-4 h-4" />
                              {new Date(installation.scheduledDate).toLocaleDateString('tr-TR')}
                            </div>
                          </div>
                          {installation.teamLeader && (
                            <div className="flex items-center gap-1 text-sm">
                              <Wrench className="w-4 h-4" />
                              Ekip Lideri: {installation.teamLeader} ({installation.teamSize} kişi)
                            </div>
                          )}
                        </div>
                        <Button size="sm">Başlat</Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="active">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">Devam Eden Kurulumlar</h2>
                <Link href="/dashboard/installations/active">
                  <Button variant="outline" size="sm">
                    Detaylı Görünüm <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </div>
              <div className="grid gap-4">
                {activeInstallations.map((installation) => (
                  <Card key={installation.id}>
                    <CardContent className="p-6">
                      <div className="space-y-4">
                        <div className="flex items-start justify-between">
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              {getStatusIcon(installation.status)}
                              <h3 className="font-semibold">{installation.projectName}</h3>
                              {getStatusBadge(installation.status)}
                            </div>
                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                              <div className="flex items-center gap-1">
                                <User className="w-4 h-4" />
                                {installation.customerName}
                              </div>
                              <div className="flex items-center gap-1">
                                <MapPin className="w-4 h-4" />
                                {installation.location}
                              </div>
                            </div>
                          </div>
                          <Button size="sm">Güncelle</Button>
                        </div>

                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-sm">
                            <span>İlerleme</span>
                            <span>{installation.progress}%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-blue-600 h-2 rounded-full"
                              style={{ width: `${installation.progress}%` }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="completed">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">Tamamlanan Kurulumlar</h2>
                <Link href="/dashboard/installations/completed">
                  <Button variant="outline" size="sm">
                    Detaylı Görünüm <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </div>
              <div className="grid gap-4">
                {completedInstallations.map((installation) => (
                  <Card key={installation.id}>
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            {getStatusIcon(installation.status)}
                            <h3 className="font-semibold">{installation.projectName}</h3>
                            {getStatusBadge(installation.status)}
                          </div>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <User className="w-4 h-4" />
                              {installation.customerName}
                            </div>
                            <div className="flex items-center gap-1">
                              <MapPin className="w-4 h-4" />
                              {installation.location}
                            </div>
                            {installation.completionDate && (
                              <div className="flex items-center gap-1">
                                <CheckCircle className="w-4 h-4" />
                                {new Date(installation.completionDate).toLocaleDateString('tr-TR')}
                              </div>
                            )}
                          </div>
                        </div>
                        <Button size="sm" variant="outline">Rapor Görüntüle</Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="all">
            <div className="space-y-4">
              <h2 className="text-xl font-semibold">Tüm Kurulumlar</h2>
              <div className="grid gap-4">
                {installations.map((installation) => (
                  <Card key={installation.id}>
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            {getStatusIcon(installation.status)}
                            <h3 className="font-semibold">{installation.projectName}</h3>
                            {getStatusBadge(installation.status)}
                          </div>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <User className="w-4 h-4" />
                              {installation.customerName}
                            </div>
                            <div className="flex items-center gap-1">
                              <MapPin className="w-4 h-4" />
                              {installation.location}
                            </div>
                            <div className="flex items-center gap-1">
                              <Calendar className="w-4 h-4" />
                              {new Date(installation.scheduledDate).toLocaleDateString('tr-TR')}
                            </div>
                          </div>
                        </div>
                        <Button size="sm">Detaylar</Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  )
}