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
  HelpCircle
} from 'lucide-react'
import { getRoleName, getRoleColor } from '@/lib/role-utils'

interface HeaderProps {
  onSidebarToggle?: () => void
}

export function Header({ onSidebarToggle }: HeaderProps) {
  const { data: session } = useSession()
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [notifications] = useState(3) // Mock notification count

  const publicNavItems = [
    { href: '/calculator', label: 'GES Hesaplayıcı', icon: Calculator },
    { href: '/products', label: 'Ürünler', icon: FileText },
    { href: '/companies', label: 'Firmalar', icon: Users },
    { href: '/help', label: 'Yardım', icon: HelpCircle },
  ]

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Left: Logo + Sidebar Toggle */}
          <div className="flex items-center space-x-4">
            {session && onSidebarToggle && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onSidebarToggle}
                className="md:hidden"
              >
                <Menu className="h-5 w-5" />
              </Button>
            )}

            <Link href={session ? "/dashboard" : "/"} className="flex items-center space-x-2">
              <div className="hidden sm:block">
                <EnerjiOSLogo className="h-12 w-auto" />
              </div>
              <div className="block sm:hidden">
                <EnerjiOSLogoSmall className="h-10 w-10" />
              </div>
            </Link>

            {session && (
              <Badge 
                variant="secondary" 
                className={`hidden sm:flex ${getRoleColor(session.user.role)}`}
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
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="flex items-center space-x-1 text-sm font-medium text-gray-600 hover:text-primary transition-colors"
                  >
                    <Icon className="h-4 w-4" />
                    <span>{item.label}</span>
                  </Link>
                )
              })}
            </nav>
          )}

          {/* Right: Search + Notifications + User */}
          <div className="flex items-center space-x-2 sm:space-x-4">
            {/* Search Button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsSearchOpen(!isSearchOpen)}
              className="hidden sm:flex"
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
            <ThemeToggle />

            {/* User Navigation */}
            {session ? (
              <UserNav />
            ) : (
              <div className="flex items-center space-x-2">
                <Button variant="ghost" size="sm" asChild>
                  <Link href="/auth/signin">Giriş Yap</Link>
                </Button>
                <Button size="sm" asChild className="hidden sm:flex">
                  <Link href="/auth/signup">Kayıt Ol</Link>
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Search Bar (Expandable) */}
        {isSearchOpen && (
          <div className="pb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Proje, firma veya ürün ara..."
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                autoFocus
              />
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsSearchOpen(false)}
                className="absolute right-2 top-1/2 transform -translate-y-1/2"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Mobile Menu Overlay */}
      {!session && (
        <div className="lg:hidden border-t bg-white">
          <nav className="container mx-auto px-4 py-3">
            <div className="grid grid-cols-2 gap-2">
              {publicNavItems.map((item) => {
                const Icon = item.icon
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="flex items-center space-x-2 p-2 text-sm font-medium text-gray-600 hover:text-primary hover:bg-gray-50 rounded-lg transition-colors"
                  >
                    <Icon className="h-4 w-4" />
                    <span>{item.label}</span>
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