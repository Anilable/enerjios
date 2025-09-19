'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { usePathname } from 'next/navigation'
import { Header } from './Header'
import { Sidebar } from './sidebar'
import { MobileSidebar } from '@/components/mobile/MobileSidebar'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { Footer } from './footer'
import { Button } from '@/components/ui/button'
import { ChevronRight, Home } from 'lucide-react'
import Link from 'next/link'
import { getNavItemsByRole } from './sidebar'

interface DashboardLayoutProps {
  children: React.ReactNode
  title?: string
  breadcrumbs?: Array<{
    label: string
    href?: string
  }>
}

export function DashboardLayout({ 
  children, 
  title,
  breadcrumbs = [] 
}: DashboardLayoutProps) {
  const { data: session, status } = useSession()
  const pathname = usePathname()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false)

  // Check if mobile on mount and resize
  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 768
      setIsMobile(mobile)
      if (!mobile) {
        setSidebarOpen(false) // Close sidebar on desktop
        setMobileSidebarOpen(false) // Close mobile sidebar on desktop
      }
    }

    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // Close sidebar when route changes (mobile)
  useEffect(() => {
    if (isMobile) {
      setSidebarOpen(false)
      setMobileSidebarOpen(false)
    }
  }, [pathname, isMobile])

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="xl" text="Yükleniyor..." />
      </div>
    )
  }

  if (!session) {
    return null // Middleware should handle redirect
  }

  const toggleSidebar = () => {
    if (isMobile) {
      setMobileSidebarOpen(!mobileSidebarOpen)
    } else {
      setSidebarOpen(!sidebarOpen)
    }
  }

  // Generate breadcrumbs from pathname if not provided
  const generateBreadcrumbs = () => {
    if (breadcrumbs.length > 0) return breadcrumbs

    const pathSegments = pathname.split('/').filter(Boolean)
    const crumbs = [{ label: 'Dashboard', href: '/dashboard' }]

    let currentPath = ''
    pathSegments.forEach((segment, index) => {
      currentPath += `/${segment}`
      
      // Convert segment to readable label
      let label = segment
      if (segment === 'dashboard') label = 'Dashboard'
      else if (segment === 'projects') label = 'Projeler'
      else if (segment === 'quotes') label = 'Teklifler'
      else if (segment === 'company') label = 'Firma'
      else if (segment === 'farmer') label = 'Çiftçi'
      else if (segment === 'admin') label = 'Yönetici'
      else if (segment === 'customers') label = 'Müşteriler'
      else if (segment === 'products') label = 'Ürünler'
      else if (segment === 'photo-requests') label = 'Fotoğraf Talepleri'
      else if (segment === 'settings') label = 'Ayarlar'
      else if (segment === 'finance') label = 'Finansal'
      else if (segment === 'reports') label = 'Raporlar'

      crumbs.push({
        label: label.charAt(0).toUpperCase() + label.slice(1),
        href: index === pathSegments.length - 1 ? '' : currentPath
      })
    })

    return crumbs
  }

  const currentBreadcrumbs = generateBreadcrumbs()

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <Header onSidebarToggle={toggleSidebar} />

      <div className="flex">
        {/* Desktop Sidebar */}
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        {/* Mobile Sidebar */}
        {isMobile && (
          <MobileSidebar
            isOpen={mobileSidebarOpen}
            onClose={() => setMobileSidebarOpen(false)}
            navItems={getNavItemsByRole(session.user.role)}
          />
        )}

        {/* Main Content */}
        <main className="flex-1 min-h-[calc(100vh-3.5rem)] sm:min-h-[calc(100vh-4rem)]">
          {/* Content Area */}
          <div className="p-3 sm:p-4 md:p-6 lg:p-8">
            {/* Breadcrumbs */}
            {currentBreadcrumbs.length > 1 && (
              <nav className="mb-4 sm:mb-6">
                <div className="flex items-center space-x-1 text-xs sm:text-sm text-muted-foreground overflow-x-auto pb-1">
                  {currentBreadcrumbs.map((crumb, index) => (
                    <div key={index} className="flex items-center flex-shrink-0">
                      {index === 0 && <Home className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />}

                      {crumb.href ? (
                        <Link
                          href={crumb.href}
                          className="hover:text-foreground transition-colors whitespace-nowrap touch-manipulation"
                        >
                          {crumb.label}
                        </Link>
                      ) : (
                        <span className="text-foreground font-medium whitespace-nowrap">
                          {crumb.label}
                        </span>
                      )}

                      {index < currentBreadcrumbs.length - 1 && (
                        <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4 mx-1 flex-shrink-0" />
                      )}
                    </div>
                  ))}
                </div>
              </nav>
            )}

            {/* Page Title */}
            {title && (
              <div className="mb-6 sm:mb-8">
                <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-foreground leading-tight">
                  {title}
                </h1>
              </div>
            )}

            {/* Page Content */}
            <div className="space-y-4 sm:space-y-6">
              {children}
            </div>
          </div>
        </main>
      </div>

    </div>
  )
}

// Simplified layout for authentication pages
export function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-yellow-50 dark:from-orange-950 dark:to-yellow-950">
      {children}
    </div>
  )
}

// Public layout (for homepage, about, etc.)
export function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        {children}
      </main>
      <Footer />
    </div>
  )
}