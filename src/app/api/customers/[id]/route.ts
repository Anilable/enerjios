import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from '@/lib/get-session'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'
export const revalidate = 0

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
        user: {
          select: {
            id: true,
            email: true,
          },
        },
        quotes: {
          select: { id: true },
        },
        projectRequests: {
          select: { id: true },
        },
        photoRequests: {
          select: { id: true },
        },
        leads: {
          select: { id: true },
        },
        quoteRequests: {
          select: { id: true },
        },
        partnerReviews: {
          select: { id: true },
        },
        projects: {
          select: { id: true },
        },
      },
    })

    // Also check if user owns any projects (separate from customer projects)
    let ownedProjects = 0
    if (customer?.user?.id) {
      const projectCount = await prisma.project.count({
        where: { ownerId: customer.user.id }
      })
      ownedProjects = projectCount
    }
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

    const associatedCounts = {
      quotes: customer.quotes?.length || 0,
      projectRequests: customer.projectRequests?.length || 0,
      photoRequests: customer.photoRequests?.length || 0,
      leads: customer.leads?.length || 0,
      quoteRequests: customer.quoteRequests?.length || 0,
      partnerReviews: customer.partnerReviews?.length || 0,
      projects: customer.projects?.length || 0,
      ownedProjects: ownedProjects,
    }

    const hasAssociatedData = Object.values(associatedCounts).some((count) => count > 0)

    if (hasAssociatedData && !forceDelete) {
      console.log('❌ Cannot delete customer - has associated data, but no force flag')
      return NextResponse.json(
        {
          error: 'Bu müşteri silinemez çünkü ilişkili kayıtlar bulunmaktadır',
          canForceDelete: true,
          details: associatedCounts,
        },
        {
          status: 400,
          headers: {
            'Cache-Control': 'no-store',
          },
        }
      )
    }

    console.log('✅ Customer can be deleted')

    await prisma.$transaction(async (tx) => {
      if (forceDelete) {
        console.log('⚠️ Force deleting customer with associated data')

        // Delete related records in correct order
        await tx.quote.deleteMany({ where: { customerId: id } })
        await tx.projectRequest.deleteMany({ where: { customerId: id } })
        await tx.photoRequest.deleteMany({ where: { customerId: id } })
        await tx.lead.deleteMany({ where: { customerId: id } })
        await tx.quoteRequest.deleteMany({ where: { customerId: id } })
        await tx.partnerReview.deleteMany({ where: { customerId: id } })

        // For projects where customer is the customer, detach the customer
        await tx.project.updateMany({
          where: { customerId: id },
          data: { customerId: null }
        })

        // For projects where user is the owner, we need to handle differently
        // Since owner is required, we cannot set it to null
        // We'll delete these projects or transfer ownership
        if (customer.user?.id && ownedProjects > 0) {
          // Option 1: Delete projects where user is the owner
          // This is destructive but necessary if owner is required
          await tx.project.deleteMany({
            where: { ownerId: customer.user.id }
          })
          console.log(`⚠️ Deleted ${ownedProjects} projects owned by user`)
        }
      }

      // Delete the customer record
      await tx.customer.delete({ where: { id } })

      // Delete the associated user account if it exists
      if (customer.user?.id) {
        await tx.user.delete({ where: { id: customer.user.id } })
      }
    })

    return NextResponse.json(
      {
        message: 'Customer deleted successfully',
        success: true,
        customerId: id,
        removedUserId: customer.user?.id ?? null,
        removedAssociations: associatedCounts,
      },
      {
        headers: {
          'Cache-Control': 'no-store',
        },
      }
    )
  } catch (error) {
    console.error('Error deleting customer:', error)

    // Check if it's a foreign key constraint error
    if (error instanceof Error) {
      if (error.message.includes('Foreign key constraint') ||
          error.message.includes('violates foreign key constraint') ||
          error.message.includes('Project_ownerId_fkey')) {

        // Re-fetch customer data to show current associations
        try {
          const { id: customerId } = await params
          const customerWithData = await prisma.customer.findUnique({
            where: { id: customerId },
            include: {
              user: {
                select: {
                  id: true,
                },
              },
              quotes: { select: { id: true } },
              projectRequests: { select: { id: true } },
              photoRequests: { select: { id: true } },
              leads: { select: { id: true } },
              quoteRequests: { select: { id: true } },
              partnerReviews: { select: { id: true } },
              projects: { select: { id: true } },
            },
          })

          if (customerWithData) {
            // Check for owned projects as well
            let ownedProjectCount = 0
            if (customerWithData.user?.id) {
              ownedProjectCount = await prisma.project.count({
                where: { ownerId: customerWithData.user.id }
              })
            }

            const details = {
              quotes: customerWithData.quotes?.length || 0,
              projectRequests: customerWithData.projectRequests?.length || 0,
              photoRequests: customerWithData.photoRequests?.length || 0,
              leads: customerWithData.leads?.length || 0,
              quoteRequests: customerWithData.quoteRequests?.length || 0,
              partnerReviews: customerWithData.partnerReviews?.length || 0,
              projects: customerWithData.projects?.length || 0,
              ownedProjects: ownedProjectCount,
            }

            return NextResponse.json(
              {
                error: 'Bu müşteri silinemez çünkü ilişkili kayıtlar bulunmaktadır',
                canForceDelete: true,
                details,
                debugMessage: error.message
              },
              { status: 400 }
            )
          }
        } catch (refetchError) {
          console.error('Error refetching customer data:', refetchError)
        }
      }
    }

    return NextResponse.json(
      {
        error: 'Müşteri silinirken bir hata oluştu',
        details: error instanceof Error ? error.message : 'Bilinmeyen hata',
        debugMessage: error instanceof Error ? error.message : 'Unknown error'
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

    // First get the customer to check if user exists
    const existingCustomer = await prisma.customer.findUnique({
      where: { id },
      include: { user: true }
    })

    if (!existingCustomer) {
      return NextResponse.json(
        { error: 'Customer not found' },
        { status: 404 }
      )
    }

    // Update customer data
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

    // Update user email if customer has a user account and email is provided
    if (existingCustomer.user && email && email !== existingCustomer.user.email) {
      await prisma.user.update({
        where: { id: existingCustomer.user.id },
        data: { email }
      })
    }

    return NextResponse.json(customer)
  } catch (error) {
    console.error('Error updating customer:', error)
    return NextResponse.json(
      { error: 'Failed to update customer' },
      { status: 500 }
    )
  }
}
