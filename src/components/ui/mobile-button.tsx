'use client'

import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'
import { TOUCH_SIZES, mobileClasses, hapticFeedback } from '@/lib/mobile-utils'

const mobileButtonVariants = cva(
  cn(
    // Base styles
    'inline-flex items-center justify-center whitespace-nowrap rounded-xl text-sm font-medium',
    'ring-offset-background transition-all duration-200',
    'disabled:pointer-events-none disabled:opacity-50',
    // Touch-friendly styles
    mobileClasses.touchTarget,
    mobileClasses.activeState,
    mobileClasses.focusState,
    // Mobile-specific styles
    'select-none touch-manipulation'
  ),
  {
    variants: {
      variant: {
        default: 'bg-primary text-primary-foreground hover:bg-primary/90 active:bg-primary/80',
        destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/90 active:bg-destructive/80',
        outline: 'border border-input bg-background hover:bg-accent hover:text-accent-foreground active:bg-accent/80',
        secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80 active:bg-secondary/70',
        ghost: 'hover:bg-accent hover:text-accent-foreground active:bg-accent/80',
        link: 'text-primary underline-offset-4 hover:underline active:text-primary/80',
      },
      size: {
        default: 'h-12 px-4 py-2',
        sm: 'h-10 px-3',
        lg: 'h-14 px-8',
        xl: 'h-16 px-10 text-base',
        icon: 'h-12 w-12',
        'icon-sm': 'h-10 w-10',
        'icon-lg': 'h-14 w-14',
        'icon-xl': 'h-16 w-16',
      },
      touchSize: {
        minimum: `min-h-[${TOUCH_SIZES.MINIMUM}px] min-w-[${TOUCH_SIZES.MINIMUM}px]`,
        comfortable: `min-h-[${TOUCH_SIZES.COMFORTABLE}px] min-w-[${TOUCH_SIZES.COMFORTABLE}px]`,
        large: `min-h-[${TOUCH_SIZES.LARGE}px] min-w-[${TOUCH_SIZES.LARGE}px]`,
      }
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
      touchSize: 'comfortable',
    },
  }
)

export interface MobileButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof mobileButtonVariants> {
  asChild?: boolean
  haptic?: 'light' | 'medium' | 'heavy' | 'success' | 'error' | 'warning' | false
  loading?: boolean
  fullWidth?: boolean
}

const MobileButton = React.forwardRef<HTMLButtonElement, MobileButtonProps>(
  ({
    className,
    variant,
    size,
    touchSize,
    asChild = false,
    haptic = 'light',
    loading = false,
    fullWidth = false,
    onClick,
    children,
    disabled,
    ...props
  }, ref) => {
    const Comp = asChild ? Slot : 'button'

    const handleClick = (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
      // Provide haptic feedback on supported devices
      if (haptic && !disabled && !loading) {
        hapticFeedback[haptic]()
      }

      // Call the original onClick handler
      onClick?.(event)
    }

    return (
      <Comp
        className={cn(
          mobileButtonVariants({ variant, size, touchSize }),
          fullWidth && 'w-full',
          loading && 'opacity-75 cursor-wait',
          className
        )}
        ref={ref}
        onClick={handleClick}
        disabled={disabled || loading}
        {...props}
      >
        {loading ? (
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
            <span>Yükleniyor...</span>
          </div>
        ) : (
          children
        )}
      </Comp>
    )
  }
)
MobileButton.displayName = 'MobileButton'

// Floating Action Button component for mobile
const FloatingActionButton = React.forwardRef<HTMLButtonElement, MobileButtonProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <MobileButton
        ref={ref}
        size="icon-lg"
        className={cn(
          'fixed bottom-6 right-6 z-50 rounded-full shadow-lg hover:shadow-xl transition-shadow',
          'md:bottom-8 md:right-8',
          className
        )}
        {...props}
      >
        {children}
      </MobileButton>
    )
  }
)
FloatingActionButton.displayName = 'FloatingActionButton'

// Bottom Sheet Action Button for mobile modals
const BottomSheetButton = React.forwardRef<HTMLButtonElement, MobileButtonProps>(
  ({ className, ...props }, ref) => {
    return (
      <MobileButton
        ref={ref}
        size="lg"
        fullWidth
        className={cn(
          'rounded-xl mx-4 mb-safe-area-inset-bottom mb-4',
          className
        )}
        {...props}
      />
    )
  }
)
BottomSheetButton.displayName = 'BottomSheetButton'

// Tab Bar Button for mobile navigation
const TabBarButton = React.forwardRef<HTMLButtonElement, MobileButtonProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <MobileButton
        ref={ref}
        variant="ghost"
        size="icon"
        touchSize="comfortable"
        className={cn(
          'flex-1 flex-col h-16 rounded-none space-y-1 text-xs',
          'data-[active=true]:text-primary data-[active=true]:bg-primary/10',
          className
        )}
        {...props}
      >
        {children}
      </MobileButton>
    )
  }
)
TabBarButton.displayName = 'TabBarButton'

export {
  MobileButton,
  FloatingActionButton,
  BottomSheetButton,
  TabBarButton,
  mobileButtonVariants
}