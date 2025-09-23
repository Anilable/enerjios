// src/components/reports/ReportHeader.tsx
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { RefreshCw, Download } from 'lucide-react'
import type { ReportType } from '@/types/reports'

interface ReportHeaderProps {
  dateRange: string
  onDateRangeChange: (range: string) => void
  onRefresh: () => void
  onExport: (format: 'excel' | 'pdf') => void
  loading: boolean
}

export function ReportHeader({ 
  dateRange, 
  onDateRangeChange, 
  onRefresh, 
  onExport, 
  loading 
}: ReportHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Raporlar & Analitik - Gerçek Veriler
        </h1>
        <p className="text-gray-600">
          Veritabanından çekilen gerçek performans analizleri ve iş zekası raporları
        </p>
        <p className="text-sm text-blue-600">✅ Canlı veri bağlantısı aktif</p>
      </div>

      <div className="flex flex-wrap gap-2">
        <Select value={dateRange} onValueChange={onDateRangeChange}>
          <SelectTrigger className="w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7d">Son 7 gün</SelectItem>
            <SelectItem value="30d">Son 30 gün</SelectItem>
            <SelectItem value="90d">Son 90 gün</SelectItem>
            <SelectItem value="1y">Son 1 yıl</SelectItem>
          </SelectContent>
        </Select>

        <Button
          variant="outline"
          size="sm"
          onClick={onRefresh}
          disabled={loading}
          className="flex items-center gap-2"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          Yenile
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={() => onExport('excel')}
          className="flex items-center gap-2"
        >
          <Download className="h-4 w-4" />
          Excel
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={() => onExport('pdf')}
          className="flex items-center gap-2"
        >
          <Download className="h-4 w-4" />
          PDF
        </Button>
      </div>
    </div>
  )
}