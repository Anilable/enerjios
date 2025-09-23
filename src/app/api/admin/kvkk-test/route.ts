import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { kvkkEmailService } from '@/lib/services/kvkk-email-service'
import { kvkkComplianceAutomation } from '@/lib/services/kvkk-compliance-automation'

export async function POST(request: NextRequest) {
  try {
    // Production'da test endpoint'i devre dışı
    if (process.env.NODE_ENV === 'production') {
      return NextResponse.json({
        success: false,
        message: 'Test endpoint production ortamında kullanılamaz'
      }, { status: 403 })
    }

    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({
        success: false,
        message: 'Yetkisiz erişim'
      }, { status: 401 })
    }

    const { testType } = await request.json()

    const results = []

    switch (testType) {
      case 'email_config':
        const emailTest = await kvkkEmailService.testEmailConfiguration()
        results.push({
          service: 'Email Configuration',
          status: emailTest.success ? 'SUCCESS' : 'FAILED',
          message: emailTest.message
        })
        break

      case 'compliance_calculation':
        try {
          const metrics = await kvkkComplianceAutomation.calculateComplianceScore(7)
          results.push({
            service: 'Compliance Calculation',
            status: 'SUCCESS',
            message: `Calculated metrics for ${metrics.totalApplications} applications`,
            data: {
              complianceScore: metrics.complianceScore,
              riskLevel: metrics.riskLevel,
              overdueCount: metrics.overdueCount
            }
          })
        } catch (error) {
          results.push({
            service: 'Compliance Calculation',
            status: 'FAILED',
            message: error instanceof Error ? error.message : 'Unknown error'
          })
        }
        break

      case 'trend_analysis':
        try {
          const trend = await kvkkComplianceAutomation.getComplianceTrend(7)
          results.push({
            service: 'Trend Analysis',
            status: 'SUCCESS',
            message: `Generated trend data for ${trend.length} days`,
            data: { trendDataPoints: trend.length }
          })
        } catch (error) {
          results.push({
            service: 'Trend Analysis',
            status: 'FAILED',
            message: error instanceof Error ? error.message : 'Unknown error'
          })
        }
        break

      case 'full_report':
        try {
          const report = await kvkkComplianceAutomation.generateAutomatedReport()
          results.push({
            service: 'Full Report Generation',
            status: 'SUCCESS',
            message: 'Generated comprehensive compliance report',
            data: {
              criticalIssues: report.criticalIssues.length,
              actionItems: report.actionItems.length,
              complianceScore: report.summary.complianceScore
            }
          })
        } catch (error) {
          results.push({
            service: 'Full Report Generation',
            status: 'FAILED',
            message: error instanceof Error ? error.message : 'Unknown error'
          })
        }
        break

      case 'comprehensive':
        // Test all services
        try {
          // Email configuration test
          const emailTest = await kvkkEmailService.testEmailConfiguration()
          results.push({
            service: 'Email Configuration',
            status: emailTest.success ? 'SUCCESS' : 'WARNING',
            message: emailTest.message
          })

          // Compliance calculation test
          const metrics = await kvkkComplianceAutomation.calculateComplianceScore(7)
          results.push({
            service: 'Compliance Calculation',
            status: 'SUCCESS',
            message: `Calculated metrics successfully`,
            data: {
              complianceScore: metrics.complianceScore,
              riskLevel: metrics.riskLevel
            }
          })

          // Trend analysis test
          const trend = await kvkkComplianceAutomation.getComplianceTrend(7)
          results.push({
            service: 'Trend Analysis',
            status: 'SUCCESS',
            message: `Generated ${trend.length} trend data points`
          })

          // Report generation test
          const report = await kvkkComplianceAutomation.generateAutomatedReport()
          results.push({
            service: 'Report Generation',
            status: 'SUCCESS',
            message: 'Full automated report generated',
            data: {
              criticalIssues: report.criticalIssues.length,
              actionItems: report.actionItems.length
            }
          })

        } catch (error) {
          results.push({
            service: 'Comprehensive Test',
            status: 'FAILED',
            message: error instanceof Error ? error.message : 'Unknown error'
          })
        }
        break

      default:
        return NextResponse.json({
          success: false,
          message: 'Geçersiz test türü'
        }, { status: 400 })
    }

    const allSuccessful = results.every(result => result.status === 'SUCCESS')
    const hasWarnings = results.some(result => result.status === 'WARNING')

    return NextResponse.json({
      success: true,
      overall: allSuccessful ? 'ALL_TESTS_PASSED' : hasWarnings ? 'TESTS_PASSED_WITH_WARNINGS' : 'SOME_TESTS_FAILED',
      results,
      summary: {
        total: results.length,
        passed: results.filter(r => r.status === 'SUCCESS').length,
        warnings: results.filter(r => r.status === 'WARNING').length,
        failed: results.filter(r => r.status === 'FAILED').length
      },
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('KVKK Test Error:', error)

    return NextResponse.json({
      success: false,
      message: 'Test sırasında hata oluştu',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}