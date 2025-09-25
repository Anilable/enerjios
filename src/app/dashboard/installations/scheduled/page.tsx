'use client'

import { useState, useEffect } from 'react'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import {
  Calendar,
  Clock,
  MapPin,
  User,
  Wrench,
  Search,
  Eye,
  Play,
  Edit
} from 'lucide-react'

interface ScheduledInstallation {
  id: string
  projectId: string
  projectName: string
  customerName: string
  customerPhone: string
  location: string
  address: string
  scheduledDate: string
  scheduledTime: string
  estimatedDuration: number // hours
  teamLeader: string
  teamSize: number
  equipment: string[]
  notes?: string
  priority: 'HIGH' | 'MEDIUM' | 'LOW'
}

// TODO: Replace with actual data from API
const mockScheduledInstallations: ScheduledInstallation[] = []

export default function ScheduledInstallationsPage() {
  const [installations, setInstallations] = useState<ScheduledInstallation[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [filteredInstallations, setFilteredInstallations] = useState<ScheduledInstallation[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // TODO: Fetch actual scheduled installations from API
    const fetchScheduledInstallations = async () => {
      try {
        // const response = await fetch('/api/installations/scheduled')
        // const data = await response.json()
        // setInstallations(data)
        setInstallations([]) // For now, no mock data
      } catch (error) {
        console.error('Error fetching scheduled installations:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchScheduledInstallations()
  }, [])

  useEffect(() => {
    const filtered = installations.filter(installation =>
      installation.projectName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      installation.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      installation.location.toLowerCase().includes(searchTerm.toLowerCase())
    )
    setFilteredInstallations(filtered)
  }, [installations, searchTerm])

  const getPriorityBadge = (priority: ScheduledInstallation['priority']) => {
    const config = {
      HIGH: { label: 'Yüksek', color: 'bg-red-100 text-red-800' },
      MEDIUM: { label: 'Orta', color: 'bg-yellow-100 text-yellow-800' },
      LOW: { label: 'Düşük', color: 'bg-green-100 text-green-800' }
    }
    return <Badge className={config[priority].color}>{config[priority].label}</Badge>
  }

  const handleStartInstallation = (installationId: string) => {
    // TODO: API call to start installation
    console.log('Starting installation:', installationId)
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Planlanan Kurulumlar</h1>
          <p className="text-muted-foreground">
            Kurulum bekleyen projeler ve planlanan çalışmalar
          </p>
        </div>

        {/* Search and Filters */}
        <Card>
          <CardContent className="p-4">
            <div className="flex gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Proje adı, müşteri veya lokasyon ile ara..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Toplam</p>
                  <p className="text-2xl font-bold">{filteredInstallations.length}</p>
                </div>
                <Calendar className="w-8 h-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Bu Hafta</p>
                  <p className="text-2xl font-bold">
                    {filteredInstallations.filter(i => {
                      const installDate = new Date(i.scheduledDate)
                      const now = new Date()
                      const weekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)
                      return installDate >= now && installDate <= weekFromNow
                    }).length}
                  </p>
                </div>
                <Clock className="w-8 h-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Yüksek Öncelik</p>
                  <p className="text-2xl font-bold">
                    {filteredInstallations.filter(i => i.priority === 'HIGH').length}
                  </p>
                </div>
                <Wrench className="w-8 h-8 text-red-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Toplam Süre</p>
                  <p className="text-2xl font-bold">
                    {filteredInstallations.reduce((sum, i) => sum + i.estimatedDuration, 0)}h
                  </p>
                </div>
                <Clock className="w-8 h-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Installations List */}
        <div className="space-y-4">
          {filteredInstallations.map((installation) => (
            <Card key={installation.id}>
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="flex items-start justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center gap-3">
                        <h3 className="text-lg font-semibold">{installation.projectName}</h3>
                        {getPriorityBadge(installation.priority)}
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4" />
                          <div>
                            <p className="font-medium text-foreground">{installation.customerName}</p>
                            <p>{installation.customerPhone}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4" />
                          <div>
                            <p className="font-medium text-foreground">{installation.location}</p>
                            <p className="text-xs">{installation.address}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4" />
                          <div>
                            <p className="font-medium text-foreground">
                              {new Date(installation.scheduledDate).toLocaleDateString('tr-TR')}
                            </p>
                            <p>{installation.scheduledTime} ({installation.estimatedDuration} saat)</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <Wrench className="w-4 h-4" />
                          <div>
                            <p className="font-medium text-foreground">{installation.teamLeader}</p>
                            <p>{installation.teamSize} kişilik ekip</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button size="sm" variant="outline">
                        <Eye className="w-4 h-4 mr-2" />
                        Detay
                      </Button>
                      <Button size="sm" variant="outline">
                        <Edit className="w-4 h-4 mr-2" />
                        Düzenle
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => handleStartInstallation(installation.id)}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <Play className="w-4 h-4 mr-2" />
                        Başlat
                      </Button>
                    </div>
                  </div>

                  {/* Equipment List */}
                  <div className="border-t pt-4">
                    <p className="text-sm font-medium mb-2">Kullanılacak Ekipman:</p>
                    <div className="flex flex-wrap gap-2">
                      {installation.equipment.map((item, index) => (
                        <Badge key={index} variant="secondary">{item}</Badge>
                      ))}
                    </div>
                  </div>

                  {/* Notes */}
                  {installation.notes && (
                    <div className="border-t pt-4">
                      <p className="text-sm font-medium mb-1">Notlar:</p>
                      <p className="text-sm text-muted-foreground">{installation.notes}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredInstallations.length === 0 && (
          <Card>
            <CardContent className="p-8 text-center">
              <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">Planlanan kurulum bulunamadı</h3>
              <p className="text-muted-foreground">
                {searchTerm ? 'Arama kriterlerinize uygun' : 'Henüz planlanmış'} kurulum bulunmuyor.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  )
}