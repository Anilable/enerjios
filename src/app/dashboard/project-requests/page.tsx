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
import { NewProjectRequestDialog } from '@/components/project-requests/new-project-request-dialog'
import { ProjectRequestDetails } from '@/components/project-requests/project-request-details'
import { ProjectRequestAPI } from '@/lib/api/project-requests'
import { 
  ProjectRequest, 
  ProjectRequestStatus, 
  KanbanColumn,
  ProjectRequestFilters as FilterType,
  PROJECT_REQUEST_STATUS_LABELS 
} from '@/types/project-request'
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
import { 
  Plus,
  Search,
  Filter,
  BarChart3,
  Clock,
  CheckCircle,
  AlertCircle,
  X,
  Loader2
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

  const handleCreateRequest = async (request: ProjectRequest) => {
    try {
      await ProjectRequestAPI.create(request)
      setNewRequestDialogOpen(false)
      await loadProjectRequests()
      toast({
        title: 'Başarılı',
        description: 'Yeni proje talebi oluşturuldu',
      })
    } catch (error) {
      console.error('Error creating request:', error)
      toast({
        title: 'Hata',
        description: 'Proje talebi oluşturulurken hata oluştu',
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

        {/* Kanban Board */}
        {!isLoading && !error && (
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
      </div>
    </DashboardLayout>
  )
}