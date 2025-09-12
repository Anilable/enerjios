import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  return NextResponse.json({
    message: "Analytics temporarily disabled for deployment",
    projects: {
      total: 0,
      completed: 0,
      inProgress: 0,
      byType: []
    },
    revenue: {
      total: 0,
      monthly: [],
      byType: []
    },
    customers: {
      total: 0,
      new: 0,
      active: 0
    },
    analytics: "disabled"
  })
}