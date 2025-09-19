'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useSession } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { UserNav } from './user-nav'
import { ThemeToggle } from '@/components/ui/theme-toggle'
import NotificationCenter from '@/components/notifications/NotificationCenter'
import { EnerjiOSLogo, EnerjiOSLogoSmall } from '@/components/ui/energyos-logo'
import {
  Sun,
  Menu,
  X,
  Bell,
  Search,
  Calculator,
  FileText,
  Users,
  HelpCircle,
  ArrowLeft,
  TrendingUp
} from 'lucide-react'
import { getRoleName, getRoleColor } from '@/lib/role-utils'
import { MobileMenuButton } from '@/components/mobile/MobileMenuButton'

interface HeaderProps {
  onSidebarToggle?: () => void
}

export function Header({ onSidebarToggle }: HeaderProps) {
  const { data: session } = useSession()
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [notifications] = useState(3) // Mock notification count

  const publicNavItems = [
    { href: '/calculator', label: 'GES Hesaplayıcı', icon: Calculator },
    { href: '/products', label: 'Ürünler', icon: FileText },
    { href: '/companies', label: 'Firmalar', icon: Users },
    { href: '/partner/register', label: 'Partner Ol', icon: TrendingUp },
    { href: '/help', label: 'Yardım', icon: HelpCircle },
  ]

  const handleSidebarToggle = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen)
    onSidebarToggle?.()
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-3 sm:px-4 lg:px-8">
        <div className="flex h-14 sm:h-16 items-center justify-between">
          {/* Left: Logo + Sidebar Toggle */}
          <div className="flex items-center space-x-2 sm:space-x-4 min-w-0 flex-1">
            {session && onSidebarToggle && (
              <MobileMenuButton
                isOpen={isMobileMenuOpen}
                onToggle={handleSidebarToggle}
                className="flex-shrink-0"
              />
            )}

            <Link href={session ? "/dashboard" : "/"} className="flex items-center space-x-2 min-w-0">
              <div className="hidden sm:block flex-shrink-0">
                <EnerjiOSLogo className="h-10 sm:h-12 w-auto" />
              </div>
              <div className="block sm:hidden flex-shrink-0">
                <EnerjiOSLogoSmall className="h-8 w-8" />
              </div>
            </Link>

            {session && (
              <Badge
                variant="secondary"
                className={`hidden lg:flex text-xs ${getRoleColor(session.user.role)}`}
              >
                {getRoleName(session.user.role)}
              </Badge>
            )}
          </div>

          {/* Center: Navigation (Desktop Only) */}
          {!session && (
            <nav className="hidden lg:flex items-center space-x-6">
              {publicNavItems.map((item) => {
                const Icon = item.icon

                // Special handling for "Firmalar" link
                if (item.href === '/companies') {
                  return (
                    <button
                      key={item.href}
                      onClick={(e) => {
                        e.preventDefault()
                        e.stopPropagation()

                        console.log('Firmalar clicked, current path:', window.location.pathname)

                        // If we're on homepage, scroll to companies section
                        if (window.location.pathname === '/') {
                          const companiesSection = document.querySelector('#companies-section')
                          console.log('Companies section found:', companiesSection)
                          if (companiesSection) {
                            companiesSection.scrollIntoView({ behavior: 'smooth' })
                          } else {
                            console.log('Companies section not found, will wait and retry')
                            setTimeout(() => {
                              const retrySection = document.querySelector('#companies-section')
                              if (retrySection) {
                                retrySection.scrollIntoView({ behavior: 'smooth' })
                              }
                            }, 100)
                          }
                        } else {
                          // If we're on another page, go to homepage and then scroll
                          console.log('Not on homepage, redirecting to /#companies-section')
                          window.location.href = '/#companies-section'
                        }
                      }}
                      className="flex items-center space-x-1 text-sm font-medium text-muted-foreground hover:text-primary transition-colors cursor-pointer"
                    >
                      <Icon className="h-4 w-4" />
                      <span>{item.label}</span>
                    </button>
                  )
                }

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="flex items-center space-x-1 text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
                  >
                    <Icon className="h-4 w-4" />
                    <span>{item.label}</span>
                  </Link>
                )
              })}
            </nav>
          )}

          {/* Right: Search + Notifications + User */}
          <div className="flex items-center space-x-1 sm:space-x-2 flex-shrink-0">
            {/* Mobile Search Button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsSearchOpen(!isSearchOpen)}
              className="flex sm:hidden p-2 touch-manipulation active:scale-95"
              aria-label="Ara"
            >
              <Search className="h-4 w-4" />
            </Button>

            {/* Desktop Search Button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsSearchOpen(!isSearchOpen)}
              className="hidden sm:flex px-3 touch-manipulation"
            >
              <Search className="h-4 w-4" />
              <span className="sr-only">Ara</span>
            </Button>

            {/* Notifications */}
            {session && (
              <div className="relative">
                <NotificationCenter />
              </div>
            )}

            {/* Theme Toggle */}
            <div className="hidden sm:block">
              <ThemeToggle />
            </div>

            {/* User Navigation */}
            {session ? (
              <UserNav />
            ) : (
              <div className="flex items-center space-x-1 sm:space-x-2">
                <Button variant="ghost" size="sm" asChild className="px-2 sm:px-4 text-xs sm:text-sm">
                  <Link href="/auth/signin">Giriş</Link>
                </Button>
                <Button size="sm" asChild className="hidden sm:flex px-4">
                  <Link href="/auth/signup">Kayıt Ol</Link>
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Search Bar (Expandable) */}
        {isSearchOpen && (
          <div className="px-3 sm:px-4 pb-3 sm:pb-4 animate-in slide-in-from-top-2 duration-200">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Proje, firma veya ürün ara..."
                className="w-full pl-10 pr-12 py-3 sm:py-2 border border-border rounded-xl sm:rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary bg-background text-foreground text-sm sm:text-base transition-all duration-200 touch-manipulation"
                autoFocus
              />
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsSearchOpen(false)}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 touch-manipulation active:scale-95"
                aria-label="Aramayı kapat"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Mobile Public Navigation */}
      {!session && (
        <div className="lg:hidden border-t bg-background/95 backdrop-blur">
          <nav className="container mx-auto px-3 py-3">
            <div className="grid grid-cols-2 gap-2">
              {publicNavItems.map((item) => {
                const Icon = item.icon
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="flex items-center space-x-2 p-3 text-sm font-medium text-muted-foreground hover:text-primary hover:bg-accent rounded-xl transition-colors touch-manipulation active:scale-95"
                  >
                    <Icon className="h-4 w-4 flex-shrink-0" />
                    <span className="truncate">{item.label}</span>
                  </Link>
                )
              })}
            </div>
          </nav>
        </div>
      )}
    </header>
  )
}