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
  const { id: requestId } = await params

  try {
    const session = await getServerSession()

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Fetch project request data from database
    const projectRequest = await prisma.projectRequest.findUnique({
      where: { id: requestId },
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
        assignedEngineer: {
          select: {
            name: true,
            email: true
          }
        }
      }
    })

    if (!projectRequest) {
      return NextResponse.json(
        { error: 'Project request not found' },
        { status: 404 }
      )
    }

    // Transform data to match PDF template interface
    const requestData = {
      id: projectRequest.id,
      requestNumber: projectRequest.id, // Using ID as request number
      customerName: projectRequest.customerName,
      customerEmail: projectRequest.customerEmail,
      customerPhone: projectRequest.customerPhone,
      location: projectRequest.location,
      address: projectRequest.address,
      projectType: projectRequest.projectType,
      estimatedCapacity: projectRequest.estimatedCapacity,
      estimatedBudget: projectRequest.estimatedBudget,
      estimatedRevenue: projectRequest.estimatedRevenue,
      description: projectRequest.description,
      status: projectRequest.status,
      priority: projectRequest.priority,
      source: projectRequest.source,
      hasPhotos: projectRequest.hasPhotos,
      scheduledVisitDate: projectRequest.scheduledVisitDate,
      assignedEngineerName: projectRequest.assignedEngineer?.name || null,
      tags: projectRequest.tags,
      notes: projectRequest.notes,
      contactPreference: projectRequest.contactPreference,
      createdAt: projectRequest.createdAt,
      updatedAt: projectRequest.updatedAt,
      customer: projectRequest.customer ? {
        firstName: projectRequest.customer.firstName,
        lastName: projectRequest.customer.lastName,
        companyName: projectRequest.customer.companyName,
        email: projectRequest.customer.user?.email || projectRequest.customerEmail,
        phone: projectRequest.customer.phone || projectRequest.customerPhone
      } : {
        firstName: '',
        lastName: '',
        companyName: '',
        email: projectRequest.customerEmail,
        phone: projectRequest.customerPhone
      },
      assignedUser: projectRequest.assignedEngineer ? {
        name: projectRequest.assignedEngineer.name,
        email: projectRequest.assignedEngineer.email
      } : undefined
    }

    // Generate PDF using react-pdf
    const stream = await renderToStream(React.createElement(PDFTemplates.ProjectRequestPDF as any, { projectRequest: requestData }) as any)

    // Convert stream to buffer
    const chunks: any[] = []
    for await (const chunk of stream) {
      chunks.push(chunk)
    }
    const buffer = Buffer.concat(chunks)

    // Response headers
    const headers = new Headers()
    headers.set('Content-Type', 'application/pdf')
    headers.set('Content-Disposition', `attachment; filename="proje-talebi-${requestId}.pdf"`)
    headers.set('Content-Length', buffer.length.toString())

    return new NextResponse(buffer, { headers })

  } catch (error) {
    console.error('Error generating project request PDF:', error)
    console.error('Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : 'No stack trace',
      requestId: requestId || 'undefined'
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