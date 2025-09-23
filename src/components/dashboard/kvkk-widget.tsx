'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import {
  Shield,
  AlertTriangle,
  Clock,
  CheckCircle,
  FileText,
  ExternalLink,
  Users,
  Calendar,
  ArrowRight,
  TrendingUp,
  AlertCircle
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface KVKKMetrics {
  totalApplications: number
  pendingApplications: number
  overdueApplications: number
  completedApplications: number
  complianceScore: number
  recentApplications: Array<{
    id: string
    applicationNo: string
    requestType: string
    status: string
    submittedAt: string
    daysRemaining: number
  }>
}

interface KVKKWidgetProps {
  className?: string
  compact?: boolean
}

export function KVKKWidget({ className, compact = false }: KVKKWidgetProps) {
  const [metrics, setMetrics] = useState<KVKKMetrics | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchKVKKMetrics()
  }, [])

  const fetchKVKKMetrics = async () => {
    try {
      // Get compliance metrics from the new automation service
      const [complianceResponse, applicationsResponse] = await Promise.all([
        fetch('/api/admin/kvkk-compliance?type=summary&days=30'),
        fetch('/api/admin/kvkk-applications?summary=true')
      ])

      if (complianceResponse.ok && applicationsResponse.ok) {
        const complianceData = await complianceResponse.json()
        const applicationsData = await applicationsResponse.json()

        const transformedMetrics: KVKKMetrics = {
          totalApplications: complianceData.metrics?.totalApplications || 0,
          pendingApplications: complianceData.metrics?.stillPending || 0,
          overdueApplications: complianceData.metrics?.overdueCount || 0,
          completedApplications: complianceData.metrics?.completedOnTime + complianceData.metrics?.completedLate || 0,
          complianceScore: complianceData.metrics?.complianceScore || 100,
          recentApplications: (applicationsData.applications || [])
            .slice(0, 3)
            .map((app: any) => ({
              id: app.id,
              applicationNo: app.applicationNo,
              requestType: app.requestType,
              status: app.status,
              submittedAt: app.submittedAt,
              daysRemaining: Math.ceil((new Date(app.responseDeadline).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
            }))
        }
        setMetrics(transformedMetrics)
      }
    } catch (error) {
      console.error('Error fetching KVKK metrics:', error)
      // Fallback to old method if automation service fails
      try {
        const response = await fetch('/api/admin/kvkk-applications?summary=true')
        if (response.ok) {
          const data = await response.json()
          const transformedMetrics: KVKKMetrics = {
            totalApplications: data.applications?.length || 0,
            pendingApplications: data.applications?.filter((app: any) => app.status === 'PENDING').length || 0,
            overdueApplications: data.applications?.filter((app: any) => {
              const deadline = new Date(app.responseDeadline)
              return deadline < new Date() && !['COMPLETED', 'REJECTED', 'CANCELLED'].includes(app.status)
            }).length || 0,
            completedApplications: data.applications?.filter((app: any) => app.status === 'COMPLETED').length || 0,
            complianceScore: calculateComplianceScore(data.applications || []),
            recentApplications: (data.applications || [])
              .slice(0, 3)
              .map((app: any) => ({
                id: app.id,
                applicationNo: app.applicationNo,
                requestType: app.requestType,
                status: app.status,
                submittedAt: app.submittedAt,
                daysRemaining: Math.ceil((new Date(app.responseDeadline).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
              }))
          }
          setMetrics(transformedMetrics)
        }
      } catch (fallbackError) {
        console.error('Fallback also failed:', fallbackError)
        setMetrics({
          totalApplications: 0,
          pendingApplications: 0,
          overdueApplications: 0,
          completedApplications: 0,
          complianceScore: 100,
          recentApplications: []
        })
      }
    } finally {
      setIsLoading(false)
    }
  }

  const calculateComplianceScore = (applications: any[]) => {
    if (applications.length === 0) return 100

    const totalApps = applications.length
    const completedOnTime = applications.filter(app => {
      if (app.status !== 'COMPLETED') return false
      const deadline = new Date(app.responseDeadline)
      const completed = new Date(app.processedAt)
      return completed <= deadline
    }).length

    return Math.round((completedOnTime / totalApps) * 100)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING': return 'bg-yellow-100 text-yellow-800'
      case 'IN_PROGRESS': return 'bg-blue-100 text-blue-800'
      case 'COMPLETED': return 'bg-green-100 text-green-800'
      case 'REJECTED': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getRequestTypeLabel = (type: string) => {
    const labels = {
      'INFO': 'Bilgi Edinme',
      'ACCESS': 'Erişim',
      'CORRECTION': 'Düzeltme',
      'DELETION': 'Silme',
      'PORTABILITY': 'Taşınabilirlik',
      'OBJECTION': 'İtiraz',
      'OTHER': 'Diğer'
    }
    return labels[type as keyof typeof labels] || type
  }

  if (isLoading) {
    return (
      <Card className={cn("", className)}>
        <CardHeader>
          <div className="flex items-center space-x-2">
            <Shield className="h-5 w-5 text-blue-600" />
            <CardTitle className="text-lg">KVKK Uyumluluk</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
            <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded animate-pulse w-1/2"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!metrics) {
    return (
      <Card className={cn("border-red-200", className)}>
        <CardHeader>
          <div className="flex items-center space-x-2">
            <AlertTriangle className="h-5 w-5 text-red-600" />
            <CardTitle className="text-lg">KVKK Sistemi</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-red-600 text-sm">Veri yüklenirken hata oluştu</p>
        </CardContent>
      </Card>
    )
  }

  if (compact) {
    return (
      <Card className={cn("", className)}>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Shield className="h-8 w-8 text-blue-600" />
              <div>
                <h3 className="font-medium">KVKK</h3>
                <p className="text-sm text-gray-600">
                  {metrics.pendingApplications} beklemede
                </p>
              </div>
            </div>
            <Link href="/dashboard/kvkk">
              <Button variant="outline" size="sm">
                <ExternalLink className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={cn("", className)}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Shield className="h-5 w-5 text-blue-600" />
            <div>
              <CardTitle className="text-lg">KVKK Uyumluluk</CardTitle>
              <CardDescription>Kişisel veri koruma durumu</CardDescription>
            </div>
          </div>
          <Link href="/dashboard/kvkk">
            <Button variant="outline" size="sm">
              <ExternalLink className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Compliance Score */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium">Uyumluluk Skoru</span>
            <span className={cn(
              "font-bold",
              metrics.complianceScore >= 90 ? "text-green-600" :
              metrics.complianceScore >= 70 ? "text-yellow-600" : "text-red-600"
            )}>
              %{metrics.complianceScore}
            </span>
          </div>
          <Progress
            value={metrics.complianceScore}
            className={cn(
              "h-2",
              metrics.complianceScore >= 90 ? "bg-green-100" :
              metrics.complianceScore >= 70 ? "bg-yellow-100" : "bg-red-100"
            )}
          />
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-yellow-600" />
              <span className="text-sm font-medium">Beklemede</span>
            </div>
            <p className="text-2xl font-bold text-yellow-600">
              {metrics.pendingApplications}
            </p>
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-red-600" />
              <span className="text-sm font-medium">Süresi Geçen</span>
            </div>
            <p className="text-2xl font-bold text-red-600">
              {metrics.overdueApplications}
            </p>
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span className="text-sm font-medium">Tamamlanan</span>
            </div>
            <p className="text-2xl font-bold text-green-600">
              {metrics.completedApplications}
            </p>
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-medium">Toplam</span>
            </div>
            <p className="text-2xl font-bold text-blue-600">
              {metrics.totalApplications}
            </p>
          </div>
        </div>

        {/* Recent Applications */}
        {metrics.recentApplications.length > 0 && (
          <div className="space-y-3">
            <h4 className="text-sm font-medium flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Son Başvurular
            </h4>
            <div className="space-y-2">
              {metrics.recentApplications.map((app) => (
                <div key={app.id} className="flex items-center justify-between p-2 bg-gray-50 rounded-md">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">
                      {app.applicationNo}
                    </p>
                    <p className="text-xs text-gray-600">
                      {getRequestTypeLabel(app.requestType)}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={getStatusColor(app.status)} variant="secondary">
                      {app.status === 'PENDING' ? 'Beklemede' :
                       app.status === 'IN_PROGRESS' ? 'İşlemde' :
                       app.status === 'COMPLETED' ? 'Tamamlandı' : app.status}
                    </Badge>
                    {app.daysRemaining < 0 ? (
                      <Badge variant="destructive" className="text-xs">
                        {Math.abs(app.daysRemaining)}g geçti
                      </Badge>
                    ) : app.daysRemaining <= 7 ? (
                      <Badge variant="secondary" className="text-xs bg-yellow-100 text-yellow-800">
                        {app.daysRemaining}g kaldı
                      </Badge>
                    ) : null}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-2">
          <Link href="/dashboard/kvkk" className="flex-1">
            <Button variant="outline" className="w-full text-sm">
              Tüm Başvurular
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </Link>
          <Link href="/kvkk-basvuru">
            <Button variant="outline" size="sm">
              <FileText className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  )
}