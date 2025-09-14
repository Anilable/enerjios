import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from '@/lib/get-session'
import { nrelService } from '@/lib/nrel'
import { rateLimit } from '@/lib/rate-limit'

// Rate limiting: 10 requests per minute per user
const limiter = rateLimit({
  interval: 60 * 1000, // 60 seconds
  uniqueTokenPerInterval: 500, // Max 500 users per window
  tokensPerInterval: 10, // 10 requests per user per window
})

interface SolarCalculationRequest {
  lat: number
  lon: number
  systemCapacity: number // kW
  tilt: number // degrees (0-90)
  azimuth: number // degrees (0-360, 180=south)
  arrayType?: 'fixed_open_rack' | 'fixed_roof_mounted' | 'one_axis' | 'one_axis_backtracking' | 'two_axis'
  moduleType?: 'standard' | 'premium' | 'thin_film'
  systemLosses?: number // percentage
}

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession()
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Apply rate limiting
    try {
      await limiter.check(10, session.user.id) // 10 requests per window per user
    } catch {
      return NextResponse.json(
        {
          error: 'Rate limit exceeded',
          message: 'Too many requests. Please wait before making another calculation.'
        },
        { status: 429 }
      )
    }

    // Parse and validate request body
    const body: SolarCalculationRequest = await request.json()

    // Validate required fields
    if (!body.lat || !body.lon || !body.systemCapacity) {
      return NextResponse.json(
        {
          error: 'Missing required fields',
          message: 'Latitude, longitude, and system capacity are required.'
        },
        { status: 400 }
      )
    }

    // Validate ranges
    if (body.lat < -90 || body.lat > 90) {
      return NextResponse.json(
        { error: 'Invalid latitude. Must be between -90 and 90.' },
        { status: 400 }
      )
    }

    if (body.lon < -180 || body.lon > 180) {
      return NextResponse.json(
        { error: 'Invalid longitude. Must be between -180 and 180.' },
        { status: 400 }
      )
    }

    if (body.systemCapacity <= 0 || body.systemCapacity > 1000000) {
      return NextResponse.json(
        { error: 'Invalid system capacity. Must be between 0.1 and 1,000,000 kW.' },
        { status: 400 }
      )
    }

    if (body.tilt < 0 || body.tilt > 90) {
      return NextResponse.json(
        { error: 'Invalid tilt angle. Must be between 0 and 90 degrees.' },
        { status: 400 }
      )
    }

    if (body.azimuth < 0 || body.azimuth > 360) {
      return NextResponse.json(
        { error: 'Invalid azimuth angle. Must be between 0 and 360 degrees.' },
        { status: 400 }
      )
    }

    // Make NREL API call
    const result = await nrelService.calculateSolarProduction({
      lat: body.lat,
      lon: body.lon,
      systemCapacity: body.systemCapacity,
      tilt: body.tilt,
      azimuth: body.azimuth,
      arrayType: body.arrayType || 'fixed_roof_mounted',
      moduleType: body.moduleType || 'standard',
      systemLosses: body.systemLosses || 14.08
    })

    if (!result.success) {
      return NextResponse.json(
        {
          error: 'Solar calculation failed',
          message: result.error
        },
        { status: 500 }
      )
    }

    // Calculate additional financial metrics
    const electricityRate = 2.2 // TL/kWh (Turkish average residential rate)
    const annualSavings = result.data!.annualProduction * electricityRate * 0.9 // 90% self-consumption

    // Enhanced response with Turkish-specific calculations
    const response = {
      success: true,
      calculation: {
        // Production data from NREL
        annualProduction: Math.round(result.data!.annualProduction),
        monthlyProduction: result.data!.monthlyProduction.map(val => Math.round(val)),

        // Solar resource data
        solarIrradiance: Math.round(result.data!.solarIrradiance * 365), // Annual kWh/m²
        peakSunHours: Math.round(result.data!.peakSunHours * 100) / 100,
        capacityFactor: Math.round(result.data!.capacityFactor * 100) / 100,

        // Financial calculations (Turkey-specific)
        annualSavings: Math.round(annualSavings),
        electricityRate: electricityRate,

        // Environmental impact
        co2Offset: Math.round(result.data!.co2Offset),
        treesEquivalent: Math.round(result.data!.co2Offset / 21.77), // 1 tree absorbs ~21.77 kg CO2/year

        // Weather station info
        stationInfo: {
          location: result.data!.stationInfo.location,
          city: result.data!.stationInfo.city,
          state: result.data!.stationInfo.state,
          distance: Math.round(result.data!.stationInfo.distance * 10) / 10
        }
      },
      metadata: {
        calculatedAt: new Date().toISOString(),
        userId: session.user.id,
        apiVersion: 'v1',
        dataSource: 'NREL PVWatts V6'
      }
    }

    return NextResponse.json(response)

  } catch (error) {
    console.error('Solar calculation API error:', error)

    return NextResponse.json(
      {
        error: 'Internal server error',
        message: 'An unexpected error occurred while calculating solar production.'
      },
      { status: 500 }
    )
  }
}

// GET endpoint for solar resource data only (lighter weight)
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession()
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Rate limiting for GET requests (more lenient)
    try {
      await limiter.check(20, `${session.user.id}-get`) // 20 requests per window
    } catch {
      return NextResponse.json(
        { error: 'Rate limit exceeded' },
        { status: 429 }
      )
    }

    const { searchParams } = new URL(request.url)
    const lat = parseFloat(searchParams.get('lat') || '0')
    const lon = parseFloat(searchParams.get('lon') || '0')

    if (!lat || !lon) {
      return NextResponse.json(
        { error: 'Latitude and longitude are required' },
        { status: 400 }
      )
    }

    const resourceData = await nrelService.getSolarResourceData(lat, lon)

    return NextResponse.json({
      success: true,
      resource: {
        irradiance: Math.round(resourceData.irradiance * 365), // Annual kWh/m²
        location: resourceData.location,
        distance: Math.round(resourceData.distance * 10) / 10
      }
    })

  } catch (error) {
    console.error('Solar resource API error:', error)

    return NextResponse.json(
      {
        error: 'Failed to fetch solar resource data',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}