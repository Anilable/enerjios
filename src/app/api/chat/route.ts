import { NextRequest, NextResponse } from 'next/server'

// TEMPORARILY DISABLED - Chat functionality disabled due to missing Prisma models
// See CHANGELOG.md for restoration details and required schema additions

export async function POST(request: NextRequest) {
  return NextResponse.json({
    error: 'Chat functionality temporarily disabled',
    message: 'Missing required database models: chatMessage, chatSession',
    status: 'disabled'
  }, { status: 503 })
}

export async function GET(request: NextRequest) {
  return NextResponse.json({
    error: 'Chat functionality temporarily disabled', 
    message: 'Missing required database models: chatMessage, chatSession',
    status: 'disabled'
  }, { status: 503 })
}