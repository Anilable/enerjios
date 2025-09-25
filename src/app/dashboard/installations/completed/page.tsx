'use client'

import { useState, useEffect } from 'react'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  CheckCircle,
  Calendar,
  Clock,
  MapPin,
  User,
  Star,
  FileText,
  Download,
  Search,
  Eye,
  Award,
  Zap
} from 'lucide-react'

interface CompletedInstallation {
  id: string
  projectId: string
  projectName: string
  customerName: string
  customerPhone: string
  location: string
  teamLeader: string
  teamSize: number
  scheduledDate: string
  startDate: string
  completionDate: string
  duration: number // hours
  systemCapacity: number // kW
  panelCount: number
  customerRating?: number
  customerFeedback?: string
  finalReport?: string
  photos: string[]
  issues?: string[]
  warranty: {
    duration: number
    type: string
    startDate: string
  }
}

// TODO: Replace with actual data from API
const mockCompletedInstallations: CompletedInstallation[] = []

export default function CompletedInstallationsPage() {
  const [installations, setInstallations] = useState<CompletedInstallation[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [ratingFilter, setRatingFilter] = useState('all')
  const [filteredInstallations, setFilteredInstallations] = useState<CompletedInstallation[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // TODO: Fetch actual completed installations from API
    const fetchCompletedInstallations = async () => {
      try {
        // const response = await fetch('/api/installations/completed')
        // const data = await response.json()
        // setInstallations(data)
        setInstallations([]) // For now, no mock data
      } catch (error) {
        console.error('Error fetching completed installations:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchCompletedInstallations()
  }, [])

  useEffect(() => {
    let filtered = installations.filter(installation =>
      installation.projectName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      installation.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      installation.location.toLowerCase().includes(searchTerm.toLowerCase())
    )

    if (ratingFilter !== 'all') {
      const rating = parseInt(ratingFilter)
      filtered = filtered.filter(installation => installation.customerRating === rating)
    }

    setFilteredInstallations(filtered)
  }, [installations, searchTerm, ratingFilter])

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, index) => (
      <Star
        key={index}
        className={`w-4 h-4 ${
          index < rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
        }`}
      />
    ))
  }

  const calculateAverageRating = () => {
    const ratedInstallations = filteredInstallations.filter(i => i.customerRating)
    if (ratedInstallations.length === 0) return 0
    const total = ratedInstallations.reduce((sum, i) => sum + (i.customerRating || 0), 0)
    return total / ratedInstallations.length
  }

  const totalSystemCapacity = filteredInstallations.reduce((sum, i) => sum + i.systemCapacity, 0)
  const totalPanels = filteredInstallations.reduce((sum, i) => sum + i.panelCount, 0)
  const averageRating = calculateAverageRating()

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Tamamlanan Kurulumlar</h1>
          <p className="text-muted-foreground">
            Başarıyla tamamlanan kurulumlar ve müşteri geri bildirimları
          </p>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Toplam Kurulum</p>
                  <p className="text-2xl font-bold">{filteredInstallations.length}</p>
                </div>
                <CheckCircle className="w-8 h-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Toplam Kapasite</p>
                  <p className="text-2xl font-bold">{totalSystemCapacity}kW</p>
                </div>
                <Zap className="w-8 h-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Panel Sayısı</p>
                  <p className="text-2xl font-bold">{totalPanels}</p>
                </div>
                <Award className="w-8 h-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Ort. Değerlendirme</p>
                  <div className="flex items-center gap-2">
                    <p className="text-2xl font-bold">{averageRating.toFixed(1)}</p>
                    <div className="flex">
                      {renderStars(Math.round(averageRating))}
                    </div>
                  </div>
                </div>
                <Star className="w-8 h-8 text-yellow-500" />
              </div>
            </CardContent>
          </Card>
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
              <Select value={ratingFilter} onValueChange={setRatingFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Değerlendirme" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tüm Değerlendirmeler</SelectItem>
                  <SelectItem value="5">5 Yıldız</SelectItem>
                  <SelectItem value="4">4 Yıldız</SelectItem>
                  <SelectItem value="3">3 Yıldız</SelectItem>
                  <SelectItem value="2">2 Yıldız</SelectItem>
                  <SelectItem value="1">1 Yıldız</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Completed Installations */}
        <div className="space-y-4">
          {filteredInstallations.map((installation) => (
            <Card key={installation.id} className="border-l-4 border-l-green-500">
              <CardContent className="p-6">
                <div className="space-y-4">
                  {/* Header */}
                  <div className="flex items-start justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center gap-3">
                        <CheckCircle className="w-5 h-5 text-green-500" />
                        <h3 className="text-xl font-semibold">{installation.projectName}</h3>
                        <Badge className="bg-green-100 text-green-800">Tamamlandı</Badge>
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
                          <Calendar className="w-4 h-4" />
                          <div>
                            <p className="font-medium text-foreground">
                              {new Date(installation.completionDate).toLocaleDateString('tr-TR')}
                            </p>
                            <p>{installation.duration} saat sürdü</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <Zap className="w-4 h-4" />
                          <div>
                            <p className="font-medium text-foreground">{installation.systemCapacity}kW</p>
                            <p>{installation.panelCount} panel</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button size="sm" variant="outline">
                        <Eye className="w-4 h-4 mr-2" />
                        Detay
                      </Button>
                      {installation.finalReport && (
                        <Button size="sm" variant="outline">
                          <Download className="w-4 h-4 mr-2" />
                          Rapor
                        </Button>
                      )}
                    </div>
                  </div>

                  {/* System Details */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-gray-50 rounded-lg">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Ekip Lideri</p>
                      <p className="font-medium">{installation.teamLeader}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Ekip Boyutu</p>
                      <p className="font-medium">{installation.teamSize} kişi</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Garanti</p>
                      <p className="font-medium">{installation.warranty.duration} yıl</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Fotoğraf</p>
                      <p className="font-medium">{installation.photos.length} adet</p>
                    </div>
                  </div>

                  {/* Customer Rating & Feedback */}
                  {installation.customerRating && (
                    <div className="p-4 border rounded-lg bg-blue-50">
                      <div className="flex items-start gap-4">
                        <div className="flex items-center gap-2">
                          <div className="flex">
                            {renderStars(installation.customerRating)}
                          </div>
                          <span className="font-medium">{installation.customerRating}/5</span>
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-blue-900 mb-1">Müşteri Geri Bildirimi:</p>
                          <p className="text-sm text-blue-800">"{installation.customerFeedback}"</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Issues */}
                  {installation.issues && installation.issues.length > 0 && (
                    <div className="p-4 border rounded-lg bg-amber-50">
                      <p className="text-sm font-medium text-amber-900 mb-2">Çözülen Sorunlar:</p>
                      <ul className="text-sm text-amber-800 space-y-1">
                        {installation.issues.map((issue, index) => (
                          <li key={index} className="flex items-center gap-2">
                            <CheckCircle className="w-3 h-3 text-amber-600" />
                            {issue}
                          </li>
                        ))}
                      </ul>
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
              <CheckCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">Tamamlanan kurulum bulunamadı</h3>
              <p className="text-muted-foreground">
                {searchTerm || ratingFilter !== 'all'
                  ? 'Arama kriterlerinize uygun'
                  : 'Henüz tamamlanmış'
                } kurulum bulunmuyor.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  )
}