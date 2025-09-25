'use client'

import { useState, useEffect } from 'react'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Progress } from '@/components/ui/progress'
import {
  Zap,
  Clock,
  MapPin,
  User,
  Wrench,
  Search,
  Eye,
  Pause,
  CheckCircle,
  Camera,
  Phone,
  AlertTriangle
} from 'lucide-react'

interface ActiveInstallation {
  id: string
  projectId: string
  projectName: string
  customerName: string
  customerPhone: string
  location: string
  teamLeader: string
  teamSize: number
  startDate: string
  estimatedCompletion: string
  progress: number
  currentPhase: string
  phases: InstallationPhase[]
  issues?: Issue[]
  lastUpdate: string
}

interface InstallationPhase {
  id: string
  name: string
  description: string
  completed: boolean
  startTime?: string
  endTime?: string
  progress: number
}

interface Issue {
  id: string
  type: 'DELAY' | 'TECHNICAL' | 'WEATHER' | 'MATERIAL'
  description: string
  severity: 'LOW' | 'MEDIUM' | 'HIGH'
  reportedAt: string
}

// TODO: Replace with actual data from API
const mockActiveInstallations: ActiveInstallation[] = []

export default function ActiveInstallationsPage() {
  const [installations, setInstallations] = useState<ActiveInstallation[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [filteredInstallations, setFilteredInstallations] = useState<ActiveInstallation[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // TODO: Fetch actual active installations from API
    const fetchActiveInstallations = async () => {
      try {
        // const response = await fetch('/api/installations/active')
        // const data = await response.json()
        // setInstallations(data)
        setInstallations([]) // For now, no mock data
      } catch (error) {
        console.error('Error fetching active installations:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchActiveInstallations()
  }, [])

  useEffect(() => {
    const filtered = installations.filter(installation =>
      installation.projectName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      installation.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      installation.location.toLowerCase().includes(searchTerm.toLowerCase())
    )
    setFilteredInstallations(filtered)
  }, [installations, searchTerm])

  const getIssueColor = (type: Issue['type'], severity: Issue['severity']) => {
    if (severity === 'HIGH') return 'bg-red-100 text-red-800'
    if (severity === 'MEDIUM') return 'bg-yellow-100 text-yellow-800'
    return 'bg-blue-100 text-blue-800'
  }

  const getIssueIcon = (type: Issue['type']) => {
    switch (type) {
      case 'WEATHER': return '🌧️'
      case 'TECHNICAL': return '⚙️'
      case 'MATERIAL': return '📦'
      case 'DELAY': return '⏰'
      default: return '❓'
    }
  }

  const handleCompleteInstallation = (installationId: string) => {
    // TODO: API call to complete installation
    console.log('Completing installation:', installationId)
  }

  const handlePauseInstallation = (installationId: string) => {
    // TODO: API call to pause installation
    console.log('Pausing installation:', installationId)
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Devam Eden Kurulumlar</h1>
          <p className="text-muted-foreground">
            Şu anda aktif olan kurulumlar ve ilerleme durumu
          </p>
        </div>

        {/* Search */}
        <Card>
          <CardContent className="p-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Proje adı, müşteri veya lokasyon ile ara..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>

        {/* Active Installations */}
        <div className="space-y-6">
          {filteredInstallations.map((installation) => (
            <Card key={installation.id} className="border-l-4 border-l-blue-500">
              <CardContent className="p-6">
                <div className="space-y-6">
                  {/* Header */}
                  <div className="flex items-start justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center gap-3">
                        <Zap className="w-5 h-5 text-blue-500" />
                        <h3 className="text-xl font-semibold">{installation.projectName}</h3>
                        <Badge className="bg-blue-100 text-blue-800">Devam Ediyor</Badge>
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
                          <p className="font-medium text-foreground">{installation.location}</p>
                        </div>

                        <div className="flex items-center gap-2">
                          <Wrench className="w-4 h-4" />
                          <div>
                            <p className="font-medium text-foreground">{installation.teamLeader}</p>
                            <p>{installation.teamSize} kişilik ekip</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4" />
                          <div>
                            <p className="font-medium text-foreground">
                              {new Date(installation.startDate).toLocaleDateString('tr-TR')}
                            </p>
                            <p className="text-xs">
                              Son güncelleme: {new Date(installation.lastUpdate).toLocaleTimeString('tr-TR', {
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button size="sm" variant="outline">
                        <Phone className="w-4 h-4 mr-2" />
                        Ara
                      </Button>
                      <Button size="sm" variant="outline">
                        <Camera className="w-4 h-4 mr-2" />
                        Fotoğraf
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => handlePauseInstallation(installation.id)}>
                        <Pause className="w-4 h-4 mr-2" />
                        Duraklat
                      </Button>
                      <Button size="sm" className="bg-green-600 hover:bg-green-700" onClick={() => handleCompleteInstallation(installation.id)}>
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Tamamla
                      </Button>
                    </div>
                  </div>

                  {/* Overall Progress */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium">Genel İlerleme</h4>
                      <span className="text-sm font-medium">{installation.progress}%</span>
                    </div>
                    <Progress value={installation.progress} className="h-3" />
                    <p className="text-sm text-muted-foreground">
                      Şu anki aşama: <span className="font-medium text-foreground">{installation.currentPhase}</span>
                    </p>
                  </div>

                  {/* Phases */}
                  <div className="space-y-3">
                    <h4 className="font-medium">Kurulum Aşamaları</h4>
                    <div className="space-y-3">
                      {installation.phases.map((phase, index) => (
                        <div key={phase.id} className="flex items-center gap-4 p-3 rounded-lg border">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                            phase.completed
                              ? 'bg-green-100 text-green-800'
                              : phase.progress > 0
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-gray-100 text-gray-600'
                          }`}>
                            {phase.completed ? <CheckCircle className="w-4 h-4" /> : index + 1}
                          </div>

                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-1">
                              <h5 className="font-medium">{phase.name}</h5>
                              {phase.progress > 0 && !phase.completed && (
                                <span className="text-sm text-muted-foreground">{phase.progress}%</span>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground">{phase.description}</p>
                            {phase.progress > 0 && !phase.completed && (
                              <Progress value={phase.progress} className="h-2 mt-2" />
                            )}
                            {phase.startTime && (
                              <p className="text-xs text-muted-foreground mt-1">
                                {phase.startTime} {phase.endTime ? `- ${phase.endTime}` : '(devam ediyor)'}
                              </p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Issues */}
                  {installation.issues && installation.issues.length > 0 && (
                    <div className="space-y-3">
                      <h4 className="font-medium flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4 text-amber-500" />
                        Dikkat Gereken Durumlar
                      </h4>
                      <div className="space-y-2">
                        {installation.issues.map((issue) => (
                          <div key={issue.id} className="p-3 rounded-lg border border-amber-200 bg-amber-50">
                            <div className="flex items-start gap-3">
                              <span className="text-lg">{getIssueIcon(issue.type)}</span>
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <Badge className={getIssueColor(issue.type, issue.severity)}>
                                    {issue.severity}
                                  </Badge>
                                  <span className="text-sm text-muted-foreground">
                                    {new Date(issue.reportedAt).toLocaleTimeString('tr-TR', {
                                      hour: '2-digit',
                                      minute: '2-digit'
                                    })}
                                  </span>
                                </div>
                                <p className="text-sm">{issue.description}</p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
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
              <Zap className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">Aktif kurulum bulunamadı</h3>
              <p className="text-muted-foreground">
                {searchTerm ? 'Arama kriterlerinize uygun' : 'Şu anda devam eden'} kurulum bulunmuyor.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  )
}