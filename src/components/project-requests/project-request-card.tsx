'use client'

import { ProjectRequest, PROJECT_TYPE_LABELS, REQUEST_SOURCE_LABELS, REQUEST_SOURCE_COLORS, REQUEST_SOURCE_ICONS } from '@/types/project-request'
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
      <CardHeader className="pb-3 pr-20">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center space-x-3 min-w-0 flex-1">
            <Avatar className="w-8 h-8 flex-shrink-0">
              <AvatarFallback className="text-xs font-medium bg-primary/10 text-primary">
                {getInitials(request.customerName)}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1 space-y-1">
              <h3 className="font-semibold text-sm leading-tight truncate" title={request.customerName}>
                {request.customerName}
              </h3>
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <MapPin className="w-3 h-3 flex-shrink-0" />
                <span className="truncate max-w-[120px]" title={request.location}>
                  {request.location}
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-1 flex-shrink-0">
            {request.status !== 'LOST' && request.status !== 'CONVERTED_TO_PROJECT' && canViewFinancials && (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 hover:bg-primary/10 hover:text-primary"
                  onClick={(e) => {
                    e.stopPropagation()
                    e.preventDefault()
                    if (hasQuote) {
                      console.log('Edit quote button clicked for:', request.id)
                      router.push(`/dashboard/quotes/create/${request.id}`)
                    } else {
                      console.log('Create quote button clicked for:', request.id)
                      router.push(`/dashboard/quotes/create/${request.id}`)
                    }
                  }}
                  title={hasQuote ? "Teklifi Düzenle" : "Teklif Oluştur"}
                >
                  {hasQuote ? <Edit className="h-4 w-4" /> : <FileText className="h-4 w-4" />}
                </Button>
                {hasQuote && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 hover:bg-orange-50 hover:text-orange-600"
                    onClick={async (e) => {
                      e.stopPropagation()
                      e.preventDefault()
                      console.log('Request photo button clicked for:', request.id)
                      // Create photo request for this project
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
                    }}
                    title="Fotoğraf Talep Et"
                  >
                    <Camera className="h-4 w-4" />
                  </Button>
                )}
              </>
            )}
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-7 w-7 p-0 hover:bg-gray-100"
              onClick={(e) => {
                e.stopPropagation()
                e.preventDefault()
                console.log('More actions clicked for:', request.id)
                // TODO: Hızlı işlemler menüsü açılacak
              }}
            >
              <MoreHorizontal className="h-3 w-3" />
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="project-card-content pt-0 space-y-3">
        {/* Project Type, Priority & Source */}
        <div className="flex items-center justify-between gap-1 mb-3 flex-wrap">
          <Badge variant="outline" className="text-xs truncate max-w-[90px] flex-shrink">
            {PROJECT_TYPE_LABELS[request.projectType]}
          </Badge>
          <div className="flex items-center gap-1 flex-shrink-0">
            <Badge
              variant="outline"
              className={`text-xs flex items-center gap-1 ${getPriorityColor(request.priority)}`}
            >
              {getPriorityIcon(request.priority)}
              <span className="hidden sm:inline">{getPriorityLabel(request.priority)}</span>
            </Badge>
            <Badge
              variant="outline"
              className={`text-xs flex items-center gap-1 ${REQUEST_SOURCE_COLORS[request.source].badge}`}
              title={`Kaynak: ${REQUEST_SOURCE_LABELS[request.source]}`}
            >
              <span className="text-xs">{REQUEST_SOURCE_ICONS[request.source]}</span>
              <span className="hidden lg:inline">{REQUEST_SOURCE_LABELS[request.source]}</span>
            </Badge>
          </div>
        </div>

        {/* Key Details */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-1 text-muted-foreground">
              <Zap className="w-3 h-3 flex-shrink-0" />
              <span className="text-xs">Kapasite:</span>
            </div>
            <span className="font-medium text-xs">{request.estimatedCapacity} kW</span>
          </div>

          {request.estimatedBudget && canViewFinancials && (
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-1 text-muted-foreground">
                <DollarSign className="w-3 h-3 flex-shrink-0" />
                <span className="text-xs">Bütçe:</span>
              </div>
              <span className="font-medium text-xs truncate max-w-[80px]" title={formatCurrency(request.estimatedBudget)}>
                {formatCurrency(request.estimatedBudget)}
              </span>
            </div>
          )}

          {request.assignedEngineerName && (
            <div className="flex items-center justify-between text-sm gap-2">
              <div className="flex items-center gap-1 text-muted-foreground flex-shrink-0">
                <User className="w-3 h-3" />
                <span className="text-xs">Atanan:</span>
              </div>
              <span className="font-medium text-xs truncate max-w-[90px]" title={request.assignedEngineerName}>
                {request.assignedEngineerName}
              </span>
            </div>
          )}

          {request.scheduledVisitDate && (
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-1 text-muted-foreground flex-shrink-0">
                <Calendar className="w-3 h-3" />
                <span className="text-xs">Ziyaret:</span>
              </div>
              <span className="font-medium text-xs truncate max-w-[85px]" title={formatDate(request.scheduledVisitDate)}>
                {formatDate(request.scheduledVisitDate)}
              </span>
            </div>
          )}
        </div>

        {/* Contact Info */}
        <div className="space-y-1 border-t pt-2">
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Phone className="w-3 h-3 flex-shrink-0" />
            <span className="truncate max-w-[140px]" title={request.customerPhone}>
              {request.customerPhone}
            </span>
          </div>
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Mail className="w-3 h-3 flex-shrink-0" />
            <span className="truncate max-w-[140px]" title={request.customerEmail}>
              {request.customerEmail}
            </span>
          </div>
        </div>

        {/* Description */}
        {request.description && (
          <div className="border-t pt-2">
            <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
              {request.description}
            </p>
          </div>
        )}

        {/* Status Update and Actions */}
        <div className="flex items-center justify-between gap-2 border-t pt-2">
          <div className="flex items-center gap-1">
            {onStatusUpdate && (
              <StatusUpdateDropdown
                request={request}
                onStatusUpdate={onStatusUpdate}
                variant="compact"
                className="h-6"
              />
            )}
          </div>

          <div className="flex items-center gap-2">
            {request.hasPhotos && (
              <div className="flex items-center gap-1 text-xs text-muted-foreground flex-shrink-0">
                <Camera className="w-3 h-3" />
                <span className="hidden sm:inline">Fotoğraf</span>
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

        {/* Tags */}
        {request.tags && request.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {request.tags.slice(0, 2).map((tag, index) => (
              <Badge
                key={index}
                variant="secondary"
                className="text-xs px-2 py-0.5 bg-primary/5 text-primary truncate max-w-[70px] h-5"
                title={tag}
              >
                {tag}
              </Badge>
            ))}
            {request.tags.length > 2 && (
              <Badge variant="secondary" className="text-xs px-2 py-0.5 flex-shrink-0 h-5">
                +{request.tags.length - 2}
              </Badge>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between text-xs text-muted-foreground border-t pt-2 gap-2 mt-auto">
          <span className="font-mono truncate max-w-[120px]" title={request.requestNumber || `PR-${new Date(request.createdAt).getFullYear()}-${request.id.slice(-3)}`}>
            {request.requestNumber || `PR-${new Date(request.createdAt).getFullYear()}-${request.id.slice(-3)}`}
          </span>
          <span className="flex-shrink-0 text-xs">{formatDate(request.createdAt)}</span>
        </div>
      </CardContent>
    </Card>
  )
}