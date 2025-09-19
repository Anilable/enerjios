import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from '@/lib/get-session'
import { prisma } from '@/lib/prisma'

/**
 * Delete a customer (Admin only)
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    console.log('🔥 Customer DELETE API called')
    const session = await getServerSession()
    console.log('🔥 Session:', session?.user?.id ? 'User logged in' : 'No user')

    if (!session?.user?.id) {
      console.log('❌ Unauthorized: No session or user ID')
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get force delete parameter from query string
    const url = new URL(request.url)
    const forceDelete = url.searchParams.get('force') === 'true'
    console.log('🔥 Force delete:', forceDelete)

    // Check if user is admin - get user from database to verify role
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true }
    })

    if (!user || user.role !== 'ADMIN') {
      console.log('❌ Admin access denied. User role:', user?.role)
      return NextResponse.json(
        { error: 'Forbidden: Admin access required' },
        { status: 403 }
      )
    }

    const { id } = await params
    console.log('🔥 Customer ID to delete:', id)

    // Check if customer exists
    const customer = await prisma.customer.findUnique({
      where: { id },
      include: {
        quotes: true,
        projectRequests: true,
        photoRequests: true
      }
    })
    console.log('🔥 Customer found:', customer ? 'Yes' : 'No')

    if (!customer) {
      return NextResponse.json(
        { error: 'Customer not found' },
        { status: 404 }
      )
    }

    // Check if customer has associated data
    console.log('🔥 Customer associated data:', {
      quotes: customer.quotes?.length || 0,
      projectRequests: customer.projectRequests?.length || 0,
      photoRequests: customer.photoRequests?.length || 0
    })

    const hasAssociatedData =
      (customer.quotes?.length || 0) > 0 ||
      (customer.projectRequests?.length || 0) > 0 ||
      (customer.photoRequests?.length || 0) > 0

    if (hasAssociatedData && !forceDelete) {
      console.log('❌ Cannot delete customer - has associated data, but no force flag')
      return NextResponse.json(
        {
          error: 'Bu müşteri silinemez çünkü teklif, proje talebi veya fotoğraf talebi bulunmaktadır',
          canForceDelete: true,
          details: {
            quotes: customer.quotes?.length || 0,
            projectRequests: customer.projectRequests?.length || 0,
            photoRequests: customer.photoRequests?.length || 0
          }
        },
        { status: 400 }
      )
    }

    if (hasAssociatedData && forceDelete) {
      console.log('⚠️ Force deleting customer with associated data')
      // Delete associated data first
      await prisma.quote.deleteMany({
        where: { customerId: id }
      })
      await prisma.projectRequest.deleteMany({
        where: { customerId: id }
      })
      await prisma.photoRequest.deleteMany({
        where: { customerId: id }
      })
      console.log('✅ Associated data deleted')
    }

    console.log('✅ Customer can be deleted')

    // Delete the customer
    await prisma.customer.delete({
      where: { id }
    })

    return NextResponse.json({
      message: 'Customer deleted successfully',
      success: true
    })
  } catch (error) {
    console.error('Error deleting customer:', error)
    return NextResponse.json(
      {
        error: 'Failed to delete customer',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

/**
 * Get a single customer
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession()

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { id } = await params

    const customer = await prisma.customer.findUnique({
      where: { id },
      include: {
        quotes: {
          orderBy: { createdAt: 'desc' },
          take: 5
        },
        projectRequests: {
          orderBy: { createdAt: 'desc' },
          take: 5
        }
      }
    })

    if (!customer) {
      return NextResponse.json(
        { error: 'Customer not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(customer)
  } catch (error) {
    console.error('Error fetching customer:', error)
    return NextResponse.json(
      { error: 'Failed to fetch customer' },
      { status: 500 }
    )
  }
}

/**
 * Update a customer (Admin only)
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession()

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Check if user is admin - get user from database to verify role
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true }
    })

    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Forbidden: Admin access required' },
        { status: 403 }
      )
    }

    const { id } = await params
    const body = await request.json()

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

    const customer = await prisma.customer.update({
      where: { id },
      data: {
        firstName,
        lastName,
        phone,
        address,
        city,
        district,
        type: customerType,
        companyName,
        taxNumber
      }
    })

    return NextResponse.json(customer)
  } catch (error) {
    console.error('Error updating customer:', error)
    return NextResponse.json(
      { error: 'Failed to update customer' },
      { status: 500 }
    )
  }
}