'use client'

import { useState } from 'react'
import { ProjectRequestStatus, PROJECT_REQUEST_STATUS_LABELS, ProjectRequest } from '@/types/project-request'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel
} from '@/components/ui/dropdown-menu'
import { Badge } from '@/components/ui/badge'
import {
  ChevronDown,
  Loader2,
  CheckCircle,
  Clock,
  User,
  MapPin,
  Phone,
  Archive,
  AlertCircle
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface StatusUpdateDropdownProps {
  request: ProjectRequest
  onStatusUpdate: (requestId: string, newStatus: ProjectRequestStatus) => Promise<void>
  variant?: 'default' | 'compact' | 'minimal'
  disabled?: boolean
  className?: string
  showCurrentStatus?: boolean
}

// Define status workflow and allowed transitions
const STATUS_WORKFLOW: Record<ProjectRequestStatus, {
  allowed: ProjectRequestStatus[]
  label: string
  color: string
  icon: React.ReactNode
  description: string
}> = {
  OPEN: {
    allowed: ['CONTACTED', 'ASSIGNED', 'LOST'],
    label: 'Açık',
    color: 'bg-blue-500 hover:bg-blue-600',
    icon: <Clock className="w-4 h-4" />,
    description: 'Yeni talep, henüz işleme alınmadı'
  },
  CONTACTED: {
    allowed: ['ASSIGNED', 'SITE_VISIT', 'LOST', 'OPEN'],
    label: 'İletişime Geçildi',
    color: 'bg-purple-500 hover:bg-purple-600',
    icon: <Phone className="w-4 h-4" />,
    description: 'Müşteri ile iletişim kuruldu'
  },
  ASSIGNED: {
    allowed: ['SITE_VISIT', 'CONTACTED', 'LOST', 'CONVERTED_TO_PROJECT'],
    label: 'Atama Yapıldı',
    color: 'bg-orange-500 hover:bg-orange-600',
    icon: <User className="w-4 h-4" />,
    description: 'Mühendis/ekip atandı'
  },
  SITE_VISIT: {
    allowed: ['CONVERTED_TO_PROJECT', 'ASSIGNED', 'LOST'],
    label: 'Saha Ziyareti',
    color: 'bg-yellow-500 hover:bg-yellow-600',
    icon: <MapPin className="w-4 h-4" />,
    description: 'Saha incelemesi yapılıyor/tamamlandı'
  },
  CONVERTED_TO_PROJECT: {
    allowed: ['SITE_VISIT'], // Usually final, but can go back to site visit if needed
    label: 'Projeye Dönüştürüldü',
    color: 'bg-green-500 hover:bg-green-600',
    icon: <CheckCircle className="w-4 h-4" />,
    description: 'Talep başarıyla projeye dönüştürüldü'
  },
  LOST: {
    allowed: ['OPEN', 'CONTACTED', 'ASSIGNED', 'SITE_VISIT'], // Can reopen lost requests
    label: 'Kaybedildi',
    color: 'bg-red-500 hover:bg-red-600',
    icon: <Archive className="w-4 h-4" />,
    description: 'Talep iptal edildi veya kaybedildi'
  }
}

export function StatusUpdateDropdown({
  request,
  onStatusUpdate,
  variant = 'default',
  disabled = false,
  className,
  showCurrentStatus = true
}: StatusUpdateDropdownProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [isOpen, setIsOpen] = useState(false)

  const currentStatus = STATUS_WORKFLOW[request.status]
  const allowedStatuses = currentStatus.allowed

  const handleStatusUpdate = async (newStatus: ProjectRequestStatus) => {
    if (newStatus === request.status || isLoading) return

    try {
      setIsLoading(true)
      await onStatusUpdate(request.id, newStatus)
      setIsOpen(false)
    } catch (error) {
      console.error('Error updating status:', error)
      // Error handling is done in the parent component
    } finally {
      setIsLoading(false)
    }
  }

  const getStatusStyle = (status: ProjectRequestStatus) => {
    const statusInfo = STATUS_WORKFLOW[status]
    return {
      backgroundColor: statusInfo.color.split(' ')[0].replace('bg-', ''),
      color: 'white'
    }
  }

  // Minimal variant - just an icon button
  if (variant === 'minimal') {
    return (
      <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            disabled={disabled || isLoading}
            className={cn("h-6 w-6 p-0 hover:bg-primary/10", className)}
          >
            {isLoading ? (
              <Loader2 className="w-3 h-3 animate-spin" />
            ) : (
              currentStatus.icon
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-64">
          <DropdownMenuLabel>Durum Güncelle</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {allowedStatuses.map((status) => {
            const statusInfo = STATUS_WORKFLOW[status]
            return (
              <DropdownMenuItem
                key={status}
                onClick={() => handleStatusUpdate(status)}
                className="flex items-center gap-2 cursor-pointer"
              >
                {statusInfo.icon}
                <div className="flex-1">
                  <div className="font-medium">{statusInfo.label}</div>
                  <div className="text-xs text-muted-foreground">{statusInfo.description}</div>
                </div>
              </DropdownMenuItem>
            )
          })}
        </DropdownMenuContent>
      </DropdownMenu>
    )
  }

  // Compact variant - status badge with dropdown
  if (variant === 'compact') {
    return (
      <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            disabled={disabled || isLoading}
            className={cn("h-7 px-2 text-xs", className)}
          >
            {isLoading ? (
              <Loader2 className="w-3 h-3 animate-spin mr-1" />
            ) : (
              <>
                {currentStatus.icon}
                <span className="ml-1">{currentStatus.label}</span>
              </>
            )}
            <ChevronDown className="w-3 h-3 ml-1" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-64">
          <DropdownMenuLabel>Durum Güncelle</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {allowedStatuses.map((status) => {
            const statusInfo = STATUS_WORKFLOW[status]
            return (
              <DropdownMenuItem
                key={status}
                onClick={() => handleStatusUpdate(status)}
                className="flex items-center gap-2 cursor-pointer"
              >
                {statusInfo.icon}
                <div className="flex-1">
                  <div className="font-medium">{statusInfo.label}</div>
                  <div className="text-xs text-muted-foreground">{statusInfo.description}</div>
                </div>
              </DropdownMenuItem>
            )
          })}
        </DropdownMenuContent>
      </DropdownMenu>
    )
  }

  // Default variant - full button with current status
  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          disabled={disabled || isLoading}
          className={cn("gap-2", className)}
        >
          {isLoading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            currentStatus.icon
          )}
          {showCurrentStatus && (
            <span>{currentStatus.label}</span>
          )}
          <ChevronDown className="w-4 h-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <DropdownMenuLabel className="flex items-center gap-2">
          <span>Durum Güncelle</span>
          {showCurrentStatus && (
            <Badge variant="outline" className="text-xs">
              Mevcut: {currentStatus.label}
            </Badge>
          )}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />

        {/* Show current status info */}
        <div className="px-2 py-2 text-xs text-muted-foreground border-b">
          <div className="flex items-center gap-2 mb-1">
            {currentStatus.icon}
            <span className="font-medium">{currentStatus.label}</span>
          </div>
          <div>{currentStatus.description}</div>
        </div>

        {/* Available transitions */}
        <div className="py-1">
          {allowedStatuses.length > 0 ? (
            allowedStatuses.map((status) => {
              const statusInfo = STATUS_WORKFLOW[status]
              const isCurrentStatus = status === request.status
              return (
                <DropdownMenuItem
                  key={status}
                  onClick={() => handleStatusUpdate(status)}
                  className={cn(
                    "flex items-start gap-3 cursor-pointer p-3",
                    isCurrentStatus && "opacity-50 cursor-not-allowed"
                  )}
                  disabled={isCurrentStatus}
                >
                  <div className="flex-shrink-0 mt-0.5">
                    {statusInfo.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm">{statusInfo.label}</div>
                    <div className="text-xs text-muted-foreground mt-0.5">
                      {statusInfo.description}
                    </div>
                  </div>
                  {isCurrentStatus && (
                    <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                  )}
                </DropdownMenuItem>
              )
            })
          ) : (
            <div className="px-3 py-2 text-xs text-muted-foreground flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />
              <span>Bu durumdan değişiklik yapılamaz</span>
            </div>
          )}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}