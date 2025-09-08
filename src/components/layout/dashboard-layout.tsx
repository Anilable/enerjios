'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { usePathname } from 'next/navigation'
import { Header } from './Header'
import { Sidebar } from './sidebar'
import { Footer } from './footer'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { Button } from '@/components/ui/button'
import { ChevronRight, Home } from 'lucide-react'
import Link from 'next/link'

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

  // Check if mobile on mount and resize
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
      if (window.innerWidth >= 768) {
        setSidebarOpen(false) // Close sidebar on desktop
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

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen)

  // Generate breadcrumbs from pathname if not provided
  const generateBreadcrumbs = () => {
    if (breadcrumbs.length > 0) return breadcrumbs

    const pathSegments = pathname.split('/').filter(Boolean)
    const crumbs = [{ label: 'Anasayfa', href: '/' }]

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
        href: index === pathSegments.length - 1 ? undefined : currentPath
      })
    })

    return crumbs
  }

  const currentBreadcrumbs = generateBreadcrumbs()

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <Header onSidebarToggle={toggleSidebar} />

      <div className="flex">
        {/* Sidebar */}
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        {/* Main Content */}
        <main className="flex-1 min-h-[calc(100vh-4rem)]">
          {/* Content Area */}
          <div className="p-4 md:p-6 lg:p-8">
            {/* Breadcrumbs */}
            {currentBreadcrumbs.length > 1 && (
              <nav className="mb-6">
                <div className="flex items-center space-x-1 text-sm text-gray-500">
                  {currentBreadcrumbs.map((crumb, index) => (
                    <div key={index} className="flex items-center">
                      {index === 0 && <Home className="w-4 h-4 mr-1" />}
                      
                      {crumb.href ? (
                        <Link 
                          href={crumb.href}
                          className="hover:text-gray-900 transition-colors"
                        >
                          {crumb.label}
                        </Link>
                      ) : (
                        <span className="text-gray-900 font-medium">
                          {crumb.label}
                        </span>
                      )}
                      
                      {index < currentBreadcrumbs.length - 1 && (
                        <ChevronRight className="w-4 h-4 mx-1" />
                      )}
                    </div>
                  ))}
                </div>
              </nav>
            )}

            {/* Page Title */}
            {title && (
              <div className="mb-8">
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
                  {title}
                </h1>
              </div>
            )}

            {/* Page Content */}
            <div className="space-y-6">
              {children}
            </div>
          </div>
        </main>
      </div>

      {/* Footer - Hidden on mobile to save space */}
      <div className="hidden lg:block">
        <Footer />
      </div>
    </div>
  )
}

// Simplified layout for authentication pages
export function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-yellow-50">
      {children}
    </div>
  )
}

// Public layout (for homepage, about, etc.)
export function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      <main>
        {children}
      </main>
      <Footer />
    </div>
  )
}