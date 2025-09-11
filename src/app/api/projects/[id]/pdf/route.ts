import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import PDFDocument from 'pdfkit'
import { PassThrough } from 'stream'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { id: projectId } = await params

    // Proje bilgilerini veritabanından çek
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: {
        customer: true,
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

    // PDF oluştur
    const doc = new PDFDocument({
      size: 'A4',
      margin: 50,
      bufferPages: true
    })

    // PDF başlığı
    doc.fontSize(20)
       .text('PROJE RAPORU', 50, 50)

    // Proje bilgileri ve tarih
    doc.fontSize(14)
       .text(`Proje ID: ${projectId}`, 50, 100)
       .text(`Proje Adı: ${project.name}`, 50, 120)
       .text(`Tarih: ${new Date().toLocaleDateString('tr-TR')}`, 50, 140)

    // Müşteri bilgileri
    doc.fontSize(16)
       .text('MUSTERI BILGILERI', 50, 180)

    const customerName = project.customer?.companyName || 
      `${project.customer?.firstName || ''} ${project.customer?.lastName || ''}`.trim() || 
      'N/A'

    doc.fontSize(12)
       .text(`Müşteri: ${customerName}`, 50, 210)
       .text(`Telefon: ${project.customer?.phone || 'N/A'}`, 50, 230)

    // Proje detayları  
    doc.fontSize(16)
       .text('PROJE DETAYLARI', 50, 270)

    doc.fontSize(12)
       .text(`Proje Tipi: ${project.type || 'N/A'}`, 50, 300)
       .text(`Durum: ${project.status || 'N/A'}`, 50, 320)
       .text(`Sistem Gücü: ${project.capacity || 0} kW`, 50, 340)

    // Konum bilgileri
    if (project.location) {
      doc.fontSize(16)
         .text('KONUM BILGILERI', 50, 380)

      doc.fontSize(12)
         .text(`Adres: ${project.location.address || 'N/A'}`, 50, 410)
         .text(`Şehir: ${project.location.city || 'N/A'}`, 50, 430)
         .text(`İlçe: ${project.location.district || 'N/A'}`, 50, 450)
    }

    // Finansal özet
    let yPos = project.location ? 490 : 380
    doc.fontSize(16)
       .text('FINANSAL ÖZET', 50, yPos)

    yPos += 30
    doc.fontSize(12)
       .text(`Tahmini Maliyet: ${(project.estimatedCost || 0).toLocaleString('tr-TR')} TL`, 50, yPos)
       .text(`Gerçek Maliyet: ${(project.actualCost || 0).toLocaleString('tr-TR')} TL`, 50, yPos + 20)

    // Açıklama
    if (project.description) {
      yPos += 70
      doc.fontSize(16)
         .text('AÇIKLAMA', 50, yPos)
      
      doc.fontSize(12)
         .text(project.description, 50, yPos + 30, { width: 500 })
    }

    // PDF'i stream'e dönüştür
    const stream = new PassThrough()

    doc.pipe(stream)
    doc.end()

    // Stream'i buffer'a çevir
    const chunks: Buffer[] = []
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
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}