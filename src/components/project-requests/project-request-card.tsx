'use client'

import { ProjectRequest, PROJECT_TYPE_LABELS } from '@/types/project-request'
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
  FileText
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import { formatCurrency } from '@/lib/utils'

interface ProjectRequestCardProps {
  request: ProjectRequest
  onClick: () => void
  isDragging?: boolean
}

export function ProjectRequestCard({ request, onClick, isDragging = false }: ProjectRequestCardProps) {
  const router = useRouter()
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
      className={`project-card relative bg-white border cursor-pointer w-full ${
        isDragging || sortableIsDragging ? 'rotate-2 shadow-lg z-50' : ''
      }`}
    >
      {/* Drag Handle - TOP RIGHT CORNER - ONLY THIS HAS DRAG LISTENERS */}
      <div 
        ref={setActivatorNodeRef}
        {...listeners}
        className="drag-handle absolute top-2 right-2 p-1.5 rounded-md cursor-grab active:cursor-grabbing hover:bg-blue-50 hover:text-blue-600 transition-all border border-gray-200 bg-white shadow-sm"
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
      <CardHeader className="pb-3 pr-12">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center space-x-3 min-w-0 flex-1">
            <Avatar className="w-8 h-8 flex-shrink-0">
              <AvatarFallback className="text-xs font-medium bg-primary/10 text-primary">
                {getInitials(request.customerName)}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <h3 className="font-semibold text-sm truncate" title={request.customerName}>{request.customerName}</h3>
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <MapPin className="w-3 h-3 flex-shrink-0" />
                <span className="truncate" title={request.location}>{request.location}</span>
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-1 flex-shrink-0">
            {request.status !== 'LOST' && request.status !== 'CONVERTED_TO_PROJECT' && (
              <Button 
                variant="ghost" 
                size="sm" 
                className="w-8 h-8 p-0"
                onClick={(e) => {
                  e.stopPropagation()
                  e.preventDefault()
                  console.log('Quote button clicked for:', request.id)
                  router.push(`/dashboard/quotes/create/${request.id}`)
                }}
                title="Teklif Oluştur"
              >
                <FileText className="w-4 h-4 text-primary" />
              </Button>
            )}
            <Button 
              variant="ghost" 
              size="sm" 
              className="w-6 h-6 p-0"
              onClick={(e) => {
                e.stopPropagation()
                e.preventDefault()
                console.log('More actions clicked for:', request.id)
                // TODO: Hızlı işlemler menüsü açılacak
              }}
            >
              <MoreHorizontal className="w-3 h-3" />
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="project-card-content pt-0">
        {/* Project Type & Priority */}
        <div className="flex items-center justify-between gap-2">
          <Badge variant="outline" className="text-xs truncate max-w-[100px]">
            {PROJECT_TYPE_LABELS[request.projectType]}
          </Badge>
          <Badge 
            variant="outline" 
            className={`text-xs flex items-center gap-1 flex-shrink-0 ${getPriorityColor(request.priority)}`}
          >
            {getPriorityIcon(request.priority)}
            {getPriorityLabel(request.priority)}
          </Badge>
        </div>

        {/* Key Details */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-1 text-muted-foreground">
              <Zap className="w-3 h-3" />
              <span>Kapasite:</span>
            </div>
            <span className="font-medium">{request.estimatedCapacity} kW</span>
          </div>

          {request.estimatedBudget && (
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-1 text-muted-foreground">
                <DollarSign className="w-3 h-3" />
                <span>Bütçe:</span>
              </div>
              <span className="font-medium">{formatCurrency(request.estimatedBudget)}</span>
            </div>
          )}

          {request.assignedEngineerName && (
            <div className="flex items-center justify-between text-sm gap-2">
              <div className="flex items-center gap-1 text-muted-foreground flex-shrink-0">
                <User className="w-3 h-3" />
                <span>Atanan:</span>
              </div>
              <span className="font-medium text-xs truncate" title={request.assignedEngineerName}>
                {request.assignedEngineerName}
              </span>
            </div>
          )}

          {request.scheduledVisitDate && (
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-1 text-muted-foreground">
                <Calendar className="w-3 h-3" />
                <span>Ziyaret:</span>
              </div>
              <span className="font-medium text-xs">
                {formatDate(request.scheduledVisitDate)}
              </span>
            </div>
          )}
        </div>

        {/* Contact Info */}
        <div className="space-y-1">
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Phone className="w-3 h-3 flex-shrink-0" />
            <span className="truncate" title={request.customerPhone}>{request.customerPhone}</span>
          </div>
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Mail className="w-3 h-3 flex-shrink-0" />
            <span className="truncate" title={request.customerEmail}>{request.customerEmail}</span>
          </div>
        </div>

        {/* Description */}
        <div className="border-t pt-2">
          <p className="text-xs text-muted-foreground line-clamp-2">
            {request.description}
          </p>
        </div>

        {/* Tags and Photos */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex flex-wrap gap-1 min-w-0">
            {request.tags.slice(0, 2).map((tag, index) => (
              <Badge 
                key={index} 
                variant="secondary" 
                className="text-xs px-1 py-0 bg-primary/5 text-primary truncate max-w-[60px]"
                title={tag}
              >
                {tag}
              </Badge>
            ))}
            {request.tags.length > 2 && (
              <Badge variant="secondary" className="text-xs px-1 py-0 flex-shrink-0">
                +{request.tags.length - 2}
              </Badge>
            )}
          </div>
          
          {request.hasPhotos && (
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Camera className="w-3 h-3" />
              <span>Fotoğraf</span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between text-xs text-muted-foreground border-t pt-2 gap-2">
          <span className="font-mono truncate">{request.requestNumber || `PR-${new Date(request.createdAt).getFullYear()}-${request.id.slice(-3)}`}</span>
          <span className="flex-shrink-0">{formatDate(request.createdAt)}</span>
        </div>
      </CardContent>
    </Card>
  )
}