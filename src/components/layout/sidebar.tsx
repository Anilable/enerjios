'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Badge } from '@/components/ui/badge'
import { 
  LayoutDashboard,
  Building,
  Users,
  FileText,
  Calculator,
  BarChart3,
  Settings,
  Shield,
  Tractor,
  Wheat,
  MapPin,
  Zap,
  PiggyBank,
  CreditCard,
  HelpCircle,
  ChevronRight,
  Sun,
  Database,
  UserCheck,
  ClipboardList,
  TrendingUp,
  Calendar,
  Bell,
  X,
  CheckCircle,
  Clock,
  Send,
  Compass,
  Camera,
  FolderKanban
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { getRoleName } from '@/lib/role-utils'

interface SidebarProps {
  isOpen: boolean
  onClose: () => void
}

interface NavItem {
  title: string
  href: string
  icon: React.ComponentType<{ className?: string }>
  badge?: string
  subItems?: NavItem[]
}

export const getNavItemsByRole = (role: string): NavItem[] => {
  switch (role) {
    case 'ADMIN':
      return [
        {
          title: 'Dashboard',
          href: '/dashboard',
          icon: LayoutDashboard,
        },
        {
          title: 'Proje Tasarımcısı',
          href: '/dashboard/designer',
          icon: Compass,
          badge: 'Yeni',
        },
        {
          title: 'Fotoğraf Talepleri',
          href: '/dashboard/photo-requests',
          icon: Camera,
        },
        {
          title: 'Proje Talepleri',
          href: '/dashboard/project-requests',
          icon: FolderKanban,
        },
        {
          title: 'Kullanıcı Yönetimi',
          href: '/dashboard/users',
          icon: Users,
          subItems: [
            { title: 'Tüm Kullanıcılar', href: '/dashboard/users', icon: Users },
            { title: 'Firmalar', href: '/dashboard/companies', icon: Building },
            { title: 'Müşteriler', href: '/dashboard/customers', icon: UserCheck },
            { title: 'Çiftçiler', href: '/dashboard/farmers', icon: Tractor },
          ]
        },
        {
          title: 'Sistem Yönetimi',
          href: '/dashboard/system',
          icon: Settings,
          subItems: [
            { title: 'Veritabanı', href: '/dashboard/database', icon: Database },
            { title: 'Ayarlar', href: '/dashboard/settings', icon: Settings },
            { title: 'Güvenlik', href: '/dashboard/security', icon: Shield },
          ]
        },
        {
          title: 'Raporlar',
          href: '/dashboard/reports',
          icon: BarChart3,
        },
        {
          title: 'Ürün Yönetimi',
          href: '/dashboard/products',
          icon: FileText,
        },
        {
          title: 'Finansal Veriler',
          href: '/dashboard/finance',
          icon: PiggyBank,
        },
        {
          title: 'Destek',
          href: '/dashboard/support',
          icon: HelpCircle,
        },
      ]

    case 'COMPANY':
      return [
        {
          title: 'Dashboard',
          href: '/dashboard',
          icon: LayoutDashboard,
        },
        {
          title: 'Proje Tasarımcısı',
          href: '/dashboard/designer',
          icon: Compass,
          badge: 'Yeni',
        },
        {
          title: 'Fotoğraf Talepleri',
          href: '/dashboard/photo-requests',
          icon: Camera,
        },
        {
          title: 'Proje Talepleri',
          href: '/dashboard/project-requests',
          icon: FolderKanban,
        },
        {
          title: 'Projelerim',
          href: '/dashboard/projects',
          icon: Building,
          badge: '12',
          subItems: [
            { title: 'Aktif Projeler', href: '/dashboard/projects/active', icon: Zap },
            { title: 'Tamamlanan', href: '/dashboard/projects/completed', icon: CheckCircle },
            { title: 'Bekleyen', href: '/dashboard/projects/pending', icon: Clock },
          ]
        },
        {
          title: 'Teklifler',
          href: '/dashboard/quotes',
          icon: FileText,
          badge: '5',
          subItems: [
            { title: 'Yeni Teklifler', href: '/dashboard/quotes/new', icon: FileText },
            { title: 'Gönderilen', href: '/dashboard/quotes/sent', icon: Send },
            { title: 'Kabul Edilen', href: '/dashboard/quotes/accepted', icon: CheckCircle },
          ]
        },
        {
          title: 'Müşterilerim',
          href: '/dashboard/customers',
          icon: Users,
          badge: '45',
        },
        {
          title: 'Ürün Kataloğu',
          href: '/dashboard/products',
          icon: Database,
        },
        {
          title: 'Kurulumlar',
          href: '/dashboard/installations',
          icon: Settings,
          subItems: [
            { title: 'Planlanan', href: '/dashboard/installations/scheduled', icon: Calendar },
            { title: 'Devam Eden', href: '/dashboard/installations/active', icon: Zap },
            { title: 'Tamamlanan', href: '/dashboard/installations/completed', icon: CheckCircle },
          ]
        },
        {
          title: 'Finansal',
          href: '/dashboard/finance',
          icon: PiggyBank,
          subItems: [
            { title: 'Gelirler', href: '/dashboard/finance/revenue', icon: TrendingUp },
            { title: 'Ödemeler', href: '/dashboard/finance/payments', icon: CreditCard },
            { title: 'Raporlar', href: '/dashboard/finance/reports', icon: BarChart3 },
          ]
        },
        {
          title: 'Ayarlar',
          href: '/dashboard/settings',
          icon: Settings,
        },
      ]

    case 'FARMER':
      return [
        {
          title: 'Dashboard',
          href: '/dashboard',
          icon: LayoutDashboard,
        },
        {
          title: 'Çiftliğim',
          href: '/dashboard/farm',
          icon: Tractor,
          subItems: [
            { title: 'Genel Bilgiler', href: '/dashboard/farm/overview', icon: MapPin },
            { title: 'Ürünlerim', href: '/dashboard/farm/crops', icon: Wheat },
            { title: 'Arazi Analizi', href: '/dashboard/farm/analysis', icon: BarChart3 },
          ]
        },
        {
          title: 'Tarımsal GES',
          href: '/dashboard/agrisolar',
          icon: Sun,
          subItems: [
            { title: 'Projelerim', href: '/dashboard/agrisolar/projects', icon: Building },
            { title: 'Ürün Uyumluluğu', href: '/dashboard/agrisolar/compatibility', icon: Wheat },
            { title: 'Verim Analizi', href: '/dashboard/agrisolar/yield', icon: TrendingUp },
          ]
        },
        {
          title: 'Enerji Üretimi',
          href: '/dashboard/energy',
          icon: Zap,
        },
        {
          title: 'Finansal Analiz',
          href: '/dashboard/finance',
          icon: PiggyBank,
          subItems: [
            { title: 'ROI Hesaplaması', href: '/dashboard/finance/roi', icon: Calculator },
            { title: 'Tasarruf Raporu', href: '/dashboard/finance/savings', icon: TrendingUp },
            { title: 'Teşvikler', href: '/dashboard/finance/incentives', icon: PiggyBank },
          ]
        },
        {
          title: 'Tekliflerim',
          href: '/dashboard/quotes',
          icon: FileText,
          badge: '3',
        },
        {
          title: 'Ayarlar',
          href: '/dashboard/settings',
          icon: Settings,
        },
      ]

    case 'INSTALLATION_TEAM':
      return [
        {
          title: 'Dashboard',
          href: '/dashboard',
          icon: LayoutDashboard,
        },
        {
          title: 'Proje Talepleri',
          href: '/dashboard/project-requests',
          icon: FolderKanban,
        },
        {
          title: 'Projeler',
          href: '/dashboard/projects',
          icon: Building,
          subItems: [
            { title: 'Kurulum Bekleyen', href: '/dashboard/projects/pending-installation', icon: Clock },
            { title: 'Kurulum Devam Eden', href: '/dashboard/projects/installing', icon: Settings },
            { title: 'Tamamlanan', href: '/dashboard/projects/completed', icon: CheckCircle },
          ]
        },
        {
          title: 'Kurulumlar',
          href: '/dashboard/installations',
          icon: Settings,
          subItems: [
            { title: 'Planlanan', href: '/dashboard/installations/scheduled', icon: Calendar },
            { title: 'Devam Eden', href: '/dashboard/installations/active', icon: Zap },
            { title: 'Tamamlanan', href: '/dashboard/installations/completed', icon: CheckCircle },
          ]
        },
        {
          title: 'Müşteri Bilgileri',
          href: '/dashboard/customers',
          icon: Users,
        },
        {
          title: 'Teknik Dokümanlar',
          href: '/dashboard/technical-docs',
          icon: FileText,
          subItems: [
            { title: 'Kurulum Kılavuzları', href: '/dashboard/technical-docs/guides', icon: FileText },
            { title: 'Teknik Şemalar', href: '/dashboard/technical-docs/schematics', icon: FileText },
            { title: 'Güvenlik Prosedürleri', href: '/dashboard/technical-docs/safety', icon: Shield },
          ]
        },
        {
          title: 'Raporlar',
          href: '/dashboard/reports',
          icon: BarChart3,
          subItems: [
            { title: 'Kurulum Raporları', href: '/dashboard/reports/installation', icon: BarChart3 },
            { title: 'İlerleme Takibi', href: '/dashboard/reports/progress', icon: TrendingUp },
            { title: 'Tamamlama Oranları', href: '/dashboard/reports/completion', icon: CheckCircle },
          ]
        },
        {
          title: 'Fotoğraf Talepleri',
          href: '/dashboard/photo-requests',
          icon: Camera,
        },
        {
          title: 'Ayarlar',
          href: '/dashboard/settings',
          icon: Settings,
        },
      ]

    case 'CUSTOMER':
    default:
      return [
        {
          title: 'Dashboard',
          href: '/dashboard',
          icon: LayoutDashboard,
        },
        {
          title: 'Proje Tasarımcısı',
          href: '/dashboard/designer',
          icon: Compass,
          badge: 'Yeni',
        },
        {
          title: 'Projelerim',
          href: '/projects',
          icon: Building,
          badge: '2',
        },
        {
          title: 'Tekliflerim',
          href: '/quotes',
          icon: FileText,
          badge: '3',
        },
        {
          title: 'GES Hesaplayıcı',
          href: '/calculator',
          icon: Calculator,
        },
        {
          title: 'Agrovoltaik Sistem',
          href: '/dashboard/agri-solar',
          icon: Tractor,
          subItems: [
            { title: 'Sistem Hesaplayıcı', href: '/dashboard/agri-solar', icon: Calculator },
            { title: 'Ürün Uyumluluğu', href: '/dashboard/agri-solar#crops', icon: Wheat },
            { title: 'Çiftlik Yönetimi', href: '/dashboard/agri-solar#dashboard', icon: BarChart3 },
            { title: 'Özel Sistemler', href: '/dashboard/agri-solar#specialized', icon: Sun },
          ]
        },
        {
          title: 'Enerji Üretimi',
          href: '/energy',
          icon: Zap,
        },
        {
          title: 'Finansal Analiz',
          href: '/dashboard/financing',
          icon: PiggyBank,
          subItems: [
            { title: 'Kredi Hesaplayıcı', href: '/dashboard/financing', icon: Calculator },
            { title: 'Banka Karşılaştırma', href: '/dashboard/financing#banks', icon: Building },
            { title: 'Devlet Teşvikleri', href: '/dashboard/financing#incentives', icon: TrendingUp },
            { title: 'Senaryo Analizi', href: '/dashboard/financing#scenarios', icon: BarChart3 },
          ]
        },
        {
          title: 'Belgelerim',
          href: '/documents',
          icon: ClipboardList,
        },
        {
          title: 'Destek',
          href: '/support',
          icon: HelpCircle,
        },
        {
          title: 'Ayarlar',
          href: '/settings',
          icon: Settings,
        },
      ]
  }
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const { data: session } = useSession()
  const pathname = usePathname()
  const [expandedItems, setExpandedItems] = useState<string[]>([])

  if (!session) return null

  const navItems = getNavItemsByRole(session.user.role)

  const toggleExpanded = (href: string) => {
    setExpandedItems(prev => 
      prev.includes(href) 
        ? prev.filter(item => item !== href)
        : [...prev, href]
    )
  }

  const renderNavItem = (item: NavItem, depth = 0) => {
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
              onClose() // Close sidebar on mobile after navigation
            }
          }}
          className={cn(
            'flex items-center justify-between w-full px-3 py-2 text-sm font-medium rounded-lg transition-colors',
            depth > 0 ? 'ml-4 pl-8' : '',
            isActive 
              ? 'bg-primary text-primary-foreground' 
              : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
          )}
        >
          <div className="flex items-center space-x-3">
            <Icon className={cn('h-4 w-4', isActive ? 'text-primary-foreground' : 'text-gray-500')} />
            <span>{item.title}</span>
          </div>
          
          <div className="flex items-center space-x-2">
            {item.badge && (
              <Badge variant="secondary" className="text-xs">
                {item.badge}
              </Badge>
            )}
            {hasSubItems && (
              <ChevronRight 
                className={cn(
                  'h-4 w-4 transition-transform',
                  isExpanded ? 'rotate-90' : ''
                )}
              />
            )}
          </div>
        </Link>

        {hasSubItems && isExpanded && (
          <div className="mt-1 space-y-1">
            {item.subItems!.map(subItem => renderNavItem(subItem, depth + 1))}
          </div>
        )}
      </div>
    )
  }

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-20 bg-black/50 md:hidden" 
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div className={cn(
        'fixed left-0 top-0 z-30 h-full w-64 transform bg-white border-r transition-transform duration-200 ease-in-out md:relative md:translate-x-0',
        isOpen ? 'translate-x-0' : '-translate-x-full'
      )}>
        {/* Sidebar Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center space-x-2">
            <Sun className="h-6 w-6 text-primary" />
            <div>
              <h2 className="font-semibold text-gray-900">Dashboard</h2>
              <p className="text-xs text-gray-500">{getRoleName(session.user.role)}</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="md:hidden"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Navigation */}
        <ScrollArea className="flex-1 px-3 py-4">
          <nav className="space-y-2">
            {navItems.map(item => renderNavItem(item))}
          </nav>
        </ScrollArea>

        {/* Sidebar Footer */}
        <div className="p-4 border-t">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
              <Sun className="h-4 w-4 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {session.user.name}
              </p>
              <p className="text-xs text-gray-500 truncate">
                {session.user.email}
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}