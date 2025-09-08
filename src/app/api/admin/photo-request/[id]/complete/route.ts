import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || (session.user.role !== 'ADMIN' && session.user.role !== 'COMPANY')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = params

    // Update photo request status to REVIEWED
    const updatedRequest = await prisma.photoRequest.update({
      where: { id },
      data: {
        status: 'REVIEWED',
        reviewedAt: new Date(),
        reviewedById: session.user.id
      },
      include: {
        photos: {
          select: {
            approved: true,
            rejectionReason: true
          }
        }
      }
    })

    // Send completion notification email if customer email exists
    if (updatedRequest.customerEmail && process.env.RESEND_API_KEY) {
      try {
        const approvedPhotos = updatedRequest.photos.filter(p => p.approved === true).length
        const rejectedPhotos = updatedRequest.photos.filter(p => p.approved === false).length
        const totalPhotos = updatedRequest.photos.length

        await resend.emails.send({
          from: 'TrakyaSolar <noreply@trakyasolar.com>',
          to: updatedRequest.customerEmail,
          subject: 'Fotoğraflarınız İncelendi - TrakyaSolar',
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <div style="background: linear-gradient(135deg, #1e40af, #3b82f6); color: white; padding: 20px; text-align: center;">
                <h1 style="margin: 0;">🌞 TrakyaSolar</h1>
                <p style="margin: 10px 0 0 0; opacity: 0.9;">Fotoğraf İnceleme Sonucu</p>
              </div>
              
              <div style="padding: 30px 20px;">
                <h2 style="color: #374151; margin-bottom: 20px;">Merhaba ${updatedRequest.customerName},</h2>
                
                <p style="line-height: 1.6; margin-bottom: 20px;">
                  Gönderdiğiniz ${totalPhotos} adet fotoğrafı inceledik. İnceleme sonuçları:
                </p>
                
                <div style="background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; padding: 20px; margin: 20px 0;">
                  <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
                    <span>✅ Onaylanan Fotoğraflar:</span>
                    <span style="font-weight: bold; color: #16a34a;">${approvedPhotos}</span>
                  </div>
                  ${rejectedPhotos > 0 ? `
                  <div style="display: flex; justify-content: space-between; align-items: center;">
                    <span>❌ Reddedilen Fotoğraflar:</span>
                    <span style="font-weight: bold; color: #dc2626;">${rejectedPhotos}</span>
                  </div>
                  ` : ''}
                </div>
                
                ${approvedPhotos > 0 ? `
                <p style="line-height: 1.6; margin-bottom: 20px;">
                  Fotoğraflarınız başarıyla değerlendirildi. ${updatedRequest.engineerName} 
                  size en uygun güneş enerjisi çözümünü hazırlayacak ve kısa süre içinde 
                  detaylı teklifimizi sunacağız.
                </p>
                ` : ''}
                
                ${rejectedPhotos > 0 ? `
                <p style="line-height: 1.6; margin-bottom: 20px; color: #dc2626;">
                  Bazı fotoğraflar kalite veya açı sorunları nedeniyle reddedildi. 
                  Daha net ve farklı açılardan yeni fotoğraflar çekmenizi rica ediyoruz.
                </p>
                ` : ''}
                
                <div style="border-top: 1px solid #e5e7eb; padding-top: 20px; margin-top: 30px; text-align: center; color: #6b7280;">
                  <p style="margin: 0;">Sorularınız için bizimle iletişime geçebilirsiniz.</p>
                  <p style="margin: 10px 0 0 0; font-weight: bold;">TrakyaSolar - Güneş Enerjisi Çözümleri</p>
                </div>
              </div>
            </div>
          `
        })
      } catch (emailError) {
        console.error('Completion email sending failed:', emailError)
        // Continue with success response even if email fails
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Photo request marked as completed',
      approvedPhotos: updatedRequest.photos.filter(p => p.approved === true).length,
      rejectedPhotos: updatedRequest.photos.filter(p => p.approved === false).length,
      totalPhotos: updatedRequest.photos.length
    })

  } catch (error) {
    console.error('Failed to complete photo request:', error)
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 })
  }
}