import { requireRole } from '@/lib/auth-utils'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { PhotoRequestsTable } from '@/components/admin/photo-requests-table'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Camera, Users, Clock, CheckCircle } from 'lucide-react'
import { prisma } from '@/lib/db'
import { ErrorBoundary } from '@/components/error-boundary'

async function getPhotoRequestStats() {
  try {
    // Use Promise.all to run queries in parallel instead of sequentially
    const [requestStats, photoStats] = await Promise.all([
      prisma.photoRequest.groupBy({
        by: ['status'],
        _count: {
          status: true
        }
      }),
      prisma.photoUpload.groupBy({
        by: ['approved'],
        _count: {
          approved: true
        }
      })
    ])

    // Process photo statistics
    const totalPhotos = photoStats.reduce((sum, item) => sum + item._count.approved, 0)
    const approvedPhotos = photoStats.find(item => item.approved === true)?._count.approved || 0

    return {
      stats: requestStats.reduce((acc, item) => {
        acc[item.status] = item._count.status
        return acc
      }, {} as Record<string, number>),
      totalPhotos,
      approvedPhotos
    }
  } catch (error) {
    console.error('Error fetching photo request stats:', error)
    return {
      stats: {},
      totalPhotos: 0,
      approvedPhotos: 0
    }
  }
}

export default async function PhotoRequestsPage() {
  const user = await requireRole(['ADMIN', 'COMPANY'])
  const { stats, totalPhotos, approvedPhotos } = await getPhotoRequestStats()

  return (
    <DashboardLayout
      title="Fotoğraf Talepleri"
      breadcrumbs={[
        { label: 'Dashboard', href: '/dashboard' },
        { label: 'Fotoğraf Talepleri' }
      ]}
    >
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Toplam Talepler</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Object.values(stats).reduce((sum, count) => sum + count, 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              Tüm fotoğraf talepleri
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Bekleyen Talepler</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {(stats.PENDING || 0) + (stats.UPLOADED || 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              İnceleme bekliyor
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tamamlanan</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.REVIEWED || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              İnceleme tamamlandı
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Toplam Fotoğraf</CardTitle>
            <Camera className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalPhotos}</div>
            <p className="text-xs text-muted-foreground">
              {approvedPhotos} onaylı, {totalPhotos - approvedPhotos} bekliyor
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Photo Requests Table */}
      <ErrorBoundary>
        <PhotoRequestsTable />
      </ErrorBoundary>
    </DashboardLayout>
  )
}