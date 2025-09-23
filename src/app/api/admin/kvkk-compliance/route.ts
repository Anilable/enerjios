import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { kvkkComplianceAutomation } from '@/lib/services/kvkk-compliance-automation'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({
        success: false,
        message: 'Yetkisiz erişim'
      }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const reportType = searchParams.get('type') || 'summary'
    const periodDays = parseInt(searchParams.get('days') || '30')

    switch (reportType) {
      case 'summary':
        const metrics = await kvkkComplianceAutomation.calculateComplianceScore(periodDays)
        return NextResponse.json({
          success: true,
          metrics
        })

      case 'trend':
        const trend = await kvkkComplianceAutomation.getComplianceTrend(periodDays)
        return NextResponse.json({
          success: true,
          trend
        })

      case 'full_report':
        const fullReport = await kvkkComplianceAutomation.generateAutomatedReport()
        return NextResponse.json({
          success: true,
          report: fullReport
        })

      default:
        return NextResponse.json({
          success: false,
          message: 'Geçersiz rapor türü'
        }, { status: 400 })
    }

  } catch (error) {
    console.error('KVKK Compliance API Error:', error)

    return NextResponse.json({
      success: false,
      message: 'Uyumluluk verileri alınırken hata oluştu'
    }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({
        success: false,
        message: 'Yetkisiz erişim'
      }, { status: 401 })
    }

    const { action, periodDays = 30 } = await request.json()

    switch (action) {
      case 'recalculate_metrics':
        const metrics = await kvkkComplianceAutomation.calculateComplianceScore(periodDays)
        return NextResponse.json({
          success: true,
          message: 'Uyumluluk metrikleri yeniden hesaplandı',
          metrics
        })

      case 'generate_report':
        const report = await kvkkComplianceAutomation.generateAutomatedReport()
        return NextResponse.json({
          success: true,
          message: 'Detaylı rapor oluşturuldu',
          report
        })

      default:
        return NextResponse.json({
          success: false,
          message: 'Geçersiz eylem'
        }, { status: 400 })
    }

  } catch (error) {
    console.error('KVKK Compliance Action Error:', error)

    return NextResponse.json({
      success: false,
      message: 'Eylem gerçekleştirilemedi'
    }, { status: 500 })
  }
}