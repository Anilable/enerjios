'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter, useSearchParams } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Separator } from '@/components/ui/separator'
import { Avatar, AvatarFallback, AvatarInitials } from '@/components/ui/avatar'
import { ProjectOverviewTab } from '@/components/projects/tabs/project-overview-tab'
import { EnergyConsumptionTab } from '@/components/projects/tabs/energy-consumption-tab'
import { ProjectMaterialsTab } from '@/components/projects/tabs/project-materials-tab'
import { BatterySystemTab } from '@/components/projects/tabs/battery-system-tab'
import { CustomerInfoTab } from '@/components/projects/tabs/customer-info-tab'
import { ProjectDetailSkeleton } from '@/components/projects/project-detail-skeleton'
import {
  ArrowLeft, Settings, Share2, Download, MoreHorizontal,
  MapPin, Calendar, User, Zap, DollarSign, Activity,
  AlertTriangle, CheckCircle, Clock, Pause
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

interface ProjectDetail {
  id: string
  title: string
  code: string
  status: 'DESIGN' | 'QUOTE_SENT' | 'APPROVED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED'
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'
  type: 'residential' | 'commercial' | 'agricultural'
  customer: {
    id: string
    name: string
    email: string
    phone: string
    company?: string
    avatar?: string
  }
  location: {
    address: string
    city: string
    district: string
    coordinates: [number, number]
  }
  technical: {
    systemSize: number
    panelCount: number
    annualProduction: number
    roofArea: number
    inverterType: string
    batteryCapacity?: number
  }
  financial: {
    estimatedCost: number
    quotedPrice?: number
    approvedBudget?: number
    paidAmount?: number
  }
  timeline: {
    createdAt: string
    designCompleted?: string
    quoteApproved?: string
    installationStarted?: string
    completedAt?: string
  }
  progress: number
  assignedTo: {
    id: string
    name: string
    avatar?: string
  }
  team: Array<{
    id: string
    name: string
    role: string
    avatar?: string
  }>
  lastActivity: {
    action: string
    timestamp: string
    user: string
  }
  notes: string[]
  documents: Array<{
    id: string
    name: string
    type: string
    size: number
    uploadedAt: string
  }>
}

const PROJECT_STATUS_CONFIG = {
  DESIGN: { 
    label: 'Tasarım', 
    color: 'bg-blue-500', 
    variant: 'default' as const,
    icon: Settings,
    description: 'Proje tasarım aşamasında'
  },
  QUOTE_SENT: { 
    label: 'Teklif Gönderildi', 
    color: 'bg-yellow-500', 
    variant: 'warning' as const,
    icon: Clock,
    description: 'Müşteri onayı bekleniyor'
  },
  APPROVED: { 
    label: 'Onaylandı', 
    color: 'bg-green-500', 
    variant: 'success' as const,
    icon: CheckCircle,
    description: 'Kuruluma hazır'
  },
  IN_PROGRESS: { 
    label: 'Kurulum Devam Ediyor', 
    color: 'bg-purple-500', 
    variant: 'default' as const,
    icon: Activity,
    description: 'Aktif olarak kurulum yapılıyor'
  },
  COMPLETED: { 
    label: 'Tamamlandı', 
    color: 'bg-green-600', 
    variant: 'success' as const,
    icon: CheckCircle,
    description: 'Proje başarıyla tamamlandı'
  },
  CANCELLED: { 
    label: 'İptal Edildi', 
    color: 'bg-red-500', 
    variant: 'destructive' as const,
    icon: AlertTriangle,
    description: 'Proje iptal edildi'
  }
}

const PRIORITY_CONFIG = {
  LOW: { label: 'Düşük', color: 'text-gray-500' },
  MEDIUM: { label: 'Orta', color: 'text-blue-500' },
  HIGH: { label: 'Yüksek', color: 'text-orange-500' },
  URGENT: { label: 'Acil', color: 'text-red-500' }
}

const PROJECT_TYPE_CONFIG = {
  residential: { label: 'Konut', icon: '🏠' },
  commercial: { label: 'Ticari', icon: '🏢' },
  agricultural: { label: 'Tarımsal', icon: '🚜' }
}

export default function ProjectDetailPage() {
  const params = useParams()
  const router = useRouter()
  const searchParams = useSearchParams()
  const { data: session } = useSession()
  const [project, setProject] = useState<ProjectDetail | null>(null)
  const [loading, setLoading] = useState(true)
  
  // Tab state management with URL sync
  const [activeTab, setActiveTab] = useState(() => {
    return searchParams.get('tab') || 'overview'
  })

  const projectId = params.id as string

  // Handle tab changes with URL updates
  const handleTabChange = (tab: string) => {
    setActiveTab(tab)
    // Update URL without page reload
    const url = new URL(window.location.href)
    url.searchParams.set('tab', tab)
    window.history.replaceState(null, '', url.toString())
  }

  // Sync tab state with URL on mount
  useEffect(() => {
    const tab = searchParams.get('tab')
    if (tab && tab !== activeTab) {
      setActiveTab(tab)
    }
  }, [searchParams])

  // Mock project data - would come from API
  useEffect(() => {
    setTimeout(() => {
      setProject({
        id: projectId,
        title: 'GES Projesi - Mehmet Yılmaz',
        code: 'PRJ-1734524789123-ABC123',
        status: 'IN_PROGRESS',
        priority: 'HIGH',
        type: 'agricultural',
        customer: {
          id: 'cust-1',
          name: 'Mehmet Yılmaz',
          email: 'mehmet@example.com',
          phone: '+90 532 123 4567',
          company: 'Yılmaz Çiftliği'
        },
        location: {
          address: 'Keşan Yolu Üzeri, Keşan, Edirne',
          city: 'Edirne',
          district: 'Keşan',
          coordinates: [26.6387, 40.8536]
        },
        technical: {
          systemSize: 50,
          panelCount: 125,
          annualProduction: 85000,
          roofArea: 280,
          inverterType: 'SMA Sunny Tripower 25000TL',
          batteryCapacity: 100
        },
        financial: {
          estimatedCost: 175000,
          quotedPrice: 185000,
          approvedBudget: 185000,
          paidAmount: 92500
        },
        timeline: {
          createdAt: '2024-12-18',
          designCompleted: '2024-12-18',
          quoteApproved: '2024-12-19',
          installationStarted: '2024-12-20'
        },
        progress: 75,
        assignedTo: {
          id: 'emp-1',
          name: 'Ahmet Kaya'
        },
        team: [
          { id: 'emp-1', name: 'Ahmet Kaya', role: 'Proje Müdürü' },
          { id: 'emp-2', name: 'Mehmet Arslan', role: 'Elektrikçi' },
          { id: 'emp-3', name: 'Can Demir', role: 'Tekniker' }
        ],
        lastActivity: {
          action: 'Panel kurulumu %75 tamamlandı',
          timestamp: '2 saat önce',
          user: 'Mehmet Arslan'
        },
        notes: [
          'Müşteri ile koordinasyon sağlandı, kurulum için hazır',
          'Hava koşulları uygun, kuruluma devam edilebilir',
          'Panel teslimatı tamamlandı'
        ],
        documents: [
          { id: '1', name: 'Proje Tasarımı.pdf', type: 'PDF', size: 2048000, uploadedAt: '2024-12-18' },
          { id: '2', name: 'Elektrik Şeması.dwg', type: 'DWG', size: 5120000, uploadedAt: '2024-12-18' },
          { id: '3', name: 'Site Fotoğrafları.zip', type: 'ZIP', size: 15360000, uploadedAt: '2024-12-20' }
        ]
      })
      setLoading(false)
    }, 1000)
  }, [projectId])

  if (!session) {
    return <div>Loading...</div>
  }

  if (loading) {
    return (
      <DashboardLayout>
        <ProjectDetailSkeleton />
      </DashboardLayout>
    )
  }

  if (!project) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold text-gray-900">Proje bulunamadı</h2>
          <p className="text-gray-600 mt-2">Bu proje mevcut değil veya erişim izniniz yok.</p>
          <Button onClick={() => router.back()} className="mt-4">
            Geri Dön
          </Button>
        </div>
      </DashboardLayout>
    )
  }

  const statusConfig = PROJECT_STATUS_CONFIG[project.status]
  const priorityConfig = PRIORITY_CONFIG[project.priority]
  const typeConfig = PROJECT_TYPE_CONFIG[project.type]
  const StatusIcon = statusConfig.icon

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push('/dashboard/projects/overview')}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Proje Listesi
            </Button>
            
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <StatusIcon className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h1 className="text-2xl font-bold tracking-tight">{project.title}</h1>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span>#{project.code}</span>
                  <span>•</span>
                  <span className={priorityConfig.color}>{priorityConfig.label} Öncelik</span>
                  <span>•</span>
                  <span>{typeConfig.icon} {typeConfig.label}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Badge variant={statusConfig.variant} className="px-3 py-1">
              <StatusIcon className="w-3 h-3 mr-1" />
              {statusConfig.label}
            </Badge>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>
                  <Share2 className="h-4 w-4 mr-2" />
                  Paylaş
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Download className="h-4 w-4 mr-2" />
                  Rapor İndir
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <Settings className="h-4 w-4 mr-2" />
                  Proje Ayarları
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-6">
          <Card>
            <CardContent className="flex items-center p-4">
              <User className="h-8 w-8 text-blue-500 mr-3" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Müşteri</p>
                <p className="text-lg font-bold">{project.customer.name}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="flex items-center p-4">
              <MapPin className="h-8 w-8 text-green-500 mr-3" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Lokasyon</p>
                <p className="text-lg font-bold">{project.location.city}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="flex items-center p-4">
              <Zap className="h-8 w-8 text-yellow-500 mr-3" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Kapasite</p>
                <p className="text-lg font-bold">{project.technical.systemSize} kW</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="flex items-center p-4">
              <DollarSign className="h-8 w-8 text-purple-500 mr-3" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Bütçe</p>
                <p className="text-lg font-bold">₺{(project.financial.approvedBudget! / 1000).toFixed(0)}K</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="flex items-center p-4">
              <Activity className="h-8 w-8 text-orange-500 mr-3" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">İlerleme</p>
                <p className="text-lg font-bold">{project.progress}%</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="flex items-center p-4">
              <Calendar className="h-8 w-8 text-red-500 mr-3" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Başlangıç</p>
                <p className="text-lg font-bold">
                  {new Date(project.timeline.createdAt).toLocaleDateString('tr-TR', { 
                    day: 'numeric', 
                    month: 'short' 
                  })}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tab Navigation */}
        <Card>
          <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
            <CardHeader>
              <TabsList className="grid w-full grid-cols-5 h-auto p-1">
                <TabsTrigger value="overview" className="flex-col gap-1 py-3 text-xs">
                  <Activity className="w-4 h-4" />
                  <span className="hidden sm:inline">Genel Bakış</span>
                  <span className="sm:hidden">Genel</span>
                </TabsTrigger>
                <TabsTrigger value="energy" className="flex-col gap-1 py-3 text-xs">
                  <Zap className="w-4 h-4" />
                  <span className="hidden sm:inline">Enerji Tüketimi</span>
                  <span className="sm:hidden">Enerji</span>
                </TabsTrigger>
                <TabsTrigger value="materials" className="flex-col gap-1 py-3 text-xs">
                  <FileText className="w-4 h-4" />
                  <span className="hidden sm:inline">Proje Malzemeleri</span>
                  <span className="sm:hidden">Malzeme</span>
                </TabsTrigger>
                <TabsTrigger value="battery" className="flex-col gap-1 py-3 text-xs">
                  <Activity className="w-4 h-4" />
                  <span className="hidden sm:inline">Batarya Sistemi</span>
                  <span className="sm:hidden">Batarya</span>
                </TabsTrigger>
                <TabsTrigger value="customer" className="flex-col gap-1 py-3 text-xs">
                  <User className="w-4 h-4" />
                  <span className="hidden sm:inline">Müşteri Bilgileri</span>
                  <span className="sm:hidden">Müşteri</span>
                </TabsTrigger>
              </TabsList>
            </CardHeader>
            
            <CardContent>
              <TabsContent value="overview" className="space-y-6 mt-6">
                <ProjectOverviewTab project={project} />
              </TabsContent>
              
              <TabsContent value="energy" className="space-y-6 mt-6">
                <EnergyConsumptionTab project={project} />
              </TabsContent>
              
              <TabsContent value="materials" className="space-y-6 mt-6">
                <ProjectMaterialsTab project={project} />
              </TabsContent>
              
              <TabsContent value="battery" className="space-y-6 mt-6">
                <BatterySystemTab project={project} />
              </TabsContent>
              
              <TabsContent value="customer" className="space-y-6 mt-6">
                <CustomerInfoTab project={project} />
              </TabsContent>
            </CardContent>
          </Tabs>
        </Card>
      </div>
    </DashboardLayout>
  )
}