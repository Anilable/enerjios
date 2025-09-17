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
import { OAuthButtons } from '@/components/ui/oauth-buttons'
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

        <OAuthButtons
          callbackUrl={callbackUrl}
          disabled={isLoading}
        />
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