'use client'

import { ReactNode } from 'react'
import { RefreshCw } from 'lucide-react'
import { usePullToRefresh, useIsMobile } from '@/hooks/useTouch'
import { cn } from '@/lib/utils'

interface PullToRefreshProps {
  onRefresh: () => void | Promise<void>
  children: ReactNode
  threshold?: number
  className?: string
  disabled?: boolean
}

export default function PullToRefresh({ 
  onRefresh, 
  children, 
  threshold = 80, 
  className,
  disabled = false
}: PullToRefreshProps) {
  const isMobile = useIsMobile()
  const { isRefreshing } = usePullToRefresh(onRefresh, threshold)

  if (!isMobile || disabled) {
    return <>{children}</>
  }

  return (
    <div className={cn("relative", className)}>
      {/* Pull to Refresh Indicator */}
      <div
        id="pull-refresh-indicator"
        className="absolute top-0 left-0 right-0 flex items-center justify-center bg-white border-b z-10 transition-all duration-200"
        style={{
          height: `${threshold}px`,
          transform: 'translateY(0px)',
          opacity: 0,
          marginTop: `-${threshold}px`
        }}
      >
        <div className="flex items-center space-x-2 text-blue-600">
          <RefreshCw 
            className={cn(
              "h-5 w-5 transition-transform duration-300",
              isRefreshing && "animate-spin"
            )} 
          />
          <span className="text-sm font-medium">
            {isRefreshing ? 'Yenileniyor...' : 'Yenilemek için bırakın'}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="relative">
        {children}
      </div>

      {/* Loading Overlay */}
      {isRefreshing && (
        <div className="fixed top-0 left-0 right-0 h-1 bg-blue-600 z-50 animate-pulse" />
      )}
    </div>
  )
}

// Component for manual refresh button (fallback for non-mobile)
export function RefreshButton({ 
  onRefresh, 
  isLoading = false,
  className 
}: { 
  onRefresh: () => void
  isLoading?: boolean
  className?: string 
}) {
  const isMobile = useIsMobile()

  if (isMobile) return null

  return (
    <button
      onClick={onRefresh}
      disabled={isLoading}
      className={cn(
        "inline-flex items-center space-x-2 px-3 py-2 text-sm font-medium text-blue-600 hover:text-blue-800 disabled:opacity-50",
        className
      )}
    >
      <RefreshCw 
        className={cn(
          "h-4 w-4 transition-transform",
          isLoading && "animate-spin"
        )} 
      />
      <span>Yenile</span>
    </button>
  )
}