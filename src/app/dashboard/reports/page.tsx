import { Metadata } from 'next'
import ReportsOverview from '@/components/reports/ReportsOverview'

export const metadata: Metadata = {
  title: 'Raporlar & Analitik | EnerjiOS',
  description: 'Detaylı performans analizleri ve iş zekası raporları',
}

export default function ReportsPage() {
  return (
    <div className="container mx-auto px-4 py-6">
      <ReportsOverview />
    </div>
  )
}