import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    // Get all customers with their user data
    const customers = await prisma.customer.findMany({
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
            phone: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    // Get all users with CUSTOMER role
    const customerUsers = await prisma.user.findMany({
      where: {
        role: 'CUSTOMER'
      },
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        customer: true
      }
    })

    // Find orphaned users (users with CUSTOMER role but no customer record)
    const orphanedUsers = customerUsers.filter(user => !user.customer)

    const summary = {
      totalCustomers: customers.length,
      totalCustomerUsers: customerUsers.length,
      orphanedUsers: orphanedUsers.length,
      customers: customers.map(c => ({
        id: c.id,
        firstName: c.firstName,
        lastName: c.lastName,
        companyName: c.companyName,
        email: c.user?.email,
        userName: c.user?.name,
        phone: c.phone || c.user?.phone,
        userId: c.userId,
        type: c.type,
        createdAt: c.createdAt
      })),
      orphanedUsersList: orphanedUsers.map(u => ({
        userId: u.id,
        email: u.email,
        name: u.name
      }))
    }

    return NextResponse.json(summary)
  } catch (error) {
    console.error('Debug endpoint error:', error)
    return NextResponse.json(
      { error: 'Failed to get debug info', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}