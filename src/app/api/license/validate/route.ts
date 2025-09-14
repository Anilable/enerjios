import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from '@/lib/server-session'

type LicenseType = 'BASIC' | 'PROFESSIONAL' | 'ENTERPRISE'

interface LicenseInfo {
  isValid: boolean
  licenseType: LicenseType
  expiryDate: string
  features: {
    roofDrawing: boolean
    panelPlacement: boolean
    advancedCalculations: boolean
    exportFeatures: boolean
    unlimitedProjects: boolean
  }
  projectsRemaining?: number
  maxRoofArea?: number
  maxPanels?: number
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession()
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // In a real implementation, you would:
    // 1. Query your license database
    // 2. Check hardware fingerprinting
    // 3. Validate license keys
    // 4. Check expiry dates
    
    // For now, return a demo license based on user role or environment
    const userEmail = session.user?.email
    
    let licenseInfo: LicenseInfo = {
      isValid: true,
      licenseType: 'BASIC',
      expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      features: {
        roofDrawing: true,
        panelPlacement: true,
        advancedCalculations: false,
        exportFeatures: false,
        unlimitedProjects: false
      },
      projectsRemaining: 3,
      maxRoofArea: 200,
      maxPanels: 50
    }

    // Upgrade license for admin users or specific domains
    if (userEmail?.includes('admin') || userEmail?.includes('trakya-solar.com')) {
      licenseInfo = {
        isValid: true,
        licenseType: 'ENTERPRISE',
        expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
        features: {
          roofDrawing: true,
          panelPlacement: true,
          advancedCalculations: true,
          exportFeatures: true,
          unlimitedProjects: true
        }
        // No limits for enterprise
      }
    } else if (userEmail?.includes('pro')) {
      licenseInfo = {
        isValid: true,
        licenseType: 'PROFESSIONAL',
        expiryDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(),
        features: {
          roofDrawing: true,
          panelPlacement: true,
          advancedCalculations: true,
          exportFeatures: true,
          unlimitedProjects: false
        },
        projectsRemaining: 25,
        maxRoofArea: 1000,
        maxPanels: 200
      }
    }

    return NextResponse.json(licenseInfo)
  } catch (error) {
    console.error('Error validating license:', error)
    return NextResponse.json(
      { error: 'Failed to validate license' },
      { status: 500 }
    )
  }
}