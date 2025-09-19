import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import crypto from 'crypto'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { projectRequestId, requestType, notes } = body

    // Find the project request
    const projectRequest = await prisma.projectRequest.findUnique({
      where: { id: projectRequestId },
      include: { customer: true, project: true }
    })

    if (!projectRequest) {
      return NextResponse.json(
        { error: 'Project request not found' },
        { status: 404 }
      )
    }

    // Get or create system user for requests
    let systemUser = await prisma.user.findUnique({
      where: { email: 'system@trakya-solar.com' }
    })

    if (!systemUser) {
      systemUser = await prisma.user.create({
        data: {
          email: 'system@trakya-solar.com',
          name: 'System User',
          role: 'ADMIN',
          status: 'ACTIVE'
        }
      })
    }

    // Generate unique token
    const token = crypto.randomBytes(32).toString('hex')

    // Calculate expiry date (7 days from now)
    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + 7)

    // Create photo request
    const photoRequest = await prisma.photoRequest.create({
      data: {
        token,
        customerId: projectRequest.customerId,
        projectId: projectRequest.projectId || undefined,
        requestedById: systemUser.id,
        engineerName: 'Trakya Solar Ekibi',
        engineerTitle: 'Proje Müdürü',
        customerName: projectRequest.customerName,
        customerEmail: projectRequest.customerEmail || undefined,
        customerPhone: projectRequest.customerPhone || undefined,
        message: notes || 'Lütfen proje alanının güncel fotoğraflarını yükleyiniz.',
        guidelines: 'Çatı, arazi ve elektrik panosu fotoğrafları gereklidir. Farklı açılardan çekim yapınız.',
        expiresAt,
        status: 'PENDING'
      }
    })

    return NextResponse.json({
      success: true,
      photoRequestId: photoRequest.id,
      uploadUrl: `/photo-upload/${token}`,
      expiresAt: photoRequest.expiresAt
    })
  } catch (error) {
    console.error('Error creating photo request:', error)
    return NextResponse.json(
      { error: 'Failed to create photo request' },
      { status: 500 }
    )
  }
}