/**
 * Mobile and responsive utility functions for the application
 */

// Device detection utilities
export const isMobileDevice = (): boolean => {
  if (typeof window === 'undefined') return false

  return (
    /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
    window.innerWidth <= 768 ||
    ('ontouchstart' in window)
  )
}

export const isTabletDevice = (): boolean => {
  if (typeof window === 'undefined') return false

  return (
    /iPad|Android|Tablet/i.test(navigator.userAgent) ||
    (window.innerWidth > 768 && window.innerWidth <= 1024)
  )
}

export const isDesktopDevice = (): boolean => {
  if (typeof window === 'undefined') return true

  return window.innerWidth > 1024 && !isMobileDevice()
}

// Screen size utilities
export const getScreenSize = (): 'mobile' | 'tablet' | 'desktop' => {
  if (typeof window === 'undefined') return 'desktop'

  const width = window.innerWidth

  if (width <= 768) return 'mobile'
  if (width <= 1024) return 'tablet'
  return 'desktop'
}

// Touch-friendly size constants (following iOS and Android guidelines)
export const TOUCH_SIZES = {
  MINIMUM: 44, // Minimum touch target size in pixels
  COMFORTABLE: 48, // Comfortable touch target size
  LARGE: 56, // Large touch target size
  SPACING: {
    TIGHT: 8,
    NORMAL: 16,
    LOOSE: 24,
    EXTRA_LOOSE: 32
  }
} as const

// Responsive breakpoints
export const BREAKPOINTS = {
  SM: 640,   // Small devices (phones)
  MD: 768,   // Medium devices (tablets)
  LG: 1024,  // Large devices (laptops)
  XL: 1280,  // Extra large devices (desktops)
  '2XL': 1536 // 2X large devices (large desktops)
} as const

// Mobile-specific CSS class generators
export const mobileClasses = {
  touchTarget: 'min-h-[44px] min-w-[44px] touch-manipulation',
  activeState: 'active:scale-95 transition-transform duration-150',
  focusState: 'focus:outline-none focus:ring-2 focus:ring-primary/20 focus:ring-offset-2',
  scrollArea: 'overflow-auto overscroll-contain',
  preventZoom: 'touch-manipulation select-none',
  safeArea: 'pb-safe-area-inset-bottom pt-safe-area-inset-top',
} as const

// Responsive utility functions
export const responsiveValue = <T>(
  mobile: T,
  tablet?: T,
  desktop?: T
): T => {
  const screenSize = getScreenSize()

  switch (screenSize) {
    case 'mobile':
      return mobile
    case 'tablet':
      return tablet || mobile
    case 'desktop':
      return desktop || tablet || mobile
    default:
      return mobile
  }
}

// Gesture detection utilities
export interface SwipeDirection {
  direction: 'left' | 'right' | 'up' | 'down'
  distance: number
  velocity: number
}

export const detectSwipe = (
  startX: number,
  startY: number,
  endX: number,
  endY: number,
  startTime: number,
  endTime: number,
  threshold: number = 50
): SwipeDirection | null => {
  const deltaX = endX - startX
  const deltaY = endY - startY
  const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY)
  const duration = endTime - startTime
  const velocity = distance / duration

  if (distance < threshold) return null

  const angle = Math.atan2(deltaY, deltaX) * 180 / Math.PI

  let direction: SwipeDirection['direction']

  if (angle > -45 && angle <= 45) {
    direction = 'right'
  } else if (angle > 45 && angle <= 135) {
    direction = 'down'
  } else if ((angle > 135 && angle <= 180) || (angle >= -180 && angle <= -135)) {
    direction = 'left'
  } else {
    direction = 'up'
  }

  return { direction, distance, velocity }
}

// Viewport utilities
export const getViewportHeight = (): number => {
  if (typeof window === 'undefined') return 0

  // Use the smaller of window.innerHeight and screen.height for mobile Safari
  return Math.min(window.innerHeight, screen.height)
}

export const getViewportWidth = (): number => {
  if (typeof window === 'undefined') return 0

  return window.innerWidth
}

// Safe area utilities for mobile devices with notches
export const getSafeAreaInsets = () => {
  if (typeof window === 'undefined') return { top: 0, bottom: 0, left: 0, right: 0 }

  const style = getComputedStyle(document.documentElement)

  return {
    top: parseInt(style.getPropertyValue('--sat') || '0', 10),
    bottom: parseInt(style.getPropertyValue('--sab') || '0', 10),
    left: parseInt(style.getPropertyValue('--sal') || '0', 10),
    right: parseInt(style.getPropertyValue('--sar') || '0', 10)
  }
}

// Mobile keyboard detection
export const useKeyboardHeight = () => {
  if (typeof window === 'undefined') return 0

  const initialViewportHeight = window.visualViewport?.height || window.innerHeight
  const currentViewportHeight = window.visualViewport?.height || window.innerHeight

  return Math.max(0, initialViewportHeight - currentViewportHeight)
}

// Orientation utilities
export const getOrientation = (): 'portrait' | 'landscape' => {
  if (typeof window === 'undefined') return 'portrait'

  return window.innerHeight > window.innerWidth ? 'portrait' : 'landscape'
}

// Haptic feedback utilities (for supported devices)
export const vibrate = (pattern: number | number[] = 100): void => {
  if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
    navigator.vibrate(pattern)
  }
}

export const hapticFeedback = {
  light: () => vibrate(10),
  medium: () => vibrate(20),
  heavy: () => vibrate(30),
  success: () => vibrate([100, 50, 100]),
  error: () => vibrate([100, 50, 100, 50, 100]),
  warning: () => vibrate([50, 50, 50])
}

// Mobile-specific performance utilities
export const prefersReducedMotion = (): boolean => {
  if (typeof window === 'undefined') return false

  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

export const prefersDarkMode = (): boolean => {
  if (typeof window === 'undefined') return false

  return window.matchMedia('(prefers-color-scheme: dark)').matches
}

// Network utilities for mobile optimization
export const getConnectionType = (): string => {
  if (typeof navigator === 'undefined' || !('connection' in navigator)) return 'unknown'

  const connection = (navigator as any).connection
  return connection?.effectiveType || 'unknown'
}

export const isSlowConnection = (): boolean => {
  const connectionType = getConnectionType()
  return ['slow-2g', '2g', '3g'].includes(connectionType)
}

// Touch event utilities
export const getTouchPoint = (event: TouchEvent, index: number = 0) => {
  const touch = event.touches[index] || event.changedTouches[index]
  if (!touch) return null

  return {
    x: touch.clientX,
    y: touch.clientY,
    pageX: touch.pageX,
    pageY: touch.pageY,
    screenX: touch.screenX,
    screenY: touch.screenY
  }
}

export const getMultiTouchDistance = (event: TouchEvent): number | null => {
  if (event.touches.length < 2) return null

  const touch1 = event.touches[0]
  const touch2 = event.touches[1]

  return Math.sqrt(
    Math.pow(touch2.clientX - touch1.clientX, 2) +
    Math.pow(touch2.clientY - touch1.clientY, 2)
  )
}

// Mobile form utilities
export const preventZoom = (element: HTMLElement): void => {
  element.addEventListener('touchstart', (e) => {
    if (e.touches.length > 1) {
      e.preventDefault()
    }
  })

  element.addEventListener('gesturestart', (e) => {
    e.preventDefault()
  })
}

export const enableSmoothScrolling = (element: HTMLElement): void => {
  element.style.scrollBehavior = 'smooth'
  element.style.webkitOverflowScrolling = 'touch'
}

// Mobile accessibility utilities
export const announceToScreenReader = (message: string): void => {
  const announcement = document.createElement('div')
  announcement.setAttribute('aria-live', 'polite')
  announcement.setAttribute('aria-atomic', 'true')
  announcement.className = 'sr-only'
  announcement.textContent = message

  document.body.appendChild(announcement)

  setTimeout(() => {
    document.body.removeChild(announcement)
  }, 1000)
}

// Export all utilities
export default {
  isMobileDevice,
  isTabletDevice,
  isDesktopDevice,
  getScreenSize,
  TOUCH_SIZES,
  BREAKPOINTS,
  mobileClasses,
  responsiveValue,
  detectSwipe,
  getViewportHeight,
  getViewportWidth,
  getSafeAreaInsets,
  useKeyboardHeight,
  getOrientation,
  vibrate,
  hapticFeedback,
  prefersReducedMotion,
  prefersDarkMode,
  getConnectionType,
  isSlowConnection,
  getTouchPoint,
  getMultiTouchDistance,
  preventZoom,
  enableSmoothScrolling,
  announceToScreenReader
}