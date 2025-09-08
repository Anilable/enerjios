'use client'

import { signOut, useSession } from 'next-auth/react'
import Link from 'next/link'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Badge } from '@/components/ui/badge'
import {
  User,
  Settings,
  LogOut,
  Building,
  Tractor,
  Shield,
  Wallet,
  CreditCard,
  HelpCircle,
} from 'lucide-react'
import { getRoleName, getRoleColor } from '@/lib/auth-utils'

export function UserNav() {
  const { data: session } = useSession()

  if (!session?.user) {
    return (
      <div className="flex items-center space-x-2">
        <Button variant="ghost" asChild>
          <Link href="/auth/signin">Giriş Yap</Link>
        </Button>
        <Button asChild>
          <Link href="/auth/signup">Kayıt Ol</Link>
        </Button>
      </div>
    )
  }

  const user = session.user
  const initials = user.name
    ?.split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase() || user.email[0].toUpperCase()

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'ADMIN':
        return <Shield className="h-4 w-4" />
      case 'COMPANY':
        return <Building className="h-4 w-4" />
      case 'FARMER':
        return <Tractor className="h-4 w-4" />
      case 'BANK':
        return <Wallet className="h-4 w-4" />
      default:
        return <User className="h-4 w-4" />
    }
  }

  const getDashboardLink = (role: string) => {
    // All roles use the same dashboard route
    return '/dashboard'
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-10 w-10 rounded-full">
          <Avatar className="h-10 w-10">
            <AvatarImage src={user.image || ''} alt={user.name || ''} />
            <AvatarFallback className="bg-primary text-primary-foreground">
              {initials}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent className="w-80" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-2">
            <div className="flex items-center space-x-2">
              {getRoleIcon(user.role)}
              <p className="text-sm font-medium leading-none">{user.name}</p>
            </div>
            <p className="text-xs leading-none text-muted-foreground">
              {user.email}
            </p>
            <Badge 
              variant="secondary" 
              className={`w-fit text-xs ${getRoleColor(user.role)}`}
            >
              {getRoleName(user.role)}
            </Badge>
          </div>
        </DropdownMenuLabel>
        
        <DropdownMenuSeparator />
        
        <DropdownMenuGroup>
          <DropdownMenuItem asChild>
            <Link href={getDashboardLink(user.role)} className="cursor-pointer">
              <User className="mr-2 h-4 w-4" />
              <span>Dashboard</span>
            </Link>
          </DropdownMenuItem>
          
          <DropdownMenuItem asChild>
            <Link href="/profile" className="cursor-pointer">
              <Settings className="mr-2 h-4 w-4" />
              <span>Profil Ayarları</span>
            </Link>
          </DropdownMenuItem>

          {user.role === 'COMPANY' && (
            <DropdownMenuItem asChild>
              <Link href="/dashboard/projects" className="cursor-pointer">
                <Building className="mr-2 h-4 w-4" />
                <span>Projelerim</span>
              </Link>
            </DropdownMenuItem>
          )}

          {user.role === 'FARMER' && (
            <DropdownMenuItem asChild>
              <Link href="/dashboard/farms" className="cursor-pointer">
                <Tractor className="mr-2 h-4 w-4" />
                <span>Çiftliklerim</span>
              </Link>
            </DropdownMenuItem>
          )}

          {user.role === 'ADMIN' && (
            <DropdownMenuItem asChild>
              <Link href="/dashboard/users" className="cursor-pointer">
                <Shield className="mr-2 h-4 w-4" />
                <span>Kullanıcı Yönetimi</span>
              </Link>
            </DropdownMenuItem>
          )}

          <DropdownMenuItem asChild>
            <Link href="/billing" className="cursor-pointer">
              <CreditCard className="mr-2 h-4 w-4" />
              <span>Faturalandırma</span>
            </Link>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        
        <DropdownMenuSeparator />
        
        <DropdownMenuItem asChild>
          <Link href="/help" className="cursor-pointer">
            <HelpCircle className="mr-2 h-4 w-4" />
            <span>Yardım & Destek</span>
          </Link>
        </DropdownMenuItem>
        
        <DropdownMenuSeparator />
        
        <DropdownMenuItem
          className="cursor-pointer text-red-600 focus:text-red-600"
          onClick={() => signOut({ callbackUrl: '/' })}
        >
          <LogOut className="mr-2 h-4 w-4" />
          <span>Çıkış Yap</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}