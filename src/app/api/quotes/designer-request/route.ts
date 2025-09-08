import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { z } from 'zod'

// Validation schema for designer quote request
const designerQuoteSchema = z.object({
  // Customer info
  name: z.string().min(1),
  email: z.string().email(),
  phone: z.string().min(10),
  company: z.string().optional(),
  
  // Project details
  projectType: z.enum(['residential', 'commercial', 'industrial', 'agricultural']),
  propertyType: z.string(),
  installationType: z.string(),
  
  // Additional info
  message: z.string().optional(),
  urgency: z.enum(['urgent', 'normal', 'planning']),
  financingNeeded: z.boolean(),
  
  // Preferences
  preferredBrands: z.array(z.string()).optional(),
  preferredStartDate: z.string().optional(),
  budgetRange: z.string().optional(),
  
  // Design data from 3D designer
  designData: z.object({
    roofPoints: z.array(z.object({
      x: z.number(),
      y: z.number(),
      z: z.number()
    })),
    panels: z.array(z.object({
      id: z.string(),
      position: z.object({
        x: z.number(),
        y: z.number(),
        z: z.number()
      }),
      rotation: z.object({
        x: z.number(),
        y: z.number(),
        z: z.number()
      }),
      type: z.string(),
      power: z.number()
    })),
    location: z.object({
      address: z.string(),
      coordinates: z.object({
        lat: z.number(),
        lng: z.number()
      }),
      irradiance: z.number()
    }).nullable(),
    calculations: z.object({
      totalPanels: z.number(),
      totalPower: z.number(),
      roofArea: z.number(),
      usableArea: z.number(),
      annualProduction: z.number(),
      investment: z.number(),
      savings: z.number(),
      payback: z.number()
    }),
    roofArea: z.number(),
    usableArea: z.number(),
    totalPanels: z.number(),
    totalPower: z.number(),
    annualProduction: z.number(),
    coordinates: z.object({
      lat: z.number(),
      lng: z.number()
    }).optional(),
    irradiance: z.number().optional(),
    address: z.string().optional()
  }),
  
  timestamp: z.string(),
  source: z.literal('3d_designer'),
  userId: z.string().optional()
})

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    const body = await request.json()
    
    // Validate request body
    const validatedData = designerQuoteSchema.parse(body)
    
    // Create quote request in database
    const quoteRequest = await db.quoteRequest.create({
      data: {
        // Customer information
        customerName: validatedData.name,
        customerEmail: validatedData.email,
        customerPhone: validatedData.phone,
        customerCompany: validatedData.company,
        
        // Project details
        projectType: validatedData.projectType,
        propertyType: validatedData.propertyType,
        installationType: validatedData.installationType,
        
        // Location and technical data
        location: validatedData.designData.address || 'Not specified',
        latitude: validatedData.designData.coordinates?.lat,
        longitude: validatedData.designData.coordinates?.lng,
        roofArea: validatedData.designData.roofArea,
        usableArea: validatedData.designData.usableArea,
        
        // System specifications
        systemSize: validatedData.designData.totalPower / 1000, // Convert to kW
        panelCount: validatedData.designData.totalPanels,
        estimatedProduction: validatedData.designData.annualProduction,
        estimatedInvestment: validatedData.designData.investment,
        estimatedSavings: validatedData.designData.savings,
        paybackPeriod: validatedData.designData.payback,
        
        // Additional info
        message: validatedData.message,
        urgency: validatedData.urgency,
        financingNeeded: validatedData.financingNeeded,
        preferredStartDate: validatedData.preferredStartDate ? new Date(validatedData.preferredStartDate) : null,
        budgetRange: validatedData.budgetRange,
        
        // Design data (stored as JSON)
        designData: JSON.stringify(validatedData.designData),
        roofDrawing: JSON.stringify(validatedData.designData.roofPoints),
        panelLayout: JSON.stringify(validatedData.designData.panels),
        
        // Metadata
        source: 'DESIGNER_3D',
        status: 'PENDING',
        userId: session?.user?.id || validatedData.userId,
        
        // Irradiance data
        solarIrradiance: validatedData.designData.irradiance || 0,
        
        // Preferred brands (stored as comma-separated string)
        preferredBrands: validatedData.preferredBrands?.join(',')
      }
    })
    
    // Send notifications to companies
    await notifyCompanies(quoteRequest)
    
    // Send confirmation email to customer
    await sendCustomerConfirmation(validatedData.email, quoteRequest.id)
    
    return NextResponse.json({
      success: true,
      message: 'Quote request submitted successfully',
      quoteRequestId: quoteRequest.id
    })
    
  } catch (error) {
    console.error('Error creating designer quote request:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { error: 'Failed to submit quote request' },
      { status: 500 }
    )
  }
}

// Helper function to notify companies about new quote request
async function notifyCompanies(quoteRequest: any) {
  try {
    // Get all active solar companies
    const companies = await db.company.findMany({
      where: {
        status: 'ACTIVE',
        serviceType: {
          in: ['SOLAR_INSTALLER', 'EPC_CONTRACTOR', 'DISTRIBUTOR']
        }
      },
      include: {
        user: true
      }
    })
    
    // Create notifications for each company
    for (const company of companies) {
      await db.notification.create({
        data: {
          userId: company.userId,
          type: 'NEW_QUOTE_REQUEST',
          title: 'Yeni 3D Tasarım Teklif Talebi',
          message: `${quoteRequest.customerName} tarafından ${quoteRequest.systemSize}kW sistem için detaylı teklif talebi`,
          data: JSON.stringify({
            quoteRequestId: quoteRequest.id,
            customerName: quoteRequest.customerName,
            location: quoteRequest.location,
            systemSize: quoteRequest.systemSize,
            roofArea: quoteRequest.roofArea,
            urgency: quoteRequest.urgency
          }),
          read: false
        }
      })
    }
    
    // Also create quote opportunities for interested companies
    for (const company of companies) {
      await db.quoteOpportunity.create({
        data: {
          companyId: company.id,
          quoteRequestId: quoteRequest.id,
          status: 'NEW',
          viewedAt: null,
          respondedAt: null
        }
      })
    }
    
  } catch (error) {
    console.error('Error notifying companies:', error)
  }
}

// Helper function to send confirmation email to customer
async function sendCustomerConfirmation(email: string, quoteRequestId: string) {
  try {
    // Here you would integrate with your email service
    // For example: SendGrid, AWS SES, etc.
    console.log(`Sending confirmation email to ${email} for quote request ${quoteRequestId}`)
    
    // Placeholder for email sending logic
    // await emailService.send({
    //   to: email,
    //   subject: 'Teklif Talebiniz Alındı',
    //   template: 'quote-request-confirmation',
    //   data: { quoteRequestId }
    // })
    
  } catch (error) {
    console.error('Error sending confirmation email:', error)
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }
    
    // Get quote requests for the current user
    const quoteRequests = await db.quoteRequest.findMany({
      where: {
        userId: session.user.id
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 10
    })
    
    return NextResponse.json({
      success: true,
      quoteRequests
    })
    
  } catch (error) {
    console.error('Error fetching quote requests:', error)
    return NextResponse.json(
      { error: 'Failed to fetch quote requests' },
      { status: 500 }
    )
  }
}