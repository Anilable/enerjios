import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { db as prisma } from '@/lib/db'
import { requireAuth } from '@/lib/multi-tenant'

export async function GET(req: NextRequest) {
  try {
    const session = requireAuth(await getServerSession(authOptions))

    // Fetch farmers with their related data
    const farmers = await prisma.farmer.findMany({
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            status: true,
            createdAt: true
          }
        },
        farms: {
          select: {
            id: true,
            name: true,
            location: true,
            size: true,
            soilType: true,
            waterSource: true
          }
        },
        agriSolars: {
          include: {
            project: {
              select: {
                id: true,
                name: true,
                capacity: true,
                status: true
              }
            }
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    // Transform the data to match the expected UI format
    const transformedFarmers = farmers.map(farmer => {
      // Calculate total farm size
      const totalFarmSize = farmer.farms.reduce((sum, farm) => sum + farm.size, 0)

      // Get primary farm info
      const primaryFarm = farmer.farms[0]

      // Calculate total system size from GES projects
      const totalSystemSize = farmer.agriSolars.reduce((sum, agriSolar) =>
        sum + (agriSolar.project?.capacity || 0), 0
      )

      // Determine status based on GES projects
      const hasActiveProjects = farmer.agriSolars.some(agriSolar =>
        agriSolar.project?.status === 'COMPLETED' || agriSolar.project?.status === 'IN_PROGRESS'
      )
      const hasPlannedProjects = farmer.agriSolars.some(agriSolar =>
        agriSolar.project?.status === 'PLANNED' || agriSolar.project?.status === 'DRAFT'
      )

      let status = 'Aktif'
      if (hasPlannedProjects && !hasActiveProjects) {
        status = 'Planlama'
      } else if (!hasActiveProjects && !hasPlannedProjects) {
        status = 'Pasif'
      }

      return {
        id: farmer.id,
        name: farmer.user.name || 'İsimsiz Çiftçi',
        email: farmer.user.email,
        phone: farmer.user.phone || '',
        farmName: primaryFarm?.name || 'Çiftlik Adı Belirtilmemiş',
        location: primaryFarm?.location || 'Konum Belirtilmemiş',
        farmSize: totalFarmSize ? `${totalFarmSize} dönüm` : 'Belirtilmemiş',
        cropType: farmer.mainCrops || 'Belirtilmemiş',
        systemSize: totalSystemSize ? `${totalSystemSize} kW` : '0 kW',
        status: status,
        joinDate: farmer.createdAt.toISOString().split('T')[0],
        farmCount: farmer.farms.length,
        projectCount: farmer.agriSolars.length,
        irrigationType: farmer.irrigationType || 'Belirtilmemiş',
        livestockCount: farmer.livestockCount || 0,
        monthlyConsumption: farmer.monthlyConsumption || 0,
        coldStorage: farmer.coldStorage,
        farms: farmer.farms.map(farm => ({
          id: farm.id,
          name: farm.name,
          location: farm.location,
          size: farm.size,
          soilType: farm.soilType,
          waterSource: farm.waterSource
        })),
        projects: farmer.agriSolars.map(agriSolar => ({
          id: agriSolar.project?.id,
          name: agriSolar.project?.name,
          capacity: agriSolar.project?.capacity,
          status: agriSolar.project?.status,
          systemType: agriSolar.systemType,
          mountHeight: agriSolar.mountHeight,
          shadingRatio: agriSolar.shadingRatio
        }))
      }
    })

    return NextResponse.json(transformedFarmers)

  } catch (error) {
    console.error('Failed to fetch farmers:', error)
    return NextResponse.json({
      error: 'Internal server error'
    }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = requireAuth(await getServerSession(authOptions))

    // Only admins can delete farmers
    if (session.user.role !== 'ADMIN') {
      return NextResponse.json({
        error: 'Unauthorized - Admin access required'
      }, { status: 403 })
    }

    const { searchParams } = new URL(req.url)
    const farmerId = searchParams.get('id')

    if (!farmerId) {
      return NextResponse.json({
        error: 'Farmer ID is required'
      }, { status: 400 })
    }

    // Check if farmer exists
    const farmer = await prisma.farmer.findUnique({
      where: { id: farmerId },
      include: {
        user: true,
        agriSolars: {
          include: {
            project: true
          }
        }
      }
    })

    if (!farmer) {
      return NextResponse.json({
        error: 'Farmer not found'
      }, { status: 404 })
    }

    // Check if farmer has active projects
    const hasActiveProjects = farmer.agriSolars.some(agriSolar =>
      agriSolar.project?.status === 'IN_PROGRESS' || agriSolar.project?.status === 'COMPLETED'
    )

    if (hasActiveProjects) {
      return NextResponse.json({
        error: 'Cannot delete farmer with active or completed projects'
      }, { status: 400 })
    }

    // Delete farmer and associated data using transaction
    await prisma.$transaction(async (tx) => {
      // Delete AgriSolar records first (they reference projects)
      await tx.agriSolar.deleteMany({
        where: { farmerId: farmerId }
      })

      // Delete farm crops
      await tx.crop.deleteMany({
        where: {
          farm: {
            farmerId: farmerId
          }
        }
      })

      // Delete farms
      await tx.farm.deleteMany({
        where: { farmerId: farmerId }
      })

      // Delete farmer record
      await tx.farmer.delete({
        where: { id: farmerId }
      })

      // Delete associated user if it only has the farmer role
      await tx.user.delete({
        where: {
          id: farmer.userId,
          role: 'FARMER'
        }
      })
    })

    return NextResponse.json({
      message: 'Farmer deleted successfully',
      deletedId: farmerId
    })

  } catch (error) {
    console.error('Failed to delete farmer:', error)
    return NextResponse.json({
      error: 'Internal server error'
    }, { status: 500 })
  }
}