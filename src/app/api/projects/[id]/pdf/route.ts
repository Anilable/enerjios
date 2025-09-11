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
        projectRequest: true
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

    // Proje kodu ve tarih
    doc.fontSize(14)
       .text(`Proje Kodu: ${project.code || projectId}`, 50, 100)
       .text(`Tarih: ${new Date().toLocaleDateString('tr-TR')}`, 50, 120)

    // Müşteri bilgileri
    doc.fontSize(16)
       .text('MUSTERI BILGILERI', 50, 160)

    doc.fontSize(12)
       .text(`Ad Soyad: ${project.customer?.firstName || ''} ${project.customer?.lastName || ''}`, 50, 190)
       .text(`Email: ${project.customer?.email || 'N/A'}`, 50, 210)
       .text(`Telefon: ${project.customer?.phone || 'N/A'}`, 50, 230)
       .text(`Adres: ${project.customer?.address || 'N/A'}`, 50, 250)

    // Proje detayları
    doc.fontSize(16)
       .text('PROJE DETAYLARI', 50, 290)

    doc.fontSize(12)
       .text(`Proje Tipi: ${project.type || 'N/A'}`, 50, 320)
       .text(`Durum: ${project.status || 'N/A'}`, 50, 340)
       .text(`Sistem Gucu: ${project.capacity || 0} kW`, 50, 360)
       .text(`Panel Sayisi: ${project.panelCount || 0}`, 50, 380)
       .text(`Yillik Uretim: ${project.annualProduction || 0} kWh`, 50, 400)

    // Teknik özellikler
    doc.fontSize(16)
       .text('TEKNIK OZELLIKLER', 50, 440)

    doc.fontSize(12)
       .text(`Panel Tipi: ${project.panelType || 'N/A'}`, 50, 470)
       .text(`Panel Markasi: ${project.panelBrand || 'N/A'}`, 50, 490)
       .text(`Inverter Tipi: ${project.inverterType || 'N/A'}`, 50, 510)
       .text(`Inverter Markasi: ${project.inverterBrand || 'N/A'}`, 50, 530)
       .text(`Montaj Tipi: ${project.mountingType || 'N/A'}`, 50, 550)

    // Finansal özet
    doc.fontSize(16)
       .text('FINANSAL OZET', 50, 590)

    doc.fontSize(12)
       .text(`Tahmini Maliyet: ${(project.estimatedCost || 0).toLocaleString('tr-TR')} TL`, 50, 620)
       .text(`Onaylanan Butce: ${(project.approvedBudget || 0).toLocaleString('tr-TR')} TL`, 50, 640)
       .text(`Geri Odenme Suresi: ${project.paybackPeriod || 'N/A'} yil`, 50, 660)

    // Notlar
    if (project.notes) {
      doc.addPage()
      doc.fontSize(16)
         .text('NOTLAR', 50, 50)
      
      doc.fontSize(12)
         .text(project.notes, 50, 80, { width: 500 })
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
    headers.set('Content-Disposition', `attachment; filename="proje-${project.code || projectId}.pdf"`)
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