import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { z } from 'zod'

const designerToProjectSchema = z.object({
  designData: z.object({
    roofPoints: z.array(z.object({
      x: z.number(),
      y: z.number(),
      z: z.number().optional()
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
      city: z.string().optional(),
      district: z.string().optional()
    }),
    calculations: z.object({
      totalPower: z.number(),
      annualProduction: z.number(),
      roofArea: z.number(),
      panelCount: z.number(),
      estimatedCost: z.number().optional(),
      savings: z.object({
        monthly: z.number(),
        annual: z.number(),
        total25Years: z.number()
      }).optional()
    })
  }),
  customerInfo: z.object({
    name: z.string(),
    email: z.string().email(),
    phone: z.string(),
    company: z.string().optional()
  }),
  projectPreferences: z.object({
    installationType: z.enum(['residential', 'commercial', 'agricultural']),
    urgency: z.enum(['normal', 'urgent', 'planned']),
    budget: z.object({
      min: z.number().optional(),
      max: z.number().optional()
    }).optional(),
    additionalRequests: z.string().optional()
  })
})

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const validatedData = designerToProjectSchema.parse(body)

    // Generate unique project ID
    const projectId = `PRJ-${Date.now()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`
    
    // Create project from designer data
    const projectData = {
      id: projectId,
      title: `GES Projesi - ${validatedData.customerInfo.name}`,
      description: `3D Designer'dan oluşturulan ${validatedData.designData.calculations.totalPower}kW GES projesi`,
      status: 'DESIGN_COMPLETED',
      priority: validatedData.projectPreferences.urgency === 'urgent' ? 'HIGH' : 'MEDIUM',
      type: validatedData.projectPreferences.installationType,
      customer: validatedData.customerInfo,
      location: validatedData.designData.location,
      technical: {
        systemSize: validatedData.designData.calculations.totalPower,
        panelCount: validatedData.designData.calculations.panelCount,
        annualProduction: validatedData.designData.calculations.annualProduction,
        roofArea: validatedData.designData.calculations.roofArea
      },
      design: {
        roofModel: validatedData.designData.roofPoints,
        panelLayout: validatedData.designData.panels,
        calculations: validatedData.designData.calculations
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: session.user.id,
      timeline: [
        {
          id: `timeline-${Date.now()}`,
          date: new Date().toISOString(),
          title: 'Proje Oluşturuldu',
          description: '3D Designer\'dan proje otomatik oluşturuldu',
          status: 'completed',
          type: 'system',
          user: session.user.name || 'System'
        },
        {
          id: `timeline-${Date.now() + 1}`,
          date: new Date().toISOString(),
          title: 'Tasarım Tamamlandı',
          description: `${validatedData.designData.calculations.panelCount} panel ile ${validatedData.designData.calculations.totalPower}kW sistem tasarlandı`,
          status: 'completed',
          type: 'design',
          user: session.user.name || 'System'
        },
        {
          id: `timeline-${Date.now() + 2}`,
          date: new Date().toISOString(),
          title: 'Teklif Hazırlanıyor',
          description: 'Sistem otomatik teklif hazırlıyor',
          status: 'in_progress',
          type: 'quote',
          user: 'System'
        }
      ]
    }

    // Auto-generate quote from project
    const quoteId = `QUO-${Date.now()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`
    
    // Calculate pricing (mock calculation - would be from product database)
    const panelPrice = validatedData.designData.calculations.totalPower * 2500 // ₺2.5/W ortalama
    const inverterPrice = validatedData.designData.calculations.totalPower * 800 // ₺0.8/W
    const mountingPrice = validatedData.designData.calculations.panelCount * 350 // Panel başı ₺350
    const installationPrice = (panelPrice + inverterPrice + mountingPrice) * 0.15 // %15 kurulum
    const totalPrice = panelPrice + inverterPrice + mountingPrice + installationPrice

    const quoteData = {
      id: quoteId,
      projectId: projectId,
      title: `GES Kurulum Teklifi - ${validatedData.customerInfo.name}`,
      customer: validatedData.customerInfo,
      status: 'DRAFT',
      validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 gün
      systemSpecs: {
        totalPower: validatedData.designData.calculations.totalPower,
        panelCount: validatedData.designData.calculations.panelCount,
        annualProduction: validatedData.designData.calculations.annualProduction,
        warranty: '25 yıl panel garantisi'
      },
      pricing: {
        panels: {
          description: `${validatedData.designData.calculations.panelCount} adet güneş paneli`,
          unitPrice: 2500,
          quantity: validatedData.designData.calculations.totalPower,
          total: panelPrice
        },
        inverter: {
          description: 'İnverter ve elektrik ekipmanları',
          unitPrice: 800,
          quantity: validatedData.designData.calculations.totalPower,
          total: inverterPrice
        },
        mounting: {
          description: 'Montaj sistemi ve raylar',
          unitPrice: 350,
          quantity: validatedData.designData.calculations.panelCount,
          total: mountingPrice
        },
        installation: {
          description: 'Kurulum ve işçilik',
          unitPrice: installationPrice,
          quantity: 1,
          total: installationPrice
        },
        subtotal: panelPrice + inverterPrice + mountingPrice + installationPrice,
        tax: (panelPrice + inverterPrice + mountingPrice + installationPrice) * 0.20,
        total: totalPrice * 1.20
      },
      financialAnalysis: validatedData.designData.calculations.savings ? {
        paybackPeriod: Math.ceil(totalPrice * 1.20 / (validatedData.designData.calculations.savings.annual || 1)),
        roi25Years: validatedData.designData.calculations.savings.total25Years || 0,
        monthlySavings: validatedData.designData.calculations.savings.monthly || 0,
        annualSavings: validatedData.designData.calculations.savings.annual || 0
      } : undefined,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    // Send notification to customer
    const notificationData = {
      type: 'project_created',
      recipient: validatedData.customerInfo.email,
      data: {
        projectId,
        quoteId,
        customerName: validatedData.customerInfo.name,
        systemSize: validatedData.designData.calculations.totalPower,
        estimatedPrice: Math.round(totalPrice * 1.20)
      }
    }

    // Here you would save to database in real implementation
    // For now, we'll return the structured data
    
    // Update project timeline with quote creation
    projectData.timeline.push({
      id: `timeline-${Date.now() + 3}`,
      date: new Date().toISOString(),
      title: 'Teklif Oluşturuldu',
      description: `₺${Math.round(totalPrice * 1.20).toLocaleString('tr-TR')} tutarında otomatik teklif oluşturuldu`,
      status: 'completed',
      type: 'quote',
      user: 'System'
    })

    return NextResponse.json({
      success: true,
      project: projectData,
      quote: quoteData,
      notification: notificationData,
      message: 'Proje ve teklif başarıyla oluşturuldu'
    })

  } catch (error) {
    console.error('Designer to project conversion error:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid data format', details: error.issues },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}