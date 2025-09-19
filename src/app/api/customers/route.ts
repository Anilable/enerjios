import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from '@/lib/get-session'
import { prisma } from '@/lib/prisma'

export async function POST(req: NextRequest) {
  try {
    console.log('🎯 CUSTOMER CREATE: Starting customer creation')
    const session = await getServerSession()

    if (!session?.user?.id) {
      console.log('❌ CUSTOMER CREATE: No session found')
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    console.log('✅ CUSTOMER CREATE: Session authenticated:', session.user.email)

    const body = await req.json()
    console.log('📋 CUSTOMER CREATE: Request body:', body)
    
    const {
      firstName,
      lastName,
      email,
      phone,
      address,
      city,
      district,
      customerType,
      companyName,
      taxNumber
    } = body

    // Validate required fields
    if (!firstName || !lastName || !email || !customerType) {
      return NextResponse.json({
        error: 'Missing required fields: firstName, lastName, email, customerType'
      }, { status: 400 })
    }

    // Check if email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      console.log('❌ CUSTOMER CREATE: Email already exists:', email)
      return NextResponse.json({
        error: 'Bu email adresi ile zaten bir kullanıcı kayıtlı'
      }, { status: 400 })
    }

    // Check if phone already exists (if phone is provided)
    if (phone) {
      const existingPhoneUser = await prisma.user.findFirst({
        where: { phone }
      })

      if (existingPhoneUser) {
        console.log('❌ CUSTOMER CREATE: Phone already exists:', phone)
        return NextResponse.json({
          error: 'Bu telefon numarası ile zaten bir kullanıcı kayıtlı'
        }, { status: 400 })
      }
    }

    console.log('✅ CUSTOMER CREATE: Email and phone are unique, creating user')

    // Create user first (customers are linked to users)
    const user = await prisma.user.create({
      data: {
        email,
        name: `${firstName} ${lastName}`,
        phone,
        role: 'CUSTOMER',
        status: 'ACTIVE'
      }
    })

    // Create customer linked to user
    const customer = await prisma.customer.create({
      data: {
        userId: user.id,
        type: customerType,
        firstName,
        lastName,
        companyName: companyName || null,
        taxNumber: taxNumber || null,
        address: address || null,
        city: city || null,
        district: district || null,
        phone: phone || null
      },
      include: {
        user: {
          select: {
            name: true,
            email: true,
            phone: true
          }
        },
        projects: {
          select: {
            id: true,
            name: true,
            status: true,
            startDate: true,
            capacity: true
          }
        },
        quotes: {
          select: {
            id: true,
            quoteNumber: true,
            total: true,
            status: true,
            createdAt: true
          }
        }
      }
    })

    // Transform the response to match frontend expectations
    const transformedCustomer = {
      id: customer.id,
      firstName: customer.firstName || '',
      lastName: customer.lastName || '',
      fullName: `${customer.firstName || ''} ${customer.lastName || ''}`.trim() || customer.user?.name || 'Unknown',
      email: customer.user?.email || '',
      phone: customer.phone || customer.user?.phone || '',
      address: customer.address || '',
      city: customer.city || '',
      district: customer.district || '',
      customerType: customer.type,
      leadSource: 'WEBSITE' as const, // Default since we don't have this field yet
      status: 'LEAD' as const, // Default since we don't have this field yet
      priority: 'MEDIUM' as const, // Default since we don't have this field yet
      assignedTo: 'System', // Default since we don't have this field yet
      tags: [], // Default empty array
      notes: '', // Default empty string
      companyName: customer.companyName || undefined,
      taxNumber: customer.taxNumber || undefined,
      lastContact: customer.updatedAt,
      createdAt: customer.createdAt,
      updatedAt: customer.updatedAt,
      
      // Mock lead info for now
      leadInfo: {
        estimatedBudget: 50000,
        projectSize: '10-15kW',
        timeline: '1-2 ay',
        electricityBill: 500,
        roofType: 'Kiremit',
        hasRoof: true,
        propertyType: customer.type === 'INDIVIDUAL' ? 'Müstakil Ev' : customer.type === 'CORPORATE' ? 'Ticari' : 'Tarım'
      },
      
      interactions: [],
      quotes: customer.quotes.map(quote => ({
        id: quote.id,
        quoteNumber: quote.quoteNumber,
        total: quote.total,
        status: quote.status,
        createdAt: quote.createdAt
      })),
      
      projects: customer.projects.map(project => ({
        id: project.id,
        projectName: project.name,
        status: project.status,
        startDate: project.startDate
      }))
    }

    return NextResponse.json(transformedCustomer, { status: 201 })

  } catch (error) {
    console.error('Failed to create customer:', error)
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 })
  }
}

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession()

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const customers = await prisma.customer.findMany({
      include: {
        user: {
          select: {
            name: true,
            email: true,
            phone: true
          }
        },
        projects: {
          select: {
            id: true,
            name: true,
            status: true,
            startDate: true,
            capacity: true
          }
        },
        quotes: {
          select: {
            id: true,
            quoteNumber: true,
            total: true,
            status: true,
            createdAt: true
          }
        }
      },
      orderBy: {
        updatedAt: 'desc'
      }
    })

    // Transform database customers to match UI expectations
    const transformedCustomers = customers.map(customer => ({
      id: customer.id,
      firstName: customer.firstName || '',
      lastName: customer.lastName || '',
      fullName: `${customer.firstName || ''} ${customer.lastName || ''}`.trim() || customer.user?.name || 'Unknown',
      email: customer.user?.email || '',
      phone: customer.phone || customer.user?.phone || '',
      address: customer.address || '',
      city: customer.city || '',
      district: customer.district || '',
      customerType: customer.type,
      leadSource: 'WEBSITE' as const, // Default since we don't have this field yet
      status: 'CUSTOMER' as const, // Default since we don't have this field yet
      priority: 'MEDIUM' as const, // Default since we don't have this field yet
      assignedTo: 'System', // Default since we don't have this field yet
      tags: [], // Default empty array
      notes: '', // Default empty string
      companyName: customer.companyName || undefined,
      taxNumber: customer.taxNumber || undefined,
      lastContact: customer.updatedAt,
      createdAt: customer.createdAt,
      updatedAt: customer.updatedAt,
      
      // Mock lead info for now
      leadInfo: {
        estimatedBudget: 50000,
        projectSize: '10-15kW',
        timeline: '1-2 ay',
        electricityBill: 500,
        roofType: 'Kiremit',
        hasRoof: true,
        propertyType: customer.type === 'INDIVIDUAL' ? 'Müstakil Ev' : customer.type === 'CORPORATE' ? 'Ticari' : 'Tarım'
      },
      
      // Mock interactions for now
      interactions: [],
      
      // Real quotes and projects
      quotes: customer.quotes.map(quote => ({
        id: quote.id,
        quoteNumber: quote.quoteNumber,
        total: quote.total,
        status: quote.status,
        createdAt: quote.createdAt
      })),
      
      projects: customer.projects.map(project => ({
        id: project.id,
        projectName: project.name,
        status: project.status,
        startDate: project.startDate
      }))
    }))

    return NextResponse.json(transformedCustomers)

  } catch (error) {
    console.error('Failed to fetch customers:', error)
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 })
  }
}