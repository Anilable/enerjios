'use client'

import { ProjectRequest, ProjectRequestStatus, PROJECT_TYPE_LABELS, REQUEST_SOURCE_LABELS, REQUEST_SOURCE_COLORS, REQUEST_SOURCE_ICONS } from '@/types/project-request'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import {
  MapPin,
  Phone,
  Mail,
  Calendar,
  Zap,
  DollarSign,
  User,
  Camera,
  Clock,
  AlertTriangle,
  CheckCircle,
  MoreHorizontal,
  FileText,
  Trash2,
  Edit
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useRouter } from 'next/navigation'
import { formatCurrency } from '@/lib/utils'
import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { NotesIndicator } from './notes-indicator'
import { StatusUpdateDropdown } from './status-update-dropdown'

interface ProjectRequestCardProps {
  request: ProjectRequest
  onClick: () => void
  onDelete?: (id: string) => void
  onStatusUpdate?: (requestId: string, newStatus: ProjectRequestStatus) => Promise<void>
  isDragging?: boolean
  canDelete?: boolean
}

export function ProjectRequestCard({ request, onClick, onDelete, onStatusUpdate, isDragging = false, canDelete = false }: ProjectRequestCardProps) {
  const router = useRouter()
  const { data: session } = useSession()
  const [hasQuote, setHasQuote] = useState(false)
  const [quoteId, setQuoteId] = useState<string | null>(null)

  // Check if user can see financial information
  const canViewFinancials = session?.user?.role !== 'INSTALLATION_TEAM'

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging: sortableIsDragging,
    setActivatorNodeRef, // Separate ref for drag handle
  } = useSortable({ id: request.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging || sortableIsDragging ? 0.5 : 1,
  }

  // Check if a quote exists for this project request
  useEffect(() => {
    const checkForQuote = async () => {
      try {
        // Check for both drafts and real quotes
        const [draftsResponse, quotesResponse] = await Promise.all([
          fetch(`/api/quotes/drafts?projectRequestId=${request.id}`),
          fetch(`/api/quotes?projectRequestId=${request.id}`)
        ])

        let foundQuote = false
        let foundQuoteId = null

        // Check drafts first
        if (draftsResponse.ok) {
          const drafts = await draftsResponse.json()
          if (drafts && drafts.length > 0) {
            foundQuote = true
            foundQuoteId = drafts[0].id
          }
        }

        // If no drafts found, check real quotes
        if (!foundQuote && quotesResponse.ok) {
          const quotes = await quotesResponse.json()
          if (quotes && quotes.length > 0) {
            foundQuote = true
            foundQuoteId = quotes[0].id
          }
        }

        setHasQuote(foundQuote)
        setQuoteId(foundQuoteId)
      } catch (error) {
        console.error('Error checking for quote:', error)
      }
    }

    checkForQuote()
  }, [request.id])

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'HIGH': return 'bg-red-100 text-red-800 border-red-200'
      case 'MEDIUM': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'LOW': return 'bg-green-100 text-green-800 border-green-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'HIGH': return <AlertTriangle className="w-3 h-3" />
      case 'MEDIUM': return <Clock className="w-3 h-3" />
      case 'LOW': return <CheckCircle className="w-3 h-3" />
      default: return null
    }
  }

  const getPriorityLabel = (priority: string) => {
    switch (priority) {
      case 'HIGH': return 'Yüksek'
      case 'MEDIUM': return 'Orta'
      case 'LOW': return 'Düşük'
      default: return priority
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('tr-TR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase()
  }

  return (
    <Card 
      ref={setNodeRef}
      style={style}
      {...attributes}
      onClick={() => {
        // Only handle click if not dragging
        if (!sortableIsDragging) {
          console.log('Card clicked:', { id: request.id, customerName: request.customerName })
          onClick()
        }
      }}
      className={`project-card relative bg-white border cursor-pointer w-full transition-all duration-200 hover:shadow-md ${
        isDragging || sortableIsDragging ? 'rotate-2 shadow-lg z-50' : 'hover:border-primary/30'
      }`}
    >
      {/* Action Buttons - TOP RIGHT CORNER */}
      <div className="absolute top-2 right-2 z-20 flex items-center gap-1">
        {/* Delete Button */}
        {canDelete && onDelete && (
          <Button
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0 hover:bg-red-50 hover:text-red-600 transition-all border border-gray-200 bg-white shadow-sm"
            onClick={(e) => {
              e.stopPropagation()
              e.preventDefault()
              onDelete(request.id)
            }}
            title="Proje talebini sil"
          >
            <Trash2 className="w-3 h-3" />
          </Button>
        )}
        
        {/* Drag Handle */}
        <div 
          ref={setActivatorNodeRef}
          {...listeners}
          className="drag-handle p-1.5 rounded-md cursor-grab active:cursor-grabbing hover:bg-blue-50 hover:text-blue-600 transition-all border border-gray-200 bg-white shadow-sm"
          style={{ touchAction: 'none' }}
          title="🔄 Kartı sürüklemek için buraya tıklayın"
          onClick={(e) => {
            e.stopPropagation()
            e.preventDefault()
          }}
        >
          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
            <path d="M3,15H21V17H3V15M3,11H21V13H3V11M3,7H21V9H3V7Z" />
          </svg>
        </div>
      </div>
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-lg">{REQUEST_SOURCE_ICONS[request.source]}</span>
              <h3 className="font-semibold">{request.customerName}</h3>
              <Badge className={`text-xs ${REQUEST_SOURCE_COLORS[request.source].badge}`}>
                {REQUEST_SOURCE_LABELS[request.source]}
              </Badge>
            </div>
            <div className="flex items-center gap-1 text-sm text-muted-foreground mb-3">
              <MapPin className="w-4 h-4" />
              <span>{request.location}</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
              <div>
                <p className="text-sm font-medium">Kapasite</p>
                <p className="text-lg font-bold text-blue-600">{request.estimatedCapacity} kW</p>
              </div>
              {request.estimatedBudget && canViewFinancials && (
                <div>
                  <p className="text-sm font-medium">Bütçe</p>
                  <p className="text-lg font-bold text-green-600">{formatCurrency(request.estimatedBudget)}</p>
                </div>
              )}
              <div>
                <p className="text-sm font-medium">Proje Tipi</p>
                <p className="text-lg font-bold">{PROJECT_TYPE_LABELS[request.projectType]}</p>
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-xs font-medium text-muted-foreground">İletişim:</p>
              <div className="flex flex-wrap gap-1">
                <Badge variant="outline" className="text-xs flex items-center gap-1">
                  <Phone className="w-3 h-3" />
                  {request.customerPhone}
                </Badge>
                <Badge variant="outline" className="text-xs flex items-center gap-1">
                  <Mail className="w-3 h-3" />
                  {request.customerEmail}
                </Badge>
                {request.assignedEngineerName && (
                  <Badge variant="outline" className="text-xs flex items-center gap-1">
                    <User className="w-3 h-3" />
                    {request.assignedEngineerName}
                  </Badge>
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 ml-4">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm">
                  <MoreHorizontal className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                {request.status !== 'LOST' && request.status !== 'CONVERTED_TO_PROJECT' && canViewFinancials && (
                  <DropdownMenuItem onClick={(e) => {
                    e.stopPropagation()
                    if (hasQuote) {
                      router.push(`/dashboard/quotes/create/${request.id}`)
                    } else {
                      router.push(`/dashboard/quotes/create/${request.id}`)
                    }
                  }}>
                    {hasQuote ? <Edit className="w-4 h-4 mr-2" /> : <FileText className="w-4 h-4 mr-2" />}
                    {hasQuote ? 'Teklifi Düzenle' : 'Teklif Oluştur'}
                  </DropdownMenuItem>
                )}
                {hasQuote && canViewFinancials && (
                  <DropdownMenuItem onClick={async (e) => {
                    e.stopPropagation()
                    try {
                      const response = await fetch('/api/photo-request/simple', {
                        method: 'POST',
                        headers: {
                          'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                          projectRequestId: request.id,
                          requestType: 'SITE_PHOTOS',
                          notes: 'Müşteri teklif sonrası fotoğraf talebinde bulundu'
                        })
                      })
                      if (response.ok) {
                        const data = await response.json()
                        alert(`Fotoğraf talebi oluşturuldu! Upload linki: ${data.uploadUrl}`)
                      } else {
                        alert('Fotoğraf talebi oluşturulamadı!')
                      }
                    } catch (error) {
                      console.error('Error creating photo request:', error)
                      alert('Hata oluştu!')
                    }
                  }}>
                    <Camera className="w-4 h-4 mr-2" />
                    Fotoğraf Talep Et
                  </DropdownMenuItem>
                )}
                {canDelete && onDelete && (
                  <DropdownMenuItem
                    onClick={(e) => {
                      e.stopPropagation()
                      onDelete(request.id)
                    }}
                    className="text-red-600"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Sil
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Additional Info Section */}
        <div className="mt-3 pt-3 border-t">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Badge
                variant="outline"
                className={`text-xs flex items-center gap-1 ${getPriorityColor(request.priority)}`}
              >
                {getPriorityIcon(request.priority)}
                {getPriorityLabel(request.priority)}
              </Badge>
              {request.scheduledVisitDate && (
                <Badge variant="outline" className="text-xs flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  {formatDate(request.scheduledVisitDate)}
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-2">
              {request.hasPhotos && (
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Camera className="w-3 h-3" />
                </div>
              )}
              <NotesIndicator
                projectRequestId={request.id}
                customerName={request.customerName}
                compact={true}
                showCount={true}
              />
            </div>
          </div>

          {/* Description */}
          {request.description && (
            <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed mb-2">
              {request.description}
            </p>
          )}

          {/* Tags */}
          {request.tags && request.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-2">
              {request.tags.slice(0, 2).map((tag, index) => (
                <Badge
                  key={index}
                  variant="secondary"
                  className="text-xs px-2 py-0.5 bg-primary/5 text-primary"
                  title={tag}
                >
                  {tag}
                </Badge>
              ))}
              {request.tags.length > 2 && (
                <Badge variant="secondary" className="text-xs px-2 py-0.5">
                  +{request.tags.length - 2}
                </Badge>
              )}
            </div>
          )}

          {/* Footer with Status and Date */}
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <div className="flex items-center gap-2">
              {onStatusUpdate && (
                <StatusUpdateDropdown
                  request={request}
                  onStatusUpdate={onStatusUpdate}
                  variant="compact"
                  className="h-6"
                />
              )}
              <span className="font-mono" title={request.requestNumber || `PR-${new Date(request.createdAt).getFullYear()}-${request.id.slice(-3)}`}>
                {request.requestNumber || `PR-${new Date(request.createdAt).getFullYear()}-${request.id.slice(-3)}`}
              </span>
            </div>
            <span>{formatDate(request.createdAt)}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}