import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import PDFDocument from 'pdfkit'
import { PassThrough } from 'stream'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params

    // Find quote by delivery token
    const quote = await prisma.quote.findUnique({
      where: { deliveryToken: token },
      include: {
        customer: true,
        project: true,
        company: true,
        items: {
          include: {
            product: true
          }
        }
      }
    })

    if (!quote) {
      return NextResponse.json(
        { error: 'Quote not found' },
        { status: 404 }
      )
    }

    // Create PDF document
    const doc = new PDFDocument({
      size: 'A4',
      margin: 50
    })

    // Company header
    const companyName = quote.company?.name || process.env.COMPANY_NAME || 'Trakya Solar'
    doc.fontSize(20)
       .font('Helvetica-Bold')
       .text(companyName, 50, 50)

    doc.fontSize(16)
       .font('Helvetica-Bold')
       .text('GÜNEŞ ENERJİSİ SİSTEMİ TEKLİFİ', 50, 80)

    // Quote info
    doc.fontSize(14)
       .font('Helvetica')
       .text(`Teklif No: ${quote.quoteNumber}`, 50, 120)
       .text(`Tarih: ${new Date(quote.createdAt).toLocaleDateString('tr-TR')}`, 50, 140)
       .text(`Geçerlilik: ${new Date(quote.validUntil).toLocaleDateString('tr-TR')}`, 50, 160)

    // Customer info
    doc.fontSize(16)
       .font('Helvetica-Bold')
       .text('MÜŞTERİ BİLGİLERİ', 50, 200)

    const customerName = quote.customer?.companyName || 
      `${quote.customer?.firstName || ''} ${quote.customer?.lastName || ''}`.trim() || 
      'N/A'

    doc.fontSize(12)
       .font('Helvetica')
       .text(`Müşteri: ${customerName}`, 50, 230)
       .text(`Telefon: ${quote.customer?.phone || 'N/A'}`, 50, 250)

    // Project details
    doc.fontSize(16)
       .font('Helvetica-Bold')
       .text('PROJE DETAYLARI', 50, 290)

    doc.fontSize(12)
       .font('Helvetica')
       .text(`Proje: ${quote.project?.name || 'N/A'}`, 50, 320)
       .text(`Tip: ${quote.project?.type || 'N/A'}`, 50, 340)
       .text(`Kapasite: ${quote.project?.capacity || 0} kW`, 50, 360)

    // Quote items
    doc.fontSize(16)
       .font('Helvetica-Bold')
       .text('TEKLİF KALEMLERİ', 50, 400)

    let yPos = 430
    const items = quote.items || []
    
    for (const item of items) {
      if (yPos > 700) {
        doc.addPage()
        yPos = 50
      }

      doc.fontSize(12)
         .font('Helvetica-Bold')
         .text(item.product.name, 50, yPos)
         
      if (item.description) {
        doc.font('Helvetica')
           .text(item.description, 50, yPos + 15)
      }
      
      doc.text(`Miktar: ${item.quantity} - Birim: ${item.unitPrice.toLocaleString('tr-TR')} TL`, 50, yPos + 30)
         .text(`Toplam: ${item.total.toLocaleString('tr-TR')} TL`, 400, yPos + 30)
      
      yPos += 60
    }

    // Price summary
    yPos += 30
    if (yPos > 650) {
      doc.addPage()
      yPos = 50
    }

    doc.fontSize(16)
       .font('Helvetica-Bold')
       .text('FİYAT ÖZETİ', 50, yPos)

    yPos += 30
    doc.fontSize(12)
       .font('Helvetica')
       .text(`Ara Toplam: ${quote.subtotal.toLocaleString('tr-TR')} TL`, 50, yPos)
       .text(`İndirim: -${quote.discount.toLocaleString('tr-TR')} TL`, 50, yPos + 20)
       .text(`KDV (18%): ${quote.tax.toLocaleString('tr-TR')} TL`, 50, yPos + 40)
       
    doc.fontSize(16)
       .font('Helvetica-Bold')
       .text(`TOPLAM: ${quote.total.toLocaleString('tr-TR')} TL`, 50, yPos + 70)

    // Notes
    if (quote.notes) {
      yPos += 110
      if (yPos > 650) {
        doc.addPage()
        yPos = 50
      }
      
      doc.fontSize(14)
         .font('Helvetica-Bold')
         .text('NOTLAR', 50, yPos)
         
      doc.fontSize(10)
         .font('Helvetica')
         .text(quote.notes, 50, yPos + 20, { width: 500 })
    }

    // Terms
    if (quote.terms) {
      yPos += quote.notes ? 80 : 110
      if (yPos > 650) {
        doc.addPage()
        yPos = 50
      }
      
      doc.fontSize(14)
         .font('Helvetica-Bold')
         .text('ŞARTLAR VE KOŞULLAR', 50, yPos)
         
      doc.fontSize(10)
         .font('Helvetica')
         .text(quote.terms, 50, yPos + 20, { width: 500 })
    }

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
    headers.set('Content-Disposition', `attachment; filename="teklif-${quote.quoteNumber}.pdf"`)
    headers.set('Content-Length', buffer.length.toString())

    return new NextResponse(buffer, { headers })

  } catch (error) {
    console.error('Error generating public quote PDF:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}