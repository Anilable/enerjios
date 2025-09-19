import { NextRequest, NextResponse } from 'next/server'
import { readFile } from 'fs/promises'
import { join } from 'path'
import crypto from 'crypto'

// Simple token-based file access
// In production, you should use a database to store and validate tokens
const SECRET_KEY = process.env.FILE_ACCESS_SECRET || 'your-secret-key-change-in-production'

interface FileTokenPayload {
  filePath: string
  expiresAt: number
}

// Generate secure file access token - moved to utility function

// Validate and decrypt token
function validateToken(token: string): FileTokenPayload | null {
  try {
    const combined = Buffer.from(token, 'base64url').toString('utf8')
    const [ivHex, encrypted] = combined.split(':')

    if (!ivHex || !encrypted) {
      return null
    }

    const iv = Buffer.from(ivHex, 'hex')
    const decipher = crypto.createDecipheriv('aes-256-cbc', crypto.scryptSync(SECRET_KEY, 'salt', 32), iv)

    let decrypted = decipher.update(encrypted, 'hex', 'utf8')
    decrypted += decipher.final('utf8')

    const payload = JSON.parse(decrypted) as FileTokenPayload

    // Check expiration
    if (payload.expiresAt < Date.now()) {
      return null
    }

    return payload
  } catch (error) {
    console.error('Token validation error:', error)
    return null
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params

    // Validate token
    const payload = validateToken(token)
    if (!payload) {
      return NextResponse.json(
        { error: 'Invalid or expired token' },
        { status: 401 }
      )
    }

    // Security check: Ensure file is in uploads directory
    if (!payload.filePath.startsWith('/uploads/')) {
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      )
    }

    // Read file
    const filePath = join(process.cwd(), 'public', payload.filePath)
    const fileBuffer = await readFile(filePath)

    // Determine content type
    let contentType = 'application/octet-stream'
    if (payload.filePath.endsWith('.pdf')) {
      contentType = 'application/pdf'
    } else if (payload.filePath.endsWith('.jpg') || payload.filePath.endsWith('.jpeg')) {
      contentType = 'image/jpeg'
    } else if (payload.filePath.endsWith('.png')) {
      contentType = 'image/png'
    }

    // Return file with appropriate headers
    // Convert Buffer to Uint8Array for Response
    return new Response(new Uint8Array(fileBuffer), {
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': `inline; filename="${payload.filePath.split('/').pop()}"`,
        'Cache-Control': 'private, max-age=3600'
      }
    })
  } catch (error) {
    console.error('File access error:', error)
    return NextResponse.json(
      { error: 'File not found' },
      { status: 404 }
    )
  }
}