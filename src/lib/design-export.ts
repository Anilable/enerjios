import html2canvas from 'html2canvas'
import jsPDF from 'jspdf'
import 'jspdf-autotable'

// Extend jsPDF type to include autoTable
declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: any) => jsPDF
  }
}

export interface DesignExportData {
  projectName: string
  customerName?: string
  location?: string
  coordinates?: { lat: number; lng: number }
  calculations: {
    totalPanels: number
    totalPower: number
    roofArea: number
    usableArea: number
    annualProduction: number
    investment: number
    savings: number
    payback: number
  }
  irradiance?: number
  timestamp: Date
}

export async function exportDesignToPDF(
  mapElementId: string,
  designData: DesignExportData
): Promise<void> {
  try {
    // Doğrudan Google Maps elementini bul
    const gmStyle = document.querySelector('.gm-style')
    const mapContainer = gmStyle || document.getElementById(mapElementId) ||
                        document.querySelector('.designer-viewport') ||
                        document.querySelector('[data-testid="designer-viewport"]')

    if (!mapContainer) {
      throw new Error('Harita container bulunamadı. Lütfen tasarım tamamlandıktan sonra tekrar deneyin.')
    }

    console.log('Capturing element:', mapContainer, 'Size:', (mapContainer as HTMLElement).offsetWidth, 'x', (mapContainer as HTMLElement).offsetHeight)

    // Kısa bekleme - Google Maps yüklensin
    await new Promise(resolve => setTimeout(resolve, 1000))

    // Create loading indicator
    const loadingDiv = document.createElement('div')
    loadingDiv.style.position = 'fixed'
    loadingDiv.style.top = '50%'
    loadingDiv.style.left = '50%'
    loadingDiv.style.transform = 'translate(-50%, -50%)'
    loadingDiv.style.backgroundColor = 'rgba(0, 0, 0, 0.8)'
    loadingDiv.style.color = 'white'
    loadingDiv.style.padding = '20px'
    loadingDiv.style.borderRadius = '8px'
    loadingDiv.style.zIndex = '9999'
    loadingDiv.textContent = 'PDF oluşturuluyor...'
    document.body.appendChild(loadingDiv)

    // EN BASİT html2canvas ayarları
    const canvas = await html2canvas(mapContainer as HTMLElement, {
      allowTaint: true,
      useCORS: false,
      scale: 1,
      logging: true,
      backgroundColor: 'white'
    })

    console.log('Canvas created:', canvas.width, 'x', canvas.height)

    // Create PDF with enhanced Turkish character support
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
      compress: true,
      putOnlyUsedFonts: true,
      precision: 16
    })

    // Basit ama etkili Türkçe karakter çözümü
    const safeText = (text: string) => {
      if (!text) return ''

      // ASCII'ye dönüştürme - en güvenli yöntem
      return text
        .replace(/ğ/g, 'g')
        .replace(/Ğ/g, 'G')
        .replace(/ı/g, 'i')
        .replace(/İ/g, 'I')
        .replace(/ö/g, 'o')
        .replace(/Ö/g, 'O')
        .replace(/ş/g, 's')
        .replace(/Ş/g, 'S')
        .replace(/ü/g, 'u')
        .replace(/Ü/g, 'U')
        .replace(/ç/g, 'c')
        .replace(/Ç/g, 'C')
    }

    // PDF dimensions
    const pageWidth = pdf.internal.pageSize.getWidth()
    const pageHeight = pdf.internal.pageSize.getHeight()
    const margin = 20

    // Enhanced company header with better styling
    pdf.setFontSize(24)
    pdf.setFont('helvetica', 'bold')
    pdf.setTextColor(59, 130, 246) // Blue color
    pdf.text('EnerjiOS', margin, margin + 12)

    pdf.setFontSize(14)
    pdf.setFont('helvetica', 'normal')
    pdf.setTextColor(0, 0, 0) // Black
    pdf.text('Güneş Enerjisi Tasarım Raporu', margin, margin + 22)

    pdf.setFontSize(10)
    pdf.setTextColor(100, 100, 100) // Gray
    pdf.text('Levazım, Vadi Cd Zorlu Center, 34340 Beşiktaş/İstanbul', margin, margin + 30)

    // Professional header line with gradient effect
    pdf.setLineWidth(1)
    pdf.setDrawColor(59, 130, 246) // Blue
    pdf.line(margin, margin + 38, pageWidth - margin, margin + 38)
    pdf.setLineWidth(0.5)
    pdf.setDrawColor(200, 200, 200) // Light gray
    pdf.line(margin, margin + 40, pageWidth - margin, margin + 40)

    let yPos = margin + 55

    // Project information section with better styling
    pdf.setFontSize(18)
    pdf.setFont('helvetica', 'bold')
    pdf.setTextColor(0, 0, 0)
    pdf.text(`Proje: ${safeText(designData.projectName)}`, margin, yPos)
    yPos += 20

    // Create info box background
    pdf.setFillColor(248, 250, 252) // Light gray background
    pdf.rect(margin, yPos - 5, pageWidth - (margin * 2), 35, 'F')

    // Customer info with icons (simulated with bullets)
    if (designData.customerName) {
      pdf.setFontSize(11)
      pdf.setFont('helvetica', 'normal')
      pdf.setTextColor(60, 60, 60)
      pdf.text('👤', margin + 5, yPos + 5)
      pdf.text(`Müşteri: ${safeText(designData.customerName)}`, margin + 15, yPos + 5)
      yPos += 8
    }

    // Location info
    if (designData.location) {
      pdf.text('📍', margin + 5, yPos + 5)
      pdf.text(`Konum: ${safeText(designData.location)}`, margin + 15, yPos + 5)
      yPos += 8
    }

    // Coordinates
    if (designData.coordinates) {
      pdf.text('🗺️', margin + 5, yPos + 5)
      pdf.text(`Koordinatlar: ${designData.coordinates.lat.toFixed(6)}, ${designData.coordinates.lng.toFixed(6)}`, margin + 15, yPos + 5)
      yPos += 8
    }

    // Date
    pdf.text('📅', margin + 5, yPos + 5)
    pdf.text(`Tarih: ${designData.timestamp.toLocaleDateString('tr-TR')}`, margin + 15, yPos + 5)
    yPos += 25

    // Enhanced map section with better presentation
    pdf.setFontSize(14)
    pdf.setFont('helvetica', 'bold')
    pdf.setTextColor(0, 0, 0)
    pdf.text('🛰️ Uydu Görüntüsü ve Tasarım', margin, yPos)
    yPos += 10

    // Görsel verisi oluştur
    const imgData = canvas.toDataURL('image/jpeg', 0.9)
    console.log('Image data length:', imgData.length)

    // PDF'e eklemek için boyutları hesapla
    const maxImgWidth = pageWidth - (margin * 2)
    const maxImgHeight = 150 // Biraz daha büyük alan

    let imgWidth = maxImgWidth
    let imgHeight = (canvas.height * imgWidth) / canvas.width

    // Yükseklik çok büyükse küçült
    if (imgHeight > maxImgHeight) {
      imgHeight = maxImgHeight
      imgWidth = (canvas.width * imgHeight) / canvas.height
    }

    // Görseli ortala
    const imgX = margin + (maxImgWidth - imgWidth) / 2

    // Sayfa kontrolü
    if (yPos + imgHeight > pageHeight - margin - 60) {
      pdf.addPage()
      yPos = margin + 10
    }

    try {
      // PDF'e görsel ekle
      pdf.addImage(imgData, 'JPEG', imgX, yPos, imgWidth, imgHeight)
      console.log('✅ Image added to PDF successfully!')
    } catch (error) {
      console.error('❌ Error adding image to PDF:', error)

      // Fallback: Görsel eklenemezse placeholder koy
      pdf.setFillColor(240, 240, 240)
      pdf.rect(imgX, yPos, imgWidth, imgHeight, 'F')
      pdf.setFontSize(12)
      pdf.setTextColor(100, 100, 100)
      pdf.text('Harita goruntusu yuklenemedi', imgX + imgWidth/2, yPos + imgHeight/2, { align: 'center' })
      console.log('⚠️ Fallback placeholder added')
    }

    yPos += imgHeight + 20

    // System specifications with enhanced table
    if (yPos + 100 > pageHeight - margin) {
      pdf.addPage()
      yPos = margin + 10
    }

    pdf.setFontSize(16)
    pdf.setFont('helvetica', 'bold')
    pdf.setTextColor(59, 130, 246) // Blue
    pdf.text('⚡ Sistem Özellikleri', margin, yPos)
    yPos += 15

    // Create enhanced table data
    const systemTableData = [
      ['Panel Sayısı', `${designData.calculations.totalPanels} adet`, '📋'],
      ['Toplam Güç', `${(designData.calculations.totalPower / 1000).toFixed(1)} kW`, '⚡'],
      ['Çatı Alanı', `${designData.calculations.roofArea} m²`, '🏠'],
      ['Kullanılabilir Alan', `${designData.calculations.usableArea} m²`, '📐'],
      ['Yıllık Üretim', `${designData.calculations.annualProduction.toLocaleString('tr-TR')} kWh`, '☀️'],
      ['Güneşlenme', `${designData.irradiance || 'N/A'} kWh/m²/yıl`, '🌤️']
    ]

    // Use autoTable for better formatting
    pdf.autoTable({
      startY: yPos,
      head: [['Özellik', 'Değer']],
      body: systemTableData.map(([label, value]) => [
        safeText(String(label)),
        safeText(String(value))
      ]),
      theme: 'grid',
      styles: {
        fontSize: 10,
        cellPadding: 4,
        textColor: [0, 0, 0],
        lineColor: [200, 200, 200],
        lineWidth: 0.5
      },
      headStyles: {
        fillColor: [59, 130, 246],
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        fontSize: 11
      },
      alternateRowStyles: {
        fillColor: [248, 250, 252]
      },
      margin: { left: margin, right: margin }
    })

    yPos = (pdf as any).lastAutoTable.finalY + 15

    // Financial analysis with enhanced styling
    pdf.setFontSize(16)
    pdf.setFont('helvetica', 'bold')
    pdf.setTextColor(34, 139, 34) // Green
    pdf.text('💰 Finansal Analiz', margin, yPos)
    yPos += 15

    const financialData = [
      ['Yatırım Maliyeti', `₺${designData.calculations.investment.toLocaleString('tr-TR')}`, false],
      ['Yıllık Tasarruf', `₺${designData.calculations.savings.toLocaleString('tr-TR')}`, true],
      ['Geri Ödeme Süresi', `${designData.calculations.payback} yıl`, false],
      ['25 Yıllık Kazanç', `₺${(designData.calculations.savings * 20).toLocaleString('tr-TR')}`, true]
    ]

    // Financial table with color coding
    pdf.autoTable({
      startY: yPos,
      head: [['Finansal Gösterge', 'Değer']],
      body: financialData.map(([label, value]) => [
        safeText(String(label)),
        safeText(String(value))
      ]),
      theme: 'grid',
      styles: {
        fontSize: 10,
        cellPadding: 4,
        textColor: [0, 0, 0],
        lineColor: [200, 200, 200],
        lineWidth: 0.5
      },
      headStyles: {
        fillColor: [34, 139, 34],
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        fontSize: 11
      },
      alternateRowStyles: {
        fillColor: [240, 253, 244] // Light green
      },
      didParseCell: function(data: any) {
        // Highlight savings rows
        if (data.row.index === 1 || data.row.index === 3) { // Savings rows
          if (data.column.index === 1) { // Value column
            data.cell.styles.textColor = [34, 139, 34] // Green text
            data.cell.styles.fontStyle = 'bold'
          }
        }
      },
      margin: { left: margin, right: margin }
    })

    yPos = (pdf as any).lastAutoTable.finalY + 20

    // Enhanced footer with professional styling
    const footerY = pageHeight - margin - 15

    // Footer background
    pdf.setFillColor(248, 250, 252)
    pdf.rect(0, footerY - 10, pageWidth, 25, 'F')

    // Footer line
    pdf.setDrawColor(59, 130, 246)
    pdf.setLineWidth(1)
    pdf.line(margin, footerY - 8, pageWidth - margin, footerY - 8)

    pdf.setFontSize(9)
    pdf.setTextColor(100, 100, 100)
    pdf.text('Bu rapor EnerjiOS 3D Tasarım Aracı ile oluşturulmuştur.', margin, footerY)

    // Right-aligned timestamp
    const timestamp = `${new Date().toLocaleDateString('tr-TR')} ${new Date().toLocaleTimeString('tr-TR')}`
    const timestampWidth = pdf.getTextWidth(timestamp)
    pdf.text(timestamp, pageWidth - margin - timestampWidth, footerY + 5)

    // Left-aligned company info
    pdf.setFontSize(8)
    pdf.text('EnerjiOS - Profesyonel Güneş Enerjisi Çözümleri', margin, footerY + 5)

    // Remove loading indicator
    document.body.removeChild(loadingDiv)

    // Save the PDF
    const fileName = `${designData.projectName.replace(/[^a-zA-Z0-9]/g, '_')}_tasarim_raporu.pdf`
    pdf.save(fileName)

  } catch (error) {
    console.error('PDF export error:', error)

    // Remove loading indicator if it exists
    const loadingDiv = document.querySelector('[style*="PDF oluşturuluyor"]')
    if (loadingDiv) {
      loadingDiv.remove()
    }

    // Try to create PDF without image as fallback
    try {
      console.log('Falling back to text-only PDF...')

      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      })

      const pageWidth = pdf.internal.pageSize.getWidth()
      const margin = 20
      let yPos = margin + 10

      // Header
      pdf.setFontSize(20)
      pdf.setFont('helvetica', 'bold')
      pdf.text('EnerjiOS', margin, yPos)
      yPos += 15

      pdf.setFontSize(10)
      pdf.setFont('helvetica', 'normal')
      pdf.text('Güneş Enerjisi Tasarım Raporu', margin, yPos)
      yPos += 8
      pdf.text('Levazım, Vadi Cd Zorlu Center, 34340 Beşiktaş/İstanbul', margin, yPos)
      yPos += 15

      // Project info
      pdf.setFontSize(16)
      pdf.setFont('helvetica', 'bold')
      pdf.text(`Proje: ${designData.projectName}`, margin, yPos)
      yPos += 15

      if (designData.customerName) {
        pdf.setFontSize(12)
        pdf.setFont('helvetica', 'normal')
        pdf.text(`Müşteri: ${designData.customerName}`, margin, yPos)
        yPos += 8
      }

      if (designData.location) {
        pdf.text(`Konum: ${designData.location}`, margin, yPos)
        yPos += 8
      }

      pdf.text(`Tarih: ${designData.timestamp.toLocaleDateString('tr-TR')}`, margin, yPos)
      yPos += 20

      // Note about image
      pdf.setFontSize(10)
      pdf.setTextColor(128, 128, 128)
      pdf.text('* Harita görüntüsü teknik nedenlerle dahil edilemedi', margin, yPos)
      pdf.setTextColor(0, 0, 0)
      yPos += 15

      // System specs
      pdf.setFontSize(14)
      pdf.setFont('helvetica', 'bold')
      pdf.text('Sistem Özellikleri', margin, yPos)
      yPos += 10

      pdf.setFontSize(10)
      pdf.setFont('helvetica', 'normal')

      const specs = [
        ['Panel Sayısı', `${designData.calculations.totalPanels} adet`],
        ['Toplam Güç', `${(designData.calculations.totalPower / 1000).toFixed(1)} kW`],
        ['Çatı Alanı', `${designData.calculations.roofArea} m²`],
        ['Kullanılabilir Alan', `${designData.calculations.usableArea} m²`],
        ['Yıllık Üretim', `${designData.calculations.annualProduction.toLocaleString('tr-TR')} kWh`],
        ['Güneşlenme', `${designData.irradiance || 'N/A'} kWh/m²/yıl`]
      ]

      specs.forEach(([label, value]) => {
        pdf.text(`${label}:`, margin, yPos)
        pdf.setFont('helvetica', 'bold')
        pdf.text(value, margin + 50, yPos)
        pdf.setFont('helvetica', 'normal')
        yPos += 7
      })

      yPos += 10

      // Financial analysis
      pdf.setFontSize(14)
      pdf.setFont('helvetica', 'bold')
      pdf.text('Finansal Analiz', margin, yPos)
      yPos += 10

      pdf.setFontSize(10)
      pdf.setFont('helvetica', 'normal')

      const financial = [
        ['Yatırım Maliyeti', `₺${designData.calculations.investment.toLocaleString('tr-TR')}`],
        ['Yıllık Tasarruf', `₺${designData.calculations.savings.toLocaleString('tr-TR')}`],
        ['Geri Ödeme Süresi', `${designData.calculations.payback} yıl`],
        ['25 Yıllık Kazanç', `₺${(designData.calculations.savings * 20).toLocaleString('tr-TR')}`]
      ]

      financial.forEach(([label, value]) => {
        pdf.text(`${label}:`, margin, yPos)
        pdf.setFont('helvetica', 'bold')
        if (label === 'Yıllık Tasarruf' || label === '25 Yıllık Kazanç') {
          pdf.setTextColor(34, 139, 34)
        }
        pdf.text(value, margin + 50, yPos)
        pdf.setTextColor(0, 0, 0)
        pdf.setFont('helvetica', 'normal')
        yPos += 7
      })

      // Footer
      const pageHeight = pdf.internal.pageSize.getHeight()
      yPos = pageHeight - margin - 20
      pdf.setFontSize(8)
      pdf.setTextColor(128, 128, 128)
      pdf.text('Bu rapor EnerjiOS 3D Tasarım Aracı ile oluşturulmuştur.', margin, yPos)
      pdf.text(`Oluşturma Tarihi: ${new Date().toLocaleDateString('tr-TR')} ${new Date().toLocaleTimeString('tr-TR')}`, margin, yPos + 5)

      const fileName = `${designData.projectName.replace(/[^a-zA-Z0-9]/g, '_')}_tasarim_raporu.pdf`
      pdf.save(fileName)

      console.log('Fallback PDF created successfully')
      return

    } catch (fallbackError) {
      console.error('Fallback PDF creation also failed:', fallbackError)
      throw new Error('PDF oluşturulurken hata oluştu. Lütfen tarayıcınızı güncelleyin veya farklı bir tarayıcı deneyin.')
    }
  }
}

export async function exportDesignToJPG(
  mapElementId: string,
  designData: DesignExportData
): Promise<void> {
  try {
    const mapContainer = document.getElementById(mapElementId) ||
                        document.querySelector('.designer-viewport') ||
                        document.querySelector('[data-testid="designer-viewport"]') ||
                        document.querySelector('.google-maps-container')

    if (!mapContainer) {
      throw new Error('Harita container bulunamadı')
    }

    const canvas = await html2canvas(mapContainer as HTMLElement, {
      useCORS: true,
      allowTaint: true,
      scale: 2, // Higher quality for image
      backgroundColor: '#ffffff',
      ignoreElements: (element) => {
        const tagName = element.tagName?.toLowerCase()
        return tagName === 'script' || tagName === 'iframe'
      },
      onclone: (clonedDoc) => {
        // Fix oklch color issues
        const allElements = clonedDoc.querySelectorAll('*')
        allElements.forEach((el) => {
          const htmlEl = el as HTMLElement
          const computedStyle = window.getComputedStyle(el as Element)

          if (computedStyle.backgroundColor && computedStyle.backgroundColor.includes('oklch')) {
            htmlEl.style.backgroundColor = '#ffffff'
          }
          if (computedStyle.color && computedStyle.color.includes('oklch')) {
            htmlEl.style.color = '#000000'
          }
        })

        const style = clonedDoc.createElement('style')
        style.textContent = `
          * { color: #000000 !important; }
          .bg-primary { background-color: #3b82f6 !important; }
          .bg-white { background-color: #ffffff !important; }
        `
        clonedDoc.head.appendChild(style)
      }
    })

    // Create download link
    const link = document.createElement('a')
    link.download = `${designData.projectName.replace(/[^a-zA-Z0-9]/g, '_')}_tasarim.jpg`
    link.href = canvas.toDataURL('image/jpeg', 0.9)
    link.click()

  } catch (error) {
    console.error('JPG export error:', error)
    throw new Error('JPG oluşturulurken hata oluştu: ' + (error as Error).message)
  }
}

// Enhanced helper function to wait for Google Maps satellite imagery to load
async function waitForMapsToLoad(): Promise<void> {
  return new Promise((resolve) => {
    let attempts = 0
    const maxAttempts = 30 // 15 seconds max wait

    const checkMapsLoaded = () => {
      attempts++

      // Look for all possible Google Maps elements
      const mapImages = document.querySelectorAll('img[src*="googleapis.com"], img[src*="gstatic.com"], img[src*="google.com"]')
      const mapCanvases = document.querySelectorAll('canvas')
      const satelliteImages = document.querySelectorAll('img[src*="lyrs=s"], img[src*="lyrs=y"], img[src*="satellite"]')

      let allLoaded = true
      let foundMapContent = false

      // Check regular map images
      mapImages.forEach((img) => {
        foundMapContent = true
        if (!(img as HTMLImageElement).complete) {
          allLoaded = false
        }
      })

      // Check satellite images specifically
      satelliteImages.forEach((img) => {
        foundMapContent = true
        const htmlImg = img as HTMLImageElement
        if (!htmlImg.complete || htmlImg.naturalWidth === 0) {
          allLoaded = false
        }
      })

      // Check WebGL canvas elements
      if (mapCanvases.length > 0) {
        foundMapContent = true
        mapCanvases.forEach((canvas) => {
          const ctx = (canvas as HTMLCanvasElement).getContext('2d')
          // If we can get context and it has content, consider it loaded
          if (!ctx) {
            allLoaded = false
          }
        })
      }

      // Wait for Google Maps API to be ready
      if (typeof window !== 'undefined' && (window as any).google && (window as any).google.maps) {
        foundMapContent = true
      }

      // If we've found map content and it's all loaded, or if we've waited long enough
      if ((foundMapContent && allLoaded) || attempts >= maxAttempts) {
        console.log(`Maps loading check completed: ${foundMapContent ? 'found content' : 'no content'}, loaded: ${allLoaded}, attempts: ${attempts}`)
        resolve()
      } else {
        setTimeout(checkMapsLoaded, 500)
      }
    }

    // Start checking immediately
    checkMapsLoaded()
  })
}