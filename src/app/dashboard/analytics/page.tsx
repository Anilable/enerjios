import { Metadata } from 'next'
import AnalyticsDashboard from '@/components/analytics/AnalyticsDashboard'

export const metadata: Metadata = {
  title: 'Analitik | EnerjiOS',
  description: 'Detaylı analitik ve istatistikler',
}

export default function AnalyticsPage() {
  return (
    <div className="container mx-auto px-4 py-6">
      <AnalyticsDashboard />
    </div>
  )
}