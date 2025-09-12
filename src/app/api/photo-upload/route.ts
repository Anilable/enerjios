import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { writeFile, mkdir } from 'fs/promises'
import { existsSync } from 'fs'
import path from 'path'
import crypto from 'crypto'
import sharp from 'sharp'

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const file = formData.get('file') as File
    const token = formData.get('token') as string
    const originalName = formData.get('originalName') as string

    if (!file || !token || !originalName) {
      return NextResponse.json({ 
        error: 'Missing required fields' 
      }, { status: 400 })
    }

    // Validate file type and size
    if (!file.type.startsWith('image/')) {
      return NextResponse.json({ 
        error: 'Only image files are allowed' 
      }, { status: 400 })
    }

    if (file.size > 10 * 1024 * 1024) { // 10MB limit
      return NextResponse.json({ 
        error: 'File size exceeds 10MB limit' 
      }, { status: 400 })
    }

    // Find photo request
    const photoRequest = await prisma.photoRequest.findUnique({
      where: { 
        token,
        status: 'PENDING' // Only allow uploads for pending requests
      },
      select: {
        id: true,
        status: true,
        expiresAt: true
      }
    })

    if (!photoRequest) {
      return NextResponse.json({ 
        error: 'Invalid or expired photo request' 
      }, { status: 404 })
    }

    // Check if expired
    if (new Date() > photoRequest.expiresAt) {
      return NextResponse.json({ 
        error: 'Photo request has expired' 
      }, { status: 400 })
    }

    // Generate unique filename
    const fileExtension = path.extname(originalName)
    const filename = `${crypto.randomBytes(16).toString('hex')}${fileExtension}`
    const thumbnailFilename = `thumb_${filename}`

    // Create upload directories if they don't exist
    const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'photos')
    const thumbnailDir = path.join(process.cwd(), 'public', 'uploads', 'thumbnails')

    if (!existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true })
    }
    if (!existsSync(thumbnailDir)) {
      await mkdir(thumbnailDir, { recursive: true })
    }

    // Convert file to buffer
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Save original file
    const filePath = path.join(uploadDir, filename)
    await writeFile(filePath, buffer)

    // Create thumbnail
    const thumbnailPath = path.join(thumbnailDir, thumbnailFilename)
    await sharp(buffer)
      .resize(300, 300, {
        fit: 'cover',
        position: 'center'
      })
      .jpeg({ quality: 80 })
      .toFile(thumbnailPath)

    // Extract metadata
    const metadata = await sharp(buffer).metadata()
    const imageMetadata = {
      width: metadata.width,
      height: metadata.height,
      format: metadata.format,
      density: metadata.density,
      hasProfile: metadata.hasProfile,
      hasAlpha: metadata.hasAlpha,
      exif: metadata.exif ? {
        // Parse basic EXIF data safely
        make: metadata.exif?.toString().includes('Make') || false,
        model: metadata.exif?.toString().includes('Model') || false,
      } : null
    }

    // Save to database
    const photoUpload = await prisma.photoUpload.create({
      data: {
        photoRequestId: photoRequest.id,
        filename,
        originalName,
        mimeType: file.type,
        fileSize: file.size,
        storageUrl: `/uploads/photos/${filename}`,
        thumbnailUrl: `/uploads/thumbnails/${thumbnailFilename}`,
        metadata: imageMetadata
      }
    })

    // Update photo request status to UPLOADED
    await prisma.photoRequest.update({
      where: { id: photoRequest.id },
      data: {
        status: 'UPLOADED',
        uploadedAt: new Date()
      }
    })

    return NextResponse.json({
      success: true,
      photoId: photoUpload.id,
      filename: photoUpload.filename,
      thumbnailUrl: photoUpload.thumbnailUrl,
      message: 'Photo uploaded successfully'
    })

  } catch (error) {
    console.error('Photo upload failed:', error)
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 })
  }
}

// Get upload progress or status
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const token = searchParams.get('token')

    if (!token) {
      return NextResponse.json({ 
        error: 'Token required' 
      }, { status: 400 })
    }

    const photoRequest = await prisma.photoRequest.findUnique({
      where: { token },
      include: {
        photos: {
          select: {
            id: true,
            filename: true,
            originalName: true,
            thumbnailUrl: true,
            approved: true,
            createdAt: true
          },
          orderBy: {
            createdAt: 'desc'
          }
        }
      }
    })

    if (!photoRequest) {
      return NextResponse.json({ 
        error: 'Invalid token' 
      }, { status: 404 })
    }

    return NextResponse.json({
      status: photoRequest.status,
      expiresAt: photoRequest.expiresAt,
      photos: photoRequest.photos,
      totalPhotos: photoRequest.photos.length,
      approvedPhotos: photoRequest.photos.filter(p => p.approved === true).length,
      rejectedPhotos: photoRequest.photos.filter(p => p.approved === false).length,
      pendingPhotos: photoRequest.photos.filter(p => p.approved === null).length
    })

  } catch (error) {
    console.error('Failed to get upload status:', error)
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 })
  }
}