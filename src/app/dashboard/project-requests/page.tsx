'use client'

import { useState, useCallback, useEffect } from 'react'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { ProjectRequestCard } from '@/components/project-requests/project-request-card'
import { DroppableColumn } from '@/components/project-requests/droppable-column'
import { ProjectRequestFilters } from '@/components/project-requests/project-request-filters'
import { EnhancedProjectRequestDialog as NewProjectRequestDialog } from '@/components/project-requests/enhanced-project-request-dialog'
import { ProjectRequestDetails } from '@/components/project-requests/project-request-details'
import { CalendarView } from '@/components/project-requests/calendar-view'
import { ProjectRequestAPI } from '@/lib/api/project-requests'
import { 
  ProjectRequest, 
  ProjectRequestStatus, 
  KanbanColumn,
  ProjectRequestFilters as FilterType,
  PROJECT_REQUEST_STATUS_LABELS 
} from '@/types/project-request'

export type ViewType = 'list' | 'card' | 'kanban' | 'calendar'

type SortField = 'requestNumber' | 'customerName' | 'createdAt' | 'priority' | 'estimatedCapacity' | 'status'
type SortDirection = 'asc' | 'desc'
import { 
  DndContext, 
  DragEndEvent, 
  DragOverlay, 
  DragStartEvent,
  closestCenter,
  closestCorners,
  pointerWithin,
  rectIntersection,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { 
  Plus,
  Search,
  Filter,
  BarChart3,
  Clock,
  CheckCircle,
  AlertCircle,
  X,
  Loader2,
  LayoutGrid,
  List,
  Columns3,
  Calendar,
  ArrowUpDown,
  MapPin,
  Trash2
} from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { useSession } from 'next-auth/react'

const initialColumns: KanbanColumn[] = [
  {
    id: 'OPEN',
    title: 'Açık',
    color: 'bg-blue-500',
    requests: [],
    count: 0
  },
  {
    id: 'CONTACTED',
    title: 'İletişime Geçildi',
    color: 'bg-purple-500',
    requests: [],
    count: 0
  },
  {
    id: 'ASSIGNED',
    title: 'Atama Yapıldı',
    color: 'bg-orange-500',
    requests: [],
    count: 0
  },
  {
    id: 'SITE_VISIT',
    title: 'Saha Ziyareti',
    color: 'bg-yellow-500',
    requests: [],
    count: 0
  },
  {
    id: 'CONVERTED_TO_PROJECT',
    title: 'Projeye Dönüştürüldü',
    color: 'bg-green-500',
    requests: [],
    count: 0
  },
  {
    id: 'LOST',
    title: 'Kaybedildi',
    color: 'bg-red-500',
    requests: [],
    count: 0
  }
]

export default function ProjectRequestsPage() {
  const [columns, setColumns] = useState<KanbanColumn[]>(initialColumns)
  const [searchQuery, setSearchQuery] = useState('')
  const [showFilters, setShowFilters] = useState(false)
  const [currentView, setCurrentView] = useState<ViewType>('list')
  const [sortField, setSortField] = useState<SortField>('createdAt')
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc')
  const [filters, setFilters] = useState<FilterType>({
    search: '',
    projectType: undefined,
    priority: undefined,
    assignedEngineerId: undefined,
    source: undefined,
    dateRange: undefined
  })
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [newRequestDialogOpen, setNewRequestDialogOpen] = useState(false)
  const [selectedRequest, setSelectedRequest] = useState<ProjectRequest | null>(null)
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false)
  const [activeCard, setActiveCard] = useState<ProjectRequest | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [requestToDelete, setRequestToDelete] = useState<ProjectRequest | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const { toast } = useToast()
  const { data: session, status: sessionStatus } = useSession()

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor)
  )

  // Load project requests from API
  const loadProjectRequests = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)

      const searchFilters = {
        ...filters,
        search: searchQuery
      }

      const requests = await ProjectRequestAPI.getAll(searchFilters)
      
      // Group requests by status
      const newColumns = initialColumns.map(column => {
        const statusRequests = requests.filter(request => request.status === column.id)
        return {
          ...column,
          requests: statusRequests,
          count: statusRequests.length
        }
      })

      setColumns(newColumns)
    } catch (error) {
      console.error('Error loading project requests:', error)
      setError('Proje talepleri yüklenirken hata oluştu')
      toast({
        title: 'Hata',
        description: 'Proje talepleri yüklenirken hata oluştu',
        variant: 'destructive'
      })
    } finally {
      setIsLoading(false)
    }
  }, [filters, searchQuery, toast])

  // Load data on mount and when filters change
  useEffect(() => {
    loadProjectRequests()
  }, [loadProjectRequests])

  // Load view preference from localStorage
  useEffect(() => {
    const savedView = localStorage.getItem('projectRequestsView') as ViewType
    const savedSortField = localStorage.getItem('projectRequestsSortField') as SortField
    const savedSortDirection = localStorage.getItem('projectRequestsSortDirection') as SortDirection

    if (savedView && ['list', 'card', 'kanban'].includes(savedView)) {
      setCurrentView(savedView)
    } else {
      // If no saved preference, default to 'list'
      setCurrentView('list')
    }
    if (savedSortField) {
      setSortField(savedSortField)
    }
    if (savedSortDirection && ['asc', 'desc'].includes(savedSortDirection)) {
      setSortDirection(savedSortDirection)
    }
  }, [])

  // Save view preference to localStorage
  useEffect(() => {
    localStorage.setItem('projectRequestsView', currentView)
    localStorage.setItem('projectRequestsSortField', sortField)
    localStorage.setItem('projectRequestsSortDirection', sortDirection)
  }, [currentView, sortField, sortDirection])

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event
    const activeRequest = columns
      .flatMap(col => col.requests)
      .find(request => request.id === active.id)
    setActiveCard(activeRequest || null)
  }

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event
    setActiveCard(null)

    console.log('=== DRAG END EVENT ===')
    console.log('Active:', { id: active.id, data: active.data })
    console.log('Over:', { id: over?.id, data: over?.data })
    console.log('All column IDs:', columns.map(col => ({ id: col.id, title: col.title, requestCount: col.requests.length })))

    if (!over) {
      console.log('❌ No drop target found - drag was cancelled')
      return
    }

    const activeId = active.id as string
    const overId = over.id as string

    console.log('🎯 Processing drag:', { activeId, overId })

    // Find source and destination columns
    const sourceColumn = columns.find(col => 
      col.requests.some(request => request.id === activeId)
    )
    const destColumn = columns.find(col => col.id === overId)

    console.log('📍 Column mapping result:', { 
      sourceColumn: sourceColumn?.id, 
      destColumn: destColumn?.id,
      availableColumnIds: columns.map(c => c.id)
    })

    // Additional debugging for column matching
    if (!destColumn) {
      console.error('🚨 DESTINATION COLUMN NOT FOUND!')
      console.log('Trying to match overId:', overId)
      console.log('Available column IDs:', columns.map(col => ({ id: col.id, type: typeof col.id })))
      console.log('overId type:', typeof overId)
      
      // Try to find column with string matching
      const stringMatchColumn = columns.find(col => String(col.id) === String(overId))
      console.log('String match result:', stringMatchColumn?.id)
    }

    if (!sourceColumn || !destColumn) {
      console.error('Source or destination column not found:', { sourceColumn, destColumn })
      toast({
        title: 'Hata',
        description: 'Geçersiz sürükleme hedefi',
        variant: 'destructive'
      })
      return
    }

    if (sourceColumn.id === destColumn.id) {
      console.log('Same column, no action needed')
      return
    }

    const activeRequest = sourceColumn.requests.find(request => request.id === activeId)
    if (!activeRequest) {
      console.error('Active request not found')
      return
    }

    console.log('Updating status for request:', activeRequest.id, 'to status:', destColumn.id)
    
    // Debug session status
    console.log('🔐 Session status:', {
      sessionStatus,
      hasSession: !!session,
      userId: session?.user?.id,
      userRole: session?.user?.role,
      userEmail: session?.user?.email
    })

    try {
      // Optimistic update
      const newColumns = columns.map(column => {
        if (column.id === sourceColumn.id) {
          return {
            ...column,
            requests: column.requests.filter(request => request.id !== activeId),
            count: column.count - 1
          }
        } else if (column.id === destColumn.id) {
          return {
            ...column,
            requests: [...column.requests, { ...activeRequest, status: destColumn.id as any }],
            count: column.count + 1
          }
        }
        return column
      })
      setColumns(newColumns)

      // Update status via API
      console.log('Making API call to update status...', {
        requestId: activeId,
        newStatus: destColumn.id,
        statusLabel: PROJECT_REQUEST_STATUS_LABELS[destColumn.id]
      })
      
      const updatedRequest = await ProjectRequestAPI.updateStatus(
        activeId, 
        destColumn.id as any, 
        `Durum ${PROJECT_REQUEST_STATUS_LABELS[destColumn.id]} olarak güncellendi`
      )

      console.log('API call successful:', { 
        updatedId: updatedRequest.id, 
        newStatus: updatedRequest.status,
        message: 'Status update completed successfully'
      })

      toast({
        title: 'Başarılı',
        description: `Talep durumu ${PROJECT_REQUEST_STATUS_LABELS[destColumn.id]} olarak güncellendi`,
      })
    } catch (error) {
      console.error('🚨 Error updating status:', error)
      
      // More specific error handling
      let errorMessage = 'Durum güncellenirken hata oluştu'
      
      if (error instanceof Error) {
        console.error('🚨 Error details:', {
          message: error.message,
          stack: error.stack,
          name: error.name
        })
        
        if (error.message.includes('401') || error.message.includes('Unauthorized')) {
          errorMessage = '❌ Oturum süresi dolmuş. Lütfen tekrar giriş yapın'
          console.error('🚨 AUTHENTICATION ERROR: User not logged in or session expired')
        } else if (error.message.includes('403') || error.message.includes('Forbidden')) {
          errorMessage = '❌ Bu işlem için yetkiniz yok'
          console.error('🚨 PERMISSION ERROR: User role insufficient')
        } else if (error.message.includes('404') || error.message.includes('Not Found')) {
          errorMessage = '❌ Talep bulunamadı'
          console.error('🚨 NOT FOUND ERROR: Project request not found')
        } else if (error.message.includes('Failed to fetch')) {
          errorMessage = '❌ Bağlantı hatası. İnternet bağlantınızı kontrol edin'
          console.error('🚨 NETWORK ERROR: Failed to reach server')
        } else {
          console.error('🚨 UNKNOWN ERROR:', error.message)
        }
      }
      
      // Revert optimistic update
      console.log('Reverting optimistic update...')
      loadProjectRequests()
      
      toast({
        title: 'Hata',
        description: errorMessage,
        variant: 'destructive'
      })
    }
  }

  const handleFilterChange = useCallback((newFilters: FilterType) => {
    setFilters(newFilters)
  }, [])

  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query)
  }, [])

  // Helper functions for views
  const getAllRequests = (): ProjectRequest[] => {
    return columns.flatMap(col => col.requests)
  }

  const getSortedRequests = (requests: ProjectRequest[]): ProjectRequest[] => {
    return [...requests].sort((a, b) => {
      let aValue: any, bValue: any
      
      switch (sortField) {
        case 'requestNumber':
          aValue = a.requestNumber
          bValue = b.requestNumber
          break
        case 'customerName':
          aValue = a.customerName.toLowerCase()
          bValue = b.customerName.toLowerCase()
          break
        case 'createdAt':
          aValue = new Date(a.createdAt)
          bValue = new Date(b.createdAt)
          break
        case 'priority':
          const priorityOrder = { HIGH: 3, MEDIUM: 2, LOW: 1 }
          aValue = priorityOrder[a.priority as keyof typeof priorityOrder]
          bValue = priorityOrder[b.priority as keyof typeof priorityOrder]
          break
        case 'estimatedCapacity':
          aValue = a.estimatedCapacity
          bValue = b.estimatedCapacity
          break
        case 'status':
          aValue = a.status
          bValue = b.status
          break
        default:
          return 0
      }

      if (sortDirection === 'asc') {
        return aValue > bValue ? 1 : aValue < bValue ? -1 : 0
      } else {
        return aValue < bValue ? 1 : aValue > bValue ? -1 : 0
      }
    })
  }

  const getGoogleMapsStaticImage = (address: string) => {
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
    if (!apiKey) return null
    
    const encodedAddress = encodeURIComponent(address)
    return `https://maps.googleapis.com/maps/api/staticmap?center=${encodedAddress}&zoom=15&size=300x200&maptype=satellite&markers=color:red%7C${encodedAddress}&key=${apiKey}`
  }

  const handleCreateRequest = async (request: any) => {
    try {
      console.log('🚀 Starting to create project request:', request)
      const createdRequest = await ProjectRequestAPI.create(request)
      console.log('✅ Project request created successfully:', createdRequest)

      setNewRequestDialogOpen(false)
      await loadProjectRequests()

      toast({
        title: 'Başarılı',
        description: `Yeni proje talebi oluşturuldu: ${createdRequest.requestNumber || createdRequest.id}`,
      })
    } catch (error) {
      console.error('❌ Error creating request:', error)

      let errorMessage = 'Proje talebi oluşturulurken hata oluştu'

      if (error instanceof Error) {
        console.error('Error details:', {
          message: error.message,
          stack: error.stack,
          name: error.name
        })

        if (error.message.includes('401') || error.message.includes('Unauthorized')) {
          errorMessage = 'Oturum süresi dolmuş. Lütfen tekrar giriş yapın'
        } else if (error.message.includes('403') || error.message.includes('Forbidden')) {
          errorMessage = 'Bu işlem için yetkiniz yok'
        } else if (error.message.includes('400') || error.message.includes('Bad Request')) {
          errorMessage = 'Form bilgileri eksik veya hatalı'
        } else if (error.message.includes('Failed to fetch')) {
          errorMessage = 'Bağlantı hatası. İnternet bağlantınızı kontrol edin'
        }
      }

      toast({
        title: 'Hata',
        description: errorMessage,
        variant: 'destructive'
      })
    }
  }

  const handleUpdateRequestStatus = async (requestId: string, newStatus: ProjectRequestStatus) => {
    try {
      await ProjectRequestAPI.updateStatus(requestId, newStatus)
      await loadProjectRequests()
    } catch (error) {
      console.error('Error updating request status:', error)
      toast({
        title: 'Hata',
        description: 'Durum güncellenirken hata oluştu',
        variant: 'destructive'
      })
    }
  }

  const handleAddNote = async (requestId: string, note: string) => {
    try {
      await ProjectRequestAPI.addNote(requestId, note)
      // Update selected request if it's currently open
      if (selectedRequest && selectedRequest.id === requestId) {
        const updatedRequest = await ProjectRequestAPI.getById(requestId)
        setSelectedRequest(updatedRequest)
      }
      await loadProjectRequests()
    } catch (error) {
      console.error('Error adding note:', error)
      toast({
        title: 'Hata',
        description: 'Not eklenirken hata oluştu',
        variant: 'destructive'
      })
    }
  }

  // Check if user can delete requests (only ADMIN role)
  const canDeleteRequests = session?.user?.role === 'ADMIN'

  // Handle delete request
  const handleDeleteRequest = (requestId: string) => {
    const request = columns
      .flatMap(col => col.requests)
      .find(req => req.id === requestId)
    
    if (request) {
      setRequestToDelete(request)
      setDeleteDialogOpen(true)
    }
  }

  // Confirm delete request
  const confirmDeleteRequest = async () => {
    if (!requestToDelete) return

    try {
      setIsDeleting(true)

      // Call API to delete request
      await ProjectRequestAPI.delete(requestToDelete.id)

      // Update local state by removing the request from columns
      setColumns(prevColumns => 
        prevColumns.map(column => ({
          ...column,
          requests: column.requests.filter(req => req.id !== requestToDelete.id),
          count: column.requests.filter(req => req.id !== requestToDelete.id).length
        }))
      )

      toast({
        title: 'Başarılı',
        description: `Proje talebi "${requestToDelete.requestNumber || requestToDelete.customerName}" silindi`,
      })

      // Close dialog and reset state
      setDeleteDialogOpen(false)
      setRequestToDelete(null)
    } catch (error) {
      console.error('Error deleting request:', error)
      
      let errorMessage = 'Proje talebi silinirken hata oluştu'
      
      if (error instanceof Error) {
        if (error.message.includes('401') || error.message.includes('Unauthorized')) {
          errorMessage = 'Oturum süresi dolmuş. Lütfen tekrar giriş yapın'
        } else if (error.message.includes('403') || error.message.includes('Forbidden')) {
          errorMessage = 'Bu işlem için yetkiniz yok'
        } else if (error.message.includes('404') || error.message.includes('Not Found')) {
          errorMessage = 'Talep bulunamadı'
        }
      }
      
      toast({
        title: 'Hata',
        description: errorMessage,
        variant: 'destructive'
      })
    } finally {
      setIsDeleting(false)
    }
  }

  const totalRequests = columns.reduce((sum, column) => sum + column.count, 0)
  const highPriorityCount = columns
    .flatMap(col => col.requests)
    .filter(request => request.priority === 'HIGH').length

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Proje Talepleri</h1>
            <p className="text-muted-foreground">
              Müşteri proje taleplerini takip edin ve yönetin
            </p>
          </div>
          <Button onClick={() => setNewRequestDialogOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Yeni Talep
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Toplam Talepler</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalRequests}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Yüksek Öncelikli</CardTitle>
              <AlertCircle className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{highPriorityCount}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Aktif Talepler</CardTitle>
              <Clock className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                {columns.slice(0, 4).reduce((sum, column) => sum + column.count, 0)}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Tamamlanan</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {columns.find(col => col.id === 'CONVERTED_TO_PROJECT')?.count || 0}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filters */}
        <div className="flex items-center gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Müşteri, e-posta veya lokasyon ara..."
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          <Button 
            variant="outline" 
            onClick={() => setShowFilters(!showFilters)}
            className={showFilters ? 'bg-primary/10' : ''}
          >
            <Filter className="w-4 h-4 mr-2" />
            Filtreler
          </Button>
        </div>

        {/* View Toggle */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center bg-muted p-1 rounded-lg">
            <Button
              variant={currentView === 'list' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setCurrentView('list')}
              className="px-2 sm:px-3 py-1 text-xs"
            >
              <List className="w-4 h-4 mr-1" />
              <span className="hidden sm:inline">Liste</span>
            </Button>
            <Button
              variant={currentView === 'card' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setCurrentView('card')}
              className="px-2 sm:px-3 py-1 text-xs"
            >
              <LayoutGrid className="w-4 h-4 mr-1" />
              <span className="hidden sm:inline">Kart</span>
            </Button>
            <Button
              variant={currentView === 'kanban' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setCurrentView('kanban')}
              className="px-2 sm:px-3 py-1 text-xs"
            >
              <Columns3 className="w-4 h-4 mr-1" />
              <span className="hidden sm:inline">Kanban</span>
            </Button>
            <Button
              variant={currentView === 'calendar' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setCurrentView('calendar')}
              className="px-2 sm:px-3 py-1 text-xs"
            >
              <Calendar className="w-4 h-4 mr-1" />
              <span className="hidden sm:inline">Talep İzleme</span>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => window.location.href = '/dashboard/projects/overview'}
              className="px-2 sm:px-3 py-1 text-xs border-l ml-2 pl-3"
            >
              <BarChart3 className="w-4 h-4 mr-1" />
              <span className="hidden sm:inline">Proje Genel Görünüm</span>
            </Button>
          </div>
          
          {/* Sort Options (for list and card views) */}
          {(currentView === 'list' || currentView === 'card') && (
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <select
                value={sortField}
                onChange={(e) => setSortField(e.target.value as SortField)}
                className="px-3 py-1 border rounded-md text-sm bg-background flex-1 sm:flex-none"
              >
                <option value="createdAt">Tarih</option>
                <option value="customerName">Müşteri</option>
                <option value="requestNumber">Talep No</option>
                <option value="priority">Öncelik</option>
                <option value="estimatedCapacity">Kapasite</option>
                <option value="status">Durum</option>
              </select>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')}
                className="flex-shrink-0"
              >
                <ArrowUpDown className="w-4 h-4 mr-1" />
                <span className="hidden sm:inline">{sortDirection === 'asc' ? 'A-Z' : 'Z-A'}</span>
              </Button>
            </div>
          )}
        </div>

        {/* Filters */}
        {showFilters && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Gelişmiş Filtreler</CardTitle>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => setShowFilters(false)}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <ProjectRequestFilters onFilterChange={handleFilterChange} />
            </CardContent>
          </Card>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
            <span className="ml-2 text-muted-foreground">Proje talepleri yükleniyor...</span>
          </div>
        )}

        {/* Error State */}
        {error && (
          <Card className="border-red-200 bg-red-50">
            <CardContent className="pt-6">
              <div className="flex items-center text-red-600">
                <AlertCircle className="w-5 h-5 mr-2" />
                <p>{error}</p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={loadProjectRequests}
                className="mt-3"
              >
                Tekrar Dene
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Main Content Area */}
        {!isLoading && !error && (
          <>
            {/* List View */}
            {currentView === 'list' && (
              <Card>
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[800px]">
                    <thead className="bg-muted/50">
                      <tr>
                        <th className="text-left p-2 sm:p-4 font-medium">Talep No</th>
                        <th className="text-left p-2 sm:p-4 font-medium">Müşteri</th>
                        <th className="text-left p-2 sm:p-4 font-medium hidden md:table-cell">E-posta</th>
                        <th className="text-left p-2 sm:p-4 font-medium hidden lg:table-cell">Lokasyon</th>
                        <th className="text-left p-2 sm:p-4 font-medium">Kapasite</th>
                        <th className="text-left p-2 sm:p-4 font-medium">Öncelik</th>
                        <th className="text-left p-2 sm:p-4 font-medium">Durum</th>
                        <th className="text-left p-2 sm:p-4 font-medium hidden sm:table-cell">Tarih</th>
                        {canDeleteRequests && (
                          <th className="text-left p-2 sm:p-4 font-medium w-12">İşlem</th>
                        )}
                      </tr>
                    </thead>
                    <tbody>
                      {getSortedRequests(getAllRequests()).map((request) => (
                        <tr 
                          key={request.id}
                          className="border-t hover:bg-muted/50 cursor-pointer"
                          onClick={() => {
                            setSelectedRequest(request)
                            setDetailsDialogOpen(true)
                          }}
                        >
                          <td className="p-2 sm:p-4 font-medium text-sm">{request.requestNumber}</td>
                          <td className="p-2 sm:p-4">
                            <div>
                              <div className="font-medium">{request.customerName}</div>
                              <div className="text-xs text-muted-foreground md:hidden">{request.customerEmail}</div>
                              <div className="text-xs text-muted-foreground lg:hidden">{request.location}</div>
                            </div>
                          </td>
                          <td className="p-2 sm:p-4 text-sm text-muted-foreground hidden md:table-cell">{request.customerEmail}</td>
                          <td className="p-2 sm:p-4 text-sm hidden lg:table-cell">{request.location}</td>
                          <td className="p-2 sm:p-4 text-sm font-medium">{request.estimatedCapacity} kW</td>
                          <td className="p-2 sm:p-4">
                            <Badge variant={
                              request.priority === 'HIGH' ? 'destructive' : 
                              request.priority === 'MEDIUM' ? 'default' : 
                              'secondary'
                            } className="text-xs">
                              {request.priority === 'HIGH' ? 'H' : 
                               request.priority === 'MEDIUM' ? 'M' : 'L'}
                            </Badge>
                          </td>
                          <td className="p-2 sm:p-4">
                            <Badge variant="outline" className="text-xs">
                              {PROJECT_REQUEST_STATUS_LABELS[request.status]}
                            </Badge>
                          </td>
                          <td className="p-2 sm:p-4 text-sm text-muted-foreground hidden sm:table-cell">
                            {new Date(request.createdAt).toLocaleDateString('tr-TR')}
                          </td>
                          {canDeleteRequests && (
                            <td className="p-2 sm:p-4">
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0 hover:bg-red-50 hover:text-red-600"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  handleDeleteRequest(request.id)
                                }}
                                title="Proje talebini sil"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </td>
                          )}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>
            )}

            {/* Card View */}
            {currentView === 'card' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4 sm:gap-6">
                {getSortedRequests(getAllRequests()).map((request) => (
                  <Card 
                    key={request.id}
                    className="cursor-pointer hover:shadow-lg transition-shadow relative"
                    onClick={() => {
                      setSelectedRequest(request)
                      setDetailsDialogOpen(true)
                    }}
                  >
                    {/* Delete button for card view */}
                    {canDeleteRequests && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="absolute top-2 right-2 h-6 w-6 p-0 hover:bg-red-50 hover:text-red-600 transition-all border border-gray-200 bg-white shadow-sm z-10"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleDeleteRequest(request.id)
                        }}
                        title="Proje talebini sil"
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    )}
                    
                    <CardHeader className={`pb-3 ${canDeleteRequests ? 'pr-12' : ''}`}>
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">{request.requestNumber}</CardTitle>
                        <Badge variant={
                          request.priority === 'HIGH' ? 'destructive' : 
                          request.priority === 'MEDIUM' ? 'default' : 
                          'secondary'
                        }>
                          {request.priority === 'HIGH' ? 'Yüksek' : 
                           request.priority === 'MEDIUM' ? 'Orta' : 'Düşük'}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      {/* Google Maps Static Image */}
                      {getGoogleMapsStaticImage(request.address || request.location) && (
                        <div className="mb-4 rounded-lg overflow-hidden">
                          <img
                            src={getGoogleMapsStaticImage(request.address || request.location)!}
                            alt={`Map of ${request.location}`}
                            className="w-full h-32 object-cover"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement
                              target.style.display = 'none'
                            }}
                          />
                        </div>
                      )}
                      
                      <div className="space-y-3">
                        <div>
                          <h3 className="font-semibold">{request.customerName}</h3>
                          <p className="text-sm text-muted-foreground">{request.customerEmail}</p>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-muted-foreground" />
                          <span className="text-sm">{request.location}</span>
                        </div>
                        
                        <div className="flex justify-between items-center">
                          <span className="text-sm">
                            <strong>{request.estimatedCapacity} kW</strong>
                          </span>
                          <Badge variant="outline">
                            {PROJECT_REQUEST_STATUS_LABELS[request.status]}
                          </Badge>
                        </div>
                        
                        <div className="text-xs text-muted-foreground">
                          {new Date(request.createdAt).toLocaleDateString('tr-TR')}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {/* Kanban View */}
            {currentView === 'kanban' && (
              <DndContext
                sensors={sensors}
                collisionDetection={pointerWithin}
                onDragStart={handleDragStart}
                onDragEnd={handleDragEnd}
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 lg:gap-6 min-h-[700px]">
                  {columns.map((column) => {
                    console.log('Rendering column:', { id: column.id, title: column.title, requestCount: column.requests.length })
                    return (
                      <DroppableColumn
                        key={column.id}
                        column={column}
                        onCardClick={(request) => {
                          console.log('Main kanban - card clicked:', request.id)
                          setSelectedRequest(request)
                          setDetailsDialogOpen(true)
                        }}
                        onDelete={handleDeleteRequest}
                        canDelete={canDeleteRequests}
                      />
                    )
                  })}
                </div>

                <DragOverlay>
                  {activeCard ? (
                    <ProjectRequestCard
                      request={activeCard}
                      onClick={() => {}}
                      isDragging={true}
                    />
                  ) : null}
                </DragOverlay>
              </DndContext>
            )}

            {/* Calendar View */}
            {currentView === 'calendar' && (
              <CalendarView
                requests={getAllRequests()}
                onViewRequest={(request) => {
                  setSelectedRequest(request)
                  setDetailsDialogOpen(true)
                }}
              />
            )}
          </>
        )}

        {/* Dialogs */}
        <NewProjectRequestDialog
          isOpen={newRequestDialogOpen}
          onClose={() => setNewRequestDialogOpen(false)}
          onSubmit={handleCreateRequest}
        />

        <ProjectRequestDetails
          request={selectedRequest}
          isOpen={detailsDialogOpen}
          onClose={() => {
            setDetailsDialogOpen(false)
            setSelectedRequest(null)
          }}
          onUpdateStatus={handleUpdateRequestStatus}
          onAddNote={handleAddNote}
        />

        {/* Delete Confirmation Dialog */}
        <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Proje Talebini Sil</DialogTitle>
              <DialogDescription>
                Bu proje talebini silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.
              </DialogDescription>
            </DialogHeader>
            
            {requestToDelete && (
              <div className="py-4">
                <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                  <p className="font-medium">
                    {requestToDelete.requestNumber || `PR-${new Date(requestToDelete.createdAt).getFullYear()}-${requestToDelete.id.slice(-3)}`}
                  </p>
                  <p className="text-sm text-muted-foreground">{requestToDelete.customerName}</p>
                  <p className="text-sm text-muted-foreground">{requestToDelete.customerEmail}</p>
                  <p className="text-sm text-muted-foreground">{requestToDelete.location}</p>
                  <Badge variant="outline" className="text-xs">
                    {PROJECT_REQUEST_STATUS_LABELS[requestToDelete.status]}
                  </Badge>
                </div>
              </div>
            )}

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setDeleteDialogOpen(false)
                  setRequestToDelete(null)
                }}
                disabled={isDeleting}
              >
                İptal
              </Button>
              <Button
                variant="destructive"
                onClick={confirmDeleteRequest}
                disabled={isDeleting}
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Siliniyor...
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4 mr-2" />
                    Sil
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  )
}