'use client'

import React, { useState, Suspense } from 'react'
import { signIn, getSession } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { useEmail } from '@/hooks/use-email'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { AlertCircle, Eye, EyeOff, Sun } from 'lucide-react'

// Separate component for handling search params
function SearchParamsHandler({ onCallbackUrl }: { onCallbackUrl: (url: string) => void }) {
  const searchParams = useSearchParams()
  const callbackUrl = searchParams.get('callbackUrl') || '/dashboard'
  
  // Use useEffect to pass the callback URL to parent component
  React.useEffect(() => {
    onCallbackUrl(callbackUrl)
  }, [callbackUrl, onCallbackUrl])
  
  return null
}

function SignInFormContent({ callbackUrl }: { callbackUrl: string }) {
  const router = useRouter()
  const { sendEmail } = useEmail()
  
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      })

      if (result?.error) {
        setError('Email veya şifre hatalı')
      } else if (result?.ok) {
        // Get session to check user role and redirect accordingly
        const session = await getSession()
        
        // Send welcome back notification email (optional)
        if (session?.user?.email) {
          try {
            await sendEmail({
              to: session.user.email,
              template: 'customerWelcome',
              data: {
                customerName: session.user.name || 'Kullanıcı',
                email: session.user.email,
                phone: '',
                dashboardUrl: `${window.location.origin}/dashboard`,
                projectAssignee: 'EnerjiOS Takımı'
              }
            })
          } catch (emailError) {
            // Fail silently for email notifications
            console.log('Welcome email could not be sent:', emailError)
          }
        }
        
        // All users go to the same dashboard
        router.push('/dashboard')
        router.refresh()
      }
    } catch (error) {
      setError('Giriş yapılırken bir hata oluştu')
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoogleSignIn = () => {
    signIn('google', { callbackUrl })
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="space-y-1 text-center">
        <div className="flex items-center justify-center mb-4">
          <div className="flex items-center space-x-2">
            <Sun className="h-8 w-8 text-primary" />
            <span className="text-2xl font-bold text-primary">EnerjiOS</span>
          </div>
        </div>
        <CardTitle className="text-2xl">Giriş Yap</CardTitle>
        <CardDescription>
          EnerjiOS hesabınıza giriş yapın
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {error && (
          <div className="flex items-center space-x-2 text-sm text-red-600 bg-red-50 p-3 rounded-md">
            <AlertCircle className="h-4 w-4" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">E-posta</Label>
            <Input
              id="email"
              type="email"
              placeholder="ornek@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={isLoading}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="password">Şifre</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isLoading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                disabled={isLoading}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <Button 
            type="submit" 
            className="w-full" 
            disabled={isLoading}
          >
            {isLoading ? 'Giriş yapılıyor...' : 'Giriş Yap'}
          </Button>
        </form>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-muted-foreground">
              veya
            </span>
          </div>
        </div>

        <Button
          type="button"
          variant="outline"
          className="w-full"
          onClick={handleGoogleSignIn}
          disabled={isLoading}
        >
          <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
            <path
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              fill="#4285F4"
            />
            <path
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              fill="#34A853"
            />
            <path
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              fill="#FBBC05"
            />
            <path
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              fill="#EA4335"
            />
          </svg>
          Google ile giriş yap
        </Button>
      </CardContent>

      <CardFooter className="flex flex-col space-y-2 text-center text-sm">
        <Link 
          href="/auth/forgot-password" 
          className="text-primary hover:underline"
        >
          Şifrenizi mi unuttunuz?
        </Link>
        <div>
          Hesabınız yok mu?{' '}
          <Link 
            href="/auth/signup" 
            className="text-primary hover:underline font-medium"
          >
            Kayıt olun
          </Link>
        </div>
      </CardFooter>
    </Card>
  )
}

// Main export component with Suspense boundary
export function SignInForm() {
  const [callbackUrl, setCallbackUrl] = useState('/dashboard')

  return (
    <>
      <Suspense fallback={<div>Loading...</div>}>
        <SearchParamsHandler onCallbackUrl={setCallbackUrl} />
      </Suspense>
      <SignInFormContent callbackUrl={callbackUrl} />
    </>
  )
}