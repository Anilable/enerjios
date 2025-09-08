import { useRef, useCallback, useEffect } from 'react'

interface TouchHandlers {
  onTouchStart?: (event: TouchEvent) => void
  onTouchMove?: (event: TouchEvent) => void
  onTouchEnd?: (event: TouchEvent) => void
  onSwipeLeft?: () => void
  onSwipeRight?: () => void
  onSwipeUp?: () => void
  onSwipeDown?: () => void
  onPinch?: (scale: number) => void
  onTap?: () => void
  onDoubleTap?: () => void
  onLongPress?: () => void
}

interface TouchOptions {
  swipeThreshold?: number
  longPressThreshold?: number
  doubleTapThreshold?: number
  preventScroll?: boolean
}

export const useTouch = (handlers: TouchHandlers, options: TouchOptions = {}) => {
  const {
    swipeThreshold = 50,
    longPressThreshold = 500,
    doubleTapThreshold = 300,
    preventScroll = false
  } = options

  const touchStart = useRef<{ x: number; y: number; time: number } | null>(null)
  const lastTap = useRef<number>(0)
  const longPressTimer = useRef<NodeJS.Timeout | null>(null)
  const initialDistance = useRef<number | null>(null)

  const clearLongPressTimer = useCallback(() => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current)
      longPressTimer.current = null
    }
  }, [])

  const getDistance = useCallback((touches: TouchList) => {
    if (touches.length < 2) return null
    
    const touch1 = touches[0]
    const touch2 = touches[1]
    
    return Math.sqrt(
      Math.pow(touch2.clientX - touch1.clientX, 2) + 
      Math.pow(touch2.clientY - touch1.clientY, 2)
    )
  }, [])

  const handleTouchStart = useCallback((event: TouchEvent) => {
    const touch = event.touches[0]
    const now = Date.now()

    touchStart.current = {
      x: touch.clientX,
      y: touch.clientY,
      time: now
    }

    // Handle pinch gesture
    if (event.touches.length === 2) {
      initialDistance.current = getDistance(event.touches)
    }

    // Set up long press timer
    if (handlers.onLongPress) {
      longPressTimer.current = setTimeout(() => {
        handlers.onLongPress!()
        clearLongPressTimer()
      }, longPressThreshold)
    }

    // Prevent scroll if option is set
    if (preventScroll) {
      event.preventDefault()
    }

    handlers.onTouchStart?.(event)
  }, [handlers, longPressThreshold, preventScroll, getDistance, clearLongPressTimer])

  const handleTouchMove = useCallback((event: TouchEvent) => {
    clearLongPressTimer()

    // Handle pinch gesture
    if (event.touches.length === 2 && initialDistance.current && handlers.onPinch) {
      const currentDistance = getDistance(event.touches)
      if (currentDistance) {
        const scale = currentDistance / initialDistance.current
        handlers.onPinch(scale)
      }
    }

    if (preventScroll) {
      event.preventDefault()
    }

    handlers.onTouchMove?.(event)
  }, [handlers, preventScroll, getDistance, clearLongPressTimer])

  const handleTouchEnd = useCallback((event: TouchEvent) => {
    clearLongPressTimer()

    const touchEnd = event.changedTouches[0]
    const now = Date.now()

    if (touchStart.current) {
      const deltaX = touchEnd.clientX - touchStart.current.x
      const deltaY = touchEnd.clientY - touchStart.current.y
      const deltaTime = now - touchStart.current.time
      const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY)

      // Check for tap or double tap
      if (distance < 10 && deltaTime < 200) {
        const timeSinceLastTap = now - lastTap.current

        if (timeSinceLastTap < doubleTapThreshold && handlers.onDoubleTap) {
          handlers.onDoubleTap()
          lastTap.current = 0
        } else if (handlers.onTap) {
          lastTap.current = now
          setTimeout(() => {
            if (lastTap.current === now) {
              handlers.onTap!()
            }
          }, doubleTapThreshold)
        }
      }
      // Check for swipe gestures
      else if (distance > swipeThreshold) {
        const angle = Math.atan2(deltaY, deltaX) * 180 / Math.PI

        if (angle > -45 && angle <= 45) {
          handlers.onSwipeRight?.()
        } else if (angle > 45 && angle <= 135) {
          handlers.onSwipeDown?.()
        } else if ((angle > 135 && angle <= 180) || (angle >= -180 && angle <= -135)) {
          handlers.onSwipeLeft?.()
        } else if (angle > -135 && angle <= -45) {
          handlers.onSwipeUp?.()
        }
      }
    }

    touchStart.current = null
    initialDistance.current = null

    handlers.onTouchEnd?.(event)
  }, [handlers, swipeThreshold, doubleTapThreshold, clearLongPressTimer])

  const ref = useCallback((node: HTMLElement | null) => {
    if (node) {
      node.addEventListener('touchstart', handleTouchStart, { passive: !preventScroll })
      node.addEventListener('touchmove', handleTouchMove, { passive: !preventScroll })
      node.addEventListener('touchend', handleTouchEnd, { passive: true })

      return () => {
        node.removeEventListener('touchstart', handleTouchStart)
        node.removeEventListener('touchmove', handleTouchMove)
        node.removeEventListener('touchend', handleTouchEnd)
      }
    }
  }, [handleTouchStart, handleTouchMove, handleTouchEnd, preventScroll])

  return { ref, clearLongPressTimer }
}

// Hook for detecting mobile device
export const useIsMobile = () => {
  const isMobile = useCallback(() => {
    if (typeof window === 'undefined') return false
    
    return (
      /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
      window.innerWidth <= 768 ||
      ('ontouchstart' in window)
    )
  }, [])

  return isMobile()
}

// Hook for pull-to-refresh functionality
export const usePullToRefresh = (onRefresh: () => void | Promise<void>, threshold = 80) => {
  const startY = useRef<number>(0)
  const currentY = useRef<number>(0)
  const isDragging = useRef<boolean>(false)
  const isRefreshing = useRef<boolean>(false)

  const handleTouchStart = useCallback((event: TouchEvent) => {
    if (window.scrollY === 0) {
      startY.current = event.touches[0].clientY
      isDragging.current = true
    }
  }, [])

  const handleTouchMove = useCallback((event: TouchEvent) => {
    if (isDragging.current && !isRefreshing.current) {
      currentY.current = event.touches[0].clientY
      const deltaY = currentY.current - startY.current

      if (deltaY > 0 && deltaY < threshold * 2) {
        event.preventDefault()
        
        // Add visual feedback here
        const refreshIndicator = document.getElementById('pull-refresh-indicator')
        if (refreshIndicator) {
          refreshIndicator.style.transform = `translateY(${Math.min(deltaY, threshold)}px)`
          refreshIndicator.style.opacity = `${Math.min(deltaY / threshold, 1)}`
        }
      }
    }
  }, [threshold])

  const handleTouchEnd = useCallback(async () => {
    if (isDragging.current && !isRefreshing.current) {
      const deltaY = currentY.current - startY.current

      if (deltaY >= threshold) {
        isRefreshing.current = true
        
        try {
          await onRefresh()
        } finally {
          isRefreshing.current = false
          
          // Reset visual feedback
          const refreshIndicator = document.getElementById('pull-refresh-indicator')
          if (refreshIndicator) {
            refreshIndicator.style.transform = 'translateY(0px)'
            refreshIndicator.style.opacity = '0'
          }
        }
      } else {
        // Reset visual feedback
        const refreshIndicator = document.getElementById('pull-refresh-indicator')
        if (refreshIndicator) {
          refreshIndicator.style.transform = 'translateY(0px)'
          refreshIndicator.style.opacity = '0'
        }
      }
    }

    isDragging.current = false
    startY.current = 0
    currentY.current = 0
  }, [onRefresh, threshold])

  useEffect(() => {
    document.addEventListener('touchstart', handleTouchStart, { passive: true })
    document.addEventListener('touchmove', handleTouchMove, { passive: false })
    document.addEventListener('touchend', handleTouchEnd, { passive: true })

    return () => {
      document.removeEventListener('touchstart', handleTouchStart)
      document.removeEventListener('touchmove', handleTouchMove)
      document.removeEventListener('touchend', handleTouchEnd)
    }
  }, [handleTouchStart, handleTouchMove, handleTouchEnd])

  return { isRefreshing: isRefreshing.current }
}