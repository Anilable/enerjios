'use client'

import { ReactNode } from 'react'
import { ChevronRight, MoreVertical } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { useTouch, useIsMobile } from '@/hooks/useTouch'
import { cn } from '@/lib/utils'

interface MobileCardProps {
  children: ReactNode
  onClick?: () => void
  onSwipeLeft?: () => void
  onSwipeRight?: () => void
  onLongPress?: () => void
  showChevron?: boolean
  actions?: Array<{
    label: string
    onClick: () => void
    icon?: ReactNode
    destructive?: boolean
  }>
  className?: string
  contentClassName?: string
  elevated?: boolean
}

export default function MobileCard({
  children,
  onClick,
  onSwipeLeft,
  onSwipeRight,
  onLongPress,
  showChevron = false,
  actions = [],
  className,
  contentClassName,
  elevated = false
}: MobileCardProps) {
  const isMobile = useIsMobile()

  const { ref } = useTouch({
    onTap: onClick,
    onSwipeLeft,
    onSwipeRight,
    onLongPress: onLongPress || (actions.length > 0 ? () => {
      // Show action menu on long press
      const event = new CustomEvent('showMobileActions')
      window.dispatchEvent(event)
    } : undefined)
  })

  return (
    <Card
      ref={isMobile ? ref : undefined}
      className={cn(
        "relative overflow-hidden transition-all duration-200",
        elevated && "shadow-lg hover:shadow-xl",
        onClick && "cursor-pointer hover:bg-gray-50 active:bg-gray-100",
        isMobile && "touch-manipulation",
        className
      )}
      onClick={!isMobile ? onClick : undefined}
    >
      <CardContent className={cn("p-4", contentClassName)}>
        <div className="flex items-center justify-between">
          <div className="flex-1 min-w-0">
            {children}
          </div>
          
          {/* Actions or Chevron */}
          <div className="flex items-center space-x-2 ml-3 flex-shrink-0">
            {actions.length > 0 && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="icon"
                    className="h-8 w-8 text-gray-400 hover:text-gray-600"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  {actions.map((action, index) => (
                    <DropdownMenuItem
                      key={index}
                      onClick={(e) => {
                        e.stopPropagation()
                        action.onClick()
                      }}
                      className={cn(
                        "flex items-center space-x-2",
                        action.destructive && "text-red-600 focus:text-red-600"
                      )}
                    >
                      {action.icon && <span>{action.icon}</span>}
                      <span>{action.label}</span>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            )}
            
            {showChevron && (
              <ChevronRight className="h-5 w-5 text-gray-400" />
            )}
          </div>
        </div>
      </CardContent>
      
      {/* Swipe Actions Overlay */}
      {isMobile && (onSwipeLeft || onSwipeRight) && (
        <>
          {/* Left Swipe Action */}
          {onSwipeLeft && (
            <div className="absolute top-0 right-0 h-full w-20 bg-red-500 flex items-center justify-center opacity-0 transition-opacity">
              <span className="text-white text-sm font-medium">Sil</span>
            </div>
          )}
          
          {/* Right Swipe Action */}
          {onSwipeRight && (
            <div className="absolute top-0 left-0 h-full w-20 bg-green-500 flex items-center justify-center opacity-0 transition-opacity">
              <span className="text-white text-sm font-medium">Onayla</span>
            </div>
          )}
        </>
      )}
    </Card>
  )
}

// Specialized mobile cards for different content types

export function MobileProjectCard({ 
  project, 
  onClick,
  onEdit,
  onDelete,
  className 
}: { 
  project: any
  onClick?: () => void
  onEdit?: () => void
  onDelete?: () => void
  className?: string
}) {
  const actions = []
  if (onEdit) actions.push({ label: 'Düzenle', onClick: onEdit })
  if (onDelete) actions.push({ label: 'Sil', onClick: onDelete, destructive: true })

  return (
    <MobileCard
      onClick={onClick}
      actions={actions}
      showChevron={!!onClick}
      className={className}
    >
      <div className="space-y-2">
        <div className="flex items-start justify-between">
          <h3 className="font-semibold text-gray-900 truncate pr-2">
            {project.name}
          </h3>
          <span className={cn(
            "px-2 py-1 rounded-full text-xs font-medium flex-shrink-0",
            project.status === 'COMPLETED' && "bg-green-100 text-green-800",
            project.status === 'IN_PROGRESS' && "bg-blue-100 text-blue-800",
            project.status === 'PENDING' && "bg-yellow-100 text-yellow-800"
          )}>
            {project.statusLabel || project.status}
          </span>
        </div>
        
        <div className="text-sm text-gray-600 space-y-1">
          <p>Müşteri: {project.customerName}</p>
          {project.systemSize && (
            <p>Kapasite: {project.systemSize} kW</p>
          )}
          {project.totalAmount && (
            <p className="font-medium text-gray-900">
              {new Intl.NumberFormat('tr-TR', { 
                style: 'currency', 
                currency: 'TRY' 
              }).format(project.totalAmount)}
            </p>
          )}
        </div>
      </div>
    </MobileCard>
  )
}

export function MobileCustomerCard({ 
  customer, 
  onClick,
  onCall,
  onEmail,
  className 
}: { 
  customer: any
  onClick?: () => void
  onCall?: () => void
  onEmail?: () => void
  className?: string
}) {
  const actions = []
  if (onCall) actions.push({ label: 'Ara', onClick: onCall })
  if (onEmail) actions.push({ label: 'E-posta', onClick: onEmail })

  return (
    <MobileCard
      onClick={onClick}
      actions={actions}
      showChevron={!!onClick}
      className={className}
    >
      <div className="space-y-2">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
            <span className="text-blue-600 font-medium">
              {customer.firstName?.[0]}{customer.lastName?.[0]}
            </span>
          </div>
          
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-gray-900 truncate">
              {customer.firstName} {customer.lastName}
            </h3>
            <p className="text-sm text-gray-600 truncate">
              {customer.email}
            </p>
          </div>
        </div>
        
        <div className="flex items-center justify-between text-sm text-gray-500">
          <span>{customer.customerType}</span>
          {customer.projectCount && (
            <span>{customer.projectCount} proje</span>
          )}
        </div>
      </div>
    </MobileCard>
  )
}