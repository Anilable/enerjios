import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { id } = await params

    const company = await prisma.company.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            projects: true
          }
        },
        projects: {
          select: {
            id: true,
            name: true,
            status: true,
            createdAt: true
          },
          orderBy: {
            createdAt: 'desc'
          }
        }
      }
    })

    if (!company) {
      return NextResponse.json(
        { error: 'Company not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(company)
  } catch (error) {
    console.error('Error fetching company:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { id } = await params
    const body = await request.json()
    const { name, taxNumber, type, address, city, district, phone, website, description, verified } = body

    // Check if company exists
    const existingCompany = await prisma.company.findUnique({
      where: { id }
    })

    if (!existingCompany) {
      return NextResponse.json(
        { error: 'Company not found' },
        { status: 404 }
      )
    }

    // Check if tax number is being changed and already exists
    if (taxNumber && taxNumber !== existingCompany.taxNumber) {
      const taxNumberExists = await prisma.company.findUnique({
        where: { taxNumber }
      })

      if (taxNumberExists) {
        return NextResponse.json(
          { error: 'A company with this tax number already exists' },
          { status: 409 }
        )
      }
    }

    // Update company
    const updatedCompany = await prisma.company.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(taxNumber && { taxNumber }),
        ...(type && { type }),
        ...(address !== undefined && { address }),
        ...(city !== undefined && { city }),
        ...(district !== undefined && { district }),
        ...(phone !== undefined && { phone }),
        ...(website !== undefined && { website }),
        ...(description !== undefined && { description }),
        ...(verified !== undefined && { verified })
      },
      include: {
        _count: {
          select: {
            projects: true
          }
        }
      }
    })

    return NextResponse.json(updatedCompany)
  } catch (error) {
    console.error('Error updating company:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { id } = await params

    // Check if company exists
    const company = await prisma.company.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            projects: true
          }
        }
      }
    })

    if (!company) {
      return NextResponse.json(
        { error: 'Company not found' },
        { status: 404 }
      )
    }

    // If company has projects, we can either:
    // 1. Prevent deletion (current behavior)
    // 2. Transfer projects to another company
    // 3. Delete projects as well (careful!)
    // 4. Set projects company field to null

    // For now, we'll allow deletion but warn user
    // In production, you might want to implement project transfer logic

    await prisma.$transaction(async (tx) => {
      // First, update any projects to remove company association
      if (company._count.projects > 0) {
        await tx.project.updateMany({
          where: { companyId: id },
          data: { companyId: null }
        })
      }

      // Then delete the company
      await tx.company.delete({
        where: { id }
      })
    })

    return NextResponse.json({
      message: 'Company deleted successfully',
      deletedCompany: {
        id: company.id,
        name: company.name
      }
    })
  } catch (error) {
    console.error('Error deleting company:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}