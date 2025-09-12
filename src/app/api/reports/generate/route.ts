import { NextRequest, NextResponse } from 'next/server'

// TEMPORARILY DISABLED - Report generation functionality disabled due to missing Prisma models
// See CHANGELOG.md for restoration details and required schema additions
// Missing models: reportGeneration

export async function POST(request: NextRequest) {
  return NextResponse.json({
    error: 'Report generation functionality temporarily disabled',
    message: 'Missing required database model: reportGeneration',
    status: 'disabled'
  }, { status: 503 })
}

export async function GET(request: NextRequest) {
  return NextResponse.json({
    error: 'Report generation functionality temporarily disabled',
    message: 'Missing required database model: reportGeneration',
    status: 'disabled',
    reports: []
  }, { status: 503 })
}