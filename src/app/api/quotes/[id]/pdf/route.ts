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

    const { id: quoteId } = await params

    // Quote'u veritabanından çek
    const quote = await prisma.quote.findUnique({
      where: { id: quoteId },
      include: {
        customer: true,
        project: true,
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

    // PDF oluştur
    const doc = new PDFDocument({
      size: 'A4',
      margin: 50,
      bufferPages: true
    })

    // PDF başlığı
    doc.fontSize(20)
       .text('GUNES ENERJISI SISTEMI TEKLIFI', 50, 50)

    // Teklif numarası
    doc.fontSize(14)
       .text(`Teklif No: ${quote.quoteNumber}`, 50, 100)
       .text(`Tarih: ${new Date(quote.createdAt).toLocaleDateString('tr-TR')}`, 50, 120)
       .text(`Gecerlilik: ${new Date(quote.validUntil).toLocaleDateString('tr-TR')}`, 50, 140)

    // Müşteri bilgileri
    doc.fontSize(16)
       .text('MUSTERI BILGILERI', 50, 180)

    doc.fontSize(12)
       .text(`Ad Soyad: ${quote.customer?.firstName || ''} ${quote.customer?.lastName || ''}`, 50, 210)
       .text(`Email: ${quote.customer?.email || 'N/A'}`, 50, 230)
       .text(`Telefon: ${quote.customer?.phone || 'N/A'}`, 50, 250)

    // Proje detayları
    doc.fontSize(16)
       .text('PROJE DETAYLARI', 50, 290)

    doc.fontSize(12)
       .text(`Proje Tipi: ${quote.project?.type || 'N/A'}`, 50, 320)
       .text(`Sistem Gucu: ${quote.project?.capacity || 0} kW`, 50, 340)

    // Teklif kalemleri
    doc.fontSize(16)
       .text('TEKLIF KALEMLERI', 50, 380)

    let yPos = 410
    const items = quote.items || []
    
    for (const item of items) {
      doc.fontSize(12)
         .text(item.product.name, 50, yPos)
         .text(item.description || '', 50, yPos + 15)
         .text(`Miktar: ${item.quantity} - Birim Fiyat: ${item.unitPrice.toLocaleString('tr-TR')} TL`, 50, yPos + 30)
         .text(`Toplam: ${item.total.toLocaleString('tr-TR')} TL`, 400, yPos + 30)
      
      yPos += 60
    }

    // Fiyat özeti
    yPos += 30
    doc.fontSize(16)
       .text('FIYAT OZETI', 50, yPos)

    yPos += 30
    doc.fontSize(12)
       .text(`Ara Toplam: ${quote.subtotal.toLocaleString('tr-TR')} TL`, 50, yPos)
       .text(`Indirim: -${quote.discount.toLocaleString('tr-TR')} TL`, 50, yPos + 20)
       .text(`KDV (18%): ${quote.tax.toLocaleString('tr-TR')} TL`, 50, yPos + 40)
       
    doc.fontSize(16)
       .text(`TOPLAM: ${quote.total.toLocaleString('tr-TR')} TL`, 50, yPos + 70)

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
    headers.set('Content-Disposition', `attachment; filename="teklif-${quote.quoteNumber}.pdf"`)
    headers.set('Content-Length', buffer.length.toString())

    return new NextResponse(buffer, { headers })

  } catch (error) {
    console.error('Error generating PDF:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}