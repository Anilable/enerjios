import { NextRequest, NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { prisma } from '@/lib/prisma'
import type { KVKKRequestType } from '@prisma/client'
import { z } from 'zod'

const applicationSchema = z.object({
  requestType: z.enum(['info', 'access', 'correction', 'deletion', 'portability', 'objection', 'other']),
  fullName: z.string().min(1, 'Ad soyad gerekli'),
  tcNo: z.string().min(11, 'T.C. Kimlik No 11 haneli olmalıdır').max(11),
  email: z.string().email('Geçerli bir e-posta adresi girin'),
  phone: z.string().min(1, 'Telefon gerekli'),
  address: z.string().min(1, 'Adres gerekli'),
  city: z.string().min(1, 'İl gerekli'),
  district: z.string().min(1, 'İlçe gerekli'),
  postalCode: z.string().optional(),
  details: z.string().min(10, 'Açıklama en az 10 karakter olmalıdır'),
  previousApplication: z.boolean().default(false),
  previousApplicationNo: z.string().optional(),
  consentToProcess: z.boolean().refine(val => val === true, 'İşleme izni gerekli'),
  acceptTerms: z.boolean().refine(val => val === true, 'Şartları kabul etmelisiniz')
})

// Generate unique application number
function generateApplicationNo(): string {
  const year = new Date().getFullYear()
  const timestamp = Date.now().toString().slice(-6)
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0')
  return `KVKK-${year}-${timestamp}${random}`
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validate input
    const validatedData = applicationSchema.parse(body)

    // Get client info
    const headersList = headers()
    const ipAddress = headersList.get('x-forwarded-for') ||
                     headersList.get('x-real-ip') ||
                     request.ip ||
                     'unknown'
    const userAgent = headersList.get('user-agent') || 'unknown'

    // Generate unique application number
    const applicationNo = generateApplicationNo()

    // Split full name into first/last components for reporting flexibility
    const nameParts = validatedData.fullName.trim().split(/\s+/)
    const firstName = nameParts.shift() || validatedData.fullName
    const lastName = nameParts.join(' ') || null

    const requestTypeMap: Record<typeof validatedData.requestType, KVKKRequestType> = {
      info: 'DATA_ACCESS',
      access: 'DATA_ACCESS',
      correction: 'DATA_CORRECTION',
      deletion: 'DATA_DELETION',
      portability: 'DATA_PORTABILITY',
      objection: 'DATA_OBJECTION',
      other: 'OTHER'
    }

    const mappedRequestType = requestTypeMap[validatedData.requestType]

    // Create application in database
    const application = await prisma.kVKKApplication.create({
      data: {
        applicationNo,
        requestType: mappedRequestType,
        status: 'PENDING',
        firstName,
        lastName,
        email: validatedData.email,
        phone: validatedData.phone,
        idNumber: validatedData.tcNo,
        applicantName: validatedData.fullName,
        applicantTcNo: validatedData.tcNo,
        applicantEmail: validatedData.email,
        applicantPhone: validatedData.phone,
        applicantAddress: validatedData.address,
        applicantCity: validatedData.city,
        applicantDistrict: validatedData.district,
        applicantPostalCode: validatedData.postalCode || null,
        requestDetails: validatedData.details,
        description: validatedData.details,
        previousApplication: validatedData.previousApplication,
        previousApplicationNo: validatedData.previousApplicationNo || null,
        ipAddress,
        userAgent,
        submittedAt: new Date(),
        responseDeadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days from now
      }
    })

    // Create audit log
    await prisma.kVKKAuditLog.create({
      data: {
        action: 'APPLICATION_SUBMITTED',
        applicationId: application.id,
        details: {
          applicationNo,
          requestType: validatedData.requestType,
          applicantEmail: validatedData.email,
          ipAddress,
          userAgent
        },
        performedAt: new Date()
      }
    })

    // TODO: Send email notification to admins
    // TODO: Send confirmation email to applicant

    return NextResponse.json({
      success: true,
      applicationNo,
      message: 'Başvurunuz başarıyla alındı'
    })

  } catch (error) {
    console.error('KVKK Application Error:', error)

    if (error instanceof z.ZodError) {
      return NextResponse.json({
        success: false,
        message: 'Form verilerinde hata var',
        errors: error.issues
      }, { status: 400 })
    }

    return NextResponse.json({
      success: false,
      message: 'Başvuru gönderilirken bir hata oluştu'
    }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const applicationNo = searchParams.get('applicationNo')
    const email = searchParams.get('email')

    if (!applicationNo && !email) {
      return NextResponse.json({
        success: false,
        message: 'Başvuru numarası veya e-posta gerekli'
      }, { status: 400 })
    }

    let whereClause: any = {}

    if (applicationNo) {
      whereClause.applicationNo = applicationNo
    }

    if (email) {
      whereClause.applicantEmail = email
    }

    const application = await prisma.kVKKApplication.findFirst({
      where: whereClause,
      select: {
        id: true,
        applicationNo: true,
        requestType: true,
        status: true,
        applicantName: true,
        applicantEmail: true,
        submittedAt: true,
        responseDeadline: true,
        processedAt: true,
        responseDetails: true,
        assignedTo: true
      }
    })

    if (!application) {
      return NextResponse.json({
        success: false,
        message: 'Başvuru bulunamadı'
      }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      application
    })

  } catch (error) {
    console.error('KVKK Application Get Error:', error)

    return NextResponse.json({
      success: false,
      message: 'Başvuru sorgulanırken bir hata oluştu'
    }, { status: 500 })
  }
}
