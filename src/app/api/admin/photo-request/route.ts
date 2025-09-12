import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { z } from 'zod'
import crypto from 'crypto'
import { EmailService } from '@/lib/email'

const createPhotoRequestSchema = z.object({
  customerId: z.string().optional(),
  projectId: z.string().optional(),
  customerName: z.string().min(1),
  customerEmail: z.string().email().optional(),
  customerPhone: z.string().optional(),
  engineerName: z.string().min(1),
  engineerTitle: z.string().default('Mühendis'),
  message: z.string().min(1),
  guidelines: z.string().min(1),
  expiryDays: z.number().min(1).max(30).default(7),
  requestedById: z.string()
})

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || (session.user.role !== 'ADMIN' && session.user.role !== 'COMPANY')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const validatedData = createPhotoRequestSchema.parse(body)

    // Validate that the requesting user exists
    const requestingUser = await prisma.user.findUnique({
      where: { id: validatedData.requestedById }
    })
    
    if (!requestingUser) {
      console.error('❌ Requesting user not found:', validatedData.requestedById)
      return NextResponse.json({ 
        error: 'Requesting user not found',
        details: `User ID ${validatedData.requestedById} does not exist`
      }, { status: 400 })
    }

    // Validate customer exists if customerId is provided
    if (validatedData.customerId) {
      const customer = await prisma.customer.findUnique({
        where: { id: validatedData.customerId }
      })
      
      if (!customer) {
        console.error('❌ Customer not found:', validatedData.customerId)
        return NextResponse.json({ 
          error: 'Customer not found',
          details: `Customer ID ${validatedData.customerId} does not exist`
        }, { status: 400 })
      }
    }

    // Validate project exists if projectId is provided
    if (validatedData.projectId) {
      const project = await prisma.project.findUnique({
        where: { id: validatedData.projectId }
      })
      
      if (!project) {
        console.error('❌ Project not found:', validatedData.projectId)
        return NextResponse.json({ 
          error: 'Project not found',
          details: `Project ID ${validatedData.projectId} does not exist`
        }, { status: 400 })
      }
    }

    // Generate unique token
    const token = crypto.randomBytes(32).toString('hex')
    
    // Calculate expiry date
    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + validatedData.expiryDays)

    console.log('📝 Creating photo request with data:', {
      customerId: validatedData.customerId,
      projectId: validatedData.projectId,
      requestedById: validatedData.requestedById,
      customerName: validatedData.customerName,
      token: token.substring(0, 8) + '...'
    })

    // Create photo request in database with proper error handling
    let photoRequest
    try {
      photoRequest = await prisma.photoRequest.create({
        data: {
          token,
          customerId: validatedData.customerId || undefined,
          projectId: validatedData.projectId || undefined,
          requestedById: validatedData.requestedById,
          engineerName: validatedData.engineerName,
          engineerTitle: validatedData.engineerTitle,
          customerName: validatedData.customerName,
          customerEmail: validatedData.customerEmail || undefined,
          customerPhone: validatedData.customerPhone || undefined,
          message: validatedData.message,
          guidelines: validatedData.guidelines,
          expiresAt,
          status: 'PENDING'
        }
      })
      
      console.log('✅ Photo request created successfully:', photoRequest.id)
    } catch (dbError: any) {
      console.error('❌ Database error creating photo request:', dbError)
      
      // Handle specific Prisma errors
      if (dbError.code === 'P2003') {
        const field = dbError.meta?.field_name || 'unknown field'
        return NextResponse.json({ 
          error: 'Foreign key constraint failed',
          details: `Referenced record not found for ${field}`,
          code: 'P2003'
        }, { status: 400 })
      }
      
      if (dbError.code === 'P2002') {
        return NextResponse.json({ 
          error: 'Unique constraint failed',
          details: 'A photo request with this token already exists',
          code: 'P2002'
        }, { status: 400 })
      }
      
      // Generic database error
      return NextResponse.json({ 
        error: 'Database error',
        details: dbError.message || 'Failed to create photo request'
      }, { status: 500 })
    }

    // Generate upload URL
    const uploadUrl = `${process.env.NEXTAUTH_URL}/photo-upload/${token}`
    
    let emailResult: { success: boolean; error?: string; messageId?: string } = { success: false, error: 'Email not attempted' }
    
    // Send email notification if email provided
    if (validatedData.customerEmail) {
      try {
        emailResult = await EmailService.sendPhotoRequest({
          customerName: validatedData.customerName,
          customerEmail: validatedData.customerEmail,
          engineerName: validatedData.engineerName,
          engineerTitle: validatedData.engineerTitle,
          message: validatedData.message,
          guidelines: validatedData.guidelines,
          uploadUrl,
          expiryDays: validatedData.expiryDays,
          token
        })
        
        if (!emailResult.success) {
          console.error('📧 Email service failed:', emailResult.error)
        } else {
          console.log('📧 Email sent successfully, ID:', emailResult.messageId)
        }
      } catch (emailError) {
        console.error('📧 Email service error:', emailError)
        emailResult = { 
          success: false, 
          error: emailError instanceof Error ? emailError.message : 'Unknown email error'
        }
      }
    } else {
      console.log('📧 No customer email provided, skipping email notification')
    }

    return NextResponse.json({
      success: true,
      photoRequestId: photoRequest.id,
      token: photoRequest.token,
      uploadUrl,
      expiresAt: photoRequest.expiresAt,
      emailSent: emailResult.success,
      emailError: emailResult.error,
      ...(emailResult.messageId && { messageId: emailResult.messageId })
    })

  } catch (error) {
    console.error('Photo request creation failed:', error)
    
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

// Get photo requests for admin review
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || (session.user.role !== 'ADMIN' && session.user.role !== 'COMPANY')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const status = searchParams.get('status')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const offset = (page - 1) * limit

    const where = status ? { status: status as any } : undefined

    const [photoRequests, totalCount] = await Promise.all([
      prisma.photoRequest.findMany({
        where,
        include: {
          customer: {
            select: {
              firstName: true,
              lastName: true,
              companyName: true,
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
              status: true
            }
          },
          requestedBy: {
            select: {
              name: true,
              email: true
            }
          },
          photos: {
            select: {
              id: true,
              filename: true,
              thumbnailUrl: true,
              approved: true,
              createdAt: true
            }
          },
          _count: {
            select: {
              photos: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        },
        skip: offset,
        take: limit
      }),
      prisma.photoRequest.count({ where })
    ])

    return NextResponse.json({
      photoRequests,
      pagination: {
        page,
        limit,
        total: totalCount,
        totalPages: Math.ceil(totalCount / limit)
      }
    })

  } catch (error) {
    console.error('Failed to fetch photo requests:', error)
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 })
  }
}