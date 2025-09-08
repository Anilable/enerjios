'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { 
  Home, 
  BarChart3, 
  Users, 
  FileText, 
  Settings,
  Menu,
  X,
  Sun,
  Calculator,
  Building,
  Zap,
  ChevronRight
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { Badge } from '@/components/ui/badge'
import { useTouch } from '@/hooks/useTouch'
import { cn } from '@/lib/utils'

const mobileNavItems = [
  {
    title: 'Ana Sayfa',
    href: '/dashboard',
    icon: Home,
    roles: ['ADMIN', 'COMPANY', 'EMPLOYEE']
  },
  {
    title: 'Projeler',
    href: '/dashboard/projects',
    icon: Building,
    roles: ['ADMIN', 'COMPANY', 'EMPLOYEE']
  },
  {
    title: 'Müşteriler',
    href: '/dashboard/customers',
    icon: Users,
    roles: ['ADMIN', 'COMPANY', 'EMPLOYEE']
  },
  {
    title: 'Teklifler',
    href: '/dashboard/quotes',
    icon: FileText,
    roles: ['ADMIN', 'COMPANY', 'EMPLOYEE']
  },
  {
    title: 'Analitik',
    href: '/dashboard/analytics',
    icon: BarChart3,
    roles: ['ADMIN', 'COMPANY', 'EMPLOYEE']
  }
]

const quickActions = [
  {
    title: 'GES Tasarımcısı',
    href: '/dashboard/designer',
    icon: Sun,
    color: 'bg-yellow-500'
  },
  {
    title: 'Hesaplayıcı',
    href: '/calculator',
    icon: Calculator,
    color: 'bg-blue-500'
  },
  {
    title: 'Tarımsal GES',
    href: '/dashboard/agri-solar',
    icon: Zap,
    color: 'bg-green-500'
  }
]

interface MobileNavigationProps {
  className?: string
}

export default function MobileNavigation({ className }: MobileNavigationProps) {
  const { data: session } = useSession()
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)

  // Touch gestures for navigation drawer
  const { ref } = useTouch({
    onSwipeRight: () => {
      if (!isOpen && pathname.startsWith('/dashboard')) {
        setIsOpen(true)
      }
    },
    onSwipeLeft: () => {
      if (isOpen) {
        setIsOpen(false)
      }
    }
  })

  if (!session) return null

  const filteredNavItems = mobileNavItems.filter(item => 
    item.roles.includes(session.user.role as string)
  )

  const activeItem = filteredNavItems.find(item => pathname === item.href)

  return (
    <>
      {/* Bottom Navigation Bar */}
      <nav className={cn(
        "fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 md:hidden z-40",
        className
      )}>
        <div className="grid grid-cols-5 h-16">
          {filteredNavItems.slice(0, 4).map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href
            
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex flex-col items-center justify-center space-y-1 text-xs transition-colors",
                  isActive 
                    ? "text-blue-600 bg-blue-50" 
                    : "text-gray-600 hover:text-gray-900"
                )}
              >
                <Icon className={cn("h-5 w-5", isActive && "text-blue-600")} />
                <span className="truncate">{item.title}</span>
              </Link>
            )
          })}
          
          {/* Menu Button */}
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                className="flex flex-col items-center justify-center space-y-1 text-xs h-full rounded-none"
              >
                <Menu className="h-5 w-5" />
                <span>Menü</span>
              </Button>
            </SheetTrigger>
            
            <SheetContent side="right" className="w-80 p-0">
              <MobileMenu onClose={() => setIsOpen(false)} />
            </SheetContent>
          </Sheet>
        </div>
      </nav>

      {/* Touch Area for Swipe Gesture */}
      <div
        ref={ref}
        className="fixed left-0 top-0 w-4 h-full z-30 md:hidden pointer-events-auto"
        style={{ touchAction: 'pan-y' }}
      />

      {/* Content Padding for Bottom Navigation */}
      <div className="pb-16 md:pb-0" />
    </>
  )
}

function MobileMenu({ onClose }: { onClose: () => void }) {
  const { data: session } = useSession()
  const pathname = usePathname()

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center space-x-3">
          <Sun className="h-6 w-6 text-blue-600" />
          <div>
            <h2 className="font-semibold">EnerjiOS</h2>
            <p className="text-sm text-gray-500">{session?.user?.name}</p>
          </div>
        </div>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="h-5 w-5" />
        </Button>
      </div>

      {/* Quick Actions */}
      <div className="p-4 border-b">
        <h3 className="text-sm font-medium text-gray-500 mb-3">Hızlı Erişim</h3>
        <div className="grid grid-cols-3 gap-3">
          {quickActions.map((action) => {
            const Icon = action.icon
            
            return (
              <Link
                key={action.href}
                href={action.href}
                onClick={onClose}
                className="flex flex-col items-center p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
              >
                <div className={cn("p-2 rounded-full text-white mb-2", action.color)}>
                  <Icon className="h-4 w-4" />
                </div>
                <span className="text-xs text-center">{action.title}</span>
              </Link>
            )
          })}
        </div>
      </div>

      {/* Navigation Items */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-4">
          <h3 className="text-sm font-medium text-gray-500 mb-3">Navigasyon</h3>
          <nav className="space-y-1">
            {mobileNavItems.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href
              
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onClose}
                  className={cn(
                    "flex items-center justify-between p-3 rounded-lg transition-colors",
                    isActive
                      ? "bg-blue-50 text-blue-600"
                      : "text-gray-700 hover:bg-gray-50"
                  )}
                >
                  <div className="flex items-center space-x-3">
                    <Icon className="h-5 w-5" />
                    <span className="font-medium">{item.title}</span>
                  </div>
                  <ChevronRight className="h-4 w-4 text-gray-400" />
                </Link>
              )
            })}
          </nav>
        </div>

        {/* Admin Only Section */}
        {session?.user?.role === 'ADMIN' && (
          <div className="p-4 border-t">
            <h3 className="text-sm font-medium text-gray-500 mb-3">Yönetim</h3>
            <nav className="space-y-1">
              <Link
                href="/dashboard/admin/companies"
                onClick={onClose}
                className="flex items-center justify-between p-3 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <Building className="h-5 w-5" />
                  <span className="font-medium">Firmalar</span>
                </div>
                <ChevronRight className="h-4 w-4 text-gray-400" />
              </Link>
              
              <Link
                href="/dashboard/admin/products"
                onClick={onClose}
                className="flex items-center justify-between p-3 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <Settings className="h-5 w-5" />
                  <span className="font-medium">Ürün Yönetimi</span>
                </div>
                <ChevronRight className="h-4 w-4 text-gray-400" />
              </Link>
            </nav>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="p-4 border-t bg-gray-50">
        <div className="text-center">
          <p className="text-xs text-gray-500">
            EnerjiOS v2.0
          </p>
          <Badge variant="secondary" className="mt-1">
            {session?.user?.role === 'ADMIN' ? 'Yönetici' : 
             session?.user?.role === 'COMPANY' ? 'Firma' : 'Çalışan'}
          </Badge>
        </div>
      </div>
    </div>
  )
}