import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user || !['ADMIN', 'COMPANY'].includes(session.user.role)) {
      return NextResponse.json(
        { error: 'Unauthorized - Admin or Company access required' },
        { status: 401 }
      )
    }

    const project = await prisma.project.findUnique({
      where: { id: params.id },
      include: {
        quotes: true,
        installations: true,
        documents: true
      }
    })

    if (!project) {
      return NextResponse.json(
        { error: 'Proje bulunamadı' },
        { status: 404 }
      )
    }

    // Check if project has related data that should prevent deletion
    if (project.installations.length > 0) {
      return NextResponse.json(
        { error: 'Kurulum kayıtları olan proje silinemez' },
        { status: 400 }
      )
    }

    // Delete related data first
    await prisma.quote.deleteMany({
      where: { projectId: params.id }
    })

    await prisma.document.deleteMany({
      where: { projectId: params.id }
    })

    // Delete the project
    await prisma.project.delete({
      where: { id: params.id }
    })

    return NextResponse.json({
      success: true,
      message: 'Proje başarıyla silindi'
    })

  } catch (error) {
    console.error('Project DELETE Error:', error)

    return NextResponse.json(
      {
        error: 'Failed to delete project',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}