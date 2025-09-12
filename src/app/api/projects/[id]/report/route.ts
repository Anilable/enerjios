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

    // Fetch project data from database
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: {
        customer: true,
        company: true,
        location: true,
        quotes: {
          include: {
            items: {
              include: {
                product: true
              }
            }
          }
        }
      }
    })

    if (!project) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      )
    }

    // Create PDF document
    const doc = new PDFDocument({
      size: 'A4',
      margin: 50
    })

    // Company header
    const companyName = project.company?.name || process.env.COMPANY_NAME || 'Trakya Solar'
    doc.fontSize(20)
       .font('Helvetica-Bold')
       .text(companyName, 50, 50)

    doc.fontSize(16)
       .font('Helvetica-Bold')
       .text('PROJE RAPORU', 50, 80)

    // Project info
    doc.fontSize(14)
       .font('Helvetica')
       .text(`Proje ID: ${project.id}`, 50, 120)
       .text(`Proje Adı: ${project.name}`, 50, 140)
       .text(`Tarih: ${new Date().toLocaleDateString('tr-TR')}`, 50, 160)

    // Customer info
    doc.fontSize(16)
       .font('Helvetica-Bold')
       .text('MÜŞTERİ BİLGİLERİ', 50, 200)

    const customerName = project.customer?.companyName || 
      `${project.customer?.firstName || ''} ${project.customer?.lastName || ''}`.trim() || 
      'N/A'

    doc.fontSize(12)
       .font('Helvetica')
       .text(`Müşteri: ${customerName}`, 50, 230)
       .text(`Telefon: ${project.customer?.phone || 'N/A'}`, 50, 250)

    // Project technical details
    doc.fontSize(16)
       .font('Helvetica-Bold')
       .text('TEKNİK BİLGİLER', 50, 290)

    doc.fontSize(12)
       .font('Helvetica')
       .text(`Proje Tipi: ${project.type || 'N/A'}`, 50, 320)
       .text(`Sistem Kapasitesi: ${project.capacity || 0} kW`, 50, 340)
       .text(`Durum: ${project.status || 'N/A'}`, 50, 360)

    // Location info
    if (project.location) {
      doc.fontSize(16)
         .font('Helvetica-Bold')
         .text('KONUM BİLGİLERİ', 50, 400)

      doc.fontSize(12)
         .font('Helvetica')
         .text(`Adres: ${project.location.address || 'N/A'}`, 50, 430)
         .text(`Şehir: ${project.location.city || 'N/A'}`, 50, 450)
         .text(`İlçe: ${project.location.district || 'N/A'}`, 50, 470)
    }

    // Project timeline
    let yPos = 490
    if (project.location) {
      yPos = 510
    }
    doc.fontSize(16)
       .font('Helvetica-Bold')
       .text('PROJE TARİHÇESİ', 50, yPos)

    yPos += 30
    doc.fontSize(12)
       .font('Helvetica')
       .text(`Oluşturulma Tarihi: ${new Date(project.createdAt).toLocaleDateString('tr-TR')}`, 50, yPos)
    
    yPos += 20
    if (project.updatedAt) {
      doc.text(`Son Güncelleme: ${new Date(project.updatedAt).toLocaleDateString('tr-TR')}`, 50, yPos)
      yPos += 20
    }

    // Financial summary
    yPos += 30
    doc.fontSize(16)
       .font('Helvetica-Bold')
       .text('FİNANSAL ÖZET', 50, yPos)

    yPos += 30
    doc.fontSize(12)
       .font('Helvetica')
       .text(`Tahmini Maliyet: ${project.estimatedCost?.toLocaleString('tr-TR') || 'N/A'} TL`, 50, yPos)

    // Related quotes
    if (project.quotes && project.quotes.length > 0) {
      yPos += 50
      if (yPos > 700) {
        doc.addPage()
        yPos = 50
      }

      doc.fontSize(16)
         .font('Helvetica-Bold')
         .text('İLGİLİ TEKLİFLER', 50, yPos)

      project.quotes.forEach((quote, index) => {
        yPos += 30
        if (yPos > 750) {
          doc.addPage()
          yPos = 50
        }

        doc.fontSize(12)
           .font('Helvetica-Bold')
           .text(`Teklif ${index + 1}: ${quote.quoteNumber}`, 50, yPos)
        
        yPos += 15
        doc.font('Helvetica')
           .text(`Durum: ${quote.status}`, 50, yPos)
           .text(`Toplam: ${quote.total.toLocaleString('tr-TR')} TL`, 300, yPos)
      })
    }

    // Notes
    if (project.description) {
      yPos += 50
      if (yPos > 650) {
        doc.addPage()
        yPos = 50
      }
      
      doc.fontSize(16)
         .font('Helvetica-Bold')
         .text('AÇIKLAMA', 50, yPos)
         
      yPos += 30
      doc.fontSize(10)
         .font('Helvetica')
         .text(project.description, 50, yPos, { width: 500 })
    }

    // Footer
    doc.fontSize(8)
       .font('Helvetica')
       .text(`Bu rapor ${new Date().toLocaleDateString('tr-TR')} tarihinde ${companyName} tarafından oluşturulmuştur.`, 50, 750)

    // Convert PDF to stream
    const stream = new PassThrough()
    doc.pipe(stream)
    doc.end()

    // Convert stream to buffer
    const chunks: Buffer[] = []
    for await (const chunk of stream) {
      chunks.push(chunk)
    }
    const buffer = Buffer.concat(chunks)

    // Set response headers
    const headers = new Headers()
    headers.set('Content-Type', 'application/pdf')
    headers.set('Content-Disposition', `attachment; filename="proje-raporu-${project.id}.pdf"`)
    headers.set('Content-Length', buffer.length.toString())

    return new NextResponse(buffer, { headers })

  } catch (error) {
    console.error('Error generating project report PDF:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}