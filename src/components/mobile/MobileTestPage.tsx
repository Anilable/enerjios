'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { MobileButton, FloatingActionButton, TabBarButton } from '@/components/ui/mobile-button'
import { MobileInput, MobileTextarea, MobileSearchInput } from '@/components/ui/mobile-input'
import { Badge } from '@/components/ui/badge'
import {
  getScreenSize,
  isMobileDevice,
  isTabletDevice,
  getViewportHeight,
  getViewportWidth,
  getOrientation,
  TOUCH_SIZES,
  BREAKPOINTS
} from '@/lib/mobile-utils'
import {
  Smartphone,
  Tablet,
  Monitor,
  RefreshCw,
  Search,
  Heart,
  Share,
  Settings,
  Home,
  User,
  Bell,
  Menu,
  Plus
} from 'lucide-react'

export default function MobileTestPage() {
  const [deviceInfo, setDeviceInfo] = useState({
    screenSize: 'desktop',
    isMobile: false,
    isTablet: false,
    viewportHeight: 0,
    viewportWidth: 0,
    orientation: 'portrait',
    userAgent: ''
  })

  const [activeTab, setActiveTab] = useState('home')
  const [searchValue, setSearchValue] = useState('')
  const [textareaValue, setTextareaValue] = useState('')

  const updateDeviceInfo = () => {
    setDeviceInfo({
      screenSize: getScreenSize(),
      isMobile: isMobileDevice(),
      isTablet: isTabletDevice(),
      viewportHeight: getViewportHeight(),
      viewportWidth: getViewportWidth(),
      orientation: getOrientation(),
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : ''
    })
  }

  useEffect(() => {
    updateDeviceInfo()

    const handleResize = () => updateDeviceInfo()
    const handleOrientationChange = () => {
      setTimeout(updateDeviceInfo, 100) // Delay to get accurate measurements
    }

    window.addEventListener('resize', handleResize)
    window.addEventListener('orientationchange', handleOrientationChange)

    return () => {
      window.removeEventListener('resize', handleResize)
      window.removeEventListener('orientationchange', handleOrientationChange)
    }
  }, [])

  const getDeviceIcon = () => {
    if (deviceInfo.isMobile) return <Smartphone className="h-4 w-4" />
    if (deviceInfo.isTablet) return <Tablet className="h-4 w-4" />
    return <Monitor className="h-4 w-4" />
  }

  const getScreenSizeColor = (size: string) => {
    switch (size) {
      case 'mobile': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
      case 'tablet': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
      case 'desktop': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
    }
  }

  return (
    <div className="min-h-screen bg-background p-4 space-y-8">
      {/* Device Information Panel */}
      <div className="mobile-card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold flex items-center space-x-2">
            {getDeviceIcon()}
            <span>Device Information</span>
          </h2>
          <Button
            variant="outline"
            size="sm"
            onClick={updateDeviceInfo}
            className="touch-manipulation"
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Screen Size:</span>
              <Badge className={getScreenSizeColor(deviceInfo.screenSize)}>
                {deviceInfo.screenSize}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Viewport:</span>
              <span className="text-sm font-mono">
                {deviceInfo.viewportWidth} × {deviceInfo.viewportHeight}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Orientation:</span>
              <Badge variant="secondary">{deviceInfo.orientation}</Badge>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Mobile:</span>
              <Badge variant={deviceInfo.isMobile ? 'default' : 'secondary'}>
                {deviceInfo.isMobile ? 'Yes' : 'No'}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Tablet:</span>
              <Badge variant={deviceInfo.isTablet ? 'default' : 'secondary'}>
                {deviceInfo.isTablet ? 'Yes' : 'No'}
              </Badge>
            </div>
          </div>
        </div>

        {/* Breakpoint Indicators */}
        <div className="mt-4 p-3 bg-muted rounded-lg">
          <h3 className="text-sm font-medium mb-2">Breakpoint Indicators:</h3>
          <div className="flex flex-wrap gap-2">
            <Badge className="sm:bg-green-500 sm:text-white">SM ({BREAKPOINTS.SM}px+)</Badge>
            <Badge className="md:bg-green-500 md:text-white">MD ({BREAKPOINTS.MD}px+)</Badge>
            <Badge className="lg:bg-green-500 lg:text-white">LG ({BREAKPOINTS.LG}px+)</Badge>
            <Badge className="xl:bg-green-500 xl:text-white">XL ({BREAKPOINTS.XL}px+)</Badge>
          </div>
        </div>
      </div>

      {/* Touch Target Testing */}
      <div className="mobile-card">
        <h2 className="text-lg font-semibold mb-4">Touch Target Testing</h2>
        <div className="space-y-4">
          <div>
            <h3 className="text-sm font-medium mb-2">Button Sizes (Touch-Optimized)</h3>
            <div className="flex flex-wrap gap-2">
              <MobileButton size="sm">Small ({TOUCH_SIZES.MINIMUM}px)</MobileButton>
              <MobileButton size="default">Default ({TOUCH_SIZES.COMFORTABLE}px)</MobileButton>
              <MobileButton size="lg">Large ({TOUCH_SIZES.LARGE}px)</MobileButton>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-medium mb-2">Icon Buttons</h3>
            <div className="flex flex-wrap gap-2">
              <MobileButton variant="outline" size="icon-sm">
                <Heart className="h-4 w-4" />
              </MobileButton>
              <MobileButton variant="outline" size="icon">
                <Share className="h-4 w-4" />
              </MobileButton>
              <MobileButton variant="outline" size="icon-lg">
                <Settings className="h-4 w-4" />
              </MobileButton>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-medium mb-2">Button States</h3>
            <div className="flex flex-wrap gap-2">
              <MobileButton variant="default" haptic="light">Primary</MobileButton>
              <MobileButton variant="secondary" haptic="medium">Secondary</MobileButton>
              <MobileButton variant="destructive" haptic="heavy">Destructive</MobileButton>
              <MobileButton variant="outline" disabled>Disabled</MobileButton>
              <MobileButton loading>Loading</MobileButton>
            </div>
          </div>
        </div>
      </div>

      {/* Input Testing */}
      <div className="mobile-card">
        <h2 className="text-lg font-semibold mb-4">Mobile Input Testing</h2>
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">Search Input</label>
            <MobileSearchInput
              placeholder="Search for something..."
              onSearch={(value) => console.log('Search:', value)}
              fullWidth
            />
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Regular Input with Icon</label>
            <MobileInput
              placeholder="Enter your email"
              type="email"
              icon={<User className="h-4 w-4" />}
              clearable
              fullWidth
            />
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Auto-Resize Textarea</label>
            <MobileTextarea
              placeholder="Type your message here..."
              value={textareaValue}
              onChange={(e) => setTextareaValue(e.target.value)}
              autoResize
              fullWidth
            />
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Error State Input</label>
            <MobileInput
              placeholder="This input has an error"
              error
              fullWidth
            />
          </div>
        </div>
      </div>

      {/* Navigation Testing */}
      <div className="mobile-card">
        <h2 className="text-lg font-semibold mb-4">Mobile Navigation Testing</h2>

        {/* Tab Bar */}
        <div className="bg-muted p-2 rounded-lg">
          <h3 className="text-sm font-medium mb-2">Tab Bar Navigation</h3>
          <div className="flex bg-background rounded-lg p-1">
            {[
              { id: 'home', icon: Home, label: 'Home' },
              { id: 'search', icon: Search, label: 'Search' },
              { id: 'notifications', icon: Bell, label: 'Notifications' },
              { id: 'profile', icon: User, label: 'Profile' },
              { id: 'menu', icon: Menu, label: 'Menu' }
            ].map((tab) => {
              const Icon = tab.icon
              return (
                <TabBarButton
                  key={tab.id}
                  data-active={activeTab === tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  haptic="light"
                >
                  <Icon className="h-5 w-5" />
                  <span>{tab.label}</span>
                </TabBarButton>
              )
            })}
          </div>
        </div>
      </div>

      {/* Responsive Grid Testing */}
      <div className="mobile-card">
        <h2 className="text-lg font-semibold mb-4">Responsive Grid Testing</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((item) => (
            <div
              key={item}
              className="mobile-card bg-accent/50 text-center p-4 min-h-[100px] flex items-center justify-center"
            >
              <span className="font-medium">Card {item}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Touch Gesture Testing */}
      <div className="mobile-card">
        <h2 className="text-lg font-semibold mb-4">Touch Gesture Testing</h2>
        <div className="space-y-4">
          <div className="p-4 border-2 border-dashed border-muted-foreground rounded-lg text-center">
            <p className="text-sm text-muted-foreground mb-2">Swipe Test Area</p>
            <p className="text-xs">Try swiping in different directions</p>
          </div>

          <div className="flex justify-center">
            <MobileButton
              variant="outline"
              haptic="success"
              className="touch-feedback"
            >
              Tap for Haptic Feedback
            </MobileButton>
          </div>
        </div>
      </div>

      {/* Floating Action Button */}
      <FloatingActionButton haptic="medium">
        <Plus className="h-6 w-6" />
      </FloatingActionButton>

      {/* User Agent Info (for debugging) */}
      {deviceInfo.userAgent && (
        <div className="mobile-card">
          <h2 className="text-lg font-semibold mb-4">User Agent</h2>
          <p className="text-xs font-mono text-muted-foreground break-all">
            {deviceInfo.userAgent}
          </p>
        </div>
      )}

      {/* Bottom spacing for mobile navigation */}
      <div className="bottom-nav-spacing sm:hidden" />
    </div>
  )
}