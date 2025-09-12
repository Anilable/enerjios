import { NextRequest, NextResponse } from 'next/server'

// TEMPORARILY DISABLED - Push subscription functionality disabled due to missing Prisma models
// See CHANGELOG.md for restoration details and required schema additions
// Missing model: pushSubscription

export async function POST(request: NextRequest) {
  return NextResponse.json({
    error: 'Push subscription functionality temporarily disabled',
    message: 'Missing required database model: pushSubscription',
    status: 'disabled'
  }, { status: 503 })
}

export async function DELETE(request: NextRequest) {
  return NextResponse.json({
    error: 'Push subscription functionality temporarily disabled',
    message: 'Missing required database model: pushSubscription',
    status: 'disabled'
  }, { status: 503 })
}