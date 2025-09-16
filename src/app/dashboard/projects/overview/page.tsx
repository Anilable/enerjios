'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Progress } from '@/components/ui/progress'
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell
} from 'recharts'
import {
  Search, Filter, Eye, Edit, MoreHorizontal, TrendingUp,
  Calendar, MapPin, User, Zap, Clock, AlertCircle,
  CheckCircle, XCircle, Pause, Play, DollarSign,
  FileText, Phone, Mail, Trash2
} from 'lucide-react'
import { toast } from 'sonner'

interface ProjectOverview {
  id: string
  title: string
  customer: {
    name: string
    email: string
    phone: string
    company?: string
  }
  status: 'DESIGN' | 'QUOTE_SENT' | 'APPROVED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED'
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'
  type: 'residential' | 'commercial' | 'agricultural'
  location: {
    address: string
    city?: string
    district?: string
  }
  technical: {
    systemSize: number
    panelCount: number
    annualProduction: number
    roofArea: number
  }
  financial: {
    estimatedCost: number
    quotedPrice?: number
    approvedBudget?: number
  }
  timeline: {
    createdAt: string
    designCompleted?: string
    quoteApproved?: string
    installationStarted?: string
    completedAt?: string
  }
  progress: number
  assignedTo?: string
  lastActivity: string
  activityCount: number
}

const PROJECT_STATUS_CONFIG = {
  DESIGN: { label: 'Tasarım', color: 'bg-blue-500', variant: 'default' as const },
  QUOTE_SENT: { label: 'Teklif Gönderildi', color: 'bg-yellow-500', variant: 'outline' as const },
  APPROVED: { label: 'Onaylandı', color: 'bg-green-500', variant: 'secondary' as const },
  IN_PROGRESS: { label: 'Kurulum Devam Ediyor', color: 'bg-purple-500', variant: 'default' as const },
  COMPLETED: { label: 'Tamamlandı', color: 'bg-green-600', variant: 'secondary' as const },
  CANCELLED: { label: 'İptal Edildi', color: 'bg-red-500', variant: 'destructive' as const }
}

const PRIORITY_CONFIG = {
  LOW: { label: 'Düşük', color: 'text-gray-500', icon: Clock },
  MEDIUM: { label: 'Orta', color: 'text-blue-500', icon: Clock },
  HIGH: { label: 'Yüksek', color: 'text-orange-500', icon: AlertCircle },
  URGENT: { label: 'Acil', color: 'text-red-500', icon: AlertCircle }
}

const PROJECT_TYPE_CONFIG = {
  residential: { label: 'Konut', icon: '🏠' },
  commercial: { label: 'Ticari', icon: '🏢' },
  agricultural: { label: 'Tarımsal', icon: '🚜' }
}

export default function ProjectOverviewPage() {
  const { data: session } = useSession()
  const [projects, setProjects] = useState<ProjectOverview[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [priorityFilter, setPriorityFilter] = useState<string>('all')
  const [typeFilter, setTypeFilter] = useState<string>('all')

  const handleDeleteProject = async (projectId: string, projectTitle: string) => {
    if (!confirm(`"${projectTitle}" projesini silmek istediğinizden emin misiniz?`)) {
      return
    }

    try {
      const response = await fetch(`/api/projects/${projectId}`, {
        method: 'DELETE'
      })

      const result = await response.json()

      if (result.success) {
        toast.success('Proje başarıyla silindi')
        // Refresh projects list
        setProjects(projects.filter(p => p.id !== projectId))
      } else {
        toast.error(result.error || 'Proje silinirken hata oluştu')
      }
    } catch (error) {
      console.error('Error deleting project:', error)
      toast.error('Proje silinirken hata oluştu')
    }
  }

  // Fetch projects from API
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        setLoading(true)
        const response = await fetch('/api/projects')
        const result = await response.json()

        if (result.success) {
          setProjects(result.data)
        } else {
          console.error('Failed to fetch projects:', result.error)
        }
      } catch (error) {
        console.error('Error fetching projects:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchProjects()
  }, [])

  // Filter projects
  const filteredProjects = projects.filter(project => {
    const matchesSearch = project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         project.customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         project.location.address.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = statusFilter === 'all' || project.status === statusFilter
    const matchesPriority = priorityFilter === 'all' || project.priority === priorityFilter
    const matchesType = typeFilter === 'all' || project.type === typeFilter

    return matchesSearch && matchesStatus && matchesPriority && matchesType
  })

  // Statistics
  const stats = {
    total: projects.length,
    active: projects.filter(p => ['APPROVED', 'IN_PROGRESS'].includes(p.status)).length,
    completed: projects.filter(p => p.status === 'COMPLETED').length,
    pending: projects.filter(p => ['DESIGN', 'QUOTE_SENT'].includes(p.status)).length,
    totalValue: projects.reduce((sum, p) => sum + (p.financial.quotedPrice || p.financial.estimatedCost), 0),
    totalCapacity: projects.reduce((sum, p) => sum + p.technical.systemSize, 0)
  }

  // Chart data
  const statusChartData = Object.entries(
    projects.reduce((acc, project) => {
      acc[project.status] = (acc[project.status] || 0) + 1
      return acc
    }, {} as Record<string, number>)
  ).map(([status, count]) => ({
    name: PROJECT_STATUS_CONFIG[status as keyof typeof PROJECT_STATUS_CONFIG]?.label || status,
    value: count,
    color: PROJECT_STATUS_CONFIG[status as keyof typeof PROJECT_STATUS_CONFIG]?.color || '#gray'
  }))

  const monthlyData = [
    { month: 'Oca', projects: 8, capacity: 120, value: 450000 },
    { month: 'Şub', projects: 12, capacity: 180, value: 650000 },
    { month: 'Mar', projects: 15, capacity: 220, value: 820000 },
    { month: 'Nis', projects: 18, capacity: 280, value: 1200000 },
    { month: 'May', projects: 22, capacity: 350, value: 1500000 },
    { month: 'Haz', projects: 25, capacity: 420, value: 1800000 }
  ]

  if (!session) {
    return <div>Loading...</div>
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Proje Genel Görünümü</h1>
            <p className="text-muted-foreground">
              Tüm projelerinizi takip edin ve yönetin
            </p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Toplam Proje</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
              <p className="text-xs text-muted-foreground">
                +{Math.round(stats.total * 0.15)} bu ay
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Aktif Proje</CardTitle>
              <Play className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.active}</div>
              <p className="text-xs text-muted-foreground">
                Devam eden projeler
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Tamamlanan</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.completed}</div>
              <p className="text-xs text-muted-foreground">
                Bu ay tamamlanan
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Bekleyen</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.pending}</div>
              <p className="text-xs text-muted-foreground">
                Onay bekleyen
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Toplam Değer</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ₺{Math.round(stats.totalValue / 1000)}K
              </div>
              <p className="text-xs text-muted-foreground">
                Portfolio değeri
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Toplam Kapasite</CardTitle>
              <Zap className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalCapacity}kW</div>
              <p className="text-xs text-muted-foreground">
                Kurulu güç
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
          <Card className="col-span-4">
            <CardHeader>
              <CardTitle>Aylık Proje Performansı</CardTitle>
            </CardHeader>
            <CardContent className="pl-2">
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <Tooltip formatter={(value, name) => [
                    name === 'projects' ? `${value} proje` : 
                    name === 'capacity' ? `${value} kW` :
                    `₺${Math.round(Number(value) / 1000)}K`
                  ]} />
                  <Bar yAxisId="left" dataKey="projects" fill="#3b82f6" name="Proje Sayısı" />
                  <Bar yAxisId="right" dataKey="capacity" fill="#10b981" name="Kapasite (kW)" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="col-span-3">
            <CardHeader>
              <CardTitle>Proje Durumu Dağılımı</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={statusChartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {statusChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={`hsl(${index * 137.5 % 360}, 70%, 50%)`} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [`${value} proje`]} />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Search */}
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex-1 max-w-sm">
            <Input
              placeholder="Proje, müşteri veya konum ara..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full"
            />
          </div>
          
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Durum" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tüm Durumlar</SelectItem>
              {Object.entries(PROJECT_STATUS_CONFIG).map(([key, config]) => (
                <SelectItem key={key} value={key}>
                  {config.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={priorityFilter} onValueChange={setPriorityFilter}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Öncelik" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tümü</SelectItem>
              {Object.entries(PRIORITY_CONFIG).map(([key, config]) => (
                <SelectItem key={key} value={key}>
                  {config.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Tür" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tümü</SelectItem>
              {Object.entries(PROJECT_TYPE_CONFIG).map(([key, config]) => (
                <SelectItem key={key} value={key}>
                  {config.icon} {config.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Projects Table */}
        <Card>
          <CardHeader>
            <CardTitle>Proje Listesi ({filteredProjects.length})</CardTitle>
            <CardDescription>
              Tüm projelerinizi detaylı olarak görüntüleyin
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Proje</TableHead>
                    <TableHead>Müşteri</TableHead>
                    <TableHead>Durum</TableHead>
                    <TableHead>Öncelik</TableHead>
                    <TableHead>Sistem</TableHead>
                    <TableHead>Değer</TableHead>
                    <TableHead>İlerleme</TableHead>
                    <TableHead>Son Aktivite</TableHead>
                    <TableHead className="text-right">İşlemler</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredProjects.map((project) => {
                    const statusConfig = PROJECT_STATUS_CONFIG[project.status]
                    const priorityConfig = PRIORITY_CONFIG[project.priority]
                    const typeConfig = PROJECT_TYPE_CONFIG[project.type]
                    const PriorityIcon = priorityConfig.icon

                    return (
                      <TableRow key={project.id}>
                        <TableCell className="font-medium">
                          <div>
                            <div className="font-semibold">{project.title}</div>
                            <div className="text-sm text-muted-foreground flex items-center gap-1">
                              {typeConfig.icon} {typeConfig.label}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">{project.customer.name}</div>
                            <div className="text-sm text-muted-foreground flex items-center gap-2">
                              <MapPin className="w-3 h-3" />
                              {project.location.city}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={statusConfig.variant}>
                            {statusConfig.label}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className={`flex items-center gap-1 ${priorityConfig.color}`}>
                            <PriorityIcon className="w-4 h-4" />
                            <span className="text-sm">{priorityConfig.label}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <div className="font-medium">{project.technical.systemSize} kW</div>
                            <div className="text-muted-foreground">
                              {project.technical.panelCount} panel
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="font-medium">
                            ₺{Math.round((project.financial.quotedPrice || project.financial.estimatedCost) / 1000)}K
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="w-16">
                            <Progress value={project.progress} className="h-2" />
                            <div className="text-xs text-center mt-1">
                              {project.progress}%
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {project.lastActivity}
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreHorizontal className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem>
                                <Eye className="w-4 h-4 mr-2" />
                                Görüntüle
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Edit className="w-4 h-4 mr-2" />
                                Düzenle
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Phone className="w-4 h-4 mr-2" />
                                Müşteriyi Ara
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Mail className="w-4 h-4 mr-2" />
                                Email Gönder
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                className="text-red-600 hover:text-red-700"
                                onClick={() => handleDeleteProject(project.id, project.title)}
                              >
                                <Trash2 className="w-4 h-4 mr-2" />
                                Sil
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}