import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || (session.user.role !== 'ADMIN' && session.user.role !== 'COMPANY')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
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
        startDate: project.startDate || project.createdAt
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