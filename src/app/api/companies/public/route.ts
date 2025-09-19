import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    // Fetch active companies with basic public information
    // For development/demo, we'll show all companies if no verified ones exist
    const verifiedCompanies = await prisma.company.findMany({
      where: {
        verified: true,
        user: {
          status: 'ACTIVE'
        }
      },
      include: {
        _count: {
          select: {
            projects: true,
            reviews: true
          }
        }
      },
      orderBy: [
        { rating: 'desc' },
        { createdAt: 'desc' }
      ],
      take: 8
    })

    // If no verified companies, show some recent companies for demo
    const companies = verifiedCompanies.length > 0 ? verifiedCompanies : await prisma.company.findMany({
      include: {
        _count: {
          select: {
            projects: true,
            reviews: true
          }
        }
      },
      orderBy: [
        { rating: 'desc' },
        { createdAt: 'desc' }
      ],
      take: 8 // Limit to 8 companies for homepage display
    })

    // Transform the data to include computed fields
    const transformedCompanies = companies.map(company => ({
      id: company.id,
      name: company.name,
      type: company.type,
      location: company.city && company.district
        ? `${company.district}, ${company.city}`
        : company.city || company.address || 'Türkiye',
      description: company.description || getTypeDescription(company.type),
      logo: company.logo,
      rating: company.rating,
      website: company.website,
      projectCount: company._count.projects,
      reviewCount: company._count.reviews,
      specialization: getTypeDescription(company.type)
    }))

    return NextResponse.json({
      success: true,
      data: transformedCompanies,
      total: transformedCompanies.length
    })
  } catch (error) {
    console.error('Error fetching public companies:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Şirket bilgileri alınırken bir hata oluştu'
      },
      { status: 500 }
    )
  }
}

function getTypeDescription(type: string): string {
  switch (type) {
    case 'INSTALLER':
      return 'GES Kurulum Firması'
    case 'MANUFACTURER':
      return 'Panel & Ekipman Üreticisi'
    case 'CONSULTANT':
      return 'Danışmanlık Firması'
    case 'BANK':
      return 'Finansal Kuruluş'
    default:
      return 'Güneş Enerjisi Çözümleri'
  }
}