import { NextRequest, NextResponse } from 'next/server'

// TEMPORARILY DISABLED - Reports functionality disabled due to extensive Prisma field mismatches
// See CHANGELOG.md for restoration details and field mapping corrections needed
// Issues: totalAmount vs actualCost, systemSize vs capacity, customerType vs type, email field missing on Customer

export async function GET(request: NextRequest) {
  return NextResponse.json({
    error: 'Reports functionality temporarily disabled',
    message: 'Extensive Prisma field mismatches require schema alignment',
    status: 'disabled',
    availableTypes: [],
    fieldMismatches: [
      'Project.totalAmount -> actualCost',
      'Project.systemSize -> capacity', 
      'Customer.customerType -> type',
      'Customer.email -> missing field',
      'Quote.totalAmount -> total'
    ]
  }, { status: 503 })
}

