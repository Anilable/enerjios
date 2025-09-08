'use client'

import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

export function ProjectDetailSkeleton() {
  return (
    <div className="space-y-6">
      {/* Header Skeleton */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Skeleton className="w-10 h-10 rounded-lg" />
          <div className="flex items-center gap-3">
            <Skeleton className="w-12 h-12 rounded-lg" />
            <div>
              <Skeleton className="w-64 h-6 mb-2" />
              <div className="flex items-center gap-2">
                <Skeleton className="w-20 h-4" />
                <Skeleton className="w-16 h-4" />
                <Skeleton className="w-24 h-4" />
              </div>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Skeleton className="w-20 h-8" />
          <Skeleton className="w-10 h-8" />
        </div>
      </div>

      {/* Quick Stats Skeleton */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <Card key={i}>
            <CardContent className="flex items-center p-4">
              <Skeleton className="w-8 h-8 rounded-full mr-3" />
              <div>
                <Skeleton className="w-16 h-4 mb-1" />
                <Skeleton className="w-12 h-6" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Tab Navigation Skeleton */}
      <Card>
        <CardHeader>
          <div className="grid grid-cols-5 gap-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-16 rounded-md" />
            ))}
          </div>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Content Skeleton */}
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <Skeleton className="w-32 h-5" />
                <Skeleton className="w-48 h-4" />
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <Skeleton className="w-8 h-8 rounded-full" />
                      <div className="flex-1">
                        <Skeleton className="w-24 h-4 mb-1" />
                        <Skeleton className="w-16 h-3" />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <Skeleton className="w-32 h-5" />
                <Skeleton className="w-48 h-4" />
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <Skeleton className="h-16 rounded-lg" />
                    <Skeleton className="h-16 rounded-lg" />
                  </div>
                  <div className="space-y-2">
                    {Array.from({ length: 3 }).map((_, i) => (
                      <div key={i} className="flex justify-between">
                        <Skeleton className="w-24 h-4" />
                        <Skeleton className="w-16 h-4" />
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Chart Skeleton */}
          <Card>
            <CardHeader>
              <Skeleton className="w-40 h-5" />
              <Skeleton className="w-64 h-4" />
            </CardHeader>
            <CardContent>
              <Skeleton className="w-full h-80" />
            </CardContent>
          </Card>
        </CardContent>
      </Card>
    </div>
  )
}