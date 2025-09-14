import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Fetch companies from database
    const companies = await prisma.company.findMany({
      include: {
        _count: {
          select: {
            projects: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json(companies)
  } catch (error) {
    console.error('Error fetching companies:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { name, taxNumber, type, address, city, district, phone, website, description } = body

    // Validate required fields
    if (!name || !taxNumber || !type) {
      return NextResponse.json(
        { error: 'Missing required fields: name, taxNumber, type' },
        { status: 400 }
      )
    }

    // Check if tax number already exists
    const existingCompany = await prisma.company.findUnique({
      where: { taxNumber }
    })

    if (existingCompany) {
      return NextResponse.json(
        { error: 'A company with this tax number already exists' },
        { status: 409 }
      )
    }

    // Create new company
    const company = await prisma.company.create({
      data: {
        userId: session.user.id,
        name,
        taxNumber,
        type,
        address,
        city,
        district,
        phone,
        website,
        description,
        verified: false
      },
      include: {
        _count: {
          select: {
            projects: true
          }
        }
      }
    })

    return NextResponse.json(company, { status: 201 })
  } catch (error) {
    console.error('Error creating company:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}