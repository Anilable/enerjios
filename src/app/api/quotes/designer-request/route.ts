import { NextRequest, NextResponse } from 'next/server'

// TEMPORARILY DISABLED - Quote designer request functionality disabled due to missing Prisma models
// See CHANGELOG.md for restoration details and required schema additions
// Missing models: quoteRequest, quoteOpportunity

export async function POST(request: NextRequest) {
  return NextResponse.json({
    error: 'Quote designer request functionality temporarily disabled',
    message: 'Missing required database models: quoteRequest, quoteOpportunity',
    status: 'disabled'
  }, { status: 503 })
}

export async function GET(request: NextRequest) {
  return NextResponse.json({
    error: 'Quote designer request functionality temporarily disabled',
    message: 'Missing required database models: quoteRequest, quoteOpportunity',
    status: 'disabled',
    requests: []
  }, { status: 503 })
}