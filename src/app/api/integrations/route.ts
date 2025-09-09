import { NextRequest, NextResponse } from 'next/server'

// TEMPORARILY DISABLED - Integrations functionality disabled due to missing Prisma models
// See CHANGELOG.md for restoration details and required schema additions
// Missing model: apiIntegration

export async function GET(request: NextRequest) {
  return NextResponse.json({
    error: 'Integrations functionality temporarily disabled',
    message: 'Missing required database model: apiIntegration',
    status: 'disabled',
    availableIntegrations: []
  }, { status: 503 })
}

export async function POST(request: NextRequest) {
  return NextResponse.json({
    error: 'Integrations functionality temporarily disabled',
    message: 'Missing required database model: apiIntegration', 
    status: 'disabled'
  }, { status: 503 })
}

export async function PUT(request: NextRequest) {
  return NextResponse.json({
    error: 'Integrations functionality temporarily disabled',
    message: 'Missing required database model: apiIntegration',
    status: 'disabled'
  }, { status: 503 })
}

export async function DELETE(request: NextRequest) {
  return NextResponse.json({
    error: 'Integrations functionality temporarily disabled',
    message: 'Missing required database model: apiIntegration',
    status: 'disabled'
  }, { status: 503 })
}