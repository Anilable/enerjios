import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from '@/lib/get-session'
import { prisma } from '@/lib/prisma'
import { renderToStream } from '@react-pdf/renderer'
import PDFTemplates from '@/lib/pdf-template'
import React from 'react'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: projectId } = await params
  
  try {
    const session = await getServerSession()
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Proje bilgilerini veritabanından çek
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: {
        customer: {
          include: {
            user: {
              select: {
                email: true
              }
            }
          }
        },
        company: true,
        location: true
      }
    })

    if (!project) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      )
    }

    // Transform data to match PDF template interface
    const projectData = {
      id: project.id,
      name: project.name,
      type: project.type,
      status: project.status,
      capacity: project.capacity,
      estimatedCost: project.estimatedCost,
      actualCost: project.actualCost,
      description: project.description,
      createdAt: project.createdAt,
      customer: {
        firstName: project.customer?.firstName,
        lastName: project.customer?.lastName,
        companyName: project.customer?.companyName,
        email: project.customer?.user?.email,
        phone: project.customer?.phone
      },
      location: project.location ? {
        address: project.location.address,
        city: project.location.city,
        district: project.location.district
      } : undefined,
      company: project.company ? {
        name: project.company.name
      } : undefined
    }

    // Generate PDF using react-pdf
    const stream = await renderToStream(React.createElement(PDFTemplates.ProjectPDF as any, { project: projectData }) as any)
    
    // Convert stream to buffer
    const chunks: any[] = []
    for await (const chunk of stream) {
      chunks.push(chunk)
    }
    const buffer = Buffer.concat(chunks)

    // Response headers
    const headers = new Headers()
    headers.set('Content-Type', 'application/pdf')
    headers.set('Content-Disposition', `attachment; filename="proje-${projectId}.pdf"`)
    headers.set('Content-Length', buffer.length.toString())

    return new NextResponse(buffer, { headers })

  } catch (error) {
    console.error('Error generating project PDF:', error)
    console.error('Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : 'No stack trace',
      projectId: projectId || 'undefined'
    })
    return NextResponse.json(
      { 
        error: 'PDF generation failed', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    )
  }
}