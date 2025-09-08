'use client'

import { useEffect } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'

declare global {
  interface Window {
    gtag: (...args: any[]) => void
    dataLayer: any[]
  }
}

const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID

export function GoogleAnalytics() {
  const pathname = usePathname()
  const searchParams = useSearchParams()

  useEffect(() => {
    if (!GA_MEASUREMENT_ID) return

    const url = pathname + searchParams.toString()
    
    window.gtag('config', GA_MEASUREMENT_ID, {
      page_location: url,
      page_title: document.title,
    })
  }, [pathname, searchParams])

  if (!GA_MEASUREMENT_ID) return null

  return (
    <>
      <script
        async
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
      />
      <script
        dangerouslySetInnerHTML={{
          __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${GA_MEASUREMENT_ID}', {
              page_location: window.location.href,
              page_title: document.title,
            });
          `,
        }}
      />
    </>
  )
}

// Custom event tracking
export function trackEvent({
  action,
  category,
  label,
  value,
}: {
  action: string
  category: string
  label?: string
  value?: number
}) {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', action, {
      event_category: category,
      event_label: label,
      value,
    })
  }
}

// E-commerce tracking
export function trackPurchase({
  transactionId,
  value,
  currency = 'TRY',
  items,
}: {
  transactionId: string
  value: number
  currency?: string
  items: Array<{
    item_id: string
    item_name: string
    category: string
    quantity: number
    price: number
  }>
}) {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'purchase', {
      transaction_id: transactionId,
      value,
      currency,
      items,
    })
  }
}

// Solar-specific tracking events
export const solarEvents = {
  calculateQuote: (systemSize: number, location: string) =>
    trackEvent({
      action: 'calculate_quote',
      category: 'Solar Calculator',
      label: `${systemSize}kW in ${location}`,
      value: systemSize,
    }),

  downloadPDF: (quoteId: string) =>
    trackEvent({
      action: 'download_pdf',
      category: 'Quote',
      label: quoteId,
    }),

  submitQuoteRequest: (systemSize: number, estimatedCost: number) =>
    trackEvent({
      action: 'submit_quote_request',
      category: 'Lead Generation',
      value: estimatedCost,
    }),

  use3DDesigner: () =>
    trackEvent({
      action: 'use_3d_designer',
      category: 'Design Tool',
    }),

  viewFinancing: (bankName: string) =>
    trackEvent({
      action: 'view_financing',
      category: 'Financing',
      label: bankName,
    }),

  useAgrovoltaicCalculator: (cropType: string, farmSize: number) =>
    trackEvent({
      action: 'use_agrovoltaic_calculator',
      category: 'Farming',
      label: cropType,
      value: farmSize,
    }),
}