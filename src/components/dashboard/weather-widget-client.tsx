'use client'

import dynamic from 'next/dynamic'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Sun } from 'lucide-react'

const WeatherWidget = dynamic(() => 
  import('./weather-widget').then(mod => ({ default: mod.WeatherWidget })),
  { 
    loading: () => (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sun className="w-5 h-5" />
            Hava Durumu
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Skeleton className="w-16 h-16 rounded-full" />
            <div className="text-right">
              <Skeleton className="w-20 h-8 mb-2" />
              <Skeleton className="w-24 h-4" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Skeleton className="h-16 rounded-lg" />
            <Skeleton className="h-16 rounded-lg" />
          </div>
        </CardContent>
      </Card>
    ),
    ssr: false
  }
)

export function WeatherWidgetClient() {
  return <WeatherWidget />
}