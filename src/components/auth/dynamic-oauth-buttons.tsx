'use client'

import React, { useEffect, useState } from 'react'
import { getProviders } from 'next-auth/react'
import { OAuthButton } from '@/components/ui/oauth-buttons'

interface DynamicOAuthButtonsProps {
  callbackUrl?: string
  disabled?: boolean
}

export function DynamicOAuthButtons({
  callbackUrl = '/dashboard',
  disabled = false
}: DynamicOAuthButtonsProps) {
  const [providers, setProviders] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchProviders = async () => {
      try {
        const availableProviders = await getProviders()
        setProviders(availableProviders)
      } catch (error) {
        console.error('Error fetching providers:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchProviders()
  }, [])

  if (loading) {
    return (
      <div className="space-y-2">
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
        <div className="h-10 bg-gray-100 rounded animate-pulse" />
      </div>
    )
  }

  const hasGoogleProvider = providers?.google
  const hasAppleProvider = providers?.apple
  const hasOAuthProviders = hasGoogleProvider || hasAppleProvider

  if (!hasOAuthProviders) {
    return null
  }

  return (
    <>
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

      <div className="space-y-2">
        {hasGoogleProvider && (
          <OAuthButton
            provider="google"
            callbackUrl={callbackUrl}
            disabled={disabled}
          />
        )}

        {hasAppleProvider && (
          <OAuthButton
            provider="apple"
            callbackUrl={callbackUrl}
            disabled={disabled}
          />
        )}
      </div>
    </>
  )
}