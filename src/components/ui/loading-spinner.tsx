import { cn } from '@/lib/utils'
import { Sun } from 'lucide-react'

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl'
  className?: string
  text?: string
}

const sizeMap = {
  sm: 'w-4 h-4',
  md: 'w-6 h-6',
  lg: 'w-8 h-8',
  xl: 'w-12 h-12',
}

export function LoadingSpinner({ 
  size = 'md', 
  className, 
  text 
}: LoadingSpinnerProps) {
  return (
    <div className={cn('flex flex-col items-center justify-center', className)}>
      {/* Solar-themed spinner */}
      <div className="relative">
        {/* Outer rotating ring (representing solar rays) */}
        <div className={cn(
          'animate-spin rounded-full border-2 border-transparent',
          sizeMap[size],
          'border-t-primary border-r-primary/60'
        )} />
        
        {/* Inner sun icon */}
        <div className="absolute inset-0 flex items-center justify-center">
          <Sun className={cn(
            'text-primary animate-pulse',
            size === 'sm' && 'w-2 h-2',
            size === 'md' && 'w-3 h-3',
            size === 'lg' && 'w-4 h-4',
            size === 'xl' && 'w-6 h-6',
          )} />
        </div>
      </div>
      
      {text && (
        <p className={cn(
          'text-gray-600 mt-2 text-center',
          size === 'sm' && 'text-xs',
          size === 'md' && 'text-sm',
          size === 'lg' && 'text-base',
          size === 'xl' && 'text-lg',
        )}>
          {text}
        </p>
      )}
    </div>
  )
}

// Solar-themed page loader
export function PageLoader() {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/80 backdrop-blur-sm">
      <div className="text-center">
        <LoadingSpinner size="xl" />
        <div className="mt-6 space-y-2">
          <h3 className="text-lg font-medium text-gray-900">
            Güneş enerjisi gücüyle yükleniyor...
          </h3>
          <p className="text-sm text-gray-500">
            Lütfen bekleyiniz
          </p>
        </div>
      </div>
    </div>
  )
}

// Component loader (smaller, for buttons etc.)
export function ComponentLoader({ className }: { className?: string }) {
  return (
    <div className={cn('flex items-center justify-center p-4', className)}>
      <LoadingSpinner size="md" text="Yükleniyor..." />
    </div>
  )
}

// Solar energy themed skeleton loader
export function SolarSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn('animate-pulse', className)}>
      <div className="flex items-center space-x-4">
        <div className="rounded-full bg-primary/20 h-12 w-12 flex items-center justify-center">
          <Sun className="h-6 w-6 text-primary/60" />
        </div>
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          <div className="h-3 bg-gray-200 rounded w-1/2"></div>
        </div>
      </div>
    </div>
  )
}