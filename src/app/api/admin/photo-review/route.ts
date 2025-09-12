import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { z } from 'zod'

const reviewPhotoSchema = z.object({
  photoId: z.string(),
  approved: z.boolean(),
  rejectionReason: z.string().nullable().optional()
})

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || (session.user.role !== 'ADMIN' && session.user.role !== 'COMPANY')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const { photoId, approved, rejectionReason } = reviewPhotoSchema.parse(body)

    // Update photo approval status
    const updatedPhoto = await prisma.photoUpload.update({
      where: { id: photoId },
      data: {
        approved,
        rejectionReason: approved ? null : rejectionReason,
        updatedAt: new Date()
      },
      include: {
        photoRequest: {
          select: {
            id: true,
            customerEmail: true,
            customerName: true,
            engineerName: true
          }
        }
      }
    })

    // If rejecting, could send notification to customer
    if (!approved && updatedPhoto.photoRequest.customerEmail) {
      // TODO: Send rejection notification email
      console.log(`Photo rejected for ${updatedPhoto.photoRequest.customerName}: ${rejectionReason}`)
    }

    // If approving, check if all photos are reviewed
    if (approved) {
      const photoRequest = await prisma.photoRequest.findUnique({
        where: { id: updatedPhoto.photoRequest.id },
        include: {
          photos: {
            select: {
              approved: true
            }
          }
        }
      })

      // If all photos are reviewed, update request status
      if (photoRequest && photoRequest.photos.every(p => p.approved !== null)) {
        await prisma.photoRequest.update({
          where: { id: photoRequest.id },
          data: {
            status: 'REVIEWED',
            reviewedAt: new Date(),
            reviewedById: session.user.id
          }
        })
      }
    }

    return NextResponse.json({
      success: true,
      message: `Photo ${approved ? 'approved' : 'rejected'} successfully`
    })

  } catch (error) {
    console.error('Photo review failed:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json({ 
        error: 'Validation failed', 
        details: error.issues 
      }, { status: 400 })
    }

    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 })
  }
}