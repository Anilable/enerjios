import { notFound } from 'next/navigation'
import { requireRole } from '@/lib/auth-utils'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { PhotoRequestDetail } from '@/components/admin/photo-request-detail'
import { prisma } from '@/lib/db'
import { ErrorBoundary } from '@/components/error-boundary'

interface PhotoRequestDetailPageProps {
  params: Promise<{
    id: string
  }>
}

async function getPhotoRequestDetail(id: string) {
  try {
    const photoRequest = await prisma.photoRequest.findUnique({
      where: { id },
      include: {
        customer: {
          select: {
            firstName: true,
            lastName: true,
            companyName: true,
            phone: true,
            address: true,
            city: true,
            district: true,
            user: {
              select: {
                name: true,
                email: true
              }
            }
          }
        },
        project: {
          select: {
            name: true,
            type: true,
            status: true,
            capacity: true,
            location: {
              select: {
                address: true,
                city: true,
                district: true,
                roofArea: true,
                roofType: true
              }
            }
          }
        },
        requestedBy: {
          select: {
            name: true,
            email: true,
            role: true
          }
        },
        reviewedBy: {
          select: {
            name: true,
            email: true
          }
        },
        photos: {
          select: {
            id: true,
            filename: true,
            originalName: true,
            storageUrl: true,
            thumbnailUrl: true,
            approved: true,
            rejectionReason: true,
            notes: true,
            fileSize: true,
            mimeType: true,
            metadata: true,
            createdAt: true
          },
          orderBy: {
            createdAt: 'asc'
          }
        }
      }
    })

    return photoRequest
  } catch (error) {
    console.error('Error fetching photo request:', error)
    return null
  }
}

export default async function PhotoRequestDetailPage({ params }: PhotoRequestDetailPageProps) {
  const user = await requireRole(['ADMIN', 'COMPANY'])
  const { id } = await params
  const photoRequest = await getPhotoRequestDetail(id)

  if (!photoRequest) {
    notFound()
  }

  const customerDisplayName = photoRequest.customer
    ? `${photoRequest.customer.firstName} ${photoRequest.customer.lastName}`.trim() || photoRequest.customer.companyName
    : photoRequest.customerName

  return (
    <DashboardLayout
      title={`Fotoğraf Talebi - ${customerDisplayName}`}
      breadcrumbs={[
        { label: 'Dashboard', href: '/dashboard' },
        { label: 'Fotoğraf Talepleri', href: '/dashboard/photo-requests' },
        { label: customerDisplayName || 'Detay' }
      ]}
    >
      <ErrorBoundary>
        <PhotoRequestDetail 
          photoRequest={photoRequest}
          currentUser={user}
        />
      </ErrorBoundary>
    </DashboardLayout>
  )
}