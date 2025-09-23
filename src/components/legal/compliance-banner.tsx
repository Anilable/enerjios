'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Shield, Info, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface ComplianceBannerProps {
  className?: string
  compact?: boolean
}

export function ComplianceBanner({ className, compact = false }: ComplianceBannerProps) {
  const [isDismissed, setIsDismissed] = useState(false)

  useEffect(() => {
    // Check if user has previously dismissed this banner
    const dismissed = localStorage.getItem('compliance-banner-dismissed')
    if (dismissed) {
      setIsDismissed(true)
    }
  }, [])

  const handleDismiss = () => {
    setIsDismissed(true)
    localStorage.setItem('compliance-banner-dismissed', 'true')
  }

  if (isDismissed) return null

  return (
    <div className={cn(
      "bg-gray-50 border-t border-gray-200 dark:bg-gray-900 dark:border-gray-700",
      className
    )}>
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-start gap-3 flex-1">
            <Shield className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  Kişisel Veri Koruma Bildirimi
                </h3>
              </div>
              {!compact && (
                <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
                  Web sitemizde 6698 sayılı KVKK kapsamında kişisel verilerinizi koruyoruz.
                  Detaylı bilgi için aydınlatma metnimizi inceleyebilirsiniz.
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            <div className="hidden sm:flex items-center gap-2">
              <Link href="/kvkk">
                <Button variant="outline" size="sm" className="text-xs h-7">
                  KVKK
                </Button>
              </Link>
              <Link href="/cerez-politikasi">
                <Button variant="outline" size="sm" className="text-xs h-7">
                  Çerezler
                </Button>
              </Link>
              <Link href="/gizlilik-politikasi">
                <Button variant="outline" size="sm" className="text-xs h-7">
                  Gizlilik
                </Button>
              </Link>
            </div>

            {/* Mobile - single info button */}
            <div className="sm:hidden">
              <Link href="/kvkk">
                <Button variant="outline" size="sm" className="text-xs h-7">
                  <Info className="h-3 w-3" />
                </Button>
              </Link>
            </div>

            <Button
              variant="ghost"
              size="sm"
              onClick={handleDismiss}
              className="h-7 w-7 p-0 text-gray-500 hover:text-gray-700"
            >
              <X className="h-3 w-3" />
              <span className="sr-only">Kapat</span>
            </Button>
          </div>
        </div>

        {compact && (
          <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
            Kişisel verilerinizi KVKK kapsamında koruyoruz.
          </div>
        )}
      </div>
    </div>
  )
}