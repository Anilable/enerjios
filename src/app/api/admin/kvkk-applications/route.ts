import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const updateSchema = z.object({
  applicationId: z.string(),
  status: z.enum(['PENDING', 'IN_PROGRESS', 'COMPLETED', 'REJECTED', 'CANCELLED']),
  responseDetails: z.string().optional(),
  assignedTo: z.string().optional()
})

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({
        success: false,
        message: 'Yetkisiz erişim'
      }, { status: 401 })
    }

    // Check if user is admin (you might want to add role checking here)
    // For now, we'll allow any authenticated user

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')
    const status = searchParams.get('status')
    const requestType = searchParams.get('requestType')
    const summary = searchParams.get('summary') === 'true'

    const offset = (page - 1) * limit

    let whereClause: any = {}

    if (status && status !== 'all') {
      whereClause.status = status
    }

    if (requestType && requestType !== 'all') {
      whereClause.requestType = requestType
    }

    // If summary requested, return limited data for dashboard widget
    if (summary) {
      const applications = await prisma.kVKKApplication.findMany({
        where: whereClause,
        orderBy: {
          submittedAt: 'desc'
        },
        take: 10, // Limit for summary
        select: {
          id: true,
          applicationNo: true,
          requestType: true,
          status: true,
          applicantName: true,
          applicantEmail: true,
          submittedAt: true,
          responseDeadline: true,
          processedAt: true
        }
      })

      return NextResponse.json({
        success: true,
        applications
      })
    }

    const [applications, total] = await Promise.all([
      prisma.kVKKApplication.findMany({
        where: whereClause,
        orderBy: {
          submittedAt: 'desc'
        },
        skip: offset,
        take: limit,
        select: {
          id: true,
          applicationNo: true,
          requestType: true,
          status: true,
          applicantName: true,
          applicantEmail: true,
          applicantPhone: true,
          applicantAddress: true,
          applicantCity: true,
          applicantDistrict: true,
          applicantPostalCode: true,
          requestDetails: true,
          previousApplication: true,
          previousApplicationNo: true,
          submittedAt: true,
          responseDeadline: true,
          processedAt: true,
          responseDetails: true,
          assignedTo: true,
          ipAddress: true,
          userAgent: true
        }
      }),
      prisma.kVKKApplication.count({ where: whereClause })
    ])

    return NextResponse.json({
      success: true,
      applications,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    })

  } catch (error) {
    console.error('KVKK Applications Get Error:', error)

    return NextResponse.json({
      success: false,
      message: 'Başvurular yüklenirken bir hata oluştu'
    }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({
        success: false,
        message: 'Yetkisiz erişim'
      }, { status: 401 })
    }

    const body = await request.json()
    const validatedData = updateSchema.parse(body)

    // Get the current application
    const application = await prisma.kVKKApplication.findUnique({
      where: { id: validatedData.applicationId }
    })

    if (!application) {
      return NextResponse.json({
        success: false,
        message: 'Başvuru bulunamadı'
      }, { status: 404 })
    }

    // Update application
    const updatedApplication = await prisma.kVKKApplication.update({
      where: { id: validatedData.applicationId },
      data: {
        status: validatedData.status,
        responseDetails: validatedData.responseDetails,
        assignedTo: validatedData.assignedTo,
        processedAt: validatedData.status === 'COMPLETED' ? new Date() : undefined
      }
    })

    // Create audit log
    await prisma.kVKKAuditLog.create({
      data: {
        action: 'APPLICATION_STATUS_UPDATED',
        applicationId: application.id,
        performedBy: session.user.email || 'unknown',
        details: {
          applicationNo: application.applicationNo,
          oldStatus: application.status,
          newStatus: validatedData.status,
          responseDetails: validatedData.responseDetails,
          assignedTo: validatedData.assignedTo
        },
        performedAt: new Date()
      }
    })

    // TODO: Send email notification to applicant if status is COMPLETED or REJECTED

    return NextResponse.json({
      success: true,
      application: updatedApplication,
      message: 'Başvuru başarıyla güncellendi'
    })

  } catch (error) {
    console.error('KVKK Application Update Error:', error)

    if (error instanceof z.ZodError) {
      return NextResponse.json({
        success: false,
        message: 'Geçersiz veri',
        errors: error.issues
      }, { status: 400 })
    }

    return NextResponse.json({
      success: false,
      message: 'Güncelleme sırasında bir hata oluştu'
    }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({
        success: false,
        message: 'Yetkisiz erişim'
      }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const applicationId = searchParams.get('applicationId')

    if (!applicationId) {
      return NextResponse.json({
        success: false,
        message: 'Başvuru ID gerekli'
      }, { status: 400 })
    }

    // Get the application before deletion for audit log
    const application = await prisma.kVKKApplication.findUnique({
      where: { id: applicationId }
    })

    if (!application) {
      return NextResponse.json({
        success: false,
        message: 'Başvuru bulunamadı'
      }, { status: 404 })
    }

    // Delete application (soft delete by updating status)
    await prisma.kVKKApplication.update({
      where: { id: applicationId },
      data: {
        status: 'CANCELLED',
        processedAt: new Date()
      }
    })

    // Create audit log
    await prisma.kVKKAuditLog.create({
      data: {
        action: 'APPLICATION_DELETED',
        applicationId: application.id,
        performedBy: session.user.email || 'unknown',
        details: {
          applicationNo: application.applicationNo,
          applicantEmail: application.applicantEmail
        },
        performedAt: new Date()
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Başvuru başarıyla silindi'
    })

  } catch (error) {
    console.error('KVKK Application Delete Error:', error)

    return NextResponse.json({
      success: false,
      message: 'Silme işlemi sırasında bir hata oluştu'
    }, { status: 500 })
  }
}