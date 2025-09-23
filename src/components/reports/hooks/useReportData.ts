import { useState, useCallback } from 'react'

export interface UseReportDataOptions {
  reportType: string
  dateRange: string
}

export interface ReportDataState {
  reportData: any
  loading: boolean
  error: string | null
}

export function useReportData(reportType: string, dateRange: string) {
  const [loading, setLoading] = useState(true)
  const [reportData, setReportData] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  const loadReportData = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const endDate = new Date()
      const startDate = new Date()

      switch (dateRange) {
        case '7d':
          startDate.setDate(endDate.getDate() - 7)
          break
        case '30d':
          startDate.setDate(endDate.getDate() - 30)
          break
        case '90d':
          startDate.setDate(endDate.getDate() - 90)
          break
        case '1y':
          startDate.setFullYear(endDate.getFullYear() - 1)
          break
      }

      const params = new URLSearchParams({
        type: reportType,
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        groupBy: dateRange === '7d' ? 'day' : dateRange === '30d' ? 'week' : 'month'
      })

      const response = await fetch(`/api/reports?${params}`)

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      const data = await response.json()
      setReportData(data)
    } catch (error) {
      console.error('Failed to load report data:', error)
      setError(error instanceof Error ? error.message : 'Failed to load report data')
      setReportData({ data: [], summary: {} })
    } finally {
      setLoading(false)
    }
  }, [reportType, dateRange])

  return { reportData, loading, error, loadReportData }
}