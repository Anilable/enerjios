'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Badge } from '@/components/ui/badge'
import {
  X,
  ChevronRight,
  Sun,
  Home,
  Search,
  Bell,
  User,
  Settings
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { getRoleName, getRoleColor } from '@/lib/role-utils'
import { useTouch } from '@/hooks/useTouch'

interface MobileSidebarProps {
  isOpen: boolean
  onClose: () => void
  navItems: Array<{
    title: string
    href: string
    icon: React.ComponentType<{ className?: string }>
    badge?: string
    subItems?: Array<{
      title: string
      href: string
      icon: React.ComponentType<{ className?: string }>
    }>
  }>
}

export function MobileSidebar({ isOpen, onClose, navItems }: MobileSidebarProps) {
  const { data: session } = useSession()
  const pathname = usePathname()
  const [expandedItems, setExpandedItems] = useState<string[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [isSearchFocused, setIsSearchFocused] = useState(false)

  // Close sidebar when route changes
  useEffect(() => {
    onClose()
  }, [pathname, onClose])

  // Touch gestures for swipe to close
  const { ref: sidebarRef } = useTouch({
    onSwipeLeft: () => {
      if (isOpen) {
        onClose()
      }
    }
  })

  // Filter nav items based on search
  const filteredNavItems = navItems.filter(item =>
    item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.subItems?.some(subItem =>
      subItem.title.toLowerCase().includes(searchQuery.toLowerCase())
    )
  )

  const toggleExpanded = (href: string) => {
    setExpandedItems(prev =>
      prev.includes(href)
        ? prev.filter(item => item !== href)
        : [...prev, href]
    )
  }

  const renderNavItem = (item: any, depth = 0) => {
    const Icon = item.icon
    const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
    const isExpanded = expandedItems.includes(item.href)
    const hasSubItems = item.subItems && item.subItems.length > 0

    return (
      <div key={item.href}>
        <Link
          href={hasSubItems ? '#' : item.href}
          onClick={(e) => {
            if (hasSubItems) {
              e.preventDefault()
              toggleExpanded(item.href)
            } else {
              onClose()
            }
          }}
          className={cn(
            'flex items-center justify-between w-full p-3 text-sm font-medium rounded-xl transition-all duration-200',
            'touch-manipulation active:scale-95', // Touch feedback
            depth > 0 ? 'ml-4 pl-8' : '',
            isActive
              ? 'bg-primary text-primary-foreground shadow-md'
              : 'text-foreground hover:bg-accent hover:text-accent-foreground'
          )}
        >
          <div className="flex items-center space-x-3 min-w-0">
            <Icon className={cn(
              'h-5 w-5 flex-shrink-0',
              isActive ? 'text-primary-foreground' : 'text-muted-foreground'
            )} />
            <span className="truncate">{item.title}</span>
          </div>

          <div className="flex items-center space-x-2 flex-shrink-0">
            {item.badge && (
              <Badge variant="secondary" className="text-xs px-2 py-0.5">
                {item.badge}
              </Badge>
            )}
            {hasSubItems && (
              <ChevronRight
                className={cn(
                  'h-4 w-4 transition-transform duration-200 flex-shrink-0',
                  isExpanded ? 'rotate-90' : ''
                )}
              />
            )}
          </div>
        </Link>

        {hasSubItems && isExpanded && (
          <div className="mt-1 space-y-1 animate-in slide-in-from-top-2 duration-200">
            {item.subItems!.map((subItem: any) => renderNavItem(subItem, depth + 1))}
          </div>
        )}
      </div>
    )
  }

  if (!session) return null

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm md:hidden animate-in fade-in duration-200"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div
        ref={sidebarRef}
        className={cn(
          'fixed left-0 top-0 z-50 h-full w-80 max-w-[85vw] transform bg-background border-r shadow-2xl transition-transform duration-300 ease-out md:hidden',
          'animate-in slide-in-from-left duration-300',
          isOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b bg-muted/50">
          <div className="flex items-center space-x-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
              <Sun className="h-5 w-5 text-primary" />
            </div>
            <div className="min-w-0">
              <h2 className="font-semibold text-foreground truncate">EnerjiOS</h2>
              <div className="flex items-center space-x-2">
                <Badge
                  variant="secondary"
                  className={cn('text-xs', getRoleColor(session.user.role))}
                >
                  {getRoleName(session.user.role)}
                </Badge>
              </div>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="flex-shrink-0 touch-manipulation active:scale-95"
            aria-label="Menüyü kapat"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Search Bar */}
        <div className="p-4 border-b bg-muted/30">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Menü ara..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setIsSearchFocused(true)}
              onBlur={() => setIsSearchFocused(false)}
              className={cn(
                "w-full pl-10 pr-4 py-3 border border-border rounded-xl text-sm",
                "focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary",
                "bg-background text-foreground placeholder:text-muted-foreground",
                "transition-all duration-200",
                isSearchFocused && "shadow-sm"
              )}
            />
          </div>
        </div>

        {/* Quick Actions */}
        <div className="p-4 border-b">
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
            Hızlı Erişim
          </h3>
          <div className="grid grid-cols-4 gap-3">
            <Link
              href="/dashboard"
              onClick={onClose}
              className="flex flex-col items-center p-3 rounded-xl bg-accent/50 hover:bg-accent transition-colors touch-manipulation active:scale-95"
            >
              <Home className="h-5 w-5 text-primary mb-1" />
              <span className="text-xs text-center text-muted-foreground">Ana Sayfa</span>
            </Link>
            <Link
              href="/dashboard/search"
              onClick={onClose}
              className="flex flex-col items-center p-3 rounded-xl bg-accent/50 hover:bg-accent transition-colors touch-manipulation active:scale-95"
            >
              <Search className="h-5 w-5 text-primary mb-1" />
              <span className="text-xs text-center text-muted-foreground">Ara</span>
            </Link>
            <Link
              href="/dashboard/notifications"
              onClick={onClose}
              className="flex flex-col items-center p-3 rounded-xl bg-accent/50 hover:bg-accent transition-colors touch-manipulation active:scale-95"
            >
              <Bell className="h-5 w-5 text-primary mb-1" />
              <span className="text-xs text-center text-muted-foreground">Bildirim</span>
            </Link>
            <Link
              href="/dashboard/settings"
              onClick={onClose}
              className="flex flex-col items-center p-3 rounded-xl bg-accent/50 hover:bg-accent transition-colors touch-manipulation active:scale-95"
            >
              <Settings className="h-5 w-5 text-primary mb-1" />
              <span className="text-xs text-center text-muted-foreground">Ayarlar</span>
            </Link>
          </div>
        </div>

        {/* Navigation */}
        <ScrollArea className="flex-1 px-4 py-2">
          <nav className="space-y-2">
            {filteredNavItems.length > 0 ? (
              filteredNavItems.map(item => renderNavItem(item))
            ) : (
              <div className="text-center py-8">
                <Search className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">Arama sonucu bulunamadı</p>
              </div>
            )}
          </nav>
        </ScrollArea>

        {/* Footer */}
        <div className="p-4 border-t bg-muted/30">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
              <User className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate">
                {session.user.name}
              </p>
              <p className="text-xs text-muted-foreground truncate">
                {session.user.email}
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}